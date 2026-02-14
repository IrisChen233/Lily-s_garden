class WhackAMole {
    constructor() {
        this.score = 0;
        this.lastHole = null;
        this.timeUp = false;
        this.moles = [];
        this.holes = [];
        this.container = null;
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.container = document.getElementById('whack-a-mole-game');
        if (!this.container) return;

        this.createBoard();
    }

    createBoard() {
        this.container.innerHTML = ''; // Clear container

        // Scoreboard
        const scoreBoard = document.createElement('div');
        scoreBoard.className = 'wam-scoreboard';
        scoreBoard.innerHTML = `
            <div class="wam-title">🐹 Whack-a-Mole 🐹</div>
            <div class="wam-score">Score: <span id="score">0</span></div>
            <button class="wam-btn" onclick="game.startGame()">Start!</button>
        `;
        this.container.appendChild(scoreBoard);

        // Grid
        const grid = document.createElement('div');
        grid.className = 'wam-grid';
        
        for (let i = 0; i < 9; i++) {
            const hole = document.createElement('div');
            hole.className = 'hole';
            
            const mole = document.createElement('div');
            mole.className = 'mole';
            mole.textContent = '🐹'; 
            
            // Bind click
            mole.addEventListener('click', (e) => this.bonk(e));
            
            hole.appendChild(mole);
            grid.appendChild(hole);
            
            this.holes.push(hole);
            this.moles.push(mole);
        }
        
        this.container.appendChild(grid);
    }

    randomTime(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    randomHole(holes) {
        const idx = Math.floor(Math.random() * holes.length);
        const hole = holes[idx];
        if (hole === this.lastHole) {
            return this.randomHole(holes);
        }
        this.lastHole = hole;
        return hole;
    }

    peep() {
        const time = this.randomTime(400, 1000);
        const hole = this.randomHole(this.holes);
        
        hole.classList.add('up');
        
        setTimeout(() => {
            hole.classList.remove('up');
            if (!this.timeUp) this.peep();
        }, time);
    }

    startGame() {
        const scoreBoard = document.getElementById('score');
        scoreBoard.textContent = 0;
        this.score = 0;
        this.timeUp = false;
        this.peep();
        
        // Disable button during game
        const btn = this.container.querySelector('.wam-btn');
        btn.disabled = true;
        btn.textContent = 'Playing...';

        setTimeout(() => {
            this.timeUp = true;
            btn.disabled = false;
            btn.textContent = 'Start Again';
            alert('Game Over! Your score: ' + this.score);
        }, 15000); // 15 seconds game
    }

    bonk(e) {
        if(!e.isTrusted) return; // cheater!
        
        const mole = e.target;
        const hole = mole.parentElement;
        
        if (hole.classList.contains('up')) {
            this.score++;
            hole.classList.remove('up');
            document.getElementById('score').textContent = this.score;
            
            // Visual hit effect
            mole.textContent = '💥';
            setTimeout(() => mole.textContent = '🐹', 200);
        }
    }
}

// Global instance for button onclick
window.game = new WhackAMole();
