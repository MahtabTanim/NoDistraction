# Deep Focus Mode: Feature Improvement

## Overview
Transforming NoDistraction from a single-block Pomodoro timer into a multi-cycle "Deep Focus" session tracker. This feature allows users to block out large chunks of time (e.g., 3 hours) to achieve a specific target, breaking that time down into customizable cycles (e.g., three 50-minute work blocks with 10-minute breaks).

The feature integrates concepts from the "Focus Protocol" to protect attention and ensure high-quality deep work.

## Core Conceptual Changes
1. **Session vs. Cycle**: 
   - A **Session** is the overarching time block (e.g., 3 hours). 
   - A **Cycle** is the repeating work/break interval within that session.
   - Pre-session setup (Do's/Don'ts, Activation Ritual, Target Outcome) applies to the *entire* Session, not individual cycles.
2. **End of Session**: The Enforced Closing Ritual only occurs at the very end of the entire Session (after all cycles are complete), encouraging users to close open loops before fully disconnecting.

## New Features & Workflows

### 1. Pre-Focus Ritual (Session Configuration)
- **Presets & Customization**: Users can select quick presets (e.g., "Standard: 4x 25m/5m", "Focus Protocol: 1x 90m/20m") or choose a "Custom" mode to define exact Work Duration, Break Duration, and Number of Cycles.
- **Define the Win**: The "Target Outcome" question is reframed to "Define the win" (requiring one concrete sentence, e.g., "First draft complete") to increase clarity and intention.

### 2. The Distraction Shield
- **Distraction Dump**: A new text area/notepad on the active timer screen. When a random thought or task pops up ("I should email Sarah", "Pay the electric bill"), users can quickly type it here without leaving the flow state. This externalizes the distraction so the brain can relax. These notes are saved to the session history for review later.

### 3. The Focus Cycle & Transitions
- **Pausing**: Users can pause the timer at any point. The session remains active indefinitely until resumed or manually aborted.
- **Manual Cycle Starts**: When a work block finishes, the break starts automatically. However, when a break finishes, the app requires a manual click to start the next work block. This prevents the timer from running if the user walked away from their desk.

### 4. Recovery Window
- **Break Timer Updates**: The break screen will specifically suggest physical recovery protocols from the Focus Protocol (e.g., "Stand up and move", "Hydrate", "Let your mind wander away from screens").

### 5. Tracking & Export
- **Daily Reset**: The app UI (History Panel) will automatically clear at midnight, showing only a clean slate of "Today's History".
- **Exportable Records**: All historical data remains safely saved in the app's local storage. Users can export their entire history (including their Distraction Dump notes, energy ratings, and outcomes) to a **CSV file** at any time for analysis in Excel or Notion.

### 6. End of Day Self-Reflection
- **Manual Trigger**: A "Daily Review" button on the main UI allows the user to manually trigger the reflection questionnaire when they are finished working for the day.
- **Reflection UI**: Opens a dedicated slide-out side panel (similar to the Settings or History panels) containing the questionnaire.
- **Questions**:
  1. How do you rate yourself out of 10 for today's work?
  2. How was your energy out of 10?
  3. If you lost focus, what was the reason? How do you plan to overcome this?
  4. Good thing that happened today, thing you are proud of.
- **Storage & Export**: The answers are saved in the app's internal local storage. When exporting history, the daily reflections are included alongside the session data in the CSV export so the user can track their self-improvement trajectory over months.

## Open Considerations
- **Global Long Break**: With customizable cycles inside a session, the global "Long Break Interval" setting may conflict with session plans. It should likely be removed or disabled when running a multi-cycle deep focus session.
- **Visual Progress**: We need a clean UI element on the main timer ring to show cycle progress (e.g., "Cycle 1 of 3").
