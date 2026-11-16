// module3b_widgets.js

// ==========================================
// WIDGET 19: Learning Rate
// ==========================================
ML.lazyInit('w19_area', function() {
  const area = document.getElementById('w19_area');
  area.innerHTML = `
    <p>The <strong>learning rate</strong> (\\(\\alpha\\)) determines the size of the steps we take down the loss landscape. It is perhaps the most critical hyperparameter in gradient descent.</p>
    <p>If \\(\\alpha\\) is too small, convergence takes forever. If it's too large, we might overstep the minimum and bounce back and forth, or even diverge completely (the steps get larger and larger).</p>
    <p>In the 1D case \\(f(w) = w^2\\), a step is \\(w \\leftarrow w - \\alpha (2w)\\). If \\(\\alpha = 1\\), we bounce from \\(w\\) to \\(-w\\). If \\(\\alpha > 1\\), we diverge!</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>
          Learning Rate (\\(\\alpha\\)): <span class="val" id="w19_lr_val">0.1</span>
          <input type="range" id="w19_lr" min="-4" max="1" step="0.1" value="-1">
        </label>
        <div class="presets">
          <button id="w19_p1" class="active">Good</button>
          <button id="w19_p2">Too Small</button>
          <button id="w19_p3">Too Large</button>
        </div>
        <button class="btn btn-primary" id="w19_run">Run Gradient Descent</button>
        <button class="btn btn-reset" id="w19_reset">Reset</button>
        <div class="readout" id="w19_readout"></div>
      </div>
      <div>
        <div id="w19_plot_1d" class="widget-plot" style="height: 250px; margin-bottom:1rem;"></div>
        <div id="w19_plot_loss" class="widget-plot" style="height: 250px;"></div>
      </div>
    </div>
    <div class="challenge" id="w19_ch">
      <div class="ch-title">Challenge: Converge in &le; 20 steps</div>
      <p>Find a learning rate that brings the loss below 0.01 in under 20 iterations.</p>
      <div class="ch-win">🎉 You found an optimal learning rate!</div>
    </div>
    <details class="check">
      <summary>What is the theoretical maximum stable learning rate?</summary>
      <div class="ans">For quadratic loss \\(J(w)\\) with Hessian \\(H = 2X^TX/n\\), gradient descent is stable if \\(\\alpha < 2 / \\lambda_{\\text{max}}(H)\\), where \\(\\lambda_{\\text{max}}\\) is the largest eigenvalue of the Hessian. If it exceeds this, it diverges along the eigenvector corresponding to that eigenvalue.</div>
    </details>
    <div class="misconception">You might think a smaller learning rate is always safer. But in complex models (like deep neural networks), a very small learning rate can get stuck in sharp, suboptimal local minima or saddle points!</div>
  `;

  const slider = document.getElementById('w19_lr');
  const val = document.getElementById('w19_lr_val');
  const runBtn = document.getElementById('w19_run');
  const resetBtn = document.getElementById('w19_reset');
  const readout = document.getElementById('w19_readout');
  const ch = document.getElementById('w19_ch');

  let lr = Math.pow(10, parseFloat(slider.value));

  // 1D problem: f(w) = w^2, f'(w) = 2w
  const w0 = 4;
  let w_hist_user = [], w_hist_small = [], w_hist_large = [];

  function computeRuns() {
    w_hist_user = [{w: w0, loss: w0*w0}];
    w_hist_small = [{w: w0, loss: w0*w0}];
    w_hist_large = [{w: w0, loss: w0*w0}];
    let wu = w0, ws = w0, wl = w0;
    let lru = lr, lrs = lr * 0.1, lrl = lr * 2.5;

    for (let i = 0; i < 20; i++) {
      wu = wu - lru * (2 * wu);
      if (Math.abs(wu) > 1e4) wu = 1e4 * Math.sign(wu);
      w_hist_user.push({w: wu, loss: wu*wu});

      ws = ws - lrs * (2 * ws);
      w_hist_small.push({w: ws, loss: ws*ws});

      wl = wl - lrl * (2 * wl);
      if (Math.abs(wl) > 1e4) wl = 1e4 * Math.sign(wl);
      w_hist_large.push({w: wl, loss: wl*wl});
    }
  }

  function draw() {
    val.textContent = ML.fmt(lr, 4);

    const w_range = [];
    const loss_range = [];
    for (let i = -5; i <= 5; i += 0.1) {
      w_range.push(i);
      loss_range.push(i*i);
    }

    const tr_bg = { x: w_range, y: loss_range, type: 'scatter', mode: 'lines', line: {color: '#ccc'}, name: 'f(w)=w²' };
    
    const tr_user = { x: w_hist_user.map(h=>h.w), y: w_hist_user.map(h=>h.loss), type: 'scatter', mode: 'lines+markers', line: {color: '#1F8A85'}, name: 'User LR' };
    const tr_small = { x: w_hist_small.map(h=>h.w), y: w_hist_small.map(h=>h.loss), type: 'scatter', mode: 'lines+markers', line: {color: '#3B528B', dash:'dot'}, name: 'Small LR' };
    const tr_large = { x: w_hist_large.map(h=>h.w), y: w_hist_large.map(h=>h.loss), type: 'scatter', mode: 'lines+markers', line: {color: '#B23A6B', dash:'dot'}, name: 'Large LR' };

    Plotly.react('w19_plot_1d', [tr_bg, tr_small, tr_large, tr_user], ML.plotLayout({
      title: 'Loss Landscape (1D)', xaxis: {range: [-5, 5], title: 'w'}, yaxis: {range: [0, 25], title: 'Loss'}
    }), ML.plotConfig);

    const iters = [...Array(21).keys()];
    const loss_user = { x: iters, y: w_hist_user.map(h=>h.loss), type: 'scatter', mode: 'lines', line: {color: '#1F8A85'}, name: 'User LR' };
    const loss_small = { x: iters, y: w_hist_small.map(h=>h.loss), type: 'scatter', mode: 'lines', line: {color: '#3B528B', dash:'dot'}, name: 'Small LR' };
    const loss_large = { x: iters, y: w_hist_large.map(h=>h.loss), type: 'scatter', mode: 'lines', line: {color: '#B23A6B', dash:'dot'}, name: 'Large LR' };

    Plotly.react('w19_plot_loss', [loss_small, loss_large, loss_user], ML.plotLayout({
      title: 'Loss vs Iteration', xaxis: {title: 'Iteration'}, yaxis: {type: 'log', title: 'Loss (log scale)'}
    }), ML.plotConfig);

    if (w_hist_user[20].loss < 0.01) {
      ch.classList.add('success');
    } else {
      ch.classList.remove('success');
    }
  }

  const update = ML.throttledRedraw(() => {
    lr = Math.pow(10, parseFloat(slider.value));
    computeRuns();
    draw();
  });

  slider.addEventListener('input', update);
  runBtn.addEventListener('click', update);
  resetBtn.addEventListener('click', () => { slider.value = -1; update(); });

  document.getElementById('w19_p1').addEventListener('click', () => { slider.value = Math.log10(0.45); update(); });
  document.getElementById('w19_p2').addEventListener('click', () => { slider.value = Math.log10(0.01); update(); });
  document.getElementById('w19_p3').addEventListener('click', () => { slider.value = Math.log10(1.05); update(); });

  update();
});

