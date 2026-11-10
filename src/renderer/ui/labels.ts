export function getOrbitalLabel(n: number, l: number, m: number): string {
  const lChars = ['s', 'p', 'd', 'f', 'g'];
  const lChar = lChars[l] || l.toString();
  let suffix = '';

  if (l === 1) {
    if (m === 0) suffix = 'z';
    else if (m === 1) suffix = 'x';
    else if (m === -1) suffix = 'y';
  } else if (l === 2) {
    if (m === 0) suffix = 'z²';
    else if (m === 1) suffix = 'xz';
    else if (m === -1) suffix = 'yz';
    else if (m === 2) suffix = 'x²-y²';
    else if (m === -2) suffix = 'xy';
  } else if (l === 3) {
    if (m === 0) suffix = 'z³';
    else suffix = `m=${m}`; // Fallback for complex f-orbitals
  } else if (l > 3 && m !== 0) {
    suffix = `m=${m}`;
  }

  if (suffix) return `${n}${lChar}_${suffix}`;
  if (l === 0) return `${n}${lChar}`;
  return `${n}${lChar}, m=${m}`;
}
