// ─── CORE SYSTEM UTILITIES ───────────────────────────────────────────────────
export const SK = 'silo_v8';
export const XPL = 500;
export const MAXLVL = 4;
export const FJ = 3; 
export const FA = 2; 

export function pad(n) { return String(n).padStart(2, '0'); }
export function todayStr() { return new Date().toISOString().slice(0, 10); }

export function getStreak(d) { 
  if (!d) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)); 
}

export function getTimeParts(d) {
  if (!d) return { h: 0, m: 0, s: 0 };
  var s = Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  return { h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function getLevel(xp) { return Math.min(Math.floor(xp / XPL), MAXLVL); }
export function getLvlXP(xp) { return xp % XPL; }

export function getStats(log, acts) {
  var s = { body: 0, mind: 0, soul: 0 };
  (log || []).forEach(function(id) {
    var a = acts.find(function(x) { return x.id === id; });
    if (a) s[a.stat] = Math.min((s[a.stat] || 0) + 1, 999);
  });
  return s;
}

export function saveD(d) { try { localStorage.setItem(SK, JSON.stringify(d)); } catch(x) {} }
export function loadD() { try { var r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch(x) { return null; } }
export function clearD() { try { localStorage.removeItem(SK); } catch(x) {} }