// ==========================================
// WIDGET 20: Feature Scaling
// ==========================================
ML.lazyInit('w20_area', function() {
  const area = document.getElementById('w20_area');
  area.innerHTML = `
    <p>When features have drastically different scales (e.g., age in years vs income in dollars), the loss contours become highly elliptical (stretched).</p>
    <p>Gradient descent takes steps perpendicular to the contour lines. In an elliptical bowl, this means zigzagging slowly instead of pointing directly to the minimum.</p>
    <p>By <strong>scaling</strong> the features (e.g., standardizing to mean 0, variance 1), the contours become circular, and the gradient points straight toward the center!</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>
          Data Scaling:
          <select id="w20_scale">
            <option value="raw">Raw</option>
            <option value="std">Standardized</option>
            <option value="minmax">Min-Max [0,1]</option>
          </select>
        </label>
        <label>
          Inflate Feature 2: <span class="val" id="w20_inf_val">x1</span>
          <input type="range" id="w20_inf" min="1" max="1000" step="1" value="1">
        </label>
        <button class="btn btn-primary" id="w20_run">Race GD (Raw vs Scaled)</button>
        <div class="readout" id="w20_readout"></div>
      </div>
      <div>
        <div id="w20_plot_contour" class="widget-plot" style="height: 350px;"></div>
      </div>
    </div>
    <details class="check">
      <summary>How does standardisation help mathematically?</summary>
      <div class="ans">It improves the <strong>condition number</strong> of the matrix \\(X^TX\\). A high condition number (highly stretched contours) means the ratio of the largest to smallest eigenvalue is large, restricting the maximum stable learning rate while slowing convergence in flat directions. Standardizing brings the condition number closer to 1.</div>
    </details>
    <div class="misconception">A common mistake is scaling the test set independently of the training set. You must save the mean and standard deviation from the <em>training</em> set and apply those exact same values to the test set!</div>
  `;

  const selScale = document.getElementById('w20_scale');
  const sldInf = document.getElementById('w20_inf');
  const valInf = document.getElementById('w20_inf_val');
  const btnRun = document.getElementById('w20_run');
  const readout = document.getElementById('w20_readout');

  let X = [], y = [];
  const base_w = [2, -1.5]; // true w
  for(let i=0; i<50; i++){
    const x1 = Math.random()*4-2;
    const x2 = Math.random()*4-2;
    X.push([x1, x2]);
    y.push(base_w[0]*x1 + base_w[1]*x2 + (Math.random()-0.5));
  }

  function getScaledData() {
    const inf = parseFloat(sldInf.value);
    const m = selScale.value;
    valInf.textContent = 'x' + inf;

    let x1s = X.map(r=>r[0]);
    let x2s = X.map(r=>r[1] * inf);

    if (m === 'std') {
      x1s = ML.standardize(x1s).data;
      x2s = ML.standardize(x2s).data;
    } else if (m === 'minmax') {
      x1s = ML.minmax(x1s).data;
      x2s = ML.minmax(x2s).data;
    }

    const Xb = ML.designMatrix([x1s, x2s]);
    return Xb;
  }

  function draw() {
    const Xb = getScaledData();
    const inf = parseFloat(sldInf.value);
    
    const XtX = ML.matmul(ML.transpose(Xb), Xb);
    let cond = ML.conditionNumber(XtX);

    readout.innerHTML = `Condition Number of \\(X^TX\\): <b>${ML.fmt(cond, 1)}</b>`;

    // Calculate grid for contours
    const grid_w1 = [], grid_w2 = [], z = [];
    for(let w1=-3; w1<=3; w1+=0.2){
      grid_w1.push(w1);
      const row = [];
      for(let w2=-3; w2<=3; w2+=0.2){
        if(grid_w2.length < 31) grid_w2.push(w2);
        row.push(ML.mseLoss(Xb, y, [0, w1, w2]));
      }
      z.push(row);
    }

    const contour = { z, x: grid_w2, y: grid_w1, type: 'contour', colorscale: 'Viridis', showscale: false };
    
    Plotly.react('w20_plot_contour', [contour], ML.plotLayout({
      title: 'Loss Contours in Weight Space (w1 vs w2)',
      xaxis: {title: 'w2'}, yaxis: {title: 'w1'}
    }), ML.plotConfig);
  }

  const update = ML.throttledRedraw(() => {
    draw();
  });

  selScale.addEventListener('change', update);
  sldInf.addEventListener('input', update);
  btnRun.addEventListener('click', () => {
    const Xb = getScaledData();
    const hist = ML.runGD(Xb, y, [0, -2, -2], 0.05, 50, ML.mseGradient, null);
    
    const traj = {
      x: hist.map(h=>h.w[2]), y: hist.map(h=>h.w[1]),
      type: 'scatter', mode: 'lines+markers', line: {color: '#B23A6B'}, name: 'GD Path'
    };
    
    Plotly.addTraces('w20_plot_contour', traj);
  });

  update();
});


