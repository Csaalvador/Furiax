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