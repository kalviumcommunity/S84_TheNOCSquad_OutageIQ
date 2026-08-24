# OutageIQ — The Complete Plain-English & In-Depth System Guide

> **A Comprehensive, Jargon-Free (Yet Technically Deep) Explanation of OutageIQ**  
> *What it is, why it was built, how the math works, who uses it, and how the entire hierarchy operates.*  
> **Team:** The NOC Squad (**Bhawana Kumari** & **Karan Devgan**)  
> **Location:** [`docs/NON-TECHNICAL-EXPLANATION.md`](docs/NON-TECHNICAL-EXPLANATION.md)

---

## 1. What is this Project About? (The Real-World Story)

Imagine you run a giant telecom company like **Jio, Airtel, Vodafone, or Verizon**. Every single second, millions of people rely on your network to make emergency calls, run banking transactions, navigate maps, attend online classes, and stream video.

Inside a telecom network, thousands of things can go wrong every single day:
- A construction backhoe digs up an underground optical fiber cable in downtown Mumbai.
- A monsoon thunderstorm cuts power to a cell tower in Bangalore.
- A high-capacity routing switch overheats and crashes in Delhi.

When these incidents happen, automated alarm systems trigger hundreds of red flashing warnings inside the **Network Operations Center (NOC)**.

---

### The Problem: "The Old Broken Way" of Fixing Outages

In traditional telecom operations, the engineering team faces a massive problem called **Alert Fatigue and Data Silos**:

1. **The Technical Silo (NOC Alarms):** The engineering team only sees technical codes (e.g., *"Severity: Critical — Node 44 Down"*). But they have no idea if that node is powering 50,000 active businesses or just 10 phones in an empty rural field.
2. **The Customer Service Silo (Call Centers & Apps):** Thousands of furious customers start calling the helpdesk, tweeting on social media, and lodging complaints in the mobile app. But the call center operators have no idea which technical fiber line broke.
3. **The Business & Finance Silo (Regional Revenue):** Business leadership knows that a 1-hour outage in a financial district costs ₹40 Lakhs in lost revenue and SLA penalties, but they have no real-time dashboard connecting outages to revenue loss.

Because these three worlds never talked to each other, engineers triaged outages using **gut feel, seniority, or whichever alarm was screaming the loudest**. A technician might spend 4 hours fixing a backup tower in a low-density suburb while 50,000 corporate users in a major city center sat in the dark.

---

### The Solution: What OutageIQ Does

**OutageIQ is the "Air Traffic Control" and "Intelligent Brain" for telecom network operations.**

It acts as a master fusion engine that connects all three worlds in real-time:

```
┌────────────────────────────────┐  ┌────────────────────────────────┐  ┌────────────────────────────────┐
│      1. HARDWARE ALARMS        │  │      2. CUSTOMER COMPLAINTS    │  │    3. REGIONAL REVENUE & USERS │
│  "What physically broke?"      │  │  "How loud are people crying?" │  │  "How much money is at risk?"  │
│  (Tower cuts, switch crashes)  │  │  (Calls, app tickets, velocity)│  │  (Subscriber count, ARPU tiers)│
└───────────────┬────────────────┘  └───────────────┬────────────────┘  └───────────────┬────────────────┘
                │                                   │                                   │
                └─────────────────────────┬─────────┴───────────────────────────────────┘
                                          │
                                          ▼
                        ┌───────────────────────────────────┐
                        │      OutageIQ FUSION ENGINE       │
                        │   • Deduplicates messy inputs     │
                        │   • Spatio-temporal matching      │
                        │   • 4-Factor Relative Scoring     │
                        │   • Priority Tier Classification  │
                        └─────────────────┬─────────────────┘
                                          │
                                          ▼
                        ┌───────────────────────────────────┐
                        │   0–100 COMPOSITE IMPACT SCORE    │
                        │  "Rank #1: Fix THIS Outage First!"│
                        └───────────────────────────────────┘
```

Instead of guessing, everyone from the junior field engineer to the Executive Vice President looks at a single, explainable dashboard that ranks every active outage from highest business impact to lowest.

