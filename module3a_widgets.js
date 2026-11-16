// Module 3a Widgets: 13-18 (Core Regression)
// Each widget is an IIFE registered with ML.lazyInit

// ============================================================
// WIDGET 13 — Matrix Representation: y = Xw
// ============================================================
ML.lazyInit('w13_area', function(){
  const area = document.getElementById('w13_area');
  area.innerHTML = `
    <p>Every regression problem can be written as a single matrix equation. Your data table — rows of measurements — becomes the <strong>design matrix</strong> \\(\\mathbf{X}\\). The column of outputs becomes the <strong>target vector</strong> \\(\\mathbf{y}\\). And the model's job is to find a <strong>weight vector</strong> \\(\\mathbf{w}\\) such that \\(\\mathbf{Xw} \\approx \\mathbf{y}\\).</p>
    <p>We always add a column of 1s to \\(\\mathbf{X}\\) — this is the <strong>bias (intercept) column</strong>. It lets the model shift the prediction up or down without needing any input feature to do it.</p>
    <p>Try editing the data table below. Watch how the matrix equation updates live. Hover over any cell to see which data point it corresponds to.</p>

    <div class="widget-full">
      <div class="btn-group mb-1">
        <button class="btn btn-sm" id="w13_add">+ Add Row</button>
        <button class="btn btn-sm" id="w13_del">− Remove Row</button>
        <button class="btn btn-sm" id="w13_tog" data-feat="1">Toggle 2 Features</button>
        <button class="btn btn-reset" id="w13_reset">Reset</button>
      </div>
      <div class="side-by-side" id="w13_tables">
        <div>
          <div class="text-sm text-muted mb-1"><strong>Data Table</strong></div>
          <div id="w13_data" class="matrix-display"></div>
        </div>
        <div>
          <div class="text-sm text-muted mb-1"><strong>Matrix Equation: y = Xw</strong></div>
          <div id="w13_eq" style="overflow-x:auto"></div>
        </div>
      </div>
      <div class="readout mt-1" id="w13_readout"></div>
    </div>

    $$\\mathbf{y} = \\mathbf{X}\\mathbf{w} = \\begin{bmatrix} 1 & x_{1} \\\\ 1 & x_{2} \\\\ \\vdots & \\vdots \\\\ 1 & x_{n} \\end{bmatrix} \\begin{bmatrix} w_0 \\\\ w_1 \\end{bmatrix}$$

    <details class="check">
      <summary>Why do we need the column of 1s?</summary>
      <div class="ans">Without it, the model is forced through the origin — the prediction at \\(x=0\\) would always be 0. The column of 1s multiplies \\(w_0\\), giving us a free <em>intercept</em> (y-offset).</div>
    </details>
    <div class="misconception">The bias column is not a "feature" from the data — it's a constant we add ourselves so that the matrix equation can represent an intercept. Every row gets a 1.</div>
  `;
  if(typeof renderMathInElement==='function') renderMathInElement(area);

  let nFeat = 1;
  const defaultData1 = [[1,2],[2,2.8],[3,4.2],[4,3.9],[5,5.5]];
  const defaultData2 = [[1,3,2],[2,1,2.8],[3,2,4.2],[4,4,3.9],[5,2,5.5]];
  let data = defaultData1.map(r=>[...r]);
  let highlightRow = -1;

  function render(){
    const nCol = nFeat + 1; // feature cols + y
    // Data table
    let html = '<table><thead><tr>';
    const headers = nFeat===1 ? ['x','y'] : ['x₁','x₂','y'];
    headers.forEach(h => html += `<th style="padding:3px 8px;font-size:.8rem;color:var(--ink-soft)">${h}</th>`);
    html += '</tr></thead><tbody>';
    data.forEach((row, i) => {
      html += `<tr class="${i===highlightRow?'highlight':''}" data-row="${i}">`;
      row.forEach((v, j) => {
        html += `<td class="${i===highlightRow?'highlight':''}" data-row="${i}" data-col="${j}" contenteditable="true" style="min-width:40px;cursor:text">${ML.fmt(v,1)}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('w13_data').innerHTML = html;

    // Build design matrix X (with bias column)
    const X = data.map(row => {
      const r = [1];
      for(let j = 0; j < nFeat; j++) r.push(row[j]);
      return r;
    });
    const y = data.map(row => row[row.length - 1]);
    const w = ML.olsSolve(X, y);

    // Matrix equation display
    let eqHtml = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:.82rem;font-family:Courier New,monospace">';
    // y vector
    eqHtml += '<div><div style="text-align:center;font-size:.7rem;color:var(--ink-soft);margin-bottom:2px">y</div><table style="border:2px solid var(--indigo);border-radius:3px">';
    y.forEach((v,i) => eqHtml += `<tr><td style="padding:2px 6px;${i===highlightRow?'background:rgba(59,82,139,.15)':''}">${ML.fmt(v,1)}</td></tr>`);
    eqHtml += '</table></div><div style="font-size:1.2rem">=</div>';
    // X matrix
    eqHtml += '<div><div style="text-align:center;font-size:.7rem;color:var(--ink-soft);margin-bottom:2px">X</div><table style="border:2px solid var(--teal);border-radius:3px">';
    X.forEach((row,i) => {
      eqHtml += `<tr>`;
      row.forEach((v,j) => eqHtml += `<td style="padding:2px 6px;${i===highlightRow?'background:rgba(31,138,133,.12)':''}">${j===0?'1':ML.fmt(v,1)}</td>`);
      eqHtml += '</tr>';
    });
    eqHtml += '</table></div>';
    // w vector
    if(w){
      eqHtml += '<div><div style="text-align:center;font-size:.7rem;color:var(--ink-soft);margin-bottom:2px">w</div><table style="border:2px solid var(--plum);border-radius:3px">';
      w.forEach((v,i) => eqHtml += `<tr><td style="padding:2px 6px">${ML.fmt(v,2)}</td></tr>`);
      eqHtml += '</table></div>';
    }
    eqHtml += '</div>';
    document.getElementById('w13_eq').innerHTML = eqHtml;

    // Readout
    if(w){
      const yhat = ML.predictions(X, w);
      const r2 = ML.rSquared(X, y, w);
      const sse = ML.sseLoss(X, y, w);
      let rStr = `<b>Fitted weights:</b> w = [${w.map(v=>ML.fmt(v,3)).join(', ')}]\n`;
      rStr += `<b>SSE:</b> ${ML.fmt(sse,3)}   <b>R²:</b> ${ML.fmt(r2,4)}   <b>n:</b> ${data.length}   <b>d:</b> ${nFeat+1}`;
      document.getElementById('w13_readout').innerHTML = rStr;
    } else {
      document.getElementById('w13_readout').innerHTML = '<span style="color:var(--rose)">Matrix is singular — cannot solve.</span>';
    }
  }

  // Event delegation for editable cells
  document.getElementById('w13_data').addEventListener('blur', function(e){
    if(e.target.tagName==='TD' && e.target.dataset.row!==undefined){
      const r = +e.target.dataset.row, c = +e.target.dataset.col;
      const v = parseFloat(e.target.textContent);
      if(!isNaN(v)) data[r][c] = v;
      render();
    }
  }, true);

  document.getElementById('w13_data').addEventListener('mouseover', function(e){
    if(e.target.dataset.row!==undefined){
      highlightRow = +e.target.dataset.row;
      render();
    }
  });
  document.getElementById('w13_data').addEventListener('mouseout', function(){
    highlightRow = -1;
    render();
  });

  document.getElementById('w13_add').onclick = () => {
    const cols = nFeat + 1;
    const row = new Array(cols).fill(0);
    row[0] = data.length + 1;
    row[cols-1] = row[0] * 1.2;
    data.push(row);
    render();
  };
  document.getElementById('w13_del').onclick = () => {
    if(data.length > 2) data.pop();
    render();
  };
  document.getElementById('w13_tog').onclick = function(){
    nFeat = nFeat === 1 ? 2 : 1;
    this.textContent = nFeat === 1 ? 'Toggle 2 Features' : 'Toggle 1 Feature';
    data = (nFeat === 1 ? defaultData1 : defaultData2).map(r=>[...r]);
    render();
  };
  document.getElementById('w13_reset').onclick = () => {
    nFeat = 1;
    data = defaultData1.map(r=>[...r]);
    document.getElementById('w13_tog').textContent = 'Toggle 2 Features';
    render();
  };

  render();
});


// ============================================================
// WIDGET 14 — Line and Plane Fitting
// ============================================================
ML.lazyInit('w14_area', function(){
  const area = document.getElementById('w14_area');
  area.innerHTML = `
    <p>A linear model with one input draws a <strong>line</strong>: \\(\\hat{y} = w_0 + w_1 x\\). With two inputs, it draws a <strong>plane</strong>: \\(\\hat{y} = w_0 + w_1 x_1 + w_2 x_2\\). The <strong>residuals</strong> — vertical distances from each point to the line/plane — show how wrong the model is.</p>
    <p>Drag the sliders to change \\(w_0\\) (intercept) and \\(w_1\\) (slope). Can you minimise the Sum of Squared Errors (SSE) by hand?</p>

    <div class="widget-grid">
      <div class="widget-controls">
        <label>w₀ (intercept) <span class="val" id="w14_v0">1.0</span>
          <input type="range" id="w14_w0" min="-5" max="5" step="0.1" value="1">
        </label>
        <label>w₁ (slope) <span class="val" id="w14_v1">0.5</span>
          <input type="range" id="w14_w1" min="-3" max="3" step="0.05" value="0.5">
        </label>
        <div class="presets">
          <button data-w0="1" data-w1="0.5">Default</button>
          <button id="w14_ols">OLS Best Fit</button>
        </div>
        <label><input type="checkbox" id="w14_resid"> Show residuals</label>
        <label><input type="checkbox" id="w14_sse_show" checked> Show SSE</label>
        <div class="readout" id="w14_readout"></div>
        <button class="btn btn-reset" id="w14_reset">Reset</button>
      </div>
      <div class="widget-plot" id="w14_plot"></div>
    </div>

    <div class="challenge">
      <div class="ch-title">Set w₀ and w₁ so that SSE < 5</div>
      <div id="w14_challenge_status"></div>
      <div class="ch-win">✅ Challenge Complete!</div>
    </div>

    <details class="check">
      <summary>If you double w₁, what happens to the line?</summary>
      <div class="ans">The line gets twice as steep — its slope doubles. But the SSE will likely increase unless the data happens to follow that steeper slope.</div>
    </details>
    <div class="misconception">The "best fit" line doesn't have to pass through any data point. It minimises the <em>total</em> squared vertical distances, which usually means it passes <em>between</em> the points.</div>
  `;
  if(typeof renderMathInElement==='function') renderMathInElement(area);

  const dataset = ML.noisyLine(25, 1, 0.8, 1.2, 314);
  const X = ML.designMatrix([dataset.x]);
  const wOLS = ML.olsSolve(X, dataset.y);

  const redraw = ML.throttledRedraw(function(){
    const w0 = +document.getElementById('w14_w0').value;
    const w1 = +document.getElementById('w14_w1').value;
    document.getElementById('w14_v0').textContent = w0.toFixed(1);
    document.getElementById('w14_v1').textContent = w1.toFixed(2);
    const w = [w0, w1];
    const sse = ML.sseLoss(X, dataset.y, w);
    const r2 = ML.rSquared(X, dataset.y, w);

    const traces = [{
      x: dataset.x, y: dataset.y, mode: 'markers',
      marker: {color: ML.plotColors.data, size: 7},
      name: 'Data', type: 'scatter'
    }];

    // Model line
    const xLine = [-6, 6];
    traces.push({
      x: xLine, y: xLine.map(x => w0 + w1 * x),
      mode: 'lines', line: {color: ML.plotColors.model, width: 2.5},
      name: 'Model', type: 'scatter'
    });

    // Residuals
    if(document.getElementById('w14_resid').checked){
      dataset.x.forEach((xi, i) => {
        const yhat = w0 + w1 * xi;
        traces.push({
          x: [xi, xi], y: [dataset.y[i], yhat],
          mode: 'lines', line: {color: ML.plotColors.residual, width: 1, dash: 'dot'},
          showlegend: false, type: 'scatter', hoverinfo: 'skip'
        });
      });
    }

    const layout = ML.plotLayout({
      xaxis: {title: 'x', range: [-6, 6], gridcolor:'#E8EAE4',zerolinecolor:'#D9DCD4'},
      yaxis: {title: 'y', range: [-8, 10], gridcolor:'#E8EAE4',zerolinecolor:'#D9DCD4'},
      showlegend: true,
      legend: {x: 0.01, y: 0.99, bgcolor: 'rgba(255,255,255,0.8)', font:{size:11}},
      title: document.getElementById('w14_sse_show').checked ? `SSE = ${ML.fmt(sse,2)}` : ''
    });

    Plotly.react('w14_plot', traces, layout, ML.plotConfig);

    let rd = `<b>SSE:</b> ${ML.fmt(sse,2)}   <b>R²:</b> ${ML.fmt(r2,3)}`;
    if(wOLS) rd += `\n<b>OLS best:</b> w=[${wOLS.map(v=>ML.fmt(v,3)).join(', ')}]`;
    document.getElementById('w14_readout').innerHTML = rd;

    // Challenge check
    const ch = document.querySelector('#w14_area .challenge');
    if(sse < 5){ ch.classList.add('success'); }
    else { ch.classList.remove('success'); }
  });

  ['w14_w0','w14_w1'].forEach(id => document.getElementById(id).addEventListener('input', redraw));
  ['w14_resid','w14_sse_show'].forEach(id => document.getElementById(id).addEventListener('change', redraw));

  // Presets
  document.querySelectorAll('#w14_area .presets button[data-w0]').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('w14_w0').value = btn.dataset.w0;
      document.getElementById('w14_w1').value = btn.dataset.w1;
      redraw();
    };
  });
  document.getElementById('w14_ols').onclick = () => {
    if(wOLS){
      document.getElementById('w14_w0').value = ML.clamp(wOLS[0],-5,5);
      document.getElementById('w14_w1').value = ML.clamp(wOLS[1],-3,3);
      redraw();
    }
  };
  document.getElementById('w14_reset').onclick = () => {
    document.getElementById('w14_w0').value = 1;
    document.getElementById('w14_w1').value = 0.5;
    document.getElementById('w14_resid').checked = false;
    document.getElementById('w14_sse_show').checked = true;
    redraw();
  };

  redraw();
});


// ============================================================
// WIDGET 15 — OLS & Projection Geometry
// ============================================================
ML.lazyInit('w15_area', function(){
  const area = document.getElementById('w15_area');
  area.innerHTML = `
    <p>Ordinary Least Squares (OLS) has a beautiful geometric interpretation. The predicted values \\(\\hat{\\mathbf{y}} = \\mathbf{X}\\mathbf{w}\\) are the <strong>orthogonal projection</strong> of \\(\\mathbf{y}\\) onto the column space of \\(\\mathbf{X}\\). The residual \\(\\mathbf{r} = \\mathbf{y} - \\hat{\\mathbf{y}}\\) is perpendicular to every column of \\(\\mathbf{X}\\).</p>
    <p>This means \\(\\mathbf{X}^T \\mathbf{r} = \\mathbf{0}\\) — the <strong>normal equations</strong>. Left panel: residuals in data space. Right panel: the geometric column-space view (for 3 data points).</p>

    <div class="side-by-side">
      <div>
        <div class="text-sm text-muted mb-1"><strong>Data Space</strong> — residuals from points to line</div>
        <div class="widget-plot" id="w15_data_plot" style="height:320px"></div>
      </div>
      <div>
        <div class="text-sm text-muted mb-1"><strong>Column Space View</strong> — y projected onto span(X)</div>
        <div class="widget-plot" id="w15_col_plot" style="height:320px"></div>
      </div>
    </div>
    <div class="readout mt-1" id="w15_readout"></div>
    <button class="btn btn-reset mt-1" id="w15_reset">Reset</button>

    $$\\hat{\\mathbf{y}} = \\mathbf{X}(\\mathbf{X}^T\\mathbf{X})^{-1}\\mathbf{X}^T\\mathbf{y}, \\quad \\mathbf{X}^T(\\mathbf{y} - \\hat{\\mathbf{y}}) = \\mathbf{0}$$

    <details class="check">
      <summary>Why must the residual be perpendicular to the column space?</summary>
      <div class="ans">Because any component of the residual that lies <em>within</em> the column space could be reduced by adjusting \\(\\mathbf{w}\\). At the optimum, there's nowhere left to go — the residual is entirely in the orthogonal complement.</div>
    </details>
    <div class="misconception">Projection isn't about physical space — it's about the abstract space \\(\\mathbb{R}^n\\) where each data point contributes one dimension. The "plane" in the column-space view is spanned by the columns of X, not by the features.</div>
  `;
  if(typeof renderMathInElement==='function') renderMathInElement(area);

  // Use 3 data points for the column-space view (R^3)
  const xs = [1, 3, 5];
  const ys = [2.2, 3.8, 5.8];
  const X = xs.map(x => [1, x]);
  const w = ML.olsSolve(X, ys);
  const yhat = ML.predictions(X, w);
  const resid = ys.map((yi,i) => yi - yhat[i]);

  function drawDataSpace(){
    const traces = [
      {x:xs, y:ys, mode:'markers', marker:{color:ML.plotColors.data,size:9}, name:'Data (y)', type:'scatter'},
      {x:[-1,7], y:[-1,7].map(x=>w[0]+w[1]*x), mode:'lines', line:{color:ML.plotColors.model,width:2}, name:'Fit (ŷ)', type:'scatter'},
    ];
    xs.forEach((xi,i) => {
      traces.push({x:[xi,xi],y:[ys[i],yhat[i]],mode:'lines',line:{color:ML.plotColors.residual,width:2,dash:'dot'},showlegend:i===0,name:i===0?'Residuals':'',type:'scatter',hoverinfo:'skip'});
    });
    Plotly.react('w15_data_plot', traces, ML.plotLayout({
      xaxis:{title:'x',range:[-0.5,6.5]},yaxis:{title:'y',range:[0,7.5]},
      showlegend:true,legend:{x:.01,y:.99,bgcolor:'rgba(255,255,255,.8)',font:{size:10}},
      margin:{l:40,r:10,t:10,b:35}
    }), ML.plotConfig);
  }

  function drawColSpace(){
    // In R^3, col1 = [1,1,1], col2 = [x1,x2,x3]
    const c1 = [1,1,1], c2 = xs;
    // y, yhat, residual as 3D vectors
    const traces = [
      {x:[0,ys[0]],y:[0,ys[1]],z:[0,ys[2]],mode:'lines+markers',line:{color:ML.plotColors.data,width:4},marker:{size:4},name:'y',type:'scatter3d'},
      {x:[0,yhat[0]],y:[0,yhat[1]],z:[0,yhat[2]],mode:'lines+markers',line:{color:ML.plotColors.model,width:4},marker:{size:4},name:'ŷ (projection)',type:'scatter3d'},
      {x:[yhat[0],ys[0]],y:[yhat[1],ys[1]],z:[yhat[2],ys[2]],mode:'lines',line:{color:ML.plotColors.residual,width:3,dash:'dot'},name:'r = y − ŷ',type:'scatter3d'},
      // Column space plane
      {x:[0,3*c1[0]],y:[0,3*c1[1]],z:[0,3*c1[2]],mode:'lines',line:{color:'rgba(31,138,133,.3)',width:2},name:'col 1 (ones)',type:'scatter3d',showlegend:false},
      {x:[0,c2[0]],y:[0,c2[1]],z:[0,c2[2]],mode:'lines',line:{color:'rgba(31,138,133,.5)',width:2},name:'col 2 (x)',type:'scatter3d',showlegend:false},
    ];
    Plotly.react('w15_col_plot', traces, {
      paper_bgcolor:'rgba(0,0,0,0)',
      scene:{
        xaxis:{title:'dim 1',range:[-1,7]},yaxis:{title:'dim 2',range:[-1,7]},zaxis:{title:'dim 3',range:[-1,7]},
        camera:{eye:{x:1.8,y:1.2,z:0.8}},
        aspectmode:'cube'
      },
      font:{family:'Source Serif 4, serif',size:11,color:'#1A1F2E'},
      margin:{l:0,r:0,t:0,b:0},
      showlegend:true,legend:{x:.7,y:.95,font:{size:10}}
    }, ML.plotConfig);
  }

  // X^T r check
  const Xt = ML.transpose(X);
  const Xtr = ML.matvec(Xt, resid);
  let rd = `<b>X^T r =</b> [${Xtr.map(v=>ML.fmt(v,6)).join(', ')}]  (should be ≈ 0)\n`;
  rd += `<b>w =</b> [${w.map(v=>ML.fmt(v,4)).join(', ')}]   <b>||r|| =</b> ${ML.fmt(ML.vnorm(resid),4)}`;
  document.getElementById('w15_readout').innerHTML = rd;

  document.getElementById('w15_reset').onclick = () => { drawDataSpace(); drawColSpace(); };
  drawDataSpace();
  drawColSpace();
});


// ============================================================
// WIDGET 16 — Loss Contours
// ============================================================
ML.lazyInit('w16_area', function(){
  const area = document.getElementById('w16_area');
  area.innerHTML = `
    <p>The loss function \\(J(w_0, w_1) = \\frac{1}{n}\\sum(y_i - w_0 - w_1 x_i)^2\\) defines a <strong>surface</strong> over the weight space. Every point \\((w_0, w_1)\\) corresponds to a different line, and the height is how wrong that line is.</p>
    <p>For ordinary least squares, this surface is always a <strong>paraboloid</strong> (bowl shape) — it has exactly one minimum. The contour lines are ellipses whose shape depends on the data's feature correlations and scales.</p>
    <p><strong>Predict, then reveal:</strong> If you increase the correlation between features, what happens to the contour ellipses?</p>

    <div class="widget-grid">
      <div class="widget-controls">
        <label>Feature correlation <span class="val" id="w16_vc">0.0</span>
          <input type="range" id="w16_corr" min="0" max="0.95" step="0.05" value="0">
        </label>
        <label>Feature scale ratio <span class="val" id="w16_vs">1.0</span>
          <input type="range" id="w16_scale" min="1" max="20" step="0.5" value="1">
        </label>
        <label>Drag w₀ <span class="val" id="w16_dw0">0.0</span></label>
        <label>Drag w₁ <span class="val" id="w16_dw1">0.0</span></label>
        <div class="readout" id="w16_readout"></div>
        <button class="btn btn-reset" id="w16_reset">Reset</button>
      </div>
      <div>
        <div class="side-by-side">
          <div class="widget-plot" id="w16_contour" style="height:340px"></div>
          <div class="widget-plot" id="w16_dataplot" style="height:340px"></div>
        </div>
      </div>
    </div>

    <details class="check">
      <summary>Why do correlated features make the contours narrow?</summary>
      <div class="ans">When features are correlated, many different combinations of \\(w_0, w_1\\) give similar predictions. The loss changes rapidly in one direction (perpendicular to the correlation) but slowly along it — producing a narrow valley.</div>
    </details>
    <div class="misconception">The loss surface for linear regression is always convex (bowl-shaped). It never has local minima that aren't the global minimum. This is a key advantage over nonlinear models.</div>
  `;
  if(typeof renderMathInElement==='function') renderMathInElement(area);

  let currentW = [0, 0];
  const n = 30;

  const redraw = ML.throttledRedraw(function(){
    const corr = +document.getElementById('w16_corr').value;
    const scale = +document.getElementById('w16_scale').value;
    document.getElementById('w16_vc').textContent = corr.toFixed(2);
    document.getElementById('w16_vs').textContent = scale.toFixed(1);

    // Generate data
    const dat = ML.noisyLine(n, 2, 1.5, 1.0, 42);
    // Scale feature
    const xs = dat.x.map(v => v * scale);
    const X = ML.designMatrix([xs]);
    const wOpt = ML.olsSolve(X, dat.y);

    // Contour grid
    const gw0 = [], gw1 = [], gz = [];
    const res = 50;
    const w0Range = wOpt ? [wOpt[0]-4, wOpt[0]+4] : [-4, 8];
    const w1Range = wOpt ? [wOpt[1]-2/Math.max(1,scale), wOpt[1]+2/Math.max(1,scale)] : [-2, 4];

    for(let i = 0; i <= res; i++){
      const w0 = w0Range[0] + (w0Range[1]-w0Range[0])*i/res;
      gw0.push(w0);
    }
    for(let j = 0; j <= res; j++){
      const w1 = w1Range[0] + (w1Range[1]-w1Range[0])*j/res;
      gw1.push(w1);
    }
    for(let j = 0; j <= res; j++){
      const row = [];
      for(let i = 0; i <= res; i++){
        row.push(ML.mseLoss(X, dat.y, [gw0[i], gw1[j]]));
      }
      gz.push(row);
    }

    const traces = [{
      x: gw0, y: gw1, z: gz, type: 'contour',
      colorscale: [[0,'#F1F3EE'],[0.3,'#A8D5D0'],[0.6,'#3B528B'],[1,'#4A1E5C']],
      contours: {coloring:'heatmap'},
      showscale: false
    }];

    // Mark current w
    traces.push({
      x: [currentW[0]], y: [currentW[1]], mode: 'markers',
      marker: {color: ML.plotColors.gradient, size: 12, symbol: 'x'},
      name: 'Current w', type: 'scatter'
    });
    // Mark optimum
    if(wOpt){
      traces.push({
        x: [wOpt[0]], y: [wOpt[1]], mode: 'markers',
        marker: {color: ML.plotColors.model, size: 10, symbol: 'star'},
        name: 'OLS optimum', type: 'scatter'
      });
    }

    // Eigenvectors of X^TX as ellipse axes
    if(wOpt){
      const Xt = ML.transpose(X);
      const XtX = ML.matmul(Xt, X);
      const eig = ML.eigen2x2Sym(XtX[0][0], XtX[0][1], XtX[1][1]);
      const cond = Math.max(...eig.values) / Math.max(1e-10, Math.min(...eig.values));
      document.getElementById('w16_readout').innerHTML =
        `<b>Loss at cursor:</b> ${ML.fmt(ML.mseLoss(X,dat.y,currentW),3)}\n<b>OLS:</b> [${wOpt.map(v=>ML.fmt(v,3)).join(', ')}]\n<b>Cond(X\u1D40X):</b> ${ML.fmt(cond,1)}\n<b>λ₁, λ₂:</b> ${eig.values.map(v=>ML.fmt(v,1)).join(', ')}`;
    }

    document.getElementById('w16_dw0').textContent = ML.fmt(currentW[0],2);
    document.getElementById('w16_dw1').textContent = ML.fmt(currentW[1],2);

    Plotly.react('w16_contour', traces, ML.plotLayout({
      xaxis:{title:'w₀',range:w0Range},yaxis:{title:'w₁',range:w1Range},
      showlegend:true,legend:{x:.01,y:.99,font:{size:10},bgcolor:'rgba(255,255,255,.8)'},
      margin:{l:45,r:10,t:10,b:38}
    }), ML.plotConfig);

    // Data space plot with current line
    const dataTraces = [
      {x:xs,y:dat.y,mode:'markers',marker:{color:ML.plotColors.data,size:6},name:'Data',type:'scatter'},
      {x:[-6*scale,6*scale],y:[-6*scale,6*scale].map(x=>currentW[0]+currentW[1]*x),mode:'lines',line:{color:ML.plotColors.gradient,width:2,dash:'dash'},name:'Current',type:'scatter'},
    ];
    if(wOpt){
      dataTraces.push({
        x:[-6*scale,6*scale],y:[-6*scale,6*scale].map(x=>wOpt[0]+wOpt[1]*x),
        mode:'lines',line:{color:ML.plotColors.model,width:2},name:'OLS',type:'scatter'
      });
    }
    Plotly.react('w16_dataplot', dataTraces, ML.plotLayout({
      xaxis:{title:'x'},yaxis:{title:'y'},showlegend:true,
      legend:{x:.01,y:.99,font:{size:10},bgcolor:'rgba(255,255,255,.8)'},
      margin:{l:40,r:10,t:10,b:35}
    }), ML.plotConfig);
  });

  // Click on contour to move w
  document.getElementById('w16_contour').addEventListener('click', function(){
    // Use plotly_click
  });
  // Use plotly_click event
  const contourEl = document.getElementById('w16_contour');
  // After first render, attach click handler
  setTimeout(()=>{
    contourEl.on && contourEl.on('plotly_click', function(data){
      if(data.points && data.points.length > 0){
        currentW = [data.points[0].x, data.points[0].y];
        redraw();
      }
    });
  }, 500);

  ['w16_corr','w16_scale'].forEach(id =>
    document.getElementById(id).addEventListener('input', redraw));

  document.getElementById('w16_reset').onclick = () => {
    currentW = [0, 0];
    document.getElementById('w16_corr').value = 0;
    document.getElementById('w16_scale').value = 1;
    redraw();
  };

  redraw();
});


// ============================================================
// WIDGET 17 — Closed-Form Solution (Normal Equation)
// ============================================================
ML.lazyInit('w17_area', function(){
  const area = document.getElementById('w17_area');
  area.innerHTML = `
    <p>Setting the gradient of the MSE loss to zero and solving, we get the <strong>normal equation</strong>:</p>
    $$\\mathbf{w}^* = (\\mathbf{X}^T \\mathbf{X})^{-1} \\mathbf{X}^T \\mathbf{y}$$
    <p>This gives the exact optimal weights in one calculation — no iteration needed. But it requires inverting \\(\\mathbf{X}^T\\mathbf{X}\\), which fails if features are linearly dependent (the matrix is <strong>singular</strong>).</p>
    <p>Below, each intermediate matrix is computed live from the data. Try adding a duplicate feature to see the condition number explode!</p>

    <div class="widget-full">
      <div class="btn-group mb-1">
        <button class="btn btn-sm" id="w17_normal">Compute Step-by-Step</button>
        <button class="btn btn-sm" id="w17_dup" style="color:var(--rose)">Add Collinear Feature</button>
        <button class="btn btn-reset" id="w17_reset">Reset</button>
      </div>
      <div id="w17_steps" style="overflow-x:auto"></div>
      <div class="readout mt-1" id="w17_readout"></div>
    </div>

    <details class="check">
      <summary>What happens to the condition number when features are nearly collinear?</summary>
      <div class="ans">It grows very large (→ ∞ for exactly collinear). This means tiny changes in the data cause huge changes in \\(\\mathbf{w}\\) — the solution is numerically unstable.</div>
    </details>
    <div class="misconception">The closed-form solution isn't always better than gradient descent. For very large datasets (millions of rows), inverting X\u1D40X is expensive (O(d³) in the number of features), while GD can be much faster.</div>
  `;
  if(typeof renderMathInElement==='function') renderMathInElement(area);

  let addedDuplicate = false;
  const baseData = ML.noisyLine(8, 2, 1.5, 0.8, 55);

  function matToHtml(M, label, color){
    let h = `<div style="display:inline-block;vertical-align:middle;margin:4px"><div style="font-size:.7rem;color:var(--ink-soft);text-align:center">${label}</div>`;
    h += `<table style="border:2px solid ${color};border-radius:3px;border-collapse:collapse">`;
    const rows = Array.isArray(M[0]) ? M : M.map(v=>[v]); // handle vectors
    rows.forEach(row => {
      h += '<tr>';
      (Array.isArray(row) ? row : [row]).forEach(v => {
        h += `<td style="padding:2px 5px;font-size:.75rem;font-family:Courier New,monospace;text-align:right">${ML.fmt(v,3)}</td>`;
      });
      h += '</tr>';
    });
    h += '</table></div>';
    return h;
  }

  function compute(){
    const xs = [...baseData.x];
    const feats = [xs];
    if(addedDuplicate){
      feats.push(xs.map(v => v + (Math.random() - 0.5) * 0.001)); // near-duplicate
    }
    const X = ML.designMatrix(feats);
    const y = baseData.y;
    const Xt = ML.transpose(X);
    const XtX = ML.matmul(Xt, X);
    const Xty = ML.matvec(Xt, y);
    const XtXinv = ML.inverse(XtX);
    const w = XtXinv ? ML.matvec(XtXinv, Xty) : null;

    let html = '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:.9rem">';
    html += '<div style="font-weight:600">Step 1:</div>' + matToHtml(Xt, 'X\u1D40', '#1F8A85');
    html += '<div>×</div>' + matToHtml(X, 'X', '#3B528B');
    html += '<div>=</div>' + matToHtml(XtX, 'X\u1D40X', '#4A1E5C');
    html += '</div>';

    html += '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:.9rem;margin-top:8px">';
    html += '<div style="font-weight:600">Step 2:</div>' + matToHtml(Xt, 'X\u1D40', '#1F8A85');
    html += '<div>×</div>' + matToHtml(y.map(v=>[v]), 'y', '#3B528B');
    html += '<div>=</div>' + matToHtml(Xty.map(v=>[v]), 'X\u1D40y', '#4A1E5C');
    html += '</div>';

    html += '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:.9rem;margin-top:8px">';
    html += '<div style="font-weight:600">Step 3:</div>';
    if(XtXinv){
      html += matToHtml(XtXinv, '(X\u1D40X)⁻¹', '#9A8B1E');
      html += '<div>×</div>' + matToHtml(Xty.map(v=>[v]), 'X\u1D40y', '#4A1E5C');
      html += '<div>=</div>' + matToHtml(w.map(v=>[v]), 'w*', '#B23A6B');
    } else {
      html += '<span style="color:var(--rose);font-weight:600">SINGULAR — cannot invert X\u1D40X!</span>';
    }
    html += '</div>';
    document.getElementById('w17_steps').innerHTML = html;

    const cond = ML.conditionNumber(XtX);
    let rd = `<b>Condition number:</b> ${ML.fmt(cond,1)}`;
    if(w) rd += `   <b>w* =</b> [${w.map(v=>ML.fmt(v,4)).join(', ')}]`;
    if(cond > 1000) rd += '\n<span style="color:var(--rose)">⚠ Very high condition number — solution is numerically unstable!</span>';
    document.getElementById('w17_readout').innerHTML = rd;
  }

  document.getElementById('w17_normal').onclick = compute;
  document.getElementById('w17_dup').onclick = () => {
    addedDuplicate = !addedDuplicate;
    document.getElementById('w17_dup').textContent = addedDuplicate ? 'Remove Collinear Feature' : 'Add Collinear Feature';
    compute();
  };
  document.getElementById('w17_reset').onclick = () => {
    addedDuplicate = false;
    document.getElementById('w17_dup').textContent = 'Add Collinear Feature';
    document.getElementById('w17_steps').innerHTML = '<p class="text-muted text-sm">Click "Compute Step-by-Step" to see the normal equation solved.</p>';
    document.getElementById('w17_readout').innerHTML = '';
  };

  compute();
});


// ============================================================
// WIDGET 18 — Gradient Descent
// ============================================================
ML.lazyInit('w18_area', function(){
  const area = document.getElementById('w18_area');
  area.innerHTML = `
    <p>Instead of solving the normal equation directly, <strong>gradient descent</strong> starts at a random point and iteratively walks downhill. At each step, it computes the <strong>gradient</strong> \\(\\nabla J(\\mathbf{w})\\) — which points uphill — and moves in the <em>opposite</em> direction:</p>
    $$\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\alpha \\nabla J(\\mathbf{w}_t)$$
    <p>where \\(\\alpha\\) is the <strong>learning rate</strong> — how big each step is.</p>

    <div class="widget-grid">
      <div class="widget-controls">
        <label>Learning rate α <span class="val" id="w18_vlr">0.01</span>
          <input type="range" id="w18_lr" min="-4" max="0" step="0.1" value="-2">
        </label>
        <label>Starting w₀ <span class="val" id="w18_vs0">-3</span>
          <input type="range" id="w18_s0" min="-5" max="5" step="0.5" value="-3">
        </label>
        <label>Starting w₁ <span class="val" id="w18_vs1">-2</span>
          <input type="range" id="w18_s1" min="-3" max="3" step="0.25" value="-2">
        </label>
        <div class="btn-group">
          <button class="btn btn-sm" id="w18_step">Step</button>
          <button class="btn btn-sm btn-primary" id="w18_play">▶ Play</button>
          <button class="btn btn-sm" id="w18_pause">⏸ Pause</button>
          <button class="btn btn-reset" id="w18_reset">Reset</button>
        </div>
        <div class="readout" id="w18_readout"></div>
      </div>
      <div>
        <div class="side-by-side">
          <div class="widget-plot" id="w18_contour" style="height:300px"></div>
          <div class="widget-plot" id="w18_loss_curve" style="height:300px"></div>
        </div>
        <div class="widget-plot" id="w18_data_plot" style="height:250px;margin-top:8px"></div>
      </div>
    </div>

    <div class="challenge">
      <div class="ch-title">Find a starting point and learning rate that converges (loss &lt; 1) in under 30 steps</div>
      <div class="ch-win">✅ Challenge Complete!</div>
    </div>

    <details class="check">
      <summary>What does the gradient vector tell you at any point?</summary>
      <div class="ans">The gradient points in the direction of <em>steepest increase</em> of the loss. Its magnitude tells you how steep the slope is. We move in the <em>negative</em> gradient direction to decrease the loss.</div>
    </details>
    <div class="misconception">Gradient descent doesn't compute the gradient of the data — it computes the gradient of the <em>loss function</em> with respect to the <em>weights</em>. The data is fixed; the weights are what we're adjusting.</div>
  `;
  if(typeof renderMathInElement==='function') renderMathInElement(area);

  const dataset = ML.noisyLine(25, 2, 1.5, 1.0, 42);
  const X = ML.designMatrix([dataset.x]);
  const wOpt = ML.olsSolve(X, dataset.y);

  let history = [];
  let animId = null;
  let step = 0;

  function getParams(){
    const lr = Math.pow(10, +document.getElementById('w18_lr').value);
    const s0 = +document.getElementById('w18_s0').value;
    const s1 = +document.getElementById('w18_s1').value;
    document.getElementById('w18_vlr').textContent = lr.toExponential(1);
    document.getElementById('w18_vs0').textContent = s0.toFixed(1);
    document.getElementById('w18_vs1').textContent = s1.toFixed(1);
    return {lr, w0: [s0, s1]};
  }

  function initHistory(){
    const p = getParams();
    history = [{w:[...p.w0], loss:ML.mseLoss(X, dataset.y, p.w0), grad:null, iter:0}];
    step = 0;
  }

  function doStep(){
    const p = getParams();
    const cur = history[history.length - 1];
    const grad = ML.mseGradient(X, dataset.y, cur.w);
    const wNew = cur.w.map((wi,i) => wi - p.lr * grad[i]);
    const loss = ML.mseLoss(X, dataset.y, wNew);
    step++;
    history.push({w:wNew, loss, grad, iter:step});
    if(!isFinite(loss) || loss > 1e10) return false;
    return true;
  }

  const redraw = ML.throttledRedraw(function(){
    const cur = history[history.length - 1];

    // Contour plot with trajectory
    const res = 50;
    const w0r = wOpt ? [wOpt[0]-5, wOpt[0]+5] : [-5, 9];
    const w1r = wOpt ? [wOpt[1]-3, wOpt[1]+3] : [-3, 5];
    const gw0 = [], gw1 = [], gz = [];
    for(let i=0;i<=res;i++) gw0.push(w0r[0]+(w0r[1]-w0r[0])*i/res);
    for(let j=0;j<=res;j++) gw1.push(w1r[0]+(w1r[1]-w1r[0])*j/res);
    for(let j=0;j<=res;j++){
      const row=[];
      for(let i=0;i<=res;i++) row.push(ML.mseLoss(X, dataset.y, [gw0[i], gw1[j]]));
      gz.push(row);
    }

    const contourTraces = [
      {x:gw0,y:gw1,z:gz,type:'contour',showscale:false,
       colorscale:[[0,'#F1F3EE'],[0.3,'#A8D5D0'],[0.6,'#3B528B'],[1,'#4A1E5C']],
       contours:{coloring:'heatmap'}},
      {x:history.map(h=>h.w[0]),y:history.map(h=>h.w[1]),mode:'lines+markers',
       line:{color:ML.plotColors.gradient,width:2},marker:{size:4,color:ML.plotColors.gradient},
       name:'GD path',type:'scatter'},
    ];
    if(wOpt){
      contourTraces.push({x:[wOpt[0]],y:[wOpt[1]],mode:'markers',
        marker:{color:ML.plotColors.model,size:10,symbol:'star'},name:'Optimum',type:'scatter'});
    }
    // Gradient arrow at current point
    if(cur.grad){
      const scale = 0.5;
      contourTraces.push({
        x:[cur.w[0], cur.w[0]-scale*cur.grad[0]],
        y:[cur.w[1], cur.w[1]-scale*cur.grad[1]],
        mode:'lines',line:{color:ML.plotColors.residual,width:2},
        name:'−∇J',type:'scatter',showlegend:history.length<=2
      });
    }

    Plotly.react('w18_contour', contourTraces, ML.plotLayout({
      xaxis:{title:'w₀',range:w0r},yaxis:{title:'w₁',range:w1r},
      showlegend:true,legend:{x:.01,y:.99,font:{size:9},bgcolor:'rgba(255,255,255,.8)'},
      margin:{l:42,r:8,t:8,b:35}
    }), ML.plotConfig);

    // Loss curve
    Plotly.react('w18_loss_curve', [{
      x:history.map(h=>h.iter),y:history.map(h=>Math.min(h.loss, 100)),
      mode:'lines+markers',line:{color:ML.plotColors.residual,width:2},
      marker:{size:3},name:'Loss',type:'scatter'
    }], ML.plotLayout({
      xaxis:{title:'Iteration'},yaxis:{title:'MSE Loss',type:history.some(h=>h.loss>50)?'log':'linear'},
      margin:{l:50,r:8,t:8,b:35},showlegend:false
    }), ML.plotConfig);

    // Data plot with evolving line
    const dataTraces = [
      {x:dataset.x,y:dataset.y,mode:'markers',marker:{color:ML.plotColors.data,size:6},name:'Data',type:'scatter'},
      {x:[-6,6],y:[-6,6].map(x=>cur.w[0]+cur.w[1]*x),mode:'lines',
       line:{color:ML.plotColors.gradient,width:2},name:`Iter ${step}`,type:'scatter'},
    ];
    if(wOpt){
      dataTraces.push({x:[-6,6],y:[-6,6].map(x=>wOpt[0]+wOpt[1]*x),mode:'lines',
        line:{color:ML.plotColors.model,width:1.5,dash:'dot'},name:'OLS',type:'scatter'});
    }
    Plotly.react('w18_data_plot', dataTraces, ML.plotLayout({
      xaxis:{title:'x',range:[-6,6]},yaxis:{title:'y',range:[-8,12]},
      showlegend:true,legend:{x:.01,y:.99,font:{size:9},bgcolor:'rgba(255,255,255,.8)'},
      margin:{l:40,r:8,t:8,b:35}
    }), ML.plotConfig);

    // Readout
    const gradNorm = cur.grad ? ML.vnorm(cur.grad) : 0;
    document.getElementById('w18_readout').innerHTML =
      `<b>Iter:</b> ${step}  <b>Loss:</b> ${ML.fmt(cur.loss,4)}\n<b>w:</b> [${cur.w.map(v=>ML.fmt(v,3)).join(', ')}]\n<b>||∇J||:</b> ${ML.fmt(gradNorm,4)}`;

    // Challenge
    const ch = document.querySelector('#w18_area .challenge');
    if(cur.loss < 1 && step <= 30) ch.classList.add('success');
  });

  function play(){
    if(animId) return;
    animId = setInterval(()=>{
      if(!doStep()){ pause(); return; }
      redraw();
    }, 120);
  }
  function pause(){ clearInterval(animId); animId = null; }

  document.getElementById('w18_step').onclick = () => { doStep(); redraw(); };
  document.getElementById('w18_play').onclick = play;
  document.getElementById('w18_pause').onclick = pause;
  document.getElementById('w18_reset').onclick = () => {
    pause();
    initHistory();
    document.querySelector('#w18_area .challenge').classList.remove('success');
    redraw();
  };

  ['w18_lr','w18_s0','w18_s1'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      pause();
      initHistory();
      redraw();
    });
  });

  initHistory();
  redraw();
});
