// Adicionar tracking manual (para elementos que já existem na página)
function addManualTracking() {
    // Publicar post
    const publishPostBtn = document.getElementById('publishPostBtn');
    if (publishPostBtn) {
        const originalClickHandler = publishPostBtn.onclick;
        publishPostBtn.onclick = function(e) {
            // Executar handler original
            if (originalClickHandler) {
                originalClickHandler.call(this, e);
            }
            
            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('postCreated'));
        };
    }
    
    // Curtir post
    document.addEventListener('click', (e) => {
        if (e.target.closest('.post-action-btn:not(.comment-btn):not(.share-btn)')) {
            // Verificar se é uma curtida (não um descurtir)
            const button = e.target.closest('.post-action-btn');
            if (!button.classList.contains('liked')) {
                // Disparar evento personalizado
                document.dispatchEvent(new CustomEvent('postLiked'));
            }
        }
    });
    
    // Comentar em post
    document.addEventListener('click', (e) => {
        if (e.target.closest('.comment-submit')) {
            // Obter input de comentário
            const commentInput = e.target.closest('.comment-form').querySelector('.comment-input');
            
            // Verificar se o comentário não está vazio
            if (commentInput && commentInput.value.trim()) {
                // Disparar evento personalizado
                document.dispatchEvent(new CustomEvent('commentAdded'));
            }
        }
    });
    
    // Votar em enquete
    document.addEventListener('click', (e) => {
        if (e.target.closest('.poll-option:not(.voted)')) {
            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('pollVoted'));
        }
    });
    
    // Interação com chat
    const aiSendBtn = document.getElementById('aiSendBtn');
    if (aiSendBtn) {
        const originalClickHandler = aiSendBtn.onclick;
        aiSendBtn.onclick = function(e) {
            // Executar handler original
            if (originalClickHandler) {
                originalClickHandler.call(this, e);
            }
            
            // Obter input do chat
            const chatInput = document.getElementById('aiInput');
            
            // Verificar se a mensagem não está vazia
            if (chatInput && chatInput.value.trim()) {
                // Disparar evento personalizado
                document.dispatchEvent(new CustomEvent('chatInteraction'));
            }
        };
    }
    
    // Completar minigame - adicionar listeners aos botões de jogo
    document.addEventListener('click', (e) => {
        // Botões do quiz
        if (e.target.id === 'finishQuizBtn') {
            const score = parseInt(e.target.getAttribute('data-score') || '0');
            const maxScore = parseInt(e.target.getAttribute('data-max-score') || '1');
            
            // Verificar se foi perfeito
            if (score === maxScore) {
                document.dispatchEvent(new CustomEvent('quizPerfect'));
            }
            
            document.dispatchEvent(new CustomEvent('minigameCompleted', {
                detail: {
                    gameId: 'quiz',
                    score: score
                }
            }));
        }
        
        // Outros jogos
        const gameButtons = ['finishMemoryBtn', 'finishReactionBtn', 'finishWordBtn', 'submitPredictionsBtn'];
        gameButtons.forEach(btnId => {
            if (e.target.id === btnId) {
                let gameId = '';
                let score = 0;
                
                // Identificar jogo por ID
                if (btnId === 'finishMemoryBtn') {
                    gameId = 'memory';
                    score = parseInt(e.target.getAttribute('data-score') || '0');
                } else if (btnId === 'finishReactionBtn') {
                    gameId = 'reaction';
                    score = parseInt(e.target.getAttribute('data-score') || '0');
                } else if (btnId === 'finishWordBtn') {
                    gameId = 'word';
                    score = 25;
                } else if (btnId === 'submitPredictionsBtn') {
                    gameId = 'prediction';
                    score = 15;
                }
                
                if (gameId) {
                    document.dispatchEvent(new CustomEvent('minigameCompleted', {
                        detail: {
                            gameId: gameId,
                            score: score
                        }
                    }));
                }
            }
        });
    });
}

// Verificar contagem de posts
function checkPostsCount() {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    // Obter posts do usuário
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    const userPosts = posts.filter(post => post.author === user.username);
    
    // Verificar conquistas
    if (userPosts.length >= 10) {
        unlockAchievement('posts_10');
    }
}

// Verificar contagem de likes
function checkLikesCount() {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    // Obter likes do usuário (simulado)
    // Em uma implementação real, teríamos um contador de likes no perfil do usuário
    const userLikes = user.totalLikes || 0;
    
    // Incrementar contador
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
        // Inicializar se não existir
        if (!users[userIndex].totalLikes) {
            users[userIndex].totalLikes = 0;
        }
        
        // Incrementar
        users[userIndex].totalLikes += 1;
        
        // Salvar
        saveToStorage(STORAGE_KEYS.USERS, users);
        
        // Atualizar usuário atual
        const { password, ...safeUser } = users[userIndex];
        saveToStorage(STORAGE_KEYS.CURRENT_USER, safeUser);
        
        // Verificar conquistas
        if (users[userIndex].totalLikes >= 100) {
            unlockAchievement('likes_100');
        }
    }
}

// Verificar contagem de comentários
function checkCommentsCount() {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    // Obter comentários do usuário (simulado)
    // Em uma implementação real, teríamos um contador de comentários no perfil do usuário
    const userComments = user.totalComments || 0;
    
    // Incrementar contador
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
        // Inicializar se não existir
        if (!users[userIndex].totalComments) {
            users[userIndex].totalComments = 0;
        }
        
        // Incrementar
        users[userIndex].totalComments += 1;
        
        // Salvar
        saveToStorage(STORAGE_KEYS.USERS, users);
        
        // Atualizar usuário atual
        const { password, ...safeUser } = users[userIndex];
        saveToStorage(STORAGE_KEYS.CURRENT_USER, safeUser);
        
        // Verificar conquistas
        if (users[userIndex].totalComments >= 50) {
            unlockAchievement('comments_50');
        }
    }
}

