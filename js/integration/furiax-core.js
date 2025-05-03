/**
 * FURIAX Core Library - Sistema Integrado para Plataforma FURIAX
 * Versão: 1.0.0
 * 
 * Esta biblioteca contém funções compartilhadas que devem ser utilizadas
 * em todas as páginas da plataforma para garantir consistência.
 */

// Namespace global para FURIAX
window.FURIAX = window.FURIAX || {};

/**
 * Sistema de Gestão de Usuário
 */
FURIAX.UserSystem = (function() {
    // Constantes para armazenamento
    const STORAGE_KEYS = {
        PROFILE: 'furiaxProfile',
        CURRENT_USER: 'furiax_current_user',
        USER_PROGRESS: 'furiax_user_progress',
        SESSION_TOKEN: 'furiax_session_token',
        LOGIN_STREAK: 'furiax_login_streak'
    };

    // Estrutura padrão para perfil de usuário
    const DEFAULT_PROFILE = {
        username: "FuriaX_User",
        email: "",
        title: "novato",
        bio: "Olá, sou um fã da FURIA!",
        avatar: 1,
        level: 1,
        xpCurrent: 0,
        xpTotal: 100,
        wins: 0,
        trophies: 0,
        games: 0
    };

    // Mapeamento de títulos
    const TITLE_MAPPINGS = {
        "novato": "Novato",
        "iniciante": "Iniciante",
        "casual": "Jogador Casual",
        "competitivo": "Competidor",
        "furioso": "Furioso",
        "furioso_elite": "Furioso Elite",
        "lendario": "Furioso Lendário"
    };

    /**
     * Obtém o perfil do usuário atual
     * @returns {Object} Perfil completo do usuário
     */
    function getUserProfile() {
        const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)) || {...DEFAULT_PROFILE};
        return profile;
    }

    /**
     * Atualiza o perfil do usuário
     * @param {Object} profileData - Dados parciais ou completos para atualizar
     * @returns {Boolean} Sucesso da operação
     */
    function updateUserProfile(profileData) {
        try {
            const currentProfile = getUserProfile();
            const updatedProfile = {...currentProfile, ...profileData};
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
            updateProfileElements(updatedProfile);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            return false;
        }
    }

    /**
     * Verifica se o usuário está logado
     * @returns {Boolean} Estado de login
     */
    function isUserLoggedIn() {
        const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
        return !!(currentUser && sessionToken);
    }

    /**
     * Efetua logout do usuário
     */
    function logoutUser() {
        // Confirmar antes de sair
        if (!confirm("Você realmente deseja sair?")) {
            return false;
        }
        
        // Remover dados da sessão
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
        
        // Redirecionar para login
        window.location.href = getCorrectPath('login');
        return true;
    }

    /**
     * Atualiza elementos de UI com dados do perfil
     * @param {Object} profile - Dados do perfil
     */
    function updateProfileElements(profile) {
        if (!profile) profile = getUserProfile();
        
        // Atualizar nome de usuário onde aplicável
        const usernameElements = document.querySelectorAll('.user-name, #sidebarUsername, #profileName');
        usernameElements.forEach(el => {
            if (el) el.textContent = profile.username || DEFAULT_PROFILE.username;
        });
        
        // Atualizar título/cargo
        const titleText = TITLE_MAPPINGS[profile.title] || profile.title;
        const titleElements = document.querySelectorAll('.user-role, #sidebarTitle, #profileTitle, #previewTitle');
        titleElements.forEach(el => {
            if (el) el.textContent = titleText;
        });
        
        // Atualizar avatar se estiver usando imagem
        const avatarElements = document.querySelectorAll('.avatar-image');
        avatarElements.forEach(el => {
            if (el && el.tagName === 'IMG') {
                el.src = getAvatarUrl(profile.avatar);
                // Configurar fallback para caso a imagem falhe
                el.onerror = function() {
                    this.src = '../img/logo/logoFuriax.png';
                };
            }
        });
    }

    /**
     * Obtém a URL do avatar com base no ID
     * @param {Number} avatarId - ID do avatar
     * @returns {String} URL da imagem
     */
    function getAvatarUrl(avatarId) {
        const avatarMappings = {
            1: "../img/avatars/avatar01.jpg", 
            2: "../img/avatars/avatar02.jpg",
            3: "../img/avatars/avatar03.jpg",
            4: "../img/avatars/avatar04.png",
            5: "../img/avatars/avatar05.png",
            6: "../img/avatars/avatar06.jpg"
        };
        
        // Ajusta o caminho com base no ambiente (páginas ou raiz)
        const isInPagesDir = window.location.pathname.includes('/pages/');
        const prefix = isInPagesDir ? '../' : '';
        
        // Verifica se existe um mapeamento para este ID
        if (avatarMappings[avatarId]) {
            return avatarMappings[avatarId].replace('../', prefix);
        }
        
        // Se não encontrar, usa o placeholder como fallback
        return `${prefix}img/logo/logoFuriax.png`;
    }

    /**
     * Inicializa o sistema de usuário
     */
    function init() {
        // Verificar login e redirecionar se necessário
        if (!isUserLoggedIn() && !window.location.pathname.includes('login.html')) {
            window.location.href = getCorrectPath('login');
            return;
        }
        
        // Atualizar elementos de UI
        updateProfileElements();
        
        // Adicionar botão de logout ao sidebar se não existir
        addLogoutButton();
        
        console.log('✅ FURIAX User System inicializado');
    }

    /**
     * Adiciona o botão de logout à sidebar
     */
    function addLogoutButton() {
        // Encontrar o sidebar
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        // Verificar se o botão já existe
        if (document.querySelector('.logout-button')) return;
        
        // Criar botão de logout
        
        
        // Adicionar evento de logout
        logoutButton.addEventListener('click', logoutUser);
        
        // Adicionar ao sidebar antes do user-profile
        const profileSection = sidebar.querySelector('.user-profile');
        if (profileSection) {
            sidebar.insertBefore(logoutButton, profileSection);
        } else {
            sidebar.appendChild(logoutButton);
        }
    }

    // API pública
    return {
        init,
        getUserProfile,
        updateUserProfile,
        isUserLoggedIn,
        logoutUser,
        updateProfileElements,
        getAvatarUrl
    };
})();

