// SCRIPT DE CORREÇÃO COMPLETO - FURIAX MINI-GAMES
// Versão: 2.0
// Correção de bugs relacionados ao armazenamento de XP e missões

// Variáveis globais para controle de estado
let DEBUG_MODE = true; // Ative para ver logs detalhados no console
let initializing = true; // Para evitar atualizações durante a inicialização

// Função para facilitar o debug
function log(message, data) {
    if (DEBUG_MODE) {
        if (data) {
            console.log(`[FURIAX DEBUG] ${message}`, data);
        } else {
            console.log(`[FURIAX DEBUG] ${message}`);
        }
    }
}

// Solução para problemas comuns no localStorage
function safeGetFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        if (data === null || data === undefined) return defaultValue;
        
        const parsed = JSON.parse(data);
        return parsed;
    } catch (error) {
        log(`Erro ao recuperar ${key} do localStorage:`, error);
        return defaultValue;
    }
}

function safeSetToStorage(key, value) {
    try {
        const stringValue = JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        return true;
    } catch (error) {
        log(`Erro ao salvar ${key} no localStorage:`, error);
        return false;
    }
}

// Função definitiva para adicionar XP ao usuário
function addUserXP(xpAmount) {
    if (!xpAmount || isNaN(xpAmount) || xpAmount <= 0) {
        log(`Tentativa de adicionar valor de XP inválido: ${xpAmount}`);
        return false;
    }
    
    // Obter usuário atual
    const currentUser = safeGetFromStorage('furiax_current_user', {});
    if (!currentUser || !currentUser.id) {
        log("Nenhum usuário logado para adicionar XP");
        return false;
    }
    
    // Obter progresso atual
    let userProgress = safeGetFromStorage('furiax_user_progress', {});
    
    // Garantir que a estrutura esteja correta
    if (!userProgress[currentUser.id]) {
        userProgress[currentUser.id] = {
            level: 1,
            xp: 0,
            totalXP: 0
        };
    }
    
    // Garantir que os valores sejam numéricos
    let currentXP = parseInt(userProgress[currentUser.id].xp || 0);
    let currentTotalXP = parseInt(userProgress[currentUser.id].totalXP || 0);
    
    // Adicionar XP
    currentXP += xpAmount;
    currentTotalXP += xpAmount;
    
    userProgress[currentUser.id].xp = currentXP;
    userProgress[currentUser.id].totalXP = currentTotalXP;
    
    // Verificar level up (opcional)
    const xpPerLevel = 200; // Ajustar conforme necessário
    const newLevel = Math.floor(currentXP / xpPerLevel) + 1;
    
    if (newLevel > userProgress[currentUser.id].level) {
        userProgress[currentUser.id].level = newLevel;
        showNotification(`Level up! Você alcançou o nível ${newLevel}!`, 'success');
    }
    
    // Salvar no localStorage com verificação dupla
    const saved = safeSetToStorage('furiax_user_progress', userProgress);
    
    if (saved) {
        // Tentar ler novamente para garantir que salvou corretamente
        const savedCheck = safeGetFromStorage('furiax_user_progress', {});
        
        if (savedCheck[currentUser.id] && savedCheck[currentUser.id].totalXP === currentTotalXP) {
            log(`XP adicionado com sucesso: +${xpAmount}, Total: ${currentTotalXP}`);
        } else {
            log("ALERTA: Verificação de salvamento falhou, tentando novamente...");
            // Tentar salvar novamente com um pequeno atraso
            setTimeout(() => {
                safeSetToStorage('furiax_user_progress', userProgress);
            }, 100);
        }
    }
    
    // Atualizar exibição na interface
    const totalXPElement = document.getElementById('totalXP');
    if (totalXPElement) {
        totalXPElement.textContent = currentTotalXP;
    }
    
    return currentTotalXP;
}