// Verificar completude do perfil
function checkProfileCompletion(percentage) {
    // Atualizar progresso da missão
    const missions = getFromStorage(GAMIFICATION_KEYS.MISSIONS, []);
    const missionIndex = missions.findIndex(mission => mission.id === 'ongoing_profile');
    
    if (missionIndex !== -1) {
        missions[missionIndex].progress = percentage;
        
        // Verificar se completou a missão
        if (percentage >= 100 && !missions[missionIndex].completed) {
            missions[missionIndex].completed = true;
            addUserXP(missions[missionIndex].xpReward);
            showMissionCompleteNotification(missions[missionIndex]);
            playSound('mission');
            
            // Desbloquear conquista
            unlockAchievement('profile_complete');
        }
        
        // Salvar missões
        saveToStorage(GAMIFICATION_KEYS.MISSIONS, missions);
    }
}
function checkPosts// Verificar conquistas de nível
function checkLevelAchievements(level) {
    if (level >= 10) {
        unlockAchievement('level_10');
    }
    
    if (level >= 25) {
        unlockAchievement('level_25');
    }
    
    if (level >= 50) {
        unlockAchievement('level_50');
    }
}

// Desbloquear conquista
function unlockAchievement(achievementId) {
    const user = getCurrentUser();
    if (!user || !user.id) return false;
    
    // Obter conquistas
    const achievements = getFromStorage(GAMIFICATION_KEYS.ACHIEVEMENTS, []);
    
    // Encontrar conquista
    const achievementIndex = achievements.findIndex(achievement => achievement.id === achievementId);
    
    if (achievementIndex === -1) {
        console.error(`Conquista não encontrada: ${achievementId}`);
        return false;
    }
    
    // Verificar se já desbloqueou
    if (achievements[achievementIndex].unlocked) return false;
    
    // Desbloquear
    achievements[achievementIndex].unlocked = true;
    achievements[achievementIndex].unlockDate = Date.now();
    
    // Salvar conquistas
    saveToStorage(GAMIFICATION_KEYS.ACHIEVEMENTS, achievements);
    
    // Conceder recompensa
    addUserXP(achievements[achievementIndex].xpReward);
    
    // Mostrar notificação
    showAchievementUnlockedNotification(achievements[achievementIndex]);
    
    // Efeito sonoro
    playSound('achievement');
    
    return true;
}

