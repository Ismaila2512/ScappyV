<div align="center">
  <!-- Use a placeholder or raw GitHub asset link if needed, but styling inline is nice -->
  <h1>ScappyV</h1>
  <p><strong>Next-Gen AI-Powered Campus Infrastructure Management for VIT Vellore</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Status-Beta-success?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/Architecture-RAG-blue?style=for-the-badge" alt="RAG" />
    <img src="https://img.shields.io/badge/UI-Glassmorphism-violet?style=for-the-badge" alt="UI" />
  </p>
</div>

<br/>

## 🌌 The Vision
Managing campus infrastructure at scale is inherently messy. ScappyV reimagines facility management not just as a ticketing system, but as an **intelligent, self-routing triage engine**. 

Instead of waiting for manual review, our AI instantly parses, prioritizes, and routes student-reported issues to the exact correct department (Maintenance, IT, Housekeeping, etc.)—all wrapped in a premium, glassmorphic interface that feels like a flagship product.

---

## ✨ What Makes ScappyV Unique?

* **🧠 Automated AI Triage:** Leveraging specialized algorithms, incoming issues are instantly parsed. The engine extracts the context from the description and intelligently predicts the severity (priority) and the exact department responsible.
* **🔎 RAG Resolution Workflow:** An integrated `Head Admin Bot` utilizes a Retrieval-Augmented Generation (RAG) pipeline to instantly query the entire database, drop redundant tickets, or query historical resolutions in real-time.
* **🎭 Multi-Portal Ecosystem:** Granular, secure environments for Students, Faculty, and Admins—featuring role-based authentication and a rich administrative telemetrics dashboard.
* **✨ Liquid Glass UI:** A heavy focus on visual craft. Designed with custom SVG icons (no emojis), spring physics via Motion.dev, smooth scrolling via Lenis, and an immersive dark aesthetic.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, ES6 JavaScript. Fully responsive, zero-framework DOM manipulation for lightning-fast performance.
- **Backend:** Node.js with Express.
- **Database:** Supabase (PostgreSQL) and Firebase integrations.
- **Intelligence:** RAG pipeline & Custom AI Triage logic built in TypeScript (`triage-engine.ts`).

---

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ismaila2512/ScappyV.git
   cd ScappyV
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Setup**
   * Create a `.env` file in the root.
   * Add your required Supabase / Firebase / LLM API configurations.

4. **Launch**
   ```bash
   npm run dev
   ```
   *The application will boot up at `http://localhost:3000`.*

---
<div align="center">
<b>Stop chatting. Start shipping.</b>
</div>
