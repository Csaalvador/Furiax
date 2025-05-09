// FURIAX - Sistema de Gamificação e Missões
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
        MINIGAME_COMPLETE: 50 // Adicionado XP para completar minigames
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
    GAMES_HISTORY: 'furiax_games_history'
};

// Inicializar sistema

document.addEventListener('DOMContentLoaded', () => {
    initGamificationSystem();
    // Substituir botão de minigames por logout
    replaceMinigamesWithLogout();
});

// Função para adicionar XP ao usuário atual - CORRIGIDA
function addUserXP(amount) {
    // Obter usuário atual
    const currentUser = JSON.parse(localStorage.getItem('furiax_current_user') || '{}');
    if (!currentUser.id) {
        console.error('Nenhum usuário logado para receber XP');
        return;
    }
    
    // Obter progresso atual
    let userProgress = JSON.parse(localStorage.getItem(GAMIFICATION_KEYS.USER_PROGRESS) || '{}');
    
    // Inicializar progresso se não existir
    if (!userProgress[currentUser.id]) {
        userProgress[currentUser.id] = {
            level: 1,
            xp: 0,
            totalXP: 0
        };
    }
    
    // Adicionar XP
    userProgress[currentUser.id].xp += amount;
    userProgress[currentUser.id].totalXP += amount;
    
    // Salvar no localStorage
    localStorage.setItem(GAMIFICATION_KEYS.USER_PROGRESS, JSON.stringify(userProgress));
    
    // Verificar level up
    const currentLevel = userProgress[currentUser.id].level;
    const xpForNextLevel = getXPForLevel(currentLevel);
    
    if (userProgress[currentUser.id].xp >= xpForNextLevel && currentLevel < GAMIFICATION_CONFIG.LEVELS.MAX_LEVEL) {
        // Level up!
        userProgress[currentUser.id].level += 1;
        userProgress[currentUser.id].xp -= xpForNextLevel;
        
        // Atualizar usuário no localStorage
        updateUserLevel(currentUser.id, userProgress[currentUser.id].level, userProgress[currentUser.id].xp, xpForNextLevel);
        
        // Mostrar mensagem de level up
        showLevelUpMessage(userProgress[currentUser.id].level);
        
        // Verificar conquistas
        checkLevelAchievements(userProgress[currentUser.id].level);
    } else {
        // Apenas atualizar progresso
        updateUserLevelProgress(currentUser.id, userProgress[currentUser.id].xp, getXPForLevel(currentLevel));
    }
    
    // Atualizar exibição na tela
    updateXPDisplay(userProgress[currentUser.id].totalXP);
    
    console.log(`XP adicionado: +${amount}. Total: ${userProgress[currentUser.id].totalXP}`);
    
    // Atualizar estatísticas
    updateStats();
    
    return amount;
}

// Função para atualizar o nível do usuário
function updateUserLevel(userId, newLevel, currentXP, xpForNextLevel) {
    const users = JSON.parse(localStorage.getItem('furiax_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].level = newLevel;
        users[userIndex].levelProgress = Math.floor((currentXP / xpForNextLevel) * 100);
        localStorage.setItem('furiax_users', JSON.stringify(users));
        
        // Atualizar usuário atual
        const { password, ...safeUser } = users[userIndex];
        localStorage.setItem('furiax_current_user', JSON.stringify(safeUser));
        
        // Verificar rank
        const oldRank = getUserRank(newLevel - 1);
        const newRank = getUserRank(newLevel);
        
        if (newRank.name !== oldRank.name) {
            // Rank up!
            showRankUpMessage(oldRank, newRank);
        }
    }
}

// Função para atualizar o progresso de nível do usuário
function updateUserLevelProgress(userId, currentXP, xpForNextLevel) {
    const users = JSON.parse(localStorage.getItem('furiax_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].levelProgress = Math.floor((currentXP / xpForNextLevel) * 100);
        localStorage.setItem('furiax_users', JSON.stringify(users));
        
        // Atualizar usuário atual
        const { password, ...safeUser } = users[userIndex];
        localStorage.setItem('furiax_current_user', JSON.stringify(safeUser));
    }
}

// Função para atualizar a exibição de XP na interface
function updateXPDisplay(totalXP) {
    const xpDisplay = document.getElementById('totalXP');
    if (xpDisplay) {
        xpDisplay.textContent = totalXP;
    }
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
    
    // Adicionar página de missões
    addMissionsPage();
    
    // Configurar event listeners
    setupGamificationEvents();
    
    // Inicializar histórico de jogos se não existir
    if (!localStorage.getItem(GAMIFICATION_KEYS.GAMES_HISTORY)) {
        localStorage.setItem(GAMIFICATION_KEYS.GAMES_HISTORY, JSON.stringify({}));
    }
}

// Verificar login diário
function checkDailyLogin() {
    const user = getCurrentUser();
    if (!user) return;
    
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

// Atualizar streak de login diário - CORRIGIDA
function updateLoginStreak() {
    const user = getCurrentUser();
    if (!user) return;
    
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
            } else if (streak.count + 1 === 30) {
                addUserXP(500);
                showToast('Um mês inteiro de logins diários! +500 XP', 'success');
                
                // Desbloquear conquista
                unlockAchievement('streak_month');
            }
        } else if (streak.lastDate !== today.toDateString()) {
            // Streak quebrado ou primeiro dia
            saveToStorage(GAMIFICATION_KEYS.STREAK, {
                userId: user.id,
                count: 1,
                lastDate: today.toDateString()
            });
        }
    }
}