// Melhorias nas funções de missão
function updateMissionProgress(missionId, increment = 1) {
    if (!missionId) return false;
    
    try {
        const missions = safeGetFromStorage('furiax_missions', []);
        const missionIndex = missions.findIndex(m => m.id === missionId);
        
        if (missionIndex === -1) {
            log(`Missão não encontrada: ${missionId}`);
            return false;
        }
        
        // Verificar se a missão já foi concluída
        if (missions[missionIndex].completed) {
            log(`Missão ${missionId} já está concluída`);
            return false;
        }
        
        // Incrementar progresso
        missions[missionIndex].progress += increment;
        
        // Verificar se atingiu o objetivo
        if (missions[missionIndex].progress >= missions[missionIndex].goal) {
            missions[missionIndex].completed = true;
            missions[missionIndex].progress = missions[missionIndex].goal;
            
            // Adicionar XP da recompensa
            if (missions[missionIndex].xpReward) {
                addUserXP(missions[missionIndex].xpReward);
                showNotification(`Missão concluída! +${missions[missionIndex].xpReward} XP`, 'success');
            }
        }
        
        // Salvar missões atualizadas
        safeSetToStorage('furiax_missions', missions);
        return true;
    } catch (error) {
        log("Erro ao atualizar progresso da missão:", error);
        return false;
    }
}

// Função melhorada para desbloquear conquistas
function unlockAchievement(achievementId) {
    if (!achievementId) return false;
    
    try {
        const achievements = safeGetFromStorage('furiax_achievements', {});
        const userData = safeGetFromStorage('furiax_current_user', {});
        
        if (!userData.id) {
            log("Nenhum usuário logado para desbloquear conquista");
            return false;
        }
        
        // Inicializar estrutura se necessário
        if (!achievements[userData.id]) {
            achievements[userData.id] = [];
        }
        
        // Verificar se já tem a conquista
        if (achievements[userData.id].includes(achievementId)) {
            log(`Conquista ${achievementId} já desbloqueada`);
            return false;
        }
        
        // Adicionar conquista
        achievements[userData.id].push(achievementId);
        
        // Salvar conquistas atualizadas
        safeSetToStorage('furiax_achievements', achievements);
        
        // Mostrar notificação
        showNotification('Nova conquista desbloqueada!', 'success');
        
        return true;
    } catch (error) {
        log("Erro ao desbloquear conquista:", error);
        return false;
    }
}

// Corrigindo o problema no monitoramento de jogos completados
function markGameAsCompleted(gameId, score = 0) {
    if (!gameId) return false;
    
    try {
        const gameHistory = safeGetFromStorage('furiax_games_history', {});
        const today = new Date().toDateString();
        
        // Inicializar estrutura se necessário
        if (!gameHistory[gameId]) {
            gameHistory[gameId] = {
                timesPlayed: 0,
                highScore: 0
            };
        }
        
        // Atualizar dados
        gameHistory[gameId].lastPlayed = today;
        gameHistory[gameId].timesPlayed = (gameHistory[gameId].timesPlayed || 0) + 1;
        
        if (score > (gameHistory[gameId].highScore || 0)) {
            gameHistory[gameId].highScore = score;
        }
        
        // Salvar histórico atualizado
        const saved = safeSetToStorage('furiax_games_history', gameHistory);
        
        if (saved) {
            // Atualizar missão de mini-games
            updateMissionProgress('daily_games');
            log(`Jogo ${gameId} marcado como concluído. Verificação: `, gameHistory[gameId]);
            return true;
        } else {
            log(`Falha ao salvar conclusão do jogo ${gameId}`);
            return false;
        }
    } catch (error) {
        log("Erro ao marcar jogo como concluído:", error);
        return false;
    }
}

// Correção da função completeQuiz
function completeQuiz() {
    // Calcular XP
    const xpEarned = quizScore * 20;
    
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
                Você acertou ${quizScore} de ${quizQuestions.length} perguntas.
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
    document.getElementById('quizNextBtn').textContent = 'Concluir';
    document.getElementById('quizNextBtn').disabled = false;
    
    // Adicionar XP ao localStorage diretamente
    const currentUser = JSON.parse(localStorage.getItem('furiax_current_user') || '{}');
    if (currentUser.id) {
        let userProgress = JSON.parse(localStorage.getItem('furiax_user_progress') || '{}');
        
        // Inicializar se não existir
        if (!userProgress[currentUser.id]) {
            userProgress[currentUser.id] = {
                level: 1,
                xp: 0,
                totalXP: 0
            };
        }
        
        // Adicionar XP
        userProgress[currentUser.id].xp += xpEarned;
        userProgress[currentUser.id].totalXP += xpEarned;
        
        // Salvar
        localStorage.setItem('furiax_user_progress', JSON.stringify(userProgress));
        
        // Atualizar display de XP
        document.getElementById('totalXP').textContent = userProgress[currentUser.id].totalXP;
    }
}
    
    //

