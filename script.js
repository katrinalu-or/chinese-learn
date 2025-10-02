class ChineseLearningApp {
    constructor() {
        this.currentUser = null;
        this.currentActivity = null;
        this.calendar = null;

        // --- GLOBAL CONFIGURATION VARIABLES ---
        this.APP_VERSION = '1.1.9';
        this.MAX_LEVEL = 20;
        this.DEFAULT_WORDS_VERSION = '1.1.9';
        this.LATEST_MINIGAME_VERSION = '1.1.9';

        this.REVIEW_WORDS_PER_SESSION = 20;
        this.REVIEW_CURRENT_LEVEL_COMPLETIONS = 1;
        this.REVIEW_LOWER_LEVEL_COMPLETIONS = 1; // For Word Review
        this.REVIEW_LOWER_LEVEL_PERCENTAGE = 30; // 30% for Word Review
        this.REVIEW_LOWER_LEVEL_MAX_WORDS = 25;

        this.LEVEL_UP_DIAMOND_BONUS = 2;

        // Listening Activity Config
        this.LISTENING_WORDS_PER_SESSION = 12;
        this.LISTENING_CURRENT_LEVEL_COMPLETIONS = 1;
        this.LISTENING_LOWER_LEVEL_COMPLETIONS = 1;
        this.LISTENING_LOWER_LEVEL_PERCENTAGE = 30;
        this.LISTENING_LOWER_LEVEL_MAX_WORDS = 25;

        // Sentence Writing Config
        this.SENTENCE_WORDS_PER_SESSION = 12;

        // Mini Game Configuration
        this.MINI_GAME_ENABLED_LEVELS = [5, 7, 8, 10, 12, 14, 15];
        this.MINI_GAMES_PER_LEVEL = 8;
        this.MINI_GAMES_MAX_PAIRING_PAIRS = 10;
        this.MINI_GAMES_GROUPING_MIN_WORDS = 18;
        this.MINI_GAMES_GROUPING_MAX_WORDS = 25;
        this.MINI_GAMES_GROUPING_MAX_GROUPS = 4;
        this.MINI_GAMES_GROUPING_MIN_GROUPS = 2;
        this.MINI_GAMES_FORMING_SENTENCE_NUM_SENTENCES = 5;

        // Gacha probabilities (must add up to 100)
        this.GACHA_PROBABILITIES = {
            Legendary: 2,
            Epic: 10,
            Rare: 30,
            Common: 58
        };

        this.GACHA_EXCHANGE_RATES_DRAW = {
            Legendary: 40,
            Epic: 10,
            Rare: 3,
            Common: 1
        };

        this.GACHA_EXCHANGE_RATES_SPECIFIED = {
            Legendary: 40,
            Epic: 25,
            Rare: 10,
            Common: 3,
            diamond_1: 6,
            diamond_10: 50
        };

        this.DRAW_TEN_GUARANTEE_LEGENDARY_CHANCE = 15; // 15% chance for Legendary on a guaranteed pull

        this.isExchangeMode = false;
        this.exchangeSelection = {}; // { id: count }

        this.gachaPool = this.defineGachaPool();
        this.init();
    }

    async init() {
        await this.initializeDefaultWords(); // Wait for words to load before continuing
        await this.initializeMiniGameContent();
        this.setupEventListeners();
        this.checkLoggedInUser();
        this.setupDynamicContent();
    }

    defineGachaPool() {
        return [
            { id: 'zeus', name: 'Zeus', rarity: 'Legendary', image: 'greek/zeus.png' },
            { id: 'poseidon', name: 'Poseidon', rarity: 'Epic', image: 'greek/poseidon.png' },
            { id: 'hades', name: 'Hades', rarity: 'Epic', image: 'greek/hades.png' },
            { id: 'hercules', name: 'Hercules', rarity: 'Rare', image: 'greek/hercules.png' },
            { id: 'hera', name: 'Hera', rarity: 'Rare', image: 'greek/hera.png' },
            { id: 'athena', name: 'Athena', rarity: 'Rare', image: 'greek/athena.png' },
            { id: 'apollo', name: 'Apollo', rarity: 'Rare', image: 'greek/apollo.png' },
            { id: 'demeter', name: 'Demeter', rarity: 'Common', image: 'greek/demeter.png' },
            { id: 'ares', name: 'Ares', rarity: 'Common', image: 'greek/ares.png' },
            { id: 'artemis', name: 'Artemis', rarity: 'Common', image: 'greek/artemis.png' },
            { id: 'hermes', name: 'Hermes', rarity: 'Common', image: 'greek/hermes.png' },
            { id: 'aphrodite', name: 'Aphrodite', rarity: 'Common', image: 'greek/aphrodite.png' }
        ];
    }

    async initializeMiniGameContent() {
        const storedVersion = localStorage.getItem('miniGameContentVersion');

        if (storedVersion !== this.LATEST_MINIGAME_VERSION) {
            try {
                const response = await fetch('minigame.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const miniGameContent = await response.json();
                localStorage.setItem('miniGameContent', JSON.stringify(miniGameContent));
                localStorage.setItem('miniGameContentVersion', this.LATEST_MINIGAME_VERSION);
            } catch (error) {
                console.error('Failed to load mini game content:', error);
                this.showErrorMessage('Failed to load minigame.json. Please check that the file exists and is accessible.');
                return;
            }
        }
    }

    async initializeDefaultWords() {
        const storedVersion = localStorage.getItem('defaultWordsVersion');
        if (storedVersion !== this.DEFAULT_WORDS_VERSION) {
            console.log(`Default word list is outdated. Updating to v${this.DEFAULT_WORDS_VERSION}`);
            try {
                const response = await fetch('words.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const defaultWords = await response.json();
                localStorage.setItem('defaultWords', JSON.stringify(defaultWords));
                localStorage.setItem('defaultWordsVersion', this.DEFAULT_WORDS_VERSION);
            } catch (error) {
                console.error('Failed to load word list:', error);
                this.showErrorMessage('Failed to load words.json. Please check that the file exists and is accessible.');
                return;
            }
        }
    }

    initializeUserProperties() {
        this.currentUser.diamonds = this.currentUser.diamonds || 0;
        this.currentUser.exchangeTickets = this.currentUser.exchangeTickets || 0;
        this.currentUser.listeningProgress = this.currentUser.listeningProgress || {};
        this.currentUser.listeningLowerLevelWords = this.currentUser.listeningLowerLevelWords || [];
        this.currentUser.reviewLowerLevelWords = this.currentUser.reviewLowerLevelWords || [];
        this.currentUser.sentenceWritingCompleted = this.currentUser.sentenceWritingCompleted || false;
        this.currentUser.miniGameProgress = this.currentUser.miniGameProgress || {};
        this.currentUser.generatedMiniGames = this.currentUser.generatedMiniGames || {};
        this.currentUser.activityLog = this.currentUser.activityLog || [];

        if (Array.isArray(this.currentUser.collection)) {
            const newCollection = {};
            this.currentUser.collection.forEach(id => {
                newCollection[id] = (newCollection[id] || 0) + 1;
            });
            this.currentUser.collection = newCollection;
        } else {
            this.currentUser.collection = this.currentUser.collection || {};
        }

        if ((!this.currentUser.listeningLowerLevelWords || this.currentUser.listeningLowerLevelWords.length === 0 || !this.currentUser.reviewLowerLevelWords || this.currentUser.reviewLowerLevelWords.length === 0) && this.currentUser.level > 1) {
            this.generatePracticeSubsets();
            this.saveUserData();
        }
    }

    setupEventListeners() {
        // Auth
        document.getElementById('login-tab').addEventListener('click', () => this.showAuthForm('login'));
        document.getElementById('register-tab').addEventListener('click', () => this.showAuthForm('register'));
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('register-btn').addEventListener('click', () => this.handleRegister());

        // Dashboard
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        document.getElementById('developer-mode-btn').addEventListener('click', () => this.showDeveloperMode());
        document.getElementById('collections-btn').addEventListener('click', () => this.showCollectionsPage());
        document.getElementById('word-review-card').addEventListener('click', () => this.startWordReview());
        document.getElementById('word-writing-card').addEventListener('click', () => this.startWordWriting());
        document.getElementById('sentence-writing-card').addEventListener('click', () => this.startSentenceWriting());
        document.getElementById('progress-card').addEventListener('click', () => this.showProgressDetail());

        // Activities
        document.getElementById('back-to-dashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('check-btn').addEventListener('click', () => this.handleWordResponse(true));
        document.getElementById('cross-btn').addEventListener('click', () => this.handleWordResponse(false));
        document.getElementById('review-audio-btn').addEventListener('click', () => this.speak(this.currentActivity.words[this.currentActivity.currentIndex]));
        document.getElementById('back-from-writing').addEventListener('click', () => this.showDashboard());
        document.getElementById('replay-audio-btn').addEventListener('click', () => this.speak(this.currentActivity.currentAnswer));
        document.getElementById('show-answer-btn').addEventListener('click', () => this.showWritingAnswer());
        document.getElementById('writing-check-btn').addEventListener('click', () => this.handleWritingResponse(true));
        document.getElementById('writing-cross-btn').addEventListener('click', () => this.handleWritingResponse(false));
        document.getElementById('back-from-sentence').addEventListener('click', () => this.showDashboard());
        document.getElementById('sentence-check-btn').addEventListener('click', () => this.handleSentenceCompletion(true));
        document.getElementById('sentence-cross-btn').addEventListener('click', () => this.handleSentenceCompletion(false));

        // Mini Game event listeners
        document.getElementById('mini-game-card').addEventListener('click', () => this.showMiniGameCenter());
        document.getElementById('back-from-mini-games').addEventListener('click', () => this.showDashboard());
        document.getElementById('back-from-game').addEventListener('click', () => this.showMiniGameCenter());
        document.getElementById('check-game-btn').addEventListener('click', () => this.checkGameAnswer());
        document.getElementById('reset-game-btn').addEventListener('click', () => this.resetCurrentGame());

        // Other Screens
        document.getElementById('back-from-progress').addEventListener('click', () => this.showDashboard());
        document.getElementById('back-from-collections').addEventListener('click', () => this.showDashboard());
        document.getElementById('draw-gacha-btn').addEventListener('click', () => this.drawGachaItem());
        document.getElementById('draw-ten-gacha-btn').addEventListener('click', () => this.drawTenGachaItems());
        document.getElementById('close-gacha-modal-btn').addEventListener('click', () => this.closeGachaModal());
        document.getElementById('close-multi-gacha-modal-btn').addEventListener('click', () => this.closeGachaModal(true));
        document.getElementById('back-from-dev').addEventListener('click', () => this.showDashboard());
        document.getElementById('exchange-ticket-wrapper').addEventListener('click', () => this.toggleExchangeMode());

        const tooltipIcon = document.querySelector('.tooltip-icon');
        if (tooltipIcon) {
            tooltipIcon.addEventListener('click', function(event) {
                event.stopPropagation();
                const tooltipText = this.querySelector('.tooltip-text');
                const isVisible = tooltipText.style.visibility === 'visible';
                tooltipText.style.visibility = isVisible ? 'hidden' : 'visible';
                tooltipText.style.opacity = isVisible ? '0' : '1';
            });
        }
        window.addEventListener('click', () => {
            const openTooltip = document.querySelector('.tooltip-text');
            if (openTooltip && openTooltip.style.visibility === 'visible') {
                openTooltip.style.visibility = 'hidden';
                openTooltip.style.opacity = '0';
            }
        });

        // Dev Mode
        document.getElementById('backup-btn').addEventListener('click', () => this.exportUserData());
        document.getElementById('restore-btn').addEventListener('click', () => document.getElementById('import-file').click());
        document.getElementById('import-file').addEventListener('change', (e) => this.importUserData(e));
        document.getElementById('reset-level-btn').addEventListener('click', () => this.resetToLevel());
        document.getElementById('download-wordlist-btn').addEventListener('click', () => this.downloadWordList());
        document.getElementById('upload-wordlist-btn').addEventListener('click', () => document.getElementById('import-wordlist-file').click());
        document.getElementById('import-wordlist-file').addEventListener('change', (e) => this.uploadWordList(e));
        document.getElementById('reset-wordlist-btn').addEventListener('click', () => this.resetWordListToDefault());
        document.getElementById('reset-minigames-btn').addEventListener('click', () => this.resetAllMiniGames());

        // --- Handle user navigating away from the page ---
        window.addEventListener('pagehide', () => {
            if (this.isExchangeMode) {
                this.exitExchangeMode();
            }
        });
    }

    setupDynamicContent() {
        // Set the gacha tooltip text dynamically
        const tooltipText = document.getElementById('gacha-tooltip-text');
        if (tooltipText) {
            tooltipText.innerHTML = `Epic probability is ${this.GACHA_PROBABILITIES.Epic}% and Legendary is ${this.GACHA_PROBABILITIES.Legendary}%
Draw 10 guarantees one Epic or Legendary item!`;
        }
    }

    checkLoggedInUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.initializeUserProperties();
            this.showDashboard();
        } else {
            this.showScreen('auth-screen');
        }
    }

    showAuthForm(type) {
        document.getElementById('login-tab').classList.toggle('active', type === 'login');
        document.getElementById('register-tab').classList.toggle('active', type === 'register');
        document.getElementById('login-form').classList.toggle('hidden', type !== 'login');
        document.getElementById('register-form').classList.toggle('hidden', type !== 'register');
    }

    handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');

        if (users[username] && users[username].password === password) {
            this.currentUser = users[username];
            this.initializeUserProperties();
            this.saveUserData();
            this.showDashboard();
        } else {
            alert('Invalid username or password');
        }
    }

    handleRegister() {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;

        if (!username || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            alert('Username already exists');
            return;
        }

        const newUser = {
            username: username,
            password: password,
            level: 1,
            wordProgress: {},
            listeningProgress: {},
            listeningLowerLevelWords: [],
            reviewLowerLevelWords: [],
            sentenceWritingCompleted: false,
            testScores: [],
            activityLog: [],
            diamonds: 0,
            collection: {},
        };

        users[username] = newUser;
        localStorage.setItem('users', JSON.stringify(users));
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.showDashboard();
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showScreen('auth-screen');
    }

showScreen(screenId) {
    // Force exit from exchange mode if navigating away
    if (this.isExchangeMode && screenId !== 'collections-screen') {
        this.exitExchangeMode();
    }

    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');

    // Store current screen
    this.currentScreen = screenId;

    // Fix for iPad: Reset scroll position when returning to dashboard
    if (screenId === 'dashboard-screen') {
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0; // For older browsers
            document.documentElement.scrollTop = 0; // For newer browsers
        }, 50);
    }

    // Add/remove a class to the body to control scrolling
    const noScrollScreens = ['word-review-screen', 'word-writing-screen', 'sentence-writing-screen'];
    if (noScrollScreens.includes(screenId)) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
}

    showDashboard() {
        this.showScreen('dashboard-screen');
        document.getElementById('username-display').textContent = this.currentUser.username;
        document.getElementById('level-display').textContent = this.currentUser.level;
        this.updateProgressDisplay();
        this.updateMiniGameCardVisibility();

        // Clear current game state when returning to dashboard
        this.currentPairingGame = null;
        this.currentGroupingGame = null;
        this.currentSentenceGame = null;
    }

    showErrorMessage(message) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Create and show error screen
        let errorScreen = document.getElementById('error-screen');
        if (!errorScreen) {
            errorScreen = document.createElement('div');
            errorScreen.id = 'error-screen';
            errorScreen.className = 'screen';
            document.body.appendChild(errorScreen);
        }

        errorScreen.innerHTML = `
            <div class="error-container">
                <div class="error-content">
                    <h1>⚠️ Loading Error</h1>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" class="error-reload-btn">Reload Page</button>
                </div>
            </div>
        `;

        errorScreen.classList.remove('hidden');
    }

    updateProgressDisplay() {
        const progress = this.calculateLevelProgress();
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `${progress}%`;
    }

    calculateLevelProgress() {
        const currentLevel = this.currentUser.level;
        let totalRequired = 0;
        let totalCompleted = 0;

        const reviewCurrentWords = this.getWordsForLevel(currentLevel);
        const reviewLowerWords = this.currentUser.reviewLowerLevelWords || [];
        reviewCurrentWords.forEach(word => {
            totalRequired += this.REVIEW_CURRENT_LEVEL_COMPLETIONS;
            totalCompleted += Math.min(this.currentUser.wordProgress[word]?.correct || 0, this.REVIEW_CURRENT_LEVEL_COMPLETIONS);
        });
        reviewLowerWords.forEach(word => {
            totalRequired += this.REVIEW_LOWER_LEVEL_COMPLETIONS;
            totalCompleted += Math.min(this.currentUser.wordProgress[word]?.correct || 0, this.REVIEW_LOWER_LEVEL_COMPLETIONS);
        });

        const writingCurrentWords = this.getWordsForLevel(currentLevel);
        const writingLowerWords = this.currentUser.listeningLowerLevelWords || [];
        writingCurrentWords.forEach(word => {
            totalRequired += this.LISTENING_CURRENT_LEVEL_COMPLETIONS;
            totalCompleted += Math.min(this.currentUser.listeningProgress[word]?.correct || 0, this.LISTENING_CURRENT_LEVEL_COMPLETIONS);
        });
        writingLowerWords.forEach(word => {
            totalRequired += this.LISTENING_LOWER_LEVEL_COMPLETIONS;
            totalCompleted += Math.min(this.currentUser.listeningProgress[word]?.correct || 0, this.LISTENING_LOWER_LEVEL_COMPLETIONS);
        });

        totalRequired += 1;
        if (this.currentUser.sentenceWritingCompleted) {
            totalCompleted += 1;
        }

        return totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
    }

    getWordsForLevel(level) {
        const defaultWords = JSON.parse(localStorage.getItem('defaultWords'));
        const userWords = JSON.parse(localStorage.getItem(`words_${this.currentUser.username}`) || '{}');
        return userWords[level] || defaultWords[level] || [];
    }

    startWordReview() {
        const availableWords = this.getAvailableWordsForReview();
        if (availableWords.length === 0) {
            alert("You've completed all available Word Review exercises for now!");
            this.showDashboard();
            return;
        }
        const sessionList = this.generateSessionWords(availableWords, this.REVIEW_WORDS_PER_SESSION);
        this.currentActivity = { type: 'word-review', words: sessionList, currentIndex: 0, score: 0 };
        this.showScreen('word-review-screen');
        this.displayCurrentWord();
    }

    canAdvanceLevel() {
        const currentLevel = this.currentUser.level;

        const reviewCurrentWords = this.getWordsForLevel(currentLevel);
        for (let word of reviewCurrentWords) {
            if ((this.currentUser.wordProgress[word]?.correct || 0) < this.REVIEW_CURRENT_LEVEL_COMPLETIONS) return false;
        }
        for (let word of (this.currentUser.reviewLowerLevelWords || [])) {
            if ((this.currentUser.wordProgress[word]?.correct || 0) < this.REVIEW_LOWER_LEVEL_COMPLETIONS) return false;
        }

        const writingCurrentWords = this.getWordsForLevel(currentLevel);
        for (let word of writingCurrentWords) {
            if ((this.currentUser.listeningProgress[word]?.correct || 0) < this.LISTENING_CURRENT_LEVEL_COMPLETIONS) return false;
        }
        for (let word of (this.currentUser.listeningLowerLevelWords || [])) {
            if ((this.currentUser.listeningProgress[word]?.correct || 0) < this.LISTENING_LOWER_LEVEL_COMPLETIONS) return false;
        }

        if (!this.currentUser.sentenceWritingCompleted) return false;

        return reviewCurrentWords.length > 0 || writingCurrentWords.length > 0;
    }

    getAvailableWordsForReview() {
        const currentLevel = this.currentUser.level;
        const currentLevelWords = this.getWordsForLevel(currentLevel);
        const requiredLowerLevelWords = this.currentUser.reviewLowerLevelWords || [];
        const wordProgress = this.currentUser.wordProgress;
        let availableWords = [];

        currentLevelWords.forEach(word => {
            if ((wordProgress[word]?.correct || 0) < this.REVIEW_CURRENT_LEVEL_COMPLETIONS) {
                availableWords.push(word);
            }
        });

        requiredLowerLevelWords.forEach(word => {
            if ((wordProgress[word]?.correct || 0) < this.REVIEW_LOWER_LEVEL_COMPLETIONS) {
                availableWords.push(word);
            }
        });
        return availableWords;
    }

    getAllWordsUpToLevel(level) {
        const defaultWords = JSON.parse(localStorage.getItem('defaultWords'));
        const userWords = JSON.parse(localStorage.getItem(`words_${this.currentUser.username}`) || '{}');
        let allWords = [];
        for (let i = 1; i <= level; i++) {
            const levelWords = userWords[i] || defaultWords[i] || [];
            allWords = allWords.concat(levelWords);
        }
        return allWords;
    }

    getWordLevel(word) {
        const defaultWords = JSON.parse(localStorage.getItem('defaultWords'));
        const userWords = JSON.parse(localStorage.getItem(`words_${this.currentUser.username}`) || '{}');
        for (let level = 1; level <= this.MAX_LEVEL; level++) {
            const levelWords = userWords[level] || defaultWords[level] || [];
            if (levelWords.includes(word)) return level;
        }
        return 1;
    }

    generateSessionWords(availableWords, desiredCount) {
        let sessionWords = [...availableWords]; // Start with all words that need practice.

        const needed = desiredCount - sessionWords.length;

        if (needed > 0) {
            // If we need to fill more slots, get the full word list for the current level.
            const currentLevelWords = this.getWordsForLevel(this.currentUser.level);

            // Create a pool of filler words, excluding those already in the session.
            const sessionWordsSet = new Set(sessionWords);
            const fillerPool = currentLevelWords.filter(word => !sessionWordsSet.has(word));

            // Shuffle the filler pool.
            const shuffledFiller = fillerPool.sort(() => 0.5 - Math.random());

            // Add the required number of filler words.
            sessionWords.push(...shuffledFiller.slice(0, needed));

            // If still not enough (e.g., current level has few words), repeat from the filler pool.
            let stillNeeded = desiredCount - sessionWords.length;
            while (stillNeeded > 0 && shuffledFiller.length > 0) {
                sessionWords.push(...shuffledFiller.slice(0, stillNeeded));
                stillNeeded = desiredCount - sessionWords.length;
            }
        }

        // Shuffle the final list to mix required words and filler words.
        return sessionWords.sort(() => 0.5 - Math.random()).slice(0, desiredCount);
    }

    displayCurrentWord() {
        const activity = this.currentActivity;
        const word = activity.words[activity.currentIndex];
        document.getElementById('chinese-word').textContent = word;
        document.getElementById('current-score').textContent = activity.score;
        document.getElementById('word-counter').textContent = `${activity.currentIndex + 1}/${activity.words.length}`;
    }

    handleWordResponse(isCorrect) {
        // Prevent multiple executions if activity is already finishing
        if (this.currentActivity.isFinishing) {
            return;
        }

        const activity = this.currentActivity;
        const word = activity.words[activity.currentIndex];
        if (isCorrect) {
            activity.score++;
        }
        this.updateWordProgress(word, isCorrect);

        activity.currentIndex++;
        if (activity.currentIndex >= activity.words.length) {
            // Set flag to prevent multiple executions
            activity.isFinishing = true;
            this.finishWordReview();
        } else {
            this.displayCurrentWord();
        }
    }

    updateWordProgress(word, isCorrect) {
        if (!this.currentUser.wordProgress[word]) {
            this.currentUser.wordProgress[word] = { correct: 0, total: 0, level: this.getWordLevel(word) };
        }
        this.currentUser.wordProgress[word].total++;
        if (isCorrect) {
            this.currentUser.wordProgress[word].correct++;
        }
        this.saveUserData();
    }

    finishWordReview() {
        const score = this.currentActivity.score;
        const total = this.currentActivity.words.length;
        this.logActivity('Word Review', `${score}/${total}`);
        this.currentUser.diamonds++;
        this.currentUser.testScores.push({ type: 'word-review', score, total, date: this.getCurrentLocalTime() });
        this.saveUserData();

        const canAdvance = this.canAdvanceLevel();
        setTimeout(() => {
            if (canAdvance) {
                alert(`單字閱讀 Complete!\nScore: ${score}/${total} (${Math.round(score / total * 100)}%)\n\n🎉 Congratulations! You have completed Level ${this.currentUser.level}! You earned a bonus of ${this.LEVEL_UP_DIAMOND_BONUS} diamonds!`);
                this.advanceLevel();
                this.showDashboard();
            } else {
                alert(`單字閱讀 Complete!\nScore: ${score}/${total} (${Math.round(score / total * 100)}%)\nYou earned one diamond!`);
                this.showDashboard();
            }
        }, 300);
    }

    advanceLevel() {
        const oldLevel = this.currentUser.level;
        this.currentUser.level++;
        this.currentUser.diamonds += this.LEVEL_UP_DIAMOND_BONUS;
        this.currentUser.sentenceWritingCompleted = false;

        // First, generate the new random subsets for the new level
        this.generatePracticeSubsets();

        // Then, reset progress ONLY for the words in the new subsets
        const wordsToReset = [
            ...(this.currentUser.reviewLowerLevelWords || []),
            ...(this.currentUser.listeningLowerLevelWords || [])
        ];

        // Reset progress for words in the new practice subsets
        wordsToReset.forEach(word => {
            if (this.currentUser.wordProgress[word]) {
                this.currentUser.wordProgress[word].correct = 0;
            }
            if (this.currentUser.listeningProgress[word]) {
                this.currentUser.listeningProgress[word].correct = 0;
            }
        });

        this.saveUserData();
    }

    generatePracticeSubsets() {
        const lowerLevelWords = this.getAllWordsUpToLevel(this.currentUser.level - 1);
        if (lowerLevelWords.length === 0) {
            this.currentUser.reviewLowerLevelWords = [];
            this.currentUser.listeningLowerLevelWords = [];
            return;
        }

        const shuffled = [...lowerLevelWords].sort(() => 0.5 - Math.random());

        // --- Calculate the count based on percentage ---
        let listenCount = Math.ceil(shuffled.length * (this.LISTENING_LOWER_LEVEL_PERCENTAGE / 100));
        let reviewCount = Math.ceil(shuffled.length * (this.REVIEW_LOWER_LEVEL_PERCENTAGE / 100));

        // --- Apply the new MAX_WORDS upper bound ---
        listenCount = Math.min(listenCount, this.LISTENING_LOWER_LEVEL_MAX_WORDS);
        reviewCount = Math.min(reviewCount, this.REVIEW_LOWER_LEVEL_MAX_WORDS);

        if (listenCount + reviewCount > shuffled.length) {
            console.warn("Percentages for subsets add up to more than 100% or were capped. Overlap may occur.");
            this.currentUser.listeningLowerLevelWords = shuffled.slice(0, listenCount);
            this.currentUser.reviewLowerLevelWords = shuffled.slice(0, reviewCount);
        } else {
            this.currentUser.listeningLowerLevelWords = shuffled.slice(0, listenCount);
            this.currentUser.reviewLowerLevelWords = shuffled.slice(listenCount, listenCount + reviewCount);
        }
    }

    showProgressDetail() {
        this.showScreen('progress-screen');
        this.initCalendar();
        this.updateProgressDetails();
    }

    updateProgressDetails() {
        const currentLevel = this.currentUser.level;

        // Word Review Progress (Left Column) - WITH COLLAPSIBLE WORD LIST
        const reviewContainer = document.getElementById('word-review-progress');
        let reviewHTML = '<h4>Word Review Progress</h4>';
        let required = this.REVIEW_CURRENT_LEVEL_COMPLETIONS;
        let levelWords = this.getWordsForLevel(currentLevel);
        let totalRequired = levelWords.length * required;
        let totalCompleted = 0;
        levelWords.forEach(word => { totalCompleted += Math.min(this.currentUser.wordProgress[word]?.correct || 0, required); });
        let levelProgress = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
        if (levelWords.length > 0) {
            reviewHTML += `<div class="level-progress-item ${levelProgress >= 100 ? 'completed' : ''}"><div class="level-header"><h5>Level ${currentLevel} (Current)</h5></div><div class="level-progress-bar"><div class="level-progress-fill" style="width: ${levelProgress}%">${levelProgress}%</div></div></div>`;
        }

        required = this.REVIEW_LOWER_LEVEL_COMPLETIONS;
        levelWords = this.currentUser.reviewLowerLevelWords || [];
        totalRequired = levelWords.length * required;
        totalCompleted = 0;
        levelWords.forEach(word => { totalCompleted += Math.min(this.currentUser.wordProgress[word]?.correct || 0, required); });
        levelProgress = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
        if (levelWords.length > 0) {
            reviewHTML += `<div class="level-progress-item ${levelProgress >= 100 ? 'completed' : ''}"><div class="level-header"><h5>Lower Levels</h5></div><div class="level-progress-bar"><div class="level-progress-fill" style="width: ${levelProgress}%">${levelProgress}%</div></div></div>`;
        }

        const reviewLowerLevelWords = this.currentUser.reviewLowerLevelWords || [];
        if (reviewLowerLevelWords.length > 0) {
            reviewHTML += `<div class="listening-word-list">
                <h5 class="collapsible-header">
                    <span>Lower Level Practice Words</span>
                    <span class="expand-icon">▼</span>
                </h5>
                <div class="collapsible-content">
                    <div class="listening-word-grid">`;
            reviewLowerLevelWords.forEach(word => {
                const isCompleted = (this.currentUser.wordProgress[word]?.correct || 0) >= this.REVIEW_LOWER_LEVEL_COMPLETIONS;
                reviewHTML += `<div class="listening-word-item ${isCompleted ? 'completed' : ''}">${word}</div>`;
            });
            reviewHTML += `</div></div></div>`;
        }
        reviewContainer.innerHTML = reviewHTML;

        // Word Writing Progress (Right Column) - WITH COLLAPSIBLE WORD LIST
        const writingContainer = document.getElementById('word-writing-progress');
        let writingHTML = '<h4>Word Writing Progress</h4>';
        required = this.LISTENING_CURRENT_LEVEL_COMPLETIONS;
        levelWords = this.getWordsForLevel(currentLevel);
        totalRequired = levelWords.length * required;
        totalCompleted = 0;
        levelWords.forEach(word => { totalCompleted += Math.min(this.currentUser.listeningProgress[word]?.correct || 0, required); });
        levelProgress = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
        if (levelWords.length > 0) {
            writingHTML += `<div class="level-progress-item ${levelProgress >= 100 ? 'completed' : ''}"><div class="level-header"><h5>Level ${currentLevel} (Current)</h5></div><div class="level-progress-bar"><div class="level-progress-fill" style="width: ${levelProgress}%">${levelProgress}%</div></div></div>`;
        }

        required = this.LISTENING_LOWER_LEVEL_COMPLETIONS;
        levelWords = this.currentUser.listeningLowerLevelWords || [];
        totalRequired = levelWords.length * required;
        totalCompleted = 0;
        levelWords.forEach(word => { totalCompleted += Math.min(this.currentUser.listeningProgress[word]?.correct || 0, required); });
        levelProgress = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
        if (levelWords.length > 0) {
            writingHTML += `<div class="level-progress-item ${levelProgress >= 100 ? 'completed' : ''}"><div class="level-header"><h5>Lower Levels</h5></div><div class="level-progress-bar"><div class="level-progress-fill" style="width: ${levelProgress}%">${levelProgress}%</div></div></div>`;
        }

        const requiredLowerLevelWords = this.currentUser.listeningLowerLevelWords || [];
        if (requiredLowerLevelWords.length > 0) {
            writingHTML += `<div class="listening-word-list">
                <h5 class="collapsible-header">
                    <span>Lower Level Practice Words</span>
                    <span class="expand-icon">▼</span>
                </h5>
                <div class="collapsible-content">
                    <div class="listening-word-grid">`;
            requiredLowerLevelWords.forEach(word => {
                const isCompleted = (this.currentUser.listeningProgress[word]?.correct || 0) >= this.LISTENING_LOWER_LEVEL_COMPLETIONS;
                writingHTML += `<div class="listening-word-item ${isCompleted ? 'completed' : ''}">${word}</div>`;
            });
            writingHTML += `</div></div></div>`;
        }
        writingContainer.innerHTML = writingHTML;

        // Sentence Writing Progress (moves to left column in 2-column layout)
        const sentenceContainer = document.getElementById('sentence-writing-progress');
        let sentenceHTML = '<h4>Sentence Writing Progress</h4>';
        const sentenceProgress = this.currentUser.sentenceWritingCompleted ? 100 : 0;
        sentenceHTML += `<div class="level-progress-item ${sentenceProgress >= 100 ? 'completed' : ''}"><div class="level-header"><h5>Practice Task</h5></div><div class="level-progress-bar"><div class="level-progress-fill" style="width: ${sentenceProgress}%">${sentenceProgress}%</div></div></div>`;
        sentenceContainer.innerHTML = sentenceHTML;

        // Set up collapsible functionality AFTER the HTML is added
        this.setupCollapsibleHeaders();
    }

    setupCollapsibleHeaders() {
        const collapsibleHeaders = document.querySelectorAll('.collapsible-header');

        collapsibleHeaders.forEach((header, index) => {
            // Remove any existing event listeners by cloning the element
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);

            newHeader.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const contentEl = newHeader.parentElement.querySelector('.collapsible-content');
                const parentEl = newHeader.parentElement;
                const isCurrentlyExpanded = parentEl.classList.contains('expanded');

                // Get current scroll position
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                // Calculate target height to prevent layout jumps
                let targetHeight;
                if (isCurrentlyExpanded) {
                    // Collapsing - set to 0
                    targetHeight = 0;
                } else {
                    // Expanding - measure the content height
                    parentEl.classList.add('expanded');
                    targetHeight = contentEl.scrollHeight;
                    parentEl.classList.remove('expanded');
                }

                // Apply the height directly instead of using max-height
                contentEl.style.height = contentEl.offsetHeight + 'px';
                contentEl.style.maxHeight = 'none';

                // Force a reflow
                contentEl.offsetHeight;

                // Now toggle the class
                parentEl.classList.toggle('expanded');

                // Animate to target height
                contentEl.style.transition = 'height 0.3s ease';
                contentEl.style.height = targetHeight + 'px';

                // Clean up after transition
                setTimeout(() => {
                    if (parentEl.classList.contains('expanded')) {
                        contentEl.style.height = 'auto';
                        contentEl.style.maxHeight = '500px';
                    } else {
                        contentEl.style.height = '0';
                        contentEl.style.maxHeight = '0';
                    }
                    contentEl.style.transition = '';

                    // Restore scroll position if it changed
                    const newScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    if (Math.abs(newScrollTop - scrollTop) > 5) {
                        window.scrollTo(0, scrollTop);
                    }
                }, 320);
            });
        });
    }

    showDeveloperMode() {
        this.showScreen('developer-screen');
        document.getElementById('current-level-display').textContent = this.currentUser.level;
        document.getElementById('app-version-display').textContent = `Version: ${this.APP_VERSION}`;
        const currentLevel = this.currentUser.level;
        const resetSelect = document.getElementById('reset-level-select');

        // Clear previous options. Uncomment this if you don't want the user to see previous max levels
        // resetSelect.innerHTML = '';

        for (let i = 1; i <= currentLevel; i++) {
            let option = resetSelect.querySelector(`option[value="${i}"]`);
            if (!option) {
                option = document.createElement('option');
                option.value = i;
                option.textContent = `Level ${i}`;
                resetSelect.appendChild(option);
            }
        }
        Array.from(resetSelect.options).forEach(option => {
            option.disabled = parseInt(option.value) > currentLevel;
        });
    }

    resetToLevel() {
        const targetLevel = parseInt(document.getElementById('reset-level-select').value);
        if (targetLevel > this.currentUser.level) {
            alert("You cannot reset to a level higher than your current level.");
            return;
        }
        const confirmMessage = `Are you sure you want to reset to Level ${targetLevel}?\n\nThis will:\n• Set your level to ${targetLevel}\n• Clear ALL word progress\n• Clear all test scores\n• This action cannot be undone!\n\nCurrent level: ${this.currentUser.level}`;
        if (!confirm(confirmMessage)) return;
        const doubleConfirm = prompt(`Type "RESET" to confirm you want to reset to Level ${targetLevel}:`);
        if (doubleConfirm !== "RESET") {
            alert('Reset cancelled. You must type "RESET" exactly to confirm.');
            return;
        }

        // Perform the reset
        const currentLevel = this.currentUser.level;

        // 1. Reset basic user data
        this.currentUser.level = targetLevel;
        this.currentUser.wordProgress = {};
        this.currentUser.listeningProgress = {};
        this.currentUser.listeningLowerLevelWords = [];
        this.currentUser.reviewLowerLevelWords = [];
        this.currentUser.sentenceWritingCompleted = false;
        this.currentUser.testScores = [];

        // 2. Smart mini-game reset: only clear levels >= targetLevel
        if (this.currentUser.miniGameProgress) {
            Object.keys(this.currentUser.miniGameProgress).forEach(level => {
                if (parseInt(level) >= targetLevel) {
                    delete this.currentUser.miniGameProgress[level];
                }
            });
        }

        if (this.currentUser.generatedMiniGames) {
            Object.keys(this.currentUser.generatedMiniGames).forEach(level => {
                if (parseInt(level) >= targetLevel) {
                    delete this.currentUser.generatedMiniGames[level];
                }
            });
        }

        // 3. Generate new practice subsets for the target level
        this.generatePracticeSubsets();

        // 4. Save the data
        this.saveUserData();

        alert(`✅ Successfully reset to Level ${targetLevel}!\n\nMini-game progress preserved for levels below ${targetLevel}.\nReturning to the dashboard with a fresh state.`);

        // Force a full re-initialization of the user state, then show the dashboard.
        // This is like a "soft refresh" and guarantees all UI elements update.
        this.checkLoggedInUser();
    }

    resetAllMiniGames() {
        const confirmMessage = `Are you sure you want to reset ALL mini-game data?\n\nThis will:\n• Clear all mini-game progress for all levels\n• Clear all generated mini-game sets\n• Clear cached mini-game content\n• Force reload from minigame.json\n• This action cannot be undone!`;

        if (!confirm(confirmMessage)) return;

        const doubleConfirm = prompt(`Type "RESET" to confirm you want to reset all mini-game data:`);
        if (doubleConfirm !== "RESET") {
            alert('Reset cancelled. You must type "RESET" exactly to confirm.');
            return;
        }

        try {
            // 1. Clear all user mini-game progress
            this.currentUser.miniGameProgress = {};

            // 2. Clear all generated mini-game sets
            this.currentUser.generatedMiniGames = {};

            // 3. Clear cached mini-game content from localStorage
            localStorage.removeItem('miniGameContent');
            localStorage.removeItem('miniGameContentVersion');

            // 4. Save the cleared user data
            this.saveUserData();

            // 5. Force reload of mini-game content
            this.initializeMiniGameContent().then(() => {
                alert('✅ Mini-game reset completed successfully!\n\n• All mini-game progress cleared\n• All generated games cleared\n• Content reloaded from minigame.json\n\nReturning to dashboard.');
                this.showDashboard();
            }).catch((error) => {
                console.error('Error reloading mini-game content:', error);
                alert('⚠️ Mini-game data was cleared, but there was an error reloading content. Please refresh the page.');
                this.showDashboard();
            });

        } catch (error) {
            console.error('Error during mini-game reset:', error);
            alert('❌ An error occurred during the reset. Please try again or refresh the page.');
        }
    }

    downloadWordList() {
        const defaultWords = JSON.parse(localStorage.getItem('defaultWords'));
        const userWords = JSON.parse(localStorage.getItem(`words_${this.currentUser.username}`) || '{}');
        const activeWordList = { ...defaultWords, ...userWords };
        const dataStr = JSON.stringify(activeWordList, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const filename = `wordlist-${this.currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.click();
        alert(`Word list downloaded as ${filename}`);
    }

    resetWordListToDefault() {
        if (!confirm("Are you sure you want to delete your personal word list and restore the default lists for all levels?\n\nThis action cannot be undone.")) return;
        localStorage.removeItem(`words_${this.currentUser.username}`);
        alert("✅ Your word list has been reset to the default lists. The change will take effect in your next word review session.");
    }

    uploadWordList(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (!confirm("Are you sure you want to replace your entire word list with this file? This cannot be undone.")) {
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const newWordList = JSON.parse(e.target.result);
                if (typeof newWordList !== 'object' || newWordList === null || Array.isArray(newWordList)) {
                    throw new Error("Invalid format: Must be an object of levels.");
                }
                localStorage.setItem(`words_${this.currentUser.username}`, JSON.stringify(newWordList));
                alert('✅ Word list updated successfully! Your word review sessions will now use the new list.');
            } catch (error) {
                alert(`Error uploading word list: ${error.message}`);
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    }

    exportUserData() {
        const userData = {
            currentUser: this.currentUser,
            userWords: JSON.parse(localStorage.getItem(`words_${this.currentUser.username}`) || '{}'),
            exportDate: this.getCurrentLocalTime(),
            appVersion: this.APP_VERSION
        };
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        // --- Create a detailed timestamp in the format YYYY_MM_DD-HH:mm:ss ---
        const now = new Date();
        const date = now.getFullYear() + '_' + String(now.getMonth() + 1).padStart(2, '0') + '_' + String(now.getDate()).padStart(2, '0');
        const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');

        const filename = `chinese-learning-${this.currentUser.username}-level${this.currentUser.level}-${date}-${time}.json`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.click();
        alert(`Backup created: ${filename}`);
    }

    importUserData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const userData = JSON.parse(e.target.result);
                if (userData.currentUser) {
                    this.currentUser = userData.currentUser;
                    this.initializeUserProperties();

                    const users = JSON.parse(localStorage.getItem('users') || '{}');
                    users[this.currentUser.username] = this.currentUser;
                    localStorage.setItem('users', JSON.stringify(users));

                    if (userData.userWords && Object.keys(userData.userWords).length > 0) {
                        localStorage.setItem(`words_${this.currentUser.username}`, JSON.stringify(userData.userWords));
                    }
                    alert('Data imported successfully! Please refresh the page.');
                }
            } catch (error) {
                alert('Error importing data: Invalid file format');
            }
        };
        reader.readAsText(file);
    }

    saveUserData() {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[this.currentUser.username] = this.currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    getCurrentLocalTime() {
        // Store in a format that's clearly local time
        const now = new Date();
        return now.getFullYear() + '-' +
               String(now.getMonth() + 1).padStart(2, '0') + '-' +
               String(now.getDate()).padStart(2, '0') + 'T' +
               String(now.getHours()).padStart(2, '0') + ':' +
               String(now.getMinutes()).padStart(2, '0') + ':' +
               String(now.getSeconds()).padStart(2, '0') + '.' +
               String(now.getMilliseconds()).padStart(3, '0');
    }

    logActivity(name, score = '') {
        this.currentUser.activityLog = this.currentUser.activityLog || [];

        this.currentUser.activityLog.push({
            date: this.getCurrentLocalTime(), // Use helper function
            name: name,
            score: score
        });
        this.saveUserData();
    }

    // --- Calendar ---
    initCalendar() {
        const calendarEl = document.getElementById('activity-calendar');
        const tooltip = document.getElementById('calendar-tooltip');

        if (this.calendar) {
            // The library doesn't have a destroy method, so we remove and re-add the element
            calendarEl.innerHTML = '';
        }

        this.calendar = new Calendar(calendarEl, {
            numberMonthsDisplayed: 1,
            dataSource: this.getCalendarEvents(),
            language: 'en',
            startDate: new Date(),
            weekStart: 1,
            mouseOnDay: (e) => {
                if (e.events && e.events.length > 0) {
                    this.showCalendarTooltip(e.element, e.events, tooltip);
                } else {
                    tooltip.classList.remove('visible');
                }
            },
            mouseOutDay: (e) => {
                tooltip.classList.remove('visible');
            },
            clickDay: (e) => {
                if (e.events && e.events.length > 0) {
                    this.showCalendarTooltip(e.element, e.events, tooltip);
                }
            }
        });
    }

    getCalendarEvents() {
        // js-year-calendar requires a single event per day to show the dot.
        // We group all logs by day using local date to avoid timezone issues
        const eventsByDay = (this.currentUser.activityLog || []).reduce((acc, log) => {
            // Parse the stored local ISO time directly without timezone conversion
            const dateStr = log.date.split('T')[0]; // Get just the date part (YYYY-MM-DD)
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(log);
            return acc;
        }, {});

        return Object.keys(eventsByDay).map(date => {
            // Create date object using local timezone
            const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
            const dateObj = new Date(year, month - 1, day); // month is 0-indexed
            return {
                // The library needs a name, but we hide it with CSS
                name: "Activity",
                startDate: dateObj,
                endDate: dateObj,
                // We'll store the actual logs in a custom property
                customData: eventsByDay[date]
            };
        });
    }

    showCalendarTooltip(dayElement, events, tooltip) {
        // All events for a day are in the 'customData' of the *first* event object
        const logs = events[0]?.customData;

        if (!logs || logs.length === 0) {
            tooltip.classList.remove('visible');
            return;
        }

        let content = '<ul>';
        logs.forEach(log => {
            let displayTime;

            // Handle both old format (with Z) and new format (without Z)
            if (log.date.endsWith('Z')) {
                // Old format - this is actually local time stored with Z, so parse directly
                const timeOnly = log.date.split('T')[1].slice(0, 8); // Get HH:MM:SS part
                const [hours, minutes] = timeOnly.split(':');
                displayTime = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes)).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                // New format - parse normally
                const parsedDate = new Date(log.date);
                displayTime = parsedDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            content += `<li>${displayTime} - ${log.name} ${log.score ? `(${log.score})` : ''}</li>`;
        });
        content += '</ul>';
        tooltip.innerHTML = content;

        // Position the tooltip
        const dayRect = dayElement.getBoundingClientRect();

        tooltip.style.position = 'fixed';
        tooltip.style.left = `${dayRect.left + dayRect.width / 2}px`;
        tooltip.style.top = `${dayRect.top - 10}px`;
        tooltip.style.zIndex = '9999'; // Ensure it's on top
        tooltip.classList.add('visible');

        // Adjust positioning after tooltip is rendered
        setTimeout(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            let finalTop = dayRect.top - tooltipRect.height - 10;
            if (finalTop < 0) {
                finalTop = dayRect.bottom + 10;
            }
            tooltip.style.top = `${finalTop}px`;

            let finalLeft = dayRect.left + dayRect.width / 2 - tooltipRect.width / 2;
            if (finalLeft < 0) finalLeft = 10;
            if (finalLeft + tooltipRect.width > window.innerWidth) {
                finalLeft = window.innerWidth - tooltipRect.width - 10;
            }
            tooltip.style.left = `${finalLeft}px`;
        }, 10);
    }

    // --- Word Writing (Listening) Activity ---
    speak(text) {
        if (!text || text === '準備中...' || !('speechSynthesis' in window)) {
            console.error("Speech Synthesis not supported or no text provided.");
            return;
        }
        speechSynthesis.cancel();
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-TW';
            utterance.rate = 0.8;
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                alert(`Could not play audio. Your browser may not support the 'zh-TW' voice. Please check your system's text-to-speech settings.`);
            };
            speechSynthesis.speak(utterance);
        }, 100);
    }

    startWordWriting() {
        const availableWords = this.getAvailableWordsForListening();
        if (availableWords.length === 0) {
            alert("You've completed all available listening exercises for now!");
            this.showDashboard();
            return;
        }
        const sessionList = this.generateSessionWords(availableWords, this.LISTENING_WORDS_PER_SESSION);
        this.currentActivity = {
            type: 'word-writing',
            words: sessionList,
            currentIndex: 0,
            currentAnswer: null,
            score: 0 // Add score tracking
        };
        this.showScreen('word-writing-screen');
        this.displayCurrentWritingWord();
    }

    displayCurrentWritingWord() {
        const activity = this.currentActivity;
        const word = activity.words[activity.currentIndex];
        activity.currentAnswer = word;

        const wordEl = document.getElementById('writing-chinese-word');
        wordEl.textContent = '???';
        wordEl.classList.add('answer-hidden');

        document.getElementById('writing-word-counter').textContent = `${activity.currentIndex + 1}/${activity.words.length}`;

        // --- Update Score Display ---
        document.getElementById('writing-current-score').textContent = activity.score;
        document.getElementById('writing-total-score').textContent = activity.words.length;

        setTimeout(() => this.speak(word), 300);
    }

    showWritingAnswer() {
        if (this.currentActivity && this.currentActivity.type === 'word-writing') {
            const wordEl = document.getElementById('writing-chinese-word');
            wordEl.textContent = this.currentActivity.currentAnswer;
            wordEl.classList.remove('answer-hidden');
        }
    }

    handleWritingResponse(isCorrect) {
        // Prevent multiple executions if activity is already finishing
        if (this.currentActivity.isFinishing) {
            return;
        }

        const word = this.currentActivity.currentAnswer;
        if (!this.currentUser.listeningProgress[word]) {
            this.currentUser.listeningProgress[word] = { correct: 0 };
        }
        if (isCorrect) {
            this.currentUser.listeningProgress[word].correct++;
            this.currentActivity.score++;
        }
        this.saveUserData();

        this.currentActivity.currentIndex++;
        if (this.currentActivity.currentIndex >= this.currentActivity.words.length) {
            // Set flag to prevent multiple executions
            this.currentActivity.isFinishing = true;

            // --- Log the score instead of "Completed" ---
            const score = this.currentActivity.score;
            const total = this.currentActivity.words.length;
            this.logActivity('Word Writing', `${score}/${total}`);
            this.currentUser.testScores.push({ type: 'word-writing', score, total, date: this.getCurrentLocalTime() });

            this.currentUser.diamonds++;
            this.saveUserData();

            const canAdvance = this.canAdvanceLevel();
            setTimeout(() => {
                if (canAdvance) {
                    alert(`單字書寫 complete!\n\n🎉 Congratulations! You have completed Level ${this.currentUser.level}! You earned a bonus of ${this.LEVEL_UP_DIAMOND_BONUS} diamonds!`);
                    this.advanceLevel();
                    this.showDashboard();
                } else {
                    alert("單字書寫 complete!\nYou earned one diamond!");
                    this.showDashboard();
                }
            }, 300);
        } else {
            this.displayCurrentWritingWord();
        }
    }

    getAvailableWordsForListening() {
        const currentLevel = this.currentUser.level;
        const currentLevelWords = this.getWordsForLevel(currentLevel);
        const requiredLowerLevelWords = this.currentUser.listeningLowerLevelWords || [];
        const progress = this.currentUser.listeningProgress;
        let availableWords = [];

        currentLevelWords.forEach(word => {
            if ((progress[word]?.correct || 0) < this.LISTENING_CURRENT_LEVEL_COMPLETIONS) availableWords.push(word);
        });
        requiredLowerLevelWords.forEach(word => {
            if ((progress[word]?.correct || 0) < this.LISTENING_LOWER_LEVEL_COMPLETIONS) availableWords.push(word);
        });

        return availableWords;
    }

    // --- Sentence Writing Activity ---
    startSentenceWriting() {
        if (this.currentUser.sentenceWritingCompleted) {
            alert("You've already completed the sentence writing task for this level!");
            this.showDashboard();
            return;
        }
        this.showScreen('sentence-writing-screen');
        this.displaySentenceWritingWords();
    }

    displaySentenceWritingWords() {
        const words = this.generateSentenceWritingWords();
        const grid = document.getElementById('sentence-word-grid');
        grid.innerHTML = '';

        words.forEach(word => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'sentence-word-item';
            wordDiv.textContent = word;

            // Add click listener for tracking
            wordDiv.addEventListener('click', () => {
                this.handleWordTrackingClick(wordDiv);
            });

            grid.appendChild(wordDiv);
        });
    }

    generateSentenceWritingWords() {
        const allWords = this.getAllWordsUpToLevel(this.currentUser.level);

        const wordsByCrosses = allWords
            .map(word => ({
                word: word,
                crosses: (this.currentUser.wordProgress[word]?.total || 0) - (this.currentUser.wordProgress[word]?.correct || 0)
            }))
            .filter(item => item.crosses > 0)
            .sort((a, b) => b.crosses - a.crosses)
            .map(item => item.word);

        const topCrossedWords = wordsByCrosses.slice(0, 5);

        const exclusionList = new Set([
            ...topCrossedWords,
            ...(this.currentUser.reviewLowerLevelWords || []),
            ...(this.currentUser.listeningLowerLevelWords || [])
        ]);

        const candidateWords = allWords.filter(word => !exclusionList.has(word));
        const shuffledCandidates = candidateWords.sort(() => 0.5 - Math.random());
        const smartRandomWords = shuffledCandidates.slice(0, 5);

        let finalWords = [...new Set([...topCrossedWords, ...smartRandomWords])];

        const needed = this.SENTENCE_WORDS_PER_SESSION - finalWords.length;
        if (needed > 0) {
            const filler = allWords.filter(w => !finalWords.includes(w)).sort(() => 0.5 - Math.random()).slice(0, needed);
            finalWords.push(...filler);
        }

        return finalWords.slice(0, this.SENTENCE_WORDS_PER_SESSION);
    }

    handleSentenceCompletion(isComplete) {
        if (isComplete) {
            this.currentUser.sentenceWritingCompleted = true;
            this.logActivity('Sentence Writing', 'Completed');
            this.currentUser.diamonds++;
            this.saveUserData();

            const canAdvance = this.canAdvanceLevel();
            setTimeout(() => {
                if (canAdvance) {
                    alert(`造句練習 marked as complete!\n\n🎉 Congratulations! You have completed Level ${this.currentUser.level}! You earned a bonus of ${this.LEVEL_UP_DIAMOND_BONUS} diamonds!`);
                    this.advanceLevel();
                    this.showDashboard();
                } else {
                    alert("造句練習 marked as complete for this level!\nYou earned one diamond!");
                    this.showDashboard();
                }
            }, 300);
        } else {
            this.showDashboard();
        }
    }

    handleWordTrackingClick(wordElement) {
        wordElement.classList.toggle('used-tracker');

        // Optional: Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        console.log('Word tracking toggled:', wordElement.textContent);
    }

    // --- Collections & Gacha System ---
    showCollectionsPage() {
        this.showScreen('collections-screen');
        this.renderCollectionGrid();
    }

    renderCollectionGrid() {
        document.getElementById('diamond-count').textContent = this.currentUser.diamonds || 0;
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = '';

        // Handle Exchange Mode UI
        const exchangeUI = document.getElementById('exchange-ui');
        const exchangeTicketWrapper = document.getElementById('exchange-ticket-wrapper');
        const gachaControls = document.querySelector('.gacha-controls');
        grid.classList.toggle('in-exchange-mode', this.isExchangeMode);

        if (this.isExchangeMode) {
            exchangeUI.classList.remove('hidden');
            gachaControls.classList.add('hidden'); // Hide gacha buttons
            exchangeTicketWrapper.classList.add('exchange-active');
            exchangeTicketWrapper.title = 'Exit Exchange Mode';
        } else {
            exchangeUI.classList.add('hidden');
            gachaControls.classList.remove('hidden'); // Show gacha buttons
            exchangeTicketWrapper.classList.remove('exchange-active');
            exchangeTicketWrapper.title = 'Enter Exchange Mode';
        }

        this.gachaPool.forEach(item => {
            const count = this.currentUser.collection[item.id] || 0;
            const isOwned = count > 0;
            const itemDiv = document.createElement('div');
            itemDiv.className = `collection-item ${item.rarity} ${isOwned ? 'owned' : ''}`;

            let countBadge = isOwned ? `<div class="item-count-badge">x${count}</div>` : '';
            let exchangeControlsHTML = '';

            // Add exchange controls if in exchange mode and item is owned
            if (this.isExchangeMode && isOwned) {
                const selectedCount = this.exchangeSelection[item.id] || 0;
                exchangeControlsHTML = `
                    <div class="exchange-item-controls">
                        <button class="exchange-btn minus" data-item-id="${item.id}">-</button>
                        <span class="exchange-count">${selectedCount}</span>
                        <button class="exchange-btn plus" data-item-id="${item.id}">+</button>
                    </div>
                `;
                if (selectedCount > 0) {
                    itemDiv.classList.add('selected-for-exchange');
                }
            }

            itemDiv.innerHTML = `
                ${countBadge}
                <img src="${item.image}" alt="${item.name}" class="collection-item-image">
                <span class="collection-item-name">${item.name}</span>
                ${exchangeControlsHTML}
            `;
            grid.appendChild(itemDiv);
        });

        // Update exchange ticket display when rendering collections
        this.updateExchangeTicketDisplay();

        // Add event listeners ONLY to the card buttons that were just re-created
        if (this.isExchangeMode) {
            this.setupCardExchangeListeners();
        }
    }

    _performSingleDraw() {
        const rng = Math.random() * 100;
        let cumulativeProb = 0;
        let chosenRarity;

        if (rng < (cumulativeProb += this.GACHA_PROBABILITIES.Legendary)) chosenRarity = 'Legendary';
        else if (rng < (cumulativeProb += this.GACHA_PROBABILITIES.Epic)) chosenRarity = 'Epic';
        else if (rng < (cumulativeProb += this.GACHA_PROBABILITIES.Rare)) chosenRarity = 'Rare';
        else chosenRarity = 'Common';

        const possibleItems = this.gachaPool.filter(item => item.rarity === chosenRarity);
        return possibleItems[Math.floor(Math.random() * possibleItems.length)];
    }

    drawGachaItem() {
        if ((this.currentUser.diamonds || 0) < 1) {
            alert("You don't have enough diamonds to draw!");
            return;
        }
        this.currentUser.diamonds--;
        const drawnItem = this._performSingleDraw();

        // Save data before showing animation
        this.currentUser.collection[drawnItem.id] = (this.currentUser.collection[drawnItem.id] || 0) + 1;
        this.saveUserData();

        // Trigger animation
        this._showItemRevealAnimation(drawnItem);

        // The UI will be updated when the modal is closed via closeGachaModal()
    }

    drawTenGachaItems() {
        if ((this.currentUser.diamonds || 0) < 10) {
            alert("You don't have enough diamonds to draw 10 times!");
            return;
        }
        this.currentUser.diamonds -= 10;
        const results = [];
        let hasHighRarity = false;

        for (let i = 0; i < 9; i++) {
            const drawnItem = this._performSingleDraw();
            results.push(drawnItem);
            if (drawnItem.rarity === 'Epic' || drawnItem.rarity === 'Legendary') hasHighRarity = true;
        }

        if (hasHighRarity) {
            results.push(this._performSingleDraw());
        } else {
            const rng = Math.random();
            let guaranteedRarity = (rng < (this.DRAW_TEN_GUARANTEE_LEGENDARY_CHANCE / 100)) ? 'Legendary' : 'Epic';
            const possibleItems = this.gachaPool.filter(item => item.rarity === guaranteedRarity);
            const guaranteedItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
            results.push(guaranteedItem);
        }

        results.forEach(item => {
            this.currentUser.collection[item.id] = (this.currentUser.collection[item.id] || 0) + 1;
        });

        this.saveUserData();
        this.showMultiGachaResult(results);
        this.renderCollectionGrid();
    }

    showMultiGachaResult(items) {
        const modal = document.getElementById('gacha-multi-result-modal');
        const modalContent = modal.querySelector('.modal-content');

        // 1. Reset class and make overlay visible
        modalContent.className = 'modal-content multi-result-modal';
        modal.classList.remove('hidden');

        // 2. Animate the modal container so it's visible
        setTimeout(() => {
            modalContent.classList.add('pop-in-only');
        }, 10);

        const grid = document.getElementById('multi-result-grid');
        grid.innerHTML = ''; // Clear previous results

        // Create the items but keep them hidden initially
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'multi-result-item'; // Base class for initial hidden state
            itemDiv.innerHTML = `<img src="${item.image}" alt="${item.name}"><div class="rarity-text ${item.rarity}">${item.rarity}</div>`;
            grid.appendChild(itemDiv);
        });

        // Reveal items one by one
        const itemElements = grid.querySelectorAll('.multi-result-item');
        itemElements.forEach((itemEl, index) => {
            setTimeout(() => {
                const itemData = items[index];
                // Add classes to trigger the reveal and rarity flash animation
                itemEl.classList.add('is-revealed', `${itemData.rarity}-reveal`);
            }, index * 800 + 400); // Slower reveal: 350ms delay between each item
        });
    }

    showGachaResult(item) {
        // This function now just populates the modal content
        const rarityEl = document.getElementById('gacha-result-rarity');
        rarityEl.textContent = item.rarity;
        rarityEl.className = item.rarity;
        document.getElementById('gacha-result-image').src = item.image;
        document.getElementById('gacha-result-name').textContent = item.name;
    }

    closeGachaModal(isMulti = false) {
        if (isMulti) {
            const modal = document.getElementById('gacha-multi-result-modal');
            modal.classList.add('hidden');
            // Clean up animation classes for the next draw
            modal.querySelector('.modal-content').className = 'modal-content multi-result-modal';
        } else {
            const modal = document.getElementById('gacha-result-modal');
            modal.classList.add('hidden');
            // Clean up animation classes for next draw
            modal.querySelector('.modal-content').className = 'modal-content';
            document.getElementById('gacha-result-content').classList.remove('is-visible'); // Reset visibility
        }

        // --- New UI Refresh Logic ---
        // Always re-render the grid to show new item counts
        this.renderCollectionGrid();

        // If we were in exchange mode, also update the button states
        if (this.isExchangeMode) {
            this.updateExchangeButtonStates();
        }
    }

    // --- Exchange Mode Functions ---
    exitExchangeMode() {
        this.isExchangeMode = false;
        this.exchangeSelection = {};
    }

    toggleExchangeMode() {
        if (!this.isExchangeMode) {
            // Entering exchange mode
            if ((this.currentUser.exchangeTickets || 0) < 1) {
                alert("You need at least 1 Exchange Ticket to enter exchange mode.");
                return;
            }
            if (!confirm("Enter exchange mode?\nThis will consume 1 Exchange Ticket and cannot be undone.")) {
                return;
            }
            this.currentUser.exchangeTickets--;
            this.isExchangeMode = true;
            this.exchangeSelection = {}; // Reset selection

            // --- Build the main controls and attach their listeners ONCE ---
            this.renderExchangeUI();
            this.setupMainExchangePanelListeners();

        } else {
            this.exitExchangeMode();
        }
        this.saveUserData();
        this.renderCollectionGrid(); // Re-render to show/hide cards and controls
    }

    renderExchangeUI() {
        const totalPoints = this.calculateExchangePoints();
        document.getElementById('exchange-total-points').textContent = totalPoints;

        const buyOptionsContainer = document.getElementById('exchange-buy-options');
        buyOptionsContainer.innerHTML = ''; // Clear previous controls

        const drawButtonsWrapper = document.createElement('div');
        drawButtonsWrapper.className = 'exchange-draw-buttons';
        buyOptionsContainer.appendChild(drawButtonsWrapper);

        const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];
        rarities.forEach(rarity => {
            const cost = this.GACHA_EXCHANGE_RATES_DRAW[rarity];
            const btn = document.createElement('button');
            btn.className = 'exchange-buy-btn';
            btn.dataset.rarity = rarity;
            btn.innerHTML = `Draw 1 ${rarity} <span class="exchange-cost">(${cost} pts)</span>`;
            drawButtonsWrapper.appendChild(btn);
        });

        // --- New Specific Exchange UI ---
        const specificExchangeWrapper = document.createElement('div');
        specificExchangeWrapper.className = 'specific-exchange-wrapper';

        const select = document.createElement('select');
        select.id = 'specific-item-select';

        // --- Rarity exchange ---
        this.gachaPool
            .sort((a, b) => this.GACHA_EXCHANGE_RATES_SPECIFIED[b.rarity] - this.GACHA_EXCHANGE_RATES_SPECIFIED[a.rarity] || a.name.localeCompare(b.name))
            .forEach(item => {
                const cost = this.GACHA_EXCHANGE_RATES_SPECIFIED[item.rarity];
                const option = document.createElement('option');
                option.value = item.id;
                option.dataset.cost = cost;
                option.textContent = `${item.name} (${item.rarity}) - ${cost} pts`;
                select.appendChild(option);
            });

        // --- Diamond exchange ---
        const diamondOption1 = document.createElement('option');
        diamondOption1.value = 'diamond_1';
        diamondOption1.dataset.cost = this.GACHA_EXCHANGE_RATES_SPECIFIED.diamond_1;
        diamondOption1.textContent = `💎 1 Diamond - ${this.GACHA_EXCHANGE_RATES_SPECIFIED.diamond_1} pts`;
        diamondOption1.classList.add('diamond-exchange-option');
        select.appendChild(diamondOption1);

        const diamondOption10 = document.createElement('option');
        diamondOption10.value = 'diamond_10';
        diamondOption10.dataset.cost = this.GACHA_EXCHANGE_RATES_SPECIFIED.diamond_10;
        diamondOption10.textContent = `💎💎 10 Diamonds - ${this.GACHA_EXCHANGE_RATES_SPECIFIED.diamond_10} pts`;
        diamondOption10.classList.add('diamond-exchange-option');
        select.appendChild(diamondOption10);

        const buyBtn = document.createElement('button');
        buyBtn.id = 'confirm-specific-exchange-btn';
        buyBtn.className = 'exchange-buy-btn specific';
        buyBtn.textContent = 'Buy Selected';

        specificExchangeWrapper.appendChild(select);
        specificExchangeWrapper.appendChild(buyBtn);
        buyOptionsContainer.appendChild(specificExchangeWrapper);

        this.updateExchangeButtonStates(); // Set initial state
    }

    calculateExchangePoints() {
        let totalPoints = 0;
        for (const itemId in this.exchangeSelection) {
            const count = this.exchangeSelection[itemId];
            const itemInfo = this.gachaPool.find(p => p.id === itemId);
            if (itemInfo) {
                totalPoints += count * this.GACHA_EXCHANGE_RATES_DRAW[itemInfo.rarity];
            }
        }
        return totalPoints;
    }

    updateExchangeSelection(itemId, change) {
        const currentSelection = this.exchangeSelection[itemId] || 0;
        const ownedCount = this.currentUser.collection[itemId] || 0;
        let newSelection = currentSelection + change;

        if (newSelection < 0) newSelection = 0;
        if (newSelection > ownedCount) newSelection = ownedCount;

        if (newSelection > 0) {
            this.exchangeSelection[itemId] = newSelection;
        } else {
            delete this.exchangeSelection[itemId];
        }
        // 1. Re-render the grid to update the card UI (+/- count)
        this.renderCollectionGrid();
        // 2. Update the main panel button states based on new point total
        this.updateExchangeButtonStates();
    }

    performExchange(rarityToBuy) {
        const cost = this.GACHA_EXCHANGE_RATES_DRAW[rarityToBuy];
        const currentPoints = this.calculateExchangePoints();

        if (currentPoints < cost) {
            alert(`You need ${cost} points to get a ${rarityToBuy} item, but you only have ${currentPoints}.`);
            return;
        }

        const tradedItemsSummary = Object.keys(this.exchangeSelection).map(id => {
            const item = this.gachaPool.find(p => p.id === id);
            return `${this.exchangeSelection[id]}x ${item.name}`;
        }).join(', ');

        // Only ask for confirmation if points will be wasted.
        if (currentPoints > cost) {
            if (!confirm(`This will trade [${tradedItemsSummary}] for a random ${rarityToBuy} item. Any leftover points will be lost. Continue?`)) {
                return;
            }
        }

        // 1. Deduct traded items
        for (const itemId in this.exchangeSelection) {
            this.currentUser.collection[itemId] -= this.exchangeSelection[itemId];
            if (this.currentUser.collection[itemId] <= 0) {
                delete this.currentUser.collection[itemId];
            }
        }

        // 2. Get a new random item
        const possibleItems = this.gachaPool.filter(item => item.rarity === rarityToBuy);
        const newItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];

        // 3. Add new item
        this.currentUser.collection[newItem.id] = (this.currentUser.collection[newItem.id] || 0) + 1;

        // 4. Reset exchange state
        this.exchangeSelection = {};
        this.saveUserData();

        // 5. Show animation
        this._showItemRevealAnimation(newItem);
    }

    updateExchangeButtonStates() {
        const totalPoints = this.calculateExchangePoints();
        document.getElementById('exchange-total-points').textContent = totalPoints;

        // Update "Draw 1" buttons
        document.querySelectorAll('.exchange-buy-btn[data-rarity]').forEach(btn => {
            const cost = this.GACHA_EXCHANGE_RATES_DRAW[btn.dataset.rarity];
            btn.disabled = totalPoints < cost;
        });

        // Update "Buy Selected" button
        const select = document.getElementById('specific-item-select');
        const buyBtn = document.getElementById('confirm-specific-exchange-btn');

        if (!select || !buyBtn) return;

        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption) {
            buyBtn.disabled = true;
            return;
        }
        const cost = parseInt(selectedOption.dataset.cost, 10);
        buyBtn.disabled = totalPoints < cost;
    }

    performSpecificExchange() {
        const select = document.getElementById('specific-item-select');
        const itemIdToBuy = select.value;
        const currentPoints = this.calculateExchangePoints();

        // --- Handle Diamond Exchange ---
        if (itemIdToBuy === 'diamond_1' || itemIdToBuy === 'diamond_10') {
            const isTenDiamonds = itemIdToBuy === 'diamond_10';
            const cost = isTenDiamonds ? this.GACHA_EXCHANGE_RATES_SPECIFIED.diamond_10 : this.GACHA_EXCHANGE_RATES_SPECIFIED.diamond_1;
            const diamondsToAdd = isTenDiamonds ? 10 : 1;

            if (currentPoints < cost) {
                alert(`You need ${cost} points to exchange for ${diamondsToAdd} diamond(s), but you only have ${currentPoints}.`);
                return;
            }

            const tradedItemsSummary = Object.keys(this.exchangeSelection).map(id => {
                const item = this.gachaPool.find(p => p.id === id);
                return `${this.exchangeSelection[id]}x ${item.name}`;
            }).join(', ');

            if (currentPoints > cost) {
                 if (!confirm(`This will trade [${tradedItemsSummary}] for ${diamondsToAdd} diamond(s). Any leftover points will be lost. Continue?`)) {
                    return;
                }
            }

            // 1. Deduct traded items
            for (const itemId in this.exchangeSelection) {
                this.currentUser.collection[itemId] -= this.exchangeSelection[itemId];
                if (this.currentUser.collection[itemId] <= 0) {
                    delete this.currentUser.collection[itemId];
                }
            }

            // 2. Add diamonds
            this.currentUser.diamonds += diamondsToAdd;

            // 3. Reset exchange state and save
            this.exchangeSelection = {};
            this.saveUserData();

            // 4. Show success message and refresh UI
            alert(`✅ Success! You exchanged your items for ${diamondsToAdd} diamond(s)!`);
            this.renderCollectionGrid();
            return; // Exit the function to prevent regular item logic
        }


        const itemInfo = this.gachaPool.find(p => p.id === itemIdToBuy);
        if (!itemInfo) return;

        const cost = this.GACHA_EXCHANGE_RATES_SPECIFIED[itemInfo.rarity];

        if (currentPoints < cost) {
            alert(`You need ${cost} points to buy a ${itemInfo.name}, but you only have ${currentPoints}.`);
            return;
        }

        const tradedItemsSummary = Object.keys(this.exchangeSelection).map(id => {
            const item = this.gachaPool.find(p => p.id === id);
            return `${this.exchangeSelection[id]}x ${item.name}`;
        }).join(', ');

        // Only ask for confirmation if points will be wasted.
        if (currentPoints > cost) {
            if (!confirm(`This will trade [${tradedItemsSummary}] for a specific item: [${itemInfo.name}]. Any leftover points will be lost. Continue?`)) {
                return;
            }
        }

        // 1. Deduct traded items
        for (const itemId in this.exchangeSelection) {
            this.currentUser.collection[itemId] -= this.exchangeSelection[itemId];
            if (this.currentUser.collection[itemId] <= 0) {
                delete this.currentUser.collection[itemId];
            }
        }

        // 2. Add the SPECIFIC new item
        this.currentUser.collection[itemInfo.id] = (this.currentUser.collection[itemInfo.id] || 0) + 1;

        // 3. Reset exchange state
        this.exchangeSelection = {};
        this.saveUserData();

        // 4. Show animation
        this._showItemRevealAnimation(itemInfo);
    }

    _showItemRevealAnimation(item) {
        const modal = document.getElementById('gacha-result-modal');
        const modalContent = modal.querySelector('.modal-content');
        const resultContent = document.getElementById('gacha-result-content');

        // 1. Reset classes and hide the result content
        modalContent.className = 'modal-content';
        resultContent.classList.remove('is-visible');

        // 2. Show the modal overlay
        modal.classList.remove('hidden');

        // 3. Delay to allow CSS to render, then start animations
        setTimeout(() => {
            modalContent.classList.add('animate-in'); // Pop-in and flash starts
            this.showGachaResult(item); // Populate data (it's invisible for now)

            // 4. After the flash animation, reveal the content
            setTimeout(() => {
                resultContent.classList.add('is-visible'); // Fade in the result
                modalContent.classList.add(`${item.rarity}-reveal`); // Add final glow
            }, 1300); // Timed for after the flash
        }, 100);
    }

    setupMainExchangePanelListeners() {
        document.querySelectorAll('.exchange-buy-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                if (e.currentTarget.dataset.rarity) {
                    const rarity = e.currentTarget.dataset.rarity;
                    this.performExchange(rarity);
                }
            });
        });

        const specificSelect = document.getElementById('specific-item-select');
        if (specificSelect) {
            const newSelect = specificSelect.cloneNode(true);
            specificSelect.parentNode.replaceChild(newSelect, specificSelect);
            newSelect.addEventListener('change', () => this.updateExchangeButtonStates());
        }

        const confirmSpecificBtn = document.getElementById('confirm-specific-exchange-btn');
        if (confirmSpecificBtn) {
            const newBtn = confirmSpecificBtn.cloneNode(true);
            confirmSpecificBtn.parentNode.replaceChild(newBtn, confirmSpecificBtn);
            newBtn.addEventListener('click', () => this.performSpecificExchange());
        }
    }

    setupCardExchangeListeners() {
        document.querySelectorAll('.exchange-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.itemId;
                const change = e.currentTarget.classList.contains('plus') ? 1 : -1;
                this.updateExchangeSelection(itemId, change);
            });
        });
    }

    /* Mini Game Center */
    showMiniGameCenter() {
        const currentLevel = this.currentUser.level;
        const lastEnabledLevel = this.findLastEnabledMiniGameLevel(currentLevel);
        const isEnabledForCurrentLevel = this.MINI_GAME_ENABLED_LEVELS.includes(currentLevel);

        // CORRECTED LOGIC: Allow access if the user's level is an enabled level OR if they have passed one.
        if (isEnabledForCurrentLevel || lastEnabledLevel !== null) {
             // Clear game states when returning to mini game center
            this.currentPairingGame = null;
            this.currentGroupingGame = null; // Corrected a typo here from your file
            this.currentSentenceGame = null;

            this.showScreen('mini-game-screen');
            this.renderMiniGames();
            this.updateExchangeTicketDisplay();
        } else {
            // This logic will now correctly run only when no games are truly available
            const nextAvailableLevel = this.findNextEnabledMiniGameLevel(currentLevel);
            const message = nextAvailableLevel
                ? `Mini games unlock at Level ${nextAvailableLevel}. Keep learning!`
                : 'Complete more levels to unlock mini games!';
            alert(message);
        }
    }

    renderMiniGames() {
        const grid = document.getElementById('mini-games-grid');
        const currentLevel = this.currentUser.level;

        const games = this.generateLevelGames(currentLevel);

        grid.innerHTML = '';
        games.forEach((game, index) => {
            const gameDiv = document.createElement('div');
            const isCompleted = this.currentUser.miniGameProgress[currentLevel]?.[index] || false;

            gameDiv.className = `mini-game-card ${isCompleted ? 'completed' : ''}`;

            const imageName = this.getMiniGameImage(game.type);
            const bgImage = `minigame/${imageName}`;
            gameDiv.style.backgroundImage = `url('${bgImage}')`;

            // --- Add theme display for pairing games ---
            let themeDisplay = '';
            if (game.type === 'pairing' || game.type === 'matching') {
                themeDisplay = `<p class="game-theme-display">${this.getThemeDisplayName(game.theme)}</p>`;
            }

            gameDiv.innerHTML = `
                <div class="mini-game-content-wrapper">
                    <h4>${game.title}</h4>
                    ${themeDisplay}
                </div>
            `;

            gameDiv.addEventListener('click', () => this.startMiniGame(game, index));
            grid.appendChild(gameDiv);
        });
    }

    updateMiniGameCardVisibility() {
        const miniGameCard = document.getElementById('mini-game-card');
        const currentLevel = this.currentUser.level;

        const isEnabledForCurrentLevel = this.MINI_GAME_ENABLED_LEVELS.includes(currentLevel);
        const lastEnabledLevel = this.findLastEnabledMiniGameLevel(currentLevel);

        if (isEnabledForCurrentLevel || lastEnabledLevel !== null) {
            // Game is currently active
            miniGameCard.classList.remove('disabled');
            miniGameCard.classList.add('active');

            const nextResetLevel = this.findNextEnabledMiniGameLevel(currentLevel);
            // Handle case where there are no more upcoming game levels
            const message = nextResetLevel
                ? `Games will be reset at Level ${nextResetLevel}`
                : 'These are the final games!';

            miniGameCard.innerHTML = `
                <h3>遊戲小天地</h3>
                <p>Come play to get your exchange ticket!</p>
                <p>${message}</p>
            `;
        } else {
            // Game is currently locked
            miniGameCard.classList.remove('active');
            miniGameCard.classList.add('disabled');

            const nextUnlockLevel = this.findNextEnabledMiniGameLevel(currentLevel);
            // Handle case where all game levels are passed
            const message = nextUnlockLevel
                ? `Unlocks at Level ${nextUnlockLevel}`
                : 'No more mini-games available.';

            miniGameCard.innerHTML = `
                <h3>遊戲小天地</h3>
                <p>${message}</p>
            `;
        }
    }

    findNextEnabledMiniGameLevel(currentLevel) {
        return this.MINI_GAME_ENABLED_LEVELS.find(level => level > currentLevel);
    }

    findLastEnabledMiniGameLevel(currentLevel) {
        const enabledLevels = this.MINI_GAME_ENABLED_LEVELS.filter(level => level <= currentLevel);
        return enabledLevels.length > 0 ? Math.max(...enabledLevels) : null;
    }

    generateLevelGames(level) {
        // --- This logic ensures games are regenerated only on the specific enabled levels ---
        const lastEnabledLevel = this.findLastEnabledMiniGameLevel(level);
        const generationLevel = lastEnabledLevel !== null ? lastEnabledLevel : level;

        if (this.currentUser.generatedMiniGames[generationLevel]) {
            return this.currentUser.generatedMiniGames[generationLevel];
        }

        const allPossibleGameTypes = ['sentenceCompletion', 'matching', 'pairing', 'formingSentences'];
        const groupData = this.getGroupDataForLevel(level);
        if (groupData && groupData.groupNames && groupData.groupNames.length >= 2) {
            allPossibleGameTypes.push('grouping');
        }

        const games = [];
        const distributedGameTypes = this.distributeGameTypes(allPossibleGameTypes, this.MINI_GAMES_PER_LEVEL);

        let usedPairingThemes = [];
        let usedSentences = [];
        let usedMatchThemes = [];
        let usedGroupNames = [];
        let usedFormingSentences = [];

        for (let i = 0; i < this.MINI_GAMES_PER_LEVEL; i++) {
            const gameType = distributedGameTypes[i];
            let theme = 'basic';
            let gameData = null;

            if (gameType === 'pairing') {
                const pairThemes = this.getAvailablePairThemesForLevel(level);
                const availablePairThemes = pairThemes.filter(t => !usedPairingThemes.includes(t));

                if (availablePairThemes.length > 0) {
                    theme = availablePairThemes[Math.floor(Math.random() * availablePairThemes.length)];
                    usedPairingThemes.push(theme);
                } else {
                    // No unique theme available, create an empty game
                    gameData = null;
                    theme = 'unavailable';
                }

            } else if (gameType === 'matching') {
                const matchThemes = this.getAvailableMatchThemesForLevel(level);
                const availableThemes = matchThemes.filter(t => !usedMatchThemes.includes(t));

                if (availableThemes.length > 0) {
                    theme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
                    usedMatchThemes.push(theme);
                    // We only need to store the theme. The rendering function will handle data selection.
                    gameData = {}; // Just an empty object to signify a valid game
                } else {
                    // No unique theme available, create an empty game
                    gameData = null;
                    theme = 'unavailable';
                }

            } else if (gameType === 'grouping') {
                const groupData = this.getGroupDataForLevel(level, usedGroupNames);
                if (groupData) {
                    gameData = { groups: groupData };
                    usedGroupNames.push(...groupData.groupNames);
                    theme = 'categories'; // A generic theme name for display purposes
                }

            } else if (gameType === 'sentenceCompletion') {
                const allSentences = this.getAllSentenceCompletionData(level);
                const availableSentences = allSentences.filter(s => !usedSentences.includes(s.sentence));

                if (availableSentences.length > 0) {
                    const selectedSentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
                    usedSentences.push(selectedSentence.sentence);
                    gameData = { sentenceData: selectedSentence };
                }
            } else if (gameType === 'formingSentences') {
                const allFormingSentences = this.getAllSentenceFormingData(level);
                const availableFormingSentences = allFormingSentences.filter(s => !usedFormingSentences.includes(s.sentence));

                if (availableFormingSentences.length >= this.MINI_GAMES_FORMING_SENTENCE_NUM_SENTENCES) {
                    // We have enough unique sentences for a full game
                    const selectedSentences = availableFormingSentences
                        .sort(() => 0.5 - Math.random())
                        .slice(0, this.MINI_GAMES_FORMING_SENTENCE_NUM_SENTENCES);

                    selectedSentences.forEach(sentence => {
                        usedFormingSentences.push(sentence.sentence);
                    });

                    gameData = { formingSentences: selectedSentences };
                    theme = 'sentences';
                } else {
                    // Not enough unique sentences available
                    gameData = null;
                    theme = 'unavailable';
                }
            }

            games.push({
                id: i,
                type: gameType,
                theme: theme,
                level: level,
                gameData: gameData,
                title: this.getGameTitle(gameType, theme),
            });
        }

        // Save the generated games for this level
        this.currentUser.generatedMiniGames[generationLevel] = games;
        this.saveUserData();

        return games;
    }

    getAvailablePairThemesForLevel(level) {
        const allThemes = new Set();
        for (let i = 1; i <= level; i++) {
            const levelContent = this.getMiniGameContentForLevel(i);
            if (levelContent && levelContent.pairs) {
                Object.keys(levelContent.pairs).forEach(theme => allThemes.add(theme));
            }
        }
        return Array.from(allThemes);
    }

     getAvailableGroupThemesForLevel(level) {
        const allThemes = new Set();
        // In the future, if you structure groups by theme like pairs, this will work.
        // For now, it will likely return a single theme if available.
        for (let i = 1; i <= level; i++) {
            const levelContent = this.getMiniGameContentForLevel(i);
            if (levelContent && levelContent.groups) {
                // Assuming minigame.json might have multiple themed groups in the future
                // e.g., groups: { colors: {...}, animals: {...} }
                Object.keys(levelContent.groups).forEach(theme => {
                    // Check if the theme itself contains groupNames, which indicates it's a theme object
                    if(levelContent.groups[theme].groupNames) {
                        allThemes.add(theme);
                    }
                });
            }
        }
        return Array.from(allThemes);
    }


    distributeGameTypes(gameTypes, totalGames) {
        const distributedTypes = [];

        if (gameTypes.length >= totalGames) {
            // More game types than needed - use each type only once
            const shuffled = [...gameTypes].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, totalGames);
        } else {
            // Fewer game types than needed - distribute evenly
            const timesEach = Math.floor(totalGames / gameTypes.length);
            const remainder = totalGames % gameTypes.length;

            // Add each game type the calculated number of times
            for (let i = 0; i < gameTypes.length; i++) {
                for (let j = 0; j < timesEach; j++) {
                    distributedTypes.push(gameTypes[i]);
                }
            }

            // Add remainder games randomly from available types
            const shuffledTypes = [...gameTypes].sort(() => Math.random() - 0.5);
            for (let i = 0; i < remainder; i++) {
                distributedTypes.push(shuffledTypes[i]);
            }

            // Shuffle the final distribution to randomize order
            return distributedTypes.sort(() => Math.random() - 0.5);
        }
    }

    getGameTitle(type, theme) {
        const titles = {
            'sentenceCompletion': '句子空格殺手',
            'matching': '配對工廠',
            'grouping': '分組大王',
            'pairing': '卡片配一配',
            'formingSentences': '句子拼圖'
        };
        return titles[type] || '小遊戲';
    }

    getMiniGameImage(gameType) {
        const imageMap = {
            'pairing': 'pairing.png',
            'grouping': 'grouping.png',
            'matching': 'matching.png',
            'sentenceCompletion': 'sentence.png',
            'formingSentences': 'forming.png'
        };
        // Return the specific image or a default one if not found
        return imageMap[gameType] || 'default.png';
    }

    startMiniGame(game, gameIndex) {
        this.currentGame = { ...game, gameIndex };
        this.showScreen('game-play-screen');
        document.getElementById('game-title').textContent = game.title;
        this.renderGameContent(game);
    }

    getMiniGameContentForLevel(level) {
        const storedContent = localStorage.getItem('miniGameContent');
        if (storedContent) {
            const content = JSON.parse(storedContent);
            return content[level.toString()] || null;
        }
        return null;
    }

    renderGameContent(game) {
        const contentDiv = document.getElementById('game-content');

        if (game.theme === 'unavailable') {
            contentDiv.innerHTML = '<p style="text-align: center; padding: 2rem;">No unique theme available for this game.</p>';
            this.showGameControls(false, false); // Hide buttons
            return;
        }

        switch(game.type) {
            case 'sentenceCompletion':
                this.renderSentenceCompletion(contentDiv, game);
                this.showGameControls(true, true);
                break;
            case 'pairing':
                this.renderPairingGame(contentDiv, game);
                this.showGameControls(false, true);
                break;
            case 'grouping': // Add this case
                this.renderGroupingGame(contentDiv, game);
                this.showGameControls(true, true);
                break;
            case 'matching':
                this.renderMatchingGame(contentDiv, game);
                this.showGameControls(true, true);
                break;
            case 'formingSentences':
                this.renderFormingSentencesGame(contentDiv, game);
                this.showGameControls(true, true);
                break;
            default:
                contentDiv.innerHTML = '<p style="text-align: center; padding: 2rem;">Game coming soon!</p>';
                this.showGameControls(true, true);
        }
    }

    // --- Pairing game ---
    renderPairingGame(container, game) {
        const allPairsForTheme = this.getAllPairsForTheme(game.theme, game.level);

        if (!allPairsForTheme || allPairsForTheme.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem;">No pairing data available for this theme.</p>';
            return;
        }

        // Only generate new pairs AND layout if we don't have a current game or it's a different game
        if (!this.currentPairingGame ||
            this.currentPairingGame.gameId !== game.id ||
            this.currentPairingGame.level !== game.level) {

            // Generate fresh pairs for new game entry
            const selectedPairs = this.selectRandomPairs(allPairsForTheme, this.MINI_GAMES_MAX_PAIRING_PAIRS);

            // Generate shuffled word layout (only on new game entry)
            const allWords = [];
            selectedPairs.forEach(pair => {
                allWords.push(...pair);
            });
            const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);

            // Store the selected pairs and layout for this game session
            this.currentPairingGame = {
                gameId: game.id,
                level: game.level,
                theme: game.theme,
                pairs: selectedPairs,
                words: shuffledWords, // Fixed layout for this game session
                selectedWords: [],
                foundPairs: [],
                total: selectedPairs.length
            };
        }

        // Reset game state for fresh start/reset (but keep same pairs and layout)
        this.currentPairingGame.selectedWords = [];
        this.currentPairingGame.foundPairs = [];
        this.currentPairingGame.score = 0;

        // Calculate grid size
        const totalWords = this.currentPairingGame.words.length;
        const gridSize = Math.ceil(Math.sqrt(totalWords));

        container.innerHTML = `
            <div class="pairing-game">
                <div class="game-info">
                    <h3>Find all ${this.currentPairingGame.total} pairs!</h3>
                    <p>Theme: ${this.getThemeDisplayName(game.theme)}</p>
                </div>
                <div class="pairing-grid" style="grid-template-columns: repeat(${gridSize}, 1fr);">
                    ${this.currentPairingGame.words.map((word, index) =>
                        `<div class="pairing-word" data-word="${word}" data-index="${index}">${word}</div>`
                    ).join('')}
                </div>
            </div>
        `;

        this.setupPairingGameEvents();
    }

    getAllPairsForTheme(theme, maxLevel) {
        const allPairs = [];

        // Collect all pairs from level 1 up to maxLevel for the specified theme
        for (let level = 1; level <= maxLevel; level++) {
            const levelContent = this.getMiniGameContentForLevel(level);
            if (levelContent && levelContent.pairs && levelContent.pairs[theme]) {
                const levelPairs = levelContent.pairs[theme];
                if (Array.isArray(levelPairs)) {
                    allPairs.push(...levelPairs);
                }
            }
        }

        return allPairs;
    }

    selectRandomPairs(allPairs, maxPairs) {
        // If we have fewer pairs than maxPairs, return all pairs
        if (allPairs.length <= maxPairs) {
            return [...allPairs];
        }

        // Randomly select maxPairs from all available pairs
        const shuffled = [...allPairs].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, maxPairs);
    }

    showGameControls(showCheckButton, showResetButton) {
        const checkBtn = document.getElementById('check-game-btn');
        const resetBtn = document.getElementById('reset-game-btn');

        if (checkBtn) {
            checkBtn.style.display = showCheckButton ? 'inline-block' : 'none';
        }
        if (resetBtn) {
            resetBtn.style.display = showResetButton ? 'inline-block' : 'none';
        }
    }

    getThemeDisplayName(theme) {
        if (!theme) {
            return ''; // Return an empty string if the theme is invalid
        }
        // Capitalize the first letter and return the rest of the string
        return theme.charAt(0).toUpperCase() + theme.slice(1);
    }

    setupPairingGameEvents() {
        const wordElements = document.querySelectorAll('.pairing-word');

        wordElements.forEach(element => {
            element.addEventListener('click', (e) => {
                const word = e.target.dataset.word;
                const index = parseInt(e.target.dataset.index);

                // Skip if word is already found
                if (element.classList.contains('found')) {
                    return;
                }

                // Toggle selection
                if (element.classList.contains('selected')) {
                    element.classList.remove('selected');
                    this.currentPairingGame.selectedWords = this.currentPairingGame.selectedWords.filter(
                        item => item.index !== index
                    );
                } else {
                    element.classList.add('selected');
                    this.currentPairingGame.selectedWords.push({ word, index, element });
                }

                // Check if we have 2 selected words
                if (this.currentPairingGame.selectedWords.length === 2) {
                    setTimeout(() => this.checkPairingMatch(), 500);
                }
            });
        });
    }

    checkPairingMatch() {
        const selected = this.currentPairingGame.selectedWords;
        const word1 = selected[0].word;
        const word2 = selected[1].word;

        // Check if these words form a valid pair
        const isValidPair = this.currentPairingGame.pairs.some(pair =>
            (pair[0] === word1 && pair[1] === word2) ||
            (pair[0] === word2 && pair[1] === word1)
        );

        if (isValidPair) {
            // Mark as found
            selected.forEach(item => {
                item.element.classList.remove('selected');
                item.element.classList.add('found');
            });

            this.currentPairingGame.foundPairs.push([word1, word2]);

            // Check if game is complete and call the completion logic
            if (this.currentPairingGame.foundPairs.length === this.currentPairingGame.total) {
                setTimeout(() => this.completePairingGame(), 500);
            }
        } else {
            // Wrong pair - reset selection
            selected.forEach(item => {
                item.element.classList.remove('selected');
                item.element.classList.add('wrong');
            });

            // Remove wrong class after animation
            setTimeout(() => {
                selected.forEach(item => {
                    item.element.classList.remove('wrong');
                });
            }, 1000);
        }

        // Clear selection
        this.currentPairingGame.selectedWords = [];
    }

    completePairingGame() {
        const isCompleted = this.currentPairingGame.foundPairs.length === this.currentPairingGame.total;

        if (isCompleted) {
            // Mark this specific game as completed
            const currentLevel = this.currentUser.level;
            const gameIndex = this.currentGame.gameIndex;

            if (!this.currentUser.miniGameProgress[currentLevel]) {
                this.currentUser.miniGameProgress[currentLevel] = {};
            }

            this.currentUser.miniGameProgress[currentLevel][gameIndex] = true;

            // Check if all games are completed for this level using the global variable
            const completedGames = Object.keys(this.currentUser.miniGameProgress[currentLevel] || {}).length;
            let message = `Pairing game completed! 🎉\n\nFound all ${this.currentPairingGame.total} pairs correctly!`;

            if (completedGames === this.MINI_GAMES_PER_LEVEL) { // Use global variable here
                // Award exchange ticket
                this.currentUser.exchangeTickets = (this.currentUser.exchangeTickets || 0) + 1;
                message += `\n\n🎫 Bonus: You've completed all ${this.MINI_GAMES_PER_LEVEL} games at Level ${currentLevel}!\nYou earned 1 Exchange Ticket!`;
            }

            this.saveUserData();
            alert(message);
        }
    }

    // --- Grouping game ---
    renderGroupingGame(container, game) {
        // --- Use the pre-selected group data ---
        const groupData = game.gameData ? game.gameData.groups : this.getGroupDataForLevel(game.level);

        if (!groupData || !groupData.groupNames || groupData.groupNames.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem;">No grouping data available for this theme.</p>';
            this.showGameControls(false, false);
            return;
        }

        // --- Word Selection Logic (runs every time) ---
        let allWords = [];
        for (const groupName in groupData.items) {
            allWords.push(...groupData.items[groupName]);
        }
        allWords = [...new Set(allWords)];

        const min = this.MINI_GAMES_GROUPING_MIN_WORDS;
        const max = this.MINI_GAMES_GROUPING_MAX_WORDS;
        const totalWordsToSelect = Math.min(allWords.length, Math.floor(Math.random() * (max - min + 1)) + min);
        const selectedWords = [...allWords].sort(() => 0.5 - Math.random()).slice(0, totalWordsToSelect);

        // --- Store current session state ---
        this.currentGroupingGame = {
            gameId: game.id,
            level: game.level,
            groups: groupData,
            words: selectedWords, // This is now fresh for each render
        };

        // --- Render UI ---
        container.innerHTML = `
            <div class="grouping-game-container">
                <div class="word-bank-container">
                    <h4>Words</h4>
                    <div id="grouping-word-bank" class="word-bank">
                        ${this.currentGroupingGame.words.map(word => `<span class="draggable" data-word="${word}">${word}</span>`).join('')}
                    </div>
                </div>
                <div class="grouping-zones-container">
                    <h4>Categories</h4>
                    ${this.currentGroupingGame.groups.groupNames.map(name => `
                        <div class="group-category">
                            <h5>${name}</h5>
                            <div class="group-drop-zone" data-group-name="${name}"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.setupDragAndDrop();
    }

    getGroupDataForLevel(maxLevel, excludedGroupNames = []) {
        const masterData = {
            groupNames: [],
            items: {}
        };

        // 1. Collect and merge all possible group data up to the maxLevel
        for (let level = 1; level <= maxLevel; level++) {
            const levelContent = this.getMiniGameContentForLevel(level);
            if (levelContent && levelContent.groups) {
                const levelGroups = levelContent.groups;
                if (levelGroups.groupNames) {
                    masterData.groupNames.push(...levelGroups.groupNames);
                }
                if (levelGroups.items) {
                    for (const groupName in levelGroups.items) {
                        if (masterData.items[groupName]) {
                            masterData.items[groupName].push(...levelGroups.items[groupName]);
                        } else {
                            masterData.items[groupName] = [...levelGroups.items[groupName]];
                        }
                    }
                }
            }
        }

        // 2. Create a clean, unique list of all valid groups (with at least 2 items)
        const uniqueGroupNames = [...new Set(masterData.groupNames)];
        const candidateGroups = uniqueGroupNames
            .map(name => ({
                name: name,
                words: [...new Set(masterData.items[name] || [])]
            }))
            .filter(group => group.words.length >= 2)
            .filter(group => !excludedGroupNames.includes(group.name)); // <-- Exclude already used groups

        if (candidateGroups.length < this.MINI_GAMES_GROUPING_MIN_GROUPS) return null;

        const MAX_ATTEMPTS = 10;
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            // 3. In each attempt, shuffle the candidates and try to build a valid set
            const shuffledCandidates = [...candidateGroups].sort(() => 0.5 - Math.random());

            const selectedData = {
                groupNames: [],
                items: {}
            };
            const wordSet = new Set();

            for (const group of shuffledCandidates) {
                // Stop if we've already hit the max number of groups
                if (selectedData.groupNames.length >= this.MINI_GAMES_GROUPING_MAX_GROUPS) {
                    break;
                }

                // Check if adding the new words would exceed the MAX_WORDS limit
                const tempSet = new Set(wordSet);
                group.words.forEach(word => tempSet.add(word));

                if (tempSet.size <= this.MINI_GAMES_GROUPING_MAX_WORDS) {
                    // It fits! Add this group to our selection.
                    selectedData.groupNames.push(group.name);
                    selectedData.items[group.name] = group.words;
                    group.words.forEach(word => wordSet.add(word));
                }
            }

            // 4. Validate the result of this attempt
            if (selectedData.groupNames.length >= this.MINI_GAMES_GROUPING_MIN_GROUPS && wordSet.size >= this.MINI_GAMES_GROUPING_MIN_WORDS) {
                // Success! We found a valid combination.
                return selectedData;
            }
        }

        // 5. If we failed after all attempts, it's likely no good combination exists.
        console.warn("Could not generate a valid grouping game after multiple attempts.");
        return null;
    }

    checkGroupingAnswer() {
        const dropZones = document.querySelectorAll('.group-drop-zone[data-group-name]');
        const wordBank = document.getElementById('grouping-word-bank');
        let allCorrect = true;

        // Clear previous highlights
        document.querySelectorAll('.draggable').forEach(el => {
            el.classList.remove('wrong');
            el.classList.remove('correct');
        });

        // --- Check if the word bank is empty ---
        if (wordBank.children.length > 0) {
            allCorrect = false;
            // Mark all unplaced words as wrong
            Array.from(wordBank.children).forEach(wordEl => {
                wordEl.classList.add('wrong');
            });
        }

        dropZones.forEach(zone => {
            const currentGroupName = zone.dataset.groupName;
            const wordsInZone = zone.querySelectorAll('.draggable');

            wordsInZone.forEach(wordEl => {
                const word = wordEl.dataset.word;
                const correctGroupName = this.findCorrectGroupForWord(word);

                if (currentGroupName === correctGroupName) {
                    wordEl.classList.add('correct');
                } else {
                    wordEl.classList.add('wrong');
                    allCorrect = false;
                }
            });
        });

        if (allCorrect) {
            this.completeGroupingGame();
        } else {
            alert("Not quite! Check the highlighted words and make sure all words are sorted.");
        }
    }

    completeGroupingGame() {
        const currentLevel = this.currentUser.level;
        const gameIndex = this.currentGame.gameIndex;

        // Mark this specific game as completed
        if (!this.currentUser.miniGameProgress[currentLevel]) {
            this.currentUser.miniGameProgress[currentLevel] = {};
        }
        this.currentUser.miniGameProgress[currentLevel][gameIndex] = true;

        // Check if all games are completed for this level
        const completedGames = Object.keys(this.currentUser.miniGameProgress[currentLevel] || {}).length;
        let message = "Congratulations! All words are in the correct groups! 🎉";

        if (completedGames === this.MINI_GAMES_PER_LEVEL) {
            // Award exchange ticket
            this.currentUser.exchangeTickets = (this.currentUser.exchangeTickets || 0) + 1;
            message += `\n\n🎫 Bonus: You've completed all ${this.MINI_GAMES_PER_LEVEL} games at Level ${currentLevel}!\nYou earned 1 Exchange Ticket!`;
        }

        this.saveUserData();
        alert(message);

        // To prevent re-completing, you might want to automatically go back
        // this.showMiniGameCenter();
    }

    findCorrectGroupForWord(word) {
        const groups = this.currentGroupingGame.groups.items;
        for (const groupName in groups) {
            if (groups[groupName].includes(word)) {
                return groupName;
            }
        }
        return null; // Should not happen if data is correct
    }

    // --- Setence completion game ---
    renderSentenceCompletion(container, game) {
        // --- Use the pre-selected sentence from gameData ---
        const gameData = game.gameData ? game.gameData.sentenceData : null;

        if (!gameData) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem;">No unique sentence available for this game.</p>';
            this.showGameControls(false, false);
            return;
        }

        // Store the game state for the current session
        this.currentSentenceGame = {
            gameId: game.id,
            level: game.level,
            data: gameData,
        };

        // --- Render UI ---
        container.innerHTML = `
            <div class="sentence-completion-layout">
                <div class="grouping-zones-container">
                    <h4>Sentence</h4>
                    <div class="sentence-display">
                        <h3>${this.createSentenceWithDropZones(gameData.sentence)}</h3>
                    </div>
                </div>
                <div class="word-bank-container">
                    <h4>Word Choices</h4>
                    <div id="sentence-word-bank" class="word-bank">
                        ${[...gameData.options].sort(() => 0.5 - Math.random()).map(word => `<span class="draggable" data-word="${word}">${word}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        this.setupDragAndDrop();
    }

    getAllSentenceCompletionData(maxLevel) {
        const allSentences = [];
        for (let level = 1; level <= maxLevel; level++) {
            const levelContent = this.getMiniGameContentForLevel(level);
            if (levelContent && levelContent.sentenceCompletion) {
                allSentences.push(...levelContent.sentenceCompletion);
            }
        }
        return allSentences;
    }

    createSentenceWithDropZones(sentence) {
        let dropZoneIndex = 0;
        return sentence.replace(/___/g, () => {
            return `<span class="drop-zone" data-blank="${dropZoneIndex++}"></span>`;
        });
    }

    checkSentenceCompletionAnswer() {
        const dropZones = document.querySelectorAll('.drop-zone');
        const correctAnswers = this.currentSentenceGame.data.blanks;
        let allCorrect = true;

        // Clear previous highlights
        dropZones.forEach(zone => {
            zone.classList.remove('wrong', 'correct');
        });

        if (dropZones.length !== correctAnswers.length) {
            alert("Please fill in all the blanks before checking.");
            return;
        }

        dropZones.forEach((zone, index) => {
            const userWord = zone.textContent;
            if (userWord === correctAnswers[index]) {
                zone.classList.add('correct');
            } else {
                zone.classList.add('wrong');
                allCorrect = false;
            }
        });

        if (allCorrect) {
            alert("Correct! Well done! 🎉");
            this.completeCurrentMiniGame(); // Use a generic completion function
        } else {
            alert("Not quite right. The red blanks are incorrect.");
        }
    }

    // --- Matching aame ---
    getAvailableMatchThemesForLevel(level) {
        const allThemes = new Set();
        for (let i = 1; i <= level; i++) {
            const levelContent = this.getMiniGameContentForLevel(i);
            if (levelContent && levelContent.matches) {
                Object.keys(levelContent.matches).forEach(theme => allThemes.add(theme));
            }
        }
        return Array.from(allThemes);
    }

    getAllMatchesForTheme(theme, maxLevel) {
        console.log("=== getAllMatchesForTheme DEBUG ===");
        console.log("Theme:", theme, "Max Level:", maxLevel);

        const allMatches = [];
        for (let level = 1; level <= maxLevel; level++) {
            const levelContent = this.getMiniGameContentForLevel(level);
            console.log(`Level ${level} content:`, levelContent);

            if (levelContent && levelContent.matches && levelContent.matches[theme]) {
                console.log(`Level ${level} matches for theme '${theme}':`, levelContent.matches[theme]);
                allMatches.push(...levelContent.matches[theme]);
            } else {
                console.log(`Level ${level} has no matches for theme '${theme}'`);
            }
        }

        console.log("Final combined matches:", allMatches);
        console.log("=== END getAllMatchesForTheme DEBUG ===");
        return allMatches;
    }

    renderMatchingGame(container, game) {
        // 1. Get the full, merged pool of all possible matches for the theme.
        const allMatches = this.getAllMatchesForTheme(game.theme, game.level);

        if (!allMatches || allMatches.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem;">No matching data available for this theme.</p>';
            this.showGameControls(false, false);
            return;
        }

        // Only generate new matches if we don't have a current game or it's a different game
        if (!this.currentMatchingGame ||
            this.currentMatchingGame.gameId !== game.id ||
            this.currentMatchingGame.level !== game.level) {

            // 2. Select a random SUBSET of those matches for this game session.
            const maxWords = Math.min(allMatches.length, 8); // Use a max of 8 pairs.
            const selectedMatches = [...allMatches].sort(() => 0.5 - Math.random()).slice(0, maxWords);

            // 3. Store the selected subset as the definitive set for this game instance.
            this.currentMatchingGame = {
                gameId: game.id,
                level: game.level,
                matches: selectedMatches,
            };
        }

        // 4. Prepare the display elements by shuffling them.
        const wordsForBank = this.currentMatchingGame.matches.map(m => m[0]);
        const shuffledWordsForBank = [...wordsForBank].sort(() => 0.5 - Math.random());
        const shuffledDescriptionsForGrid = [...this.currentMatchingGame.matches].sort(() => 0.5 - Math.random());

        // 5. Render the game using the shuffled display elements.
        container.innerHTML = `
            <div class="matching-game-layout">
                <div class="game-info">
                    <h3>Match the words to their descriptions!</h3>
                    <p>Theme: ${this.getThemeDisplayName(game.theme)}</p>
                </div>
                <div class="word-bank-container">
                    <h4>Word Choices</h4>
                    <div id="matching-word-bank" class="word-bank">
                        ${shuffledWordsForBank.map(word => `<span class="draggable" data-word="${word}">${word}</span>`).join('')}
                    </div>
                </div>
                <div class="descriptions-container">
                    <h4>Descriptions</h4>
                    <div class="descriptions-grid">
                        ${shuffledDescriptionsForGrid.map(match => `
                            <div class="drop-zone" data-correct-word="${match[0]}"></div>
                            <p class="description-text">${match[1]}</p>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        this.setupDragAndDrop();
    }

    checkMatchingAnswer() {
        const dropZones = document.querySelectorAll('.descriptions-grid .drop-zone');
        const wordBank = document.getElementById('matching-word-bank');
        let allCorrect = true;

        dropZones.forEach(zone => {
            zone.classList.remove('wrong', 'correct');
        });

        // Check if all words are placed
        if (wordBank.children.length > 0) {
            allCorrect = false;
        }

        dropZones.forEach(zone => {
            const droppedWordEl = zone.querySelector('.draggable');
            if (!droppedWordEl) {
                allCorrect = false;
                zone.classList.add('wrong'); // Mark empty zones as wrong
                return;
            }

            const droppedWord = droppedWordEl.dataset.word;
            const correctWord = zone.dataset.correctWord;

            if (droppedWord === correctWord) {
                zone.classList.add('correct');
            } else {
                zone.classList.add('wrong');
                allCorrect = false;
            }
        });

        if (allCorrect) {
            alert("Correct! Well done! 🎉");
            this.completeCurrentMiniGame();
        } else {
            alert("Not quite right. Make sure every description has the correct word.");
        }
    }

    // --- Forming sentences game ---
    getAllSentenceFormingData(maxLevel) {
        const allSentences = [];
        for (let level = 1; level <= maxLevel; level++) {
            const levelContent = this.getMiniGameContentForLevel(level);
            if (levelContent && levelContent.forming) {
                allSentences.push(...levelContent.forming);
            }
        }
        return allSentences;
    }

    renderFormingSentencesGame(container, game) {
        // Check if we have pre-selected sentences or need to handle unavailable case
        if (game.theme === 'unavailable' || !game.gameData || !game.gameData.formingSentences) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem;">No unique sentences available for this game.</p>';
            this.showGameControls(false, false);
            return;
        }

        // Use the pre-selected sentences from game generation
        if (!this.currentFormingSentencesGame || this.currentFormingSentencesGame.gameId !== game.id) {
            this.currentFormingSentencesGame = {
                gameId: game.id,
                sentences: game.gameData.formingSentences,
                currentSentenceIndex: 0,
                completedSentences: new Array(game.gameData.formingSentences.length).fill(false)
            };
        }

        this.renderCurrentFormingSentence(container);
    }

    renderCurrentFormingSentence(container) {
        const gameData = this.currentFormingSentencesGame;
        const currentSentence = gameData.sentences[gameData.currentSentenceIndex];
        const shuffledWords = [...currentSentence.words].sort(() => 0.5 - Math.random());
        const isCompleted = gameData.completedSentences[gameData.currentSentenceIndex];

        container.innerHTML = `
            <div class="forming-sentences-layout">
                <div class="sentence-navigation">
                    <button id="prev-sentence-btn" class="nav-btn" ${gameData.currentSentenceIndex === 0 ? 'disabled' : ''}>← Previous</button>
                    <span class="sentence-counter">
                        Sentence ${gameData.currentSentenceIndex + 1}/${gameData.sentences.length}
                        ${isCompleted ? '<span class="completion-check">✓</span>' : ''}
                    </span>
                    <button id="next-sentence-btn" class="nav-btn" ${gameData.currentSentenceIndex === gameData.sentences.length - 1 ? 'disabled' : ''}>Next →</button>
                </div>

                <div class="grouping-zones-container">
                    <h4>Form the Sentence</h4>
                    <div class="sentence-display">
                        <div class="sentence-drop-area" id="sentence-drop-area">
                            ${currentSentence.words.map((_, index) =>
                                `<div class="sentence-drop-zone drop-zone" data-position="${index}"></div>`
                            ).join('')}
                        </div>
                    </div>
                </div>

                <div class="word-bank-container">
                    <h4>Word Choices</h4>
                    <div id="forming-sentences-word-bank" class="word-bank">
                        ${shuffledWords.map(word => `<span class="draggable" data-word="${word}">${word}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        this.setupFormingSentencesEventListeners();
        this.setupDragAndDrop();
    }

    setupFormingSentencesEventListeners() {
        const prevBtn = document.getElementById('prev-sentence-btn');
        const nextBtn = document.getElementById('next-sentence-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateFormingSentence(-1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateFormingSentence(1));
        }
    }

    navigateFormingSentence(direction) {
        const gameData = this.currentFormingSentencesGame;
        const newIndex = gameData.currentSentenceIndex + direction;

        if (newIndex >= 0 && newIndex < gameData.sentences.length) {
            gameData.currentSentenceIndex = newIndex;
            this.renderCurrentFormingSentence(document.getElementById('game-content'));
        }
    }

    checkFormingSentencesAnswer() {
        const gameData = this.currentFormingSentencesGame;
        const currentSentence = gameData.sentences[gameData.currentSentenceIndex];
        const dropZones = document.querySelectorAll('.sentence-drop-zone');
        const wordBank = document.getElementById('forming-sentences-word-bank');
        let allCorrect = true;

        // Clear previous highlights
        dropZones.forEach(zone => {
            zone.classList.remove('wrong', 'correct');
        });

        // Check if all words are placed
        if (wordBank.children.length > 0) {
            allCorrect = false;
        }

        // Check if words are in correct positions
        dropZones.forEach((zone, index) => {
            const droppedWordEl = zone.querySelector('.draggable');
            if (!droppedWordEl) {
                allCorrect = false;
                zone.classList.add('wrong');
                return;
            }

            const droppedWord = droppedWordEl.dataset.word;
            const correctWord = currentSentence.words[index];

            if (droppedWord === correctWord) {
                zone.classList.add('correct');
            } else {
                zone.classList.add('wrong');
                allCorrect = false;
            }
        });

        if (allCorrect) {
            gameData.completedSentences[gameData.currentSentenceIndex] = true;

            // Update the checkmark immediately
            const sentenceCounter = document.querySelector('.sentence-counter');
            if (sentenceCounter && !sentenceCounter.querySelector('.completion-check')) {
                const checkMark = document.createElement('span');
                checkMark.className = 'completion-check';
                checkMark.textContent = '✓';
                sentenceCounter.appendChild(checkMark);
            }

            // Check if all sentences are completed
            const allSentencesComplete = gameData.completedSentences.every(completed => completed);

            if (allSentencesComplete) {
                alert("Congratulations! You've completed all sentences! 🎉");
                this.completeCurrentMiniGame();
            } else {
                const remaining = gameData.completedSentences.filter(c => !c).length;
                alert(`Correct! This sentence is complete. ${remaining} sentences remaining.`);
            }
        } else {
            alert("Not quite right. Make sure all words are in the correct order.");
        }
    }

    // --- Generic completion function ---
    completeCurrentMiniGame() {
        const currentLevel = this.currentUser.level;
        const gameIndex = this.currentGame.gameIndex;

        if (!this.currentUser.miniGameProgress[currentLevel]) {
            this.currentUser.miniGameProgress[currentLevel] = {};
        }
        this.currentUser.miniGameProgress[currentLevel][gameIndex] = true;

        const completedGames = Object.keys(this.currentUser.miniGameProgress[currentLevel] || {}).length;
        let message = "Game completed successfully!";

        if (completedGames === this.MINI_GAMES_PER_LEVEL) {
            this.currentUser.exchangeTickets = (this.currentUser.exchangeTickets || 0) + 1;
            message += `\n\n🎫 Bonus: You've completed all ${this.MINI_GAMES_PER_LEVEL} games at Level ${currentLevel}!\nYou earned 1 Exchange Ticket!`;
        }

        this.saveUserData();
        alert(message);
    }


    resetCurrentGame() {
        if (this.currentGame && this.currentGame.type === 'grouping') {
            const wordBank = document.getElementById('grouping-word-bank');
            if (!wordBank) return; // Safety check

            const allWords = document.querySelectorAll('.draggable');
            allWords.forEach(wordEl => {
                wordEl.classList.remove('wrong');
                wordBank.appendChild(wordEl);
            });
        } else if (this.currentGame && this.currentGame.type === 'matching') {
            // Manual reset like grouping game
            const wordBank = document.getElementById('matching-word-bank');
            const dropZones = document.querySelectorAll('.descriptions-grid .drop-zone');

            if (!wordBank) return; // Safety check

            // Move all words back to the word bank
            dropZones.forEach(zone => {
                const wordEl = zone.querySelector('.draggable');
                if (wordEl) {
                    wordBank.appendChild(wordEl);
                }
                // Clear visual status
                zone.classList.remove('wrong', 'correct');
            });

            // Clear any wrong/correct classes from words
            document.querySelectorAll('.draggable').forEach(wordEl => {
                wordEl.classList.remove('wrong', 'correct');
            });
        } else if (this.currentGame && this.currentGame.type === 'pairing') {
            this.renderPairingGame(document.getElementById('game-content'), this.currentGame);
        } else if (this.currentGame && this.currentGame.type === 'sentenceCompletion') {
            this.renderSentenceCompletion(document.getElementById('game-content'), this.currentGame);
        } else if (this.currentGame && this.currentGame.type === 'formingSentences') {
            this.renderFormingSentencesGame(document.getElementById('game-content'), this.currentGame);
        } else if (this.currentGame) {
            this.renderGameContent(this.currentGame);
        }
    }

    checkGameAnswer() {
        if (this.currentGame && this.currentGame.type === 'grouping') {
            this.checkGroupingAnswer();
            return;
        }

        if (this.currentGame.type === 'sentenceCompletion') {
            this.checkSentenceCompletionAnswer();
            return;
        }

        if (this.currentGame.type === 'matching') {
            this.checkMatchingAnswer();
            return;
        }

        if (this.currentGame.type === 'formingSentences') {
            this.checkFormingSentencesAnswer();
            return;
        }

        // For pairing games, the checking happens automatically
        if (this.currentGame && this.currentGame.type === 'pairing') {
            if (this.currentPairingGame && this.currentPairingGame.score === this.currentPairingGame.total) {
                this.completePairingGame();
            } else {
                alert('Keep finding pairs! You need to match all words correctly.');
            }
            return;
        }

        // For other game types
        alert('Checking answer...');
    }

    updateExchangeTicketDisplay() {
        const ticketCount = this.currentUser.exchangeTickets || 0;

        // --- Safely update the elements if they exist ---
        const miniGameDisplay = document.getElementById('exchange-ticket-count');
        if (miniGameDisplay) {
            miniGameDisplay.textContent = ticketCount;
        }

        const collectionsDisplay = document.getElementById('exchange-ticket-count-collections');
        if (collectionsDisplay) {
            collectionsDisplay.textContent = ticketCount;
        }
    }

    // --- Drag and drop ---
