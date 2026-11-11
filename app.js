const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const frac=(n,d)=>`<span class="frac"><span>${n}</span><span>${d}</span></span>`;
const cases=[
  {n:'x + 1',d:'x² − 4x + 4',r:['2'],h:['none'],v:['2'],ha:['y=0'],oa:['none'],xi:['(-1,0)'],yi:['(0,1/4)'],f:x=>(x+1)/(x-2)**2,holePts:[],xPts:[[-1,0]],yPt:[0,.25],hint:'The original denominator factors as (x − 2)².'},
  {n:'x + 1',d:'x² + x − 6',r:['-3','2'],h:['none'],v:['-3','2'],ha:['y=0'],oa:['none'],xi:['(-1,0)'],yi:['(0,-1/6)'],f:x=>(x+1)/((x+3)*(x-2)),holePts:[],xPts:[[-1,0]],yPt:[0,-1/6],hint:'The original denominator factors as (x + 3)(x − 2).'},
  {n:'x − 1',d:'x² + x − 2',r:['-2','1'],h:['(1,1/3)'],v:['-2'],ha:['y=0'],oa:['none'],xi:['none'],yi:['(0,1/2)'],f:x=>1/(x+2),holePts:[[1,1/3]],xPts:[],yPt:[0,.5],hint:'Factor the denominator as (x − 1)(x + 2). One factor cancels.'},
  {n:'2x + 4',d:'4x − 12',r:['3'],h:['none'],v:['3'],ha:['y=1/2'],oa:['none'],xi:['(-2,0)'],yi:['(0,-1/3)'],f:x=>(x+2)/(2*x-6),holePts:[],xPts:[[-2,0]],yPt:[0,-1/3],hint:'Reduce the numerical GCF. Nothing creates a hole; the degrees are equal.'},
  {n:'x − 4',d:'x − 4',r:['4'],h:['(4,1)'],v:['none'],ha:['y=1'],oa:['none'],xi:['none'],yi:['(0,1)'],f:x=>1,holePts:[[4,1]],xPts:[],yPt:[0,1],hint:'YES, THIS DONUT IS WEIRD. The entire denominator cancels, but x = 4 remains excluded. A horizontal asymptote describes end behavior; it is not a forbidden line.'},
  {n:'x² − x − 2',d:'x² + 4x + 3',r:['-3','-1'],h:['(-1,-3/2)'],v:['-3'],ha:['y=1'],oa:['none'],xi:['(2,0)'],yi:['(0,-2/3)'],f:x=>(x-2)/(x+3),holePts:[[-1,-1.5]],xPts:[[2,0]],yPt:[0,-2/3],hint:'Factor both polynomials. The common factor is (x + 1).'},
  {n:'x² + 1',d:'x − 1',r:['1'],h:['none'],v:['1'],ha:['none'],oa:['y=x+1'],xi:['none'],yi:['(0,-1)'],f:x=>(x*x+1)/(x-1),holePts:[],xPts:[],yPt:[0,-1],line:[1,1],hint:'No factor cancels. Divide to find the oblique asymptote.'},
  {n:'x² + x − 6',d:'x − 2',r:['2'],h:['(2,5)'],v:['none'],ha:['none'],oa:['y=x+3'],xi:['(-3,0)'],yi:['(0,3)'],f:x=>x+3,holePts:[[2,5]],xPts:[[-3,0]],yPt:[0,3],line:[1,3],hint:'The numerator factors as (x − 2)(x + 3).'},
  {n:'x³ + 3x² − 4',d:'x² + 2x − 3',r:['-3','1'],h:['(1,9/4)'],v:['-3'],ha:['none'],oa:['y=x+1'],xi:['(-2,0)'],yi:['(0,4/3)'],f:x=>(x+2)**2/(x+3),holePts:[[1,2.25]],xPts:[[-2,0]],yPt:[0,4/3],line:[1,1],hint:'Use synthetic division to factor the numerator. Try a small rational zero.'},
  {n:'x³ + 1',d:'x − 1',r:['1'],h:['none'],v:['1'],ha:['none'],oa:['none'],xi:['(-1,0)'],yi:['(0,-1)'],f:x=>(x**3+1)/(x-1),holePts:[],xPts:[[-1,0]],yPt:[0,-1],hint:'Recognize the numerator as a sum of cubes.'},
  {n:'x³ − 2x² + x − 2',d:'x − 2',r:['2'],h:['(2,5)'],v:['none'],ha:['none'],oa:['none'],xi:['none'],yi:['(0,1)'],f:x=>x*x+1,holePts:[[2,5]],xPts:[],yPt:[0,1],hint:'Factor the numerator by grouping.'},
  {n:'x⁴ + x³ + 8x + 8',d:'x² − x − 2',r:['-1','2'],h:['(-1,-7/3)'],v:['2'],ha:['none'],oa:['none'],xi:['(-2,0)'],yi:['(0,-4)'],f:x=>(x**3+8)/(x-2),holePts:[[-1,-7/3]],xPts:[[-2,0]],yPt:[0,-4],hint:'Begin by grouping. Then look for a sum of cubes.'}
].map((c,i)=>({...c,id:i+1,name:`ƒ${String(i+1).padStart(2,'0')}(x)`}));

