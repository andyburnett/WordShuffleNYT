class ConnectionsGame {
    constructor() {
        this.INITIAL_GROUPS = [
            {
                words: ["Lime", "Miami", "Spline", "Object"],
                description:
                    'Click <a href="pages/james.html">here</a> to see James\'s year in pictures',
                color: "#85C0F9",
                page: "pages/james.html",
            },
            {
                words: ["Pointe", "Fame", "Eiffel", "Nationals"],
                description:
                    'Click <a href="pages/emily.html">here</a> to see Emily\'s year in pictures',
                color: "#A6CF98",
                page: "pages/emily.html",
            },
            {
                words: ["Infusing", "193", "Do-Re-Mi", "Gnome"],
                description:
                    'Click <a href="pages/cyndi.html">here</a> to see Cyndi\'s year in pictures',
                color: "#F9DF6D",
                page: "pages/cyndi.html",
            },
            {
                words: ["Duo", "Sondheim", "On-the-Lake", "Ithaca"],
                description:
                    'Click <a href="pages/andy.html">here</a> to see Andy\'s year in pictures',
                color: "#FF8B94",
                page: "pages/andy.html",
            },
        ];

        this.selectedWords = new Set();
        this.matchedGroups = new Set();
        this.mistakes = 0;
        this.maxMistakes = 4;

        this.initializeElements();
        this.initializeEventListeners();
        this.startNewGame();
    }

    initializeElements() {
        this.grid = document.getElementById("game-grid");
        this.submitBtn = document.getElementById("submit");
        this.deselectAllBtn = document.getElementById("deselect-all");
        this.shuffleBtn = document.getElementById("shuffle");
        this.matchedGroupsContainer = document.getElementById("matched-groups");
    }

    initializeEventListeners() {
        this.submitBtn.addEventListener("click", () => this.submitSelection());
        this.deselectAllBtn.addEventListener("click", () => this.deselectAll());
        this.shuffleBtn.addEventListener("click", () => this.shuffle());
    }

    startNewGame() {
        const savedState = localStorage.getItem("gameState");
        if (savedState) {
            const state = JSON.parse(savedState);
            this.words = state.words;
            this.matchedGroups = new Set(state.matchedGroups);
            this.mistakes = state.mistakes;

            // Restore matched groups displa y
            state.matchedGroups.forEach((page) => {
                const group = this.INITIAL_GROUPS.find((g) => g.page === page);
                if (group) {
                    const groupElement = document.createElement("div");
                    groupElement.className = "matched-group show";
                    groupElement.style.backgroundColor = group.color;
                    groupElement.innerHTML = `
                        <div>${group.words.join(" • ")}</div>
                        <div class="group-name">${group.description}</div>
                    `;
                    this.matchedGroupsContainer.appendChild(groupElement);
                }
            });
        } else {
            this.words = this.INITIAL_GROUPS.flatMap((group) => group.words);
            this.shuffle();
        }
        this.updateMistakeDots();
        this.renderGrid();
    }

    renderGrid() {
        this.grid.innerHTML = "";
        this.words.forEach((word) => {
            const tile = document.createElement("button");
            tile.className = "word-tile";
            tile.textContent = word;
            tile.addEventListener("click", () =>
                this.toggleWordSelection(tile, word),
            );
            this.grid.appendChild(tile);
        });
    }

    toggleWordSelection(tile, word) {
        if (this.selectedWords.has(word)) {
            this.selectedWords.delete(word);
            tile.classList.remove("selected");
        } else if (this.selectedWords.size < 4) {
            this.selectedWords.add(word);
            tile.classList.add("selected");
        }

        this.updateButtonStates();
    }

    updateButtonStates() {
        this.submitBtn.disabled = this.selectedWords.size !== 4;
        this.deselectAllBtn.disabled = this.selectedWords.size === 0;
    }

    deselectAll() {
        this.selectedWords.clear();
        document.querySelectorAll(".word-tile.selected").forEach((tile) => {
            tile.classList.remove("selected");
        });
        this.updateButtonStates();
    }

    shuffle() {
        const currentWords = [...this.words];
        for (let i = currentWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentWords[i], currentWords[j]] = [
                currentWords[j],
                currentWords[i],
            ];
        }
        this.words = currentWords;
        this.deselectAll();
        this.renderGrid();
    }

    validateSelection() {
        const selectedWordsArray = Array.from(this.selectedWords);
        return this.INITIAL_GROUPS.find((group) =>
            group.words.every((word) => selectedWordsArray.includes(word)),
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
        const groupElement = document.createElement("div");
        groupElement.className = "matched-group";
        groupElement.style.backgroundColor = matchedGroup.color;
        groupElement.innerHTML = `
            <div>${Array.from(this.selectedWords).join(" • ")}</div>
            <div class="group-name">${matchedGroup.description}</div>
        `;
        this.matchedGroupsContainer.appendChild(groupElement);
        setTimeout(() => groupElement.classList.add("show"), 50);

        // Remove matched words from grid
        this.words = this.words.filter((word) => !this.selectedWords.has(word));
        this.matchedGroups.add(matchedGroup.page);
        this.deselectAll();
        this.renderGrid();

        // Save game state
        localStorage.setItem(
            "gameState",
            JSON.stringify({
                words: this.words,
                matchedGroups: Array.from(this.matchedGroups),
                mistakes: this.mistakes,
            }),
        );

        if (this.matchedGroups.size === 4) {
            setTimeout(() => {
                alert("Congratulations! You won!");
                localStorage.removeItem("gameState");
            }, 500);
        }
    }

    handleIncorrectGuess() {
        this.mistakes++;
        this.updateMistakeDots();
        this.grid.classList.add("shake");
        setTimeout(() => this.grid.classList.remove("shake"), 500);
        this.deselectAll();

        if (this.mistakes >= this.maxMistakes) {
            // Fade out tiles
            document.querySelectorAll(".word-tile").forEach((tile) => {
                tile.classList.add("fade-out");
            });

            // Reveal answers with staggered animation.
            setTimeout(() => {
                this.grid.innerHTML = "";
                this.INITIAL_GROUPS.forEach((group, index) => {
                    const groupElement = document.createElement("div");
                    groupElement.className = "matched-group";
                    groupElement.style.backgroundColor = group.color;
                    groupElement.innerHTML = `
                        <div>${group.words.join(" • ")}</div>
                        <div class="group-name">${group.description}</div>
                    `;
                    this.matchedGroupsContainer.appendChild(groupElement);

                    setTimeout(() => {
                        groupElement.classList.add("show");
                    }, index * 200);
                });
            }, 500);
            this.submitBtn.disabled = true;
            this.shuffleBtn.disabled = true;
            this.deselectAllBtn.disabled = true;
        }
    }

    updateMistakeDots() {
        const dots = document.querySelectorAll(".dot");
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index >= this.mistakes);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new ConnectionsGame();
});