// ==========================================
// WIDGET 21: Batch vs SGD vs Mini-batch
// ==========================================
ML.lazyInit('w21_area', function() {
  const area = document.getElementById('w21_area');
  area.innerHTML = `
    <p>Standard Gradient Descent (<strong>Batch GD</strong>) calculates the gradient over the <em>entire</em> dataset before taking a step. This is accurate but very slow for large datasets.</p>
    <p><strong>Stochastic Gradient Descent (SGD)</strong> uses a single data point per step. It's fast but extremely noisy, zigzagging its way to the minimum.</p>
    <p><strong>Mini-batch GD</strong> is the sweet spot: using a small random subset of data (e.g., 32 or 64 points) per step. It balances speed and stability.</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>
          Batch Size: <span class="val" id="w21_bs_val">16</span>
          <input type="range" id="w21_bs" min="1" max="100" step="1" value="16">
        </label>
        <label>
          <input type="checkbox" id="w21_shuf" checked> Shuffle Data
        </label>
        <button class="btn btn-primary" id="w21_run">Run All Three</button>
        <div class="readout" id="w21_readout"></div>
      </div>
      <div>
        <div id="w21_plot_contour" class="widget-plot" style="height: 300px;"></div>
        <div id="w21_plot_loss" class="widget-plot" style="height: 250px; margin-top: 1rem;"></div>
      </div>
    </div>
    <details class="check">
      <summary>Why does SGD never fully settle down?</summary>
      <div class="ans">Because at the true minimum of the overall loss, the gradient of any <em>individual</em> point is rarely zero. SGD will constantly bounce around the minimum. We fix this by gradually decreasing the learning rate over time (learning rate decay).</div>
    </details>
  `;

  const sldBs = document.getElementById('w21_bs');
  const valBs = document.getElementById('w21_bs_val');
  const chkShuf = document.getElementById('w21_shuf');
  const btnRun = document.getElementById('w21_run');
  const readout = document.getElementById('w21_readout');

  // Generate data
  const data = ML.correlatedFeatures(100, 0.8, 42);
  const X = ML.designMatrix([data.x1]);
  const y = data.x1.map((x,i) => 2*x + data.x2[i]*0.5 + (Math.random()-0.5));

  function draw() {
    valBs.textContent = sldBs.value;
    const bs = parseInt(sldBs.value);
    
    // Contours
    const grid_w0 = [], grid_w1 = [], z = [];
    for(let w1=0; w1<=4; w1+=0.2){
      grid_w1.push(w1);
      const row = [];
      for(let w0=-2; w0<=2; w0+=0.2){
        if(grid_w0.length < 21) grid_w0.push(w0);
        row.push(ML.mseLoss(X, y, [w0, w1]));
      }
      z.push(row);
    }
    const contour = { z, x: grid_w0, y: grid_w1, type: 'contour', colorscale: 'Greys', showscale: false };
    
    // Run Batch (bs=100)
    const hBatch = ML.runGD(X, y, [-1.5, 0.5], 0.1, 50, ML.mseGradient, 100);
    // Run SGD (bs=1)
    const hSGD = ML.runGD(X, y, [-1.5, 0.5], 0.1, 50, ML.mseGradient, 1, chkShuf.checked ? Math.random()*1000 : 0);
    // Run Mini-batch
    const hMini = ML.runGD(X, y, [-1.5, 0.5], 0.1, 50, ML.mseGradient, bs, chkShuf.checked ? Math.random()*1000 : 0);

    const trBatch = {x: hBatch.map(h=>h.w[0]), y: hBatch.map(h=>h.w[1]), mode:'lines+markers', line:{color:'#1F8A85'}, name:'Batch'};
    const trSGD = {x: hSGD.map(h=>h.w[0]), y: hSGD.map(h=>h.w[1]), mode:'lines', line:{color:'#B23A6B'}, name:'SGD'};
    const trMini = {x: hMini.map(h=>h.w[0]), y: hMini.map(h=>h.w[1]), mode:'lines+markers', line:{color:'#3B528B'}, name:'Mini-batch'};

    Plotly.react('w21_plot_contour', [contour, trBatch, trSGD, trMini], ML.plotLayout({
      title: 'Optimization Path in Weight Space', xaxis: {title: 'w0 (Bias)'}, yaxis: {title: 'w1 (Slope)'}
    }), ML.plotConfig);

    const lossBatch = {x: hBatch.map(h=>h.iter), y: hBatch.map(h=>h.loss), mode:'lines', line:{color:'#1F8A85'}, name:'Batch'};
    const lossSGD = {x: hSGD.map(h=>h.iter), y: hSGD.map(h=>h.loss), mode:'lines', line:{color:'#B23A6B'}, name:'SGD'};
    const lossMini = {x: hMini.map(h=>h.iter), y: hMini.map(h=>h.loss), mode:'lines', line:{color:'#3B528B'}, name:'Mini-batch'};

    Plotly.react('w21_plot_loss', [lossBatch, lossSGD, lossMini], ML.plotLayout({
      title: 'Loss vs Iteration', xaxis: {title: 'Step'}, yaxis: {title: 'MSE'}
    }), ML.plotConfig);
  }

  const update = ML.throttledRedraw(draw);
  sldBs.addEventListener('input', update);
  btnRun.addEventListener('click', update);

  update();
});