// Iniciar streak de login ao completar uma missão - NOVA FUNÇÃO
function initLoginStreakOnMissionComplete() {
    const user = getCurrentUser();
    if (!user) return;
    
    const streak = getFromStorage(GAMIFICATION_KEYS.STREAK, {
        userId: null,
        count: 0,
        lastDate: null
    });
    
    const today = new Date();
    
    // Se ainda não tem streak, iniciar com 1
    if (streak.userId !== user.id || streak.count === 0) {
        saveToStorage(GAMIFICATION_KEYS.STREAK, {
            userId: user.id,
            count: 1,
            lastDate: today.toDateString()
        });
    }
}

// Obter usuário atual - AUXILIAR
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('furiax_current_user') || '{}');
}

// Obter dados do localStorage - AUXILIAR
function getFromStorage(key, defaultValue) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
}

// Salvar dados no localStorage - AUXILIAR
function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
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

// Atualizar missão - CORRIGIDA
function updateMissionProgress(missionId, progress = 1) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Obter missões
    const missions = getFromStorage(GAMIFICATION_KEYS.MISSIONS, []);
    
    // Encontrar missão
    const missionIndex = missions.findIndex(mission => mission.id === missionId);
    
    if (missionIndex === -1) return false;
    
    // Verificar se já completou
    if (missions[missionIndex].completed) return false;
    
    // Atualizar progresso
    missions[missionIndex].progress += progress;
    
    // Verificar se atingiu o objetivo
    if (missions[missionIndex].progress >= missions[missionIndex].goal) {
        // Completar missão
        missions[missionIndex].completed = true;
        missions[missionIndex].progress = missions[missionIndex].goal;
        
        // Conceder recompensa
        addUserXP(missions[missionIndex].xpReward);
        
        // Iniciar streak se for a primeira missão completa
        initLoginStreakOnMissionComplete();
        
        // Mostrar notificação
        showMissionCompleteNotification(missions[missionIndex]);
        
        // Efeito sonoro
        playSound('mission');
    }
    
    // Salvar missões
    saveToStorage(GAMIFICATION_KEYS.MISSIONS, missions);
    
    return true;
}

// Registrar conclusão de minigame - NOVA FUNÇÃO
function registerGameCompletion(gameId, score = 0) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Obter histórico de jogos
    let gamesHistory = getFromStorage(GAMIFICATION_KEYS.GAMES_HISTORY, {});
    
    // Inicializar registro para este jogo se não existir
    if (!gamesHistory[gameId]) {
        gamesHistory[gameId] = {
            timesPlayed: 0,
            bestScore: 0,
            lastPlayed: null
        };
    }
    
    // Atualizar dados
    gamesHistory[gameId].timesPlayed += 1;
    gamesHistory[gameId].lastPlayed = new Date().toISOString();
    
    // Atualizar melhor pontuação se aplicável
    if (score > gamesHistory[gameId].bestScore) {
        gamesHistory[gameId].bestScore = score;
    }
    
    // Salvar histórico
    saveToStorage(GAMIFICATION_KEYS.GAMES_HISTORY, gamesHistory);
    
    // Adicionar XP pela conclusão do minigame
    addUserXP(GAMIFICATION_CONFIG.XP_ACTIONS.MINIGAME_COMPLETE);
    
    // Verificar conquistas de jogos
    checkGameAchievements(gamesHistory);
    
    // Mostrar toast de confirmação
    showToast(`Jogo completado! +${GAMIFICATION_CONFIG.XP_ACTIONS.MINIGAME_COMPLETE} XP`, 'success');
    
    return true;
}

// Confirmar jogo "Palavra do Dia" - NOVA FUNÇÃO
function confirmWordOfTheDay(word) {
    // Aqui você pode adicionar lógica para verificar se a palavra está correta
    // Para este exemplo, vamos apenas registrar a conclusão do jogo
    registerGameCompletion('word_of_the_day');
    
    // Mostrar uma mensagem de parabéns
    showToast(`Parabéns! Você completou o desafio da Palavra do Dia!`, 'success');
    
    // Atualizar missão relacionada se existir
    const missions = getFromStorage(GAMIFICATION_KEYS.MISSIONS, []);
    const wordGameMission = missions.find(m => m.id === 'daily_word_game');
    
    if (wordGameMission) {
        updateMissionProgress('daily_word_game');
    }
    
    return true;
}

