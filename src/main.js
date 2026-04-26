import './style.css';
import scheduleDataRaw from './data.json';

let scheduleData = scheduleDataRaw;

// DOM Elements
const viewBtns = document.querySelectorAll('.view-btn');
const viewSections = document.querySelectorAll('.view-section');

const groupButtonsContainer = document.getElementById('group-buttons');
const selectedGroupTitle = document.getElementById('selected-group-title');
const groupCalendar = document.getElementById('group-calendar');
const yearSelect = document.getElementById('year-select');
const monthSelect = document.getElementById('month-select');

const dateInput = document.getElementById('date-input');
const selectedDateTitle = document.getElementById('selected-date-title');
const dailyShiftsContainer = document.getElementById('daily-shifts');

const overviewContainer = document.getElementById('overview-container');
const overviewYear = document.getElementById('overview-year');
const overviewMonth = document.getElementById('overview-month');

// Initialize Application
function initApp() {
  try {
    if (!scheduleData) throw new Error('데이터를 불러오는데 실패했습니다.');
    
    setupViewToggles();
    setupGroupView();
    setupDateView();
    setupOverviewView();
    
  } catch (error) {
    console.error('Initialization error:', error);
    document.querySelector('.content-area').innerHTML = `
      <div class="glass-panel" style="text-align: center; color: #ef4444;">
        <h2>데이터 로드 실패</h2>
        <p>근무 스케줄 데이터를 찾을 수 없습니다.</p>
      </div>
    `;
  }
}

// Setup Top View Toggles (Group / Date)
function setupViewToggles() {
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update buttons
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update sections
      const targetView = btn.getAttribute('data-view');
      viewSections.forEach(section => {
        if (section.id === `${targetView}-view`) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
    });
  });
}

// Setup Group View
function setupGroupView() {
  const groups = Object.keys(scheduleData.groups);
  
  // Setup Year/Month filters
  const years = [...new Set(scheduleData.schedule.map(d => d.date.split('.')[0]))];
  years.forEach(year => {
    const opt = document.createElement('option');
    opt.value = year;
    opt.textContent = `${year}년`;
    yearSelect.appendChild(opt);
  });
  
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement('option');
    const mStr = m.toString().padStart(2, '0');
    opt.value = mStr;
    opt.textContent = `${m}월`;
    monthSelect.appendChild(opt);
  }
  
  // Set current year/month as default
  const today = new Date();
  const currentY = today.getFullYear().toString();
  const currentM = (today.getMonth() + 1).toString().padStart(2, '0');
  const currentFullDate = `${currentY}-${currentM}-${today.getDate().toString().padStart(2, '0')}`;
  
  // Update Date Input
  dateInput.value = currentFullDate;
  
  if (years.includes(currentY)) {
    yearSelect.value = currentY;
  } else {
    yearSelect.value = years[0];
  }
  monthSelect.value = currentM;
  
  [yearSelect, monthSelect].forEach(el => {
    el.addEventListener('change', () => {
      const activeBtn = document.querySelector('.group-btn.active');
      if (activeBtn) {
        const group = activeBtn.querySelector('span:first-child').textContent.replace('조', '');
        renderGroupSchedule(group);
      }
    });
  });

  // Create group selection buttons
  groups.forEach(group => {
    const btn = document.createElement('button');
    btn.className = 'group-btn';
    btn.innerHTML = `
      <span>${group}조</span>
      <span class="name">${scheduleData.groups[group].name}</span>
    `;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGroupSchedule(group);
    });
    groupButtonsContainer.appendChild(btn);
  });
  
  // Select first group by default
  if (groups.length > 0) {
    groupButtonsContainer.firstElementChild.click();
  }
}

function renderGroupSchedule(groupId) {
  selectedGroupTitle.textContent = `${groupId}조 (${scheduleData.groups[groupId].name}) 스케줄`;
  groupCalendar.innerHTML = '';
  
  const selectedYear = yearSelect.value;
  const selectedMonth = monthSelect.value;
  const prefix = `${selectedYear}.${selectedMonth}`;
  
  const filteredData = scheduleData.schedule.filter(d => d.date.startsWith(prefix));
  
  if (filteredData.length === 0) {
    groupCalendar.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">해당 기간의 데이터가 없습니다.</p>';
    return;
  }

  filteredData.forEach(dayInfo => {
    const shift = dayInfo.shifts[groupId];
    let shiftClass = 'shift-휴무';
    let displayShift = '휴무';
    
    if (shift.includes('1근')) {
      shiftClass = 'shift-1근';
      displayShift = '1근';
    } else if (shift.includes('2근')) {
      shiftClass = 'shift-2근';
      displayShift = '2근';
    }
    
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.innerHTML = `
      <div class="cal-date">${dayInfo.date.substring(8)} (${dayInfo.day})</div>
      <div class="cal-shift ${shiftClass}">${displayShift}</div>
    `;
    groupCalendar.appendChild(dayEl);
  });
}

