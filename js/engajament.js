/**
 * FURIA Community - Post Engagement System
 * This script adds engagement points for posting, commenting, and interacting with content
 * Each post is now worth 5 points to increase user engagement
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Initializing FURIA Community Engagement System...');
    
    // ===============================================================
    // CONFIGURATION
    // ===============================================================
    
    const CONFIG = {
        STORAGE_KEYS: {
            ENGAGEMENT: 'furiax_engagement_score',
            USER_DATA: 'furiax_user_data',
            ACTIVITY_LOG: 'furiax_activity_log'
        },
        SELECTORS: {
            POST_BUTTON: '#analyzePostBtn',
            POST_INPUT: '.post-input',
            COMMENT_SUBMIT: '.comment-submit',
            COMMENT_INPUT: '.comment-input',
            LIKE_BUTTONS: '.post-action-btn:nth-child(1)',
            SHARE_BUTTONS: '.post-action-btn:nth-child(3)',
            
            // Score display elements
            ENGAGEMENT_SCORE: '.score-value',
            ENGAGEMENT_LEVEL: '.score-label',
            ENGAGEMENT_ITEMS: '.engagement-item',
            REWARD_ITEMS: '.reward-item',
            PROGRESS_FILL: '.progress-fill',
            PROGRESS_TEXT: '.progress-text'
        },
        POINT_VALUES: {
            POST: 5,           // Increased to 5 points per post
            COMMENT: 3,
            LIKE: 1,
            SHARE: 2,
            SOCIAL_CONNECT: 10,
            DAILY_LOGIN: 2
        },
        ANIMATION_DURATION: 1000,
        NOTIFICATION_DURATION: 3000
    };
    
    // ===============================================================
    // STATE MANAGEMENT
    // ===============================================================
    
    // Application state
    let state = {
        engagement: {
            score: 0,
            categories: {
                community: 0,
                events: 0,
                support: 0,
                reputation: 0
            },
            activities: []
        }
    };
    
    // Load saved engagement data from localStorage
    function loadEngagementData() {
        try {
            const savedData = localStorage.getItem(CONFIG.STORAGE_KEYS.ENGAGEMENT);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                // Update our state with saved data
                state.engagement.score = parsedData.score || 0;
                
                // Ensure all categories exist
                state.engagement.categories = {
                    community: parsedData.categories?.community || 0,
                    events: parsedData.categories?.events || 0,
                    support: parsedData.categories?.support || 0,
                    reputation: parsedData.categories?.reputation || 0
                };
                
                // Load activity log if it exists
                state.engagement.activities = parsedData.activities || [];
                
                console.log('✅ Loaded engagement data:', state.engagement);
            } else {
                // Initialize with default data if nothing exists
                initializeDefaultEngagement();
            }
        } catch (error) {
            console.error('❌ Error loading engagement data:', error);
            initializeDefaultEngagement();
        }
    }
    
    // Initialize default engagement values
    function initializeDefaultEngagement() {
        // Start with some baseline values for new users
        state.engagement = {
            score: 35,
            categories: {
                community: 40,
                events: 25,
                support: 30,
                reputation: 45
            },
            activities: [{
                type: 'initial',
                points: 35,
                timestamp: new Date().toISOString(),
                message: 'Bem-vindo à Comunidade FURIA!'
            }]
        };
        
        // Save this initial state
        saveEngagementData();
        console.log('✅ Initialized default engagement data');
    }
    
    // Save engagement data to localStorage
    function saveEngagementData() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.ENGAGEMENT, JSON.stringify(state.engagement));
            
            // Also update the user data for compatibility with other systems
            try {
                const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
                userData.engagementScore = state.engagement.score;
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            } catch (e) {
                console.warn('⚠️ Could not update user data with engagement score', e);
            }
            
            console.log('✅ Saved engagement data');
        } catch (error) {
            console.error('❌ Error saving engagement data:', error);
        }
    }
    
    // ===============================================================
    // ENGAGEMENT POINTS SYSTEM
    // ===============================================================
    
    // Add engagement points for an activity
    function addEngagementPoints(activityType, additionalData = {}) {
        // Check if the activity type is valid
        const pointValue = getPointsForActivity(activityType);
        if (pointValue <= 0) return;
        
        // Create activity record
        const activity = {
            type: activityType,
            points: pointValue,
            timestamp: new Date().toISOString(),
            ...additionalData
        };
        
        // Add points to the engagement score
        state.engagement.score += pointValue;
        
        // Add points to the appropriate category
        const category = getCategoryForActivity(activityType);
        if (category && state.engagement.categories[category] !== undefined) {
            // Add points to the category (scaled to keep within 0-100 range)
            state.engagement.categories[category] = Math.min(100, 
                state.engagement.categories[category] + pointValue * 1.5);
        }
        
        // Add activity to the log (limited to last 100 activities)
        state.engagement.activities.unshift(activity);
        if (state.engagement.activities.length > 100) {
            state.engagement.activities = state.engagement.activities.slice(0, 100);
        }
        
        // Save updated engagement data
        saveEngagementData();
        
        // Update UI
        updateEngagementUI();
        
        // Show notification for significant point gains
        if (pointValue >= 3) {
            showPointsNotification(pointValue, activityType);
        }
        
        console.log(`✅ Added ${pointValue} points for ${activityType}`);
        return pointValue;
    }
    
    // Get point value for an activity type
    function getPointsForActivity(activityType) {
        const activityTypeUpperCase = activityType.toUpperCase();
        return CONFIG.POINT_VALUES[activityTypeUpperCase] || 0;
    }
    
    // Map activity type to engagement category
    function getCategoryForActivity(activityType) {
        switch (activityType.toLowerCase()) {
            case 'post':
            case 'comment':
                return 'community';
            case 'like':
            case 'share':
                return 'support';
            case 'event':
            case 'checkin':
                return 'events';
            case 'social_connect':
            case 'invite_friend':
                return 'reputation';
            default:
                return 'community';
        }
    }
    
    // ===============================================================
    // UI UPDATES AND EVENT LISTENERS
    // ===============================================================
    
    // Update all engagement UI elements
    function updateEngagementUI() {
        // Update score display
        const scoreElement = document.querySelector(CONFIG.SELECTORS.ENGAGEMENT_SCORE);
        if (scoreElement) {
            // Animate the score update
            const currentScore = parseInt(scoreElement.textContent) || 0;
            const newScore = state.engagement.score;
            
            if (currentScore !== newScore) {
                animateNumber(scoreElement, currentScore, newScore, CONFIG.ANIMATION_DURATION);
            }
        }
        
        // Update engagement level
        const levelElement = document.querySelector(CONFIG.SELECTORS.ENGAGEMENT_LEVEL);
        if (levelElement) {
            const level = getEngagementLevelForScore(state.engagement.score);
            levelElement.textContent = `Nível de Engajamento: ${level}`;
        }
        
        // Update category breakdowns
        document.querySelectorAll(CONFIG.SELECTORS.ENGAGEMENT_ITEMS).forEach((item, index) => {
            const valueElement = item.querySelector('.engagement-value');
            if (!valueElement) return;
            
            // Identify which category this element represents
            const category = getCategoryFromElement(item, index);
            if (!category) return;
            
            // Update the value display
            const value = state.engagement.categories[category];
            if (value !== undefined) {
                const displayValue = `${Math.round(value)}/100`;
                
                // Only animate if the value changed
                if (valueElement.textContent !== displayValue) {
                    valueElement.textContent = displayValue;
                    
                    // Add highlight effect
                    valueElement.style.color = '#00cc66';
                    valueElement.style.transform = 'scale(1.1)';
                    
                    setTimeout(() => {
                        valueElement.style.color = '';
                        valueElement.style.transform = '';
                    }, 1000);
                }
            }
        });
        
        // Update reward progress
        updateRewardsProgress();
    }
    
    // Update rewards progress based on engagement score
    function updateRewardsProgress() {
        const rewardItems = document.querySelectorAll(CONFIG.SELECTORS.REWARD_ITEMS);
        
        rewardItems.forEach((item, index) => {
            const progressFill = item.querySelector(CONFIG.SELECTORS.PROGRESS_FILL);
            const progressText = item.querySelector(CONFIG.SELECTORS.PROGRESS_TEXT);
            
            if (!progressFill || !progressText) return;
            
            // Calculate progress percentage based on engagement score and difficulty level
            let progressPercentage;
            
            // Different difficulty levels for each reward
            switch (index) {
                case 0: // First reward (easiest)
                    progressPercentage = Math.min(100, state.engagement.score * 1.2);
                    break;
                case 1: // Second reward (medium)
                    progressPercentage = Math.min(100, (state.engagement.score - 20) * 1.1);
                    break;
                case 2: // Third reward (hardest)
                    progressPercentage = Math.min(100, (state.engagement.score - 45) * 1.0);
                    break;
                default:
                    progressPercentage = Math.min(100, state.engagement.score);
            }
            
            // Ensure percentage is at least 0
            progressPercentage = Math.max(0, progressPercentage);
            
            // Update visual elements
            progressFill.style.width = `${progressPercentage}%`;
            progressText.textContent = `${Math.round(progressPercentage)}%`;
            
            // Add visual effects for completed rewards
            if (progressPercentage >= 100) {
                if (!item.classList.contains('reward-completed')) {
                    item.classList.add('reward-completed');
                    
                    // Show animation for newly completed rewards
                    item.style.animation = 'pulse 1s';
                    setTimeout(() => {
                        item.style.animation = '';
                    }, 1000);
                    
                    // Show notification for completing a reward
                    const rewardTitle = item.querySelector('.reward-title');
                    if (rewardTitle) {
                        showNotification(`🎁 Recompensa Desbloqueada: ${rewardTitle.textContent}`, 'success');
                    }
                }
            } else {
                item.classList.remove('reward-completed');
            }
        });
    }
    
    // Set up event listeners for engagement actions
    function setupEngagementListeners() {
        // POST button - Add engagement points when user creates a post
        const postButton = document.querySelector(CONFIG.SELECTORS.POST_BUTTON);
        if (postButton) {
            // Check if already initialized to prevent duplicate listeners
            if (!postButton.hasAttribute('data-engagement-init')) {
                // Store original click handler if it exists
                const originalClickHandler = postButton.onclick;
                
                // Replace with our enhanced handler
                postButton.onclick = function(event) {
                    const postInput = document.querySelector(CONFIG.SELECTORS.POST_INPUT);
                    
                    // Only give points if post content exists
                    if (postInput && postInput.value.trim()) {
                        // Give engagement points for creating a post
                        addEngagementPoints('POST', {
                            content: postInput.value.trim().substring(0, 50) + (postInput.value.length > 50 ? '...' : '')
                        });
                        
                        // Call original handler if it exists
                        if (typeof originalClickHandler === 'function') {
                            originalClickHandler.call(this, event);
                        }
                    }
                };
                
                // Mark as initialized
                postButton.setAttribute('data-engagement-init', 'true');
                console.log('✅ Post button engagement listener initialized');
            }
        }
        
        // COMMENT buttons - Add points when user comments
        document.querySelectorAll(CONFIG.SELECTORS.COMMENT_SUBMIT).forEach(button => {
            // Check if already initialized
            if (!button.hasAttribute('data-engagement-init')) {
                button.addEventListener('click', function() {
                    const input = this.closest('.comment-form')?.querySelector(CONFIG.SELECTORS.COMMENT_INPUT);
                    
                    if (input && input.value.trim()) {
                        // Give engagement points for commenting
                        addEngagementPoints('COMMENT', {
                            content: input.value.trim().substring(0, 30) + (input.value.length > 30 ? '...' : '')
                        });
                    }
                });
                
                // Mark as initialized
                button.setAttribute('data-engagement-init', 'true');
            }
        });
        
        // LIKE buttons
        document.querySelectorAll(CONFIG.SELECTORS.LIKE_BUTTONS).forEach(button => {
            // Check if already initialized
            if (!button.hasAttribute('data-engagement-init')) {
                button.addEventListener('click', function() {
                    // Only award points if the post isn't already liked
                    if (!this.classList.contains('liked')) {
                        addEngagementPoints('LIKE');
                        
                        // Add liked class to track state
                        this.classList.add('liked');
                    }
                });
                
                // Mark as initialized
                button.setAttribute('data-engagement-init', 'true');
            }
        });
        
        // SHARE buttons
        document.querySelectorAll(CONFIG.SELECTORS.SHARE_BUTTONS).forEach(button => {
            // Check if already initialized
            if (!button.hasAttribute('data-engagement-init')) {
                button.addEventListener('click', function() {
                    addEngagementPoints('SHARE');
                });
                
                // Mark as initialized
                button.setAttribute('data-engagement-init', 'true');
            }
        });
        
        console.log('✅ Engagement listeners setup complete');
    }
    
    // Set up DOM observer to initialize listeners for dynamically added elements
    function setupDOMObserver() {
        const observer = new MutationObserver(function(mutations) {
            // Check if any new engagement elements were added
            let shouldRefreshListeners = false;
            
            for (const mutation of mutations) {
                // Check added nodes for engagement elements
                if (mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        
                        // Check if this is an element node
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check for relevant elements
                            if (node.querySelector) {
                                if (
                                    node.classList.contains('post-card') ||
                                    node.classList.contains('comment-item') ||
                                    node.querySelector(CONFIG.SELECTORS.COMMENT_SUBMIT) ||
                                    node.querySelector(CONFIG.SELECTORS.LIKE_BUTTONS)
                                ) {
                                    shouldRefreshListeners = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                
                if (shouldRefreshListeners) break;
            }
            
            // Refresh event listeners if needed
            if (shouldRefreshListeners) {
                setTimeout(setupEngagementListeners, 100);
            }
        });
        
        // Observe the main content area for changes
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            observer.observe(mainContent, {
                childList: true,
                subtree: true
            });
            
            console.log('✅ DOM observer set up for engagement elements');
        }
    }
    
    // ===============================================================
    // UTILITY FUNCTIONS
    // ===============================================================
    
    // Get engagement level based on score
    function getEngagementLevelForScore(score) {
        if (score >= 85) return 'ELITE';
        if (score >= 70) return 'AVANÇADO';
        if (score >= 50) return 'REGULAR';
        if (score >= 30) return 'INICIANTE';
        return 'NOVATO';
    }
    
    // Identify category from DOM element
    function getCategoryFromElement(element, index) {
        // Try to identify category from text content
        const labelElement = element.querySelector('.engagement-label');
        if (labelElement) {
            const text = labelElement.textContent.toLowerCase();
            
            if (text.includes('comunidade')) return 'community';
            if (text.includes('evento')) return 'events';
            if (text.includes('suporte')) return 'support';
            if (text.includes('reputação') || text.includes('reputacao')) return 'reputation';
        }
        
        // If not found by content, use index as fallback
        const categories = ['community', 'events', 'support', 'reputation'];
        return categories[index] || 'community';
    }
    
    // Animate number change
    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const difference = end - start;
        
        function updateNumber(currentTime) {
            const elapsedTime = currentTime - startTime;
            
            if (elapsedTime >= duration) {
                element.textContent = end;
                return;
            }
            
            const easedProgress = easeOutCubic(elapsedTime / duration);
            const currentValue = Math.round(start + difference * easedProgress);
            element.textContent = currentValue;
            
            requestAnimationFrame(updateNumber);
        }
        
        // Start animation
        requestAnimationFrame(updateNumber);
    }
    
    // Easing function for smoother animations
    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }
    
    // Show notification for earning points
    function showPointsNotification(points, activityType) {
        let message;
        let icon;
        
        switch (activityType.toLowerCase()) {
            case 'post':
                message = `+${points} pontos por criar um post!`;
                icon = '📝';
                break;
            case 'comment':
                message = `+${points} pontos por comentar!`;
                icon = '💬';
                break;
            case 'like':
                message = `+${points} ponto por curtir!`;
                icon = '👍';
                break;
            case 'share':
                message = `+${points} pontos por compartilhar!`;
                icon = '🔄';
                break;
            default:
                message = `+${points} pontos de engajamento!`;
                icon = '🔥';
        }
        
        showNotification(`${icon} ${message}`, 'success');
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Check if notification element exists
        let notification = document.getElementById('engagementNotification');
        
        if (!notification) {
            // Create notification element
            notification = document.createElement('div');
            notification.id = 'engagementNotification';
            document.body.appendChild(notification);
            
            // Add styles if not already present
            if (!document.getElementById('engagementNotificationStyles')) {
                const style = document.createElement('style');
                style.id = 'engagementNotificationStyles';
                style.textContent = `
                    #engagementNotification {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        padding: 12px 20px;
                        border-radius: 10px;
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        font-family: 'Exo 2', sans-serif;
                        z-index: 1000;
                        transform: translateX(150%);
                        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                        max-width: 350px;
                        backdrop-filter: blur(5px);
                    }
                    
                    #engagementNotification.visible {
                        transform: translateX(0);
                    }
                    
                    #engagementNotification.success {
                        border-left: 4px solid #00cc66;
                    }
                    
                    #engagementNotification.warning {
                        border-left: 4px solid #ffbb00;
                    }
                    
                    #engagementNotification.error {
                        border-left: 4px solid #ff3b5c;
                    }
                    
                    #engagementNotification.info {
                        border-left: 4px solid #1e90ff;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Update notification content and type
        notification.textContent = message;
        notification.className = type;
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('visible');
            
            // Hide after specified duration
            setTimeout(() => {
                notification.classList.remove('visible');
            }, CONFIG.NOTIFICATION_DURATION);
        }, 10);
    }
    
    // ===============================================================
    // INITIALIZATION
    // ===============================================================
    
    // Initialize the engagement system
    function initEngagementSystem() {
        console.log('🚀 Initializing Engagement System...');
        
        // Load saved data
        loadEngagementData();
        
        // Update UI with current data
        updateEngagementUI();
        
        // Set up event listeners
        setupEngagementListeners();
        
        // Set up observer for dynamic content
        setupDOMObserver();
        
        // Add daily login points if first visit today
        addDailyLoginPoints();
        
        console.log('✅ Engagement System initialized successfully');
    }
    
    // Add points for daily login if first login of the day
    function addDailyLoginPoints() {
        // Get latest login date
        const lastActivityTime = state.engagement.activities.length > 0 
            ? new Date(state.engagement.activities[0].timestamp) 
            : null;
        
        const now = new Date();
        
        // Check if this is the first login today
        if (!lastActivityTime || 
            lastActivityTime.getDate() !== now.getDate() || 
            lastActivityTime.getMonth() !== now.getMonth() || 
            lastActivityTime.getFullYear() !== now.getFullYear()) {
            
            // Award daily login points
            addEngagementPoints('daily_login', {
                message: 'Login diário'
            });
            
            console.log('✅ Daily login points added');
        }
    }
    
    // Start the engagement system
    initEngagementSystem();
});