<div align="center">
  <img src="https://raw.githubusercontent.com/Ismaila2512/ScappyV/main/public/logo.png" width="160" alt="ScappyV Logo" />
  
  # ScappyV

  **Next-Gen AI-Powered Campus Infrastructure Management for VIT Vellore**

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Status: Active](https://img.shields.io/badge/Status-Active-success.svg)]()
  [![Tech: Node.js](https://img.shields.io/badge/Tech-Node.js-339933.svg?logo=node.js&logoColor=white)]()
  [![UI: Glassmorphism](https://img.shields.io/badge/UI-Glassmorphism-violet.svg)]()
  [![Architecture: RAG](https://img.shields.io/badge/Architecture-RAG-8A2BE2.svg)]()
</div>

<br />

> **The problem with campus management isn't reporting issues—it's routing them.**  
> ScappyV replaces legacy ticketing systems with an **intelligent triage engine** that auto-routes, prioritizes, and resolves infrastructure issues in real-time.

<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/Ismaila2512/ScappyV/main/public/dashboard_preview.png" alt="Admin Dashboard" width="800" />
  <br /><i>Real-time telemetry and triage dashboard with glassmorphism UI.</i><br /><br />
  <img src="https://raw.githubusercontent.com/Ismaila2512/ScappyV/main/public/login_preview.png" alt="Secure Login" width="400" />
</div>

<br />

## 🌟 The Experience

ScappyV is designed to feel like a flagship SaaS product, dropping the clunky "school project" aesthetic.

- **Liquid Glass UI:** Deep dark-mode aesthetic with custom SVG animations, dynamic spring physics (Motion.dev), and smooth inertia scrolling (Lenis).
- **Automated AI Triage:** No more manual sorting. Our logic engine parses the student's issue description and predicts exactly which department (Maintenance, IT, Housekeeping) needs to respond.
- **RAG Resolution Workflow:** The embedded Head Admin Bot queries a Vector DB of past resolutions to instantly propose fixes without waiting for human intervention.
- **Triple-Portal Architecture:** Granular, secure, real-time dashboards for Students, Faculty, and Admins.

---

## 🏗️ Technical Architecture

Heavy frameworks were stripped out in favor of raw performance, paired with a robust, AI-native backend environment.

| Layer | Technologies Used |
|-------|-------------------|
| **Frontend** | Vanilla JS, HTML5, CSS3, `Motion.dev`, `Lenis` *(Zero-bloat DOM manipulation)* |
| **Backend** | `Node.js`, `Express`, TypeScript (`triage-engine.ts`) |
| **Database** | `Supabase` (PostgreSQL) + `Firebase` |
| **Intelligence** | Retrieval-Augmented Generation (RAG) |

> 🔍 **Deep Dive:** View our completed [RAG Workflow Architecture Diagram](https://raw.githubusercontent.com/Ismaila2512/ScappyV/main/public/rag_workflow.png).

---

## 🚀 Quick Start

Get ScappyV running locally in under 2 minutes.

```bash
# 1. Clone the repository
git clone https://github.com/Ismaila2512/ScappyV.git
cd ScappyV

# 2. Install dependencies
npm install

# 3. Boot the server
npm run dev
```

**Configuration:**
1. Create a `.env` file in the root directory.
2. Add your Supabase, Firebase, and LLM API keys.
3. Open `http://localhost:3000` to interact with the portal.

---

## 👤 Guest & Recruiter Access

By default, ScappyV enforces strict university domain constraints (`@vitstudent.ac.in` and `@vit.ac.in`). However, to allow external reviewers, recruiters, and guests to experience the platform's AI Triage Engine and the Head Admin Bot, a hardcoded backdoor is enabled in the source code.

**Use the following credentials to log in instantly as the Head Administrator:**
- **Email:** `avp7708@gmail.com`
- **Password:** `Nopassword@10`

*Be sure to select the **Admin** tab on the Login screen before authenticating.* Once logged in, open the **ResolveAI Bot** (bottom right) to ask for infrastructure statistics, generate PDF reports, or resolve invalid issues!

---

## 🛡️ Security

ScappyV implements strict role-based access controls across student, faculty, and administrative boundaries. Core database routes are protected via authenticated token sessions to prevent privilege escalation between portals. 

---

<div align="center">
  <b>Built with grit and AI.</b><br>
  Stop chatting. Start shipping.
</div>