// Setup Date View
function setupDateView() {
  // Set min/max based on data
  if (scheduleData.schedule.length > 0) {
    const minDateStr = scheduleData.schedule[0].date.replace(/\./g, '-');
    const maxDateStr = scheduleData.schedule[scheduleData.schedule.length - 1].date.replace(/\./g, '-');
    
    dateInput.min = minDateStr;
    dateInput.max = maxDateStr;
    
    // Default to today if within range, otherwise min
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    if (todayStr >= minDateStr && todayStr <= maxDateStr) {
      dateInput.value = todayStr;
    } else {
      dateInput.value = minDateStr;
    }
    
    dateInput.addEventListener('change', (e) => {
      renderDateSchedule(e.target.value);
    });
    
    // Initial render
    renderDateSchedule(dateInput.value);
  }
}

function renderDateSchedule(dateString) {
  const targetDate = dateString.replace(/-/g, '.');
  const dayInfo = scheduleData.schedule.find(s => s.date === targetDate);
  
  if (!dayInfo) {
    selectedDateTitle.textContent = '해당 일자의 데이터가 없습니다.';
    dailyShiftsContainer.innerHTML = '';
    return;
  }
  
  selectedDateTitle.textContent = `${targetDate} (${dayInfo.day}) 근무 현황`;
  dailyShiftsContainer.innerHTML = '';
  
  const groups = Object.keys(scheduleData.groups);
  groups.forEach(group => {
    const shift = dayInfo.shifts[group];
    let shiftClass = 'shift-휴무';
    let displayShift = '휴무';
    
    if (shift.includes('1근')) {
      shiftClass = 'shift-1근';
      displayShift = '1근(08-20)';
    } else if (shift.includes('2근')) {
      shiftClass = 'shift-2근';
      displayShift = '2근(20-08)';
    }
    
    const card = document.createElement('div');
    card.className = 'shift-card';
    card.innerHTML = `
      <h3>${group}조</h3>
      <span class="name">${scheduleData.groups[group].name}</span>
      <div class="shift-type ${shiftClass}">${displayShift}</div>
    `;
    dailyShiftsContainer.appendChild(card);
  });
}

// Setup Overview View (3 Months)
function setupOverviewView() {
  const years = [...new Set(scheduleData.schedule.map(d => d.date.split('.')[0]))];
  years.forEach(year => {
    const opt = document.createElement('option');
    opt.value = year;
    opt.textContent = `${year}년`;
    overviewYear.appendChild(opt);
  });
  
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement('option');
    const mStr = m.toString().padStart(2, '0');
    opt.value = mStr;
    opt.textContent = `${m}월`;
    overviewMonth.appendChild(opt);
  }
  
  const today = new Date();
  const currentY = today.getFullYear().toString();
  const currentM = (today.getMonth() + 1).toString().padStart(2, '0');
  
  if (years.includes(currentY)) {
    overviewYear.value = currentY;
  } else {
    overviewYear.value = years[0];
  }
  overviewMonth.value = currentM;
  
  [overviewYear, overviewMonth].forEach(el => {
    el.addEventListener('change', renderOverview);
  });
  
  renderOverview();
}

function renderOverview() {
  overviewContainer.innerHTML = '';
  
  const startY = parseInt(overviewYear.value);
  const startM = parseInt(overviewMonth.value);
  
  // Render 3 consecutive months
  for (let i = 0; i < 3; i++) {
    let year = startY;
    let month = startM + i;
    
    if (month > 12) {
      year += 1;
      month -= 12;
    }
    
    const mStr = month.toString().padStart(2, '0');
    const prefix = `${year}.${mStr}`;
    const monthData = scheduleData.schedule.filter(d => d.date.startsWith(prefix));
    
    if (monthData.length > 0) {
      renderMonthTable(year, month, monthData);
    }
  }
}

function renderMonthTable(year, month, monthData) {
  const container = document.createElement('div');
  container.className = 'compact-table-container glass-panel';
  container.innerHTML = `<h3>${year}년 ${month}월 전 조 근무 현황</h3>`;
  
  const table = document.createElement('table');
  table.className = 'compact-table';
  
  // Header row (Dates)
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th class="group-col">조 / 일</th>';
  monthData.forEach(d => {
    const dayNum = d.date.split('.')[2];
    headerRow.innerHTML += `<th>${dayNum}<br><small>${d.day}</small></th>`;
  });
  table.appendChild(headerRow);
  
  // Group rows (A, B, C, D)
  const groups = Object.keys(scheduleData.groups);
  groups.forEach(group => {
    const row = document.createElement('tr');
    row.innerHTML = `<td class="group-col">${group}조<br><small>${scheduleData.groups[group].name}</small></td>`;
    
    monthData.forEach(d => {
      const shift = d.shifts[group];
      let cellClass = 'shift-off';
      let text = '휴';
      
      if (shift.includes('1근')) {
        cellClass = 'shift-1';
        text = '1';
      } else if (shift.includes('2근')) {
        cellClass = 'shift-2';
        text = '2';
      }
      
      row.innerHTML += `<td class="${cellClass}">${text}</td>`;
    });
    table.appendChild(row);
  });
  
  container.appendChild(table);
  overviewContainer.appendChild(container);
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
