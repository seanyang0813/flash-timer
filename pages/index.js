import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { const x = clamp(t); return x * x * (3 - 2 * x); };
const TAU = Math.PI * 2;
const COLORS = ['#70f3d2', '#69dcff', '#829dff', '#a286ff', '#d275e8', '#f878c2', '#ff8e99', '#ffc26f'];
const SCENES = [
  { tag: 'POWER TWIST', title: 'Twist the fiber.\nNot the manifold.', formula: 'Wₙ = F · Fᵈⁿ' },
  { tag: 'CLASSIFICATION', title: 'Only the sign\ndisappears.', formula: 'Wₘ ≅ Wₙ  ⇔  |m| = |n|' },
  { tag: 'EXTENSION', title: 'Repair. Barbell.\nExtend.', formula: 'Φ|Σ = d   ⇒   E = ℤ' },
  { tag: 'THE PUNCHLINE', title: 'One manifold.\nInfinite fibrations.', formula: 'Xₙ ≅⁺ E(1,1),  ∀n ∈ ℤ' },
];

function pathOuter(ctx) {
  ctx.moveTo(70, 320);
  ctx.bezierCurveTo(70, 150, 255, 75, 390, 166);
  ctx.bezierCurveTo(456, 211, 544, 211, 610, 166);
  ctx.bezierCurveTo(745, 75, 930, 150, 930, 320);
  ctx.bezierCurveTo(930, 490, 745, 565, 610, 474);
  ctx.bezierCurveTo(544, 429, 456, 429, 390, 474);
  ctx.bezierCurveTo(255, 565, 70, 490, 70, 320);
}

function drawGenus(ctx, alpha = 1, stroke = '#9dfae4', line = 2) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.beginPath();
  pathOuter(ctx);
  ctx.closePath();
  ctx.ellipse(280, 320, 108, 87, 0, 0, TAU, true);
  ctx.ellipse(720, 320, 108, 87, 0, 0, TAU, true);
  const g = ctx.createLinearGradient(90, 130, 900, 520);
  g.addColorStop(0, 'rgba(30,73,83,.76)');
  g.addColorStop(.5, 'rgba(31,28,65,.78)');
  g.addColorStop(1, 'rgba(86,28,61,.72)');
  ctx.fillStyle = g;
  ctx.shadowColor = 'rgba(133,116,255,.28)';
  ctx.shadowBlur = 35;
  ctx.fill('evenodd');
  ctx.shadowBlur = 0;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = line;
  ctx.globalAlpha *= .65;
  ctx.beginPath(); pathOuter(ctx); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(280, 320, 108, 87, 0, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(720, 320, 108, 87, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}

function fit(ctx, w, h) {
  const s = Math.min(w / 1100, h / 720);
  ctx.translate(w / 2, h / 2 + 28);
  ctx.scale(s, s);
  ctx.translate(-500, -320);
  return s;
}

function drawArrow(ctx, cx, cy, rx, ry, start, end, color, width = 3, dash = []) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, start, end);
  ctx.stroke();
  const a = end;
  const x = cx + rx * Math.cos(a);
  const y = cy + ry * Math.sin(a);
  const tx = -rx * Math.sin(a), ty = ry * Math.cos(a);
  const angle = Math.atan2(ty, tx);
  ctx.setLineDash([]);
  ctx.translate(x, y); ctx.rotate(angle);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-11, -5); ctx.lineTo(-9, 6); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawBackground(ctx, w, h, time, particles, scene, pointer) {
  const hues = [166, 252, 326, 44];
  const hue = hues[scene];
  const bg = ctx.createRadialGradient(w * (.5 + pointer.x * .015), h * (.48 + pointer.y * .015), 0, w * .5, h * .5, Math.max(w, h) * .78);
  bg.addColorStop(0, `hsla(${hue},80%,45%,.10)`);
  bg.addColorStop(.35, `hsla(${(hue + 70) % 360},70%,38%,.045)`);
  bg.addColorStop(1, '#05060e');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  particles.forEach((p, i) => {
    const x = p.x * w + pointer.x * p.d * 18 + Math.sin(time * .00035 + p.ph) * 4;
    const y = p.y * h + pointer.y * p.d * 13 + Math.cos(time * .00028 + p.ph) * 3;
    ctx.fillStyle = `hsla(${(hue + i * 3) % 360},90%,78%,${.06 + p.d * .22})`;
    ctx.beginPath(); ctx.arc(x, y, p.r * p.d, 0, TAU); ctx.fill();
  });
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.025)'; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 72) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 72) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
}

