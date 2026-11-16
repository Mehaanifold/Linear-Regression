(function() {
  // =========================================================================
  // WIDGET 8: AI Timeline
  // =========================================================================
  ML.lazyInit('w8_area', function() {
    const area = document.getElementById('w8_area');
    
    // HTML Content
    area.innerHTML = `
      <p>Artificial Intelligence is not a new idea. Its roots trace back to the mid-20th century, though it has experienced several boom-and-bust cycles (known as "AI winters") driven by shifts in funding, hype, and compute power.</p>
      <p>In this interactive timeline, explore the key milestones that shaped the field, from early symbolic reasoning to modern deep learning and large language models.</p>
      
      <div class="widget-full" style="background:var(--panel); border:1px solid var(--rule); border-radius:var(--radius); padding:1rem; overflow:hidden;">
        <div class="presets" id="w8_filters" style="margin-bottom: 1rem;">
          <button class="active" data-filter="all">All</button>
          <button data-filter="symbolic">Symbolic AI</button>
          <button data-filter="neural">Neural Networks</button>
          <button data-filter="games">Games</button>
          <button data-filter="nlp">NLP / LLMs</button>
        </div>
        
        <div id="w8_timeline" style="position:relative; width:100%; overflow-x:auto; padding-bottom: 1rem; min-height: 180px;">
          <div style="position:absolute; top:40px; left:20px; right:20px; height:4px; background:var(--rule); border-radius:2px; min-width: 800px;"></div>
          <div id="w8_events" style="position:relative; height:100%; min-width: 800px;"></div>
        </div>
        
        <div id="w8_info" style="min-height: 80px; padding: 1rem; background: #fff; border: 1px solid var(--rule); border-radius: var(--radius); margin-top: 1rem;">
          <h4 id="w8_title" style="color:var(--indigo); margin-bottom: 0.5rem;">Select an event above</h4>
          <p id="w8_desc" style="font-size: 0.9rem; color:var(--ink-soft); margin:0;">Click on a timeline point to see details here.</p>
        </div>
      </div>
    `;
    
    const events = [
      { year: 1950, title: "Turing Test", cat: "symbolic", desc: "Alan Turing proposes the 'Imitation Game' as a test of machine intelligence, laying the philosophical groundwork for AI." },
      { year: 1956, title: "Dartmouth Workshop", cat: "symbolic", desc: "The term 'Artificial Intelligence' is coined. Researchers convene to discuss simulating learning and other aspects of human intelligence." },
      { year: 1958, title: "Perceptron", cat: "neural", desc: "Frank Rosenblatt invents the Perceptron, an early artificial neural network, sparking initial excitement before its limitations were proven." },
      { year: 1974, title: "First AI Winter", cat: "symbolic", desc: "Due to unmet expectations and limited compute power, government funding for AI research is severely cut." },
      { year: 1980, title: "Expert Systems", cat: "symbolic", desc: "AI bounces back with 'expert systems'—programs that use if-then rules to simulate human expertise in specific domains." },
      { year: 1987, title: "Second AI Winter", cat: "symbolic", desc: "The expert system market collapses as they prove brittle and hard to maintain, leading to another major funding dry spell." },
      { year: 1997, title: "Deep Blue", cat: "games", desc: "IBM's Deep Blue defeats world chess champion Garry Kasparov, a triumph of brute-force search and symbolic AI." },
      { year: 2012, title: "AlexNet", cat: "neural", desc: "A deep convolutional neural network crushes the ImageNet competition, kicking off the modern Deep Learning revolution." },
      { year: 2014, title: "GANs", cat: "neural", desc: "Generative Adversarial Networks are introduced, allowing AI to generate highly realistic synthetic images." },
      { year: 2016, title: "AlphaGo", cat: "games", desc: "DeepMind's AlphaGo defeats Lee Sedol at Go, a game previously thought too complex for AI, using reinforcement learning." },
      { year: 2017, title: "Transformers", cat: "nlp", desc: "Google introduces the Transformer architecture ('Attention is All You Need'), which becomes the foundation of modern NLP." },
      { year: 2020, title: "GPT & LLMs", cat: "nlp", desc: "OpenAI releases GPT-3, demonstrating that massive language models can perform diverse tasks with zero-shot prompting." }
    ];
    
    const eventsContainer = document.getElementById('w8_events');
    const filterBtns = document.querySelectorAll('#w8_filters button');
    const titleEl = document.getElementById('w8_title');
    const descEl = document.getElementById('w8_desc');
    
    let activeFilter = 'all';
    let activeEvent = null;
    
    function renderTimeline() {
      eventsContainer.innerHTML = '';
      const minYear = 1945;
      const maxYear = 2025;
      const range = maxYear - minYear;
      
      events.forEach((ev, i) => {
        const isVisible = activeFilter === 'all' || ev.cat === activeFilter;
        if (!isVisible) return;
        
        const pos = ((ev.year - minYear) / range) * 100;
        
        const dot = document.createElement('div');
        dot.style.position = 'absolute';
        dot.style.left = `calc(${pos}% - 10px)`;
        dot.style.top = '32px';
        dot.style.width = '20px';
        dot.style.height = '20px';
        dot.style.borderRadius = '50%';
        dot.style.background = activeEvent === i ? 'var(--teal)' : 'var(--indigo)';
        dot.style.border = '3px solid #fff';
        dot.style.cursor = 'pointer';
        dot.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        dot.style.transition = 'all 0.2s';
        dot.title = ev.year + " - " + ev.title;
        
        dot.addEventListener('mouseenter', () => {
          if (activeEvent !== i) dot.style.transform = 'scale(1.2)';
        });
        dot.addEventListener('mouseleave', () => {
          if (activeEvent !== i) dot.style.transform = 'scale(1)';
        });
        
        dot.addEventListener('click', () => {
          activeEvent = i;
          titleEl.textContent = ev.year + ": " + ev.title;
          descEl.textContent = ev.desc;
          renderTimeline();
        });
        
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.left = `${pos}%`;
        label.style.transform = 'translateX(-50%)';
        label.style.top = i % 2 === 0 ? '10px' : '58px';
        label.style.fontSize = '0.75rem';
        label.style.fontWeight = activeEvent === i ? 'bold' : 'normal';
        label.style.color = activeEvent === i ? 'var(--teal)' : 'var(--ink)';
        label.style.whiteSpace = 'nowrap';
        label.style.pointerEvents = 'none';
        label.textContent = ev.title;
        
        eventsContainer.appendChild(dot);
        eventsContainer.appendChild(label);
      });
    }
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeFilter = e.target.getAttribute('data-filter');
        activeEvent = null;
        titleEl.textContent = 'Select an event above';
        descEl.textContent = 'Click on a timeline point to see details here.';
        renderTimeline();
      });
    });
    
    renderTimeline();
  });

  // =========================================================================
  // WIDGET 9: AI > ML > DL
  // =========================================================================
  ML.lazyInit('w9_area', function() {
    const area = document.getElementById('w9_area');
    
    area.innerHTML = `
      <p>People often use Artificial Intelligence, Machine Learning, and Deep Learning interchangeably, but they are actually concentric fields. Each inner circle is a specialized subset of the larger circle.</p>
      
      <div class="side-by-side" style="align-items: center; background:var(--panel); border:1px solid var(--rule); border-radius:var(--radius); padding:1.5rem;">
        <div style="position:relative; width:100%; aspect-ratio:1/1;">
          <svg viewBox="0 0 100 100" style="width:100%; height:100%; cursor:pointer;">
            <circle id="w9_c_ai" cx="50" cy="50" r="45" fill="rgba(59,82,139,0.15)" stroke="var(--indigo)" stroke-width="2" class="w9-layer" data-layer="ai" style="transition:all 0.3s;" />
            <text x="50" y="15" text-anchor="middle" font-size="6" font-family="var(--font-h)" font-weight="bold" fill="var(--indigo)" pointer-events="none">Artificial Intelligence (AI)</text>
            
            <circle id="w9_c_ml" cx="50" cy="58" r="33" fill="rgba(31,138,133,0.15)" stroke="var(--teal)" stroke-width="2" class="w9-layer" data-layer="ml" style="transition:all 0.3s;" />
            <text x="50" y="32" text-anchor="middle" font-size="5" font-family="var(--font-h)" font-weight="bold" fill="var(--teal)" pointer-events="none">Machine Learning (ML)</text>
            
            <circle id="w9_c_dl" cx="50" cy="65" r="21" fill="rgba(178,58,107,0.15)" stroke="var(--rose)" stroke-width="2" class="w9-layer" data-layer="dl" style="transition:all 0.3s;" />
            <text x="50" y="55" text-anchor="middle" font-size="4.5" font-family="var(--font-h)" font-weight="bold" fill="var(--rose)" pointer-events="none">Deep</text>
            <text x="50" y="61" text-anchor="middle" font-size="4.5" font-family="var(--font-h)" font-weight="bold" fill="var(--rose)" pointer-events="none">Learning</text>
            <text x="50" y="67" text-anchor="middle" font-size="4.5" font-family="var(--font-h)" font-weight="bold" fill="var(--rose)" pointer-events="none">(DL)</text>
          </svg>
        </div>
        
        <div id="w9_info" style="background:#fff; border:1px solid var(--rule); border-radius:var(--radius); padding:1rem; height:100%;">
          <h4 id="w9_title" style="color:var(--ink); margin-bottom:0.5rem; font-size:1.1rem;">Click a layer to explore</h4>
          <p id="w9_def" style="font-size:0.9rem; color:var(--ink-soft); margin-bottom:1rem;"></p>
          <ul id="w9_examples" style="font-size:0.85rem; padding-left:1.2rem; color:var(--ink-soft);"></ul>
        </div>
      </div>
      
      <div class="misconception">
        It is a common mistake to assume that everything "AI" involves neural networks. An old-school chess bot running a minimax algorithm is AI, but it is not Machine Learning, because it doesn't learn from data—it just follows a hard-coded search strategy.
      </div>
    `;
    
    const layers = {
      ai: {
        title: "Artificial Intelligence (AI)",
        color: "var(--indigo)",
        def: "Any technique that enables computers to mimic human intelligence, using logic, if-then rules, decision trees, or machine learning.",
        examples: ["Rule-based Expert Systems", "A* Pathfinding in video games", "Symbolic math solvers"]
      },
      ml: {
        title: "Machine Learning (ML)",
        color: "var(--teal)",
        def: "A subset of AI that includes statistical techniques allowing machines to improve at tasks with experience. The machine learns rules from data rather than being explicitly programmed.",
        examples: ["Linear / Logistic Regression", "Random Forests & Decision Trees", "Support Vector Machines (SVMs)"]
      },
      dl: {
        title: "Deep Learning (DL)",
        color: "var(--rose)",
        def: "A subset of ML composed of algorithms that permit software to train itself to perform tasks, by exposing multi-layered artificial neural networks to vast amounts of data.",
        examples: ["Convolutional Neural Networks (CNNs)", "Transformers (GPT, BERT)", "Generative Adversarial Networks (GANs)"]
      }
    };
    
    const circles = document.querySelectorAll('.w9-layer');
    const titleEl = document.getElementById('w9_title');
    const defEl = document.getElementById('w9_def');
    const exEl = document.getElementById('w9_examples');
    
    circles.forEach(circle => {
      circle.addEventListener('mouseenter', (e) => {
        e.target.style.fillOpacity = '0.3';
      });
      circle.addEventListener('mouseleave', (e) => {
        if (!e.target.classList.contains('active-layer')) {
          e.target.style.fillOpacity = '0.15';
        }
      });
      circle.addEventListener('click', (e) => {
        e.stopPropagation();
        circles.forEach(c => {
          c.classList.remove('active-layer');
          c.style.fillOpacity = '0.15';
        });
        e.target.classList.add('active-layer');
        e.target.style.fillOpacity = '0.4';
        
        const layerKey = e.target.getAttribute('data-layer');
        const data = layers[layerKey];
        titleEl.textContent = data.title;
        titleEl.style.color = data.color;
        defEl.textContent = data.def;
        exEl.innerHTML = data.examples.map(ex => `<li>${ex}</li>`).join('');
      });
    });
  });

  // =========================================================================
  // WIDGET 10: Rules vs Learning
  // =========================================================================
  ML.lazyInit('w10_area', function() {
    const area = document.getElementById('w10_area');
    
    area.innerHTML = `
      <p>Before Machine Learning, programmers wrote <strong>rules</strong>. For example, "if a customer spends > $50, they are VIP." But what happens when the boundary isn't a simple straight line on one variable?</p>
      <p>Below is a dataset of patients. We want to predict if they have a disease (orange) or not (blue) based on two test scores. Try to write a manual rule using just Test 1.</p>
      
      <div class="widget-grid">
        <div class="widget-controls">
          <label>Manual Rule: Test 1 > <span class="val" id="w10_val">5.0</span>
            <input type="range" id="w10_thresh" min="0" max="10" step="0.1" value="5.0">
          </label>
          <div class="readout">Manual Acc: <b id="w10_acc_man">--</b>%</div>
          <button class="btn btn-primary mt-2" id="w10_btn_learn">Let the Model Learn!</button>
          <div class="readout">Model Acc: <b id="w10_acc_mod">--</b>%</div>
          <button class="btn btn-reset mt-2" id="w10_btn_reset">Reset</button>
        </div>
        <div class="widget-plot" id="w10_plot"></div>
      </div>
      
      <details class="check">
        <summary>Why did the model do better?</summary>
        <div class="ans">Your manual rule was limited to one dimension (a vertical slice on Test 1). The data actually separates along an oblique line (depending on both Test 1 and Test 2). A Machine Learning algorithm (like Logistic Regression) easily discovers and combines multiple variables to find the optimal boundary.</div>
      </details>
    `;
    
    // Generate data
    const rng = new ML.SeededRNG(123);
    const N = 100;
    const data = [];
    for(let i=0; i<N; i++){
      const x1 = rng.next() * 10;
      const x2 = rng.next() * 10;
      // Oblique boundary with some noise
      const score = x1 + 1.5 * x2 - 12 + rng.normal(0, 1.5);
      const cls = score > 0 ? 1 : 0;
      data.push({x1, x2, cls});
    }
    
    const x1_0 = data.filter(d=>d.cls===0).map(d=>d.x1);
    const x2_0 = data.filter(d=>d.cls===0).map(d=>d.x2);
    const x1_1 = data.filter(d=>d.cls===1).map(d=>d.x1);
    const x2_1 = data.filter(d=>d.cls===1).map(d=>d.x2);
    
    let threshold = 5.0;
    let showModel = false;
    
    const plotEl = document.getElementById('w10_plot');
    const threshSlider = document.getElementById('w10_thresh');
    const valEl = document.getElementById('w10_val');
    const accManEl = document.getElementById('w10_acc_man');
    const accModEl = document.getElementById('w10_acc_mod');
    const btnLearn = document.getElementById('w10_btn_learn');
    const btnReset = document.getElementById('w10_btn_reset');
    
    function calcManualAcc() {
      let correct = 0;
      data.forEach(d => {
        const pred = d.x1 > threshold ? 1 : 0;
        if(pred === d.cls) correct++;
      });
      return ((correct / N) * 100).toFixed(1);
    }
    
    function draw() {
      const traces = [
        {
          x: x1_0, y: x2_0, mode: 'markers', name: 'Class 0 (Blue)',
          marker: { color: ML.plotColors.data, size: 8 }
        },
        {
          x: x1_1, y: x2_1, mode: 'markers', name: 'Class 1 (Orange)',
          marker: { color: ML.plotColors.constraint, size: 8 }
        }
      ];
      
      const shapes = [];
      
      // Manual Rule boundary (vertical line)
      shapes.push({
        type: 'line', x0: threshold, x1: threshold, y0: 0, y1: 10,
        line: { color: ML.plotColors.residual, width: 2, dash: 'dash' }
      });
      
      // If model is shown, draw the model boundary
      // True boundary is approx x1 + 1.5*x2 = 12 => x2 = (12 - x1)/1.5
      if (showModel) {
        shapes.push({
          type: 'line', x0: 0, x1: 10, y0: 12/1.5, y1: (12-10)/1.5,
          line: { color: ML.plotColors.model, width: 3 }
        });
        
        // Let's hardcode model accuracy to something high like 92% to reflect a good fit
        let modelCorrect = 0;
        data.forEach(d => {
          const score = d.x1 + 1.5 * d.x2 - 12;
          const pred = score > 0 ? 1 : 0;
          if(pred === d.cls) modelCorrect++;
        });
        accModEl.textContent = ((modelCorrect / N) * 100).toFixed(1);
      } else {
        accModEl.textContent = '--';
      }
      
      valEl.textContent = threshold.toFixed(1);
      accManEl.textContent = calcManualAcc();
      
      const layout = ML.plotLayout({
        xaxis: { title: 'Test 1 Score', range: [0, 10] },
        yaxis: { title: 'Test 2 Score', range: [0, 10] },
        shapes: shapes,
        showlegend: false
      });
      
      Plotly.react(plotEl, traces, layout, ML.plotConfig);
    }
    
    threshSlider.addEventListener('input', ML.throttledRedraw((e) => {
      threshold = parseFloat(e.target.value);
      draw();
    }));
    
    btnLearn.addEventListener('click', () => {
      showModel = true;
      draw();
    });
    
    btnReset.addEventListener('click', () => {
      threshold = 5.0;
      threshSlider.value = 5.0;
      showModel = false;
      draw();
    });
    
    draw();
  });

  // =========================================================================
  // WIDGET 11: ML Categories
  // =========================================================================
  ML.lazyInit('w11_area', function() {
    const area = document.getElementById('w11_area');
    
    area.innerHTML = `
      <p>Machine Learning is generally split into three main paradigms depending on how the data is provided and what feedback the model receives.</p>
      
      <div class="challenge">
        <div class="ch-title">Challenge: Sort the Examples</div>
        <p style="font-size: 0.9rem; margin-bottom:1rem;">Click an example to select it, then click the correct category bucket to drop it in. Can you sort all 8 correctly?</p>
        
        <div id="w11_items" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom: 1.5rem; min-height: 40px;">
          <!-- items go here -->
        </div>
        
        <div class="side-by-side" style="gap:0.5rem;">
          <div class="w11-bucket" data-cat="sup" style="background:rgba(31,138,133,0.1); border:2px solid var(--teal); border-radius:var(--radius); padding:1rem; text-align:center; cursor:pointer;">
            <h4 style="color:var(--teal); margin-bottom:0.5rem;">Supervised</h4>
            <p style="font-size:0.75rem; color:var(--ink-soft);">Learning with labeled answers</p>
            <div class="w11-content" style="min-height:50px; display:flex; flex-direction:column; gap:0.3rem;"></div>
          </div>
          
          <div class="w11-bucket" data-cat="unsup" style="background:rgba(59,82,139,0.1); border:2px solid var(--indigo); border-radius:var(--radius); padding:1rem; text-align:center; cursor:pointer;">
            <h4 style="color:var(--indigo); margin-bottom:0.5rem;">Unsupervised</h4>
            <p style="font-size:0.75rem; color:var(--ink-soft);">Finding hidden patterns</p>
            <div class="w11-content" style="min-height:50px; display:flex; flex-direction:column; gap:0.3rem;"></div>
          </div>
          
          <div class="w11-bucket" data-cat="rl" style="background:rgba(178,58,107,0.1); border:2px solid var(--rose); border-radius:var(--radius); padding:1rem; text-align:center; cursor:pointer;">
            <h4 style="color:var(--rose); margin-bottom:0.5rem;">Reinforcement</h4>
            <p style="font-size:0.75rem; color:var(--ink-soft);">Learning by trial and error</p>
            <div class="w11-content" style="min-height:50px; display:flex; flex-direction:column; gap:0.3rem;"></div>
          </div>
        </div>
        
        <div class="ch-win" id="w11_win">🎉 All sorted! You've mastered the ML paradigms!</div>
        <button class="btn btn-reset mt-2" id="w11_reset">Reset Challenge</button>
      </div>
    `;
    
    const tasks = [
      { id: 't1', text: "House price prediction", cat: "sup" },
      { id: 't2', text: "Spam detection", cat: "sup" },
      { id: 't3', text: "Customer segmentation", cat: "unsup" },
      { id: 't4', text: "Anomaly detection", cat: "unsup" },
      { id: 't5', text: "Robot walking", cat: "rl" },
      { id: 't6', text: "Game playing (Chess)", cat: "rl" },
      { id: 't7', text: "Image classification", cat: "sup" },
      { id: 't8', text: "Topic modeling (Grouping articles)", cat: "unsup" }
    ];
    
    const itemsContainer = document.getElementById('w11_items');
    const buckets = document.querySelectorAll('.w11-bucket');
    const winMsg = document.getElementById('w11_win');
    const btnReset = document.getElementById('w11_reset');
    const challengeDiv = document.querySelector('.challenge');
    
    let selectedTask = null;
    let correctCount = 0;
    
    function initTasks() {
      itemsContainer.innerHTML = '';
      buckets.forEach(b => b.querySelector('.w11-content').innerHTML = '');
      winMsg.style.display = 'none';
      challengeDiv.classList.remove('success');
      selectedTask = null;
      correctCount = 0;
      
      const shuffled = new ML.SeededRNG().shuffle([...tasks]);
      shuffled.forEach(t => {
        const div = document.createElement('div');
        div.className = 'btn';
        div.textContent = t.text;
        div.dataset.id = t.id;
        div.dataset.cat = t.cat;
        div.style.background = '#fff';
        
        div.addEventListener('click', () => {
          if (div.parentElement !== itemsContainer) return; // already sorted
          // Deselect others
          Array.from(itemsContainer.children).forEach(c => {
            c.style.background = '#fff';
            c.style.borderColor = 'var(--rule)';
          });
          div.style.background = 'var(--panel)';
          div.style.borderColor = 'var(--indigo)';
          selectedTask = div;
        });
        
        itemsContainer.appendChild(div);
      });
    }
    
    buckets.forEach(bucket => {
      bucket.addEventListener('click', () => {
        if (!selectedTask) return;
        const targetCat = bucket.getAttribute('data-cat');
        const taskCat = selectedTask.dataset.cat;
        
        if (targetCat === taskCat) {
          // Correct
          selectedTask.style.background = 'transparent';
          selectedTask.style.borderColor = 'transparent';
          selectedTask.style.padding = '0';
          selectedTask.style.fontSize = '0.75rem';
          selectedTask.style.cursor = 'default';
          selectedTask.textContent = "✓ " + selectedTask.textContent;
          bucket.querySelector('.w11-content').appendChild(selectedTask);
          selectedTask = null;
          correctCount++;
          
          if (correctCount === tasks.length) {
            challengeDiv.classList.add('success');
          }
        } else {
          // Incorrect flash
          const origBg = selectedTask.style.background;
          selectedTask.style.background = 'var(--rose)';
          selectedTask.style.color = '#fff';
          setTimeout(() => {
            if (selectedTask) {
              selectedTask.style.background = origBg;
              selectedTask.style.color = 'inherit';
            }
          }, 400);
        }
      });
    });
    
    btnReset.addEventListener('click', initTasks);
    
    initTasks();
  });

  // =========================================================================
  // WIDGET 12: Session Roadmap
  // =========================================================================
  ML.lazyInit('w12_area', function() {
    const area = document.getElementById('w12_area');
    
    area.innerHTML = `
      <p>Now that we have covered the mathematical prerequisites and surveyed the broad landscape of AI, it is time to dive deep into a specific, foundational algorithm.</p>
      <p>Here is our map for the rest of the session. We will build up to <strong>Regularized Multiple Linear Regression</strong>, deriving everything from first principles.</p>
      
      <div style="background:var(--panel); border:1px solid var(--rule); border-radius:var(--radius); padding:2rem; overflow-x:auto;">
        <svg viewBox="0 0 800 250" style="width:100%; min-width:600px;">
          <!-- Path -->
          <path d="M 50 125 L 200 125 L 350 125 L 500 125 L 650 125 L 750 125" fill="none" stroke="var(--rule)" stroke-width="4" stroke-dasharray="10,5" />
          
          <!-- Nodes -->
          <g transform="translate(50, 125)">
            <circle r="15" fill="var(--teal)"/>
            <text y="30" text-anchor="middle" font-family="var(--font-h)" font-size="12" font-weight="bold" fill="var(--ink)">Math Prerequisites</text>
            <text y="45" text-anchor="middle" font-family="var(--font-b)" font-size="10" fill="var(--ink-soft)">Vectors, Matrices, Gradients</text>
            <text y="-5" text-anchor="middle" font-size="12" fill="#fff">✓</text>
          </g>
          
          <g transform="translate(200, 125)">
            <circle r="15" fill="var(--teal)"/>
            <text y="30" text-anchor="middle" font-family="var(--font-h)" font-size="12" font-weight="bold" fill="var(--ink)">AI/ML Overview</text>
            <text y="45" text-anchor="middle" font-family="var(--font-b)" font-size="10" fill="var(--ink-soft)">History & Concepts</text>
            <text y="-5" text-anchor="middle" font-size="12" fill="#fff">✓</text>
          </g>
          
          <!-- Current -->
          <g transform="translate(350, 125)">
            <circle r="22" fill="#fff" stroke="var(--indigo)" stroke-width="4"/>
            <circle r="10" fill="var(--indigo)">
              <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
            </circle>
            <text y="-35" text-anchor="middle" font-family="var(--font-h)" font-size="12" font-weight="bold" fill="var(--indigo)">YOU ARE HERE</text>
            <text y="35" text-anchor="middle" font-family="var(--font-h)" font-size="14" font-weight="bold" fill="var(--indigo)">Regression</text>
            <text y="50" text-anchor="middle" font-family="var(--font-b)" font-size="10" fill="var(--ink-soft)">OLS & Gradient Descent</text>
          </g>
          
          <g transform="translate(500, 125)">
            <circle r="15" fill="#fff" stroke="var(--rule)" stroke-width="3"/>
            <text y="30" text-anchor="middle" font-family="var(--font-h)" font-size="12" font-weight="bold" fill="var(--ink)">Generalization</text>
            <text y="45" text-anchor="middle" font-family="var(--font-b)" font-size="10" fill="var(--ink-soft)">Bias-Variance, Regularization</text>
          </g>
          
          <g transform="translate(650, 125)">
            <circle r="15" fill="#fff" stroke="var(--rule)" stroke-width="3"/>
            <text y="30" text-anchor="middle" font-family="var(--font-h)" font-size="12" font-weight="bold" fill="var(--ink)">Capstone</text>
            <text y="45" text-anchor="middle" font-family="var(--font-b)" font-size="10" fill="var(--ink-soft)">Interactive Quiz & Sandbox</text>
          </g>
          
          <!-- Future Path (dim) -->
          <path d="M 750 125 Q 780 125 780 80 T 820 50" fill="none" stroke="var(--rule)" stroke-width="2" stroke-dasharray="4,4" opacity="0.5"/>
          <text x="730" y="70" font-family="var(--font-b)" font-size="10" fill="var(--ink-soft)" opacity="0.7">Future: Neural Nets, Trees...</text>
        </svg>
      </div>
    `;
  });

})();
