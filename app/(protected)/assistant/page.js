'use client';

import { useState, useRef, useEffect } from 'react';

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your WealthMind AI Financial Copilot. I analyze your secure transaction embeddings and deterministic metrics to answer your financial questions.' }
  ]);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting]);

  const handleSendMessage = async (text) => {
    const messageText = text || input;
    if (isSubmitting || !messageText.trim()) return;
    
    setIsSubmitting(true);
    setInput('');

    // Append user message to state
    const userMessage = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/embed/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Append assistant response to state
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'No response generated.' }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}` }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestionPills = [
    "Where am I spending the most?",
    "Summarize my monthly savings",
    "What are my recurring expenses?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-4 md:p-6 text-slate-100">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">WealthMind Financial Copilot</h1>
        <p className="text-xs text-slate-400">Secure RAG retrieval & vector-grounded financial reasoning</p>
      </div>

      {/* Chat History Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 text-sm font-bold">
                AI
              </div>
            )}
            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 text-sm font-bold">
                U
              </div>
            )}
          </div>
        ))}
        {isSubmitting && (
          <div className="flex items-start gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 text-sm font-bold">
              AI
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
              Analyzing your financial data...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {suggestionPills.map((pill, idx) => (
          <button
            key={idx}
            disabled={isSubmitting}
            onClick={() => handleSendMessage(pill)}
            className="text-xs bg-slate-800/80 hover:bg-slate-700 text-indigo-300 border border-slate-700/60 px-3 py-1.5 rounded-full transition cursor-pointer disabled:opacity-50"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="flex gap-2 bg-slate-900 p-2 border border-slate-800 rounded-2xl shadow-lg"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your transactions, spending, or budgets..."
          disabled={isSubmitting}
          className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-100 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSubmitting || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}