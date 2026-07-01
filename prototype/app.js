const STORAGE_KEY = 'dailyQuestApp_v1';

document.addEventListener('alpine:init', () => {
    Alpine.data('appData', () => ({
        currentTab: 'home',
        showCreateQuestModal: false,
        toast: { show: false, message: '' },
        
        // Data State
        user: {
            total_red_flowers: 0,
            total_purple_flowers: 0,
            yellow_flowers: 0, 
            has_claimed_daily: false,
            last_login_date: new Date().toDateString()
        },
        quest: {
            title: '',
            durationType: 'DAYS',
            durationValue: null,
            total_target_days: 0,
            current_streak: 0,
            wish_target: null,
            wish_current: 0,
            logs: [] // Array of { date: string, text: string }
        },
        
        // Calendar State
        currentMonthName: '',
        calendarDays: [], // array of { empty: boolean, dayNumber: number, isLogged: boolean, isToday: boolean }

        // For Create Quest Form
        newQuest: {
            title: '',
            durationType: 'DAYS',
            durationValue: 100,
            wishTarget: 100
        },

        // User Profile Modal
        showUserModal: false,
        selectedUser: null,

        // Mock Community Data
        communityTab: 'quests', // 'quests' or 'wishes'
        communityList: [
            { id: 1, author: 'Alice', bio: '喜歡閱讀與分享，目標是一年100本書 📚', streak: 45, content: '今天讀完了《原子習慣》，非常有啟發，繼續保持日更！', yellow_flowers: 2, red_flowers: 120, purple_flowers: 50 },
            { id: 2, author: 'Bob.Design', bio: 'UI/UX 設計師，每天都在畫畫 🎨', streak: 12, content: '今天練習了 Figma 介面設計，感覺排版功力又進步了一點。', yellow_flowers: 0, red_flowers: 35, purple_flowers: 10 },
            { id: 3, author: 'Charlie_Wu', bio: '馬拉松跑者，風雨無阻 🏃‍♂️', streak: 88, content: '跑步 5 公里完成！下雨也澆不熄熱情。', yellow_flowers: 3, red_flowers: 210, purple_flowers: 100 }
        ],
        wishList: [
            { id: 1, author: 'David.Dev', bio: '程式麻瓜努力變身全端工程師 💻', title: '百日寫作計畫', target: 200, current: 155, yellow_flowers: 1, red_flowers: 80, purple_flowers: 20 },
            { id: 2, author: 'Eva_Music', bio: '音樂是我的生命 🎸', title: '連續30天練吉他', target: 100, current: 98, yellow_flowers: 2, red_flowers: 150, purple_flowers: 30 },
            { id: 3, author: 'Frank.Fit', bio: '用自律換取自由 🏋️', title: '減脂3個月紀錄', target: 300, current: 120, yellow_flowers: 0, red_flowers: 300, purple_flowers: 80 }
        ],
        
        gardenInterval: null,

        init() {
            this.loadData();
            this.checkDailyReset();
            
            // Watch tab changes to handle garden animations
            this.$watch('currentTab', (val) => {
                if (val === 'home') {
                    this.startGardenAnimation();
                } else {
                    this.stopGardenAnimation();
                }
            });

            // Start animation if landing on home
            if (this.currentTab === 'home') {
                this.startGardenAnimation();
            }

            // Generate Calendar
            this.generateCalendar();
        },

        getPageTitle() {
            const titles = {
                'home': 'The Garden',
                'quest': '紀錄',
                'community': '社群',
                'admin': '管理與設定'
            };
            return titles[this.currentTab] || '';
        },

        showToast(msg) {
            this.toast.message = msg;
            this.toast.show = true;
            setTimeout(() => { this.toast.show = false; }, 3000);
        },

        // Data Management
        loadData() {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    this.user = { ...this.user, ...parsed.user };
                    this.quest = { ...this.quest, ...parsed.quest };
                } catch (e) {
                    console.error("Error loading data", e);
                }
            }
        },

        saveData() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                user: this.user,
                quest: this.quest
            }));
        },

        resetData() {
            if(confirm("確定要重置所有資料嗎？這將清除你的專案進度與花朵。")) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
        },

        checkDailyReset() {
            const today = new Date().toDateString();
            if (this.user.last_login_date !== today) {
                // Reset daily yellow flowers
                this.user.yellow_flowers = 0; 
                this.user.has_claimed_daily = false;
                this.user.last_login_date = today;
                this.saveData();
                this.showToast('新的一天！請至花園領取每日免費橘花。');
            }
        },

        claimDailyFlowers() {
            this.user.yellow_flowers = 3;
            this.user.has_claimed_daily = true;
            this.saveData();
            
            // Show toast and redirect
            this.showToast('成功領取 3 朵橘花！快去更新專案吧！');
            setTimeout(() => {
                this.currentTab = 'quest';
            }, 600); // slight delay to let user see feedback
        },

        // Quest Logic
        calculateTotalDays(q) {
            if (!q.durationValue) return 0;
            if (q.durationType === 'DAYS') return q.durationValue;
            if (q.durationType === 'WEEKS') return q.durationValue * 7;
            if (q.durationType === 'MONTHS') return q.durationValue * 30; // Approximation
            return 0;
        },

        createQuest() {
            const totalDays = this.calculateTotalDays(this.newQuest);
            if (totalDays < 21) return;

            this.quest = {
                title: this.newQuest.title,
                durationType: this.newQuest.durationType,
                durationValue: this.newQuest.durationValue,
                total_target_days: totalDays,
                current_streak: 0,
                wish_target: this.newQuest.wishTarget,
                wish_current: 0,
                logs: []
            };
            this.saveData();
            this.showCreateQuestModal = false;
            this.showToast('專案建立成功！開始你的第一天吧！');
        },

        hasCheckedInToday() {
            if (!this.quest.logs || this.quest.logs.length === 0) return false;
            const today = new Date().toDateString();
            const lastLog = this.quest.logs[this.quest.logs.length - 1];
            return lastLog.date === today;
        },

        performCheckIn() {
            const textInput = document.getElementById('logText').value;
            if (textInput.trim() === '') {
                this.showToast('請輸入一些心得喔！');
                return;
            }

            const today = new Date().toDateString();
            this.quest.logs.push({ date: today, text: textInput });
            this.quest.current_streak += 1;
            
            // Give 1 yellow flower as reward for updating
            this.user.yellow_flowers += 1;
            
            this.saveData();
            
            // Check if achieved wish
            if (this.quest.current_streak >= this.quest.total_target_days) {
                // Unlock wish
                this.user.total_purple_flowers += this.quest.wish_target;
                this.showToast('恭喜達成目標！許願池解鎖，獲得紫花！');
                // Could reset quest here, but we'll leave it maxed out for demo
            } else {
                this.showToast('打卡成功！獲得 1 朵可用於送人的橘花！');
            }
            
            this.generateCalendar();
        },

        // Calendar Logic
        generateCalendar() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth(); // 0-11
            
            const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
            this.currentMonthName = `${year}年 ${monthNames[month]}`;
            
            // Set to first day of current month to find starting weekday
            const firstDayDate = new Date(year, month, 1);
            let firstDay = firstDayDate.getDay(); // 0 (Sun) to 6 (Sat)
            
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            const loggedDates = new Set((this.quest.logs || []).map(log => new Date(log.date).toDateString()));
            const todayStr = new Date().toDateString();
            
            let days = [];
            // Padding for previous month
            for (let i = 0; i < firstDay; i++) {
                days.push({ empty: true });
            }
            
            // Days of current month
            for (let i = 1; i <= daysInMonth; i++) {
                const d = new Date(year, month, i);
                const dStr = d.toDateString();
                days.push({
                    empty: false,
                    dayNumber: i,
                    isLogged: loggedDates.has(dStr),
                    isToday: dStr === todayStr
                });
            }
            
            this.calendarDays = days;
        },

        // Community Logic
        openUserProfile(item) {
            this.selectedUser = {
                name: item.author,
                bio: item.bio,
                yellow: item.yellow_flowers,
                red: item.red_flowers,
                purple: item.purple_flowers
            };
            this.showUserModal = true;
        },

        giveFlower(itemId, event) {
            if (this.user.yellow_flowers <= 0) return;
            
            // Deduct
            this.user.yellow_flowers -= 1;
            
            // Update item
            const item = this.communityList.find(i => i.id === itemId);
            if (item) {
                item.red_flowers += 1;
            }
            
            this.saveData();
            this.triggerFlowerBurst(event, 'fa-heart', 'text-brand-red');
            this.showToast('已送出橘花！對方收到了一朵紅花。');
        },

        pledgeWish(itemId, event) {
            if (this.user.yellow_flowers <= 0) return;
            
            this.user.yellow_flowers -= 1;
            
            const item = this.wishList.find(i => i.id === itemId);
            if (item) {
                item.current += 1;
            }
            
            this.saveData();
            // Show a yellow seedling going in, as it turns purple only on completion
            this.triggerFlowerBurst(event, 'fa-seedling', 'text-brand-yellow');
            this.showToast('已將橘花投入許願池，為他集氣！');
        },

        triggerFlowerBurst(event, iconClass, colorClass) {
            const btn = event.currentTarget;
            const rect = btn.getBoundingClientRect();
            
            const fxContainer = document.getElementById('fx-container');
            const icon = document.createElement('i');
            icon.className = `fa-solid ${iconClass} ${colorClass} flower-burst text-3xl`;
            icon.style.left = `${rect.left + rect.width/2 - 15}px`;
            icon.style.top = `${rect.top - 20}px`;
            
            fxContainer.appendChild(icon);
            
            setTimeout(() => {
                icon.remove();
            }, 1000);
        },

        // Garden Animation
        startGardenAnimation() {
            this.stopGardenAnimation();
            const canvas = document.getElementById('garden-canvas');
            if (!canvas) return;

            const totalFlowers = this.user.total_red_flowers + this.user.total_purple_flowers;
            // Visual mapping: limit concurrent flowers based on amount to avoid lag
            const intensity = Math.min(Math.max(totalFlowers, 5), 50); // Show at least 5 for demo

            this.gardenInterval = setInterval(() => {
                if (document.hidden || this.currentTab !== 'home') return;
                
                // Spawn a new flower
                const flower = document.createElement('i');
                // Decide color based on ratio
                const isPurple = Math.random() < (this.user.total_purple_flowers / Math.max(totalFlowers, 1));
                
                flower.className = `fa-solid fa-fan flower-particle text-2xl ${isPurple ? 'text-brand-purple' : 'text-brand-red'}`;
                
                // Randomize position and animation properties
                const left = Math.random() * 100; // percentage
                const duration = 5 + Math.random() * 5; // 5-10s
                const size = 0.5 + Math.random() * 1.5;
                
                flower.style.left = `${left}%`;
                flower.style.animationDuration = `${duration}s`;
                flower.style.fontSize = `${size}rem`;
                
                canvas.appendChild(flower);
                
                // Clean up
                setTimeout(() => {
                    if (flower.parentNode) {
                        flower.remove();
                    }
                }, duration * 1000);

            }, 800 - (intensity * 10)); // Faster spawn rate with more flowers
        },

        stopGardenAnimation() {
            if (this.gardenInterval) {
                clearInterval(this.gardenInterval);
                this.gardenInterval = null;
            }
            const canvas = document.getElementById('garden-canvas');
            if (canvas) canvas.innerHTML = '';
        }
    }));
});
