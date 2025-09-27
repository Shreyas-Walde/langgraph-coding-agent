# Todo App

**A pastel‑themed, single‑page application for managing your daily tasks.**

---

## Description

This project is a lightweight, client‑side Todo application built with plain HTML, CSS, and JavaScript. It follows a clean, pastel colour palette and functions as a single‑page application (SPA) – all interactions happen without page reloads. Tasks are stored in the browser’s `localStorage`, providing persistence across sessions while keeping the app completely offline‑first.

---

## Features

- Add new tasks
- Edit existing tasks inline
- Delete tasks
- Mark tasks as completed
- Filter tasks (All / Active / Completed)
- Clear all completed tasks
- Persistent storage using `localStorage`
- Responsive design for mobile, tablet, and desktop
- Accessible with ARIA roles and keyboard navigation

---

## Tech Stack

- **HTML** – Structure of the application
- **CSS** – Styling with a pastel theme and responsive layout
- **JavaScript** – Core functionality, SPA routing, and `localStorage` handling

---

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
2. **Open the application**
   - Simply open `index.html` in any modern web browser.
3. **Optional: Run with a live‑server** (recommended for development)
   ```bash
   npx live-server
   ```
   This will serve the files locally and automatically reload on changes.

---

## Usage

- **Add a task** – Type your task into the input field at the top and press **Enter** or click the **Add** button.
- **Edit a task** – Double‑click on a task’s text, modify it, and press **Enter** or click outside the input to save.
- **Delete a task** – Click the trash‑can icon next to the task.
- **Complete a task** – Click the checkbox on the left of a task to toggle its completed state.
- **Filter tasks** – Use the filter buttons (All, Active, Completed) at the bottom to view a subset of tasks.
- **Clear completed** – Click the **Clear Completed** button to remove all tasks marked as completed.

---

## LocalStorage Persistence

- All tasks are saved in the browser’s `localStorage` under the key `todos`. This means your list remains intact even after closing the browser or refreshing the page.
- To **reset** the application, clear the stored data:
  1. Open the browser’s developer tools (F12).
  2. Navigate to the **Application** (or **Storage**) tab.
  3. Locate **Local Storage → http://localhost** (or the file URL) and delete the `todos` entry, or simply click **Clear site data**.

---

## Design

### Colour Palette
- **Peach**: `#FFCCBC`
- **Pink**: `#F8BBD0`
- **Cream**: `#FFF9C4`

These colours are used throughout the UI for backgrounds, buttons, and hover states, providing a soft, calming aesthetic.

### Responsive Breakpoints
- **Mobile**: up to **600px** – single‑column layout, larger touch targets.
- **Tablet**: **601px – 1024px** – centered container with moderate padding.
- **Desktop**: **1025px+** – wider container, increased spacing for readability.

---

## Accessibility

- **ARIA roles**: The app uses appropriate `role="list"`, `role="listitem"`, and `aria‑label` attributes for screen readers.
- **Keyboard navigation**:
  - `Tab`/`Shift+Tab` to move focus between interactive elements.
  - `Enter` to add a task or confirm an edit.
  - `Space` to toggle a task’s completed state.
  - `Delete` (or `Backspace` when focused on a task) to remove a task.
- **Reduced‑motion**: CSS respects the `prefers-reduced-motion` media query, disabling non‑essential transitions for users who prefer minimal animation.

---

## License

[Insert license information here]