/**
 * Sistema de Gamificação
 */
FURIAX.GamificationSystem = (function() {
    // Constantes para armazenamento
    const STORAGE_KEYS = {
        USER_PROGRESS: 'furiax_user_progress',
        MISSIONS: 'furiax_missions',
        ACHIEVEMENTS: 'furiax_achievements',
        GAMES_HISTORY: 'furiax_games_history'
    };

    /**
     * Adiciona XP ao usuário atual
     * @param {Number} xpAmount - Quantidade de XP a adicionar
     * @returns {Object} Dados atualizados de progresso
     */
    function addUserXP(xpAmount) {
        if (!xpAmount || isNaN(xpAmount)) return null;
        
        try {
            // Obter usuário atual do sistema
            const currentUser = JSON.parse(localStorage.getItem('furiax_current_user')) || {};
            if (!currentUser.id) return null;
            
            // Obter progresso atual
            let userProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROGRESS)) || {};
            
            // Inicializar progresso do usuário se não existir
            if (!userProgress[currentUser.id]) {
                userProgress[currentUser.id] = {
                    level: 1,
                    xp: 0,
                    totalXP: 0
                };
            }
            
            // Adicionar XP
            userProgress[currentUser.id].xp += xpAmount;
            userProgress[currentUser.id].totalXP += xpAmount;
            
            // Verificar level up
            const userProgressData = checkLevelUp(userProgress[currentUser.id]);
            userProgress[currentUser.id] = userProgressData;
            
            // Salvar progresso atualizado
            localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(userProgress));
            
            // Atualizar UI
            updateXPDisplay(userProgressData);
            
            // Mostrar notificação
            FURIAX.NotificationSystem.show(`+${xpAmount} XP adicionado!`, 'success');
            
            return userProgressData;
        } catch (error) {
            console.error('Erro ao adicionar XP:', error);
            return null;
        }
    }

    /**
     * Verifica se o usuário subiu de nível e atualiza dados
     * @param {Object} progressData - Dados de progresso atual
     * @returns {Object} Dados atualizados
     */
    function checkLevelUp(progressData) {
        // Fórmula de XP: cada nível requer 100 * nível atual
        const requiredXP = 100 * progressData.level;
        
        // Verificar se há XP suficiente para subir de nível
        if (progressData.xp >= requiredXP) {
            // Subir de nível
            progressData.level += 1;
            progressData.xp -= requiredXP;
            
            // Mostrar notificação de level up
            FURIAX.NotificationSystem.show(`Parabéns! Você avançou para o nível ${progressData.level}!`, 'success', 5000);
            
            // Verificar se há mais levels a subir
            return checkLevelUp(progressData);
        }
        
        return progressData;
    }

    /**
     * Atualiza elementos de UI com progresso de XP
     * @param {Object} progressData - Dados de progresso
     */
    function updateXPDisplay(progressData) {
        if (!progressData) return;
        
        // Atualizar elementos de nível
        const levelElements = document.querySelectorAll('#previewLevel, #userLevel');
        levelElements.forEach(el => {
            if (el) el.textContent = `Nível ${progressData.level}`;
        });
        
        // Atualizar elementos de XP
        const xpElements = document.querySelectorAll('#previewXP, #userXP');
        xpElements.forEach(el => {
            if (el) el.textContent = `${progressData.xp}/${100 * progressData.level} XP`;
        });
        
        // Atualizar barras de progresso
        const progressBars = document.querySelectorAll('.progress-fill, #progressBar');
        const progressPercentage = (progressData.xp / (100 * progressData.level)) * 100;
        progressBars.forEach(el => {
            if (el) el.style.width = `${progressPercentage}%`;
        });
        
        // Atualizar XP total
        const totalXPElements = document.querySelectorAll('#totalXP, #statsXP');
        totalXPElements.forEach(el => {
            if (el) el.textContent = progressData.totalXP;
        });
    }

    /**
     * Atualiza progresso em uma missão
     * @param {String} missionId - ID da missão
     * @param {Number} progress - Progresso a adicionar (padrão: 1)
     * @returns {Object} Dados atualizados da missão
     */
    function updateMissionProgress(missionId, progress = 1) {
        if (!missionId) return null;
        
        try {
            // Carregar missões
            const missions = JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSIONS)) || [];
            
            // Encontrar a missão
            const missionIndex = missions.findIndex(m => m.id === missionId);
            if (missionIndex === -1) return null;
            
            // Atualizar progresso
            missions[missionIndex].progress += progress;
            
            // Verificar se completou
            if (!missions[missionIndex].completed && 
                missions[missionIndex].progress >= missions[missionIndex].goal) {
                
                // Marcar como completa
                missions[missionIndex].completed = true;
                
                // Conceder recompensa de XP
                addUserXP(missions[missionIndex].xpReward);
                
                // Mostrar notificação
                FURIAX.NotificationSystem.show(`Missão concluída: ${missions[missionIndex].title}`, 'success', 5000);
            }
            
            // Salvar missões atualizadas
            localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
            
            return missions[missionIndex];
        } catch (error) {
            console.error('Erro ao atualizar missão:', error);
            return null;
        }
    }

    /**
     * Desbloqueia uma conquista
     * @param {String} achievementId - ID da conquista
     * @returns {Object} Dados da conquista
     */
    function unlockAchievement(achievementId) {
        if (!achievementId) return null;
        
        try {
            // Carregar conquistas
            const achievements = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) || [];
            
            // Encontrar a conquista
            const achievementIndex = achievements.findIndex(a => a.id === achievementId);
            if (achievementIndex === -1) return null;
            
            // Verificar se já foi desbloqueada
            if (achievements[achievementIndex].unlocked) return achievements[achievementIndex];
            
            // Marcar como desbloqueada
            achievements[achievementIndex].unlocked = true;
            achievements[achievementIndex].unlockedDate = new Date().toISOString();
            
            // Conceder recompensa de XP
            addUserXP(achievements[achievementIndex].xpReward);
            
            // Salvar conquistas atualizadas
            localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
            
            // Mostrar notificação
            FURIAX.NotificationSystem.show(`Conquista desbloqueada: ${achievements[achievementIndex].title}`, 'success', 5000);
            
            return achievements[achievementIndex];
        } catch (error) {
            console.error('Erro ao desbloquear conquista:', error);
            return null;
        }
    }

    /**
     * Inicializa o sistema de gamificação
     */
    function init() {
        // Carregar progresso atual
        const currentUser = JSON.parse(localStorage.getItem('furiax_current_user')) || {};
        if (currentUser.id) {
            const userProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROGRESS)) || {};
            if (userProgress[currentUser.id]) {
                updateXPDisplay(userProgress[currentUser.id]);
            }
        }
        
        // Inicializar outros componentes relacionados
        // ...
        
        console.log('✅ FURIAX Gamification System inicializado');
    }

    // API pública
    return {
        init,
        addUserXP,
        updateMissionProgress,
        unlockAchievement
    };
})();