// Replace setupDragAndDrop entirely with this native approach
setupDragAndDrop() {
    // Clean up interact.js
    if (typeof interact !== 'undefined') {
        interact('.draggable').unset();
        interact('.drop-zone, .group-drop-zone, .sentence-drop-zone').unset();
    }

    this.initNativeDragDrop();
}

initNativeDragDrop() {
    const draggables = document.querySelectorAll('.draggable');
    const dropZones = document.querySelectorAll('.drop-zone, .group-drop-zone, .sentence-drop-zone');

    // Setup draggable items
    draggables.forEach(item => {
        item.draggable = true;

        // Drag start
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.word);
            e.dataTransfer.setData('text/element-id', item.id || '');
            item.classList.add('is-dragging');

            // Store reference for touch fallback
            this.currentDragItem = item;

            console.log('Drag started:', item.dataset.word);
        });

        // Drag end
        item.addEventListener('dragend', (e) => {
            item.classList.remove('is-dragging');
            this.currentDragItem = null;

            // Clean up all drop zone states
            dropZones.forEach(zone => {
                zone.classList.remove('drag-over', 'drop-target');
            });
        });

        // Touch fallback for mobile
        this.addTouchSupport(item);
    });

    // Setup drop zones
    dropZones.forEach(zone => {
        // Prevent default to allow drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        // Visual feedback
        zone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            zone.classList.add('drop-target');
        });

        zone.addEventListener('dragleave', (e) => {
            zone.classList.remove('drag-over', 'drop-target');
        });

        // Handle drop
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over', 'drop-target');

            const word = e.dataTransfer.getData('text/plain');
            const draggedItem = document.querySelector(`[data-word="${word}"].is-dragging`) || this.currentDragItem;

            if (draggedItem) {
                this.handleNativeDrop(zone, draggedItem);
            }
        });
    });
}

