ML.lazyInit('w25_area', function(){
  const area = document.getElementById('w25_area');

  const html = `
    <p>You've made it! This capstone playground brings together everything we've covered: data generation, feature scaling, model fitting (OLS & GD), and regularization.</p>
    <p>Experiment with different datasets, scaling methods, and optimizers. Notice how unscaled data (like House Prices) causes problems for Gradient Descent unless you adjust the learning rate or apply feature scaling.</p>
    
    <div class="widget-grid" id="w25_grid">
      <div class="widget-controls">
        <label>Dataset
          <select id="w25_dataset">
            <option value="line">Noisy Line (1D)</option>
            <option value="plane">Noisy Plane (2D)</option>
            <option value="poly">Polynomial (1D)</option>
            <option value="house">House Prices (2D, unscaled)</option>
          </select>
        </label>
        <label>Feature Scaling
          <select id="w25_scaling">
            <option value="none">None</option>
            <option value="standardize">Standardize</option>
            <option value="minmax">Min-Max</option>
          </select>
        </label>
        <label>Train Split %: <span class="val" id="w25_split_v">80</span>
          <input type="range" id="w25_split" min="10" max="90" step="10" value="80">
        </label>
        <hr style="border:none; border-top:1px solid var(--rule); margin:0.5rem 0;">
        <label>Optimizer
          <select id="w25_opt">
            <option value="closed">Closed-Form</option>
            <option value="gd">Batch GD</option>
            <option value="sgd">SGD (Batch=1)</option>
            <option value="mini">Mini-Batch (Batch=16)</option>
          </select>
        </label>
        <label>Learning Rate ($\alpha$): <span class="val" id="w25_lr_v">0.01</span>
          <input type="range" id="w25_lr" min="-6" max="1" step="0.5" value="-2">
        </label>
        <label>Regularization
          <select id="w25_reg">
            <option value="none">None</option>
            <option value="ridge">Ridge (L2)</option>
            <option value="lasso">Lasso (L1)</option>
          </select>
        </label>
        <label>Strength ($\lambda$): <span class="val" id="w25_lam_v">0.000</span>
          <input type="range" id="w25_lam" min="-4" max="2" step="0.5" value="-4">
        </label>
        <div class="btn-group" style="margin-top:0.5rem;">
          <button class="btn btn-primary" id="w25_run">Train Model</button>
          <button class="btn btn-reset" id="w25_reset">New Data</button>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:1rem; min-width:0;">
        <div class="widget-plot" id="w25_plot1" style="height:350px;"></div>
        <div class="widget-plot" id="w25_plot2" style="height:250px;"></div>
        <div class="readout" id="w25_readout">Run training to see results...</div>
      </div>
    </div>

    <div class="module-divider" style="margin: 3rem auto 1.5rem;"><span class="mn">Module 4</span><h2>Knowledge Check</h2></div>
    <div class="challenge" id="w25_quiz">
      <div class="ch-title">Module Quiz</div>
      <p style="margin-bottom:1rem; font-size:0.9rem;">Test your understanding of the concepts covered across these modules.</p>
      <div id="w25_quiz_container" style="display:flex; flex-direction:column; gap:1.5rem;"></div>
      <div class="ch-win" id="w25_quiz_result" style="font-size:1.1rem; text-align:center; padding:1rem; border:2px solid var(--teal); border-radius:4px; margin-top:1rem; background:rgba(31,138,133,0.1);"></div>
    </div>
  `;
  area.innerHTML = html;
  if(window.renderMathInElement) window.renderMathInElement(area);

  // --- Elements ---
  const selData = document.getElementById('w25_dataset');
  const selScale = document.getElementById('w25_scaling');
  const sSplit = document.getElementById('w25_split');
  const vSplit = document.getElementById('w25_split_v');
  const selOpt = document.getElementById('w25_opt');
  const sLr = document.getElementById('w25_lr');
  const vLr = document.getElementById('w25_lr_v');
  const selReg = document.getElementById('w25_reg');
  const sLam = document.getElementById('w25_lam');
  const vLam = document.getElementById('w25_lam_v');
  const btnRun = document.getElementById('w25_run');
  const btnReset = document.getElementById('w25_reset');
  const readout = document.getElementById('w25_readout');

  // --- State ---
  let rawData = {};
  let trainData = {}, testData = {};
  let modelResult = null; // { w, history }

  const lassoGradient = (X, y, w, lam) => {
    const g = ML.mseGradient(X, y, w);
    return g.map((gi, i) => i === 0 ? gi : gi + lam * Math.sign(w[i]));
  };

  const getLam = () => parseFloat(sLam.value) <= -4 ? 0 : Math.pow(10, parseFloat(sLam.value));
  const getLr = () => Math.pow(10, parseFloat(sLr.value));

  function generateData() {
    const type = selData.value;
    const n = 200;
    let x1, x2, y;
    
    if (type === 'line') {
      const d = ML.noisyLine(n, 2, 1.5, 2);
      x1 = d.x; y = d.y;
    } else if (type === 'plane') {
      const d = ML.noisyPlane(n, -1, 2, -1.5, 3);
      x1 = d.x1; x2 = d.x2; y = d.y;
    } else if (type === 'poly') {
      const d = ML.polyWithNoise(n, [0, -1, 0.5, 0.1], 2);
      x1 = d.x; y = d.y;
    } else if (type === 'house') {
      const d = ML.housePriceData(n);
      x1 = d.sqft; x2 = d.beds; y = d.price;
    }
    
    rawData = { x1, x2, y, type };
    modelResult = null;
    processData();
    updatePlots();
  }

  function processData() {
    const splitRatio = parseFloat(sSplit.value) / 100;
    const n = rawData.y.length;
    const nTrain = Math.floor(n * splitRatio);
    
    // Shuffle indices
    const rng = new ML.SeededRNG(42);
    const indices = rng.shuffle([...Array(n).keys()]);
    const trainIdx = indices.slice(0, nTrain);
    const testIdx = indices.slice(nTrain);

    const subset = (arr, idx) => idx.map(i => arr[i]);
    
    let trX1 = subset(rawData.x1, trainIdx);
    let teX1 = subset(rawData.x1, testIdx);
    let trX2 = rawData.x2 ? subset(rawData.x2, trainIdx) : null;
    let teX2 = rawData.x2 ? subset(rawData.x2, testIdx) : null;
    let trY = subset(rawData.y, trainIdx);
    let teY = subset(rawData.y, testIdx);

    const scaleMode = selScale.value;
    if (scaleMode !== 'none') {
      const scaleFn = scaleMode === 'standardize' ? ML.standardize : ML.minmax;
      const m1 = scaleFn(trX1);
      trX1 = m1.data;
      teX1 = scaleMode === 'standardize' ? teX1.map(v=>(v-m1.mean)/m1.std) : teX1.map(v=>(v-m1.min)/(m1.max-m1.min||1));
      
      if (trX2) {
        const m2 = scaleFn(trX2);
        trX2 = m2.data;
        teX2 = scaleMode === 'standardize' ? teX2.map(v=>(v-m2.mean)/m2.std) : teX2.map(v=>(v-m2.min)/(m2.max-m2.min||1));
      }
    }

    let trF, teF;
    if (rawData.type === 'poly') {
      trF = [trX1, trX1.map(x=>x*x), trX1.map(x=>Math.pow(x,3))];
      teF = [teX1, teX1.map(x=>x*x), teX1.map(x=>Math.pow(x,3))];
    } else if (trX2) {
      trF = [trX1, trX2];
      teF = [teX1, teX2];
    } else {
      trF = [trX1];
      teF = [teX1];
    }

    trainData = { X: ML.designMatrix(trF), y: trY, x1: trX1, x2: trX2 };
    testData = { X: ML.designMatrix(teF), y: teY, x1: teX1, x2: teX2 };
  }

  function trainModel() {
    processData();
    
    const opt = selOpt.value;
    const reg = selReg.value;
    const lr = getLr();
    const lam = getLam();
    const X = trainData.X;
    const y = trainData.y;
    
    let w = ML.zeros(X[0].length, 1).map(r=>0);
    let history = [];

    if (opt === 'closed') {
      if (reg === 'none' || reg === 'lasso') {
        if (reg === 'lasso') alert("Closed-form Lasso is not available. Using OLS (None).");
        w = ML.olsSolve(X, y) || w;
      } else if (reg === 'ridge') {
        w = ML.ridgeSolve(X, y, lam) || w;
      }
      history = [{w: [...w], loss: ML.mseLoss(X, y, w), iter: 1}];
    } else {
      const maxIter = opt === 'sgd' ? 1000 : 300;
      let batchSize = X.length;
      if (opt === 'sgd') batchSize = 1;
      if (opt === 'mini') batchSize = 16;
      
      let gradFn = ML.mseGradient;
      if (reg === 'ridge') gradFn = (Xx,yy,ww) => ML.ridgeGradient(Xx,yy,ww,lam);
      if (reg === 'lasso') gradFn = (Xx,yy,ww) => lassoGradient(Xx,yy,ww,lam);
      
      history = ML.runGD(X, y, w, lr, maxIter, gradFn, batchSize);
      if (history.length > 0) w = history[history.length - 1].w;
    }
    
    modelResult = { w, history };
    updatePlots();
  }

  function updatePlots() {
    const is3D = !!trainData.x2;
    const p1 = document.getElementById('w25_plot1');
    const p2 = document.getElementById('w25_plot2');

    const traces1 = [];
    
    if (is3D) {
      traces1.push({
        x: trainData.x1, y: trainData.x2, z: trainData.y,
        mode: 'markers', type: 'scatter3d',
        marker: { size: 3, color: ML.plotColors.data },
        name: 'Train'
      });
      traces1.push({
        x: testData.x1, y: testData.x2, z: testData.y,
        mode: 'markers', type: 'scatter3d',
        marker: { size: 3, color: ML.plotColors.residual },
        name: 'Test'
      });
      
      if (modelResult) {
        const xMin = Math.min(...trainData.x1, ...testData.x1);
        const xMax = Math.max(...trainData.x1, ...testData.x1);
        const yMin = Math.min(...trainData.x2, ...testData.x2);
        const yMax = Math.max(...trainData.x2, ...testData.x2);
        
        const gx=[], gy=[], gz=[];
        for(let i=0; i<10; i++){
          let rowZ=[];
          let vy = yMin + i*(yMax-yMin)/9;
          for(let j=0; j<10; j++){
            let vx = xMin + j*(xMax-xMin)/9;
            if(i===0) gx.push(vx);
            rowZ.push(modelResult.w[0] + modelResult.w[1]*vx + modelResult.w[2]*vy);
          }
          gy.push(vy);
          gz.push(rowZ);
        }
        traces1.push({
          x: gx, y: gy, z: gz,
          type: 'surface', showscale: false,
          colorscale: [[0, ML.plotColors.model], [1, '#45B5B0']],
          opacity: 0.7, name: 'Model'
        });
      }
      Plotly.react(p1, traces1, {
        margin: {l:0,r:0,t:0,b:0},
        scene: {
          xaxis: {title: 'X1'}, yaxis: {title: 'X2'}, zaxis: {title: 'Y'}
        }
      }, ML.plotConfig);
    } else {
      traces1.push({
        x: trainData.x1, y: trainData.y,
        mode: 'markers', type: 'scatter',
        marker: { size: 6, color: ML.plotColors.data },
        name: 'Train'
      });
      traces1.push({
        x: testData.x1, y: testData.y,
        mode: 'markers', type: 'scatter',
        marker: { size: 6, color: ML.plotColors.residual, symbol: 'cross' },
        name: 'Test'
      });
      
      if (modelResult) {
        const xMin = Math.min(...trainData.x1, ...testData.x1);
        const xMax = Math.max(...trainData.x1, ...testData.x1);
        const gx = [];
        for(let i=0; i<=50; i++) gx.push(xMin + i*(xMax-xMin)/50);
        
        const gy = gx.map(vx => {
          let row = [1, vx];
          if (rawData.type === 'poly') row.push(vx*vx, Math.pow(vx,3));
          return ML.dot(modelResult.w, row);
        });
        
        traces1.push({
          x: gx, y: gy, mode: 'lines',
          line: { color: ML.plotColors.model, width: 3 },
          name: 'Model'
        });
      }
      Plotly.react(p1, traces1, ML.plotLayout({ title: 'Data & Fit', margin: {l:40, r:20, t:30, b:40} }), ML.plotConfig);
    }

    if (modelResult && modelResult.history.length > 1) {
      const iters = modelResult.history.map(h => h.iter);
      const losses = modelResult.history.map(h => h.loss);
      
      const testLosses = [];
      const step = Math.max(1, Math.floor(iters.length / 100));
      const pIters = [], pTr = [], pTe = [];
      
      for(let i=0; i<iters.length; i+=step) {
        pIters.push(iters[i]);
        pTr.push(losses[i]);
        pTe.push(ML.mseLoss(testData.X, testData.y, modelResult.history[i].w));
      }
      
      Plotly.react(p2, [
        { x: pIters, y: pTr, mode: 'lines', name: 'Train Loss', line: {color: ML.plotColors.data} },
        { x: pIters, y: pTe, mode: 'lines', name: 'Test Loss', line: {color: ML.plotColors.residual} }
      ], ML.plotLayout({
        title: 'Loss Curve',
        yaxis: { type: Math.max(...pTr) / Math.min(...pTr) > 100 ? 'log' : 'linear' },
        margin: {l:50, r:20, t:30, b:40}
      }), ML.plotConfig);
    } else {
      Plotly.purge(p2);
    }

    if (modelResult) {
      const trLoss = ML.mseLoss(trainData.X, trainData.y, modelResult.w);
      const teLoss = ML.mseLoss(testData.X, testData.y, modelResult.w);
      const r2 = ML.rSquared(testData.X, testData.y, modelResult.w);
      
      let ws = modelResult.w.map(vw => ML.fmt(vw, 3)).join(', ');
      
      let warn = '';
      if (!isFinite(trLoss) || trLoss > 1e10) {
        warn = '<br><span style="color:var(--rose);font-weight:bold;">⚠ Model diverged! Try lowering the learning rate or applying feature scaling.</span>';
      }
      
      readout.innerHTML = `<b>Train MSE:</b> ${ML.fmt(trLoss, 2)} | <b>Test MSE:</b> ${ML.fmt(teLoss, 2)}
<b>Test R²:</b> ${ML.fmt(r2, 3)}
<b>Weights:</b> [${ws}]${warn}`;
    } else {
      readout.innerHTML = 'Run training to see results...';
    }
  }

  const doUpdate = ML.throttledRedraw(trainModel);
  
  selData.addEventListener('change', generateData);
  btnReset.addEventListener('click', generateData);
  btnRun.addEventListener('click', trainModel);
  
  sLr.addEventListener('input', () => { vLr.textContent = ML.fmt(getLr(), 4); doUpdate(); });
  sLam.addEventListener('input', () => { vLam.textContent = parseFloat(sLam.value)<=-4 ? '0' : ML.fmt(getLam(), 4); doUpdate(); });
  sSplit.addEventListener('input', () => { vSplit.textContent = sSplit.value; doUpdate(); });
  
  selScale.addEventListener('change', doUpdate);
  selOpt.addEventListener('change', doUpdate);
  selReg.addEventListener('change', doUpdate);

  generateData();

  const quizQuestions = [
    {
      q: "1. What does each row of the design matrix X represent?",
      options: [
        "A single feature across all samples",
        "A single data point (sample) with all its features",
        "The model weights to be learned",
        "The target values for the dataset"
      ],
      ans: 1
    },
    {
      q: "2. What does the bias column of ones let the model do?",
      options: [
        "Speed up gradient descent",
        "Scale features between 0 and 1",
        "Shift the prediction line/plane away from the origin (0,0)",
        "Prevent the model from overfitting"
      ],
      ans: 2
    },
    {
      q: "3. What happens to Gradient Descent if the learning rate is too large?",
      options: [
        "It converges exactly in one step",
        "It takes a very long time to reach the minimum",
        "It overshoots the minimum and may diverge to infinity",
        "It automatically switches to a closed-form solution"
      ],
      ans: 2
    },
    {
      q: "4. Why do we scale features before applying gradient descent?",
      options: [
        "To make the loss landscape more circular/spherical for faster convergence",
        "Because OLS requires features to be between 0 and 1",
        "To reduce the number of features in the dataset",
        "To increase the complexity of the model"
      ],
      ans: 0
    },
    {
      q: "5. What's the main difference between Batch GD and SGD?",
      options: [
        "Batch GD uses random subsets, SGD uses the whole dataset",
        "SGD updates weights using one data point at a time, Batch GD uses all points",
        "SGD can only be used for classification, Batch GD for regression",
        "Batch GD always finds a worse solution than SGD"
      ],
      ans: 1
    },
    {
      q: "6. If a model has very low training error but high test/validation error, what is the likely problem?",
      options: [
        "Underfitting (High Bias)",
        "Overfitting (High Variance)",
        "The learning rate was too small",
        "The model needs fewer features"
      ],
      ans: 1
    },
    {
      q: "7. Ridge regression (L2) adds what penalty to the loss function?",
      options: [
        "The sum of absolute weights",
        "The sum of squared weights",
        "The number of non-zero weights",
        "The inverse of the weights"
      ],
      ans: 1
    },
    {
      q: "8. What does the Lasso penalty (L1) encourage that Ridge does not?",
      options: [
        "Faster convergence of gradient descent",
        "Larger weight values",
        "Exact zero weights (feature selection / sparsity)",
        "Closed-form analytical solutions"
      ],
      ans: 2
    }
  ];

  const qContainer = document.getElementById('w25_quiz_container');
  const qResult = document.getElementById('w25_quiz_result');
  let score = 0;
  let answered = new Array(quizQuestions.length).fill(false);

  quizQuestions.forEach((qObj, idx) => {
    const qDiv = document.createElement('div');
    qDiv.style.background = 'var(--panel)';
    qDiv.style.padding = '1rem';
    qDiv.style.borderRadius = 'var(--radius)';
    
    const qText = document.createElement('div');
    qText.style.fontWeight = '600';
    qText.style.marginBottom = '0.5rem';
    qText.textContent = qObj.q;
    qDiv.appendChild(qText);

    const optsDiv = document.createElement('div');
    optsDiv.style.display = 'flex';
    optsDiv.style.flexDirection = 'column';
    optsDiv.style.gap = '0.4rem';
    
    qObj.options.forEach((optStr, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.justifyContent = 'flex-start';
      btn.style.textAlign = 'left';
      btn.style.fontWeight = 'normal';
      btn.textContent = optStr;
      
      btn.addEventListener('click', () => {
        if (answered[idx]) return;
        answered[idx] = true;
        
        const allBtns = optsDiv.querySelectorAll('button');
        allBtns.forEach((b, i) => {
          b.disabled = true;
          if (i === qObj.ans) {
            b.style.background = 'rgba(31,138,133,0.2)';
            b.style.borderColor = 'var(--teal)';
            b.style.color = 'var(--teal)';
            b.style.fontWeight = 'bold';
          }
        });

        if (optIdx === qObj.ans) {
          score++;
        } else {
          btn.style.background = 'rgba(178,58,107,0.2)';
          btn.style.borderColor = 'var(--rose)';
          btn.style.color = 'var(--rose)';
        }
        
        checkFinish();
      });
      optsDiv.appendChild(btn);
    });

    qDiv.appendChild(optsDiv);
    qContainer.appendChild(qDiv);
  });

  function checkFinish() {
    if (answered.every(v => v)) {
      qResult.style.display = 'block';
      let msg = '';
      if (score === 8) msg = 'Perfect! You are an ML champion! 🏆';
      else if (score >= 6) msg = 'Great job! You have a solid grasp of the fundamentals. 👏';
      else if (score >= 4) msg = 'Good effort! You might want to review some sections to solidify your understanding. 👍';
      else msg = 'Keep learning! Feel free to revisit the earlier modules and try again. 📚';
      
      qResult.innerHTML = `You scored <b>${score} / 8</b>.<br>${msg}`;
      document.getElementById('w25_quiz').classList.add('success');
    }
  }

});
