/* ==========================================================================
   NAV — mobile menu toggle + auto-close on link click
   ========================================================================== */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});


/* ==========================================================================
   IMAGE GALLERY
   Replace the `src` values below with your own images when you're ready —
   everything else (filtering, lightbox, keyboard nav) keeps working as-is.
   ========================================================================== */
const galleryData = [
  { src: 'https://picsum.photos/seed/forest/600/450',   category: 'nature', caption: 'Forest trail, early morning' },
  { src: 'https://picsum.photos/seed/skyline/600/450',  category: 'city',   caption: 'City skyline at dusk' },
  { src: 'https://picsum.photos/seed/portrait1/600/450',category: 'people', caption: 'Portrait, natural light' },
  { src: 'https://picsum.photos/seed/mountains/600/450',category: 'nature', caption: 'Mountain ridge at sunrise' },
  { src: 'https://picsum.photos/seed/street/600/450',   category: 'city',   caption: 'Street corner, evening rain' },
  { src: 'https://picsum.photos/seed/portrait2/600/450',category: 'people', caption: 'Candid, midday light' },
  { src: 'https://picsum.photos/seed/river/600/450',    category: 'nature', caption: 'River bend, autumn' },
  { src: 'https://picsum.photos/seed/bridge/600/450',   category: 'city',   caption: 'Bridge at blue hour' },
];

const galleryGrid = document.getElementById('galleryGrid');
const galleryFilters = document.getElementById('galleryFilters');

// Build the grid once from the data above
function renderGallery(){
  galleryGrid.innerHTML = galleryData.map((item, index) => `
    <div class="gallery-item" data-category="${item.category}" data-index="${index}">
      <img src="${item.src}" alt="${item.caption}" loading="lazy">
      <span class="gallery-item-label">${item.caption}</span>
    </div>
  `).join('');
}
renderGallery();

// Filtering: show/hide items by category instead of re-rendering the DOM
galleryFilters.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  galleryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');

  const filter = btn.dataset.filter;
  galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
    const matches = filter === 'all' || item.dataset.category === filter;
    item.classList.toggle('is-hidden', !matches);
  });
});


/* ---- Lightbox ---- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentIndex = 0; // index into galleryData of the image currently shown

function openLightbox(index){
  currentIndex = index;
  updateLightboxImage();
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeLightbox(){
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function updateLightboxImage(){
  const item = galleryData[currentIndex];
  lightboxImg.src = item.src;
  lightboxImg.alt = item.caption;
  lightboxCaption.textContent = item.caption;
}

// Step forward/back, wrapping around at the ends
function showNext(){ currentIndex = (currentIndex + 1) % galleryData.length; updateLightboxImage(); }
function showPrev(){ currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length; updateLightboxImage(); }

galleryGrid.addEventListener('click', (e) => {
  const item = e.target.closest('.gallery-item');
  if (!item) return;
  openLightbox(Number(item.dataset.index));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', showNext);
lightboxPrev.addEventListener('click', showPrev);

// Click on the dark overlay (outside the image) also closes it
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard: Escape closes, arrow keys step through images
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});


/* ==========================================================================
   CALCULATOR
   State machine: we track the current entry, the pending operator, and the
   previous value, and only evaluate when "=" (or a new operator) is pressed.
   ========================================================================== */
const calcExpression = document.getElementById('calcExpression');
const calcResult = document.getElementById('calcResult');
const calculator = document.getElementById('calculator');

let currentValue = '0';   // what's shown on the main line, as a string
let previousValue = null; // the operand stored before an operator was pressed
let pendingOperator = null;
let justEvaluated = false; // true right after "=" — next digit starts fresh
let justSelectedOperator = false;

function updateScreen(){
  calcResult.textContent = currentValue;
  calcExpression.textContent = previousValue !== null && pendingOperator
    ? `${previousValue} ${pendingOperator}`
    : '\u00A0'; // non-breaking space keeps the line height stable when empty
}

function inputDigit(digit){
  if (justEvaluated || justSelectedOperator){
    currentValue = digit;
    justEvaluated = false;
    justSelectedOperator = false;
  } else {
    currentValue = currentValue === '0' ? digit : currentValue + digit;
  }
  updateScreen();
}