// ==========================================
// WIDGET 22: Bias-Variance
// ==========================================
ML.lazyInit('w22_area', function() {
  const area = document.getElementById('w22_area');
  area.innerHTML = `
    <p>A simple model (like a line) might underfit complex data. It has high <strong>bias</strong> because it assumes too much (e.g. "the world is straight").</p>
    <p>A complex model (like a degree 10 polynomial) can hit every data point perfectly. But it overfits, wiggling wildly between points. It has high <strong>variance</strong> because it is overly sensitive to the noise in the specific sample of data.</p>
    <p>Try resampling the dataset multiple times to see how the model's predictions vary. The "spaghetti" of curves shows the variance.</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>
          Polynomial Degree: <span class="val" id="w22_deg_val">1</span>
          <input type="range" id="w22_deg" min="1" max="9" step="1" value="1">
        </label>
        <button class="btn btn-primary" id="w22_resample">Resample Dataset</button>
        <button class="btn btn-reset" id="w22_clear">Clear History</button>
      </div>
      <div>
        <div id="w22_plot_fit" class="widget-plot" style="height: 300px;"></div>
        <div id="w22_plot_err" class="widget-plot" style="height: 250px; margin-top: 1rem;"></div>
      </div>
    </div>
    <div class="misconception">Note that adding polynomial features (like \\(x^2, x^3\\)) still keeps the model <strong>linear</strong> in its parameters \\(w\\). We are just feeding it a fancier design matrix!</div>
  `;

  const sldDeg = document.getElementById('w22_deg');
  const valDeg = document.getElementById('w22_deg_val');
  const btnResample = document.getElementById('w22_resample');
  const btnClear = document.getElementById('w22_clear');

  let hists = [];
  const trueFn = x => Math.sin(x*1.5);

  function getPolyFeatures(xArr, degree) {
    const feats = [];
    for(let d=1; d<=degree; d++) feats.push(xArr.map(x=>Math.pow(x,d)));
    return ML.designMatrix(feats);
  }

  function resampleAndFit(degree) {
    // Generate data
    const xArr = [], yArr = [];
    for(let i=0; i<15; i++){
      const x = Math.random()*4-2;
      xArr.push(x);
      yArr.push(trueFn(x) + ML.SeededRNG.prototype.normal(0, 0.3)); // using normal from an unseeded logic
    }
    const X = getPolyFeatures(xArr, degree);
    const w = ML.olsSolve(X, yArr) || Array(degree+1).fill(0);
    return {xArr, yArr, w};
  }

  function draw() {
    const deg = parseInt(sldDeg.value);
    valDeg.textContent = deg;

    const px = [], py_true = [];
    for(let x=-2; x<=2; x+=0.05) { px.push(x); py_true.push(trueFn(x)); }
    
    const traces = [{x: px, y: py_true, mode: 'lines', line: {color: 'black', width: 3, dash: 'dot'}, name: 'True Function'}];
    
    // Add spaghetti
    hists.forEach((h, i) => {
      const X_p = getPolyFeatures(px, h.deg);
      const py = ML.matvec(X_p, h.w);
      const opacity = i === hists.length - 1 ? 1 : 0.2;
      traces.push({x: px, y: py, mode: 'lines', line: {color: '#1F8A85'}, opacity, showlegend: false});
    });

    if (hists.length > 0) {
      const last = hists[hists.length-1];
      traces.push({x: last.xArr, y: last.yArr, mode: 'markers', marker: {color: '#B23A6B', size: 8}, name: 'Latest Data'});
    }

    Plotly.react('w22_plot_fit', traces, ML.plotLayout({
      title: 'Polynomial Fit', xaxis: {range: [-2,2]}, yaxis: {range: [-3,3]}
    }), ML.plotConfig);

    // Dummy total error chart to illustrate U-shape bias/variance
    const dexs = [1,2,3,4,5,6,7,8,9];
    const bias2 = dexs.map(d => Math.pow(Math.max(0, 6-d), 2)*0.05);
    const varC = dexs.map(d => Math.pow(d, 2)*0.05);
    const errT = dexs.map((d,i) => bias2[i] + varC[i] + 0.1);

    Plotly.react('w22_plot_err', [
      {x: dexs, y: errT, mode: 'lines+markers', line: {color: '#4A1E5C'}, name: 'Total Error'},
      {x: dexs, y: bias2, mode: 'lines', line: {color: '#3B528B', dash: 'dash'}, name: 'Bias^2'},
      {x: dexs, y: varC, mode: 'lines', line: {color: '#B23A6B', dash: 'dash'}, name: 'Variance'}
    ], ML.plotLayout({
      title: 'Theoretical Bias-Variance Tradeoff', xaxis: {title: 'Model Complexity (Degree)'}, yaxis: {title: 'Error'}
    }), ML.plotConfig);
  }

  btnResample.addEventListener('click', () => {
    const deg = parseInt(sldDeg.value);
    hists.push({...resampleAndFit(deg), deg});
    draw();
  });

  btnClear.addEventListener('click', () => {
    hists = []; draw();
  });
  
  sldDeg.addEventListener('input', () => {
    hists = []; hists.push({...resampleAndFit(parseInt(sldDeg.value)), deg: parseInt(sldDeg.value)}); draw();
  });

  // initial
  hists.push({...resampleAndFit(1), deg: 1});
  draw();
});


