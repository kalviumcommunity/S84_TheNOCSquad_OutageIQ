# OutageIQ — User Roles, Personas & RBAC Security Guide (`USER-ROLE.MD`)

> **OutageIQ: Network Outage Impact Prioritization Engine**  
> *Role-Based Access Control (RBAC), Separation of Duties, and Persona Workflows*  
> **Team:** The NOC Squad (Bhawana Kumari & Karan Devgan)

---

## 1. Executive Summary & Purpose

In telecommunications network operations, operational telemetry, customer complaints, and financial revenue models serve distinct stakeholders with different operational responsibilities. 

To eliminate data clutter, maintain strict **separation of duties**, and ensure focused incident triage, **OutageIQ** enforces a **Role-Based Access Control (RBAC)** architecture. 

- **No Shared Default Layout:** Each of the 4 operational personas receives a customized dashboard layout, distinct navigation sidebar, tailored action toolbars, and strict route-level security guards.
- **Route Protection & 403 RoleGuard:** Attempting to access an unauthorized route presents a dedicated **`403 Forbidden — Role Access Restricted`** security screen with a 1-click button to return to authorized dashboards.
- **Authentication & Session Persistence:** Users sign in via the `/login` portal with their dedicated Dummy User IDs and passwords (or 1-click quick demo buttons). Sessions persist across browser reloads via client-side storage.

---

## 2. Dummy User Credentials & Access Quick Reference Table

| User Profile | Dummy User ID (Login) | Password | Job Role & Focus | Primary Dashboard | Accessible Routes | Restricted Routes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Rahul K.** | `rahul.noc` *(or `rahul`)* | `noc@123` | **NOC Engineer**<br>*(Live Triage & Immediate Fixes)* | `/queue`<br>*(Outage Queue)* | `/queue`<br>`/overview`<br>`/` | `❌ /analytics`<br>`❌ /regions`<br>`❌ /export` |
| **Priya S.** | `priya.ops` *(or `priya`)* | `ops@123` | **Regional Ops Manager**<br>*(Circle Density & SLA Compliance)* | `/regions`<br>*(Region View)* | `/regions`<br>`/queue`<br>`/overview`<br>`/` | `❌ /analytics`<br>`❌ /export` |
| **Farah C.** | `farah.cx` *(or `farah`)* | `cx@123` | **Customer Experience Lead**<br>*(Hourly Complaints & Proactive Comms)* | `/analytics`<br>*(CX Hub)* | `/analytics`<br>`/overview`<br>`/` | `❌ /regions`<br>`❌ /queue` *(tech actions)*<br>`❌ /export` |
| **Vikram D.** | `vikram.exec` *(or `vikram`)* | `exec@123` | **Leadership / Director**<br>*(Macro Trends, Revenue at Risk & PDF Reports)* | `/analytics`<br>*(Exec Summary)* | `/analytics`<br>`/export`<br>`/regions`<br>`/overview`<br>`/` | `❌ /queue` *(tactical tech actions)* |

---

## 3. Comprehensive User Profile & Role Breakdown

### Profile 1: Rahul K. — NOC Engineer

- **Full Name:** Rahul K.
- **Dummy User ID:** `rahul.noc` *(Aliases: `rahul`, `rahul@outageiq.internal`)*
- **Password:** `noc@123`
- **Department:** Network Operations Center (NOC) Tier-1 / Tier-2 Triage
- **Official Job Title:** *NOC Operations Engineer & Incident Dispatch Lead*

#### 📋 What His Job Is (Responsibilities & Mission):
Rahul is on the front lines of 24/7 network monitoring. His job is to watch live alarms across all optical fiber backhauls, core routing switches, and cellular tower base stations. When an outage occurs, Rahul does not waste time analyzing high-level quarterly finances or marketing segments; he needs an immediate, ranked list of outages based on the composite **Impact Score (0–100)** so he knows what to fix next, which field technicians to dispatch, and how to prevent service collapse.

#### 🖥️ His Tailored Dashboard & Layout:
1. **Primary Landing Route:** `/queue` (*Outage Queue*)
2. **Layout Characteristics:** 
   - **NOC Operational Dispatch Mode:** High-density live incident list ranked by composite Impact Score.
   - **Instant Action Bar:** Equipped with `⚡ Escalate Outage (Dispatch P1 Field Tech)` and `✓ Assign Tier-3 Optical Lead`.
   - **Technical Telemetry Drawer:** Deep-dive diagnostics on fiber link cuts, switch ASIC memory failures, 5G carrier aggregation loss, and affected service codes (VoLTE, 5G Data, Leased Lines).
   - **Sidebar Navigation:** Strictly streamlined to **🚨 Outage Queue** and **⚡ Live Overview**.
   - **Sidebar Role Filters:** Severity Tiers (P1 Critical, P2 High, P3 Medium), Lifecycle Checkboxes (Open, In Progress, Resolved), and Node Search.