// Correção da função checkWordAnswer
function checkWordAnswer() {
    const userAnswer = document.getElementById('wordInput').value.trim().toUpperCase();
    const correctAnswer = "VALORANT";
    
    if (userAnswer === correctAnswer) {
        // Resposta correta
        const xpEarned = 25;
        
        // Atualizar interface
        document.getElementById('wordInput').disabled = true;
        document.getElementById('wordInput').value = correctAnswer;
        
        // Mostrar letras
        document.getElementById('wordLetters').style.display = 'flex';
        
        // Adicionar XP com a função corrigida
        addUserXP(xpEarned);
        
        // Marcar jogo como concluído
        markGameAsCompleted('word_game');
        
        // Mostrar notificação
        showNotification(`Palavra correta! +${xpEarned} XP`, 'success');
        
        // Fechar modal após um delay
        setTimeout(() => {
            closeWordGameModal();
            
            // Atualizar interface de jogo concluído
            updateGameUI('word_game', 2);
            
            // Verificar missões e conquistas
            afterGameCompletion();
        }, 2000);
    } else {
        // Resposta incorreta
        showNotification('Tente novamente!', 'error');
    }
}

// Correção da função submitPredictions
function submitPredictions() {
    // Verificar se todas as partidas têm previsão
    const matchCount = document.querySelectorAll('.match-card').length;
    if (Object.keys(selectedPredictions).length < matchCount) {
        showNotification('Faça previsões para todas as partidas!', 'error');
        return;
    }
    
    // Calcular XP base por participação
    const xpEarned = 15 * matchCount;
    
    // Adicionar XP com a função corrigida
    addUserXP(xpEarned);
    
    // Marcar jogo como concluído
    markGameAsCompleted('predictions');
    
    // Salvar previsões
    safeSetToStorage('furiax_predictions', {
        predictions: selectedPredictions,
        date: new Date().toISOString()
    });
    
    // Mostrar notificação
    showNotification(`Previsões registradas! +${xpEarned} XP`, 'success');
    
    // Fechar modal
    closePredictionModal();
    
    // Atualizar interface de jogo concluído
    updateGameUI('predictions', 3);
    
    // Verificar missões e conquistas
    afterGameCompletion();
}

// Função auxiliar para atualizar a interface do jogo
function updateGameUI(gameId, cardIndex) {
    const gameCard = document.querySelector(`.game-card:nth-child(${cardIndex})`);
    if (!gameCard) {
        log(`Card não encontrado para o jogo ${gameId} no índice ${cardIndex}`);
        return;
    }
    
    const statusElement = gameCard.querySelector('.game-status');
    const buttonElement = gameCard.querySelector('.game-button');
    
    if (statusElement) {
        statusElement.className = 'game-status status-completed';
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Completado Hoje';
    }
    
    if (buttonElement) {
        buttonElement.className = 'game-button completed';
        buttonElement.textContent = 'Completado';
        
        // Salvar o onclick original e substituir
        const originalOnClick = buttonElement.getAttribute('onclick');
        buttonElement.setAttribute('data-original-onclick', originalOnClick);
        buttonElement.removeAttribute('onclick');
        
        buttonElement.onclick = function() {
            showNotification('Você já completou este mini-game hoje!', 'info');
        };
    }
    
    // Incrementar contador de jogos
    const gamesPlayedElement = document.getElementById('gamesPlayed');
    if (gamesPlayedElement) {
        const currentCount = parseInt(gamesPlayedElement.textContent || '0');
        gamesPlayedElement.textContent = currentCount + 1;
    }
}