// Mostrar notificação de conquista desbloqueada
function showAchievementUnlockedNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; background: linear-gradient(45deg, #111, #181818); color: white; border-radius: 10px; padding: 15px; z-index: 1000; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); display: flex; align-items: center; gap: 15px; min-width: 300px; max-width: 500px; animation: achievementSlideIn 0.5s ease-out forwards;">
            <div style="width: 50px; height: 50px; background: ${achievement.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="${achievement.icon}" style="font-size: 1.5rem; color: white;"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-size: 0.9rem; color: #aaa; margin-bottom: 5px;">Conquista desbloqueada!</div>
                <div style="font-size: 1.1rem; color: ${achievement.color}; font-weight: bold; margin-bottom: 5px;">${achievement.title}</div>
                <div style="font-size: 0.8rem; color: #ddd;">${achievement.description}</div>
            </div>
            <div style="padding-left: 10px; border-left: 1px solid #333; color: #1e90ff; font-weight: bold; font-family: 'Orbitron', sans-serif; flex-shrink: 0;">
                +${achievement.xpReward} XP
            </div>
        </div>
    `;
    
    // Criar estilo para animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes achievementSlideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar ao corpo
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'achievementSlideOut 0.5s ease-out forwards';
        
        // Adicionar animação de saída
        const exitStyle = document.createElement('style');
        exitStyle.textContent = `
            @keyframes achievementSlideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
        `;
        document.head.appendChild(exitStyle);
        
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// ======================================================
// EVENTOS PARA TRACKING DE AÇÕES
// ======================================================

// Configurar eventos para tracking de ações
function setupGamificationEvents() {
    // Post
    document.addEventListener('postCreated', (e) => {
        // Atualizar progresso da missão
        updateMissionProgress('daily_post');
        
        // Verificar conquistas de posts
        checkPostsCount();
    });
    
    // Like
    document.addEventListener('postLiked', (e) => {
        // Atualizar progresso da missão
        updateMissionProgress('daily_like');
        
        // Verificar conquistas de likes
        checkLikesCount();
    });
    
    // Comment
    document.addEventListener('commentAdded', (e) => {
        // Atualizar progresso da missão
        updateMissionProgress('daily_comment');
        
        // Verificar conquistas de comentários
        checkCommentsCount();
    });
    
    // Poll Vote
    document.addEventListener('pollVoted', (e) => {
        // Atualizar progresso da missão
        updateMissionProgress('weekly_poll');
    });
    
    // Chat Interaction
    document.addEventListener('chatInteraction', (e) => {
        // Atualizar progresso da missão
        updateMissionProgress('weekly_chat');
    });
    
    // Profile Update
    document.addEventListener('profileUpdated', (e) => {
        // Verificar conquista de perfil completo
        checkProfileCompletion(e.detail.completionPercentage);
    });
    
    // Minigame Completed
    document.addEventListener('minigameCompleted', (e) => {
        if (e.detail && e.detail.gameId) {
            // Registrar jogo completado
            registerCompletedGame(e.detail.gameId, e.detail.score);
            
            // Verificar missão de jogos
            checkDailyGamesProgress();
        }
    });
    
    // Quiz Perfect
    document.addEventListener('quizPerfect', (e) => {
        // Atualizar missão de quiz perfeito
        updateMissionProgress('perfect_quiz');
    });
    
    // Adicionar tracking manual aos elementos existentes
    addManualTracking();
}// Gerar lista de missões por tipo
function generateMissionsList(type) {
    const missions = getFromStorage(GAMIFICATION_KEYS.MISSIONS, []);
    const filteredMissions = missions.filter(mission => mission.type === type);
    
    if (filteredMissions.length === 0) {
        return `<div style="text-align: center; padding: 30px; color: #777;">Nenhuma missão disponível no momento.</div>`;
    }
    
    return filteredMissions.map(mission => {
        const progress = mission.progress;
        const goal = mission.goal;
        const percentage = Math.floor((progress / goal) * 100);
        
        return `
            <div class="mission-card ${mission.completed ? 'completed' : ''}">
                <div class="mission-icon" style="background: rgba(${hexToRgb(mission.color)}, 0.1); color: ${mission.color};">
                    <i class="${mission.icon}"></i>
                </div>
                <div class="mission-info">
                    <div class="mission-title">${mission.title}</div>
                    <div class="mission-description">${mission.description}</div>
                    <div class="mission-progress-bar">
                        <div class="mission-progress-fill" style="width: ${percentage}%; background: ${mission.color};"></div>
                    </div>
                    <div class="mission-progress-text">
                        <div>${progress}/${goal}</div>
                        <div>${percentage}%</div>
                    </div>
                </div>
                <div class="mission-reward">
                    <div style="margin-bottom: 5px;">
                        <i class="fas fa-award" style="color: ${mission.color};"></i>
                    </div>
                    <div style="color: #1e90ff; font-family: 'Orbitron', sans-serif;">+${mission.xpReward} XP</div>
                </div>
            </div>
        `;
    }).join('');
}

// ======================================================
// SISTEMA DE CONQUISTAS
// ======================================================

// Inicializar conquistas
function initAchievements() {
    // Obter conquistas existentes ou criar novas
    const achievements = getFromStorage(GAMIFICATION_KEYS.ACHIEVEMENTS, null);
    
    if (!achievements) {
        // Criar conquistas padrão
        const defaultAchievements = [
            // Conquistas de nível
            {
                id: 'level_10',
                title: 'Começando a jornada',
                description: 'Alcance o nível 10',
                category: 'level',
                icon: 'fas fa-star',
                color: '#ffc107',
                xpReward: 200,
                unlocked: false,
                unlockDate: null
            },
            {
                id: 'level_25',
                title: 'Fã dedicado',
                description: 'Alcance o nível 25',
                category: 'level',
                icon: 'fas fa-star',
                color: '#ff9800',
                xpReward: 500,
                unlocked: false,
                unlockDate: null
            },
            {
                id: 'level_50',
                title: 'Membro de elite',
                description: 'Alcance o nível 50',
                category: 'level',
                icon: 'fas fa-star',
                color: '#ff3b5c',
                xpReward: 1000,
                unlocked: false,
                unlockDate: null
            },
            // Conquistas de engajamento
            {
                id: 'posts_10',
                title: 'Comunicador',
                description: 'Faça 10 publicações na comunidade',
                category: 'engagement',
                icon: 'fas fa-pen',
                color: '#1e90ff',
                xpReward: 150,
                unlocked: false,
                unlockDate: null
            },
            {
                id: 'comments_50',
                title: 'Conversador',
                description: 'Faça 50 comentários em publicações',
                category: 'engagement',
                icon: 'fas fa-comment',
                color: '#00cc66',
                xpReward: 250,
                unlocked: false,
                unlockDate: null
            },
            {
                id: 'likes_100',
                title: 'Apreciador',
                description: 'Curta 100 publicações na comunidade',
                category: 'engagement',
                icon: 'fas fa-heart',
                color: '#ff3b5c',
                xpReward: 200,
                unlocked: false,
                unlockDate: null
            },
            // Conquistas de streak
            {
                id: 'streak_week',
                title: 'Presença constante',
                description: 'Faça login por 7 dias consecutivos',
                category: 'streak',
                icon: 'fas fa-calendar-check',
                color: '#00cc66',
                xpReward: 150,
                unlocked: false,
                unlockDate: null
            },
            {
                id: 'streak_month',
                title: 'Fã dedicado',
                description: 'Faça login por 30 dias consecutivos',
                category: 'streak',
                icon: 'fas fa-calendar-alt',
                color: '#9c27b0',
                xpReward: 500,
                unlocked: false,
                unlockDate: null
            },
            // Conquistas de perfil
            {
                id: 'profile_complete',
                title: 'Identidade FURIA',
                description: 'Complete 100% do seu perfil',
                category: 'profile',
                icon: 'fas fa-user-edit',
                color: '#1e90ff',
                xpReward: 200,
                unlocked: false,
                unlockDate: null
            },
            // Conquistas de rank
            {
                id: 'rank_furioso',
                title: 'Força da FURIA',
                description: 'Alcance o rank de Furioso',
                category: 'rank',
                icon: 'fas fa-bolt',
                color: '#ff3b5c',
                xpReward: 300,
                unlocked: false,
                unlockDate: null
            },
            {
                id: 'rank_elite_furia',
                title: 'Elite da comunidade',
                description: 'Alcance o rank de Elite FURIA',
                category: 'rank',
                icon: 'fas fa-star',
                color: '#1e90ff',
                xpReward: 500,
                unlocked: false,
                unlockDate: null
            },
            // Conquistas de minigames
            {
                id: 'quiz_perfect',
                title: 'Gênio FURIA',
                description: 'Acerte todas as perguntas de um Quiz FURIA',
                category: 'games',
                icon: 'fas fa-award',
                color: '#ffc107',
                xpReward: 100,
                unlocked: false,
                unlockDate: null
            },
            {
                id: 'daily_all_games',
                title: 'Maratonista de Jogos',
                description: 'Complete todos os mini-games disponíveis em um único dia',
                category: 'games',
                icon: 'fas fa-gamepad',
                color: '#00cc66',
                xpReward: 150,
                unlocked: false,
                unlockDate: null
            }
        ];
        
        // Salvar conquistas
        saveToStorage(GAMIFICATION_KEYS.ACHIEVEMENTS, defaultAchievements);
    } else {
        // Verificar se existem novas conquistas para adicionar
        const currentAchievementIds = achievements.map(a => a.id);
        const newAchievements = [
            {
                id: 'quiz_perfect',
                title: 'Gênio FURIA',
                description: 'Acerte todas as perguntas de um Quiz FURIA',
                category: 'games',
                icon: 'fas fa-award',
                color: '#ffc107',
                xpReward: 100,
                unlocked: false,
                unlockDate: null
            },
            {
                id: 'daily_all_games',
                title: 'Maratonista de Jogos',
                description: 'Complete todos os mini-games disponíveis em um único dia',
                category: 'games',
                icon: 'fas fa-gamepad',
                color: '#00cc66',
                xpReward: 150,
                unlocked: false,
                unlockDate: null
            }
        ];
        
        // Adicionar novas conquistas caso não existam
        let updatedAchievements = [...achievements];
        newAchievements.forEach(achievement => {
            if (!currentAchievementIds.includes(achievement.id)) {
                updatedAchievements.push(achievement);
            }
        });
        
        // Salvar conquistas atualizadas se mudaram
        if (updatedAchievements.length > achievements.length) {
            saveToStorage(GAMIFICATION_KEYS.ACHIEVEMENTS, updatedAchievements);
        }
    }
}// Mostrar página de missões
function showMissionsPage() {
    // Criar página
    const missionsPage = document.createElement('div');
    missionsPage.className = 'missions-page';
    missionsPage.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); z-index: 1500; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease-out;">
            <div style="background: linear-gradient(145deg, #111, #181818); border-radius: 15px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 30px; position: relative; animation: slideIn 0.4s ease-out;">
                <button id="closeMissionsPage" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #777; font-size: 1.5rem; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
                
                <h2 style="font-family: 'Orbitron', sans-serif; color: #1e90ff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-tasks"></i> Missões FURIAX
                </h2>
                
                <div style="margin-bottom: 20px; display: flex; gap: 10px;">
                    <button class="mission-tab active" data-tab="daily" style="flex: 1; padding: 10px; border: none; background: rgba(30, 144, 255, 0.1); color: #1e90ff; border-radius: 10px; cursor: pointer; font-family: 'Orbitron', sans-serif;">Diárias</button>
                    <button class="mission-tab" data-tab="weekly" style="flex: 1; padding: 10px; border: none; background: rgba(255, 255, 255, 0.05); color: #aaa; border-radius: 10px; cursor: pointer; font-family: 'Orbitron', sans-serif;">Semanais</button>
                    <button class="mission-tab" data-tab="ongoing" style="flex: 1; padding: 10px; border: none; background: rgba(255, 255, 255, 0.05); color: #aaa; border-radius: 10px; cursor: pointer; font-family: 'Orbitron', sans-serif;">Contínuas</button>
                </div>
                
                <div class="mission-content active" id="daily-missions">
                    <div class="mission-list">
                        ${generateMissionsList('daily')}
                    </div>
                </div>
                
                <div class="mission-content" id="weekly-missions" style="display: none;">
                    <div class="mission-list">
                        ${generateMissionsList('weekly')}
                    </div>
                </div>
                
                <div class="mission-content" id="ongoing-missions" style="display: none;">
                    <div class="mission-list">
                        ${generateMissionsList('ongoing')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Criar estilo para animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .mission-tab {
            transition: all 0.3s;
        }
        
        .mission-tab:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ddd !important;
        }
        
        .mission-tab.active {
            background: rgba(30, 144, 255, 0.1) !important;
            color: #1e90ff !important;
        }
        
        .mission-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        
        .mission-card:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateX(5px);
        }
        
        .mission-card.completed {
            opacity: 0.7;
        }
        
        .mission-card.completed::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 204, 102, 0.1);
            pointer-events: none;
        }
        
        .mission-icon {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        .mission-info {
            flex: 1;
        }
        
        .mission-title {
            font-size: 1.1rem;
            font-weight: bold;
            margin-bottom: 5px;
            color: #ddd;
        }
        
        .mission-description {
            font-size: 0.9rem;
            color: #aaa;
            margin-bottom: 10px;
        }
        
        .mission-progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            margin-bottom: 5px;
            overflow: hidden;
        }
        
        .mission-progress-fill {
            height: 100%;
            border-radius: 4px;
        }
        
        .mission-progress-text {
            font-size: 0.8rem;
            color: #777;
            display: flex;
            justify-content: space-between;
        }
        
        .mission-reward {
            font-size: 0.9rem;
            font-weight: bold;
            color: #1e90ff;
            text-align: right;
            white-space: nowrap;
            margin-left: auto;
            padding-left: 15px;
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar à página
    document.body.appendChild(missionsPage);
    
    // Configurar eventos
    document.getElementById('closeMissionsPage').addEventListener('click', () => {
        missionsPage.style.animation = 'fadeOut 0.3s ease-out forwards';
        
        // Adicionar animação de saída
        const exitStyle = document.createElement('style');
        exitStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(exitStyle);
        
        setTimeout(() => {
            missionsPage.remove();
        }, 300);
    });
    
    // Eventos das abas
    const missionTabs = document.querySelectorAll('.mission-tab');
    missionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover classe ativa de todas as abas
            missionTabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'rgba(255, 255, 255, 0.05)';
                t.style.color = '#aaa';
            });
            
            // Adicionar classe ativa à aba clicada
            tab.classList.add('active');
            tab.style.background = 'rgba(30, 144, 255, 0.1)';
            tab.style.color = '#1e90ff';
            
            // Esconder todos os conteúdos
            document.querySelectorAll('.mission-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Mostrar conteúdo da aba selecionada
            document.getElementById(`${tab.dataset.tab}-missions`).style.display = 'block';
        });
    });
}// FURIAX - Sistema de Gamificação e Missões
// Sistema responsável por toda a mecânica de gamificação da plataforma

// Configurações
const GAMIFICATION_CONFIG = {
    LEVELS: {
        MAX_LEVEL: 100,
        XP_PER_LEVEL: [
            100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, // 1-10
            1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, // 11-20
            2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000 // 21-30
            // Continua até o nível 100
        ]
    },
    RANKS: [
        { name: "Torcedor Iniciante", minLevel: 1, icon: "fas fa-user", color: "#777" },
        { name: "Fã FURIA", minLevel: 5, icon: "fas fa-fire", color: "#ff9800" },
        { name: "Furioso", minLevel: 10, icon: "fas fa-bolt", color: "#ff3b5c" },
        { name: "Elite FURIA", minLevel: 20, icon: "fas fa-star", color: "#1e90ff" },
        { name: "Lenda FURIA", minLevel: 30, icon: "fas fa-crown", color: "#ffc107" },
        { name: "Imortal FURIA", minLevel: 50, icon: "fas fa-medal", color: "#9c27b0" },
        { name: "FURIA Master", minLevel: 75, icon: "fas fa-trophy", color: "#00cc66" },
        { name: "FURIA Eterno", minLevel: 100, icon: "fas fa-dragon", color: "#ff0000" }
    ],
    XP_ACTIONS: {
        POST: 50,
        COMMENT: 20,
        LIKE: 5,
        SHARE: 10,
        LOGIN_DAILY: 25,
        PROFILE_COMPLETE: 100,
        MISSION_COMPLETE: 200,
        ACHIEVEMENT_UNLOCK: 150,
        EVENT_ATTENDANCE: 300,
        POLL_VOTE: 15,
        CHAT_INTERACTION: 10,
        MINIGAME_COMPLETE: 30,
        QUIZ_CORRECT: 20,
        PERFECT_QUIZ: 100
    }
};

// Chaves para localStorage
const GAMIFICATION_KEYS = {
    USER_PROGRESS: 'furiax_user_progress',
    MISSIONS: 'furiax_missions',
    ACHIEVEMENTS: 'furiax_achievements',
    REWARDS: 'furiax_rewards',
    LAST_LOGIN: 'furiax_last_login',
    STREAK: 'furiax_login_streak',
    GAMES_HISTORY: 'furiax_games_history',
    COMPLETED_GAMES: 'furiax_completed_games'
};

// Chaves para localStorage geral
const STORAGE_KEYS = {
    USERS: 'furiax_users',
    CURRENT_USER: 'furiax_current_user',
    POSTS: 'furiax_posts',
    COMMENTS: 'furiax_comments'
};

// Inicializar sistema
document.addEventListener('DOMContentLoaded', () => {
    initGamificationSystem();
});

// Obter usuário atual
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
}

// Obter e salvar do localStorage com fallback
function getFromStorage(key, defaultValue) {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Mostrar toast de notificação
function showToast(message, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; background: ${type === 'success' ? 'rgba(0, 204, 102, 0.9)' : type === 'error' ? 'rgba(255, 59, 92, 0.9)' : 'rgba(30, 144, 255, 0.9)'}; color: white; border-radius: 10px; padding: 15px 20px; z-index: 1000; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); transform: translateY(0); animation: toastIn 0.3s ease-out;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${type === 'success' ? 'fas fa-check-circle' : type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle'}"></i>
                <div>${message}</div>
            </div>
        </div>
    `;
    
    // Criar estilo para animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastIn {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes toastOut {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar ao corpo
    document.body.appendChild(toast);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.firstElementChild.style.animation = 'toastOut 0.3s ease-out forwards';
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Inicializar sistema de gamificação
function initGamificationSystem() {
    // Verificar login diário
    checkDailyLogin();
    
    // Inicializar missões
    initMissions();
    
    // Inicializar conquistas
    initAchievements();
    
    // Inicializar recompensas
    initRewards();
    
    // Atualizar interface de progresso
    updateProgressUI();
    
    // Adicionar página de missões ao botão na sidebar
    setupMissionsButton();
    
    // Configurar event listeners
    setupGamificationEvents();
    
    // Inicializar histórico de jogos se não existir
    if (!localStorage.getItem(GAMIFICATION_KEYS.GAMES_HISTORY)) {
        saveToStorage(GAMIFICATION_KEYS.GAMES_HISTORY, {});
    }

    // Atualizar estatísticas na interface
    updateStats();
}

// Adicionar XP ao usuário atual
function addUserXP(amount) {
    const user = getCurrentUser();
    if (!user || !user.id) {
        console.error('Nenhum usuário logado para receber XP');
        return 0;
    }
    
    // Obter progresso atual
    let userProgress = getFromStorage(GAMIFICATION_KEYS.USER_PROGRESS, {});
    
    // Inicializar progresso se não existir
    if (!userProgress[user.id]) {
        userProgress[user.id] = {
            level: 1,
            xp: 0,
            totalXP: 0
        };
    }
    
    // Obter usuários
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === user.id);
    
    // Adicionar XP
    userProgress[user.id].xp += amount;
    userProgress[user.id].totalXP += amount;
    
    // Verificar level up
    const currentLevel = userProgress[user.id].level;
    const xpForNextLevel = getXPForLevel(currentLevel);
    
    if (userProgress[user.id].xp >= xpForNextLevel && currentLevel < GAMIFICATION_CONFIG.LEVELS.MAX_LEVEL) {
        // Level up!
        userProgress[user.id].level += 1;
        userProgress[user.id].xp -= xpForNextLevel;
        
        // Atualizar usuário
        if (userIndex !== -1) {
            users[userIndex].level = userProgress[user.id].level;
            users[userIndex].levelProgress = Math.floor((userProgress[user.id].xp / getXPForLevel(userProgress[user.id].level)) * 100);
            saveToStorage(STORAGE_KEYS.USERS, users);
            
            // Atualizar usuário atual
            const { password, ...safeUser } = users[userIndex];
            saveToStorage(STORAGE_KEYS.CURRENT_USER, safeUser);
            
            // Verificar rank
            const newRank = getUserRank(userProgress[user.id].level);
            const oldRank = getUserRank(currentLevel);
            
            if (newRank.name !== oldRank.name) {
                // Rank up!
                showRankUpMessage(oldRank, newRank);
            } else {
                // Level up normal
                showLevelUpMessage(userProgress[user.id].level);
            }
            
            // Verificar conquistas
            checkLevelAchievements(userProgress[user.id].level);
        }
    } else {
        // Apenas atualizar progresso
        if (userIndex !== -1) {
            users[userIndex].levelProgress = Math.floor((userProgress[user.id].xp / getXPForLevel(currentLevel)) * 100);
            saveToStorage(STORAGE_KEYS.USERS, users);
            
            // Atualizar usuário atual
            const { password, ...safeUser } = users[userIndex];
            saveToStorage(STORAGE_KEYS.CURRENT_USER, safeUser);
        }
    }
    
    // Salvar progresso
    saveToStorage(GAMIFICATION_KEYS.USER_PROGRESS, userProgress);
    
    // Atualizar UI
    updateProgressUI();
    
    // Atualizar estatísticas
    updateStats();

    return amount;
}