// Lightweight touch support
addTouchSupport(item) {
    let startPos = null;
    let isDragging = false;
    let dragClone = null;

    item.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startPos = { x: touch.clientX, y: touch.clientY };

        // Very short delay to distinguish from scroll
        setTimeout(() => {
            if (startPos) {
                isDragging = true;
                dragClone = this.createDragClone(item, touch);
                item.style.opacity = '0.3';
                this.currentDragItem = item;

                // Prevent scrolling during drag
                document.body.style.overflow = 'hidden';
                e.preventDefault();
            }
        }, 100); // Reduced from 50ms for better responsiveness
    }, { passive: false });

    item.addEventListener('touchmove', (e) => {
        if (!isDragging || !dragClone) return;

        const touch = e.touches[0];

        // Always update clone position - this is the key fix
        this.updateDragClone(dragClone, touch);
        this.highlightDropZoneUnderTouch(touch);

        e.preventDefault();
    }, { passive: false });

    item.addEventListener('touchend', (e) => {
        if (isDragging && dragClone) {
            const touch = e.changedTouches[0];
            this.handleTouchDrop(item, touch);
        }

        this.cleanupTouchDrag();
        startPos = null;
        isDragging = false;
        dragClone = null;

        // Re-enable scrolling
        document.body.style.overflow = '';
    });
}

