
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("[data-target]");
const languageToggle = document.getElementById("languageToggle");

let currentLanguage = "ar";

function showPage(targetId) {
  const targetPage = document.getElementById(targetId);
  if (!targetPage) return;

  pages.forEach(page => {
    page.classList.toggle("active", page.id === targetId);
  });

  document.querySelectorAll(".sidebar .nav-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.target === targetId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.target);
  });
});

function updateLanguage() {
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";

  const app = document.querySelector(".app");
  if (app) app.dir = currentLanguage === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-ar][data-en]").forEach(element => {
    element.textContent = element.dataset[currentLanguage];
  });

  languageToggle.textContent = currentLanguage === "ar" ? "English" : "العربية";

  const taskInput = document.getElementById("taskInput");
  if (taskInput) {
    taskInput.placeholder = currentLanguage === "ar"
      ? "مثال: مراجعة التفاضل"
      : "Example: Review calculus";
  }

  renderTasks();
  renderProgress();
  renderGoal();
}

languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "ar" ? "en" : "ar";
  updateLanguage();
});

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const taskPercent = document.getElementById("taskPercent");
const taskBar = document.getElementById("taskBar");
const clearTasks = document.getElementById("clearTasks");

let tasks = [];

try {
  tasks = JSON.parse(localStorage.getItem("studentPathTasks") || "[]");
  if (!Array.isArray(tasks)) tasks = [];
} catch (error) {
  tasks = [];
}

function saveTasks() {
  try {
    localStorage.setItem("studentPathTasks", JSON.stringify(tasks));
  } catch (error) {
    console.warn("Could not save tasks in this browser.");
  }
}

function renderTasks() {
  if (!taskList) return;

  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = "task-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(task.done);
    checkbox.setAttribute("aria-label", currentLanguage === "ar" ? "إنجاز المهمة" : "Complete task");

    checkbox.addEventListener("change", () => {
      tasks[index].done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.textContent = task.text;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = currentLanguage === "ar" ? "حذف" : "Delete";
    removeButton.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, removeButton);
    taskList.appendChild(item);
  });

  const completed = tasks.filter(task => task.done).length;
  const percentage = tasks.length ? Math.round(completed / tasks.length * 100) : 0;

  taskCount.textContent = currentLanguage === "ar"
    ? `${completed} من ${tasks.length} مهام مكتملة`
    : `${completed} of ${tasks.length} tasks completed`;

  taskPercent.textContent = percentage + "%";
  taskBar.style.width = percentage + "%";
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
});

clearTasks.addEventListener("click", () => {
  if (!tasks.length) return;

  const message = currentLanguage === "ar"
    ? "هل تريد حذف جميع المهام؟"
    : "Do you want to delete all tasks?";

  if (confirm(message)) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

const studyHours = document.getElementById("studyHours");
const weeklyGoal = document.getElementById("weeklyGoal");
const restDay = document.getElementById("restDay");
const saveProgressButton = document.getElementById("saveProgress");
const progressResult = document.getElementById("progressResult");

const dayNames = {
  Saturday: { ar: "السبت", en: "Saturday" },
  Sunday: { ar: "الأحد", en: "Sunday" },
  Monday: { ar: "الاثنين", en: "Monday" },
  Tuesday: { ar: "الثلاثاء", en: "Tuesday" },
  Wednesday: { ar: "الأربعاء", en: "Wednesday" },
  Thursday: { ar: "الخميس", en: "Thursday" },
  Friday: { ar: "الجمعة", en: "Friday" }
};

function renderProgress() {
  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem("studentPathProgress") || "{}");
  } catch (error) {
    saved = {};
  }

  if (saved.hours !== undefined) studyHours.value = saved.hours;
  if (saved.goal !== undefined) weeklyGoal.value = saved.goal;
  if (saved.day !== undefined) restDay.value = saved.day;

  if (!saved.goal) {
    progressResult.textContent = currentLanguage === "ar"
      ? "أدخل ساعاتك وهدفك ويوم الراحة، ثم اضغط حفظ التقدم."
      : "Enter your study hours, goal, and rest day, then save.";
    return;
  }

  const hours = Number(studyHours.value) || 0;
  const goal = Number(weeklyGoal.value) || 1;
  const percentage = Math.min(100, Math.round(hours / goal * 100));
  const day = dayNames[restDay.value]?.[currentLanguage] || (currentLanguage === "ar" ? "غير محدد" : "Not selected");

  progressResult.textContent = currentLanguage === "ar"
    ? `أنجزت ${hours} من ${goal} ساعة (${percentage}%). يوم الراحة: ${day}.`
    : `Completed ${hours} of ${goal} hours (${percentage}%). Rest day: ${day}.`;
}

saveProgressButton.addEventListener("click", () => {
  const hours = Number(studyHours.value);
  const goal = Number(weeklyGoal.value);

  if (
    studyHours.value === "" ||
    weeklyGoal.value === "" ||
    !Number.isFinite(hours) ||
    !Number.isFinite(goal) ||
    hours < 0 ||
    hours > 168 ||
    goal < 1 ||
    goal > 168 ||
    !restDay.value
  ) {
    progressResult.textContent = currentLanguage === "ar"
      ? "أدخل ساعات صحيحة وحدد هدفًا أسبوعيًا ويومًا للراحة."
      : "Enter valid hours, a weekly goal, and a rest day.";
    return;
  }

  try {
    localStorage.setItem("studentPathProgress", JSON.stringify({
      hours,
      goal,
      day: restDay.value
    }));
    renderProgress();
  } catch (error) {
    progressResult.textContent = currentLanguage === "ar"
      ? "تعذر الحفظ في هذا المتصفح."
      : "Could not save data in this browser.";
  }
});

const goalInput = document.getElementById("goalInput");
const goalDate = document.getElementById("goalDate");
const saveGoalButton = document.getElementById("saveGoal");
const goalResult = document.getElementById("goalResult");

function renderGoal() {
  let goal = {};

  try {
    goal = JSON.parse(localStorage.getItem("studentPathGoal") || "{}");
  } catch (error) {
    goal = {};
  }

  if (goalInput && goal.text !== undefined) goalInput.value = goal.text;
  if (goalDate && goal.date !== undefined) goalDate.value = goal.date;

  if (!goal.text) {
    goalResult.textContent = currentLanguage === "ar"
      ? "لم تحفظ هدفًا بعد."
      : "You have not saved a goal yet.";
    return;
  }

  goalResult.textContent = currentLanguage === "ar"
    ? `هدفك: ${goal.text} — الموعد: ${goal.date || "لم تحدد موعدًا"}`
    : `Your goal: ${goal.text} — Deadline: ${goal.date || "No date selected"}`;
}

saveGoalButton.addEventListener("click", () => {
  const text = goalInput.value.trim();
  const date = goalDate.value;

  if (!text) {
    goalResult.textContent = currentLanguage === "ar"
      ? "اكتب هدفك أولًا."
      : "Please enter your goal first.";
    return;
  }

  try {
    localStorage.setItem("studentPathGoal", JSON.stringify({ text, date }));
    renderGoal();
  } catch (error) {
    goalResult.textContent = currentLanguage === "ar"
      ? "تعذر حفظ الهدف في هذا المتصفح."
      : "Could not save the goal in this browser.";
  }
});

renderTasks();
renderProgress();
renderGoal();
