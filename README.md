# 💰 WealthMind — AI-Powered Financial Intelligence Platform

> **Turn raw financial transactions into actionable financial intelligence.**

WealthMind is a production-ready **personal financial intelligence platform** that transforms raw bank-statement data into structured insights, statistical analysis, anomaly detection, financial forecasting, and AI-powered recommendations.

Instead of simply showing users where their money went, WealthMind answers the more important questions:

**Where am I overspending? What is changing? What looks unusual? What could happen if my spending continues? And what should I do about it?**

---

## ✨ Why WealthMind?

Traditional expense trackers mainly provide charts and transaction histories.

**WealthMind goes further.**

It combines:

* 📊 **Real-time financial analytics**
* 🚨 **Statistical anomaly detection**
* 📈 **Expense drift analysis**
* 🎲 **Monte Carlo financial simulation**
* 🤖 **AI Financial Copilot**
* 🔎 **Retrieval-Augmented Generation (RAG)**
* 📑 **Automated financial reports**
* 🔐 **Secure user-isolated data with Supabase RLS**

### From this:

```text
Raw Bank Statement
       ↓
₹12,450 | Swiggy
₹ 2,999 | Amazon
₹ 1,200 | Uber
₹ 8,000 | Rent
₹ 4,500 | Salary
       ↓
      ????
```

### To this:

```text
┌─────────────────────────────────────────┐
│            FINANCIAL INTELLIGENCE       │
├─────────────────────────────────────────┤
│ Income             ₹85,000              │
│ Monthly Expenses   ₹52,400              │
│ Savings Rate       38.4%                │
│ Anomalies          3 detected           │
│ Expense Drift      +8.7%                │
│ Financial Risk     Moderate              │
└─────────────────────────────────────────┘
                 ↓
        AI-Powered Insights
                 ↓
 "Your food delivery spending increased
  27% compared with your previous month."
```

---

# 🚀 Core Features

| Module                       | Route           | What It Does                                                                            |
| ---------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| 🏠 **Command Center**        | `/dashboard`    | Real-time overview of income, expenses, balance, savings and category distribution      |
| 💳 **Transactions Engine**   | `/transactions` | Parses, validates and stores financial transactions with duplicate detection            |
| 🚨 **Anomaly Radar**         | `/anomalies`    | Uses statistical z-score analysis to identify unusual spending                          |
| 📈 **Expense Drift**         | `/drift`        | Tracks month-over-month changes in spending categories and recurring payments           |
| 🎲 **Monte Carlo Simulator** | `/simulation`   | Runs probabilistic simulations to forecast financial outcomes under spending volatility |
| 🤖 **AI Financial Copilot**  | `/assistant`    | Context-aware AI assistant using retrieved financial context                            |
| 📑 **Automated Reports**     | `/report`       | Generates monthly financial summaries and performance insights                          |

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         │  Dashboard / CSV     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │       NEXT.JS APP         │
                    │      App Router           │
                    │                           │
                    │  React + Tailwind CSS     │
                    └─────────────┬─────────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │  Supabase    │  │  Analytics   │  │ AI Copilot   │
        │  PostgreSQL  │  │   Engine     │  │    + RAG     │
        └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
               │                  │                 │
               ▼                  ▼                 ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │ Transactions │  │   Z-Score    │  │  Retrieval   │
        │    Users     │  │ Expense Drift│  │   Context    │
        │   Indexes    │  │ Monte Carlo  │  │     ↓        │
        │     RLS      │  └──────────────┘  │     LLM      │
        └──────────────┘                    └──────────────┘
                                                  │
                                                  ▼
                                      ┌────────────────────┐
                                      │ Financial Guidance │
                                      │ & Recommendations  │
                                      └────────────────────┘