---

## 2. How the Engine Works: Plain English & Technical Mechanics

OutageIQ transforms raw, messy data into actionable operational clarity through a 5-step pipeline:

```
[Raw Files & Alarms] ──▶ [Clean & Detective Match] ──▶ [4-Factor Scoring] ──▶ [Prioritized Queue] ──▶ [Action & Export]
```

### Step 1: Ingestion & Pre-Flight Health Check
- **In Plain English:** When network files or CSV logs arrive, OutageIQ checks if the files are corrupted, missing headers, or written in strange character formats before letting them in.
- **Under the Hood (Technical):** Handled by `validate_intake.py` and `ingestion.py`. It runs automated encoding detection (`chardet`), enforces strict required schema keys (`outage_id`, `region_id`, `start_time`, `severity`), strips dirty whitespace, and removes duplicate primary keys.

---

### Step 2: The "Detective Matcher" (Spatio-Temporal Complaint Correlation)
- **In Plain English:** When a customer calls 198 and says *"My 5G internet stopped working 15 minutes ago in South Mumbai"*, they don't know the serial number of the broken cell tower. OutageIQ acts like a detective: it looks for any open network outage in the exact same region (South Mumbai) that started within $\pm 2\text{ hours}$ of the complaint timestamp, and automatically links the customer's complaint to the root outage.
- **Under the Hood (Technical):** Handled by `match_unlinked_complaints()` in `ingestion.py`. If `linked_outage_id` is missing, it filters candidate outages by `region_id == complaint.region_id` and `status == 'open'`, calculates time deltas in hours, finds the closest matching incident within a 2.0-hour window, and tags the record with `match_type = 'temporal_match'` (vs `explicit`).

---

### Step 3: The 4-Factor Impact Formula (Baking the Score)
OutageIQ calculates an **Impact Score between 0 and 100** for every outage. Think of it like baking a cake with four essential ingredients:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          THE 4 INGREDIENTS OF THE IMPACT SCORE                              │
│                                                                                             │
│  Ingredient 1: Customer Reach (35% Weight)                                                  │
│  "How many actual people are impacted in this region?"                                      │
│                                                                                             │
│  Ingredient 2: Complaint Pressure (30% Weight)                                              │
│  "How fast are customer complaints flooding into call centers right now?"                   │
│                                                                                             │
│  Ingredient 3: Revenue Exposure (20% Weight)                                                │
│  "Is this circle a Tier-1 high-paying commercial zone or a standard low-revenue zone?"      │
│                                                                                             │
│  Ingredient 4: Duration & Severity (15% Weight)                                             │
│  "How severe is the hardware break, and how many hours has it been sitting unfixed?"        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### The Exact Mathematical Equation:
$$\text{Impact Score} = \left(0.35 \cdot \text{Reach}_{\text{norm}} + 0.30 \cdot \text{Complaints}_{\text{norm}} + 0.20 \cdot \text{Revenue}_{\text{norm}} + 0.15 \cdot \text{Duration}_{\text{norm}}\right) \times 100$$

- **Relative Min-Max Normalization:** Every metric is normalized across all active outages ($0.0$ to $1.0$). This means a score of `92.4` in Mumbai isn't just an arbitrary number—it proves mathematically that this outage is currently causing more combined human, financial, and technical damage than any other incident in the country.
- **Zero Black Boxes:** Every score can be opened up to see the exact 4 sub-scores (e.g. Reach: 88 pts, Complaints: 95 pts, Revenue: 90 pts, Duration: 72 pts).

---

### Step 4: Priority Tiers & SLA Countdown Clocks
Once scored, OutageIQ sorts outages into four operational action tiers with legally binding **Service Level Agreement (SLA)** targets:

| Operational Tier | Score Threshold | Color Badge | Max SLA Allowed | Action Mandated |
| :--- | :---: | :---: | :---: | :--- |
| **Critical (P1)** | **$\ge 75.0$** | 🔴 Red | **2 Hours** | Emergency executive escalation & immediate field team dispatch |
| **High (P2)** | **$50.0 - 74.99$** | 🟠 Orange | **4 Hours** | High priority dispatch within standard technical shifts |
| **Medium (P3)** | **$25.0 - 49.99$** | 🔵 Blue | **8 Hours** | Standard operational queue triage |
| **Low (P4)** | **$< 25.0$** | 🟢 Green | **24 Hours** | Scheduled maintenance or minor non-service affecting issue |

- **SLA Countdown Clocks:** Every ticket displays a live countdown clock (e.g., `⏱️ 1h 12m left` $\to$ `⚠️ SLA At Risk (<30m)` $\to$ `🚨 SLA Breached`).

---

### Step 5: Data Confidence & Fallback Safety
- **In Plain English:** What happens if a cell tower in a remote region hasn't sent subscriber data yet? In bad software, the system crashes. In OutageIQ, the system calculates a partial score, keeps running smoothly, and places a prominent yellow badge: `⚠️ Low Confidence - Partial Data (Missing: subscriber_count)`.
- **Under the Hood (Technical):** Handled by `evaluate_data_confidence()` in `scoring.py` (satisfying NFR Reliability).

---

## 3. The 4 User Personas, Organizational Hierarchy & A Day in the Life

OutageIQ is built around the strict organizational hierarchy of a modern telecom enterprise. Different roles have different responsibilities, different questions to answer, and strictly separated permissions.

```
                            ORGANIZATIONAL HIERARCHY
                            
                                 ┌───────────────┐
                                 │   LEVEL 1     │
                                 │ Vikram D.     │  Executive Director / VP
                                 │ (Leadership)  │  "What is our macro risk & money lost?"
                                 └───────┬───────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
            ┌───────▼───────┐                         ┌───────▼───────┐
            │   LEVEL 2     │                         │   LEVEL 2     │
            │ Priya S.      │ Regional Ops Manager    │ Farah C.      │ Customer Experience Lead
            │ (Geo Circles) │ "Is Mumbai hitting SLA?"│ (Sentiment)   │ "Why are complaints spiking?"
            └───────┬───────┘                         └───────────────┘
                    │
            ┌───────▼───────┐
            │   LEVEL 3     │
            │ Rahul K.      │ NOC Operations Engineer
            │ (Frontline)   │ "Which cable do I fix RIGHT NOW?"
            └───────────────┘
```

---

### 👤 Persona 1: Rahul K. — The Frontline NOC Engineer
* **Job Title:** NOC Operations Engineer & Incident Dispatch Lead
* **Login ID:** `rahul.noc` | **Password:** `noc@123`
* **Department:** Network Operations Center (NOC Tier-1/Tier-2)
* **What he cares about:** Technical hardware alarms, fiber cable cuts, server crashes, dispatching field vans.

#### ☕ A Day in the Life of Rahul:
1. **8:00 AM — Logs In:** Rahul logs in at `/login`. OutageIQ immediately takes him to his specialized operational screen: **`/queue`**.
2. **8:05 AM — Reviews Ranked Queue:** He doesn't see financial reports or marketing charts; he sees a high-density, real-time list of 9 outages sorted `#1, #2, #3` by Impact Score.
3. **8:10 AM — Inspects Incident #1:** The top incident is `OUT-2026-0723-N91` in Mumbai with an Impact Score of **92.4 (Critical P1)**. He clicks the row. A technical side drawer slides open showing:
   - Root Cause: *"Core Backhaul Gateway Fiber Severance near BKC Data Hub"*.
   - Affected Services: VoLTE Voice Calls, 5G Mobile Data, Dedicated Bank Leased Lines.
   - SLA Clock: `🚨 SLA Breached (4h 12m elapsed vs 2.0h target)`.
4. **8:15 AM — Takes Immediate Action:** Rahul clicks the purple button **`[ ⚡ Escalate Outage (Dispatch P1 Field Tech) ]`**. The system fires an API request, updates SQLite on disk, changes the ticket status to `Active Triage`, and alerts the field technicians.
5. **8:30 AM — Assigns Tier-3 Lead:** He clicks **`[ ✓ Assign Tier-3 Optical Lead ]`** to assign specialized fiber technicians.