/**
 * Sistema de Notificações
 */
FURIAX.NotificationSystem = (function() {
    // ID da notificação atual
    let currentNotification = null;
    // Fila de notificações
    let notificationQueue = [];
    
    /**
     * Exibe uma notificação
     * @param {String} message - Mensagem da notificação
     * @param {String} type - Tipo de notificação: success, error, warning, info
     * @param {Number} duration - Duração em ms (padrão: 3000)
     */
    function show(message, type = 'info', duration = 3000) {
        // Criar objeto de notificação
        const notification = {
            message,
            type,
            duration
        };
        
        // Adicionar à fila
        notificationQueue.push(notification);
        
        // Mostrar se não houver outra notificação ativa
        if (!currentNotification) {
            processQueue();
        }
    }
    
    /**
     * Processa a fila de notificações
     */
    function processQueue() {
        // Verificar se há notificações na fila
        if (notificationQueue.length === 0) {
            currentNotification = null;
            return;
        }
        
        // Obter próxima notificação
        const notification = notificationQueue.shift();
        currentNotification = notification;
        
        // Verificar se elemento existe, ou criar
        let notificationElement = document.getElementById('furiaxNotification');
        
        if (!notificationElement) {
            notificationElement = document.createElement('div');
            notificationElement.id = 'furiaxNotification';
            
            // Estilizar elemento
            Object.assign(notificationElement.style, {
                position: 'fixed',
                bottom: '-60px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px 20px',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                zIndex: '1000',
                transition: 'bottom 0.3s ease-in-out',
                color: 'white',
                fontFamily: "'Exo 2', sans-serif"
            });
            
            // Adicionar ao DOM
            document.body.appendChild(notificationElement);
            
            // Adicionar estilos para os tipos
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                #furiaxNotification.active {
                    bottom: 20px;
                }
                
                #furiaxNotification.success {
                    background: linear-gradient(90deg, #00cc66, #33d67d);
                }
                
                #furiaxNotification.warning {
                    background: linear-gradient(90deg, #ff9900, #ff6600);
                }
                
                #furiaxNotification.error {
                    background: linear-gradient(90deg, #ff3b5c, #ff0044);
                }
                
                #furiaxNotification.info {
                    background: linear-gradient(90deg, #1e90ff, #0066cc);
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // Determinar ícone com base no tipo
        let icon;
        switch (notification.type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
                break;
        }
        
        // Atualizar conteúdo
        notificationElement.innerHTML = `${icon} <span>${notification.message}</span>`;
        
        // Limpar classes anteriores
        notificationElement.className = '';
        
        // Adicionar classe de tipo
        notificationElement.classList.add(notification.type);
        
        // Mostrar
        setTimeout(() => {
            notificationElement.classList.add('active');
        }, 10);
        
        // Esconder após o tempo especificado
        setTimeout(() => {
            notificationElement.classList.remove('active');
            
            // Processar próxima notificação após esconder
            setTimeout(() => {
                processQueue();
            }, 300);
        }, notification.duration);
    }
    
    /**
     * Inicializa o sistema de notificações
     */
    function init() {
        // Verificar se já existe elemento de notificação
        const existingElement = document.getElementById('furiaxNotification');
        if (existingElement) {
            existingElement.remove();
        }
        
        console.log('✅ FURIAX Notification System inicializado');
    }
    
    // API pública
    return {
        init,
        show
    };
})();

/**
 * Utilitários
 */
FURIAX.Utils = (function() {
    /**
     * Detecta o ambiente atual para gerar caminhos corretos
     * @param {String} page - Nome da página
     * @returns {String} Caminho correto
     */
    function getCorrectPath(page) {
        // Remover .html se presente
        const pageName = page.endsWith('.html') ? page.slice(0, -5) : page;
        
        // Detectar se estamos na pasta pages
        const isInPagesDir = window.location.pathname.includes('/pages/');
        
        if (pageName === 'login') {
            return isInPagesDir ? 'login.html' : 'pages/login.html';
        } else if (pageName === 'index' || pageName === 'home') {
            return isInPagesDir ? '../index.html' : 'index.html';
        } else {
            // Para outras páginas
            return isInPagesDir ? pageName + '.html' : 'pages/' + pageName + '.html';
        }
    }
    
    /**
     * Formata uma data para exibição
     * @param {String|Date} date - Data a formatar
     * @param {String} format - Formato: 'short', 'long', 'time'
     * @returns {String} Data formatada
     */
    function formatDate(date, format = 'short') {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        switch (format) {
            case 'short':
                return dateObj.toLocaleDateString('pt-BR');
            case 'long':
                return dateObj.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'time':
                return dateObj.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'full':
                return dateObj.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            default:
                return dateObj.toLocaleDateString('pt-BR');
        }
    }
    
    /**
     * Formata um valor monetário
     * @param {Number} value - Valor a formatar
     * @returns {String} Valor formatado
     */
    function formatCurrency(value) {
        if (isNaN(value)) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
    
    /**
     * Gera um ID único
     * @returns {String} ID único
     */
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    /**
     * Valida um endereço de email
     * @param {String} email - Email a validar
     * @returns {Boolean} Validade
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Calcula tempo relativo (ex: "há 2 horas")
     * @param {String|Date} date - Data a calcular
     * @returns {String} Tempo relativo
     */
    function timeAgo(date) {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffMs = now - dateObj;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffMonth / 12);
        
        if (diffSec < 60) {
            return 'agora';
        } else if (diffMin < 60) {
            return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
        } else if (diffHour < 24) {
            return `há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
        } else if (diffDay < 30) {
            return `há ${diffDay} ${diffDay === 1 ? 'dia' : 'dias'}`;
        } else if (diffMonth < 12) {
            return `há ${diffMonth} ${diffMonth === 1 ? 'mês' : 'meses'}`;
        } else {
            return `há ${diffYear} ${diffYear === 1 ? 'ano' : 'anos'}`;
        }
    }

    /**
     * Reordena uma lista de itens
     * @param {Array} array - Array a reordenar
     * @param {Number} oldIndex - Índice antigo
     * @param {Number} newIndex - Novo índice
     * @returns {Array} Array reordenado
     */
    function reorderArray(array, oldIndex, newIndex) {
        if (oldIndex < 0 || oldIndex >= array.length || 
            newIndex < 0 || newIndex >= array.length) {
            return array;
        }
        
        const newArray = [...array];
        const [movedItem] = newArray.splice(oldIndex, 1);
        newArray.splice(newIndex, 0, movedItem);
        
        return newArray;
    }

    /**
     * Limita um texto a um número máximo de caracteres
     * @param {String} text - Texto a limitar
     * @param {Number} maxLength - Comprimento máximo
     * @param {Boolean} addEllipsis - Adicionar "..." no fim
     * @returns {String} Texto limitado
     */
    function truncateText(text, maxLength, addEllipsis = true) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + (addEllipsis ? '...' : '');
    }

    /**
     * Cria e adiciona um script dinâmicamente
     * @param {String} src - URL do script
     * @param {Function} callback - Função de callback
     */
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        if (callback) {
            script.onload = callback;
        }
        
        document.head.appendChild(script);
    }
    
    // API pública
    return {
        getCorrectPath,
        formatDate,
        formatCurrency,
        generateUniqueId,
        isValidEmail,
        timeAgo,
        reorderArray,
        truncateText,
        loadScript
    };
})();

/**
 * Sistema de Sincronização de Dados
 */
FURIAX.SyncSystem = (function() {
    // Configurações
    const CONFIG = {
        AUTO_SYNC_INTERVAL: 300000, // 5 minutos
        STORAGE_KEYS: [
            'furiaxProfile',
            'furiax_current_user',
            'furiax_user_progress',
            'furiax_missions',
            'furiax_achievements',
            'furiax_games_history'
        ]
    };
    
    // Contador de sincronização
    let syncInterval = null;
    
    /**
     * Exporta todos os dados para um arquivo JSON
     */
    function exportData() {
        try {
            // Coletar dados de todas as chaves de armazenamento
            const data = {};
            
            CONFIG.STORAGE_KEYS.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    try {
                        data[key] = JSON.parse(value);
                    } catch (e) {
                        data[key] = value;
                    }
                }
            });
            
            // Criar blob com dados
            const blob = new Blob([JSON.stringify(data, null, 2)], { 
                type: 'application/json' 
            });
            
            // Criar URL do blob
            const url = URL.createObjectURL(blob);
            
            // Criar elemento de link para download
            const a = document.createElement('a');
            a.href = url;
            a.download = `furiax_backup_${new Date().toISOString().slice(0, 10)}.json`;
            
            // Simular clique para iniciar download
            document.body.appendChild(a);
            a.click();
            
            // Limpar
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Notificar sucesso
            FURIAX.NotificationSystem.show('Dados exportados com sucesso!', 'success');
            
            return true;
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            FURIAX.NotificationSystem.show('Erro ao exportar dados!', 'error');
            return false;
        }
    }
    
    /**
     * Importa dados de um arquivo JSON
     * @param {File} file - Arquivo JSON a importar
     * @returns {Promise<Boolean>} Sucesso da operação
     */
    function importData(file) {
        return new Promise((resolve, reject) => {
            if (!file || file.type !== 'application/json') {
                FURIAX.NotificationSystem.show('Arquivo inválido. Selecione um arquivo JSON.', 'error');
                reject(new Error('Arquivo inválido'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Verificar se é um backup válido
                    if (!data || typeof data !== 'object') {
                        throw new Error('Formato de backup inválido');
                    }
                    
                    // Confirmar importação
                    if (!confirm('Isso substituirá todos os seus dados atuais. Deseja continuar?')) {
                        reject(new Error('Importação cancelada pelo usuário'));
                        return;
                    }
                    
                    // Importar cada chave
                    Object.keys(data).forEach(key => {
                        if (CONFIG.STORAGE_KEYS.includes(key)) {
                            localStorage.setItem(key, JSON.stringify(data[key]));
                        }
                    });
                    
                    // Notificar sucesso
                    FURIAX.NotificationSystem.show('Dados importados com sucesso! Recarregando...', 'success');
                    
                    // Recarregar página após 2 segundos
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    
                    resolve(true);
                } catch (error) {
                    console.error('Erro ao importar dados:', error);
                    FURIAX.NotificationSystem.show('Erro ao importar dados: ' + error.message, 'error');
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                FURIAX.NotificationSystem.show('Erro ao ler o arquivo!', 'error');
                reject(new Error('Erro ao ler o arquivo'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Sincroniza dados com o servidor (simulado)
     * @returns {Promise<Boolean>} Sucesso da operação
     */
    function syncWithServer() {
        return new Promise((resolve) => {
            // Simulação de sincronização
            console.log('🔄 Sincronizando dados com o servidor...');
            
            // Simular atraso de rede
            setTimeout(() => {
                console.log('✅ Sincronização concluída!');
                resolve(true);
            }, 1500);
        });
    }
    
    /**
     * Inicia sincronização automática
     */
    function startAutoSync() {
        if (syncInterval) {
            clearInterval(syncInterval);
        }
        
        syncInterval = setInterval(() => {
            syncWithServer()
                .then(success => {
                    if (success) {
                        console.log('✅ Sincronização automática concluída');
                    }
                })
                .catch(error => {
                    console.error('❌ Erro na sincronização automática:', error);
                });
        }, CONFIG.AUTO_SYNC_INTERVAL);
        
        console.log(`🔄 Sincronização automática iniciada (intervalo: ${CONFIG.AUTO_SYNC_INTERVAL / 1000}s)`);
    }
    
    /**
     * Para sincronização automática
     */
    function stopAutoSync() {
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
            console.log('🛑 Sincronização automática parada');
        }
    }
    
    /**
     * Inicializa o sistema de sincronização
     */
    function init() {
        // Iniciar sincronização automática
        startAutoSync();
        
        console.log('✅ FURIAX Sync System inicializado');
    }
    
    // API pública
    return {
        init,
        exportData,
        importData,
        syncWithServer,
        startAutoSync,
        stopAutoSync
    };
})();

/**
 * Sistema de Tema (Dark/Light)
 */
FURIAX.ThemeSystem = (function() {
    // Chave de armazenamento do tema
    const THEME_STORAGE_KEY = 'furiax_theme';
    
    // Temas disponíveis
    const THEMES = {
        DARK: 'dark',
        LIGHT: 'light'
    };
    
    /**
     * Obtém o tema atual
     * @returns {String} Nome do tema
     */
    function getCurrentTheme() {
        return localStorage.getItem(THEME_STORAGE_KEY) || THEMES.DARK;
    }
    
    /**
     * Define o tema
     * @param {String} theme - Nome do tema
     */
    function setTheme(theme) {
        if (theme !== THEMES.DARK && theme !== THEMES.LIGHT) {
            console.error('Tema inválido:', theme);
            return;
        }
        
        // Salvar tema
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        
        // Aplicar tema
        applyTheme(theme);
    }
    
    /**
     * Aplica o tema ao DOM
     * @param {String} theme - Nome do tema
     */
    function applyTheme(theme) {
        if (theme === THEMES.LIGHT) {
            // Tema claro
            document.documentElement.style.setProperty('--dark', '#f4f4f4');
            document.documentElement.style.setProperty('--darker', '#e0e0e0');
            document.documentElement.style.setProperty('--medium', '#ccc');
            document.documentElement.style.setProperty('--light', '#222');
            document.documentElement.style.setProperty('--gray', '#555');
            
            // Aplicar classe ao body
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        } else {
            // Tema escuro (padrão)
            document.documentElement.style.setProperty('--dark', '#111');
            document.documentElement.style.setProperty('--darker', '#0a0a0a');
            document.documentElement.style.setProperty('--medium', '#333');
            document.documentElement.style.setProperty('--light', '#f0f0f0');
            document.documentElement.style.setProperty('--gray', '#aaa');
            
            // Aplicar classe ao body
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        }
    }
    
    /**
     * Alterna entre os temas
     */
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        setTheme(newTheme);
    }
    
    /**
     * Adiciona botão de alternar tema à página
     */
    function addThemeToggleButton() {
        // Verificar se já existe
        if (document.getElementById('theme-toggle-btn')) return;
        
        // Criar botão
        const button = document.createElement('button');
        button.id = 'theme-toggle-btn';
        button.className = 'theme-toggle-btn';
        button.innerHTML = getCurrentTheme() === THEMES.DARK ? 
            '<i class="fas fa-sun"></i>' : 
            '<i class="fas fa-moon"></i>';
        
        // Estilizar botão
        Object.assign(button.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(30, 144, 255, 0.1)',
            border: '1px solid var(--medium)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: '900',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s'
        });
        
        // Adicionar evento
        button.addEventListener('click', () => {
            toggleTheme();
            
            // Alterar ícone
            button.innerHTML = getCurrentTheme() === THEMES.DARK ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        });
        
        // Adicionar ao DOM
        document.body.appendChild(button);
    }
    
    /**
     * Inicializa o sistema de tema
     */
    function init() {
        // Aplicar tema atual
        applyTheme(getCurrentTheme());
        
        // Adicionar botão de alternar tema
        addThemeToggleButton();
        
        console.log('✅ FURIAX Theme System inicializado');
    }
    
    // API pública
    return {
        init,
        getCurrentTheme,
        setTheme,
        toggleTheme
    };
})();

/**
 * Sistema de Partículas (Efeito Visual)
 */
FURIAX.ParticlesSystem = (function() {
    /**
     * Cria partículas para efeito visual de fundo
     */
    function createParticles() {
        // Verificar se já existe contêiner de partículas
        let container = document.querySelector('.particles-container');
        
        if (!container) {
            // Criar contêiner
            container = document.createElement('div');
            container.className = 'particles-container';
            document.body.appendChild(container);
        } else {
            // Limpar contêiner existente
            container.innerHTML = '';
        }
        
        // Criar partículas
        const numParticles = 30;
        
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Posicionar aleatoriamente
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Tamanhos variados
            const size = Math.random() * 8 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Opacidade variada
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            
            // Animação com delay variável
            const duration = Math.random() * 25 + 15; // 15-40s
            const delay = Math.random() * 10;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            container.appendChild(particle);
        }
    }
    
    /**
     * Inicializa o sistema de partículas
     */
    function init() {
        // Criar partículas
        createParticles();
        
        console.log('✅ FURIAX Particles System inicializado');
    }
    
    // API pública
    return {
        init,
        createParticles
    };
})();

/**
 * Inicializador Global FURIAX
 */
FURIAX.init = function() {
    // Definir função getCorrectPath global para compatibilidade
    window.getCorrectPath = FURIAX.Utils.getCorrectPath;
    
    // Inicializar subsistemas
    FURIAX.NotificationSystem.init();
    FURIAX.UserSystem.init();
    FURIAX.GamificationSystem.init();
    FURIAX.ThemeSystem.init();
    FURIAX.ParticlesSystem.init();
    FURIAX.SyncSystem.init();
    
    // Configurar adaptações para dispositivos móveis
    setupMobileAdaptations();
    
    console.log('🚀 Sistema FURIAX inicializado com sucesso!');
    
    // Verificar se há alguma notificação pendente
    const pendingNotification = localStorage.getItem('furiax_pending_notification');
    if (pendingNotification) {
        try {
            const notification = JSON.parse(pendingNotification);
            FURIAX.NotificationSystem.show(
                notification.message, 
                notification.type, 
                notification.duration
            );
            localStorage.removeItem('furiax_pending_notification');
        } catch (e) {
            console.error('Erro ao processar notificação pendente:', e);
        }
    }
};

/**
 * Configurações para adaptação em dispositivos móveis
 */
function setupMobileAdaptations() {
    // Verificar se é dispositivo móvel
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Adicionar classe ao body
        document.body.classList.add('mobile-device');
        
        // Configurar sidebar móvel
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            // Botão para mostrar/esconder sidebar em dispositivos móveis
            const toggleButton = document.createElement('button');
            toggleButton.className = 'sidebar-toggle';
            toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
            
            // Estilizar botão
            Object.assign(toggleButton.style, {
                position: 'fixed',
                top: '20px',
                left: '20px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: '1001',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s'
            });
            
            // Adicionar evento
            toggleButton.addEventListener('click', () => {
                sidebar.classList.toggle('show-sidebar');
                toggleButton.classList.toggle('active');
                
                // Alterar ícone
                if (sidebar.classList.contains('show-sidebar')) {
                    toggleButton.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
            
            // Adicionar ao DOM
            document.body.appendChild(toggleButton);
            
            // Fechar sidebar ao clicar fora
            document.addEventListener('click', (event) => {
                if (sidebar.classList.contains('show-sidebar') && 
                    !sidebar.contains(event.target) && 
                    event.target !== toggleButton) {
                    sidebar.classList.remove('show-sidebar');
                    toggleButton.classList.remove('active');
                    toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
            
            // Estilizar sidebar para móvel
            sidebar.classList.add('sidebar-mobile');
            Object.assign(sidebar.style, {
                transform: 'translateX(-100%)',
                transition: 'transform 0.3s ease-in-out'
            });
            
            // Adicionar regra CSS para mostrar sidebar
            const style = document.createElement('style');
            style.textContent = `
                .sidebar-mobile.show-sidebar {
                    transform: translateX(0) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Auto-inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', FURIAX.init);