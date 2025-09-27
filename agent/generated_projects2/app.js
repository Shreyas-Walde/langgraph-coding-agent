// app.js – Task CRUD, filtering, persistence, and UI handling for PeachyTodo
// ---------------------------------------------------------------
// Task model
class Task {
  /**
   * @param {string} text
   * @param {Date|null} dueDate
   */
  constructor(text, dueDate = null) {
    // Use built‑in crypto API if available for UUIDs, fallback to simple generator
    this.id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : Task._fallbackUuid();
    this.text = text;
    this.dueDate = dueDate instanceof Date ? dueDate : null;
    this.completed = false;
    this.createdAt = Date.now();
  }

  static _fallbackUuid() {
    // Very simple (non‑RFC) UUID‑like string – sufficient for demo purposes
    return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// ---------------------------------------------------------------
// TaskManager singleton – handles storage & business logic
const TaskManager = (() => {
  const STORAGE_KEY = "peachyTodoTasks";
  /** @type {Task[]} */
  let tasks = [];

  const loadTasks = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Re‑hydrate plain objects into Task instances (preserve prototype methods if any)
        tasks = parsed.map(obj => {
          const t = new Task(obj.text, obj.dueDate ? new Date(obj.dueDate) : null);
          t.id = obj.id;
          t.completed = obj.completed;
          t.createdAt = obj.createdAt;
          return t;
        });
      } catch (e) {
        console.error("Failed to parse tasks from localStorage", e);
        tasks = [];
      }
    }
    return tasks;
  };

  const saveTasks = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  };

  const addTask = (text, dueDate) => {
    const task = new Task(text, dueDate);
    tasks.push(task);
    saveTasks();
    renderTask(task);
  };

  const findIndex = id => tasks.findIndex(t => t.id === id);

  const editTask = (id, newText, newDueDate) => {
    const idx = findIndex(id);
    if (idx === -1) return;
    const task = tasks[idx];
    task.text = newText;
    task.dueDate = newDueDate instanceof Date ? newDueDate : null;
    saveTasks();
    // Update the DOM element directly
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) updateTaskElement(li, task);
  };

  const deleteTask = id => {
    const idx = findIndex(id);
    if (idx === -1) return;
    tasks.splice(idx, 1);
    saveTasks();
    // Fade‑out animation before removal
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) {
      li.classList.add("fade-out");
      // Assuming CSS animation duration of 300ms – adjust if needed
      setTimeout(() => li.remove(), 300);
    }
  };

  const toggleComplete = id => {
    const idx = findIndex(id);
    if (idx === -1) return;
    const task = tasks[idx];
    task.completed = !task.completed;
    saveTasks();
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) {
      li.classList.toggle("completed", task.completed);
      const checkbox = li.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = task.completed;
    }
  };

  const clearCompleted = () => {
    const before = tasks.length;
    tasks = tasks.filter(t => !t.completed);
    if (tasks.length !== before) {
      saveTasks();
      renderTaskList();
    }
  };

  const filterTasks = filter => {
    switch (filter) {
      case "active":
        return tasks.filter(t => !t.completed);
      case "completed":
        return tasks.filter(t => t.completed);
      case "all":
      default:
        return tasks.slice();
    }
  };

  // expose public API
  return {
    loadTasks,
    saveTasks,
    addTask,
    editTask,
    deleteTask,
    toggleComplete,
    clearCompleted,
    filterTasks,
    // internal reference for rendering helpers
    _getAll: () => tasks,
  };
})();

// ---------------------------------------------------------------
// UI helpers & rendering
let currentFilter = "all"; // default filter
let editingTaskId = null; // null when not in edit mode

/** Create a <li> element representing a task */
function createTaskElement(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;
  li.className = "task-item";
  if (task.completed) li.classList.add("completed");
  li.classList.add("fade-in"); // for entry animation

  // Checkbox (accessible)
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "toggle";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-checked", task.completed);
  checkbox.setAttribute("role", "checkbox");
  checkbox.setAttribute("title", "Mark as completed");
  li.appendChild(checkbox);

  // Text span
  const textSpan = document.createElement("span");
  textSpan.className = "task-text";
  textSpan.textContent = task.text;
  li.appendChild(textSpan);

  // Optional due date
  if (task.dueDate) {
    const time = document.createElement("time");
    time.className = "due-date";
    time.dateTime = task.dueDate.toISOString();
    // Format as YYYY‑MM‑DD (simple)
    time.textContent = task.dueDate.toISOString().split("T")[0];
    li.appendChild(time);
  }

  // Edit button
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "edit-btn";
  editBtn.setAttribute("aria-label", "Edit task");
  editBtn.innerHTML = "✎"; // simple pencil icon
  li.appendChild(editBtn);

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "delete-btn";
  delBtn.setAttribute("aria-label", "Delete task");
  delBtn.innerHTML = "✖"; // simple cross icon
  li.appendChild(delBtn);

  return li;
}

