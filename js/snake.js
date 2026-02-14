function initSnakeGame() {
    const container = document.getElementById('vine-snake-game');
    if (!container) return;
    
    // Clean up any existing canvas or overlays to prevent duplicates on re-init
    container.innerHTML = '';
    
    // UI Setup
    container.style.position = 'relative'; // For absolute overlay
    
    // Score Display
    const scoreDiv = document.createElement('div');
    scoreDiv.id = 'snake-score';
    scoreDiv.style.fontFamily = 'Nunito, sans-serif';
    scoreDiv.style.fontWeight = 'bold';
    scoreDiv.style.marginBottom = '10px';
    scoreDiv.innerText = 'Score: 0';
    container.appendChild(scoreDiv);

    // Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.backgroundColor = 'rgba(34, 139, 34, 0.2)'; // Semi-transparent green
    canvas.style.border = '2px solid #4CAF50';
    canvas.style.borderRadius = '10px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    // Game State
    let snake = [{x: 10, y: 10}];
    let direction = {x: 0, y: 0};
    let nextDirection = {x: 0, y: 0}; // Buffer for next frame input
    let food = {x: 5, y: 5};
    let score = 0;
    let gameRunning = false;
    let lastRenderTime = 0;
    const SNAKE_SPEED = 8; // moves per second

    // Start/Game Over Overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.background = 'rgba(255,255,255,0.8)';
    overlay.style.borderRadius = '15px';
    overlay.style.zIndex = '10';
    
    const title = document.createElement('h3');
    title.innerText = '🌿 Vine Snake';
    title.style.margin = '0 0 20px 0';
    title.style.color = '#2E7D32';
    
    const startBtn = document.createElement('button');
    startBtn.innerText = 'Start Game';
    startBtn.style.padding = '10px 25px';
    startBtn.style.fontSize = '1.1em';
    startBtn.style.background = '#4CAF50';
    startBtn.style.color = 'white';
    startBtn.style.border = 'none';
    startBtn.style.borderRadius = '25px';
    startBtn.style.cursor = 'pointer';
    startBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    startBtn.onclick = startGame;
    
    overlay.appendChild(title);
    overlay.appendChild(startBtn);
    container.appendChild(overlay);

    function startGame() {
        snake = [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}]; // Start with length 3
        direction = {x: 0, y: -1}; // Moving up initially
        nextDirection = {x: 0, y: -1};
        score = 0;
        scoreDiv.innerText = 'Score: 0';
        gameRunning = true;
        overlay.style.display = 'none';
        spawnFood();
        window.requestAnimationFrame(mainLoop);
    }

    function mainLoop(currentTime) {
        if (!gameRunning) return;
        
        window.requestAnimationFrame(mainLoop);
        
        const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
        if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;
        
        lastRenderTime = currentTime;
        update();
        draw();
    }

    function update() {
        direction = nextDirection;
        const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        // Self collision
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        // Food collision
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreDiv.innerText = `Score: ${score}`;
            spawnFood();
        } else {
            snake.pop();
        }
    }

    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake (Vine style)
        ctx.fillStyle = '#4CAF50'; // Vine green
        snake.forEach((segment, index) => {
            // Round corners for vine effect
            ctx.beginPath();
            // Using rect for compatibility if roundRect is missing, but roundRect is standard now
            if (ctx.roundRect) {
                ctx.roundRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2, 5);
            } else {
                ctx.rect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
            }
            ctx.fill();
            
            // Add leaf detail to head
            if (index === 0) {
                 ctx.fillStyle = '#2E7D32'; // Darker head
                 ctx.beginPath();
                 ctx.arc(segment.x * gridSize + gridSize/2, segment.y * gridSize + gridSize/2, 4, 0, Math.PI*2);
                 ctx.fill();
                 ctx.fillStyle = '#4CAF50'; // Reset
            }
        });

        // Draw food (Dew drop)
        ctx.fillStyle = '#03A9F4'; // Water blue
        ctx.font = '16px Arial';
        ctx.fillText('💧', food.x * gridSize + 2, food.y * gridSize + gridSize - 4);
    }

    function spawnFood() {
        // Simple random spawn
        let valid = false;
        while (!valid) {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            // Ensure food doesn't spawn on snake
            valid = true;
            for (let segment of snake) {
                if (food.x === segment.x && food.y === segment.y) {
                    valid = false;
                    break;
                }
            }
        }
    }

    function gameOver() {
        gameRunning = false;
        overlay.style.display = 'flex';
        title.innerText = 'Game Over';
        startBtn.innerText = 'Try Again';
    }

    // Input handling
    function handleKey(e) {
        // Prevent scrolling for arrow keys
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
        
        switch (e.key) {
            case 'ArrowUp': 
                if (direction.y === 0) nextDirection = {x: 0, y: -1}; 
                break;
            case 'ArrowDown': 
                if (direction.y === 0) nextDirection = {x: 0, y: 1}; 
                break;
            case 'ArrowLeft': 
                if (direction.x === 0) nextDirection = {x: -1, y: 0}; 
                break;
            case 'ArrowRight': 
                if (direction.x === 0) nextDirection = {x: 1, y: 0}; 
                break;
        }
    }
    
    window.addEventListener('keydown', handleKey);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnakeGame);
} else {
    initSnakeGame();
}