#### 🚫 Access Restrictions & Rationale:
- **Restricted from `/analytics`:** Rahul does not need executive macroeconomic forecasts, 7-day revenue-at-risk curves, or financial credit accounting.
- **Restricted from `/regions`:** Circle-level resource allocations and geographic marketing tiers belong to Regional Operations Managers.
- **Restricted from `/export`:** Generating formal executive PDF briefings for corporate board meetings is reserved for Executive Leadership.

---

### Profile 2: Priya S. — Regional Operations Manager

- **Full Name:** Priya S.
- **Dummy User ID:** `priya.ops` *(Aliases: `priya`, `priya@outageiq.internal`)*
- **Password:** `ops@123`
- **Department:** Regional Network Operations & Circle Infrastructure Management
- **Official Job Title:** *Regional Operations Manager (Geographic Telecom Circles)*

#### 📋 What Her Job Is (Responsibilities & Mission):
Priya is responsible for operational performance and network health across 9 major geographic telecom circles (Mumbai, Delhi NCR, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur). Her focus is to ensure circle-level SLA compliance rates remain above 90%, track subscriber impact density, monitor circle revenue tier exposures (Premium vs Standard), coordinate local field maintenance schedules, and prevent regional regulatory breach penalties.

#### 🖥️ Her Tailored Dashboard & Layout:
1. **Primary Landing Route:** `/regions` (*Region View*)
2. **Layout Characteristics:**
   - **Regional Geo-Operations Command Center:** Circle-by-circle health rankings, active outage count, hourly revenue exposure (e.g. ₹45.2 L/hr in Mumbai), and dominant severity code.
   - **SLA Breach Gauge & Radar:** Live compliance dial tracking countdown timers before circle SLAs breach.
   - **Regional Outage Drilldown:** 1-click filter connecting regional cards to circle-filtered incident queues.
   - **Sidebar Navigation:** Custom navigation featuring **🌐 Region Command Center**, **📊 Regional Outage Queue**, and **🧭 Circle Overview**.
   - **Sidebar Role Filters:** Circle selector prominently placed at the top, along with SLA status filters.

#### 🚫 Access Restrictions & Rationale:
- **Restricted from `/analytics`:** Macro corporate weekly board statistics and financial forecasts are restricted to Executive Directors.
- **Restricted from `/export`:** Executive PDF board briefing exports are reserved for C-suite Leadership.

---

### Profile 3: Farah C. — Customer Experience Lead

- **Full Name:** Farah C.
- **Dummy User ID:** `farah.cx` *(Aliases: `farah`, `farah@outageiq.internal`)*
- **Password:** `cx@123`
- **Department:** Customer Experience, Call Center Support & Incident Communications
- **Official Job Title:** *Customer Experience Lead & Proactive Communications Hub*

#### 📋 What Her Job Is (Responsibilities & Mission):
Farah protects customer satisfaction and brand Net Promoter Score (NPS) during service disruptions. Her job is to track hourly inbound complaint velocity across customer touchpoints (Call Centers, Mobile App, Web Support, Social Media), correlate complaint surges with active network outages, calculate subscriber reach (e.g. 161.0k impacted users), justify customer SLA credit compensations, and dispatch proactive broadcast alerts to customers before support lines are overwhelmed.

#### 🖥️ Her Tailored Dashboard & Layout:
1. **Primary Landing Route:** `/analytics` (*CX & Complaint Velocity Hub*)
2. **Layout Characteristics:**
   - **Today's Hourly Complaint Velocity Graph:** Visualizing call volume spikes (e.g. 1,842 complaints/hr) plotted against outage start times.
   - **Interactive Proactive Communication Dispatcher:** Allows Farah to select distribution channels (**SMS Gateway**, **Mobile App Push**, **Call Center IVR Deflection**, **Web Banner**), compose incident notices, and simulate 1-click broadcast dispatches to impacted subscribers.
   - **Customer Impact & Service Disruption Radar:** Tracking affected services like VoLTE voice drops, 5G Enterprise broadband, and residential data.
   - **Sidebar Navigation:** Focused on **📈 CX & Complaint Analytics** and **👥 Customer Impact Overview**.

#### 🚫 Access Restrictions & Rationale:
- **Restricted from `/regions`:** Low-level physical circle engineering topology and hardware switch configurations belong to Regional Engineering.
- **Restricted from Tactical NOC Field Actions (`/queue` dispatch buttons):** Farah communicates with customers; technical dispatching of optical leads is reserved for NOC Engineers.
- **Restricted from `/export`:** Formal board-level PDF briefing generation is reserved for Executive Leadership.

---

### Profile 4: Vikram D. — Leadership / Director

- **Full Name:** Vikram D.
- **Dummy User ID:** `vikram.exec` *(Aliases: `vikram`, `vikram@outageiq.internal`)*
- **Password:** `exec@123`
- **Department:** Executive Leadership & Office of the VP of Network Infrastructure
- **Official Job Title:** *Executive Director / VP of Network Infrastructure*