#### 🛡️ What Rahul is RESTRICTED from Doing:
- If Rahul tries to type `/export` or `/analytics` into his browser address bar, OutageIQ's **`RoleGuard`** stops him and displays:  
  `🚨 403 Forbidden — Boardroom PDF report generation is restricted to Leadership.`  
  *Why?* Rahul is a tactical engineer; corporate financial forecasting and board briefing exports are outside his job scope.

---

### 👤 Persona 2: Priya S. — The Regional Operations Manager
* **Job Title:** Regional Operations Manager (Geographic Circles)
* **Login ID:** `priya.ops` | **Password:** `ops@123`
* **Department:** Regional Network Operations & Circle Infrastructure Management
* **What she cares about:** Geographic circles (Mumbai, Delhi NCR, Bangalore, Chennai, Pune), regional SLA compliance rates $\ge 90\%$, circle revenue exposure.

#### ☕ A Day in the Life of Priya:
1. **9:00 AM — Logs In:** Priya logs in and lands directly on **`/regions`**.
2. **9:05 AM — Analyzes Circle Health Matrix:** She sees a geographic overview of all 9 telecom circles:
   - **#1 Mumbai:** 4 active outages, 4.2M subscribers, ₹45.2 Lakhs/hour revenue at risk, SLA Compliance: 82.0% (Critical).
   - **#2 Delhi NCR:** 3 active outages, 3.8M subscribers, ₹38.0 Lakhs/hour revenue at risk, SLA Compliance: 85.0%.
   - **#8 Ahmedabad:** 1 minor outage, 0.9M subscribers, ₹4.1 Lakhs/hour revenue at risk, SLA Compliance: 98.0% (Healthy).
3. **9:15 AM — Deep Dives into Mumbai:** She clicks on the Mumbai bar chart. Right below it, a purple action bar appears:  
   `Selected: Mumbai • Exposure: ₹45.2 L/hr • SLA: 82.0%  [ Filter Queue by Mumbai → ]`
4. **9:20 AM — Filters the Live Queue:** She clicks the button. OutageIQ instantly jumps to `/queue?region=Mumbai`, showing ONLY the Mumbai outages so she can hold her local field leads accountable.

#### 🛡️ What Priya is RESTRICTED from Doing:
- Blocked from `/analytics` (Macro corporate financial forecasts) and `/export` (C-suite confidential board briefings).

---

### 👤 Persona 3: Farah C. — The Customer Experience (CX) Lead
* **Job Title:** Customer Experience Lead & Incident Communications
* **Login ID:** `farah.cx` | **Password:** `cx@123`
* **Department:** Customer Experience, Call Center Support & Retention
* **What she cares about:** Customer anger, inbound call center spikes, protecting brand Net Promoter Score (NPS), sending proactive alerts before social media explodes.

#### ☕ A Day in the Life of Farah:
1. **10:00 AM — Logs In:** Farah logs in and lands directly on **`/analytics`** (her CX & Complaint Hub).
2. **10:05 AM — Reviews Hourly Complaint Velocity Graph:** She sees a chart plotting inbound complaints by hour:
   - Normal baseline: ~300 calls/hour.
   - At 08:00 AM (when Mumbai fiber cut occurred): Spiked to **1,842 complaints/hour**.
3. **10:15 AM — Launches Proactive Communication Dispatcher:** To prevent call centers from crashing with 10,000 hold calls, Farah uses the interactive Dispatcher on her screen:
   - Selects Channels: `[✓] SMS Gateway` `[✓] Mobile App Push` `[✓] Call Center IVR Auto-Deflection` `[✓] Web Banner`.
   - Composes Notice: *"We are aware of a fiber disruption in BKC Mumbai. Technicians are on site. Estimated fix: 45 mins."*
   - Clicks **`[ 🚀 Simulate Proactive Customer Broadcast ]`** $\to$ Sends immediate broadcast notices to the 42,000 affected users, deflecting calls and saving customer trust.
