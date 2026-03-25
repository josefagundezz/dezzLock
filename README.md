<div align="right">
  <a href="./README.es.md">
    <img src="https://img.shields.io/badge/Lang-Español-red?style=for-the-badge&logo=google-translate&logoColor=white" alt="Switch to Spanish">
  </a>
</div>

<div align="center">

  # dezzLock 🔒
  ### POLYMATH FOCUS SYSTEM

  ![Version](https://img.shields.io/badge/version-1.1.0-00ff9b?style=for-the-badge&logo=appveyor&logoColor=black&labelColor=141414)
  ![Status](https://img.shields.io/badge/status-STABLE-00ff9b?style=for-the-badge&labelColor=141414&logoColor=black)
  ![License](https://img.shields.io/badge/license-MIT-white?style=for-the-badge&labelColor=141414)

  <p align="center">
    A native "Mental State Manager" for the creative brain. Stop deciding, start executing.
    <br />
    <br />
    <a href="https://lock.dezz.cloud"><strong>Launch Web App »</strong></a>
    ·
    <a href="https://github.com/josef/dezzLock/releases"><strong>Download Desktop App »</strong></a>
  </p>
</div>

---

## ⚡ System Overview

**dezzLock** is not just a timer; it's a **psychological anchor**. Designed for polymaths, developers, and creatives juggling multiple high-stakes projects simultaneously. 

Traditional To-Do lists breed anxiety. **dezzLock** forces a Flow state by simulating a "Clock-In" mechanism, locking your interface into a single mission and maintaining a persistent knowledge brain of your active tasks.

### "Externalize your working memory."

---

## 📸 Interface Preview

<div align="center">
  <img src="./public/preview_v1.1.png" alt="dezzLock v1.1 HUD" width="800" style="border-radius: 10px; margin-bottom: 20px;">
  <br>
  <em>The Lock-In HUD: A distraction-free environment for deep work.</em>
</div>

---

## 🧩 Core Modules (v1.1.0)

### 📅 Focus Protocols (Automation)
Schedule your work shifts in advance. 
- **Imminent Alerts:** The system triggers a "Protocol Imminent" sequence 5 minutes before your shift, allowing you to queue an **Auto-Start**.
- **Recurring Power:** Set protocols for specific days and hours to automate your routine.

### 📊 Deep Analytics & Stand-ups
- **Daily Stand-up:** Generate copy-paste ready summaries of your day's work from the header.
- **Intensity Heatmaps:** Visualize your productivity patterns across projects and categories.
- **CSV Export:** Take your raw data for further analysis.

### 💓 Pulse Checks (Anti-Idle)
- **Presence Monitor:** Configure frequency (15-60m) to confirm you are still focused.
- **Auto-Pause:** The system automatically pauses sessions if neglected for 5 minutes, ensuring billing accuracy and focus integrity.

### 🧠 The Knowledge Brain
- **Categorized Archive:** Store projects under CODE, DESIGN, MUSIC, etc.
- **Context Preservation:** Each task node saves description/logic that is injected directly into your focus view.

### 👤 Identity & Sync
- **Custom Avatars:** Cloud-synced profile photos via Supabase Storage.
- **Global Units:** Toggle between **Minutes** and **Hours** display units instantly.
- **Streaks:** 7-tier motivational progression (Sprout to dezzGod) based on consistency.

---

## 🛠️ Tech Stack

Built for resilience and ultra-fast performance.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | High-performance UI rendering. |
| **Styles** | Vanilla CSS + Tailwind | Custom HUD/Cyberpunk design system. |
| **Backend** | Supabase | Postgres DB, Auth, and Storage. |
| **Desktop Wrapper**| Electron | Native execution on Windows. |
| **PWA** | Service Workers | Fully installable mobile experience. |

---

## 🚀 Installation & Setup

### Web Version
Instant access via browser: [**lock.dezz.cloud**](https://lock.dezz.cloud)

### Developer Build
To clone and run this system locally:

```bash
# 1. Clone the matrix
git clone https://github.com/josef/dezzLock.git

# 2. Step inside
cd dezzLock

# 3. Install dependencies
npm install

# 4. Setup Environment
# Create .env based on .env.example with your Supabase keys

# 5. Database Setup
# Apply migrations:
# - supabase_migration_v1.1.sql
# - supabase_migration_v1.1_phase4.sql
# - supabase_fix_deletion.sql

# 6. Run Dev Mode (Web)
npm run dev

# 7. Build Desktop App (Outputs to /release)
npm run electron:build
```

<div align="center">
<br/>
<p>DESIGNED & ENGINEERED BY</p>
<h2>dezzHub</h2>
<p><em>Minds are for having ideas, not holding them.</em></p>
</div>