createDragClone(item, touch) {
    const clone = item.cloneNode(true);
    clone.id = 'touch-drag-clone';
    clone.style.position = 'fixed';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.transform = 'scale(1.1)';
    clone.style.opacity = '0.9';
    clone.style.transition = 'none'; // Remove any transitions that might interfere
    clone.style.left = (touch.clientX - 30) + 'px';
    clone.style.top = (touch.clientY - 20) + 'px';
    clone.style.background = '#fff';
    clone.style.border = '2px solid #007bff';
    clone.style.borderRadius = '8px';
    clone.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';

    document.body.appendChild(clone);
    return clone;
}

updateDragClone(clone, touch) {
    if (!clone) return;

    // Use requestAnimationFrame for smoother movement
    requestAnimationFrame(() => {
        clone.style.left = (touch.clientX - 30) + 'px';
        clone.style.top = (touch.clientY - 20) + 'px';
    });
}

highlightDropZoneUnderTouch(touch) {
    // Clear previous highlights
    document.querySelectorAll('.drop-zone, .group-drop-zone, .sentence-drop-zone').forEach(zone => {
        zone.classList.remove('drop-target');
    });

    // Temporarily hide the clone to get element below
    const clone = document.getElementById('touch-drag-clone');
    if (clone) {
        clone.style.display = 'none';
    }

    // Find element under touch point
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('.drop-zone, .group-drop-zone, .sentence-drop-zone');

    // Restore clone
    if (clone) {
        clone.style.display = 'block';
    }

    if (dropZone) {
        dropZone.classList.add('drop-target');
    }
}

