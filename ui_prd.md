Page 1: Home Page (The Landing Pitch)
A clean, high-impact introductory screen designed to set up the presentation narrative before launching the live system.
Components & Layout
Hero Branding: App name or title: AI Recruiting Agent (Paid x Deploy by Antler).
Value Proposition Callout:
"An autonomous AI agent that sources, screens, and vets engineering talent, charging purely for value delivered via Paid.com."
Value Metric Cards: Three static display tiles showcasing the project's economic structure:
Outreach Cost: ~£0.05 / email
Vetted Candidate: +£25
Successful Placement: +£2,000
Primary Action: A prominent [Launch New Hiring Campaign →] button that transitions the view to the Onboarding Page.
Page 2: Campaign Onboarding & Setup
The configuration panel where the hiring parameters are set up to initialize the agent's sandbox.
Components & Layout
Campaign Form:
Text Input: Company Name (e.g., "Hooli")
Text Input: Target Role Title (e.g., "Founding Backend Engineer")
File Drag-and-Drop / Text Area: Job Description
Hiring Process Pipeline Visualizer:
A fixed, horizontal tracking bar displaying the strict hackathon sequence:
CV Screening ➔ Take-Home Assessment ➔ Human Interview
CTA Button: [Deploy Agent & Initialize Funnel].
Behavior: Submits the form data, triggers the backend to ingest the 3 demo candidates into the database at the found state, and immediately routes to the Live Dashboard.
Page 3: Live Agent Dashboard
The primary performance screen for the live stage demo. It uses a three-column dashboard layout to display the visual pipeline, localized activity logs, and the billing ledger side-by-side.
+-----------------------------------------------------------------------------------------+
| [Top Navbar] Campaign: Founding Backend Engineer at Hooli        [Link to Notifications]|
+------------------------------------+----------------------------------------------------+
|                                    | [Right Sidebar: Top] Activity Feed                 |
| [Main Panel] Kanban Board          | > Claude is drafting email to Person X...          |
| Columns: Found -> Reached Out ->   | > Sent outreach_sent signal to Paid...             |
| CV Screen -> Take-Home ->          +----------------------------------------------------+
| Interview -> Hired                 | [Right Sidebar: Bottom] Paid Panel (Invoice View)   |
|                                    | Total Revenue: £2,025  |  Cost to Serve: £0.15     |
+------------------------------------+----------------------------------------------------+
1. Main Column: Candidate Kanban Board
A horizontal board divided into 6 distinct columns. Candidate cards move smoothly from left to right across columns without page flashing based on reactive data changes.
The 6 Columns:
Found: Initial state of the 3 imported candidates.
Reached Out: Cards transition here the instant the agent dispatches the personalized email.
CV Screening: A fast-moving transit state indicating background verification.
Take-Home Assessment: Houses the candidate after they submit their public GitHub repo.
Card Interactivity: Unlocks a clickable toggle: [View Claude Take-Home Report]. Clicking this expands an inline markdown card showing the AI's code critique.
Interview: The final screening stage.
Card Interactivity: Displays two prominent human-in-the-loop decision buttons: [❌ Reject] and [✅ Pass & Hire].
Hired: The terminal successful state.
Decline Handling: Scripted candidate declines should visually fade out opacity and drop into a compact footer bin labeled Declined / Opted Out to keep the active lane clean.
2. Right Column (Top): Dashboard Activity Feed
A localized view of the global notifications engine. It acts as the "live thinking stream" of the agent.
Behavior: Pre-pends new logs to the top of a scrollable box with a subtle fade-in animation.
Log Styling:
[PROCESSING] Drafting personalized outreach for [Candidate Name]... (Yellow badge)
[EMAIL SENT] Outreach delivered to [Email Address]. (Green badge)
[INBOUND REPLY] Parsed reply. Detected GitHub repo link: github.com/... (Blue badge)
[PAID SIGNAL] Fired signal 'candidate_vetted' for £25. (Purple bold text)
3. Right Column (Bottom): Paid.com Billing Ledger
The financial reporting screen demonstrating live monetization.
High-Level Financial Cards:
Total Revenue (Increments in real-time: £0 ➔ £25 ➔ £2,025)
Cost to Serve (Increments dynamically based on API usage, e.g., £0.15)
Net Margin %
Dynamic Running Invoice Table:
Updates rows dynamically as billing signals are fired from the backend:
Fired Signal	Type	Unit Price	Qty	Total Billed
outreach_sent	Usage	£0.00	3	£0.00
submission_evaluated	Usage	£0.00	1	£0.00
candidate_vetted	Outcome	£25.00	1	£25.00
successful_hire	Outcome	£2,000.00	1	£2,000.00
Page 4: Notifications Hub (Dedicated Full-Page)
Accessible via a persistent navigation link in the main top header, this page offers an exhaustive audit log of all system activities.
Components & Layout
Shared Data Model: This page reads from the exact same global reactive notifications array as the Dashboard Sidebar feed, ensuring absolute parity between views.
Full-Width Table View: Outlines system logs with explicit detail:
Timestamp: HH:MM:SS
Category: (e.g., Outreach, AI Analysis, Paid.com Billing, System Override)
Description: Complete text strings (e.g., "System initiated a Claude call to evaluate the repository provided by Person 1. Code quality rating scored 84/100.")
Filter System: A simple top-bar pill navigation filtering logs by category (All, Agent Actions, Financials, Errors) for cleaner presentation layout on stage if needed.


Here are the specific UI/UX enhancements you can apply to the dashboard to make the Paid integration impossible to miss.
1. The "Live Receipt" Metaphor
Instead of a standard dashboard card, style the Paid Panel (Right Column, Bottom) to look like a physical, printing receipt or a high-end financial invoice.
Visual Treatment: Give the panel a slightly off-white background, monospace typography for the numbers, and a jagged or dashed top/bottom border.
Branded Header: Place a prominent [ PAID ] logo or badge at the very top of this panel. If Paid.com uses specific brand colors (like a distinct purple or deep green), use that as the dominant accent color for this specific panel to break it out from the rest of your app's color scheme.
2. Emphasize the "Signal Fired" Action
The hackathon goal is to prove the agent is firing signals to Paid. You need to make this action visually loud.
Flash Updates: Whenever the Total Revenue increments, make the number briefly scale up (pulse) and flash green.
Row Highlighting: When a new row is added to the Dynamic Running Invoice Table (e.g., candidate_vetted), apply a brief highlight animation (like a yellow fade-out) to that specific row so the audience sees the line item being written in real-time.
3. Global "Money" Toasts
Don't restrict the Paid integration purely to the bottom right corner. When a major monetary event occurs, interrupt the main UI slightly.
Trigger: When the agent successfully advances a candidate and triggers the successful_hire (£2,000) signal.
Action: Trigger a branded toast notification at the top center of the screen:
💳 Paid Signal Fired: £2,000 added to invoice for Successful Placement

CRITICAL: This application requires a fully reactive, zero-reload frontend. As the autonomous AI backend executes actions (e.g., reviewing a CV, passing a candidate to the take-home assessment stage, or firing a Paid.com billing signal), these state transitions must be reflected instantly in the UI.
This real-time synchronization will be powered by Convex. The frontend must subscribe to Convex's reactive database queries. When the backend agent writes a new state or log to Convex, the UI (Kanban board, notification feed, and billing ledger) will automatically re-render the updated data over WebSockets without any manual page refresh.