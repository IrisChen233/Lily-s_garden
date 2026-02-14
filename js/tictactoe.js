document.addEventListener('DOMContentLoaded', () => {
    // 1. Find the element with class '.garden'
    const garden = document.querySelector('.garden');
    if (!garden) return;

    // 2. Clear its content
    garden.innerHTML = '';

    // 3. Create a 3x3 Tic-Tac-Toe board inside it
    const board = document.createElement('div');
    board.classList.add('board');
    
    // Create cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        board.appendChild(cell);
    }
    garden.appendChild(board);

    // 4. Add CSS for the board and cells
    const style = document.createElement('style');
    style.textContent = `
        .board {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 0 auto;
            width: fit-content;
        }
        .cell {
            width: 80px;
            height: 80px;
            background-color: rgba(255, 255, 255, 0.8);
            border: 2px solid var(--accent, #d81b60);
            border-radius: 10px;
            font-size: 2.5em;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            user-select: none;
            color: var(--text-color, #333);
            font-family: 'Nunito', sans-serif;
            transition: transform 0.2s, background-color 0.2s;
        }
        .cell:hover {
            transform: scale(1.05);
            background-color: rgba(255, 255, 255, 1);
        }
        /* Night mode adjustments */
        body.night-mode .cell {
            background-color: rgba(0, 0, 0, 0.6);
            color: #fff;
            border-color: var(--accent, #ff9a9e);
        }
    `;
    document.head.appendChild(style);

    // 5. Implement game logic
    let boardState = Array(9).fill('');
    let currentPlayer = 'X';
    let gameActive = true;

    const cells = board.querySelectorAll('.cell');

    const winningConditions = [
        [0,1,2], [3,4,5], [6,7,8], // Rows
        [0,3,6], [1,4,7], [2,5,8], // Cols
        [0,4,8], [2,4,6]           // Diagonals
    ];

    function handleCellClick(e) {
        const cell = e.target;
        const index = cell.dataset.index;

        if (boardState[index] !== '' || !gameActive || currentPlayer !== 'X') return;

        makeMove(index, 'X');
        
        if (checkResult()) return;

        // Computer move
        currentPlayer = 'O';
        setTimeout(computerMove, 500);
    }

    function makeMove(index, player) {
        boardState[index] = player;
        cells[index].textContent = player;
        cells[index].style.color = player === 'X' ? 'var(--accent)' : '#2196F3';
    }

    function computerMove() {
        if (!gameActive) return;
        
        // Simple AI: 1. Win, 2. Block, 3. Random
        let moveIndex = -1;

        // Try to win
        moveIndex = findBestMove('O');
        
        // Block player
        if (moveIndex === -1) moveIndex = findBestMove('X');
        
        // Random
        if (moveIndex === -1) {
            const available = boardState.map((v, i) => v === '' ? i : null).filter(v => v !== null);
            if (available.length > 0) {
                moveIndex = available[Math.floor(Math.random() * available.length)];
            }
        }

        if (moveIndex !== -1) {
            makeMove(moveIndex, 'O');
            if (checkResult()) return;
            currentPlayer = 'X';
        }
    }

    function findBestMove(player) {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            const values = [boardState[a], boardState[b], boardState[c]];
            const count = values.filter(v => v === player).length;
            const empty = values.filter(v => v === '').length;
            
            if (count === 2 && empty === 1) {
                if (boardState[a] === '') return a;
                if (boardState[b] === '') return b;
                if (boardState[c] === '') return c;
            }
        }
        return -1;
    }

    function checkResult() {
        let roundWon = false;
        let winner = null;

        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (boardState[a] === '' || boardState[b] === '' || boardState[c] === '') continue;
            if (boardState[a] === boardState[b] && boardState[b] === boardState[c]) {
                roundWon = true;
                winner = boardState[a];
                break;
            }
        }

        if (roundWon) {
            gameActive = false;
            setTimeout(() => {
                alert(winner === 'X' ? '🎉 You Win!' : '💻 Computer Wins!');
                resetGame();
            }, 100);
            return true;
        }

        if (!boardState.includes('')) {
            gameActive = false;
            setTimeout(() => {
                alert("It's a draw! 🤝");
                resetGame();
            }, 100);
            return true;
        }

        return false;
    }

    function resetGame() {
        boardState = Array(9).fill('');
        gameActive = true;
        currentPlayer = 'X';
        cells.forEach(cell => {
            cell.textContent = '';
        });
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
});