// ======================================================
// SISTEMA DE PROGRESSO DO USUÁRIO
// ======================================================

// Verificar login diário
function checkDailyLogin() {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    const lastLogin = getFromStorage(GAMIFICATION_KEYS.LAST_LOGIN, {
        userId: null,
        date: null
    });
    
    const today = new Date().toDateString();
    
    // Se é o mesmo usuário, mas dia diferente
    if (lastLogin.userId === user.id && lastLogin.date !== today) {
        // Conceder XP de login diário
        addUserXP(GAMIFICATION_CONFIG.XP_ACTIONS.LOGIN_DAILY);
        
        // Atualizar streak
        updateLoginStreak();
        
        // Mostrar mensagem
        showDailyLoginMessage();
    }
    
    // Atualizar último login
    saveToStorage(GAMIFICATION_KEYS.LAST_LOGIN, {
        userId: user.id,
        date: today
    });
}

// Atualizar streak de login diário
function updateLoginStreak() {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    const streak = getFromStorage(GAMIFICATION_KEYS.STREAK, {
        userId: null,
        count: 0,
        lastDate: null
    });
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (streak.userId !== user.id) {
        // Novo usuário, iniciar streak
        saveToStorage(GAMIFICATION_KEYS.STREAK, {
            userId: user.id,
            count: 1,
            lastDate: today.toDateString()
        });
    } else {
        // Verificar se o último login foi ontem
        if (streak.lastDate === yesterday.toDateString()) {
            // Streak contínuo
            saveToStorage(GAMIFICATION_KEYS.STREAK, {
                userId: user.id,
                count: streak.count + 1,
                lastDate: today.toDateString()
            });
            
            // Bonificar por streaks longos
            if (streak.count + 1 === 3) {
                addUserXP(50);
                showToast('Você completou 3 dias de login seguidos! +50 XP', 'success');
            } else if (streak.count + 1 === 7) {
                addUserXP(150);
                showToast('Uma semana de logins diários! +150 XP', 'success');
                // Desbloquear conquista
                unlockAchievement('streak_week');
            } else if (streak.count + 1 === 30) {
                addUserXP(500);
                showToast('Um mês inteiro de logins diários! +500 XP', 'success');
                
                // Desbloquear conquista
                unlockAchievement('streak_month');
            }
        } else if (streak.lastDate !== today.toDateString()) {
            // Streak quebrado
            saveToStorage(GAMIFICATION_KEYS.STREAK, {
                userId: user.id,
                count: 1,
                lastDate: today.toDateString()
            });
        }
    }
}