// Verificar conquistas relacionadas a jogos - NOVA FUNÇÃO
function checkGameAchievements(gamesHistory) {
    // Verificar conquista de quiz perfeito
    if (gamesHistory['quiz'] && gamesHistory['quiz'].bestScore === 100) {
        unlockAchievement('quiz_perfect');
    }
    
    // Verificar se completou todos os jogos em um dia
    const availableGames = ['word_of_the_day', 'quiz', 'memory', 'trivia'];
    const today = new Date().toDateString();
    
    let allGamesPlayedToday = true;
    
    for (const gameId of availableGames) {
        if (!gamesHistory[gameId] || 
            !gamesHistory[gameId].lastPlayed || 
            new Date(gamesHistory[gameId].lastPlayed).toDateString() !== today) {
            allGamesPlayedToday = false;
            break;
        }
    }
    
    if (allGamesPlayedToday) {
        unlockAchievement('daily_all_games');
    }
}

// Substituir botão de minigames por logout - NOVA FUNÇÃO
function replaceMinigamesWithLogout() {
    // Encontrar botão de minigames na sidebar (assumindo que é o 5º botão)
    const minigamesButton = document.querySelector('.sidebar button:nth-child(5)');
    
    if (minigamesButton) {
        // Alterar ícone e texto
        minigamesButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        
        // Remover evento anterior
        const newButton = minigamesButton.cloneNode(true);
        minigamesButton.parentNode.replaceChild(newButton, minigamesButton);
        
        // Adicionar evento de logout
        newButton.addEventListener('click', () => {
            // Limpar usuário atual
            localStorage.removeItem('furiax_current_user');
            
            // Redirecionar para página de login
            window.location.href = 'login.html';
        });
    }
}

// Função para atualizar as estatísticas - CORRIGIDA
function updateStats() {
    // Calcular quantidade de jogos concluídos
    const gameHistory = getFromStorage(GAMIFICATION_KEYS.GAMES_HISTORY, {});
    let totalGamesPlayed = 0;
    
    Object.values(gameHistory).forEach(game => {
        totalGamesPlayed += game.timesPlayed || 0;
    });
    
    // Obter XP total
    let totalXP = 0;
    const currentUser = getCurrentUser();
    
    if (currentUser.id) {
        const userProgress = getFromStorage(GAMIFICATION_KEYS.USER_PROGRESS, {});
        if (userProgress[currentUser.id]) {
            totalXP = userProgress[currentUser.id].totalXP || 0;
        }
    }
    
    // Atualizar elementos na interface
    const xpDisplay = document.getElementById('totalXP');
    const gamesDisplay = document.getElementById('gamesPlayed');
    const streakDisplay = document.getElementById('streakDays');
    
    if (xpDisplay) xpDisplay.textContent = totalXP;
    if (gamesDisplay) gamesDisplay.textContent = totalGamesPlayed;
    
    // Atualizar streak
    const streak = getFromStorage(GAMIFICATION_KEYS.STREAK, {count: 0});
    if (streakDisplay) streakDisplay.textContent = streak.count;
}

