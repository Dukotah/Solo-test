import React, { useState, useEffect } from 'react';
import { loadD, saveD, todayStr, getStreak, getLevel, getStats } from './utils.js';
import { TH, CP } from './constants.js';
import { CharArt, StatBar } from './components.js';

const e = React.createElement;

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    var cachedData = loadD();
    if (cachedData && cachedData.activityLog) {
      setUser(cachedData);
    } else {
      // Structure-locked baseline template to guarantee rendering parameters
      var defaultProfile = {
        gender: 'male',
        name: 'Operative',
        ncDate: todayStr(),
        xp: 0,
        activityLog: []
      };
      setUser(defaultProfile);
      saveD(defaultProfile);
    }
  }, []);

  if (!user) return e('div', { style: { color: '#94a3b8', padding: 24, textAlign: 'center' } }, 'Loading Engine Subsystems...');

  var currentGender = user.gender === 'female' ? 'female' : 'male';
  var t = TH[currentGender];
  var cp = CP[currentGender];
  
  var level = getLevel(user.xp);
  var charIndex = Math.min(level, (cp.chars ? cp.chars.length - 1 : 0));
  var currentCharacter = cp.chars ? cp.chars[charIndex] : { name: 'Unknown', color: '#4a9eff', glow: 'rgba(74,158,255,0.5)', desc: 'Processing...', emoji: '⚙️' };
  
  var activeActs = cp.acts || [];
  var stats = getStats(user.activityLog, activeActs);
  var currentStreak = getStreak(user.ncDate);
  var dynamicStreakLabel = cp.streakLabel || 'Days';

  return e('div', { style: { minHeight: '100vh', background: t.bg, color: t.text, fontFamily: t.font, padding: '24px 16px 80px' } },
    e('div', { style: { maxWidth: '480px', margin: '0 auto' } },
      // Top Level Identity Blocks
      e('header', { style: { textAlign: 'center', marginBottom: 32 } },
        e('h1', { style: { fontSize: 24, letterSpacing: '0.15em', color: t.text } }, 'SILO'),
        e('p', { style: { fontSize: 12, color: t.dim } }, cp.tagline)
      ),

      // Character Visual Frame Block
      e('div', { style: { background: t.bg2, border: `1px solid ${t.bd}`, borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 20 } },
        e('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 16 } },
          e(CharArt, { level: level, color: currentCharacter.color, glow: currentCharacter.glow, gender: currentGender })
        ),
        e('h2', { style: { fontSize: 20, fontWeight: 600, color: t.text } }, currentCharacter.name),
        e('p', { style: { fontSize: 12, color: t.dim, marginBottom: 12 } }, currentCharacter.desc),
        e('div', { style: { display: 'inline-block', background: t.accentDim, border: `1px solid ${t.accentBorder}`, padding: '4px 12px', borderRadius: 20 } },
          e('span', { style: { fontSize: 12, color: t.accent, fontWeight: 'bold' } }, `${currentStreak} ${dynamicStreakLabel}`)
        )
      ),

      // Defensive Character Attribute Progress Metrics
      e('div', { style: { background: t.bg2, border: `1px solid ${t.bd}`, borderRadius: 16, padding: 20, marginBottom: 20 } },
        e('h3', { style: { fontSize: 11, color: t.muted, letterSpacing: '0.1em', marginBottom: 16 } }, 'SYSTEM EVOLUTION'),
        e(StatBar, { label: 'BODY ATTRIBUTE', val: stats.body, max: 10, color: '#ef4444', t: t }),
        e(StatBar, { label: 'MIND UNIFORMITY', val: stats.mind, max: 10, color: t.accent, t: t }),
        e(StatBar, { label: 'SOUL RECOVERY', val: stats.soul, max: 10, color: t.accent2, t: t })
      ),

      // Interactive Control Framework (Venting Chamber/Shadow Inbox Terminal Input View)
      e('div', { style: { background: t.bg2, border: `1px solid ${t.bd}`, borderRadius: 16, padding: 20 } },
        e('h3', { style: { fontSize: 11, color: t.muted, letterSpacing: '0.1em', marginBottom: 12 } }, (cp.shadowLabel || 'INTERFACE')),
        e('textarea', {
          placeholder: cp.shadowPH || 'Terminal entry text area...',
          style: { width: '100%', height: '90px', background: t.bg3, border: `1px solid ${t.bd}`, borderRadius: 10, padding: 12, color: t.text, fontFamily: t.font, fontSize: 13, resize: 'none', marginBottom: 12 }
        }),
        e('button', {
          style: { width: '100%', padding: 12, background: t.accent, color: t.bg, fontSize: 12, fontWeight: 'bold', fontFamily: t.font, borderRadius: 10, textAlign: 'center', letterSpacing: '0.05em' }
        }, cp.analyzeBtn || 'EXECUTE')
      )
    )
  );
}