```

---

# 🔄 End-to-End Data Flow

WealthMind follows a pipeline that converts raw financial records into actionable intelligence.

```text
┌───────────────────────┐
│ Bank Statement / CSV  │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ CSV Parsing &         │
│ Data Validation       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Transaction           │
│ Normalization         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Supabase PostgreSQL   │
│ + RLS + Indexes       │
└───────────┬───────────┘
            │
            ▼
      ┌─────┴─────┐
      │ Analytics │
      └─────┬─────┘
            │
     ┌──────┼─────────┬─────────────┐
     ▼      ▼         ▼             ▼
   Z-Score Drift   Monte Carlo   Categorization
     │      │         │             │
     └──────┴─────────┴─────────────┘
                    │
                    ▼
             Financial Context
                    │
                    ▼
              ┌───────────┐
              │ RAG Layer │
              └─────┬─────┘
                    │
                    ▼
              ┌───────────┐
              │ AI Copilot│
              └─────┬─────┘
                    │
                    ▼
          ┌─────────────────────┐
          │ Personalized        │
          │ Financial Insights  │
          └─────────────────────┘
```

---

# 🧠 AI Financial Copilot

The AI Copilot is designed to answer questions using the user's **actual financial context**, rather than generating generic financial advice.

### Example

**User:**

> "Why did my expenses increase this month?"

Instead of sending the question directly to an LLM, WealthMind follows a contextual pipeline:

```text
             User Question
                   │
                   ▼
       "Why did my expenses increase?"
                   │
                   ▼
          Query Understanding
                   │
                   ▼
          Relevant Data Retrieval
                   │
                   ▼
       ┌────────────────────────┐
       │ Relevant Transactions  │
       │ Category Trends        │
       │ Previous Month Data    │
       │ Spending Patterns      │
       └────────────┬───────────┘
                    │
                    ▼
            Context Construction
                    │
                    ▼
             Prompt + Context
                    │
                    ▼
                  LLM
                    │
                    ▼
          Context-Aware Response
```

### Why RAG?

A general-purpose LLM doesn't inherently know a user's latest transactions.

RAG allows WealthMind to:

```text
User Question
      ↓
Retrieve relevant financial information
      ↓
Add retrieved context to prompt
      ↓
LLM generates response
      ↓
Grounded financial insight
```

This helps reduce generic or irrelevant responses and makes the Copilot **context-aware**.

---

# 📊 Statistical Intelligence Engine

WealthMind doesn't rely entirely on AI.

Several insights are generated using deterministic statistical models.

## 🚨 1. Anomaly Radar — Z-Score

The anomaly engine identifies transactions that significantly deviate from a user's normal spending pattern.

### Formula

```text
              x - μ
Z = ─────────────────────
          σ
```

Where:

* `x` = transaction value
* `μ` = mean spending
* `σ` = standard deviation

Conceptually:

```text
Normal Spending
      │
      │       ● ● ● ●
      │     ● ● ● ● ●
      │   ● ● ●
      │
      │                         🚨
      │                         ●
      └──────────────────────────────
                     Spending
```

A sufficiently high absolute z-score can be flagged for investigation.

---

# 📈 2. Expense Drift

Expense Drift measures how spending behavior changes over time.

For example:

```text
                 Previous      Current
Category         Month         Month        Drift
──────────────────────────────────────────────────
Food             ₹8,000        ₹10,500       +31.2%
Transport        ₹5,000        ₹5,800        +16.0%
Shopping         ₹7,500        ₹6,000        -20.0%
Subscriptions    ₹2,000        ₹2,400        +20.0%
```

This allows WealthMind to highlight:

> **"Your food spending increased significantly compared with the previous month."**

---

# 🎲 3. Monte Carlo Financial Simulator

Financial outcomes are uncertain.

Instead of producing one deterministic prediction, WealthMind uses **Monte Carlo simulation** to model multiple possible future scenarios.

```text
Current Financial State
          │
          ▼
   Spending Patterns
          │
          ▼
   Randomized Scenarios
          │
     ┌────┼────┐
     ▼    ▼    ▼
   Run 1 Run 2 Run 3
     │    │    │
     ▼    ▼    ▼
   Run 4 Run 5 ... N
          │
          ▼
  Distribution of Outcomes
          │
          ▼
   Probability / Risk
```

### Example

```text
10,000 simulated scenarios
            ↓