const KEY='rationalDonutPrototypeA';
let state=JSON.parse(localStorage.getItem(KEY)||'null')||{status:Array(12).fill(0)};
if(!Array.isArray(state.status)||state.status.length!==12)state={status:Array(12).fill(0)};
let current=0,tool='hole',drawing=false,currentPath=null,markCount=0,lineStart=null,correctVisible=false;
function save(){localStorage.setItem(KEY,JSON.stringify(state));updateStats();}
function show(id){$$('.view').forEach(v=>v.classList.remove('active'));$(id).classList.add('active');scrollTo({top:0,behavior:'smooth'});}
function updateStats(){const n=state.status.filter(x=>x===2).length;$('#boxCount').textContent=`${n} / 12`;$('#boxStatus').textContent=n===12?'Sold out!':n?'Orders moving':'Fresh dozen';}
function renderBox(){
  $('#donutGrid').innerHTML=cases.map((c,i)=>{const st=state.status[i],label=st===2?'Cleared':st===1?'In progress':'Fresh';return `<button class="donut-card ${st===2?'cleared':st===1?'in-progress':''}" data-case="${i}"><span class="number">${String(i+1).padStart(2,'0')}</span><div class="donut-art"><span></span></div><h3>${c.name} = ${frac(c.n,c.d)}</h3><span class="status">${label}</span></button>`}).join('');
  $$('[data-case]').forEach(b=>b.onclick=()=>openCase(+b.dataset.case));updateStats();
}
function openCase(i){current=i;if(state.status[i]===0)state.status[i]=1;save();const c=cases[i];$('#ticketNumber').textContent=String(i+1).padStart(2,'0');$('#ticketName').textContent=c.name;$('#caseFunction').innerHTML=`${c.name} = ${frac(c.n,c.d)}`;$('#orderStatus').textContent=state.status[i]===2?'Cleared':'In progress';$('#ticketDonut').className='donut-art large';$('#caseNote').innerHTML=i===4?'<b>YES, THIS DONUT IS WEIRD:</b> A horizontal asymptote describes end behavior; it is not a forbidden line.':'<b>Before you cancel:</b> read every restriction from the original denominator.';resetForm();show('#caseView');}
function resetForm(){['restrictionInput','holeInput','vaInput','haInput','oaInput','xInput','yInput'].forEach(id=>$('#'+id).value='');$('#analysisFeedback').className='feedback hidden';$('#analysisPanel').classList.add('active');$('#graphPanel').classList.remove('active');$('#ticketProgress').style.width='20%';$$('#stepList li').forEach((li,i)=>li.classList.toggle('active',i===0));clearGraph();}
const norm=s=>String(s).toLowerCase().replaceAll('−','-').replaceAll('≠','!=').replace(/\s+/g,'').replaceAll(';',',');
const nums=s=>(norm(s).match(/-?\d+(?:\/\d+)?/g)||[]).sort().join('|');
const isNone=s=>['none','dne','doesnotexist','na','n/a','noholes','nova','nointercepts','noasymptote'].includes(norm(s));
const sameList=(value,expected)=>expected[0]==='none'?isNone(value):nums(value)===expected.slice().sort().join('|');
const sameText=(value,expected)=>expected.some(x=>norm(value)===norm(x));
const sameEquation=(value,expected)=>expected[0]==='none'?isNone(value):sameText(value,expected);
function checkAnalysis(){
  const c=cases[current],checks=[
    ['restrictions',sameList($('#restrictionInput').value,c.r)],
    ['holes',c.h[0]==='none'?isNone($('#holeInput').value):sameText($('#holeInput').value,c.h)],
    ['vertical asymptotes',sameList($('#vaInput').value,c.v)],
    ['horizontal asymptote',sameEquation($('#haInput').value,c.ha)],
    ['oblique asymptote',sameEquation($('#oaInput').value,c.oa)],
    ['x-intercepts',c.xi[0]==='none'?isNone($('#xInput').value):sameText($('#xInput').value,c.xi)],
    ['y-intercept',sameText($('#yInput').value,c.yi)]
  ];
  const wrong=checks.filter(x=>!x[1]).map(x=>x[0]);
  if(wrong.length){$('#analysisFeedback').textContent=`Not wrapped yet. Recheck: ${wrong.join(', ')}.`;$('#analysisFeedback').className='feedback bad';return;}
  $('#analysisFeedback').textContent='Analysis approved. Your graph station is ready.';$('#analysisFeedback').className='feedback';renderVerified();setTimeout(()=>{ $('#analysisPanel').classList.remove('active');$('#graphPanel').classList.add('active');$('#ticketProgress').style.width='80%';$$('#stepList li').forEach((li,i)=>li.classList.toggle('active',i===4));},450);
}
function hint(){const c=cases[current];$('#analysisFeedback').innerHTML=`<b>Baker's note:</b> ${c.hint}`;$('#analysisFeedback').className='feedback hint';}
function renderVerified(){const rows=[['Restrictions',$('#restrictionInput').value],['Hole(s)',$('#holeInput').value],['Vertical asymptote(s)',$('#vaInput').value],['Horizontal asymptote',$('#haInput').value],['Oblique asymptote',$('#oaInput').value],['x-intercept(s)',$('#xInput').value],['y-intercept',$('#yInput').value]];$('#verifiedFeatures').innerHTML=rows.map(([a,b])=>`<li><b>${a}:</b> ${b}</li>`).join('');}

