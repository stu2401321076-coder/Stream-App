const PALETTES = [
  ['#7c2d12', '#451a03'],
  ['#831843', '#4c0519'],
  ['#1e3a8a', '#082f49'],
  ['#14532d', '#052e16'],
  ['#581c87', '#2e1065'],
  ['#9a0610', '#450a0a'],
  ['#155e75', '#083344'],
  ['#713f12', '#422006'],
  ['#365314', '#1a2e05'],
  ['#7e22ce', '#3b0764'],
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function gradientFor(seed) {
  const idx = hashString(String(seed || 'x')) % PALETTES.length;
  const [a, b] = PALETTES[idx];
  const angle = (hashString(String(seed || 'x') + 'a') % 180) - 90;
  return `linear-gradient(${angle}deg, ${a} 0%, ${b} 100%)`;
}
