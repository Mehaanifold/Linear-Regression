/* =========================================================
   MODULE 1 WIDGETS
   ========================================================= */

/* WIDGET 1: VECTORS */
/* HTML Content: (Injected via innerHTML below) */
ML.lazyInit('w1_area', function() {
  const area = document.getElementById('w1_area');
  area.innerHTML = `
    <p>Vectors are the fundamental building blocks of machine learning. You can think of a vector as an arrow pointing in space, possessing both a direction and a magnitude (length). In data terms, a vector is simply a list of numbers—each number representing a feature of a single data point.</p>
    <p>When we combine vectors through addition, we follow the "parallelogram rule," chaining them tip-to-tail. When we multiply a vector by a scalar (a regular number), we stretch or shrink it. The <strong>dot product</strong> tells us how much two vectors align, which is critical for finding angles and projections.</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>Vector a (x): <span class="val" id="w1_ax_val">3</span><input type="range" id="w1_ax" min="-10" max="10" step="0.1" value="3"></label>
        <label>Vector a (y): <span class="val" id="w1_ay_val">2</span><input type="range" id="w1_ay" min="-10" max="10" step="0.1" value="2"></label>
        <label>Vector b (x): <span class="val" id="w1_bx_val">1</span><input type="range" id="w1_bx" min="-10" max="10" step="0.1" value="1"></label>
        <label>Vector b (y): <span class="val" id="w1_by_val">-3</span><input type="range" id="w1_by" min="-10" max="10" step="0.1" value="-3"></label>
        <label>Scalar c (for c·a): <span class="val" id="w1_c_val">1.5</span><input type="range" id="w1_c" min="-3" max="3" step="0.1" value="1.5"></label>
        <div class="presets mt-1">
          <button id="w1_mode_add" class="active">Show a + b</button>
          <button id="w1_mode_scale">Show c·a</button>
          <button id="w1_mode_proj">Show Proj_b(a)</button>
        </div>
        <button class="btn btn-reset mt-1" id="w1_reset">Reset</button>
      </div>
      <div class="widget-plot" style="display:flex; align-items:center; justify-content:center; background:#fff; border:1px solid var(--rule); border-radius:var(--radius); padding:1rem;">
        <svg id="w1_svg" viewBox="-12 -12 24 24" style="width:100%; max-width:400px; height:auto; overflow:visible; transform: scaleY(-1);">
          <g id="w1_grid"></g>
          <g id="w1_draw"></g>
        </svg>
      </div>
    </div>
    <div class="readout" id="w1_readout"></div>
    <details class="check">
      <summary>What happens to the dot product if the vectors are perpendicular?</summary>
      <div class="ans">If two vectors are exactly perpendicular, their dot product is zero. The angle between them is 90° (or \\(\\pi/2\\) radians), and \\(\\cos(90^\\circ) = 0\\). This means they share no components in the same direction!</div>
    </details>
    <div class="misconception">A common mistake is thinking the dot product returns a vector. The dot product of two vectors is a <strong>scalar</strong> (a single number), which is why it's also called the scalar product.</div>
  `;

  const ax = document.getElementById('w1_ax'), ay = document.getElementById('w1_ay');
  const bx = document.getElementById('w1_bx'), by = document.getElementById('w1_by');
  const cs = document.getElementById('w1_c');
  const grid = document.getElementById('w1_grid'), draw = document.getElementById('w1_draw');
  const readout = document.getElementById('w1_readout');
  let mode = 'add'; // add, scale, proj

  document.getElementById('w1_mode_add').onclick = (e) => setMode('add', e.target);
  document.getElementById('w1_mode_scale').onclick = (e) => setMode('scale', e.target);
  document.getElementById('w1_mode_proj').onclick = (e) => setMode('proj', e.target);
  document.getElementById('w1_reset').onclick = () => { ax.value=3; ay.value=2; bx.value=1; by.value=-3; cs.value=1.5; update(); };

  function setMode(m, btn) {
    mode = m;
    ['add','scale','proj'].forEach(x => document.getElementById('w1_mode_'+x).classList.remove('active'));
    btn.classList.add('active');
    update();
  }

  // Draw grid
  let gridHTML = `
    <line x1="-12" y1="0" x2="12" y2="0" stroke="var(--rule)" stroke-width="0.1" />
    <line x1="0" y1="-12" x2="0" y2="12" stroke="var(--rule)" stroke-width="0.1" />
  `;
  for(let i=-10; i<=10; i+=2) {
    if(i===0) continue;
    gridHTML += `<line x1="${i}" y1="-12" x2="${i}" y2="12" stroke="var(--rule)" stroke-width="0.05" />`;
    gridHTML += `<line x1="-12" y1="${i}" x2="12" y2="${i}" stroke="var(--rule)" stroke-width="0.05" />`;
  }
  grid.innerHTML = gridHTML;

  function arrow(x, y, col, w=0.2, dash=false) {
    const len = Math.hypot(x,y);
    if(len < 0.01) return '';
    const nx = x/len, ny = y/len;
    const hx = x - nx*0.8 - ny*0.4;
    const hy = y - ny*0.8 + nx*0.4;
    const hx2 = x - nx*0.8 + ny*0.4;
    const hy2 = y - ny*0.8 - nx*0.4;
    const s = dash ? `stroke-dasharray="0.5,0.5"` : '';
    return `
      <line x1="0" y1="0" x2="${x}" y2="${y}" stroke="${col}" stroke-width="${w}" ${s} stroke-linecap="round"/>
      <polygon points="${x},${y} ${hx},${hy} ${hx2},${hy2}" fill="${col}" />
    `;
  }
  function line(x1,y1,x2,y2,col,w=0.1,dash=true) {
    const s = dash ? `stroke-dasharray="0.5,0.5"` : '';
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" ${s}/>`;
  }

  const update = ML.throttledRedraw(() => {
    const a = [parseFloat(ax.value), parseFloat(ay.value)];
    const b = [parseFloat(bx.value), parseFloat(by.value)];
    const c = parseFloat(cs.value);
    document.getElementById('w1_ax_val').innerText = a[0]; document.getElementById('w1_ay_val').innerText = a[1];
    document.getElementById('w1_bx_val').innerText = b[0]; document.getElementById('w1_by_val').innerText = b[1];
    document.getElementById('w1_c_val').innerText = c;

    let drawHTML = arrow(a[0], a[1], ML.plotColors.data, 0.2); // a (indigo)
    if(mode !== 'scale') drawHTML += arrow(b[0], b[1], ML.plotColors.model, 0.2); // b (teal)

    const norma = ML.vnorm(a), normb = ML.vnorm(b);
    const dot = ML.dot(a,b);
    const angle = Math.acos(ML.clamp(dot/(norma*normb || 1), -1, 1)) * 180 / Math.PI;

    let readoutText = `||a|| = ${ML.fmt(norma)}\n||b|| = ${ML.fmt(normb)}\na · b = ${ML.fmt(dot)}\nAngle = ${ML.fmt(angle)}°\n`;

    if(mode === 'add') {
      const sum = ML.vadd(a,b);
      drawHTML += line(a[0], a[1], sum[0], sum[1], ML.plotColors.model);
      drawHTML += line(b[0], b[1], sum[0], sum[1], ML.plotColors.data);
      drawHTML += arrow(sum[0], sum[1], ML.plotColors.gradient, 0.25); // a+b plum
      readoutText += `a + b = [${ML.fmt(sum[0])}, ${ML.fmt(sum[1])}]`;
    } else if(mode === 'scale') {
      const scaled = ML.vscale(c, a);
      drawHTML += arrow(scaled[0], scaled[1], ML.plotColors.gradient, 0.15, true); 
      readoutText += `${c} · a = [${ML.fmt(scaled[0])}, ${ML.fmt(scaled[1])}]`;
    } else if(mode === 'proj') {
      if(normb > 0) {
        const proj = ML.vscale(dot/(normb*normb), b);
        const res = ML.vsub(a, proj);
        drawHTML += arrow(proj[0], proj[1], ML.plotColors.constraint, 0.25); // proj citron
        drawHTML += line(a[0], a[1], proj[0], proj[1], ML.plotColors.residual, 0.15); // residual rose
        readoutText += `Proj_b(a) = [${ML.fmt(proj[0])}, ${ML.fmt(proj[1])}]\nResidual = [${ML.fmt(res[0])}, ${ML.fmt(res[1])}]`;
      }
    }
    draw.innerHTML = drawHTML;
    readout.innerText = readoutText;
  });

  [ax,ay,bx,by,cs].forEach(el => el.addEventListener('input', update));
  update();
});