┌───────────────────────────┐
│ 24% → Strong growth       │
│ 51% → Stable              │
│ 18% → Moderate decline    │
│  7% → High-risk outcome   │
└───────────────────────────┘
```

This provides a probabilistic view of potential financial outcomes rather than pretending the future is deterministic.

---

# 🗄️ Database Architecture

WealthMind uses **Supabase PostgreSQL** as its primary persistence layer.

```text
                    Supabase
                       │
                PostgreSQL Database
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Users      Transactions   Categories
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
              Financial Analytics
```

### Security

WealthMind uses **Row Level Security (RLS)** to ensure users can only access records they are authorized to access.

```text
User Request
     ↓
Supabase
     ↓
Authentication
     ↓
RLS Policy Check
     ↓
┌──────────────┐
│ Authorized?  │
└──────┬───────┘
       │
   ┌───┴───┐
   ↓       ↓
  YES      NO
   ↓       ↓
 Data     DENIED
```

This provides database-level isolation instead of relying only on frontend checks.

---

# 🎨 Frontend Architecture

Built using the modern Next.js App Router architecture.

```text
app/
│
├── dashboard/
│   └── page.js
│
├── transactions/
│   └── page.js
│
├── anomalies/
│   └── page.js
│
├── drift/
│   └── page.js
│
├── simulation/
│   └── page.js
│
├── assistant/
│   └── page.js
│
└── report/
    └── page.js
```

The frontend is responsible for:

* Rendering dashboards
* User interaction
* Data visualization
* Transaction management
* AI Copilot interface
* Financial simulation controls
* Report presentation

---

# ⚙️ Technology Stack

| Layer                | Technologies                   |
| -------------------- | ------------------------------ |
| **Frontend**         | Next.js 14/15, React           |
| **Styling**          | Tailwind CSS                   |
| **Icons**            | Lucide React                   |
| **Database**         | PostgreSQL                     |
| **Backend Platform** | Supabase                       |
| **Authentication**   | Supabase Auth                  |
| **Security**         | Row Level Security (RLS)       |
| **Analytics**        | JavaScript statistical modules |
| **AI Architecture**  | RAG                            |
| **AI Assistant**     | LLM-powered Copilot            |
| **Data Processing**  | CSV parsing & normalization    |
| **Deployment**       | Next.js-compatible deployment  |

---

# 📂 Project Structure

```text
WealthMind/
│
├── app/
│   ├── dashboard/
│   ├── transactions/
│   ├── anomalies/
│   ├── drift/
│   ├── simulation/
│   ├── assistant/
│   └── report/
│
├── components/
│   ├── Sidebar.jsx
│   ├── Dashboard/
│   ├── Transactions/
│   ├── Analytics/
│   └── AI/
│
├── lib/
│   ├── supabase/
│   ├── drift.js
│   ├── montecarlo.js
│   ├── zscore.js
│   └── analytics/
│
├── public/
│
├── .env.local
├── package.json
└── README.md
```

---

# 🔐 Security Architecture

WealthMind follows a security-first approach for financial data.

```text
             User
               │
               ▼
        Authentication
               │
               ▼
       Authenticated Session
               │
               ▼
        Supabase PostgreSQL
               │
               ▼
        RLS Policy Validation
               │
        ┌──────┴──────┐
        ▼             ▼
    Authorized      Unauthorized
        │             │
        ▼             ▼
     Access          Denied
```

### Security principles

* 🔐 Authenticated user sessions
* 🛡️ PostgreSQL Row Level Security
* 🔑 Environment variables for sensitive configuration
* 🚫 No hardcoded API credentials
* 👤 User-level data isolation
* 🔒 Database-level authorization

---

# 🔄 Complete WealthMind Pipeline

The entire platform can be summarized as:

```text
             ┌──────────────────┐
             │ Bank Statement   │
             │      CSV         │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Parse & Validate │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Normalize Data   │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │    PostgreSQL    │
             │    + Supabase    │
             └────────┬─────────┘
                      │
          ┌───────────┼────────────┐
          │           │            │
          ▼           ▼            ▼
      Anomaly      Expense      Monte Carlo
       Radar        Drift        Simulation
          │           │            │
          └───────────┼────────────┘
                      │
                      ▼
             Financial Intelligence
                      │
                      ▼
               Context Retrieval
                      │
                      ▼
                    RAG
                      │
                      ▼
               AI Financial
                  Copilot
                      │
                      ▼
             ┌──────────────────┐
             │ Actionable       │
             │ Insights &       │
             │ Recommendations  │
             └──────────────────┘