handleTouchDrop(item, touch) {
    // Temporarily hide the clone to get accurate element below
    const clone = document.getElementById('touch-drag-clone');
    if (clone) {
        clone.style.display = 'none';
    }

    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('.drop-zone, .group-drop-zone, .sentence-drop-zone');

    // Restore clone for cleanup
    if (clone) {
        clone.style.display = 'block';
    }

    if (dropZone) {
        this.handleNativeDrop(dropZone, item);
    } else {
        // Return to original position with animation
        item.style.opacity = '';
        console.log('Touch drop outside valid zone');
    }
}

cleanupTouchDrag() {
    const clone = document.getElementById('touch-drag-clone');
    if (clone) {
        // Animate clone disappearing
        clone.style.transition = 'opacity 0.2s ease';
        clone.style.opacity = '0';
        setTimeout(() => clone.remove(), 200);
    }

    if (this.currentDragItem) {
        this.currentDragItem.style.opacity = '';
    }

    // Clear all drop zone highlights
    document.querySelectorAll('.drop-zone, .group-drop-zone, .sentence-drop-zone').forEach(zone => {
        zone.classList.remove('drop-target', 'drag-over');
    });

    // Re-enable scrolling
    document.body.style.overflow = '';
}

handleNativeDrop(dropzone, draggable) {
    console.log('Native drop:', draggable.dataset.word, 'into', dropzone.className);

    // Validate the drop
    if (!this.isValidDrop(dropzone, draggable)) {
        this.returnToWordBank(draggable);
        return;
    }

    // Handle single-item drop zones
    if (dropzone.classList.contains('drop-zone') || dropzone.classList.contains('sentence-drop-zone')) {
        const existingItem = dropzone.querySelector('.draggable');
        if (existingItem && existingItem !== draggable) {
            this.returnToWordBank(existingItem);
        }
    }

    // Place the item
    dropzone.appendChild(draggable);
    draggable.classList.add('placed-in-zone');

    // Success feedback
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Keep your existing isValidDrop and returnToWordBank methods
isValidDrop(dropzone, draggable) {
    return !dropzone.classList.contains('word-bank');
}

returnToWordBank(item) {
    const wordBanks = [
        'grouping-word-bank',
        'matching-word-bank',
        'sentence-word-bank',
        'forming-sentences-word-bank'
    ];

    let wordBank = null;
    for (const bankId of wordBanks) {
        wordBank = document.getElementById(bankId);
        if (wordBank) break;
    }

    if (wordBank) {
        item.classList.remove('placed-in-zone');
        wordBank.appendChild(item);
    }
}


}

const app = new ChineseLearningApp();