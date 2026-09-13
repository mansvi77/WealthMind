-- Enable pgvector extension
create extension if not exists vector;

-- Create transaction embeddings table
create table if not exists transaction_embeddings (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table transaction_embeddings enable row level security;

-- Policy: Users can only view and manage their own transaction embeddings
create policy "Users can manage their own transaction embeddings"
  on transaction_embeddings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create a similarity search function for RAG retrieval
create or replace function match_transactions (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id uuid,
  transaction_id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    transaction_embeddings.id,
    transaction_embeddings.transaction_id,
    transaction_embeddings.content,
    1 - (transaction_embeddings.embedding <=> query_embedding) as similarity
  from transaction_embeddings
  where transaction_embeddings.user_id = p_user_id
    and 1 - (transaction_embeddings.embedding <=> query_embedding) > match_threshold
  order by transaction_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;