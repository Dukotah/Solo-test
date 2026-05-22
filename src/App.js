import React, { useState, useEffect } from 'react';
import { loadD, saveD, todayStr, getStreak, getLevel, getStats } from './utils.js';
import { TH, CP } from './constants.js';
import { CharArt, StatBar } from './components.js';

const e = React.createElement;

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cachedData = loadD();
    if (cachedData) {
      setUser(cachedData);
    } else {
      setUser({
        gender: 'male',
        name: 'Operative',
        ncDate: todayStr(),
        xp: 1200,
        activityLog: ['run', 'meditate']
      });
    }
  }, []);

  if (!user) return e('div', { style: { color: '#94a3b8', padding: 24, textAlign: 'center' } }, 'Loading Silo Protocol...');

  const t = TH[user.gender];
  const cp = CP[user.gender];
  const level = getLevel(user.xp);
  const currentCharacter = cp.chars[Math.min(level, cp.chars.length - 1)];
  const stats = getStats(user.activityLog, cp.acts);

  return e('div', { style: { minHeight: '100vh', background: t.bg, color: t.text, fontFamily: t.font, padding: '24px 16px' } },
    e('div', { style: { maxWidth: '480px', margin: '0 auto' } },
      e('header', { style: { textAlign: 'center', marginBottom: 32 } },
        e('h1', { style: { fontSize: 24, letterSpacing: '0.15em', color: t.text } }, 'SILO'),
        e('p', { style: { fontSize: 12, color: t.dim } }, cp.tagline)
      ),

      e('div', { style: { background: t.bg2, border: `1px solid \${t.bd}`, borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 20 } },
        e('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 16 } },
          e(CharArt, { level: level, color: currentCharacter.color, glow: currentCharacter.glow, gender: user.gender })
        ),
        e('h2', { style: { fontSize: 20, fontWeight: 600 } }, currentCharacter.name),
        e('p', { style: { fontSize: 12, color: t.dim, marginBottom: 12 } }, currentCharacter.desc),
        e('div', { style: { display: 'inline-block', background: t.accentDim, border: `1px solid \${t.accentBorder}`, padding: '4px 12px', borderRadius: 20 } },
          e('span', { style: { fontSize: 12, color: t.accent, fontWeight: 'bold' } }, `\${getStreak(user.ncDate)} \${cp.streakLabel}`)
        )
      ),

      e('div', { style: { background: t.bg2, border: `1px solid \${t.bd}`, borderRadius: 16, padding: 20, marginBottom: 20 } },
        e('h3', { style: { fontSize: 12, color: t.muted, letterSpacing: '0.1em', marginBottom: 16 } }, 'SYSTEM EVOLUTION'),
        e(StatBar, { label: 'BODY ATTRIBUTE', val: stats.body, max: 10, color: '#ef4444', t: t }),
        e(StatBar, { label: 'MIND UNIFORMITY', val: stats.mind, max: 10, color: t.accent, t: t }),
        e(StatBar, { label: 'SOUL RECOVERY', val: stats.soul, max: 10, color: t.accent2, t: t })
      )
    )
  );
}