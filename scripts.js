        // ============================================
        // ACTIVATION FUNCTION GRAPH
        // ============================================
        class ActivationGraph {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                if (!this.canvas) {
                    this.ctx = null;
                    return;
                }
                this.ctx = this.canvas.getContext('2d');
                this.activationType = 'relu';
                this.setupCanvas();
            }

            setupCanvas() {
                const resize = () => {
                    if (this.canvas && this.canvas.offsetWidth > 0) {
                        this.canvas.width = this.canvas.offsetWidth;
                        this.canvas.height = 200;
                        this.draw(this.activationType);
                    }
                };
                resize();
                window.addEventListener('resize', resize);
            }

            draw(activationType = 'relu') {
                if (!this.canvas || !this.ctx) return;
                this.activationType = activationType;

                const ctx = this.ctx;
                const width = this.canvas.width;
                const height = this.canvas.height;

                ctx.clearRect(0, 0, width, height);

                const padding = 40;
                const graphWidth = width - 2 * padding;
                const graphHeight = height - 2 * padding;

                // Draw axes
                ctx.strokeStyle = '#404040';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(padding, padding);
                ctx.lineTo(padding, height - padding);
                ctx.lineTo(width - padding, height - padding);
                ctx.stroke();

                // Draw grid
                ctx.strokeStyle = '#2a2a2a';
                ctx.lineWidth = 1;
                for (let i = 0; i <= 10; i++) {
                    const x = padding + (i / 10) * graphWidth;
                    const y = padding + (i / 10) * graphHeight;
                    ctx.beginPath();
                    ctx.moveTo(x, padding);
                    ctx.lineTo(x, height - padding);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(padding, y);
                    ctx.lineTo(width - padding, y);
                    ctx.stroke();
                }

                // Draw function
                ctx.strokeStyle = '#FF6B35';
                ctx.lineWidth = 3;
                ctx.beginPath();

                const points = [];
                for (let i = 0; i <= graphWidth; i++) {
                    const x = -5 + (i / graphWidth) * 10;
                    let y;

                    switch(activationType) {
                        case 'relu':
                            y = Math.max(0, x);
                            break;
                        case 'sigmoid':
                            y = 1 / (1 + Math.exp(-x));
                            break;
                        case 'tanh':
                            y = Math.tanh(x);
                            break;
                        default:
                            y = Math.max(0, x);
                    }

                    const px = padding + (i / graphWidth) * graphWidth;
                    const py = height - padding - ((y + 5) / 10) * graphHeight;
                    points.push({x: px, y: py});

                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.stroke();

                // Labels
                ctx.fillStyle = '#b0b0b0';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('x', width / 2, height - 10);
                ctx.textAlign = 'left';
                ctx.fillText('f(x)', 10, padding);

                // Function name
                ctx.fillStyle = '#FF6B35';
                ctx.font = '14px Space Grotesk';
                ctx.textAlign = 'right';
                ctx.fillText(activationType.toUpperCase(), width - padding, padding - 10);
            }
        }

        // ============================================
        // NEURAL NETWORK VISUALIZATION
        // ============================================
        class NeuralNetworkViz {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                if (!this.canvas) {
                    console.error(`Canvas element with id "${canvasId}" not found`);
                    return;
                }
                this.ctx = this.canvas.getContext('2d');
                this.layers = 3;
                this.neuronsPerLayer = 4;
                this.activation = 'relu';
                this.isAnimating = false;
                this.activationGraph = new ActivationGraph('activation-canvas');

                this.setupCanvas();
                this.setupControls();
                this.draw();
            }

            setupCanvas() {
                const resize = () => {
                    this.canvas.width = this.canvas.offsetWidth;
                    this.canvas.height = this.canvas.offsetHeight;
                    this.draw();
                };
                resize();
                window.addEventListener('resize', resize);
            }

            setupControls() {
                const layersSlider = document.getElementById('nn-layers');
                const neuronsSlider = document.getElementById('nn-neurons');
                const activationSelect = document.getElementById('nn-activation');
                const runBtn = document.getElementById('nn-run');

                if (!layersSlider || !neuronsSlider || !activationSelect || !runBtn) {
                    console.error('Neural network controls not found');
                    return;
                }

                layersSlider.addEventListener('input', (e) => {
                    this.layers = parseInt(e.target.value);
                    const valueSpan = document.getElementById('nn-layers-value');
                    if (valueSpan) valueSpan.textContent = this.layers;
                    this.draw();
                });

                neuronsSlider.addEventListener('input', (e) => {
                    this.neuronsPerLayer = parseInt(e.target.value);
                    const valueSpan = document.getElementById('nn-neurons-value');
                    if (valueSpan) valueSpan.textContent = this.neuronsPerLayer;
                    this.draw();
                });

                activationSelect.addEventListener('change', (e) => {
                    this.activation = e.target.value;
                    if (this.activationGraph) {
                        this.activationGraph.draw(this.activation);
                    }
                });

                // Draw initial activation graph
                if (this.activationGraph) {
                    this.activationGraph.draw(this.activation);
                }

                runBtn.addEventListener('click', () => {
                    console.log('Run button clicked');
                    this.runForwardPass();
                });
            }

            draw() {
                if (!this.canvas || !this.ctx) {
                    console.warn('Canvas not initialized, skipping draw');
                    return;
                }

                const ctx = this.ctx;
                const width = this.canvas.width;
                const height = this.canvas.height;

                ctx.clearRect(0, 0, width, height);

                // Calculate positions
                const layerSpacing = width / (this.layers + 1);
                const neuronSpacing = height / (this.neuronsPerLayer + 1);

                // Draw connections
                ctx.strokeStyle = 'rgba(255, 107, 53, 0.3)';
                ctx.lineWidth = 2;

                for (let l = 0; l < this.layers - 1; l++) {
                    const x1 = (l + 1) * layerSpacing;
                    const x2 = (l + 2) * layerSpacing;

                    for (let n1 = 0; n1 < this.neuronsPerLayer; n1++) {
                        const y1 = (n1 + 1) * neuronSpacing;
                        for (let n2 = 0; n2 < this.neuronsPerLayer; n2++) {
                            const y2 = (n2 + 1) * neuronSpacing;
                            ctx.beginPath();
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.stroke();
                        }
                    }
                }

                // Draw neurons
                for (let l = 0; l < this.layers; l++) {
                    const x = (l + 1) * layerSpacing;
                    for (let n = 0; n < this.neuronsPerLayer; n++) {
                        const y = (n + 1) * neuronSpacing;
                        const radius = 20;

                        // Neuron circle
                        ctx.fillStyle = 'rgba(255, 107, 53, 0.8)';
                        ctx.beginPath();
                        ctx.arc(x, y, radius, 0, Math.PI * 2);
                        ctx.fill();

                        // Neuron border
                        ctx.strokeStyle = '#FF6B35';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }

                // Labels
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('Input', layerSpacing, height - 20);
                if (this.layers > 2) {
                    ctx.fillText('Hidden', width / 2, height - 20);
                }
                ctx.fillText('Output', width - layerSpacing, height - 20);
            }

            async runForwardPass() {
                if (this.isAnimating) {
                    console.log('Already animating, skipping...');
                    return;
                }

                const runBtn = document.getElementById('nn-run');
                if (!runBtn) {
                    console.error('Run button not found');
                    return;
                }

                this.isAnimating = true;
                runBtn.classList.add('loading');
                runBtn.disabled = true;

                try {
                    console.log('Creating TensorFlow model...');
                    // Create a simple model with TensorFlow.js
                    const model = tf.sequential();

                    // Input layer
                    model.add(tf.layers.dense({
                        inputShape: [this.neuronsPerLayer],
                        units: this.neuronsPerLayer,
                        activation: this.activation
                    }));

                    // Hidden layers
                    for (let i = 1; i < this.layers - 1; i++) {
                        model.add(tf.layers.dense({
                            units: this.neuronsPerLayer,
                            activation: this.activation
                        }));
                    }

                    // Output layer
                    if (this.layers > 1) {
                        model.add(tf.layers.dense({
                            units: this.neuronsPerLayer,
                            activation: this.activation
                        }));
                    }

                    // Generate random input
                    const input = tf.randomNormal([1, this.neuronsPerLayer]);

                    // Animate forward pass
                    await this.animateForwardPass(input, model);

                    input.dispose();
                    model.dispose();
                } catch (error) {
                    console.error('Error running forward pass:', error);
                    alert('Error running forward pass. Please check the console for details.');
                } finally {
                    runBtn.classList.remove('loading');
                    runBtn.disabled = false;
                    this.isAnimating = false;
                }
            }

            async animateForwardPass(input, model) {
                if (!this.canvas || !this.ctx) {
                    console.warn('Canvas not initialized, skipping animation');
                    return;
                }

                const ctx = this.ctx;
                const width = this.canvas.width;
                const height = this.canvas.height;
                const layerSpacing = width / (this.layers + 1);
                const neuronSpacing = height / (this.neuronsPerLayer + 1);

                // Get activations for each layer
                const activations = [];
                let current = input;

                for (let i = 0; i < model.layers.length; i++) {
                    current = model.layers[i].apply(current);
                    activations.push(await current.array());
                }

                // Animate data flow with pulsing effect
                for (let step = 0; step < 30; step++) {
                    this.draw();

                    // Draw animated flow with pulsing
                    const pulse = Math.sin(step * 0.3) * 0.5 + 0.5;
                    ctx.fillStyle = `rgba(255, 210, 63, ${0.6 + pulse * 0.4})`;

                    const progress = step / 30;
                    const currentLayer = Math.floor(progress * (this.layers - 1));
                    const layerProgress = (progress * (this.layers - 1)) % 1;

                    if (currentLayer < this.layers - 1) {
                        const x1 = (currentLayer + 1) * layerSpacing;
                        const x2 = (currentLayer + 2) * layerSpacing;
                        const x = x1 + (x2 - x1) * layerProgress;

                        for (let n = 0; n < this.neuronsPerLayer; n++) {
                            const y = (n + 1) * neuronSpacing;
                            const size = 6 + pulse * 4;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }

                    await new Promise(resolve => setTimeout(resolve, 80));
                }

                // Final state
                this.draw();

                // Highlight activated neurons with animation
                for (let animStep = 0; animStep < 10; animStep++) {
                    this.draw();
                    const animProgress = animStep / 10;

                    activations.forEach((layerAct, layerIdx) => {
                        const x = (layerIdx + 1) * layerSpacing;
                        layerAct[0].forEach((activation, neuronIdx) => {
                            const y = (neuronIdx + 1) * neuronSpacing;
                            const intensity = Math.abs(activation);
                            const radius = 20 + intensity * 10 * animProgress;
                            const alpha = Math.min(intensity, 1) * animProgress;

                            ctx.fillStyle = `rgba(255, 210, 63, ${alpha * 0.6})`;
                            ctx.beginPath();
                            ctx.arc(x, y, radius, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    });

                    await new Promise(resolve => setTimeout(resolve, 50));
                }

                // Final state
                this.draw();
                activations.forEach((layerAct, layerIdx) => {
                    const x = (layerIdx + 1) * layerSpacing;
                    layerAct[0].forEach((activation, neuronIdx) => {
                        const y = (neuronIdx + 1) * neuronSpacing;
                        const intensity = Math.abs(activation);
                        const radius = 20 + intensity * 10;

                        ctx.fillStyle = `rgba(255, 210, 63, ${Math.min(intensity, 1) * 0.6})`;
                        ctx.beginPath();
                        ctx.arc(x, y, radius, 0, Math.PI * 2);
                        ctx.fill();
                    });
                });
            }
        }

        // ============================================
        // ATTENTION VISUALIZATION
        // ============================================
        class AttentionViz {
            constructor(containerId) {
                this.container = document.getElementById(containerId);
                if (!this.container) {
                    console.error(`Container element with id "${containerId}" not found`);
                    return;
                }
                this.tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
                this.attentionMatrix = null;
                this.setupControls();
                this.generateRandomAttention();
            }

            setupControls() {
                const randomBtn = document.getElementById('attention-random');
                const resetBtn = document.getElementById('attention-reset');

                if (!randomBtn || !resetBtn) {
                    console.error('Attention controls not found');
                    return;
                }

                randomBtn.addEventListener('click', () => {
                    console.log('Generate random attention clicked');
                    this.generateRandomAttention();
                });

                resetBtn.addEventListener('click', () => {
                    console.log('Reset attention clicked');
                    this.tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
                    this.generateRandomAttention();
                });
            }

            generateRandomAttention() {
                const n = this.tokens.length;
                this.attentionMatrix = [];

                // Create more realistic attention patterns
                for (let i = 0; i < n; i++) {
                    this.attentionMatrix[i] = [];
                    let rowSum = 0;
                    for (let j = 0; j < n; j++) {
                        // Higher attention to nearby tokens and self
                        const distance = Math.abs(i - j);
                        const baseAttention = distance === 0 ? 0.3 :
                                             distance === 1 ? 0.25 :
                                             distance === 2 ? 0.15 :
                                             0.05;
                        const val = baseAttention + Math.random() * 0.2;
                        this.attentionMatrix[i][j] = val;
                        rowSum += val;
                    }
                    // Normalize to sum to 1
                    for (let j = 0; j < n; j++) {
                        this.attentionMatrix[i][j] /= rowSum;
                    }
                }

                this.draw();
            }

            draw() {
                const margin = { top: 60, right: 60, bottom: 60, left: 60 };
                const width = Math.min(800, this.container.offsetWidth - margin.left - margin.right);
                const height = Math.min(600, width);

                d3.select(this.container).selectAll('*').remove();

                const svg = d3.select(this.container)
                    .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom);

                const g = svg.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);

                const n = this.tokens.length;
                const cellSize = width / n;

                // Color scale
                const colorScale = d3.scaleSequential()
                    .domain([0, 1])
                    .interpolator(d3.interpolateRgb('#1a1a1a', '#FF6B35'));

                // Create heatmap with animation
                const cells = g.selectAll('.cell')
                    .data(d3.range(n * n))
                    .enter()
                    .append('rect')
                    .attr('class', 'cell')
                    .attr('x', d => (d % n) * cellSize)
                    .attr('y', d => Math.floor(d / n) * cellSize)
                    .attr('width', 0)
                    .attr('height', 0)
                    .attr('fill', d => {
                        const row = Math.floor(d / n);
                        const col = d % n;
                        return colorScale(this.attentionMatrix[row][col]);
                    })
                    .attr('stroke', '#404040')
                    .attr('stroke-width', 1)
                    .style('cursor', 'pointer')
                    .transition()
                    .duration(500)
                    .delay((d, i) => i * 10)
                    .attr('width', cellSize)
                    .attr('height', cellSize)
                    .on('end', function() {
                        d3.select(this)
                            .on('mouseover', function(event, d) {
                                d3.select(this)
                                    .attr('stroke', '#FFD23F')
                                    .attr('stroke-width', 3)
                                    .attr('transform', 'scale(1.1)');
                            })
                            .on('mouseout', function(event, d) {
                                d3.select(this)
                                    .attr('stroke', '#404040')
                                    .attr('stroke-width', 1)
                                    .attr('transform', 'scale(1)');
                            });
                    });

                // Add text labels for attention values
                g.selectAll('.attention-value')
                    .data(d3.range(n * n))
                    .enter()
                    .append('text')
                    .attr('class', 'attention-value')
                    .attr('x', d => (d % n) * cellSize + cellSize / 2)
                    .attr('y', d => Math.floor(d / n) * cellSize + cellSize / 2)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('fill', d => {
                        const row = Math.floor(d / n);
                        const col = d % n;
                        return this.attentionMatrix[row][col] > 0.5 ? '#ffffff' : '#b0b0b0';
                    })
                    .attr('font-size', '12px')
                    .text(d => {
                        const row = Math.floor(d / n);
                        const col = d % n;
                        return this.attentionMatrix[row][col].toFixed(2);
                    });

                // X-axis labels (tokens)
                g.selectAll('.x-label')
                    .data(this.tokens)
                    .enter()
                    .append('text')
                    .attr('class', 'x-label')
                    .attr('x', (d, i) => i * cellSize + cellSize / 2)
                    .attr('y', -10)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#ffffff')
                    .attr('font-size', '14px')
                    .attr('font-weight', '500')
                    .text(d => d);

                // Y-axis labels (tokens)
                g.selectAll('.y-label')
                    .data(this.tokens)
                    .enter()
                    .append('text')
                    .attr('class', 'y-label')
                    .attr('x', -10)
                    .attr('y', (d, i) => i * cellSize + cellSize / 2)
                    .attr('text-anchor', 'end')
                    .attr('dominant-baseline', 'middle')
                    .attr('fill', '#ffffff')
                    .attr('font-size', '14px')
                    .attr('font-weight', '500')
                    .text(d => d);

                // Title
                svg.append('text')
                    .attr('x', (width + margin.left + margin.right) / 2)
                    .attr('y', 30)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#FF6B35')
                    .attr('font-size', '18px')
                    .attr('font-weight', '600')
                    .text('Attention Weights Matrix');
            }
        }

        // ============================================
        // TRANSFORMER ARCHITECTURE VISUALIZATION
        // ============================================
        class TransformerViz {
            constructor(containerId) {
                this.container = document.getElementById(containerId);
                if (!this.container) {
                    console.error(`Container element with id "${containerId}" not found`);
                    return;
                }
                this.draw();
            }

            draw() {
                const margin = { top: 40, right: 40, bottom: 40, left: 40 };
                const containerWidth = this.container.offsetWidth || 1000;
                const width = Math.min(1000, containerWidth - margin.left - margin.right);
                const height = Math.min(800, window.innerHeight * 0.8);

                d3.select(this.container).selectAll('*').remove();

                const svg = d3.select(this.container)
                    .append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
                    .attr('preserveAspectRatio', 'xMidYMid meet');

                // Create defs section for arrow markers (only once)
                const defs = svg.append('defs');

                // Create glow filter for better line visibility
                const filter = defs.append('filter')
                    .attr('id', 'glow')
                    .attr('x', '-50%')
                    .attr('y', '-50%')
                    .attr('width', '200%')
                    .attr('height', '200%');

                filter.append('feGaussianBlur')
                    .attr('stdDeviation', '2')
                    .attr('result', 'coloredBlur');

                const feMerge = filter.append('feMerge');
                feMerge.append('feMergeNode').attr('in', 'coloredBlur');
                feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

                // Create arrow markers for different colors
                const colors = ['FF6B35', 'F7931E', 'FFD23F'];
                colors.forEach((colorCode, idx) => {
                    const marker = defs.append('marker')
                        .attr('id', `arrow-${colorCode}-${idx}`)
                        .attr('markerWidth', 12)
                        .attr('markerHeight', 12)
                        .attr('refX', 10)
                        .attr('refY', 3)
                        .attr('orient', 'auto')
                        .attr('markerUnits', 'userSpaceOnUse');

                    marker.append('path')
                        .attr('d', 'M0,0 L0,6 L10,3 z')
                        .attr('fill', `#${colorCode}`)
                        .attr('stroke', `#${colorCode}`)
                        .attr('stroke-width', 0.5);
                });

                const g = svg.append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);

                const encoderY = 100;
                const decoderY = 450;
                const componentWidth = 150;
                const componentHeight = 80;
                const stackWidth = width * 0.4;
                const stackX = width * 0.1;

                // Store marker IDs for use in drawArrow
                this.markerIds = {
                    '#FF6B35': 'arrow-FF6B35-0',
                    '#F7931E': 'arrow-F7931E-1',
                    '#FFD23F': 'arrow-FFD23F-2'
                };

                // Encoder stack
                g.append('text')
                    .attr('x', stackX + stackWidth / 2)
                    .attr('y', encoderY - 20)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#FF6B35')
                    .attr('font-size', '20px')
                    .attr('font-weight', '600')
                    .text('Encoder Stack');

                // Draw encoder layers
                for (let i = 0; i < 6; i++) {
                    const y = encoderY + i * (componentHeight + 10);
                    this.drawEncoderLayer(g, stackX, y, componentWidth, componentHeight, i);
                }

                // Decoder stack
                g.append('text')
                    .attr('x', stackX + stackWidth / 2)
                    .attr('y', decoderY - 20)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#F7931E')
                    .attr('font-size', '20px')
                    .attr('font-weight', '600')
                    .text('Decoder Stack');

                // Draw decoder layers
                for (let i = 0; i < 6; i++) {
                    const y = decoderY + i * (componentHeight + 10);
                    this.drawDecoderLayer(g, stackX, y, componentWidth, componentHeight, i);
                }

                // Input/Output embeddings
                const embedX = width * 0.6;
                const embedWidth = 200;

                // Input embeddings
                g.append('rect')
                    .attr('x', embedX)
                    .attr('y', encoderY + 50)
                    .attr('width', embedWidth)
                    .attr('height', componentHeight)
                    .attr('fill', '#2d2d2d')
                    .attr('stroke', '#FF6B35')
                    .attr('stroke-width', 2)
                    .attr('rx', 8)
                    .classed('transformer-component', true);

                g.append('text')
                    .attr('x', embedX + embedWidth / 2)
                    .attr('y', encoderY + 50 + componentHeight / 2)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('fill', '#ffffff')
                    .attr('font-size', '14px')
                    .text('Input Embeddings');

                // Output embeddings
                g.append('rect')
                    .attr('x', embedX)
                    .attr('y', decoderY + 50)
                    .attr('width', embedWidth)
                    .attr('height', componentHeight)
                    .attr('fill', '#2d2d2d')
                    .attr('stroke', '#F7931E')
                    .attr('stroke-width', 2)
                    .attr('rx', 8)
                    .classed('transformer-component', true);

                g.append('text')
                    .attr('x', embedX + embedWidth / 2)
                    .attr('y', decoderY + 50 + componentHeight / 2)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('fill', '#ffffff')
                    .attr('font-size', '14px')
                    .text('Output Embeddings');

                // Arrows - Input to Encoder
                this.drawArrow(g, embedX + embedWidth, encoderY + 50 + componentHeight / 2,
                              stackX, encoderY + 50 + componentHeight / 2, '#FF6B35');

                // Encoder to Decoder (cross-attention connection)
                this.drawArrow(g, stackX + stackWidth, encoderY + 50 + (componentHeight + 10) * 3,
                              embedX, decoderY + 50 + componentHeight / 2, '#FFD23F');

                // Decoder to Output
                this.drawArrow(g, embedX + embedWidth, decoderY + 50 + componentHeight / 2,
                              width - 50, decoderY + 50 + componentHeight / 2, '#F7931E');
            }

            drawEncoderLayer(g, x, y, width, height, index) {
                const layerGroup = g.append('g').attr('class', 'encoder-layer');

                // Main rectangle
                layerGroup.append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', width)
                    .attr('height', height)
                    .attr('fill', '#2d2d2d')
                    .attr('stroke', '#FF6B35')
                    .attr('stroke-width', 2)
                    .attr('rx', 8)
                    .classed('transformer-component', true)
                    .on('click', () => {
                        alert(`Encoder Layer ${index + 1}\n\nContains:\n- Multi-Head Self-Attention\n- Feed-Forward Network\n- Layer Normalization\n- Residual Connections`);
                    });

                // Layer label
                layerGroup.append('text')
                    .attr('x', x + width / 2)
                    .attr('y', y + height / 2)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('fill', '#ffffff')
                    .attr('font-size', '12px')
                    .text(`Encoder ${index + 1}`);

                // Arrow to next layer
                if (index < 5) {
                    const nextY = y + height + 10;
                    const markerId = (this.markerIds && this.markerIds['#FF6B35']) ? this.markerIds['#FF6B35'] : 'arrow-FF6B35-0';
                    g.append('line')
                        .attr('x1', x + width / 2)
                        .attr('y1', y + height)
                        .attr('x2', x + width / 2)
                        .attr('y2', nextY)
                        .attr('stroke', '#FF6B35')
                        .attr('stroke-width', 2)
                        .attr('marker-end', `url(#${markerId})`);
                }
            }

            drawDecoderLayer(g, x, y, width, height, index) {
                const layerGroup = g.append('g').attr('class', 'decoder-layer');

                // Main rectangle
                layerGroup.append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', width)
                    .attr('height', height)
                    .attr('fill', '#2d2d2d')
                    .attr('stroke', '#F7931E')
                    .attr('stroke-width', 2)
                    .attr('rx', 8)
                    .classed('transformer-component', true)
                    .on('click', () => {
                        alert(`Decoder Layer ${index + 1}\n\nContains:\n- Masked Multi-Head Self-Attention\n- Multi-Head Cross-Attention\n- Feed-Forward Network\n- Layer Normalization\n- Residual Connections`);
                    });

                // Layer label
                layerGroup.append('text')
                    .attr('x', x + width / 2)
                    .attr('y', y + height / 2)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('fill', '#ffffff')
                    .attr('font-size', '12px')
                    .text(`Decoder ${index + 1}`);

                // Arrow to next layer
                if (index < 5) {
                    const nextY = y + height + 10;
                    const markerId = (this.markerIds && this.markerIds['#F7931E']) ? this.markerIds['#F7931E'] : 'arrow-F7931E-1';
                    g.append('line')
                        .attr('x1', x + width / 2)
                        .attr('y1', y + height)
                        .attr('x2', x + width / 2)
                        .attr('y2', nextY)
                        .attr('stroke', '#F7931E')
                        .attr('stroke-width', 2)
                        .attr('marker-end', `url(#${markerId})`);
                }
            }

            drawArrow(g, x1, y1, x2, y2, color) {
                // Get the marker ID for this color
                const markerId = this.markerIds && this.markerIds[color] ? this.markerIds[color] : 'arrow-FF6B35-0';

                // Create the arrow line with better visibility
                const line = g.append('line')
                    .attr('x1', x1)
                    .attr('y1', y1)
                    .attr('x2', x2)
                    .attr('y2', y2)
                    .attr('stroke', color)
                    .attr('stroke-width', 3)
                    .attr('marker-end', `url(#${markerId})`)
                    .style('opacity', 0.9);
            }
        }

        // ============================================
        // TRANSLATION SYSTEM
        // ============================================
        let currentLanguage = 'en';

        const translations = {
            en: {
                // Navigation
                'nav.neural-networks': 'Neural Networks',
                'nav.cnn-rnn': 'CNN & RNN',
                'nav.generative-ai': 'Generative AI',
                'nav.ethics': 'Ethics',
                'nav.attention': 'Attention',
                'nav.transformer': 'Transformer',
                'nav.encoder-decoder': 'Encoder/Decoder',
                'nav.pretraining-finetuning': 'Pre-training/Fine-tuning',
                'nav.foundation-models': 'Foundation Models',
                'nav.hugging-face': 'Hugging Face',
                'nav.rag': 'RAG',
                'nav.llm-problems': 'LLM Problems',
                'nav.rag-arch': 'RAG Architecture',
                'nav.data-ingestion': 'Data Ingestion',
                'nav.vector-dbs': 'Vector DBs',
                'nav.embeddings': 'Embeddings',
                'nav.retrieval': 'Retrieval',
                'nav.augmentation': 'Augmentation',
                'nav.generation-types': 'Generation Types',
                'nav.memory-types': 'Memory Types',
                'nav.rag-recipes': 'RAG Recipes',

                // Hero
                'hero.title': 'ML/DL Fundamentals',
                'hero.subtitle': 'Interactive visualizations to understand how machine learning and deep learning work',

                // Common UI
                'ui.beginner-explanation': 'Beginner Explanation',
                'ui.technical-deep-dive': 'Technical Deep-Dive',
                'ui.examples-use-cases': 'Examples & Use Cases',
                'ui.previous': '← Previous',
                'ui.next': 'Next →',
                'ui.reset': 'Reset',
                'ui.generate': 'Generate Random Attention',
                'ui.run': 'Run Forward Pass',

                // Neural Networks
                'nn.title': 'Neural Networks',
                'nn.intro': 'Neural networks are computational models inspired by biological neural networks. They consist of interconnected nodes (neurons) organized in layers that process information through weighted connections and activation functions.',
                'nn.beginner.1': 'Think of a neural network like your brain! Just as your brain has billions of neurons connected together, a neural network has artificial neurons (nodes) connected in layers.',
                'nn.beginner.2': 'Simple Analogy: Imagine you\'re learning to recognize cats in photos. Your brain doesn\'t recognize a cat all at once. Instead:',
                'nn.beginner.3': 'First, you notice basic features: edges, shapes, colors',
                'nn.beginner.4': 'Then, these combine to form patterns: eyes, ears, whiskers',
                'nn.beginner.5': 'Finally, all patterns together tell you: "This is a cat!"',
                'nn.beginner.6': 'A neural network works similarly! The input layer receives raw data (like pixel values from an image). Each hidden layer combines information from the previous layer to detect increasingly complex patterns. The output layer makes the final decision (like "cat" or "not cat").',
                'nn.beginner.7': 'Each connection between neurons has a weight - think of it as how important that connection is. During training, the network adjusts these weights to get better at recognizing patterns.',

                // Neural Networks Step Guide
                'nn.step.title': 'Step-by-Step: How Neural Networks Process Information',
                'nn.step.1.title': 'Input Layer Receives Data',
                'nn.step.1.description': 'The input layer is where data enters the network. Each neuron in this layer represents one feature of your input. For example, if you\'re processing a 28×28 pixel image, you\'d have 784 input neurons (28 × 28 = 784), one for each pixel.',
                'nn.step.1.visual.1': 'Input: [x₁, x₂, x₃, ..., xₙ]',
                'nn.step.1.visual.2': 'Each xᵢ represents one input feature',
                'nn.step.2.title': 'Weighted Connections Multiply Inputs',
                'nn.step.2.description': 'Each connection between neurons has a weight (w). The input value is multiplied by its weight. Stronger weights mean that input has more influence on the next layer.',
                'nn.step.2.formula.label': 'Weighted Input Calculation:',
                'nn.step.2.description2': 'Think of weights as volume controls - they determine how loud each input "speaks" to the next layer.',
                'nn.step.3.title': 'Summation and Bias Addition',
                'nn.step.3.description': 'All weighted inputs are summed together, and a bias term is added. The bias helps shift the activation function, allowing the neuron to fire even when inputs are small.',
                'nn.step.3.formula.label': 'Sum with Bias:',
                'nn.step.3.formula.explanation': 'Where b is the bias term. This sum is called the "pre-activation" value.',
                'nn.step.4.title': 'Activation Function Application',
                'nn.step.4.description': 'The activation function transforms the sum into the neuron\'s output. This introduces non-linearity, which is crucial - without it, multiple layers would be equivalent to a single layer!',
                'nn.step.4.formula.label': 'Activation Function:',
                'nn.step.4.formula.explanation': 'Common activation functions: ReLU (max(0, x)), Sigmoid (1/(1+e⁻ˣ)), Tanh (tanh(x))',
                'nn.step.4.description2': 'The activation function decides whether and how strongly the neuron "fires" - similar to how a biological neuron either fires or doesn\'t fire.',
                'nn.step.5.title': 'Output Generation',
                'nn.step.5.description': 'The activated output becomes the input for the next layer. This process repeats through all hidden layers until reaching the output layer, which produces the final prediction.',
                'nn.step.5.formula.label': 'Complete Forward Pass Formula:',
                'nn.step.5.formula.explanation': 'This happens at every neuron, layer by layer, from input to output.',
                'nn.step.5.description2': 'The output layer\'s values represent the network\'s prediction. For classification, these might be probabilities for each class (e.g., 0.8 for "cat", 0.2 for "dog").',

                // Neural Networks Technical
                'nn.technical.formulation.title': 'Mathematical Formulation',
                'nn.technical.formulation.formula.label': 'Single Neuron Output:',
                'nn.technical.formulation.formula.explanation': 'Where: xᵢ are inputs, wᵢ are weights, b is bias, f is activation function',
                'nn.technical.forward.title': 'Forward Propagation Algorithm',
                'nn.technical.backprop.title': 'Backpropagation Overview',
                'nn.technical.backprop.description': 'Backpropagation is how neural networks learn. It calculates gradients (derivatives) of the loss function with respect to each weight, working backwards from the output layer to the input layer. The weights are then updated using gradient descent:',
                'nn.technical.backprop.formula.label': 'Weight Update Rule:',
                'nn.technical.backprop.formula.explanation': 'Where α is the learning rate and L is the loss function',
                'nn.technical.loss.title': 'Loss Functions',
                'nn.technical.loss.mse.title': 'Mean Squared Error (MSE) - for regression:',
                'nn.technical.loss.ce.title': 'Cross-Entropy Loss - for classification:',
                'nn.technical.components.title': 'Component Details',
                'nn.technical.components.weights': 'Weights: Learnable parameters that determine the strength of connections. Initialized randomly, then optimized during training.',
                'nn.technical.components.biases': 'Biases: Additional learnable parameters that shift the activation function, allowing neurons to fire even with zero input.',
                'nn.technical.components.layer-types': 'Layer Types:',
                'nn.technical.components.dense': 'Dense/Fully Connected: Every neuron connects to every neuron in next layer',
                'nn.technical.components.conv': 'Convolutional: Used for images, detects spatial patterns',
                'nn.technical.components.recurrent': 'Recurrent: Processes sequences, maintains memory of previous inputs',

                // Neural Networks Examples
                'nn.examples.image.title': 'Image Classification',
                'nn.examples.image.description': 'Neural networks excel at recognizing objects in images. A typical architecture:',
                'nn.examples.image.input': 'Input: 224×224×3 image (RGB pixels)',
                'nn.examples.image.hidden': 'Hidden layers: Extract features (edges → shapes → objects)',
                'nn.examples.image.output': 'Output: Probabilities for 1000 object classes',
                'nn.examples.architectures.title': 'Common Architectures',
                'nn.examples.architectures.mlp': 'MLP (Multi-Layer Perceptron): Basic feedforward network with fully connected layers',
                'nn.examples.architectures.cnn': 'CNN (Convolutional Neural Network): Specialized for images, uses convolutional layers',
                'nn.examples.architectures.rnn': 'RNN (Recurrent Neural Network): Processes sequences, maintains hidden state',

                // Neural Networks Demo
                'nn.demo.layers': 'Layers:',
                'nn.demo.neurons': 'Neurons per layer:',
                'nn.demo.activation': 'Activation:',

                // Attention
                'attention.title': 'Attention Mechanism',
                'attention.intro': 'Attention allows models to focus on relevant parts of the input when making predictions. It computes a weighted sum of values, where weights are determined by the compatibility between queries and keys.',
                'attention.beginner.1': 'Simple Analogy: When you read a sentence, you don\'t pay equal attention to every word. Your brain automatically focuses on the important words that help you understand the meaning.',
                'attention.beginner.2': 'For example, in the sentence "The cat sat on the mat", when processing the word "sat", your brain might pay more attention to "cat" (who sat?) and "mat" (where did it sit?) than to "the" (less important).',
                'attention.beginner.3': 'Attention in AI works similarly: The model learns which parts of the input are most relevant for making a prediction. Instead of treating all inputs equally, it assigns higher "attention weights" to more important parts.',
                'attention.beginner.4': 'Think of it like a spotlight on a stage - attention shines brighter on the actors (important information) and dimmer on the background (less relevant information).',
                'attention.step.title': 'Step-by-Step: How Attention Works',
                'attention.step.1.title': 'Create Query, Key, Value Vectors',
                'attention.step.1.description': 'Each input token is transformed into three vectors:',
                'attention.step.1.query': 'Query (Q): "What am I looking for?" - represents what information we need',
                'attention.step.1.key': 'Key (K): "What do I offer?" - represents what information each token provides',
                'attention.step.1.value': 'Value (V): "What is my content?" - the actual information content',
                'attention.step.1.visual.1': 'Input: "The cat sat"',
                'attention.step.1.visual.2': 'Each word → Q, K, V vectors',
                'attention.step.2.title': 'Compute Attention Scores (Q·K^T)',
                'attention.step.2.description': 'For each query, we calculate how well it matches each key by computing the dot product between the query and all keys. Higher scores mean better match.',
                'attention.step.2.formula.label': 'Attention Score Calculation:',
                'attention.step.2.formula.explanation': 'This creates a matrix where each cell (i,j) represents how much token i should attend to token j',
                'attention.step.2.description2': 'Think of this as asking: "How relevant is each word to what I\'m currently processing?"',
                'attention.step.3.title': 'Scale and Apply Softmax Normalization',
                'attention.step.3.description': 'The scores are divided by √dₖ (where dₖ is the dimension of keys) to prevent extreme values, then softmax is applied to convert scores into probabilities that sum to 1.',
                'attention.step.3.formula.label': 'Scaled and Normalized:',
                'attention.step.3.formula.explanation': 'The scaling factor √dₖ prevents gradients from becoming too small in deep networks',
                'attention.step.3.description2': 'After softmax, each row sums to 1.0 - these are the attention weights showing how much attention each token should pay to every other token.',
                'attention.step.4.title': 'Weighted Sum of Values',
                'attention.step.4.description': 'Multiply the attention weights by the Value vectors and sum them up. This creates a weighted combination where important tokens contribute more to the final output.',
                'attention.step.4.formula.label': 'Final Attention Output:',
                'attention.step.4.description2': 'The result is a new representation that incorporates information from all tokens, weighted by their relevance.',
                'attention.step.5.title': 'Generate Attention Output',
                'attention.step.5.description': 'The weighted sum becomes the attention output for that position. This output contains information from all input tokens, but emphasizes the most relevant ones.',
                'attention.step.5.example.title': 'Example: "The cat sat on the mat"',
                'attention.step.5.example.description': 'When processing "sat", the model might attend:',
                'attention.step.5.example.cat': 'High attention to "cat" (0.4) - who performed the action',
                'attention.step.5.example.mat': 'High attention to "mat" (0.3) - where the action happened',
                'attention.step.5.example.the': 'Low attention to "the" (0.05) - less informative',
                'attention.technical.scaled.title': 'Scaled Dot-Product Attention',
                'attention.technical.scaled.formula.label': 'Complete Attention Formula:',
                'attention.technical.scaled.formula.explanation': 'Where dₖ is the dimension of the key vectors. The scaling prevents the dot products from growing too large, which would push softmax into regions with extremely small gradients.',
                'attention.technical.multihead.title': 'Multi-Head Attention',
                'attention.technical.multihead.description': 'Instead of computing attention once, multi-head attention runs multiple attention mechanisms in parallel (called "heads"), each with different learned projections. This allows the model to attend to information from different representation subspaces.',
                'attention.technical.multihead.formula.label': 'Multi-Head Attention:',
                'attention.technical.types.title': 'Self-Attention vs Cross-Attention',
                'attention.technical.types.table.type': 'Type',
                'attention.technical.types.table.query': 'Query Source',
                'attention.technical.types.table.keyvalue': 'Key/Value Source',
                'attention.technical.types.table.usecase': 'Use Case',
                'attention.technical.types.self.name': 'Self-Attention',
                'attention.technical.types.self.query': 'Same sequence',
                'attention.technical.types.self.keyvalue': 'Same sequence',
                'attention.technical.types.self.usecase': 'Understanding relationships within one sequence',
                'attention.technical.types.cross.name': 'Cross-Attention',
                'attention.technical.types.cross.query': 'Target sequence',
                'attention.technical.types.cross.keyvalue': 'Source sequence',
                'attention.technical.types.cross.usecase': 'Relating two different sequences (e.g., translation)',
                'attention.technical.why.title': 'Why Attention Works',
                'attention.technical.why.longrange': 'Long-range dependencies: Can directly connect distant tokens',
                'attention.technical.why.interpretability': 'Interpretability: Attention weights show what the model focuses on',
                'attention.technical.why.parallelization': 'Parallelization: All attention computations can happen simultaneously',
                'attention.technical.why.flexibility': 'Flexibility: Adapts to different input lengths without architecture changes',
                'attention.examples.translation.title': 'Real-World Example: Machine Translation',
                'attention.examples.translation.description': 'When translating "The cat sat on the mat" to French:',
                'attention.examples.translation.chat': 'When generating "chat" (cat), attention focuses on "cat" in English',
                'attention.examples.translation.tapis': 'When generating "tapis" (mat), attention focuses on "mat" in English',
                'attention.examples.translation.alignment': 'Attention weights show the alignment between source and target words',
                'attention.examples.code.title': 'Code Example: Attention Implementation',

                // Transformer
                'transformer.title': 'Transformer Architecture',
                'transformer.intro': 'Transformers revolutionized NLP by using self-attention mechanisms instead of recurrence. They consist of encoder and decoder stacks, each containing multiple layers of attention and feed-forward networks.',
                'transformer.beginner.1': 'Assembly Line Analogy: Think of a transformer like a factory assembly line with two main sections:',
                'transformer.beginner.encoder': 'Encoder (Reader): Processes and understands the input text, creating a rich representation of what it means',
                'transformer.beginner.decoder': 'Decoder (Writer): Uses the encoder\'s understanding to generate the output text, word by word',
                'transformer.beginner.2': 'Unlike older models that processed words one at a time (like reading left-to-right), transformers can look at ALL words simultaneously. It\'s like having eyes that can see the entire sentence at once, understanding how all words relate to each other.',
                'transformer.beginner.3': 'Key Innovation: The transformer replaced sequential processing (which was slow) with parallel processing (which is fast), while still understanding word order and relationships through positional encoding.',
                'transformer.step.title': 'Step-by-Step: Transformer Processing',
                'transformer.step.1.title': 'Input Tokenization and Embedding',
                'transformer.step.1.description': 'Text is broken into tokens (words or subwords) and each token is converted into a dense vector representation called an embedding. These embeddings capture semantic meaning - similar words have similar embeddings.',
                'transformer.step.1.visual.1': '"Hello world" → [embedding₁, embedding₂]',
                'transformer.step.1.visual.2': 'Each token becomes a vector of numbers (typically 512 dimensions)',
                'transformer.step.2.title': 'Add Positional Encoding',
                'transformer.step.2.description': 'Since transformers process all tokens in parallel (unlike RNNs), they need a way to know word order. Positional encoding adds information about each token\'s position in the sequence.',
                'transformer.step.2.formula.label': 'Positional Encoding Formula:',
                'transformer.step.2.formula.explanation': 'Uses sinusoidal functions to encode position information that the model can learn to use',
                'transformer.step.3.title': 'Encoder Stack Processing',
                'transformer.step.3.description': 'The encoder consists of 6 identical layers (in the original transformer). Each layer has:',
                'transformer.step.3.attention': 'Multi-head self-attention: Each token attends to all tokens in the input',
                'transformer.step.3.ffn': 'Feed-forward network: Processes each token independently',
                'transformer.step.3.norm': 'Layer normalization: Stabilizes training',
                'transformer.step.3.residual': 'Residual connections: Helps gradients flow through deep networks',
                'transformer.step.3.description2': 'Information flows through all 6 layers, with each layer refining the representation.',
                'transformer.step.4.title': 'Decoder Receives Encoder Output',
                'transformer.step.4.description': 'The decoder uses the encoder\'s final representation through cross-attention. This allows the decoder to "look" at the input while generating output. The decoder also uses masked self-attention to prevent looking at future tokens (since it generates left-to-right).',
                'transformer.step.4.example.title': 'Cross-Attention Flow',
                'transformer.step.4.example.description': 'Encoder output → Decoder cross-attention → Helps decoder understand what to generate',
                'transformer.step.5.title': 'Decoder Generates Output Tokens',
                'transformer.step.5.description': 'The decoder generates output tokens one at a time (autoregressively). At each step, it uses:',
                'transformer.step.5.previous': 'Previously generated tokens (through masked self-attention)',
                'transformer.step.5.encoder': 'Encoder representation (through cross-attention)',
                'transformer.step.5.ffn': 'Feed-forward processing',
                'transformer.step.5.description2': 'The final layer outputs probabilities over the vocabulary, and the token with highest probability is selected as the next output token.',
                'transformer.technical.encoder.title': 'Encoder Layer Components',
                'transformer.technical.encoder.attention.title': '1. Multi-Head Self-Attention',
                'transformer.technical.encoder.attention.description': 'Allows each position to attend to all positions in the input sequence. Multiple heads allow attending to different types of relationships.',
                'transformer.technical.encoder.ffn.title': '2. Feed-Forward Network (FFN)',
                'transformer.technical.encoder.ffn.formula.label': 'FFN Formula:',
                'transformer.technical.encoder.ffn.formula.explanation': 'Two linear transformations with ReLU activation. Applied independently to each position.',
                'transformer.technical.encoder.norm.title': '3. Layer Normalization',
                'transformer.technical.encoder.norm.formula.label': 'LayerNorm Formula:',
                'transformer.technical.encoder.norm.formula.explanation': 'Normalizes across features (not batch). μ and σ are mean and std of x. γ and β are learnable parameters.',
                'transformer.technical.encoder.residual.title': '4. Residual Connections',
                'transformer.technical.encoder.residual.description': 'Each sub-layer has a residual connection: output = LayerNorm(x + Sublayer(x)). This helps gradients flow through deep networks and enables training of very deep models.',
                'transformer.technical.decoder.title': 'Decoder Layer Components',
                'transformer.technical.decoder.intro': 'Decoder layers have three sub-layers (instead of encoder\'s two):',
                'transformer.technical.decoder.masked': 'Masked Multi-Head Self-Attention: Can only attend to previous positions (mask prevents seeing future tokens)',
                'transformer.technical.decoder.cross': 'Multi-Head Cross-Attention: Attends to encoder output (connects encoder and decoder)',
                'transformer.technical.decoder.ffn': 'Feed-Forward Network: Same as encoder',
                'transformer.technical.positional.title': 'Positional Encoding Details',
                'transformer.technical.positional.description': 'Positional encoding uses sinusoidal functions because they can extrapolate to sequence lengths longer than those seen during training. The frequencies decrease as dimensions increase, creating a unique pattern for each position.',
                'transformer.technical.comparison.title': 'Transformer vs RNN',
                'transformer.technical.comparison.table.feature': 'Feature',
                'transformer.technical.comparison.table.rnn': 'RNN',
                'transformer.technical.comparison.table.transformer': 'Transformer',
                'transformer.technical.comparison.processing.name': 'Processing',
                'transformer.technical.comparison.processing.rnn': 'Sequential (one token at a time)',
                'transformer.technical.comparison.processing.transformer': 'Parallel (all tokens simultaneously)',
                'transformer.technical.comparison.dependencies.name': 'Long-range dependencies',
                'transformer.technical.comparison.dependencies.rnn': 'Difficult (gradient vanishing)',
                'transformer.technical.comparison.dependencies.transformer': 'Easy (direct attention)',
                'transformer.technical.comparison.speed.name': 'Training speed',
                'transformer.technical.comparison.speed.rnn': 'Slow (sequential)',
                'transformer.technical.comparison.speed.transformer': 'Fast (parallelizable)',
                'transformer.technical.comparison.memory.name': 'Memory',
                'transformer.technical.comparison.memory.rnn': 'O(n) sequential',
                'transformer.technical.comparison.memory.transformer': 'O(n²) attention matrix',
                'transformer.examples.variants.title': 'Transformer Variants',
                'transformer.examples.variants.bert': 'BERT: Encoder-only, bidirectional, great for understanding tasks',
                'transformer.examples.variants.gpt': 'GPT: Decoder-only, autoregressive, great for generation tasks',
                'transformer.examples.variants.t5': 'T5: Encoder-decoder, good for both understanding and generation',

                // Encoder/Decoder
                'encoder-decoder.title': 'Encoder vs Decoder',
                'encoder-decoder.intro': 'Understanding the differences between encoder and decoder architectures is crucial for working with sequence-to-sequence models and transformers.',
                'encoder-decoder.beginner.analogy': 'Reader vs Writer Analogy:',
                'encoder-decoder.beginner.encoder': 'Encoder = Reader: Reads and understands the input text. Like reading a book and understanding its meaning, the encoder processes input and creates a rich representation of what it means.',
                'encoder-decoder.beginner.decoder': 'Decoder = Writer: Writes the output text based on understanding. Like writing a summary or translation, the decoder generates output word by word, using the encoder\'s understanding.',
                'encoder-decoder.beginner.difference': 'Key Difference: The encoder can look at the entire input at once (bidirectional), while the decoder generates output sequentially, one word at a time (autoregressive), and can only look at previously generated words.',
                'encoder-decoder.comparison.title': 'Detailed Comparison',
                'encoder-decoder.comparison.table.feature': 'Feature',
                'encoder-decoder.comparison.table.encoder': 'Encoder',
                'encoder-decoder.comparison.table.decoder': 'Decoder',
                'encoder-decoder.comparison.purpose.name': 'Purpose',
                'encoder-decoder.comparison.purpose.encoder': 'Processes and understands input sequences',
                'encoder-decoder.comparison.purpose.decoder': 'Generates output sequences',
                'encoder-decoder.comparison.attention.name': 'Attention Types',
                'encoder-decoder.comparison.attention.encoder': 'Self-attention only (bidirectional)',
                'encoder-decoder.comparison.attention.decoder': 'Masked self-attention + Cross-attention',
                'encoder-decoder.comparison.flow.name': 'Data Flow',
                'encoder-decoder.comparison.flow.encoder': 'Input → Encoder → Representation',
                'encoder-decoder.comparison.flow.decoder': 'Encoder output → Decoder → Generated tokens',
                'encoder-decoder.comparison.processing.name': 'Processing',
                'encoder-decoder.comparison.processing.encoder': 'Parallel (all tokens simultaneously)',
                'encoder-decoder.comparison.processing.decoder': 'Sequential (one token at a time)',
                'encoder-decoder.comparison.context.name': 'Context',
                'encoder-decoder.comparison.context.encoder': 'Bidirectional (sees past and future)',
                'encoder-decoder.comparison.context.decoder': 'Causal (only sees past tokens)',
                'encoder-decoder.comparison.training.name': 'Training Objective',
                'encoder-decoder.comparison.training.encoder': 'Masked language modeling, classification',
                'encoder-decoder.comparison.training.decoder': 'Next token prediction, generation',
                'encoder-decoder.comparison.usecases.name': 'Use Cases',
                'encoder-decoder.comparison.usecases.encoder': 'BERT, classification, feature extraction, Q&A',
                'encoder-decoder.comparison.usecases.decoder': 'GPT, text generation, translation, summarization',
                'encoder-decoder.comparison.arch.title': 'Architecture Differences',
                'encoder-decoder.comparison.arch.encoder.title': 'Encoder Architecture',
                'encoder-decoder.comparison.arch.decoder.title': 'Decoder Architecture',
                'encoder-decoder.technical.encoder.title': 'Encoder: Bidirectional Processing',
                'encoder-decoder.technical.encoder.description': 'The encoder uses self-attention, meaning each token can attend to ALL tokens in the input sequence, including those that come after it. This bidirectional context is crucial for understanding tasks.',
                'encoder-decoder.technical.encoder.formula.label': 'Encoder Self-Attention:',
                'encoder-decoder.technical.encoder.formula.explanation': 'Q, K, V all come from the same input sequence, allowing full bidirectional understanding',
                'encoder-decoder.technical.decoder.title': 'Decoder: Autoregressive Generation',
                'encoder-decoder.technical.decoder.description': 'The decoder uses masked self-attention to prevent looking at future tokens (since they don\'t exist yet during generation), and cross-attention to attend to the encoder\'s output.',
                'encoder-decoder.technical.decoder.masked.formula.label': 'Decoder Masked Self-Attention:',
                'encoder-decoder.technical.decoder.masked.formula.explanation': 'M is a mask matrix that sets future positions to -∞ (becomes 0 after softmax)',
                'encoder-decoder.technical.decoder.cross.formula.label': 'Decoder Cross-Attention:',
                'encoder-decoder.technical.decoder.cross.formula.explanation': 'Query comes from decoder, Key/Value come from encoder - connects the two components',
                'encoder-decoder.technical.math.title': 'Mathematical Differences',
                'encoder-decoder.technical.math.description': 'The key mathematical difference is in attention computation:',
                'encoder-decoder.technical.math.encoder': 'Encoder: All-to-all attention (no masking)',
                'encoder-decoder.technical.math.decoder-self': 'Decoder self-attention: Causal masking (can\'t see future)',
                'encoder-decoder.technical.math.decoder-cross': 'Decoder cross-attention: Decoder queries attend to encoder keys/values',
                'encoder-decoder.examples.bert.title': 'BERT (Encoder-Only)',
                'encoder-decoder.examples.bert.arch': 'Architecture: Stack of encoder layers only',
                'encoder-decoder.examples.bert.pretraining': 'Pre-training: Masked Language Modeling (MLM) - predicts masked words',
                'encoder-decoder.examples.bert.usecases': 'Use Cases: Text classification, named entity recognition, question answering',
                'encoder-decoder.examples.bert.why': 'Why encoder-only: Needs bidirectional context to understand meaning',
                'encoder-decoder.examples.gpt.title': 'GPT (Decoder-Only)',
                'encoder-decoder.examples.gpt.arch': 'Architecture: Stack of decoder layers (without cross-attention to encoder)',
                'encoder-decoder.examples.gpt.pretraining': 'Pre-training: Next Token Prediction - predicts next word given previous words',
                'encoder-decoder.examples.gpt.usecases': 'Use Cases: Text generation, completion, creative writing',
                'encoder-decoder.examples.gpt.why': 'Why decoder-only: Autoregressive generation requires causal (left-to-right) processing',
                'encoder-decoder.examples.t5.title': 'T5 (Encoder-Decoder)',
                'encoder-decoder.examples.t5.arch': 'Architecture: Full transformer with both encoder and decoder stacks',
                'encoder-decoder.examples.t5.pretraining': 'Pre-training: Text-to-text transfer - converts all tasks to text generation',
                'encoder-decoder.examples.t5.usecases': 'Use Cases: Translation, summarization, question answering, text classification',
                'encoder-decoder.examples.t5.why': 'Why both: Encoder understands input, decoder generates structured output',
                'encoder-decoder.summary.encoder.title': 'Encoder',
                'encoder-decoder.summary.encoder.purpose': 'Purpose: Processes input sequences and creates rich representations',
                'encoder-decoder.summary.encoder.arch': 'Architecture: Self-attention + Feed-forward networks',
                'encoder-decoder.summary.encoder.usecases': 'Use Cases: BERT, classification, feature extraction',
                'encoder-decoder.summary.encoder.feature': 'Key Feature: Bidirectional context understanding',
                'encoder-decoder.summary.decoder.title': 'Decoder',
                'encoder-decoder.summary.decoder.purpose': 'Purpose: Generates output sequences from encoded representations',
                'encoder-decoder.summary.decoder.arch': 'Architecture: Masked self-attention + Cross-attention + Feed-forward',
                'encoder-decoder.summary.decoder.usecases': 'Use Cases: GPT, text generation, translation',
                'encoder-decoder.summary.decoder.feature': 'Key Feature: Autoregressive generation',

                // CNN & RNN
                'cnn-rnn.title': 'CNN & RNN Architectures',
                'cnn-rnn.intro': 'Different neural network architectures are designed for different types of data. Convolutional Neural Networks (CNNs) excel at processing images, while Recurrent Neural Networks (RNNs) are designed for sequential data like text and time series.',
                'cnn-rnn.beginner.cnn': 'CNN Analogy: Think of a CNN like a magnifying glass scanning an image. It looks at small patches (like edges, corners) and gradually builds up to recognize larger patterns (like faces, objects). CNNs are perfect for images because they can detect spatial patterns regardless of where they appear.',
                'cnn-rnn.beginner.rnn': 'RNN Analogy: Think of an RNN like reading a book - you remember what you read on previous pages to understand the current page. RNNs process sequences (like sentences) one element at a time, maintaining a "memory" of what came before. This makes them great for text, speech, and time series data.',
                'cnn-rnn.beginner.difference': 'Key Difference: CNNs process spatial data (images) in parallel, while RNNs process temporal/sequential data (text) sequentially, maintaining hidden state.',
                'cnn-rnn.technical.cnn.title': 'Convolutional Neural Networks (CNN)',
                'cnn-rnn.technical.cnn.description': 'CNNs use convolutional layers that apply filters (kernels) to detect local patterns. These filters slide across the input, detecting features like edges, textures, and shapes.',
                'cnn-rnn.technical.cnn.formula.label': 'Convolution Operation:',
                'cnn-rnn.technical.cnn.formula.explanation': 'Where f is the input feature map and g is the filter/kernel. This operation detects local patterns.',
                'cnn-rnn.technical.cnn.components': 'Key Components: Convolutional layers (feature detection), Pooling layers (downsampling), Fully connected layers (classification).',
                'cnn-rnn.technical.rnn.title': 'Recurrent Neural Networks (RNN)',
                'cnn-rnn.technical.rnn.description': 'RNNs process sequences by maintaining a hidden state that carries information from previous time steps. At each step, they combine the current input with the previous hidden state.',
                'cnn-rnn.technical.rnn.formula.label': 'RNN Hidden State Update:',
                'cnn-rnn.technical.rnn.formula.explanation': 'Where h_t is the hidden state at time t, x_t is the input, and W_h, W_x are weight matrices. The hidden state acts as memory.',
                'cnn-rnn.technical.rnn.problem': 'Problem: Standard RNNs suffer from vanishing gradients - they struggle to remember information from many steps ago.',
                'cnn-rnn.technical.lstm.title': 'LSTM (Long Short-Term Memory)',
                'cnn-rnn.technical.lstm.description': 'LSTM solves the vanishing gradient problem using gates that control information flow. It has three gates: forget gate (what to discard), input gate (what to store), and output gate (what to output).',
                'cnn-rnn.technical.lstm.formula.label': 'LSTM Gate Equations:',
                'cnn-rnn.technical.lstm.formula.explanation': 'Forget gate (f_t), Input gate (i_t), Output gate (o_t). σ is sigmoid function. These gates control what information flows through the cell state.',
                'cnn-rnn.technical.gru.title': 'GRU (Gated Recurrent Unit)',
                'cnn-rnn.technical.gru.description': 'GRU is a simpler variant of LSTM with only two gates: reset gate (how much past information to forget) and update gate (how much new information to add). It\'s computationally more efficient than LSTM.',
                'cnn-rnn.technical.gru.formula.label': 'GRU Gate Equations:',
                'cnn-rnn.technical.gru.formula.explanation': 'Reset gate (r_t) and Update gate (z_t). GRU combines forget and input gates from LSTM into a single update gate.',
                'cnn-rnn.technical.comparison.title': 'ANN vs CNN vs RNN Comparison',
                'cnn-rnn.technical.comparison.table.feature': 'Feature',
                'cnn-rnn.technical.comparison.table.ann': 'ANN',
                'cnn-rnn.technical.comparison.table.cnn': 'CNN',
                'cnn-rnn.technical.comparison.table.rnn': 'RNN',
                'cnn-rnn.technical.comparison.data.name': 'Best For',
                'cnn-rnn.technical.comparison.data.ann': 'Tabular data, general ML',
                'cnn-rnn.technical.comparison.data.cnn': 'Images, spatial data',
                'cnn-rnn.technical.comparison.data.rnn': 'Sequences, text, time series',
                'cnn-rnn.technical.comparison.processing.name': 'Processing',
                'cnn-rnn.technical.comparison.processing.ann': 'Parallel, feedforward',
                'cnn-rnn.technical.comparison.processing.cnn': 'Parallel, convolutional',
                'cnn-rnn.technical.comparison.processing.rnn': 'Sequential, recurrent',
                'cnn-rnn.technical.comparison.memory.name': 'Memory',
                'cnn-rnn.technical.comparison.memory.ann': 'No memory',
                'cnn-rnn.technical.comparison.memory.cnn': 'Spatial patterns',
                'cnn-rnn.technical.comparison.memory.rnn': 'Temporal memory (hidden state)',
                'cnn-rnn.technical.comparison.parameters.name': 'Parameters',
                'cnn-rnn.technical.comparison.parameters.ann': 'Many (fully connected)',
                'cnn-rnn.technical.comparison.parameters.cnn': 'Fewer (shared weights)',
                'cnn-rnn.technical.comparison.parameters.rnn': 'Moderate (recurrent weights)',
                'cnn-rnn.technical.comparison.example.name': 'Example',
                'cnn-rnn.technical.comparison.example.ann': 'MLP for classification',
                'cnn-rnn.technical.comparison.example.cnn': 'ResNet for image recognition',
                'cnn-rnn.technical.comparison.example.rnn': 'LSTM for language modeling',
                'cnn-rnn.examples.cnn.title': 'CNN Applications',
                'cnn-rnn.examples.cnn.image': 'Image classification (identifying objects in photos)',
                'cnn-rnn.examples.cnn.detection': 'Object detection (finding and locating objects)',
                'cnn-rnn.examples.cnn.segmentation': 'Semantic segmentation (pixel-level classification)',
                'cnn-rnn.examples.cnn.medical': 'Medical imaging (X-ray, MRI analysis)',
                'cnn-rnn.examples.rnn.title': 'RNN/LSTM/GRU Applications',
                'cnn-rnn.examples.rnn.language': 'Language modeling (predicting next word)',
                'cnn-rnn.examples.rnn.translation': 'Machine translation (sequence-to-sequence)',
                'cnn-rnn.examples.rnn.speech': 'Speech recognition (audio to text)',
                'cnn-rnn.examples.rnn.time': 'Time series forecasting (stock prices, weather)',

                // Generative AI
                'generative-ai.title': 'Generative AI Fundamentals',
                'generative-ai.intro': 'Generative AI refers to artificial intelligence systems that can create new content - text, images, code, music, and more - rather than just analyzing or classifying existing data. These models learn patterns from training data and generate novel outputs.',
                'generative-ai.beginner.definition': 'What is Generative AI? Think of it as an AI artist or writer. While traditional AI (discriminative) learns to distinguish between things (like "this is a cat" vs "this is a dog"), generative AI learns to create new things (like writing a story or drawing a picture).',
                'generative-ai.beginner.difference': 'Key Difference: Discriminative models answer "What is this?" while generative models answer "What could this be?" or "Create something like this."',
                'generative-ai.beginner.analogy': 'Analogy: A discriminative model is like a critic who can identify art styles. A generative model is like an artist who can create new art in those styles.',
                'generative-ai.technical.components.title': 'Core Components',
                'generative-ai.technical.components.description': 'Generative models typically consist of:',
                'generative-ai.technical.components.generator': 'Generator: Creates new data samples from random noise or prompts',
                'generative-ai.technical.components.discriminator': 'Discriminator (in GANs): Distinguishes between real and generated samples',
                'generative-ai.technical.components.latent': 'Latent Space: A compressed representation where the model learns meaningful patterns',
                'generative-ai.technical.types.title': 'Types of Generative Models',
                'generative-ai.technical.types.autoregressive.title': '1. Autoregressive Models (GPT, PixelRNN)',
                'generative-ai.technical.types.autoregressive.description': 'Generate sequences one element at a time, predicting the next token based on previous tokens. Examples: GPT models, language models.',
                'generative-ai.technical.types.gan.title': '2. Generative Adversarial Networks (GANs)',
                'generative-ai.technical.types.gan.description': 'Two networks compete: a generator creates fake data, a discriminator tries to detect fakes. Through adversarial training, the generator improves. Examples: StyleGAN for images, CycleGAN for style transfer.',
                'generative-ai.technical.types.vae.title': '3. Variational Autoencoders (VAEs)',
                'generative-ai.technical.types.vae.description': 'Learn a probabilistic latent space representation. Can generate new samples by sampling from the learned distribution. Examples: VAE for images, β-VAE for disentangled representations.',
                'generative-ai.technical.types.diffusion.title': '4. Diffusion Models',
                'generative-ai.technical.types.diffusion.description': 'Learn to reverse a gradual noise-adding process. Start with noise and iteratively denoise to generate samples. Examples: DALL-E 2, Stable Diffusion, Midjourney.',
                'generative-ai.applications.title': 'Applications & Use Cases',
                'generative-ai.applications.text.title': 'Text Generation',
                'generative-ai.applications.text.story': 'Creative writing and storytelling',
                'generative-ai.applications.text.code': 'Code generation and completion',
                'generative-ai.applications.text.summary': 'Document summarization',
                'generative-ai.applications.text.translation': 'Translation and paraphrasing',
                'generative-ai.applications.image.title': 'Image Generation',
                'generative-ai.applications.image.art': 'Digital art and illustrations',
                'generative-ai.applications.image.design': 'Graphic design and marketing materials',
                'generative-ai.applications.image.photo': 'Photo editing and enhancement',
                'generative-ai.applications.image.style': 'Style transfer and filters',
                'generative-ai.applications.other.title': 'Other Applications',
                'generative-ai.applications.other.music': 'Music composition',
                'generative-ai.applications.other.video': 'Video generation and editing',
                'generative-ai.applications.other.drug': 'Drug discovery (molecular generation)',
                'generative-ai.applications.other.data': 'Synthetic data generation for training',
                'generative-ai.significance.title': 'Significance in Modern AI',
                'generative-ai.significance.impact': 'Generative AI has revolutionized how we interact with AI systems. Large Language Models (LLMs) like GPT-4 can understand context, generate human-like text, and assist with complex tasks. Image generators like DALL-E and Midjourney have democratized creative expression.',
                'generative-ai.significance.future': 'These models are becoming foundational tools across industries - from content creation to software development, from education to healthcare. They represent a shift from AI as a tool for analysis to AI as a creative partner.',

                // Ethics
                'ethics.title': 'Ethical Considerations in AI',
                'ethics.intro': 'As AI systems become more powerful and widespread, it\'s crucial to consider their ethical implications. Responsible AI development requires addressing bias, fairness, privacy, and the broader societal impact of these technologies.',
                'ethics.beginner.why': 'Why Ethics Matters: AI systems make decisions that affect people\'s lives - from hiring decisions to loan approvals, from medical diagnoses to content recommendations. These systems learn from data created by humans, which means they can inherit and amplify human biases.',
                'ethics.beginner.responsibility': 'Our Responsibility: As creators and users of AI, we have a responsibility to ensure these systems are fair, transparent, and beneficial to society. This means actively working to identify and mitigate potential harms.',
                'ethics.issues.title': 'Key Ethical Issues',
                'ethics.issues.bias.title': '1. Bias and Fairness',
                'ethics.issues.bias.description': 'AI models can perpetuate or amplify biases present in training data. This can lead to unfair treatment of certain groups based on race, gender, age, or other protected characteristics.',
                'ethics.issues.bias.example': 'Example: A hiring algorithm trained on historical data might favor certain demographics if past hiring was biased.',
                'ethics.issues.misinformation.title': '2. Misinformation and Deepfakes',
                'ethics.issues.misinformation.description': 'Generative AI can create realistic fake content - text, images, videos, and audio. This raises concerns about misinformation, identity theft, and manipulation.',
                'ethics.issues.misinformation.example': 'Example: Deepfake videos can make it appear someone said something they never said, potentially causing harm to individuals or spreading false information.',
                'ethics.issues.privacy.title': '3. Privacy and Data Protection',
                'ethics.issues.privacy.description': 'AI systems often require large amounts of personal data for training. This raises concerns about data privacy, consent, and the potential for data breaches or misuse.',
                'ethics.issues.privacy.example': 'Example: Training data might contain personal information that could be extracted or inferred from the model.',
                'ethics.issues.environmental.title': '4. Environmental Impact',
                'ethics.issues.environmental.description': 'Training large AI models requires significant computational resources, consuming vast amounts of energy and contributing to carbon emissions.',
                'ethics.issues.environmental.example': 'Example: Training GPT-3 was estimated to consume energy equivalent to hundreds of homes for a year.',
                'ethics.issues.jobs.title': '5. Job Displacement',
                'ethics.issues.jobs.description': 'AI automation can replace human workers in various industries, leading to job losses and economic disruption. However, it can also create new job opportunities.',
                'ethics.issues.jobs.example': 'Example: AI writing tools might reduce demand for certain types of content writers, while creating demand for AI prompt engineers.',
                'ethics.issues.ip.title': '6. Intellectual Property',
                'ethics.issues.ip.description': 'Generative AI models trained on copyrighted material raise questions about ownership of generated content and fair use of training data.',
                'ethics.issues.ip.example': 'Example: Who owns an image generated by DALL-E that was trained on millions of copyrighted images?',
                'ethics.principles.title': 'Responsible AI Principles',
                'ethics.principles.table.principle': 'Principle',
                'ethics.principles.table.description': 'Description',
                'ethics.principles.transparency.name': 'Transparency',
                'ethics.principles.transparency.description': 'AI systems should be explainable and their decision-making processes understandable to users',
                'ethics.principles.accountability.name': 'Accountability',
                'ethics.principles.accountability.description': 'Clear responsibility for AI system outcomes and mechanisms for addressing harms',
                'ethics.principles.fairness.name': 'Fairness',
                'ethics.principles.fairness.description': 'AI systems should treat all individuals and groups equitably, without discrimination',
                'ethics.principles.safety.name': 'Safety',
                'ethics.principles.safety.description': 'AI systems should be robust, secure, and designed to prevent harm',
                'ethics.principles.privacy.name': 'Privacy',
                'ethics.principles.privacy.description': 'Protect user data and respect privacy rights throughout the AI lifecycle',
                'ethics.principles.human.name': 'Human-Centered',
                'ethics.principles.human.description': 'AI should augment human capabilities and serve human values and well-being',
                'ethics.practices.title': 'Best Practices',
                'ethics.practices.diverse': 'Use diverse and representative training data',
                'ethics.practices.testing': 'Regularly test for bias and fairness issues',
                'ethics.practices.documentation': 'Document model limitations and potential risks',
                'ethics.practices.oversight': 'Implement human oversight for critical decisions',
                'ethics.practices.continuous': 'Continuously monitor and update models',
                'ethics.practices.education': 'Educate users about AI capabilities and limitations',

                // Foundation Models
                'foundation-models.title': 'Foundation Models & LLM Architectures',
                'foundation-models.intro': 'Foundation models are large-scale pre-trained models that serve as a base for many downstream tasks. Understanding the architectures of key models like BERT, GPT, and LLaMA is essential for working with modern NLP systems.',
                'foundation-models.beginner.definition': 'What are Foundation Models? Think of foundation models like a universal language student who has read millions of books. They understand language so well that they can be quickly adapted to many different tasks - translation, summarization, question answering, and more - without starting from scratch.',
                'foundation-models.beginner.why': 'Why They Matter: Foundation models have revolutionized AI by providing a powerful starting point. Instead of training a new model for each task, we can fine-tune a foundation model, saving time, resources, and achieving better performance.',
                'foundation-models.bert.title': 'BERT Architecture',
                'foundation-models.bert.description': 'BERT (Bidirectional Encoder Representations from Transformers) uses only the encoder stack of transformers, enabling bidirectional context understanding.',
                'foundation-models.bert.architecture.title': 'Architecture Details',
                'foundation-models.bert.architecture.layers': 'Layers: BERT-base has 12 layers, BERT-large has 24 layers',
                'foundation-models.bert.architecture.attention': 'Attention Heads: 12 heads (base), 16 heads (large)',
                'foundation-models.bert.architecture.hidden': 'Hidden Size: 768 dimensions (base), 1024 dimensions (large)',
                'foundation-models.bert.architecture.parameters': 'Parameters: ~110M (base), ~340M (large)',
                'foundation-models.bert.pretraining.title': 'Pre-training Objectives',
                'foundation-models.bert.pretraining.mlm': 'Masked Language Modeling (MLM): Predicts masked tokens (15% of tokens)',
                'foundation-models.bert.pretraining.nsp': 'Next Sentence Prediction (NSP): Predicts if sentence B follows sentence A',
                'foundation-models.bert.usecases.title': 'Use Cases',
                'foundation-models.bert.usecases.classification': 'Text classification',
                'foundation-models.bert.usecases.qa': 'Question answering',
                'foundation-models.bert.usecases.ner': 'Named entity recognition',
                'foundation-models.bert.usecases.sentiment': 'Sentiment analysis',
                'foundation-models.gpt.title': 'GPT Architecture',
                'foundation-models.gpt.description': 'GPT (Generative Pre-trained Transformer) uses only the decoder stack, making it autoregressive and ideal for text generation tasks.',
                'foundation-models.gpt.evolution.title': 'Evolution: GPT-1 to GPT-4',
                'foundation-models.gpt.evolution.table.model': 'Model',
                'foundation-models.gpt.evolution.table.parameters': 'Parameters',
                'foundation-models.gpt.evolution.table.training': 'Training Data',
                'foundation-models.gpt.evolution.table.features': 'Key Features',
                'foundation-models.gpt.evolution.gpt1.params': '117M',
                'foundation-models.gpt.evolution.gpt1.data': 'BookCorpus (4.5GB)',
                'foundation-models.gpt.evolution.gpt1.features': 'Decoder-only, next token prediction',
                'foundation-models.gpt.evolution.gpt2.params': '1.5B',
                'foundation-models.gpt.evolution.gpt2.data': 'WebText (40GB)',
                'foundation-models.gpt.evolution.gpt2.features': 'Larger scale, zero-shot learning',
                'foundation-models.gpt.evolution.gpt3.params': '175B',
                'foundation-models.gpt.evolution.gpt3.data': 'Common Crawl, books, web (570GB)',
                'foundation-models.gpt.evolution.gpt3.features': 'Few-shot learning, in-context learning',
                'foundation-models.gpt.evolution.gpt4.params': '~1T (estimated)',
                'foundation-models.gpt.evolution.gpt4.data': 'Massive multimodal dataset',
                'foundation-models.gpt.evolution.gpt4.features': 'Multimodal, RLHF, improved reasoning',
                'foundation-models.gpt.scaling.title': 'Scaling Laws',
                'foundation-models.gpt.scaling.description': 'GPT models follow scaling laws: performance improves predictably with model size, data size, and compute. This led to the development of increasingly larger models.',
                'foundation-models.llama.title': 'LLaMA Architecture',
                'foundation-models.llama.description': 'LLaMA (Large Language Model Meta AI) is an efficient decoder-only architecture that achieves strong performance with fewer parameters through architectural improvements.',
                'foundation-models.llama.innovations.title': 'Key Architectural Innovations',
                'foundation-models.llama.innovations.rmsnorm': 'RMSNorm: Root Mean Square Layer Normalization (more efficient than LayerNorm)',
                'foundation-models.llama.innovations.swiglu': 'SwiGLU Activation: Swish-Gated Linear Unit (better than ReLU)',
                'foundation-models.llama.innovations.rope': 'RoPE: Rotary Position Embedding (better position encoding)',
                'foundation-models.llama.innovations.gqa': 'Grouped-Query Attention: Reduces memory usage while maintaining quality',
                'foundation-models.llama.variants.title': 'LLaMA Variants',
                'foundation-models.llama.variants.llama1': 'LLaMA-1: 7B, 13B, 33B, 65B parameters',
                'foundation-models.llama.variants.llama2': 'LLaMA-2: Improved training, 7B, 13B, 70B parameters, chat variants',
                'foundation-models.llama.variants.llama3': 'LLaMA-3: Further improvements, larger context windows',
                'foundation-models.comparison.title': 'BERT vs GPT vs LLaMA Comparison',
                'foundation-models.comparison.table.feature': 'Feature',
                'foundation-models.comparison.table.bert': 'BERT',
                'foundation-models.comparison.table.gpt': 'GPT',
                'foundation-models.comparison.table.llama': 'LLaMA',
                'foundation-models.comparison.architecture.name': 'Architecture',
                'foundation-models.comparison.architecture.bert': 'Encoder-only',
                'foundation-models.comparison.architecture.gpt': 'Decoder-only',
                'foundation-models.comparison.architecture.llama': 'Decoder-only',
                'foundation-models.comparison.context.name': 'Context',
                'foundation-models.comparison.context.bert': 'Bidirectional',
                'foundation-models.comparison.context.gpt': 'Causal (left-to-right)',
                'foundation-models.comparison.context.llama': 'Causal (left-to-right)',
                'foundation-models.comparison.training.name': 'Training',
                'foundation-models.comparison.training.bert': 'MLM + NSP',
                'foundation-models.comparison.training.gpt': 'Next token prediction',
                'foundation-models.comparison.training.llama': 'Next token prediction',
                'foundation-models.comparison.best.name': 'Best For',
                'foundation-models.comparison.best.bert': 'Understanding tasks',
                'foundation-models.comparison.best.gpt': 'Generation tasks',
                'foundation-models.comparison.best.llama': 'Efficient generation',
                'foundation-models.comparison.size.name': 'Typical Size',
                'foundation-models.comparison.size.bert': '110M - 340M',
                'foundation-models.comparison.size.gpt': '117M - 175B+',
                'foundation-models.comparison.size.llama': '7B - 70B',
                'foundation-models.training.title': 'Advanced Training Techniques',
                'foundation-models.training.rlhf.title': 'Reinforcement Learning from Human Feedback (RLHF)',
                'foundation-models.training.rlhf.description': 'RLHF aligns model outputs with human preferences. It involves training a reward model on human feedback, then using reinforcement learning to optimize the language model. Used in GPT-3.5, GPT-4, Claude, and other advanced models.',
                'foundation-models.training.instruction.title': 'Instruction Tuning',
                'foundation-models.training.instruction.description': 'Fine-tuning on instruction-response pairs to make models better at following instructions. This enables zero-shot task performance - the model can perform new tasks without explicit training examples.',
                'foundation-models.training.chains.title': 'Chain-of-Thought Prompting',
                'foundation-models.training.chains.description': 'Prompting technique that encourages models to show their reasoning process step-by-step. This significantly improves performance on complex reasoning tasks.',

                // Embedding Evaluation
                'embeddings.evaluation.title': 'Evaluating Embeddings',
                'embeddings.evaluation.intro': 'Evaluating embedding quality is crucial for choosing the right model for your task. There are two main evaluation approaches: intrinsic and extrinsic.',
                'embeddings.evaluation.intrinsic.title': 'Intrinsic Evaluation',
                'embeddings.evaluation.intrinsic.description': 'Intrinsic evaluation tests embedding quality directly, without using them in a downstream task.',
                'embeddings.evaluation.intrinsic.similarity.title': 'Word Similarity Tasks',
                'embeddings.evaluation.intrinsic.similarity.description': 'Tests if embeddings capture semantic similarity. Examples: WordSim-353, SimLex-999. Measures correlation between embedding cosine similarity and human similarity ratings.',
                'embeddings.evaluation.intrinsic.analogy.title': 'Analogy Tasks',
                'embeddings.evaluation.intrinsic.analogy.description': 'Tests if embeddings capture linguistic relationships. Classic example: "king" - "man" + "woman" ≈ "queen". Measures if vector arithmetic reflects semantic relationships.',
                'embeddings.evaluation.intrinsic.analogy.formula.label': 'Analogy Test:',
                'embeddings.evaluation.extrinsic.title': 'Extrinsic Evaluation',
                'embeddings.evaluation.extrinsic.description': 'Extrinsic evaluation tests embedding quality by using them in downstream tasks and measuring task performance.',
                'embeddings.evaluation.extrinsic.tasks.title': 'Downstream Tasks',
                'embeddings.evaluation.extrinsic.tasks.classification': 'Text classification accuracy',
                'embeddings.evaluation.extrinsic.tasks.qa': 'Question answering performance',
                'embeddings.evaluation.extrinsic.tasks.retrieval': 'Information retrieval recall@k',
                'embeddings.evaluation.extrinsic.tasks.clustering': 'Clustering quality metrics',
                'embeddings.evaluation.metrics.title': 'Common Metrics',
                'embeddings.evaluation.metrics.table.metric': 'Metric',
                'embeddings.evaluation.metrics.table.description': 'Description',
                'embeddings.evaluation.metrics.table.use': 'Use Case',
                'embeddings.evaluation.metrics.cosine.name': 'Cosine Similarity',
                'embeddings.evaluation.metrics.cosine.description': 'Measures angle between vectors (0 to 1)',
                'embeddings.evaluation.metrics.cosine.use': 'Semantic similarity, retrieval',
                'embeddings.evaluation.metrics.euclidean.name': 'Euclidean Distance',
                'embeddings.evaluation.metrics.euclidean.description': 'Straight-line distance between vectors',
                'embeddings.evaluation.metrics.euclidean.use': 'Clustering, nearest neighbors',
                'embeddings.evaluation.metrics.recall.name': 'Recall@K',
                'embeddings.evaluation.metrics.recall.description': 'Fraction of relevant items in top K results',
                'embeddings.evaluation.metrics.recall.use': 'Retrieval quality',
                'embeddings.evaluation.metrics.map.name': 'Mean Average Precision (MAP)',
                'embeddings.evaluation.metrics.map.description': 'Average precision across all queries',
                'embeddings.evaluation.metrics.map.use': 'Ranking quality',

                // Hugging Face
                'hugging-face.title': 'Mastering Hugging Face for NLP and Beyond',
                'hugging-face.intro': 'Hugging Face provides a comprehensive ecosystem for working with transformers and other ML models. It offers pre-trained models, easy-to-use APIs, and deployment tools that make modern NLP accessible to everyone.',
                'hugging-face.beginner.what': 'What is Hugging Face? Think of Hugging Face as a library and marketplace for AI models. Instead of training models from scratch (which takes months and costs thousands), you can download pre-trained models that are ready to use or fine-tune.',
                'hugging-face.beginner.why': 'Why It Matters: Hugging Face democratizes AI by making state-of-the-art models accessible to everyone. You can use GPT-level models with just a few lines of code, fine-tune them for your specific needs, and deploy them easily.',
                'hugging-face.beginner.ecosystem': 'The Ecosystem: Hugging Face provides the Transformers library (Python code), Model Hub (repository of models), Spaces (deployment platform), and Datasets (data management).',
                'hugging-face.transformers.title': 'Transformers Library',
                'hugging-face.transformers.description': 'The Transformers library provides thousands of pre-trained models and easy-to-use APIs for NLP, computer vision, audio, and multimodal tasks.',
                'hugging-face.transformers.installation.title': 'Installation',
                'hugging-face.transformers.pipeline.title': 'Using Pipelines (Easiest Way)',
                'hugging-face.transformers.pipeline.description': 'Pipelines provide a simple API for common tasks:',
                'hugging-face.transformers.loading.title': 'Loading Models Directly',
                'hugging-face.hub.title': 'Model Hub',
                'hugging-face.hub.description': 'The Hugging Face Hub hosts over 500,000 pre-trained models. You can search, download, and share models easily.',
                'hugging-face.hub.features.title': 'Key Features',
                'hugging-face.hub.features.search': 'Search models by task, language, framework',
                'hugging-face.hub.features.download': 'Download models with one line of code',
                'hugging-face.hub.features.upload': 'Upload and share your own models',
                'hugging-face.hub.features.versioning': 'Model versioning and documentation',
                'hugging-face.hub.features.community': 'Community ratings and discussions',
                'hugging-face.hub.usage.title': 'Using Models from Hub',
                'hugging-face.finetuning.title': 'Fine-Tuning Large Language Models',
                'hugging-face.finetuning.description': 'Fine-tuning adapts pre-trained models to your specific task. The Transformers library makes this straightforward.',
                'hugging-face.finetuning.process.title': 'Fine-Tuning Process',
                'hugging-face.finetuning.lora.title': 'Parameter-Efficient Fine-Tuning (LoRA)',
                'hugging-face.finetuning.lora.description': 'LoRA allows fine-tuning with fewer parameters by adding small adapter layers. This is more efficient and requires less memory.',
                'hugging-face.deployment.title': 'Model Deployment and Sharing',
                'hugging-face.deployment.hub.title': 'Pushing to Hub',
                'hugging-face.deployment.hub.description': 'Share your fine-tuned models on the Hub:',
                'hugging-face.deployment.spaces.title': 'Hugging Face Spaces',
                'hugging-face.deployment.spaces.description': 'Spaces provide free hosting for ML demos and applications. You can deploy Gradio or Streamlit apps with one click.',
                'hugging-face.deployment.spaces.features.free': 'Free hosting for public demos',
                'hugging-face.deployment.spaces.features.gradio': 'Gradio integration for quick UIs',
                'hugging-face.deployment.spaces.features.streamlit': 'Streamlit support for custom apps',
                'hugging-face.deployment.spaces.features.sharing': 'Easy sharing and embedding',
                'hugging-face.multimedia.title': 'Multimedia Models',
                'hugging-face.multimedia.description': 'Hugging Face supports models beyond text, including images, audio, and video.',
                'hugging-face.multimedia.image.title': 'Image Models',
                'hugging-face.multimedia.image.classification': 'Image classification (ViT, ResNet)',
                'hugging-face.multimedia.image.generation': 'Image generation (Stable Diffusion)',
                'hugging-face.multimedia.image.segmentation': 'Object detection and segmentation',
                'hugging-face.multimedia.audio.title': 'Audio Models',
                'hugging-face.multimedia.audio.asr': 'Automatic speech recognition (Whisper)',
                'hugging-face.multimedia.audio.tts': 'Text-to-speech synthesis',
                'hugging-face.multimedia.audio.classification': 'Audio classification',
                'hugging-face.multimedia.video.title': 'Video Models',
                'hugging-face.multimedia.video.classification': 'Video classification',
                'hugging-face.multimedia.video.generation': 'Video generation',

                // Pre-training/Fine-tuning
                'pretraining.title': 'Pre-training vs Fine-tuning',
                'pretraining.intro': 'Pre-training learns general language patterns from large datasets, while fine-tuning adapts the model to specific tasks. This transfer learning approach has been key to modern NLP success.',
                'pretraining.beginner.analogy': 'Learning General Skills Then Specializing Analogy:',
                'pretraining.beginner.doctor': 'Imagine learning to be a doctor:',
                'pretraining.beginner.pretraining': 'Pre-training = Medical School: You learn general medical knowledge - anatomy, physiology, chemistry - from thousands of textbooks and cases. This gives you a broad foundation.',
                'pretraining.beginner.finetuning': 'Fine-tuning = Residency/Specialization: You then specialize in a specific area (like cardiology) with focused training on that domain. You adapt your general knowledge to the specific task.',
                'pretraining.beginner.similarly': 'Similarly, pre-training teaches the model general language understanding (grammar, semantics, world knowledge) from massive text datasets. Fine-tuning then adapts this general knowledge to specific tasks like sentiment analysis or question answering.',
                'pretraining.beginner.why': 'Why This Works: Most language understanding is shared across tasks. Learning general patterns once and reusing them is much more efficient than training from scratch for each task.',
                'pretraining.step.title': 'Step-by-Step: Pre-training and Fine-tuning Process',
                'pretraining.step.1.title': 'Pre-training: Large-Scale Learning',
                'pretraining.step.1.description': 'The model is trained on massive unlabeled text datasets (often billions of words from Wikipedia, books, web pages). The goal is to learn general language patterns, not any specific task.',
                'pretraining.step.1.example.title': 'Pre-training Data Examples',
                'pretraining.step.1.example.wikipedia': 'Wikipedia articles',
                'pretraining.step.1.example.books': 'Books (Project Gutenberg)',
                'pretraining.step.1.example.web': 'Web text (Common Crawl)',
                'pretraining.step.1.example.news': 'News articles',
                'pretraining.step.1.example.total': 'Total: Often 100+ GB of text, billions of tokens',
                'pretraining.step.2.title': 'Pre-training Objectives',
                'pretraining.step.2.description': 'Different models use different pre-training tasks:',
                'pretraining.step.2.bert.title': 'BERT: Masked Language Modeling (MLM)',
                'pretraining.step.2.bert.description': 'Randomly mask 15% of words, predict them from context. Example:',
                'pretraining.step.2.bert.formula.label': 'MLM Loss:',
                'pretraining.step.2.bert.formula.explanation': 'Predict masked tokens xᵢ given context x\\M (all tokens except masked ones)',
                'pretraining.step.2.gpt.title': 'GPT: Next Token Prediction',
                'pretraining.step.2.gpt.description': 'Predict the next word given all previous words. Example:',
                'pretraining.step.2.gpt.formula.label': 'Language Modeling Loss:',
                'pretraining.step.2.gpt.formula.explanation': 'Predict token xₜ given all previous tokens x<ₜ',
                'pretraining.step.3.title': 'Fine-tuning: Task-Specific Adaptation',
                'pretraining.step.3.description': 'The pre-trained model is then fine-tuned on a smaller, labeled dataset for a specific task. The model adapts its general knowledge to the specific requirements.',
                'pretraining.step.3.example.title': 'Fine-tuning Process',
                'pretraining.step.3.example.1': 'Start with pre-trained weights',
                'pretraining.step.3.example.2': 'Add task-specific layer (if needed)',
                'pretraining.step.3.example.3': 'Train on labeled task data',
                'pretraining.step.3.example.4': 'Use smaller learning rate (often 10-100x smaller)',
                'pretraining.step.3.example.5': 'Train for fewer epochs (1-10 vs 100+ for pre-training)',
                'pretraining.step.4.title': 'Transfer Learning Concept',
                'pretraining.step.4.description': 'Transfer learning is the key idea: knowledge learned in one context (general language) is transferred to another context (specific task). This works because:',
                'pretraining.step.4.lower': 'Lower layers learn general features (syntax, basic semantics)',
                'pretraining.step.4.higher': 'Higher layers learn task-specific features',
                'pretraining.step.4.adjusts': 'Fine-tuning adjusts higher layers while preserving general knowledge',
                'pretraining.step.4.formula.label': 'Transfer Learning Benefit:',
                'pretraining.step.4.formula.explanation': 'Fine-tuned models achieve much better performance with less data and training time',
                'pretraining.step.5.title': 'Result: Task-Optimized Model',
                'pretraining.step.5.description': 'After fine-tuning, the model has both general language understanding (from pre-training) and task-specific knowledge (from fine-tuning). This combination leads to superior performance.',
                'pretraining.step.5.example.title': 'Performance Comparison',
                'pretraining.step.5.example.description': 'On GLUE benchmark (language understanding tasks):',
                'pretraining.step.5.example.scratch': 'From scratch: ~60% accuracy, needs 1000s of examples',
                'pretraining.step.5.example.bert': 'Fine-tuned BERT: ~80% accuracy, needs 100s of examples',
                'pretraining.step.5.example.gpt3': 'GPT-3 (few-shot/zero-shot): ~90% accuracy with just a few examples or even zero examples through in-context learning (not fine-tuning)',
                'pretraining.technical.objectives.title': 'Pre-training Objectives',
                'pretraining.technical.objectives.mlm.title': 'Masked Language Modeling (BERT)',
                'pretraining.technical.objectives.mlm.description': 'During pre-training, 15% of tokens are randomly selected:',
                'pretraining.technical.objectives.mlm.mask': '80% replaced with [MASK] token',
                'pretraining.technical.objectives.mlm.random': '10% replaced with random token',
                'pretraining.technical.objectives.mlm.unchanged': '10% left unchanged',
                'pretraining.technical.objectives.mlm.result': 'The model must predict the original token. This teaches bidirectional understanding.',
                'pretraining.technical.objectives.gpt.title': 'Next Token Prediction (GPT)',
                'pretraining.technical.objectives.gpt.description': 'The model predicts the next token in a sequence, learning to generate coherent text. This teaches autoregressive generation and language modeling.',
                'pretraining.technical.strategies.title': 'Fine-tuning Strategies',
                'pretraining.technical.strategies.full.title': '1. Full Fine-tuning',
                'pretraining.technical.strategies.full.description': 'Update all model parameters. Most effective but computationally expensive.',
                'pretraining.technical.strategies.full.formula.label': 'Parameter Update:',
                'pretraining.technical.strategies.full.formula.explanation': 'All parameters θ are updated with task-specific loss L_task',
                'pretraining.technical.strategies.lora.title': '2. Parameter-Efficient Fine-tuning',
                'pretraining.technical.strategies.lora.description': 'LoRA (Low-Rank Adaptation): Adds small trainable matrices instead of updating all weights. Only ~1% of parameters are trained.',
                'pretraining.technical.strategies.lora.formula.label': 'LoRA Update:',
                'pretraining.technical.strategies.lora.formula.explanation': 'Only B and A matrices are trained, W remains frozen. Much more efficient!',
                'pretraining.technical.strategies.lr.title': '3. Learning Rate Scheduling',
                'pretraining.technical.strategies.lr.description': 'Use smaller learning rates for pre-trained layers (to preserve knowledge) and larger rates for new task-specific layers. Common: 1e-5 for pre-trained, 1e-3 for new layers.',
                'pretraining.technical.math.title': 'Transfer Learning Mathematics',
                'pretraining.technical.math.description': 'The success of transfer learning can be understood through the lens of representation learning:',
                'pretraining.technical.math.formula.label': 'Representation Learning:',
                'pretraining.technical.math.formula.explanation': 'Pre-training learns general representation Z. Fine-tuning learns task-specific mapping from Z to Y',
                'pretraining.components.title': 'Component Details',
                'pretraining.components.pretraining.title': 'Pre-training Datasets',
                'pretraining.components.pretraining.table.dataset': 'Dataset',
                'pretraining.components.pretraining.table.size': 'Size',
                'pretraining.components.pretraining.table.content': 'Content',
                'pretraining.components.pretraining.table.used': 'Used By',
                'pretraining.components.pretraining.wikipedia.name': 'Wikipedia',
                'pretraining.components.pretraining.wikipedia.size': '~3GB',
                'pretraining.components.pretraining.wikipedia.content': 'Encyclopedia articles',
                'pretraining.components.pretraining.wikipedia.used': 'BERT, GPT-2',
                'pretraining.components.pretraining.bookcorpus.name': 'BookCorpus',
                'pretraining.components.pretraining.bookcorpus.size': '~5GB',
                'pretraining.components.pretraining.bookcorpus.content': 'Novels and books',
                'pretraining.components.pretraining.bookcorpus.used': 'BERT, GPT-2',
                'pretraining.components.pretraining.commoncrawl.name': 'Common Crawl',
                'pretraining.components.pretraining.commoncrawl.size': '~750GB',
                'pretraining.components.pretraining.commoncrawl.content': 'Web pages',
                'pretraining.components.pretraining.commoncrawl.used': 'GPT-3, T5',
                'pretraining.components.pretraining.c4.name': 'C4',
                'pretraining.components.pretraining.c4.size': '~750GB',
                'pretraining.components.pretraining.c4.content': 'Cleaned web text',
                'pretraining.components.pretraining.c4.used': 'T5',
                'pretraining.components.finetuning.title': 'Fine-tuning Datasets',
                'pretraining.components.finetuning.glue.title': 'GLUE (General Language Understanding Evaluation)',
                'pretraining.components.finetuning.glue.description': 'Collection of 9 tasks: sentiment analysis, paraphrase detection, natural language inference, etc.',
                'pretraining.components.finetuning.superglue.title': 'SuperGLUE',
                'pretraining.components.finetuning.superglue.description': 'More challenging version of GLUE with harder tasks.',
                'pretraining.components.performance.title': 'Performance Comparison',
                'pretraining.components.performance.comparison.title': 'From Scratch vs Pre-trained + Fine-tuned',
                'pretraining.components.performance.comparison.data': 'Data needed: From scratch: 10,000+ examples | Fine-tuned: 100-1000 examples',
                'pretraining.components.performance.comparison.time': 'Training time: From scratch: Days/weeks | Fine-tuned: Hours',
                'pretraining.components.performance.comparison.performance': 'Performance: From scratch: 60-70% | Fine-tuned: 80-95%',
                'pretraining.components.performance.comparison.cost': 'Cost: From scratch: High | Fine-tuned: Low (reuse pre-trained model)',
                'pretraining.summary.pretraining.title': 'Pre-training Phase',
                'pretraining.summary.pretraining.objective': 'Objective: Learn general language representations',
                'pretraining.summary.pretraining.data': 'Data: Large unlabeled text corpora (Wikipedia, books, web text)',
                'pretraining.summary.pretraining.tasks': 'Tasks: Masked language modeling (BERT) or next-token prediction (GPT)',
                'pretraining.summary.pretraining.result': 'Result: General-purpose language understanding',
                'pretraining.summary.finetuning.title': 'Fine-tuning Phase',
                'pretraining.summary.finetuning.objective': 'Objective: Adapt to specific downstream tasks',
                'pretraining.summary.finetuning.data': 'Data: Smaller labeled task-specific datasets',
                'pretraining.summary.finetuning.tasks': 'Tasks: Classification, Q&A, summarization, etc.',
                'pretraining.summary.finetuning.result': 'Result: Task-optimized model performance',
                'pretraining.summary.benefits.title': 'Benefits',
                'pretraining.summary.benefits.efficiency': '• Efficiency: Reuse learned representations',
                'pretraining.summary.benefits.performance': '• Performance: Better results with less task-specific data',
                'pretraining.summary.benefits.scalability': '• Scalability: One pre-trained model for many tasks',

                // RAG
                'rag.intro.title': 'Retrieval Augmented Generation (RAG)',
                'rag.intro.intro': 'RAG combines the power of large language models with external knowledge retrieval, allowing models to access up-to-date information and domain-specific data that wasn\'t in their training set.',
                'rag.intro.beginner.analogy': '<strong>Library Analogy:</strong> Think of RAG like a research assistant:',
                'rag.intro.beginner.knowledge': 'Has a general knowledge base (the LLM\'s training)',
                'rag.intro.beginner.library': 'Can look up information in a library (vector database)',
                'rag.intro.beginner.retrieves': 'Retrieves relevant books/documents when you ask a question',
                'rag.intro.beginner.uses': 'Uses both their knowledge AND the retrieved documents to give you a complete answer',
                'rag.intro.beginner.concept': '<strong>Core RAG Concept:</strong>',
                'rag.intro.beginner.original': '<strong>Original:</strong> "My name is Paul"',
                'rag.intro.beginner.modification': '<strong>Modification:</strong> "Paul is my name"',
                'rag.intro.beginner.process': '<strong>RAG Process:</strong> Query → Retrieve Context → Augment → Generate Answer',

                'llm-problems.title': 'LLM Problems & Limitations',
                'llm-problems.intro': 'Understanding the limitations of Large Language Models helps explain why RAG is necessary. LLMs face several critical challenges that RAG addresses.',

                'rag-arch.title': 'RAG Architecture',
                'rag-arch.intro': 'RAG follows a two-phase architecture: Data Ingestion (offline) and Retrieval-Augmented Generation (online). Understanding this architecture is key to implementing effective RAG systems.',

                'data-ingestion.title': 'Data Ingestion Phase',
                'data-ingestion.intro': 'The data ingestion phase prepares external knowledge sources for efficient retrieval. This offline process transforms raw documents into searchable vector representations.',

                'vector-db.title': 'Vector Databases',
                'vector-db.intro': 'Vector databases are specialized databases designed to store and efficiently search high-dimensional vectors (embeddings). They enable fast similarity search, which is crucial for RAG retrieval.',

                'embeddings.title': 'Embeddings',
                'embeddings.intro': 'Embeddings convert text (or other data) into dense vector representations that capture semantic meaning. Different embedding algorithms serve different purposes in RAG systems.',

                'retrieval.title': 'Retrieval Mechanisms',
                'retrieval.intro': 'Retrieval is the process of finding relevant documents from the vector database given a query. Different retrieval strategies balance accuracy, speed, and computational cost.',

                'augmentation.title': 'Augmentation',
                'augmentation.intro': 'Augmentation combines the user query with retrieved documents to create a context-rich prompt for the LLM. Effective prompt construction is crucial for high-quality RAG outputs.',

                'generation-types.title': 'Extractive vs Abstractive Generation',
                'generation-types.intro': 'RAG systems can generate answers in two ways: extractive (copying exact text) or abstractive (synthesizing new text). Each approach has different strengths and use cases.',

                'memory-types.title': 'Parametric vs Non-Parametric Memory',
                'memory-types.intro': 'Understanding the difference between parametric and non-parametric memory helps explain how RAG extends LLM capabilities. Traditional LLMs use parametric memory, while RAG adds non-parametric memory.',
                'memory-types.beginner.types': '<strong>Two Types of Memory:</strong>',
                'memory-types.beginner.parametric': '<strong>Parametric Memory:</strong> Knowledge is stored in the model\'s weights. Like memorizing facts - once learned, it\'s part of the model (until retraining).',
                'memory-types.beginner.nonparametric': '<strong>Non-Parametric Memory:</strong> Knowledge is stored externally (like in a database). Like having a reference library - you can add new books without changing your brain.',
                'memory-types.beginner.combines': 'RAG combines both: the model\'s parametric memory (general knowledge) with non-parametric memory (external documents) to provide comprehensive answers.',
                'memory-types.technical.parametric.title': 'Parametric Memory',
                'memory-types.technical.parametric.how.title': 'How It Works',
                'memory-types.technical.parametric.how.description': 'Knowledge is encoded in the model\'s weights/parameters during training. For example, a pre-trained Seq2Seq model like BART (400M parameters) stores knowledge in its weights.',
                'memory-types.technical.parametric.formula.label': 'Parametric Knowledge:',
                'memory-types.technical.parametric.formula.explanation': 'Training Data → Model Parameters → NLP Tasks',
                'memory-types.technical.parametric.characteristics.title': '<strong>Characteristics:</strong>',
                'memory-types.technical.parametric.characteristics.fixed': 'Fixed at training time',
                'memory-types.technical.parametric.characteristics.retraining': 'Requires retraining to update',
                'memory-types.technical.parametric.characteristics.limited': 'Limited by model size',
                'memory-types.technical.parametric.characteristics.fast': 'Fast access (no external search)',
                'memory-types.technical.nonparametric.title': 'Non-Parametric Memory',
                'memory-types.technical.nonparametric.how.title': 'How It Works',
                'memory-types.technical.nonparametric.how.description': 'Knowledge is stored as dense vectors in external data sources (vector databases). Accessed through neural retrievers like DPR (Dense Passage Retrieval).',
                'memory-types.technical.nonparametric.formula.label': 'Non-Parametric Knowledge:',
                'memory-types.technical.nonparametric.formula.explanation': 'External Data Sources → Vector Index → Retrieved via Similarity Search',
                'memory-types.technical.nonparametric.characteristics.title': '<strong>Characteristics:</strong>',
                'memory-types.technical.nonparametric.characteristics.dynamic': 'Dynamic - can be updated without retraining',
                'memory-types.technical.nonparametric.characteristics.unlimited': 'Unlimited size (scales with storage)',
                'memory-types.technical.nonparametric.characteristics.retrieval': 'Requires retrieval step (slower)',
                'memory-types.technical.nonparametric.characteristics.latest': 'Can contain latest information',
                'memory-types.technical.comparison.title': 'Comparison',
                'memory-types.technical.comparison.table.feature': 'Feature',
                'memory-types.technical.comparison.table.parametric': 'Parametric Memory',
                'memory-types.technical.comparison.table.nonparametric': 'Non-Parametric Memory',
                'memory-types.technical.comparison.storage.name': 'Storage',
                'memory-types.technical.comparison.storage.parametric': 'Model weights',
                'memory-types.technical.comparison.storage.nonparametric': 'External vector database',
                'memory-types.technical.comparison.update.name': 'Update',
                'memory-types.technical.comparison.update.parametric': 'Requires retraining',
                'memory-types.technical.comparison.update.nonparametric': 'Add to database',
                'memory-types.technical.comparison.size.name': 'Size Limit',
                'memory-types.technical.comparison.size.parametric': 'Model capacity',
                'memory-types.technical.comparison.size.nonparametric': 'Storage capacity',
                'memory-types.technical.comparison.speed.name': 'Access Speed',
                'memory-types.technical.comparison.speed.parametric': 'Instant (inference)',
                'memory-types.technical.comparison.speed.nonparametric': 'Requires search',
                'memory-types.technical.comparison.example.name': 'Example',
                'memory-types.technical.comparison.example.parametric': 'BART 400M parameters',
                'memory-types.technical.comparison.example.nonparametric': 'Wikipedia indexed in vector DB',
                'memory-types.technical.hybrid.title': 'Hybrid Approach: RAG',
                'memory-types.technical.hybrid.description': 'RAG combines both memory types:',
                'memory-types.technical.hybrid.parametric': '<strong>Parametric:</strong> General language understanding, reasoning, generation capabilities',
                'memory-types.technical.hybrid.nonparametric': '<strong>Non-Parametric:</strong> Specific facts, up-to-date information, domain knowledge',
                'memory-types.technical.hybrid.best': 'This hybrid approach gives the best of both worlds: the model\'s learned capabilities plus access to external, updatable knowledge.',

                'rag-recipes.title': 'RAG Recipes',
                'rag-recipes.intro': 'Different RAG implementations use different strategies for how retrieved documents are used during generation. The two main recipes are RAG Sequence and RAG Token.',
            },
            tr: {
                // Navigation
                'nav.neural-networks': 'Sinir Ağları (Neural Networks)',
                'nav.cnn-rnn': 'CNN & RNN',
                'nav.generative-ai': 'Üretici Yapay Zeka (Generative AI)',
                'nav.ethics': 'Etik (Ethics)',
                'nav.attention': 'Dikkat Mekanizması (Attention)',
                'nav.transformer': 'Transformer',
                'nav.encoder-decoder': 'Kodlayıcı/Kod Çözücü (Encoder/Decoder)',
                'nav.pretraining-finetuning': 'Ön Eğitim/İnce Ayar (Pre-training/Fine-tuning)',
                'nav.foundation-models': 'Temel Modeller (Foundation Models)',
                'nav.hugging-face': 'Hugging Face',
                'nav.rag': 'RAG',
                'nav.llm-problems': 'LLM Sorunları (LLM Problems)',
                'nav.rag-arch': 'RAG Mimarisi (RAG Architecture)',
                'nav.data-ingestion': 'Veri Alımı (Data Ingestion)',
                'nav.vector-dbs': 'Vektör Veritabanları (Vector DBs)',
                'nav.embeddings': 'Gömme Vektörleri (Embeddings)',
                'nav.retrieval': 'Geri Getirme (Retrieval)',
                'nav.augmentation': 'Artırma (Augmentation)',
                'nav.generation-types': 'Üretim Türleri (Generation Types)',
                'nav.memory-types': 'Bellek Türleri (Memory Types)',
                'nav.rag-recipes': 'RAG Tarifleri (RAG Recipes)',

                // Hero
                'hero.title': 'ML/DL Temelleri',
                'hero.subtitle': 'Makine öğrenmesi (Machine Learning) ve derin öğrenmenin (Deep Learning) nasıl çalıştığını anlamak için interaktif görselleştirmeler',

                // Common UI
                'ui.beginner-explanation': 'Başlangıç Açıklaması',
                'ui.technical-deep-dive': 'Teknik Derinlemesine İnceleme',
                'ui.examples-use-cases': 'Örnekler ve Kullanım Alanları',
                'ui.previous': '← Önceki',
                'ui.next': 'Sonraki →',
                'ui.reset': 'Sıfırla',
                'ui.generate': 'Rastgele Dikkat Oluştur',
                'ui.run': 'İleri Geçişi Çalıştır',

                // Neural Networks
                'nn.title': 'Sinir Ağları (Neural Networks)',
                'nn.intro': 'Sinir ağları (Neural Networks), biyolojik sinir ağlarından ilham alan hesaplamalı modellerdir. Ağırlıklı bağlantılar (weighted connections) ve aktivasyon fonksiyonları (activation functions) aracılığıyla bilgiyi işleyen katmanlarda organize edilmiş birbirine bağlı düğümlerden (nöronlar/neurons) oluşurlar.',
                'nn.beginner.1': 'Sinir ağını beyniniz gibi düşünün! Beyninizin milyarlarca nöronu birbirine bağlı olduğu gibi, sinir ağının da katmanlarda bağlı yapay nöronları (artificial neurons/nodes) vardır.',
                'nn.beginner.2': 'Basit Benzetme: Fotoğraflarda kedileri tanımayı öğrendiğinizi hayal edin. Beyniniz bir kediyi bir anda tanımaz. Bunun yerine:',
                'nn.beginner.3': 'Önce temel özellikleri fark edersiniz: kenarlar (edges), şekiller (shapes), renkler (colors)',
                'nn.beginner.4': 'Sonra bunlar birleşerek desenler (patterns) oluşturur: gözler (eyes), kulaklar (ears), bıyıklar (whiskers)',
                'nn.beginner.5': 'Son olarak, tüm desenler birlikte size şunu söyler: "Bu bir kedi!"',
                'nn.beginner.6': 'Sinir ağı da benzer şekilde çalışır! Girdi katmanı (input layer) ham veriyi alır (örneğin bir görüntüden piksel değerleri). Her gizli katman (hidden layer), önceki katmandan gelen bilgileri birleştirerek giderek daha karmaşık desenleri tespit eder. Çıktı katmanı (output layer) nihai kararı verir (örneğin "kedi" veya "kedi değil").',
                'nn.beginner.7': 'Nöronlar arasındaki her bağlantının bir ağırlığı (weight) vardır - bunu bağlantının ne kadar önemli olduğu olarak düşünün. Eğitim (training) sırasında, ağ bu ağırlıkları ayarlayarak desenleri tanımada daha iyi hale gelir.',

                // Neural Networks Step Guide
                'nn.step.title': 'Adım Adım: Sinir Ağları Bilgiyi Nasıl İşler',
                'nn.step.1.title': 'Girdi Katmanı Veriyi Alır',
                'nn.step.1.description': 'Girdi katmanı (input layer), verinin ağa girdiği yerdir. Bu katmandaki her nöron, girdinizin bir özelliğini temsil eder. Örneğin, 28×28 piksel bir görüntü işliyorsanız, 784 girdi nöronunuz olur (28 × 28 = 784), her piksel için bir tane.',
                'nn.step.1.visual.1': 'Girdi: [x₁, x₂, x₃, ..., xₙ]',
                'nn.step.1.visual.2': 'Her xᵢ bir girdi özelliğini temsil eder',
                'nn.step.2.title': 'Ağırlıklı Bağlantılar Girdileri Çarpar',
                'nn.step.2.description': 'Nöronlar arasındaki her bağlantının bir ağırlığı (weight - w) vardır. Girdi değeri ağırlığıyla çarpılır. Daha güçlü ağırlıklar, o girdinin bir sonraki katman üzerinde daha fazla etkisi olduğu anlamına gelir.',
                'nn.step.2.formula.label': 'Ağırlıklı Girdi Hesaplaması:',
                'nn.step.2.description2': 'Ağırlıkları ses kontrolü gibi düşünün - her girdinin bir sonraki katmana ne kadar "yüksek sesle konuştuğunu" belirlerler.',
                'nn.step.3.title': 'Toplama ve Önyargı (Bias) Ekleme',
                'nn.step.3.description': 'Tüm ağırlıklı girdiler birlikte toplanır ve bir önyargı (bias) terimi eklenir. Önyargı, aktivasyon fonksiyonunu kaydırmaya yardımcı olur ve girdiler küçük olduğunda bile nöronun ateşlenmesine (fire) izin verir.',
                'nn.step.3.formula.label': 'Önyargı ile Toplam:',
                'nn.step.3.formula.explanation': 'Burada b önyargı (bias) terimidir. Bu toplam "aktivasyon öncesi" (pre-activation) değeri olarak adlandırılır.',
                'nn.step.4.title': 'Aktivasyon Fonksiyonu Uygulaması',
                'nn.step.4.description': 'Aktivasyon fonksiyonu (activation function), toplamı nöronun çıktısına dönüştürür. Bu, doğrusal olmayanlık (non-linearity) sağlar, bu çok önemlidir - olmadan, birden fazla katman tek bir katmana eşdeğer olurdu!',
                'nn.step.4.formula.label': 'Aktivasyon Fonksiyonu:',
                'nn.step.4.formula.explanation': 'Yaygın aktivasyon fonksiyonları: ReLU (max(0, x)), Sigmoid (1/(1+e⁻ˣ)), Tanh (tanh(x))',
                'nn.step.4.description2': 'Aktivasyon fonksiyonu, nöronun "ateşlenip ateşlenmeyeceğini" ve ne kadar güçlü ateşleneceğini belirler - biyolojik bir nöronun ya ateşlediği ya da ateşlemediği gibi.',
                'nn.step.5.title': 'Çıktı Üretimi',
                'nn.step.5.description': 'Aktive edilmiş çıktı, bir sonraki katmanın girdisi olur. Bu süreç, nihai tahmini üreten çıktı katmanına ulaşana kadar tüm gizli katmanlar (hidden layers) boyunca tekrarlanır.',
                'nn.step.5.formula.label': 'Tam İleri Geçiş Formülü:',
                'nn.step.5.formula.explanation': 'Bu, girdiden çıktıya kadar her nöronda, katman katman gerçekleşir.',
                'nn.step.5.description2': 'Çıktı katmanının (output layer) değerleri ağın tahminini temsil eder. Sınıflandırma (classification) için, bunlar her sınıf için olasılıklar olabilir (örneğin, "kedi" için 0.8, "köpek" için 0.2).',

                // Neural Networks Technical
                'nn.technical.formulation.title': 'Matematiksel Formülasyon',
                'nn.technical.formulation.formula.label': 'Tek Nöron Çıktısı:',
                'nn.technical.formulation.formula.explanation': 'Burada: xᵢ girdiler, wᵢ ağırlıklar, b önyargı (bias), f aktivasyon fonksiyonu (activation function)',
                'nn.technical.forward.title': 'İleri Yayılım Algoritması (Forward Propagation Algorithm)',
                'nn.technical.backprop.title': 'Geri Yayılım (Backpropagation) Genel Bakış',
                'nn.technical.backprop.description': 'Geri yayılım (backpropagation), sinir ağlarının nasıl öğrendiğidir. Çıktı katmanından girdi katmanına geriye doğru çalışarak, kayıp fonksiyonunun (loss function) her ağırlığa göre gradyanlarını (türevler/derivatives) hesaplar. Ağırlıklar daha sonra gradyan inişi (gradient descent) kullanılarak güncellenir:',
                'nn.technical.backprop.formula.label': 'Ağırlık Güncelleme Kuralı:',
                'nn.technical.backprop.formula.explanation': 'Burada α öğrenme oranıdır (learning rate) ve L kayıp fonksiyonudur (loss function)',
                'nn.technical.loss.title': 'Kayıp Fonksiyonları (Loss Functions)',
                'nn.technical.loss.mse.title': 'Ortalama Kare Hatası (Mean Squared Error - MSE) - regresyon için:',
                'nn.technical.loss.ce.title': 'Çapraz Entropi Kaybı (Cross-Entropy Loss) - sınıflandırma için:',
                'nn.technical.components.title': 'Bileşen Detayları',
                'nn.technical.components.weights': 'Ağırlıklar (Weights): Bağlantıların gücünü belirleyen öğrenilebilir parametreler. Rastgele başlatılır, ardından eğitim sırasında optimize edilir.',
                'nn.technical.components.biases': 'Önyargılar (Biases): Aktivasyon fonksiyonunu kaydıran, sıfır girdiyle bile nöronların ateşlenmesine izin veren ek öğrenilebilir parametreler.',
                'nn.technical.components.layer-types': 'Katman Türleri:',
                'nn.technical.components.dense': 'Yoğun/Tam Bağlı (Dense/Fully Connected): Her nöron bir sonraki katmandaki her nörona bağlanır',
                'nn.technical.components.conv': 'Evrişimli (Convolutional): Görüntüler için kullanılır, uzamsal desenleri (spatial patterns) tespit eder',
                'nn.technical.components.recurrent': 'Yinelemeli (Recurrent): Dizileri işler, önceki girdilerin belleğini (memory) korur',

                // Neural Networks Examples
                'nn.examples.image.title': 'Görüntü Sınıflandırma (Image Classification)',
                'nn.examples.image.description': 'Sinir ağları görüntülerdeki nesneleri tanımada mükemmeldir. Tipik bir mimari:',
                'nn.examples.image.input': 'Girdi: 224×224×3 görüntü (RGB pikselleri)',
                'nn.examples.image.hidden': 'Gizli katmanlar: Özellikleri çıkarır (kenarlar → şekiller → nesneler)',
                'nn.examples.image.output': 'Çıktı: 1000 nesne sınıfı için olasılıklar',
                'nn.examples.architectures.title': 'Yaygın Mimariler',
                'nn.examples.architectures.mlp': 'MLP (Çok Katmanlı Algılayıcı/Multi-Layer Perceptron): Tam bağlı katmanlara sahip temel ileri beslemeli ağ (basic feedforward network)',
                'nn.examples.architectures.cnn': 'CNN (Evrişimli Sinir Ağı/Convolutional Neural Network): Görüntüler için özelleşmiş, evrişimli katmanlar (convolutional layers) kullanır',
                'nn.examples.architectures.rnn': 'RNN (Yinelemeli Sinir Ağı/Recurrent Neural Network): Dizileri işler, gizli durumu (hidden state) korur',

                // Neural Networks Demo
                'nn.demo.layers': 'Katmanlar:',
                'nn.demo.neurons': 'Katman başına nöron:',
                'nn.demo.activation': 'Aktivasyon:',

                // Attention
                'attention.title': 'Dikkat Mekanizması (Attention Mechanism)',
                'attention.intro': 'Dikkat mekanizması (Attention Mechanism), modellerin tahmin yaparken girdinin ilgili kısımlarına odaklanmasını sağlar. Sorgular (queries) ve anahtarlar (keys) arasındaki uyumluluğa göre belirlenen ağırlıklarla değerlerin (values) ağırlıklı toplamını hesaplar.',
                'attention.beginner.1': 'Basit Benzetme: Bir cümle okurken, her kelimeye eşit dikkat göstermezsiniz. Beyniniz otomatik olarak anlamı anlamanıza yardımcı olan önemli kelimelere odaklanır.',
                'attention.beginner.2': 'Örneğin, "The cat sat on the mat" cümlesinde, "sat" kelimesini işlerken, beyniniz "the" (daha az önemli) kelimesinden daha çok "cat" (kim oturdu?) ve "mat" (nerede oturdu?) kelimelerine dikkat edebilir.',
                'attention.beginner.3': 'Yapay zekada dikkat (Attention) benzer şekilde çalışır: Model, bir tahmin yapmak için girdinin hangi kısımlarının en alakalı olduğunu öğrenir. Tüm girdileri eşit şekilde ele almak yerine, daha önemli kısımlara daha yüksek "dikkat ağırlıkları" (attention weights) atar.',
                'attention.beginner.4': 'Bunu sahnedeki bir spot ışığı gibi düşünün - dikkat aktörlerin (önemli bilgi) üzerinde daha parlak, arka planda (daha az alakalı bilgi) daha sönük parlar.',
                'attention.step.title': 'Adım Adım: Dikkat Nasıl Çalışır',
                'attention.step.1.title': 'Sorgu, Anahtar, Değer Vektörleri Oluştur',
                'attention.step.1.description': 'Her girdi token\'ı üç vektöre dönüştürülür:',
                'attention.step.1.query': 'Sorgu (Query - Q): "Ne arıyorum?" - ihtiyacımız olan bilgiyi temsil eder',
                'attention.step.1.key': 'Anahtar (Key - K): "Ne sunuyorum?" - her token\'ın sağladığı bilgiyi temsil eder',
                'attention.step.1.value': 'Değer (Value - V): "İçeriğim nedir?" - gerçek bilgi içeriği',
                'attention.step.1.visual.1': 'Girdi: "The cat sat"',
                'attention.step.1.visual.2': 'Her kelime → Q, K, V vektörleri',
                'attention.step.2.title': 'Dikkat Skorlarını Hesapla (Q·K^T)',
                'attention.step.2.description': 'Her sorgu için, sorgu ile tüm anahtarlar arasındaki nokta çarpımını (dot product) hesaplayarak her anahtarla ne kadar iyi eşleştiğini hesaplarız. Daha yüksek skorlar daha iyi eşleşme anlamına gelir.',
                'attention.step.2.formula.label': 'Dikkat Skoru Hesaplaması:',
                'attention.step.2.formula.explanation': 'Bu, her hücrenin (i,j) token i\'nin token j\'ye ne kadar dikkat etmesi gerektiğini temsil ettiği bir matris oluşturur',
                'attention.step.2.description2': 'Bunu şöyle düşünün: "Her kelime şu anda işlediğim şeyle ne kadar alakalı?"',
                'attention.step.3.title': 'Ölçekle ve Softmax Normalleştirmesi Uygula',
                'attention.step.3.description': 'Skorlar, aşırı değerleri önlemek için √dₖ (dₖ anahtarların boyutudur) ile bölünür, ardından skorları toplamı 1 olan olasılıklara dönüştürmek için softmax uygulanır.',
                'attention.step.3.formula.label': 'Ölçeklenmiş ve Normalleştirilmiş:',
                'attention.step.3.formula.explanation': 'Ölçekleme faktörü √dₖ, derin ağlarda gradyanların çok küçük hale gelmesini önler',
                'attention.step.3.description2': 'Softmax\'tan sonra, her satır 1.0\'a toplanır - bunlar, her token\'ın diğer tüm token\'lara ne kadar dikkat etmesi gerektiğini gösteren dikkat ağırlıklarıdır (attention weights).',
                'attention.step.4.title': 'Değerlerin Ağırlıklı Toplamı',
                'attention.step.4.description': 'Dikkat ağırlıklarını Değer (Value) vektörleriyle çarpın ve toplayın. Bu, önemli token\'ların nihai çıktıya daha fazla katkıda bulunduğu ağırlıklı bir kombinasyon oluşturur.',
                'attention.step.4.formula.label': 'Nihai Dikkat Çıktısı:',
                'attention.step.4.description2': 'Sonuç, tüm token\'lardan gelen bilgileri, alakalarına göre ağırlıklandırılmış olarak birleştiren yeni bir temsildir.',
                'attention.step.5.title': 'Dikkat Çıktısı Üret',
                'attention.step.5.description': 'Ağırlıklı toplam, o konum için dikkat çıktısı olur. Bu çıktı tüm girdi token\'larından bilgi içerir, ancak en alakalı olanları vurgular.',
                'attention.step.5.example.title': 'Örnek: "The cat sat on the mat"',
                'attention.step.5.example.description': '"sat" kelimesini işlerken, model şunlara dikkat edebilir:',
                'attention.step.5.example.cat': '"cat" kelimesine yüksek dikkat (0.4) - eylemi kim gerçekleştirdi',
                'attention.step.5.example.mat': '"mat" kelimesine yüksek dikkat (0.3) - eylem nerede gerçekleşti',
                'attention.step.5.example.the': '"the" kelimesine düşük dikkat (0.05) - daha az bilgilendirici',
                'attention.technical.scaled.title': 'Ölçeklenmiş Nokta Çarpımı Dikkati (Scaled Dot-Product Attention)',
                'attention.technical.scaled.formula.label': 'Tam Dikkat Formülü:',
                'attention.technical.scaled.formula.explanation': 'Burada dₖ anahtar vektörlerinin boyutudur. Ölçekleme, nokta çarpımlarının çok büyümesini önler, bu da softmax\'ı son derece küçük gradyanlara sahip bölgelere iter.',
                'attention.technical.multihead.title': 'Çok Başlı Dikkat (Multi-Head Attention)',
                'attention.technical.multihead.description': 'Dikkati bir kez hesaplamak yerine, çok başlı dikkat (multi-head attention) paralel olarak birden fazla dikkat mekanizması çalıştırır ("başlar" olarak adlandırılır), her biri farklı öğrenilmiş projeksiyonlara sahiptir. Bu, modelin farklı temsil alt uzaylarından bilgilere dikkat etmesine olanak tanır.',
                'attention.technical.multihead.formula.label': 'Çok Başlı Dikkat:',
                'attention.technical.types.title': 'Öz-Dikkat vs Çapraz Dikkat (Self-Attention vs Cross-Attention)',
                'attention.technical.types.table.type': 'Tür',
                'attention.technical.types.table.query': 'Sorgu Kaynağı',
                'attention.technical.types.table.keyvalue': 'Anahtar/Değer Kaynağı',
                'attention.technical.types.table.usecase': 'Kullanım Durumu',
                'attention.technical.types.self.name': 'Öz-Dikkat (Self-Attention)',
                'attention.technical.types.self.query': 'Aynı dizi',
                'attention.technical.types.self.keyvalue': 'Aynı dizi',
                'attention.technical.types.self.usecase': 'Bir dizi içindeki ilişkileri anlama',
                'attention.technical.types.cross.name': 'Çapraz Dikkat (Cross-Attention)',
                'attention.technical.types.cross.query': 'Hedef dizi',
                'attention.technical.types.cross.keyvalue': 'Kaynak dizi',
                'attention.technical.types.cross.usecase': 'İki farklı diziyi ilişkilendirme (örneğin, çeviri)',
                'attention.technical.why.title': 'Dikkat Neden Çalışır',
                'attention.technical.why.longrange': 'Uzun menzilli bağımlılıklar (Long-range dependencies): Uzak token\'ları doğrudan bağlayabilir',
                'attention.technical.why.interpretability': 'Yorumlanabilirlik (Interpretability): Dikkat ağırlıkları modelin neye odaklandığını gösterir',
                'attention.technical.why.parallelization': 'Paralelleştirme (Parallelization): Tüm dikkat hesaplamaları aynı anda gerçekleşebilir',
                'attention.technical.why.flexibility': 'Esneklik (Flexibility): Mimari değişiklikleri olmadan farklı girdi uzunluklarına uyum sağlar',
                'attention.examples.translation.title': 'Gerçek Dünya Örneği: Makine Çevirisi (Machine Translation)',
                'attention.examples.translation.description': '"The cat sat on the mat" cümlesini Fransızca\'ya çevirirken:',
                'attention.examples.translation.chat': '"chat" (kedi) kelimesini üretirken, dikkat İngilizce\'deki "cat" kelimesine odaklanır',
                'attention.examples.translation.tapis': '"tapis" (mat) kelimesini üretirken, dikkat İngilizce\'deki "mat" kelimesine odaklanır',
                'attention.examples.translation.alignment': 'Dikkat ağırlıkları kaynak ve hedef kelimeler arasındaki hizalamayı gösterir',
                'attention.examples.code.title': 'Kod Örneği: Dikkat Uygulaması',

                // Transformer
                'transformer.title': 'Transformer Mimarisi',
                'transformer.intro': 'Transformer\'lar, tekrarlama (recurrence) yerine öz-dikkat (self-attention) mekanizmalarını kullanarak NLP\'yi devrim niteliğinde değiştirdi. Her biri birden fazla dikkat (attention) ve ileri besleme ağı (feed-forward network) katmanı içeren kodlayıcı (encoder) ve kod çözücü (decoder) yığınlarından oluşurlar.',
                'transformer.beginner.1': 'Montaj Hattı Benzetmesi: Transformer\'ı iki ana bölümü olan bir fabrika montaj hattı gibi düşünün:',
                'transformer.beginner.encoder': 'Kodlayıcı (Encoder - Okuyucu): Girdi metnini işler ve anlar, anlamının zengin bir temsilini oluşturur',
                'transformer.beginner.decoder': 'Kod Çözücü (Decoder - Yazıcı): Kodlayıcının anlayışını kullanarak çıktı metnini kelime kelime üretir',
                'transformer.beginner.2': 'Kelimeleri birer birer işleyen (soldan sağa okuma gibi) eski modellerden farklı olarak, transformer\'lar TÜM kelimelere aynı anda bakabilir. Tüm cümleyi bir anda görebilen gözler gibi, tüm kelimelerin birbirleriyle nasıl ilişkili olduğunu anlar.',
                'transformer.beginner.3': 'Ana Yenilik: Transformer, yavaş olan sıralı işlemeyi (sequential processing) hızlı olan paralel işlemeyle (parallel processing) değiştirdi, ancak konumsal kodlama (positional encoding) aracılığıyla kelime sırasını ve ilişkileri anlamaya devam ediyor.',
                'transformer.step.title': 'Adım Adım: Transformer İşleme',
                'transformer.step.1.title': 'Girdi Tokenizasyonu ve Gömme (Input Tokenization and Embedding)',
                'transformer.step.1.description': 'Metin token\'lara (kelimeler veya alt kelimeler) bölünür ve her token, gömme (embedding) adı verilen yoğun bir vektör temsiline dönüştürülür. Bu gömme vektörleri anlamsal anlamı yakalar - benzer kelimeler benzer gömme vektörlerine sahiptir.',
                'transformer.step.1.visual.1': '"Hello world" → [embedding₁, embedding₂]',
                'transformer.step.1.visual.2': 'Her token, sayılardan oluşan bir vektör haline gelir (tipik olarak 512 boyut)',
                'transformer.step.2.title': 'Konumsal Kodlama Ekle (Add Positional Encoding)',
                'transformer.step.2.description': 'Transformer\'lar tüm token\'ları paralel olarak işlediği için (RNN\'lerden farklı olarak), kelime sırasını bilmek için bir yola ihtiyaçları vardır. Konumsal kodlama (positional encoding), dizideki her token\'ın konumu hakkında bilgi ekler.',
                'transformer.step.2.formula.label': 'Konumsal Kodlama Formülü:',
                'transformer.step.2.formula.explanation': 'Modelin öğrenip kullanabileceği konum bilgisini kodlamak için sinüzoidal fonksiyonlar kullanır',
                'transformer.step.3.title': 'Kodlayıcı Yığını İşleme (Encoder Stack Processing)',
                'transformer.step.3.description': 'Kodlayıcı (encoder) 6 özdeş katmandan oluşur (orijinal transformer\'da). Her katman şunlara sahiptir:',
                'transformer.step.3.attention': 'Çok başlı öz-dikkat (Multi-head self-attention): Her token girdideki tüm token\'lara dikkat eder',
                'transformer.step.3.ffn': 'İleri besleme ağı (Feed-forward network): Her token\'ı bağımsız olarak işler',
                'transformer.step.3.norm': 'Katman normalleştirme (Layer normalization): Eğitimi stabilize eder',
                'transformer.step.3.residual': 'Artık bağlantılar (Residual connections): Gradyanların derin ağlarda akmasına yardımcı olur',
                'transformer.step.3.description2': 'Bilgi tüm 6 katmandan akar, her katman temsili iyileştirir.',
                'transformer.step.4.title': 'Kod Çözücü Kodlayıcı Çıktısını Alır',
                'transformer.step.4.description': 'Kod çözücü (decoder), çapraz dikkat (cross-attention) aracılığıyla kodlayıcının nihai temsilini kullanır. Bu, kod çözücünün çıktı üretirken girdiye "bakmasına" olanak tanır. Kod çözücü ayrıca gelecekteki token\'lara bakmayı önlemek için maskelenmiş öz-dikkat (masked self-attention) kullanır (çünkü soldan sağa üretir).',
                'transformer.step.4.example.title': 'Çapraz Dikkat Akışı (Cross-Attention Flow)',
                'transformer.step.4.example.description': 'Kodlayıcı çıktısı → Kod çözücü çapraz dikkat → Kod çözücünün ne üreteceğini anlamasına yardımcı olur',
                'transformer.step.5.title': 'Kod Çözücü Çıktı Token\'ları Üretir',
                'transformer.step.5.description': 'Kod çözücü çıktı token\'larını birer birer (otoregresif olarak) üretir. Her adımda şunları kullanır:',
                'transformer.step.5.previous': 'Önceden üretilen token\'lar (maskelenmiş öz-dikkat aracılığıyla)',
                'transformer.step.5.encoder': 'Kodlayıcı temsili (çapraz dikkat aracılığıyla)',
                'transformer.step.5.ffn': 'İleri besleme işleme',
                'transformer.step.5.description2': 'Son katman, kelime dağarcığı üzerinde olasılıklar çıktılar ve en yüksek olasılığa sahip token bir sonraki çıktı token\'ı olarak seçilir.',
                'transformer.technical.encoder.title': 'Kodlayıcı Katman Bileşenleri',
                'transformer.technical.encoder.attention.title': '1. Çok Başlı Öz-Dikkat (Multi-Head Self-Attention)',
                'transformer.technical.encoder.attention.description': 'Her konumun girdi dizisindeki tüm konumlara dikkat etmesine olanak tanır. Birden fazla baş, farklı türde ilişkilere dikkat etmeye olanak tanır.',
                'transformer.technical.encoder.ffn.title': '2. İleri Besleme Ağı (Feed-Forward Network - FFN)',
                'transformer.technical.encoder.ffn.formula.label': 'FFN Formülü:',
                'transformer.technical.encoder.ffn.formula.explanation': 'ReLU aktivasyonlu iki doğrusal dönüşüm. Her konuma bağımsız olarak uygulanır.',
                'transformer.technical.encoder.norm.title': '3. Katman Normalleştirme (Layer Normalization)',
                'transformer.technical.encoder.norm.formula.label': 'LayerNorm Formülü:',
                'transformer.technical.encoder.norm.formula.explanation': 'Özellikler arasında normalleştirir (batch değil). μ ve σ, x\'in ortalaması ve standart sapmasıdır. γ ve β öğrenilebilir parametrelerdir.',
                'transformer.technical.encoder.residual.title': '4. Artık Bağlantılar (Residual Connections)',
                'transformer.technical.encoder.residual.description': 'Her alt katmanın bir artık bağlantısı vardır: çıktı = LayerNorm(x + Sublayer(x)). Bu, gradyanların derin ağlarda akmasına yardımcı olur ve çok derin modellerin eğitilmesini mümkün kılar.',
                'transformer.technical.decoder.title': 'Kod Çözücü Katman Bileşenleri',
                'transformer.technical.decoder.intro': 'Kod çözücü katmanları üç alt katmana sahiptir (kodlayıcının ikisi yerine):',
                'transformer.technical.decoder.masked': 'Maskelenmiş Çok Başlı Öz-Dikkat (Masked Multi-Head Self-Attention): Yalnızca önceki konumlara dikkat edebilir (maske gelecekteki token\'ları görmeyi önler)',
                'transformer.technical.decoder.cross': 'Çok Başlı Çapraz Dikkat (Multi-Head Cross-Attention): Kodlayıcı çıktısına dikkat eder (kodlayıcı ve kod çözücüyü bağlar)',
                'transformer.technical.decoder.ffn': 'İleri Besleme Ağı (Feed-Forward Network): Kodlayıcı ile aynı',
                'transformer.technical.positional.title': 'Konumsal Kodlama Detayları',
                'transformer.technical.positional.description': 'Konumsal kodlama, eğitim sırasında görülenlerden daha uzun dizi uzunluklarına ekstrapole edebildikleri için sinüzoidal fonksiyonlar kullanır. Boyutlar arttıkça frekanslar azalır, her konum için benzersiz bir desen oluşturur.',
                'transformer.technical.comparison.title': 'Transformer vs RNN',
                'transformer.technical.comparison.table.feature': 'Özellik',
                'transformer.technical.comparison.table.rnn': 'RNN',
                'transformer.technical.comparison.table.transformer': 'Transformer',
                'transformer.technical.comparison.processing.name': 'İşleme',
                'transformer.technical.comparison.processing.rnn': 'Sıralı (bir seferde bir token)',
                'transformer.technical.comparison.processing.transformer': 'Paralel (tüm token\'lar aynı anda)',
                'transformer.technical.comparison.dependencies.name': 'Uzun menzilli bağımlılıklar',
                'transformer.technical.comparison.dependencies.rnn': 'Zor (gradyan kaybolması)',
                'transformer.technical.comparison.dependencies.transformer': 'Kolay (doğrudan dikkat)',
                'transformer.technical.comparison.speed.name': 'Eğitim hızı',
                'transformer.technical.comparison.speed.rnn': 'Yavaş (sıralı)',
                'transformer.technical.comparison.speed.transformer': 'Hızlı (paralelleştirilebilir)',
                'transformer.technical.comparison.memory.name': 'Bellek',
                'transformer.technical.comparison.memory.rnn': 'O(n) sıralı',
                'transformer.technical.comparison.memory.transformer': 'O(n²) dikkat matrisi',
                'transformer.examples.variants.title': 'Transformer Varyantları',
                'transformer.examples.variants.bert': 'BERT: Yalnızca kodlayıcı (encoder-only), çift yönlü (bidirectional), anlama görevleri için harika',
                'transformer.examples.variants.gpt': 'GPT: Yalnızca kod çözücü (decoder-only), otoregresif (autoregressive), üretim görevleri için harika',
                'transformer.examples.variants.t5': 'T5: Kodlayıcı-kod çözücü (encoder-decoder), hem anlama hem de üretim için iyi',

                // Encoder/Decoder
                'encoder-decoder.title': 'Kodlayıcı vs Kod Çözücü (Encoder vs Decoder)',
                'encoder-decoder.intro': 'Kodlayıcı (Encoder) ve kod çözücü (decoder) mimarileri arasındaki farkları anlamak, dizi-dizi (sequence-to-sequence) modelleri ve transformer\'larla çalışmak için çok önemlidir.',
                'encoder-decoder.beginner.analogy': 'Okuyucu vs Yazıcı Benzetmesi:',
                'encoder-decoder.beginner.encoder': 'Kodlayıcı = Okuyucu: Girdi metnini okur ve anlar. Bir kitabı okuyup anlamını anlamak gibi, kodlayıcı girdiyi işler ve anlamının zengin bir temsilini oluşturur.',
                'encoder-decoder.beginner.decoder': 'Kod Çözücü = Yazıcı: Anlayışa dayalı olarak çıktı metnini yazar. Bir özet veya çeviri yazmak gibi, kod çözücü kodlayıcının anlayışını kullanarak çıktıyı kelime kelime üretir.',
                'encoder-decoder.beginner.difference': 'Anahtar Fark: Kodlayıcı tüm girdiye bir anda bakabilir (çift yönlü/bidirectional), kod çözücü ise çıktıyı sıralı olarak, bir seferde bir kelime (otoregresif/autoregressive) üretir ve yalnızca önceden üretilen kelimelere bakabilir.',
                'encoder-decoder.comparison.title': 'Detaylı Karşılaştırma',
                'encoder-decoder.comparison.table.feature': 'Özellik',
                'encoder-decoder.comparison.table.encoder': 'Kodlayıcı',
                'encoder-decoder.comparison.table.decoder': 'Kod Çözücü',
                'encoder-decoder.comparison.purpose.name': 'Amaç',
                'encoder-decoder.comparison.purpose.encoder': 'Girdi dizilerini işler ve anlar',
                'encoder-decoder.comparison.purpose.decoder': 'Çıktı dizilerini üretir',
                'encoder-decoder.comparison.attention.name': 'Dikkat Türleri',
                'encoder-decoder.comparison.attention.encoder': 'Yalnızca öz-dikkat (çift yönlü)',
                'encoder-decoder.comparison.attention.decoder': 'Maskelenmiş öz-dikkat + Çapraz dikkat',
                'encoder-decoder.comparison.flow.name': 'Veri Akışı',
                'encoder-decoder.comparison.flow.encoder': 'Girdi → Kodlayıcı → Temsil',
                'encoder-decoder.comparison.flow.decoder': 'Kodlayıcı çıktısı → Kod çözücü → Üretilen token\'lar',
                'encoder-decoder.comparison.processing.name': 'İşleme',
                'encoder-decoder.comparison.processing.encoder': 'Paralel (tüm token\'lar aynı anda)',
                'encoder-decoder.comparison.processing.decoder': 'Sıralı (bir seferde bir token)',
                'encoder-decoder.comparison.context.name': 'Bağlam',
                'encoder-decoder.comparison.context.encoder': 'Çift yönlü (geçmiş ve geleceği görür)',
                'encoder-decoder.comparison.context.decoder': 'Nedensel (yalnızca geçmiş token\'ları görür)',
                'encoder-decoder.comparison.training.name': 'Eğitim Hedefi',
                'encoder-decoder.comparison.training.encoder': 'Maskelenmiş dil modelleme, sınıflandırma',
                'encoder-decoder.comparison.training.decoder': 'Sonraki token tahmini, üretim',
                'encoder-decoder.comparison.usecases.name': 'Kullanım Durumları',
                'encoder-decoder.comparison.usecases.encoder': 'BERT, sınıflandırma, özellik çıkarımı, Soru-Cevap',
                'encoder-decoder.comparison.usecases.decoder': 'GPT, metin üretimi, çeviri, özetleme',
                'encoder-decoder.comparison.arch.title': 'Mimari Farklılıklar',
                'encoder-decoder.comparison.arch.encoder.title': 'Kodlayıcı Mimarisi',
                'encoder-decoder.comparison.arch.decoder.title': 'Kod Çözücü Mimarisi',
                'encoder-decoder.technical.encoder.title': 'Kodlayıcı: Çift Yönlü İşleme (Bidirectional Processing)',
                'encoder-decoder.technical.encoder.description': 'Kodlayıcı öz-dikkat (self-attention) kullanır, yani her token girdi dizisindeki TÜM token\'lara, kendisinden sonra gelenler dahil dikkat edebilir. Bu çift yönlü bağlam (bidirectional context) anlama görevleri için çok önemlidir.',
                'encoder-decoder.technical.encoder.formula.label': 'Kodlayıcı Öz-Dikkat:',
                'encoder-decoder.technical.encoder.formula.explanation': 'Q, K, V\'nin hepsi aynı girdi dizisinden gelir, tam çift yönlü anlayışa olanak tanır',
                'encoder-decoder.technical.decoder.title': 'Kod Çözücü: Otoregresif Üretim (Autoregressive Generation)',
                'encoder-decoder.technical.decoder.description': 'Kod çözücü, gelecekteki token\'lara bakmayı önlemek için maskelenmiş öz-dikkat (masked self-attention) kullanır (çünkü üretim sırasında henüz mevcut değiller) ve kodlayıcının çıktısına dikkat etmek için çapraz dikkat (cross-attention) kullanır.',
                'encoder-decoder.technical.decoder.masked.formula.label': 'Kod Çözücü Maskelenmiş Öz-Dikkat:',
                'encoder-decoder.technical.decoder.masked.formula.explanation': 'M, gelecekteki konumları -∞\'a ayarlayan bir maske matrisidir (softmax\'tan sonra 0 olur)',
                'encoder-decoder.technical.decoder.cross.formula.label': 'Kod Çözücü Çapraz Dikkat:',
                'encoder-decoder.technical.decoder.cross.formula.explanation': 'Sorgu kod çözücüden, Anahtar/Değer kodlayıcıdan gelir - iki bileşeni bağlar',
                'encoder-decoder.technical.math.title': 'Matematiksel Farklılıklar',
                'encoder-decoder.technical.math.description': 'Anahtar matematiksel fark dikkat hesaplamasındadır:',
                'encoder-decoder.technical.math.encoder': 'Kodlayıcı: Tüm-tüm dikkat (maskeleme yok)',
                'encoder-decoder.technical.math.decoder-self': 'Kod çözücü öz-dikkat: Nedensel maskeleme (geleceği göremez)',
                'encoder-decoder.technical.math.decoder-cross': 'Kod çözücü çapraz dikkat: Kod çözücü sorguları kodlayıcı anahtarlarına/değerlerine dikkat eder',
                'encoder-decoder.examples.bert.title': 'BERT (Yalnızca Kodlayıcı)',
                'encoder-decoder.examples.bert.arch': 'Mimari: Yalnızca kodlayıcı katmanları yığını',
                'encoder-decoder.examples.bert.pretraining': 'Ön eğitim: Maskelenmiş Dil Modelleme (MLM) - maskelenmiş kelimeleri tahmin eder',
                'encoder-decoder.examples.bert.usecases': 'Kullanım Durumları: Metin sınıflandırma, adlandırılmış varlık tanıma, soru cevaplama',
                'encoder-decoder.examples.bert.why': 'Neden yalnızca kodlayıcı: Anlamı anlamak için çift yönlü bağlama ihtiyaç duyar',
                'encoder-decoder.examples.gpt.title': 'GPT (Yalnızca Kod Çözücü)',
                'encoder-decoder.examples.gpt.arch': 'Mimari: Kod çözücü katmanları yığını (kodlayıcıya çapraz dikkat olmadan)',
                'encoder-decoder.examples.gpt.pretraining': 'Ön eğitim: Sonraki Token Tahmini - önceki kelimelere göre sonraki kelimeyi tahmin eder',
                'encoder-decoder.examples.gpt.usecases': 'Kullanım Durumları: Metin üretimi, tamamlama, yaratıcı yazma',
                'encoder-decoder.examples.gpt.why': 'Neden yalnızca kod çözücü: Otoregresif üretim nedensel (soldan sağa) işleme gerektirir',
                'encoder-decoder.examples.t5.title': 'T5 (Kodlayıcı-Kod Çözücü)',
                'encoder-decoder.examples.t5.arch': 'Mimari: Hem kodlayıcı hem de kod çözücü yığınlarına sahip tam transformer',
                'encoder-decoder.examples.t5.pretraining': 'Ön eğitim: Metin-metin transferi - tüm görevleri metin üretimine dönüştürür',
                'encoder-decoder.examples.t5.usecases': 'Kullanım Durumları: Çeviri, özetleme, soru cevaplama, metin sınıflandırma',
                'encoder-decoder.examples.t5.why': 'Neden ikisi de: Kodlayıcı girdiyi anlar, kod çözücü yapılandırılmış çıktı üretir',
                'encoder-decoder.summary.encoder.title': 'Kodlayıcı',
                'encoder-decoder.summary.encoder.purpose': 'Amaç: Girdi dizilerini işler ve zengin temsiller oluşturur',
                'encoder-decoder.summary.encoder.arch': 'Mimari: Öz-dikkat + İleri besleme ağları',
                'encoder-decoder.summary.encoder.usecases': 'Kullanım Durumları: BERT, sınıflandırma, özellik çıkarımı',
                'encoder-decoder.summary.encoder.feature': 'Anahtar Özellik: Çift yönlü bağlam anlayışı',
                'encoder-decoder.summary.decoder.title': 'Kod Çözücü',
                'encoder-decoder.summary.decoder.purpose': 'Amaç: Kodlanmış temsillerden çıktı dizileri üretir',
                'encoder-decoder.summary.decoder.arch': 'Mimari: Maskelenmiş öz-dikkat + Çapraz dikkat + İleri besleme',
                'encoder-decoder.summary.decoder.usecases': 'Kullanım Durumları: GPT, metin üretimi, çeviri',
                'encoder-decoder.summary.decoder.feature': 'Anahtar Özellik: Otoregresif üretim (autoregressive generation)',

                // CNN & RNN
                'cnn-rnn.title': 'CNN & RNN Mimarileri',
                'cnn-rnn.intro': 'Farklı sinir ağı mimarileri farklı veri türleri için tasarlanmıştır. Evrişimli Sinir Ağları (CNN\'ler) görüntü işlemede mükemmeldir, Yinelemeli Sinir Ağları (RNN\'ler) ise metin ve zaman serileri gibi sıralı veriler için tasarlanmıştır.',
                'cnn-rnn.beginner.cnn': 'CNN Benzetmesi: CNN\'i bir görüntüyü tarayan bir büyüteç gibi düşünün. Küçük parçalara (kenarlar, köşeler gibi) bakar ve kademeli olarak daha büyük desenleri (yüzler, nesneler gibi) tanımak için oluşturur. CNN\'ler görüntüler için mükemmeldir çünkü nerede görünürse görünsün uzamsal desenleri tespit edebilirler.',
                'cnn-rnn.beginner.rnn': 'RNN Benzetmesi: RNN\'i bir kitap okumak gibi düşünün - önceki sayfalarda okuduklarınızı hatırlayarak mevcut sayfayı anlarsınız. RNN\'ler dizileri (cümleler gibi) bir seferde bir öğe işler, önceki bilgilerin "hafızasını" korur. Bu onları metin, konuşma ve zaman serisi verileri için harika yapar.',
                'cnn-rnn.beginner.difference': 'Anahtar Fark: CNN\'ler uzamsal verileri (görüntüler) paralel olarak işler, RNN\'ler ise zamansal/sıralı verileri (metin) sıralı olarak işler, gizli durumu korur.',
                'cnn-rnn.technical.cnn.title': 'Evrişimli Sinir Ağları (CNN)',
                'cnn-rnn.technical.cnn.description': 'CNN\'ler yerel desenleri tespit etmek için filtreler (çekirdekler) uygulayan evrişimli katmanlar kullanır. Bu filtreler girdi üzerinde kayar, kenarlar, dokular ve şekiller gibi özellikleri tespit eder.',
                'cnn-rnn.technical.cnn.formula.label': 'Evrişim İşlemi:',
                'cnn-rnn.technical.cnn.formula.explanation': 'Burada f girdi özellik haritası ve g filtredir/çekirdektir. Bu işlem yerel desenleri tespit eder.',
                'cnn-rnn.technical.cnn.components': 'Anahtar Bileşenler: Evrişimli katmanlar (özellik tespiti), Havuzlama katmanları (alt örnekleme), Tam bağlı katmanlar (sınıflandırma).',
                'cnn-rnn.technical.rnn.title': 'Yinelemeli Sinir Ağları (RNN)',
                'cnn-rnn.technical.rnn.description': 'RNN\'ler önceki zaman adımlarından bilgi taşıyan bir gizli durum koruyarak dizileri işler. Her adımda, mevcut girdiyi önceki gizli durumla birleştirirler.',
                'cnn-rnn.technical.rnn.formula.label': 'RNN Gizli Durum Güncellemesi:',
                'cnn-rnn.technical.rnn.formula.explanation': 'Burada h_t t zamanındaki gizli durum, x_t girdidir ve W_h, W_x ağırlık matrisleridir. Gizli durum hafıza görevi görür.',
                'cnn-rnn.technical.rnn.problem': 'Sorun: Standart RNN\'ler kaybolan gradyanlardan muzdariptir - birçok adım öncesinden bilgiyi hatırlamakta zorlanırlar.',
                'cnn-rnn.technical.lstm.title': 'LSTM (Uzun Kısa Vadeli Bellek)',
                'cnn-rnn.technical.lstm.description': 'LSTM, bilgi akışını kontrol eden kapılar kullanarak kaybolan gradyan problemini çözer. Üç kapısı vardır: unutma kapısı (ne atılacak), girdi kapısı (ne saklanacak) ve çıktı kapısı (ne çıktı verilecek).',
                'cnn-rnn.technical.lstm.formula.label': 'LSTM Kapı Denklemleri:',
                'cnn-rnn.technical.lstm.formula.explanation': 'Unutma kapısı (f_t), Girdi kapısı (i_t), Çıktı kapısı (o_t). σ sigmoid fonksiyonudur. Bu kapılar hücre durumundan hangi bilginin aktığını kontrol eder.',
                'cnn-rnn.technical.gru.title': 'GRU (Kapılı Yinelemeli Birim)',
                'cnn-rnn.technical.gru.description': 'GRU, yalnızca iki kapıya sahip LSTM\'in daha basit bir varyantıdır: sıfırlama kapısı (ne kadar geçmiş bilgi unutulacak) ve güncelleme kapısı (ne kadar yeni bilgi eklenecek). LSTM\'den daha hesaplama açısından verimlidir.',
                'cnn-rnn.technical.gru.formula.label': 'GRU Kapı Denklemleri:',
                'cnn-rnn.technical.gru.formula.explanation': 'Sıfırlama kapısı (r_t) ve Güncelleme kapısı (z_t). GRU, LSTM\'in unutma ve girdi kapılarını tek bir güncelleme kapısında birleştirir.',
                'cnn-rnn.technical.comparison.title': 'ANN vs CNN vs RNN Karşılaştırması',
                'cnn-rnn.technical.comparison.table.feature': 'Özellik',
                'cnn-rnn.technical.comparison.table.ann': 'ANN',
                'cnn-rnn.technical.comparison.table.cnn': 'CNN',
                'cnn-rnn.technical.comparison.table.rnn': 'RNN',
                'cnn-rnn.technical.comparison.data.name': 'En İyi',
                'cnn-rnn.technical.comparison.data.ann': 'Tablolu veri, genel ML',
                'cnn-rnn.technical.comparison.data.cnn': 'Görüntüler, uzamsal veri',
                'cnn-rnn.technical.comparison.data.rnn': 'Diziler, metin, zaman serileri',
                'cnn-rnn.technical.comparison.processing.name': 'İşleme',
                'cnn-rnn.technical.comparison.processing.ann': 'Paralel, ileri beslemeli',
                'cnn-rnn.technical.comparison.processing.cnn': 'Paralel, evrişimli',
                'cnn-rnn.technical.comparison.processing.rnn': 'Sıralı, yinelemeli',
                'cnn-rnn.technical.comparison.memory.name': 'Hafıza',
                'cnn-rnn.technical.comparison.memory.ann': 'Hafıza yok',
                'cnn-rnn.technical.comparison.memory.cnn': 'Uzamsal desenler',
                'cnn-rnn.technical.comparison.memory.rnn': 'Zamansal hafıza (gizli durum)',
                'cnn-rnn.technical.comparison.parameters.name': 'Parametreler',
                'cnn-rnn.technical.comparison.parameters.ann': 'Çok (tam bağlı)',
                'cnn-rnn.technical.comparison.parameters.cnn': 'Daha az (paylaşılan ağırlıklar)',
                'cnn-rnn.technical.comparison.parameters.rnn': 'Orta (yinelemeli ağırlıklar)',
                'cnn-rnn.technical.comparison.example.name': 'Örnek',
                'cnn-rnn.technical.comparison.example.ann': 'Sınıflandırma için MLP',
                'cnn-rnn.technical.comparison.example.cnn': 'Görüntü tanıma için ResNet',
                'cnn-rnn.technical.comparison.example.rnn': 'Dil modelleme için LSTM',
                'cnn-rnn.examples.cnn.title': 'CNN Uygulamaları',
                'cnn-rnn.examples.cnn.image': 'Görüntü sınıflandırması (fotoğraflarda nesneleri tanıma)',
                'cnn-rnn.examples.cnn.detection': 'Nesne tespiti (nesneleri bulma ve konumlandırma)',
                'cnn-rnn.examples.cnn.segmentation': 'Anlamsal bölütleme (piksel düzeyinde sınıflandırma)',
                'cnn-rnn.examples.cnn.medical': 'Tıbbi görüntüleme (X-ray, MRI analizi)',
                'cnn-rnn.examples.rnn.title': 'RNN/LSTM/GRU Uygulamaları',
                'cnn-rnn.examples.rnn.language': 'Dil modelleme (sonraki kelimeyi tahmin etme)',
                'cnn-rnn.examples.rnn.translation': 'Makine çevirisi (dizi-dizi)',
                'cnn-rnn.examples.rnn.speech': 'Konuşma tanıma (sesden metne)',
                'cnn-rnn.examples.rnn.time': 'Zaman serisi tahmini (hisse fiyatları, hava durumu)',

                // Generative AI
                'generative-ai.title': 'Üretici Yapay Zeka Temelleri',
                'generative-ai.intro': 'Üretici Yapay Zeka, mevcut verileri yalnızca analiz etmek veya sınıflandırmak yerine yeni içerik - metin, görüntü, kod, müzik ve daha fazlası - oluşturabilen yapay zeka sistemlerini ifade eder. Bu modeller eğitim verilerinden desenler öğrenir ve yeni çıktılar üretir.',
                'generative-ai.beginner.definition': 'Üretici Yapay Zeka Nedir? Bunu bir AI sanatçısı veya yazarı olarak düşünün. Geleneksel AI (ayırt edici) şeyler arasında ayrım yapmayı öğrenirken (örneğin "bu bir kedi" vs "bu bir köpek"), üretici AI yeni şeyler oluşturmayı öğrenir (bir hikaye yazmak veya resim çizmek gibi).',
                'generative-ai.beginner.difference': 'Anahtar Fark: Ayırt edici modeller "Bu nedir?" sorusunu yanıtlarken, üretici modeller "Bu ne olabilir?" veya "Bunun gibi bir şey oluştur" sorularını yanıtlar.',
                'generative-ai.beginner.analogy': 'Benzetme: Ayırt edici bir model, sanat stillerini tanımlayabilen bir eleştirmen gibidir. Üretici bir model, bu stillerde yeni sanat oluşturabilen bir sanatçı gibidir.',
                'generative-ai.technical.components.title': 'Temel Bileşenler',
                'generative-ai.technical.components.description': 'Üretici modeller tipik olarak şunlardan oluşur:',
                'generative-ai.technical.components.generator': 'Üretici: Rastgele gürültüden veya istemlerden yeni veri örnekleri oluşturur',
                'generative-ai.technical.components.discriminator': 'Ayırt Edici (GAN\'larda): Gerçek ve üretilen örnekler arasında ayrım yapar',
                'generative-ai.technical.components.latent': 'Gizli Uzay: Modelin anlamlı desenler öğrendiği sıkıştırılmış bir temsil',
                'generative-ai.technical.types.title': 'Üretici Model Türleri',
                'generative-ai.technical.types.autoregressive.title': '1. Otoregresif Modeller (GPT, PixelRNN)',
                'generative-ai.technical.types.autoregressive.description': 'Dizileri bir seferde bir öğe üretir, önceki tokenlara dayalı olarak sonraki tokeni tahmin eder. Örnekler: GPT modelleri, dil modelleri.',
                'generative-ai.technical.types.gan.title': '2. Üretici Çekişmeli Ağlar (GAN\'lar)',
                'generative-ai.technical.types.gan.description': 'İki ağ rekabet eder: bir üretici sahte veri oluşturur, bir ayırt edici sahteleri tespit etmeye çalışır. Çekişmeli eğitim yoluyla üretici gelişir. Örnekler: Görüntüler için StyleGAN, stil transferi için CycleGAN.',
                'generative-ai.technical.types.vae.title': '3. Varyasyonel Otokodlayıcılar (VAE\'ler)',
                'generative-ai.technical.types.vae.description': 'Olasılıksal bir gizli uzay temsili öğrenir. Öğrenilen dağılımdan örnekleme yaparak yeni örnekler oluşturabilir. Örnekler: Görüntüler için VAE, ayrıştırılmış temsiller için β-VAE.',
                'generative-ai.technical.types.diffusion.title': '4. Difüzyon Modelleri',
                'generative-ai.technical.types.diffusion.description': 'Kademeli bir gürültü ekleme sürecini tersine çevirmeyi öğrenir. Gürültüyle başlar ve örnekler üretmek için yinelemeli olarak gürültüyü giderir. Örnekler: DALL-E 2, Stable Diffusion, Midjourney.',
                'generative-ai.applications.title': 'Uygulamalar ve Kullanım Alanları',
                'generative-ai.applications.text.title': 'Metin Üretimi',
                'generative-ai.applications.text.story': 'Yaratıcı yazma ve hikaye anlatımı',
                'generative-ai.applications.text.code': 'Kod üretimi ve tamamlama',
                'generative-ai.applications.text.summary': 'Belge özetleme',
                'generative-ai.applications.text.translation': 'Çeviri ve yeniden ifade etme',
                'generative-ai.applications.image.title': 'Görüntü Üretimi',
                'generative-ai.applications.image.art': 'Dijital sanat ve illüstrasyonlar',
                'generative-ai.applications.image.design': 'Grafik tasarım ve pazarlama materyalleri',
                'generative-ai.applications.image.photo': 'Fotoğraf düzenleme ve geliştirme',
                'generative-ai.applications.image.style': 'Stil transferi ve filtreler',
                'generative-ai.applications.other.title': 'Diğer Uygulamalar',
                'generative-ai.applications.other.music': 'Müzik besteleme',
                'generative-ai.applications.other.video': 'Video üretimi ve düzenleme',
                'generative-ai.applications.other.drug': 'İlaç keşfi (moleküler üretim)',
                'generative-ai.applications.other.data': 'Eğitim için sentetik veri üretimi',
                'generative-ai.significance.title': 'Modern AI\'daki Önemi',
                'generative-ai.significance.impact': 'Üretici Yapay Zeka, AI sistemleriyle etkileşim şeklimizi devrim niteliğinde değiştirdi. GPT-4 gibi Büyük Dil Modelleri (LLM\'ler) bağlamı anlayabilir, insan benzeri metin üretebilir ve karmaşık görevlerde yardımcı olabilir. DALL-E ve Midjourney gibi görüntü üreticileri yaratıcı ifadeyi demokratikleştirdi.',
                'generative-ai.significance.future': 'Bu modeller endüstriler arasında temel araçlar haline geliyor - içerik oluşturmadan yazılım geliştirmeye, eğitimden sağlık hizmetlerine kadar. Bunlar AI\'nın analiz için bir araçtan yaratıcı bir ortak olarak AI\'ya geçişi temsil ediyor.',

                // Ethics
                'ethics.title': 'AI\'da Etik Hususlar',
                'ethics.intro': 'AI sistemleri daha güçlü ve yaygın hale geldikçe, etik sonuçlarını düşünmek çok önemlidir. Sorumlu AI geliştirme, önyargı, adalet, gizlilik ve bu teknolojilerin daha geniş toplumsal etkisini ele almayı gerektirir.',
                'ethics.beginner.why': 'Etik Neden Önemlidir: AI sistemleri insanların hayatlarını etkileyen kararlar verir - işe alma kararlarından kredi onaylarına, tıbbi tanılardan içerik önerilerine kadar. Bu sistemler insanlar tarafından oluşturulan verilerden öğrenir, bu da insan önyargılarını miras alabilecekleri ve artırabilecekleri anlamına gelir.',
                'ethics.beginner.responsibility': 'Sorumluluğumuz: AI\'nın yaratıcıları ve kullanıcıları olarak, bu sistemlerin adil, şeffaf ve topluma faydalı olduğundan emin olma sorumluluğumuz var. Bu, potansiyel zararları aktif olarak belirlemek ve azaltmak anlamına gelir.',
                'ethics.issues.title': 'Anahtar Etik Sorunlar',
                'ethics.issues.bias.title': '1. Önyargı ve Adalet',
                'ethics.issues.bias.description': 'AI modelleri eğitim verilerinde bulunan önyargıları sürdürebilir veya artırabilir. Bu, ırk, cinsiyet, yaş veya diğer korumalı özelliklere dayalı olarak belirli gruplara karşı haksız muameleye yol açabilir.',
                'ethics.issues.bias.example': 'Örnek: Geçmiş veriler üzerinde eğitilmiş bir işe alma algoritması, geçmiş işe alma önyargılıysa belirli demografikleri tercih edebilir.',
                'ethics.issues.misinformation.title': '2. Yanlış Bilgi ve Derin Sahte',
                'ethics.issues.misinformation.description': 'Üretici AI gerçekçi sahte içerik oluşturabilir - metin, görüntü, video ve ses. Bu, yanlış bilgi, kimlik hırsızlığı ve manipülasyon endişelerini artırır.',
                'ethics.issues.misinformation.example': 'Örnek: Derin sahte videolar birinin hiç söylemediği bir şeyi söylemiş gibi gösterebilir, bu da bireylere zarar verebilir veya yanlış bilgi yayabilir.',
                'ethics.issues.privacy.title': '3. Gizlilik ve Veri Koruma',
                'ethics.issues.privacy.description': 'AI sistemleri genellikle eğitim için büyük miktarda kişisel veri gerektirir. Bu, veri gizliliği, onay ve veri ihlali veya kötüye kullanım potansiyeli hakkında endişeleri artırır.',
                'ethics.issues.privacy.example': 'Örnek: Eğitim verileri modelden çıkarılabilir veya çıkarılabilir kişisel bilgiler içerebilir.',
                'ethics.issues.environmental.title': '4. Çevresel Etki',
                'ethics.issues.environmental.description': 'Büyük AI modellerini eğitmek önemli hesaplama kaynakları gerektirir, büyük miktarda enerji tüketir ve karbon emisyonlarına katkıda bulunur.',
                'ethics.issues.environmental.example': 'Örnek: GPT-3\'ü eğitmek, bir yıl boyunca yüzlerce evin enerji tüketimine eşdeğer enerji tüketmek olarak tahmin edildi.',
                'ethics.issues.jobs.title': '5. İş Kaybı',
                'ethics.issues.jobs.description': 'AI otomasyonu çeşitli endüstrilerde insan işçilerin yerini alabilir, bu da iş kayıplarına ve ekonomik bozulmaya yol açabilir. Ancak aynı zamanda yeni iş fırsatları da yaratabilir.',
                'ethics.issues.jobs.example': 'Örnek: AI yazma araçları belirli içerik yazarları için talebi azaltabilirken, AI istem mühendisleri için talep yaratabilir.',
                'ethics.issues.ip.title': '6. Fikri Mülkiyet',
                'ethics.issues.ip.description': 'Telif hakkı korumalı materyal üzerinde eğitilmiş üretici AI modelleri, üretilen içeriğin sahipliği ve eğitim verilerinin adil kullanımı hakkında soruları gündeme getirir.',
                'ethics.issues.ip.example': 'Örnek: Milyonlarca telif hakkı korumalı görüntü üzerinde eğitilmiş DALL-E tarafından üretilen bir görüntünün sahibi kim?',
                'ethics.principles.title': 'Sorumlu AI İlkeleri',
                'ethics.principles.table.principle': 'İlke',
                'ethics.principles.table.description': 'Açıklama',
                'ethics.principles.transparency.name': 'Şeffaflık',
                'ethics.principles.transparency.description': 'AI sistemleri açıklanabilir olmalı ve karar verme süreçleri kullanıcılar tarafından anlaşılabilir olmalıdır',
                'ethics.principles.accountability.name': 'Sorumluluk',
                'ethics.principles.accountability.description': 'AI sistem sonuçları için net sorumluluk ve zararları ele alma mekanizmaları',
                'ethics.principles.fairness.name': 'Adalet',
                'ethics.principles.fairness.description': 'AI sistemleri tüm bireyleri ve grupları ayrımcılık olmadan eşit şekilde ele almalıdır',
                'ethics.principles.safety.name': 'Güvenlik',
                'ethics.principles.safety.description': 'AI sistemleri sağlam, güvenli olmalı ve zararı önlemek için tasarlanmalıdır',
                'ethics.principles.privacy.name': 'Gizlilik',
                'ethics.principles.privacy.description': 'AI yaşam döngüsü boyunca kullanıcı verilerini koruyun ve gizlilik haklarına saygı gösterin',
                'ethics.principles.human.name': 'İnsan Odaklı',
                'ethics.principles.human.description': 'AI insan yeteneklerini artırmalı ve insan değerlerine ve refahına hizmet etmelidir',
                'ethics.practices.title': 'En İyi Uygulamalar',
                'ethics.practices.diverse': 'Çeşitli ve temsili eğitim verileri kullanın',
                'ethics.practices.testing': 'Önyargı ve adalet sorunları için düzenli olarak test edin',
                'ethics.practices.documentation': 'Model sınırlamalarını ve potansiyel riskleri belgeleyin',
                'ethics.practices.oversight': 'Kritik kararlar için insan gözetimi uygulayın',
                'ethics.practices.continuous': 'Modelleri sürekli izleyin ve güncelleyin',
                'ethics.practices.education': 'Kullanıcıları AI yetenekleri ve sınırlamaları hakkında eğitin',

                // Foundation Models
                'foundation-models.title': 'Temel Modeller ve LLM Mimarileri',
                'foundation-models.intro': 'Temel modeller, birçok aşağı akış görevi için temel görevi gören büyük ölçekli önceden eğitilmiş modellerdir. BERT, GPT ve LLaMA gibi önemli modellerin mimarilerini anlamak, modern NLP sistemleriyle çalışmak için gereklidir.',
                'foundation-models.beginner.definition': 'Temel Modeller Nedir? Temel modelleri milyonlarca kitap okumuş evrensel bir dil öğrencisi gibi düşünün. Dili o kadar iyi anlarlar ki, sıfırdan başlamadan birçok farklı göreve - çeviri, özetleme, soru cevaplama ve daha fazlası - hızlıca uyarlanabilirler.',
                'foundation-models.beginner.why': 'Neden Önemlidirler: Temel modeller güçlü bir başlangıç noktası sağlayarak AI\'yı devrim niteliğinde değiştirdi. Her görev için yeni bir model eğitmek yerine, bir temel modeli ince ayar yapabiliriz, zaman, kaynak tasarrufu sağlar ve daha iyi performans elde ederiz.',
                'foundation-models.bert.title': 'BERT Mimarisi',
                'foundation-models.bert.description': 'BERT (Transformers\'tan İki Yönlü Kodlayıcı Temsilleri) yalnızca transformer\'ların kodlayıcı yığınını kullanır, iki yönlü bağlam anlayışını sağlar.',
                'foundation-models.bert.architecture.title': 'Mimari Detaylar',
                'foundation-models.bert.architecture.layers': 'Katmanlar: BERT-base 12 katmana, BERT-large 24 katmana sahiptir',
                'foundation-models.bert.architecture.attention': 'Dikkat Başlıkları: 12 başlık (base), 16 başlık (large)',
                'foundation-models.bert.architecture.hidden': 'Gizli Boyut: 768 boyut (base), 1024 boyut (large)',
                'foundation-models.bert.architecture.parameters': 'Parametreler: ~110M (base), ~340M (large)',
                'foundation-models.bert.pretraining.title': 'Ön Eğitim Hedefleri',
                'foundation-models.bert.pretraining.mlm': 'Maskelenmiş Dil Modelleme (MLM): Maskelenmiş tokenları tahmin eder (tokenların %15\'i)',
                'foundation-models.bert.pretraining.nsp': 'Sonraki Cümle Tahmini (NSP): B cümlesinin A cümlesini takip edip etmediğini tahmin eder',
                'foundation-models.bert.usecases.title': 'Kullanım Alanları',
                'foundation-models.bert.usecases.classification': 'Metin sınıflandırması',
                'foundation-models.bert.usecases.qa': 'Soru cevaplama',
                'foundation-models.bert.usecases.ner': 'Adlandırılmış varlık tanıma',
                'foundation-models.bert.usecases.sentiment': 'Duygu analizi',
                'foundation-models.gpt.title': 'GPT Mimarisi',
                'foundation-models.gpt.description': 'GPT (Üretici Önceden Eğitilmiş Transformer) yalnızca kod çözücü yığınını kullanır, bu da onu otoregresif yapar ve metin üretimi görevleri için ideal kılar.',
                'foundation-models.gpt.evolution.title': 'Evrim: GPT-1\'den GPT-4\'e',
                'foundation-models.gpt.evolution.table.model': 'Model',
                'foundation-models.gpt.evolution.table.parameters': 'Parametreler',
                'foundation-models.gpt.evolution.table.training': 'Eğitim Verisi',
                'foundation-models.gpt.evolution.table.features': 'Anahtar Özellikler',
                'foundation-models.gpt.evolution.gpt1.params': '117M',
                'foundation-models.gpt.evolution.gpt1.data': 'BookCorpus (4.5GB)',
                'foundation-models.gpt.evolution.gpt1.features': 'Kod çözücü-sadece, sonraki token tahmini',
                'foundation-models.gpt.evolution.gpt2.params': '1.5B',
                'foundation-models.gpt.evolution.gpt2.data': 'WebText (40GB)',
                'foundation-models.gpt.evolution.gpt2.features': 'Daha büyük ölçek, sıfır atışlı öğrenme',
                'foundation-models.gpt.evolution.gpt3.params': '175B',
                'foundation-models.gpt.evolution.gpt3.data': 'Common Crawl, kitaplar, web (570GB)',
                'foundation-models.gpt.evolution.gpt3.features': 'Birkaç atışlı öğrenme, bağlam içi öğrenme',
                'foundation-models.gpt.evolution.gpt4.params': '~1T (tahmini)',
                'foundation-models.gpt.evolution.gpt4.data': 'Büyük çok modlu veri seti',
                'foundation-models.gpt.evolution.gpt4.features': 'Çok modlu, RLHF, geliştirilmiş akıl yürütme',
                'foundation-models.gpt.scaling.title': 'Ölçekleme Yasaları',
                'foundation-models.gpt.scaling.description': 'GPT modelleri ölçekleme yasalarını takip eder: performans model boyutu, veri boyutu ve hesaplama ile öngörülebilir şekilde iyileşir. Bu, giderek daha büyük modellerin geliştirilmesine yol açtı.',
                'foundation-models.llama.title': 'LLaMA Mimarisi',
                'foundation-models.llama.description': 'LLaMA (Büyük Dil Modeli Meta AI) mimari iyileştirmeler yoluyla daha az parametreyle güçlü performans elde eden verimli bir kod çözücü-sadece mimarisidir.',
                'foundation-models.llama.innovations.title': 'Anahtar Mimari Yenilikler',
                'foundation-models.llama.innovations.rmsnorm': 'RMSNorm: Kök Ortalama Kare Katman Normalizasyonu (LayerNorm\'dan daha verimli)',
                'foundation-models.llama.innovations.swiglu': 'SwiGLU Aktivasyonu: Swish-Kapılı Doğrusal Birim (ReLU\'dan daha iyi)',
                'foundation-models.llama.innovations.rope': 'RoPE: Döner Konum Gömme (daha iyi konum kodlama)',
                'foundation-models.llama.innovations.gqa': 'Gruplanmış Sorgu Dikkati: Kaliteyi korurken bellek kullanımını azaltır',
                'foundation-models.llama.variants.title': 'LLaMA Varyantları',
                'foundation-models.llama.variants.llama1': 'LLaMA-1: 7B, 13B, 33B, 65B parametreler',
                'foundation-models.llama.variants.llama2': 'LLaMA-2: Geliştirilmiş eğitim, 7B, 13B, 70B parametreler, sohbet varyantları',
                'foundation-models.llama.variants.llama3': 'LLaMA-3: Daha fazla iyileştirme, daha büyük bağlam pencereleri',
                'foundation-models.comparison.title': 'BERT vs GPT vs LLaMA Karşılaştırması',
                'foundation-models.comparison.table.feature': 'Özellik',
                'foundation-models.comparison.table.bert': 'BERT',
                'foundation-models.comparison.table.gpt': 'GPT',
                'foundation-models.comparison.table.llama': 'LLaMA',
                'foundation-models.comparison.architecture.name': 'Mimari',
                'foundation-models.comparison.architecture.bert': 'Kodlayıcı-sadece',
                'foundation-models.comparison.architecture.gpt': 'Kod çözücü-sadece',
                'foundation-models.comparison.architecture.llama': 'Kod çözücü-sadece',
                'foundation-models.comparison.context.name': 'Bağlam',
                'foundation-models.comparison.context.bert': 'İki yönlü',
                'foundation-models.comparison.context.gpt': 'Nedensel (soldan sağa)',
                'foundation-models.comparison.context.llama': 'Nedensel (soldan sağa)',
                'foundation-models.comparison.training.name': 'Eğitim',
                'foundation-models.comparison.training.bert': 'MLM + NSP',
                'foundation-models.comparison.training.gpt': 'Sonraki token tahmini',
                'foundation-models.comparison.training.llama': 'Sonraki token tahmini',
                'foundation-models.comparison.best.name': 'En İyi',
                'foundation-models.comparison.best.bert': 'Anlama görevleri',
                'foundation-models.comparison.best.gpt': 'Üretim görevleri',
                'foundation-models.comparison.best.llama': 'Verimli üretim',
                'foundation-models.comparison.size.name': 'Tipik Boyut',
                'foundation-models.comparison.size.bert': '110M - 340M',
                'foundation-models.comparison.size.gpt': '117M - 175B+',
                'foundation-models.comparison.size.llama': '7B - 70B',
                'foundation-models.training.title': 'Gelişmiş Eğitim Teknikleri',
                'foundation-models.training.rlhf.title': 'İnsan Geri Bildiriminden Pekiştirmeli Öğrenme (RLHF)',
                'foundation-models.training.rlhf.description': 'RLHF model çıktılarını insan tercihleriyle hizalar. İnsan geri bildirimi üzerinde bir ödül modeli eğitmeyi ve ardından dil modelini optimize etmek için pekiştirmeli öğrenmeyi kullanmayı içerir. GPT-3.5, GPT-4, Claude ve diğer gelişmiş modellerde kullanılır.',
                'foundation-models.training.instruction.title': 'Talimat İnce Ayarı',
                'foundation-models.training.instruction.description': 'Modelleri talimatları daha iyi takip etmeleri için talimat-yanıt çiftleri üzerinde ince ayar yapma. Bu, sıfır atışlı görev performansını sağlar - model açık eğitim örnekleri olmadan yeni görevleri gerçekleştirebilir.',
                'foundation-models.training.chains.title': 'Düşünce Zinciri İstemleme',
                'foundation-models.training.chains.description': 'Modelleri akıl yürütme süreçlerini adım adım göstermeye teşvik eden istemleme tekniği. Bu, karmaşık akıl yürütme görevlerinde performansı önemli ölçüde iyileştirir.',

                // Embedding Evaluation
                'embeddings.evaluation.title': 'Gömme Değerlendirmesi',
                'embeddings.evaluation.intro': 'Gömme kalitesini değerlendirmek, göreviniz için doğru modeli seçmek için çok önemlidir. İki ana değerlendirme yaklaşımı vardır: içsel ve dışsal.',
                'embeddings.evaluation.intrinsic.title': 'İçsel Değerlendirme',
                'embeddings.evaluation.intrinsic.description': 'İçsel değerlendirme, gömme kalitesini bir aşağı akış görevinde kullanmadan doğrudan test eder.',
                'embeddings.evaluation.intrinsic.similarity.title': 'Kelime Benzerliği Görevleri',
                'embeddings.evaluation.intrinsic.similarity.description': 'Gömmelerin anlamsal benzerliği yakalayıp yakalamadığını test eder. Örnekler: WordSim-353, SimLex-999. Gömme kosinüs benzerliği ile insan benzerlik derecelendirmeleri arasındaki korelasyonu ölçer.',
                'embeddings.evaluation.intrinsic.analogy.title': 'Analoji Görevleri',
                'embeddings.evaluation.intrinsic.analogy.description': 'Gömmelerin dilsel ilişkileri yakalayıp yakalamadığını test eder. Klasik örnek: "kral" - "adam" + "kadın" ≈ "kraliçe". Vektör aritmetiğinin anlamsal ilişkileri yansıtıp yansıtmadığını ölçer.',
                'embeddings.evaluation.intrinsic.analogy.formula.label': 'Analoji Testi:',
                'embeddings.evaluation.extrinsic.title': 'Dışsal Değerlendirme',
                'embeddings.evaluation.extrinsic.description': 'Dışsal değerlendirme, gömme kalitesini bunları aşağı akış görevlerinde kullanarak ve görev performansını ölçerek test eder.',
                'embeddings.evaluation.extrinsic.tasks.title': 'Aşağı Akış Görevleri',
                'embeddings.evaluation.extrinsic.tasks.classification': 'Metin sınıflandırma doğruluğu',
                'embeddings.evaluation.extrinsic.tasks.qa': 'Soru cevaplama performansı',
                'embeddings.evaluation.extrinsic.tasks.retrieval': 'Bilgi erişimi recall@k',
                'embeddings.evaluation.extrinsic.tasks.clustering': 'Kümeleme kalite metrikleri',
                'embeddings.evaluation.metrics.title': 'Yaygın Metrikler',
                'embeddings.evaluation.metrics.table.metric': 'Metrik',
                'embeddings.evaluation.metrics.table.description': 'Açıklama',
                'embeddings.evaluation.metrics.table.use': 'Kullanım Alanı',
                'embeddings.evaluation.metrics.cosine.name': 'Kosinüs Benzerliği',
                'embeddings.evaluation.metrics.cosine.description': 'Vektörler arasındaki açıyı ölçer (0 ile 1 arası)',
                'embeddings.evaluation.metrics.cosine.use': 'Anlamsal benzerlik, erişim',
                'embeddings.evaluation.metrics.euclidean.name': 'Öklid Mesafesi',
                'embeddings.evaluation.metrics.euclidean.description': 'Vektörler arasındaki düz çizgi mesafesi',
                'embeddings.evaluation.metrics.euclidean.use': 'Kümeleme, en yakın komşular',
                'embeddings.evaluation.metrics.recall.name': 'Recall@K',
                'embeddings.evaluation.metrics.recall.description': 'En üst K sonuçtaki ilgili öğelerin kesri',
                'embeddings.evaluation.metrics.recall.use': 'Erişim kalitesi',
                'embeddings.evaluation.metrics.map.name': 'Ortalama Ortalama Hassasiyet (MAP)',
                'embeddings.evaluation.metrics.map.description': 'Tüm sorgular genelinde ortalama hassasiyet',
                'embeddings.evaluation.metrics.map.use': 'Sıralama kalitesi',

                // Hugging Face
                'hugging-face.title': 'NLP ve Ötesi için Hugging Face\'te Uzmanlaşma',
                'hugging-face.intro': 'Hugging Face, transformer\'lar ve diğer ML modelleriyle çalışmak için kapsamlı bir ekosistem sağlar. Önceden eğitilmiş modeller, kullanımı kolay API\'ler ve modern NLP\'yi herkes için erişilebilir kılan dağıtım araçları sunar.',
                'hugging-face.beginner.what': 'Hugging Face Nedir? Hugging Face\'i AI modelleri için bir kütüphane ve pazar yeri olarak düşünün. Sıfırdan model eğitmek yerine (aylar sürer ve binlerce dolara mal olur), kullanıma hazır veya ince ayar yapılabilir önceden eğitilmiş modelleri indirebilirsiniz.',
                'hugging-face.beginner.why': 'Neden Önemlidir: Hugging Face, en son modelleri herkes için erişilebilir kılarak AI\'yı demokratikleştirir. Sadece birkaç satır kodla GPT düzeyinde modeller kullanabilir, bunları özel ihtiyaçlarınız için ince ayar yapabilir ve kolayca dağıtabilirsiniz.',
                'hugging-face.beginner.ecosystem': 'Ekosistem: Hugging Face Transformers kütüphanesini (Python kodu), Model Hub\'ı (model deposu), Spaces\'i (dağıtım platformu) ve Datasets\'i (veri yönetimi) sağlar.',
                'hugging-face.transformers.title': 'Transformers Kütüphanesi',
                'hugging-face.transformers.description': 'Transformers kütüphanesi NLP, bilgisayar görüşü, ses ve çok modlu görevler için binlerce önceden eğitilmiş model ve kullanımı kolay API sağlar.',
                'hugging-face.transformers.installation.title': 'Kurulum',
                'hugging-face.transformers.pipeline.title': 'Pipeline Kullanımı (En Kolay Yol)',
                'hugging-face.transformers.pipeline.description': 'Pipeline\'lar yaygın görevler için basit bir API sağlar:',
                'hugging-face.transformers.loading.title': 'Modelleri Doğrudan Yükleme',
                'hugging-face.hub.title': 'Model Hub',
                'hugging-face.hub.description': 'Hugging Face Hub 500.000\'den fazla önceden eğitilmiş model barındırır. Modelleri kolayca arayabilir, indirebilir ve paylaşabilirsiniz.',
                'hugging-face.hub.features.title': 'Anahtar Özellikler',
                'hugging-face.hub.features.search': 'Görev, dil, çerçeveye göre modelleri arayın',
                'hugging-face.hub.features.download': 'Tek satır kodla modelleri indirin',
                'hugging-face.hub.features.upload': 'Kendi modellerinizi yükleyin ve paylaşın',
                'hugging-face.hub.features.versioning': 'Model sürümleme ve dokümantasyon',
                'hugging-face.hub.features.community': 'Topluluk derecelendirmeleri ve tartışmaları',
                'hugging-face.hub.usage.title': 'Hub\'dan Model Kullanımı',
                'hugging-face.finetuning.title': 'Büyük Dil Modellerini İnce Ayar',
                'hugging-face.finetuning.description': 'İnce ayar, önceden eğitilmiş modelleri özel görevinize uyarlar. Transformers kütüphanesi bunu basit hale getirir.',
                'hugging-face.finetuning.process.title': 'İnce Ayar Süreci',
                'hugging-face.finetuning.lora.title': 'Parametre-Verimli İnce Ayar (LoRA)',
                'hugging-face.finetuning.lora.description': 'LoRA küçük bağdaştırıcı katmanlar ekleyerek daha az parametreyle ince ayar yapılmasına olanak tanır. Bu daha verimlidir ve daha az bellek gerektirir.',
                'hugging-face.deployment.title': 'Model Dağıtımı ve Paylaşımı',
                'hugging-face.deployment.hub.title': 'Hub\'a Gönderme',
                'hugging-face.deployment.hub.description': 'İnce ayarlı modellerinizi Hub\'da paylaşın:',
                'hugging-face.deployment.spaces.title': 'Hugging Face Spaces',
                'hugging-face.deployment.spaces.description': 'Spaces ML demoları ve uygulamaları için ücretsiz barındırma sağlar. Tek tıkla Gradio veya Streamlit uygulamaları dağıtabilirsiniz.',
                'hugging-face.deployment.spaces.features.free': 'Halka açık demolar için ücretsiz barındırma',
                'hugging-face.deployment.spaces.features.gradio': 'Hızlı UI\'lar için Gradio entegrasyonu',
                'hugging-face.deployment.spaces.features.streamlit': 'Özel uygulamalar için Streamlit desteği',
                'hugging-face.deployment.spaces.features.sharing': 'Kolay paylaşım ve gömme',
                'hugging-face.multimedia.title': 'Çok Modlu Modeller',
                'hugging-face.multimedia.description': 'Hugging Face metin dışında görüntüler, ses ve video dahil modelleri destekler.',
                'hugging-face.multimedia.image.title': 'Görüntü Modelleri',
                'hugging-face.multimedia.image.classification': 'Görüntü sınıflandırması (ViT, ResNet)',
                'hugging-face.multimedia.image.generation': 'Görüntü üretimi (Stable Diffusion)',
                'hugging-face.multimedia.image.segmentation': 'Nesne tespiti ve bölütleme',
                'hugging-face.multimedia.audio.title': 'Ses Modelleri',
                'hugging-face.multimedia.audio.asr': 'Otomatik konuşma tanıma (Whisper)',
                'hugging-face.multimedia.audio.tts': 'Metinden sese sentez',
                'hugging-face.multimedia.audio.classification': 'Ses sınıflandırması',
                'hugging-face.multimedia.video.title': 'Video Modelleri',
                'hugging-face.multimedia.video.classification': 'Video sınıflandırması',
                'hugging-face.multimedia.video.generation': 'Video üretimi',

                // Pre-training/Fine-tuning
                'pretraining.title': 'Ön Eğitim vs İnce Ayar (Pre-training vs Fine-tuning)',
                'pretraining.intro': 'Ön eğitim (pre-training) büyük veri setlerinden genel dil kalıplarını öğrenirken, ince ayar (fine-tuning) modeli belirli görevlere uyarlar. Bu transfer öğrenme (transfer learning) yaklaşımı modern NLP başarısının anahtarı olmuştur.',
                'pretraining.beginner.analogy': 'Genel Beceriler Öğrenme Sonra Uzmanlaşma Benzetmesi:',
                'pretraining.beginner.doctor': 'Doktor olmayı öğrenmeyi hayal edin:',
                'pretraining.beginner.pretraining': 'Ön Eğitim = Tıp Fakültesi: Binlerce ders kitabı ve vakadan genel tıbbi bilgiyi - anatomi, fizyoloji, kimya - öğrenirsiniz. Bu size geniş bir temel sağlar.',
                'pretraining.beginner.finetuning': 'İnce Ayar = İhtisas/Uzmanlaşma: Daha sonra belirli bir alanda (kardiyoloji gibi) uzmanlaşırsınız, o alana odaklı eğitimle. Genel bilginizi belirli göreve uyarlarsınız.',
                'pretraining.beginner.similarly': 'Benzer şekilde, ön eğitim modeli büyük metin veri setlerinden genel dil anlayışını (dilbilgisi, anlambilim, dünya bilgisi) öğretir. İnce ayar daha sonra bu genel bilgiyi duygu analizi veya soru cevaplama gibi belirli görevlere uyarlar.',
                'pretraining.beginner.why': 'Neden Çalışır: Çoğu dil anlayışı görevler arasında paylaşılır. Genel kalıpları bir kez öğrenip yeniden kullanmak, her görev için sıfırdan eğitimden çok daha verimlidir.',
                'pretraining.step.title': 'Adım Adım: Ön Eğitim ve İnce Ayar Süreci',
                'pretraining.step.1.title': 'Ön Eğitim: Büyük Ölçekli Öğrenme',
                'pretraining.step.1.description': 'Model, büyük etiketlenmemiş metin veri setlerinde (genellikle Wikipedia, kitaplar, web sayfalarından milyarlarca kelime) eğitilir. Amaç genel dil kalıplarını öğrenmektir, belirli bir görev değil.',
                'pretraining.step.1.example.title': 'Ön Eğitim Veri Örnekleri',
                'pretraining.step.1.example.wikipedia': 'Wikipedia makaleleri',
                'pretraining.step.1.example.books': 'Kitaplar (Project Gutenberg)',
                'pretraining.step.1.example.web': 'Web metni (Common Crawl)',
                'pretraining.step.1.example.news': 'Haber makaleleri',
                'pretraining.step.1.example.total': 'Toplam: Genellikle 100+ GB metin, milyarlarca token',
                'pretraining.step.2.title': 'Ön Eğitim Hedefleri',
                'pretraining.step.2.description': 'Farklı modeller farklı ön eğitim görevleri kullanır:',
                'pretraining.step.2.bert.title': 'BERT: Maskelenmiş Dil Modelleme (MLM)',
                'pretraining.step.2.bert.description': 'Kelimelerin %15\'ini rastgele maskeleyin, bağlamdan tahmin edin. Örnek:',
                'pretraining.step.2.bert.formula.label': 'MLM Kaybı:',
                'pretraining.step.2.bert.formula.explanation': 'Bağlam x\\M (maskelenmiş olanlar hariç tüm token\'lar) verildiğinde maskelenmiş token\'lar xᵢ\'yi tahmin et',
                'pretraining.step.2.gpt.title': 'GPT: Sonraki Token Tahmini',
                'pretraining.step.2.gpt.description': 'Tüm önceki kelimelere göre sonraki kelimeyi tahmin edin. Örnek:',
                'pretraining.step.2.gpt.formula.label': 'Dil Modelleme Kaybı:',
                'pretraining.step.2.gpt.formula.explanation': 'Tüm önceki token\'lar x<ₜ verildiğinde token xₜ\'yi tahmin et',
                'pretraining.step.3.title': 'İnce Ayar: Göreve Özel Uyarlama',
                'pretraining.step.3.description': 'Önceden eğitilmiş model daha sonra belirli bir görev için daha küçük, etiketli bir veri setinde ince ayarlanır. Model genel bilgisini belirli gereksinimlere uyarlar.',
                'pretraining.step.3.example.title': 'İnce Ayar Süreci',
                'pretraining.step.3.example.1': 'Önceden eğitilmiş ağırlıklarla başla',
                'pretraining.step.3.example.2': 'Göreve özel katman ekle (gerekirse)',
                'pretraining.step.3.example.3': 'Etiketli görev verisi üzerinde eğit',
                'pretraining.step.3.example.4': 'Daha küçük öğrenme oranı kullan (genellikle 10-100 kat daha küçük)',
                'pretraining.step.3.example.5': 'Daha az epoch için eğit (ön eğitim için 100+ yerine 1-10)',
                'pretraining.step.4.title': 'Transfer Öğrenme Kavramı',
                'pretraining.step.4.description': 'Transfer öğrenme ana fikirdir: bir bağlamda (genel dil) öğrenilen bilgi başka bir bağlama (belirli görev) aktarılır. Bu şu nedenle çalışır:',
                'pretraining.step.4.lower': 'Alt katmanlar genel özellikleri öğrenir (sözdizimi, temel anlambilim)',
                'pretraining.step.4.higher': 'Üst katmanlar göreve özel özellikleri öğrenir',
                'pretraining.step.4.adjusts': 'İnce ayar genel bilgiyi korurken üst katmanları ayarlar',
                'pretraining.step.4.formula.label': 'Transfer Öğrenme Faydası:',
                'pretraining.step.4.formula.explanation': 'İnce ayarlanmış modeller daha az veri ve eğitim süresiyle çok daha iyi performans elde eder',
                'pretraining.step.5.title': 'Sonuç: Göreve Optimize Edilmiş Model',
                'pretraining.step.5.description': 'İnce ayardan sonra, model hem genel dil anlayışına (ön eğitimden) hem de göreve özel bilgiye (ince ayardan) sahiptir. Bu kombinasyon üstün performansa yol açar.',
                'pretraining.step.5.example.title': 'Performans Karşılaştırması',
                'pretraining.step.5.example.description': 'GLUE kıyaslamasında (dil anlama görevleri):',
                'pretraining.step.5.example.scratch': 'Sıfırdan: ~%60 doğruluk, binlerce örneğe ihtiyaç duyar',
                'pretraining.step.5.example.bert': 'İnce ayarlanmış BERT: ~%80 doğruluk, yüzlerce örneğe ihtiyaç duyar',
                'pretraining.step.5.example.gpt3': 'GPT-3 (az örnekli/sıfır örnekli): İn-bağlam öğrenme (in-context learning) yoluyla sadece birkaç örnekle veya hatta sıfır örnekle ~%90 doğruluk (ince ayar değil)',
                'pretraining.technical.objectives.title': 'Ön Eğitim Hedefleri',
                'pretraining.technical.objectives.mlm.title': 'Maskelenmiş Dil Modelleme (BERT)',
                'pretraining.technical.objectives.mlm.description': 'Ön eğitim sırasında, token\'ların %15\'i rastgele seçilir:',
                'pretraining.technical.objectives.mlm.mask': '%80\'i [MASK] token ile değiştirilir',
                'pretraining.technical.objectives.mlm.random': '%10\'u rastgele token ile değiştirilir',
                'pretraining.technical.objectives.mlm.unchanged': '%10\'u değiştirilmeden bırakılır',
                'pretraining.technical.objectives.mlm.result': 'Model orijinal token\'ı tahmin etmelidir. Bu çift yönlü anlayışı öğretir.',
                'pretraining.technical.objectives.gpt.title': 'Sonraki Token Tahmini (GPT)',
                'pretraining.technical.objectives.gpt.description': 'Model bir dizideki sonraki token\'ı tahmin eder, tutarlı metin üretmeyi öğrenir. Bu otoregresif üretimi ve dil modellemeyi öğretir.',
                'pretraining.technical.strategies.title': 'İnce Ayar Stratejileri',
                'pretraining.technical.strategies.full.title': '1. Tam İnce Ayar',
                'pretraining.technical.strategies.full.description': 'Tüm model parametrelerini güncelle. En etkili ancak hesaplama açısından pahalı.',
                'pretraining.technical.strategies.full.formula.label': 'Parametre Güncelleme:',
                'pretraining.technical.strategies.full.formula.explanation': 'Tüm parametreler θ göreve özel kayıp L_task ile güncellenir',
                'pretraining.technical.strategies.lora.title': '2. Parametre Verimli İnce Ayar',
                'pretraining.technical.strategies.lora.description': 'LoRA (Düşük Sıralı Uyarlama): Tüm ağırlıkları güncellemek yerine küçük eğitilebilir matrisler ekler. Yalnızca parametrelerin ~%1\'i eğitilir.',
                'pretraining.technical.strategies.lora.formula.label': 'LoRA Güncelleme:',
                'pretraining.technical.strategies.lora.formula.explanation': 'Yalnızca B ve A matrisleri eğitilir, W dondurulmuş kalır. Çok daha verimli!',
                'pretraining.technical.strategies.lr.title': '3. Öğrenme Oranı Zamanlaması',
                'pretraining.technical.strategies.lr.description': 'Önceden eğitilmiş katmanlar için daha küçük öğrenme oranları (bilgiyi korumak için) ve yeni göreve özel katmanlar için daha büyük oranlar kullanın. Yaygın: önceden eğitilmiş için 1e-5, yeni katmanlar için 1e-3.',
                'pretraining.technical.math.title': 'Transfer Öğrenme Matematiği',
                'pretraining.technical.math.description': 'Transfer öğrenmenin başarısı temsil öğrenme merceğinden anlaşılabilir:',
                'pretraining.technical.math.formula.label': 'Temsil Öğrenme:',
                'pretraining.technical.math.formula.explanation': 'Ön eğitim genel temsil Z\'yi öğrenir. İnce ayar Z\'den Y\'ye göreve özel eşleşmeyi öğrenir',
                'pretraining.components.title': 'Bileşen Detayları',
                'pretraining.components.pretraining.title': 'Ön Eğitim Veri Setleri',
                'pretraining.components.pretraining.table.dataset': 'Veri Seti',
                'pretraining.components.pretraining.table.size': 'Boyut',
                'pretraining.components.pretraining.table.content': 'İçerik',
                'pretraining.components.pretraining.table.used': 'Kullanıldığı Yer',
                'pretraining.components.pretraining.wikipedia.name': 'Wikipedia',
                'pretraining.components.pretraining.wikipedia.size': '~3GB',
                'pretraining.components.pretraining.wikipedia.content': 'Ansiklopedi makaleleri',
                'pretraining.components.pretraining.wikipedia.used': 'BERT, GPT-2',
                'pretraining.components.pretraining.bookcorpus.name': 'BookCorpus',
                'pretraining.components.pretraining.bookcorpus.size': '~5GB',
                'pretraining.components.pretraining.bookcorpus.content': 'Romanlar ve kitaplar',
                'pretraining.components.pretraining.bookcorpus.used': 'BERT, GPT-2',
                'pretraining.components.pretraining.commoncrawl.name': 'Common Crawl',
                'pretraining.components.pretraining.commoncrawl.size': '~750GB',
                'pretraining.components.pretraining.commoncrawl.content': 'Web sayfaları',
                'pretraining.components.pretraining.commoncrawl.used': 'GPT-3, T5',
                'pretraining.components.pretraining.c4.name': 'C4',
                'pretraining.components.pretraining.c4.size': '~750GB',
                'pretraining.components.pretraining.c4.content': 'Temizlenmiş web metni',
                'pretraining.components.pretraining.c4.used': 'T5',
                'pretraining.components.finetuning.title': 'İnce Ayar Veri Setleri',
                'pretraining.components.finetuning.glue.title': 'GLUE (Genel Dil Anlama Değerlendirmesi)',
                'pretraining.components.finetuning.glue.description': '9 görevden oluşan koleksiyon: duygu analizi, parafraz tespiti, doğal dil çıkarımı, vb.',
                'pretraining.components.finetuning.superglue.title': 'SuperGLUE',
                'pretraining.components.finetuning.superglue.description': 'Daha zor görevlerle GLUE\'nin daha zorlu versiyonu.',
                'pretraining.components.performance.title': 'Performans Karşılaştırması',
                'pretraining.components.performance.comparison.title': 'Sıfırdan vs Önceden Eğitilmiş + İnce Ayar',
                'pretraining.components.performance.comparison.data': 'Gerekli veri: Sıfırdan: 10.000+ örnek | İnce ayarlanmış: 100-1000 örnek',
                'pretraining.components.performance.comparison.time': 'Eğitim süresi: Sıfırdan: Günler/haftalar | İnce ayarlanmış: Saatler',
                'pretraining.components.performance.comparison.performance': 'Performans: Sıfırdan: %60-70 | İnce ayarlanmış: %80-95',
                'pretraining.components.performance.comparison.cost': 'Maliyet: Sıfırdan: Yüksek | İnce ayarlanmış: Düşük (önceden eğitilmiş modeli yeniden kullan)',
                'pretraining.summary.pretraining.title': 'Ön Eğitim Aşaması',
                'pretraining.summary.pretraining.objective': 'Hedef: Genel dil temsillerini öğren',
                'pretraining.summary.pretraining.data': 'Veri: Büyük etiketlenmemiş metin derlemeleri (Wikipedia, kitaplar, web metni)',
                'pretraining.summary.pretraining.tasks': 'Görevler: Maskelenmiş dil modelleme (BERT) veya sonraki token tahmini (GPT)',
                'pretraining.summary.pretraining.result': 'Sonuç: Genel amaçlı dil anlayışı',
                'pretraining.summary.finetuning.title': 'İnce Ayar Aşaması',
                'pretraining.summary.finetuning.objective': 'Hedef: Belirli alt görevlere uyarlan',
                'pretraining.summary.finetuning.data': 'Veri: Daha küçük etiketli göreve özel veri setleri',
                'pretraining.summary.finetuning.tasks': 'Görevler: Sınıflandırma, Soru-Cevap, özetleme, vb.',
                'pretraining.summary.finetuning.result': 'Sonuç: Göreve optimize edilmiş model performansı',
                'pretraining.summary.benefits.title': 'Faydalar',
                'pretraining.summary.benefits.efficiency': '• Verimlilik: Öğrenilen temsilleri yeniden kullan',
                'pretraining.summary.benefits.performance': '• Performans: Daha az göreve özel veriyle daha iyi sonuçlar',
                'pretraining.summary.benefits.scalability': '• Ölçeklenebilirlik: Birçok görev için bir önceden eğitilmiş model',

                // RAG
                'rag.intro.title': 'Geri Getirme ile Artırılmış Üretim (Retrieval Augmented Generation - RAG)',
                'rag.intro.intro': 'RAG, büyük dil modellerinin (large language models) gücünü harici bilgi geri getirme (external knowledge retrieval) ile birleştirerek, modellerin eğitim setlerinde olmayan güncel bilgilere ve alana özel verilere erişmesini sağlar.',
                'rag.intro.beginner.analogy': '<strong>Kütüphane Benzetmesi:</strong> RAG\'ı bir araştırma asistanı gibi düşünün:',
                'rag.intro.beginner.knowledge': 'Genel bir bilgi tabanına sahiptir (LLM\'in eğitimi)',
                'rag.intro.beginner.library': 'Bir kütüphanede bilgi arayabilir (vektör veritabanı)',
                'rag.intro.beginner.retrieves': 'Bir soru sorduğunuzda ilgili kitapları/belgeleri getirir',
                'rag.intro.beginner.uses': 'Hem bilgisini HEM de geri getirilen belgeleri kullanarak size eksiksiz bir cevap verir',
                'rag.intro.beginner.concept': '<strong>Temel RAG Kavramı:</strong>',
                'rag.intro.beginner.original': '<strong>Orijinal:</strong> "My name is Paul"',
                'rag.intro.beginner.modification': '<strong>Değişiklik:</strong> "Paul is my name"',
                'rag.intro.beginner.process': '<strong>RAG Süreci:</strong> Sorgu → Bağlamı Getir → Artır → Cevap Üret',
                'rag.intro.beginner.instead': 'Modelin eğitim sırasında öğrendiklerine yalnızca güvenmek yerine, RAG modelin harici kaynaklardan ilgili bilgileri "aramasına" ve bunları daha doğru, güncel yanıtlar üretmek için kullanmasına olanak tanır.',
                'rag.intro.step.title': 'Adım Adım: RAG Nasıl Çalışır',
                'rag.intro.step.1.title': 'Kullanıcı Sorgusu',
                'rag.intro.step.1.description': 'Bir kullanıcı soru sorar veya bir prompt sağlar. Bu sorgu hem ilgili bilgileri geri getirmek hem de nihai cevabı üretmek için kullanılacaktır.',
                'rag.intro.step.1.visual': 'Sorgu: "Kuantum hesaplamadaki son gelişmeler nelerdir?"',
                'rag.intro.step.2.title': 'Sorgu Gömme (Query Embedding)',
                'rag.intro.step.2.description': 'Sorgu, belgeleri indekslemek için kullanılan aynı gömme modeli kullanılarak bir vektöre (gömme) dönüştürülür. Bu anlamsal benzerlik aramasına olanak tanır.',
                'rag.intro.step.2.formula.label': 'Sorgu Gömme:',
                'rag.intro.step.3.title': 'Vektör Veritabanından Geri Getirme',
                'rag.intro.step.3.description': 'Sorgu gömme vektörü, benzerlik metrikleri (kosinüs benzerliği gibi) kullanılarak vektör veritabanındaki tüm belge gömme vektörleriyle karşılaştırılır. En ilgili K belge geri getirilir.',
                'rag.intro.step.3.formula.label': 'Benzerlik Hesaplama:',
                'rag.intro.step.3.formula.explanation': 'Sorgu vektörü q ve belge vektörü d arasındaki kosinüs benzerliği',
                'rag.intro.step.4.title': 'Artırma (Augmentation)',
                'rag.intro.step.4.description': 'Geri getirilen belgeler, LLM\'in daha bilgili bir cevap üretmek için kullanabileceği bağlamı içeren artırılmış bir prompt oluşturmak için orijinal sorguyla birleştirilir.',
                'rag.intro.step.4.example.title': 'Artırılmış Prompt Yapısı:',
                'rag.intro.step.5.title': 'Üretim (Generation)',
                'rag.intro.step.5.description': 'LLM hem önceden eğitilmiş bilgisini hem de geri getirilen bağlamı kullanarak bir yanıt üretir. Bu, sağlanan belgelere dayalı, daha doğru, güncel ve gerekçelendirilmiş cevaplarla sonuçlanır.',
                'rag.intro.step.5.example.title': 'Nihai Çıktı',
                'rag.intro.step.5.example.description': 'LLM şunları birleştiren kapsamlı bir cevap üretir:',
                'rag.intro.step.5.example.general': 'Ön eğitimden genel bilgi',
                'rag.intro.step.5.example.specific': 'Geri getirilen belgelerden özel bilgi',
                'rag.intro.step.5.example.contextual': 'Sorgunun bağlamsal anlayışı',
                'rag.intro.technical.overview.title': 'RAG Mimarisi Genel Bakış',
                'rag.intro.technical.overview.description': 'RAG iki ana aşamadan oluşur:',
                'rag.intro.technical.overview.ingestion': 'Veri Alımı Aşaması: Harici bilgi kaynakları işlenir, parçalara bölünür, gömülür ve bir vektör veritabanında depolanır',
                'rag.intro.technical.overview.retrieval': 'Geri Getirme Aşaması: Kullanıcı sorguları ilgili belgelerin geri getirilmesini tetikler, bunlar daha sonra LLM\'in üretimini artırmak için kullanılır',
                'rag.intro.technical.comparison.title': 'RAG vs Geleneksel LLM',
                'rag.intro.technical.comparison.table.feature': 'Özellik',
                'rag.intro.technical.comparison.table.traditional': 'Geleneksel LLM',
                'rag.intro.technical.comparison.table.rag': 'RAG',
                'rag.intro.technical.comparison.knowledge.name': 'Bilgi Kaynağı',
                'rag.intro.technical.comparison.knowledge.traditional': 'Yalnızca eğitim verisi (statik)',
                'rag.intro.technical.comparison.knowledge.rag': 'Eğitim verisi + Harici belgeler (dinamik)',
                'rag.intro.technical.comparison.uptodate.name': 'Güncel Bilgi',
                'rag.intro.technical.comparison.uptodate.traditional': 'Eğitim kesme tarihiyle sınırlı',
                'rag.intro.technical.comparison.uptodate.rag': 'En son bilgilere erişebilir',
                'rag.intro.technical.comparison.domain.name': 'Alana Özel',
                'rag.intro.technical.comparison.domain.traditional': 'Eğitim alanıyla sınırlı',
                'rag.intro.technical.comparison.domain.rag': 'Alana özel belgeleri kullanabilir',
                'rag.intro.technical.comparison.hallucination.name': 'Halüsinasyon',
                'rag.intro.technical.comparison.hallucination.traditional': 'Daha yüksek risk',
                'rag.intro.technical.comparison.hallucination.rag': 'Daha düşük risk (geri getirilen belgelere dayalı)',
                'rag.intro.technical.comparison.transparency.name': 'Şeffaflık',
                'rag.intro.technical.comparison.transparency.traditional': 'Kara kutu',
                'rag.intro.technical.comparison.transparency.rag': 'Kaynakları (geri getirilen belgeler) alıntılayabilir',
                'rag.intro.technical.math.title': 'Matematiksel Formülasyon',
                'rag.intro.technical.math.formula.label': 'RAG Üretimi:',
                'rag.intro.technical.math.formula.explanation': 'Burada x sorgu, y üretilen cevap, z ise Z kümesinden geri getirilen belgelerdir. RAG belgeleri z\'yi geri getirir ve üretimi hem x hem de z\'ye koşullandırır.',
                'rag.intro.examples.qa.title': 'Soru Cevaplama',
                'rag.intro.examples.qa.description': 'RAG, belirli belgeler veya bilgi tabanları hakkındaki soruları cevaplamada mükemmeldir. Model ilgili pasajları geri getirebilir ve bir cevap sentezleyebilir.',
                'rag.intro.examples.chatbot.title': 'Şirket Bilgisiyle Chatbot\'lar',
                'rag.intro.examples.chatbot.description': 'İç şirket belgeleri indekslenebilir, chatbot\'ların RAG kullanarak şirket politikaları, ürünleri veya prosedürleri hakkında soruları cevaplamasına olanak tanır.',
                'rag.intro.examples.research.title': 'Araştırma Yardımı',
                'rag.intro.examples.research.description': 'RAG, ilgili makaleleri veya belgeleri geri getirerek ve en son araştırmaya dayalı özetler veya cevaplar üreterek araştırmacılara yardımcı olabilir.',

                'llm-problems.title': 'Büyük Dil Modellerinin Sorunları ve Sınırlamaları (LLM Problems & Limitations)',
                'llm-problems.intro': 'Büyük dil modellerinin (Large Language Models - LLMs) sınırlamalarını anlamak, RAG\'ın neden gerekli olduğunu açıklamaya yardımcı olur. LLM\'ler RAG\'ın ele aldığı birkaç kritik zorlukla karşılaşır.',
                'llm-problems.beginner.title': 'RAG Neden Var',
                'llm-problems.beginner.description': 'Büyük Dil Modelleri inanılmaz derecede güçlüdür, ancak artırma olmadan birçok gerçek dünya uygulaması için uygun olmayan temel sınırlamalara sahiptirler:',
                'llm-problems.beginner.training': 'Yalnızca eğitim verilerinde olanları bilirler',
                'llm-problems.beginner.cutoff': 'Eğitim kesme tarihlerinden sonraki bilgilere erişemezler',
                'llm-problems.beginner.private': 'Özel veya alana özel verilere erişimleri yoktur',
                'llm-problems.beginner.hallucinate': 'Bazen "halüsinasyon" yapar veya bilgi uydururlar',
                'llm-problems.beginner.expensive': 'Onları eğitmek son derece pahalıdır',
                'llm-problems.beginner.solution': 'RAG, pahalı yeniden eğitim gerektirmeden LLM\'lere çıkarım zamanında harici bilgi kaynaklarına erişim sağlayarak bu sorunları çözer.',
                'llm-problems.technical.title': 'Detaylı Sorun Analizi',
                'llm-problems.technical.cutoff.title': '1. Bilgi Kesme Tarihleri',
                'llm-problems.technical.cutoff.problem': 'Sorun: LLM\'lerin bir eğitim kesme tarihi vardır. Bu tarihten sonra meydana gelen olaylar, keşifler veya bilgiler hakkında bilgileri yoktur.',
                'llm-problems.technical.cutoff.example': 'Örnek: GPT-3.5, Eylül 2021\'e kadar olan verilerle eğitildi. 2022, 2023 veya 2024\'teki olayları bilmiyor.',
                'llm-problems.technical.cutoff.solution': 'RAG Çözümü: Güncel belgeleri indeksleyerek, RAG temel model güncel olmasa bile güncel bilgi sağlayabilir.',
                'llm-problems.technical.domain.title': '2. Alana Özel Bilgi Eksikliği',
                'llm-problems.technical.domain.problem': 'Sorun: Genel LLM\'ler tıp, hukuk veya belirli endüstriler gibi uzmanlaşmış alanlarda derin bilgiye sahip olmayabilir.',
                'llm-problems.technical.domain.example': 'Örnek: Belirli bir şirketin iç süreçleri veya özel teknolojisi hakkında sorma.',
                'llm-problems.technical.domain.solution': 'RAG Çözümü: Uzman düzeyinde bilgi sağlamak için alana özel belgeleri, araştırma makalelerini veya bilgi tabanlarını indeksleyin.',
                'llm-problems.technical.private.title': '3. Özel Veri Eksikliği',
                'llm-problems.technical.private.problem': 'Sorun: LLM\'ler eğitim verilerinde olmayan özel, gizli veya mülkiyet bilgilerine erişemez.',
                'llm-problems.technical.private.example': 'Örnek: Müşteri verileri, iç raporlar, gizli belgeler.',
                'llm-problems.technical.private.solution': 'RAG Çözümü: Özel belgeleri güvenli bir vektör veritabanında indeksleyin, LLM\'in bunlara eğitimde açığa çıkarmadan erişmesine olanak tanır.',
                'llm-problems.technical.sources.title': '4. Güvenilir Kaynakların Kaybı',
                'llm-problems.technical.sources.problem': 'Sorun: LLM\'ler eğitim sırasında çeşitli kaynaklardan bilgileri karıştırır, kaynakları doğrulamayı veya alıntılamayı imkansız hale getirir.',
                'llm-problems.technical.sources.example': 'Örnek: Bilginin Wikipedia\'dan mı, bir blogdan mı yoksa bir araştırma makalesinden mi geldiğini söyleyemez.',
                'llm-problems.technical.sources.solution': 'RAG Çözümü: Geri getirilen belgeler alıntılanabilir, kullanıcıların kaynakları doğrulamasına ve bilgiye güvenmesine olanak tanır.',
                'llm-problems.technical.hallucination.title': '5. Olasılıksal Çıktı / Halüsinasyon',
                'llm-problems.technical.hallucination.problem': 'Sorun: LLM\'ler metni olasılıksal olarak üretir ve "halüsinasyon" yapabilir - makul görünen ancak yanlış olan bilgiler uydurabilir.',
                'llm-problems.technical.hallucination.example': 'Örnek: Sahte alıntılar oluşturma, istatistik uydurma veya gerçekler icat etme.',
                'llm-problems.technical.hallucination.solution': 'RAG Çözümü: Üretimi geri getirilen belgelere dayandırarak, RAG halüsinasyonu azaltır ve daha gerçekçi çıktılar üretir.',
                'llm-problems.technical.expense.title': '6. Hesaplama Maliyeti',
                'llm-problems.technical.expense.problem': 'Sorun: Büyük dil modellerini eğitmek büyük hesaplama kaynakları, GPU\'lar ve zaman gerektirir. Onları yeni bilgilerle güncellemek yeniden eğitim anlamına gelir.',
                'llm-problems.technical.expense.example': 'Örnek: GPT-3\'ü eğitmek milyonlarca dolara mal oldu ve haftalarca binlerce GPU gerektirdi.',
                'llm-problems.technical.expense.solution': 'RAG Çözümü: Yeniden eğitim gerekmez. Yeni belgeleri vektör veritabanına eklemeniz yeterlidir. Güncellemek çok daha ucuz ve hızlıdır.',

                'rag-arch.title': 'RAG Mimarisi',
                'rag-arch.intro': 'RAG iki aşamalı bir mimari izler: Veri Alımı (Data Ingestion - çevrimdışı) ve Geri Getirme ile Artırılmış Üretim (Retrieval-Augmented Generation - çevrimiçi). Bu mimariyi anlamak, etkili RAG sistemleri uygulamak için çok önemlidir.',
                'rag-arch.beginner.system': 'İki Aşamalı Sistem:',
                'rag-arch.beginner.phase1': 'Aşama 1 - Veri Alımı (Kurulum): Bir kütüphaneyi organize etmek gibi. Belgeler işlenir, indekslenir ve daha sonra hızlıca bulunabilmeleri için depolanır.',
                'rag-arch.beginner.phase2': 'Aşama 2 - Geri Getirme (Çalışma Zamanı): Kütüphaneyi kullanmak gibi. Birisi soru sorduğunda, ilgili kitapları bulur ve cevaplamak için kullanırsınız.',
                'rag-arch.beginner.insight': 'Anahtar içgörü, pahalı işlemenin (gömme üretimi, indeksleme) kurulum sırasında bir kez gerçekleşmesi, hızlı geri getirmenin ise her sorgu geldiğinde gerçekleşmesidir.',
                'rag-arch.step.title': 'RAG Mimarisi: İki Aşama',
                'rag-arch.step.1.title': 'Aşama 1: Veri Alımı - Belge Toplama',
                'rag-arch.step.1.description': 'Harici bilgi kaynakları toplanır. Bunlar PDF\'ler, web sayfaları, veritabanları veya sistemin erişmesini istediğiniz bilgileri içeren herhangi bir metin tabanlı belge olabilir.',
                'rag-arch.step.1.example.title': 'Veri Kaynakları',
                'rag-arch.step.1.example.documents': 'Belgeler: PDF, HTML, JSON, CSV, XLSX, DOCX, PPTX',
                'rag-arch.step.1.example.images': 'Görüntüler: JPG, PNG, GIF, TIF',
                'rag-arch.step.1.example.multimodal': 'Çok Modlu: Ses, Video',
                'rag-arch.step.2.title': 'Aşama 1: Veri Alımı - Parçalama (Chunking)',
                'rag-arch.step.2.description': 'Belgeler daha küçük parçalara bölünür. Bu önemlidir çünkü:',
                'rag-arch.step.2.limit': 'LLM\'lerin bağlam uzunluk sınırları vardır',
                'rag-arch.step.2.precise': 'Daha küçük parçalar daha hassas geri getirmeye olanak tanır',
                'rag-arch.step.2.relevant': 'Yalnızca ilgili bölümlerin geri getirilmesini sağlar',
                'rag-arch.step.2.example.title': 'Parçalama Stratejileri',
                'rag-arch.step.2.example.description': 'Yaygın yaklaşımlar: Sabit boyutlu parçalar, cümle tabanlı parçalar, anlamsal parçalar (ilgili cümleleri gruplama)',
                'rag-arch.step.3.title': 'Aşama 1: Veri Alımı - Gömme ve Depolama',
                'rag-arch.step.3.description': 'Her parça bir gömme modeli kullanılarak bir vektöre (gömme) dönüştürülür. Bu gömme vektörleri bir vektör veritabanında depolanır, aranabilir bir indeks oluşturur.',
                'rag-arch.step.3.formula.label': 'Gömme Süreci:',
                'rag-arch.step.4.title': 'Aşama 2: Geri Getirme - Sorgu İşleme',
                'rag-arch.step.4.description': 'Bir kullanıcı sorgusu geldiğinde, aynı model kullanılarak bir gömme vektörüne dönüştürülür. Bu sorgu gömme vektörü, benzer belge parçalarını bulmak için vektör veritabanında aramak için kullanılır.',
                'rag-arch.step.4.formula.label': 'Geri Getirme Süreci:',
                'rag-arch.step.5.title': 'Aşama 2: Geri Getirme - Artırma ve Üretim',
                'rag-arch.step.5.description': 'Geri getirilen parçalar sorguyla birleştirilerek artırılmış bir prompt oluşturulur. LLM hem önceden eğitilmiş bilgisini hem de geri getirilen bağlamı kullanarak bir yanıt üretir.',
                'rag-arch.step.5.example.title': 'Tam Akış',
                'rag-arch.step.5.example.description': 'Sorgu (Q) + Geri Getirilen Belgeler (R) + Prompt Şablonu (P) → LLM → Cevap',
                'rag-arch.technical.pipeline.title': 'Tam RAG Boru Hattı',
                'rag-arch.technical.components.title': 'Anahtar Bileşenler',
                'rag-arch.technical.components.phase1.title': 'Aşama 1 Bileşenleri',
                'rag-arch.technical.components.phase1.loaders': 'Belge Yükleyicileri',
                'rag-arch.technical.components.phase1.splitters': 'Metin Bölücüler/Parçalayıcılar',
                'rag-arch.technical.components.phase1.embeddings': 'Gömme Modelleri',
                'rag-arch.technical.components.phase1.vectordb': 'Vektör Veritabanları',
                'rag-arch.technical.components.phase2.title': 'Aşama 2 Bileşenleri',
                'rag-arch.technical.components.phase2.query': 'Sorgu Gömme',
                'rag-arch.technical.components.phase2.search': 'Benzerlik Arama',
                'rag-arch.technical.components.phase2.prompt': 'Prompt Yapısı',
                'rag-arch.technical.components.phase2.llm': 'LLM Üretimi',

                'data-ingestion.title': 'Veri Alımı Aşaması (Data Ingestion Phase)',
                'data-ingestion.intro': 'Veri alımı aşaması, harici bilgi kaynaklarını verimli geri getirme için hazırlar. Bu çevrimdışı süreç, ham belgeleri aranabilir vektör temsillerine (vector representations) dönüştürür.',
                'data-ingestion.beginner.analogy': 'Kütüphane Organizasyonu Benzetmesi: Bir kütüphanede kitapları hızlıca bulabilmeniz için önce birinin şunları yapması gerekir:',
                'data-ingestion.beginner.collect': 'Tüm kitapları toplamak',
                'data-ingestion.beginner.read': 'Her kitabın ne hakkında olduğunu okumak ve anlamak',
                'data-ingestion.beginner.catalog': 'Bir katalog/indeks sistemi oluşturmak',
                'data-ingestion.beginner.organize': 'Kitapları raflarda organize etmek',
                'data-ingestion.beginner.same': 'Veri alımı belgeler için de aynısını yapar: onları işler, içeriklerini anlar (gömme vektörleri aracılığıyla) ve aranabilir bir veritabanında organize eder.',
                'data-ingestion.technical.sources.title': 'Harici Bilgi Kaynakları',
                'data-ingestion.technical.sources.table.category': 'Kategori',
                'data-ingestion.technical.sources.table.types': 'Dosya Türleri',
                'data-ingestion.technical.sources.table.processing': 'İşleme',
                'data-ingestion.technical.sources.documents.name': 'Belgeler',
                'data-ingestion.technical.sources.documents.types': 'PDF, HTML, JSON, CSV, XLSX, Text, DOCX, PPTX',
                'data-ingestion.technical.sources.documents.processing': 'Metin çıkarımı, ayrıştırma',
                'data-ingestion.technical.sources.images.name': 'Görüntüler',
                'data-ingestion.technical.sources.images.types': 'JPG, PNG, GIF, TIF',
                'data-ingestion.technical.sources.images.processing': 'OCR, görüntü modelleri',
                'data-ingestion.technical.sources.multimodal.name': 'Çok Modlu',
                'data-ingestion.technical.sources.multimodal.types': 'Ses, Video',
                'data-ingestion.technical.sources.multimodal.processing': 'Transkripsiyon, kare çıkarımı',
                'data-ingestion.technical.crawling.title': 'Belge Tarama ve İşleme',
                'data-ingestion.technical.crawling.description': 'Belgelerin şunlara ihtiyacı vardır:',
                'data-ingestion.technical.crawling.crawled': 'Taranmış/Toplanmış: Kaynaklardan alınmış (web tarama, dosya sistemleri, API\'ler)',
                'data-ingestion.technical.crawling.parsed': 'Ayrıştırılmış: Yerel formatlarından çıkarılmış (PDF ayrıştırma, HTML ayrıştırma)',
                'data-ingestion.technical.crawling.cleaned': 'Temizlenmiş: Gürültüyü kaldırma, metni tutarlı şekilde formatlama',
                'data-ingestion.technical.crawling.validated': 'Doğrulanmış: Kalite ve ilgili olduğundan emin olma',
                'data-ingestion.technical.chunking.title': 'Parçalama Stratejileri',
                'data-ingestion.technical.chunking.fixed.title': '1. Sabit Boyutlu Parçalama',
                'data-ingestion.technical.chunking.fixed.description': 'Metni sabit karakter/token sayısına sahip parçalara bölün. Basit ancak cümleleri bozabilir.',
                'data-ingestion.technical.chunking.sentence.title': '2. Cümle Tabanlı Parçalama',
                'data-ingestion.technical.chunking.sentence.description': 'Cümle sınırlarında bölün. Anlamsal birimleri daha iyi korur.',
                'data-ingestion.technical.chunking.semantic.title': '3. Anlamsal Parçalama',
                'data-ingestion.technical.chunking.semantic.description': 'Anlamsal benzerliğe dayalı olarak ilgili cümleleri gruplayın. En sofistike yaklaşım.',
                'data-ingestion.technical.embedding.title': 'Gömme Üretimi',
                'data-ingestion.technical.embedding.description': 'Her parça bir gömme modeli kullanılarak yoğun bir vektöre dönüştürülür. Uyumluluğu sağlamak için hem alım hem de geri getirme için aynı model kullanılmalıdır.',
                'data-ingestion.technical.embedding.formula.label': 'Gömme Süreci:',
                'data-ingestion.technical.embedding.formula.explanation': 'Tipik olarak 384, 512 veya 768 boyutlu vektörler üretir',
                'data-ingestion.technical.storage.title': 'Vektör Veritabanı Depolama',
                'data-ingestion.technical.storage.description': 'Gömme vektörleri şunlarla birlikte bir vektör veritabanında saklanır:',
                'data-ingestion.technical.storage.chunks': 'Orijinal metin parçaları',
                'data-ingestion.technical.storage.metadata': 'Meta veriler (kaynak, zaman damgası, vb.)',
                'data-ingestion.technical.storage.indexes': 'Hızlı benzerlik araması için indeksler',

                'vector-db.title': 'Vektör Veritabanları (Vector Databases)',
                'vector-db.intro': 'Vektör veritabanları (Vector databases), yüksek boyutlu vektörleri (gömme vektörleri/embeddings) depolamak ve verimli bir şekilde aramak için tasarlanmış özel veritabanlarıdır. RAG geri getirme için çok önemli olan hızlı benzerlik araması (similarity search) sağlarlar.',
                'vector-db.beginner.representation': 'Sayı Temsili: Kelimeler sayı olarak temsil edilebildiği gibi, tüm belgeler de vektörler (sayı listeleri) olarak temsil edilebilir.',
                'vector-db.beginner.example.title': 'Örnek: Metinden Vektöre',
                'vector-db.beginner.example.text': 'Metin: "My name is Paul"',
                'vector-db.beginner.example.vector': 'Vektör: [0.1, 0.8, 0.9, 0.75, ...] (tipik olarak 384-768 sayı)',
                'vector-db.beginner.database': 'Vektör Veritabanı: Benzer vektörleri bulmak için optimize edilmiş özel bir veritabanı. Bir sorgu vektörüyle arama yaptığınızda, milyonlarca belgeden bile en benzer belge vektörlerini hızlıca bulur.',
                'vector-db.technical.what.title': 'Vektör Veritabanları Nedir?',
                'vector-db.technical.what.description': 'Tam eşleşmeler veya anahtar kelimelerle arama yapan geleneksel veritabanlarının aksine, vektör veritabanları anlamsal olarak benzer içeriği bulmak için benzerlik metrikleri (kosinüs benzerliği gibi) kullanır. Bu anlamsal aramayı mümkün kılar - farklı kelimeler kullansalar bile benzer şeyler ifade eden belgeleri bulmak.',
                'vector-db.technical.options.title': 'Vektör Veritabanı Seçenekleri',
                'vector-db.technical.options.table.database': 'Veritabanı',
                'vector-db.technical.options.table.type': 'Tür',
                'vector-db.technical.options.table.features': 'Özellikler',
                'vector-db.technical.options.table.usecase': 'Kullanım Durumu',
                'vector-db.technical.options.faiss.name': 'FAISS',
                'vector-db.technical.options.faiss.type': 'Açık Kaynak',
                'vector-db.technical.options.faiss.features': 'Hızlı, verimli, Facebook araştırması',
                'vector-db.technical.options.faiss.usecase': 'Araştırma, küçük ila orta ölçek',
                'vector-db.technical.options.chromadb.name': 'ChromaDB',
                'vector-db.technical.options.chromadb.type': 'Açık Kaynak',
                'vector-db.technical.options.chromadb.features': 'Kullanımı kolay, Python-öncelikli',
                'vector-db.technical.options.chromadb.usecase': 'Prototipleme, küçük uygulamalar',
                'vector-db.technical.options.weaviate.name': 'Weaviate',
                'vector-db.technical.options.weaviate.type': 'Açık Kaynak / Ücretli',
                'vector-db.technical.options.weaviate.features': 'GraphQL API, bulut seçeneği',
                'vector-db.technical.options.weaviate.usecase': 'Üretim uygulamaları',
                'vector-db.technical.options.pinecone.name': 'Pinecone',
                'vector-db.technical.options.pinecone.type': 'Ücretli (Yönetilen)',
                'vector-db.technical.options.pinecone.features': 'Tamamen yönetilen, ölçeklenebilir',
                'vector-db.technical.options.pinecone.usecase': 'Kurumsal, büyük ölçek',
                'vector-db.technical.options.zilliz.name': 'Zilliz',
                'vector-db.technical.options.zilliz.type': 'Açık Kaynak / Ücretli',
                'vector-db.technical.options.zilliz.features': 'Milvus tabanlı, yüksek performans',
                'vector-db.technical.options.zilliz.usecase': 'Büyük ölçek, üretim',
                'vector-db.technical.search.title': 'Vektör Araması Nasıl Çalışır',
                'vector-db.technical.search.description': 'Vektör veritabanları hızlı benzerlik aramasına olanak tanımak için özel indeksleme algoritmaları kullanır:',
                'vector-db.technical.search.ivf': 'Ters Dosya İndeksi (IVF): Benzer vektörleri birlikte gruplar',
                'vector-db.technical.search.pq': 'Ürün Kuantizasyonu (PQ): Daha hızlı arama için vektörleri sıkıştırır',
                'vector-db.technical.search.hnsw': 'Hiyerarşik Gezinilebilir Küçük Dünya (HNSW): Grafik tabanlı yaklaşık arama',
                'vector-db.technical.code.title': 'Kod Örneği',

                'embeddings.title': 'Gömme Vektörleri (Embeddings)',
                'embeddings.intro': 'Gömme vektörleri (Embeddings), metni (veya diğer verileri) anlamsal anlamı yakalayan yoğun vektör temsillerine (dense vector representations) dönüştürür. Farklı gömme algoritmaları RAG sistemlerinde farklı amaçlara hizmet eder.',
                'embeddings.beginner.what': 'Gömme Vektörleri Nedir? Gömme vektörleri anlamı yakalayan metnin sayısal temsilleridir. Benzer anlamlara sahip kelimeler veya cümleler benzer gömme vektörlerine sahiptir (yüksek boyutlu uzayda birbirine yakın vektörler).',
                'embeddings.beginner.analogy.title': 'Basit Benzetme',
                'embeddings.beginner.analogy.description': 'Gömme vektörlerini bir haritadaki koordinatlar gibi düşünün. Benzer şeyler ifade eden kelimeler birbirine yakın yerleştirilir. "Kedi" ve "yavru kedi" komşu olurken, "kedi" ve "uçak" uzakta olur.',
                'embeddings.beginner.allows': 'Bu, bilgisayarların anlamsal ilişkileri anlamasına olanak tanır - farklı kelimeler kullansalar bile benzer şeyler ifade eden belgeleri bulmak.',
                'embeddings.technical.title': 'Gömme Algoritmaları',
                'embeddings.technical.onehot.title': '1. One-Hot Encoding',
                'embeddings.technical.onehot.description': 'Açıklama: Her kelime tek bir 1 ve diğer tüm konumlar 0 olan benzersiz bir ikili vektör alır. Basit ancak ilişkileri yakalamaz.',
                'embeddings.technical.onehot.limitation': 'Sınırlama: Vektörler dik açılıdır - anlamsal benzerlik yakalanmaz',
                'embeddings.technical.tfidf.title': '2. TF-IDF (Terim Frekansı-Ters Belge Frekansı)',
                'embeddings.technical.tfidf.description': 'Açıklama: Kelimeleri bir belgede derleme göre ne kadar önemli olduklarına göre ağırlandırır. Yaygın kelimeler daha düşük ağırlıklar alır.',
                'embeddings.technical.tfidf.formula.label': 'TF-IDF Formülü:',
                'embeddings.technical.tfidf.formula.explanation': 'Burada N toplam belge sayısı, df(t) t terimini içeren belgelerdir',
                'embeddings.technical.tfidf.usecase': 'Kullanım Durumu: Anahtar kelime tabanlı arama, seyrek vektörler için iyi',
                'embeddings.technical.cbow.title': '3. Birlikte Oluşum Matrisi ve CBOW',
                'embeddings.technical.cbow.matrix': 'Birlikte Oluşum Matrisi: Bağlam pencerelerinde kelimelerin ne sıklıkla birlikte göründüğünü sayar. Sık birlikte oluşan kelimeler muhtemelen ilgilidir.',
                'embeddings.technical.cbow.cbow': 'CBOW (Sürekli Kelime Çantası): Bağlamından bir kelimeyi tahmin eder. Kelime gömme vektörlerini öğrenmek için bir sinir ağı eğitir.',
                'embeddings.technical.cbow.formula.label': 'CBOW Hedefi:',
                'embeddings.technical.cbow.formula.explanation': 'Çevredeki bağlam kelimeleri verildiğinde merkez kelime wₜ\'yi tahmin eder',
                'embeddings.technical.skipgram.title': '4. Word2Vec - Skip-gram',
                'embeddings.technical.skipgram.description': 'Açıklama: Bir merkez kelimeden bağlam kelimelerini tahmin eder. CBOW\'un tersi. Nadir kelimeler için genellikle daha iyi performans gösterir.',
                'embeddings.technical.skipgram.formula.label': 'Skip-gram Hedefi:',
                'embeddings.technical.skipgram.formula.explanation': 'Merkez kelime wₜ verildiğinde çevredeki bağlam kelimelerini tahmin eder',
                'embeddings.technical.skipgram.result': 'Sonuç: Anlamsal ve sözdizimsel ilişkileri yakalayan yoğun vektörler (tipik olarak 100-300 boyut)',
                'embeddings.technical.positional.title': '5. Konumsal Kodlama (Positional Encoding)',
                'embeddings.technical.positional.description': 'Açıklama: Gömme vektörlerine konum bilgisi ekler. Transformer\'ların kelime sırasını anlaması için kritiktir.',
                'embeddings.technical.positional.formula.label': 'Konumsal Kodlama:',
                'embeddings.technical.positional.usecase': 'Kullanım Durumu: Transformer modellerinde kelime gömme vektörleriyle birleştirilir',
                'embeddings.technical.elmo.title': '6. ELMO (Dil Modellerinden Gömme Vektörleri)',
                'embeddings.technical.elmo.description': 'Açıklama: Bağlam-bilinçli gömme vektörleri oluşturmak için çift yönlü LSTM kullanır. Aynı kelime bağlama göre farklı gömme vektörleri alır.',
                'embeddings.technical.elmo.innovation': 'Yenilik: İlk büyük bağlamsallaştırılmış gömme modeli. "Nehir kıyısı"ndaki "bank" ile "para bankası"ndaki "bank" farklı gömme vektörleri alır.',
                'embeddings.technical.elmo.limitation': 'Sınırlama: Transformer tabanlı modeller (BERT, vb.) tarafından değiştirildi, bunlar daha verimli ve etkilidir',
                'embeddings.technical.modern.title': 'Modern Gömme Modelleri',
                'embeddings.technical.modern.table.model': 'Model',
                'embeddings.technical.modern.table.type': 'Tür',
                'embeddings.technical.modern.table.dimensions': 'Boyutlar',
                'embeddings.technical.modern.table.usecase': 'Kullanım Durumu',
                'embeddings.technical.modern.minilm.name': 'all-MiniLM-L6',
                'embeddings.technical.modern.minilm.type': 'Açık Kaynak',
                'embeddings.technical.modern.minilm.dimensions': '384',
                'embeddings.technical.modern.minilm.usecase': 'Hızlı, verimli, iyi kalite',
                'embeddings.technical.modern.hf.name': 'HuggingFace Embeddings',
                'embeddings.technical.modern.hf.type': 'Açık Kaynak',
                'embeddings.technical.modern.hf.dimensions': '768',
                'embeddings.technical.modern.hf.usecase': 'Çeşitli modeller mevcut',
                'embeddings.technical.modern.gemini.name': 'Gemini Embedding',
                'embeddings.technical.modern.gemini.type': 'Açık Kaynak',
                'embeddings.technical.modern.gemini.dimensions': '768',
                'embeddings.technical.modern.gemini.usecase': 'Google\'ın gömme modeli',
                'embeddings.technical.modern.nomic.name': 'Nomic Embed',
                'embeddings.technical.modern.nomic.type': 'Ücretli',
                'embeddings.technical.modern.nomic.dimensions': '768',
                'embeddings.technical.modern.nomic.usecase': 'Yüksek kalite, ticari',
                'embeddings.technical.modern.titan.name': 'Titan Embed',
                'embeddings.technical.modern.titan.type': 'Ücretli',
                'embeddings.technical.modern.titan.dimensions': '1024',
                'embeddings.technical.modern.titan.usecase': 'AWS gömme modeli',
                'embeddings.technical.representations.title': 'Metin, Görüntü ve Sayısal Temsiller',
                'embeddings.technical.representations.description': 'Gömme vektörleri metinle sınırlı değildir:',
                'embeddings.technical.representations.text': 'Metin: Cümle transformer\'ları, kelime gömme vektörleri',
                'embeddings.technical.representations.images': 'Görüntüler: Görüntü modelleri (CLIP, ResNet) görüntü gömme vektörleri oluşturur',
                'embeddings.technical.representations.numeric': 'Sayısal: Doğrudan veya öğrenilmiş temsiller aracılığıyla gömülebilir',
                'embeddings.technical.representations.multimodal': 'Çok Modlu: CLIP gibi modeller ortak metin-görüntü gömme vektörleri oluşturur',
                'embeddings.technical.evaluation.title': 'Gömme Değerlendirmesi',
                'embeddings.technical.evaluation.description': 'Modeller çeşitli görevleri test eden MTEB (Kitle Metin Gömme Kıyaslaması) gibi kıyaslamalar kullanılarak değerlendirilir:',
                'embeddings.technical.evaluation.similarity': 'Anlamsal benzerlik',
                'embeddings.technical.evaluation.clustering': 'Kümeleme',
                'embeddings.technical.evaluation.classification': 'Sınıflandırma',
                'embeddings.technical.evaluation.retrieval': 'Geri getirme',
                'embeddings.technical.onehot.title': '1. One-Hot Encoding',
                'embeddings.technical.onehot.description': 'Açıklama: Her kelime tek bir 1 ve diğer tüm konumlar 0 olan benzersiz bir ikili vektör alır. Basit ancak ilişkileri yakalamaz.',
                'embeddings.technical.onehot.limitation': 'Sınırlama: Vektörler dik açılıdır - anlamsal benzerlik yakalanmaz',
                'embeddings.technical.tfidf.title': '2. TF-IDF (Terim Frekansı-Ters Belge Frekansı)',
                'embeddings.technical.tfidf.description': 'Açıklama: Kelimeleri bir belgede derleme göre ne kadar önemli olduklarına göre ağırlandırır. Yaygın kelimeler daha düşük ağırlıklar alır.',
                'embeddings.technical.tfidf.formula.label': 'TF-IDF Formülü:',
                'embeddings.technical.tfidf.formula.explanation': 'Burada N toplam belge sayısı, df(t) t terimini içeren belgelerdir',
                'embeddings.technical.tfidf.usecase': 'Kullanım Durumu: Anahtar kelime tabanlı arama, seyrek vektörler için iyi',
                'embeddings.technical.cbow.title': '3. Birlikte Oluşum Matrisi ve CBOW',
                'embeddings.technical.cbow.matrix': 'Birlikte Oluşum Matrisi: Bağlam pencerelerinde kelimelerin ne sıklıkla birlikte göründüğünü sayar. Sık birlikte oluşan kelimeler muhtemelen ilgilidir.',
                'embeddings.technical.cbow.cbow': 'CBOW (Sürekli Kelime Çantası): Bağlamından bir kelimeyi tahmin eder. Kelime gömme vektörlerini öğrenmek için bir sinir ağı eğitir.',
                'embeddings.technical.cbow.formula.label': 'CBOW Hedefi:',
                'embeddings.technical.cbow.formula.explanation': 'Çevredeki bağlam kelimeleri verildiğinde merkez kelime wₜ\'yi tahmin eder',
                'embeddings.technical.skipgram.title': '4. Word2Vec - Skip-gram',
                'embeddings.technical.skipgram.description': 'Açıklama: Bir merkez kelimeden bağlam kelimelerini tahmin eder. CBOW\'un tersi. Nadir kelimeler için genellikle daha iyi performans gösterir.',
                'embeddings.technical.skipgram.formula.label': 'Skip-gram Hedefi:',
                'embeddings.technical.skipgram.formula.explanation': 'Merkez kelime wₜ verildiğinde çevredeki bağlam kelimelerini tahmin eder',
                'embeddings.technical.skipgram.result': 'Sonuç: Anlamsal ve sözdizimsel ilişkileri yakalayan yoğun vektörler (tipik olarak 100-300 boyut)',
                'embeddings.technical.positional.title': '5. Konumsal Kodlama (Positional Encoding)',
                'embeddings.technical.positional.description': 'Açıklama: Gömme vektörlerine konum bilgisi ekler. Transformer\'ların kelime sırasını anlaması için kritiktir.',
                'embeddings.technical.positional.formula.label': 'Konumsal Kodlama:',
                'embeddings.technical.positional.usecase': 'Kullanım Durumu: Transformer modellerinde kelime gömme vektörleriyle birleştirilir',
                'embeddings.technical.elmo.title': '6. ELMO (Dil Modellerinden Gömme Vektörleri)',
                'embeddings.technical.elmo.description': 'Açıklama: Bağlam-bilinçli gömme vektörleri oluşturmak için çift yönlü LSTM kullanır. Aynı kelime bağlama göre farklı gömme vektörleri alır.',
                'embeddings.technical.elmo.innovation': 'Yenilik: İlk büyük bağlamsallaştırılmış gömme modeli. "Nehir kıyısı"ndaki "bank" ile "para bankası"ndaki "bank" farklı gömme vektörleri alır.',
                'embeddings.technical.elmo.limitation': 'Sınırlama: Transformer tabanlı modeller (BERT, vb.) tarafından değiştirildi, bunlar daha verimli ve etkilidir',
                'embeddings.technical.modern.title': 'Modern Gömme Modelleri',
                'embeddings.technical.modern.table.model': 'Model',
                'embeddings.technical.modern.table.type': 'Tür',
                'embeddings.technical.modern.table.dimensions': 'Boyutlar',
                'embeddings.technical.modern.table.usecase': 'Kullanım Durumu',
                'embeddings.technical.modern.minilm.name': 'all-MiniLM-L6',
                'embeddings.technical.modern.minilm.type': 'Açık Kaynak',
                'embeddings.technical.modern.minilm.dimensions': '384',
                'embeddings.technical.modern.minilm.usecase': 'Hızlı, verimli, iyi kalite',
                'embeddings.technical.modern.hf.name': 'HuggingFace Embeddings',
                'embeddings.technical.modern.hf.type': 'Açık Kaynak',
                'embeddings.technical.modern.hf.dimensions': '768',
                'embeddings.technical.modern.hf.usecase': 'Çeşitli modeller mevcut',
                'embeddings.technical.modern.gemini.name': 'Gemini Embedding',
                'embeddings.technical.modern.gemini.type': 'Açık Kaynak',
                'embeddings.technical.modern.gemini.dimensions': '768',
                'embeddings.technical.modern.gemini.usecase': 'Google\'ın gömme modeli',
                'embeddings.technical.modern.nomic.name': 'Nomic Embed',
                'embeddings.technical.modern.nomic.type': 'Ücretli',
                'embeddings.technical.modern.nomic.dimensions': '768',
                'embeddings.technical.modern.nomic.usecase': 'Yüksek kalite, ticari',
                'embeddings.technical.modern.titan.name': 'Titan Embed',
                'embeddings.technical.modern.titan.type': 'Ücretli',
                'embeddings.technical.modern.titan.dimensions': '1024',
                'embeddings.technical.modern.titan.usecase': 'AWS gömme modeli',
                'embeddings.technical.representations.title': 'Metin, Görüntü ve Sayısal Temsiller',
                'embeddings.technical.representations.description': 'Gömme vektörleri metinle sınırlı değildir:',
                'embeddings.technical.representations.text': 'Metin: Cümle transformer\'ları, kelime gömme vektörleri',
                'embeddings.technical.representations.images': 'Görüntüler: Görüntü modelleri (CLIP, ResNet) görüntü gömme vektörleri oluşturur',
                'embeddings.technical.representations.numeric': 'Sayısal: Doğrudan veya öğrenilmiş temsiller aracılığıyla gömülebilir',
                'embeddings.technical.representations.multimodal': 'Çok Modlu: CLIP gibi modeller ortak metin-görüntü gömme vektörleri oluşturur',
                'embeddings.technical.evaluation.title': 'Gömme Değerlendirmesi',
                'embeddings.technical.evaluation.description': 'Modeller çeşitli görevleri test eden MTEB (Kitle Metin Gömme Kıyaslaması) gibi kıyaslamalar kullanılarak değerlendirilir:',
                'embeddings.technical.evaluation.similarity': 'Anlamsal benzerlik',
                'embeddings.technical.evaluation.clustering': 'Kümeleme',
                'embeddings.technical.evaluation.classification': 'Sınıflandırma',
                'embeddings.technical.evaluation.retrieval': 'Geri getirme',

                'retrieval.title': 'Geri Getirme Mekanizmaları (Retrieval Mechanisms)',
                'retrieval.intro': 'Geri getirme (Retrieval), bir sorgu verildiğinde vektör veritabanından ilgili belgeleri bulma sürecidir. Farklı geri getirme stratejileri doğruluk, hız ve hesaplama maliyeti arasında denge kurar.',
                'retrieval.beginner.finding': 'Benzer Belgeleri Bulma: Bir soru sorduğunuzda, sistem en ilgili belgeleri bulması gerekir. Bunu şu şekilde yapar:',
                'retrieval.beginner.convert': 'Sorunuzu bir vektöre (gömme) dönüştürme',
                'retrieval.beginner.compare': 'Bu vektörü veritabanındaki tüm belge vektörleriyle karşılaştırma',
                'retrieval.beginner.find': 'En benzer olanları bulma (benzerlik metrikleri kullanarak)',
                'retrieval.beginner.return': 'En ilgili K belgeyi döndürme',
                'retrieval.beginner.librarian': 'Sorunuzun anlamını anlayan ve farklı kelimeler kullansalar bile benzer konuları tartışan kitapları bulan bir kütüphaneci gibi düşünün.',
                'retrieval.step.title': 'Geri Getirme Süreci',
                'retrieval.step.1.title': 'Sorgu Gömme (Query Embedding)',
                'retrieval.step.1.description': 'Kullanıcı sorgusu, veri alımı sırasında kullanılan aynı gömme modeli kullanılarak bir gömme vektörüne dönüştürülür. Bu, benzerlik karşılaştırması için uyumluluğu sağlar.',
                'retrieval.step.1.formula.label': 'Sorgu Gömme:',
                'retrieval.step.2.title': 'Benzerlik Hesaplama',
                'retrieval.step.2.description': 'Sorgu gömme vektörü, kosinüs benzerliği kullanılarak tüm belge gömme vektörleriyle karşılaştırılır. Bu, vektörler arasındaki açıyı ölçer, anlamsal benzerliği gösterir.',
                'retrieval.step.2.formula.label': 'Kosinüs Benzerliği:',
                'retrieval.step.2.formula.explanation': '-1 ile 1 arasında bir değer döndürür. Daha yüksek değerler daha benzer anlamına gelir.',
                'retrieval.step.3.title': 'Sıralama ve Seçim',
                'retrieval.step.3.description': 'Belgeler benzerlik skoruna göre sıralanır. En üst K belge (tipik olarak 3-10) sorgu için en ilgili olarak seçilir.',
                'retrieval.step.3.example.title': 'Top-K Geri Getirme',
                'retrieval.step.3.example.description': 'Yaygın değerler: Odaklanmış cevaplar için K=3, kapsamlı kapsam için K=5-10',
                'retrieval.step.4.title': 'Belge Geri Getirme',
                'retrieval.step.4.description': 'En üst K gömme vektörlerine karşılık gelen orijinal metin parçaları geri getirilir. Bunlar LLM için prompt\'u artırmak için kullanılacaktır.',
                'retrieval.step.4.example.title': 'Sonuç',
                'retrieval.step.4.example.description': 'Döndürür: [Belge 1 metni, Belge 2 metni, ..., Belge K metni]',
                'retrieval.technical.dpr.title': 'Sinirsel Geri Getirici: DPR (Yoğun Pasaj Geri Getirme)',
                'retrieval.technical.dpr.description': 'DPR: İki ayrı kodlayıcı kullanan bir sinirsel geri getirme sistemi:',
                'retrieval.technical.dpr.passage': 'Pasaj Kodlayıcı: Belge pasajlarını vektörlere kodlar',
                'retrieval.technical.dpr.question': 'Soru Kodlayıcı: Soruları/sorguları vektörlere kodlar',
                'retrieval.technical.dpr.trained': 'Her iki kodlayıcı da ilgili soru-pasaj çiftleri arasındaki benzerliği maksimize etmek için birlikte eğitilir.',
                'retrieval.technical.biencoder.title': 'Çift Kodlayıcılar (Bi-Encoders)',
                'retrieval.technical.biencoder.arch.title': 'Mimari',
                'retrieval.technical.biencoder.arch.description': 'Çift kodlayıcılar iki ayrı kodlayıcı kullanır:',
                'retrieval.technical.biencoder.arch.advantage': 'Avantaj: Verimli - gömme vektörleri önceden hesaplanabilir ve saklanabilir. Çıkarım zamanında hızlı.',
                'retrieval.technical.cosine.title': 'Kosinüs Benzerliği',
                'retrieval.technical.cosine.formula.label': 'Kosinüs Benzerliği Formülü:',
                'retrieval.technical.cosine.formula.explanation': 'İki vektör arasındaki açının kosinüsünü ölçer. Aralık: [-1, 1]. Daha yüksek değerler daha büyük benzerliği gösterir.',
                'retrieval.technical.cosine.why': 'Neden Kosinüs Benzerliği? Ölçek-bağımsızdır - büyüklükten ziyade yöne odaklanır, bu da anlamsal benzerlik için idealdir.',
                'retrieval.technical.vectors.title': 'Yoğun Vektörler vs Seyrek Vektörler',
                'retrieval.technical.vectors.table.type': 'Tür',
                'retrieval.technical.vectors.table.description': 'Açıklama',
                'retrieval.technical.vectors.table.usecase': 'Kullanım Durumu',
                'retrieval.technical.vectors.dense.name': 'Yoğun Vektörler',
                'retrieval.technical.vectors.dense.description': 'Çoğu değer sıfır değildir, anlamsal anlamı yakalar',
                'retrieval.technical.vectors.dense.usecase': 'Anlamsal arama, sinirsel geri getirme',
                'retrieval.technical.vectors.sparse.name': 'Seyrek Vektörler',
                'retrieval.technical.vectors.sparse.description': 'Çoğu değer sıfırdır (örn., TF-IDF, BM25)',
                'retrieval.technical.vectors.sparse.usecase': 'Anahtar kelime tabanlı arama, tam eşleşme',
                'retrieval.technical.semantic.title': 'Anlamsal Benzerlik',
                'retrieval.technical.semantic.description': 'Anahtar kelime eşleştirmesinin aksine, anlamsal benzerlik farklı kelimelerle bile benzer şeyler ifade eden belgeleri bulur:',
                'retrieval.technical.semantic.example.title': 'Örnek',
                'retrieval.technical.semantic.example.query': 'Sorgu: "Şifremi nasıl sıfırlarım?"',
                'retrieval.technical.semantic.example.match': 'Eşleşebilir: "Şifre kurtarma talimatları", "Hesap erişim sıfırlama", "Unutulan şifre kılavuzu" - tam kelime eşleşmeleri olmadan bile',
                'retrieval.technical.ranking.title': 'Geri Getirilen Belgeleri Sıralama',
                'retrieval.technical.ranking.description': 'Benzerlik hesaplamasından sonra, belgeler sıralanır ve filtrelenir:',
                'retrieval.technical.ranking.score': 'Benzerlik Skoru: Birincil sıralama faktörü',
                'retrieval.technical.ranking.rerank': 'Yeniden Sıralama: Daha sofistike modeller kullanarak isteğe bağlı ikinci aşama sıralama',
                'retrieval.technical.ranking.diversity': 'Çeşitlilik: Çeşitli belge kapsamını sağlamak için filtreleyebilir',
                'retrieval.technical.ranking.threshold': 'İlgililik Eşiği: Düşük benzerlikli belgeleri filtrele',

                'augmentation.title': 'Artırma (Augmentation)',
                'augmentation.intro': 'Artırma (Augmentation), kullanıcı sorgusunu geri getirilen belgelerle birleştirerek LLM için bağlam açısından zengin bir istem (context-rich prompt) oluşturur. Etkili istem (prompt) oluşturma, yüksek kaliteli RAG çıktıları için çok önemlidir.',
                'augmentation.beginner.building': 'Bağlam Oluşturma: Artırma, bir öğrenciye bir deneme yazmadan önce hem soruyu HEM de ilgili referans materyallerini vermek gibidir. Yalnızca hafızaya güvenmek yerine, sağlanan belgeleri kullanarak daha doğru bir cevap verebilirler.',
                'augmentation.beginner.parts': 'Artırılmış prompt üç anahtar bölüm içerir:',
                'augmentation.beginner.query': 'Q (Sorgu): Kullanıcının orijinal sorusu',
                'augmentation.beginner.retrieved': 'R (Geri Getirilen Belgeler): Vektör veritabanından ilgili bağlam',
                'augmentation.beginner.prompt': 'P (Prompt Şablonu): LLM\'e bağlamı nasıl kullanacağını söyleyen talimatlar',
                'augmentation.technical.construction.title': 'Prompt Yapısı',
                'augmentation.technical.construction.description': 'Artırılmış prompt yapılandırılmış bir formatı takip eder:',
                'augmentation.technical.assembly.title': 'Bağlam Birleştirme (Q + R + P)',
                'augmentation.technical.assembly.components.title': 'Bileşenler',
                'augmentation.technical.assembly.components.query': 'Q (Sorgu): Orijinal kullanıcı sorusu veya prompt\'u',
                'augmentation.technical.assembly.components.retrieved': 'R (Geri Getirilen Belgeler): Vektör aramasından en ilgili K belge',
                'augmentation.technical.assembly.components.prompt': 'P (Prompt Şablonu): LLM için talimatlar, formatlama ve yönergeler',
                'augmentation.technical.bestpractices.title': 'Prompt Mühendisliği En İyi Uygulamaları',
                'augmentation.technical.bestpractices.instructions.title': '1. Net Talimatlar',
                'augmentation.technical.bestpractices.instructions.description': 'LLM\'e açıkça yalnızca sağlanan bağlamı kullanmasını ve mümkün olduğunda kaynakları alıntılamasını söyleyin.',
                'augmentation.technical.bestpractices.ordering.title': '2. Bağlam Sıralaması',
                'augmentation.technical.bestpractices.ordering.description': 'En ilgili belgeleri önce yerleştirin. Bazı modeller önceki bağlama daha fazla dikkat eder.',
                'augmentation.technical.bestpractices.length.title': '3. Uzunluk Yönetimi',
                'augmentation.technical.bestpractices.length.description': 'Bağlam uzunluğunu model sınırlarıyla dengeleyin. Çok fazla bağlam önemli bilgileri seyreltebilir.',
                'augmentation.technical.bestpractices.formatting.title': '4. Formatlama',
                'augmentation.technical.bestpractices.formatting.description': 'LLM\'in bağlamı etkili bir şekilde ayrıştırmasına yardımcı olmak için net ayırıcılar, başlıklar ve yapı kullanın.',
                'augmentation.technical.advanced.title': 'Gelişmiş Prompt Teknikleri',
                'augmentation.technical.advanced.fewshot': 'Az Örnekli Örnekler: Prompt\'ta örnek Soru-Cevap çiftleri dahil edin',
                'augmentation.technical.advanced.cot': 'Düşünce Zinciri: LLM\'den adım adım akıl yürütmesini isteyin',
                'augmentation.technical.advanced.consistency': 'Öz-Tutarlılık: Birden fazla cevap üretin ve en tutarlı olanı seçin',
                'augmentation.technical.advanced.citation': 'Alıntı Gereksinimleri: LLM\'den hangi belgeyi kullandığını alıntılamasını isteyin',

                'generation-types.title': 'Çıkarımsal vs Özetleyici Üretim (Extractive vs Abstractive Generation)',
                'generation-types.intro': 'RAG sistemleri iki şekilde cevap üretebilir: çıkarımsal (extractive - tam metni kopyalama) veya özetleyici (abstractive - yeni metin sentezleme). Her yaklaşımın farklı güçlü yönleri ve kullanım alanları vardır.',
                'generation-types.beginner.extractive': 'Çıkarımsal: Bir kitapta bir cümleyi vurgulamak gibi - tam bilgi parçasını bulur ve olduğu gibi sunarsınız.',
                'generation-types.beginner.abstractive': 'Özetleyici: Bir özet yazmak gibi - bilgiyi anlar ve kendi kelimelerinizle yeniden ifade edersiniz, potansiyel olarak birden fazla kaynağı birleştirirsiniz.',
                'generation-types.technical.extractive.title': '1. Çıkarımsal Üretim',
                'generation-types.technical.extractive.definition': 'Tanım: Geri getirilen belgelerden aynı bilgi parçasını değişiklik yapmadan döndürür.',
                'generation-types.technical.extractive.advantages': 'Avantajlar: Doğru, orijinal kelimeleri korur, halüsinasyon riski yok',
                'generation-types.technical.extractive.disadvantages': 'Dezavantajlar: Uzun olabilir, bilgiyi sentezlemez',
                'generation-types.technical.abstractive.title': '2. Özetleyici Üretim',
                'generation-types.technical.abstractive.definition': 'Tanım: Aynı bağlamla değiştirilmiş bilgi, yeniden ifade etme veya birden fazla kaynaktan sentezleme gibi.',
                'generation-types.technical.abstractive.advantages': 'Avantajlar: Daha özlü, birden fazla kaynağı sentezleyebilir, doğal dil',
                'generation-types.technical.abstractive.disadvantages': 'Dezavantajlar: Halüsinasyon riski, hatalar ekleyebilir',
                'generation-types.technical.comparison.title': 'Karşılaştırma',
                'generation-types.technical.comparison.table.feature': 'Özellik',
                'generation-types.technical.comparison.table.extractive': 'Çıkarımsal',
                'generation-types.technical.comparison.table.abstractive': 'Özetleyici',
                'generation-types.technical.comparison.output.name': 'Çıktı',
                'generation-types.technical.comparison.output.extractive': 'Belgelerden tam metin',
                'generation-types.technical.comparison.output.abstractive': 'Yeniden ifade edilmiş/sentezlenmiş metin',
                'generation-types.technical.comparison.accuracy.name': 'Doğruluk',
                'generation-types.technical.comparison.accuracy.extractive': 'Çok yüksek (değişiklik yok)',
                'generation-types.technical.comparison.accuracy.abstractive': 'Yüksek (ancak hatalar ekleyebilir)',
                'generation-types.technical.comparison.conciseness.name': 'Özlülük',
                'generation-types.technical.comparison.conciseness.extractive': 'Uzun olabilir',
                'generation-types.technical.comparison.conciseness.abstractive': 'Daha özlü',
                'generation-types.technical.comparison.multisource.name': 'Çok Kaynaklı',
                'generation-types.technical.comparison.multisource.extractive': 'Sınırlı',
                'generation-types.technical.comparison.multisource.abstractive': 'Birden fazla kaynağı sentezleyebilir',
                'generation-types.technical.comparison.usecase.name': 'Kullanım Durumu',
                'generation-types.technical.comparison.usecase.extractive': 'Gerçekçi Soru-Cevap, alıntılar',
                'generation-types.technical.comparison.usecase.abstractive': 'Özetler, açıklamalar',
                'generation-types.technical.when.title': 'Ne Zaman Kullanılır',
                'generation-types.technical.when.extractive.title': 'Çıkarımsal Ne Zaman Kullanılır:',
                'generation-types.technical.when.extractive.exact': 'Tam kelimeler önemlidir (yasal, tıbbi)',
                'generation-types.technical.when.extractive.citations': 'Alıntılar gereklidir',
                'generation-types.technical.when.extractive.hallucination': 'Halüsinasyon riskini en aza indirmek kritiktir',
                'generation-types.technical.when.extractive.simple': 'Basit gerçekçi sorular',
                'generation-types.technical.when.abstractive.title': 'Özetleyici Ne Zaman Kullanılır:',
                'generation-types.technical.when.abstractive.synthesize': 'Birden fazla kaynağı sentezlemek gerekir',
                'generation-types.technical.when.abstractive.concise': 'Özlü, doğal dil cevapları istenir',
                'generation-types.technical.when.abstractive.summaries': 'Özetler veya açıklamalar oluşturma',
                'generation-types.technical.when.abstractive.readability': 'Kullanıcı deneyimi okunabilirliği önceliklendirir',

                'memory-types.title': 'Parametrik vs Parametrik Olmayan Bellek (Parametric vs Non-Parametric Memory)',
                'memory-types.intro': 'Parametrik (parametric) ve parametrik olmayan (non-parametric) bellek arasındaki farkı anlamak, RAG\'ın LLM yeteneklerini nasıl genişlettiğini açıklamaya yardımcı olur. Geleneksel LLM\'ler parametrik bellek kullanırken, RAG parametrik olmayan bellek ekler.',
                'memory-types.beginner.types': '<strong>İki Bellek Türü:</strong>',
                'memory-types.beginner.parametric': '<strong>Parametrik Bellek (Parametric Memory):</strong> Bilgi modelin ağırlıklarında saklanır. Gerçekleri ezberlemek gibi - bir kez öğrenildiğinde, modelin bir parçasıdır (yeniden eğitime kadar).',
                'memory-types.beginner.nonparametric': '<strong>Parametrik Olmayan Bellek (Non-Parametric Memory):</strong> Bilgi harici olarak (bir veritabanında gibi) saklanır. Bir referans kütüphanesine sahip olmak gibi - beyninizi değiştirmeden yeni kitaplar ekleyebilirsiniz.',
                'memory-types.beginner.combines': 'RAG ikisini birleştirir: modelin parametrik belleği (genel bilgi) ile parametrik olmayan bellek (harici belgeler) kapsamlı cevaplar sağlamak için.',
                'memory-types.technical.parametric.title': 'Parametrik Bellek (Parametric Memory)',
                'memory-types.technical.parametric.how.title': 'Nasıl Çalışır',
                'memory-types.technical.parametric.how.description': 'Bilgi eğitim sırasında modelin ağırlıklarında/parametrelerinde kodlanır. Örneğin, BART (400M parametre) gibi önceden eğitilmiş bir Seq2Seq modeli bilgiyi ağırlıklarında saklar.',
                'memory-types.technical.parametric.formula.label': 'Parametrik Bilgi:',
                'memory-types.technical.parametric.formula.explanation': 'Eğitim Verisi → Model Parametreleri → NLP Görevleri',
                'memory-types.technical.parametric.characteristics.title': '<strong>Özellikler:</strong>',
                'memory-types.technical.parametric.characteristics.fixed': 'Eğitim zamanında sabit',
                'memory-types.technical.parametric.characteristics.retraining': 'Güncellemek için yeniden eğitim gerektirir',
                'memory-types.technical.parametric.characteristics.limited': 'Model boyutuyla sınırlı',
                'memory-types.technical.parametric.characteristics.fast': 'Hızlı erişim (harici arama yok)',
                'memory-types.technical.nonparametric.title': 'Parametrik Olmayan Bellek (Non-Parametric Memory)',
                'memory-types.technical.nonparametric.how.title': 'Nasıl Çalışır',
                'memory-types.technical.nonparametric.how.description': 'Bilgi harici veri kaynaklarında (vektör veritabanları) yoğun vektörler olarak saklanır. Sinirsel Geri Getirici (DPR - Dense Passage Retrieval gibi) aracılığıyla erişilir.',
                'memory-types.technical.nonparametric.formula.label': 'Parametrik Olmayan Bilgi:',
                'memory-types.technical.nonparametric.formula.explanation': 'Harici Veri Kaynakları → Vektör İndeksi → Benzerlik Araması ile Geri Getirilir',
                'memory-types.technical.nonparametric.characteristics.title': '<strong>Özellikler:</strong>',
                'memory-types.technical.nonparametric.characteristics.dynamic': 'Dinamik - yeniden eğitim olmadan güncellenebilir',
                'memory-types.technical.nonparametric.characteristics.unlimited': 'Sınırsız boyut (depolama ile ölçeklenir)',
                'memory-types.technical.nonparametric.characteristics.retrieval': 'Geri getirme adımı gerektirir (daha yavaş)',
                'memory-types.technical.nonparametric.characteristics.latest': 'En son bilgileri içerebilir',
                'memory-types.technical.comparison.title': 'Karşılaştırma',
                'memory-types.technical.comparison.table.feature': 'Özellik',
                'memory-types.technical.comparison.table.parametric': 'Parametrik Bellek',
                'memory-types.technical.comparison.table.nonparametric': 'Parametrik Olmayan Bellek',
                'memory-types.technical.comparison.storage.name': 'Depolama',
                'memory-types.technical.comparison.storage.parametric': 'Model ağırlıkları',
                'memory-types.technical.comparison.storage.nonparametric': 'Harici vektör veritabanı',
                'memory-types.technical.comparison.update.name': 'Güncelleme',
                'memory-types.technical.comparison.update.parametric': 'Yeniden eğitim gerektirir',
                'memory-types.technical.comparison.update.nonparametric': 'Veritabanına ekle',
                'memory-types.technical.comparison.size.name': 'Boyut Sınırı',
                'memory-types.technical.comparison.size.parametric': 'Model kapasitesi',
                'memory-types.technical.comparison.size.nonparametric': 'Depolama kapasitesi',
                'memory-types.technical.comparison.speed.name': 'Erişim Hızı',
                'memory-types.technical.comparison.speed.parametric': 'Anında (çıkarım)',
                'memory-types.technical.comparison.speed.nonparametric': 'Arama gerektirir',
                'memory-types.technical.comparison.example.name': 'Örnek',
                'memory-types.technical.comparison.example.parametric': 'BART 400M parametre',
                'memory-types.technical.comparison.example.nonparametric': 'Vektör DB\'de indekslenmiş Wikipedia',
                'memory-types.technical.hybrid.title': 'Hibrit Yaklaşım: RAG',
                'memory-types.technical.hybrid.description': 'RAG her iki bellek türünü birleştirir:',
                'memory-types.technical.hybrid.parametric': '<strong>Parametrik:</strong> Genel dil anlayışı, akıl yürütme, üretim yetenekleri',
                'memory-types.technical.hybrid.nonparametric': '<strong>Parametrik Olmayan:</strong> Özel gerçekler, güncel bilgiler, alan bilgisi',
                'memory-types.technical.hybrid.best': 'Bu hibrit yaklaşım her iki dünyanın da en iyisini verir: modelin öğrenilmiş yetenekleri artı harici, güncellenebilir bilgiye erişim.',

                'rag-recipes.title': 'RAG Tarifleri (RAG Recipes)',
                'rag-recipes.intro': 'Farklı RAG uygulamaları, geri getirilen belgelerin üretim sırasında nasıl kullanıldığına dair farklı stratejiler kullanır. İki ana tarif RAG Sequence ve RAG Token\'dır.',
                'rag-recipes.beginner.approaches': 'İki Yaklaşım:',
                'rag-recipes.beginner.sequence': 'RAG Sequence: Tüm boyunca aynı referans kitapları kullanarak bir deneme yazmak gibi. Belgeleri bir kez geri getirir ve tüm cevap için kullanırsınız.',
                'rag-recipes.beginner.token': 'RAG Token: Denemenizin farklı bölümleri için farklı kitaplara danışmak gibi. Üretilen cevabın farklı bölümleri için farklı belgeler geri getirebilirsiniz.',
                'rag-recipes.technical.sequence.title': '1. RAG Sequence',
                'rag-recipes.technical.sequence.definition': 'Tanım: Tüm çıktı dizisini üretmek için aynı geri getirilen belgeleri kullanır. Belgeler başlangıçta bir kez geri getirilir.',
                'rag-recipes.technical.sequence.advantages': 'Avantajlar: Basit, verimli, tutarlı bağlam',
                'rag-recipes.technical.sequence.usecase': 'Kullanım Durumu: Tek konulu sorular, odaklanmış cevaplar',
                'rag-recipes.technical.token.title': '2. RAG Token',
                'rag-recipes.technical.token.definition': 'Tanım: Nihai çıktı dizisinin farklı bölümlerini üretmek için farklı belgeler kullanabilir. Belgeler üretim sırasında birden fazla kez geri getirilebilir.',
                'rag-recipes.technical.token.advantages': 'Avantajlar: Daha esnek, çok yönlü soruları ele alabilir, uzun cevaplar için daha iyi',
                'rag-recipes.technical.token.usecase': 'Kullanım Durumu: Birden fazla kaynak gerektiren karmaşık sorular, karşılaştırmalı cevaplar',
                'rag-recipes.technical.comparison.title': 'Karşılaştırma',
                'rag-recipes.technical.comparison.table.feature': 'Özellik',
                'rag-recipes.technical.comparison.table.sequence': 'RAG Sequence',
                'rag-recipes.technical.comparison.table.token': 'RAG Token',
                'rag-recipes.technical.comparison.retrieval.name': 'Geri Getirme',
                'rag-recipes.technical.comparison.retrieval.sequence': 'Başlangıçta bir kez',
                'rag-recipes.technical.comparison.retrieval.token': 'Üretim sırasında birden fazla kez',
                'rag-recipes.technical.comparison.documents.name': 'Kullanılan Belgeler',
                'rag-recipes.technical.comparison.documents.sequence': 'Tüm çıktı için aynı belgeler',
                'rag-recipes.technical.comparison.documents.token': 'Farklı bölümler için farklı belgeler',
                'rag-recipes.technical.comparison.complexity.name': 'Karmaşıklık',
                'rag-recipes.technical.comparison.complexity.sequence': 'Daha basit',
                'rag-recipes.technical.comparison.complexity.token': 'Daha karmaşık',
                'rag-recipes.technical.comparison.efficiency.name': 'Verimlilik',
                'rag-recipes.technical.comparison.efficiency.sequence': 'Daha verimli',
                'rag-recipes.technical.comparison.efficiency.token': 'Daha az verimli (birden fazla geri getirme)',
                'rag-recipes.technical.comparison.flexibility.name': 'Esneklik',
                'rag-recipes.technical.comparison.flexibility.sequence': 'Sınırlı',
                'rag-recipes.technical.comparison.flexibility.token': 'Yüksek',
                'rag-recipes.technical.comparison.best.name': 'En İyi',
                'rag-recipes.technical.comparison.best.sequence': 'Odaklanmış, tek konulu cevaplar',
                'rag-recipes.technical.comparison.best.token': 'Karmaşık, çok yönlü sorular',
                'rag-recipes.technical.implementation.title': 'Uygulama Farklılıkları',
                'rag-recipes.technical.implementation.sequence.title': 'RAG Sequence Uygulaması',
                'rag-recipes.technical.implementation.token.title': 'RAG Token Uygulaması',
            }
        };

        function initLanguage() {
            const savedLang = localStorage.getItem('preferred-language');
            const browserLang = navigator.language.split('-')[0];

            if (savedLang && (savedLang === 'en' || savedLang === 'tr')) {
                currentLanguage = savedLang;
            } else if (browserLang === 'tr') {
                currentLanguage = 'tr';
            } else {
                currentLanguage = 'en';
            }

            const htmlRoot = document.documentElement;
            htmlRoot.lang = currentLanguage;
            translatePage();
        }

        function switchLanguage(lang) {
            if (lang !== 'en' && lang !== 'tr') return;

            currentLanguage = lang;
            const htmlRoot = document.documentElement;
            htmlRoot.lang = lang;
            localStorage.setItem('preferred-language', lang);

            translatePage();
            updateLanguageUI();

            // Re-render MathJax after translation
            if (window.MathJax && window.MathJax.startup) {
                window.MathJax.startup.promise.then(function() {
                    if (typeof MathJax.typesetPromise === 'function') {
                        MathJax.typesetPromise().catch(function(err) {
                            console.log('MathJax rendering error:', err);
                        });
                    }
                });
            }
        }

        function updateLanguageUI() {
            const toggle = document.getElementById('lang-toggle');
            const dropdown = document.getElementById('lang-dropdown');
            const options = dropdown.querySelectorAll('.lang-option');

            if (toggle) {
                toggle.textContent = currentLanguage.toUpperCase();
            }

            options.forEach(opt => {
                opt.classList.toggle('active', opt.dataset.lang === currentLanguage);
            });
        }

        function translatePage() {
            // Translate elements with data-translate attribute
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[currentLanguage] && translations[currentLanguage][key]) {
                    const translation = translations[currentLanguage][key];
                    if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
                        element.value = translation;
                    } else if (element.tagName === 'BUTTON') {
                        // Preserve HTML if it exists, otherwise set text
                        if (element.innerHTML.includes('<') || element.innerHTML.includes('&')) {
                            // Has HTML content, try to preserve structure
                            const temp = document.createElement('div');
                            temp.innerHTML = translation;
                            if (temp.children.length > 0) {
                                element.innerHTML = translation;
                            } else {
                                element.textContent = translation;
                            }
                        } else {
                            element.textContent = translation;
                        }
                    } else if (element.tagName === 'TH' || element.tagName === 'TD') {
                        // Handle table cells - preserve HTML structure if needed
                        if (translation.includes('<strong>') || translation.includes('<em>')) {
                            element.innerHTML = translation;
                        } else {
                            element.textContent = translation;
                        }
                    } else {
                        // For other elements, check if they contain HTML
                        const hasHTML = element.innerHTML !== element.textContent;
                        // Check if translation contains HTML tags
                        if (translation.includes('<strong>') || translation.includes('<em>') || translation.includes('<br')) {
                            element.innerHTML = translation;
                        } else if (hasHTML && translation.includes('<')) {
                            element.innerHTML = translation;
                        } else {
                            // Preserve existing HTML structure if element has children
                            if (element.children.length > 0 && !translation.includes('<')) {
                                // Only translate text nodes, preserve child elements
                                const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
                                const textNodes = [];
                                let node;
                                while (node = walker.nextNode()) {
                                    if (node.textContent.trim()) {
                                        textNodes.push(node);
                                    }
                                }
                                // If only one text node, replace it
                                if (textNodes.length === 1 && element.childNodes.length === 1) {
                                    element.textContent = translation;
                                } else {
                                    // For complex structures, replace entire content
                                    element.textContent = translation;
                                }
                            } else {
                                element.textContent = translation;
                            }
                        }
                    }
                }
            });

            // Translate section headings that might not have data-translate
            translateSectionHeadings();

            // Translate buttons
            translateButtons();

            updateLanguageUI();
        }

        function translateSectionHeadings() {
            const headingMap = {
                'en': {},
                'tr': {
                    '#neural-networks .card > h2': 'Sinir Ağları (Neural Networks)',
                    '#attention .card > h2': 'Dikkat Mekanizması (Attention Mechanism)',
                    '#transformer .card > h2': 'Transformer Mimarisi',
                    '#encoder-decoder .card > h2': 'Kodlayıcı vs Kod Çözücü (Encoder vs Decoder)',
                    '#pretraining-finetuning .card > h2': 'Ön Eğitim vs İnce Ayar (Pre-training vs Fine-tuning)',
                    '#rag-introduction .card > h2': 'Geri Getirme ile Artırılmış Üretim (Retrieval Augmented Generation - RAG)',
                    '#llm-problems .card > h2': 'Büyük Dil Modellerinin Sorunları ve Sınırlamaları (LLM Problems & Limitations)',
                    '#rag-architecture .card > h2': 'RAG Mimarisi',
                    '#data-ingestion .card > h2': 'Veri Alımı Aşaması (Data Ingestion Phase)',
                    '#vector-databases .card > h2': 'Vektör Veritabanları (Vector Databases)',
                    '#embeddings .card > h2': 'Gömme Vektörleri (Embeddings)',
                    '#retrieval .card > h2': 'Geri Getirme Mekanizmaları (Retrieval Mechanisms)',
                    '#augmentation .card > h2': 'Artırma (Augmentation)',
                    '#generation-types .card > h2': 'Çıkarımsal vs Özetleyici Üretim (Extractive vs Abstractive Generation)',
                    '#memory-types .card > h2': 'Parametrik vs Parametrik Olmayan Bellek (Parametric vs Non-Parametric Memory)',
                    '#rag-recipes .card > h2': 'RAG Tarifleri (RAG Recipes)',
                }
            };

            Object.keys(headingMap[currentLanguage] || {}).forEach(selector => {
                const elements = document.querySelectorAll(selector);
                const translation = headingMap[currentLanguage][selector];
                elements.forEach(el => {
                    if (translation && !el.hasAttribute('data-translate')) {
                        el.textContent = translation;
                    }
                });
            });
        }

        function translateButtons() {
            const buttonTexts = {
                'en': {},
                'tr': {
                    'Run Forward Pass': 'İleri Geçişi Çalıştır',
                    'Generate Random Attention': 'Rastgele Dikkat Oluştur',
                    'Reset': 'Sıfırla',
                    '← Previous': '← Önceki',
                    'Previous': 'Önceki',
                    'Next →': 'Sonraki →',
                    'Next': 'Sonraki'
                }
            };

            document.querySelectorAll('button, .btn').forEach(btn => {
                const originalText = btn.textContent.trim();
                if (buttonTexts[currentLanguage] && buttonTexts[currentLanguage][originalText]) {
                    if (!btn.hasAttribute('data-translate')) {
                        btn.textContent = buttonTexts[currentLanguage][originalText];
                    }
                }
            });
        }

        // Initialize language switcher UI
        function initLanguageSwitcher() {
            const toggle = document.getElementById('lang-toggle');
            const dropdown = document.getElementById('lang-dropdown');
            const dropdownBtn = dropdown?.querySelector('.lang-dropdown-btn');
            const options = dropdown?.querySelectorAll('.lang-option');

            if (toggle) {
                toggle.addEventListener('click', () => {
                    switchLanguage(currentLanguage === 'en' ? 'tr' : 'en');
                });
            }

            if (dropdownBtn) {
                dropdownBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('active');
                });
            }

            options?.forEach(opt => {
                opt.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lang = opt.dataset.lang;
                    if (lang) {
                        switchLanguage(lang);
                        dropdown.classList.remove('active');
                    }
                });
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown?.contains(e.target)) {
                    dropdown?.classList.remove('active');
                }
            });
        }

        // ============================================
        // EXPANDABLE SECTIONS HANDLER
        // ============================================
        function initExpandableSections() {
            document.querySelectorAll('.expandable-header').forEach(header => {
                header.addEventListener('click', function() {
                    const section = this.parentElement;
                    section.classList.toggle('expanded');
                });
            });
        }

        // ============================================
        // STEP-BY-STEP GUIDE HANDLER
        // ============================================
        function initStepGuides() {
            document.querySelectorAll('.step-guide').forEach(guide => {
                const steps = guide.querySelectorAll('.step-item');
                const prevBtn = guide.querySelector('.step-prev');
                const nextBtn = guide.querySelector('.step-next');
                const dots = guide.querySelectorAll('.step-dot');
                let currentStep = 0;

                function showStep(stepIndex) {
                    steps.forEach((step, idx) => {
                        step.classList.toggle('active', idx === stepIndex);
                    });
                    dots.forEach((dot, idx) => {
                        dot.classList.toggle('active', idx === stepIndex);
                        dot.classList.toggle('completed', idx < stepIndex);
                    });

                    if (prevBtn) prevBtn.disabled = stepIndex === 0;
                    if (nextBtn) nextBtn.disabled = stepIndex === steps.length - 1;

                    currentStep = stepIndex;
                }

                if (prevBtn) {
                    prevBtn.addEventListener('click', () => {
                        if (currentStep > 0) showStep(currentStep - 1);
                    });
                }

                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        if (currentStep < steps.length - 1) showStep(currentStep + 1);
                    });
                }

                showStep(0);
            });
        }

        // ============================================
        // INITIALIZE ALL VISUALIZATIONS
        // ============================================
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing visualizations...');

            // Check if TensorFlow.js is loaded
            if (typeof tf === 'undefined') {
                console.error('TensorFlow.js is not loaded!');
                alert('Error: TensorFlow.js library failed to load. Please check your internet connection and refresh the page.');
                return;
            }
            console.log('TensorFlow.js loaded successfully');

            // Check if D3.js is loaded
            if (typeof d3 === 'undefined') {
                console.error('D3.js is not loaded!');
                alert('Error: D3.js library failed to load. Please check your internet connection and refresh the page.');
                return;
            }
            console.log('D3.js loaded successfully');

            // Initialize visualizations
            try {
                const nnViz = new NeuralNetworkViz('nn-canvas');
                console.log('Neural network viz initialized');
            } catch (e) {
                console.error('Error initializing neural network viz:', e);
            }

            try {
                const attViz = new AttentionViz('attention-viz');
                console.log('Attention viz initialized');
            } catch (e) {
                console.error('Error initializing attention viz:', e);
            }

            try {
                const transViz = new TransformerViz('transformer-viz');
                console.log('Transformer viz initialized');
            } catch (e) {
                console.error('Error initializing transformer viz:', e);
            }


            // ============================================
            // SMOOTH SCROLL & NAVIGATION HIGHLIGHTING
            // ============================================
            document.querySelectorAll('nav a').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });

            // Highlight active nav item on scroll
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('nav a');

            function highlightNav() {
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    if (window.scrollY >= sectionTop - 150) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.style.color = '';
                    if (link.getAttribute('href') === `#${current}`) {
                        link.style.color = 'var(--primary-orange)';
                    }
                });
            }

            window.addEventListener('scroll', highlightNav);
            highlightNav();

            // ============================================
            // INTERSECTION OBSERVER FOR ANIMATIONS
            // ============================================
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            // Observe cards for scroll animations
            document.querySelectorAll('.card').forEach(card => {
                observer.observe(card);
            });

            // Initialize language system
            initLanguageSwitcher();
            initLanguage();

            // Initialize expandable sections and step guides
            initExpandableSections();
            initStepGuides();

            // Render MathJax after content is loaded
            function renderMathJax() {
                if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
                    MathJax.typesetPromise().catch(function(err) {
                        console.log('MathJax rendering error:', err);
                    });
                } else if (window.MathJax && typeof MathJax.typeset === 'function') {
                    // Fallback for older MathJax versions
                    MathJax.typeset();
                } else {
                    // Retry if MathJax isn't loaded yet
                    setTimeout(renderMathJax, 100);
                }
            }

            // Wait for MathJax to be ready
            if (window.MathJax && window.MathJax.startup) {
                window.MathJax.startup.promise.then(function() {
                    renderMathJax();
                });
            } else {
                // Fallback: try after a delay
                setTimeout(renderMathJax, 500);
            }
        });
