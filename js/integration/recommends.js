/**
 * FURIAX Personalized Recommendation System
 * Creates targeted recommendations based on user profile data
 * Version: 2.0.0 - Pop-up Recommendations
 */

// Main recommendation module
const FuriaxRecommendSystem = (function() {
    // Configuration
    const CONFIG = {
        STORAGE_KEYS: {
            FAN_DATA: 'furiax_fan_data',
            PROFILE: 'furiaxProfile',
            RECOMMENDATION_HISTORY: 'furiax_recommendation_history',
            CATEGORIES: 'furiax_fan_category'
        },
        TYPES: {
            EVENTS: 'events',
            GAMING: 'gaming',
            COLLECTOR: 'collector',
            CONTENT: 'content'
        },
        POPUP_CONFIG: {
            DISPLAY_DELAY: 10000, // 10 seconds after page load
            MIN_TIME_BETWEEN_POPUPS: 120000, // 2 minutes between popups
            SESSION_MAX_POPUPS: 2, // Maximum 2 popups per session
            SCROLL_DEPTH_TRIGGER: 0.3, // Show popup after 30% scroll depth
            EXIT_INTENT_ENABLED: true, // Show popup on exit intent
            DISPLAY_DURATION: 15000, // Auto-close after 15 seconds
        }
    };

    // Recommendation inventory by category
    const recommendationInventory = {
        events: [
            {
                id: 'event-fanfest',
                title: 'FURIA Fan Fest 2025',
                description: 'O maior evento para os fãs da FURIA! Meet & greet, atividades exclusivas e muito mais.',
                image: '../img/recommendations/fanfest.jpg',
                cta: 'Reserve seu lugar',
                url: '/events/fanfest',
                tags: ['evento', 'meet&greet', 'presencial']
            },
            {
                id: 'event-viewing',
                title: 'Viewing Party - Major Qualifier',
                description: 'Assista as classificatórias do próximo Major com outros fãs da FURIA.',
                image: '../img/recommendations/viewing.jpg',
                cta: 'Garanta seu ingresso',
                url: '/events/viewing-party',
                tags: ['evento', 'campeonato', 'presencial', 'cs2']
            },
            {
                id: 'event-workshop',
                title: 'Workshop Tático com arT',
                description: 'Aprenda estratégias de CS2 com o capitão da FURIA.',
                image: '../img/recommendations/workshop.jpg',
                cta: 'Inscreva-se',
                url: '/events/workshop',
                tags: ['workshop', 'cs2', 'tático']
            }
        ],
        gaming: [
            {
                id: 'gaming-pro',
                title: 'Play with Pro: Matchmaking com KSCERATO',
                description: '2 partidas competitivas + feedback personalizado.',
                image: '../img/recommendations/playwithpro.jpg',
                cta: 'Agendar sessão',
                url: '/gaming/playwithpro',
                tags: ['gaming', 'cs2', 'pro-player']
            },
            {
                id: 'gaming-setup',
                title: 'Setup Oficial FURIA',
                description: 'Configure seu PC como os pros da FURIA com equipamentos oficiais.',
                image: '../img/recommendations/setup.jpg',
                cta: 'Ver produtos',
                url: '/store/pro-setup',
                tags: ['gaming', 'hardware', 'periféricos']
            },
            {
                id: 'gaming-masterclass',
                title: 'Masterclass de Mira Avançada',
                description: 'Técnicas profissionais para melhorar sua precisão nos FPS.',
                image: '../img/recommendations/aim.jpg',
                cta: 'Melhorar habilidades',
                url: '/gaming/aim-masterclass',
                tags: ['gaming', 'treinamento', 'aim', 'fps']
            }
        ],
        collector: [
            {
                id: 'collector-jersey',
                title: 'Jersey Pro Player Autografada',
                description: 'Edição limitada do Major com certificado de autenticidade.',
                image: '../img/recommendations/jersey.jpg',
                cta: 'Edição limitada',
                url: '/store/signed-jersey',
                tags: ['colecionável', 'autógrafos', 'jersey']
            },
            {
                id: 'collector-kit',
                title: 'Kit Colecionador FURIA',
                description: 'Conjunto exclusivo com itens numerados e certificados.',
                image: '../img/recommendations/kit.jpg',
                cta: 'Garantir o meu',
                url: '/store/collector-kit',
                tags: ['colecionável', 'exclusivo', 'limitado']
            },
            {
                id: 'collector-mousepad',
                title: 'Mousepad XXL Autografado',
                description: 'Com assinaturas de toda a equipe de CS2 da FURIA.',
                image: '../img/recommendations/mousepad.jpg',
                cta: 'Últimas unidades',
                url: '/store/signed-mousepad',
                tags: ['colecionável', 'autógrafos', 'periféricos']
            }
        ],
        content: [
            {
                id: 'content-insider',
                title: 'FURIA Insider - Assinatura Premium',
                description: 'Acesso exclusivo a vídeos, comunicações de partidas e bastidores.',
                image: '../img/recommendations/insider.jpg',
                cta: 'Assinar agora',
                url: '/content/insider',
                tags: ['conteúdo', 'exclusivo', 'vídeos', 'premium']
            },
            {
                id: 'content-major',
                title: 'Road to Major - Série Completa',
                description: 'A jornada completa da FURIA até o Major em uma série documental.',
                image: '../img/recommendations/roadtomajor.jpg',
                cta: 'Assistir série',
                url: '/content/road-to-major',
                tags: ['conteúdo', 'documentário', 'cs2']
            },
            {
                id: 'content-guides',
                title: 'Guias Avançados CS2',
                description: 'Estratégias detalhadas de todos os mapas competitivos.',
                image: '../img/recommendations/guides.jpg',
                cta: 'Ver guias',
                url: '/content/cs2-guides',
                tags: ['conteúdo', 'cs2', 'guides', 'tático']
            }
        ]
    };

    // Session tracking
    let sessionData = {
        popupsShown: 0,
        lastPopupTime: 0,
        pageLoadTime: Date.now(),
        maxScrollDepth: 0,
        userInteractions: 0,
        currentPageContext: getCurrentPageContext()
    };

    // Context tracking for better targeting
    function getCurrentPageContext() {
        // Get current URL path and page title
        const path = window.location.pathname;
        const title = document.title;
        
        // Extract context info
        let context = {
            section: 'home',
            game: null,
            playerFocus: null,
            contentType: null
        };
        
        // Determine section from URL
        if (path.includes('/events')) {
            context.section = 'events';
        } else if (path.includes('/store')) {
            context.section = 'store';
        } else if (path.includes('/content')) {
            context.section = 'content';
        } else if (path.includes('/gaming')) {
            context.section = 'gaming';
        } else if (path.includes('/profile')) {
            context.section = 'profile';
        }
        
        // Extract game from URL or title
        const games = ['cs2', 'valorant', 'lol', 'apex', 'dota2', 'fortnite'];
        games.forEach(game => {
            if (path.includes(game) || title.toLowerCase().includes(game)) {
                context.game = game;
            }
        });
        
        // Extract player focus if on player page
        const playerPattern = /\/player\/([a-zA-Z0-9_-]+)/;
        const playerMatch = path.match(playerPattern);
        if (playerMatch && playerMatch[1]) {
            context.playerFocus = playerMatch[1];
        }
        
        // Determine content type from URL
        if (path.includes('/news')) {
            context.contentType = 'news';
        } else if (path.includes('/videos')) {
            context.contentType = 'video';
        } else if (path.includes('/guides')) {
            context.contentType = 'guide';
        }
        
        return context;
    }

    // Utility functions
    function getUserData() {
        // Get data from fan profile
        const fanData = localStorage.getItem(CONFIG.STORAGE_KEYS.FAN_DATA);
        
        if (fanData) {
            try {
                return JSON.parse(fanData);
            } catch (error) {
                console.error('Error parsing fan data:', error);
            }
        }
        
        // Fallback - get data from profile
        const profileData = localStorage.getItem(CONFIG.STORAGE_KEYS.PROFILE);
        
        if (profileData) {
            try {
                return JSON.parse(profileData);
            } catch (error) {
                console.error('Error parsing profile data:', error);
            }
        }
        
        return null;
    }

    // Determine primary user category
    function getUserCategory() {
        // Try to get predefined category first
        const category = localStorage.getItem(CONFIG.STORAGE_KEYS.CATEGORIES);
        if (category && Object.values(CONFIG.TYPES).includes(category)) {
            return category;
        }
        
        // Calculate from fan data
        const userData = getUserData();
        if (!userData) return CONFIG.TYPES.EVENTS; // Default
        
        // Scoring system
        const scores = {
            [CONFIG.TYPES.EVENTS]: 0,
            [CONFIG.TYPES.GAMING]: 0,
            [CONFIG.TYPES.COLLECTOR]: 0,
            [CONFIG.TYPES.CONTENT]: 0
        };
        
        // Score based on game interests
        if (userData.gameInterests) {
            const totalGameScore = Object.values(userData.gameInterests).reduce((sum, score) => sum + score, 0);
            if (totalGameScore > 10) {
                scores[CONFIG.TYPES.GAMING] += 20;
            }
        }
        
        // Score based on topic interests
        if (userData.topicInterests) {
            userData.topicInterests.forEach(interest => {
                const lowerInterest = interest.toLowerCase();
                
                if (lowerInterest.includes('evento') || lowerInterest.includes('presencial')) {
                    scores[CONFIG.TYPES.EVENTS] += 10;
                }
                
                if (lowerInterest.includes('jogo') || lowerInterest.includes('gaming')) {
                    scores[CONFIG.TYPES.GAMING] += 10;
                }
                
                if (lowerInterest.includes('produto') || lowerInterest.includes('colecion')) {
                    scores[CONFIG.TYPES.COLLECTOR] += 10;
                }
                
                if (lowerInterest.includes('conteúdo') || lowerInterest.includes('vídeo') || lowerInterest.includes('bastidor')) {
                    scores[CONFIG.TYPES.CONTENT] += 10;
                }
            });
        }
        
        // Score based on attended events
        if (userData.attendedEvents && userData.attendedEvents.length > 0) {
            scores[CONFIG.TYPES.EVENTS] += userData.attendedEvents.length * 5;
        }
        
        // Score based on products purchased
        if (userData.purchasedProducts && userData.purchasedProducts.length > 0) {
            scores[CONFIG.TYPES.COLLECTOR] += userData.purchasedProducts.length * 5;
        }
        
        // Find highest score
        let highestCategory = CONFIG.TYPES.EVENTS;
        let highestScore = 0;
        
        for (const [category, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                highestCategory = category;
            }
        }
        
        return highestCategory;
    }

    // Enhanced recommendation selection algorithm with context awareness
    function getRelevantRecommendations(count = 3) {
        const primaryCategory = getUserCategory();
        const userData = getUserData();
        const pageContext = sessionData.currentPageContext;
        
        // Select all recommendations as candidates
        let candidateRecommendations = [];
        Object.values(CONFIG.TYPES).forEach(category => {
            candidateRecommendations = candidateRecommendations.concat(recommendationInventory[category]);
        });
        
        // Score recommendations based on various relevance factors
        candidateRecommendations = candidateRecommendations.map(rec => {
            let relevanceScore = 1; // Base score
            
            // 1. Primary category bonus
            if (Object.keys(recommendationInventory).find(cat => recommendationInventory[cat].some(item => item.id === rec.id)) === primaryCategory) {
                relevanceScore += 10;
            }
            
            // 2. Context relevance
            if (pageContext.game && rec.tags.includes(pageContext.game)) {
                relevanceScore += 5;
            }
            
            if (pageContext.section === 'events' && rec.tags.includes('evento')) {
                relevanceScore += 3;
            }
            
            if (pageContext.section === 'store' && rec.tags.some(tag => ['colecionável', 'produto', 'jersey'].includes(tag))) {
                relevanceScore += 3;
            }
            
            if (pageContext.contentType === 'guide' && rec.tags.includes('guide')) {
                relevanceScore += 3;
            }
            
            // 3. User data relevance
            if (userData) {
                // Game preferences
                if (userData.gameInterests) {
                    for (const game in userData.gameInterests) {
                        if (rec.tags.includes(game.toLowerCase()) && userData.gameInterests[game] > 2) {
                            relevanceScore += userData.gameInterests[game];
                        }
                    }
                }
                
                // Topic interests
                if (userData.topicInterests) {
                    userData.topicInterests.forEach(interest => {
                        const lowerInterest = interest.toLowerCase();
                        rec.tags.forEach(tag => {
                            if (tag.includes(lowerInterest) || lowerInterest.includes(tag)) {
                                relevanceScore += 2;
                            }
                        });
                    });
                }
                
                // Avoid recently shown or dismissed recommendations
                const recHistory = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECOMMENDATION_HISTORY) || '{}');
                if (recHistory[rec.id]) {
                    // Reduce score for recently shown recommendations
                    if (recHistory[rec.id].lastShown) {
                        const hoursSinceLastShown = (Date.now() - recHistory[rec.id].lastShown) / (1000 * 60 * 60);
                        if (hoursSinceLastShown < 24) {
                            relevanceScore -= (24 - hoursSinceLastShown) / 3;
                        }
                    }
                    
                    // Heavy penalty for dismissed recommendations
                    if (recHistory[rec.id].dismissed) {
                        relevanceScore -= 20;
                    }
                }
                
                // Boost score for recommendations related to user's purchases
                if (userData.purchasedProducts) {
                    userData.purchasedProducts.forEach(product => {
                        if (rec.tags.some(tag => product.toLowerCase().includes(tag))) {
                            relevanceScore += 3;
                        }
                    });
                }
            }
            
            return {
                ...rec,
                relevanceScore
            };
        });
        
        // Sort by relevance score and filter out negative scores
        candidateRecommendations = candidateRecommendations
            .filter(rec => rec.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        // Take top N recommendations
        return candidateRecommendations.slice(0, count);
    }

    // Track recommendation impressions and clicks
    function trackRecommendationEvent(recId, eventType) {
        const recHistory = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECOMMENDATION_HISTORY) || '{}');
        
        if (!recHistory[recId]) {
            recHistory[recId] = {
                impressions: 0,
                clicks: 0,
                lastShown: 0
            };
        }
        
        if (eventType === 'impression') {
            recHistory[recId].impressions++;
            recHistory[recId].lastShown = Date.now();
        } else if (eventType === 'click') {
            recHistory[recId].clicks++;
        }
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.RECOMMENDATION_HISTORY, JSON.stringify(recHistory));
        
        // Also track for A/B testing
        if (activeABTests.recommendation_effectiveness) {
            abTestingModule.trackEvent('recommendation_effectiveness', eventType, { recId });
        }
    }

    // Generate HTML for a pop-up recommendation
    function generatePopupRecommendationHTML(rec) {
        // Track impression
        trackRecommendationEvent(rec.id, 'impression');
        
        return `
            <div class="furiax-popup-rec" data-rec-id="${rec.id}">
                <div class="popup-overlay"></div>
                <div class="popup-content">
                    <button class="popup-close" onclick="FuriaxRecommendSystem.dismissRecommendation('${rec.id}', true)">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="popup-header">
                        <img src="../img/logo/logoFuriax.png" alt="FURIA" class="popup-logo">
                        <span class="popup-header-text">Recomendado para você</span>
                    </div>
                    
                    <div class="popup-body">
                        <div class="popup-image">
                            <img src="${rec.image || '/api/placeholder/400/250'}" alt="${rec.title}" onerror="this.src='/api/placeholder/400/250'">
                        </div>
                        
                        <div class="popup-info">
                            <h2>${rec.title}</h2>
                            <p>${rec.description}</p>
                            
                            <div class="popup-actions">
                                <button class="popup-cta" onclick="FuriaxRecommendSystem.clickRecommendation('${rec.id}', '${rec.url}')">
                                    ${rec.cta}
                                </button>
                                
                                <button class="popup-secondary" onclick="FuriaxRecommendSystem.saveRecommendation('${rec.id}')">
                                    <i class="far fa-bookmark"></i> Salvar para depois
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="popup-footer">
                        <span class="popup-feedback">
                            Esta recomendação é relevante para você? 
                            <button onclick="FuriaxRecommendSystem.collectFeedback('${rec.id}', 'like')" class="feedback-btn">
                                <i class="far fa-thumbs-up"></i>
                            </button>
                            <button onclick="FuriaxRecommendSystem.collectFeedback('${rec.id}', 'dislike')" class="feedback-btn">
                                <i class="far fa-thumbs-down"></i>
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    // Active A/B tests
    const activeABTests = {
        popup_timing: false,
        popup_design: false,
        recommendation_effectiveness: true
    };

    // Display a pop-up recommendation
    function showPopupRecommendation() {
        // Check if we can show a popup
        if (!canShowPopup()) {
            return false;
        }
        
        // Get relevant recommendation
        const relevantRecommendations = getRelevantRecommendations(1);
        if (relevantRecommendations.length === 0) {
            return false;
        }
        
        const rec = relevantRecommendations[0];
        
        // Create popup element
        const popupContainer = document.createElement('div');
        popupContainer.className = 'furiax-popup-container';
        
        // Check if we have an active A/B test for popup design
        let popupDesign = 'standard';
        if (activeABTests.popup_design) {
            popupDesign = abTestingModule.getVariant('popup_design') || 'standard';
            popupContainer.classList.add(`design-${popupDesign}`);
        }
        
        // Generate HTML
        popupContainer.innerHTML = generatePopupRecommendationHTML(rec);
        
        // Add to DOM
        document.body.appendChild(popupContainer);
        
        // Trigger animation
        setTimeout(() => {
            popupContainer.classList.add('show');
        }, 10);
        
        // Update session data
        sessionData.popupsShown++;
        sessionData.lastPopupTime = Date.now();
        
        // Auto-close timer
        const autoCloseTimeout = setTimeout(() => {
            closePopup(popupContainer);
        }, CONFIG.POPUP_CONFIG.DISPLAY_DURATION);
        
        // Store the timeout ID on the element
        popupContainer.dataset.autoCloseTimeout = autoCloseTimeout;
        
        // Track popup impression for A/B testing
        if (activeABTests.popup_timing || activeABTests.popup_design) {
            abTestingModule.trackEvent(
                activeABTests.popup_timing ? 'popup_timing' : 'popup_design', 
                'impression',
                { recId: rec.id, design: popupDesign }
            );
        }
        
        return true;
    }

    // Check if we can show a popup
    function canShowPopup() {
        const now = Date.now();
        
        // Check if we've reached the max popups per session
        if (sessionData.popupsShown >= CONFIG.POPUP_CONFIG.SESSION_MAX_POPUPS) {
            return false;
        }
        
        // Check if enough time has passed since the last popup
        if (now - sessionData.lastPopupTime < CONFIG.POPUP_CONFIG.MIN_TIME_BETWEEN_POPUPS) {
            return false;
        }
        
        return true;
    }

    // Close a popup
    function closePopup(popupElement) {
        if (!popupElement) return;
        
        // Clear auto-close timeout
        if (popupElement.dataset.autoCloseTimeout) {
            clearTimeout(parseInt(popupElement.dataset.autoCloseTimeout));
        }
        
        // Animate out
        popupElement.classList.remove('show');
        popupElement.classList.add('hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (popupElement.parentNode) {
                popupElement.parentNode.removeChild(popupElement);
            }
        }, 500);
    }

    // Recommendation interaction handlers
    function clickRecommendation(recId, url) {
        console.log(`Recommendation clicked: ${recId}, redirecting to: ${url}`);
        trackRecommendationEvent(recId, 'click');
        
        // Find and close popup
        const popup = document.querySelector(`.furiax-popup-container`);
        if (popup) {
            closePopup(popup);
        }
        
        // Redirect to the recommendation URL
        if (url && url.startsWith('/')) {
            window.location.href = url;
        } else if (url) {
            window.open(url, '_blank');
        }
    }

    function dismissRecommendation(recId, isPopup = false) {
        console.log(`Recommendation dismissed: ${recId}`);
        
        if (isPopup) {
            // Close popup
            const popup = document.querySelector(`.furiax-popup-container`);
            if (popup) {
                closePopup(popup);
            }
        } else {
            // Remove recommendation from DOM
            const recElements = document.querySelectorAll(`[data-rec-id="${recId}"]`);
            recElements.forEach(el => {
                // Find parent with furiax-rec class and remove it
                const recContainer = el.closest('.furiax-rec');
                if (recContainer) {
                    recContainer.remove();
                } else {
                    el.remove();
                }
            });
        }
        
        // Mark as dismissed in storage
        const recHistory = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.RECOMMENDATION_HISTORY) || '{}');
        if (!recHistory[recId]) {
            recHistory[recId] = {};
        }
        
        recHistory[recId].dismissed = true;
        recHistory[recId].dismissedAt = Date.now();
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.RECOMMENDATION_HISTORY, JSON.stringify(recHistory));
    }

    function saveRecommendation(recId) {
        console.log(`Recommendation saved: ${recId}`);
        
        // Find the recommendation data
        let recData = null;
        Object.values(recommendationInventory).forEach(categoryRecs => {
            const found = categoryRecs.find(rec => rec.id === recId);
            if (found) recData = found;
        });
        
        if (!recData) return;
        
        // Save to user's saved recommendations
        const savedRecs = JSON.parse(localStorage.getItem('furiax_saved_recommendations') || '[]');
        
        // Check if already saved
        if (!savedRecs.some(rec => rec.id === recId)) {
            savedRecs.push(recData);
            localStorage.setItem('furiax_saved_recommendations', JSON.stringify(savedRecs));
            
            // Show notification
            showNotification('Salvo nos seus favoritos!', 'success');
            
            // Close popup if it's open
            const popup = document.querySelector(`.furiax-popup-container`);
            if (popup) {
                closePopup(popup);
            }
        } else {
            showNotification('Este item já está nos seus favoritos', 'info');
        }
    }

    // Notification helper
    function showNotification(message, type = 'info') {
        // Check if notification element exists
        let notification = document.getElementById('furiaxNotification');
        
        // Create if doesn't exist
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'furiaxNotification';
            document.body.appendChild(notification);
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                #furiaxNotification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-family: 'Exo 2', sans-serif;
                    font-size: 0.9rem;
                    z-index: 1000;
                    transform: translateY(100px);
                    transition: transform 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                #furiaxNotification.show {
                    transform: translateY(0);
                }
                
                #furiaxNotification.success {
                    background: linear-gradient(90deg, #00cc66, #00a651);
                }
                
                #furiaxNotification.error {
                    background: linear-gradient(90deg, #ff3b5c, #ff1f43);
                }
                
                #furiaxNotification.info {
                    background: linear-gradient(90deg, #1e90ff, #0078e7);
                }
                
                #furiaxNotification.warning {
                    background: linear-gradient(90deg, #ffc107, #ff9800);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set message and type
        let icon;
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
                break;
        }
        
        notification.innerHTML = `${icon} <span>${message}</span>`;
        notification.className = type;
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
            
            // Hide after 3 seconds
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }, 100);
    }

    // User feedback system
    function collectFeedback(recId, type) {
        const feedback = localStorage.getItem('furiax_rec_feedback') || '{}';
        const feedbackObj = JSON.parse(feedback);
        
        if (!feedbackObj[recId]) {
            feedbackObj[recId] = {};
        }
        
        feedbackObj[recId][type] = true;
        feedbackObj[recId].timestamp = Date.now();
        
        localStorage.setItem('furiax_rec_feedback', JSON.stringify(feedbackObj));
        
        // Update user preferences based on feedback
        updateUserPreferences(recId, type);
        
        // Show confirmation
        showNotification(type === 'like' ? 'Obrigado pelo seu feedback!' : 'Entendido! Mostraremos menos recomendações como esta.', type === 'like' ? 'success' : 'info');
        
        // Close popup if open
        const popup = document.querySelector(`.furiax-popup-container`);
        if (popup) {
            closePopup(popup);
        }
    }
    
    // Update user preferences based on feedback
    function updateUserPreferences(recId, interactionType) {
        // Find the recommendation data
        let recData = null;
        Object.values(recommendationInventory).forEach(categoryRecs => {
            const found = categoryRecs.find(rec => rec.id === recId);
            if (found) recData = found;
        });
        
        if (!recData) return;
        
        // Get current user data
        const userData = getUserData() || {};
        
        // Initialize preference structure if needed
        if (!userData.recPreferences) {
            userData.recPreferences = {
                likedTags: [],
                dislikedTags: [],
                likedCategories: [],
                dislikedCategories: []
            };
        }
        
        // Update based on interaction type
        if (interactionType === 'like' || interactionType === 'click') {
            // Add to liked tags
            recData.tags.forEach(tag => {
                if (!userData.recPreferences.likedTags.includes(tag)) {
                    userData.recPreferences.likedTags.push(tag);
                }
                
                // Remove from disliked if present
                const dislikedIndex = userData.recPreferences.dislikedTags.indexOf(tag);
                if (dislikedIndex > -1) {
                    userData.recPreferences.dislikedTags.splice(dislikedIndex, 1);
                }
            });
            
            // Add category to liked
            const recCategory = Object.keys(recommendationInventory).find(cat => 
                recommendationInventory[cat].some(item => item.id === recId)
            );
            
            if (recCategory && !userData.recPreferences.likedCategories.includes(recCategory)) {
                userData.recPreferences.likedCategories.push(recCategory);
                
                // Remove from disliked if present
                const dislikedCatIndex = userData.recPreferences.dislikedCategories.indexOf(recCategory);
                if (dislikedCatIndex > -1) {
                    userData.recPreferences.dislikedCategories.splice(dislikedCatIndex, 1);
                }
            }
        } else if (interactionType === 'dislike' || interactionType === 'dismiss') {
            // Add to disliked tags
            recData.tags.forEach(tag => {
                if (!userData.recPreferences.dislikedTags.includes(tag)) {
                    userData.recPreferences.dislikedTags.push(tag);
                }
                
                // Remove from liked if present
                const likedIndex = userData.recPreferences.likedTags.indexOf(tag);
                if (likedIndex > -1) {
                    userData.recPreferences.likedTags.splice(likedIndex, 1);
                }
            });
            
            // Add category to disliked
            const recCategory = Object.keys(recommendationInventory).find(cat => 
                recommendationInventory[cat].some(item => item.id === recId)
            );
            
            if (recCategory && !userData.recPreferences.dislikedCategories.includes(recCategory)) {
                userData.recPreferences.dislikedCategories.push(recCategory);
                
                // Remove from liked if present
                const likedCatIndex = userData.recPreferences.likedCategories.indexOf(recCategory);
                if (likedCatIndex > -1) {
                    userData.recPreferences.likedCategories.splice(likedCatIndex, 1);
                }
            }
        }
        
        // Save updated user data
        localStorage.setItem(CONFIG.STORAGE_KEYS.FAN_DATA, JSON.stringify(userData));
    }
    
    // A/B Testing functionality
    const abTestingModule = (function() {
        const STORAGE_KEY = 'furiax_ab_tests';
        
        // Initialize a new test if not already running
        function initTest(testName, variants, userSegment = null) {
            // Get current tests
            const tests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            
            // Check if user is already in this test
            if (tests[testName]) {
                // Return the existing variant
                return tests[testName].variant;
            }
            
            // Check if user is in the target segment
            if (userSegment && !isUserInSegment(userSegment)) {
                return null;
            }
            
            // Assign a random variant
            const randomIndex = Math.floor(Math.random() * variants.length);
            const selectedVariant = variants[randomIndex];
            
            // Save test assignment
            tests[testName] = {
                variant: selectedVariant,
                assignedAt: Date.now(),
                events: []
            };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
            
            // Return the selected variant
            return selectedVariant;
        }
        
        // Check if user is in target segment
        function isUserInSegment(segment) {
            const userData = getUserData();
            if (!userData) return false;
            
            // Example segment matching logic
            switch (segment) {
                case 'new_users':
                    // User registered less than 30 days ago
                    return userData.registeredAt && 
                           (Date.now() - userData.registeredAt < 30 * 24 * 60 * 60 * 1000);
                case 'active_users':
                    // User has logged in at least 5 times in the last 2 weeks
                    return userData.loginHistory && 
                           userData.loginHistory.filter(login => 
                               login > Date.now() - 14 * 24 * 60 * 60 * 1000
                           ).length >= 5;
                case 'gamers':
                    // User has strong gaming interests
                    return userData.gameInterests && 
                           Object.values(userData.gameInterests).some(score => score > 8);
                default:
                    return true; // No segment restriction
            }
        }
        
        // Track an event for a test
        function trackEvent(testName, eventName, value = null) {
            const tests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            
            if (!tests[testName]) return;
            
            // Add event
            tests[testName].events.push({
                event: eventName,
                value: value,
                timestamp: Date.now()
            });
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
        }
        
        // Get user's variant for a test
        function getVariant(testName) {
            const tests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return tests[testName] ? tests[testName].variant : null;
        }
        
        return {
            initTest,
            trackEvent,
            getVariant
        };
    })();
    
    // Setup popup trigger events
    function setupPopupTriggers() {
        const config = CONFIG.POPUP_CONFIG;
        
        // 1. Trigger after delay
        setTimeout(() => {
            showPopupRecommendation();
        }, config.DISPLAY_DELAY);
        
        // 2. Trigger on scroll depth
        let scrollHandler = function() {
            // Calculate scroll depth
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const scrollDepth = scrollTop / (scrollHeight - clientHeight);
            
            // Update max scroll depth
            sessionData.maxScrollDepth = Math.max(sessionData.maxScrollDepth, scrollDepth);
            
            // Check if we should show popup
            if (scrollDepth > config.SCROLL_DEPTH_TRIGGER && canShowPopup()) {
                showPopupRecommendation();
            }
        };
        
        // Debounce scroll handler
        let debounceTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(scrollHandler, 200);
        });
        
        // 3. Trigger on exit intent
        if (config.EXIT_INTENT_ENABLED) {
            const exitIntentHandler = (e) => {
                // Check if mouse leaves through top of page
                if (e.clientY <= 0 && canShowPopup()) {
                    // Only trigger after some engagement with the page
                    if (sessionData.userInteractions > 2) {
                        showPopupRecommendation();
                    }
                }
            };
            
            document.addEventListener('mouseleave', exitIntentHandler);
        }
        
        // 4. Track user interactions
        const interactionHandler = () => {
            sessionData.userInteractions++;
        };
        
        // Track clicks
        document.addEventListener('click', interactionHandler);
        // Track form interactions
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('focus', interactionHandler);
        });
    }
    
    // Add required CSS styles
    function addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* Popup Styles */
            .furiax-popup-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease-out;
            }
            
            .furiax-popup-container.show {
                opacity: 1;
                pointer-events: auto;
                animation: popupFadeIn 0.4s ease-out forwards;
            }
            
            .furiax-popup-container.hide {
                opacity: 0;
                pointer-events: none;
                animation: popupFadeOut 0.3s ease-in forwards;
            }
            
            .popup-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }
            
            .popup-content {
                position: relative;
                width: 90%;
                max-width: 550px;
                background: linear-gradient(145deg, #111, #181818);
                border-radius: 16px;
                overflow: hidden;
                color: white;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                border: 1px solid #333;
                transform: translateY(20px);
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                z-index: 1;
            }
            
            .furiax-popup-container.show .popup-content {
                transform: translateY(0);
            }
            
            .popup-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;
                z-index: 2;
                transition: all 0.2s;
            }
            
            .popup-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }
            
            .popup-header {
                padding: 16px 20px;
                background: rgba(30, 144, 255, 0.1);
                display: flex;
                align-items: center;
                border-bottom: 1px solid #333;
            }
            
            .popup-logo {
                width: 24px;
                height: 24px;
                margin-right: 10px;
            }
            
            .popup-header-text {
                font-family: 'Orbitron', sans-serif;
                font-size: 14px;
                color: #1e90ff;
                letter-spacing: 0.5px;
            }
            
            .popup-body {
                display: flex;
                flex-direction: column;
                padding: 0;
            }
            
            .popup-image {
                width: 100%;
                height: 200px;
                overflow: hidden;
            }
            
            .popup-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
            }
            
            .popup-content:hover .popup-image img {
                transform: scale(1.05);
            }
            
            .popup-info {
                padding: 20px;
            }
            
            .popup-info h2 {
                font-family: 'Orbitron', sans-serif;
                margin: 0 0 10px 0;
                font-size: 22px;
                color: white;
                letter-spacing: 0.5px;
            }
            
            .popup-info p {
                margin: 0 0 20px 0;
                font-size: 16px;
                line-height: 1.5;
                color: #bbb;
            }
            
            .popup-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 15px;
            }
            
            .popup-cta {
                background: linear-gradient(90deg, #1e90ff, #00bfff);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 20px;
                font-family: 'Orbitron', sans-serif;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-weight: 600;
                box-shadow: 0 4px 10px rgba(30, 144, 255, 0.3);
            }
            
            .popup-cta:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(30, 144, 255, 0.4);
            }
            
            .popup-secondary {
                background: transparent;
                color: #999;
                border: 1px solid #444;
                border-radius: 8px;
                padding: 10px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .popup-secondary:hover {
                background: rgba(255, 255, 255, 0.05);
                color: #ccc;
                border-color: #666;
            }
            
            .popup-footer {
                padding: 12px 20px;
                background: rgba(0, 0, 0, 0.2);
                border-top: 1px solid #333;
                font-size: 12px;
                color: #777;
                display: flex;
                justify-content: center;
            }
            
            .popup-feedback {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .feedback-btn {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                font-size: 16px;
                padding: 5px;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .feedback-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            /* Animation keyframes */
            @keyframes popupFadeIn {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }
            
            @keyframes popupFadeOut {
                0% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                }
            }
            
            /* A/B Testing Variants */
            /* 1. Minimalist design */
            .design-minimalist .popup-content {
                background: rgba(20, 20, 20, 0.95);
                border: none;
                border-radius: 12px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
            }
            
            .design-minimalist .popup-header {
                background: none;
                border-bottom: none;
                padding-bottom: 0;
            }
            
            .design-minimalist .popup-info h2 {
                font-family: 'Inter', sans-serif;
                font-weight: 700;
            }
            
            .design-minimalist .popup-cta {
                background: white;
                color: black;
                font-family: 'Inter', sans-serif;
                font-weight: 600;
                box-shadow: none;
            }
            
            .design-minimalist .popup-footer {
                background: none;
                border-top: none;
            }
            
            /* 2. Modern design */
            .design-modern .popup-content {
                background: linear-gradient(135deg, #1e1e2f, #2d2d44);
                border: none;
                border-radius: 20px;
            }
            
            .design-modern .popup-header {
                background: rgba(30, 144, 255, 0.2);
                border-bottom: none;
                padding: 20px;
            }
            
            .design-modern .popup-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                padding: 0;
            }
            
            .design-modern .popup-image {
                height: 100%;
                grid-row: span 1;
            }
            
            .design-modern .popup-info {
                padding: 25px;
            }
            
            .design-modern .popup-cta {
                background: linear-gradient(90deg, #ff3b5c, #ff8847);
                border-radius: 30px;
            }
            
            .design-modern .popup-secondary {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 30px;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .popup-content {
                    width: 95%;
                    max-width: 450px;
                }
                
                .design-modern .popup-body {
                    grid-template-columns: 1fr;
                }
                
                .design-modern .popup-image {
                    height: 180px;
                }
            }
            
            @media (max-width: 480px) {
                .popup-body {
                    flex-direction: column;
                }
                
                .popup-image {
                    height: 160px;
                }
                
                .popup-info h2 {
                    font-size: 18px;
                }
                
                .popup-info p {
                    font-size: 14px;
                }
                
                .popup-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Initialize the system
    function init() {
        console.log('🚀 Inicializando FURIAX Recommend System Pop-ups...');
        
        // Add required CSS
        addStyles();
        
        // Setup popup triggers
        setupPopupTriggers();
        
        // Initialize A/B tests
        if (activeABTests.popup_design) {
            const designVariant = abTestingModule.initTest(
                'popup_design',
                ['standard', 'minimalist', 'modern'],
                'active_users'
            );
            console.log(`A/B Test: Popup design variant: ${designVariant || 'not assigned'}`);
        }
        
        if (activeABTests.popup_timing) {
            const timingVariant = abTestingModule.initTest(
                'popup_timing',
                ['immediate', 'delayed', 'scroll_based', 'exit_intent'],
                null
            );
            console.log(`A/B Test: Popup timing variant: ${timingVariant || 'not assigned'}`);
        }
        
        console.log('✅ FURIAX Recommend System Pop-ups inicializado com sucesso!');
    }
    
    // Public methods
    return {
        init,
        showPopupRecommendation,
        clickRecommendation,
        dismissRecommendation,
        saveRecommendation,
        collectFeedback,
        getUserCategory,
        abTesting: abTestingModule
    };
})();

// Initialize the system on page load
document.addEventListener('DOMContentLoaded', function() {
    FuriaxRecommendSystem.init();
    
    // Set up A/B test for popup timing strategy
    if (FuriaxRecommendSystem.abTesting) {
        const timingVariant = FuriaxRecommendSystem.abTesting.initTest(
            'popup_timing',
            ['immediate', 'delayed', 'scroll_based', 'exit_intent'],
            'active_users'
        );
        
        if (timingVariant) {
            // Apply timing strategy based on variant
            const body = document.body;
            body.classList.add(`popup-timing-${timingVariant}`);
            
            // Track impression
            FuriaxRecommendSystem.abTesting.trackEvent('popup_timing', 'assigned');
        }
    }
});

// Export to global scope for external access
window.FuriaxRecommendSystem = FuriaxRecommendSystem;