// ==========================================
// WIDGET 23: Validation
// ==========================================
ML.lazyInit('w23_area', function() {
  const area = document.getElementById('w23_area');
  area.innerHTML = `
    <p>To know if we are overfitting, we must evaluate our model on data it has never seen. We split our data into <strong>Train</strong>, <strong>Validation</strong>, and <strong>Test</strong> sets.</p>
    <p>Watch how the training error always goes down as complexity increases, but the validation error eventually goes up (the U-shaped curve).</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>
          Polynomial Degree: <span class="val" id="w23_deg_val">1</span>
          <input type="range" id="w23_deg" min="1" max="10" step="1" value="1">
        </label>
        <label>
          <input type="checkbox" id="w23_leak"> Simulate Data Leakage
        </label>
      </div>
      <div>
        <div id="w23_plot_fit" class="widget-plot" style="height: 300px;"></div>
        <div id="w23_plot_err" class="widget-plot" style="height: 250px; margin-top: 1rem;"></div>
      </div>
    </div>
    <div class="challenge">
      <div class="ch-title">Challenge: Find the best degree</div>
      <p>Identify the degree that minimizes validation error without data leakage.</p>
    </div>
  `;

  const sldDeg = document.getElementById('w23_deg');
  const valDeg = document.getElementById('w23_deg_val');
  const chkLeak = document.getElementById('w23_leak');

  // Generate fixed dataset
  const rng = new ML.SeededRNG(42);
  const dataX = [], dataY = [];
  for(let i=0; i<40; i++){
    const x = Math.random()*4-2;
    dataX.push(x);
    dataY.push(Math.sin(x*1.5) + rng.normal(0, 0.4));
  }
  
  const trainX = dataX.slice(0, 20), trainY = dataY.slice(0, 20);
  const valX = dataX.slice(20, 30), valY = dataY.slice(20, 30);
  const testX = dataX.slice(30, 40), testY = dataY.slice(30, 40);

  let errHistTrain = [], errHistVal = [];

  function draw() {
    const deg = parseInt(sldDeg.value);
    valDeg.textContent = deg;
    const leak = chkLeak.checked;

    function getFeatures(xArr) {
      const feats = [];
      for(let d=1; d<=deg; d++) feats.push(xArr.map(x=>Math.pow(x,d)));
      let X = ML.designMatrix(feats);
      if (leak) {
        // "bad" standardization using the whole dataset implicitly by adding a bias term that artificially inflates performance
        X = X.map(r => r.map(v => v * 0.8)); 
      }
      return X;
    }

    const Xtr = getFeatures(trainX);
    const Xv = getFeatures(valX);
    
    // Regularization parameter to avoid singular matrix on high deg
    const w = ML.ridgeSolve(Xtr, trainY, 1e-4) || Array(deg+1).fill(0);

    const px = [];
    for(let x=-2; x<=2; x+=0.05) px.push(x);
    const Xp = getFeatures(px);
    const py = ML.matvec(Xp, w);

    Plotly.react('w23_plot_fit', [
      {x: trainX, y: trainY, mode: 'markers', marker: {color: '#3B528B'}, name: 'Train'},
      {x: valX, y: valY, mode: 'markers', marker: {color: '#1F8A85'}, name: 'Validation'},
      {x: px, y: py, mode: 'lines', line: {color: '#4A1E5C'}, name: 'Model Fit'}
    ], ML.plotLayout({
      title: 'Train/Val Split Fit', xaxis: {range: [-2,2]}, yaxis: {range: [-3,3]}
    }), ML.plotConfig);

    // Compute error curve dynamically
    const dexs = [], eTr=[], eV=[];
    for(let d=1; d<=10; d++) {
      function getF(arr) {
        const feats = []; for(let i=1; i<=d; i++) feats.push(arr.map(x=>Math.pow(x,i)));
        return ML.designMatrix(feats);
      }
      const X1 = getF(trainX); const X2 = getF(valX);
      const wd = ML.ridgeSolve(X1, trainY, 1e-4) || Array(d+1).fill(0);
      dexs.push(d);
      eTr.push(ML.mseLoss(X1, trainY, wd));
      let valLoss = ML.mseLoss(X2, valY, wd);
      if(leak) valLoss *= 0.5; // Simulate artificial lowering
      eV.push(valLoss);
    }

    Plotly.react('w23_plot_err', [
      {x: dexs, y: eTr, mode: 'lines+markers', line: {color: '#3B528B'}, name: 'Train Error'},
      {x: dexs, y: eV, mode: 'lines+markers', line: {color: '#1F8A85'}, name: 'Val Error'}
    ], ML.plotLayout({
      title: 'Learning Curve', xaxis: {title: 'Degree'}, yaxis: {range: [0, 2], title: 'MSE'}
    }), ML.plotConfig);
  }

  const update = ML.throttledRedraw(draw);
  sldDeg.addEventListener('input', update);
  chkLeak.addEventListener('change', update);
  update();
});


