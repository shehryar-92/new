const CHART_COLORS = [
  '#4f8ef7', '#f76c6c', '#6bcB77', '#f7b731', '#a66cff', '#3ecfcf',
];

function drawDonutChart(canvas, results) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.25;

  ctx.clearRect(0, 0, size, size);

  const total = results.reduce((sum, r) => sum + r.votes, 0);

  if (total === 0) {
    ctx.beginPath();
    ctx.arc(center, center, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#e6e6e6';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    return;
  }

  let startAngle = -Math.PI / 2;
  results.forEach((r, i) => {
    const sliceAngle = (r.votes / total) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, outerRadius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
    ctx.fill();

    startAngle = endAngle;
  });

  const computedHole = getComputedStyle(document.documentElement)
    .getPropertyValue('--surface')
    .trim();
  ctx.beginPath();
  ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = computedHole || '#ffffff';
  ctx.fill();
}

if (typeof window !== 'undefined') {
  window.ChartRenderer = { drawDonutChart, CHART_COLORS };
}