// Mostrar toast - UTILITÁRIO
function showToast(message, type = 'info') {
    // Cores baseadas no tipo
    const colors = {
        success: '#00cc66',
        error: '#ff3b5c',
        info: '#1e90ff',
        warning: '#ff9800'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: ${colors[type]}; color: white; border-radius: 8px; padding: 12px 20px; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); max-width: 300px; text-align: center; animation: toastFadeIn 0.3s ease-out;">
            ${message}
        </div>
    `;
    
    // Criar animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastFadeIn {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar ao corpo
    document.body.appendChild(toast);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s ease-out forwards';
        
        // Adicionar animação de saída
        const exitStyle = document.createElement('style');
        exitStyle.textContent = `
            @keyframes toastFadeOut {
                from { opacity: 1; transform: translate(-50%, 0); }
                to { opacity: 0; transform: translate(-50%, 20px); }
            }
        `;
        document.head.appendChild(exitStyle);
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Exportar funções importantes
window.addUserXP = addUserXP;
window.updateMissionProgress = updateMissionProgress;
window.unlockAchievement = unlockAchievement;
window.claimReward = claimReward;
window.showMissionsPage = showMissionsPage;
window.registerGameCompletion = registerGameCompletion;
window.confirmWordOfTheDay = confirmWordOfTheDay;


document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 FURIAX Mini-Games Fix - Iniciando...');
    
    // ==============================================
    // CONFIGURAÇÃO E VARIÁVEIS
    // ==============================================
    
    // Valores padrão para inicialização
    const DEFAULT_VALUES = {
        totalXP: 0,
        gamesPlayed: 0,
        streakDays: 0
    };
    
    // Referência para o jogo atual
    let currentGame = null;
    
    // Elementos do DOM para os stats
    const totalXPElement = document.getElementById('totalXP');
    const gamesPlayedElement = document.getElementById('gamesPlayed');
    const streakDaysElement = document.getElementById('streakDays');
    
    // Jogo da palavra
    const WORD_GAME = {
        word: "VALORANT",
        hint: "Jogo FPS da Riot Games onde a FURIA tem uma equipe competitiva",
        shuffledWord: "AOTLVNAR", // Palavra embaralhada
    };
    
    // ==============================================
    // INICIALIZAÇÃO
    // ==============================================
    
    // Inicializar a página
    initializeMinigames();
    
    function initializeMinigames() {
        // Carregar dados do usuário
        loadUserData();
        
        // Atualizar interface baseada nos dados
        updateStatsUI();
        
        // Verificar estado dos jogos (concluídos, disponíveis)
        updateGamesStatus();
        
        // Atualizar jogo de palavra
        updateWordGame();
        
        // Configurar os modais dos jogos
        setupModals();
        
        console.log('✅ FURIAX Mini-Games Fix - Inicializado!');
    }
    
    // ==============================================
    // GERENCIAMENTO DE DADOS
    // ==============================================
    
    // Carregar dados do usuário do localStorage
    function loadUserData() {
        // Obter dados de progresso do usuário
        const userProgress = getUserProgress();
        
        // Inicializar valores padrão se não existirem
        if (!userProgress.minigames) {
            userProgress.minigames = {
                totalXP: DEFAULT_VALUES.totalXP,
                gamesPlayed: DEFAULT_VALUES.gamesPlayed,
                dailyStreak: DEFAULT_VALUES.streakDays,
                games: {},
                lastLogin: new Date().toDateString()
            };
            
            // Salvar inicialização
            saveUserProgress(userProgress);
        }
        
        // Verificar login diário para streak
        checkDailyLogin(userProgress);
    }
    
    // Verificar login diário para contagem de dias consecutivos
    function checkDailyLogin(userProgress) {
        const today = new Date().toDateString();
        const lastLogin = userProgress.minigames.lastLogin;
        
        if (lastLogin !== today) {
            // É um novo dia
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (lastLogin === yesterdayStr) {
                // Dias consecutivos - incrementar streak
                userProgress.minigames.dailyStreak += 1;
            } else {
                // Quebrou a sequência - reiniciar
                userProgress.minigames.dailyStreak = 1;
            }
            
            // Resetar estado diário dos jogos
            Object.keys(userProgress.minigames.games).forEach(gameId => {
                if (userProgress.minigames.games[gameId].dailyReset) {
                    userProgress.minigames.games[gameId].completedToday = false;
                }
            });
            
            // Atualizar último login
            userProgress.minigames.lastLogin = today;
            
            // Salvar mudanças
            saveUserProgress(userProgress);
        }
    }
    
    // Obter progresso do usuário atual
    function getUserProgress() {
        try {
            // Obter dados do usuário atual
            const currentUser = JSON.parse(localStorage.getItem('furiax_current_user') || '{}');
            const userId = currentUser.id || 'guest';
            
            // Carregar progresso
            const allUserProgress = JSON.parse(localStorage.getItem('furiax_user_progress') || '{}');
            
            // Inicializar se não existir
            if (!allUserProgress[userId]) {
                allUserProgress[userId] = {};
            }
            
            return allUserProgress[userId];
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            return {};
        }
    }
    
    // Salvar progresso do usuário
    function saveUserProgress(userProgress) {
        try {
            // Obter ID do usuário atual
            const currentUser = JSON.parse(localStorage.getItem('furiax_current_user') || '{}');
            const userId = currentUser.id || 'guest';
            
            // Carregar todos os dados para não sobrescrever outros usuários
            const allUserProgress = JSON.parse(localStorage.getItem('furiax_user_progress') || '{}');
            
            // Atualizar dados deste usuário
            allUserProgress[userId] = userProgress;
            
            // Salvar de volta no localStorage
            localStorage.setItem('furiax_user_progress', JSON.stringify(allUserProgress));
            
            // Atualizar a interface
            updateStatsUI();
            
            return true;
        } catch (error) {
            console.error('Erro ao salvar progresso do usuário:', error);
            return false;
        }
    }
    
    // Adicionar XP ao usuário
    function addUserXP(amount) {
        if (!amount || amount <= 0) return;
        
        // Obter progresso atual
        const userProgress = getUserProgress();
        
        // Garantir que a seção de minigames existe
        if (!userProgress.minigames) {
            userProgress.minigames = {
                totalXP: 0,
                gamesPlayed: 0,
                dailyStreak: 0,
                games: {},
                lastLogin: new Date().toDateString()
            };
        }
        
        // Adicionar XP
        userProgress.minigames.totalXP = (userProgress.minigames.totalXP || 0) + amount;
        
        // Adicionar ao XP global se existir
        if (typeof userProgress.totalXP !== 'undefined') {
            userProgress.totalXP += amount;
        }
        
        if (typeof userProgress.xp !== 'undefined') {
            userProgress.xp += amount;
        }
        
        // Salvar progresso
        saveUserProgress(userProgress);
        
        // Mostrar notificação
        showNotification(`+${amount} XP ganho!`, 'success');
        
        // Atualizar UI
        updateStatsUI();
    }
    
    // Registrar conclusão de jogo
    function markGameCompleted(gameId, score = 0) {
        // Obter progresso atual
        const userProgress = getUserProgress();
        
        // Garantir que a seção de minigames existe
        if (!userProgress.minigames) {
            userProgress.minigames = {
                totalXP: 0,
                gamesPlayed: 0,
                dailyStreak: 0,
                games: {},
                lastLogin: new Date().toDateString()
            };
        }
        
        // Garantir que a seção de jogos existe
        if (!userProgress.minigames.games) {
            userProgress.minigames.games = {};
        }
        
        // Garantir que este jogo existe
        if (!userProgress.minigames.games[gameId]) {
            userProgress.minigames.games[gameId] = {
                timesPlayed: 0,
                bestScore: 0,
                completedToday: false,
                dailyReset: true
            };
        }
        
        // Atualizar dados do jogo
        const gameData = userProgress.minigames.games[gameId];
        
        // Verificar se é a primeira vez hoje
        if (!gameData.completedToday) {
            userProgress.minigames.gamesPlayed = (userProgress.minigames.gamesPlayed || 0) + 1;
            gameData.completedToday = true;
        }
        
        // Atualizar estatísticas
        gameData.timesPlayed += 1;
        gameData.lastPlayed = new Date().toDateString();
        
        // Atualizar melhor pontuação se for maior
        if (score > (gameData.bestScore || 0)) {
            gameData.bestScore = score;
        }
        
        // Salvar progresso
        saveUserProgress(userProgress);
        
        // Atualizar interface
        updateGamesStatus();
    }
    
    // Verificar se o jogo já foi concluído hoje
    function isGameCompletedToday(gameId) {
        // Obter progresso
        const userProgress = getUserProgress();
        
        // Verificar conclusão
        return userProgress && 
               userProgress.minigames && 
               userProgress.minigames.games && 
               userProgress.minigames.games[gameId] && 
               userProgress.minigames.games[gameId].completedToday;
    }
    
    // ==============================================
    // ATUALIZAÇÃO DA INTERFACE
    // ==============================================
    
    // Atualizar estatísticas na interface
    function updateStatsUI() {
        // Obter dados
        const userProgress = getUserProgress();
        
        if (userProgress && userProgress.minigames) {
            // Atualizar valores na interface
            totalXPElement.textContent = userProgress.minigames.totalXP || DEFAULT_VALUES.totalXP;
            gamesPlayedElement.textContent = userProgress.minigames.gamesPlayed || DEFAULT_VALUES.gamesPlayed;
            streakDaysElement.textContent = userProgress.minigames.dailyStreak || DEFAULT_VALUES.streakDays;
        } else {
            // Valores padrão
            totalXPElement.textContent = DEFAULT_VALUES.totalXP;
            gamesPlayedElement.textContent = DEFAULT_VALUES.gamesPlayed;
            streakDaysElement.textContent = DEFAULT_VALUES.streakDays;
        }
    }
    
    // Atualizar o estado dos mini-games (disponíveis/concluídos)
    function updateGamesStatus() {
        // Mapear IDs dos jogos para os elementos do DOM
        const gameMapping = {
            'quiz': document.querySelector('.game-card:nth-child(1)'),
            'word_game': document.querySelector('.game-card:nth-child(2)'),
            'predictions': document.querySelector('.game-card:nth-child(3)')
        };
        
        // Verificar cada jogo
        Object.entries(gameMapping).forEach(([gameId, gameCard]) => {
            if (!gameCard) return;
            
            // Verificar conclusão
            if (isGameCompletedToday(gameId)) {
                // Elementos do jogo
                const statusElement = gameCard.querySelector('.game-status');
                const buttonElement = gameCard.querySelector('.game-button');
                
                // Atualizar status
                if (statusElement) {
                    statusElement.className = 'game-status status-completed';
                    statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Completado Hoje';
                }
                
                // Atualizar botão
                if (buttonElement) {
                    buttonElement.className = 'game-button completed';
                    buttonElement.textContent = 'Completado';
                    
                    // Armazenar onclick original
                    const originalOnClick = buttonElement.getAttribute('onclick');
                    if (originalOnClick && !buttonElement.hasAttribute('data-original-onclick')) {
                        buttonElement.setAttribute('data-original-onclick', originalOnClick);
                        
                        // Substituir com nova função
                        buttonElement.removeAttribute('onclick');
                        buttonElement.addEventListener('click', function() {
                            showNotification('Você já completou este mini-game hoje!', 'info');
                        });
                    }
                }
            }
        });
    }
    
    // Atualizar jogo da palavra
    function updateWordGame() {
        // Embaralhar palavra no wordLetters
        const wordLettersContainer = document.getElementById('wordLetters');
        if (wordLettersContainer) {
            // Limpar container
            wordLettersContainer.innerHTML = '';
            
            // Adicionar letras embaralhadas
            for (let i = 0; i < WORD_GAME.shuffledWord.length; i++) {
                const letterBox = document.createElement('div');
                letterBox.className = 'letter-box';
                letterBox.textContent = WORD_GAME.shuffledWord[i];
                wordLettersContainer.appendChild(letterBox);
            }
        }
        
        // Atualizar dica
        const wordHintElement = document.getElementById('wordHint');
        if (wordHintElement) {
            wordHintElement.textContent = WORD_GAME.hint;
        }
    }
    
    // ==============================================
    // CONFIGURAÇÃO DOS MODAIS
    // ==============================================
    
    function setupModals() {
        // Redefinir funções de todos os modais para garantir que funcionem corretamente
        setupQuizModal();
        setupWordGameModal();
        setupPredictionModal();
    }
    
    // Configurar modal do Quiz
    function setupQuizModal() {
        // Sobrescrever função original de abrir modal
        window.openQuizModal = function() {
            // Verificar se já completou
            if (isGameCompletedToday('quiz')) {
                showNotification('Você já completou este mini-game hoje!', 'info');
                return;
            }
            
            // Abrir modal
            document.getElementById('quizModal').style.display = 'flex';
            
            // Resetar quiz
            resetQuiz();
        };
        
        // Sobrescrever função original de fechar modal
        window.closeQuizModal = function() {
            document.getElementById('quizModal').style.display = 'none';
        };
        
        // Função original completeQuiz reformulada
        window.completeQuiz = function() {
            // Calcular XP
            const xpEarned = window.quizScore * 20;
            
            // Mostrar resultado final
            const quizContainer = document.querySelector('.quiz-container');
            quizContainer.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 2rem; color: #1e90ff; margin-bottom: 10px;">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div style="font-size: 1.3rem; color: #ddd; margin-bottom: 15px;">
                        Quiz Completo!
                    </div>
                    <div style="font-size: 1.1rem; color: #aaa; margin-bottom: 20px;">
                        Você acertou ${window.quizScore} de ${window.quizQuestions.length} perguntas.
                    </div>
                    <div style="background: rgba(30, 144, 255, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                        <div style="color: gold; font-size: 1.5rem; margin-bottom: 5px;">
                            +${xpEarned} XP
                        </div>
                        <div style="color: #aaa; font-size: 0.9rem;">
                            adicionado à sua conta!
                        </div>
                    </div>
                </div>
            `;
            
            // Atualizar botão
            const nextBtn = document.getElementById('quizNextBtn');
            nextBtn.textContent = 'Concluir';
            nextBtn.disabled = false;
            
            // Modificar comportamento do botão
            nextBtn.onclick = function() {
                // Adicionar XP
                addUserXP(xpEarned);
                
                // Marcar como concluído
                markGameCompleted('quiz', window.quizScore);
                
                // Fechar modal
                window.closeQuizModal();
            };
        };
    }
    
    // Configurar modal do Jogo da Palavra
    function setupWordGameModal() {
        // Sobrescrever função original de abrir modal
        window.openWordGameModal = function() {
            // Verificar se já completou
            if (isGameCompletedToday('word_game')) {
                showNotification('Você já completou este mini-game hoje!', 'info');
                return;
            }
            
            // Abrir modal
            document.getElementById('wordGameModal').style.display = 'flex';
            
            // Focar no input
            setTimeout(() => {
                document.getElementById('wordInput').value = '';
                document.getElementById('wordInput').focus();
            }, 100);
        };
        
        // Sobrescrever função original de fechar modal
        window.closeWordGameModal = function() {
            document.getElementById('wordGameModal').style.display = 'none';
        };
        
        // Sobrescrever função de verificação
        window.checkWordAnswer = function() {
            const userAnswer = document.getElementById('wordInput').value.trim().toUpperCase();
            const correctAnswer = WORD_GAME.word;
            
            if (userAnswer === correctAnswer) {
                // Resposta correta
                const xpEarned = 25;
                
                // Adicionar XP
                addUserXP(xpEarned);
                
                // Marcar como concluído
                markGameCompleted('word_game', 1);
                
                // Mostrar notificação
                showNotification('Resposta correta! +25 XP', 'success');
                
                // Fechar modal
                window.closeWordGameModal();
            } else {
                // Resposta incorreta
                showNotification('Resposta incorreta. Tente novamente!', 'error');
                
                // Sacudir o input para feedback visual
                const input = document.getElementById('wordInput');
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 500);
            }
        };
        
        // Adicionar evento de tecla Enter
        const wordInput = document.getElementById('wordInput');
        if (wordInput) {
            wordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    window.checkWordAnswer();
                }
            });
        }
    }
    
    // Configurar modal de Previsões
    function setupPredictionModal() {
        // Sobrescrever função original de abrir modal
        window.openPredictionModal = function() {
            // Verificar se já completou
            if (isGameCompletedToday('predictions')) {
                showNotification('Você já completou este mini-game hoje!', 'info');
                return;
            }
            
            // Abrir modal
            document.getElementById('predictionModal').style.display = 'flex';
            
            // Resetar seleções
            window.selectedPredictions = {};
            
            // Resetar UI
            document.querySelectorAll('.prediction-option.selected').forEach(option => {
                option.classList.remove('selected');
            });
        };
        
        // Sobrescrever função original de fechar modal
        window.closePredictionModal = function() {
            document.getElementById('predictionModal').style.display = 'none';
        };
        
        // Sobrescrever função de seleção
        window.selectPrediction = function(element, prediction) {
            // Remover seleção anterior do mesmo grupo
            const options = element.parentElement.querySelectorAll('.prediction-option');
            options.forEach(option => {
                option.className = 'prediction-option';
            });
            
            // Selecionar atual
            element.className = 'prediction-option selected';
            
            // Armazenar previsão
            const matchCard = element.closest('.match-card');
            const matchIndex = Array.from(matchCard.parentElement.children).indexOf(matchCard);
            
            window.selectedPredictions[matchIndex] = prediction;
        };
        
        // Sobrescrever função de envio
        window.submitPredictions = function() {
            // Verificar se todas as partidas têm previsão
            const matchCount = document.querySelectorAll('.match-card').length;
            if (Object.keys(window.selectedPredictions || {}).length < matchCount) {
                showNotification('Faça previsões para todas as partidas!', 'error');
                return;
            }
            
            // Calcular XP base por participação
            const xpEarned = 15 * matchCount;
            
            // Adicionar XP
            addUserXP(xpEarned);
            
            // Marcar como concluído
            markGameCompleted('predictions', matchCount);
            
            // Salvar previsões para verificação futura
            localStorage.setItem('furiax_predictions', JSON.stringify({
                predictions: window.selectedPredictions,
                date: new Date().toISOString()
            }));
            
            // Mostrar notificação
            showNotification(`Previsões registradas! +${xpEarned} XP`, 'success');
            
            // Fechar modal
            window.closePredictionModal();
        };
    }
    
    // ==============================================
    // UTILITÁRIOS
    // ==============================================
    
    // Mostrar notificação
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        if (!notification || !notificationText) return;
        
        // Definir tipo
        notification.className = `notification ${type}`;
        
        // Definir ícone baseado no tipo
        const iconElement = notification.querySelector('.notification-icon i');
        if (iconElement) {
            if (type === 'success') {
                iconElement.className = 'fas fa-check-circle';
            } else if (type === 'error') {
                iconElement.className = 'fas fa-exclamation-circle';
            } else {
                iconElement.className = 'fas fa-info-circle';
            }
        }
        
        // Definir mensagem
        notificationText.textContent = message;
        
        // Mostrar notificação
        notification.classList.add('show');
        
        // Esconder após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Adicionar estilo CSS para animação de shake
    function addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            .shake {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Adicionar estilos personalizados
    addCustomStyles();
});

