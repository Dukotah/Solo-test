import React from 'react';
import { MAXLVL } from './utils.js';

const e = React.createElement;

export function CharArt({ level, color, glow, gender }) {
  const iF = gender === 'female';
  const op = 0.28 + (level / MAXLVL) * 0.72;
  const rings = [];

  for (let ri = 0; ri <= level; ri++) {
    rings.push(e('circle', {
      key: 'r' + ri, cx: '100', cy: '125', r: String(52 + ri * 17), fill: 'none',
      stroke: color, strokeWidth: '0.8', opacity: Math.max(0.03, 0.1 - ri * 0.02)
    }));
  }

  rings.push(e('ellipse', { key: 'sh', cx: '100', cy: '200', rx: String(28 + level * 9), ry: '5', fill: color, opacity: 0.08 }));
  rings.push(e('ellipse', { key: 'hd', cx: '100', cy: iF ? '68' : '65', rx: '17', ry: '19', fill: color, opacity: op }));

  if (level >= 3) {
    rings.push(
      e('g', { key: 'evolution-crown' },
        e('polygon', { points: '100,20 108,35 92,35', fill: color, opacity: '0.8' }),
        e('circle', { cx: '100', cy: '15', r: '2.5', fill: color })
      )
    );
  }

  return e('svg', {
    viewBox: '0 0 200 230',
    style: { width: '100%', maxWidth: 180, filter: `drop-shadow(0 0 \${14 + level * 9}px \${glow})`, transition: 'filter 1s ease' }
  }, rings);
}

export function StatBar({ label, val, max, color, t }) {
  const pct = max > 0 ? Math.min((val / max) * 100, 100) : 0;
  return e('div', { style: { flex: 1, fontFamily: t.font, marginBottom: 12 } },
    e('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 } },
      e('span', { style: { color: t.dim } }, label),
      e('span', { style: { color: color, fontWeight: 'bold' } }, String(val))
    ),
    e('div', { style: { height: 4, background: t.bd, borderRadius: 2, overflow: 'hidden' } },
      e('div', { style: { height: '100%', width: pct + '%', background: color, transition: 'width 0.5s ease' } })
    )
  );
}