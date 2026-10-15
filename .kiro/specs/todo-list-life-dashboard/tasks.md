# Implementation Plan: Todo List Life Dashboard

## Overview

This plan builds the dashboard as a single page with exactly one CSS file and one JavaScript file, using HTML, CSS, and vanilla JavaScript only. Work proceeds bottom-up: first the HTML scaffold and shared helpers (`storage`, `notify`, `dom`), then the four feature modules (Greeting, Focus Timer, To-Do List, Quick Links), each wired into the `DOMContentLoaded` initializer as it is built so there is no orphaned code. Styling and responsive layout close out the plan. Per NFR-1 (Requirement 12), there is no automated test harness; verification sub-tasks are lightweight manual browser checks consistent with the design's Testing Strategy.

## Tasks

- [x] 1. Scaffold the single-page structure and file layout
  - Create `index.html` with four `<section>` elements, each containing an `<h2>` heading (Greeting, Focus Timer, To-Do List, Quick Links) and a dedicated message area per section
  - Add the greeting time/date/greeting placeholders, the timer display and start/stop/reset controls, the to-do input/add control and list container, and the quick-links label/URL inputs/add control and buttons container
  - Create exactly one stylesheet at `css/styles.css` and link it in the `<head>`; create exactly one script at `js/app.js` and load it deferred at the end of `<body>`
  - Add a `DOMContentLoaded` entry point in `js/app.js` that will initialize the four modules in order (empty stubs for now)
  - _Requirements: 12.1, 12.3, 12.4, 13.3_

- [x] 2. Implement shared helpers (storage, notify, dom)
  - [x] 2.1 Implement the `dom` helper
    - Write `el(tag, props, children)` to build elements and `clear(node)` to empty a node, using direct DOM APIs and text content (never `innerHTML` of user data)
    - _Requirements: 12.1, 13.1, 13.2_

  - [x] 2.2 Implement the `notify` helper
    - Render a scoped plain-text status/error message into a given section's message area; clear the message on the next successful action
    - _Requirements: 12.6_

  - [x] 2.3 Implement the `storage` helper
    - Write `isAvailable()` using a probe write/remove inside try/catch; `readJSON(key)` returning `{ ok:true, value }` or `{ ok:false, reason }` for missing/unreadable/parse-failure; `writeJSON(key, value)` returning `{ ok:true }` or `{ ok:false, reason }` when `setItem` throws
    - Define the `tldd.tasks` and `tldd.links` key constants
    - _Requirements: 12.2, 12.6_



- [ ] 3. Implement the GreetingModule
  - [-] 3.1 Implement time and date formatting
    - Write `formatTime(date)` producing `HH:MM:SS` via locale/timezone-aware formatting and `formatDate(date)` producing weekday, month name, day number, and four-digit year in the browser locale
    - _Requirements: 1.1, 1.2_

  - [~] 3.2 Implement period classification and greeting labels
    - Write `classifyPeriod(date)` mapping the local hour to morning (5-11), afternoon (12-16), evening (17-20), night (21-4); write `greetingFor(period)` returning a distinct label per period
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [~] 3.3 Implement the module lifecycle and tick, and wire into init
    - Write `init()` to render once and start a 1-second interval; write `tick()` to update the time every second, update the date only when the calendar date changes, and update the greeting only when the period changes (using `lastRenderedDateKey` and `lastPeriod`); call `init()` from the `DOMContentLoaded` entry point
    - _Requirements: 1.3, 2.6_



- [ ] 4. Implement the FocusTimerModule
  - [~] 4.1 Implement timer state and rendering
    - Initialize `remaining = 1500`, `isRunning = false`; write `render()` to format `remaining` as `MM:SS`; write `init()` to render `25:00` in the stopped state and wire it into the `DOMContentLoaded` entry point
    - _Requirements: 3.1_

  - [~] 4.2 Implement start/stop/reset and countdown transitions
    - Write `start()` guarded so it only acts when `remaining > 0` and is a no-op while already running (continue uninterrupted); `onTick()` to decrement by 1 each second and stop at 0; `stop()` to pause and retain `remaining`; `reset()` to return to `1500`/stopped from any state; bind the three controls
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_


- [ ] 5. Checkpoint - read-only features complete
  - Ensure the greeting and focus timer render and behave correctly in the browser, ask the user if questions arise.