// ==========================================
// WIDGET 24: Regularization
// ==========================================
ML.lazyInit('w24_area', function() {
  const area = document.getElementById('w24_area');
  area.innerHTML = `
    <p><strong>Regularization</strong> prevents overfitting by adding a penalty for large weights to the loss function. It constrains the model.</p>
    <p><strong>Ridge (L2)</strong> penalizes the squared weights (\\(w^2\\)). Geometrically, this forces the weights to stay inside a circle.</p>
    <p><strong>Lasso (L1)</strong> penalizes the absolute weights (\\(|w|\\)). Geometrically, this forces weights into a diamond, which tends to drive some weights to exactly zero (feature selection)!</p>
    <div class="widget-grid">
      <div class="widget-controls">
        <label>
          Regularization Type:
          <select id="w24_type">
            <option value="l2">Ridge (L2)</option>
            <option value="l1">Lasso (L1)</option>
          </select>
        </label>
        <label>
          Penalty Strength (\\(\\lambda\\)): <span class="val" id="w24_lam_val">0</span>
          <input type="range" id="w24_lam" min="0" max="10" step="0.1" value="0">
        </label>
        <div class="readout" id="w24_readout"></div>
      </div>
      <div>
        <div id="w24_plot_contour" class="widget-plot" style="height: 350px;"></div>
      </div>
    </div>
    <details class="check">
      <summary>Why does Lasso create sparse models (weights = 0)?</summary>
      <div class="ans">The constraint region for L1 regularization is a diamond (or polytope in higher dimensions) with sharp corners that lie exactly on the axes. When the elliptical loss contours expand to touch this diamond, they are highly likely to hit a corner, meaning one or more weights will be exactly zero. L2 (Ridge) is a circle, lacking these sharp axis-aligned corners.</div>
    </details>
  `;

  const selType = document.getElementById('w24_type');
  const sldLam = document.getElementById('w24_lam');
  const valLam = document.getElementById('w24_lam_val');
  const readout = document.getElementById('w24_readout');

  // data for contour
  const X = ML.designMatrix([[1, 2, 3, 4], [4, 1, 2, 3]]);
  const y = [1, 2, 3, 4]; // dummy

  function draw() {
    const lam = parseFloat(sldLam.value);
    valLam.textContent = lam.toFixed(1);
    const type = selType.value;

    const grid_w1 = [], grid_w2 = [], z = [], zReg = [];
    
    // OLS minimum is roughly somewhere, let's just make a synthetic loss function for illustration
    // Loss = (w1 - 2)^2 + 2*(w2 - 1)^2
    for(let w1=-3; w1<=4; w1+=0.2){
      grid_w1.push(w1);
      const row = [], rowReg = [];
      for(let w2=-3; w2<=4; w2+=0.2){
        if(grid_w2.length < 36) grid_w2.push(w2);
        
        const mse = Math.pow(w1 - 2, 2) + 2*Math.pow(w2 - 1.5, 2);
        row.push(mse);
        
        const reg = type === 'l2' ? (w1*w1 + w2*w2) : (Math.abs(w1) + Math.abs(w2));
        rowReg.push(reg);
      }
      z.push(row);
      zReg.push(rowReg);
    }

    const contourMse = { z, x: grid_w2, y: grid_w1, type: 'contour', colorscale: 'Greys', showscale: false, contours: {start:0.5, end: 20, size: 2} };
    
    // Constraint contour where penalty = lambda (only show if lambda > 0)
    const traces = [contourMse];
    if(lam > 0) {
      traces.push({
        z: zReg, x: grid_w2, y: grid_w1, type: 'contour', colorscale: [[0, '#9A8B1E'], [1, '#9A8B1E']], showscale: false,
        contours: {type: 'constraint', operation: '<=', value: lam, showlines: true}, opacity: 0.3, name: 'Constraint'
      });
    }

    // Find constrained minimum
    // Using simple grid search for illustration
    let minLoss = Infinity, bestW = [0,0];
    if (lam === 0) {
      bestW = [1.5, 2]; // True min (w2, w1 reversed in plot axes)
    } else {
      for(let i=0; i<grid_w1.length; i++) {
        for(let j=0; j<grid_w2.length; j++) {
          if (zReg[i][j] <= lam && z[i][j] < minLoss) {
            minLoss = z[i][j];
            bestW = [grid_w2[j], grid_w1[i]];
          }
        }
      }
    }

    traces.push({
      x: [bestW[0]], y: [bestW[1]], mode: 'markers', marker: {color: '#B23A6B', size: 10, symbol: 'star'}, name: 'Optimum'
    });

    readout.innerHTML = `Optimum Weights:<br>w1 = ${bestW[1].toFixed(2)}<br>w2 = ${bestW[0].toFixed(2)}`;

    Plotly.react('w24_plot_contour', traces, ML.plotLayout({
      title: 'Loss Landscape & Constraint Region', xaxis: {title: 'w2'}, yaxis: {title: 'w1'}
    }), ML.plotConfig);
  }

  const update = ML.throttledRedraw(draw);
  selType.addEventListener('change', update);
  sldLam.addEventListener('input', update);
  update();
});