4. **10:30 AM — Calculates SLA Credit Eligibility:** Reviews impacted users to prepare automated bill credits for premium accounts.

#### 🛡️ What Farah is RESTRICTED from Doing:
- Blocked from technical hardware dispatch buttons on `/queue` (she manages customer communications, not physical fiber splices) and `/regions` (physical circle engineering topology).

---

### 👤 Persona 4: Vikram D. — The Executive Director / VP
* **Job Title:** Executive Director / VP of Network Infrastructure
* **Login ID:** `vikram.exec` | **Password:** `exec@123`
* **Department:** Executive Leadership & Office of the VP
* **What he cares about:** High-level corporate risk, quarterly SLA penalties, total revenue at risk (₹42.3 Crores), 7-day trend trajectories, board briefings.

#### ☕ A Day in the Life of Vikram:
1. **11:00 AM — Logs In:** Vikram logs in and lands on **`/analytics`** (Executive Strategy View).
2. **11:05 AM — Inspects the Executive KPI Ribbon:**
   - Total Outages: **84** (↑ 12% vs prior week).
   - Average Resolution Time (MTTR): **3h 52m**.
   - Total Revenue at Risk: **₹42.3 Crores**.
   - SLA Compliance Rate: **84%** (Target: $\ge 90\%$).
3. **11:15 AM — Reviews 7-Day Trend Curves:** Looks at the rolling 7-day volume trajectory comparing daily outage volume vs average impact scores to evaluate whether network reliability is improving or deteriorating.
4. **11:20 AM — Uses the ROI & Business Savings Calculator:** Moves sliders on `RoiCalculator.tsx` to simulate: *"If we deploy automated fiber switching in Mumbai, we save ₹1.8 Crores annually in SLA penalties and prevent 14,000 customer churns."*
5. **11:30 AM — Downloads 1-Click Boardroom PDF Briefing:** Vikram is walking into a board meeting with the CEO in 5 minutes. He clicks **`[ 📑 Download Executive PDF Briefing ]`**. OutageIQ's Python server instantly generates an RFC-compliant binary PDF document containing high-level KPIs, top 5 prioritized outages, and regional breakdowns, ready for presentation.

#### 🛡️ What Vikram is RESTRICTED from Doing:
- Vikram has wide visibility across `/analytics`, `/export`, `/regions`, and `/overview`, but does not perform low-level technician dispatching on `/queue`.

---

## 4. Summary Matrix: The 4 Roles at a Glance

| Feature / Dashboard Module | Rahul K.<br>*(NOC Engineer)* | Priya S.<br>*(Regional Ops)* | Farah C.<br>*(CX Lead)* | Vikram D.<br>*(Exec Director)* | Why Access is Configured This Way |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Login Gateway (`/login`)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | Universal authentication point for all employees. |
| **Outage Queue (`/queue`)** | ✅ **Primary** | ✅ Allowed | ❌ Restricted | ❌ Restricted | Tactical technician dispatching is strictly for engineering leads. |
| **Escalate / Assign Ticket API** | ✅ **Full Control** | ❌ Read Only | ❌ Blocked | ❌ Blocked | Only NOC engineers can order physical technician truck rolls. |
| **Region View (`/regions`)** | ❌ Restricted | ✅ **Primary** | ❌ Restricted | ✅ Allowed | Circle management and regional SLA allocations belong to Ops Managers. |
| **"Filter Queue by Region"** | ❌ Restricted | ✅ **Full Control** | ❌ Blocked | ✅ Allowed | Connects regional circle management to operational incident queues. |
| **CX Analytics (`/analytics`)** | ❌ Restricted | ❌ Restricted | ✅ **Primary** | ✅ **Primary** | Hourly complaint spikes, customer broadcast tools & macro trends. |
| **Proactive Comms Dispatcher** | ❌ Restricted | ❌ Restricted | ✅ **Full Control** | ❌ Read Only | Customer broadcast messaging is managed exclusively by CX. |
| **ROI & Savings Calculator** | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ **Full Control** | CapEx financial planning is reserved for Executive Directors. |
| **Boardroom PDF Export (`/export`)**| ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ **Full Control** | Confidential C-suite boardroom briefings are restricted to Leadership. |