- [ ] 6. Implement the TodoListModule
  - [~] 6.1 Implement task validation and the Task data model
    - Write shared validation for add/edit: trim for the emptiness check, reject 0 non-whitespace chars ("A description is required."), reject total length over 200 ("Description must be 200 characters or fewer."); define the Task shape `{ id, description, completed }` with unique id generation
    - _Requirements: 4.1, 4.3, 4.4, 5.2, 5.3, 5.4_

  - [~] 6.2 Implement load, persist, and shape validation
    - Write `load()` to read `tldd.tasks`, validate the array shape and adopt it preserving order and completion state, use `[]` when the key is missing, and use `[]` plus a "saved tasks could not be loaded" error on read/parse failure; write `persist()` to write `tldd.tasks` and, on write failure, keep in-memory tasks and show "change could not be saved"
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 12.6_

  - [~] 6.3 Implement render with empty-state and completed styling
    - Write `render()` to rebuild the list from `tasks`, apply the completed-state visual class per task, and show the empty-state message when there are no tasks
    - _Requirements: 6.3, 6.4, 7.4, 13.1_

  - [~] 6.4 Implement add, complete toggle, and delete
    - Write `add(rawText)` to validate, push a new incomplete Task at the end, persist, clear the input, and render (show validation errors without mutating state on failure); `toggleComplete(id)` to flip completion, persist, and revert on persist failure with an error; `remove(id)` to show "task could not be found" when absent, otherwise remove, persist, and render (empty-state when none remain)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.5, 7.1, 7.2, 7.3, 7.4_

  - [~] 6.5 Implement edit flow (begin/confirm/cancel)
    - Write `beginEdit(id)` to render a pre-populated editable input; `confirmEdit(id, rawText)` to validate and replace the description on success (persist, exit edit mode) or keep the previous description and show an error while staying in edit mode; `cancelEdit()` to exit edit mode and restore the original description
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [~] 6.6 Wire the module into init
    - Call `TodoListModule.init()` from the `DOMContentLoaded` entry point so tasks load and render on page load
    - _Requirements: 8.2, 8.3_


- [ ] 7. Checkpoint - to-do list complete
  - Ensure to-do add/edit/complete/delete and persistence work in the browser, ask the user if questions arise.

- [ ] 8. Implement the QuickLinksModule
  - [ ] 8.1 Implement link validation and the Quick_Link data model
    - Write validation: trim label and require 1-50 chars ("Label must be 1-50 characters."); require a non-empty URL of at most 2048 chars that parses via `new URL(...)` with `http:`/`https:` protocol ("Enter a valid http or https URL."); define the Quick_Link shape `{ id, label, url }` with unique id generation
    - _Requirements: 10.1, 10.3, 10.4_

  - [ ] 8.2 Implement load, persist, and shape validation
    - Write `load()` to read `tldd.links`, validate the array shape and adopt it in saved order, use `[]` when the key is missing, and use `[]` while discarding malformed/unparseable data (no error required); write `persist()` to write `tldd.links` and, on write failure, keep in-memory links and show "quick links could not be saved"
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 12.6_

  - [ ] 8.3 Implement render with truncation and empty-state
    - Write `render()` to produce one button per link with the label truncated to 30 characters plus a trailing ellipsis when longer, and show the "no quick links" message with no buttons when there are none
    - _Requirements: 9.1, 9.2, 13.2_

  - [ ] 8.4 Implement add, remove, and open
    - Write `add(rawLabel, rawUrl)` to validate and, on success, push a Quick_Link, persist, and render; on failure reject, retain the input values, and show a field-specific error; `remove(id)` to remove, persist, and render; `open(id)` to show "link is invalid" for a missing/malformed URL or otherwise open the URL in a new tab with `noopener`
    - _Requirements: 9.3, 9.4, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 8.5 Wire the module into init
    - Call `QuickLinksModule.init()` from the `DOMContentLoaded` entry point so links load and render on page load
    - _Requirements: 11.3, 11.4_


- [ ] 9. Implement presentation and responsive styling
  - [ ] 9.1 Style the four labeled sections and typography
    - In `css/styles.css`, style the four sections as visually distinct, labeled regions (spacing, borders/background, headings); set base `font-size` to at least 14px on `body` and choose foreground/background color pairs that meet at least 4.5:1 contrast
    - _Requirements: 13.3, 13.4_

  - [ ] 9.2 Implement the responsive fluid layout
    - Use flexbox/grid with wrapping, `max-width` containers, `box-sizing: border-box`, and no fixed widths wider than the smallest viewport; add a breakpoint to switch between a single column (narrow) and a multi-column arrangement (wide) so all four sections show without horizontal scrolling or overlap from 320px to 1920px
    - _Requirements: 13.5_


- [ ] 10. Final checkpoint - full dashboard
  - Ensure all four sections work together and data persists across reloads in the browser, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional, lightweight manual verification steps and can be skipped for a faster MVP. Per NFR-1 (Requirement 12), the project includes no automated test harness, test framework, or property-based testing setup; verification is manual per the design's Testing Strategy.
- Each task references specific requirement clauses for traceability.
- Checkpoints ensure incremental validation at natural breaks.
- The Focus Timer is intentionally not persisted; no requirement asks for its state to survive reload.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 1, "tasks": ["2.4", "3.1", "3.2", "4.1", "6.1", "8.1"] },
    { "id": 2, "tasks": ["3.3", "4.2", "6.2", "8.2"] },
    { "id": 3, "tasks": ["3.4", "4.3", "6.3", "8.3"] },
    { "id": 4, "tasks": ["6.4", "8.4"] },
    { "id": 5, "tasks": ["6.5", "8.5"] },
    { "id": 6, "tasks": ["6.6", "8.6"] },
    { "id": 7, "tasks": ["6.7", "9.1"] },
    { "id": 8, "tasks": ["9.2"] },
    { "id": 9, "tasks": ["9.3"] }
  ]
}
```