/** Append a single task to the list */
function renderTask(task) {
  const ul = document.getElementById("task-list");
  if (!ul) return;
  const li = createTaskElement(task);
  ul.appendChild(li);
}

/** Update an existing <li> element with new task data (used after edit) */
function updateTaskElement(li, task) {
  // Update checkbox state
  const checkbox = li.querySelector('input[type="checkbox"]');
  if (checkbox) {
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-checked", task.completed);
  }
  // Update text
  const textSpan = li.querySelector('.task-text');
  if (textSpan) textSpan.textContent = task.text;
  // Update due date – recreate if needed
  const existingTime = li.querySelector('time.due-date');
  if (task.dueDate) {
    if (existingTime) {
      existingTime.dateTime = task.dueDate.toISOString();
      existingTime.textContent = task.dueDate.toISOString().split('T')[0];
    } else {
      const time = document.createElement('time');
      time.className = 'due-date';
      time.dateTime = task.dueDate.toISOString();
      time.textContent = task.dueDate.toISOString().split('T')[0];
      li.insertBefore(time, li.querySelector('.edit-btn'));
    }
  } else if (existingTime) {
    existingTime.remove();
  }
  // Update completed class
  li.classList.toggle('completed', task.completed);
}

/** Clear the list and render tasks according to the current filter */
function renderTaskList() {
  const ul = document.getElementById("task-list");
  if (!ul) return;
  ul.innerHTML = ""; // remove all children
  const tasksToRender = TaskManager.filterTasks(currentFilter);
  tasksToRender.forEach(renderTask);
}

// ---------------------------------------------------------------
// Event handling
document.addEventListener("DOMContentLoaded", () => {
  // Load persisted tasks and render them
  TaskManager.loadTasks();
  renderTaskList();

  const form = document.getElementById("task-form");
  const inputText = document.getElementById("new-task");
  const inputDate = document.getElementById("due-date");

  // Submit – add or edit depending on editingTaskId
  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = inputText.value.trim();
    if (!text) return;
    const dateValue = inputDate.value; // format YYYY‑MM‑DD or empty
    const dueDate = dateValue ? new Date(dateValue) : null;

    if (editingTaskId) {
      TaskManager.editTask(editingTaskId, text, dueDate);
      editingTaskId = null;
    } else {
      TaskManager.addTask(text, dueDate);
    }
    form.reset();
    // Return focus to input for rapid entry
    inputText.focus();
  });

  // Keyboard shortcuts while editing – Escape cancels edit mode
  form.addEventListener("keydown", e => {
    if (e.key === "Escape" && editingTaskId) {
      editingTaskId = null;
      form.reset();
    }
  });

  // Delegated actions on the task list
  const ul = document.getElementById("task-list");
  ul.addEventListener("click", e => {
    const target = e.target;
    const li = target.closest("li[data-id]");
    if (!li) return;
    const id = li.dataset.id;

    // Toggle via checkbox or clicking the whole item (except buttons)
    if (target.matches('input.toggle')) {
      TaskManager.toggleComplete(id);
    } else if (target.matches('.edit-btn')) {
      // Populate form for editing
      const task = TaskManager._getAll().find(t => t.id === id);
      if (!task) return;
      editingTaskId = id;
      inputText.value = task.text;
      if (task.dueDate) {
        // format as YYYY‑MM‑DD for input[type=date]
        const iso = task.dueDate.toISOString().split('T')[0];
        inputDate.value = iso;
      } else {
        inputDate.value = "";
      }
      inputText.focus();
    } else if (target.matches('.delete-btn')) {
      TaskManager.deleteTask(id);
    }
  });

  // Keyboard navigation on list items – Enter toggles completion, Escape cancels edit
  ul.addEventListener("keydown", e => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    const id = li.dataset.id;
    if (e.key === "Enter") {
      e.preventDefault();
      TaskManager.toggleComplete(id);
    } else if (e.key === "Escape" && editingTaskId) {
      // Cancel edit mode from anywhere
      editingTaskId = null;
      form.reset();
    }
  });

  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      // Update active state
      filterButtons.forEach(b => b.classList.toggle('active', b === btn));
      renderTaskList();
    });
  });

  // Clear completed
  const clearBtn = document.getElementById('clear-completed');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      TaskManager.clearCompleted();
    });
  }
});

// ---------------------------------------------------------------
// Export nothing – script runs directly in the browser