```

---

# 🧩 Key Engineering Concepts

WealthMind demonstrates practical implementation of:

* **Next.js App Router**
* **React component architecture**
* **Server/client separation**
* **REST/API communication**
* **PostgreSQL relational data modeling**
* **Database indexing**
* **Row Level Security**
* **Authentication & authorization**
* **Asynchronous JavaScript**
* **Promises / async / await**
* **Statistical analysis**
* **Z-score anomaly detection**
* **Monte Carlo simulation**
* **Data normalization**
* **Retrieval-Augmented Generation**
* **Context-aware LLM applications**
* **Prompt construction**
* **Financial data visualization**

---

# 📊 Example Financial Intelligence

A typical WealthMind analysis can transform transaction data into insights such as:

```text
┌────────────────────────────────────────────┐
│              MONTHLY INSIGHTS              │
├────────────────────────────────────────────┤
│                                            │
│ 💰 Income             ₹85,000              │
│ 💸 Expenses           ₹52,400              │
│ 📈 Savings Rate       38.4%                │
│                                            │
│ 🚨 Anomalies          3 detected           │
│ 📊 Expense Drift      +8.7%                │
│ 🎲 Risk Level         Moderate             │
│                                            │
├────────────────────────────────────────────┤
│ AI INSIGHT                                 │
│                                            │
│ Food delivery spending increased           │
│ significantly compared with your          │
│ previous spending pattern.                 │
│                                            │
└────────────────────────────────────────────┘
```

---

# 🛠️ Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/mansvi77/WealthMind.git
cd WealthMind
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Add any additional AI/API credentials required by your local configuration.

> ⚠️ Never commit `.env.local` or API keys to GitHub.

## 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 📈 Future Improvements

The architecture is designed to support further financial intelligence capabilities.

### Planned / Possible Enhancements

* 🏦 Open Banking integrations
* 📱 Mobile application
* 🔔 Intelligent spending alerts
* 💡 Personalized budget recommendations
* 🧾 Automatic receipt processing
* 📊 Advanced portfolio analytics
* 🧠 More sophisticated financial forecasting
* 🔍 Semantic transaction search
* 💬 More advanced conversational memory
* 📑 Automated PDF financial reports

---

# 🎯 What Makes WealthMind Different?

Most budgeting applications answer:

> **"Where did my money go?"**

WealthMind aims to answer:

> **"What is happening to my money, why is it happening, what could happen next, and what should I do?"**

```text
              RAW DATA
                 ↓
          ┌─────────────┐
          │ WealthMind  │
          └──────┬──────┘
                 ↓
       ┌───────────────────┐
       │ Statistical       │
       │ Intelligence      │
       └─────────┬─────────┘
                 ↓
       ┌───────────────────┐
       │ Financial         │
       │ Context           │
       └─────────┬─────────┘
                 ↓
       ┌───────────────────┐
       │ AI + RAG          │
       │ Intelligence      │
       └─────────┬─────────┘
                 ↓
       ┌───────────────────┐
       │ Actionable        │
       │ Financial Insight │
       └───────────────────┘
```

---

# 👨‍💻 Author

**Mansvi Thakur**

B.Tech — Computer Science & Engineering
NIT Jalandhar

* GitHub: `@mansvi77`
* LinkedIn: `mansvi-thakur-a02584323`

---

## ⭐ If you found WealthMind interesting

Give the repository a ⭐ and feel free to explore the implementation.

**Built with Next.js, PostgreSQL, statistical intelligence, and generative AI.**

> **WealthMind — Don't just track your money. Understand it.**