function inputDecimal(){
  if (justEvaluated || justSelectedOperator){
    currentValue = '0.';
    justEvaluated = false;
    justSelectedOperator = false;
  } else if (!currentValue.includes('.')){
    currentValue += '.';
  }
  updateScreen();
}

function toggleSign(){
  if (currentValue === '0') return;
  currentValue = currentValue.startsWith('-') ? currentValue.slice(1) : '-' + currentValue;
  updateScreen();
}

function inputPercent(){
  currentValue = String(parseFloat(currentValue) / 100);
  updateScreen();
}

function compute(a, b, operator){
  switch (operator){
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b; // null flags divide-by-zero
    default:  return b;
  }
}

// Round off floating-point noise (e.g. 0.1 + 0.2) without truncating real decimals
function cleanNumber(n){
  return Math.round(n * 1e10) / 1e10;
}

function handleOperator(operator){
  const inputValue = parseFloat(currentValue);

  if (pendingOperator && previousValue !== null && !justEvaluated && !justSelectedOperator){
    const result = compute(previousValue, inputValue, pendingOperator);
    if (result === null){
      showError();
      return;
    }
    previousValue = cleanNumber(result);
    currentValue = String(previousValue);
  } else if (!justSelectedOperator) {
    previousValue = inputValue;
  }

  pendingOperator = operator;
  justEvaluated = false;
  justSelectedOperator = true;
  updateScreen();
}

function handleEquals(){
  if (pendingOperator === null || previousValue === null) return;
  const inputValue = parseFloat(currentValue);
  const result = compute(previousValue, inputValue, pendingOperator);

  if (result === null){
    showError();
    return;
  }

  currentValue = String(cleanNumber(result));
  previousValue = null;
  pendingOperator = null;
  justEvaluated = true;
  justSelectedOperator = false;
  updateScreen();
}

function showError(){
  currentValue = 'Error';
  previousValue = null;
  pendingOperator = null;
  justEvaluated = true;
  justSelectedOperator = false;
  updateScreen();
}

function clearAll(){
  currentValue = '0';
  previousValue = null;
  pendingOperator = null;
  justEvaluated = false;
  justSelectedOperator = false;
  updateScreen();
}

// Wire up the on-screen buttons
calculator.addEventListener('click', (e) => {
  const key = e.target.closest('.calc-key');
  if (!key) return;

  const { action, value } = key.dataset;
  if (action === 'digit')      inputDigit(value);
  else if (action === 'decimal')  inputDecimal();
  else if (action === 'operator') handleOperator(value);
  else if (action === 'equals')   handleEquals();
  else if (action === 'clear')    clearAll();
  else if (action === 'sign')     toggleSign();
  else if (action === 'percent')  inputPercent();

  // brief press animation, matches what a keyboard press triggers below
  key.classList.add('is-pressed');
  setTimeout(() => key.classList.remove('is-pressed'), 100);
});

// Keyboard support — only act while the calculator is visible on screen,
// so typing in the contact form (further down the page) isn't hijacked
function calculatorIsInView(){
  const rect = document.getElementById('calculator-demo').getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

document.addEventListener('keydown', (e) => {
  if (!calculatorIsInView()) return;
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

  const keyMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  if (/^[0-9]$/.test(e.key)) inputDigit(e.key);
  else if (e.key === '.') inputDecimal();
  else if (keyMap[e.key]) handleOperator(keyMap[e.key]);
  else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); handleEquals(); }
  else if (e.key === 'Backspace'){
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
    updateScreen();
  }
  else if (e.key === 'Escape') clearAll();
  else return;

  // flash the matching button, if there is one, for visual feedback
  const matchBtn = calculator.querySelector(`[data-value="${keyMap[e.key] || e.key}"]`);
  if (matchBtn){
    matchBtn.classList.add('is-pressed');
    setTimeout(() => matchBtn.classList.remove('is-pressed'), 100);
  }
});

updateScreen();