const NS='http://www.w3.org/2000/svg';
function svg(name,attrs={}){const n=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;}
const CX=360,CY=220,S=36,toX=x=>CX+x*S,toY=y=>CY-y*S;
function point(e,snap=true){const r=$('#graph').getBoundingClientRect(),rawX=(e.clientX-r.left)*720/r.width,rawY=(e.clientY-r.top)*440/r.height,vx=(rawX-CX)/S,vy=(CY-rawY)/S,q=n=>Math.round(n*10)/10;const sx=snap?q(vx):vx,sy=snap?q(vy):vy;return {x:toX(sx),y:toY(sy),vx:sx,vy:sy};}
function fullLine(p1,p2){if(Math.abs(p2.x-p1.x)<2)return null;const m=(p2.y-p1.y)/(p2.x-p1.x);return {x1:0,y1:p1.y+m*(0-p1.x),x2:720,y2:p1.y+m*(720-p1.x)};}
function beginMark(e){const snap=tool!=='branch',p=point(e,snap),g=$('#graphMarks');if(tool==='branch'){drawing=true;currentPath=svg('path',{d:`M${p.x} ${p.y}`,fill:'none',stroke:'#a62f52','stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round'});g.append(currentPath);markCount++;return}if(tool==='oa'){if(!lineStart){lineStart=p;$('#graphInstruction').textContent='First point saved. Choose a second point on the oblique asymptote.';return}const l=fullLine(lineStart,p);if(l){g.append(svg('line',{...l,stroke:'#a62f52','stroke-width':3,'stroke-dasharray':'10 8'}));markCount++;}lineStart=null;$('#linePreview').classList.add('hidden');return}if(tool==='va')g.append(svg('line',{x1:p.x,x2:p.x,y1:0,y2:440,stroke:'#a62f52','stroke-width':3,'stroke-dasharray':'10 8'}));else if(tool==='ha')g.append(svg('line',{x1:0,x2:720,y1:p.y,y2:p.y,stroke:'#a62f52','stroke-width':3,'stroke-dasharray':'10 8'}));else g.append(svg('circle',{cx:p.x,cy:p.y,r:tool==='hole'?6:4,fill:tool==='hole'?'white':'#a62f52',stroke:'#a62f52','stroke-width':tool==='hole'?3:2}));markCount++;}
function moveMark(e){const p=point(e,tool!=='branch'),tidy=n=>{const v=Math.round(n*10)/10;return Object.is(v,-0)?'0.0':v.toFixed(1)};$('#coordinateReadout').textContent=`x ≈ ${tidy(p.vx)}, y ≈ ${tidy(p.vy)}`;if(tool==='oa'&&lineStart){const l=fullLine(lineStart,p),preview=$('#linePreview');if(l){Object.entries(l).forEach(([k,v])=>preview.setAttribute(k,v));preview.classList.remove('hidden');}}if(!drawing||!currentPath)return;currentPath.setAttribute('d',currentPath.getAttribute('d')+` L${p.x} ${p.y}`);}
function endMark(){drawing=false;currentPath=null;}
function clearGraph(){if($('#graphMarks'))$('#graphMarks').innerHTML='';if($('#correctGraph')){$('#correctGraph').innerHTML='';$('#correctGraph').classList.add('hidden');}if($('#comparePanel'))$('#comparePanel').classList.add('hidden');if($('#drawingActions'))$('#drawingActions').classList.remove('hidden');if($('#linePreview'))$('#linePreview').classList.add('hidden');lineStart=null;markCount=0;correctVisible=false;}
function correctLine(group,x1,y1,x2,y2,cls='correct-asymptote'){group.append(svg('line',{x1,y1,x2,y2,class:cls}));}
function fractionValue(s){const [a,b]=String(s).split('/').map(Number);return b?a/b:a;}
function drawCorrectGraph(){const c=cases[current],g=$('#correctGraph');g.innerHTML='';let d='',pen=false,lastY=0;for(let x=-10;x<=10;x+=.03){if(c.v[0]!=='none'&&c.v.some(v=>Math.abs(x-Number(v))<.04)){pen=false;continue}const y=c.f(x),py=toY(y),px=toX(x);if(!Number.isFinite(y)||py<-15||py>455||pen&&Math.abs(py-lastY)>70){pen=false;continue}d+=`${pen?'L':'M'}${px.toFixed(1)} ${py.toFixed(1)} `;pen=true;lastY=py}g.append(svg('path',{d,class:'correct-curve'}));if(c.v[0]!=='none')c.v.forEach(v=>correctLine(g,toX(Number(v)),0,toX(Number(v)),440));if(c.ha[0]!=='none'){const h=fractionValue(c.ha[0].split('=')[1]);correctLine(g,0,toY(h),720,toY(h));}if(c.line){const [m,b]=c.line;correctLine(g,0,toY(m*(-CX/S)+b),720,toY(m*((720-CX)/S)+b));}c.holePts.forEach(([x,y])=>g.append(svg('circle',{cx:toX(x),cy:toY(y),r:7,class:'correct-hole'})));[...c.xPts,c.yPt].filter(Boolean).forEach(([x,y])=>g.append(svg('circle',{cx:toX(x),cy:toY(y),r:4,class:'correct-point'})));g.classList.remove('hidden');correctVisible=true;}
function submitGraph(){if(markCount<2){$('#graphInstruction').textContent='Add at least two structural features or curve marks before comparing.';return}drawCorrectGraph();$('#drawingActions').classList.add('hidden');$('#comparePanel').classList.remove('hidden');$('#graphInstruction').innerHTML='<span class="comparison-key"><span><i></i>Your sketch</span><span><i class="correct"></i>Correct graph</span></span>';}
function retryGraph(){clearGraph();$('#graphInstruction').textContent='Correct graph hidden. Rebuild your sketch from the verified features.';}
function toggleCorrect(){correctVisible=!correctVisible;$('#correctGraph').classList.toggle('hidden',!correctVisible);$('#toggleCorrect').textContent=correctVisible?'Hide correct graph':'Show correct graph';}
function completeCase(){state.status[current]=2;save();$('#celebration').showModal();}

$('#homeButton').onclick=$('#backButton').onclick=()=>{renderBox();show('#boxView');};
$('#checkAnalysis').onclick=checkAnalysis;$('#hintButton').onclick=hint;
$$('.graph-tools [data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool==='curve'?'branch':b.dataset.tool;$$('.graph-tools [data-tool]').forEach(x=>x.classList.toggle('active',x===b));});
$('#undoGraph').onclick=()=>{const g=$('#graphMarks');if(g.lastElementChild){g.lastElementChild.remove();markCount=Math.max(0,markCount-1);}};
$('#graph').addEventListener('pointerdown',beginMark);$('#graph').addEventListener('pointermove',moveMark);$('#graph').addEventListener('pointerup',endMark);$('#graph').addEventListener('pointerleave',endMark);
$('#clearGraph').onclick=clearGraph;$('#submitGraph').onclick=submitGraph;$('#retryGraph').onclick=retryGraph;$('#toggleCorrect').onclick=toggleCorrect;$('#completeCase').onclick=completeCase;$('#closeCelebration').onclick=()=>{$('#celebration').close();renderBox();show('#boxView');};
renderBox();
