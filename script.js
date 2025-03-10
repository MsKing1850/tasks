function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  document.getElementById('time').textContent = time;
  document.getElementById('date').textContent = date;
}
setInterval(updateClock, 1000);
updateClock();

let streak = localStorage.getItem('streak') ? parseInt(localStorage.getItem('streak')) : 0;
let history = JSON.parse(localStorage.getItem('history')) || [];
let defaultTasks = [
  { text: 'Wake up', done: false },
  { text: 'Exercise', done: false },
  { text: 'Drink Water', done: false }
];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function loadTasks() {
  if (tasks.length === 0) {
    tasks = [...defaultTasks];
    saveData();
  }
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.text;
    if (task.done) {
      li.classList.add('completed');
      const tick = document.createElement('span');
      tick.className = 'tick';
      tick.textContent = '✓';
      li.appendChild(tick);
    }
    li.onclick = () => toggleTask(index);
    taskList.appendChild(li);
  });
}

function toggleTask(index) {
  if (!tasks[index].done) {
    tasks[index].done = true;
    saveData();
    loadTasks();
    checkAllTasksCompleted();
  }
}

function checkAllTasksCompleted() {
  const allDone = tasks.every(task => task.done);
  if (allDone) {
    const today = new Date().toLocaleDateString();
    if (!history.includes(today)) {
      streak++;
      history.push(today);
    }
    tasks = [...defaultTasks];
    saveData();
    loadTasks();
    updateStreak();
    loadHistory();
    scheduleCompletionNotification();
  }
}

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const taskText = taskInput.value.trim();
  if (taskText) {
    tasks.push({ text: taskText, done: false });
    taskInput.value = '';
    saveData();
    loadTasks();
  }
}

function loadHistory() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  history.slice().reverse().forEach(date => {
    const li = document.createElement('li');
    li.textContent = `✅ Completed on ${date}`;
    historyList.appendChild(li);
  });
}

function clearHistory() {
  history = [];
  localStorage.setItem('history', JSON.stringify(history));
  loadHistory();
}

function updateStreak() {
  document.getElementById('streakCount').textContent = streak;
}

function saveData() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('streak', streak);
  localStorage.setItem('history', JSON.stringify(history));
}

function toggleTasks() {
  const taskSection = document.getElementById('taskSection');
  const historySection = document.getElementById('historySection');
  taskSection.classList.add('show');
  historySection.classList.remove('show');
}

function toggleHistory() {
  const taskSection = document.getElementById('taskSection');
  const historySection = document.getElementById('historySection');
  historySection.classList.add('show');
  taskSection.classList.remove('show');
}

function askNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
      });
    }
  }
}

function scheduleDailyReminder() {
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(20, 0, 0, 0);
  let timeUntilReminder = reminderTime - now;
  if (timeUntilReminder < 0) {
    timeUntilReminder += 24 * 60 * 60 * 1000;
  }
  setTimeout(() => {
    sendReminderNotification();
    scheduleDailyReminder();
  }, timeUntilReminder);
}

function sendReminderNotification() {
  const hasDoneTask = tasks.some(task => task.done);
  if (!hasDoneTask) {
    new Notification('MS Clock Reminder', {
      body: "Hey, you haven't completed any tasks today! Keep your streak alive!",
      icon: 'https://cdn-icons-png.flaticon.com/512/25/25345.png'
    });
  }
}

function scheduleCompletionNotification() {
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const timeUntilEndOfDay = endOfDay - now;
  setTimeout(() => {
    new Notification('Congratulations!', {
      body: "You completed all your tasks today! Great job!",
      icon: 'https://cdn-icons-png.flaticon.com/512/25/25345.png'
    });
  }, timeUntilEndOfDay);
}

function scheduleTrialNotification() {
  const now = new Date();
  const trialTime = new Date();
  trialTime.setHours(12, 15, 0, 0);
  let timeUntilTrial = trialTime - now;
  if (timeUntilTrial < 0) {
    timeUntilTrial += 24 * 60 * 60 * 1000;
  }
  setTimeout(() => {
    new Notification('Trial Notification', {
      body: "This is your trial notification at 12:15!",
      icon: 'https://cdn-icons-png.flaticon.com/512/25/25345.png'
    });
    scheduleTrialNotification();
  }, timeUntilTrial);
}

window.addEventListener('load', () => {
  askNotificationPermission();
  scheduleDailyReminder();
  scheduleTrialNotification();
});

loadTasks();
loadHistory();
updateStreak();