// Função atualizada para inicialização de estatísticas
function updateStats() {
    if (initializing) {
        log("Atualizando estatísticas iniciais...");
    }
    
    // Atualizar XP total
    const currentUser = safeGetFromStorage('furiax_current_user', {});
    if (currentUser.id) {
        const userProgress = safeGetFromStorage('furiax_user_progress', {});
        
        if (userProgress[currentUser.id]) {
            const totalXP = parseInt(userProgress[currentUser.id].totalXP || 0);
            const totalXPElement = document.getElementById('totalXP');
            
            if (totalXPElement) {
                totalXPElement.textContent = totalXP;
                log("XP total atualizado para:", totalXP);
            }
        } else {
            const totalXPElement = document.getElementById('totalXP');
            if (totalXPElement) {
                totalXPElement.textContent = "0";
            }
            log("Nenhum progresso encontrado para o usuário, XP definido como 0");
        }
    } else {
        log("Nenhum usuário logado encontrado");
    }
    
    // Atualizar jogos completados
    const gameHistory = safeGetFromStorage('furiax_games_history', {});
    let totalGames = 0;
    
    Object.values(gameHistory).forEach(game => {
        if (game && typeof game === 'object' && typeof game.timesPlayed === 'number') {
            totalGames += game.timesPlayed;
        }
    });
    
    const gamesPlayedElement = document.getElementById('gamesPlayed');
    if (gamesPlayedElement) {
        gamesPlayedElement.textContent = totalGames;
    }
    log("Total de jogos atualizados para:", totalGames);
    
    // Atualizar streak
    const streak = parseInt(localStorage.getItem('furiax_login_streak') || '0');
    const streakElement = document.getElementById('streakDays');
    if (streakElement) {
        streakElement.textContent = streak;
    }
    log("Streak atualizado para:", streak);
}

// Função melhorada para verificar jogos já completos
function checkCompletedGamesOnLoad() {
    log("Verificando jogos completados...");
    const gameHistory = safeGetFromStorage('furiax_games_history', {});
    const today = new Date().toDateString();
    
    const gameMap = [
        { id: 'quiz', index: 1 },
        { id: 'word_game', index: 2 }, 
        { id: 'predictions', index: 3 }
    ];
    
    gameMap.forEach(game => {
        if (gameHistory[game.id] && gameHistory[game.id].lastPlayed === today) {
            log(`Jogo ${game.id} já foi completado hoje`);
            updateGameUI(game.id, game.index);
        }
    });
}

// Função para analisar e corrigir problemas no localStorage
function fixLocalStorage() {
    log("Verificando e corrigindo localStorage...");
    
    // Verificar usuário atual
    const currentUser = safeGetFromStorage('furiax_current_user', {});
    if (!currentUser || !currentUser.id) {
        log("Nenhum usuário logado encontrado - verificação do localStorage cancelada");
        return;
    }
    
    // Verificar e corrigir progresso do usuário
    let userProgress = safeGetFromStorage('furiax_user_progress', {});
    
    // Inicializar se não existir
    if (!userProgress[currentUser.id]) {
        log("Criando registro de progresso para o usuário:", currentUser.id);
        userProgress[currentUser.id] = {
            level: 1,
            xp: 0,
            totalXP: 0
        };
        safeSetToStorage('furiax_user_progress', userProgress);
    }
    
    // Verificar se os valores são válidos
    if (isNaN(userProgress[currentUser.id].totalXP)) {
        log("XP total inválido, corrigindo para 0");
        userProgress[currentUser.id].totalXP = 0;
        safeSetToStorage('furiax_user_progress', userProgress);
    }
    
    // Verificar e corrigir histórico de jogos
    let gameHistory = safeGetFromStorage('furiax_games_history', {});
    
    // Inicializar histórico de jogos faltantes
    ['quiz', 'word_game', 'predictions'].forEach(gameId => {
        if (!gameHistory[gameId]) {
            log(`Inicializando histórico para jogo: ${gameId}`);
            gameHistory[gameId] = {
                timesPlayed: 0,
                highScore: 0
            };
        }
    });
    
    safeSetToStorage('furiax_games_history', gameHistory);
    
    // Verificar missões
    let missions = safeGetFromStorage('furiax_missions', []);
    const hasDailyGames = missions.some(m => m.id === 'daily_games');
    
    if (!hasDailyGames) {
        log("Criando missão de mini-games diários");
        missions.push({
            id: 'daily_games',
            title: 'Gamer FURIA',
            description: 'Complete 3 mini-games diferentes',
            type: 'daily',
            goal: 3,
            progress: 0,
            xpReward: 100,
            icon: 'fas fa-gamepad',
            color: '#1e90ff',
            resetTime: Date.now() + 86400000, // 24 horas
            completed: false
        });
        
        safeSetToStorage('furiax_missions', missions);
    }
    
    log("Verificação e correção de localStorage concluídas");
}

