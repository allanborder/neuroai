// src/App.jsx — NeuroAI v5 · Premium Medical-Tech Edition

import { useState, useRef, useCallback, useEffect } from "react";

const API = "http://127.0.0.1:8000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Manrope:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #010812;
    --bg2:       #040f1f;
    --bg3:       #071526;
    --surface:   #0a1a30;
    --surface2:  #0d2040;
    --surface3:  #102548;
    --blue:      #3b82f6;
    --blue-b:    #60a5fa;
    --blue-d:    #2563eb;
    --cyan:      #22d3ee;
    --cyan-b:    #67e8f9;
    --green:     #10b981;
    --green-b:   #34d399;
    --amber:     #f59e0b;
    --amber-b:   #fbbf24;
    --red:       #ef4444;
    --red-b:     #f87171;
    --white:     #f0f8ff;
    --text:      #dbeafe;
    --text2:     #7aa8cc;
    --muted:     #3d6080;
    --border:    rgba(59,130,246,0.12);
    --border2:   rgba(59,130,246,0.28);
    --border3:   rgba(59,130,246,0.5);
    --mono:      'JetBrains Mono', monospace;
    --display:   'Syne', sans-serif;
    --body:      'Manrope', sans-serif;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--body); min-height: 100vh; overflow-x: hidden; -webkit-font-smoothing: antialiased; }

  /* ── BACKGROUND ── */
  .bg-grid { position:fixed; inset:0; z-index:0; pointer-events:none; background-image: linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px); background-size:60px 60px; }
  .bg-light { position:fixed; inset:0; z-index:0; pointer-events:none; background: radial-gradient(ellipse 70% 50% at 50% -10%,rgba(59,130,246,0.18) 0%,transparent 70%), radial-gradient(ellipse 40% 30% at 85% 60%,rgba(34,211,238,0.07) 0%,transparent 60%), radial-gradient(ellipse 30% 25% at 15% 70%,rgba(16,185,129,0.05) 0%,transparent 55%); }
  .bg-orbs { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
  .orb { position:absolute; border-radius:50%; filter:blur(100px); }
  .orb-1 { width:700px; height:700px; top:-20%; left:-10%; background:rgba(59,130,246,0.08); animation:driftA 22s ease-in-out infinite; }
  .orb-2 { width:500px; height:500px; top:30%; right:-8%; background:rgba(34,211,238,0.06); animation:driftB 28s ease-in-out infinite; }
  .orb-3 { width:400px; height:400px; bottom:5%; left:25%; background:rgba(16,185,129,0.05); animation:driftC 20s ease-in-out infinite; }
  @keyframes driftA { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,60px) scale(1.06)} 66%{transform:translate(-30px,100px) scale(0.96)} }
  @keyframes driftB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-60px,-50px) scale(1.1)} }
  @keyframes driftC { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(50px,-30px) scale(1.04)} 80%{transform:translate(-20px,40px) scale(0.94)} }
  #neural-canvas { position:fixed; inset:0; z-index:0; pointer-events:none; }
  .app { position:relative; z-index:1; }

  /* ── NAV ── */
  nav { position:sticky; top:0; z-index:200; height:68px; display:flex; align-items:center; justify-content:space-between; padding:0 3rem; background:rgba(1,8,18,0.75); backdrop-filter:blur(24px) saturate(1.4); border-bottom:1px solid var(--border); animation:navIn 0.8s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes navIn { from{transform:translateY(-100%);opacity:0} to{transform:translateY(0);opacity:1} }
  .nav-brand { display:flex; align-items:center; gap:12px; animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
  .nav-icon { width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg,var(--blue),var(--cyan)); display:flex; align-items:center; justify-content:center; font-size:17px; box-shadow:0 0 20px rgba(59,130,246,0.4); transition:box-shadow 0.3s,transform 0.3s; }
  .nav-icon:hover { box-shadow:0 0 32px rgba(59,130,246,0.65); transform:scale(1.06); }
  .nav-word { font-family:var(--display); font-size:1.15rem; font-weight:800; letter-spacing:-0.03em; }
  .nav-word em { color:var(--cyan); font-style:normal; }
  .nav-links { display:flex; align-items:center; gap:4px; animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
  .nav-link { font-family:var(--mono); font-size:0.72rem; color:var(--muted); padding:6px 14px; border-radius:7px; cursor:pointer; border:none; background:none; transition:color 0.2s,background 0.2s; }
  .nav-link:hover { color:var(--blue-b); background:rgba(59,130,246,0.08); }
  .nav-right { animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
  .live-badge { display:flex; align-items:center; gap:7px; font-family:var(--mono); font-size:0.7rem; color:var(--text2); background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.22); padding:5px 14px; border-radius:99px; }
  .live-dot { width:6px; height:6px; border-radius:50%; background:var(--green-b); box-shadow:0 0 8px var(--green-b); animation:livePulse 2.4s ease-in-out infinite; }
  @keyframes livePulse { 0%,100%{opacity:1;box-shadow:0 0 8px var(--green-b)} 50%{opacity:0.5;box-shadow:0 0 3px var(--green-b)} }

  /* ── HERO ── */
  .hero { max-width:1280px; margin:0 auto; padding:7rem 3rem 5rem; display:grid; grid-template-columns:1fr 1fr; gap:5rem; align-items:center; }
  @media(max-width:900px){ .hero{grid-template-columns:1fr;padding:4rem 1.5rem 3rem;gap:3rem;} }

  .hero-eye { display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:0.7rem; letter-spacing:0.1em; color:var(--cyan); text-transform:uppercase; border:1px solid rgba(34,211,238,0.25); background:rgba(34,211,238,0.06); padding:5px 14px; border-radius:99px; margin-bottom:1.75rem; animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
  .eye-dot { width:5px; height:5px; border-radius:50%; background:var(--cyan); animation:livePulse 2s infinite; }

  .hero-h1 { font-family:var(--display); font-size:clamp(3.2rem,5vw,5rem); font-weight:800; line-height:1.04; letter-spacing:-0.04em; margin-bottom:1.5rem; animation:fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.55s both; }
  .h1-blue { color:var(--blue-b); }
  .h1-dim  { color:var(--muted); font-weight:400; }

  .hero-p { font-size:1rem; line-height:1.85; color:var(--text2); max-width:460px; margin-bottom:2.25rem; animation:fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s both; }
  .hero-btns { display:flex; align-items:center; gap:12px; flex-wrap:wrap; animation:fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.85s both; }

  .btn-primary { display:inline-flex; align-items:center; gap:8px; padding:13px 26px; border-radius:10px; border:none; font-family:var(--body); font-size:0.9rem; font-weight:700; background:var(--blue); color:#fff; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.2s,box-shadow 0.2s; box-shadow:0 4px 20px rgba(59,130,246,0.35); }
  .btn-primary::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 60%); opacity:0; transition:opacity 0.25s; }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 34px rgba(59,130,246,0.5); }
  .btn-primary:hover::after { opacity:1; }
  .btn-primary:active { transform:translateY(0) scale(0.98); }
  .btn-ghost { display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:10px; font-family:var(--body); font-size:0.9rem; font-weight:600; background:transparent; color:var(--text2); border:1px solid var(--border2); cursor:pointer; transition:all 0.2s; }
  .btn-ghost:hover { color:var(--white); border-color:var(--border3); background:rgba(59,130,246,0.06); }

  /* ── METRICS ── */
  .metrics { display:grid; grid-template-columns:1fr 1fr; gap:12px; animation:fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s both; }
  .metric { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:1.4rem 1.5rem; position:relative; overflow:hidden; transition:border-color 0.3s,transform 0.3s,box-shadow 0.3s; cursor:default; }
  .metric::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(59,130,246,0.04) 0%,transparent 60%); opacity:0; transition:opacity 0.3s; }
  .metric:hover { border-color:var(--border2); transform:translateY(-3px); box-shadow:0 12px 40px rgba(59,130,246,0.12); }
  .metric:hover::before { opacity:1; }
  .metric.w2 { grid-column:1/-1; }
  .m-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:0.75rem; }
  .m-icon { font-size:1.1rem; }
  .m-tag { font-family:var(--mono); font-size:9px; color:var(--blue-b); background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2); padding:2px 8px; border-radius:99px; text-transform:uppercase; letter-spacing:0.08em; }
  .m-val { font-family:var(--display); font-size:2.4rem; font-weight:800; line-height:1; color:var(--white); letter-spacing:-0.04em; margin-bottom:0.3rem; }
  .m-label { font-family:var(--mono); font-size:0.68rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em; }
  .m-sub { font-size:0.76rem; color:var(--text2); margin-top:0.4rem; line-height:1.55; }
  .m-bar { height:3px; background:var(--surface3); border-radius:99px; overflow:hidden; margin-top:0.85rem; }
  .m-bar-fill { height:100%; border-radius:99px; width:0; background:linear-gradient(90deg,var(--blue),var(--cyan)); transition:width 1.2s cubic-bezier(0.16,1,0.3,1); }

  .chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:0.9rem; }
  .chip { font-family:var(--mono); font-size:9.5px; padding:3px 10px; border-radius:99px; border:1px solid var(--border); color:var(--text2); background:rgba(255,255,255,0.02); transition:all 0.2s; cursor:default; }
  .chip:hover { border-color:var(--border2); color:var(--blue-b); background:rgba(59,130,246,0.06); transform:translateY(-1px); }
  .chip.c { border-color:rgba(34,211,238,0.22); color:var(--cyan); }
  .chip.g { border-color:rgba(16,185,129,0.22); color:var(--green-b); }
  .chip.a { border-color:rgba(245,158,11,0.22); color:var(--amber-b); }

  /* ── SECTIONS ── */
  .section { max-width:1280px; margin:0 auto; padding:6rem 3rem; }
  @media(max-width:800px){ .section{padding:4rem 1.5rem;} }
  .s-label { display:inline-flex; align-items:center; gap:10px; font-family:var(--mono); font-size:0.68rem; color:var(--blue-b); text-transform:uppercase; letter-spacing:0.14em; margin-bottom:1.1rem; }
  .s-label::before { content:''; display:block; width:24px; height:1px; background:var(--blue-b); }
  .s-h2 { font-family:var(--display); font-size:clamp(2rem,3.5vw,3rem); font-weight:800; line-height:1.1; letter-spacing:-0.04em; margin-bottom:0.9rem; }
  .s-h2 .hl { color:var(--blue-b); }
  .s-p { font-size:0.96rem; color:var(--text2); line-height:1.85; max-width:580px; margin-bottom:3.5rem; }
  .divider { max-width:1280px; margin:0 auto; padding:0 3rem; }
  .divider hr { border:none; border-top:1px solid var(--border); }

  /* ── PIPELINE ── */
  .pipeline { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid var(--border); border-radius:20px; overflow:hidden; background:var(--surface); }
  @media(max-width:900px){ .pipeline{grid-template-columns:1fr 1fr;} }
  @media(max-width:480px){ .pipeline{grid-template-columns:1fr;} }
  .pipe-step { padding:2.25rem 2rem; border-right:1px solid var(--border); position:relative; transition:background 0.3s; }
  .pipe-step:last-child { border-right:none; }
  .pipe-step:hover { background:var(--surface2); }
  .pipe-step::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--blue),transparent); transform:scaleX(0); transform-origin:left; transition:transform 0.45s cubic-bezier(0.16,1,0.3,1); }
  .pipe-step:hover::after { transform:scaleX(1); }
  .pipe-num { font-family:var(--mono); font-size:0.65rem; color:var(--blue); letter-spacing:0.12em; margin-bottom:1.1rem; text-transform:uppercase; }
  .pipe-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:1.1rem; transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1); }
  .pipe-step:hover .pipe-icon { transform:scale(1.12); }
  .pipe-title { font-family:var(--display); font-size:0.95rem; font-weight:700; margin-bottom:0.5rem; }
  .pipe-desc  { font-size:0.78rem; color:var(--text2); line-height:1.75; }
  .pipe-stack { font-family:var(--mono); font-size:0.65rem; color:var(--blue-b); margin-top:1rem; }

  /* ── TECH CARDS ── */
  .tech-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
  @media(max-width:700px){ .tech-grid{grid-template-columns:1fr;} }
  .tech-card { background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:2rem; position:relative; overflow:hidden; transition:border-color 0.3s,transform 0.35s cubic-bezier(0.16,1,0.3,1),box-shadow 0.35s; }
  .tech-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--cc,var(--blue)),transparent); opacity:0; transition:opacity 0.3s; }
  .tech-card::after  { content:''; position:absolute; width:180px; height:180px; border-radius:50%; background:radial-gradient(circle,var(--cg,rgba(59,130,246,0.07)),transparent 70%); bottom:-60px; right:-60px; opacity:0; transition:opacity 0.4s; }
  .tech-card:hover { border-color:var(--border2); transform:translateY(-5px); box-shadow:0 20px 50px rgba(0,0,0,0.3); }
  .tech-card:hover::before { opacity:1; }
  .tech-card:hover::after  { opacity:1; }
  .tc-icon { font-size:2rem; margin-bottom:1.25rem; display:block; transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1); }
  .tech-card:hover .tc-icon { transform:scale(1.2); }
  .tc-name { font-family:var(--display); font-size:1.05rem; font-weight:700; margin-bottom:0.3rem; }
  .tc-role { font-family:var(--mono); font-size:0.65rem; color:var(--blue-b); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.9rem; }
  .tc-desc { font-size:0.8rem; color:var(--text2); line-height:1.75; }

  /* ── CONCEPTS ── */
  .concepts-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
  @media(max-width:700px){ .concepts-grid{grid-template-columns:1fr;} }
  .cc { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:1.6rem; display:flex; gap:1.1rem; align-items:flex-start; transition:border-color 0.3s,background 0.3s,transform 0.3s; }
  .cc:hover { border-color:var(--border2); background:var(--surface2); transform:translateX(5px); }
  .cc-badge { width:42px; height:42px; border-radius:11px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:18px; transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1); }
  .cc:hover .cc-badge { transform:scale(1.15) rotate(6deg); }
  .cc-title { font-family:var(--display); font-size:0.93rem; font-weight:700; margin-bottom:0.35rem; }
  .cc-desc  { font-size:0.78rem; color:var(--text2); line-height:1.75; }

  /* ── DEMO ── */
  .demo-shell { border:1px solid var(--border); border-radius:22px; overflow:hidden; background:var(--bg3); box-shadow:0 40px 100px rgba(0,0,0,0.4); }
  .demo-bar { padding:1.5rem 2.5rem; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; background:rgba(1,8,18,0.6); }
  .demo-title { font-family:var(--display); font-size:1.05rem; font-weight:700; }
  .demo-sub   { font-family:var(--mono); font-size:0.68rem; color:var(--muted); margin-top:0.2rem; }
  .demo-body  { padding:2rem 2.5rem; }
  @media(max-width:600px){ .demo-bar,.demo-body{padding:1.25rem;} }
  .demo-cols  { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; align-items:start; }
  @media(max-width:720px){ .demo-cols{grid-template-columns:1fr;} }

  /* ── UPLOAD ── */
  .upload-panel { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:1.5rem; }
  .panel-label  { font-family:var(--mono); font-size:0.65rem; text-transform:uppercase; letter-spacing:0.12em; color:var(--muted); margin-bottom:1rem; }

  .dropzone { border:1.5px dashed var(--border2); border-radius:12px; padding:2.5rem 1.5rem; text-align:center; cursor:pointer; transition:border-color 0.25s,background 0.25s; background:rgba(59,130,246,0.02); position:relative; overflow:hidden; }
  .dropzone:hover,.dropzone.over { border-color:var(--blue); background:rgba(59,130,246,0.05); }
  .dropzone::before { content:''; position:absolute; left:0; right:0; top:0; height:1.5px; background:linear-gradient(90deg,transparent 0%,var(--cyan) 30%,var(--blue) 70%,transparent 100%); opacity:0; animation:scan 3s ease-in-out infinite; }
  @keyframes scan { 0%{top:0%;opacity:0} 8%{opacity:0.9} 92%{opacity:0.9} 100%{top:100%;opacity:0} }
  .dz-icon { font-size:2.2rem; margin-bottom:0.85rem; display:block; transition:transform 0.5s cubic-bezier(0.34,1.2,0.64,1); }
  .dropzone:hover .dz-icon { transform:scale(1.1) translateY(-4px); }
  .dz-title { font-family:var(--display); font-size:0.95rem; font-weight:700; margin-bottom:0.3rem; }
  .dz-sub   { font-family:var(--mono); font-size:0.68rem; color:var(--muted); }

  .preview-box { position:relative; border-radius:10px; overflow:hidden; margin-top:1rem; border:1px solid var(--border); animation:fadeIn 0.4s ease; }
  .preview-box img { width:100%; max-height:200px; object-fit:cover; display:block; }
  .preview-box::after { content:''; position:absolute; left:0; right:0; top:0; height:2px; background:linear-gradient(90deg,transparent,var(--cyan),transparent); animation:scan 2.5s ease-in-out infinite; }
  .preview-lbl { position:absolute; top:8px; left:8px; font-family:var(--mono); font-size:0.65rem; background:rgba(1,8,18,0.9); border:1px solid var(--border2); color:var(--cyan); padding:3px 10px; border-radius:99px; }

  .run-btn { width:100%; margin-top:1rem; padding:13px; border-radius:11px; border:none; font-family:var(--body); font-size:0.9rem; font-weight:700; background:var(--blue); color:#fff; cursor:pointer; box-shadow:0 4px 20px rgba(59,130,246,0.3); position:relative; overflow:hidden; transition:transform 0.2s,box-shadow 0.2s; }
  .run-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 55%); opacity:0; transition:opacity 0.25s; }
  .run-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 32px rgba(59,130,246,0.48); }
  .run-btn:hover:not(:disabled)::after { opacity:1; }
  .run-btn:active:not(:disabled) { transform:translateY(0) scale(0.99); }
  .run-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .error-box { margin-top:0.75rem; padding:0.9rem 1.1rem; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.2); border-radius:10px; font-family:var(--mono); font-size:0.72rem; color:var(--red-b); line-height:1.65; animation:shake 0.4s ease; }
  @keyframes shake { 0%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} 100%{transform:translateX(0)} }

  /* ── RESULT ── */
  .result-panel { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:1.5rem; animation:resultIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes resultIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .diag-name { font-family:var(--display); font-size:2.1rem; font-weight:800; color:var(--blue-b); letter-spacing:-0.03em; margin-bottom:0.5rem; }
  .conf-pill { font-family:var(--mono); font-size:0.72rem; padding:4px 12px; border-radius:99px; border:1px solid; animation:pillPop 0.4s cubic-bezier(0.34,1.4,0.64,1) 0.2s both; display:inline-block; }
  @keyframes pillPop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  .ch { border-color:rgba(16,185,129,0.4); color:var(--green-b); background:rgba(16,185,129,0.08); }
  .cm { border-color:rgba(245,158,11,0.4);  color:var(--amber-b); background:rgba(245,158,11,0.08); }
  .cl { border-color:rgba(239,68,68,0.4);   color:var(--red-b);   background:rgba(239,68,68,0.08); }
  .urgency-row { display:flex; align-items:center; gap:8px; padding:9px 13px; border-radius:9px; border:1px solid var(--border); background:var(--bg2); margin:1rem 0; animation:fadeUp 0.4s ease 0.15s both; }
  .urg-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; animation:livePulse 1.8s infinite; }
  .urg-text { font-family:var(--mono); font-size:0.72rem; }
  .probs { margin-bottom:1.25rem; }
  .probs-label { font-family:var(--mono); font-size:0.65rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); margin-bottom:0.65rem; }
  .prob-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
  .prob-cls  { font-family:var(--mono); font-size:0.7rem; width:96px; flex-shrink:0; }
  .prob-track{ flex:1; height:4px; background:var(--surface3); border-radius:99px; overflow:hidden; }
  .prob-fill { height:100%; border-radius:99px; width:0; transition:width 1s cubic-bezier(0.16,1,0.3,1); }
  .prob-pct  { font-family:var(--mono); font-size:0.68rem; color:var(--muted); width:38px; text-align:right; flex-shrink:0; }
  .rep-label { font-family:var(--mono); font-size:0.65rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); margin-bottom:0.6rem; }
  .rep-body  { font-family:var(--mono); font-size:0.72rem; color:var(--text2); line-height:1.9; white-space:pre-wrap; background:var(--bg2); border:1px solid var(--border); border-radius:10px; padding:1.25rem; max-height:300px; overflow-y:auto; }
  .rep-body::-webkit-scrollbar { width:3px; }
  .rep-body::-webkit-scrollbar-thumb { background:var(--border2); border-radius:99px; }
  .disclaimer { margin-top:0.85rem; padding:9px 13px; border-radius:9px; border:1px solid rgba(239,68,68,0.15); background:rgba(239,68,68,0.04); font-family:var(--mono); font-size:0.66rem; color:rgba(239,68,68,0.65); line-height:1.65; }

  /* ── EMPTY / LOADING ── */
  .empty { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:3rem 1.5rem; text-align:center; }
  .empty-ico { font-size:2.2rem; margin-bottom:1rem; opacity:0.45; }
  .empty-txt { font-family:var(--mono); font-size:0.75rem; color:var(--muted); line-height:1.8; }
  .loading-panel { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:2.5rem 1.5rem; display:flex; flex-direction:column; align-items:center; gap:1.25rem; }
  .spin-svg { animation:spinIt 1s linear infinite; }
  @keyframes spinIt { to{transform:rotate(360deg)} }
  .step-pips { display:flex; gap:6px; }
  .pip { width:24px; height:3px; border-radius:99px; background:var(--surface3); transition:background 0.4s; }
  .pip.on   { background:var(--blue); }
  .pip.done { background:var(--green-b); }
  .load-txt { font-family:var(--mono); font-size:0.72rem; color:var(--muted); text-align:center; line-height:1.8; }

  /* ── SCROLL REVEAL ── */
  .rv  { opacity:0; transform:translateY(28px); transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1); }
  .rvl { opacity:0; transform:translateX(-24px); transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1); }
  .rvs { opacity:0; transform:scale(0.96); transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1),transform 0.6s cubic-bezier(0.16,1,0.3,1); }
  .rv.in,.rvl.in,.rvs.in { opacity:1; transform:none; }
  .sg > * { opacity:0; transform:translateY(22px); transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1),transform 0.6s cubic-bezier(0.16,1,0.3,1); }
  .sg.in > *:nth-child(1){ opacity:1;transform:none;transition-delay:0s; }
  .sg.in > *:nth-child(2){ opacity:1;transform:none;transition-delay:0.08s; }
  .sg.in > *:nth-child(3){ opacity:1;transform:none;transition-delay:0.16s; }
  .sg.in > *:nth-child(4){ opacity:1;transform:none;transition-delay:0.24s; }
  .sg.in > *:nth-child(5){ opacity:1;transform:none;transition-delay:0.32s; }
  .sg.in > *:nth-child(6){ opacity:1;transform:none;transition-delay:0.40s; }

  /* ── FOOTER ── */
  footer { border-top:1px solid var(--border); padding:3rem; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:2rem; }
  @media(max-width:700px){ footer{grid-template-columns:1fr;text-align:center;} }
  .foot-logo { display:flex; align-items:center; gap:10px; margin-bottom:0.5rem; }
  .foot-icon { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,var(--blue),var(--cyan)); display:flex; align-items:center; justify-content:center; font-size:14px; box-shadow:0 0 14px rgba(59,130,246,0.3); }
  .foot-name { font-family:var(--display); font-size:1rem; font-weight:800; }
  .foot-name em { color:var(--cyan); font-style:normal; }
  .foot-tag  { font-family:var(--mono); font-size:0.68rem; color:var(--muted); }

  /* Developer centre-piece */
  .dev-credit { text-align:center; }
  .dev-by     { font-family:var(--mono); font-size:0.63rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.14em; margin-bottom:0.35rem; }
  .dev-name   { font-family:var(--display); font-size:1.15rem; font-weight:800; color:var(--white); letter-spacing:-0.02em; }
  .dev-role   { font-family:var(--mono); font-size:0.68rem; color:var(--blue-b); margin-top:0.15rem; }
  .dev-badge  { display:inline-flex; align-items:center; gap:6px; margin-top:0.6rem; font-family:var(--mono); font-size:0.63rem; background:rgba(59,130,246,0.1); border:1px solid var(--border2); color:var(--blue-b); padding:4px 12px; border-radius:99px; }
  .foot-stack { text-align:right; }
  .foot-stack p { font-family:var(--mono); font-size:0.65rem; color:var(--muted); line-height:1.9; }
  @media(max-width:700px){ .foot-stack{text-align:center;} }

  /* ── UTILS ── */
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
`;

const CLASS_COLORS = {
  Glioma:     ["#ef4444","#f87171"],
  Meningioma: ["#3b82f6","#60a5fa"],
  "No Tumor": ["#10b981","#34d399"],
  Pituitary:  ["#f59e0b","#fbbf24"],
};

const PIPELINE = [
  { num:"01", icon:"🖼️", bg:"rgba(59,130,246,0.1)",  title:"MRI Upload",    desc:"User uploads a brain MRI. Image streams to the FastAPI backend via multipart form.",                                          tech:"FastAPI · REST" },
  { num:"02", icon:"⚙️", bg:"rgba(34,211,238,0.1)",  title:"Preprocessing", desc:"Resized to 224×224, float32 tensor, then EfficientNet's preprocess_input — matching training exactly.",                    tech:"Pillow · NumPy · Keras" },
  { num:"03", icon:"🧠", bg:"rgba(16,185,129,0.1)",  title:"CNN Inference", desc:"EfficientNetB0 + custom classifier head predicts probabilities across 4 tumor classes via fine-tuned transfer learning.", tech:"TensorFlow · EfficientNetB0" },
  { num:"04", icon:"✨", bg:"rgba(245,158,11,0.1)",  title:"LLM Report",    desc:"Predictions injected into a structured prompt. Local Mistral 7B generates a 5-section clinical diagnostic report.",       tech:"Mistral 7B · Ollama" },
];

const TECH = [
  { icon:"🔬", name:"EfficientNetB0", role:"CNN Backbone", desc:"Pre-trained on ImageNet, fine-tuned on 3,000+ brain MRI scans with 2-phase training. 95%+ validation accuracy.", cc:"rgba(34,211,238,0.7)", cg:"rgba(34,211,238,0.07)", chips:[{l:"Transfer Learning"},{l:"Fine-Tuning"},{l:"ImageNet"}] },
  { icon:"🤖", name:"Mistral 7B",     role:"Local LLM",    desc:"Runs 100% offline via Ollama. Generates structured diagnostic reports — zero cloud, full privacy, no API keys.",  cc:"rgba(167,139,250,0.7)", cg:"rgba(167,139,250,0.07)", chips:[{l:"Generative AI"},{l:"Local Inference"},{l:"Ollama"}] },
  { icon:"⚡", name:"FastAPI + React", role:"Full Stack",   desc:"Async FastAPI backend with Pydantic validation. React frontend with real-time result rendering.",                  cc:"rgba(16,185,129,0.7)",  cg:"rgba(16,185,129,0.07)",  chips:[{l:"FastAPI"},{l:"React"},{l:"Python"}] },
];

const CONCEPTS = [
  { icon:"🔁", bg:"rgba(59,130,246,0.1)",  title:"Transfer Learning",       desc:"EfficientNetB0 ImageNet weights adapted for medical imaging via domain-specific 2-phase fine-tuning." },
  { icon:"💬", bg:"rgba(34,211,238,0.1)",  title:"Prompt Engineering",       desc:"Structured prompts inject CNN predictions, confidence scores, and probabilities into Mistral for clinically-framed reports." },
  { icon:"🔒", bg:"rgba(16,185,129,0.1)",  title:"Local LLM Inference",      desc:"Mistral 7B runs entirely on-device via Ollama. No API keys, no cloud — fully private GenAI." },
  { icon:"⚖️", bg:"rgba(245,158,11,0.1)",  title:"Class Imbalance Handling", desc:"Balanced class weights from training distribution ensure minority classes aren't under-represented during gradient updates." },
  { icon:"🎯", bg:"rgba(239,68,68,0.1)",   title:"Two-Phase Fine-Tuning",    desc:"Phase 1 trains classifier head. Phase 2 unfreezes last 60 EfficientNet layers at 5e-6 learning rate." },
  { icon:"📊", bg:"rgba(59,130,246,0.1)",  title:"Softmax Confidence",       desc:"Calibrated class probabilities let the LLM reason about uncertainty and flag low-confidence predictions." },
];

/* ── NEURAL CANVAS ── */
function NeuralCanvas() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight, raf;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    const N = Array.from({length:50}, () => ({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.28, r:Math.random()*1.5+0.8, p:Math.random()*Math.PI*2 }));
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      N.forEach(n => { n.x+=n.vx; n.y+=n.vy; n.p+=0.018; if(n.x<0||n.x>W) n.vx*=-1; if(n.y<0||n.y>H) n.vy*=-1; });
      for(let i=0;i<N.length;i++) for(let j=i+1;j<N.length;j++) {
        const dx=N[i].x-N[j].x, dy=N[i].y-N[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<130){ ctx.strokeStyle=`rgba(59,130,246,${(1-d/130)*.15})`; ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(N[i].x,N[i].y); ctx.lineTo(N[j].x,N[j].y); ctx.stroke(); }
      }
      N.forEach(n => { const g=.5+.5*Math.sin(n.p); ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=`rgba(59,130,246,${.2+g*.25})`; ctx.fill(); });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} id="neural-canvas" />;
}

/* ── COUNTER ── */
function Counter({ to, suffix="" }) {
  const [v, setV] = useState(0), ref = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if(!e.isIntersecting) return; obs.disconnect();
      const n=parseFloat(to), t0=performance.now(), dur=1400;
      const tick = now => { const p=Math.min((now-t0)/dur,1), ease=1-Math.pow(1-p,3); setV(Number.isInteger(n)?Math.round(n*ease):(n*ease).toFixed(1)); if(p<1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, {threshold:.5});
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

/* ── REVEAL ── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".rv,.rvl,.rvs,.sg");
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add("in"); obs.unobserve(e.target); } }), {threshold:.1});
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── DROPZONE ── */
function DropZone({ onFile, preview }) {
  const [over, setOver] = useState(false), inp = useRef();
  const drop = useCallback(e => { e.preventDefault(); setOver(false); const f=e.dataTransfer.files[0]; if(f) onFile(f); }, [onFile]);
  return (
    <>
      <div className={`dropzone${over?" over":""}`} onDragOver={e=>{e.preventDefault();setOver(true);}} onDragLeave={()=>setOver(false)} onDrop={drop} onClick={()=>inp.current.click()}>
        <span className="dz-icon">🧠</span>
        <div className="dz-title">Drop MRI scan here</div>
        <div className="dz-sub">or click to browse · JPG, PNG</div>
        <input ref={inp} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&onFile(e.target.files[0])} />
      </div>
      {preview && <div className="preview-box"><img src={preview} alt="MRI"/><span className="preview-lbl">MRI SCAN LOADED</span></div>}
    </>
  );
}

/* ── PROB BARS ── */
function ProbBars({ probs }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t=setTimeout(()=>setGo(true),80); return ()=>clearTimeout(t); }, []);
  return (
    <div className="probs">
      <div className="probs-label">// class probabilities</div>
      {Object.entries(probs).map(([cls,val],i) => {
        const [a,b] = CLASS_COLORS[cls]||["#3b82f6","#60a5fa"];
        return (
          <div key={cls} className="prob-row">
            <span className="prob-cls">{cls}</span>
            <div className="prob-track"><div className="prob-fill" style={{width:go?`${val}%`:"0%",background:`linear-gradient(90deg,${a},${b})`,transition:`width 1s cubic-bezier(0.16,1,0.3,1) ${i*.1}s`}}/></div>
            <span className="prob-pct">{val}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── LOADING ── */
function Loading({ step }) {
  return (
    <div className="loading-panel">
      <div className="step-pips">
        <div className={`pip ${step===0?"on":step>0?"done":""}`}/>
        <div className={`pip ${step===1?"on":step>1?"done":""}`}/>
      </div>
      <svg className="spin-svg" width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="2.5"/>
        <circle cx="22" cy="22" r="18" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="72 42" strokeLinecap="round"/>
      </svg>
      <div className="load-txt">{step===0?"Step 1 / 2 — EfficientNetB0 classifying scan…":"Step 2 / 2 — Mistral 7B generating report…"}</div>
    </div>
  );
}

/* ── APP ── */
export default function App() {
  const [file,setFile]=useState(null),[preview,setPreview]=useState(null);
  const [loading,setLoading]=useState(false),[step,setStep]=useState(0);
  const [result,setResult]=useState(null),[error,setError]=useState(null);

  useReveal();

  const handleFile = f => { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError(null); };
  const run = async () => {
    if(!file) return;
    setLoading(true); setError(null); setResult(null); setStep(0);
    try {
      const fd=new FormData(); fd.append("file",file);
      const timer=setTimeout(()=>setStep(1),2000);
      const res=await fetch(`${API}/diagnose`,{method:"POST",body:fd});
      clearTimeout(timer);
      if(!res.ok) throw new Error(`Server error ${res.status}`);
      setResult(await res.json());
    } catch(e){ setError(e.message); } finally { setLoading(false); }
  };

  const confCls = p => p>=80?"ch":p>=60?"cm":"cl";
  const urgCol  = (u="") => u.startsWith("HIGH")?"#ef4444":u.startsWith("MODERATE")?"#f59e0b":"#10b981";
  const scroll  = id => document.getElementById(id)?.scrollIntoView({behavior:"smooth"});

  return (
    <>
      <style>{styles}</style>
      <div className="bg-grid"/>
      <div className="bg-light"/>
      <div className="bg-orbs"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/></div>
      <NeuralCanvas/>

      <div className="app">

        {/* NAV */}
        <nav>
          <div className="nav-brand">
            <div className="nav-icon">🧠</div>
            <div className="nav-word">Neuro<em>AI</em></div>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={()=>scroll("how-it-works")}>Pipeline</button>
            <button className="nav-link" onClick={()=>scroll("tech-stack")}>Stack</button>
            <button className="nav-link" onClick={()=>scroll("demo")}>Demo</button>
          </div>
          <div className="nav-right">
            <div className="live-badge"><div className="live-dot"/>Live · Mistral 7B</div>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero">
          <div>
            <div className="hero-eye"><div className="eye-dot"/>Generative AI · Medical Imaging</div>
            <h1 className="hero-h1">Brain Tumor<br/><span className="h1-blue">Detection</span><br/><span className="h1-dim">Powered by Local AI</span></h1>
            <p className="hero-p">Upload a brain MRI scan. EfficientNetB0 classifies the tumor type with 95%+ accuracy. Mistral 7B generates a full clinical diagnostic report — no cloud, no API keys, 100% private.</p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={()=>scroll("demo")}>Try the Demo →</button>
              <button className="btn-ghost"   onClick={()=>scroll("how-it-works")}>How it works</button>
            </div>
          </div>

          <div className="metrics sg">
            <div className="metric">
              <div className="m-top"><span className="m-icon">🎯</span><span className="m-tag">CNN</span></div>
              <div className="m-val"><Counter to={95} suffix="%"/></div>
              <div className="m-label">Validation Accuracy</div>
              <div className="m-bar"><div className="m-bar-fill" id="acc-bar"/></div>
              <div className="m-sub">2-phase fine-tuning on 3,000+ labeled MRI scans</div>
            </div>
            <div className="metric">
              <div className="m-top"><span className="m-icon">🔬</span><span className="m-tag">Classes</span></div>
              <div className="m-val"><Counter to={4}/></div>
              <div className="m-label">Tumor Classes</div>
              <div className="m-sub">Glioma · Meningioma · Pituitary · No Tumor</div>
            </div>
            <div className="metric">
              <div className="m-top"><span className="m-icon">🤖</span><span className="m-tag">LLM</span></div>
              <div className="m-val"><Counter to={7} suffix="B"/></div>
              <div className="m-label">LLM Parameters</div>
              <div className="m-sub">Mistral 7B running locally via Ollama</div>
            </div>
            <div className="metric">
              <div className="m-top"><span className="m-icon">🔒</span><span className="m-tag">Privacy</span></div>
              <div className="m-val"><Counter to={100} suffix="%"/></div>
              <div className="m-label">Local Inference</div>
              <div className="m-sub">No API keys. No data leaves your machine.</div>
            </div>
            <div className="metric w2">
              <div className="m-label" style={{marginBottom:"0.75rem"}}>// full stack</div>
              <div className="chips">
                <span className="chip c">EfficientNetB0</span><span className="chip c">TensorFlow 2.x</span>
                <span className="chip">Mistral 7B</span><span className="chip">Ollama</span>
                <span className="chip g">FastAPI</span><span className="chip g">React</span>
                <span className="chip a">Transfer Learning</span><span className="chip a">Fine-Tuning</span>
              </div>
            </div>
          </div>
        </div>

        <div className="divider"><hr/></div>

        {/* PIPELINE */}
        <section id="how-it-works" className="section">
          <div className="s-label rv">Pipeline</div>
          <h2 className="s-h2 rv">How It <span className="hl">Works</span></h2>
          <p className="s-p rv">A four-stage pipeline connects computer vision and generative AI to produce structured clinical reports from raw MRI images — fully local.</p>
          <div className="pipeline sg">
            {PIPELINE.map(s => (
              <div className="pipe-step" key={s.num}>
                <div className="pipe-num">STEP {s.num}</div>
                <div className="pipe-icon" style={{background:s.bg}}>{s.icon}</div>
                <div className="pipe-title">{s.title}</div>
                <div className="pipe-desc">{s.desc}</div>
                <div className="pipe-stack">→ {s.tech}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider"><hr/></div>

        {/* TECH STACK */}
        <section id="tech-stack" className="section">
          <div className="s-label rv">Architecture</div>
          <h2 className="s-h2 rv">Tech <span className="hl">Stack</span></h2>
          <p className="s-p rv">Three core components working in concert for end-to-end medical image intelligence.</p>
          <div className="tech-grid sg" style={{marginBottom:"4rem"}}>
            {TECH.map(t => (
              <div className="tech-card" key={t.name} style={{"--cc":t.cc,"--cg":t.cg}}>
                <span className="tc-icon">{t.icon}</span>
                <div className="tc-name">{t.name}</div>
                <div className="tc-role">{t.role}</div>
                <div className="tc-desc">{t.desc}</div>
                <div className="chips" style={{marginTop:"1rem"}}>{t.chips.map(c=><span key={c.l} className="chip">{c.l}</span>)}</div>
              </div>
            ))}
          </div>
          <div className="s-label rv">AI Concepts</div>
          <h2 className="s-h2 rv" style={{fontSize:"clamp(1.6rem,3vw,2.4rem)"}}>What makes this a <span className="hl">GenAI</span> project</h2>
          <p className="s-p rv">Discriminative AI (CNN classification) combined with generative AI (LLM synthesis) — a real-world Compound AI System.</p>
          <div className="concepts-grid sg">
            {CONCEPTS.map(c => (
              <div className="cc" key={c.title}>
                <div className="cc-badge" style={{background:c.bg}}>{c.icon}</div>
                <div><div className="cc-title">{c.title}</div><div className="cc-desc">{c.desc}</div></div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider"><hr/></div>

        {/* DEMO */}
        <section id="demo" className="section">
          <div className="s-label rv">Live Demo</div>
          <h2 className="s-h2 rv">Run a <span className="hl">Diagnosis</span></h2>
          <p className="s-p rv">Upload any brain MRI scan. The CNN classifies it and Mistral generates a full structured report.</p>
          <div className="demo-shell rvs">
            <div className="demo-bar">
              <div>
                <div className="demo-title">Brain MRI Classifier + Report Generator</div>
                <div className="demo-sub">// EfficientNetB0 → Mistral 7B → Clinical Report</div>
              </div>
              <div className="live-badge"><div className="live-dot"/>localhost:8000</div>
            </div>
            <div className="demo-body">
              <div className="demo-cols">
                <div className="upload-panel">
                  <div className="panel-label">// upload mri scan</div>
                  <DropZone onFile={handleFile} preview={preview}/>
                  <button className="run-btn" onClick={run} disabled={!file||loading}>{loading?"Analyzing…":"Run Diagnosis →"}</button>
                  {error && <div className="error-box">⚠ {error}<br/>Check FastAPI on localhost:8000 and Ollama is active.</div>}
                </div>
                <div>
                  {!file&&!loading&&!result&&(
                    <div className="empty"><div className="empty-ico">📋</div><div className="empty-txt">Upload an MRI scan to see the CNN classification<br/>and AI-generated diagnostic report here.</div></div>
                  )}
                  {loading && <Loading step={step}/>}
                  {result&&!loading&&(
                    <div className="result-panel">
                      <div className="diag-name">{result.diagnosis}</div>
                      <div style={{marginBottom:"1rem"}}><span className={`conf-pill ${confCls(result.confidence)}`}>{result.confidence}% confidence</span></div>
                      {result.urgency&&(
                        <div className="urgency-row">
                          <div className="urg-dot" style={{background:urgCol(result.urgency),boxShadow:`0 0 6px ${urgCol(result.urgency)}`}}/>
                          <span className="urg-text">{result.urgency}</span>
                        </div>
                      )}
                      {result.all_probabilities&&<ProbBars probs={result.all_probabilities}/>}
                      <div className="rep-label">// mistral 7b · diagnostic report</div>
                      <div className="rep-body">{result.generated_report?.split("⚠️ DISCLAIMER:")[0].trim()}</div>
                      <div className="disclaimer">⚠ AI-generated for educational purposes only. Not a substitute for professional medical diagnosis.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div>
            <div className="foot-logo">
              <div className="foot-icon">🧠</div>
              <div className="foot-name">Neuro<em>AI</em></div>
            </div>
            <div className="foot-tag">Generative AI · Medical Imaging System</div>
          </div>

          {/* ── DEVELOPER CREDIT ── */}
          <div className="dev-credit">
            <div className="dev-by">Developed by</div>
            <div className="dev-name">Allanpaulraj V</div>
            <div className="dev-role">AI / Full-Stack Developer</div>
            <div className="dev-badge"><div className="live-dot"/>NeuroAI · 2025</div>
          </div>

          <div className="foot-stack">
            <p>CNN: EfficientNetB0 · TensorFlow · Transfer Learning</p>
            <p>LLM: Mistral 7B · Ollama · Prompt Engineering</p>
            <p>Stack: FastAPI · React · Python · REST API</p>
          </div>
        </footer>

      </div>

      <AccBar/>
    </>
  );
}

function AccBar() {
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){ e.target.style.width="95%"; obs.disconnect(); } }, {threshold:.5});
    const el = document.getElementById("acc-bar");
    if(el) obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return null;
}