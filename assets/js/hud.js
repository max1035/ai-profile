const moduleContainer = document.getElementById("module-container");
const navButtons = document.querySelectorAll(".nav-btn[data-module]");
const consoleToggle = document.getElementById("console-toggle");
const consoleSection = document.getElementById("hud-console");
const consoleCollapse = document.getElementById("console-collapse");
const consoleOutput = document.getElementById("console-output");
const consoleInput = document.getElementById("console-command");
const clockDisplay = document.getElementById("clock-display");

const moduleCache = new Map();

async function loadModule(name) {
  if (moduleCache.has(name)) {
    moduleContainer.innerHTML = moduleCache.get(name);
    attachPanelToggles();
    return;
  }

  try {
    const response = await fetch(`hud-modules/${name}.html`);
    const html = await response.text();
    moduleCache.set(name, html);
    moduleContainer.innerHTML = html;
    attachPanelToggles();
  } catch (error) {
    moduleContainer.innerHTML = `<div class="panel"><div class="panel-header">ERROR</div><div class="module-body">Failed to load module.</div></div>`;
  }
}

function attachPanelToggles() {
  const toggles = moduleContainer.querySelectorAll(".panel-toggle");
  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".panel");
      panel.classList.toggle("collapsed");
      btn.textContent = panel.classList.contains("collapsed") ? "Expand" : "Collapse";
    });
  });
}

function setActiveButton(name) {
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.module === name);
  });
}

function setupNavigation() {
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const moduleName = btn.dataset.module;
      setActiveButton(moduleName);
      loadModule(moduleName);
    });
  });
}

function setupConsole() {
  consoleToggle.addEventListener("click", () => {
    consoleSection.scrollIntoView({ behavior: "smooth" });
    consoleSection.classList.remove("collapsed");
    consoleInput.focus();
  });

  consoleCollapse.addEventListener("click", () => {
    const isCollapsed = consoleSection.classList.toggle("collapsed");
    consoleCollapse.textContent = isCollapsed ? "▼" : "▲";
  });

  consoleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const command = consoleInput.value.trim();
      if (!command) return;
      runCommand(command);
      consoleInput.value = "";
    }
  });
}

function logToConsole(message) {
  const line = document.createElement("div");
  line.className = "console-line";
  line.textContent = message;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function runCommand(command) {
  const lower = command.toLowerCase();
  logToConsole(`> ${command}`);
  switch (lower) {
    case "help":
      logToConsole("Available: help, clear, status");
      break;
    case "clear":
      consoleOutput.innerHTML = "";
      break;
    case "status":
      logToConsole("Systems nominal. Modules responsive.");
      break;
    default:
      logToConsole("Unknown command. Type 'help'.");
      break;
  }
}

function setupClock() {
  const updateClock = () => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    clockDisplay.textContent = time;
  };
  updateClock();
  setInterval(updateClock, 1000);
}

window.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupConsole();
  setupClock();
  loadModule("system");
});