/* ==========================================================================
   CONTACT FORM
   No backend here — this just validates and gives the user feedback.
   Swap the body of this handler for a real fetch() call to your form
   endpoint (Formspree, Netlify Forms, your own API, etc.) when ready.
   ========================================================================== */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!contactForm.checkValidity()){
    formStatus.textContent = 'Please fill in every field with a valid email.';
    formStatus.style.color = '#E8623D';
    return;
  }

  formStatus.textContent = 'Message sent — thanks for reaching out! (Demo only — connect a form service to go live.)';
  formStatus.style.color = '#1FA7A1';
  contactForm.reset();
});


/* ==========================================================================
   THDC ONLINE ATTENDANCE REGISTER — browser-only interactive prototype
   ========================================================================== */
const attendanceApp = document.getElementById('attendanceApp');

if (attendanceApp){
  const students = [
    { roll: 'THDC-001', name: 'Aarav Sharma' },
    { roll: 'THDC-002', name: 'Ananya Rawat' },
    { roll: 'THDC-003', name: 'Devansh Negi' },
    { roll: 'THDC-004', name: 'Ishita Bisht' },
    { roll: 'THDC-005', name: 'Karan Singh' },
    { roll: 'THDC-006', name: 'Meera Joshi' },
    { roll: 'THDC-007', name: 'Rohan Thapliyal' },
    { roll: 'THDC-008', name: 'Sanya Kandwal' },
  ];
  const dateInput = document.getElementById('attendanceDate');
  const searchInput = document.getElementById('attendanceSearch');
  const rows = document.getElementById('attendanceRows');
  const statusMessage = document.getElementById('attendanceStatus');
  const localDate = new Date();
  const today = [localDate.getFullYear(), String(localDate.getMonth() + 1).padStart(2, '0'), String(localDate.getDate()).padStart(2, '0')].join('-');
  dateInput.value = today;

  function attendanceForDate(){
    try {
      return JSON.parse(localStorage.getItem(`thdc-attendance-${dateInput.value}`) || '{}');
    } catch {
      return {};
    }
  }

  function renderAttendance(){
    const attendance = attendanceForDate();
    const query = searchInput.value.trim().toLowerCase();
    const present = Object.values(attendance).filter(value => value === 'present').length;
    const absent = Object.values(attendance).filter(value => value === 'absent').length;
    document.getElementById('attendanceTotal').textContent = String(students.length);
    document.getElementById('attendancePresent').textContent = String(present);
    document.getElementById('attendanceAbsent').textContent = String(absent);
    document.getElementById('attendanceUnmarked').textContent = String(students.length - present - absent);

    const visibleStudents = students.filter(student => `${student.roll} ${student.name}`.toLowerCase().includes(query));
    rows.innerHTML = visibleStudents.length ? visibleStudents.map(student => {
      const marked = attendance[student.roll];
      const label = marked ? marked[0].toUpperCase() + marked.slice(1) : 'Not marked';
      return `<tr>
        <td>${student.roll}</td>
        <td>${student.name}</td>
        <td>${label}</td>
        <td><div class="attendance-actions">
          <button type="button" class="attendance-mark ${marked === 'present' ? 'is-selected' : ''}" data-roll="${student.roll}" data-status="present" aria-pressed="${marked === 'present'}">Present</button>
          <button type="button" class="attendance-mark ${marked === 'absent' ? 'is-selected' : ''}" data-roll="${student.roll}" data-status="absent" aria-pressed="${marked === 'absent'}">Absent</button>
        </div></td>
      </tr>`;
    }).join('') : '<tr><td colspan="4">No students match that search.</td></tr>';
  }

  dateInput.addEventListener('change', () => {
    statusMessage.textContent = `Showing attendance for ${dateInput.value}. Changes are saved in this browser.`;
    renderAttendance();
  });
  searchInput.addEventListener('input', renderAttendance);
  rows.addEventListener('click', event => {
    const button = event.target.closest('.attendance-mark');
    if (!button) return;
    const attendance = attendanceForDate();
    attendance[button.dataset.roll] = button.dataset.status;
    try {
      localStorage.setItem(`thdc-attendance-${dateInput.value}`, JSON.stringify(attendance));
      statusMessage.textContent = `${button.dataset.roll} marked ${button.dataset.status} for ${dateInput.value}.`;
    } catch {
      statusMessage.textContent = 'Could not save attendance in this browser. Check local storage settings.';
    }
    renderAttendance();
  });

  renderAttendance();
}