#### 📋 What His Job Is (Responsibilities & Mission):
Vikram oversees the entire network infrastructure from a strategic, financial, and executive governance perspective. His responsibility is to track macro enterprise resilience, monitor total **Revenue at Risk (₹42.3 Cr)** across all circles, analyze 7-day rolling outage volume curves, ensure quarterly regulatory SLA compliance, make CapEx network reinforcement investment decisions, and download 1-click confidential PDF incident briefings for C-suite and board meetings.

#### 🖥️ His Tailored Dashboard & Layout:
1. **Primary Landing Route:** `/analytics` (*Executive Incident Briefing & Strategy Center*)
2. **Layout Characteristics:**
   - **Executive Operations KPI Ribbon:** Highlighting Total Outages (84, ↑ 12% vs prior week), Avg Resolution Time (3h 52m), Revenue at Risk (₹42.3 Cr), and SLA Compliance (84%).
   - **7-Day Rolling Volume Curve & Mean Impact Score Trend:** Macro trend lines showing network performance across the week.
   - **1-Click Executive PDF Briefing Generator:** Direct button to produce RFC-compliant binary PDF reports formatted with tables, KPIs, and executive headers.
   - **Exportable Data Suite (`/export`):** Complete export capabilities for CSV data and confidential board PDFs.
   - **Sidebar Navigation:** Shows **📊 Executive Summary & Trends**, **📑 Export Reports**, **🌐 Circle Strategy Matrix**, and **⚡ Macro Overview**.

#### 🚫 Access Restrictions & Rationale:
- **Restricted from Tactical Queue Dispatching:** Vikram does not manipulate low-level technician tickboxes; he reviews macro performance indicators and strategic escalations.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Route / Module | Route URL | Rahul K. (NOC) | Priya S. (Regional) | Farah C. (CX) | Vikram D. (Leadership) | Security & Permission Scope |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Login Portal** | `/login` | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | Public Authentication Gateway |
| **Outage Queue** | `/queue` | ✅ **Primary** | ✅ Allowed | ❌ Restricted | ❌ Restricted | Tactical Incident Triage & Lead Assignment |
| **Region View** | `/regions` | ❌ Restricted | ✅ **Primary** | ❌ Restricted | ✅ Allowed | Geographic Circle Health & SLA Density |
| **CX Analytics** | `/analytics` | ❌ Restricted | ❌ Restricted | ✅ **Primary** | ✅ **Primary** | Hourly Complaints, Trends & Exec KPIs |
| **Exportable Data** | `/export` | ❌ Restricted | ❌ Restricted | ❌ Restricted | ✅ **Full Access** | Board-level PDF Briefings & CSV Generator |
| **Live Overview** | `/overview` or `/` | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | Scoped Summary with Personalized Welcome |

---

## 5. Security Guard & Error Handling (403 RoleGuard)

If a user manually types a URL or attempts to navigate to a restricted route (for example, if Rahul tries to open `http://localhost:3000/export` or Priya attempts `http://localhost:3000/analytics`), OutageIQ's client-side **`RoleGuard`** intercepts the request and renders the security screen:

```
+-------------------------------------------------------------------------+
| 🚨 403 FORBIDDEN — ROLE ACCESS RESTRICTED                               |
| Access Denied: Executive PDF Incident Briefings                         |
| Requested URL: /export                                                  |
|                                                                         |
| Logged In Identity: Rahul K. [NOC Engineer] (ID: rahul.noc)             |
| Security Policy: Confidential executive boardroom PDF report           |
| generation is restricted to Leadership & Executive Directors.           |
|                                                                         |
| Authorized Personas: Leadership / Director                              |
|                                                                         |
| [ ← Return to Your Authorized Dashboard (Outage Queue) ]                |
| [ Switch User Account ]                                                 |
+-------------------------------------------------------------------------+
```

---

## 6. How to Test & Verify in the Application

1. **Visit the Login Page:** Open `/login`.
2. **Test Manual Credential Sign-In:**
   - Type `rahul.noc` and password `noc@123` -> Click **Sign In**.
   - You are automatically routed to Rahul's primary dashboard: `/queue`.
   - Observe Rahul's purple operational banner, NOC dispatch action buttons, and streamlined 2-item sidebar.
3. **Test Route Protection (403 Guard):**
   - While logged in as Rahul, type `/export` or `/analytics` into your browser address bar.
   - The application immediately blocks access and renders the **403 Role Access Restricted** screen.
   - Click **"Go to Your Authorized Dashboard"** to return safely to `/queue`.
4. **Test 1-Click Quick Demo Sign-In:**
   - Open user profile in the top-right header -> click **Sign Out**.
   - On the `/login` screen, click on **Priya S. (Regional Ops Manager)**.
   - You are immediately logged in and routed to `/regions` with circle health matrix and regional SLA gauges.
   - Repeat for **Farah C.** (`/analytics` with CX Proactive Comms Dispatcher) and **Vikram D.** (`/analytics` with Executive KPI summary & 1-click PDF export).

---

*Authored by The NOC Squad (Bhawana Kumari & Karan Devgan) • OutageIQ Platform v1.0*