/**
 * Correção Específica para o Quiz FURIAX
 * Este script corrige o problema de seleção de opções no quiz
 */

 document.addEventListener('DOMContentLoaded', function() {
    console.log('🎲 Quiz FURIAX - Correção Específica Iniciada');
    
    // Corrigir a função selectOption
    window.selectOption = function(element, optionIndex) {
        console.log('Opção selecionada:', optionIndex);
        
        // Remover seleção anterior
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Adicionar classe selecionada ao elemento atual
        element.classList.add('selected');
        
        // Armazenar a opção selecionada
        window.selectedOption = optionIndex;
        
        // Habilitar o botão de próximo
        document.getElementById('quizNextBtn').disabled = false;
    };
    
    // Redefinir função de resetar quiz
    const originalResetQuiz = window.resetQuiz;
    window.resetQuiz = function() {
        // Inicializar variáveis globais necessárias
        window.currentQuizQuestion = 0;
        window.quizScore = 0;
        window.selectedOption = null;
        
        // Resetar progresso
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index === 0) {
                step.className = 'progress-step active';
            } else {
                step.className = 'progress-step';
            }
        });
        
        // Carregar primeira pergunta
        window.loadQuestion(0);
        
        // Desabilitar botão de próxima
        document.getElementById('quizNextBtn').disabled = true;
    };
    
    // Corrigir a função nextQuestion
    window.nextQuestion = function() {
        if (window.selectedOption === null) {
            console.error('Nenhuma opção selecionada');
            return;
        }
        
        // Verificar resposta
        const correctAnswer = window.quizQuestions[window.currentQuizQuestion].answer;
        const isCorrect = window.selectedOption === correctAnswer;
        
        // Atualizar progresso
        const currentStep = document.getElementById(`step-${window.currentQuizQuestion + 1}`);
        currentStep.className = isCorrect ? 'progress-step correct' : 'progress-step incorrect';
        
        // Atualizar pontuação
        if (isCorrect) {
            window.quizScore += 1;
        }
        
        // Mostrar resultado da questão
        const options = document.querySelectorAll('.quiz-option');
        options[correctAnswer].classList.add('correct');
        
        if (window.selectedOption !== correctAnswer) {
            options[window.selectedOption].classList.add('incorrect');
        }
        
        // Desabilitar botão durante a transição
        document.getElementById('quizNextBtn').disabled = true;
        
        // Verificar se é a última pergunta
        if (window.currentQuizQuestion < window.quizQuestions.length - 1) {
            // Próxima pergunta após um delay
            setTimeout(() => {
                window.currentQuizQuestion++;
                window.loadQuestion(window.currentQuizQuestion);
                
                // Atualizar progresso
                document.getElementById(`step-${window.currentQuizQuestion + 1}`).className = 'progress-step active';
            }, 1500);
        } else {
            // Quiz completo
            setTimeout(() => {
                window.completeQuiz();
            }, 1500);
        }
    };
    
    // Atualizar a função loadQuestion para limpar seleções anteriores
    window.loadQuestion = function(questionIndex) {
        // Resetar a opção selecionada
        window.selectedOption = null;
        
        // Carregar a pergunta
        const question = window.quizQuestions[questionIndex];
        
        document.getElementById('question').textContent = question.question;
        
        // Atualizar as opções
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((option, index) => {
            option.textContent = question.options[index];
            option.className = 'quiz-option'; // Remover classes correct/incorrect/selected
            
            // Remover e readicionar eventos de clique para garantir que funcionem
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            // Adicionar evento de clique
            newOption.addEventListener('click', function() {
                window.selectOption(this, index);
            });
        });
        
        // Desabilitar botão de próxima
        document.getElementById('quizNextBtn').disabled = true;
    };
    
    // Adicionar estilos específicos para o quiz
    function addQuizStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .quiz-option {
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .quiz-option.selected {
                background: rgba(30, 144, 255, 0.2);
                border-color: #1e90ff;
            }
            
            .quiz-option.correct {
                background: rgba(0, 204, 102, 0.2);
                border-color: #00cc66;
            }
            
            .quiz-option.incorrect {
                background: rgba(255, 59, 92, 0.2);
                border-color: #ff3b5c;
            }
            
            #quizNextBtn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Inicializar correções
    addQuizStyles();
    
    // Garantir que os objetos globais existam
    if (typeof window.quizQuestions === 'undefined') {
        window.quizQuestions = [
            {
                question: "Em que ano a FURIA foi fundada?",
                options: ["2017", "2018", "2019", "2020"],
                answer: 0
            },
            {
                question: "Quem é o capitão da equipe de CS da FURIA?",
                options: ["KSCERATO", "FalleN", "yuurih", "drop"],
                answer: 1
            },
            {
                question: "Qual foi o primeiro Major que a FURIA participou?",
                options: ["FACEIT Major 2018", "IEM Katowice 2019", "StarLadder Berlin 2019", "PGL Stockholm 2021"],
                answer: 2
            },
            
        ];
    }
    
    if (typeof window.quizScore === 'undefined') {
        window.quizScore = 0;
    }
    
    if (typeof window.currentQuizQuestion === 'undefined') {
        window.currentQuizQuestion = 0;
    }
    
    if (typeof window.selectedOption === 'undefined') {
        window.selectedOption = null;
    }
    
    // Se o modal já estiver aberto, atualizar o quiz
    if (document.getElementById('quizModal').style.display === 'flex') {
        window.resetQuiz();
    }
    
    console.log('✅ Quiz FURIAX - Correção Específica Completa');
});
