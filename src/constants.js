// ─── EMOTIONAL ENGINE CONSTANTS ──────────────────────────────────────────────
export const TH = {
  male: {
    accent: '#4a9eff', accentDim: '#0a1628', accentBorder: '#1e3a5f', accent2: '#22c55e', streak: '#f97316',
    bg: '#070a10', bg2: '#0a0e1a', bg3: '#0d1220', bd: '#151e30', bd2: '#1e3a5f', text: '#e2e8f0',
    muted: '#94a3b8', dim: '#475569', dimmer: '#2d3748', proCol: '#6d28d9', proBd: '#3b1a8a',
    proTxt: '#c4b5fd', proBg: '#0d0a2a', font: "'DM Mono',monospace"
  },
  female: {
    accent: '#e879a0', accentDim: '#1a0810', accentBorder: '#5a1830', accent2: '#34d399', streak: '#fb923c',
    bg: '#0a060e', bg2: '#110818', bg3: '#180d20', bd: '#221030', bd2: '#3d1545', text: '#f0e6f6',
    muted: '#c4a8d4', dim: '#7a5a8a', dimmer: '#3d2a4d', proCol: '#9333ea', proBd: '#4a1090',
    proTxt: '#d8b4fe', proBg: '#100820', font: "'DM Sans',sans-serif"
  }
};

export const CP = {
  male: {
    charLabel: 'YOUR OPERATIVE', streakLabel: 'Days Clean', tagline: 'Build yourself back.',
    shadowLabel: 'SHADOW INBOX', shadowPH: 'Write the message you want to send...',
    analyzeBtn: 'ANALYZE IMPACT', journalSave: 'LOG ENTRY', journalPH: "Write what's on your mind...",
    chamberTitle: 'VENTING CHAMBER', interceptTitle: 'I WANT TO REACH OUT',
    interceptSub: 'Emergency intercept — process before you act',
    interceptGreet: "Hold your position. I'm here.\n\nWhat triggered the urge right now?",
    interceptFollow: "Copy that. The pull is strongest when you're actually making progress.\n\nWhat outcome are you hoping for if you send it?",
    analysisText: "What will actually happen:\n\nSending this triggers a dopamine spike lasting about 8 minutes — then a 24-48 hour anxiety loop waiting for a reply that may never come.\n\nIf they don't reply: You spend two days rereading it.\n\nIf they do reply: The old dynamic reactivates. Same patterns. Same cost.\n\nYour streak is intact. Don't trade progress for 8 minutes of noise.",
    prompts: ['What did you accomplish today that had nothing to do with them?', 'Name one tactical advantage you\'ve gained this week.', 'What would you brief your past self on from 30 days ago?'],
    moods: ['💪', '📈', '😤', '😔', '🔥', '🌙'],
    greet: function(n) { return n + '.'; },
    onboard: [
      { icon: '⚡', title: 'You have a character.', body: 'Every action you take in real life evolves it.' },
      { icon: '🔒', title: 'Shadow Inbox protects you.', body: 'Write the message you\'re desperate to send. We analyse the impact.' }
    ],
    acts: [
      { id: 'run', label: 'Run / Sprint', xp: 75, icon: '🏃', stat: 'body' },
      { id: 'gym', label: 'Lift / Train', xp: 100, icon: '🏋️', stat: 'body' },
      { id: 'meditate', label: 'Meditation', xp: 55, icon: '🧘', stat: 'mind' },
      { id: 'journal', label: 'Journaled', xp: 40, icon: '📓', stat: 'mind' }
    ],
    chars: [
      { name: 'Ghost', color: '#475569', glow: 'rgba(71,85,105,0.5)', desc: 'Barely holding together.', emoji: '🌑' },
      { name: 'Operative', color: '#4a9eff', glow: 'rgba(74,158,255,0.55)', desc: 'Discipline is forming.', emoji: '⚡' }
    ]
  },
  female: {
    charLabel: 'YOUR INNER SELF', streakLabel: 'Days Free', tagline: 'Become who you were before them.',
    shadowLabel: 'UNSENT LETTER', shadowPH: "Write what you're holding back...",
    analyzeBtn: 'SHOW ME THE TRUTH', journalSave: 'SAVE ENTRY', journalPH: 'Write freely — this is just for you...',
    chamberTitle: 'SAFE SPACE', interceptTitle: 'I WANT TO REACH OUT',
    interceptSub: "Take a breath — let's process this together",
    interceptGreet: "Hey, I've got you. You don't have to do anything right now.\n\nTell me what happened that made you want to reach out.",
    interceptFollow: "That makes complete sense. Your nervous system is looking for something familiar.\n\nYou're not weak for feeling this. What do you actually need right now?",
    analysisText: "What will most likely happen:\n\nSending this gives you about 8 minutes of relief — then your phone becomes something you can't put down while you wait.\n\nIf they don't reply: The silence will feel louder than anything they could say.",
    prompts: ['What felt good today, even something tiny?', 'Name one thing you did just for yourself this week.', 'What would you say to your best friend going through this?'],
    moods: ['💛', '🌸', '😔', '💪', '✨', '🌙'],
    greet: function(n) { return n + '.'; },
    onboard: [
      { icon: '🌸', title: 'You have a character.', body: 'She evolves as you heal.' },
      { icon: '💌', title: 'Unsent Letter protects you.', body: 'Write what you want to say to them. We help you process it.' }
    ],
    acts: [
      { id: 'walk', label: 'Walk / Move', xp: 60, icon: '🚶', stat: 'body' },
      { id: 'workout', label: 'Workout', xp: 90, icon: '💪', stat: 'body' },
      { id: 'meditate', label: 'Meditation', xp: 55, icon: '🧘', stat: 'mind' },
      { id: 'journal', label: 'Journaled', xp: 45, icon: '📔', stat: 'mind' }
    ],
    chars: [
      { name: 'Ember', color: '#9d4f7c', glow: 'rgba(157,79,124,0.5)', desc: 'Still finding your footing.', emoji: '🌑' },
      { name: 'Blooming', color: '#e879a0', glow: 'rgba(232,121,160,0.55)', desc: 'Growing into yourself again.', emoji: '🌸' }
    ]
  }
};