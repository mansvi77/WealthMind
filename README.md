# 🧠 WealthMind

WealthMind is an industrial-grade, full-stack financial command center and statement analyzer built on a **100% free-tier stack**. 

Unlike standard "toy" budget trackers that rely on high-latency, expensive third-party LLM inference APIs, WealthMind utilizes **deterministic client-side algorithms** and statistical models to handle transaction tagging and subscription detection with zero ongoing operational costs.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Operational Advantage |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) | Single-page performance, native edge routing, layout grouping. |
| **Styling Engine** | Tailwind CSS | Utility-first layout composition. Clear, responsive dashboards. |
| **Database & Auth** | Supabase (Postgres Engine) | Relational integrity, built-in Go True auth, and server-level data isolation. |
| **Visual Analytics** | Recharts | Low-overhead React SVG charts with custom tracking configurations. |
| **Local Parsing Core** | PapaParse | High-speed, browser-native CSV parser. Zero server file ingestion overhead. |

---

## 🚀 Standout Algorithmic Highlights (Interview Deep-Dives)

WealthMind trades flashy API wrappers for genuine computer science fundamentals. Be prepared to walk interviewers through these core files:

### 1. Zero-Token Smart Categorization Engine (`lib/categorizationEngine.js`)
* **How it works:** Processes raw description text blocks using linear $O(N)$ string normalization. It strips out system reference codes, IDs, and numeric noise via regular expressions, collapses white space, and executes a deterministic keyword array evaluation to associate transactions with relational category entries.

### 2. Statistical Subscription Loop Detector (`lib/recurringDetector.js`)
* **How it works:** A pure logic statistical clustering engine. It filters capital outflow groups, tracks historical date gaps chronologically between consecutive purchases, and computes the **standard deviation** of those gaps. If the variance falls below a rigid threshold ($\sigma \le 3.5$), it matches the frequency against standard economic billing loops (7, 14, 30, 365 days) and calculates a custom confidence score.

### 3. Server-Enforced Row Level Security (RLS) (`supabase/schema.sql`)
* **How it works:** Security is pushed directly to the Postgres engine. Using explicit database policies (`auth.uid() = user_id`), the storage layer itself blocks cross-tenant data leaks. Even if frontend code is bypassed, a malicious actor can never read or write data blocks belonging to another profile context.

---

## ⚠️ Critical Security Rules (`.gitignore` Enforcement)

To protect infrastructure credentials from malicious bot scraping networks, **never commit environment keys to public version control system chains.**

### Mandatory Check: Local `.gitignore` Setup
Ensure your root level `.gitignore` file contains the following declaration lines before pushing any code to GitHub:

```env
# Local environment configuration variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Next.js build caching layers
.next/
out/
