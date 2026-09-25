const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const overlay = document.getElementById('resultOverlay');
const resultContent = document.getElementById('resultContent');
const floatingArea = document.getElementById('floatingArea');
const retryButton = document.getElementById('retryButton');
const closeOverlay = document.getElementById('closeOverlay');

const wheelItems = [
  { type: 'fail',  label: '꽝',             color: '#ff6678' },
  { type: 'pig',   label: '돼지저금통',    color: '#f58fc0' },
  { type: 'fail',  label: '꽝',             color: '#ff6678' },
  { type: 'fail',  label: '꽝',             color: '#ff7d8c' },
  { type: 'katsu', label: '오양민 돈까스', color: '#ffd15a' },
  { type: 'fail',  label: '꽝',             color: '#ff6678' },
  { type: 'pig',   label: '돼지저금통',    color: '#f58fc0' },
  { type: 'fail',  label: '꽝',             color: '#ff6678' },
  { type: 'pig',   label: '돼지저금통',    color: '#f3a2ca' },
  { type: 'fail',  label: '꽝',             color: '#ff7d8c' },
  { type: 'katsu', label: '오양민 돈까스', color: '#ffd15a' },
  { type: 'fail',  label: '꽝',             color: '#ff6678' },
];

let angle = 0;
let angularVelocity = 0;
let isSpinning = false;
let isStopping = false;
let animationFrame = null;

function resizeCanvasForDpr() {
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(window.innerWidth * 0.94, 660);

  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  canvas.width = Math.floor(size * dpr);
  canvas.height = Math.floor(size * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawWheel();
}

function drawWheel() {
  const size = canvas.getBoundingClientRect().width;
  const center = size / 2;
  const radius = size / 2 - 8;
  const innerRadius = radius * 0.33;
  const itemAngle = Math.PI * 2 / wheelItems.length;
  const isMobile = size < 520;

  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  for (let i = 0; i < wheelItems.length; i++) {
    const start = angle + i * itemAngle - Math.PI / 2;
    const end = start + itemAngle;
    const item = wheelItems[i];

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius - 12, start, end);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = isMobile ? 3 : 4;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + itemAngle / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#20242d';

    const mainFont = isMobile ? Math.max(11, size * .027) : Math.max(16, size * .034);
    const subFont = isMobile ? Math.max(9, size * .021) : Math.max(12, size * .024);
    const textRadius = radius * (isMobile ? .755 : .79);
    const lineGap = isMobile ? 16 : 22;

    ctx.font = `700 ${mainFont}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;

    if (item.type === 'katsu') {
      ctx.fillText('오양민', textRadius, -lineGap / 2);
      ctx.font = `600 ${subFont}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
      ctx.fillText('돈까스', textRadius, lineGap / 2);
    } else if (item.type === 'pig') {
      ctx.fillText('돼지', textRadius, -lineGap / 2);
      ctx.font = `600 ${subFont}px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
      ctx.fillText('저금통', textRadius, lineGap / 2);
    } else {
      ctx.fillText('꽝', textRadius, 0);
    }

    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(center, center, radius - 8, 0, Math.PI * 2);
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#fff';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#dbe7ff';
  ctx.stroke();
}

function animate() {
  if (!isSpinning) return;

  angle += angularVelocity;

  if (isStopping) {
    angularVelocity *= 0.985;

    if (angularVelocity < 0.0034) {
      angularVelocity = 0;
      isSpinning = false;
      isStopping = false;
      animationFrame = null;
      drawWheel();
      finishSpin();
      return;
    }
  }

  drawWheel();
  animationFrame = requestAnimationFrame(animate);
}

function startSpin() {
  if (isSpinning) return;

  closeOverlayNow();
  isSpinning = true;
  isStopping = false;
  angularVelocity = 0.34 + Math.random() * 0.08;

  spinButton.textContent = '멈추기';
  spinButton.disabled = false;

  animationFrame = requestAnimationFrame(animate);
}

function requestStop() {
  if (!isSpinning || isStopping) return;

  isStopping = true;
  spinButton.textContent = '멈추는 중';
  spinButton.disabled = true;
}

function getWinningItem() {
  const itemAngle = Math.PI * 2 / wheelItems.length;
  const normalized = ((-angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const index = Math.floor(normalized / itemAngle) % wheelItems.length;
  return wheelItems[index];
}

function finishSpin() {
  const winner = getWinningItem();

  spinButton.textContent = '돌리기';
  spinButton.disabled = false;

  showResult(winner);
}

function clearFloating() {
  floatingArea.innerHTML = '';
}

function spawnFloatingEmojis(chars, count = 16) {
  clearFloating();

  for (let i = 0; i < count; i++) {
    const node = document.createElement('div');
    node.className = 'float-emoji';
    node.textContent = chars[Math.floor(Math.random() * chars.length)];

    node.style.left = `${Math.random() * 88 + 2}%`;
    node.style.setProperty('--duration', `${3.6 + Math.random() * 3.4}s`);
    node.style.setProperty('--delay', `${-Math.random() * 6}s`);
    node.style.setProperty('--move-x', `${Math.round(Math.random() * 150 - 75)}px`);
    node.style.setProperty('--rotate', `${Math.round(Math.random() * 100 - 50)}deg`);

    floatingArea.appendChild(node);
  }
}

function showResult(item) {
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');

  resultContent.innerHTML = '';
  clearFloating();

  if (item.type === 'katsu') {
    resultContent.innerHTML = `
      <img class="result-image" src="images/oyang-donkatsu.png" alt="오양민 돈까스">
    `;
    spawnFloatingEmojis(['😭', '😢', '🥲', '😞', '💔'], 18);
  } else if (item.type === 'pig') {
    resultContent.innerHTML = `
      <img class="result-image" src="images/piggybank.png" alt="돼지저금통">
    `;
    spawnFloatingEmojis(['🐷', '🐽', '🐖'], 18);
  } else {
    resultContent.innerHTML = `
      <div class="fail-text">꽝</div>
    `;
    spawnFloatingEmojis(['😛', '😜', '😝'], 18);
  }
}

function closeOverlayNow() {
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  clearFloating();
}

spinButton.addEventListener('click', () => {
  if (!isSpinning) {
    startSpin();
  } else if (!isStopping) {
    requestStop();
  }
});

retryButton.addEventListener('click', closeOverlayNow);
closeOverlay.addEventListener('click', closeOverlayNow);

overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closeOverlayNow();
});

window.addEventListener('resize', resizeCanvasForDpr);
resizeCanvasForDpr();