function drawTwist(ctx, w, h, time, n) {
  ctx.save(); fit(ctx, w, h); drawGenus(ctx, .92);
  ctx.globalAlpha = .55;
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.4; ctx.setLineDash([4, 8]);
  ctx.beginPath(); ctx.ellipse(500, 320, 153, 240, 0, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(500, 320, 91, 157, 0, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowColor = '#9c88ff'; ctx.shadowBlur = 14; ctx.strokeStyle = '#9c88ff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(500, 320, 121, 198, 0, 0, TAU); ctx.stroke(); ctx.shadowBlur = 0;
  for (let j = 0; j < 13; j += 1) {
    const theta0 = j / 13 * TAU;
    ctx.beginPath();
    for (let i = 0; i <= 115; i += 1) {
      const u = i / 115, e = smooth(u), rx = 148 - 56 * u, ry = 235 - 79 * u;
      const a = theta0 + TAU * n * e;
      const x = 500 + rx * Math.cos(a), y = 320 + ry * Math.sin(a);
      if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = COLORS[j % COLORS.length]; ctx.globalAlpha = .34 + Math.min(1, Math.abs(n) / 5) * .42;
    ctx.lineWidth = 1.3 + Math.min(1, Math.abs(n) / 6);
    ctx.setLineDash([6, 7]); ctx.lineDashOffset = -time * .025 - j * 7; ctx.stroke();
    const u = (time * .00008 + j / 13) % 1, e = smooth(u), rx = 148 - 56 * u, ry = 235 - 79 * u, a = theta0 + TAU * n * e;
    ctx.setLineDash([]); ctx.fillStyle = COLORS[j % COLORS.length]; ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.arc(500 + rx * Math.cos(a), 320 + ry * Math.sin(a), 2.4, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.fillStyle = '#080914'; ctx.strokeStyle = '#9c88ff'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(500, 320, 29, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#dad4ff'; ctx.font = 'italic 25px Georgia'; ctx.textAlign = 'center'; ctx.fillText('δ', 500, 329);
  ctx.fillStyle = 'rgba(255,255,255,.68)'; ctx.font = 'italic 27px Georgia'; ctx.fillText('F', 280, 330); ctx.fillText('Fᵈⁿ', 720, 330);
  ctx.restore();
}

function drawClassify(ctx, w, h, age, m, n) {
  ctx.save(); fit(ctx, w, h);
  const fold = smooth(clamp((age - 450) / 1550));
  ctx.strokeStyle = 'rgba(255,255,255,.13)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(70, 320); ctx.lineTo(930, 320); ctx.stroke();
  for (let mag = 0; mag <= 5; mag += 1) {
    const x = 150 + mag * 145;
    ctx.globalAlpha = fold * .7; ctx.setLineDash([3, 7]); ctx.beginPath(); ctx.arc(x, 320, 32, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,.38)'; ctx.font = '10px ui-monospace'; ctx.textAlign = 'center'; ctx.fillText(`|n|=${mag}`, x, 390);
  }
  for (let value = -5; value <= 5; value += 1) {
    const x0 = 100 + (value + 5) * 80, x1 = 150 + Math.abs(value) * 145;
    const x = lerp(x0, x1, fold), y = 320 + lerp(0, value < 0 ? -10 : value > 0 ? 10 : 0, fold);
    const c = COLORS[Math.abs(value) % COLORS.length], selected = value === m || value === n;
    ctx.globalAlpha = .25 + (selected ? .75 : .45); ctx.shadowColor = c; ctx.shadowBlur = selected ? 20 : 0;
    ctx.fillStyle = '#070812'; ctx.strokeStyle = c; ctx.lineWidth = selected ? 3 : 1.6;
    ctx.beginPath(); ctx.arc(x, y, selected ? 22 : 16, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = c; ctx.font = `700 ${selected ? 13 : 11}px ui-monospace`; ctx.textAlign = 'center'; ctx.fillText(value, x, y + 4);
  }
  for (let mag = 1; mag <= 5; mag += 1) {
    const a0 = 100 + (-mag + 5) * 80, b0 = 100 + (mag + 5) * 80, x1 = 150 + mag * 145;
    const ax = lerp(a0, x1, fold), bx = lerp(b0, x1, fold);
    ctx.globalAlpha = .08 + fold * .38; ctx.strokeStyle = COLORS[mag]; ctx.setLineDash([3, 8]);
    ctx.beginPath(); ctx.moveTo(ax, 310); ctx.quadraticCurveTo((ax + bx) / 2, 170 - mag * 6, bx, 330); ctx.stroke();
  }
  ctx.setLineDash([]); ctx.globalAlpha = .9;
  const equal = Math.abs(m) === Math.abs(n); ctx.fillStyle = equal ? '#70f3d2' : '#ff839c'; ctx.font = '52px Georgia'; ctx.textAlign = 'center'; ctx.fillText(equal ? '≅' : '≄', 500, 522);
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '23px Georgia'; ctx.fillText(`W${m}       W${n}`, 500, 520);
  ctx.restore();
}

function drawProof(ctx, w, h, time, p) {
  ctx.save(); fit(ctx, w, h);
  const a = smooth(clamp(p / .34)), b = smooth(clamp((p - .29) / .37)), c = smooth(clamp((p - .62) / .38));
  if (p < .42) {
    ctx.globalAlpha = 1 - smooth(clamp((p - .34) / .08));
    ctx.fillStyle = 'rgba(27,41,60,.72)'; ctx.strokeStyle = 'rgba(112,243,210,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(180, 170, 640, 300, 150); ctx.fill(); ctx.stroke();
    [[180,320,70,95],[820,320,70,95],[420,320,47,47],[580,320,47,47]].forEach(([x,y,rx,ry]) => { ctx.fillStyle = '#060711'; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,TAU); ctx.fill(); ctx.stroke(); });
    [420,580].forEach((x,i) => { const y = lerp(80,320,smooth(clamp((a-.12-i*.08)/.6))); ctx.fillStyle='rgba(112,243,210,.18)'; ctx.strokeStyle='#70f3d2'; ctx.beginPath(); ctx.arc(x,y,40,0,TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle='#70f3d2'; ctx.beginPath();ctx.arc(x,y,5,0,TAU);ctx.fill(); });
    ctx.strokeStyle='#9a88ff';ctx.setLineDash([7,7]);ctx.lineDashOffset=-time*.02;ctx.beginPath();ctx.moveTo(210,320);ctx.bezierCurveTo(330,180,430,320,500,320);ctx.bezierCurveTo(570,320,670,460,790,320);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='700 12px ui-sans-serif';ctx.textAlign='center';ctx.fillText('TRANSPORT + CAP',500,535);
  }
  if (p > .27 && p < .72) {
    ctx.globalAlpha = Math.min(1,b*1.8) * (1-smooth(clamp((p-.64)/.08)));
    const split=smooth(clamp((b-.55)/.45)), lx=lerp(500,350,split), rx=lerp(500,650,split), erx=lerp(165,88,split), ery=lerp(185,125,split);
    [[lx,1],[rx,split]].forEach(([x,o])=>{ctx.globalAlpha*=o;ctx.fillStyle='rgba(72,62,130,.28)';ctx.strokeStyle='#8ef8df';ctx.lineWidth=3;ctx.shadowColor='#70f3d2';ctx.shadowBlur=15;ctx.beginPath();ctx.ellipse(x,320,erx,ery,0,0,TAU);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha/=Math.max(o,.001);});
    ctx.strokeStyle='rgba(255,255,255,.3)';ctx.setLineDash([4,7]);ctx.beginPath();ctx.moveTo(lx-erx,320);ctx.lineTo(lx+erx,320);ctx.stroke();ctx.setLineDash([]);
    const flash=Math.sin(Math.PI*clamp((b-.15)/.4)); ctx.fillStyle=`rgba(112,243,210,${flash*.4})`;[-65,65].forEach(dx=>{ctx.beginPath();ctx.arc(lx+dx,320,46*flash,0,TAU);ctx.fill();});
    ctx.strokeStyle='rgba(255,255,255,.25)';ctx.setLineDash([4,7]);ctx.beginPath();ctx.moveTo(lx-100,115);ctx.lineTo(lx-35,510);ctx.moveTo(lx+100,115);ctx.lineTo(lx+35,510);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#70f3d2';ctx.font='34px ui-monospace';ctx.textAlign='center';ctx.fillText(b<.5?'−1   −1':'0     0',lx,255);
    ctx.fillStyle='rgba(255,255,255,.65)';ctx.font='24px Georgia';ctx.fillText('−1 − 1 + 2 = 0',500,548);
  }
  if (p > .58) {
    ctx.globalAlpha = c;
    [[350,'S₊'],[650,'S₋']].forEach(([x,label])=>{ctx.fillStyle='rgba(67,55,115,.24)';ctx.strokeStyle='#8cf7df';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,320,88,126,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#70f3d2';ctx.font='700 11px ui-sans-serif';ctx.textAlign='center';ctx.fillText(label+'  framing 0',x,169);});
    ctx.strokeStyle='#70f3d2';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(438,320);ctx.lineTo(562,320);ctx.stroke();
    drawArrow(ctx,500,320,252,205,-2.8,1.2,'#ff78b8',3.5);
    const cancel=smooth(clamp((c-.62)/.38));
    ctx.globalAlpha=c*(1-cancel);drawArrow(ctx,350,320,101,137,.4,5.4,'#ff8ba8',2.5,[8,7]);drawArrow(ctx,650,320,101,137,.4,5.4,'#ff8ba8',2.5,[8,7]);
    ctx.globalAlpha=c;[[315,230],[315,410],[685,230],[685,410]].forEach(([x,y])=>{ctx.fillStyle='#69dcff';ctx.shadowColor='#69dcff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x,y,7,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(105,220,255,.4)';ctx.beginPath();ctx.arc(x,y,18+Math.sin(time*.004+x)*3,0,TAU);ctx.stroke();});
    ctx.fillStyle='#ff8fc4';ctx.font='italic 22px Georgia';ctx.textAlign='center';ctx.fillText('+ δ',500,91);
    ctx.globalAlpha=1-cancel;ctx.fillStyle='#ff9bb2';ctx.font='italic 16px Georgia';ctx.fillText('−B₀⁺',350,326);ctx.fillText('−B₀⁻',650,326);
    ctx.globalAlpha=cancel;ctx.fillStyle='#c5fff1';ctx.font='26px Georgia';ctx.fillText('Φ|Σ = tδ = d',500,559);
  }
  ctx.restore();
}

function miniGenus(ctx,x,y,s,color,n,alpha=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle='rgba(7,8,18,.68)';ctx.lineWidth=1.6/s;ctx.beginPath();ctx.moveTo(-112,0);ctx.bezierCurveTo(-112,-52,-58,-76,-17,-46);ctx.bezierCurveTo(-6,-38,6,-38,17,-46);ctx.bezierCurveTo(58,-76,112,-52,112,0);ctx.bezierCurveTo(112,52,58,76,17,46);ctx.bezierCurveTo(6,38,-6,38,-17,46);ctx.bezierCurveTo(-58,76,-112,52,-112,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(-57,0,28,21,0,0,TAU);ctx.ellipse(57,0,28,21,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-92,-11);ctx.bezierCurveTo(-30,30+n*1.5,30,-30-n*1.5,92,11);ctx.stroke();ctx.fillStyle='#fff';ctx.font='18px Georgia';ctx.textAlign='center';ctx.fillText('W'+n,0,6);ctx.restore();}

function drawInfinite(ctx,w,h,time){ctx.save();const cx=w/2,cy=h/2+20;for(let i=0;i<28;i++){const q=(i/28+time*.000035)%1,depth=1-q,s=.05+depth*depth*.72,a=Math.min(.85,depth*1.05)*Math.min(1,q*9),ang=i*2.399+time*.00012,r=Math.min(w,h)*.42*(.35+q*.65);miniGenus(ctx,cx+Math.cos(ang)*r,cy+Math.sin(ang)*r*.55,s,COLORS[i%COLORS.length],i,a);}ctx.shadowColor='#70f3d2';ctx.shadowBlur=25;ctx.fillStyle='#070812';ctx.strokeStyle='#70f3d2';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,61,0,TAU);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#70f3d2';ctx.font='800 10px ui-sans-serif';ctx.textAlign='center';ctx.fillText('FIXED',cx,cy-10);ctx.fillStyle='#fff';ctx.font='22px Georgia';ctx.fillText('E(1,1)',cx,cy+19);ctx.restore();}

function MotionCanvas({ scene, n, m, k, proof, setN }) {
  const ref = useRef(null), state = useRef({scene,n,m,k,proof,pointer:{x:0,y:0}}), drag = useRef(null);
  useEffect(()=>{state.current={...state.current,scene,n,m,k,proof};},[scene,n,m,k,proof]);
  useEffect(()=>{const canvas=ref.current,ctx=canvas.getContext('2d');let w=0,h=0,dpr=1,frame,lastScene=scene,sceneStart=performance.now(),displayN=n;let seed=42;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);const particles=Array.from({length:85},()=>({x:rand(),y:rand(),d:.2+rand()*.8,r:.4+rand()*1.5,ph:rand()*TAU}));
    const resize=()=>{w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);};
    const loop=(t)=>{const s=state.current;if(s.scene!==lastScene){lastScene=s.scene;sceneStart=t;}displayN+= (s.n-displayN)*.075;drawBackground(ctx,w,h,t,particles,s.scene,s.pointer);const age=t-sceneStart;if(s.scene===0)drawTwist(ctx,w,h,t,displayN);if(s.scene===1)drawClassify(ctx,w,h,age,s.m,s.k);if(s.scene===2)drawProof(ctx,w,h,t,s.proof);if(s.scene===3)drawInfinite(ctx,w,h,t);frame=requestAnimationFrame(loop);};resize();addEventListener('resize',resize);frame=requestAnimationFrame(loop);return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize);};},[]);
  const down=e=>{state.current.pointer={x:(e.clientX/innerWidth-.5),y:(e.clientY/innerHeight-.5)};if(scene===0){e.currentTarget.setPointerCapture?.(e.pointerId);drag.current={x:e.clientX,n};}};
  const move=e=>{state.current.pointer={x:(e.clientX/innerWidth-.5),y:(e.clientY/innerHeight-.5)};if(drag.current)setN(clamp(Math.round(drag.current.n+(e.clientX-drag.current.x)/68),-8,8));};
  const up=e=>{e.currentTarget.releasePointerCapture?.(e.pointerId);drag.current=null;};
  return <canvas ref={ref} className="motion-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Interactive animation of the Matsumoto power-twist theorem" />;
}

export default function MatsumotoMotion(){
  const [scene,setScene]=useState(0),[n,setN]=useState(0),[m,setM]=useState(-3),[k,setK]=useState(3),[proof,setProof]=useState(0),[playing,setPlaying]=useState(false),[scope,setScope]=useState(false);const wheelLock=useRef(false),touch=useRef(null);
  useEffect(()=>{const key=e=>{if(e.key==='Escape')setScope(false);if(scope)return;if(['ArrowRight','ArrowDown','PageDown'].includes(e.key))setScene(s=>Math.min(3,s+1));if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key))setScene(s=>Math.max(0,s-1));};addEventListener('keydown',key);return()=>removeEventListener('keydown',key);},[scope]);
  useEffect(()=>{const wheel=e=>{if(scope||wheelLock.current||Math.abs(e.deltaY)<18)return;wheelLock.current=true;setScene(s=>clamp(s+(e.deltaY>0?1:-1),0,3));setTimeout(()=>wheelLock.current=false,650);};addEventListener('wheel',wheel,{passive:true});return()=>removeEventListener('wheel',wheel);},[scope]);
  useEffect(()=>{if(scene!==2){setPlaying(false);return;}setProof(0);setPlaying(true);},[scene]);
  useEffect(()=>{if(!playing)return;let f,last=performance.now();const tick=t=>{const d=Math.min(50,t-last);last=t;setProof(p=>{const q=Math.min(1,p+d/7600);if(q>=1)setPlaying(false);return q;});f=requestAnimationFrame(tick);};f=requestAnimationFrame(tick);return()=>cancelAnimationFrame(f);},[playing]);
  const meta=SCENES[scene],same=Math.abs(m)===Math.abs(k);
  return <><Head><title>Matsumoto Motion</title><meta name="description" content="Animation-first interactive explanation of one smooth four-manifold supporting infinitely many genus-two Lefschetz fibrations."/><meta name="theme-color" content="#05060e"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/></Head>
  <div className="motion-root" onTouchStart={e=>touch.current=e.touches[0].clientX} onTouchEnd={e=>{if(touch.current==null)return;const dx=e.changedTouches[0].clientX-touch.current;if(Math.abs(dx)>55)setScene(s=>clamp(s+(dx<0?1:-1),0,3));touch.current=null;}}>
    <MotionCanvas scene={scene} n={n} m={m} k={k} proof={proof} setN={setN}/><div className="grain"/>
    <header><button className="brand" onClick={()=>setScene(0)}><i/><span>MATSUMOTO MOTION</span></button><div className="fixed"><b/>E(1,1)<small>fixed</small></div><button className="scope" onClick={()=>setScope(true)}>proof + scope</button></header>
    <main key={scene}><div className="copy"><span>{meta.tag}</span><h1>{meta.title.split('\n').map((x,i)=><em key={x}>{x}{i===0&&<br/>}</em>)}</h1><p>{meta.formula}</p></div>
      {scene===0&&<div className="hud twist"><button onClick={()=>setN(clamp(n-1,-8,8))}>−</button><strong>n = {n}</strong><button onClick={()=>setN(clamp(n+1,-8,8))}>+</button><input type="range" min="-8" max="8" value={n} onChange={e=>setN(+e.target.value)}/><small>drag the surface</small></div>}
      {scene===1&&<div className={'hud compare '+(same?'yes':'no')}><label>m <input type="range" min="-5" max="5" value={m} onChange={e=>setM(+e.target.value)}/><b>{m}</b></label><span>{same?'≅':'≄'}</span><label>n <input type="range" min="-5" max="5" value={k} onChange={e=>setK(+e.target.value)}/><b>{k}</b></label></div>}
      {scene===2&&<div className="hud proof"><button onClick={()=>{if(proof>=1)setProof(0);setPlaying(v=>!v)}}>{proof>=1?'↻':playing?'Ⅱ':'▶'}</button><input type="range" min="0" max="1" step=".001" value={proof} onChange={e=>{setPlaying(false);setProof(+e.target.value)}}/><b>{proof<.34?'TRANSPORT':proof<.66?'REPAIR':'EXTEND'}</b></div>}
      {scene===3&&<div className="final"><button onClick={()=>setScope(true)}>open the proof</button><span>W₀, W₁, W₂, …</span></div>}
    </main>
    <nav>{SCENES.map((_,i)=><button key={i} onClick={()=>setScene(i)} className={scene===i?'on':''}><i/><span>0{i+1}</span></button>)}</nav><div className="hint">← swipe / scroll →</div>
    <aside className={scope?'open':''}><button className="back" onClick={()=>setScope(false)}/><section><button className="close" onClick={()=>setScope(false)}>×</button><span>THE PRECISE CLAIM</span><h2>W<sub>m</sub> ≅ W<sub>n</sub> <i>⇔</i> |m|=|n|</h2><div className="cards"><article><b>01</b><h3>Extension</h3><p>Φ|<sub>Σ</sub>=d with product normal action, so every d<sup>k</sup> extends and E=ℤ.</p></article><article><b>02</b><h3>One total space</h3><p>X<sub>n</sub>≅<sup>+</sup>X<sub>0</sub>≅<sup>+</sup>E(1,1) for every integer n.</p></article><article><b>03</b><h3>Infinite family</h3><p>W₀,W₁,W₂,… are pairwise nonisomorphic oriented genus-two Lefschetz fibrations.</p></article></div><h4>transport → −1−1+2=0 → barbell → d</h4><p className="warning"><b>Scope.</b> The diffeomorphisms are unmarked: no claim that they preserve the displayed fibrations, sections, necks, gluing coordinates, or surgery tori. The animation is explanatory, not a literal 4D embedding.</p></section></aside>
  </div><style jsx global>{`
  *{box-sizing:border-box}html,body,#__next{margin:0;width:100%;height:100%;overflow:hidden;background:#05060e;color:#f7f8ff;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.motion-root{position:relative;width:100%;height:100%;overflow:hidden;background:#05060e}.motion-canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:pan-y;cursor:grab}.motion-canvas:active{cursor:grabbing}.grain{position:absolute;inset:0;pointer-events:none;opacity:.035;mix-blend-mode:screen;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}.motion-root header{position:absolute;z-index:20;left:0;right:0;top:0;height:70px;padding:0 4.5vw;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(#05060ee8,#05060e55,transparent);backdrop-filter:blur(12px)}button{font:inherit;color:inherit}.brand,.scope{border:0;background:none;cursor:pointer}.brand{display:flex;align-items:center;gap:10px;font-size:10px;font-weight:800;letter-spacing:.16em}.brand i{width:24px;height:14px;position:relative}.brand i:before,.brand i:after{content:"";position:absolute;width:13px;height:13px;border:1.5px solid #70f3d2;border-radius:50%;box-shadow:0 0 12px #70f3d255}.brand i:after{right:0;border-color:#9d88ff}.scope{height:36px;padding:0 14px;border:1px solid rgba(255,255,255,.13);border-radius:30px;color:#bdc5d5;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;background:#ffffff05}.fixed{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;font-family:Georgia,serif;font-size:16px}.fixed b{width:7px;height:7px;border-radius:50%;background:#70f3d2;box-shadow:0 0 13px #70f3d2;animation:pulse 2s infinite}.fixed small{color:#70f3d2;font:700 8px ui-sans-serif;letter-spacing:.12em;text-transform:uppercase}@keyframes pulse{50%{transform:scale(1.4);opacity:.55}}main{position:absolute;z-index:10;inset:70px 0 0;pointer-events:none;animation:enter .7s cubic-bezier(.16,1,.3,1)}@keyframes enter{from{opacity:0;filter:blur(8px);transform:translateY(12px)}to{opacity:1;filter:none;transform:none}}.copy{position:absolute;left:6vw;top:8vh;width:min(700px,58vw);text-shadow:0 5px 28px #000}.copy>span{color:#70f3d2;font-size:9px;font-weight:900;letter-spacing:.2em}.copy h1{margin:12px 0 0;font-size:clamp(48px,6.7vw,105px);line-height:.88;letter-spacing:-.067em;font-weight:520}.copy h1 em{font-style:normal}.copy h1 em:last-child{font-weight:800;color:transparent;background:linear-gradient(100deg,#c2fff1,#fff 33%,#b4a7ff 66%,#ff91c5);-webkit-background-clip:text;background-clip:text}.copy p{margin:22px 0 0;color:#dbe0eecc;font:italic clamp(18px,2vw,29px) Georgia,serif;letter-spacing:.01em}.hud,.final{position:absolute;pointer-events:auto;left:6vw;bottom:8vh;display:flex;align-items:center;gap:12px;padding:12px 15px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:#080a16c7;backdrop-filter:blur(16px);box-shadow:0 18px 45px #0004}.hud button{width:38px;height:38px;border:1px solid rgba(255,255,255,.14);border-radius:50%;background:#ffffff05;cursor:pointer;font-size:20px}.hud strong{min-width:82px;text-align:center;color:#70f3d2;font:500 23px ui-monospace}.hud input{accent-color:#70f3d2;cursor:pointer}.twist input{width:150px}.hud small{color:#8d96a8;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.compare{gap:18px}.compare label{display:grid;grid-template-columns:18px 120px 25px;align-items:center;gap:7px;color:#9aa4b7;font:700 10px ui-monospace}.compare label b{color:#fff;font-size:15px}.compare>span{color:#70f3d2;font:38px Georgia}.compare.no>span{color:#ff839c}.proof{width:min(510px,70vw)}.proof input{flex:1}.proof b{color:#70f3d2;font-size:9px;letter-spacing:.12em}.final{flex-direction:column;align-items:flex-start;border:0;background:none;backdrop-filter:none;box-shadow:none;padding:0}.final button{height:44px;padding:0 18px;border:1px solid #70f3d2;border-radius:28px;background:#70f3d2;color:#06110e;font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}.final span{color:#b8c1d2;font:22px Georgia,serif}.motion-root nav{position:absolute;z-index:25;right:2.2vw;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:13px}.motion-root nav button{display:flex;align-items:center;gap:8px;border:0;background:none;color:#657084;cursor:pointer;font:700 8px ui-monospace}.motion-root nav button i{width:7px;height:7px;border:1px solid #778092;border-radius:50%;transition:.3s}.motion-root nav button span{opacity:0;transition:.25s}.motion-root nav button:hover span,.motion-root nav button.on span{opacity:1}.motion-root nav button.on{color:#fff}.motion-root nav button.on i{width:12px;height:12px;border-color:#70f3d2;background:#70f3d2;box-shadow:0 0 16px #70f3d2}.hint{position:absolute;z-index:12;left:50%;bottom:20px;transform:translateX(-50%);color:#7d879733;font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}aside{position:fixed;z-index:100;inset:0;pointer-events:none;visibility:hidden}aside.open{pointer-events:auto;visibility:visible}.back{position:absolute;inset:0;width:100%;height:100%;border:0;background:#020308b8;opacity:0;backdrop-filter:blur(5px);transition:.35s}aside.open .back{opacity:1}aside section{position:absolute;right:0;top:0;width:min(680px,93vw);height:100%;overflow:auto;padding:85px 34px 45px;background:radial-gradient(circle at 80% 5%,#9d88ff1c,transparent 35%),#080a14fa;border-left:1px solid #ffffff18;transform:translateX(102%);transition:.5s cubic-bezier(.16,1,.3,1);box-shadow:-40px 0 100px #0008}aside.open section{transform:none}.close{position:absolute;right:28px;top:20px;width:38px;height:38px;border:1px solid #ffffff1d;border-radius:50%;background:#ffffff05;cursor:pointer;font-size:24px}aside section>span{color:#70f3d2;font-size:9px;font-weight:900;letter-spacing:.18em}aside h2{display:flex;align-items:center;justify-content:center;gap:18px;min-height:108px;margin:18px 0 13px;border:1px solid #70f3d226;border-radius:23px;background:#70f3d208;font:31px Georgia,serif}aside h2 i{color:#70f3d2;font-style:normal}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.cards article{min-height:180px;padding:18px;border:1px solid #ffffff14;border-radius:19px;background:#ffffff05}.cards article>b{color:#9d88ff;font:9px ui-monospace}.cards h3{margin:30px 0 9px;font-size:14px}.cards p,.warning{margin:0;color:#9fa9bb;font-size:12px;line-height:1.6}aside h4{margin:13px 0;padding:20px;border:1px solid #ffffff14;border-radius:19px;color:#70f3d2;text-align:center;font:500 17px Georgia,serif}.warning{padding:19px;border:1px solid #ffd07123;border-radius:19px;background:#ffd07107}.warning b{color:#ffd071}button:hover{filter:brightness(1.2)}@media(max-width:760px){.motion-root header{height:60px;padding:0 17px}.brand span{display:none}.fixed{font-size:14px}.scope{padding:0 10px}.copy{left:20px;top:6vh;width:calc(100vw - 50px)}.copy h1{font-size:clamp(46px,13vw,68px)}.copy p{font-size:17px}.hud,.final{left:18px;bottom:8vh;max-width:calc(100vw - 52px)}.twist{display:grid;grid-template-columns:38px 88px 38px}.twist input{grid-column:1/-1;width:100%}.twist small{display:none}.compare{display:grid;grid-template-columns:1fr auto 1fr;border-radius:24px}.compare label{grid-template-columns:15px 75px 20px}.proof{width:calc(100vw - 56px)}.motion-root nav{right:7px}.motion-root nav button span{display:none}.hint{display:none}.cards{grid-template-columns:1fr}.cards article{min-height:0}.cards h3{margin-top:14px}aside section{padding:74px 19px 35px}aside h2{font-size:20px;gap:9px}.final span{font-size:18px}}@media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;transition-duration:.001ms!important}}
  `}</style></>;
}