/* WIDGET 2: MATRICES */
ML.lazyInit('w2_area', function() {
  const area = document.getElementById('w2_area');
  area.innerHTML = `
    <p>A matrix is a mathematical workhorse that acts as a <strong>transformation</strong> on space. When we multiply a vector by a matrix, we are applying a mapping that can rotate, scale, shear, or reflect that vector. Think of the columns of a 2×2 matrix as telling you where the standard basis vectors \\([1, 0]\\) and \\([0, 1]\\) land after the transformation.</p>
    <p>The <strong>determinant</strong> of a matrix tells us how much the area of a shape scales during this transformation. If the determinant is negative, the space has been flipped (reflected). If it's zero, space has been squashed into a lower dimension!</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <div class="presets">
          <button id="w2_p_id">Identity</button>
          <button id="w2_p_rot">Rotation (45°)</button>
          <button id="w2_p_scale">Scale</button>
          <button id="w2_p_shear">Shear</button>
          <button id="w2_p_ref">Reflection</button>
          <button id="w2_p_zero">Squash</button>
        </div>
        <div class="matrix-display" style="font-size:1rem; margin-top:1rem;">
          <table>
            <tr><td><input type="number" id="w2_a" value="1" step="0.1" style="width:60px"></td><td><input type="number" id="w2_b" value="0" step="0.1" style="width:60px"></td></tr>
            <tr><td><input type="number" id="w2_c" value="0" step="0.1" style="width:60px"></td><td><input type="number" id="w2_d" value="1" step="0.1" style="width:60px"></td></tr>
          </table>
        </div>
        <button class="btn btn-reset mt-1" id="w2_reset">Reset</button>
      </div>
      <div class="widget-plot" style="display:flex; align-items:center; justify-content:center; background:#fff; border:1px solid var(--rule); border-radius:var(--radius); padding:1rem;">
        <svg id="w2_svg" viewBox="-5 -5 10 10" style="width:100%; max-width:400px; height:auto; overflow:visible; transform: scaleY(-1);">
          <g id="w2_grid"></g>
          <g id="w2_draw"></g>
        </svg>
      </div>
    </div>
    <div class="readout" id="w2_readout"></div>
    <details class="check">
      <summary>If a matrix transforms a unit square into a shape with area 0, what can you say about the matrix?</summary>
      <div class="ans">Its determinant must be 0! The transformation squashed 2D space down into a 1D line (or a single point). Such a matrix is called <em>singular</em> or non-invertible.</div>
    </details>
    <div class="misconception">It's easy to just memorize matrix multiplication as "row times column". While computationally correct, it hides the beautiful geometric reality: multiplying by a matrix is an active transformation of space.</div>
  `;

  const aa = document.getElementById('w2_a'), ab = document.getElementById('w2_b');
  const ac = document.getElementById('w2_c'), ad = document.getElementById('w2_d');
  const grid = document.getElementById('w2_grid'), draw = document.getElementById('w2_draw');
  const readout = document.getElementById('w2_readout');

  const setMat = (a,b,c,d) => { aa.value=a; ab.value=b; ac.value=c; ad.value=d; update(); };
  document.getElementById('w2_p_id').onclick = ()=>setMat(1,0,0,1);
  document.getElementById('w2_p_rot').onclick = ()=>setMat(0.7,-0.7,0.7,0.7);
  document.getElementById('w2_p_scale').onclick = ()=>setMat(2,0,0,0.5);
  document.getElementById('w2_p_shear').onclick = ()=>setMat(1,1,0,1);
  document.getElementById('w2_p_ref').onclick = ()=>setMat(-1,0,0,1);
  document.getElementById('w2_p_zero').onclick = ()=>setMat(1,1,1,1);
  document.getElementById('w2_reset').onclick = ()=>setMat(1,0,0,1);

  let gridHTML = '';
  for(let i=-5; i<=5; i+=1) {
    gridHTML += `<line x1="${i}" y1="-5" x2="${i}" y2="5" stroke="var(--rule)" stroke-width="0.05" />`;
    gridHTML += `<line x1="-5" y1="${i}" x2="5" y2="${i}" stroke="var(--rule)" stroke-width="0.05" />`;
  }
  grid.innerHTML = gridHTML;

  const update = ML.throttledRedraw(() => {
    const m = [[parseFloat(aa.value), parseFloat(ab.value)], [parseFloat(ac.value), parseFloat(ad.value)]];
    const det = ML.det2x2(m[0][0], m[0][1], m[1][0], m[1][1]);
    
    // Draw transformed grid
    let drawHTML = '';
    for(let i=-5; i<=5; i+=1) {
      const p1 = ML.matvec(m, [i, -5]), p2 = ML.matvec(m, [i, 5]);
      const p3 = ML.matvec(m, [-5, i]), p4 = ML.matvec(m, [5, i]);
      drawHTML += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="var(--teal)" stroke-width="0.03" opacity="0.5"/>`;
      drawHTML += `<line x1="${p3[0]}" y1="${p3[1]}" x2="${p4[0]}" y2="${p4[1]}" stroke="var(--teal)" stroke-width="0.03" opacity="0.5"/>`;
    }

    // Unit square
    const pts = [[0,0], [1,0], [1,1], [0,1]];
    const tpts = pts.map(p => ML.matvec(m, p));
    const poly = tpts.map(p => `${p[0]},${p[1]}`).join(' ');
    drawHTML += `<polygon points="${poly}" fill="var(--indigo)" opacity="0.3" stroke="var(--indigo)" stroke-width="0.1" />`;
    
    // Basis vectors
    const e1 = ML.matvec(m, [1,0]), e2 = ML.matvec(m, [0,1]);
    drawHTML += `
      <line x1="0" y1="0" x2="${e1[0]}" y2="${e1[1]}" stroke="var(--indigo)" stroke-width="0.15" />
      <circle cx="${e1[0]}" cy="${e1[1]}" r="0.15" fill="var(--indigo)" />
      <line x1="0" y1="0" x2="${e2[0]}" y2="${e2[1]}" stroke="var(--plum)" stroke-width="0.15" />
      <circle cx="${e2[0]}" cy="${e2[1]}" r="0.15" fill="var(--plum)" />
    `;

    draw.innerHTML = drawHTML;
    readout.innerHTML = `Determinant (Area Scale Factor) = <strong>${ML.fmt(det)}</strong>`;
  });

  [aa,ab,ac,ad].forEach(el => el.addEventListener('input', update));
  update();
});

/* WIDGET 3: LINEAR SYSTEMS */
ML.lazyInit('w3_area', function() {
  const area = document.getElementById('w3_area');
  area.innerHTML = `
    <p>A system of linear equations is the heart of regression. When we write \\(\\mathbf{A}\\mathbf{x} = \\mathbf{b}\\), we are looking for the vector \\(\\mathbf{x}\\) that, when transformed by \\(\\mathbf{A}\\), exactly hits the target vector \\(\\mathbf{b}\\).</p>
    <p>In 2D, each equation represents a line. The solution \\(\\mathbf{x}\\) is where the two lines cross. But what if the lines are parallel? Then there is no solution (or infinitely many, if they overlap completely). This occurs when the matrix \\(\\mathbf{A}\\) is <em>singular</em>.</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>Line 1: <span class="val" id="w3_eq1">1x + 2y = 4</span></label>
        <div style="display:flex; gap:0.2rem">
          <input type="number" id="w3_a11" value="1" step="0.5" style="width:33%">
          <input type="number" id="w3_a12" value="2" step="0.5" style="width:33%">
          <input type="number" id="w3_b1" value="4" step="0.5" style="width:33%">
        </div>
        <label>Line 2: <span class="val" id="w3_eq2">3x - 1y = 2</span></label>
        <div style="display:flex; gap:0.2rem">
          <input type="number" id="w3_a21" value="3" step="0.5" style="width:33%">
          <input type="number" id="w3_a22" value="-1" step="0.5" style="width:33%">
          <input type="number" id="w3_b2" value="2" step="0.5" style="width:33%">
        </div>
        <button class="btn btn-primary mt-1" id="w3_make_singular">Make Singular (Parallel)</button>
        <button class="btn btn-reset mt-1" id="w3_reset">Reset</button>
      </div>
      <div class="widget-plot" style="display:flex; align-items:center; justify-content:center; background:#fff; border:1px solid var(--rule); border-radius:var(--radius); padding:1rem;">
        <svg id="w3_svg" viewBox="-10 -10 20 20" style="width:100%; max-width:400px; height:auto; overflow:visible; transform: scaleY(-1);">
          <g id="w3_grid"></g>
          <g id="w3_draw"></g>
        </svg>
      </div>
    </div>
    <div class="readout" id="w3_readout"></div>
    <div class="challenge">
      <div class="ch-title">Challenge: Infinite Solutions</div>
      Can you adjust the inputs so that the system has infinitely many solutions? What must be true about the two equations?
    </div>
  `;

  const i_a11=document.getElementById('w3_a11'), i_a12=document.getElementById('w3_a12'), i_b1=document.getElementById('w3_b1');
  const i_a21=document.getElementById('w3_a21'), i_a22=document.getElementById('w3_a22'), i_b2=document.getElementById('w3_b2');
  const grid=document.getElementById('w3_grid'), draw=document.getElementById('w3_draw');
  const readout=document.getElementById('w3_readout');

  document.getElementById('w3_reset').onclick=()=>{
    i_a11.value=1; i_a12.value=2; i_b1.value=4;
    i_a21.value=3; i_a22.value=-1; i_b2.value=2;
    update();
  };
  document.getElementById('w3_make_singular').onclick=()=>{
    i_a21.value = parseFloat(i_a11.value) * 2;
    i_a22.value = parseFloat(i_a12.value) * 2;
    // ensure b2 isn't exactly matching so they are parallel not coincident
    i_b2.value = parseFloat(i_b1.value) * 2 + 5; 
    update();
  };

  let gridHTML = `
    <line x1="-10" y1="0" x2="10" y2="0" stroke="var(--rule)" stroke-width="0.1" />
    <line x1="0" y1="-10" x2="0" y2="10" stroke="var(--rule)" stroke-width="0.1" />
  `;
  for(let i=-10; i<=10; i+=2) {
    if(i===0)continue;
    gridHTML+=`<line x1="${i}" y1="-10" x2="${i}" y2="10" stroke="var(--rule)" stroke-width="0.05" />`;
    gridHTML+=`<line x1="-10" y1="${i}" x2="10" y2="${i}" stroke="var(--rule)" stroke-width="0.05" />`;
  }
  grid.innerHTML=gridHTML;

  const update = ML.throttledRedraw(() => {
    const a11=parseFloat(i_a11.value), a12=parseFloat(i_a12.value), b1=parseFloat(i_b1.value);
    const a21=parseFloat(i_a21.value), a22=parseFloat(i_a22.value), b2=parseFloat(i_b2.value);
    document.getElementById('w3_eq1').innerText = `${a11}x + ${a12}y = ${b1}`;
    document.getElementById('w3_eq2').innerText = `${a21}x + ${a22}y = ${b2}`;

    let drawHTML='';
    const drawLine = (a,b,c,col) => {
      // ax+by=c
      let pts=[];
      if(Math.abs(b)>0.001){
        const y_at_m10 = (c - a*-10)/b; if(y_at_m10>=-20 && y_at_m10<=20) pts.push([-10, y_at_m10]);
        const y_at_p10 = (c - a*10)/b; if(y_at_p10>=-20 && y_at_p10<=20) pts.push([10, y_at_p10]);
      }
      if(Math.abs(a)>0.001){
        const x_at_m10 = (c - b*-10)/a; if(x_at_m10>=-20 && x_at_m10<=20) pts.push([x_at_m10, -10]);
        const x_at_p10 = (c - b*10)/a; if(x_at_p10>=-20 && x_at_p10<=20) pts.push([x_at_p10, 10]);
      }
      if(pts.length>=2) {
        drawHTML+=`<line x1="${pts[0][0]}" y1="${pts[0][1]}" x2="${pts[1][0]}" y2="${pts[1][1]}" stroke="${col}" stroke-width="0.2"/>`;
      }
    };
    drawLine(a11, a12, b1, ML.plotColors.data);
    drawLine(a21, a22, b2, ML.plotColors.model);

    const det = ML.det2x2(a11, a12, a21, a22);
    if(Math.abs(det)<1e-5) {
      // singular
      const diff = a11*b2 - a21*b1;
      if(Math.abs(diff)<1e-5 && Math.abs(a12*b2 - a22*b1)<1e-5) {
        readout.innerHTML = `<span style="color:var(--teal)">Rank = 1. Lines are coincident. Infinitely many solutions!</span>`;
      } else {
        readout.innerHTML = `<span style="color:var(--rose)">Rank = 1. Lines are parallel. No solution.</span>`;
      }
    } else {
      const sol = ML.solve([[a11,a12],[a21,a22]], [b1,b2]);
      if(sol) {
        drawHTML+=`<circle cx="${sol[0]}" cy="${sol[1]}" r="0.4" fill="var(--plum)"/>`;
        readout.innerHTML = `Rank = 2. Unique solution: <strong>x = ${ML.fmt(sol[0])}, y = ${ML.fmt(sol[1])}</strong>`;
      }
    }
    draw.innerHTML = drawHTML;
  });
  [i_a11,i_a12,i_b1,i_a21,i_a22,i_b2].forEach(el=>el.addEventListener('input', update));
  update();
});

/* WIDGET 4: COORDINATE SYSTEMS */
ML.lazyInit('w4_area', function() {
  const area = document.getElementById('w4_area');
  area.innerHTML = `
    <p>A coordinate system lets us map data points to a spatial framework. Each feature of a data point corresponds to an axis. If we have two features (like square footage and number of bedrooms), we can plot each house as a point in a 2D coordinate system.</p>
    <p>What if we want to model house price as well? Then we need a 3rd dimension. Suddenly our points live in 3D space, and our regression task will be to find a 2D plane that slices neatly through them!</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>View Mode</label>
        <div class="presets">
          <button id="w4_btn_2d" class="active">2D (Features Only)</button>
          <button id="w4_btn_3d">3D (Features + Price)</button>
        </div>
        <p class="text-sm text-muted mt-2">Interact with the plot! You can drag to rotate the 3D view.</p>
      </div>
      <div class="widget-plot" id="w4_plot"></div>
    </div>
  `;

  const plotDiv = document.getElementById('w4_plot');
  const data = ML.housePriceData(50, 42); 
  let is3D = false;

  const btn2d = document.getElementById('w4_btn_2d');
  const btn3d = document.getElementById('w4_btn_3d');

  function draw() {
    if(!is3D) {
      const trace = {
        x: data.sqft, y: data.beds, mode: 'markers', type: 'scatter',
        marker: {size: 8, color: ML.plotColors.data, opacity: 0.8}
      };
      Plotly.react(plotDiv, [trace], ML.plotLayout({
        title: '2D: Features (Sqft vs Beds)',
        xaxis: {title: 'Sqft'}, yaxis: {title: 'Beds'}
      }), ML.plotConfig);
    } else {
      const trace = {
        x: data.sqft, y: data.beds, z: data.price,
        mode: 'markers', type: 'scatter3d',
        marker: {size: 5, color: ML.plotColors.gradient, opacity: 0.8}
      };
      Plotly.react(plotDiv, [trace], {
        margin: {l:0, r:0, t:30, b:0},
        scene: {
          xaxis: {title: 'Sqft'}, yaxis: {title: 'Beds'}, zaxis: {title: 'Price ($k)'}
        }
      }, ML.plotConfig);
    }
  }

  btn2d.onclick = () => { is3D=false; btn2d.classList.add('active'); btn3d.classList.remove('active'); draw(); };
  btn3d.onclick = () => { is3D=true; btn3d.classList.add('active'); btn2d.classList.remove('active'); draw(); };
  draw();
});

/* WIDGET 5: DERIVATIVES */
ML.lazyInit('w5_area', function() {
  const area = document.getElementById('w5_area');
  area.innerHTML = `
    <p>The derivative measures the <strong>instantaneous rate of change</strong> of a function. If you are standing on a hill, the derivative tells you exactly how steep the slope is beneath your feet.</p>
    <p>We calculate this by taking two points on the curve (a secant line) and bringing them infinitely close together until they form a tangent line.</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>Function f(x)
          <select id="w5_fn">
            <option value="x2">f(x) = x²</option>
            <option value="x3">f(x) = x³ / 3</option>
            <option value="sin">f(x) = sin(x)</option>
          </select>
        </label>
        <label>x value: <span class="val" id="w5_x_val">1</span>
          <input type="range" id="w5_x" min="-3" max="3" step="0.1" value="1">
        </label>
        <label>Step h (secant &rarr; tangent): <span class="val" id="w5_h_val">2.0</span>
          <input type="range" id="w5_h" min="0.001" max="2" step="0.01" value="2">
        </label>
      </div>
      <div class="widget-plot" id="w5_plot"></div>
    </div>
    <div class="readout" id="w5_readout"></div>
  `;

  const sel = document.getElementById('w5_fn'), ix = document.getElementById('w5_x'), ih = document.getElementById('w5_h');
  const px = document.getElementById('w5_x_val'), ph = document.getElementById('w5_h_val');
  const readout = document.getElementById('w5_readout');
  const plotDiv = document.getElementById('w5_plot');

  const funcs = {
    x2: { fn: x=>x*x, name: 'x²' },
    x3: { fn: x=>x*x*x/3, name: 'x³/3' },
    sin: { fn: Math.sin, name: 'sin(x)' }
  };

  const update = ML.throttledRedraw(() => {
    const x = parseFloat(ix.value);
    const h = parseFloat(ih.value);
    const f = funcs[sel.value].fn;
    px.innerText = x; ph.innerText = h.toFixed(3);

    const x_vals = [], y_vals = [];
    for(let i=-4; i<=4; i+=0.1){ x_vals.push(i); y_vals.push(f(i)); }

    const y = f(x), yh = f(x+h);
    const slope = (yh - y)/h;

    const t_curve = {x: x_vals, y: y_vals, type:'scatter', mode:'lines', line:{color:ML.plotColors.data}, name:'f(x)'};
    const t_pts = {x: [x, x+h], y: [y, yh], type:'scatter', mode:'markers', marker:{color:ML.plotColors.plum, size:8}, name:'Points'};
    
    // secant line extending past points
    const s_line = {x: [x-2, x+h+2], y: [y - 2*slope, yh + 2*slope], type:'scatter', mode:'lines', line:{color:ML.plotColors.model, dash:'dash'}, name:'Secant'};

    Plotly.react(plotDiv, [t_curve, s_line, t_pts], ML.plotLayout({
      showlegend: false, xaxis: {range: [-4,4]}, yaxis: {range: [-4,4]}
    }), ML.plotConfig);

    readout.innerHTML = `Slope = \\(\\frac{f(x+h) - f(x)}{h}\\) = \\(\\frac{${ML.fmt(yh)} - ${ML.fmt(y)}}{${h.toFixed(3)}}\\) = <strong>${ML.fmt(slope, 4)}</strong>`;
    if(window.renderMathInElement) renderMathInElement(readout);
  });

  [sel, ix, ih].forEach(el=>el.addEventListener('input', update));
  update();
});

/* WIDGET 6: GRADIENTS */
ML.lazyInit('w6_area', function() {
  const area = document.getElementById('w6_area');
  area.innerHTML = `
    <p>In multiple dimensions, the derivative becomes a vector called the <strong>gradient</strong>. The gradient always points in the direction of steepest <em>ascent</em> (uphill). By taking small steps in the <em>opposite</em> direction (the negative gradient), we can roll downhill to find the minimum of a function.</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>Surface</label>
        <div class="presets">
          <button id="w6_f_bowl" class="active">Bowl (x² + y²)</button>
          <button id="w6_f_saddle">Saddle (x² - y²)</button>
        </div>
        <p class="text-sm mt-2"><strong>Click on the contour plot!</strong> It will show the gradient vector at that point.</p>
        <button class="btn btn-primary mt-1" id="w6_step">Walk Downhill (Gradient Descent)</button>
        <button class="btn btn-reset mt-1" id="w6_reset">Reset Point</button>
      </div>
      <div class="widget-plot" id="w6_plot" style="height:400px"></div>
    </div>
    <div class="readout" id="w6_readout"></div>
  `;

  const plotDiv = document.getElementById('w6_plot');
  let currentFn = 'bowl';
  let pX = 2, pY = 2;

  const fns = {
    bowl: { f: (x,y)=>x*x + y*y, gx: (x,y)=>2*x, gy: (x,y)=>2*y },
    saddle: { f: (x,y)=>x*x - y*y, gx: (x,y)=>2*x, gy: (x,y)=>-2*y }
  };

  document.getElementById('w6_f_bowl').onclick = (e) => { currentFn='bowl'; e.target.classList.add('active'); document.getElementById('w6_f_saddle').classList.remove('active'); draw(); };
  document.getElementById('w6_f_saddle').onclick = (e) => { currentFn='saddle'; e.target.classList.add('active'); document.getElementById('w6_f_bowl').classList.remove('active'); draw(); };
  document.getElementById('w6_reset').onclick = () => { pX=2; pY=2; draw(); };
  document.getElementById('w6_step').onclick = () => {
    const fn = fns[currentFn];
    const lr = 0.2;
    pX = pX - lr * fn.gx(pX, pY);
    pY = pY - lr * fn.gy(pX, pY);
    draw();
  };

  plotDiv.on('plotly_click', data => {
    pX = data.points[0].x;
    pY = data.points[0].y;
    draw();
  });

  function draw() {
    const fn = fns[currentFn];
    const xv = [], yv = [], zv = [];
    for(let i=-3; i<=3; i+=0.2){
      xv.push(i); yv.push(i);
      const row=[];
      for(let j=-3; j<=3; j+=0.2) row.push(fn.f(j,i));
      zv.push(row);
    }

    const t_contour = {
      z: zv, x: xv, y: yv, type: 'contour', colorscale: 'Viridis', showscale: false
    };

    const gx = fn.gx(pX, pY), gy = fn.gy(pX, pY);
    const gradLen = Math.hypot(gx,gy);
    const t_pt = { x: [pX], y: [pY], mode: 'markers', marker: {size: 10, color: 'red'} };

    // We draw arrows using annotations
    const annotations = [];
    if(gradLen > 0.01) {
      // gradient arrow (uphill)
      annotations.push({
        x: pX + gx*0.2, y: pY + gy*0.2,
        ax: pX, ay: pY,
        xref: 'x', yref: 'y', axref: 'x', ayref: 'y',
        showarrow: true, arrowhead: 2, arrowcolor: ML.plotColors.plum, arrowsize: 1.5
      });
      // negative gradient (downhill)
      annotations.push({
        x: pX - gx*0.2, y: pY - gy*0.2,
        ax: pX, ay: pY,
        xref: 'x', yref: 'y', axref: 'x', ayref: 'y',
        showarrow: true, arrowhead: 2, arrowcolor: ML.plotColors.model, arrowsize: 1.5, arrowdash: 'dash'
      });
    }

    Plotly.react(plotDiv, [t_contour, t_pt], ML.plotLayout({
      annotations, xaxis: {range:[-3,3]}, yaxis: {range:[-3,3]}
    }), ML.plotConfig);

    document.getElementById('w6_readout').innerHTML = `Point: (${ML.fmt(pX)}, ${ML.fmt(pY)})<br>Gradient: [\\(\\frac{\\partial f}{\\partial x}\\), \\(\\frac{\\partial f}{\\partial y}\\)] = [${ML.fmt(gx)}, ${ML.fmt(gy)}]`;
    if(window.renderMathInElement) renderMathInElement(document.getElementById('w6_readout'));
  }
  
  // init delay to ensure plotly is ready
  setTimeout(draw, 100);
});

/* WIDGET 7: MAXIMA MINIMA */
ML.lazyInit('w7_area', function() {
  const area = document.getElementById('w7_area');
  area.innerHTML = `
    <p>When the gradient is exactly zero, we are at a <strong>critical point</strong>. But is it a minimum (a valley), a maximum (a peak), or a saddle point (a mountain pass)? To find out, we look at the <strong>Hessian matrix</strong>, which contains the second derivatives (the curvature).</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>Surface Topology</label>
        <div class="presets">
          <button id="w7_bowl" class="active">Bowl (Min)</button>
          <button id="w7_hill">Hill (Max)</button>
          <button id="w7_saddle">Saddle (Mixed)</button>
          <button id="w7_ridge">Ridge (Degenerate)</button>
        </div>
        <button class="btn btn-reset mt-1" id="w7_reset">Reset</button>
      </div>
      <div class="widget-plot" id="w7_plot" style="height:400px"></div>
    </div>
    <div class="readout" id="w7_readout"></div>
  `;

  const plotDiv = document.getElementById('w7_plot');
  const fns = {
    bowl: { f: (x,y)=>x*x + y*y, H: [[2,0],[0,2]], name: 'Bowl' },
    hill: { f: (x,y)=>-x*x - y*y, H: [[-2,0],[0,-2]], name: 'Hill' },
    saddle: { f: (x,y)=>x*x - y*y, H: [[2,0],[0,-2]], name: 'Saddle' },
    ridge: { f: (x,y)=>x*x, H: [[2,0],[0,0]], name: 'Ridge' }
  };
  let cur = 'bowl';

  ['bowl','hill','saddle','ridge'].forEach(k => {
    document.getElementById('w7_'+k).onclick = (e) => {
      cur = k; 
      ['bowl','hill','saddle','ridge'].forEach(id => document.getElementById('w7_'+id).classList.remove('active'));
      e.target.classList.add('active');
      draw();
    };
  });
  
  document.getElementById('w7_reset').onclick = () => { cur = 'bowl'; draw(); };

  function draw() {
    const fn = fns[cur];
    const xv = [], yv = [], zv = [];
    for(let i=-2; i<=2; i+=0.2){
      xv.push(i); yv.push(i);
      const row=[];
      for(let j=-2; j<=2; j+=0.2) row.push(fn.f(j,i));
      zv.push(row);
    }
    const trace = {z: zv, x: xv, y: yv, type: 'surface', colorscale: 'Viridis', showscale: false};
    Plotly.react(plotDiv, [trace], {margin:{l:0,r:0,t:0,b:0}}, ML.plotConfig);
    
    const eig = ML.eigen2x2Sym(fn.H[0][0], fn.H[0][1], fn.H[1][1]);
    const e1 = ML.fmt(eig.values[0]), e2 = ML.fmt(eig.values[1]);
    
    let type = '';
    if(eig.values[0]>0 && eig.values[1]>0) type = 'Local Minimum (All eigenvalues > 0)';
    else if(eig.values[0]<0 && eig.values[1]<0) type = 'Local Maximum (All eigenvalues < 0)';
    else if(eig.values[0]*eig.values[1] < 0) type = 'Saddle Point (Mixed eigenvalues)';
    else type = 'Degenerate (Zero eigenvalue)';

    document.getElementById('w7_readout').innerHTML = `
      Hessian Matrix:<br>
      [ ${fn.H[0][0]} , ${fn.H[0][1]} ]<br>
      [ ${fn.H[1][0]} , ${fn.H[1][1]} ]<br>
      Eigenvalues: ${e1}, ${e2}<br>
      <strong style="color:var(--teal)">Classification: ${type}</strong>
    `;
  }
  setTimeout(draw, 100);
});
