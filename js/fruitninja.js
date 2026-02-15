// Fruit Ninja Mini-Game for Iris's Garden
// Interacts with Elian based on performance

const fruitNinjaGame = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    fruits: [],
    particles: [],
    score: 0,
    active: false,
    lastTime: 0,
    spawnTimer: 0,
    mouseX: 0,
    mouseY: 0,
    isMouseDown: false,
    trail: [],
    emojis: ['🍉', '🍎', '🍓', '🍌', '🍍', '🍑'],
    
    init: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clear container
        container.innerHTML = '';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.borderRadius = '15px';
        container.style.cursor = 'crosshair';
        container.style.background = 'rgba(0, 0, 0, 0.2)';

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = container.clientWidth;
        this.canvas.height = 350; // Fixed height
        this.canvas.style.display = 'block';
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');

        // Add start button overlay
        this.startBtn = document.createElement('button');
        this.startBtn.innerText = 'Start Fruit Ninja! ⚔️';
        this.startBtn.className = 'wam-btn'; // Reusing whack-a-mole style
        this.startBtn.style.position = 'absolute';
        this.startBtn.style.top = '50%';
        this.startBtn.style.left = '50%';
        this.startBtn.style.transform = 'translate(-50%, -50%)';
        this.startBtn.style.zIndex = '10';
        this.startBtn.onclick = () => {
            this.startBtn.style.display = 'none';
            this.startGame();
        };
        container.appendChild(this.startBtn);

        // Score display
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.style.position = 'absolute';
        this.scoreDisplay.style.top = '10px';
        this.scoreDisplay.style.left = '10px';
        this.scoreDisplay.style.color = 'white';
        this.scoreDisplay.style.fontSize = '20px';
        this.scoreDisplay.style.fontWeight = 'bold';
        this.scoreDisplay.style.pointerEvents = 'none';
        this.scoreDisplay.innerText = 'Score: 0';
        container.appendChild(this.scoreDisplay);

        // Events
        const getPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const onStart = (e) => {
            e.preventDefault();
            this.isMouseDown = true;
            const pos = getPos(e);
            this.mouseX = pos.x;
            this.mouseY = pos.y;
            this.trail = [{x: pos.x, y: pos.y, life: 1.0}];
        };

        const onMove = (e) => {
            e.preventDefault();
            if (this.isMouseDown) {
                const pos = getPos(e);
                this.mouseX = pos.x;
                this.mouseY = pos.y;
                this.trail.push({x: pos.x, y: pos.y, life: 1.0});
                if(this.trail.length > 10) this.trail.shift();
            }
        };

        const onEnd = (e) => {
            if(e.cancelable) e.preventDefault();
            this.isMouseDown = false;
            this.trail = [];
        };

        this.canvas.addEventListener('mousedown', onStart);
        this.canvas.addEventListener('mousemove', onMove);
        this.canvas.addEventListener('mouseup', onEnd);
        this.canvas.addEventListener('mouseleave', onEnd);
        
        this.canvas.addEventListener('touchstart', onStart, {passive: false});
        this.canvas.addEventListener('touchmove', onMove, {passive: false});
        this.canvas.addEventListener('touchend', onEnd);

        // Handle resize
        window.addEventListener('resize', () => {
             if(container.clientWidth && this.canvas) {
                 this.canvas.width = container.clientWidth;
                 this.width = this.canvas.width;
             }
        });
    },

    startGame: function() {
        if(this.active) return;
        this.score = 0;
        this.active = true;
        this.fruits = [];
        this.particles = [];
        this.trail = [];
        this.lastTime = performance.now();
        this.spawnTimer = 0;
        this.scoreDisplay.innerText = 'Score: 0';
        
        this.speak("接招！Elian 扔水果啦！🍎");
        
        requestAnimationFrame((t) => this.loop(t));
    },

    loop: function(timestamp) {
        if (!this.active) return;
        
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); // Cap dt
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        if(this.active) {
            requestAnimationFrame((t) => this.loop(t));
        }
    },

    update: function(dt) {
        // Spawn fruits
        this.spawnTimer += dt;
        if (this.spawnTimer > 1.2) { // Spawn rate
            this.spawnFruit();
            this.spawnTimer = 0;
        }

        // Update trail life
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life -= dt * 5;
            if (this.trail[i].life <= 0) this.trail.splice(i, 1);
        }

        // Update fruits
        for (let i = this.fruits.length - 1; i >= 0; i--) {
            let f = this.fruits[i];
            
            // Physics
            f.x += f.vx;
            f.y += f.vy;
            f.vy += 10 * dt; // Gravity
            f.rotation += f.rotSpeed * dt;

            // Check collision with trail
            if (!f.sliced && this.isMouseDown && this.checkSlice(f)) {
                this.sliceFruit(f, i);
                continue; // Skip rest of update for this fruit since it's removed
            }

            // Remove if out of bounds (below screen)
            if (f.y > this.height + 50) {
                this.fruits.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 15 * dt; // Gravity
            p.life -= dt;
            
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    },

    draw: function() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Fruits
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let f of this.fruits) {
            this.ctx.save();
            this.ctx.translate(f.x, f.y);
            this.ctx.rotate(f.rotation);
            this.ctx.fillText(f.type, 0, 0);
            this.ctx.restore();
        }

        // Draw Particles
        for (let p of this.particles) {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }

        // Draw Trail
        if (this.trail.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 8;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
        }
    },

    spawnFruit: function() {
        const x = 50 + Math.random() * (this.width - 100);
        const y = this.height + 40;
        // Adjust velocities for canvas coordinates
        const vx = (Math.random() - 0.5) * 4; 
        const vy = -(Math.random() * 5 + 7); // Initial upward velocity
        const type = this.emojis[Math.floor(Math.random() * this.emojis.length)];
        
        this.fruits.push({
            x, y, vx, vy,
            type,
            rotation: 0,
            rotSpeed: (Math.random() - 0.5) * 5,
            sliced: false
        });
    },

    checkSlice: function(fruit) {
        // Check distance to any point in the recent trail
        // Simple approximation: check distance to current mouse pos
        const dx = this.mouseX - fruit.x;
        const dy = this.mouseY - fruit.y;
        return (dx*dx + dy*dy) < 2500; // 50px radius squared
    },

    sliceFruit: function(fruit, index) {
        this.score += 10;
        this.scoreDisplay.innerText = `Score: ${this.score}`;
        
        // Remove fruit
        this.fruits.splice(index, 1);
        
        // Add particles
        const color = this.getFruitColor(fruit.type);
        for(let i=0; i<10; i++) {
            this.particles.push({
                x: fruit.x,
                y: fruit.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1.0,
                size: Math.random() * 5 + 3,
                color: color
            });
        }

        // Elian Logic
        if (this.score % 50 === 0) {
            const praises = ["好刀法！", "切得漂亮！", "加上这些水果做沙拉吧！", "继续继续！"];
            this.speak(praises[Math.floor(Math.random() * praises.length)] + ` (${this.score}分)`);
        } else if (this.score === 10) {
            this.speak("第一刀命中！🎯");
        }
    },

    getFruitColor: function(type) {
        if(type === '🍉' || type === '🍎' || type === '🍓') return '#ff1744';
        if(type === '🍌' || type === '🍍') return '#ffea00';
        if(type === '🍑') return '#ffab91';
        return '#fff';
    },
    
    speak: function(text) {
        const dialogueBox = document.getElementById('npc-dialogue');
        if (dialogueBox) {
            dialogueBox.innerText = `Elian: ${text}`;
            dialogueBox.classList.add('show');
            // Hide after 3s
            setTimeout(() => {
                if(dialogueBox.innerText.includes(text)) {
                    dialogueBox.classList.remove('show');
                }
            }, 3000);
        }
    }
};

// Auto-init if container exists
document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('fruit-ninja-game')) {
        fruitNinjaGame.init('fruit-ninja-game');
    }
});
