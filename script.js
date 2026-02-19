// Timer Configuration
const TIMER_MODES = {
    focus: { duration: 25 * 60, label: 'Focus Session', color: '#4CAF50' },
    short: { duration: 5 * 60, label: 'Short Break', color: '#2196F3' },
    long: { duration: 15 * 60, label: 'Long Break', color: '#FF9800' }
};

// State Management
let currentMode = 'focus';
let timeRemaining = TIMER_MODES[currentMode].duration;
let isRunning = false;
let timerInterval = null;
let completedSessions = 0;
let totalMinutes = 0;

// DOM Elements
const timeDisplay = document.getElementById('timeDisplay');
const sessionLabel = document.getElementById('sessionLabel');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const taskInput = document.getElementById('taskInput');
const currentTask = document.getElementById('currentTask');
const completedSessionsEl = document.getElementById('completedSessions');
const totalTimeEl = document.getElementById('totalTime');
const themeToggle = document.getElementById('themeToggle');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const alarmSound = document.getElementById('alarmSound');
const progressBar = document.querySelector('.progress-ring-bar');

// Initialize
function init() {
    updateDisplay();
    loadTheme();
    loadStats();
    setupEventListeners();
    updateProgressRing();
}

// Event Listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    themeToggle.addEventListener('click', toggleTheme);
    taskInput.addEventListener('input', updateCurrentTask);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target !== taskInput) {
            e.preventDefault();
            isRunning ? pauseTimer() : startTimer();
        }
        if (e.code === 'Escape') {
            resetTimer();
        }
    });
}

// Timer Functions
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateDisplay();
            updateProgressRing();
            
            if (timeRemaining <= 0) {
                completeSession();
            }
        }, 1000);
    }
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
}

function resetTimer() {
    pauseTimer();
    timeRemaining = TIMER_MODES[currentMode].duration;
    updateDisplay();
    updateProgressRing();
}

function completeSession() {
    pauseTimer();
    playAlarm();
    showNotification(`${TIMER_MODES[currentMode].label} Complete! 🎉`);
    
    if (currentMode === 'focus') {
        completedSessions++;
        totalMinutes += TIMER_MODES.focus.duration / 60;
        updateStats();
        saveStats();
    }
    
    resetTimer();
}

// Mode Switching
function switchMode(mode) {
    if (isRunning) {
        pauseTimer();
    }
    
    currentMode = mode;
    timeRemaining = TIMER_MODES[mode].duration;
    
    modeBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    sessionLabel.textContent = TIMER_MODES[mode].label;
    progressBar.style.stroke = TIMER_MODES[mode].color;
    
    updateDisplay();
    updateProgressRing();
}

// Display Updates
function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Update page title
    document.title = `${timeDisplay.textContent} - Pomodoro Timer`;
}

function updateProgressRing() {
    const totalDuration = TIMER_MODES[currentMode].duration;
    const circumference = 2 * Math.PI * 140;
    const progress = (timeRemaining / totalDuration) * circumference;
    progressBar.style.strokeDashoffset = circumference - progress;
}

function updateCurrentTask() {
    currentTask.textContent = taskInput.value;
}

function updateStats() {
    completedSessionsEl.textContent = completedSessions;
    totalTimeEl.textContent = totalMinutes;
}

// Theme Management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    localStorage.setItem('theme', newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.querySelector('.theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Notification & Sound
function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function playAlarm() {
    alarmSound.currentTime = 0;
    alarmSound.play().catch(e => console.log('Audio play failed:', e));
}

// Stats Persistence
function saveStats() {
    localStorage.setItem('completedSessions', completedSessions);
    localStorage.setItem('totalMinutes', totalMinutes);
}

function loadStats() {
    completedSessions = parseInt(localStorage.getItem('completedSessions')) || 0;
    totalMinutes = parseInt(localStorage.getItem('totalMinutes')) || 0;
    updateStats();
}

// Initialize App
init();