// Lidar com erros de dependências
function ensureDependencies() {
    // Verificar e fornecer implementações para funções que podem estar faltando
    if (typeof window.updateMissionProgress !== 'function') {
        log("Implementando função updateMissionProgress");
        window.updateMissionProgress = updateMissionProgress;
    }
    
    if (typeof window.unlockAchievement !== 'function') {
        log("Implementando função unlockAchievement");
        window.unlockAchievement = unlockAchievement;
    }
    
    if (typeof initLoginStreak !== 'function') {
        log("Implementando função initLoginStreak");
        window.initLoginStreak = function() {
            const today = new Date().toDateString();
            const streakKey = 'furiax_login_streak';
            const lastDateKey = 'furiax_last_login_date';
            
            // Obter streak atual
            let streak = parseInt(localStorage.getItem(streakKey) || '0');
            const lastDate = localStorage.getItem(lastDateKey);
            
            if (!lastDate) {
                // Primeiro login
                streak = 1;
            } else if (lastDate !== today) {
                // Verificar se é consecutivo
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastDate === yesterday.toDateString()) {
                    // Incrementar streak
                    streak += 1;
                } else {
                    // Resetar streak
                    streak = 1;
                }
            }
            
            // Salvar dados
            localStorage.setItem(streakKey, streak.toString());
            localStorage.setItem(lastDateKey, today);
            
            // Atualizar UI
            const streakElement = document.getElementById('streakDays');
            if (streakElement) {
                streakElement.textContent = streak;
            }
        };
    }
    
    if (typeof checkGameAchievements !== 'function') {
        log("Implementando função checkGameAchievements");
        window.checkGameAchievements = function() {
            // Simples implementação para verificar conquistas
            const gameHistory = safeGetFromStorage('furiax_games_history', {});
            
            // Verificar quantidade total de jogos
            let totalPlayed = 0;
            Object.values(gameHistory).forEach(game => {
                if (game && typeof game === 'object') {
                    totalPlayed += (game.timesPlayed || 0);
                }
            });
            
            // Conquistas básicas baseadas no número de jogos
            if (totalPlayed >= 10) unlockAchievement('games_10');
            if (totalPlayed >= 50) unlockAchievement('games_50');
            
            // Verificar jogos completados hoje
            const today = new Date().toDateString();
            const completedToday = Object.values(gameHistory).filter(
                game => game && typeof game === 'object' && game.lastPlayed === today
            ).length;
            
            // Conquista por completar todos os jogos disponíveis
            const availableGames = 3; // quiz, word_game, predictions
            if (completedToday >= availableGames) {
                unlockAchievement('daily_all_games');
            }
        };
    }
}

// Função de inicialização corrigida
function initializeMiniGames() {
    log("Inicializando sistema de mini-games...");
    
    // Garantir dependências
    ensureDependencies();
    
    // Corrigir problemas no localStorage
    fixLocalStorage();
    
    // Verificar dias consecutivos (streak)
    if (typeof initLoginStreak === 'function') {
        initLoginStreak();
    }
    
    // Verificar jogos completados hoje
    checkCompletedGamesOnLoad();
    
    // Atualizar estatísticas
    updateStats();
    
    // Finalizar inicialização
    initializing = false;
    
    log("Inicialização do sistema de mini-games concluída");
}

// Função para processar eventos após a conclusão de um jogo
function afterGameCompletion() {
    log("Processando conclusão de jogo...");
    
    // Atualizar estatísticas na interface
    updateStats();
    
    // Verificar missões diárias
    updateMissionProgress('daily_games');
    
    // Verificar conquistas
    if (typeof checkGameAchievements === 'function') {
        checkGameAchievements();
    }
    
    log("Processamento de conclusão de jogo finalizado");
}

// Função melhorada para notificações
// (mantém a função original para compatibilidade)
// Adicione esta função ao login-page-script-new.js
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    
    if (!notification) {
        console.error('Elemento de notificação não encontrado!');
        // Fallback para alert se o elemento não existir
        alert(message);
        return;
    }
    
    // Definir texto
    notification.textContent = message;
    
    // Limpar classes anteriores
    notification.className = 'notification';
    
    // Adicionar classe de tipo
    if (type === 'success') notification.classList.add('success');
    if (type === 'error') notification.classList.add('error');
    
    // Mostrar notificação
    notification.classList.add('show');
    
    // Esconder após alguns segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
    
    console.log('Notificação mostrada:', message, '(tipo:', type, ')');
}