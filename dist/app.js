(() => {
  'use strict';
  const courses = window.MATHBRAIN_COURSES;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const path = points => points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  let filter = 'all';
  let currentCourse = null;
  let currentLesson = 0;
  let toastTimer;
  const palettes = {
    blue: ['#1c3a4d', '#8bc8ce', '#dcdfb5'],
    sand: ['#e8dfcc', '#9b7652', '#567f7a'],
    green: ['#2e4d44', '#bad0a4', '#e9c59b'],
    purple: ['#39394e', '#a5abc9', '#c5c49c'],
    rose: ['#e8d8ce', '#aa7365', '#627e75'],
    slate: ['#294349', '#9fc4b5', '#e0caa2']
  };

  function artwork(course, unique) {
    const [bg, main, accent] = palettes[course.color];
    const id = `grid-${unique}`;
    let drawing = '';
    const grid = `<defs><pattern id="${id}" width="23" height="23" patternUnits="userSpaceOnUse"><path d="M23 0H0V23" fill="none" stroke="${main}" stroke-opacity=".10" stroke-width=".7"/></pattern></defs><rect width="400" height="220" fill="${bg}"/><rect width="400" height="220" fill="url(#${id})"/>`;
    const axis = `<g fill="none" stroke="${main}" stroke-opacity=".37" stroke-width=".8"><path d="M42 174H367M80 193V40"/><path d="m362 171 5 3-5 3M77 45l3-5 3 5"/></g>`;
    if (course.art === 'derivative') {
      const points = Array.from({length:101}, (_, i) => {const x = i / 100 * 290; return [55+x, 176 - .0015*(x-25)**2];});
      drawing = `${axis}<path d="${path(points)}" fill="none" stroke="${main}" stroke-width="2.2"/><path d="M139 184.6 331 95.3" stroke="${accent}" stroke-width="1.5"/><path d="M235 174V139.96H80" fill="none" stroke="${accent}" stroke-dasharray="3 4" stroke-opacity=".4"/><circle cx="235" cy="139.96" r="4" fill="${accent}"/><text x="285" y="110" fill="${main}" font-family="Georgia,serif" font-style="italic" font-size="19">f′(x)</text><text x="104" y="68" fill="${accent}" font-family="Georgia,serif" font-size="27" opacity=".85">dx → 0</text>`;
    } else if (course.art === 'probability') {
      const points = Array.from({length:121}, (_, i) => {const x = 45 + i*2.6; return [x, 178 - 126*Math.exp(-((x-201)**2)/(2*48**2))];});
      const filled = points.filter(p=>p[0]>154&&p[0]<246);
      drawing = `<path d="M42 178H364" stroke="${main}" stroke-opacity=".5"/><path d="M${filled[0][0]} 178 ${path(filled).replace(/^M/,'L')} L${filled.at(-1)[0]} 178Z" fill="${main}" opacity=".2"/><path d="${path(points)}" fill="none" stroke="${main}" stroke-width="2"/><path d="M201 178V52" stroke="${main}" stroke-dasharray="3 4" stroke-opacity=".5"/><text x="190" y="198" fill="${main}" font-family="Georgia,serif" font-size="13">μ</text><text x="46" y="74" fill="${accent}" font-family="Georgia,serif" font-size="19" font-style="italic">P(A)</text><text x="282" y="71" fill="${main}" font-family="Georgia,serif" font-size="18" opacity=".7">∑ p = 1</text>`;
    } else if (course.art === 'inference') {
      const dots = Array.from({length:31}, (_, i) => {const x=57+((i*73)%280), y=164-(x-57)*.32+Math.sin(i*9)*31; return `<circle cx="${x}" cy="${y}" r="${i%4===0?3.5:2.5}" fill="${main}" opacity="${.45+(i%4)*.13}"/>`;}).join('');
      drawing = `${axis}<path d="M60 183 342 73 342 44 60 145Z" fill="${main}" opacity=".09"/><path d="M60 165 342 59" stroke="${accent}" stroke-width="1.6"/>${dots}<text x="246" y="191" fill="${main}" font-family="Georgia,serif" font-size="21" font-style="italic">x̄ ± ?</text>`;
    } else if (course.art === 'algebra') {
      drawing = `<g fill="none" stroke="${main}" stroke-width="1" opacity=".85"><path d="M116 156 196 181 286 130 207 106Z M116 156V75L207 30 286 56V130 M196 181V98L286 56 M116 75 196 98 207 30 M207 106V30"/><path d="M116 75 207 106 286 56 M116 156 196 98 286 130" stroke-dasharray="3 4" opacity=".5"/></g><g fill="${accent}"><circle cx="116" cy="75" r="3"/><circle cx="196" cy="181" r="3"/><circle cx="286" cy="56" r="3"/><circle cx="207" cy="106" r="3"/></g><text x="45" y="188" fill="${accent}" font-family="Georgia,serif" font-style="italic" font-size="19">x + y = ?</text>`;
    } else if (course.art === 'trigonometry') {
      const wave = Array.from({length:101}, (_, i) => [191+i*1.65,112-49*Math.sin(i/100*Math.PI*2)]);
      drawing = `<g fill="none" stroke="${main}"><circle cx="108" cy="112" r="59" stroke-opacity=".7"/><path d="M32 112H365M108 187V38" stroke-opacity=".3" stroke-width=".8"/><path d="M108 112 149 70 149 112Z" stroke-width="1.7"/><path d="M130 112A22 22 0 0 0 124 96" stroke-width="1"/><path d="M149 70H224" stroke-dasharray="3 4" opacity=".6"/><path d="${path(wave)}" stroke-width="1.8"/></g><circle cx="149" cy="70" r="3" fill="${accent}"/><text x="133" y="104" font-family="Georgia,serif" font-style="italic" font-size="13" fill="${main}">θ</text><text x="254" y="175" font-family="Georgia,serif" font-style="italic" font-size="21" fill="${accent}">sen θ</text>`;
    } else {
      const points = Array.from({length:101}, (_, i) => {const x=58+i*2.88; return [x,150-50*Math.sin((x-58)/290*Math.PI)-.17*(x-58)];});
      let bars=''; for(let i=0;i<16;i++){const x=81+i*14,y=150-50*Math.sin((x-58)/290*Math.PI)-.17*(x-58);bars+=`<rect x="${x}" y="${y}" width="13" height="${176-y}" fill="${main}" fill-opacity="${.10+i*.012}" stroke="${main}" stroke-opacity=".3" stroke-width=".6"/>`;}
      drawing = `${axis}${bars}<path d="${path(points)}" fill="none" stroke="${main}" stroke-width="2"/><text x="96" y="77" fill="${accent}" font-family="Georgia,serif" font-style="italic" font-size="33">∫</text><text x="119" y="74" fill="${accent}" font-family="Georgia,serif" font-style="italic" font-size="17">f(x) dx</text>`;
    }
    return `<svg viewBox="0 0 400 220" aria-hidden="true" preserveAspectRatio="xMidYMid slice">${grid}${drawing}</svg>`;
  }

  function heroArt() {
    let mesh = '';
    function point(x,z) {const y=.24*x*x+.13*z*z;return [256+46*x+24*z,227-32*y-13*z];}
    for(let z=-3;z<=3;z+=.5){mesh+=`<path d="${path(Array.from({length:61},(_,i)=>point(-3+i*.1,z)))}"/>`;}
    for(let x=-3;x<=3;x+=.5){mesh+=`<path d="${path(Array.from({length:61},(_,i)=>point(x,-3+i*.1)))}"/>`;}
    return `<svg class="hero-diagram" viewBox="0 0 520 290" aria-hidden="true"><defs><linearGradient id="mesh" x1="90" y1="210" x2="402" y2="38" gradientUnits="userSpaceOnUse"><stop stop-color="#429fa4"/><stop offset=".5" stop-color="#8ac9b2"/><stop offset="1" stop-color="#cfd8a1"/></linearGradient><radialGradient id="glow"><stop stop-color="#548b7f" stop-opacity=".13"/><stop offset="1" stop-color="#548b7f" stop-opacity="0"/></radialGradient><pattern id="hero-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" stroke="#aac5b6" fill="none" stroke-opacity=".045"/></pattern></defs><rect width="520" height="290" fill="url(#hero-grid)"/><ellipse cx="270" cy="156" rx="231" ry="132" fill="url(#glow)"/><g fill="none" stroke="#a8c4b4" stroke-opacity=".22" stroke-width=".8"><path d="M57 249 445 249M255 272V24M127 270 395 48"/><path d="m438 246 7 3-7 3M252 31l3-7 3 7"/></g><g fill="none" stroke="url(#mesh)" stroke-width=".8" opacity=".8">${mesh}</g><path d="M182 220 336 95" stroke="#e2d9a0" stroke-width="1.4"/><circle cx="258" cy="158" r="4" fill="#ece1ac"/><circle cx="258" cy="158" r="9" fill="none" stroke="#ece1ac" opacity=".3"/><path d="M266 154 338 132" stroke="#d3dbb3" stroke-dasharray="2 4" opacity=".55"/><text x="346" y="133" fill="#cbd6ae" font-family="Georgia,serif" font-style="italic" font-size="21">f′(x)</text><text x="62" y="66" fill="#85b4ab" font-family="Georgia,serif" font-style="italic" font-size="18" transform="rotate(-7 62 66)">Δy / Δx</text><text x="447" y="265" fill="#73958b" font-family="Georgia,serif" font-style="italic" font-size="13">x</text><text x="265" y="31" fill="#73958b" font-family="Georgia,serif" font-style="italic" font-size="13">y</text><text x="93" y="257" fill="#91b6a1" font-family="Georgia,serif" font-size="12" opacity=".6">El cambio también tiene forma.</text></svg>`;
  }

  function renderCourses() {
    const query = normalize($('#course-search').value);
    const level = $('#level-filter').value;
    const visible = courses.filter(c => (filter === 'all' || c.category === filter) && (level === 'all' || c.level === level) && normalize(`${c.title} ${c.description} ${c.label} ${c.lessons.map(l=>l.title).join(' ')}`).includes(query));
    $('#results-count').textContent = `${visible.length} ${visible.length === 1 ? 'curso para explorar' : 'cursos para explorar'}`;
    $('#empty-state').hidden = !!visible.length;
    $('#course-grid').innerHTML = visible.map(c => `<article class="course-card"><a class="course-image ${c.color}" href="#curso/${c.id}" aria-label="Explorar el programa de ${escape(c.title)}">${artwork(c,c.id)}<span class="image-label">MATHBRAIN / EXPLORA LAS IDEAS</span></a><div class="course-content"><p class="course-category">${c.label}</p><h3><a href="#curso/${c.id}">${escape(c.title)}</a></h3><p class="description">${escape(c.description)}</p><div class="course-card-meta"><span><span class="level-bars ${c.level==='Inicial'?'initial':''}" aria-hidden="true"><i></i><i></i><i></i></span>${c.level}<span class="dot">·</span>${c.lessons.length} lecciones previstas</span><a class="program-link" href="#curso/${c.id}">Ver programa <span aria-hidden="true">↗</span></a></div></div></article>`).join('');
  }

  function videoSource(value) {
    if(!value) return null;
    let u; try{u = new URL(value, location.href);}catch{return null;}
    if(!['http:','https:'].includes(u.protocol)) return null;
    let id;
    if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(u.hostname)) id = u.searchParams.get('v') || u.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
    if(u.hostname === 'youtu.be') id = u.pathname.slice(1);
    if(id && /^[\w-]{11}$/.test(id)) return {type:'iframe',src:`https://www.youtube-nocookie.com/embed/${id}?rel=0`};
    if(['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(u.hostname)) {const match = u.pathname.match(/(?:\/video)?\/(\d+)/);if(match)return {type:'iframe',src:`https://player.vimeo.com/video/${match[1]}`};}
    if(/\.(mp4|webm)$/i.test(u.pathname)) return {type:'video',src:u.href};
    return null;
  }

  function renderDetail() {
    const c = currentCourse;
    const l = c.lessons[currentLesson];
    const source = videoSource(l.video);
    const available = c.lessons.filter(l=>videoSource(l.video)).length;
    const stage = source ? source.type === 'iframe' ? `<iframe title="${escape(l.title)}" src="${escape(source.src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : `<video controls playsinline preload="metadata" aria-label="${escape(l.title)}"><source src="${escape(source.src)}"><p>Tu navegador no puede reproducir este video. <a href="${escape(source.src)}">Abrir el archivo</a></p></video>` : `<div class="stage-art">${artwork(c, 'stage')}</div><div class="placeholder-message"><span class="stage-status">En preparación</span><span class="stage-symbol" aria-hidden="true">${c.art==='integral'?'∫':c.art==='probability'?'P(A)':c.art==='trigonometry'?'θ':'∴'}</span><h2>Las ideas ya tienen un lugar.</h2><p>El video de esta lección llegará pronto. Mientras tanto, explora el programa y su idea clave.</p></div>`;
    $('#course-view').innerHTML = `<nav class="breadcrumbs" aria-label="Ruta de navegación"><a href="#">Inicio</a><span aria-hidden="true">/</span><a href="#cursos">Cursos</a><span aria-hidden="true">/</span><span>${escape(c.title)}</span></nav><div class="detail-heading"><p class="eyebrow">${c.label} · NIVEL ${c.level.toUpperCase()}</p><h1 id="detail-title" tabindex="-1">${escape(c.title)}</h1><p>${escape(c.intro)}</p></div><div class="detail-layout"><div><div class="lesson-stage">${stage}</div><div class="lesson-info"><p class="eyebrow">LECCIÓN ${String(currentLesson+1).padStart(2,'0')} DE ${String(c.lessons.length).padStart(2,'0')}</p><h2>${escape(l.title)}</h2><p>${escape(l.description)}</p><div class="key-concept"><h3>Una idea para llevarte</h3><p>${escape(l.key)}</p></div><div class="lesson-navigation"><button data-step="-1" ${currentLesson===0?'disabled':''}>← Anterior</button><button data-step="1" ${currentLesson===c.lessons.length-1?'disabled':''}>Siguiente idea →</button></div><div class="detail-resources"><button id="download-syllabus">↓ Descargar programa</button><button id="copy-lesson">↗ Copiar enlace de la lección</button>${c.category==='calculo'?'<button id="detail-demo">∿ Explorar la derivada</button>':''}</div><p class="detail-note">${available?`${available} de ${c.lessons.length} videos disponibles.`:'Programa preliminar. Los videos de este curso todavía no están disponibles.'} Puedes recorrer todas las ideas mientras preparamos las lecciones.</p></div></div><aside><div class="syllabus"><div class="syllabus-heading"><h2>El camino de las ideas</h2><p>${c.lessons.length} lecciones · ${available?available+' videos disponibles':'Videos en preparación'}</p></div>${c.lessons.map((lesson,i)=>`<button class="lesson-button ${i===currentLesson?'selected':''}" data-lesson="${i}" ${i===currentLesson?'aria-current="step"':''}><span class="lesson-number">${String(i+1).padStart(2,'0')}</span><span><strong>${escape(lesson.title)}</strong><small>${videoSource(lesson.video)?'Video disponible':'Programa · En preparación'}</small></span><span class="lesson-state" aria-hidden="true">${i===currentLesson?'●':'↗'}</span></button>`).join('')}</div><p class="prerequisite"><strong>Un buen punto de partida</strong>${escape(c.prerequisite)}</p></aside></div>`;
    $$('.lesson-button').forEach(b=>b.addEventListener('click',()=>selectLesson(Number(b.dataset.lesson))));
    $$('[data-step]').forEach(b=>b.addEventListener('click',()=>selectLesson(currentLesson+Number(b.dataset.step))));
    $('#download-syllabus').addEventListener('click',downloadSyllabus);
    $('#copy-lesson').addEventListener('click',copyLesson);
    $('#detail-demo')?.addEventListener('click',openDemo);
    document.title = `${l.title} — ${c.title} | MathBrain`;
  }

  function selectLesson(index) {
    if(index<0 || index>=currentCourse.lessons.length)return;
    location.hash=`curso/${currentCourse.id}/${index+1}`;
  }

  function route() {
    let hash; try {hash = decodeURIComponent(location.hash.slice(1));} catch {hash = '';}
    const match = hash.match(/^curso\/([\w-]+)(?:\/(\d+))?$/);
    const course = match && courses.find(c=>c.id===match[1]);
    $('.main-nav').classList.remove('open');
    $('.menu-toggle').setAttribute('aria-expanded','false');
    $('.menu-toggle').setAttribute('aria-label','Abrir menú');
    if(course) {
      const changedCourse = currentCourse?.id !== course.id;
      currentCourse = course;
      currentLesson = Math.min(course.lessons.length-1, Math.max(0,Number(match[2]||1)-1));
      $('#home-view').hidden = true;
      $('#course-view').hidden = false;
      renderDetail();
      if(changedCourse) {window.scrollTo({top:0,behavior:'instant'});$('#detail-title').focus({preventScroll:true});}
    } else {
      currentCourse = null;
      $('#home-view').hidden=false;
      $('#course-view').hidden=true;
      $('#course-view').replaceChildren();
      document.title='MathBrain — Matemáticas con otros ojos';
      requestAnimationFrame(()=>{if(['cursos','enfoque','nosotros'].includes(hash))$('#'+hash).scrollIntoView();else if(!hash || match)window.scrollTo({top:0,behavior:'instant'});});
    }
  }

  function downloadSyllabus() {
    const c=currentCourse;
    const text=`MATHBRAIN — ${c.title}\nThink Beyond Numbers\n\n${c.intro}\n\nNivel: ${c.level}\nConocimientos previos: ${c.prerequisite}\nEstado: programa preliminar; consulta el sitio para ver los videos disponibles.\n\n${c.lessons.map((l,i)=>`${i+1}. ${l.title}\n${l.description}\nIdea clave: ${l.key}\n`).join('\n')}\nExplora más en ${location.origin}/#cursos\n`;
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`MathBrain-${c.id}-programa.txt`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('Programa descargado. Una idea a la vez.');
  }

  async function copyLesson() {
    const url=`${location.origin}${location.pathname}#curso/${currentCourse.id}/${currentLesson+1}`;
    try {await navigator.clipboard.writeText(url);toast('Enlace de la lección copiado.');}
    catch {toast('Puedes copiar el enlace desde la barra de direcciones.');}
  }
  function toast(message) {clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}

  function renderDemo() {
    const x=Number($('#demo-slider').value), slope=2*x;
    const sx=x=>280+83*x, sy=y=>227-40*y;
    let grid=''; for(let i=-3;i<=3;i++)grid+=`<path d="M${sx(i)} 12V242"/>`;for(let i=0;i<=5;i++)grid+=`<path d="M24 ${sy(i)}H538"/>`;
    const curve=path(Array.from({length:121},(_,i)=>{const t=-2.3+i/120*4.6;return[sx(t),sy(t*t)];}));
    const tangent=path([-3,3].map(t=>[sx(t),sy(x*x+slope*(t-x))]));
    $('#demo-graph').innerHTML=`<svg viewBox="0 0 560 260" role="img" aria-label="Parábola f de x igual a x al cuadrado. Punto en x igual a ${x.toFixed(2)}, pendiente ${slope.toFixed(2)}."><defs><clipPath id="demo-clip"><rect x="23" y="12" width="516" height="230"/></clipPath></defs><g stroke="#b0cdb2" stroke-opacity=".09" fill="none" stroke-width=".7">${grid}</g><g stroke="#afc5b3" stroke-opacity=".4" fill="none"><path d="M24 227H538M280 242V12"/></g><g clip-path="url(#demo-clip)" fill="none"><path d="${curve}" stroke="#8dc9b8" stroke-width="2.2"/><path d="${tangent}" stroke="#e3cc94" stroke-width="1.6"/><path d="M${sx(x)} 227V${sy(x*x)}H280" stroke="#bdc7a7" stroke-dasharray="3 5" stroke-opacity=".4"/></g><circle cx="${sx(x)}" cy="${sy(x*x)}" r="5" fill="#e6d6a4"/><circle cx="${sx(x)}" cy="${sy(x*x)}" r="11" stroke="#e6d6a4" fill="none" opacity=".25"/><g fill="#96afa0" font-size="10" font-family="Arial,sans-serif"><text x="108" y="244">−2</text><text x="192" y="244">−1</text><text x="285" y="244">0</text><text x="360" y="244">1</text><text x="443" y="244">2</text></g><text x="430" y="33" fill="#8dc9b8" font-family="Georgia,serif" font-style="italic" font-size="16">f(x) = x²</text><text x="34" y="34" fill="#e3cc94" font-family="Arial,sans-serif" font-size="9">RECTA TANGENTE</text></svg>`;
    $('#x-value').textContent=x.toFixed(2).replace('-0.00','0.00');
    $('#slope-value').textContent=`f′(${Number(x.toFixed(2))}) = ${Number(slope.toFixed(2))}`;
    $('#demo-explanation').textContent=slope<-.05?'La pendiente es negativa: la función disminuye al avanzar hacia la derecha.':slope>.05?'La pendiente es positiva: la función crece al avanzar hacia la derecha.':'La pendiente es cero: la tangente es horizontal. Aquí la parábola tiene su mínimo.';
  }
  function openDemo(){renderDemo();$('#demo-dialog').showModal();document.body.classList.add('modal-open');}
  function closeDemo(){$('#demo-dialog').close();}

  $$('.filter').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;$$('.filter').forEach(btn=>{const active=btn===b;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});renderCourses();}));
  $('#course-search').addEventListener('input',renderCourses);
  $('#level-filter').addEventListener('change',renderCourses);
  $('#reset-filters').addEventListener('click',()=>{$('#course-search').value='';$('#level-filter').value='all';$('.filter[data-filter="all"]').click();$('#course-search').focus();});
  $('.menu-toggle').addEventListener('click',()=>{const opened=$('.main-nav').classList.toggle('open');$('.menu-toggle').setAttribute('aria-expanded',String(opened));$('.menu-toggle').setAttribute('aria-label',opened?'Cerrar menú':'Abrir menú');});
  ['hero-demo','visual-demo','approach-demo'].forEach(id=>$('#'+id).addEventListener('click',openDemo));
  $('.close-dialog').addEventListener('click',closeDemo);
  $('.close-demo-link').addEventListener('click',closeDemo);
  $('#demo-dialog').addEventListener('close',()=>document.body.classList.remove('modal-open'));
  $('#demo-dialog').addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDemo();});
  $('#demo-slider').addEventListener('input',renderDemo);
  window.addEventListener('hashchange',route);
  $('#year').textContent=new Date().getFullYear();
  $('#hero-art').innerHTML=heroArt();
  renderCourses();
  route();
})();
