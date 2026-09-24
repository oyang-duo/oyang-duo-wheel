const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const overlay = document.getElementById('resultOverlay');
const resultContent = document.getElementById('resultContent');
const floatingArea = document.getElementById('floatingArea');
const retryButton = document.getElementById('retryButton');
const closeOverlay = document.getElementById('closeOverlay');

const wheelItems = [
  { type: 'fail',  label: '꽝',             color: '#ff6a7d' },
  { type: 'pig',   label: '돼지저금통',    color: '#ffb3d5' },
  { type: 'fail',  label: '꽝',             color: '#ff6a7d' },
  { type: 'fail',  label: '꽝',             color: '#ff8392' },
  { type: 'katsu', label: '오양민 돈까스', color: '#ffd35a' },
  { type: 'fail',  label: '꽝',             color: '#ff6a7d' },
  { type: 'pig',   label: '돼지저금통',    color: '#ff9ac9' },
  { type: 'fail',  label: '꽝',             color: '#ff6a7d' },
  { type: 'pig',   label: '돼지저금통',    color: '#ffb3d5' },
  { type: 'fail',  label: '꽝',             color: '#ff8392' },
  { type: 'katsu', label: '오양민 돈까스', color: '#ffe07a' },
  { type: 'fail',  label: '꽝',             color: '#ff6a7d' },
];

let angle = 0;
let angularVelocity = 0;
let isSpinning = false;
let isStopping = false;
let animationFrame = null;

function resizeCanvasForDpr() {
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(window.innerWidth * 0.88, 760);
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
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
  const itemAngle = (Math.PI * 2) / wheelItems.length;

  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
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

    ctx.strokeStyle = 'rgba(255,255,255,.92)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + itemAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#1f2430';
    ctx.font = `900 ${Math.max(16, size * 0.035)}px system-ui, sans-serif`;

    const textRadius = radius * 0.79;
    let label = item.label;
    if (label === '오양민 돈까스') label = '오양민';
    ctx.fillText(label, textRadius, 8);

    if (item.label === '오양민 돈까스') {
      ctx.font = `700 ${Math.max(12, size * 0.024)}px system-ui, sans-serif`;
      ctx.fillText('돈까스', textRadius, 32);
    } else if (item.label === '돼지저금통') {
      ctx.font = `700 ${Math.max(12, size * 0.024)}px system-ui, sans-serif`;
      ctx.fillText('저금통', textRadius, 32);
    }

    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(center, center, radius - 8, 0, Math.PI * 2);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#d9e7ff';
  ctx.stroke();
}

function animate() {
  if (isSpinning) {
    angle += angularVelocity;

    if (isStopping) {
      angularVelocity *= 0.985;
      if (angularVelocity < 0.0034) {
        angularVelocity = 0;
        isSpinning = false;
        isStopping = false;
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
        drawWheel();
        finishSpin();
        return;
      }
    }

    drawWheel();
    animationFrame = requestAnimationFrame(animate);
  }
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
  const itemAngle = (Math.PI * 2) / wheelItems.length;

  // drawWheel()에서 0번 칸의 시작점을 'angle - 90°'로 그리므로,
  // 화면 위쪽(12시 방향) 포인터가 가리키는 칸은 -angle만 보정하면 된다.
  // 이전 식은 -90°를 한 번 더 빼서 결과가 3칸(12칸 기준) 어긋났다.
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

function spawnFloatingEmojis(chars, count) {
  clearFloating();
  for (let i = 0; i < count; i++) {
    const node = document.createElement('div');
    node.className = 'float-emoji';
    node.textContent = chars[Math.floor(Math.random() * chars.length)];
    const left = Math.random() * 88 + 2;
    const duration = 3.2 + Math.random() * 2.6;
    const delay = Math.random() * 0.9;
    const xMove = `${(Math.random() * 160 - 80).toFixed(0)}px`;
    const rot = `${(Math.random() * 120 - 60).toFixed(0)}deg`;
    node.style.left = `${left}%`;
    node.style.animationDuration = `${duration}s`;
    node.style.animationDelay = `${delay}s`;
    node.style.setProperty('--x-move', xMove);
    node.style.setProperty('--rot', rot);
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
      <h2 class="result-title">오양민 돈까스</h2>
      <img class="result-image" src="images/oyang-donkatsu.png" alt="오양민 돈까스">
    `;
  } else if (item.type === 'pig') {
    resultContent.innerHTML = `
      <h2 class="result-title">돼지저금통</h2>
      <img class="result-image" src="images/piggybank.png" alt="돼지저금통">
      <p class="sub-text">축하합니다 🐷</p>
    `;
    spawnFloatingEmojis(['🐷', '🐽', '💖'], 18);
  } else {
    resultContent.innerHTML = `
      <div class="fail-text">꽝</div>
      <p class="sub-text">다음 기회를 노려보세요 😛</p>
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
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeOverlayNow();
});

window.addEventListener('resize', resizeCanvasForDpr);
resizeCanvasForDpr();