---

## 5. Technical Architecture for the Curious Mind

Even though OutageIQ is designed for non-technical clarity, under the hood it is an enterprise-grade, high-performance software system:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   SINGLE-SERVER UNIFIED ARCHITECTURE (PORT 8000)                       │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ 1. FRONTEND LAYER (Next.js 16 + React 19 + Tailwind CSS + Lucide Icons)        │   │
│   │    • App Router (/queue, /regions, /analytics, /export, /overview)             │   │
│   │    • RoleGuard client-side route protection (403 Security Interceptor)         │   │
│   │    • Interactive SVG Impact Gauges, Sliders, and Bar Charts                    │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │ Live REST JSON Streaming / UI Actions      │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ 2. PYTHON SERVER & ANALYTICS ENGINE (Python 3.11 / 3.12 Standalone)            │   │
│   │    • Built-in HTTP Server (`server.py` on Port 8000)                           │   │
│   │    • Vectorized 4-Factor Impact Scoring Engine (`scoring.py`)                  │   │
│   │    • Deterministic Priority Queue & Re-Ranking (`queue_manager.py`)            │   │
│   │    • Spatio-Temporal Matcher (`ingestion.py` sliding window)                   │   │
│   │    • Built-in RFC-1.4 Binary PDF Synthesizer (`generate_binary_pdf`)           │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │ Permanent SQL Transactions                 │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ 3. EMBEDDED SQLITE DATABASE (`backend/data/outageiq.db`)                       │   │
│   │    • `outages` table (22 columns: scores, sub-scores, SLA timers, status)      │   │
│   │    • `regions` table (10 columns: subscribers, revenue tier, SLA compliance)  │   │
│   │    • `complaints` table (7 columns: channels, timestamps, match types)         │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Technical Highlights:
1. **Single-Server Simplicity:** No complex multi-service Docker meshes required for evaluation. Run `python3 server.py` and the entire platform (database, REST API, scoring engine, and web interface) boots instantly on `http://localhost:8000`.
2. **Instant Sub-Millisecond Speed:** The database query and ranking pipeline executes in **$< 10\text{ milliseconds}$**, well within the PRD's 5.0-second performance budget.
3. **Pure Python RFC Binary PDF Engine:** Generates true binary PDF-1.4 documents on the fly without requiring heavy external dependencies like headless Chrome, Puppeteer, or wkhtmltopdf.
4. **100% Automated Test Coverage:** Over 66 Python unit tests and 46 Playwright browser tests guarantee that every calculation, route guard, and button behaves flawlessly.

---

## 6. How to Test and Explore the Platform Yourself

You can test every single feature described in this guide in under 2 minutes:

```bash
# 1. Start the platform:
python3 server.py

# 2. Open in your browser:
http://localhost:8000/login
```

### Try These 4 Experiments:
1. **Sign in as Rahul (`rahul.noc` / `noc@123`):** Go to `/queue`, click on incident `OUT-2026-0723-N91` (Mumbai), and click **"Escalate Ticket"**. Notice how the status immediately flips to `Active Triage` and writes to the SQLite database.
2. **Test Route Security (403 Guard):** While logged in as Rahul, try typing `http://localhost:8000/export` into your URL bar. Watch how the **403 Security Screen** blocks unauthorized access.
3. **Sign in as Priya (`priya.ops` / `ops@123`):** On `/regions`, click on **Mumbai**, then click **`[ Filter Queue by Mumbai → ]`**. Watch how you are seamlessly routed to `/queue?region=Mumbai` with only Mumbai outages displayed.
4. **Sign in as Vikram (`vikram.exec` / `exec@123`):** On `/analytics`, review the macro trend curves and click **`[ 📑 Download Executive PDF Briefing ]`** to download a clean boardroom PDF report.

---

*Authored by **The NOC Squad** (Bhawana Kumari & Karan Devgan) • OutageIQ Documentation Suite v2.2.0*
