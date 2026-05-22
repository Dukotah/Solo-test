import React from 'react';

var e = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;

// ─── SAFE CONDITIONAL RENDER ─────────────────────────────────────────────────
function cond(test, el) { return test ? el : null; }

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
var SK = 'silo_v8';
var XPL = 500;
var MAXLVL = 4;
var FJ = 3; // free journal limit
var FA = 2; // free analyze limit

function pad(n) { return String(n).padStart(2,'0'); }
function todayStr() { return new Date().toISOString().slice(0,10); }
function getStreak(d) { return Math.max(0,Math.floor((Date.now()-new Date(d).getTime())/86400000)); }
function getTimeParts(d) {
  var s=Math.max(0,Math.floor((Date.now()-new Date(d).getTime())/1000));
  return {h:Math.floor((s%86400)/3600),m:Math.floor((s%3600)/60),s:s%60};
}
function getLevel(xp) { return Math.min(Math.floor(xp/XPL),MAXLVL); }
function getLvlXP(xp) { return xp%XPL; }
function getStats(log,acts) {
  var s={body:0,mind:0,soul:0};
  (log||[]).forEach(function(id){
    var a=acts.find(function(x){return x.id===id;});
    if(a)s[a.stat]=Math.min((s[a.stat]||0)+1,999);
  });
  return s;
}
function saveD(d) { try{localStorage.setItem(SK,JSON.stringify(d));}catch(x){} }
function loadD() { try{var r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch(x){return null;} }
function clearD() { try{localStorage.removeItem(SK);}catch(x){} }

// ─── THEME ────────────────────────────────────────────────────────────────────
var TH={
  male:{
    accent:'#4a9eff',accentDim:'#0a1628',accentBorder:'#1e3a5f',
    accent2:'#22c55e',streak:'#f97316',
    bg:'#070a10',bg2:'#0a0e1a',bg3:'#0d1220',
    bd:'#151e30',bd2:'#1e3a5f',
    text:'#e2e8f0',muted:'#94a3b8',dim:'#475569',dimmer:'#2d3748',
    proCol:'#6d28d9',proBd:'#3b1a8a',proTxt:'#c4b5fd',proBg:'#0d0a2a',
    font:"'DM Mono',monospace",
  },
  female:{
    accent:'#e879a0',accentDim:'#1a0810',accentBorder:'#5a1830',
    accent2:'#34d399',streak:'#fb923c',
    bg:'#0a060e',bg2:'#110818',bg3:'#180d20',
    bd:'#221030',bd2:'#3d1545',
    text:'#f0e6f6',muted:'#c4a8d4',dim:'#7a5a8a',dimmer:'#3d2a4d',
    proCol:'#9333ea',proBd:'#4a1090',proTxt:'#d8b4fe',proBg:'#100820',
    font:"'DM Sans',sans-serif",
  }
};

// ─── COPY ─────────────────────────────────────────────────────────────────────
var CP={
  male:{
    charLabel:'YOUR OPERATIVE',streakLabel:'Days Clean',tagline:'Build yourself back.',
    shadowLabel:'SHADOW INBOX',shadowPH:'Write the message you want to send...',
    analyzeBtn:'ANALYZE IMPACT',journalSave:'LOG ENTRY',journalPH:"Write what's on your mind...",
    chamberTitle:'VENTING CHAMBER',interceptTitle:'I WANT TO REACH OUT',
    interceptSub:'Emergency intercept — process before you act',
    interceptGreet:'Hold your position. I\'m here.\n\nWhat triggered the urge right now?',
    interceptFollow:'Copy that. The pull is strongest when you\'re actually making progress.\n\nWhat outcome are you hoping for if you send it?',
    analysisText:'What will actually happen:\n\nSending this triggers a dopamine spike lasting about 8 minutes — then a 24-48 hour anxiety loop waiting for a reply that may never come.\n\nIf they don\'t reply: You spend two days rereading it.\n\nIf they do reply: The old dynamic reactivates. Same patterns. Same cost.\n\nYour streak is intact. Don\'t trade progress for 8 minutes of noise.',
    prompts:['What did you accomplish today that had nothing to do with them?','Name one tactical advantage you\'ve gained this week.','What would you brief your past self on from 30 days ago?','What\'s beneath the urge — what do you actually need?','Describe the version of you operating at full capacity.','What\'s one thing you\'ve reclaimed for yourself?','Where did you show up for yourself today?'],
    moods:['💪','📈','😤','😔','🔥','🌙'],
    greet:function(n){return n+'.';},
    onboard:[
      {icon:'⚡',title:'You have a character.',body:'Every action you take in real life evolves it. No-contact days, journal entries, training — they all stack.'},
      {icon:'🔒',title:'Shadow Inbox protects you.',body:'Write the message you\'re desperate to send. We analyse the impact — you never have to send it.'},
      {icon:'📈',title:'Progress is the product.',body:'Body, Mind, Soul — three stats that reflect your real recovery. Watch them grow as you rebuild.'},
    ],
    acts:[
      {id:'run',label:'Run / Sprint',xp:75,icon:'🏃',stat:'body'},
      {id:'gym',label:'Lift / Train',xp:100,icon:'🏋️',stat:'body'},
      {id:'cold',label:'Cold Shower',xp:60,icon:'🚿',stat:'body'},
      {id:'sleep',label:'8hrs Sleep',xp:45,icon:'🌙',stat:'body'},
      {id:'meditate',label:'Meditation',xp:55,icon:'🧘',stat:'mind'},
      {id:'journal',label:'Journaled',xp:40,icon:'📓',stat:'mind'},
      {id:'noscroll',label:'No Doomscroll',xp:35,icon:'📵',stat:'mind'},
      {id:'read',label:'Read / Learn',xp:40,icon:'📚',stat:'mind'},
      {id:'social',label:'Saw the Boys',xp:80,icon:'🤝',stat:'soul'},
      {id:'outside',label:'Time Outside',xp:50,icon:'🌲',stat:'soul'},
    ],
    milestones:[
      {days:1,xp:100,label:'First Hold',desc:"24 hours. You didn't break.",icon:'🔒'},
      {days:3,xp:200,label:'72-Hour Lock',desc:'Neural rewiring has begun.',icon:'🧠'},
      {days:7,xp:500,label:'One Week Op',desc:'The fog is clearing.',icon:'🎯',pro:true},
      {days:14,xp:750,label:'Fortnight Strong',desc:'Dopamine baseline restoring.',icon:'⚡',pro:true},
      {days:30,xp:1500,label:'30-Day Protocol',desc:'Full operational recovery.',icon:'🛡️',pro:true},
      {days:60,xp:3000,label:'Signal Silence',desc:'You are the signal now.',icon:'👁️',pro:true},
    ],
    chars:[
      {name:'Ghost',color:'#475569',glow:'rgba(71,85,105,0.5)',desc:'Barely holding together.',emoji:'🌑'},
      {name:'Survivor',color:'#64748b',glow:'rgba(100,116,139,0.5)',desc:'Still standing. That matters.',emoji:'🪨'},
      {name:'Operative',color:'#4a9eff',glow:'rgba(74,158,255,0.55)',desc:'Discipline is forming.',emoji:'⚡'},
      {name:'Agent',color:'#22c55e',glow:'rgba(34,197,94,0.55)',desc:'Sharper. Clearer. Stronger.',emoji:'🎯'},
      {name:'Commander',color:'#f59e0b',glow:'rgba(245,158,11,0.6)',desc:'Unshakeable. This is who you are.',emoji:'🔥'},
    ],
    emptyJ:'No entries yet.\nWrite your first log above.',
    emptyT:'Nothing logged today. Tap an activity to build your stats.',
    trainTitle:'MISSION LOG',progressTitle:'EVOLUTION',
  },
  female:{
    charLabel:'YOUR INNER SELF',streakLabel:'Days Free',tagline:'Become who you were before them.',
    shadowLabel:'UNSENT LETTER',shadowPH:"Write what you're holding back...",
    analyzeBtn:'SHOW ME THE TRUTH',journalSave:'SAVE ENTRY',journalPH:'Write freely — this is just for you...',
    chamberTitle:'SAFE SPACE',interceptTitle:'I WANT TO REACH OUT',
    interceptSub:"Take a breath — let's process this together",
    interceptGreet:"Hey, I've got you. You don't have to do anything right now.\n\nTell me what happened that made you want to reach out.",
    interceptFollow:"That makes complete sense. Your nervous system is looking for something familiar.\n\nYou're not weak for feeling this. What do you actually need right now?",
    analysisText:"What will most likely happen:\n\nSending this gives you about 8 minutes of relief — then your phone becomes something you can't put down while you wait.\n\nIf they don't reply: The silence will feel louder than anything they could say.\n\nIf they do reply: It rarely goes the way we imagine. You get pulled back.\n\nYour streak is beautiful. You've earned every single day.",
    prompts:['What felt good today, even something tiny?','Name one thing you did just for yourself this week.','What would you say to your best friend going through this?','What are you most proud of since you started this journey?','Describe the life you\'re building on the other side of this.',"What's something you rediscovered about yourself?",'Who showed up for you today?'],
    moods:['💛','🌸','😔','💪','✨','🌙'],
    greet:function(n){return n+'.';},
    onboard:[
      {icon:'🌸',title:'You have a character.',body:'She evolves as you heal. Every day of no-contact, every journal entry, every act of self-care makes her stronger.'},
      {icon:'💌',title:'Unsent Letter protects you.',body:'Write what you want to say to them. We help you process it — you never have to send it.'},
      {icon:'✨',title:'Watch yourself grow.',body:'Body, Mind, Soul — three parts of you that are rebuilding. Your character reflects exactly how far you\'ve come.'},
    ],
    acts:[
      {id:'walk',label:'Walk / Move',xp:60,icon:'🚶',stat:'body'},
      {id:'workout',label:'Workout',xp:90,icon:'💪',stat:'body'},
      {id:'sleep',label:'Good Sleep',xp:50,icon:'🌙',stat:'body'},
      {id:'selfcare',label:'Self-Care Ritual',xp:45,icon:'✨',stat:'soul'},
      {id:'meditate',label:'Meditate',xp:55,icon:'🧘',stat:'mind'},
      {id:'journal',label:'Journaled',xp:45,icon:'📔',stat:'mind'},
      {id:'noscroll',label:'No Spiral Scroll',xp:40,icon:'📵',stat:'mind'},
      {id:'creative',label:'Creative Time',xp:55,icon:'🎨',stat:'soul'},
      {id:'friends',label:'Time With Friends',xp:85,icon:'💛',stat:'soul'},
      {id:'nature',label:'Time in Nature',xp:50,icon:'🌸',stat:'soul'},
    ],
    milestones:[
      {days:1,xp:100,label:'First Step',desc:'One whole day. That took courage.',icon:'🌱'},
      {days:3,xp:200,label:'Three Days Strong',desc:'Your heart is starting to breathe.',icon:'🌸'},
      {days:7,xp:500,label:'One Week Free',desc:'A full week of choosing yourself.',icon:'🌙',pro:true},
      {days:14,xp:750,label:'Two Weeks Blooming',desc:'The emotional weight is lifting.',icon:'🌺',pro:true},
      {days:30,xp:1500,label:'One Month Reclaimed',desc:"You've rebuilt something real.",icon:'💎',pro:true},
      {days:60,xp:3000,label:'Fully Yourself',desc:'You were always enough.',icon:'👑',pro:true},
    ],
    chars:[
      {name:'Ember',color:'#9d4f7c',glow:'rgba(157,79,124,0.5)',desc:'Still finding your footing.',emoji:'🌑'},
      {name:'Seeker',color:'#c06a9a',glow:'rgba(192,106,154,0.5)',desc:'The fog is starting to lift.',emoji:'🌿'},
      {name:'Blooming',color:'#e879a0',glow:'rgba(232,121,160,0.55)',desc:'Growing into yourself again.',emoji:'🌸'},
      {name:'Radiant',color:'#f0abcc',glow:'rgba(240,171,204,0.55)',desc:'Soft, strong, unmistakably you.',emoji:'✨'},
      {name:'Sovereign',color:'#d8b4fe',glow:'rgba(216,180,254,0.6)',desc:'Whole. Healed. Unstoppable.',emoji:'👑'},
    ],
    emptyJ:'No entries yet.\nWrite your first entry above.',
    emptyT:'Nothing logged today. Tap an activity to grow your character.',
    trainTitle:'SELF-CARE LOG',progressTitle:'YOUR JOURNEY',
  }
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
var CSS="@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html,body,#root{height:100%;background:#070a10}body{overscroll-behavior:none;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:2px}textarea,input{outline:none}button{cursor:pointer;border:none;background:none;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}@keyframes slideR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}input[type='date']::-webkit-calendar-picker-indicator{filter:invert(0.4);cursor:pointer}";

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
function row(x){return Object.assign({display:'flex',alignItems:'center'},x||{});}
function col(x){return Object.assign({display:'flex',flexDirection:'column'},x||{});}
function mn(sz,cl,x){return Object.assign({fontFamily:"'DM Mono',monospace",fontSize:sz,color:cl,letterSpacing:'0.08em'},x||{});}

// ─── CHARACTER SVG ────────────────────────────────────────────────────────────
function CharArt(props){
  var lv=props.level,cl=props.color,gl=props.glow,gn=props.gender;
  var iF=gn==='female';
  var op=0.28+(lv/MAXLVL)*0.72;
  var aw=6+lv;
  var rings=[];
  for(var ri=0;ri<=lv;ri++){
    rings.push(e('circle',{key:'r'+ri,cx:'100',cy:'125',r:String(52+ri*17),fill:'none',stroke:cl,strokeWidth:'0.8',opacity:Math.max(0.03,0.1-ri*0.02),style:{animation:'pulse '+(2.2+ri*0.6)+'s ease-in-out '+(ri*0.3)+'s infinite'}}));
  }
  rings.push(e('ellipse',{key:'sh',cx:'100',cy:'200',rx:String(28+lv*9),ry:'5',fill:cl,opacity:0.08+lv*0.04}));
  if(iF){
    rings.push(e('ellipse',{key:'hd',cx:'100',cy:'68',rx:'17',ry:'19',fill:cl,opacity:op}));
    rings.push(e('path',{key:'bd',d:'M83 85 Q100 78 117 85 L120 142 Q110 150 100 151 Q90 150 80 142 Z',fill:cl,opacity:op}));
    if(lv>=1){rings.push(e('ellipse',{key:'ht',cx:'100',cy:'53',rx:'21',ry:'7',fill:cl,opacity:op*0.7}));rings.push(e('path',{key:'hl',d:'M79 56 Q73 76 76 96',stroke:cl,strokeWidth:'5',fill:'none',opacity:op*0.65,strokeLinecap:'round'}));rings.push(e('path',{key:'hr',d:'M121 56 Q127 76 124 96',stroke:cl,strokeWidth:'5',fill:'none',opacity:op*0.65,strokeLinecap:'round'}));}
    rings.push(e('path',{key:'al',d:'M83 91 Q69 108 67 126',stroke:cl,strokeWidth:'7',fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'ar',d:'M117 91 Q131 108 133 126',stroke:cl,strokeWidth:'7',fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'ll',d:'M92 149 Q88 169 86 192',stroke:cl,strokeWidth:'7',fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'lr',d:'M108 149 Q112 169 114 192',stroke:cl,strokeWidth:'7',fill:'none',opacity:op,strokeLinecap:'round'}));
    if(lv>=4){rings.push(e('path',{key:'cr',d:'M85 44 L89 35 L95 41 L100 31 L105 41 L111 35 L115 44 Z',fill:cl,opacity:op}));rings.push(e('circle',{key:'cg',cx:'100',cy:'43',r:'3',fill:cl,style:{animation:'pulse 1.4s ease-in-out infinite'}}));}
    if(lv>=2){for(var pi=0;pi<5;pi++)rings.push(e('circle',{key:'p'+pi,cx:String(80+pi*10),cy:String(62+Math.sin(pi)*18),r:'1.8',fill:cl,opacity:0.55,style:{animation:'pulse '+(1+pi*0.3)+'s ease-in-out '+(pi*0.2)+'s infinite'}}));}
  } else {
    rings.push(e('ellipse',{key:'hd',cx:'100',cy:'65',rx:'17',ry:'19',fill:cl,opacity:op}));
    rings.push(e('path',{key:'bd',d:'M83 81 Q100 73 117 81 L123 140 Q111 148 100 149 Q89 148 77 140 Z',fill:cl,opacity:op}));
    rings.push(e('path',{key:'al',d:'M83 87 Q66 106 63 128',stroke:cl,strokeWidth:String(aw),fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'ar',d:'M117 87 Q134 106 137 128',stroke:cl,strokeWidth:String(aw),fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'ll',d:'M91 147 Q87 167 85 192',stroke:cl,strokeWidth:'8',fill:'none',opacity:op,strokeLinecap:'round'}));
    rings.push(e('path',{key:'lr',d:'M109 147 Q113 167 115 192',stroke:cl,strokeWidth:'8',fill:'none',opacity:op,strokeLinecap:'round'}));
    if(lv>=1)rings.push(e('path',{key:'hr',d:'M83 54 Q100 45 117 54',stroke:cl,strokeWidth:'4',fill:'none',opacity:op*0.6,strokeLinecap:'round'}));
    if(lv>=2)rings.push(e('path',{key:'am',d:'M83 81 Q100 75 117 81 L119 99 Q100 107 81 99 Z',fill:cl,opacity:0.18}));
    if(lv>=4){rings.push(e('path',{key:'cr',d:'M85 49 L88 37 L100 29 L112 37 L115 49',fill:cl,opacity:op*0.85}));rings.push(e('circle',{key:'cg',cx:'100',cy:'31',r:'4',fill:cl,style:{animation:'pulse 1.4s ease-in-out infinite'}}));}
    if(lv>=2){for(var qi=0;qi<4;qi++)rings.push(e('circle',{key:'q'+qi,cx:String(76+qi*16),cy:String(66+Math.sin(qi*1.2)*17),r:'2.2',fill:cl,opacity:0.6,style:{animation:'pulse '+(1.2+qi*0.4)+'s ease-in-out '+(qi*0.25)+'s infinite'}}));}
  }
  rings.push(e('circle',{key:'el',cx:'94',cy:String(iF?67:63),r:String(2+lv*0.35),fill:cl,opacity:0.65+lv*0.07,style:{animation:lv>=1?'pulse 2.1s ease-in-out infinite':'none'}}));
  rings.push(e('circle',{key:'er',cx:'106',cy:String(iF?67:63),r:String(2+lv*0.35),fill:cl,opacity:0.65+lv*0.07,style:{animation:lv>=1?'pulse 2.1s ease-in-out 0.3s infinite':'none'}}));
  return e('svg',{viewBox:'0 0 200 230',xmlns:'http://www.w3.org/2000/svg',style:{width:'100%',maxWidth:180,filter:'drop-shadow(0 0 '+(14+lv*9)+'px '+gl+')',transition:'filter 1s ease'}},rings);
}

// ─── STAT BAR ─────────────────────────────────────────────────────────────────
function StatBar(props){
  var pct=props.max>0?Math.min((props.val/props.max)*100,100):0;
  return e('div',{style:{flex:1}},
    e('div',{style:row({justifyContent:'space-between',marginBottom:4})},
      e('span',{style:mn(8,props.t.dim)},props.label),
      e('span',{style:mn(8,props.val>0?props.color:props.t.dimmer)},String(props.val))
    ),
    e('div',{style:{height:3,background:props.t.bd,borderRadius:2,overflow:'hidden'}},
      e('div',{style:{height:'100%',width:pct+'%',background:props.color,borderRadius:2,transition:'width 1s cubic-bezier(0.4,0,0.2,1)'}})
    )
  );
}

// ─── XP TOAST ────────────────────────────────────────────────────────────────
function XPToast(props){
  useEffect(function(){var t=setTimeout(props.onDone,2400);return function(){clearTimeout(t);};},[]);
  return e('div',{style:{position:'fixed',top:72,right:16,zIndex:700,background:'rgba(7,10,16,0.97)',border:'1px solid '+props.accent,borderRadius:12,padding:'10px 16px',display:'flex',alignItems:'center',gap:8,animation:'slideR 0.35s cubic-bezier(0.34,1.56,0.64,1)',fontSize:12,color:props.accent,fontFamily:"'DM Mono',monospace",letterSpacing:'0.1em',boxShadow:'0 0 28px '+props.accent+'33'}},'★ +'+props.amount+' XP');
}

// ─── LEVEL UP ─────────────────────────────────────────────────────────────────
function LvlUp(props){
  useEffect(function(){var t=setTimeout(props.onDone,3500);return function(){clearTimeout(t);};},[]);
  var c=props.char,t=props.t;
  return e('div',{style:{position:'fixed',inset:0,zIndex:800,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,animation:'fadeUp 0.3s ease'}},
    e('div',{style:{textAlign:'center',animation:'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)'}},
      e('div',{style:{fontSize:64,marginBottom:16,filter:'drop-shadow(0 0 24px '+c.glow+')'}},c.emoji),
      e('div',{style:mn(10,c.color,{letterSpacing:'0.25em',marginBottom:8})},'FORM EVOLVED'),
      e('div',{style:{fontSize:28,fontWeight:700,color:t.text,marginBottom:8}},c.name),
      e('div',{style:{fontSize:14,color:t.dim,lineHeight:1.6}},c.desc)
    )
  );
}

// ─── OFFLINE ──────────────────────────────────────────────────────────────────
function Offline(props){
  return e('div',{style:{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',zIndex:600,background:props.t.bg2,border:'1px solid '+props.t.bd,borderRadius:20,padding:'6px 14px',display:'flex',alignItems:'center',gap:6,fontSize:10,color:props.t.dim,fontFamily:"'DM Mono',monospace"}},'○ OFFLINE — CACHED DATA');
}

// ─── PRO MODAL ────────────────────────────────────────────────────────────────
function ProModal(props){
  var t=props.t;
  var labels={journal:'Journal limit reached',analyze:'Analysis limit reached',milestone:'Pro milestone locked',pro:'Silo Pro'};
  var icons={journal:'📓',analyze:'⚡',milestone:'🏆',pro:'👑'};
  var subs={journal:'Free plan includes '+FJ+' entries.',analyze:'Free plan includes '+FA+' analyses.',milestone:'Advanced milestones unlock with Silo Pro.',pro:'The full recovery toolkit — coming soon.'};
  var k=props.trigger||'pro';
  return e('div',{onClick:function(ev){if(ev.target===ev.currentTarget)props.onClose();},style:{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'flex-end',justifyContent:'center'}},
    e('div',{style:{width:'100%',maxWidth:480,background:t.bg2,border:'1px solid '+t.proBd,borderTopLeftRadius:24,borderTopRightRadius:24,overflow:'hidden',animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)'}},
      e('div',{style:{width:36,height:4,background:t.bd,borderRadius:2,margin:'12px auto 0'}}),
      e('div',{style:{padding:'20px 22px 14px',background:t.proBg,borderBottom:'1px solid '+t.proBd}},
        e('div',{style:{fontSize:28,marginBottom:10}},icons[k]||'👑'),
        e('div',{style:{fontSize:17,fontWeight:700,color:t.text,marginBottom:4}},labels[k]||'Silo Pro'),
        e('div',{style:{fontSize:13,color:t.dim,lineHeight:1.6}},subs[k]||'')
      ),
      e('div',{style:{padding:'16px 22px 28px'}},
        e('div',{style:{padding:14,background:t.proBg,border:'1px solid '+t.proBd,borderRadius:14,marginBottom:14}},
          e('div',{style:mn(9,t.proTxt,{marginBottom:12,letterSpacing:'0.18em'})},'SILO PRO — COMING SOON'),
          ['Unlimited journaling','Unlimited AI analyses','All milestone unlocks','Priority support'].map(function(f){return e('div',{key:f,style:{display:'flex',alignItems:'center',gap:8,marginBottom:8,fontSize:13,color:t.proTxt}},'✓ '+f);})
        ),
        e('div',{style:{width:'100%',padding:14,background:t.dimmer,borderRadius:12,fontSize:12,fontWeight:700,color:t.dim,fontFamily:"'DM Mono',monospace",letterSpacing:'0.1em',marginBottom:10,textAlign:'center',opacity:0.8}},'PAYMENTS NOT YET ACTIVE'),
        e('button',{onClick:props.onClose,style:{width:'100%',padding:12,background:'transparent',border:'1px solid '+t.bd,borderRadius:12,fontSize:13,color:t.dim,fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'CONTINUE FREE')
      )
    )
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function Settings(props){
  var st=useState(false);var conf=st[0],setConf=st[1];
  var t=props.t,u=props.user;
  return e('div',{onClick:function(ev){if(ev.target===ev.currentTarget)props.onClose();},style:{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'flex-end',justifyContent:'center'}},
    e('div',{style:{width:'100%',maxWidth:480,background:t.bg2,border:'1px solid '+t.bd,borderTopLeftRadius:24,borderTopRightRadius:24,animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)'}},
      e('div',{style:{width:36,height:4,background:t.bd,borderRadius:2,margin:'12px auto 0'}}),
      e('div',{style:row({justifyContent:'space-between',padding:'16px 20px 12px'})},
        e('span',{style:mn(13,t.text,{fontWeight:600})},'SETTINGS'),
        e('button',{onClick:props.onClose,style:{width:28,height:28,background:t.bg,border:'1px solid '+t.bd,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:t.dim,cursor:'pointer',fontSize:14}},'✕')
      ),
      e('div',{style:{padding:'0 20px 28px'}},
        e('div',{style:{background:t.bg,border:'1px solid '+t.bd,borderRadius:14,padding:'14px 16px',marginBottom:14}},
          e('div',{style:{fontSize:15,fontWeight:600,color:t.text,marginBottom:3}},u.name),
          e('div',{style:mn(11,t.dim,{marginBottom:2})},(u.gender==='female'?'Healing path':'Operative mode')+' · Free plan'),
          e('div',{style:mn(11,t.dimmer)},'No-contact since '+new Date(u.ncDate).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}))
        ),
        conf
          ? e('div',{style:{background:'#150806',border:'1px solid #7c2d12',borderRadius:12,padding:16}},
              e('div',{style:{fontSize:13,color:'#fca5a5',marginBottom:14,textAlign:'center',lineHeight:1.5}},'This will permanently delete all your data. Cannot be undone.'),
              e('div',{style:row({gap:8})},
                e('button',{onClick:function(){setConf(false);},style:{flex:1,padding:12,background:'transparent',border:'1px solid '+t.bd,borderRadius:10,fontSize:13,color:t.dim,fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'CANCEL'),
                e('button',{onClick:props.onReset,style:{flex:1,padding:12,background:'#7c2d12',border:'none',borderRadius:10,fontSize:13,color:'#fff',fontFamily:"'DM Mono',monospace",fontWeight:700,cursor:'pointer'}},'YES, RESET')
              )
            )
          : e('button',{onClick:function(){setConf(true);},style:{width:'100%',padding:14,background:'transparent',border:'1px solid #7c2d12',borderRadius:12,fontSize:13,color:'#fca5a5',fontFamily:"'DM Mono',monospace",display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer'}},'↺ RESET ALL DATA')
      )
    )
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboard(props){
  var ps=useState('splash');var phase=ps[0],setPhase=ps[1];
  var gs=useState(null);var gender=gs[0],setGender=gs[1];
  var ns=useState('');var name=ns[0],setName=ns[1];
  var ds=useState(todayStr());var ncDate=ds[0],setNcDate=ds[1];
  var t=gender?TH[gender]:TH.male;
  var cp=gender?CP[gender]:CP.male;
  var acc=gender?t.accent:'#4a9eff';
  var phases=['splash','i0','i1','i2','gender','name','date'];
  function next(){var i=phases.indexOf(phase);if(i<phases.length-1)setPhase(phases[i+1]);}
  function back(){var i=phases.indexOf(phase);if(i>0)setPhase(phases[i-1]);}
  function finish(){if(!name.trim()||!gender)return;props.onComplete({gender:gender,name:name.trim(),ncDate:ncDate,xp:0,journalEntries:[],activityLog:[],loggedToday:{},loggedDate:todayStr(),analyzeCount:0,isPro:false});}
  var introIdx=phase==='i0'?0:phase==='i1'?1:phase==='i2'?2:-1;
  var slide=introIdx>=0?cp.onboard[introIdx]:null;

  // Build page based on phase
  var content;
  if(phase==='splash'){
    content=e('div',{style:{textAlign:'center',animation:'fadeUp 0.5s ease'}},
      e('div',{style:{width:56,height:56,background:'#0a0e1a',border:'1px solid #1e3a5f',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',fontSize:22}},'🔒'),
      e('div',{style:{fontSize:36,fontWeight:700,letterSpacing:'0.2em',color:'#e2e8f0',marginBottom:10}},'SILO'),
      e('div',{style:{fontSize:13,color:'#475569',marginBottom:48,lineHeight:1.7}},'Private recovery.\nNo-contact, rebuilt.'),
      e('button',{onClick:next,style:{width:'100%',padding:16,background:'#4a9eff',borderRadius:14,fontSize:14,fontWeight:700,color:'#fff',letterSpacing:'0.08em',fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'GET STARTED'),
      e('div',{style:{marginTop:14,fontSize:10,color:'#2d3748',letterSpacing:'0.08em'}},'All data stored privately on your device.')
    );
  } else if(introIdx>=0&&slide){
    content=e('div',{key:phase,style:{animation:'fadeUp 0.4s ease'}},
      e('div',{style:row({justifyContent:'center',gap:6,marginBottom:36})},
        [0,1,2].map(function(i){return e('div',{key:i,style:{height:3,width:i===introIdx?24:8,background:i<=introIdx?acc:'#1a2035',borderRadius:2,transition:'all 0.3s'}});})
      ),
      e('div',{style:{textAlign:'center',marginBottom:32}},
        e('div',{style:{fontSize:52,marginBottom:20}},slide.icon),
        e('div',{style:{fontSize:20,fontWeight:700,color:'#e2e8f0',marginBottom:12,lineHeight:1.3}},slide.title),
        e('div',{style:{fontSize:14,color:'#475569',lineHeight:1.7}},slide.body)
      ),
      e('button',{onClick:next,style:{width:'100%',padding:16,background:acc,borderRadius:14,fontSize:14,fontWeight:700,color:'#fff',letterSpacing:'0.08em',fontFamily:"'DM Mono',monospace",cursor:'pointer',marginBottom:10}},introIdx<2?'NEXT →':"LET'S GO →"),
      cond(introIdx>0,e('button',{onClick:back,style:{width:'100%',padding:10,background:'transparent',fontSize:12,color:'#2d3748',fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'← BACK'))
    );
  } else if(phase==='gender'){
    content=e('div',{style:{animation:'fadeUp 0.4s ease'}},
      e('div',{style:{fontSize:22,fontWeight:700,color:'#e2e8f0',marginBottom:8}},'Your path, your way.'),
      e('div',{style:{fontSize:13,color:'#475569',marginBottom:24,lineHeight:1.6}},'Silo adapts its tone and your character to what works for you.'),
      [{id:'male',emoji:'⚡',title:'As a man',sub:'Direct, tactical, no-nonsense'},{id:'female',emoji:'🌸',title:'As a woman',sub:'Warm, gentle, emotionally supportive'}].map(function(o){
        return e('button',{key:o.id,onClick:function(){setGender(o.id);setPhase('name');},style:{display:'flex',alignItems:'center',gap:14,padding:'16px 18px',background:'#0a0e1a',border:'1px solid #151e30',borderRadius:14,textAlign:'left',fontFamily:"'DM Mono',monospace",width:'100%',marginBottom:10,cursor:'pointer'}},
          e('span',{style:{fontSize:24}},o.emoji),
          e('div',null,e('div',{style:{fontSize:14,fontWeight:600,color:'#e2e8f0',marginBottom:2}},o.title),e('div',{style:{fontSize:11,color:'#475569'}},o.sub)),
          e('span',{style:{marginLeft:'auto',color:'#2d3748'}},'→')
        );
      }),
      e('button',{onClick:back,style:{width:'100%',padding:10,background:'transparent',fontSize:12,color:'#2d3748',fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'← BACK'),
      e('div',{style:{marginTop:12,fontSize:10,color:'#1e2a3a',textAlign:'center'}},'Language preference only. Never shared.')
    );
  } else if(phase==='name'){
    content=e('div',{style:{animation:'fadeUp 0.4s ease'}},
      e('div',{style:{fontSize:22,fontWeight:700,color:t.text,marginBottom:8}},gender==='female'?"What's your name?":'What should we call you?'),
      e('div',{style:{fontSize:13,color:t.dim,marginBottom:24,lineHeight:1.6}},gender==='female'?'Your character will carry your name.':'Your operative needs a name.'),
      e('input',{autoFocus:true,value:name,onChange:function(ev){setName(ev.target.value);},onKeyDown:function(ev){if(ev.key==='Enter'&&name.trim())setPhase('date');},placeholder:gender==='female'?'Your name...':'Name or callsign...',style:{width:'100%',padding:'14px 16px',background:t.bg3,border:'1px solid '+t.bd2,borderRadius:12,fontSize:15,color:t.text,fontFamily:t.font,marginBottom:14}}),
      e('button',{onClick:function(){if(name.trim())setPhase('date');},disabled:!name.trim(),style:{width:'100%',padding:16,background:name.trim()?t.accent:'#151e30',border:'none',borderRadius:14,fontSize:14,fontWeight:700,color:name.trim()?'#fff':t.dim,fontFamily:"'DM Mono',monospace",letterSpacing:'0.08em',marginBottom:10,cursor:name.trim()?'pointer':'default',transition:'all 0.2s'}},'CONTINUE →'),
      e('button',{onClick:back,style:{width:'100%',padding:10,background:'transparent',fontSize:12,color:t.dimmer,fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'← BACK')
    );
  } else if(phase==='date'){
    content=e('div',{style:{animation:'fadeUp 0.4s ease'}},
      e('div',{style:{fontSize:22,fontWeight:700,color:t.text,marginBottom:8}},gender==='female'?'Almost there, '+name+'.':'Good. '+name+'.'),
      e('div',{style:{fontSize:13,color:t.dim,marginBottom:6,lineHeight:1.6}},'When did you go no-contact?'),
      e('div',{style:{fontSize:12,color:t.dimmer,marginBottom:20,lineHeight:1.6}},'Your streak and character track from this date. Defaults to today.'),
      e('input',{type:'date',value:ncDate,max:todayStr(),onChange:function(ev){setNcDate(ev.target.value);},style:{width:'100%',padding:'14px 16px',background:t.bg3,border:'1px solid '+t.bd2,borderRadius:12,fontSize:14,color:t.text,fontFamily:"'DM Mono',monospace",marginBottom:14,colorScheme:'dark'}}),
      e('button',{onClick:finish,style:{width:'100%',padding:16,background:t.accent,border:'none',borderRadius:14,fontSize:14,fontWeight:700,color:'#fff',fontFamily:"'DM Mono',monospace",letterSpacing:'0.1em',marginBottom:10,cursor:'pointer'}},gender==='female'?'BEGIN MY JOURNEY →':'INITIATE PROTOCOL →'),
      e('button',{onClick:back,style:{width:'100%',padding:10,background:'transparent',fontSize:12,color:t.dimmer,fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'← BACK')
    );
  } else {
    content=null;
  }

  return e('div',{style:{minHeight:'100vh',background:gender?t.bg:'#070a10',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'DM Mono',monospace"}},
    e('style',null,CSS),
    e('div',{style:{width:'100%',maxWidth:400,position:'relative',zIndex:1}},content)
  );
}

// ─── TABS ──────────────────────────────────────────────────────────────────────
var TABS=[{id:'HOME',label:'Home',g:'⬡'},{id:'JOURNAL',label:'Journal',g:'◎'},{id:'TRAIN',label:'Train',g:'◈'},{id:'PROGRESS',label:'Progress',g:'◇'}];

// ─── DOTS LOADING ─────────────────────────────────────────────────────────────
function Dots(props){
  return e('div',{style:{alignSelf:'flex-start',display:'flex',gap:5,padding:'10px 14px',background:'rgba(255,255,255,0.03)',borderRadius:12}},
    [0,1,2].map(function(i){return e('div',{key:i,style:{width:6,height:6,borderRadius:'50%',background:props.color,animation:'bounce 1.2s ease-in-out '+(i*0.2)+'s infinite'}});})
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  var u_loaded=useState(false);
  var u_user=useState(null);
  var u_msgs=useState([]);
  var u_tab=useState('HOME');
  var u_upgrade=useState(null);
  var u_settings=useState(false);
  var u_toast=useState(null);
  var u_lvlup=useState(null);
  var u_offline=useState(!navigator.onLine);
  var u_tick=useState(0);
  var u_shadow=useState('');
  var u_analyzing=useState(false);
  var u_showAnalyzed=useState(false);
  var u_showShadow=useState(true);
  var u_intercept=useState(false);
  var u_chat=useState('');
  var u_entry=useState('');
  var u_expanded=useState(null);
  var u_promptIdx=useState(0);
  var u_mood=useState(null);

  var loaded=u_loaded[0],setLoaded=u_loaded[1];
  var user=u_user[0],setUser=u_user[1];
  var msgs=u_msgs[0],setMsgs=u_msgs[1];
  var tab=u_tab[0],setTab=u_tab[1];
  var upgrade=u_upgrade[0],setUpgrade=u_upgrade[1];
  var showSettings=u_settings[0],setShowSettings=u_settings[1];
  var toast=u_toast[0],setToast=u_toast[1];
  var lvlUp=u_lvlup[0],setLvlUp=u_lvlup[1];
  var offline=u_offline[0],setOffline=u_offline[1];
  var shadow=u_shadow[0],setShadow=u_shadow[1];
  var analyzing=u_analyzing[0],setAnalyzing=u_analyzing[1];
  var showAnalyzed=u_showAnalyzed[0],setShowAnalyzed=u_showAnalyzed[1];
  var showShadow=u_showShadow[0],setShowShadow=u_showShadow[1];
  var interceptOpen=u_intercept[0],setInterceptOpen=u_intercept[1];
  var chatInput=u_chat[0],setChatInput=u_chat[1];
  var entry=u_entry[0],setEntry=u_entry[1];
  var expanded=u_expanded[0],setExpanded=u_expanded[1];
  var promptIdx=u_promptIdx[0],setPromptIdx=u_promptIdx[1];
  var mood=u_mood[0],setMood=u_mood[1];
  var chatRef=useRef(null);

  useEffect(function(){
    function on(){setOffline(false);}function off(){setOffline(true);}
    window.addEventListener('online',on);window.addEventListener('offline',off);
    return function(){window.removeEventListener('online',on);window.removeEventListener('offline',off);};
  },[]);

  useEffect(function(){
    try{
      var saved=loadD();
      if(saved&&saved.user){
        var u=Object.assign({},saved.user);
        if(!Array.isArray(u.activityLog))u.activityLog=[];
        if(!Array.isArray(u.journalEntries))u.journalEntries=[];
        if(!u.loggedToday)u.loggedToday={};
        if(typeof u.analyzeCount!=='number')u.analyzeCount=0;
        if(u.loggedDate!==todayStr()){u.loggedToday={};u.loggedDate=todayStr();}
        setUser(u);
        if(Array.isArray(saved.messages))setMsgs(saved.messages);
      }
    }catch(x){}
    setLoaded(true);
  },[]);

  useEffect(function(){if(user)saveD({user:user,messages:msgs});},[user,msgs]);
  useEffect(function(){var id=setInterval(function(){u_tick[1](function(n){return n+1;});},1000);return function(){clearInterval(id);};},[]);
  useEffect(function(){if(chatRef.current)chatRef.current.scrollIntoView({behavior:'smooth'});},[msgs,analyzing]);

  if(!loaded)return e('div',{style:{minHeight:'100vh',background:'#070a10',display:'flex',alignItems:'center',justifyContent:'center'}},e('div',{style:{width:10,height:10,borderRadius:'50%',background:'#4a9eff',animation:'pulse 1s ease-in-out infinite'}}));

  if(!user)return e(Onboard,{onComplete:function(u){
    var cp=CP[u.gender];
    var initMsg=[{role:'assistant',text:u.gender==='female'?'Hey, '+u.name+". Welcome to your space.\n\nYour character starts as Ember — quiet, still finding footing. Every action you take makes her stronger.\n\nFive forms to grow through. This is just the beginning.":u.name+". Protocol initiated.\n\nYou start as Ghost — unformed, running on fumes. Every rep logged, every day of no contact, every decision not to reach out evolves your operative.\n\nFive levels. One direction: forward."}];
    setUser(u);setMsgs(initMsg);setMood(cp.moods[0]);
  }});

  // Derived
  var t=TH[user.gender];
  var cp=CP[user.gender];
  var chars=cp.chars;
  var streak=getStreak(user.ncDate);
  var tp=getTimeParts(user.ncDate);
  var level=getLevel(user.xp);
  var lvlXP=getLvlXP(user.xp);
  var ch=chars[level]||chars[0];
  var stats=getStats(user.activityLog,cp.acts);
  var mx=Math.max(stats.body,stats.mind,stats.soul,1);
  var nextMil=cp.milestones.find(function(m){return m.days>streak;})||null;

  function awardXP(amt){
    setUser(function(u){
      var nx=u.xp+amt;
      var nl=getLevel(nx);
      var ol=getLevel(u.xp);
      if(nl>ol&&nl<=MAXLVL)setTimeout(function(){setLvlUp(chars[nl]||null);},300);
      return Object.assign({},u,{xp:nx});
    });
    setToast(amt);
  }

  function doAnalyze(){
    if(!shadow.trim())return;
    if(!user.isPro&&user.analyzeCount>=FA){setUpgrade('analyze');return;}
    setShowAnalyzed(false);setShowShadow(false);
    var preview=shadow.slice(0,80)+(shadow.length>80?'…':'');
    setMsgs(function(m){return m.concat([{role:'user',text:'['+cp.shadowLabel+']: "'+preview+'"'}]);});
    setUser(function(u){return Object.assign({},u,{analyzeCount:u.analyzeCount+1});});
    setAnalyzing(true);
    setTimeout(function(){
      setAnalyzing(false);
      setMsgs(function(m){return m.concat([{role:'assistant',text:cp.analysisText}]);});
      setShowAnalyzed(true);
      awardXP(25);
    },2800);
  }

  function saveJournal(){
    if(!entry.trim())return;
    if(!user.isPro&&user.journalEntries.length>=FJ){setUpgrade('journal');return;}
    var ne={id:Date.now(),date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}),text:entry,mood:mood||cp.moods[0],xp:40};
    setUser(function(u){return Object.assign({},u,{journalEntries:[ne].concat(u.journalEntries)});});
    setEntry('');awardXP(40);
  }

  function logActivity(id,xp){
    if(user.loggedToday[id])return;
    setUser(function(u){
      var lt=Object.assign({},u.loggedToday);lt[id]=true;
      var al=(u.activityLog||[]).concat([id]);
      return Object.assign({},u,{loggedToday:lt,loggedDate:todayStr(),activityLog:al});
    });
    awardXP(xp);
  }

  function doReset(){clearD();setUser(null);setMsgs([]);setShowSettings(false);}

  function sendChat(){
    if(!chatInput.trim())return;
    var v=chatInput;setChatInput('');
    setMsgs(function(m){return m.concat([{role:'user',text:v},{role:'assistant',text:cp.interceptFollow}]);});
    setInterceptOpen(false);setTab('HOME');
  }

  // Style helpers
  var card={background:t.bg2,border:'1px solid '+t.bd,borderRadius:16,overflow:'hidden',marginBottom:12};
  var gradCard={background:'linear-gradient(145deg,'+t.bg2+','+t.bg3+')',border:'1px solid '+t.bd,borderRadius:16,overflow:'hidden',marginBottom:12};
  var cardH={display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'1px solid '+t.bd,background:t.bg};
  var ta={width:'100%',background:'transparent',border:'none',resize:'none',padding:'12px 14px',fontSize:14,color:t.muted,fontFamily:t.font,lineHeight:1.75,outline:'none',minHeight:72,boxSizing:'border-box'};
  var mAI={alignSelf:'flex-start',maxWidth:'86%',background:t.bg2,border:'1px solid '+t.bd,borderRadius:'14px 14px 14px 2px',padding:'11px 14px',fontSize:14,color:t.muted,lineHeight:1.75,whiteSpace:'pre-wrap'};
  var mU={alignSelf:'flex-end',maxWidth:'74%',background:t.accentDim,border:'1px solid '+t.accentBorder,borderRadius:'14px 14px 2px 14px',padding:'11px 14px',fontSize:14,color:t.muted,lineHeight:1.65,whiteSpace:'pre-wrap'};
  function m9(cl,x){return mn(9,cl||t.dim,x);}
  function label(txt){return e('span',{style:mn(9,t.muted,{fontWeight:600})},txt);}
  function proBar(){
    return e('button',{onClick:function(){setUpgrade('pro');},style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 14px',background:t.proBg,border:'1px solid '+t.proBd,borderRadius:12,marginBottom:14,cursor:'pointer'}},
      e('div',{style:{display:'flex',alignItems:'center',gap:7,fontSize:11,color:t.proTxt,fontFamily:"'DM Mono',monospace"}},'♛ Silo Pro — unlimited everything'),
      e('span',{style:m9(t.dim)},'COMING SOON')
    );
  }
  function analyzeBtn(){
    var ok=shadow.trim()&&!analyzing;
    return e('button',{onClick:doAnalyze,disabled:!ok,style:{display:'flex',alignItems:'center',gap:5,background:ok?t.accentDim:t.bg2,border:'1px solid '+(ok?t.accentBorder:t.bd),borderRadius:8,padding:'6px 12px',fontSize:9,fontWeight:700,color:ok?t.accent:t.dim,fontFamily:"'DM Mono',monospace",cursor:ok?'pointer':'default',letterSpacing:'0.1em'}},'⚡ '+cp.analyzeBtn);
  }

  // ── HOME PAGE ───────────────────────────────────────────────────────────────
  function homePage(){
    return e('div',null,
      proBar(),
      // CHARACTER HERO
      e('div',{style:gradCard},
        e('div',{style:cardH},label(cp.charLabel),e('span',{style:mn(9,ch.color,{fontWeight:600})},ch.emoji+' '+ch.name.toUpperCase())),
        e('div',{style:row({padding:'20px 16px',alignItems:'center',gap:16})},
          e('div',{style:{width:160,flexShrink:0,position:'relative'}},
            e(CharArt,{level:level,color:ch.color,glow:ch.glow,gender:user.gender}),
            e('div',{style:{position:'absolute',bottom:4,left:'50%',transform:'translateX(-50%)',background:t.bg,border:'1px solid '+ch.color+'44',borderRadius:8,padding:'3px 10px',whiteSpace:'nowrap'}},
              e('span',{style:mn(8,ch.color,{letterSpacing:'0.1em'})},'LV.'+(level+1))
            )
          ),
          e('div',{style:{flex:1,minWidth:0}},
            e('div',{style:{fontSize:17,fontWeight:700,color:t.text,marginBottom:2,fontFamily:"'DM Mono',monospace"}},cp.greet(user.name)),
            e('div',{style:{fontSize:12,color:t.dim,marginBottom:14,lineHeight:1.5}},ch.desc),
            // XP bar
            e('div',{style:{marginBottom:12}},
              e('div',{style:row({justifyContent:'space-between',marginBottom:4})},e('span',{style:m9()},'FORM XP'),e('span',{style:m9(ch.color)},lvlXP+'/'+XPL)),
              e('div',{style:{height:5,background:t.bd,borderRadius:3,overflow:'hidden'}},e('div',{style:{height:'100%',width:((lvlXP/XPL)*100)+'%',background:ch.color,borderRadius:3,transition:'width 1s cubic-bezier(0.4,0,0.2,1)',boxShadow:'0 0 8px '+ch.glow}})),
              e('div',{style:mn(9,t.dimmer,{marginTop:4})},level<MAXLVL?(XPL-lvlXP)+' XP to '+(chars[level+1]||{name:'MAX'}).name:'✦ MAX FORM')
            ),
            e('div',{style:row({gap:8})},e(StatBar,{label:'BODY',val:stats.body,max:mx,color:t.accent2,t:t}),e(StatBar,{label:'MIND',val:stats.mind,max:mx,color:t.accent,t:t}),e(StatBar,{label:'SOUL',val:stats.soul,max:mx,color:t.streak,t:t}))
          )
        )
      ),
      // STREAK + MILESTONE PILLS
      e('div',{style:row({gap:8,marginBottom:12})},
        e('div',{style:{flex:1,display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:t.bg2,border:'1px solid '+t.bd,borderRadius:12}},
          e('span',{style:{fontSize:14}},'🔥'),
          e('div',null,e('div',{style:m9(t.dim,{marginBottom:1})},cp.streakLabel.toUpperCase()),e('div',{style:{fontSize:16,fontWeight:700,color:t.streak,fontFamily:"'DM Mono',monospace",lineHeight:1}},streak+'d'))
        ),
        e('div',{style:{flex:1,display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:t.bg2,border:'1px solid '+t.bd,borderRadius:12}},
          e('span',{style:{fontSize:14}},'★'),
          e('div',{style:{minWidth:0}},
            e('div',{style:m9(t.dim,{marginBottom:1})},'NEXT GOAL'),
            nextMil
              ? e('div',{style:{fontSize:12,fontWeight:600,color:t.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},nextMil.icon+' '+nextMil.label)
              : e('div',{style:{fontSize:12,color:t.accent2}},'All done 🏆')
          )
        )
      ),
      // INTERCEPT
      e('button',{onClick:function(){setInterceptOpen(true);},style:{width:'100%',padding:'14px 16px',background:'transparent',border:'1px solid #7c2d12',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,fontFamily:t.font,cursor:'pointer'}},
        e('div',{style:row({gap:12})},
          e('div',{style:{width:34,height:34,background:'#150806',border:'1px solid #7c2d12',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:16}},'⚠'),
          e('div',{style:{textAlign:'left'}},e('div',{style:{fontSize:12,fontWeight:700,color:'#fca5a5',letterSpacing:'0.05em',fontFamily:"'DM Mono',monospace"}},cp.interceptTitle),e('div',{style:{fontSize:11,color:'#6b7280',marginTop:1}},cp.interceptSub))
        ),
        e('span',{style:{color:'#7c2d12',fontSize:16}},'→')
      ),
      // VENTING CHAMBER
      e('div',{style:card},
        e('div',{style:cardH},
          e('div',{style:row({gap:7})},e('span',{style:{fontSize:13}},'💬'),label(cp.chamberTitle)),
          e('span',{style:m9()},'👁 PRIVATE')
        ),
        e('div',{style:{padding:'14px 15px',display:'flex',flexDirection:'column',gap:11,minHeight:110,maxHeight:260,overflowY:'auto'}},
          msgs.map(function(m,i){return e('div',{key:i,style:m.role==='user'?mU:mAI},m.text);}),
          cond(analyzing,e(Dots,{color:t.accent})),
          e('div',{ref:chatRef})
        ),
        cond(!user.isPro&&user.analyzeCount>=FA&&showShadow,
          e('div',{style:{margin:'0 14px 10px',padding:'8px 12px',background:t.proBg,border:'1px solid '+t.proBd,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between'}},
            e('span',{style:{fontSize:11,color:t.proTxt}},'Analysis limit reached ('+FA+'/'+FA+')'),
            e('button',{onClick:function(){setUpgrade('analyze');},style:{fontSize:9,color:t.proCol,background:'transparent',border:'none',fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'UPGRADE →')
          )
        ),
        cond(showShadow,
          e('div',{style:{margin:'0 14px 14px',background:t.bg,border:'1px solid '+t.bd,borderRadius:12,overflow:'hidden'}},
            e('div',{style:row({gap:5,padding:'8px 13px',borderBottom:'1px solid '+t.bd})},e('span',{style:{fontSize:10}},'🔒'),e('span',{style:m9()},cp.shadowLabel)),
            e('textarea',{style:ta,value:shadow,onChange:function(ev){setShadow(ev.target.value);},placeholder:cp.shadowPH,rows:3}),
            e('div',{style:row({justifyContent:'space-between',padding:'8px 13px',borderTop:'1px solid '+t.bd})},
              e('span',{style:m9()},shadow.length+' chars · never sent'),
              analyzeBtn()
            )
          )
        ),
        cond(showAnalyzed&&!showShadow,
          e('div',{style:{padding:'0 14px 14px',display:'flex',justifyContent:'center'}},
            e('button',{onClick:function(){setShowShadow(true);setShowAnalyzed(false);setShadow('');},style:{background:'transparent',border:'1px solid '+t.bd,borderRadius:9,padding:'7px 14px',fontSize:9,color:t.dim,fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'+ NEW MESSAGE')
          )
        )
      )
    );
  }

  // ── JOURNAL PAGE ────────────────────────────────────────────────────────────
  function journalPage(){
    return e('div',null,
      proBar(),
      e('div',{style:card},
        e('div',{style:cardH},e('div',{style:row({gap:7})},e('span',{style:{fontSize:13}},'✏'),label('NEW ENTRY')),e('span',{style:{fontSize:9,color:t.accent2,fontFamily:"'DM Mono',monospace",fontWeight:600}},'+40 XP')),
        e('div',{style:{padding:'14px 15px'}},
          e('div',{style:row({justifyContent:'space-between',marginBottom:7})},e('span',{style:m9()},"TODAY'S PROMPT"),e('button',{onClick:function(){setPromptIdx(function(i){return(i+1)%cp.prompts.length;});},style:{background:'transparent',border:'none',fontSize:10,color:t.accent,fontFamily:"'DM Mono',monospace",cursor:'pointer'}},'NEXT →')),
          e('div',{style:{fontSize:13,color:t.dim,fontStyle:'italic',marginBottom:12,lineHeight:1.65,borderLeft:'2px solid '+t.bd2,paddingLeft:12}},cp.prompts[promptIdx]),
          e('textarea',{style:Object.assign({},ta,{background:t.bg,border:'1px solid '+t.bd,borderRadius:10,minHeight:96,padding:'12px 14px'}),placeholder:cp.journalPH,value:entry,onChange:function(ev){setEntry(ev.target.value);},rows:4}),
          e('div',{style:row({justifyContent:'space-between',marginTop:10})},
            e('div',{style:row({gap:4})},
              cp.moods.map(function(m2){return e('button',{key:m2,onClick:function(){setMood(m2);},style:{fontSize:16,background:mood===m2?t.accentDim:'transparent',border:mood===m2?'1px solid '+t.accentBorder:'1px solid transparent',borderRadius:8,padding:'3px 5px',cursor:'pointer'}},m2);})
            ),
            e('button',{onClick:saveJournal,disabled:!entry.trim(),style:{display:'flex',alignItems:'center',gap:5,background:entry.trim()?t.accentDim:t.bg2,border:'1px solid '+(entry.trim()?t.accentBorder:t.bd),borderRadius:9,padding:'8px 14px',fontSize:9,fontWeight:700,color:entry.trim()?t.accent:t.dim,fontFamily:"'DM Mono',monospace",letterSpacing:'0.1em',cursor:entry.trim()?'pointer':'default'}},'✓ '+cp.journalSave)
          ),
          cond(!user.isPro,
            e('div',{style:row({gap:8,marginTop:10})},
              e('div',{style:{flex:1,height:2,background:t.bd,borderRadius:1}},e('div',{style:{height:'100%',width:Math.min((user.journalEntries.length/FJ)*100,100)+'%',background:user.journalEntries.length>=FJ?t.proCol:t.dim,borderRadius:1,transition:'width 0.6s ease'}})),
              user.journalEntries.length>=FJ
                ? e('span',{style:{fontSize:9,color:t.proTxt,cursor:'pointer',fontFamily:"'DM Mono',monospace"},onClick:function(){setUpgrade('journal');}},'Limit reached')
                : e('span',{style:m9()},user.journalEntries.length+'/'+FJ+' free')
            )
          )
        )
      ),
      e('div',{style:card},
        e('div',{style:cardH},e('div',{style:row({gap:7})},e('span',{style:{fontSize:13}},'📖'),label('ENTRY LOG')),e('span',{style:m9()},user.journalEntries.length+' ENTRIES')),
        user.journalEntries.length===0
          ? e('div',{style:{padding:'32px 20px',textAlign:'center'}},e('div',{style:{fontSize:32,marginBottom:12,opacity:0.4}},user.gender==='female'?'📔':'📓'),e('div',{style:{fontSize:13,color:t.dimmer,lineHeight:1.7,whiteSpace:'pre-line'}},cp.emptyJ))
          : e('div',null,user.journalEntries.map(function(en,i){
              var isExp=expanded===en.id;
              return e('div',{key:en.id,onClick:function(){setExpanded(isExp?null:en.id);},style:{borderBottom:i<user.journalEntries.length-1?'1px solid '+t.bd:'none',cursor:'pointer'}},
                e('div',{style:row({justifyContent:'space-between',padding:'12px 15px'})},
                  e('div',{style:row({gap:10,flex:1,minWidth:0})},
                    e('span',{style:{fontSize:18,flexShrink:0}},en.mood),
                    e('div',{style:{minWidth:0}},e('div',{style:{fontSize:13,color:t.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},en.text.slice(0,52)+(en.text.length>52?'...':'')),e('div',{style:mn(9,t.dim,{marginTop:2})},en.date+' · +'+en.xp+' XP'))
                  ),
                  e('span',{style:{color:t.dim,flexShrink:0,marginLeft:8,fontSize:12}},isExp?'▲':'▼')
                ),
                cond(isExp,e('div',{style:{padding:'0 15px 14px',paddingTop:12,fontSize:14,color:t.dim,lineHeight:1.75,borderTop:'1px solid '+t.bd}},en.text))
              );
            }))
      )
    );
  }

  // ── TRAIN PAGE ──────────────────────────────────────────────────────────────
  function trainPage(){
    var tc=Object.keys(user.loggedToday).length;
    return e('div',null,
      proBar(),
      e('div',{style:gradCard},
        e('div',{style:cardH},e('div',{style:row({gap:7})},e('span',{style:{fontSize:13}},'⚡'),label(cp.trainTitle)),e('span',{style:mn(9,ch.color,{fontWeight:600})},tc+' logged today')),
        e('div',{style:{padding:'14px 15px'}},
          e('div',{style:{fontSize:12,color:t.dim,marginBottom:12,lineHeight:1.6}},user.gender==='female'?'Every activity builds your character. BODY, MIND, and SOUL grow with every action.':'Each logged activity builds your operative. Stack stats to evolve your form.'),
          e('div',{style:row({gap:10})},e(StatBar,{label:'BODY',val:stats.body,max:mx,color:t.accent2,t:t}),e(StatBar,{label:'MIND',val:stats.mind,max:mx,color:t.accent,t:t}),e(StatBar,{label:'SOUL',val:stats.soul,max:mx,color:t.streak,t:t}))
        )
      ),
      e('div',{style:card},
        e('div',{style:cardH},e('div',{style:row({gap:7})},e('span',{style:{fontSize:13}},'+'),label('LOG ACTIVITY')),e('span',{style:mn(9,t.dim,{fontSize:8})},'ONCE DAILY · RESETS MIDNIGHT')),
        cond(tc===0,e('div',{style:{padding:'14px 15px 0',textAlign:'center'}},e('div',{style:{fontSize:11,color:t.dimmer,fontFamily:"'DM Mono',monospace"}},cp.emptyT))),
        e('div',{style:{padding:'12px 14px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}},
          cp.acts.map(function(a){
            var done=!!user.loggedToday[a.id];
            var sc=a.stat==='body'?t.accent2:a.stat==='mind'?t.accent:t.streak;
            return e('button',{key:a.id,onClick:function(){logActivity(a.id,a.xp);},style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 12px',background:done?'rgba(16,38,14,0.8)':t.bg,border:'1px solid '+(done?'#14532d':t.bd),borderRadius:12,fontFamily:t.font,cursor:'pointer',transition:'all 0.15s'}},
              e('div',{style:row({gap:9})},
                e('span',{style:{fontSize:16}},a.icon),
                e('div',null,e('div',{style:{fontSize:11,color:done?'#4ade80':t.muted,textAlign:'left',fontWeight:done?600:400}},a.label),e('div',{style:mn(8,done?'#16a34a':sc,{letterSpacing:'0.05em'})},'+'+a.xp+' XP · '+a.stat.toUpperCase()))
              ),
              e('div',{style:{width:20,height:20,borderRadius:'50%',background:done?'#14532d':t.bg2,border:'1px solid '+(done?'#22c55e':t.bd),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11,color:done?'#22c55e':t.dimmer}},done?'✓':'+')
            );
          })
        )
      )
    );
  }

  // ── PROGRESS PAGE ───────────────────────────────────────────────────────────
  function progressPage(){
    return e('div',null,
      proBar(),
      // Evolution
      e('div',{style:gradCard},
        e('div',{style:cardH},e('div',{style:row({gap:7})},e('span',{style:{fontSize:13}},'★'),label(cp.progressTitle))),
        e('div',{style:{padding:'16px 14px',display:'flex',gap:6,justifyContent:'space-between'}},
          chars.map(function(c,i){
            var reached=level>=i;var current=level===i;
            return e('div',{key:i,style:col({flex:1,alignItems:'center',gap:5})},
              e('div',{style:{width:44,height:44,background:reached?'rgba(255,255,255,0.06)':t.bg,border:'1px solid '+(reached?c.color:t.bd),borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:current?24:16,transition:'all 0.4s',boxShadow:current?'0 0 16px '+c.glow:'none'}},c.emoji),
              e('div',{style:mn(7,reached?c.color:t.dimmer,{textAlign:'center',lineHeight:1.3})},c.name.toUpperCase(),e('br'),e('span',{style:{color:t.dimmer}},'Lv.'+(i+1)))
            );
          })
        ),
        e('div',{style:{padding:'0 14px 16px'}},
          e('div',{style:row({justifyContent:'space-between',marginBottom:5})},e('span',{style:m9()},'XP PROGRESS'),e('span',{style:m9(ch.color)},level<MAXLVL?lvlXP+' / '+XPL:'MAX FORM')),
          e('div',{style:{height:5,background:t.bd,borderRadius:3,overflow:'hidden'}},e('div',{style:{height:'100%',width:(level<MAXLVL?(lvlXP/XPL)*100:100)+'%',background:ch.color,borderRadius:3,transition:'width 1s cubic-bezier(0.4,0,0.2,1)',boxShadow:'0 0 8px '+ch.glow}}))
        )
      ),
      // Stats
      e('div',{style:card},
        e('div',{style:cardH},e('div',{style:row({gap:7})},e('span',{style:{fontSize:13}},'📊'),label('STAT OVERVIEW')),e('span',{style:m9()},(user.activityLog||[]).length+' TOTAL ACTIONS')),
        (user.activityLog||[]).length===0
          ? e('div',{style:{padding:'28px 20px',textAlign:'center'}},e('div',{style:{fontSize:28,marginBottom:10,opacity:0.35}},'📊'),e('div',{style:{fontSize:13,color:t.dimmer,lineHeight:1.7}},'No activities logged yet.\nHead to TRAIN to start building.'))
          : e('div',{style:{padding:'14px 15px',display:'flex',flexDirection:'column',gap:12}},
              [{label:'BODY',val:stats.body,color:t.accent2,icon:'💪',ids:['body']},{label:'MIND',val:stats.mind,color:t.accent,icon:'🧠',ids:['mind']},{label:'SOUL',val:stats.soul,color:t.streak,icon:'✨',ids:['soul']}].map(function(s){
                var sActs=cp.acts.filter(function(a){return a.stat===s.label.toLowerCase();});
                return e('div',{key:s.label},
                  e('div',{style:row({justifyContent:'space-between',marginBottom:6})},e('div',{style:row({gap:6})},e('span',{style:{fontSize:14}},s.icon),e('span',{style:{fontSize:12,fontWeight:600,color:s.color,fontFamily:"'DM Mono',monospace"}},s.label)),e('span',{style:mn(11,s.color,{fontWeight:600})},s.val+' actions')),
                  e('div',{style:{height:4,background:t.bd,borderRadius:2,overflow:'hidden',marginBottom:4}},e('div',{style:{height:'100%',width:(s.val/mx*100)+'%',background:s.color,borderRadius:2,transition:'width 1s ease'}})),
                  e('div',{style:mn(8,t.dimmer)},sActs.map(function(a){return a.label;}).join(' · '))
                );
              })
            )
      ),
      // Milestones
      e('div',{style:card},
        e('div',{style:cardH},e('div',{style:row({gap:7})},e('span',{style:{fontSize:13}},'🏆'),label('MILESTONES')),e('span',{style:m9()},streak+'d streak')),
        e('div',{style:{padding:'12px 14px',display:'flex',flexDirection:'column',gap:8}},
          cp.milestones.map(function(mil,i){
            var reached=streak>=mil.days;
            var locked=mil.pro&&!user.isPro&&!reached;
            return e('div',{key:i,onClick:function(){if(locked)setUpgrade('milestone');},style:{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:reached?'rgba(5,46,13,0.7)':locked?t.proBg:t.bg,border:'1px solid '+(reached?'#14532d':locked?t.proBd:t.bd),borderRadius:12,position:'relative',overflow:'hidden',cursor:locked?'pointer':'default',transition:'all 0.25s'}},
              cond(locked,e('div',{style:{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(3px)'}},e('div',{style:{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',background:t.proBg,border:'1px solid '+t.proBd,borderRadius:8,fontSize:9,color:t.proTxt,fontFamily:"'DM Mono',monospace"}},'♛ PRO — COMING SOON'))),
              e('div',{style:{width:38,height:38,background:reached?'rgba(5,46,13,0.8)':t.bg2,border:'1px solid '+(reached?'#166534':t.bd),borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}},mil.icon),
              e('div',{style:{flex:1}},
                e('div',{style:row({gap:6,marginBottom:2,flexWrap:'wrap'})},
                  e('span',{style:{fontSize:13,fontWeight:600,color:reached?'#4ade80':t.muted}},mil.label),
                  cond(reached,e('span',{style:{fontSize:8,background:'rgba(5,46,13,0.8)',border:'1px solid #166534',color:'#4ade80',borderRadius:4,padding:'2px 6px',fontFamily:"'DM Mono',monospace"}},'REACHED'))
                ),
                e('div',{style:{fontSize:12,color:reached?'#4ade80':t.dimmer}},mil.desc)
              ),
              e('div',{style:{textAlign:'right',flexShrink:0}},e('div',{style:mn(12,reached?'#22c55e':t.dim,{fontWeight:600})},'+'+mil.xp),e('div',{style:mn(8,t.dimmer)},mil.days+'D'))
            );
          })
        )
      )
    );
  }

  // ── PICK PAGE ───────────────────────────────────────────────────────────────
  var pageContent;
  if(tab==='HOME')pageContent=homePage();
  else if(tab==='JOURNAL')pageContent=journalPage();
  else if(tab==='TRAIN')pageContent=trainPage();
  else pageContent=progressPage();

  // ── INTERCEPT MODAL ─────────────────────────────────────────────────────────
  function interceptModal(){
    return e('div',{onClick:function(ev){if(ev.target===ev.currentTarget)setInterceptOpen(false);},style:{position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'flex-end',justifyContent:'center'}},
      e('div',{style:{width:'100%',maxWidth:480,background:t.bg,border:'1px solid #dc2626',borderTopLeftRadius:24,borderTopRightRadius:24,overflow:'hidden',maxHeight:'90vh',display:'flex',flexDirection:'column',animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)'}},
        e('div',{style:{width:36,height:4,background:'#7c2d12',borderRadius:2,margin:'12px auto 0'}}),
        e('div',{style:row({justifyContent:'space-between',padding:'12px 16px 10px',background:t.bg2,borderBottom:'1px solid '+t.bd,marginTop:4})},
          e('div',{style:row({gap:9})},
            e('div',{style:{width:28,height:28,background:'#150806',border:'1px solid #7c2d12',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}},'⚠'),
            e('div',null,e('div',{style:mn(11,'#fca5a5',{fontWeight:700,letterSpacing:'0.08em'})},'EMERGENCY INTERCEPT'),e('div',{style:mn(9,'#6b7280')},streak+'d streak · '+user.xp+' XP at risk'))
          ),
          e('button',{onClick:function(){setInterceptOpen(false);},style:{width:28,height:28,background:'transparent',border:'1px solid '+t.bd,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:t.dim,cursor:'pointer',fontSize:14}},'✕')
        ),
        e('div',{style:{flex:1,overflowY:'auto',padding:'14px 16px'}},
          e('div',{style:Object.assign({},mAI,{marginBottom:14,animation:'fadeUp 0.4s ease'})},cp.interceptGreet),
          e('div',{style:{background:t.bg,border:'1px solid '+t.bd,borderRadius:12,overflow:'hidden'}},
            e('div',{style:row({gap:5,padding:'8px 13px',borderBottom:'1px solid '+t.bd})},e('span',{style:{fontSize:10}},'🔒'),e('span',{style:m9()},cp.shadowLabel)),
            e('textarea',{style:ta,value:shadow,onChange:function(ev){setShadow(ev.target.value);},placeholder:cp.shadowPH,rows:3}),
            e('div',{style:row({justifyContent:'space-between',padding:'8px 13px',borderTop:'1px solid '+t.bd})},
              e('span',{style:m9()},shadow.length+' chars'),
              e('button',{onClick:function(){setInterceptOpen(false);setTimeout(doAnalyze,120);},disabled:!shadow.trim(),style:{display:'flex',alignItems:'center',gap:5,background:shadow.trim()?t.accentDim:t.bg2,border:'1px solid '+(shadow.trim()?t.accentBorder:t.bd),borderRadius:8,padding:'6px 12px',fontSize:9,fontWeight:700,color:shadow.trim()?t.accent:t.dim,fontFamily:"'DM Mono',monospace",cursor:shadow.trim()?'pointer':'default'}},'⚡ '+cp.analyzeBtn)
            )
          )
        ),
        e('div',{style:row({gap:8,padding:'10px 16px 20px',borderTop:'1px solid '+t.bd})},
          e('input',{value:chatInput,onChange:function(ev){setChatInput(ev.target.value);},onKeyDown:function(ev){if(ev.key==='Enter')sendChat();},placeholder:user.gender==='female'?"Or just tell me what's going on...":'Or just talk about it...',style:{flex:1,background:t.bg2,border:'1px solid '+t.bd,borderRadius:10,padding:'10px 14px',fontSize:13,color:t.muted,fontFamily:t.font}}),
          e('button',{onClick:sendChat,style:{width:36,height:36,background:t.accentDim,border:'1px solid '+t.accentBorder,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:t.accent,flexShrink:0,cursor:'pointer',fontSize:16}},'→')
        )
      )
    );
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return e('div',{style:{minHeight:'100vh',background:t.bg,color:t.text,fontFamily:t.font}},
    e('style',null,CSS),
    cond(toast,e(XPToast,{amount:toast||0,accent:t.accent,onDone:function(){setToast(null);}})),
    cond(lvlUp,e(LvlUp,{char:lvlUp||ch,t:t,onDone:function(){setLvlUp(null);}})),
    cond(upgrade,e(ProModal,{trigger:upgrade||'pro',t:t,onClose:function(){setUpgrade(null);}})),
    cond(showSettings,e(Settings,{user:user,t:t,onReset:doReset,onClose:function(){setShowSettings(false);}})),
    cond(offline,e(Offline,{t:t})),
    e('div',{style:{position:'relative',zIndex:1,maxWidth:560,margin:'0 auto',padding:'0 16px 100px'}},
      // Header
      e('header',{style:row({justifyContent:'space-between',paddingTop:16,paddingBottom:4})},
        e('div',{style:row({gap:9})},
          e('div',{style:{width:30,height:30,background:t.bg3,border:'1px solid '+t.bd2,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}},'🔒'),
          e('span',{style:{fontSize:15,fontWeight:700,letterSpacing:'0.2em',fontFamily:"'DM Mono',monospace"}},'SILO')
        ),
        e('div',{style:row({gap:8})},
          e('div',{style:row({gap:5,padding:'5px 11px',background:t.accentDim,border:'1px solid '+t.accentBorder,borderRadius:8})},e('span',{style:{fontSize:11}},'★'),e('span',{style:mn(11,t.accent,{fontWeight:600})},String(user.xp))),
          e('div',{style:row({gap:5,padding:'5px 11px',background:t.bg2,border:'1px solid '+t.bd,borderRadius:8})},e('span',{style:{fontSize:11}},'🔥'),e('span',{style:mn(11,t.streak,{fontWeight:600})},streak+'d')),
          e('button',{onClick:function(){setShowSettings(true);},style:{width:32,height:32,background:t.bg2,border:'1px solid '+t.bd,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',color:t.dim,cursor:'pointer',fontSize:14}},'⚙')
        )
      ),
      // Top nav
      e('nav',{style:{display:'flex',gap:2,margin:'10px 0 16px',background:t.bg2,border:'1px solid '+t.bd,borderRadius:12,padding:3}},
        TABS.map(function(tb){
          var on=tab===tb.id;
          return e('button',{key:tb.id,onClick:function(){setTab(tb.id);},style:{flex:1,padding:'9px 4px',background:on?t.accentDim:'transparent',border:'1px solid '+(on?t.accentBorder:'transparent'),borderRadius:10,fontSize:8,fontWeight:on?700:400,color:on?t.accent:t.dim,letterSpacing:'0.1em',fontFamily:"'DM Mono',monospace",display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',transition:'all 0.2s'}},e('span',{style:{fontSize:13}},tb.g),tb.label.toUpperCase());
        })
      ),
      pageContent,
      e('div',{style:{marginTop:20,display:'flex',justifyContent:'center',gap:12,fontSize:8,color:t.dimmer,letterSpacing:'0.12em',fontFamily:"'DM Mono',monospace"}},'SILO v8.0 · PRIVATE · ZERO-KNOWLEDGE')
    ),
    // Bottom nav
    e('nav',{style:{position:'fixed',bottom:0,left:0,right:0,zIndex:200,background:t.bg+'ee',borderTop:'1px solid '+t.bd,backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)'}},
      e('div',{style:{maxWidth:560,margin:'0 auto',display:'flex',padding:'8px 8px 12px'}},
        TABS.map(function(tb){
          var on=tab===tb.id;
          return e('button',{key:tb.id,onClick:function(){setTab(tb.id);},style:{flex:1,padding:'8px 4px 4px',background:'transparent',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer'}},
            e('span',{style:{fontSize:16,filter:on?'drop-shadow(0 0 8px '+t.accent+')':'none',transition:'filter 0.2s'}},tb.g),
            e('span',{style:mn(8,on?t.accent:t.dimmer,{fontWeight:on?700:400,transition:'color 0.2s'})},tb.label.toUpperCase()),
            cond(on,e('div',{style:{width:20,height:2,background:t.accent,borderRadius:1,marginTop:1}}))
          );
        })
      )
    ),
    cond(interceptOpen,interceptModal())
  );
}
