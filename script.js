class ChineseLearningApp {
    constructor() {
        this.currentUser = null;
        this.currentActivity = null;
        this.calendar = null;

        // --- GLOBAL CONFIGURATION VARIABLES ---
        this.APP_VERSION = '1.5.1';
        this.MAX_LEVEL = 22;
        this.DEFAULT_WORDS_VERSION = '1.5.1';
        this.LATEST_MINIGAME_VERSION = '1.5.1';
        this.LEVEL_UP_DIAMOND_BONUS = 2;

        // Word Reivew Activity Configuration
        this.REVIEW_WORDS_PER_SESSION = 20;
        this.REVIEW_CURRENT_LEVEL_COMPLETIONS = 1; // Number of times the current level words tested
        this.REVIEW_LOWER_LEVEL_COMPLETIONS = 1; // Number of times the lower level words tested
        this.REVIEW_LOWER_LEVEL_MAX_WORDS = 26;
        this.REVIEW_LOWER_LEVEL_RANGE = 8;       // Used for all 3 activities

        // Listening (Word Writing) Activity Configuration
        this.LISTENING_WORDS_PER_SESSION = 12;
        this.LISTENING_CURRENT_LEVEL_COMPLETIONS = 1;
        this.LISTENING_LOWER_LEVEL_COMPLETIONS = 1;
        this.LISTENING_LOWER_LEVEL_MAX_WORDS = 26;

        // Sentence Writing Configuration
        this.SENTENCE_WORDS_PER_SESSION = 12;

        // Mini Game Configuration
        this.MINI_GAME_ENABLED_LEVELS = [5, 7, 8, 10, 11, 13, 14, 16, 18];
        this.MINI_GAMES_PER_LEVEL = 8;
        this.MINI_GAMES_LEVEL_RANGE = 8;
        this.MINI_GAMES_PAIRING_MAX_PAIRS = 10;
        this.MINI_GAMES_MATCHING_MAX_PAIRS = 10;
        this.MINI_GAMES_GROUPING_MIN_WORDS = 18;
        this.MINI_GAMES_GROUPING_MAX_WORDS = 25;
        this.MINI_GAMES_GROUPING_MAX_GROUPS = 3;
        this.MINI_GAMES_GROUPING_MIN_GROUPS = 2;
        this.MINI_GAMES_FORMING_SENTENCE_NUM_SENTENCES = 5;
        this.MINI_GAMES_SENTENCE_COMPLETION_MIN_WORDS = 10;

        // Gacha probabilities (must add up to 100)
        this.GACHA_PROBABILITIES = {
            Legendary: 2,
            Epic: 10,
            Rare: 30,
            Common: 58
        };

        this.GACHA_EXCHANGE_RATES_SELL = {
            Legendary: 30,
            Epic: 10,
            Rare: 3,
            Common: 1
        };

        this.GACHA_EXCHANGE_RATES_DRAW = {
            Legendary: 32,
            Epic: 12,
            Rare: 5,
            Common: 2
        };

        this.GACHA_EXCHANGE_RATES_SPECIFIED = {
            Legendary: 45,
            Epic: 25,
            Rare: 10,
            Common: 3,
            diamond_1: 6,
            diamond_10: 50
        };

        this.DRAW_TEN_GUARANTEE_LEGENDARY_CHANCE = 20; // Temporary change 15% to 20% in Harry Potter collection
        this.DRAW_TEN_DIAMOND_REWARD_AMOUNT = 10;
        this.DRAW_TEN_COST = 10;

        this.isExchangeMode = false;
        this.exchangeSelection = {}; // { id: count }

        this.currentGachaPool = 'harrypotter';
        this.archivedGachaPools = ['kpop', 'villains', 'greek'];
        this.currentArchiveIndex = 0;
        this.gachaPool = this.defineGachaPool();

        // Social studies configuration
        this.SOCIAL_STUDIES_FILENAME = 'social.json';
        this.SOCIAL_STUDIES_PASSING_SCORE = 90;
        this.SOCIAL_STUDIES_BASE_CULTURAL_POINTS_EARNED = 100;
        this.SOCIAL_STUDIES_CULTURAL_POINTS_INCREMENT = 10;

        this.socialStudiesContent = null;
        this.currentSocialStudiesPage = 0;
        this.currentSelectedAnswer = null; // For pic_match
        this.currentMatchSelection = null; // For match quiz
        this.mChoiceSelections = {}; // For mchoice quiz
        this.socialStudiesReviewMode = false;
        this.perkDefinitions = this.definePerkDefinitions(); // Perks from cultural recognizition page
        this.themeManifest = this.defineThemeManifest(); // Theme name definitions
        this.effectiveConfig = null; // Initialize the stored config

        this.init();
    }

    async init() {
        await this.initializeDefaultWords(); // Wait for words to load before continuing
        await this.initializeMiniGameContent();
        await this.initializeSocialStudiesContent();
        this.setupEventListeners();
        this.checkLoggedInUser();
    }

    defineGachaPool() {
        // Current active pool - Harry Potter
        return [
            { id: 'voldemort', name: 'Voldemort', rarity: 'Legendary', image: 'harrypotter/voldemort.jpg' },
            { id: 'hermione', name: 'Hermione', rarity: 'Legendary', image: 'harrypotter/hermione.jpg' },
            { id: 'harry', name: 'Harry', rarity: 'Epic', image: 'harrypotter/harry.jpg' },
            { id: 'ron', name: 'Ron', rarity: 'Epic', image: 'harrypotter/ron.jpg' },
            { id: 'dumbledore', name: 'Dumbledore', rarity: 'Epic', image: 'harrypotter/dumbledore.jpg' },
            { id: 'snape', name: 'Severus Snape', rarity: 'Rare', image: 'harrypotter/snape.jpg' },
            { id: 'bellatrix', name: 'Bellatrix Lestrange', rarity: 'Rare', image: 'harrypotter/bellatrix.jpg' },
            { id: 'black', name: 'Sirius Black', rarity: 'Rare', image: 'harrypotter/black.jpg' },
            { id: 'mcGonagall', name: 'Professor McGonagall', rarity: 'Rare', image: 'harrypotter/mcGonagall.jpg' },
            { id: 'ginny', name: 'Ginny', rarity: 'Common', image: 'harrypotter/ginny.jpg' },
            { id: 'draco', name: 'Draco Malfoy', rarity: 'Common', image: 'harrypotter/draco.jpg' },
            { id: 'luna', name: 'Luna Lovegood', rarity: 'Common', image: 'harrypotter/luna.jpg' },
            { id: 'hagrid', name: 'Hagrid', rarity: 'Common', image: 'harrypotter/hagrid.jpg' },
            { id: 'dobby', name: 'Dobby', rarity: 'Common', image: 'harrypotter/dobby.jpg' }
        ];
    }

    getKpopPool() {
        return [
            { id: 'birthday', name: 'Birthday', rarity: 'Free', image: 'kpopdemon/birthday.jpg' },
            { id: 'rumi', name: 'Rumi', rarity: 'Legendary', image: 'kpopdemon/rumi.jpg' },
            { id: 'jinu', name: 'Jinu', rarity: 'Legendary', image: 'kpopdemon/jinu.jpg' },
            { id: 'mira', name: 'Mira', rarity: 'Epic', image: 'kpopdemon/mira.jpg' },
            { id: 'zoey', name: 'Zoey', rarity: 'Epic', image: 'kpopdemon/zoey.jpg' },
            { id: 'mystery', name: 'Mystery', rarity: 'Rare', image: 'kpopdemon/mystery.jpg' },
            { id: 'baby', name: 'Baby', rarity: 'Rare', image: 'kpopdemon/baby.jpg' },
            { id: 'abby', name: 'Abby', rarity: 'Rare', image: 'kpopdemon/abby.jpg' },
            { id: 'romance', name: 'Romance', rarity: 'Rare', image: 'kpopdemon/romance.jpg' },
            { id: 'derpy', name: 'Derpy', rarity: 'Common', image: 'kpopdemon/derpy.jpg' },
            { id: 'sussie', name: 'Sussie', rarity: 'Common', image: 'kpopdemon/sussie.jpg' },
            { id: 'celine', name: 'Celine', rarity: 'Common', image: 'kpopdemon/celine.jpg' },
            { id: 'demons', name: 'Demons', rarity: 'Common', image: 'kpopdemon/demons.png' },
            { id: 'weapons', name: 'Weapons', rarity: 'Common', image: 'kpopdemon/weapons.jpg' }
        ];
    }

    getVillainsPool() {
        return [
            { id: 'maleficent', name: 'Maleficent', rarity: 'Legendary', image: 'villains/maleficent.png' },
            { id: 'ursula', name: 'Ursula', rarity: 'Legendary', image: 'villains/ursula.png' },
            { id: 'evil', name: 'Evil Queen', rarity: 'Epic', image: 'villains/evil_queen.png' },
            { id: 'cruella', name: 'Cruella De Vil', rarity: 'Epic', image: 'villains/cruella.png' },
            { id: 'scar', name: 'Scar', rarity: 'Rare', image: 'villains/scar.png' },
            { id: 'gaston', name: 'Gaston', rarity: 'Rare', image: 'villains/gaston.png' },
            { id: 'jafar', name: 'Jafar', rarity: 'Rare', image: 'villains/jafar.png' },
            { id: 'yzma', name: 'Yzma', rarity: 'Rare', image: 'villains/yzma.png' },
            { id: 'hook', name: 'Captain Hook', rarity: 'Common', image: 'villains/hook.png' },
            { id: 'hades_villain', name: 'Hades', rarity: 'Common', image: 'villains/hades.png' },
            { id: 'stepmother', name: 'Lady Tremaine', rarity: 'Common', image: 'villains/tremaine.png' },
            { id: 'mim', name: 'Madam Mim', rarity: 'Common', image: 'villains/madam_mim.png' },
            { id: 'magnifico', name: 'King Magnifico', rarity: 'Common', image: 'villains/magnifico.png' },
            { id: 'gothel', name: 'Mother Gothel', rarity: 'Common', image: 'villains/gothel.png' }
        ];
    }

    getGreekGodsPool() {
        // Retired Greek Gods collection
        return [
            { id: 'zeus', name: 'Zeus', rarity: 'Legendary', image: 'greek/zeus.png' },
            { id: 'poseidon', name: 'Poseidon', rarity: 'Epic', image: 'greek/poseidon.png' },
            { id: 'hades_greek', name: 'Hades', rarity: 'Epic', image: 'greek/hades.png' },
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

    getPoolMetadata(poolName) {
        switch (poolName) {
            case 'greek': return { title: 'Greek Gods Collection', subtitle: 'Event: Sep 14 ~ Oct 15 2025' };
            case 'villains': return { title: 'Disney Villains Collection', subtitle: 'Event: Oct 16 ~ Nov 16 2025' };
            case 'kpop': return { title: 'K-pop Demon Hunters', subtitle: 'Event: Nov 17 ~ Dec 14 2025' };
            case 'harrypotter': return { title: 'Harry Potter Collection', subtitle: 'Event: Dec 15 2025 ~ Jan 31 2026' };
            default: return { title: 'Unknown Collection', subtitle: '(Archived)' };
        }
    }

    getPoolDataByName(poolName) {
        switch (poolName) {
            case 'villains': return this.getVillainsPool();
            case 'greek': return this.getGreekGodsPool();
            case 'kpop': return this.getKpopPool();
            case 'harrypotter': return this.defineGachaPool(); // Current pool
            default: return [];
        }
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

    async initializeSocialStudiesContent() {
        if (!this.socialStudiesContent) {
            try {
                const response = await fetch(this.SOCIAL_STUDIES_FILENAME);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.socialStudiesContent = await response.json();
            } catch (error) {
                console.error('Failed to load social studies content:', error);
                // We don't show an error screen here, as it's not a critical file like words.json
                // The feature just won't work.
            }
        }
    }

    initializeUserProperties() {
        this.currentUser.diamonds = this.currentUser.diamonds || 0;
        this.currentUser.exchangeTickets = this.currentUser.exchangeTickets || 0;
        this.currentUser.culturalPoints = this.currentUser.culturalPoints || 0;
        this.currentUser.perkLevels = this.currentUser.perkLevels || {};
        this.currentUser.lastPerkResetPool = this.currentUser.lastPerkResetPool || "";
        this.currentUser.activeTheme = this.currentUser.activeTheme || 'default';
        this.currentUser.listeningProgress = this.currentUser.listeningProgress || {};
        this.currentUser.listeningLowerLevelWords = this.currentUser.listeningLowerLevelWords || [];
        this.currentUser.reviewLowerLevelWords = this.currentUser.reviewLowerLevelWords || [];
        this.currentUser.sentenceWritingCompleted = this.currentUser.sentenceWritingCompleted || false;
        this.currentUser.sentenceWritingWords = this.currentUser.sentenceWritingWords || {};
        this.currentUser.activityLog = this.currentUser.activityLog || [];
        this.currentUser.miniGameDataForLevel = this.currentUser.miniGameDataForLevel || {};
        this.currentUser.socialStudiesProgress = this.currentUser.socialStudiesProgress || {};
        this.currentUser.forceCheckAnswerMode = this.currentUser.forceCheckAnswerMode ?? true;

        // Collection migration and initialization
        this.migrateCollectionData();

        if ((!this.currentUser.listeningLowerLevelWords || this.currentUser.listeningLowerLevelWords.length === 0 || !this.currentUser.reviewLowerLevelWords || this.currentUser.reviewLowerLevelWords.length === 0) && this.currentUser.level > 1) {
            this.generatePracticeSubsets();
            this.saveUserData();
        }

        // Generate sentence writing words for current level if not exists
        if (!this.currentUser.sentenceWritingWords[this.currentUser.level]) {
            this.generateSentenceWritingWordList();
            this.saveUserData();
        }

        // Loop through all defined categories in social.json and initialize them.
        if (this.socialStudiesContent) {
            for (const category in this.socialStudiesContent) {
                if (!this.currentUser.socialStudiesProgress[category]) {
                    this.currentUser.socialStudiesProgress[category] = {};
                }
            }
        }

        // --- Migration for Social Studies hasPassed flag ---
        const progress = this.currentUser.socialStudiesProgress;
        for (const category in progress) {
            for (const level in progress[category]) {
                const levelProgress = progress[category][level];
                // Only run migration if hasPassed is not already set.
                if (levelProgress && typeof levelProgress.hasPassed === 'undefined') {
                    // If culturalPointsAwarded was true, the level was passed.
                    if (levelProgress.culturalPointsAwarded === true) {
                        levelProgress.hasPassed = true;
                    }
                    // If not, check the score manually for older data.
                    else if (levelProgress.finalScore) {
                        const [score, total] = levelProgress.finalScore.split('/').map(Number);
                        const percentage = total > 0 ? (score / total) * 100 : 0;
                        if (percentage >= this.SOCIAL_STUDIES_PASSING_SCORE) {
                            levelProgress.hasPassed = true;
                  }
                    }
                    // Clean up the old redundant flag.
                    delete levelProgress.culturalPointsAwarded;
                }
            }
        }

        // Calculate benefits earned from cultural reconginition page
        this._recalculateEffectiveConfig();

        // Check for collection-based perk reset ---
        this._checkCollectionPerkReset();
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
        document.getElementById('social-studies-card').addEventListener('click', () => this.showSocialStudies());
        document.getElementById('cultural-recognition-btn').addEventListener('click', () => this.showCulturalRecognitionPage());

        // Activities
        document.getElementById('back-to-dashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('check-btn').addEventListener('click', () => this.handleWordResponse(true));
        document.getElementById('cross-btn').addEventListener('click', () => this.handleWordResponse(false));
        document.getElementById('back-from-writing').addEventListener('click', () => this.showDashboard());
        document.getElementById('replay-audio-btn').addEventListener('click', () => this.speak(this.currentActivity.currentAnswer));
        document.getElementById('show-answer-btn').addEventListener('click', () => this.showWritingAnswer());
        document.getElementById('writing-check-btn').addEventListener('click', () => this.handleWritingResponse(true));
        document.getElementById('writing-cross-btn').addEventListener('click', () => this.handleWritingResponse(false));
        document.getElementById('back-from-sentence').addEventListener('click', () => this.showDashboard());
        document.getElementById('sentence-check-btn').addEventListener('click', () => this.handleSentenceCompletion(true));
        document.getElementById('sentence-cross-btn').addEventListener('click', () => this.handleSentenceCompletion(false));
        document.getElementById('back-from-social-studies').addEventListener('click', () => this.showDashboard());
        document.getElementById('back-from-recognition').addEventListener('click', () => this.showSocialStudies());

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

        // Collections History
        document.getElementById('collections-history-btn').addEventListener('click', () => this.showCollectionsHistory());
        document.getElementById('back-from-collections-history').addEventListener('click', () => this.showCollectionsPage());
        document.getElementById('prev-collection-btn').addEventListener('click', () => this.navigateArchivedCollections(-1));
        document.getElementById('next-collection-btn').addEventListener('click', () => this.navigateArchivedCollections(1));


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

        // Word Review and Word Listening Force Check Answer Mode toggle
        document.getElementById('review-audio-btn').addEventListener('click', () => {
            this.speak(this.currentActivity.words[this.currentActivity.currentIndex]);
            // --- Enable buttons if mode is on ---
            if (this.currentUser.forceCheckAnswerMode) {
                document.getElementById('check-btn').disabled = false;
                document.getElementById('cross-btn').disabled = false;
            }
        });

        const forceCheckToggle = document.getElementById('force-check-mode-toggle');
        if (forceCheckToggle) {
            forceCheckToggle.addEventListener('change', (e) => {
                this.currentUser.forceCheckAnswerMode = e.target.checked;
                this.saveUserData();
                alert(`Force Check Answer Mode is now ${e.target.checked ? 'ON' : 'OFF'}.`);
            });
        }

        // Social Studies Tabs
        document.querySelectorAll('.social-studies-tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.handleSocialStudiesTabSwitch(e));
        });

        // Social Studies Page Navigation & Level Select
        document.getElementById('prev-ss-page-btn').addEventListener('click', () => this.navigateSocialStudiesPage(-1));
        document.getElementById('next-ss-page-btn').addEventListener('click', () => this.navigateSocialStudiesPage(1));
        document.querySelectorAll('.level-select-dropdown').forEach(select => {
            select.addEventListener('change', () => {
                this.socialStudiesReviewMode = false; // Exit review mode
                this.currentSocialStudiesPage = 0;    // Go to first page of new level
                this.renderSocialStudiesContent();
            });
        });
        document.getElementById('restart-social-studies-level-btn').addEventListener('click', () => this.restartSocialStudiesLevel());
        document.getElementById('review-social-studies-btn').addEventListener('click', () => this.reviewSocialStudiesLevel());
        document.getElementById('start-social-studies-btn').addEventListener('click', () => this.startSocialStudiesQuiz());


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

    checkLoggedInUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.initializeUserProperties();
            this.manageMiniGameDataLifecycle();
            this._applyTheme(); // Apply theme on load
            this.showDashboard();
        } else {
            this.showScreen('auth-screen');
        }
    }

    _applyTheme() {
        document.body.className = this.currentUser.activeTheme === 'default' ? '' : `theme-${this.currentUser.activeTheme}`;
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
            sentenceWritingWords: {},
            testScores: [],
            activityLog: [],
            diamonds: 0,
            culturalPoints: 0,
            collection: {},
        };

        users[username] = newUser;
        localStorage.setItem('users', JSON.stringify(users));
        this.currentUser = newUser;
        this.initializeUserProperties();
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.showDashboard();
    }

    handleLogout() {
        if (confirm("Are you sure you want to log out?")) {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.showScreen('auth-screen');
        }
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
        const noScrollScreens = ['word-review-screen', 'word-writing-screen', 'sentence-writing-screen', 'collections-history-screen'];
        let shouldBeNoScroll = noScrollScreens.includes(screenId);

        // Special check for specific mini-game types
        if (screenId === 'game-play-screen' && this.currentGame) {
            const noScrollGameTypes = ['sentenceCompletion', 'formingSentences'];
            if (noScrollGameTypes.includes(this.currentGame.type)) {
                shouldBeNoScroll = true;
            }
        }

        if (shouldBeNoScroll) {
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
        this.setupDynamicContent();

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

    getAllWordsInRange(startLevel, endLevel) {
        const defaultWords = JSON.parse(localStorage.getItem('defaultWords'));
        const userWords = JSON.parse(localStorage.getItem(`words_${this.currentUser.username}`) || '{}');
        let allWords = [];
        for (let i = startLevel; i <= endLevel; i++) {
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

        // --- Force Check Answer Mode Logic ---
        const checkBtn = document.getElementById('check-btn');
        const crossBtn = document.getElementById('cross-btn');
        if (this.currentUser.forceCheckAnswerMode) {
            checkBtn.disabled = true;
            crossBtn.disabled = true;
        } else {
            checkBtn.disabled = false;
            crossBtn.disabled = false;
        }
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
            this.currentUser.wordProgress[word] = { correct: 0, total: 0, level: this.getWordLevel(word), incorrect: 0 };
        }
        this.currentUser.wordProgress[word].total++;
        if (isCorrect) {
            this.currentUser.wordProgress[word].correct++;
        } else {
            // Explicitly track incorrect answers
            this.currentUser.wordProgress[word].incorrect = (this.currentUser.wordProgress[word].incorrect || 0) + 1;
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
        this.currentUser.sentenceWritingWords = {};

        // First, generate the new random subsets for the new level
        this.generatePracticeSubsets();

        // Generate fixed sentence writing word list for the new level
        this.generateSentenceWritingWordList();

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
        this.manageMiniGameDataLifecycle();
    }

    generatePracticeSubsets() {
        const currentLevel = this.currentUser.level;
        const startLevel = Math.max(1, currentLevel - this.REVIEW_LOWER_LEVEL_RANGE);
        const endLevel = currentLevel - 1;
        const lowerLevelWords = this.getAllWordsInRange(startLevel, endLevel);

        if (lowerLevelWords.length === 0) {
            this.currentUser.reviewLowerLevelWords = [];
            this.currentUser.listeningLowerLevelWords = [];
            return;
        }

        const shuffled = [...lowerLevelWords].sort(() => 0.5 - Math.random());
        const listenCount = this.LISTENING_LOWER_LEVEL_MAX_WORDS;
        const reviewCount = this.REVIEW_LOWER_LEVEL_MAX_WORDS;

        if (listenCount + reviewCount > shuffled.length) {
            console.warn("MAX_WORDS for subsets add up to more than 100% or were capped. Overlap may occur.");
            this.currentUser.listeningLowerLevelWords = shuffled.slice(0, listenCount);
            this.currentUser.reviewLowerLevelWords = shuffled.slice(-reviewCount);
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

        // Word Writing Progress (Right Column)
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

        // Sentence Writing Progress (Third Column)
        const sentenceContainer = document.getElementById('sentence-writing-progress');
        let sentenceHTML = '<h4>Sentence Writing Progress</h4>';
        const sentenceProgress = this.currentUser.sentenceWritingCompleted ? 100 : 0;
        sentenceHTML += `<div class="level-progress-item ${sentenceProgress >= 100 ? 'completed' : ''}"><div class="level-header"><h5>Practice Task</h5></div><div class="level-progress-bar"><div class="level-progress-fill" style="width: ${sentenceProgress}%">${sentenceProgress}%</div></div></div>`;

        // Add sentence writing word list
        const sentenceWritingWords = this.currentUser.sentenceWritingWords[currentLevel] || [];
        if (sentenceWritingWords.length > 0) {
            sentenceHTML += `<div class="listening-word-list">
                <h5 class="collapsible-header">
                    <span>Sentence Writing Words</span>
                    <span class="expand-icon">▼</span>
                </h5>
                <div class="collapsible-content">
                    <div class="listening-word-grid">`;
            sentenceWritingWords.forEach(word => {
                // All words show as "available" since sentence writing is pass/fail
                sentenceHTML += `<div class="listening-word-item">${word}</div>`;
            });
            sentenceHTML += `</div></div></div>`;
        }

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

        // Theme selection
        const devThemeSelector = document.getElementById('dev-theme-selector');
        devThemeSelector.innerHTML = '';

        // Read directly from the central manifest
        this.themeManifest.forEach(theme => {
            let isUnlocked = !theme.requiredPerk || (this.currentUser.perkLevels[theme.requiredPerk] || 0) > 0;

            const themeBtn = document.createElement('button');
            themeBtn.className = 'theme-btn';
            themeBtn.textContent = theme.name;
            themeBtn.dataset.theme = theme.id;
            themeBtn.disabled = !isUnlocked;

            if (this.currentUser.activeTheme === theme.id) {
                themeBtn.classList.add('active');
            }
            devThemeSelector.appendChild(themeBtn);
        });

        // Attach event listeners (this part is unchanged)
        devThemeSelector.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleThemeChange(e.currentTarget.dataset.theme);
                this.showDeveloperMode();
            });
        });

        // --- Force Check Mode switch state ---
        const forceCheckToggle = document.getElementById('force-check-mode-toggle');
        if (forceCheckToggle) {
            forceCheckToggle.checked = this.currentUser.forceCheckAnswerMode ?? true;
        }
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
        this.currentUser.sentenceWritingWords = {};

        // 2. Completely wipe all mini-game data.
        // The lifecycle manager will regenerate it for the new level.
        this.currentUser.miniGameDataForLevel = {};

        // 3. Re-run the full initialization logic on the modified user object.
        // This will correctly generate new practice subsets and handle any other derived data.
        this.initializeUserProperties();

        // 4. Save the reset user data
        this.saveUserData();

        // 5. Run the lifecycle manager to create a fresh set of mini-games for the new level
        this.manageMiniGameDataLifecycle();

        alert(`✅ Successfully reset to Level ${targetLevel}!`);

        // 6. Apply theme and re-render the developer mode screen to reflect the changes.
        this._applyTheme();
        this.showDeveloperMode();
    }

    resetAllMiniGames() {
        const confirmMessage = `Are you sure you want to reset ALL mini-game data?\n\nThis will:\n• Clear all mini-game progress\n• Clear all generated mini-game sets\n• Clear cached mini-game content\n• Force reload from minigame.json\n• This action cannot be undone!`;

        if (!confirm(confirmMessage)) return;

        const doubleConfirm = prompt(`Type "RESET" to confirm you want to reset all mini-game data:`);
        if (doubleConfirm !== "RESET") {
            alert('Reset cancelled. You must type "RESET" exactly to confirm.');
            return;
        }

        try {
            // 1. Clear all user mini-game progress
            this.currentUser.miniGameDataForLevel = {};

            // 2. Clear cached mini-game content from localStorage
            localStorage.removeItem('miniGameContent');
            localStorage.removeItem('miniGameContentVersion');

            // 3. Save the cleared user data
            this.saveUserData();

            // 4. Force reload of mini-game content
            this.initializeMiniGameContent().then(() => {
                this.manageMiniGameDataLifecycle(); // Regenerate games for current level
                alert('✅ Mini-game reset completed successfully!');
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

        // --- Create a detailed timestamp in the format YYYY_MM_DD-HH:mm (not doing ss) ---
        const now = new Date();
        const date = now.getFullYear() + '_' + String(now.getMonth() + 1).padStart(2, '0') + '_' + String(now.getDate()).padStart(2, '0');
        const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

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
                    this.logActivity('Restore Data', `${file.name}`);

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
        // Ensure current collection is saved to the active pool
        if (this.currentUser.collectionsByPool) {
            this.currentUser.collectionsByPool[this.currentGachaPool] = { ...this.currentUser.collection };
        }

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

        const dataSource = this.getCalendarEvents();

        this.calendar = new Calendar(calendarEl, {
            numberMonthsDisplayed: 1,
            dataSource: this.getCalendarEvents(),
            language: 'en',
            startDate: new Date(),
            weekStart: 1,
            customDayRenderer: (element, date) => {
                // Find event from pre-calculated data to avoid timing issue
                const eventForDay = dataSource.find(event => {
                    const eventDate = event.startDate;
                    return eventDate.getFullYear() === date.getFullYear() &&
                           eventDate.getMonth() === date.getMonth() &&
                           eventDate.getDate() === date.getDate();
                });

                if (eventForDay && eventForDay.isSpecialOnly) {
                    element.classList.add('special-activity-day');
                }
            },
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

        const specialActivities = ['Mini-Games Cleared', 'Entered Exchange Mode', 'Restore Data', 'Social Studies'];

        return Object.keys(eventsByDay).map(date => {
            const logsForDay = eventsByDay[date];

            // Determine if the day contains ONLY special activities
            const hasRegularActivity = logsForDay.some(log => !specialActivities.includes(log.name));
            const isSpecialOnly = !hasRegularActivity && logsForDay.some(log => specialActivities.includes(log.name));

            // Create date object using local timezone
            const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
            const dateObj = new Date(year, month - 1, day); // month is 0-indexed
            return {
                // The library needs a name, but we hide it with CSS
                name: "Activity",
                startDate: dateObj,
                endDate: dateObj,
                // We'll store the actual logs in a custom property
                customData: logsForDay,
                isSpecialOnly: isSpecialOnly
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

        // --- Force Check Answer Mode Logic ---
        const checkBtn = document.getElementById('writing-check-btn');
        const crossBtn = document.getElementById('writing-cross-btn');
        if (this.currentUser.forceCheckAnswerMode) {
            checkBtn.disabled = true;
            crossBtn.disabled = true;
        } else {
            checkBtn.disabled = false;
            crossBtn.disabled = false;
        }

        setTimeout(() => this.speak(word), 300);
    }

    showWritingAnswer() {
        if (this.currentActivity && this.currentActivity.type === 'word-writing') {
            const wordEl = document.getElementById('writing-chinese-word');
            wordEl.textContent = this.currentActivity.currentAnswer;
            wordEl.classList.remove('answer-hidden');

            // --- Enable buttons if mode is on ---
            if (this.currentUser.forceCheckAnswerMode) {
                document.getElementById('writing-check-btn').disabled = false;
                document.getElementById('writing-cross-btn').disabled = false;
            }
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
        // Get the fixed word list for the current level
        const currentLevel = this.currentUser.level;
        let words = this.currentUser.sentenceWritingWords[currentLevel];

        // Generate if it doesn't exist (fallback)
        if (!words) {
            this.generateSentenceWritingWordList();
            words = this.currentUser.sentenceWritingWords[currentLevel];
            this.saveUserData();
        }

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
        // For Level 1, there are no previous levels, so we use Level 1 words as the source.
        // For Level 2+, we use words from all preceding levels to reinforce learning.
        const currentLevel = this.currentUser.level;
        const endLevel = currentLevel > 1 ? currentLevel - 1 : 1;
        const startLevel = Math.max(1, currentLevel - this.REVIEW_LOWER_LEVEL_RANGE);
        const allWords = this.getAllWordsInRange(startLevel, endLevel);

        const wordsByCrosses = allWords
            .map(word => ({
                word: word,
                // Use the new 'incorrect' property instead of calculating
                crosses: this.currentUser.wordProgress[word]?.incorrect || 0
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

        // Take ALL available smart random words (up to what's needed)
        const remainingNeeded = this.SENTENCE_WORDS_PER_SESSION - topCrossedWords.length;
        const smartRandomWords = shuffledCandidates.slice(0, remainingNeeded);

        let finalWords = [...new Set([...topCrossedWords, ...smartRandomWords])];

        // Only fill if we still don't have enough words
        const needed = this.SENTENCE_WORDS_PER_SESSION - finalWords.length;
        if (needed > 0) {
            const filler = allWords.filter(w => !finalWords.includes(w)).sort(() => 0.5 - Math.random()).slice(0, needed);
            finalWords.push(...filler);
        }

        return finalWords.slice(0, this.SENTENCE_WORDS_PER_SESSION);
    }

    generateSentenceWritingWordList() {
        // Initialize the property if it doesn't exist
        if (!this.currentUser.sentenceWritingWords) {
            this.currentUser.sentenceWritingWords = {};
        }

        const currentLevel = this.currentUser.level;

        // Only generate if we don't already have words for this level
        if (!this.currentUser.sentenceWritingWords[currentLevel]) {
            this.currentUser.sentenceWritingWords[currentLevel] = this.generateSentenceWritingWords();
        }
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

        // Update "Draw 10" button text based on perks
        const effectiveConfig = this.getEffectiveConfig();
        const drawTenBtn = document.getElementById('draw-ten-gacha-btn');
        if (drawTenBtn) {
            drawTenBtn.textContent = `Draw 10 (${effectiveConfig.drawTenCost}💎)`;
        }
    }

    showCollectionsHistory() {
        this.currentArchiveIndex = 0; // Always start at the newest archive
        this.showScreen('collections-history-screen');
        this.renderArchivedCollectionPage();
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
            gachaControls.classList.add('hidden');
            exchangeTicketWrapper.classList.add('exchange-active');
            exchangeTicketWrapper.title = 'Exit Exchange Mode';
        } else {
            exchangeUI.classList.add('hidden');
            gachaControls.classList.remove('hidden');
            exchangeTicketWrapper.classList.remove('exchange-active');
            exchangeTicketWrapper.title = 'Enter Exchange Mode';
        }

        // Render current collection (villains)
        this.gachaPool.forEach(item => {
            const count = this.currentUser.collection[item.id] || 0;
            const isOwned = count > 0;
            const itemDiv = document.createElement('div');

            // REMOVE LATER
            if (item.rarity === 'Free') {
                itemDiv.className = `collection-item ${item.rarity} ${isOwned ? 'owned' : 'unowned-promo'}`;
                if (isOwned) {
                    // If owned, only show the image. No badges, no names.
                    itemDiv.innerHTML = `<img src="${item.image}" alt="${item.name}" class="collection-item-image">`;
                } else {
                    // If not owned, show the promotional text.
                    itemDiv.innerHTML = `
                        <div class="free-item-promo-text">
                            Draw 10 before<br>end of Nov 17, 2025<br>to get it for FREE!
                        </div>
                    `;
                }
            } else {
                // This is the original logic for all other items.
                itemDiv.className = `collection-item ${item.rarity} ${isOwned ? 'owned' : ''}`;

                let countBadge = isOwned ? `<div class="item-count-badge">x${count}</div>` : '';
                let exchangeControlsHTML = '';

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
            }
            grid.appendChild(itemDiv);
        });


        // Update exchange ticket display when rendering collections
        this.updateExchangeTicketDisplay();

        if (this.isExchangeMode) {
            this.setupCardExchangeListeners();
        }
    }

    renderArchivedCollectionPage() {
        const archiveContainer = document.getElementById('archive-display-area');
        if (!archiveContainer) return;

        const poolName = this.archivedGachaPools[this.currentArchiveIndex];
        if (!poolName) {
            archiveContainer.innerHTML = `<p>No archive found for this page.</p>`;
            return;
        }

        const poolData = this.getPoolDataByName(poolName);
        const userPoolCollection = this.currentUser.collectionsByPool?.[poolName] || {};
        const { title, subtitle } = this.getPoolMetadata(poolName);

        let gridHTML = '';
        poolData.forEach(item => {
            const count = userPoolCollection[item.id] || 0;
            const isOwned = count > 0;
            const countBadge = isOwned ? `<div class="item-count-badge">x${count}</div>` : '';
            gridHTML += `
                <div class="collection-item ${item.rarity} ${isOwned ? 'owned' : ''}">
                    ${countBadge}
                    <img src="${item.image}" alt="${item.name}" class="collection-item-image">
                    <span class="collection-item-name">${item.name}</span>
                </div>
            `;
        });

        archiveContainer.innerHTML = `
            <h3>${title}</h3>
            <p class="collection-subtitle archived">${subtitle}</p>
            <div class="collection-grid">${gridHTML}</div>
        `;

        // This calculates the columns needed for a two-row layout.
        const grid = archiveContainer.querySelector('.collection-grid');
        if (grid) {
            const itemCount = grid.children.length;
            if (itemCount > 0) {
                // To create exactly two rows, we need half the number of items as columns (rounding up).
                const columnCount = Math.ceil(itemCount / 2);
                grid.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
            }
        }

        // Manage navigation button visibility
        const prevBtn = document.getElementById('prev-collection-btn');
        const nextBtn = document.getElementById('next-collection-btn');
        prevBtn.classList.toggle('hidden', this.currentArchiveIndex === 0);
        nextBtn.classList.toggle('hidden', this.currentArchiveIndex >= this.archivedGachaPools.length - 1);
    }

    navigateArchivedCollections(direction) {
        const newIndex = this.currentArchiveIndex + direction;
        if (newIndex >= 0 && newIndex < this.archivedGachaPools.length) {
            this.currentArchiveIndex = newIndex;
            this.renderArchivedCollectionPage();
        }
    }

    _performSingleDraw(effectiveConfig) {
        const probabilities = effectiveConfig.gachaProbabilities;
        const rng = Math.random() * 100;
        let cumulativeProb = 0;
        let chosenRarity;

        if (rng < (cumulativeProb += probabilities.Legendary)) chosenRarity = 'Legendary';
        else if (rng < (cumulativeProb += probabilities.Epic)) chosenRarity = 'Epic';
        else if (rng < (cumulativeProb += probabilities.Rare)) chosenRarity = 'Rare';
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

        const effectiveConfig = this.getEffectiveConfig();
        const drawnItem = this._performSingleDraw(effectiveConfig);

        this.currentUser.collection[drawnItem.id] = (this.currentUser.collection[drawnItem.id] || 0) + 1;
        this.saveUserData();
        this._showItemRevealAnimation(drawnItem);
    }

    drawTenGachaItems() {
        const effectiveConfig = this.getEffectiveConfig();
        const cost = effectiveConfig.drawTenCost;

        if ((this.currentUser.diamonds || 0) < cost) {
            alert(`You don't have enough diamonds! You need ${cost} to draw 10 times.`);
            return;
        }
        this.currentUser.diamonds -= cost;

        const results = [];
        let hasHighRarity = false;

        for (let i = 0; i < 9; i++) {
            const drawnItem = this._performSingleDraw(effectiveConfig);
            results.push(drawnItem);
            if (drawnItem.rarity === 'Epic' || drawnItem.rarity === 'Legendary') hasHighRarity = true;
        }

        if (hasHighRarity) {
            results.push(this._performSingleDraw(effectiveConfig));
        } else {
            const rng = Math.random() * 100;
            let guaranteedRarity = (rng < effectiveConfig.drawTenGuaranteeLegendaryChance) ? 'Legendary' : 'Epic';
            const possibleItems = this.gachaPool.filter(item => item.rarity === guaranteedRarity);
            const guaranteedItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
            results.push(guaranteedItem);
        }

        results.forEach(item => {
            this.currentUser.collection[item.id] = (this.currentUser.collection[item.id] || 0) + 1;
        });

        // --- Bonus Roll Logic ---
        let bonusReward = null;
        const bonusTable = effectiveConfig.drawTenBonusTable;
        const bonusRng = Math.random() * 100;
        let bonusCumulativeProb = 0;

        if (bonusRng < (bonusCumulativeProb += bonusTable.diamonds)) {
            const amount = effectiveConfig.drawTenDiamondRewardAmount;
            this.currentUser.diamonds += amount;
            bonusReward = { type: 'Diamonds', amount: amount };
        } else if (bonusRng < (bonusCumulativeProb += bonusTable.ticket)) {
            this.currentUser.exchangeTickets = (this.currentUser.exchangeTickets || 0) + 1;
            bonusReward = { type: 'Exchange Ticket', amount: 1 };
        }
        // If it falls into "nothing", bonusReward remains null.

        // REMOVE LATER - birthday item
        const freebieDeadline = new Date('2025-11-18T00:00:00');
        if (new Date() < freebieDeadline && !this.currentUser.collection['birthday']) {
            this.currentUser.collection['birthday'] = 1;
            const birthdayItem = this.gachaPool.find(item => item.id === 'birthday');
            if (birthdayItem) { // Safety check
                results.push(birthdayItem); // Add to the results to be shown in the modal
            }
        }

        this.saveUserData();
        this.showMultiGachaResult(results, bonusReward);
        this.renderCollectionGrid();
    }

    showMultiGachaResult(items, bonusReward = null) {
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
            }, index * 800 + 350); // Slower reveal: 350ms delay between each item
        });

        // --- Add Bonus Reward Display ---
        const bonusDisplay = document.getElementById('multi-result-bonus');
        if (bonusReward) {
            bonusDisplay.innerHTML = `
                <div class="bonus-reward-notification">
                    ✨ Bonus! You received ${bonusReward.amount} ${bonusReward.type}! ✨
                </div>
            `;
            bonusDisplay.classList.remove('hidden');
        } else {
            bonusDisplay.innerHTML = '';
            bonusDisplay.classList.add('hidden');
        }
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

    setupDynamicContent() {
        // Set the gacha tooltip text dynamically
        const tooltipTextEl = document.getElementById('gacha-tooltip-text');
        if (tooltipTextEl) {
            // Get base and effective probabilities
            const baseProbs = this.GACHA_PROBABILITIES;
            const effectiveProbs = this.getEffectiveConfig().gachaProbabilities;

            let legendaryProbText = `${baseProbs.Legendary}%`;
            // If the probability has been upgraded, format the text to show the change
            if (effectiveProbs.Legendary > baseProbs.Legendary) {
                legendaryProbText = `<span class="original-price">${baseProbs.Legendary}%</span>${effectiveProbs.Legendary}%`;
            }

            tooltipTextEl.innerHTML = `Epic probability is ${baseProbs.Epic}% and Legendary is ${legendaryProbText}
Draw 10 guarantees one Epic or Legendary!`;
        }
    }

    migrateCollectionData() {
        // This is the one-time migration for users who have a 'collection' object
        // but have not yet been migrated to the 'collectionsByPool' structure.
        if (!this.currentUser.collectionsByPool) {
            // 1. Create the new parent object.
            this.currentUser.collectionsByPool = {
                harrypotter: {},
                kpop: {},
                villains: {},
                greek: {}
            };
            // 2. Directly move the old collection object into the kpop pool.
            this.currentUser.collectionsByPool.kpop = this.currentUser.collection || {};
        }

        // --- Safety net for ensuring all modern pools exist for any returning user ---
        if (!this.currentUser.collectionsByPool.kpop) {
            this.currentUser.collectionsByPool.kpop = {};
        }
        if (!this.currentUser.collectionsByPool.harrypotter) {
            this.currentUser.collectionsByPool.harrypotter = {};
        }
        if (!this.currentUser.collectionsByPool.villains) { // Added for completeness
            this.currentUser.collectionsByPool.villains = {};
        }
        if (!this.currentUser.collectionsByPool.greek) { // Added for completeness
            this.currentUser.collectionsByPool.greek = {};
        }

        // ALWAYS point the active collection to the current pool defined in the constructor
        this.currentUser.collection = this.currentUser.collectionsByPool[this.currentGachaPool];
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
            this.logActivity('Entered Exchange Mode', `${this.currentUser.exchangeTickets} tickets left`);
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
        const effectiveConfig = this.getEffectiveConfig();
        const baseRates = this.GACHA_EXCHANGE_RATES_SPECIFIED;
        const effectiveRates = effectiveConfig.gachaExchangeRatesSpecified;

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
            .filter(item => item.rarity !== 'Free')
            .sort((a, b) => baseRates[b.rarity] - baseRates[a.rarity] || a.name.localeCompare(b.name))
            .forEach(item => {
                const baseCost = baseRates[item.rarity];
                const effectiveCost = effectiveRates[item.rarity];
                const option = document.createElement('option');
                option.value = item.id;
                option.dataset.cost = effectiveCost;

                let costText = `(${effectiveCost} pts)`;
                if (baseCost > effectiveCost) {
                    costText = `(${baseCost} -> ${effectiveCost} pts)`;
                }
                // Use textContent instead of innerHTML for options
                option.textContent = `${item.name} ${costText}`;
                select.appendChild(option);
            });

        // --- Diamond exchange ---
        const diamondOption1 = document.createElement('option');
        diamondOption1.value = 'diamond_1';
        diamondOption1.dataset.cost = effectiveRates.diamond_1;
        diamondOption1.textContent = `💎 1 Diamond (${effectiveRates.diamond_1} pts)`;
        diamondOption1.classList.add('diamond-exchange-option');
        select.appendChild(diamondOption1);

        const diamondOption10 = document.createElement('option');
        diamondOption10.value = 'diamond_10';
        const baseCost10 = baseRates.diamond_10;
        const effectiveCost10 = effectiveRates.diamond_10;
        diamondOption10.dataset.cost = effectiveCost10;
        let costText10 = `(${effectiveCost10} pts)`;
        if (baseCost10 > effectiveCost10) {
            costText10 = `(${baseCost10} -> ${effectiveCost10} pts)`;
        }
        diamondOption10.textContent = `💎💎 10 Diamonds ${costText10}`;
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
                totalPoints += count * this.GACHA_EXCHANGE_RATES_SELL[itemInfo.rarity];
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
        const effectiveConfig = this.getEffectiveConfig();
        const effectiveRates = effectiveConfig.gachaExchangeRatesSpecified;

        const select = document.getElementById('specific-item-select');
        const itemIdToBuy = select.value;
        const currentPoints = this.calculateExchangePoints();

        let cost, itemName, performAddition, showResult;

        // Step 1: Define the properties of the item being purchased
        if (itemIdToBuy === 'diamond_1' || itemIdToBuy === 'diamond_10') {
            const isTenDiamonds = itemIdToBuy === 'diamond_10';
            const diamondsToAdd = isTenDiamonds ? 10 : 1;
            // --- CHANGE: Use the effective rate instead of the base rate ---
            cost = effectiveRates[itemIdToBuy];
            itemName = `${diamondsToAdd} diamond(s)`;

            performAddition = () => { this.currentUser.diamonds += diamondsToAdd; };
            showResult = () => {
                alert(`✅ Success! You exchanged your items for ${diamondsToAdd} diamond(s)!`);
                this.renderCollectionGrid();
                this.updateExchangeButtonStates();
            };
        } else {
            const itemInfo = this.gachaPool.find(p => p.id === itemIdToBuy);
            if (!itemInfo) return; // Exit if item not found in pool

            // --- CHANGE: Use the effective rate instead of the base rate ---
            cost = effectiveRates[itemInfo.rarity];
            itemName = `a specific item: [${itemInfo.name}]`;

            performAddition = () => { this.currentUser.collection[itemInfo.id] = (this.currentUser.collection[itemInfo.id] || 0) + 1; };
            showResult = () => { this._showItemRevealAnimation(itemInfo); };
        }

        // Step 2: Validate the transaction
        if (currentPoints < cost) {
            alert(`You need ${cost} points to buy ${itemName}, but you only have ${currentPoints}.`);
            return;
        }

        // Step 3: Confirm the exchange, especially if points will be wasted
        const tradedItemsSummary = Object.keys(this.exchangeSelection).map(id => {
            const item = this.gachaPool.find(p => p.id === id);
            return `${this.exchangeSelection[id]}x ${item.name}`;
        }).join(', ');

        if (currentPoints > cost) {
            const confirmMessage = `This will trade [${tradedItemsSummary}] for ${itemName}. Any leftover points will be lost. Continue?`;
            if (!confirm(confirmMessage)) {
                return;
            }
        }

        // Step 4: Execute the transaction (this code is now shared)
        // Deduct traded items
        for (const itemId in this.exchangeSelection) {
            this.currentUser.collection[itemId] -= this.exchangeSelection[itemId];
            if (this.currentUser.collection[itemId] <= 0) {
                delete this.currentUser.collection[itemId];
            }
        }

        // Add the new item or diamonds
        performAddition();

        // Reset exchange state and save
        this.exchangeSelection = {};
        this.saveUserData();

        // Step 5: Show the result to the user
        showResult();
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
            this.currentGroupingGame = null;
            this.currentSentenceGame = null;
            this.currentSentenceCompletionGame = null;

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
        const miniGameData = this.currentUser.miniGameDataForLevel;
        const games = miniGameData.games || [];
        const progress = miniGameData.progress || {};

        grid.innerHTML = '';
        games.forEach((game, index) => {
            const gameDiv = document.createElement('div');
            const isCompleted = progress[index] || false;

            gameDiv.className = `mini-game-card ${isCompleted ? 'completed' : ''}`;

             // --- Theme support ---
            const imageName = this.getMiniGameImage(game.type);
            const themePrefix = this.currentUser.activeTheme === 'default' ? '' : `${this.currentUser.activeTheme}/`;
            const bgImage = `minigame/${themePrefix}${imageName}`;

            // Check if themed image exists, fallback to default if not
            const img = new Image();
            img.src = bgImage;
            img.onload = () => { gameDiv.style.backgroundImage = `url('${bgImage}')`; };
            img.onerror = () => { gameDiv.style.backgroundImage = `url('minigame/${imageName}')`; };

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

                // Calculate total blanks needed
                const minBlanks = this.MINI_GAMES_SENTENCE_COMPLETION_MIN_WORDS;
                let selectedSentences = [];
                let totalBlanks = 0;

                // Keep adding sentences until we meet the minimum blank requirement
                while (totalBlanks < minBlanks && availableSentences.length > 0) {
                    // Find a sentence that hasn't been used
                    const availableForSelection = availableSentences.filter(s =>
                        !selectedSentences.some(selected => selected.sentence === s.sentence)
                    );

                    if (availableForSelection.length === 0) break;

                    const selectedSentence = availableForSelection[Math.floor(Math.random() * availableForSelection.length)];
                    selectedSentences.push(selectedSentence);
                    totalBlanks += selectedSentence.blanks.length;

                    // Mark this sentence as used for future games
                    usedSentences.push(selectedSentence.sentence);
                }

                if (selectedSentences.length > 0 && totalBlanks >= minBlanks) {
                    gameData = { sentences: selectedSentences };
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

        return games;
    }

     getAvailableGroupThemesForLevel(level) {
        const allThemes = new Set();
        const startLevel = Math.max(1, level - this.MINI_GAMES_LEVEL_RANGE);
        for (let i = startLevel; i <= level; i++) {
            const levelContent = this.getMiniGameContentForLevel(i);
            if (levelContent && levelContent.groups) {
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

    saveMiniGameProgress(level, gameIndex, progressData) {
        const miniGameData = this.currentUser.miniGameDataForLevel;

        // Check if we are saving to the correct and active level's data
        if (miniGameData && miniGameData.level === level) {
            miniGameData.saves[gameIndex] = progressData;
            this.saveUserData();
        }
    }

    manageMiniGameDataLifecycle() {
        // --- START: One-Time Cleanup of Old Data Structures ---
        // This block will run on every load and safely delete the old properties if they exist.
        if (this.currentUser.generatedMiniGames) {
            delete this.currentUser.generatedMiniGames;
            console.log("Cleanup: Removed old 'generatedMiniGames' property.");
        }
        if (this.currentUser.miniGameProgress) {
            delete this.currentUser.miniGameProgress;
            console.log("Cleanup: Removed old 'miniGameProgress' property.");
        }
        if (this.currentUser.miniGameSaves) {
            delete this.currentUser.miniGameSaves;
            console.log("Cleanup: Removed old 'miniGameSaves' property.");
        }
        // --- END: One-Time Cleanup ---

        const currentLevel = this.currentUser.level;
        const lastEnabledLevel = this.findLastEnabledMiniGameLevel(currentLevel);

        // This is the level for which games should be active.
        // If no past level is enabled, it's null (no games available yet).
        const activeGameLevel = lastEnabledLevel !== null ? lastEnabledLevel : null;

        // If the stored data is not for the current active game level, reset it.
        if (!this.currentUser.miniGameDataForLevel || this.currentUser.miniGameDataForLevel.level !== activeGameLevel) {
            console.log(`New active mini-game level: ${activeGameLevel}. Resetting mini-game data.`);
            this.currentUser.miniGameDataForLevel = {
                level: activeGameLevel,
                games: activeGameLevel !== null ? this.generateLevelGames(activeGameLevel) : [],
                progress: {}, // Tracks full game completions { gameIndex: true }
                saves: {}     // Tracks in-game progress { gameIndex: { ... } }
            };
        }
        this.saveUserData();
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
            const selectedPairs = this.selectRandomPairs(allPairsForTheme, this.MINI_GAMES_PAIRING_MAX_PAIRS);

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
                total: selectedPairs.length,
                isChecking: false // lock flag
            };
        }

        // Reset game state for fresh start/reset (but keep same pairs and layout)
        this.currentPairingGame.selectedWords = [];
        this.currentPairingGame.foundPairs = [];
        this.currentPairingGame.score = 0;
        this.currentPairingGame.isChecking = false;

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

    getAvailablePairThemesForLevel(level) {
        const allThemes = new Set();
        const startLevel = Math.max(1, level - this.MINI_GAMES_LEVEL_RANGE);
        for (let i = startLevel; i <= level; i++) {
            const levelContent = this.getMiniGameContentForLevel(i);
            if (levelContent && levelContent.pairs) {
                Object.keys(levelContent.pairs).forEach(theme => allThemes.add(theme));
            }
        }
        return Array.from(allThemes);
    }

    getAllPairsForTheme(theme, maxLevel) {
        const allPairs = [];
        const startLevel = Math.max(1, maxLevel - this.MINI_GAMES_LEVEL_RANGE);

        // Collect all pairs from level 1 up to maxLevel for the specified theme
        for (let i = startLevel; i <= maxLevel; i++) {
            const levelContent = this.getMiniGameContentForLevel(i);
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
                // If we are already checking a pair, ignore new clicks
                if (this.currentPairingGame.isChecking) {
                    return;
                }

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
                    this.currentPairingGame.isChecking = true; // Engage the lock
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
                setTimeout(() => this.completeCurrentMiniGame(), 500);
            }

            this.currentPairingGame.isChecking = false; // Release the lock
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
                this.currentPairingGame.isChecking = false; // Release the lock
            }, 500);
        }

        // Clear selection
        this.currentPairingGame.selectedWords = [];
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
        const startLevel = Math.max(1, maxLevel - this.MINI_GAMES_LEVEL_RANGE);

        for (let level = startLevel; level <= maxLevel; level++) {
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
            this.completeCurrentMiniGame();
        } else {
            alert("Not quite! Check the highlighted words and make sure all words are sorted.");
        }
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
        // Use the pre-selected sentences from gameData
        const gameData = game.gameData ? game.gameData.sentences : null;

        if (!gameData || gameData.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem;">No sentences available for this game.</p>';
            this.showGameControls(false, false);
            return;
        }

        // Initialize or update current sentence completion game state
        const savedProgress = this.currentUser.miniGameDataForLevel.saves?.[game.id];

        if (!this.currentSentenceCompletionGame || this.currentSentenceCompletionGame.gameId !== game.id) {
            this.currentSentenceCompletionGame = {
                gameId: game.id,
                level: game.level,
                sentences: gameData,
                currentSentenceIndex: 0,
                // Load saved progress if it exists, otherwise create a new array
                completedSentences: savedProgress ? savedProgress.completedSentences : new Array(gameData.length).fill(false)
            };
        }

        this.renderCurrentSentenceCompletion(container);
    }

    renderCurrentSentenceCompletion(container) {
        const gameData = this.currentSentenceCompletionGame;
        const currentSentence = gameData.sentences[gameData.currentSentenceIndex];
        const isCompleted = gameData.completedSentences[gameData.currentSentenceIndex];

        // Shuffle options for current sentence
        const shuffledOptions = [...currentSentence.options].sort(() => 0.5 - Math.random());

        container.innerHTML = `
            <div class="sentence-completion-layout">
                <div class="sentence-navigation">
                    <button id="prev-sentence-completion-btn" class="nav-btn" ${gameData.currentSentenceIndex === 0 ? 'disabled' : ''}>← Previous</button>
                    <span class="sentence-counter">
                        Sentence ${gameData.currentSentenceIndex + 1}/${gameData.sentences.length}
                        ${isCompleted ? '<span class="completion-check">✓</span>' : ''}
                    </span>
                    <button id="next-sentence-completion-btn" class="nav-btn" ${gameData.currentSentenceIndex === gameData.sentences.length - 1 ? 'disabled' : ''}>Next →</button>
                </div>

                <div class="grouping-zones-container">
                    <h4>Complete the Sentence</h4>
                    <div class="sentence-display">
                        <h3>${this.createSentenceWithDropZones(currentSentence.sentence)}</h3>
                    </div>
                </div>

                <div class="word-bank-container">
                    <h4>Word Choices</h4>
                    <div id="sentence-word-bank" class="word-bank">
                        ${shuffledOptions.map(word => `<span class="draggable" data-word="${word}">${word}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        this.setupSentenceCompletionEventListeners();
        this.setupDragAndDrop();
    }

    setupSentenceCompletionEventListeners() {
        const prevBtn = document.getElementById('prev-sentence-completion-btn');
        const nextBtn = document.getElementById('next-sentence-completion-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateSentenceCompletion(-1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateSentenceCompletion(1));
        }
    }

    navigateSentenceCompletion(direction) {
        const gameData = this.currentSentenceCompletionGame;
        const newIndex = gameData.currentSentenceIndex + direction;

        if (newIndex >= 0 && newIndex < gameData.sentences.length) {
            gameData.currentSentenceIndex = newIndex;
            this.renderCurrentSentenceCompletion(document.getElementById('game-content'));
        }
    }

    getAllSentenceCompletionData(maxLevel) {
        const allSentences = [];
        const startLevel = Math.max(1, maxLevel - this.MINI_GAMES_LEVEL_RANGE);
        for (let level = startLevel; level <= maxLevel; level++) {
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
        const gameData = this.currentSentenceCompletionGame;
        const currentSentence = gameData.sentences[gameData.currentSentenceIndex];
        const dropZones = document.querySelectorAll('.drop-zone');
        const correctAnswers = currentSentence.blanks;
        let allCorrect = true;

        // Clear previous highlights
        dropZones.forEach(zone => {
            zone.classList.remove('wrong', 'correct');
        });

        // Check if current sentence has all blanks filled (not the entire word bank)
        let currentSentenceBlanksFilled = true;
        dropZones.forEach(zone => {
            if (!zone.textContent || zone.textContent.trim() === '') {
                currentSentenceBlanksFilled = false;
            }
        });

        if (!currentSentenceBlanksFilled) {
            alert("Please fill in all the blanks for this sentence before checking.");
            return;
        }

        if (dropZones.length !== correctAnswers.length) {
            alert("Please fill in all the blanks before checking.");
            return;
        }

        dropZones.forEach((zone, index) => {
            const userWord = zone.textContent.trim();
            if (userWord === correctAnswers[index]) {
                zone.classList.add('correct');
            } else {
                zone.classList.add('wrong');
                allCorrect = false;
            }
        });

        if (allCorrect) {
            gameData.completedSentences[gameData.currentSentenceIndex] = true;

            this.saveMiniGameProgress(this.currentGame.level, this.currentGame.gameIndex, {
                completedSentences: gameData.completedSentences
            });

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
            alert("Not quite right. The red blanks are incorrect.");
        }
    }

    // --- Matching aame ---
    getAvailableMatchThemesForLevel(level) {
        const allThemes = new Set();
        const startLevel = Math.max(1, level - this.MINI_GAMES_LEVEL_RANGE);
        for (let i = startLevel; i <= level; i++) {
            const levelContent = this.getMiniGameContentForLevel(i);
            if (levelContent && levelContent.matches) {
                Object.keys(levelContent.matches).forEach(theme => allThemes.add(theme));
            }
        }
        return Array.from(allThemes);
    }

    getAllMatchesForTheme(theme, maxLevel) {
        const allMatches = [];
        const startLevel = Math.max(1, maxLevel - this.MINI_GAMES_LEVEL_RANGE);
        for (let level = startLevel; level <= maxLevel; level++) {
            const levelContent = this.getMiniGameContentForLevel(level);

            if (levelContent && levelContent.matches && levelContent.matches[theme]) {
                allMatches.push(...levelContent.matches[theme]);
            }
        }

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
            const maxWords = Math.min(allMatches.length, this.MINI_GAMES_MATCHING_MAX_PAIRS);
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
        const startLevel = Math.max(1, maxLevel - this.MINI_GAMES_LEVEL_RANGE);
        for (let level = startLevel; level <= maxLevel; level++) {
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
        const savedProgress = this.currentUser.miniGameDataForLevel.saves?.[game.id];

        if (!this.currentFormingSentencesGame || this.currentFormingSentencesGame.gameId !== game.id) {
            this.currentFormingSentencesGame = {
                gameId: game.id,
                level: game.level,
                sentences: game.gameData.formingSentences,
                currentSentenceIndex: 0,
                // Load saved progress if it exists, otherwise create a new array
                completedSentences: savedProgress ? savedProgress.completedSentences : new Array(game.gameData.formingSentences.length).fill(false)
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

            this.saveMiniGameProgress(this.currentGame.level, this.currentGame.gameIndex, {
                completedSentences: gameData.completedSentences
            });

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
        const miniGameData = this.currentUser.miniGameDataForLevel;
        const gameIndex = this.currentGame.gameIndex;

        // Mark the game as complete in the new 'progress' object
        miniGameData.progress[gameIndex] = true;

        const completedGames = Object.keys(miniGameData.progress).length;
        let message = "Game completed successfully!";

        if (completedGames === (miniGameData.games?.length || this.MINI_GAMES_PER_LEVEL)) {
            this.currentUser.exchangeTickets = (this.currentUser.exchangeTickets || 0) + 1;
            this.logActivity('Mini-Games Cleared', `Level ${this.currentUser.miniGameDataForLevel.level}`);
            message += `\n\nYou've completed all games at this level!\nYou earned 1 Exchange Ticket 🎟️!`;
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
            if (this.currentPairingGame && this.currentPairingGame.foundPairs.length === this.currentPairingGame.total) {
                this.completeCurrentMiniGame();
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
        const dropZones = document.querySelectorAll('.drop-zone, .group-drop-zone, .sentence-drop-zone, .word-bank');

        // Setup draggable items
        draggables.forEach(item => {
            item.draggable = true;

            // Drag start
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.word);
                e.dataTransfer.setData('text/element-id', item.id || '');
                item.classList.add('is-dragging');
                this.currentDragItem = item;
                console.log('Drag started:', item.dataset.word);
            });

            // Drag end
            item.addEventListener('dragend', (e) => {
                item.classList.remove('is-dragging');
                this.currentDragItem = null;
                dropZones.forEach(zone => {
                    zone.classList.remove('drag-over', 'drop-target');
                });
            });

            // Touch fallback for mobile
            this.addTouchSupport(item);
        });

        // Setup drop zones
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                // Only add visual effects if it's NOT a word bank
                if (!zone.classList.contains('word-bank')) {
                    zone.classList.add('drag-over');
                }
            });

            zone.addEventListener('dragenter', (e) => {
                e.preventDefault();
                // Only add visual effects if it's NOT a word bank
                if (!zone.classList.contains('word-bank')) {
                    zone.classList.add('drop-target');
                }
            });

            zone.addEventListener('dragleave', (e) => {
                zone.classList.remove('drag-over', 'drop-target');
            });

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
        const styles = window.getComputedStyle(item);

        clone.id = 'touch-drag-clone';
        clone.style.position = 'fixed';
        clone.style.zIndex = '9999';
        clone.style.pointerEvents = 'none';
        clone.style.transform = 'scale(1.1)';
        clone.style.opacity = '0.9';
        clone.style.transition = 'none'; // Remove any transitions that might interfere
        clone.style.left = (touch.clientX - 30) + 'px';
        clone.style.top = (touch.clientY - 20) + 'px';

        // Apply styles from the original item instead of hardcoding them
        clone.style.background = styles.backgroundColor;
        clone.style.color = styles.color;
        clone.style.border = styles.border;
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
        document.querySelectorAll('.drop-zone, .group-drop-zone, .sentence-drop-zone, .word-bank').forEach(zone => {
            zone.classList.remove('drop-target');
        });

        // Temporarily hide the clone to get element below
        const clone = document.getElementById('touch-drag-clone');
        if (clone) {
            clone.style.display = 'none';
        }

        // Find element under touch point
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZone = elementBelow?.closest('.drop-zone, .group-drop-zone, .sentence-drop-zone, .word-bank');

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

        // Special handling for word bank drops
        if (dropzone.classList.contains('word-bank')) {
            // Reset the draggable item styling when returning to word bank
            draggable.style.display = '';
            draggable.style.height = '';
            draggable.style.lineHeight = '';
            draggable.style.verticalAlign = '';
            draggable.style.background = '';
            draggable.style.border = '';
            draggable.style.padding = '';
            draggable.style.margin = '';

            // Place item in word bank
            dropzone.appendChild(draggable);

            // Success feedback
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
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

        // Force inline styling for sentence games
        if (dropzone.classList.contains('drop-zone') || dropzone.classList.contains('sentence-drop-zone')) {
            draggable.style.display = 'inline';
            draggable.style.height = 'auto';
            draggable.style.lineHeight = '1';
            draggable.style.verticalAlign = 'middle';
        }

        // Success feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    isValidDrop(dropzone, draggable) {
        // Word banks are always valid drop targets
        if (dropzone.classList.contains('word-bank')) {
            return true;
        }

        // Original validation for other drop zones
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
            wordBank.appendChild(item);
        }
    }

    // --- Social Studies Screen ---
    showSocialStudies() {
        this.showScreen('social-studies-screen');
        this.currentSocialStudiesPage = 0; // Reset to first page
        this.socialStudiesReviewMode = false; // Always exit review mode when first showing screen

        // Update cultural points display
        document.getElementById('cultural-points-display').textContent = this.currentUser.culturalPoints || 0;

        // Set the initial active tab and its corresponding level selector
        const activeTab = document.querySelector('.social-studies-tab-button.active') || document.querySelector('.social-studies-tab-button');
        const activeTabName = activeTab.dataset.tab;

        document.querySelectorAll('.social-studies-tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === activeTabName);
        });
        document.querySelectorAll('.social-studies-tab-content').forEach(content => {
            content.classList.toggle('hidden', content.id !== `${activeTabName}-content`);
        });
        document.querySelectorAll('#ss-level-selectors-wrapper .tab-controls').forEach(control => {
            control.classList.toggle('hidden', control.id !== `${activeTabName}-controls`);
        });

        this.populateSocialStudiesLevels();
        this.renderSocialStudiesContent();
    }

    populateSocialStudiesLevels() {
        const dropdowns = document.querySelectorAll('.level-select-dropdown');
        const progress = this.currentUser.socialStudiesProgress;
        const content = this.socialStudiesContent;

        if (!content) return;

        dropdowns.forEach(select => {
            const category = select.id.split('-')[0];

            if (!progress[category]) {
                progress[category] = {};
            }

            // Get all level numbers defined for this category in social.json
            const definedLevels = content[category] ? Object.keys(content[category]).map(Number).sort((a, b) => a - b) : [];

            if (definedLevels.length === 0) {
                select.innerHTML = '<option value="1">Level 1</option>';
                select.disabled = true;
                return;
            }

            let highestUnlockedLevel = 1;

            // Loop through the defined levels to see how far the user has unlocked
            for (const levelNum of definedLevels) {
                if (levelNum === 1) continue; // Level 1 is always unlocked

                const prevLevelNum = levelNum - 1;
                const prevLevelProgress = progress[category]?.[prevLevelNum];

                // Check if the user has passed the *previous* level
                if (prevLevelProgress?.hasPassed) {
                    highestUnlockedLevel = Math.max(highestUnlockedLevel, levelNum);
                } else {
                    // If the previous level has never been passed, stop unlocking further levels.
                    break;
                }
            }

            // Clear existing options
            select.innerHTML = '';

            // Populate the dropdown only with the levels the user has access to
            for (let i = 1; i <= highestUnlockedLevel; i++) {
                // We only add an option if that level is actually defined in social.json
                if (definedLevels.includes(i)) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = `Level ${i}`;
                    select.appendChild(option);
                }
            }

            // Set the default selection to the highest available level
            select.value = highestUnlockedLevel;
            select.disabled = false;
        });
    }

    handleSocialStudiesTabSwitch(event) {
        const clickedTab = event.currentTarget;
        const targetTabName = clickedTab.dataset.tab;

        this.socialStudiesReviewMode = false; // Reset review mode on tab switch

        // Update tab buttons
        document.querySelectorAll('.social-studies-tab-button').forEach(button => {
            button.classList.remove('active');
        });
        clickedTab.classList.add('active');

        // Update content panes
        document.querySelectorAll('.social-studies-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${targetTabName}-content`).classList.remove('hidden');

        // Render content for the new tab
        this.currentSocialStudiesPage = 0; // Reset to first page on tab switch
        this.populateSocialStudiesLevels();
        this.renderSocialStudiesContent();
    }

    renderSocialStudiesContent() {
        if (!this.socialStudiesContent) {
            console.warn("Social Studies content not yet loaded.");
            return;
        }

        const activeTabButton = document.querySelector('.social-studies-tab-button.active');
        if (!activeTabButton) return;

        const category = activeTabButton.dataset.tab;
        const levelDropdown = document.getElementById(`${category}-level-select`);
        if (!levelDropdown) return;
        const level = levelDropdown.value;

        // --- Step 1: Ensure progress data structure exists ---
        if (!this.currentUser.socialStudiesProgress[category]) {
            this.currentUser.socialStudiesProgress[category] = {};
        }
        if (!this.currentUser.socialStudiesProgress[category][level]) {
            this.currentUser.socialStudiesProgress[category][level] = {
                pageData: [],
                finalScore: null,
                currentTotalScore: 0,
                currentTotalPossible: 0
            };
        }
        const levelProgress = this.currentUser.socialStudiesProgress[category][level];
        const levelData = this.socialStudiesContent[category]?.[level];
        const displayContainer = document.querySelector(`#${category}-content .tab-display-content`);

        // --- Step 2: Hide all navigation controls by default ---
        document.getElementById('prev-ss-page-btn').classList.add('hidden');
        document.getElementById('next-ss-page-btn').classList.add('hidden');
        document.getElementById('ss-submit-placeholder').innerHTML = '';
        document.getElementById('start-social-studies-btn').classList.add('hidden');
        document.getElementById('review-social-studies-btn').classList.add('hidden');
        document.getElementById('restart-social-studies-level-btn').classList.add('hidden');

        // --- Step 3: Handle empty or invalid level data ---
        if (!levelData || !levelData.pages || levelData.pages.length === 0) {
            this.renderEmptySocialStudiesPage(category);
            return;
        }

        const pageIndex = this.currentSocialStudiesPage;
        const pageData = levelData.pages[pageIndex];

        // --- Step 4: Main Rendering Logic ---
        const pageStatusEl = document.querySelector(`#${category}-content .quiz-page-status`);
        const titleEl = document.querySelector(`#${category}-content .quiz-title`);
        titleEl.textContent = levelData.title || category;

        if (pageIndex === 0) { // --- Cover Page Logic ---
            pageStatusEl.textContent = '';
            this.renderCoverPage(displayContainer, pageData, category, level, levelProgress);

            // Show either "Start" or "Review/Restart"
            if (levelProgress.finalScore) {
                document.getElementById('review-social-studies-btn').classList.remove('hidden');
                document.getElementById('restart-social-studies-level-btn').classList.remove('hidden');
            } else {
                document.getElementById('start-social-studies-btn').classList.remove('hidden');
            }

        } else { // --- Quiz Page Logic ---
            const hasCoverPage = levelData.pages[0]?.type === 'cover';
            const totalQuizzes = hasCoverPage ? levelData.pages.length - 1 : levelData.pages.length;
            const currentQuizNumber = hasCoverPage ? pageIndex : pageIndex + 1;
            const savedPageProgress = levelProgress.pageData[pageIndex] || null;
            const scoreText = savedPageProgress ? `(Score: ${savedPageProgress.score})` : '';
            pageStatusEl.textContent = `Quiz ${currentQuizNumber}/${totalQuizzes} ${scoreText}`;

            // Show and manage Next/Prev buttons
            const prevBtn = document.getElementById('prev-ss-page-btn');
            const nextBtn = document.getElementById('next-ss-page-btn');
            prevBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');

            const isLastPage = (pageIndex === levelData.pages.length - 1);
            prevBtn.disabled = (hasCoverPage && pageIndex === 1) || (!hasCoverPage && pageIndex === 0); // Disable prev on the first quiz page

            if (this.socialStudiesReviewMode && isLastPage) {
                nextBtn.textContent = 'Exit Review';
                nextBtn.disabled = false;
            } else {
                nextBtn.textContent = 'Next Page';
                nextBtn.disabled = isLastPage;
            }

            // Render the specific quiz type
            switch (pageData.type) {
                case 'pic_match': this.renderPicMatchQuiz(displayContainer, pageData, savedPageProgress); break;
                case 'match': this.renderMatchQuiz(displayContainer, pageData, savedPageProgress); break;
                case 'mchoice': this.renderMChoiceQuiz(displayContainer, pageData, savedPageProgress); break;
                case 'pic_label': this.renderPicLabelQuiz(displayContainer, pageData, savedPageProgress); break;
                default: displayContainer.innerHTML = `<p>Quiz type "${pageData.type}" not found.</p>`;
            }

            // Render submit button if quiz is active
            if ((pageData.type === 'pic_match' || pageData.type === 'match' || pageData.type === 'mchoice' || pageData.type === 'pic_label') && !savedPageProgress) {
                const submitPlaceholder = document.getElementById('ss-submit-placeholder');
                const submitBtn = document.createElement('button');
                submitBtn.id = 'submit-social-studies-btn';
                submitBtn.className = 'game-action-btn';
                submitBtn.textContent = 'Submit';
                // Attach correct submit handler
                if (pageData.type === 'pic_match') submitBtn.addEventListener('click', () => this.submitPicMatch());
                else if (pageData.type === 'pic_label') submitBtn.addEventListener('click', () => this.submitPicLabelQuiz());
                else if (pageData.type === 'match') submitBtn.addEventListener('click', () => this.submitMatchQuiz());
                else if (pageData.type === 'mchoice') submitBtn.addEventListener('click', () => this.submitMChoiceQuiz());
                submitPlaceholder.appendChild(submitBtn);
            }
        }
    }

    renderEmptySocialStudiesPage(category) {
        const displayContainer = document.querySelector(`#${category}-content .tab-display-content`);
        displayContainer.innerHTML = '<p>No activities available for this level yet.</p>';
        // Clear title and status
        document.querySelector(`#${category}-content .quiz-title`).textContent = '';
        document.querySelector(`#${category}-content .quiz-page-status`).textContent = '';
        // Disable nav buttons
        document.getElementById('prev-ss-page-btn').disabled = true;
        document.getElementById('next-ss-page-btn').disabled = true;
    }

    navigateSocialStudiesPage(direction) {
        const activeTabButton = document.querySelector('.social-studies-tab-button.active');
        const category = activeTabButton.dataset.tab;
        const level = document.getElementById(`${category}-level-select`).value;
        const totalPages = this.socialStudiesContent[category]?.[level]?.pages.length || 0;

        // Special logic for the "Exit Review" button
        const isLastPage = this.currentSocialStudiesPage === totalPages - 1;
        if (direction === 1 && this.socialStudiesReviewMode && isLastPage) {
            this.socialStudiesReviewMode = false; // Turn off review mode
            this.currentSocialStudiesPage = 0;
            this.renderSocialStudiesContent();    // Re-render to show the summary screen
            return; // Stop here
        }

        const newPage = this.currentSocialStudiesPage + direction;

        if (newPage >= 0 && newPage < totalPages) {
            this.currentSocialStudiesPage = newPage;
            this.renderSocialStudiesContent();
        }
    }

    restartSocialStudiesLevel() {
        const activeTabButton = document.querySelector('.social-studies-tab-button.active');
        const category = activeTabButton.dataset.tab;
        const level = document.getElementById(`${category}-level-select`).value;

        // Get the specific progress object for the level
        const levelProgress = this.currentUser.socialStudiesProgress[category][level];

        // Ensure the object is in a valid state before resetting
        if (levelProgress) {
            levelProgress.pageData = [];
            levelProgress.finalScore = null;
            levelProgress.currentTotalScore = 0;
            levelProgress.currentTotalPossible = 0;
        }

        this.saveUserData();

        // Rerender the content, which will now show the quiz instead of the summary
        const levelData = this.socialStudiesContent[category]?.[level];
        const hasCoverPage = levelData?.pages?.[0]?.type === 'cover';
        this.currentSocialStudiesPage = hasCoverPage ? 1 : 0;
        this.renderSocialStudiesContent();
    }

    reviewSocialStudiesLevel() {
        // Set a flag to enter review mode and jump to the first quiz page
        this.socialStudiesReviewMode = true;
        this.currentSocialStudiesPage = 1; // Go to the first quiz page
        this.renderSocialStudiesContent();
    }

    startSocialStudiesQuiz() {
        this.currentSocialStudiesPage = 1; // Go to the first quiz page
        this.renderSocialStudiesContent();
    }

    checkSocialStudiesLevelCompletion(category, level) {
        console.log(`Entered`);
        const levelData = this.socialStudiesContent[category]?.[level];
        if (!levelData) return;

        const levelProgress = this.currentUser.socialStudiesProgress[category][level];
        const allPages = levelData.pages;
        const savedPages = levelProgress.pageData;

        // Count only actual quiz pages, excluding the cover page
        const totalQuizzes = allPages.filter(page => page.type !== 'cover').length;
        const completedQuizzes = savedPages.filter(p => p !== null && p !== undefined).length;

        // Check if all pages for this level are completed
        if (totalQuizzes > 0 && totalQuizzes === completedQuizzes) {
            const totalScore = levelProgress.currentTotalScore;
            const totalPossible = levelProgress.currentTotalPossible;

            levelProgress.finalScore = `${totalScore}/${totalPossible}`;
            const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

            // Create the log entry
            const logName = `Social Studies`;
            const logScore = `${category.charAt(0).toUpperCase() + category.slice(1)} Level ${level} ${totalScore}/${totalPossible}`;
            this.logActivity(logName, logScore);

            // Did the user pass the level?
            if (percentage >= this.SOCIAL_STUDIES_PASSING_SCORE) {
                levelProgress.hasPassed = true; // permanent flag
                let alertMessage = `Congratulations! You passed Level ${level}!`;

                // If this is the first time passing, award points.
                if (!levelProgress.hasPassed) {
                    const pointsEarned = this.SOCIAL_STUDIES_BASE_CULTURAL_POINTS_EARNED + (parseInt(level) - 1) * this.SOCIAL_STUDIES_CULTURAL_POINTS_INCREMENT;
                    this.currentUser.culturalPoints = (this.currentUser.culturalPoints || 0) + pointsEarned;

                    // Add to the alert message
                    alertMessage += `\n\nYou earned ${pointsEarned} cultural points 🎵 and unlocked the next level`;
                    document.getElementById('cultural-points-display').textContent = this.currentUser.culturalPoints;
                }

                alert(alertMessage);

                // This runs for any pass, ensuring the next level is always available.
                this.populateSocialStudiesLevels();
            }

            this.saveUserData();
            this.currentSocialStudiesPage = 0;
        }
    }

    // Cover Page
    renderCoverPage(container, pageData, category, level, levelProgress) {
        const levelData = this.socialStudiesContent[category]?.[level];
        if (!levelData || !pageData.data) {
            container.innerHTML = "<p>Cover page information is missing.</p>";
            return;
        }

        // Calculate the points for this level
        const pointsEarned = this.SOCIAL_STUDIES_BASE_CULTURAL_POINTS_EARNED + (parseInt(level) - 1) * this.SOCIAL_STUDIES_CULTURAL_POINTS_INCREMENT;
        const minScore = this.SOCIAL_STUDIES_PASSING_SCORE;

        let pointsMessageHTML = '';
        let scoreHTML = '';

        if (levelProgress?.hasPassed) {
            // If the level has been passed, always show the score and a success message.
            scoreHTML = `<div class="level-complete-summary"><h3>Score: ${levelProgress.finalScore}</h3></div>`;
            pointsMessageHTML = `
                <div class="theme-tip awarded">
                    <p>✅ You've passed this level already and earned ${pointsEarned} Cultural Points</p>
                </div>
            `;
        } else {
            // If the level has never been passed.
            if (levelProgress?.finalScore) {
                // It has a score, but it's a failing one.
                scoreHTML = `<div class="level-complete-summary"><h3>Last Score: ${levelProgress.finalScore}</h3></div>`;
                pointsMessageHTML = `
                    <div class="theme-tip warning">
                        <p>💡 You did not pass this level. Try again to earn ${pointsEarned} points!</p>
                    </div>
                `;
            } else {
                // No score exists yet, this is a fresh attempt.
                pointsMessageHTML = `
                    <div class="theme-tip">
                        <p>💡 Passing this level with a score >= ${minScore}% will earn you: ${pointsEarned} Cultural Points 🎵</p>
                    </div>
                `;
            }
        }

        container.innerHTML = `
            <div class="ss-cover-page">
                <p class="cover-description">${pageData.data.description || ''}</p>
                ${pageData.data.cover_image ? `<img src="${pageData.data.cover_image}" alt="${levelData.title} cover" class="cover-image">` : ''}
                ${scoreHTML}
                ${pointsMessageHTML}
            </div>
        `;
    }

    // --- Pic Match Quiz Implementation ---
    renderPicMatchQuiz(container, pageData, savedProgress) {
        // Shuffle items only if it's an active quiz, not a graded summary
        const itemsToRender = savedProgress ? pageData.data.items : [...pageData.data.items].sort(() => 0.5 - Math.random());
        const uniqueAnswers = [...new Set(pageData.data.items.map(item => item.text))];

        let gridHTML = '<div class="pic-match-grid">';
        itemsToRender.forEach(item => {
            const userChoice = savedProgress?.answers?.[item.image] || '?';
            const isGraded = !!savedProgress;
            let correctnessClass = '';
            if (isGraded) {
                correctnessClass = userChoice === item.text ? 'correct' : 'wrong';
            }
            gridHTML += `
                <div class="pic-match-item ${correctnessClass}" data-image-path="${item.image}" data-correct-answer="${item.text}">
                    <img src="${item.image}" alt="Match item">
                    <div class="pic-match-answer-box">${userChoice}</div>
                </div>
            `;
        });
        gridHTML += '</div>';

        let answerBankHTML = '<div class="pic-match-answer-bank">';
        uniqueAnswers.forEach(answer => {
            answerBankHTML += `<button class="answer-bank-btn" data-answer-text="${answer}">${answer}</button>`;
        });
        answerBankHTML += '</div>';

        // The submit button is now created in renderSocialStudiesContent
        container.innerHTML = gridHTML + (savedProgress ? '' : answerBankHTML);

        // Add event listeners only if the quiz is active
        if (!savedProgress) {
            this.setupPicMatchEvents();
        }
    }

    setupPicMatchEvents() {
        document.querySelectorAll('.answer-bank-btn').forEach(btn => {
            btn.addEventListener('click', e => this.handlePicMatchAnswerSelect(e));
        });
        document.querySelectorAll('.pic-match-item').forEach(item => {
            item.addEventListener('click', e => this.handlePicMatchImageClick(e));
        });
        // Run once on setup to handle any pre-filled answers correctly
        this.updateAnswerBankVisuals();
    }

    handlePicMatchAnswerSelect(event) {
        const selectedBtn = event.currentTarget;
        this.currentSelectedAnswer = selectedBtn.dataset.answerText;

        document.querySelectorAll('.answer-bank-btn').forEach(btn => btn.classList.remove('selected'));
        selectedBtn.classList.add('selected');
    }

    handlePicMatchImageClick(event) {
        if (!this.currentSelectedAnswer) return; // Do nothing if no answer is selected

        const clickedItem = event.currentTarget;
        const answerBox = clickedItem.querySelector('.pic-match-answer-box');

        answerBox.textContent = this.currentSelectedAnswer;
        answerBox.style.color = '#333'; // Make text visible

        // Deselect the answer from the bank
        document.querySelectorAll('.answer-bank-btn').forEach(btn => btn.classList.remove('selected'));
        this.currentSelectedAnswer = null;

         // Update visuals after placing an answer
        this.updateAnswerBankVisuals();
    }

    submitPicMatch() {
        const activeTabButton = document.querySelector('.social-studies-tab-button.active');
        const category = activeTabButton.dataset.tab;
        const level = document.getElementById(`${category}-level-select`).value;
        const pageIndex = this.currentSocialStudiesPage;

        const quizItems = document.querySelectorAll('.pic-match-item');
        let score = 0;
        let total = quizItems.length;
        const userAnswers = {};

        quizItems.forEach(item => {
            const imagePath = item.dataset.imagePath;
            const correctAnswer = item.dataset.correctAnswer;
            const userAnswer = item.querySelector('.pic-match-answer-box').textContent;
            userAnswers[imagePath] = userAnswer;
            if (userAnswer === correctAnswer) {
                score++;
            }
        });

        // Save progress for the page
        const progressToSave = {
            score: `${score}/${total}`,
            answers: userAnswers
        };

        const levelProgress = this.currentUser.socialStudiesProgress[category][level];
        levelProgress.pageData[pageIndex] = progressToSave;

        // Add to the running total for the level
        levelProgress.currentTotalScore = (levelProgress.currentTotalScore || 0) + score;
        levelProgress.currentTotalPossible = (levelProgress.currentTotalPossible || 0) + total;

        this.saveUserData();
        alert(`Page submitted! Your score: ${score}/${total}`);

        // Check for level completion
        this.checkSocialStudiesLevelCompletion(category, level);

        // Re-render the content to show the graded view
        this.renderSocialStudiesContent();
    }

    // --- Pic Label Quiz (Image Labeling) Implementation ---
    renderPicLabelQuiz(container, pageData, savedProgress) {
        let html = `
            <div class="match-quiz-description">${pageData.data.description || ''}</div>
            <div class="pic-label-container">
                <img src="${pageData.data.image}" alt="Labeling quiz background">`;

        pageData.data.hotspots.forEach(hotspot => {
            const userAnswer = savedProgress?.answers?.[hotspot.id] || '?';
            let correctnessClass = '';

            if (savedProgress) {
                correctnessClass = userAnswer === hotspot.label ? 'correct' : 'wrong';
            }

            html += `<div class="pic-label-hotspot ${correctnessClass}"
                          style="left: ${hotspot.coords.x}%; top: ${hotspot.coords.y}%;"
                          data-hotspot-id="${hotspot.id}">
                       ${userAnswer}
                     </div>`;
        });
        html += `</div>`;

        // Render the word bank using the same style as pic_match
        // It's only shown if the quiz is active (not graded)
        if (!savedProgress) {
            html += '<div class="pic-match-answer-bank">'; // Re-use class
            const wordBank = [...pageData.data.wordBank].sort(() => 0.5 - Math.random());
            wordBank.forEach(answer => {
                html += `<button class="answer-bank-btn" data-answer-text="${answer}">${answer}</button>`;
            });
            html += '</div>';
        }

        container.innerHTML = html;

        // --- Define max-width based on image aspect ratio ---
        const quizContainer = container.querySelector('.pic-label-container');
        const image = quizContainer?.querySelector('img');

        if (image) {
            const applyStyle = () => {
                const isPortrait = image.naturalHeight > image.naturalWidth - 200;
                quizContainer.style.maxWidth = isPortrait ? '530px' : '1000px';
            };

            // Handle images that are already loaded/cached
            if (image.complete) {
                applyStyle();
            } else {
                // Wait for the image to load before checking its dimensions
                image.onload = applyStyle;
            }
        }

        if (!savedProgress) {
            this.setupPicLabelEvents();
        }
    }

    setupPicLabelEvents() {
        // This is the same selection logic as pic_match
        document.querySelectorAll('.answer-bank-btn').forEach(btn => {
            btn.addEventListener('click', e => this.handlePicMatchAnswerSelect(e));
        });

        // This is the placement logic
        document.querySelectorAll('.pic-label-hotspot').forEach(hotspot => {
            hotspot.addEventListener('click', (e) => this.handlePicLabelHotspotClick(e));
        });

        // Run once on setup
        this.updateAnswerBankVisuals();
    }

    handlePicLabelHotspotClick(event) {
        if (!this.currentSelectedAnswer) return; // Do nothing if no answer is selected

        const clickedHotspot = event.currentTarget;
        clickedHotspot.textContent = this.currentSelectedAnswer;
        clickedHotspot.style.color = 'inherit'; // Use themed color

        // Deselect the answer from the bank
        document.querySelectorAll('.answer-bank-btn').forEach(btn => btn.classList.remove('selected'));
        this.currentSelectedAnswer = null;

        // Update visuals after placing an answer
        this.updateAnswerBankVisuals();
    }

    submitPicLabelQuiz() {
        const activeTabButton = document.querySelector('.social-studies-tab-button.active');
        const category = activeTabButton.dataset.tab;
        const level = document.getElementById(`${category}-level-select`).value;
        const pageIndex = this.currentSocialStudiesPage;
        const pageData = this.socialStudiesContent[category][level].pages[pageIndex];

        const quizHotspots = document.querySelectorAll('.pic-label-hotspot');
        let score = 0;
        const userAnswers = {};

        quizHotspots.forEach(hotspotEl => {
            const hotspotId = hotspotEl.dataset.hotspotId;
            const userAnswer = hotspotEl.textContent.trim();
            userAnswers[hotspotId] = userAnswer;

            // Find the correct answer from the original data using the ID
            const hotspotDef = pageData.data.hotspots.find(h => h.id === hotspotId);
            if (hotspotDef && userAnswer === hotspotDef.label) {
                score++;
            }
        });

        const total = pageData.data.hotspots.length;

        // Save progress
        const progressToSave = {
            score: `${score}/${total}`,
            answers: userAnswers
        };

        const levelProgress = this.currentUser.socialStudiesProgress[category][level];
        levelProgress.pageData[pageIndex] = progressToSave;

        levelProgress.currentTotalScore = (levelProgress.currentTotalScore || 0) + score;
        levelProgress.currentTotalPossible = (levelProgress.currentTotalPossible || 0) + total;

        this.saveUserData();
        alert(`Page submitted! Your score: ${score}/${total}`);

        this.checkSocialStudiesLevelCompletion(category, level);
        this.renderSocialStudiesContent();
    }

    updateAnswerBankVisuals() {
        // Step 0: Initialize a map to store how many times each answer is used.
        const usageCounts = new Map();
        const answerBoxes = document.querySelectorAll('.pic-match-answer-box, .pic-label-hotspot');

        // Step 1: Count the current usage of all answers on the board.
        answerBoxes.forEach(box => {
            const text = box.textContent.trim();
            if (text !== '?') {
                usageCounts.set(text, (usageCounts.get(text) || 0) + 1);
            }
        });

        // Step 2: Update the answer bank buttons based on the counts.
        document.querySelectorAll('.answer-bank-btn').forEach(btn => {
            const answerText = btn.dataset.answerText;
            const count = usageCounts.get(answerText) || 0;

            if (count > 0) {
                btn.classList.add('used');
            } else {
                btn.classList.remove('used');
            }
        });
    }

    // --- Match Quiz Implementation ---
    renderMatchQuiz(container, pageData, savedProgress) {
        // Add null checks for pageData structure
        if (!pageData || !pageData.data || !pageData.data.pairs || !Array.isArray(pageData.data.pairs)) {
            container.innerHTML = '<p>Error: Invalid quiz data structure.</p>';
            return;
        }

        this.currentMatchSelection = null; // Reset selection
        const pairs = pageData.data.pairs;

        // --- Create unique lists for BOTH columns ---
        const allLeftItems = pairs.map(p => p[0]);
        const uniqueLeftItems = [...new Set(allLeftItems)];
        const leftItems = savedProgress ? uniqueLeftItems.sort((a,b) => a.localeCompare(b)) : uniqueLeftItems.sort(() => 0.5 - Math.random());

        const allRightItems = pairs.map(p => p[1]);
        const uniqueRightItems = [...new Set(allRightItems)];
        const rightItems = savedProgress ? uniqueRightItems.sort((a,b) => a.localeCompare(b)) : uniqueRightItems.sort(() => 0.5 - Math.random());

        let html = `
            <div class="match-quiz-description">${pageData.data.description || ''}</div>
        `;

        // --- Conditional image display ---
        if (pageData.data.image) {
            html += `<img src="${pageData.data.image}" alt="Quiz Image" class="match-quiz-image">`;
        }

        html += `
            <div class="match-quiz-container">
                <svg class="match-lines-canvas"></svg>
                <div class="match-column" id="match-col-left">
                    ${leftItems.map(item => {
                        let itemClass = 'match-item';
                        if (savedProgress) {
                            // Check if this left-side item is the start of ANY correct match made by the user.
                            const isUsedCorrectly = pairs.some(p =>
                                p[0] === item && // Is this the right item for a pair?
                                savedProgress.answers[p[0]] === p[1] // And did the user match it correctly to its target?
                            );
                            if (isUsedCorrectly) {
                                itemClass += ' correct';
                            }
                        }
                        return `<button class="${itemClass}" data-item-text="${item}">${item}</button>`;
                    }).join('')}
                </div>
                <div class="match-column" id="match-col-right">
                    ${rightItems.map(item => {
                        let itemClass = 'match-item';
                        if (savedProgress) {
                            // Check if this right-side item is the correct target for ANY of the user's answers.
                            const isUsedCorrectly = pairs.some(p =>
                                p[1] === item && // Is this the right item for a pair?
                                savedProgress.answers[p[0]] === item // And did the user match it correctly?
                            );
                            // If it's part of any correct match, mark it as correct.
                            if (isUsedCorrectly) {
                                itemClass += ' correct';
                            }
                        }
                        return `<button class="${itemClass}" data-item-text="${item}">${item}</button>`;
                    }).join('')}
                </div>
            </div>
        `;
        container.innerHTML = html;

        if (savedProgress) {
            this.drawAllMatchLines(true); // Draw graded lines
        } else {
            this.setupMatchQuizEvents();
        }
    }

    setupMatchQuizEvents() {
        this.matchSelections = []; // Stores array of pairs [ [left, right], ... ]
        const leftItems = document.querySelectorAll('#match-col-left .match-item');
        const rightItems = document.querySelectorAll('#match-col-right .match-item');

        leftItems.forEach(item => {
            item.addEventListener('click', () => this.handleMatchItemClick(item, 'left'));
            item.addEventListener('mouseenter', () => this.highlightMatchLine(item.dataset.itemText, true));
            item.addEventListener('mouseleave', () => this.highlightMatchLine(item.dataset.itemText, false));
        });

        rightItems.forEach(item => {
            item.addEventListener('click', () => this.handleMatchItemClick(item, 'right'));
            item.addEventListener('mouseenter', () => this.highlightMatchLine(item.dataset.itemText, true, true));
            item.addEventListener('mouseleave', () => this.highlightMatchLine(item.dataset.itemText, false, true));
        });
    }

    handleMatchItemClick(item, side) {
        // --- A. An item is already selected ---
        if (this.currentMatchSelection) {
            // A1. Clicked the same item again: Cancel selection
            if (this.currentMatchSelection.element === item) {
                item.classList.remove('selected');
                this.currentMatchSelection = null;
                return;
            }

            // A2. Clicked an item on the opposite side: Form or break a pair
            if (this.currentMatchSelection.side !== side) {
                const leftItem = side === 'right' ? this.currentMatchSelection.element : item;
                const rightItem = side === 'right' ? item : this.currentMatchSelection.element;
                const leftText = leftItem.dataset.itemText;
                const rightText = rightItem.dataset.itemText;

                const pairIndex = this.matchSelections.findIndex(p => p[0] === leftText && p[1] === rightText);

                if (pairIndex > -1) {
                    // Pair exists, ove it (un-pair)
                    this.matchSelections.splice(pairIndex, 1);
                } else {
                    // Pair does not exist, so add it
                    this.matchSelections.push([leftText, rightText]);
                }

                // Update 'paired' status for both items
                const isLeftPaired = this.matchSelections.some(p => p[0] === leftText);
                const isRightPaired = this.matchSelections.some(p => p[1] === rightText);
                leftItem.classList.toggle('paired', isLeftPaired);
                rightItem.classList.toggle('paired', isRightPaired);

                // Reset selection and redraw
                this.currentMatchSelection.element.classList.remove('selected');
                this.currentMatchSelection = null;
                this.drawAllMatchLines();
            } else {
                // A3. Clicked a different item on the same side: Switch selection
                this.currentMatchSelection.element.classList.remove('selected');
                this.currentMatchSelection = { element: item, side: side };
                item.classList.add('selected');
            }
        } else {
            // --- B. No item is selected: Start a new selection ---
            this.currentMatchSelection = { element: item, side: side };
            item.classList.add('selected');
        }
    }

    drawAllMatchLines(isGraded = false) {
        const canvas = document.querySelector('.match-lines-canvas');
        if (!canvas) return;

        // Force browser to recalculate layout before we get element positions.
        canvas.getBoundingClientRect();
        canvas.innerHTML = '';

        const activeTabButton = document.querySelector('.social-studies-tab-button.active');
        if (!activeTabButton) return;
        const category = activeTabButton.dataset.tab;

        const levelDropdown = document.getElementById(`${category}-level-select`);
        if (!levelDropdown) return;
        const level = levelDropdown.value;

        const pageIndex = this.currentSocialStudiesPage;
        const savedProgress = this.currentUser.socialStudiesProgress[category]?.[level]?.pageData[pageIndex];

        // The data to draw is now an array of pairs
        const pairsToDraw = isGraded ? this.convertAnswersToPairs(savedProgress.answers) : this.matchSelections;

        for (const pair of pairsToDraw) {
            const [leftText, rightText] = pair;
            const leftEl = document.querySelector(`#match-col-left [data-item-text="${leftText}"]`);
            const rightEl = document.querySelector(`#match-col-right [data-item-text="${rightText}"]`);

            if (leftEl && rightEl) {
                const line = this.createSVGLine(leftEl, rightEl);
                line.dataset.left = leftText;
                line.dataset.right = rightText;

                if (isGraded) {
                    const originalPairs = this.socialStudiesContent[category][level].pages[pageIndex].data.pairs;
                    const isCorrect = originalPairs.some(p => p[0] === leftText && p[1] === rightText);
                    line.classList.add(isCorrect ? 'correct' : 'wrong', 'graded');
                }
                canvas.appendChild(line);
            }
        }
    }

    // Helper to convert old saved data format if necessary
    convertAnswersToPairs(answers) {
        if (Array.isArray(answers)) return answers; // Already new format
        // Convert old { left: right } object to [ [left, right] ] array
        return Object.entries(answers).map(([left, right]) => [left, right]);
    }

    createSVGLine(el1, el2) {
        const canvasRect = el1.closest('.match-quiz-container').getBoundingClientRect();
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();

        const x1 = rect1.right - canvasRect.left;
        const y1 = rect1.top + rect1.height / 2 - canvasRect.top;
        const x2 = rect2.left - canvasRect.left;
        const y2 = rect2.top + rect2.height / 2 - canvasRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        return line;
    }

    highlightMatchLine(itemText, shouldHighlight, isRightColumn = false) {
        let line;
        if(isRightColumn) {
            line = document.querySelector(`.match-lines-canvas line[data-right="${itemText}"]`);
        } else {
            line = document.querySelector(`.match-lines-canvas line[data-left="${itemText}"]`);
        }

        if (line) {
            line.classList.toggle('highlighted', shouldHighlight);
        }
    }

    submitMatchQuiz() {
        const activeTabButton = document.querySelector('.social-studies-tab-button.active');
        const category = activeTabButton.dataset.tab;
        const level = document.getElementById(`${category}-level-select`).value;
        const pageIndex = this.currentSocialStudiesPage;

        const originalPairs = this.socialStudiesContent[category][level].pages[pageIndex].data.pairs;
        const userSelections = this.matchSelections;
        let score = 0;
        const total = originalPairs.length;

        // Create a set of correct pairs for easy lookup
        const correctPairStrings = new Set(originalPairs.map(p => `${p[0]}---${p[1]}`));

        // Count how many of the user's selections are in the correct set
        userSelections.forEach(userPair => {
            if (correctPairStrings.has(`${userPair[0]}---${userPair[1]}`)) {
                score++;
            }
        });

        // Save progress for the page
        const progressToSave = {
            score: `${score}/${total}`,
            answers: userSelections
        };

        const levelProgress = this.currentUser.socialStudiesProgress[category][level];
        levelProgress.pageData[pageIndex] = progressToSave;

        // Add to the running total for the level
        levelProgress.currentTotalScore = (levelProgress.currentTotalScore || 0) + score;
        levelProgress.currentTotalPossible = (levelProgress.currentTotalPossible || 0) + total;

        this.saveUserData();
        alert(`Page submitted! Your score: ${score}/${total}`);

        // Check for level completion
        this.checkSocialStudiesLevelCompletion(category, level);

        // Re-render to show graded state
        this.renderSocialStudiesContent();
    }

    // --- Multiple Choice (mchoice) Quiz Implementation ---
    renderMChoiceQuiz(container, pageData, savedProgress) {
        if (!pageData.data?.questions) {
            container.innerHTML = "<p>Error: Invalid multiple choice quiz data.</p>";
            return;
        }

        this.mChoiceSelections = savedProgress ? savedProgress.answers : {};
        const questions = pageData.data.questions;

        let html = `<div class="mchoice-list-container ${savedProgress ? 'graded' : ''}">`;

        questions.forEach((q, index) => {
            const questionNumber = index + 1;
            const options = savedProgress ? q.options : [...q.options].sort(() => 0.5 - Math.random());
            const userChoice = savedProgress?.answers?.[q.id];

            html += `
                <div class="mchoice-question-block" data-question-id="${q.id}">
                    ${q.image ? `<img src="${q.image}" class="mchoice-image" alt="Question ${questionNumber}">` : ''}
                    <p class="mchoice-question-text">${questionNumber}. ${q.question}</p>
                    <div class="mchoice-options-container">
            `;

            options.forEach(option => {
                const isChecked = userChoice === option;
                const isCorrect = option === q.answer;
                let gradedClass = '';
                if (savedProgress && isChecked) {
                    // Only apply a class if this is the answer the user selected.
                    gradedClass = isCorrect ? 'correct-answer' : 'user-wrong-answer';
                }

                html += `
                    <div class="mchoice-option ${gradedClass}">
                        <input type="radio" id="q${q.id}_${option}" name="mchoice_${q.id}" value="${option}"
                            ${isChecked ? 'checked' : ''} ${savedProgress ? 'disabled' : ''}>
                        <label for="q${q.id}_${option}">${option}</label>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        html += `</div>`;
        container.innerHTML = html;

        if (!savedProgress) {
            this.setupMChoiceEvents();
        }
    }

    setupMChoiceEvents() {
        const containers = document.querySelectorAll('.mchoice-question-block');
        containers.forEach(container => {
            const questionId = container.dataset.questionId;
            const radios = container.querySelectorAll(`input[name="mchoice_${questionId}"]`);
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    this.mChoiceSelections[questionId] = radio.value;
                });
            });
        });
    }

    submitMChoiceQuiz() {
        const activeTabButton = document.querySelector('.social-studies-tab-button.active');
        const category = activeTabButton.dataset.tab;
        const level = document.getElementById(`${category}-level-select`).value;
        const pageIndex = this.currentSocialStudiesPage;

        const questions = this.socialStudiesContent[category][level].pages[pageIndex].data.questions;
        let score = 0;

        for (const q of questions) {
            if (this.mChoiceSelections[q.id] === q.answer) {
                score++;
            }
        }

        const progressToSave = {
            score: `${score}/${questions.length}`,
            answers: this.mChoiceSelections
        };

        const levelProgress = this.currentUser.socialStudiesProgress[category][level];
        levelProgress.pageData[pageIndex] = progressToSave;

        // Add to the running total
        levelProgress.currentTotalScore = (levelProgress.currentTotalScore || 0) + score;
        levelProgress.currentTotalPossible = (levelProgress.currentTotalPossible || 0) + questions.length;

        this.saveUserData();
        alert(`Page submitted! Your score: ${score}/${questions.length}`);

        this.checkSocialStudiesLevelCompletion(category, level);

        // Re-render to show graded state
        this.renderSocialStudiesContent();
    }

    // --- Cultural Recognition Screen ---
    definePerkDefinitions() {
        const self = this;
        return {
            'legendary_prob_increase': {
                id: 'legendary_prob_increase',
                name: 'Legendary Probability Increase',
                maxLevel: 5,
                cost: (level) => 100 + (level - 1) * 20,
                levels: [
                    {
                        description: "+1% Legendary",
                        effects: [  { target: 'gachaProbabilities.Legendary', operation: 'add', value: 1 },
                                    { target: 'gachaProbabilities.Common', operation: 'add', value: -1 } ]
                    },
                    {
                        description: "+2% Legendary",
                        effects: [  { target: 'gachaProbabilities.Legendary', operation: 'add', value: 2 },
                                    { target: 'gachaProbabilities.Common', operation: 'add', value: -2 } ]
                    },
                    {
                        description: "+2% Legendary",
                        effects: [  { target: 'gachaProbabilities.Legendary', operation: 'add', value: 2 },
                                    { target: 'gachaProbabilities.Common', operation: 'add', value: -2 } ]
                    },
                    {
                        description: "+2% Legendary",
                        effects: [  { target: 'gachaProbabilities.Legendary', operation: 'add', value: 2 },
                                    { target: 'gachaProbabilities.Rare', operation: 'add', value: -2 } ]
                    },
                    {
                        description: "+2% Legendary",
                        effects: [  { target: 'gachaProbabilities.Legendary', operation: 'add', value: 2 },
                                    { target: 'gachaProbabilities.Rare', operation: 'add', value: -2 } ]
                    },
                ],
                implemented: true,
                getBenefitDescription(currentLevel) {
                    let currentBonus = 0;
                    for (let i = 0; i < currentLevel; i++) {
                        const effect = this.levels[i].effects.find(e => e.target === 'gachaProbabilities.Legendary');
                        if (effect) currentBonus += effect.value;
                    }
                    const nextLevelEffect = this.levels[currentLevel].effects.find(e => e.target === 'gachaProbabilities.Legendary');
                    const nextBonus = currentBonus + (nextLevelEffect ? nextLevelEffect.value : 0);
                    const baseProb = self.GACHA_PROBABILITIES.Legendary;
                    return `<p>${baseProb + currentBonus}% legendary -> ${baseProb + nextBonus}% legendary</p>`;
                }
            },
            'draw_10_guarantee_increase': {
                id: 'draw_10_guarantee_increase',
                name: 'Draw 10 Guarantee Increase',
                maxLevel: 5,
                cost: (level) => 100 + (level - 1) * 20,
                levels: [
                    {
                        description: "+1% 'Draw 10' Guaranteed Legendary Chance",
                        effects: [  { target: 'drawTenGuaranteeLegendaryChance', operation: 'add', value: 1 } ]
                    },
                    {
                        description: "+2% 'Draw 10' Guaranteed Legendary Chance",
                        effects: [  { target: 'drawTenGuaranteeLegendaryChance', operation: 'add', value: 2 } ]
                    },
                    {
                        description: "+2% 'Draw 10' Guaranteed Legendary Chance",
                        effects: [  { target: 'drawTenGuaranteeLegendaryChance', operation: 'add', value: 2 } ]
                    },
                    {
                        description: "+2% 'Draw 10' Guaranteed Legendary Chance",
                        effects: [  { target: 'drawTenGuaranteeLegendaryChance', operation: 'add', value: 2 } ]
                    },
                    {
                        description: "+2% 'Draw 10' Guaranteed Legendary Chance",
                        effects: [   { target: 'drawTenGuaranteeLegendaryChance', operation: 'add', value: 2 } ]
                    },
                ],
                implemented: true,
                getBenefitDescription(currentLevel) {
                    let currentBonus = 0;
                    for (let i = 0; i < currentLevel; i++) {
                        const effect = this.levels[i].effects.find(e => e.target === 'drawTenGuaranteeLegendaryChance');
                        if (effect) currentBonus += effect.value;
                    }
                    const nextLevelEffect = this.levels[currentLevel].effects.find(e => e.target === 'drawTenGuaranteeLegendaryChance');
                    const nextBonus = currentBonus + (nextLevelEffect ? nextLevelEffect.value : 0);
                    return `<p>+${currentBonus}% guaranteed -> +${nextBonus}% guaranteed Legendary</p>`;
                }
            },
            'draw_10_perks': {
                id: 'draw_10_perks',
                name: 'Draw 10 Extra Perks',
                maxLevel: 8,
                cost: (level) => 100 + (level - 1) * 10,
                levels: [
                    {
                        description: "+2% chance for 10 Diamonds",
                        effects: [  { target: 'drawTenBonusTable.diamonds', operation: 'add', value: 2 } ]
                    },
                    {
                        description: "+2% chance for 1 Exchange Ticket",
                        effects: [  { target: 'drawTenBonusTable.ticket', operation: 'add', value: 2 } ]
                    },
                    {
                        description: "+2% chance for 10 Diamonds",
                        effects: [  { target: 'drawTenBonusTable.diamonds', operation: 'add', value: 2 } ]
                    },
                    {
                        description: "+2% chance for 1 Exchange Ticket",
                        effects: [  { target: 'drawTenBonusTable.ticket', operation: 'add', value: 2 } ]
                    },
                    {
                        description: "+2% chance for 10 Diamonds",
                        effects: [  { target: 'drawTenBonusTable.diamonds', operation: 'add', value: 2 } ]
                    },
                    {
                        description: "+2% chance for 1 Exchange Ticket",
                        effects: [  { target: 'drawTenBonusTable.ticket', operation: 'add', value: 2 } ]
                    },
                    {
                        description: "draw 10💎 -> draw 20💎",
                        effects: [  { target: 'drawTenDiamondRewardAmount', operation: 'set', value: 20 } ]
                    },
                    {
                        description: "+2% chance for 20 Diamonds",
                        effects: [  { target: 'drawTenBonusTable.diamonds', operation: 'add', value: 2 } ]
                    },
                ],
                implemented: true,
                getBenefitDescription(currentLevel) {
                    if (currentLevel === 6) { return `<p>${this.levels[currentLevel].description}</p>`; }
                    let currentDiamondChance = 0, currentTicketChance = 0;
                    for (let i = 0; i < currentLevel; i++) {
                        const diamondEffect = this.levels[i].effects.find(e => e.target === 'drawTenBonusTable.diamonds');
                        if (diamondEffect) currentDiamondChance += diamondEffect.value;
                        const ticketEffect = this.levels[i].effects.find(e => e.target === 'drawTenBonusTable.ticket');
                        if (ticketEffect) currentTicketChance += ticketEffect.value;
                    }
                    const nextLevelEffect = this.levels[currentLevel].effects[0];
                    if (nextLevelEffect.target === 'drawTenBonusTable.diamonds') {
                        const nextDiamondChance = currentDiamondChance + nextLevelEffect.value;
                        const currentDesc = currentDiamondChance > 0 ? `${currentDiamondChance}% draw 💎` : 'No 💎';
                        return `<p>${currentDesc} -> ${nextDiamondChance}% draw 💎</p>`;
                    } else {
                        const nextTicketChance = currentTicketChance + nextLevelEffect.value;
                        const currentDesc = currentTicketChance > 0 ? `${currentTicketChance}% draw 🎟️` : 'No 🎟️';
                        return `<p>${currentDesc} -> ${nextTicketChance}% draw 🎟️</p>`;
                    }
                }
            },
            'reduced_exchange_rate': {
                id: 'reduced_exchange_rate',
                name: 'Reduced Exchange Rate',
                maxLevel: 2,
                cost: () => 150,
                levels: [
                    {
                        description: "Cost of specified Legendary in exchange mode -5",
                        effects: [  { target: 'gachaExchangeRatesSpecified.Legendary', operation: 'add', value: -5 } ]
                    },
                    {
                        description: "Cost of 10💎 in exchange mode -5",
                        effects: [  { target: 'gachaExchangeRatesSpecified.diamond_10', operation: 'add', value: -5 } ]
                    },
                ],
                implemented: true,
                getBenefitDescription(currentLevel) {
                    return `<p>${this.levels[currentLevel].description}</p>`;
                }
            },
            'draw_10_discount': {
                id: 'draw_10_discount',
                name: 'Diamond Discount',
                maxLevel: 1,
                cost: () => 150,
                levels: [
                    {
                        description: "Use 9💎 instead of 10💎 for 'Draw 10'",
                        effects: [{ target: 'drawTenCost', operation: 'set', value: 9 }]
                    },
                ],
                implemented: true,
                getBenefitDescription(currentLevel) {
                    return `<p>${this.levels[currentLevel].description}</p>`;
                }
            },
            'monthly_budget': {
                id: 'monthly_budget',
                name: 'Budget for Collection Completion Reward + $5',
                maxLevel: 1,
                cost: () => 200,
                levels: [
                    { description: 'Unlock it for Harry Potter collection. Will reset in next collection', effects: [] }
                ],
                implemented: true,
                getBenefitDescription(currentLevel) {
                    return `<p>${this.levels[currentLevel].description}</p>`;
                }
            },
            'collection_redeem': {
                id: 'collection_redeem',
                name: 'Redeem Reward for Second Collection Completion',
                maxLevel: 1,
                cost: () => 200,
                levels: [
                    { description: 'Unlock it for Harry Potter collection. Will reset in next collection', effects: [] }
                ],
                implemented: true,
                getBenefitDescription(currentLevel) {
                    return `<p>${this.levels[currentLevel].description}</p>`;
                }
            },
            'unlock_halloween_theme': {
                id: 'unlock_halloween_theme',
                name: 'Seasonal Limited Theme',
                maxLevel: 1,
                cost: () => 0,
                levels: [
                    { description: 'Unlock access to exclusive, time-limited theme', effects: [] }
                ],
                implemented: true,
                isThemeUnlock: true,
                getBenefitDescription(currentLevel) {
                    const theme = self.themeManifest.find(t => t.requiredPerk === this.id);
                    return `
                        <p>${this.levels[currentLevel].description}</p>
                        <p><strong>Current Theme:</strong> ${theme.name}</p>
                        <p><strong>Available until:</strong> ${new Date(theme.expiresOn).toLocaleDateString()}</p>
                        </div>
                    `;
                }
            },
            'unlock_xmas_theme': {
                id: 'unlock_xmas_theme',
                name: 'Seasonal Limited Theme',
                maxLevel: 1,
                cost: () => 100,
                levels: [
                    { description: 'Unlock access to exclusive, time-limited theme', effects: [] }
                ],
                implemented: true,
                isThemeUnlock: true,
                getBenefitDescription(currentLevel) {
                    const theme = self.themeManifest.find(t => t.requiredPerk === this.id);
                    return `
                        <p>${this.levels[currentLevel].description}</p>
                        <p><strong>Current Theme:</strong> ${theme.name}</p>
                        <p><strong>Available until:</strong> ${new Date(theme.expiresOn).toLocaleDateString()}</p>
                        </div>
                    `;
                }
            },
        };
    }

    showCulturalRecognitionPage() {
        this.showScreen('cultural-recognition-screen');
        document.getElementById('cultural-points-display-recognition').textContent = this.currentUser.culturalPoints || 0;
        this.renderCulturalPerks();
    }

    handleUpgradePerk(perkId) {
        const perkDef = this.perkDefinitions[perkId];
        const currentLevel = this.currentUser.perkLevels[perkId] || 0;

        if (currentLevel >= perkDef.maxLevel) {
            alert("This perk is already at the maximum level.");
            return;
        }

        const cost = perkDef.cost(currentLevel + 1);
        if ((this.currentUser.culturalPoints || 0) < cost) {
            alert("You don't have enough cultural points to upgrade this perk.");
            return;
        }

        this.currentUser.culturalPoints -= cost;
        this.currentUser.perkLevels[perkId] = currentLevel + 1;

        this.saveUserData();

        // Recalculate config after upgrading
        this._recalculateEffectiveConfig();

        // Refresh the UI
        document.getElementById('cultural-points-display').textContent = this.currentUser.culturalPoints;
        document.getElementById('cultural-points-display-recognition').textContent = this.currentUser.culturalPoints;
        this.renderCulturalPerks();
    }

    getEffectiveConfig() {
        if (!this.effectiveConfig) {
            this._recalculateEffectiveConfig();
        }
        return this.effectiveConfig;
    }

    _recalculateEffectiveConfig() {
        const baseConfig = {
            gachaProbabilities: { ...this.GACHA_PROBABILITIES },
            gachaExchangeRatesSpecified: { ...this.GACHA_EXCHANGE_RATES_SPECIFIED },
            drawTenGuaranteeLegendaryChance: this.DRAW_TEN_GUARANTEE_LEGENDARY_CHANCE,
            drawTenCost: this.DRAW_TEN_COST,
            drawTenDiamondRewardAmount: this.DRAW_TEN_DIAMOND_REWARD_AMOUNT,
            drawTenBonusTable: { diamonds: 0, ticket: 0 } // Base chances are 0
        };

        const perkLevels = this.currentUser.perkLevels || {};

        for (const perkId in perkLevels) {
            const currentLevel = perkLevels[perkId];
            const perkDef = this.perkDefinitions[perkId];

            if (perkDef && perkDef.implemented) {
                // Apply effects for all unlocked levels
                for (let i = 0; i < currentLevel; i++) {
                    const levelEffects = perkDef.levels[i].effects;
                    levelEffects.forEach(effect => {
                        const targetParts = effect.target.split('.');
                        let targetObject = baseConfig;
                        for (let j = 0; j < targetParts.length - 1; j++) {
                            targetObject = targetObject[targetParts[j]];
                        }
                        const finalKey = targetParts[targetParts.length - 1];

                        if (effect.operation === 'add') {
                            targetObject[finalKey] += effect.value;
                        } else if (effect.operation === 'set') {
                            targetObject[finalKey] = effect.value;
                        }
                    });
                }
            }
        }

        // Finalize the bonus table by calculating the "nothing" chance
        baseConfig.drawTenBonusTable.nothing = 100 - baseConfig.drawTenBonusTable.diamonds - baseConfig.drawTenBonusTable.ticket;

        // Store the final calculated config in the class property
        this.effectiveConfig = baseConfig;
    }

    // Perform collection-based reset for cultural recognition perks
    _checkCollectionPerkReset() {
        if (this.currentUser.lastPerkResetPool !== this.currentGachaPool) {
            console.log(`New gacha pool detected. Resetting monthly perks. Last reset pool: ${this.currentUser.lastPerkResetPool}, Current pool: ${this.currentGachaPool}`);

            // These perks are now available to be purchased again for this collection.
            delete this.currentUser.perkLevels['monthly_budget'];
            delete this.currentUser.perkLevels['collection_redeem'];

            // Update the user's version marker to the current pool name
            this.currentUser.lastPerkResetPool = this.currentGachaPool;

            this.saveUserData();
            // The recalculation will happen in initializeUserProperties after this runs.
        }
    }

    defineThemeManifest() {
        return [
            { id: 'default', name: 'Default', requiredPerk: null },
            { id: 'halloween', name: 'Halloween', requiredPerk: 'unlock_halloween_theme', expiresOn: '2025-11-01T23:59:59' },
            { id: 'xmas', name: 'Christmas', requiredPerk: 'unlock_xmas_theme', expiresOn: '2025-12-25T23:59:59' },
            // Example for a future theme:
            // { id: 'winter', name: 'Winter', requiredPerk: 'unlock_winter_theme', expiresOn: '2026-01-31T23:59:59' },
        ];
    }

    handleThemeChange(themeName) {
        this.currentUser.activeTheme = themeName;
        this.saveUserData();
        this._applyTheme();
        // You might want to re-render mini-games if images need to change instantly
        if (document.getElementById('mini-game-screen').classList.contains('hidden') === false) {
            this.renderMiniGames();
        }
    }

    renderCulturalPerks() {
        const grid = document.querySelector('#cultural-recognition-screen .recognition-grid');
        grid.innerHTML = '';

        const standardPerkOrder = [
            'legendary_prob_increase', 'reduced_exchange_rate', 'monthly_budget', 'draw_10_perks',
            'draw_10_guarantee_increase', 'draw_10_discount', 'collection_redeem',
        ];

        // 1. Render all the standard, non-theme perks
        standardPerkOrder.forEach(perkId => {
            this._renderSinglePerkBox(grid, perkId);
        });

        // 2. Find the current, active, unexpired seasonal theme
        const now = new Date();
        const activeSeasonalTheme = this.themeManifest.find(theme => {
            if (!theme.requiredPerk) return false; // Skip default theme
            const expiresOn = new Date(theme.expiresOn);
            return now < expiresOn; // Find the first one that has not expired
        });

        if (activeSeasonalTheme) {
            // If we found an active seasonal theme, render its box.
            // _renderSinglePerkBox will handle the "locked" vs "unlocked" logic internally.
            this._renderSinglePerkBox(grid, activeSeasonalTheme.requiredPerk);
        } else {
            // If no active seasonal themes are found, show the placeholder.
            // This covers both "all expired" and "none defined yet".
            const placeholder = document.createElement('div');
            placeholder.className = 'recognition-box placeholder';
            placeholder.innerHTML = `<h4>Seasonal Theme</h4><p>Check back later for new seasonal themes!</p>`;
            grid.appendChild(placeholder);
        }

        // Re-attach all event listeners
        grid.querySelectorAll('.upgrade-perk-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleUpgradePerk(e.currentTarget.dataset.perkId));
        });
        grid.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleThemeChange(e.currentTarget.dataset.theme));
        });
    }

    _renderSinglePerkBox(grid, perkId) {
        const perkDef = this.perkDefinitions[perkId];
        if (!perkDef) return;

        const perkBox = document.createElement('div');
        perkBox.className = 'recognition-box';
        let contentHTML = `<h4>${perkDef.name}</h4>`;
        const currentLevel = this.currentUser.perkLevels[perkId] || 0;

        if (currentLevel > 0 && perkDef.maxLevel !== 1) {
            contentHTML += `<p class="current-level">Level: ${currentLevel}</p>`;
        }

        // Logic for displaying the upgrade/unlocked state
        if (currentLevel < perkDef.maxLevel) {
            const cost = perkDef.cost(currentLevel + 1);
            const canAfford = (this.currentUser.culturalPoints || 0) >= cost;
            const benefitDescription = perkDef.getBenefitDescription.call(perkDef, currentLevel); // Use .call to set 'this' correctly

            contentHTML += `
                <div class="upgrade-info">
                    ${benefitDescription}
                </div>
                <p class="upgrade-cost">Cost: ${cost} 🎵</p>
                <button class="upgrade-perk-btn" data-perk-id="${perkId}" ${!canAfford ? 'disabled' : ''}>
                    ${perkDef.maxLevel === 1 ? 'Unlock' : 'Upgrade'}
                </button>
            `;
        } else {
            // MAX LEVEL or theme selector for unlocked themes
            if (perkDef.isThemeUnlock) {
                const unlockedTheme = this.themeManifest.find(t => t.requiredPerk === perkId);
                contentHTML += `
                    <div class="upgrade-info">
                        <p>You have unlocked exclusive theme!&nbsp&nbsp&nbsp
                            <button class="theme-btn active ${this.currentUser.activeTheme === unlockedTheme.id ? 'active' : ''}" data-theme="${unlockedTheme.id}">${unlockedTheme.name}</button>
                        </p>
                    </div>
                    <div class="theme-tip">
                        <p> 💡 All themes can be found and controlled in Developer Mode</p>
                    </div>
                `;
            } else if (perkDef.maxLevel === 1) {
                contentHTML += `<p class="upgrade-info">Unlocked</p>`;
            } else {
                contentHTML += `<p class="max-level-text">MAX LEVEL REACHED</p>`;
            }
        }

        perkBox.innerHTML = contentHTML;
        grid.appendChild(perkBox);
    }
}

const app = new ChineseLearningApp();