// Mostrar mensagem de login diário
function showDailyLoginMessage() {
    const streak = getFromStorage(GAMIFICATION_KEYS.STREAK, { count: 0 });
    
    const loginMessage = document.createElement('div');
    loginMessage.className = 'daily-login-message';
    loginMessage.innerHTML = `
        <div style="position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #1e90ff, #00bfff); color: white; border-radius: 10px; padding: 15px; z-index: 1000; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); text-align: center; max-width: 300px; animation: fadeInUp 0.5s ease-out;">
            <div style="font-size: 1.2rem; font-family: 'Orbitron', sans-serif; margin-bottom: 5px;">Login Diário! 🎉</div>
            <div style="font-size: 0.9rem; margin-bottom: 10px;">Você ganhou ${GAMIFICATION_CONFIG.XP_ACTIONS.LOGIN_DAILY} XP!</div>
            <div style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.8);">
                Sequência atual: ${streak.count} ${streak.count === 1 ? 'dia' : 'dias'} 🔥
            </div>
        </div>
    `;
    
    // Criar estilo para animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translate(-50%, 20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar ao corpo
    document.body.appendChild(loginMessage);
    
    // Remover após 5 segundos
    setTimeout(() => {
        loginMessage.style.animation = 'fadeOutDown 0.5s ease-out forwards';
        
        // Adicionar animação de saída
        const exitStyle = document.createElement('style');
        exitStyle.textContent = `
            @keyframes fadeOutDown {
                from {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, 20px);
                }
            }
        `;
        document.head.appendChild(exitStyle);
        
        setTimeout(() => {
            loginMessage.remove();
        }, 500);
    }, 5000);
}

