class ConnectionsGame {
    constructor() {
        this.selectedWords = new Set();
        this.matchedGroups = new Set();
        this.mistakes = 0;
        this.maxMistakes = 4;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.startNewGame().catch(console.error);
    }

    initializeElements() {
        this.grid = document.getElementById('game-grid');
        this.submitBtn = document.getElementById('submit');
        this.deselectAllBtn = document.getElementById('deselect-all');
        this.shuffleBtn = document.getElementById('shuffle');
        this.matchedGroupsContainer = document.getElementById('matched-groups');
    }

    initializeEventListeners() {
        this.submitBtn.addEventListener('click', () => this.submitSelection());
        this.deselectAllBtn.addEventListener('click', () => this.deselectAll());
        this.shuffleBtn.addEventListener('click', () => this.shuffle());
    }

    async startNewGame() {
        try {
            const response = await fetch('/api/new-game');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            this.words = data.words;
            this.groups = data.groups;
            console.log('Loaded game data:', { words: this.words, groups: this.groups });
            this.renderGrid();
        } catch (error) {
            console.error('Failed to start new game:', error);
            this.grid.innerHTML = '<div class="error">Failed to load game data. Please refresh the page.</div>';
        }
    }

    renderGrid() {
        this.grid.innerHTML = '';
        this.words.forEach(word => {
            const tile = document.createElement('button');
            tile.className = 'word-tile';
            tile.textContent = word;
            tile.addEventListener('click', () => this.toggleWordSelection(tile, word));
            this.grid.appendChild(tile);
        });
    }

    toggleWordSelection(tile, word) {
        if (this.selectedWords.has(word)) {
            this.selectedWords.delete(word);
            tile.classList.remove('selected');
        } else if (this.selectedWords.size < 4) {
            this.selectedWords.add(word);
            tile.classList.add('selected');
        }

        this.updateButtonStates();
    }

    updateButtonStates() {
        this.submitBtn.disabled = this.selectedWords.size !== 4;
        this.deselectAllBtn.disabled = this.selectedWords.size === 0;
    }

    deselectAll() {
        this.selectedWords.clear();
        document.querySelectorAll('.word-tile.selected').forEach(tile => {
            tile.classList.remove('selected');
        });
        this.updateButtonStates();
    }

    shuffle() {
        const currentWords = [...this.words];
        for (let i = currentWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentWords[i], currentWords[j]] = [currentWords[j], currentWords[i]];
        }
        this.words = currentWords;
        this.deselectAll();
        this.renderGrid();
    }

    validateSelection() {
        const selectedWordsArray = Array.from(this.selectedWords);
        return this.groups.find(group => 
            group.words.every(word => selectedWordsArray.includes(word))
        );
    }

    submitSelection() {
        const matchedGroup = this.validateSelection();

        if (matchedGroup) {
            this.handleCorrectGuess(matchedGroup);
        } else {
            this.handleIncorrectGuess();
        }
    }

    handleCorrectGuess(matchedGroup) {
        // Add matched group to display
        const groupElement = document.createElement('div');
        groupElement.className = 'matched-group';
        groupElement.style.backgroundColor = matchedGroup.color;
        groupElement.innerHTML = `
            <div>${Array.from(this.selectedWords).join(' • ')}</div>
            <div class="group-name">${matchedGroup.description}</div>
        `;
        this.matchedGroupsContainer.appendChild(groupElement);

        // Remove matched words from grid
        this.words = this.words.filter(word => !this.selectedWords.has(word));
        this.matchedGroups.add(matchedGroup.description);
        this.deselectAll();
        this.renderGrid();

        if (this.matchedGroups.size === 4) {
            setTimeout(() => alert('Congratulations! You won!'), 500);
        }
    }

    handleIncorrectGuess() {
        this.mistakes++;
        this.updateMistakeDots();
        this.grid.classList.add('shake');
        setTimeout(() => this.grid.classList.remove('shake'), 500);
        this.deselectAll();

        if (this.mistakes >= this.maxMistakes) {
            alert('Game Over! You\'ve made too many mistakes.');
            this.startNewGame();
        }
    }

    updateMistakeDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index >= this.mistakes);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ConnectionsGame();
});
