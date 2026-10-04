# WealthMind

**WealthMind** is an AI-powered personal finance intelligence platform that analyzes transaction data and provides actionable insights into spending behavior.

It combines **financial analytics, anomaly detection, expense drift analysis, recurring-spend detection, and RAG-based AI assistance**.

---

## 🛠️ Tech Stack

| Layer          | Technology                   |
| -------------- | ---------------------------- |
| Frontend       | Next.js (App Router)         |
| Styling        | Tailwind CSS                 |
| Database       | Supabase PostgreSQL          |
| Authentication | Supabase Auth                |
| Vector Search  | pgvector                     |
| AI             | OpenAI Embeddings + LLM      |
| Icons          | Lucide React                 |
| Architecture   | RAG + Deterministic Fallback |

---

## 🔄 System Flow

```text
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    Next.js UI       │
                  │ Dashboard / Chat    │
                  └──────────┬──────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌──────────────────┐          ┌──────────────────┐
    │   Transaction    │          │   AI Assistant   │
    │     Analysis     │          │      Query       │
    └────────┬─────────┘          └────────┬─────────┘
             │                             │
             ▼                             ▼
    ┌──────────────────┐          ┌──────────────────┐
    │ Analytics Engine │          │ Query Embedding  │
    │                  │          └────────┬─────────┘
    │ • Expenses       │                   │
    │ • Anomalies      │                   ▼
    │ • Expense Drift  │          ┌──────────────────┐
    │ • Recurring Spend│          │    pgvector      │
    └────────┬─────────┘          │ Similarity Search│
             │                    └────────┬─────────┘
             │                             │
             │                             ▼
             │                    ┌──────────────────┐
             │                    │ Relevant         │
             │                    │ Transactions     │
             │                    └────────┬─────────┘
             │                             │
             │                             ▼
             │                    ┌──────────────────┐
             │                    │   LLM + Context  │
             │                    └────────┬─────────┘
             │                             │
             └──────────────┬──────────────┘
                            ▼
                 ┌─────────────────────┐
                 │ Financial Insights  │
                 │ & AI Response       │
                 └─────────────────────┘
```

---

## 🧠 How It Works

### 1. Transaction Data

Users provide transaction data containing information such as amount, category, type, description, and date.

### 2. Financial Analytics

The application processes the transactions to calculate:

* Income and expenses
* Net savings
* Category-wise spending
* Recurring expenses
* Spending anomalies
* Expense trends and drift

### 3. RAG-Based AI Assistant

When a user asks a financial question:

```text
User Query
    ↓
Generate Embedding
    ↓
Search Relevant Transactions
    ↓
Build Financial Context
    ↓
Generate AI Response
```

The assistant retrieves relevant transaction information using **pgvector** before generating the response, keeping answers grounded in the user's financial data.

### 4. Deterministic Fallback

If the AI API is unavailable, WealthMind uses a deterministic fallback engine for core financial queries such as:

* Total income
* Total expenses
* Net savings
* Top spending categories
* Recurring expenses

This prevents API failures from breaking the financial assistant.

---

## 🚀 Key Features

* 📊 Financial dashboard and spending analytics
* 💳 Transaction tracking and categorization
* 🔁 Recurring expense detection
* 🚨 Statistical anomaly detection
* 📈 Expense drift analysis
* 🤖 RAG-powered financial assistant
* 🛡️ Supabase Authentication + Row Level Security
* 🔄 Deterministic fallback for AI availability

---

## ⚙️ Getting Started

```bash
git clone https://github.com/mansvi77/wealthmind.git
cd wealthmind
npm install
npm run dev
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

Run the application:

```bash
npm run dev
```

Then open `http://localhost:3000`.

---

## 📌 Scope

WealthMind is a **transaction-based financial intelligence platform**. It does not directly connect to bank accounts; financial data is provided to the application for analysis.

---

## 👩‍💻 Author

**Mansvi Thakur**
B.Tech Computer Science & Engineering — NIT Jalandhar

**GitHub:** [@mansvi77](https://github.com/mansvi77)