// Obter XP necessário para o próximo nível
function getXPForLevel(level) {
    if (level <= GAMIFICATION_CONFIG.LEVELS.XP_PER_LEVEL.length) {
        return GAMIFICATION_CONFIG.LEVELS.XP_PER_LEVEL[level - 1];
    }
    
    // Fórmula para níveis mais altos
    return 3000 + (level - 30) * 100;
}

// Obter rank baseado no nível
function getUserRank(level) {
    // Buscar do mais alto para o mais baixo
    for (let i = GAMIFICATION_CONFIG.RANKS.length - 1; i >= 0; i--) {
        if (level >= GAMIFICATION_CONFIG.RANKS[i].minLevel) {
            return GAMIFICATION_CONFIG.RANKS[i];
        }
    }
    
    // Fallback
    return GAMIFICATION_CONFIG.RANKS[0];
}

// Mostrar mensagem de level up
function showLevelUpMessage(newLevel) {
    const levelUpMessage = document.createElement('div');
    levelUpMessage.className = 'level-up-message';
    levelUpMessage.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.8); border-radius: 15px; padding: 30px; text-align: center; z-index: 1100; box-shadow: 0 0 50px rgba(30, 144, 255, 0.5); animation: scaleIn 0.5s ease-out;">
            <div style="color: #1e90ff; font-size: 3rem; font-family: 'Orbitron', sans-serif; margin-bottom: 10px;">LEVEL UP!</div>
            <div style="color: white; font-size: 1.5rem; margin-bottom: 20px;">Você alcançou o nível <span style="color: #1e90ff; font-weight: bold;">${newLevel}</span></div>
            <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 20px;">Continue participando da comunidade para ganhar mais XP e recompensas!</div>
            <button id="levelUpCloseBtn" style="background: linear-gradient(90deg, #1e90ff, #00bfff); border: none; color: white; padding: 10px 20px; border-radius: 30px; font-family: 'Orbitron', sans-serif; cursor: pointer; transition: all 0.3s;">
                CONTINUAR
            </button>
        </div>
    `;
    
    // Criar estilo para animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar ao corpo
    document.body.appendChild(levelUpMessage);
    
    // Adicionar evento ao botão de fechar
    document.getElementById('levelUpCloseBtn').addEventListener('click', () => {
        levelUpMessage.style.animation = 'scaleOut 0.3s ease-out forwards';
        
        // Adicionar animação de saída
        const exitStyle = document.createElement('style');
        exitStyle.textContent = `
            @keyframes scaleOut {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
            }
        `;
        document.head.appendChild(exitStyle);
        
        setTimeout(() => {
            levelUpMessage.remove();
        }, 300);
    });
    
    // Efeito sonoro
    playSound('levelup');
}

// Mostrar mensagem de rank up
function showRankUpMessage(oldRank, newRank) {
    const rankUpMessage = document.createElement('div');
    rankUpMessage.className = 'rank-up-message';
    rankUpMessage.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 1200;">
            <div style="background: linear-gradient(145deg, #111, #181818); border-radius: 15px; padding: 40px; text-align: center; max-width: 500px; position: relative; box-shadow: 0 0 50px rgba(${hexToRgb(newRank.color)}, 0.7); border: 2px solid ${newRank.color};">
                <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); width: 60px; height: 60px; background: ${newRank.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px ${newRank.color};">
                    <i class="${newRank.icon}" style="font-size: 1.8rem; color: white;"></i>
                </div>
                <div style="color: white; font-size: 2rem; font-family: 'Orbitron', sans-serif; margin-bottom: 15px;">NOVO RANK!</div>
                <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 30px;">Você evoluiu de <span style="color: ${oldRank.color};">${oldRank.name}</span> para</div>
                <div style="color: ${newRank.color}; font-size: 2.5rem; font-family: 'Orbitron', sans-serif; margin-bottom: 20px; text-shadow: 0 0 10px rgba(${hexToRgb(newRank.color)}, 0.7);">
                    ${newRank.name}
                </div>
                <div style="color: #aaa; font-size: 0.9rem; margin-bottom: 30px;">Seu novo status na comunidade FURIAX desbloqueou recompensas exclusivas!</div>
                <button id="rankUpCloseBtn" style="background: ${newRank.color}; border: none; color: white; padding: 12px 30px; border-radius: 30px; font-family: 'Orbitron', sans-serif; cursor: pointer; transition: all 0.3s; font-size: 1.1rem;">
                    REIVINDICAR
                </button>
            </div>
        </div>
    `;
    
    // Adicionar ao corpo
    document.body.appendChild(rankUpMessage);
    
    // Adicionar evento ao botão de fechar
    document.getElementById('rankUpCloseBtn').addEventListener('click', () => {
        rankUpMessage.style.animation = 'fadeOut 0.5s ease-out forwards';
        
        // Adicionar animação de saída
        const exitStyle = document.createElement('style');
        exitStyle.textContent = `
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(exitStyle);
        
        setTimeout(() => {
            rankUpMessage.remove();
        }, 500);
        
        // Conceder recompensa de rank up
        grantRankUpReward(newRank);
    });
    
    // Efeito sonoro
    playSound('rankup');
}

// Converter cor hex para rgb
function hexToRgb(hex) {
    // Remover #
    hex = hex.replace('#', '');
    
    // Converter
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
}

// Conceder recompensa de rank up
function grantRankUpReward(rank) {
    // Adicionar XP bônus
    const bonusXP = rank.minLevel * 50;
    addUserXP(bonusXP);
    
    // Mostrar toast
    showToast(`Você recebeu ${bonusXP} XP de bônus pelo novo rank!`, 'success');
    
    // Desbloquear conquista
    unlockAchievement(`rank_${rank.name.toLowerCase().replace(/\s+/g, '_')}`);
    
    // Outras recompensas baseadas no rank
    // TODO: Implementar sistema completo de recompensas
}

// Atualizar UI de progresso
function updateProgressUI() {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    
    // Atualizar barra de progresso na sidebar
    const userLevelFill = document.getElementById('userLevelFill');
    if (userLevelFill) {
        userLevelFill.style.width = `${user.levelProgress || 0}%`;
    }
    
    // Atualizar nome de usuário e título
    const sidebarUsername = document.getElementById('sidebarUsername');
    const sidebarTitle = document.getElementById('sidebarTitle');
    
    if (sidebarUsername) {
        sidebarUsername.textContent = user.username || 'Usuário';
    }
    
    if (sidebarTitle) {
        const rank = getUserRank(user.level || 1);
        sidebarTitle.textContent = rank.name;
        sidebarTitle.style.color = rank.color;
    }
}

// Reproduzir som
function playSound(sound) {
    const sounds = {
        levelup: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
        rankup: 'https://assets.mixkit.co/sfx/preview/mixkit-magical-remarkable-achievement-2065.mp3',
        achievement: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3',
        mission: 'https://assets.mixkit.co/sfx/preview/mixkit-instant-win-2021.mp3'
    };
    
    // Verificar se o som existe
    if (!sounds[sound]) return;
    
    // Criar elemento de áudio
    const audio = new Audio(sounds[sound]);
    audio.volume = 0.5;
    audio.play();
}

// ======================================================
// SISTEMA DE MISSÕES E DESAFIOS
// ======================================================

// Inicializar missões
function initMissions() {
    // Obter missões existentes ou criar novas
    const missions = getFromStorage(GAMIFICATION_KEYS.MISSIONS, null);
    
    if (!missions) {
        // Criar missões padrão
        const defaultMissions = [
            // Missões diárias
            {
                id: 'daily_post',
                title: 'Compartilhar na comunidade',
                description: 'Faça uma publicação na comunidade',
                type: 'daily',
                goal: 1,
                progress: 0,
                xpReward: 100,
                icon: 'fas fa-pen',
                color: '#1e90ff',
                resetTime: getNextDailyReset(),
                completed: false
            },
            {
                id: 'daily_like',
                title: 'Apoiar a comunidade',
                description: 'Curta 5 publicações de outros fãs',
                type: 'daily',
                goal: 5,
                progress: 0,
                xpReward: 50,
                icon: 'fas fa-heart',
                color: '#ff3b5c',
                resetTime: getNextDailyReset(),
                completed: false
            },
            {
                id: 'daily_comment',
                title: 'Discussão ativa',
                description: 'Faça 3 comentários em publicações',
                type: 'daily',
                goal: 3,
                progress: 0,
                xpReward: 75,
                icon: 'fas fa-comment',
                color: '#00cc66',
                resetTime: getNextDailyReset(),
                completed: false
            },
            {
                id: 'daily_games',
                title: 'Gamer FURIA',
                description: 'Complete 3 minigames diferentes',
                type: 'daily',
                goal: 3,
                progress: 0,
                xpReward: 150,
                icon: 'fas fa-gamepad',
                color: '#8a2be2',
                resetTime: getNextDailyReset(),
                completed: false
            },
            // Missões semanais
            {
                id: 'weekly_poll',
                title: 'Voz da comunidade',
                description: 'Vote em 3 enquetes diferentes',
                type: 'weekly',
                goal: 3,
                progress: 0,
                xpReward: 150,
                icon: 'fas fa-poll',
                color: '#9c27b0',
                resetTime: getNextWeeklyReset(),
                completed: false
            },
            {
                id: 'weekly_chat',
                title: 'Conversando com a FURIA',
                description: 'Interaja com o assistente de IA 5 vezes',
                type: 'weekly',
                goal: 5,
                progress: 0,
                xpReward: 200,
                icon: 'fas fa-robot',
                color: '#1e90ff',
                resetTime: getNextWeeklyReset(),
                completed: false
            },
            {
                id: 'weekly_share',
                title: 'Espalhando a FURIA',
                description: 'Compartilhe 3 publicações nas redes sociais',
                type: 'weekly',
                goal: 3,
                progress: 0,
                xpReward: 250,
                icon: 'fas fa-share-alt',
                color: '#ff9800',
                resetTime: getNextWeeklyReset(),
                completed: false
            },
            {
                id: 'perfect_quiz',
                title: 'Conhecimento FURIA',
                description: 'Complete um quiz com 100% de acertos',
                type: 'weekly',
                goal: 1,
                progress: 0,
                xpReward: 200,
                icon: 'fas fa-award',
                color: '#ffc107',
                resetTime: getNextWeeklyReset(),
                completed: false
            },
            // Missões contínuas
            {
                id: 'ongoing_profile',
                title: 'Perfil completo',
                description: 'Complete 100% do seu perfil',
                type: 'ongoing',
                goal: 100,
                progress: 0,
                xpReward: 300,
                icon: 'fas fa-user-edit',
                color: '#1e90ff',
                completed: false
            },
            {
                id: 'ongoing_streak',
                title: 'Fã fiel',
                description: 'Faça login por 7 dias consecutivos',
                type: 'ongoing',
                goal: 7,
                progress: 0,
                xpReward: 350,
                icon: 'fas fa-calendar-check',
                color: '#00cc66',
                completed: false
            },
            {
                            id: 'ongoing_engagement',
                            title: 'Engajamento máximo',
                            description: 'Alcance um score de engajamento de 80',
                            type: 'ongoing',
                            goal: 80,
                            progress: 0,
                            xpReward: 500,
                            icon: 'fas fa-chart-line',
                            color: '#9c27b0',
                            completed: false
                        }
                    ];
                }
            }