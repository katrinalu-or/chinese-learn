class ChineseLearningApp {
    constructor() {
        this.currentUser = null;
        this.currentActivity = null;

        // --- GLOBAL CONFIGURATION VARIABLES ---
        this.WORDS_PER_SESSION = 20;
        this.CURRENT_LEVEL_COMPLETIONS = 2;
        this.LOWER_LEVEL_COMPLETIONS_REVIEW = 1; // For Word Review
        this.REVIEW_LOWER_LEVEL_PERCENTAGE = 30; // 30% for Word Review

        this.LEVEL_UP_DIAMOND_BONUS = 2;

        // Listening Activity Config
        this.LISTENING_WORDS_PER_SESSION = 10;
        this.LISTENING_CURRENT_LEVEL_COMPLETIONS = 2;
        this.LISTENING_LOWER_LEVEL_COMPLETIONS = 1;
        this.LISTENING_LOWER_LEVEL_PERCENTAGE = 30;

        // Sentence Writing Config
        this.SENTENCE_WORDS_PER_SESSION = 10;

        // Gacha probabilities (must add up to 100)
        this.GACHA_PROBABILITIES = {
            Legendary: 5,
            Epic: 10,
            Rare: 30,
            Common: 55
        };

        this.DRAW_TEN_GUARANTEE_LEGENDARY_CHANCE = 15; // 15% chance for Legendary on a guaranteed pull

        this.DEFAULT_WORDS_VERSION = '4.0';
        this.gachaPool = this.defineGachaPool();
        this.init();
    }

    init() {
        this.initializeDefaultWords();
        this.setupEventListeners();
        this.checkLoggedInUser();
    }

    defineGachaPool() {
        return [
            { id: 'zeus', name: 'Zeus', rarity: 'Legendary', image: 'greek/zeus.png' },
            { id: 'poseidon', name: 'Poseidon', rarity: 'Epic', image: 'greek/poseidon.png' },
            { id: 'hades', name: 'Hades', rarity: 'Epic', image: 'greek/hades.png' },
            { id: 'hercules', name: 'Hercules', rarity: 'Epic', image: 'greek/hercules.png' },
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

    initializeDefaultWords() {
        // Updated version to ensure this new list is loaded.
        const LATEST_WORDS_VERSION = '6.0';
        const storedVersion = localStorage.getItem('defaultWordsVersion');

        if (storedVersion !== LATEST_WORDS_VERSION) {
            console.log('Default word list is outdated. Updating to v' + LATEST_WORDS_VERSION);
            const defaultWords = {
                1: ['大', '中間', '小時候', '木頭', '山', '水果', '火', '早安', '手', '車子', '走路', '出來', '土地', '女生', '男生', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '一百', '一千', '一萬', '昨天', '今天', '明天', '後天'],
                2: ['白色', '黑色', '粉紅色', '紅色', '藍色', '綠色', '黃色', '橘色', '紫色', '咖啡色', '灰色', '太陽', '月亮', '下雨', '天氣', '太棒了', '回來', '家人', '正在', '正好', '他們', '雲', '做完', '你好嗎', '說話', '古老', '要不要', '吃東西', '他和她', '兩個人', '只有', '貝', '買菜', '冷水', '冰塊', '日記', '天空', '風'],
                3: ['哥哥', '弟弟', '姐姐', '妹妹', '爸爸', '爺爺', '奶奶', '阿姨', '舅舅', '阿公', '阿嬤', '可以', '想法', '所以', '玩遊戲', '我也不知道', '沒有', '看電視', '馬上', '門口', '愛心', '上面', '竹子', '一塊田', '在哪裡', '多少', '尖尖的', '平平的', '石頭', '刀子', '出去', '未來', '日本', '目 （眼睛）', '罵人', '又來了', '左邊', '右邊'],
                4: ['花', '草', '拍手', '這個', '分類', '向外走', '頭髮', '找手機', '課本', '地上', '真的', '假的', '朋友', '裡面', '外面', '叫外賣', '哭笑不得', '如果', '牛肉', '羊肉', '豬肉', '雞肉', '鴨肉', '每天', '看電視', '都要', '給', '很會', '為什麼', '以為'],
                5: ['第一次', '起來', '自己', '再一次', '做事情', '因為', '就是', '最喜歡', '結果', '長大', '海邊', '冬天', '春天', '夏天', '秋天', '長高', '更多', '時間', '美國', '中國', '日本', '住在', '重要', '重來', '誰', '生氣', '力氣', '米', '公車', '公主'],
                6: ['故事', '最近', '馬路', '跑步', '國王', '王子', '一直', '一句話', '吃光光', '脫光', '過來', '拿東西', '有用', '用力', '一點點', '合在一起', '衣服', '還有', '還給我', '現在', '出現', '等一下', '看見', '見面', '能力', '可能', '能不能', '天才', '我剛剛才', '才能'],
                7: ['先來', '趕快', '怎麼', '多久', '正常', '非常', '平常', '房間', '紅包', '包起來', '快樂', '可樂', '毛巾', '走得慢', '跑得快', '正方形', '圓形', '三角形', '長方形', '地方', '陪家人', '喝牛奶', '一定', '新年', '放在', '下午', '可愛', '愛吃', '站著', '已經'],
                8: ['忘記', '經過', '記得', '糖果', '彩虹', '好乖', '同時', '同樣的', '一樣', '手拉手', '收東西', '永遠', '永久', '草莓', '切開', '全部', '而且', '需要', '寫字', '中文', '工作', '請假', '請問', '害怕', '打雷', '閃電', '帶東西', '月亮', '太陽', '入口'],
                9: ['青菜', '晴天', '籃球', '足球', '加油', '隊長', '結束', '比賽', '老師', '開始', '對不對', '對面', '對不起', '顏色', '充電', '充滿', '出發', '發生', '發現', '一件衣服', '奇怪', '好奇', '小鳥', '唱歌', '穿衣服', '覺得', '睡覺', '學校', '學生', '電影'],
                10: ['影子', '休息']
            };
            localStorage.setItem('defaultWords', JSON.stringify(defaultWords));
            localStorage.setItem('defaultWordsVersion', LATEST_WORDS_VERSION);
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
        document.getElementById('back-from-writing').addEventListener('click', () => this.showDashboard());
        document.getElementById('replay-audio-btn').addEventListener('click', () => this.speak(this.currentActivity.currentAnswer));
        document.getElementById('show-answer-btn').addEventListener('click', () => this.showWritingAnswer());
        document.getElementById('writing-check-btn').addEventListener('click', () => this.handleWritingResponse(true));
        document.getElementById('writing-cross-btn').addEventListener('click', () => this.handleWritingResponse(false));
        document.getElementById('back-from-sentence').addEventListener('click', () => this.showDashboard());
        document.getElementById('sentence-check-btn').addEventListener('click', () => this.handleSentenceCompletion(true));
        document.getElementById('sentence-cross-btn').addEventListener('click', () => this.handleSentenceCompletion(false));

        // Other Screens
        document.getElementById('back-from-progress').addEventListener('click', () => this.showDashboard());
        document.getElementById('back-from-collections').addEventListener('click', () => this.showDashboard());
        document.getElementById('draw-gacha-btn').addEventListener('click', () => this.drawGachaItem());
        document.getElementById('draw-ten-gacha-btn').addEventListener('click', () => this.drawTenGachaItems());
        document.getElementById('close-gacha-modal-btn').addEventListener('click', () => this.closeGachaModal());
        document.getElementById('close-multi-gacha-modal-btn').addEventListener('click', () => this.closeGachaModal(true));
        document.getElementById('back-from-dev').addEventListener('click', () => this.showDashboard());

        // Dev Mode
        document.getElementById('backup-btn').addEventListener('click', () => this.exportUserData());
        document.getElementById('restore-btn').addEventListener('click', () => document.getElementById('import-file').click());
        document.getElementById('import-file').addEventListener('change', (e) => this.importUserData(e));
        document.getElementById('reset-level-btn').addEventListener('click', () => this.resetToLevel());
        document.getElementById('download-wordlist-btn').addEventListener('click', () => this.downloadWordList());
        document.getElementById('upload-wordlist-btn').addEventListener('click', () => document.getElementById('import-wordlist-file').click());
        document.getElementById('import-wordlist-file').addEventListener('change', (e) => this.uploadWordList(e));
        document.getElementById('reset-wordlist-btn').addEventListener('click', () => this.resetWordListToDefault());
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

    initializeUserProperties() {
        this.currentUser.diamonds = this.currentUser.diamonds || 0;
        this.currentUser.listeningProgress = this.currentUser.listeningProgress || {};
        this.currentUser.listeningLowerLevelWords = this.currentUser.listeningLowerLevelWords || [];
        this.currentUser.reviewLowerLevelWords = this.currentUser.reviewLowerLevelWords || [];
        this.currentUser.sentenceWritingCompleted = this.currentUser.sentenceWritingCompleted || false;

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
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    showDashboard() {
        this.showScreen('dashboard-screen');
        document.getElementById('username-display').textContent = this.currentUser.username;
        document.getElementById('level-display').textContent = this.currentUser.level;
        this.updateProgressDisplay();
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

        // Word Review Progress
        const reviewCurrentWords = this.getWordsForLevel(currentLevel);
        const reviewLowerWords = this.currentUser.reviewLowerLevelWords || [];
        reviewCurrentWords.forEach(word => {
            totalRequired += this.CURRENT_LEVEL_COMPLETIONS;
            totalCompleted += Math.min(this.currentUser.wordProgress[word]?.correct || 0, this.CURRENT_LEVEL_COMPLETIONS);
        });
        reviewLowerWords.forEach(word => {
            totalRequired += this.LOWER_LEVEL_COMPLETIONS_REVIEW;
            totalCompleted += Math.min(this.currentUser.wordProgress[word]?.correct || 0, this.LOWER_LEVEL_COMPLETIONS_REVIEW);
        });

        // Word Writing Progress
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

        // Sentence Writing Progress
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
        const sessionList = this.generateSessionWords(availableWords, this.WORDS_PER_SESSION);
        this.currentActivity = { type: 'word-review', words: sessionList, currentIndex: 0, score: 0 };
        this.showScreen('word-review-screen');
        this.displayCurrentWord();
    }

    canAdvanceLevel() {
        const currentLevel = this.currentUser.level;

        const reviewCurrentWords = this.getWordsForLevel(currentLevel);
        for (let word of reviewCurrentWords) {
            if ((this.currentUser.wordProgress[word]?.correct || 0) < this.CURRENT_LEVEL_COMPLETIONS) return false;
        }
        for (let word of (this.currentUser.reviewLowerLevelWords || [])) {
            if ((this.currentUser.wordProgress[word]?.correct || 0) < this.LOWER_LEVEL_COMPLETIONS_REVIEW) return false;
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
            if ((wordProgress[word]?.correct || 0) < this.CURRENT_LEVEL_COMPLETIONS) {
                availableWords.push(word);
            }
        });

        requiredLowerLevelWords.forEach(word => {
            if ((wordProgress[word]?.correct || 0) < this.LOWER_LEVEL_COMPLETIONS_REVIEW) {
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
        for (let level = 1; level <= 5; level++) {
            const levelWords = userWords[level] || defaultWords[level] || [];
            if (levelWords.includes(word)) return level;
        }
        return 1;
    }

    generateSessionWords(availableWords, desiredCount) {
        if (availableWords.length === 0) return [];
        let sessionWords = [];
        const shuffledPool = [...availableWords].sort(() => 0.5 - Math.random());
        while (sessionWords.length < desiredCount) {
            sessionWords = sessionWords.concat(shuffledPool);
        }
        return sessionWords.slice(0, desiredCount);
    }

    displayCurrentWord() {
        const activity = this.currentActivity;
        const word = activity.words[activity.currentIndex];
        document.getElementById('chinese-word').textContent = word;
        document.getElementById('current-score').textContent = activity.score;
        document.getElementById('word-counter').textContent = `${activity.currentIndex + 1}/${activity.words.length}`;
    }

    handleWordResponse(isCorrect) {
        const activity = this.currentActivity;
        const word = activity.words[activity.currentIndex];
        if (isCorrect) {
            activity.score++;
        }
        this.updateWordProgress(word, isCorrect);

        activity.currentIndex++;
        if (activity.currentIndex >= activity.words.length) {
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
        this.currentUser.diamonds++;
        this.currentUser.testScores.push({ type: 'word-review', score, total, date: new Date().toISOString() });
        this.saveUserData();

        const canAdvance = this.canAdvanceLevel();
        setTimeout(() => {
            if (canAdvance) {
                alert(`Word Review Complete!\nScore: ${score}/${total} (${Math.round(score / total * 100)}%)\n\n🎉 Congratulations! You have completed Level ${this.currentUser.level}! You earned a bonus of ${this.LEVEL_UP_DIAMOND_BONUS} diamonds!`);
                this.advanceLevel();
                this.showDashboard();
            } else {
                alert(`Word Review Complete!\nScore: ${score}/${total} (${Math.round(score / total * 100)}%)`);
                this.showDashboard();
            }
        }, 300);
    }

    advanceLevel() {
        this.currentUser.level++;
        this.currentUser.diamonds += this.LEVEL_UP_DIAMOND_BONUS;
        this.currentUser.sentenceWritingCompleted = false;

        this.generatePracticeSubsets();
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

        const listenCount = Math.ceil(shuffled.length * (this.LISTENING_LOWER_LEVEL_PERCENTAGE / 100));
        const reviewCount = Math.ceil(shuffled.length * (this.REVIEW_LOWER_LEVEL_PERCENTAGE / 100));

        if (listenCount + reviewCount > shuffled.length) {
            console.warn("Percentages for subsets add up to more than 100%. Overlap may occur.");
            this.currentUser.listeningLowerLevelWords = shuffled.slice(0, listenCount);
            this.currentUser.reviewLowerLevelWords = shuffled.slice(0, reviewCount);
        } else {
            this.currentUser.listeningLowerLevelWords = shuffled.slice(0, listenCount);
            this.currentUser.reviewLowerLevelWords = shuffled.slice(listenCount, listenCount + reviewCount);
        }
    }

    showProgressDetail() {
        this.showScreen('progress-screen');
        this.updateProgressDetails();
    }

    updateProgressDetails() {
        const currentLevel = this.currentUser.level;

        const reviewContainer = document.getElementById('word-review-progress');
        let reviewHTML = '<h4>Word Review Progress</h4>';
        let required = this.CURRENT_LEVEL_COMPLETIONS;
        let levelWords = this.getWordsForLevel(currentLevel);
        let totalRequired = levelWords.length * required;
        let totalCompleted = 0;
        levelWords.forEach(word => { totalCompleted += Math.min(this.currentUser.wordProgress[word]?.correct || 0, required); });
        let levelProgress = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
        if (levelWords.length > 0) {
            reviewHTML += `<div class="level-progress-item ${levelProgress >= 100 ? 'completed' : ''}"><div class="level-header"><h5>Level ${currentLevel} (Current)</h5></div><div class="level-progress-bar"><div class="level-progress-fill" style="width: ${levelProgress}%">${levelProgress}%</div></div></div>`;
        }

        required = this.LOWER_LEVEL_COMPLETIONS_REVIEW;
        levelWords = this.currentUser.reviewLowerLevelWords || [];
        totalRequired = levelWords.length * required;
        totalCompleted = 0;
        levelWords.forEach(word => { totalCompleted += Math.min(this.currentUser.wordProgress[word]?.correct || 0, required); });
        levelProgress = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
        if (levelWords.length > 0) {
            reviewHTML += `<div class="level-progress-item ${levelProgress >= 100 ? 'completed' : ''}"><div class="level-header"><h5>Lower Levels</h5></div><div class="level-progress-bar"><div class="level-progress-fill" style="width: ${levelProgress}%">${levelProgress}%</div></div></div>`;
        }
        reviewContainer.innerHTML = reviewHTML;

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

        const requiredLowerLevelWords = this.currentUser.listeningLowerLevelWords || [];
        if (requiredLowerLevelWords.length > 0) {
            writingHTML += '<div class="listening-word-list"><h5>Lower Level Practice Words</h5><div class="listening-word-grid">';
            requiredLowerLevelWords.forEach(word => {
                const isCompleted = (this.currentUser.listeningProgress[word]?.correct || 0) >= this.LISTENING_LOWER_LEVEL_COMPLETIONS;
                writingHTML += `<div class="listening-word-item ${isCompleted ? 'completed' : ''}">${word}</div>`;
            });
            writingHTML += '</div></div>';
        }
        writingContainer.innerHTML = writingHTML;

        const sentenceContainer = document.getElementById('sentence-writing-progress');
        let sentenceHTML = '<h4>Sentence Writing Progress</h4>';
        const sentenceProgress = this.currentUser.sentenceWritingCompleted ? 100 : 0;
        sentenceHTML += `<div class="level-progress-item ${sentenceProgress >= 100 ? 'completed' : ''}"><div class="level-header"><h5>Practice Task</h5></div><div class="level-progress-bar"><div class="level-progress-fill" style="width: ${sentenceProgress}%">${sentenceProgress}%</div></div></div>`;
        sentenceContainer.innerHTML = sentenceHTML;
    }

    showDeveloperMode() {
        this.showScreen('developer-screen');
        document.getElementById('current-level-display').textContent = this.currentUser.level;
        const currentLevel = this.currentUser.level;
        const resetSelect = document.getElementById('reset-level-select');
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
        this.currentUser.level = targetLevel;
        this.currentUser.wordProgress = {};
        this.currentUser.listeningProgress = {};
        this.currentUser.listeningLowerLevelWords = [];
        this.currentUser.reviewLowerLevelWords = [];
        this.currentUser.sentenceWritingCompleted = false;
        this.currentUser.testScores = [];
        this.generatePracticeSubsets();
        this.saveUserData();
        document.getElementById('current-level-display').textContent = targetLevel;
        alert(`✅ Successfully reset to Level ${targetLevel}!\n\nAll progress has been cleared.`);
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
            exportDate: new Date().toISOString(),
            appVersion: '1.0'
        };
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `chinese-learning-backup-${this.currentUser.username}-level${this.currentUser.level}-${currentDate}.json`;
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
            currentAnswer: null
        };
        this.showScreen('word-writing-screen');
        this.displayCurrentWritingWord();
    }

    displayCurrentWritingWord() {
        const activity = this.currentActivity;
        const word = activity.words[activity.currentIndex];
        activity.currentAnswer = word; // Store the answer

        const wordEl = document.getElementById('writing-chinese-word');
        wordEl.textContent = '???';
        wordEl.classList.add('answer-hidden');

        document.getElementById('writing-word-counter').textContent = `${activity.currentIndex + 1}/${activity.words.length}`;
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
        const word = this.currentActivity.currentAnswer;
        if (!this.currentUser.listeningProgress[word]) {
            this.currentUser.listeningProgress[word] = { correct: 0 };
        }
        if (isCorrect) {
            this.currentUser.listeningProgress[word].correct++;
        }
        this.saveUserData();

        this.currentActivity.currentIndex++;
        if (this.currentActivity.currentIndex >= this.currentActivity.words.length) {
            const canAdvance = this.canAdvanceLevel();
            setTimeout(() => {
                if (canAdvance) {
                    alert(`Listening session complete!\n\n🎉 Congratulations! You have completed Level ${this.currentUser.level}! You earned a bonus of ${this.LEVEL_UP_DIAMOND_BONUS} diamonds!`);
                    this.advanceLevel();
                    this.showDashboard();
                } else {
                    alert("Listening session complete!");
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
            this.saveUserData();
            const canAdvance = this.canAdvanceLevel();
            setTimeout(() => {
                if (canAdvance) {
                    alert(`Task marked as complete!\n\n🎉 Congratulations! You have completed Level ${this.currentUser.level}! You earned a bonus of ${this.LEVEL_UP_DIAMOND_BONUS} diamonds!`);
                    this.advanceLevel();
                    this.showDashboard();
                } else {
                    alert("Task marked as complete for this level!");
                    this.showDashboard();
                }
            }, 300);
        } else {
            this.showDashboard();
        }
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
        this.gachaPool.forEach(item => {
            const count = this.currentUser.collection[item.id] || 0;
            const isOwned = count > 0;
            const itemDiv = document.createElement('div');
            itemDiv.className = `collection-item ${item.rarity} ${isOwned ? 'owned' : ''}`;
            let countBadge = isOwned ? `<div class="item-count-badge">x${count}</div>` : '';
            itemDiv.innerHTML = `${countBadge}<img src="${item.image}" alt="${item.name}" class="collection-item-image"><span class="collection-item-name">${item.name}</span>`;
            grid.appendChild(itemDiv);
        });
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
        this.currentUser.collection[drawnItem.id] = (this.currentUser.collection[drawnItem.id] || 0) + 1;
        this.saveUserData();
        this.showGachaResult(drawnItem);
        this.renderCollectionGrid();
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
        document.getElementById('gacha-multi-result-modal').classList.remove('hidden');
        const grid = document.getElementById('multi-result-grid');
        grid.innerHTML = '';
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'multi-result-item';
            itemDiv.innerHTML = `<img src="${item.image}" alt="${item.name}"><div class="rarity-text ${item.rarity}">${item.rarity}</div>`;
            grid.appendChild(itemDiv);
        });
    }

    showGachaResult(item) {
        document.getElementById('gacha-result-modal').classList.remove('hidden');
        const rarityEl = document.getElementById('gacha-result-rarity');
        rarityEl.textContent = item.rarity;
        rarityEl.className = item.rarity;
        document.getElementById('gacha-result-image').src = item.image;
        document.getElementById('gacha-result-name').textContent = item.name;
    }

    closeGachaModal(isMulti = false) {
        if (isMulti) {
            document.getElementById('gacha-multi-result-modal').classList.add('hidden');
        } else {
            document.getElementById('gacha-result-modal').classList.add('hidden');
        }
    }
}

const app = new ChineseLearningApp();