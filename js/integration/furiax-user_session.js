/**
 * FURIAX - Sistema de Gerenciamento de Sessão do Usuário (Versão Corrigida)
 * Responsável por manter a sessão do usuário consistente em todas as páginas
 * Substitua completamente o arquivo furiax-user_session.js por este
 */

// Inicializador de contexto de caminhos
(function() {
    // Função para obter o caminho correto com base no ambiente atual
    window.getCorrectPath = function(page) {
        const currentPath = window.location.pathname;
        const isInPagesDir = currentPath.includes('/pages/');
        
        // Remover extensão .html se presente
        const pageName = page.endsWith('.html') ? page.slice(0, -5) : page;
        
        if (pageName === 'login') {
            return isInPagesDir ? 'login.html' : 'pages/login.html';
        } else if (pageName === 'index' || pageName === 'home') {
            return isInPagesDir ? '../index.html' : 'index.html';
        } else {
            // Para outras páginas
            return isInPagesDir ? pageName + '.html' : 'pages/' + pageName + '.html';
        }
    };
    
    // Função para redirecionar para login
    window.redirectToLogin = function() {
        window.location.href = window.getCorrectPath('login');
    };
    
    // Função para redirecionar para home
    window.redirectToHome = function() {
        window.location.href = window.getCorrectPath('index');
    };
    
    console.log('Sistema de caminhos FURIAX inicializado.');
    console.log('Localização atual:', window.location.pathname);
    console.log('Está na pasta pages?', window.location.pathname.includes('/pages/'));
})();

// Configurações de armazenamento
const SESSION_CONFIG = {
    STORAGE_KEYS: {
        CURRENT_USER: 'furiax_current_user',
        USER_PROFILE: 'furiax_user_profile',
        SESSION_ID: 'furiax_session_id',
        SESSION_EXPIRES: 'furiax_session_expires'
    },
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
    REFRESH_INTERVAL: 60 * 1000 // Atualiza a cada 1 minuto
};

// Estado da sessão
let sessionState = {
    currentUser: null,
    profile: null,
    isAuthenticated: false,
    lastActivity: Date.now(),
    sessionInterval: null
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initUserSession();
});

/**
 * Inicializa a sessão do usuário
 */
function initUserSession() {
    console.log('Inicializando sistema de sessão de usuário FURIAX...');
    
    // Verificar se existe sessão ativa
    if (!validateSession()) {
        // Não há sessão válida, verificar se há usuário salvo
        const savedUser = loadUserFromStorage();
        
        if (savedUser) {
            // Há um usuário salvo, iniciar sessão
            createSession(savedUser);
        } else {
            // Nenhum usuário encontrado, mostrar login (exceto na página de login)
            const isLoginPage = window.location.pathname.includes('login.html');
            if (!isLoginPage) {
                console.log('Nenhum usuário autenticado, redirecionando para login...');
                window.redirectToLogin();
                return;
            }
            
            console.log('Nenhum usuário autenticado, mas já estamos na página de login.');
            return;
        }
    }
    
    // Carregar dados do usuário e perfil
    sessionState.currentUser = loadUserFromStorage();
    sessionState.profile = loadUserProfile(sessionState.currentUser.id);
    sessionState.isAuthenticated = true;
    
    // Atualizar últíma atividade
    updateLastActivity();
    
    // Iniciar intervalo de verificação da sessão
    startSessionMonitoring();
    
    // Atualizar interface com dados do usuário
    updateAllUserInterfaceElements();
    
    console.log('Sessão de usuário inicializada com sucesso:', sessionState.currentUser.username);
    
    // Configurar eventos
    setupActivityTracking();
}

/**
 * Verifica se a sessão atual é válida
 * @returns {boolean} True se a sessão for válida
 */
function validateSession() {
    const sessionId = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_ID);
    const expiresAt = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_EXPIRES);
    
    if (!sessionId || !expiresAt) {
        return false;
    }
    
    // Verificar se a sessão não expirou
    return parseInt(expiresAt) > Date.now();
}

/**
 * Cria uma nova sessão para o usuário
 * @param {Object} user Dados do usuário
 */
function createSession(user) {
    if (!user) {
        console.error('Tentativa de criar sessão sem usuário');
        return;
    }
    
    console.log('Criando sessão para usuário:', user.username || user.id);
    
    // Gerar ID de sessão aleatório
    const sessionId = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);   
    /**
 * FURIAX - Sistema de Gerenciamento de Sessão do Usuário (Versão Corrigida)
 * Responsável por manter a sessão do usuário consistente em todas as páginas
 * Substitua completamente o arquivo furiax-user_session.js por este
 */}

// Inicializador de contexto de caminhos
(function() {
    // Função para obter o caminho correto com base no ambiente atual
    window.getCorrectPath = function(page) {
        const currentPath = window.location.pathname;
        const isInPagesDir = currentPath.includes('/pages/');
        
        // Remover extensão .html se presente
        const pageName = page.endsWith('.html') ? page.slice(0, -5) : page;
        
        if (pageName === 'login') {
            return isInPagesDir ? 'login.html' : 'pages/login.html';
        } else if (pageName === 'index' || pageName === 'home') {
            return isInPagesDir ? '../index.html' : 'index.html';
        } 
    };

    
    // Função para redirecionar para login
    window.redirectToLogin = function() {
        window.location.href = window.getCorrectPath('login');
    };
    
    // Função para redirecionar para home
    window.redirectToHome = function() {
        window.location.href = window.getCorrectPath('index');
    };
    
    console.log('Sistema de caminhos FURIAX inicializado.');
    console.log('Localização atual:', window.location.pathname);
    console.log('Está na pasta pages?', window.location.pathname.includes('/pages/'));
})();

// Configurações de armazenamento
const SESSION_CONFIG = {
    STORAGE_KEYS: {
        CURRENT_USER: 'furiax_current_user',
        USER_PROFILE: 'furiax_user_profile',
        SESSION_ID: 'furiax_session_id',
        SESSION_EXPIRES: 'furiax_session_expires'
    },
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
    REFRESH_INTERVAL: 60 * 1000 // Atualiza a cada 1 minuto
};

// Estado da sessão
let sessionState = {
    currentUser: null,
    profile: null,
    isAuthenticated: false,
    lastActivity: Date.now(),
    sessionInterval: null
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initUserSession();
});

/**
 * Inicializa a sessão do usuário
 */
function initUserSession() {
    console.log('Inicializando sistema de sessão de usuário FURIAX...');
    
    // Verificar se existe sessão ativa
    if (!validateSession()) {
        // Não há sessão válida, verificar se há usuário salvo
        const savedUser = loadUserFromStorage();
        
        if (savedUser) {
            // Há um usuário salvo, iniciar sessão
            createSession(savedUser);
        } else {
            // Nenhum usuário encontrado, mostrar login (exceto na página de login)
            const isLoginPage = window.location.pathname.includes('login.html');
            if (!isLoginPage) {
                console.log('Nenhum usuário autenticado, redirecionando para login...');
                window.redirectToLogin();
                return;
            }
            
            console.log('Nenhum usuário autenticado, mas já estamos na página de login.');
            return;
        }
    }
    
    // Carregar dados do usuário e perfil
    sessionState.currentUser = loadUserFromStorage();
    sessionState.profile = loadUserProfile(sessionState.currentUser.id);
    sessionState.isAuthenticated = true;
    
    // Atualizar últíma atividade
    updateLastActivity();
    
    // Iniciar intervalo de verificação da sessão
    startSessionMonitoring();
    
    // Atualizar interface com dados do usuário
    updateAllUserInterfaceElements();
    
    console.log('Sessão de usuário inicializada com sucesso:', sessionState.currentUser.username);
    
    // Configurar eventos
    setupActivityTracking();
}

/**
 * Verifica se a sessão atual é válida
 * @returns {boolean} True se a sessão for válida
 */
function validateSession() {
    const sessionId = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_ID);
    const expiresAt = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_EXPIRES);
    
    if (!sessionId || !expiresAt) {
        return false;
    }
    
    // Verificar se a sessão não expirou
    return parseInt(expiresAt) > Date.now();
}

/**
 * Cria uma nova sessão para o usuário
 * @param {Object} user Dados do usuário
 */
function createSession(user) {
    if (!user) {
        console.error('Tentativa de criar sessão sem usuário');
        return;
    }
    
    console.log('Criando sessão para usuário:', user.username || user.id);
    
    // Gerar ID de sessão aleatório
    const sessionId = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Definir tempo de expiração (24 horas a partir de agora)
    const expiresAt = Date.now() + SESSION_CONFIG.SESSION_DURATION;
    
    // Salvar sessão no localStorage
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_ID, sessionId);
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_EXPIRES, expiresAt.toString());
    
    // Atualizar estado
    sessionState.isAuthenticated = true;
    sessionState.lastActivity = Date.now();
    
    console.log('Nova sessão criada para:', user.username);
    
    // Expor função globalmente para acesso de outros scripts
    window.createSession = createSession;
}

/**
 * Carrega o usuário atual do armazenamento local
 * @returns {Object|null} Dados do usuário ou null se não estiver logado
 */
function loadUserFromStorage() {
    try {
        const userData = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.CURRENT_USER);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        return null;
    }
}

/**
 * Carrega o perfil do usuário
 * @param {string} userId ID do usuário
 * @returns {Object} Perfil do usuário
 */
function loadUserProfile(userId) {
    try {
        const profilesData = localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.USER_PROFILE);
        const profiles = profilesData ? JSON.parse(profilesData) : {};
        
        return profiles[userId] || createDefaultProfile(userId);
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        return createDefaultProfile(userId);
    }
}

/**
 * Cria um perfil padrão para um novo usuário
 * @param {string} userId ID do usuário
 * @returns {Object} Perfil padrão
 */
function createDefaultProfile(userId) {
    const user = loadUserFromStorage();
    return {
        id: userId,
        username: user?.username || 'FuriaX_Pro',
        displayName: user?.displayName || user?.username || 'FuriaX_Pro',
        avatarBg: 'linear-gradient(45deg, #1e90ff, #00bfff)',
        avatarStyle: 1, // Estilo padrão
        title: 'Novato FURIA',
        bio: 'Fã da FURIA! Edite seu perfil para se apresentar à comunidade.',
        level: user?.level || 1,
        xpCurrent: 0,
        xpTotal: 100,
        stats: {
            posts: 0,
            comments: 0,
            likes: 0,
            wins: 0,
            trophies: 0,
            games: 0
        },
        settings: {
            theme: 'dark',
            notifications: true,
            privacy: 'public'
        },
        badges: [],
        joinDate: Date.now(),
        lastUpdated: Date.now()
    };
}

/**
 * Inicia monitoramento da sessão
 */
function startSessionMonitoring() {
    // Limpar intervalo existente se houver
    if (sessionState.sessionInterval) {
        clearInterval(sessionState.sessionInterval);
    }
    
    // Criar novo intervalo
    sessionState.sessionInterval = setInterval(() => {
        // Verificar se a sessão expirou
        if (!validateSession()) {
            // Sessão expirou, fazer logout
            console.log('Sessão expirada, fazendo logout...');
            logout();
            return;
        }
        
        // Verificar inatividade (30 minutos)
        const inactivityTime = Date.now() - sessionState.lastActivity;
        if (inactivityTime > 30 * 60 * 1000) {
            console.log('Sessão inativa por muito tempo, fazendo logout...');
            logout();
            return;
        }
        
        // Estender sessão se estiver perto de expirar (menos de 1 hora)
        const expiresAt = parseInt(localStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_EXPIRES));
        const timeRemaining = expiresAt - Date.now();
        
        if (timeRemaining < 60 * 60 * 1000) {
            console.log('Estendendo sessão...');
            extendSession();
        }
    }, SESSION_CONFIG.REFRESH_INTERVAL);
}

/**
 * Estende a sessão atual
 */
function extendSession() {
    // Novo tempo de expiração (24 horas a partir de agora)
    const expiresAt = Date.now() + SESSION_CONFIG.SESSION_DURATION;
    
    // Atualizar no localStorage
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_EXPIRES, expiresAt.toString());
    
    // Atualizar últíma atividade
    updateLastActivity();
}

/**
 * Atualiza o timestamp da última atividade do usuário
 */
function updateLastActivity() {
    sessionState.lastActivity = Date.now();
}

/**
 * Configurar rastreamento de atividade do usuário
 */
function setupActivityTracking() {
    // Rastrear eventos de interação do usuário
    const activityEvents = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(eventType => {
        document.addEventListener(eventType, () => {
            updateLastActivity();
        });
    });
}

/**
 * Faz logout do usuário atual
 */
function logout() {
    // Limpar dados da sessão
    localStorage.removeItem(SESSION_CONFIG.STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_EXPIRES);
    localStorage.removeItem('furiaxProfile');
    
    // Limpar intervalo
    if (sessionState.sessionInterval) {
        clearInterval(sessionState.sessionInterval);
        sessionState.sessionInterval = null;
    }
    
    // Atualizar estado
    sessionState.currentUser = null;
    sessionState.profile = null;
    sessionState.isAuthenticated = false;
    
    console.log('Logout realizado com sucesso');
    
    // Redirecionar para login
    window.redirectToLogin();
}

/**
 * Atualiza todos os elementos da interface com dados do usuário
 */
function updateAllUserInterfaceElements() {
    if (!sessionState.currentUser || !sessionState.profile) return;
    
    // Atualizar elementos de nome de usuário
    updateUsernameElements();
    
    // Atualizar elementos de título/rank
    updateTitleElements();
    
    // Atualizar avatares
    updateAvatarElements();
    
    // Atualizar barras de progresso e níveis
    updateProgressElements();
    
    // Atualizar elementos específicos da página atual
    updatePageSpecificElements();
}

/**
 * Atualiza todos os elementos que mostram nome de usuário
 */
function updateUsernameElements() {
    const username = sessionState.profile.username;
    
    // Sidebar username
    const usernameElements = document.querySelectorAll('#sidebarUsername, .username, .user-name');
    usernameElements.forEach(el => {
        if (el) el.textContent = username;
    });
    
    // Posts e comentários do usuário atual
    document.querySelectorAll('.post-user-name[data-is-current-user="true"], .comment-user[data-is-current-user="true"]').forEach(el => {
        el.textContent = username;
    });
    
    // Avatar text (iniciais)
    document.querySelectorAll('.avatar, .post-avatar[data-is-current-user="true"], .comment-avatar[data-is-current-user="true"]').forEach(el => {
        if (el && !el.querySelector('img')) {
            el.textContent = username.substring(0, 2).toUpperCase();
        }
    });
    
    // Página de perfil
    const previewName = document.getElementById('previewName');
    if (previewName) previewName.textContent = username;
    
    // Form input na página de perfil
    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) usernameInput.value = username;
}

/**
 * Atualiza todos os elementos que mostram título/rank do usuário
 */
function updateTitleElements() {
    const title = sessionState.profile.title;
    
    // Sidebar title
    const titleElements = document.querySelectorAll('#sidebarTitle, .user-title, .user-role');
    titleElements.forEach(el => {
        if (el) el.textContent = title;
    });
    
    // Página de perfil
    const previewTitle = document.getElementById('previewTitle');
    if (previewTitle) previewTitle.textContent = title;
    
    // Select na página de perfil
    const titleSelect = document.getElementById('titleSelect');
    if (titleSelect) {
        // Mapear título para valor do select
        const titleMapping = {
            'Novato FURIA': 'novato',
            'Iniciante': 'iniciante',
            'Jogador Casual': 'casual',
            'Competidor': 'competitivo',
            'Furioso': 'furioso',
            'Furioso Elite': 'furioso_elite',
            'Furioso Lendário': 'lendario'
        };
        
        const titleValue = titleMapping[title] || Object.keys(titleMapping).find(key => title.includes(key)) || 'novato';
        titleSelect.value = titleValue;
    }
}

/**
 * Atualiza todos os elementos de avatar do usuário
 */
function updateAvatarElements() {
    const { avatarBg, avatarStyle } = sessionState.profile;
    
    // Elementos de avatar na barra lateral e cabeçalhos
    const avatarElements = document.querySelectorAll('.avatar[data-is-current-user="true"]');
    avatarElements.forEach(el => {
        if (el) {
            el.style.background = avatarBg;
        }
    });
    
    // Avatares em posts e comentários
    document.querySelectorAll('.post-avatar[data-is-current-user="true"], .comment-avatar[data-is-current-user="true"]').forEach(el => {
        if (el) {
            el.style.background = avatarBg;
        }
    });
    
    // Avatar na página de perfil
    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarPreview) {
        avatarPreview.style.background = avatarBg;
    }
    
    // Seleção de avatar na página de perfil
    if (avatarStyle) {
        document.querySelectorAll('.avatar-choice').forEach(choice => {
            const isSelected = parseInt(choice.dataset.avatar) === avatarStyle;
            choice.classList.toggle('selected', isSelected);
        });
    }
}

/**
 * Atualiza elementos de progresso (nível, XP, etc.)
 */
function updateProgressElements() {
    const { level, xpCurrent, xpTotal } = sessionState.profile;
    const progressPercentage = Math.min(100, Math.max(0, (xpCurrent / xpTotal) * 100));
    
    // Barra de progresso na barra lateral
    const userLevelFill = document.getElementById('userLevelFill');
    if (userLevelFill) {
        userLevelFill.style.width = `${progressPercentage}%`;
    }
    
    // Nível na página de perfil
    const levelElements = document.querySelectorAll('#previewLevel, .user-level');
    levelElements.forEach(el => {
        if (el) el.textContent = `Nível ${level}`;
    });
    
    // XP na página de perfil
    const xpElement = document.getElementById('previewXP');
    if (xpElement) {
        xpElement.textContent = `${xpCurrent}/${xpTotal} XP`;
    }
    
    // Inputs na página de perfil
    const levelInput = document.getElementById('levelInput');
    if (levelInput) levelInput.value = level;
    
    const xpCurrentInput = document.getElementById('xpCurrentInput');
    if (xpCurrentInput) xpCurrentInput.value = xpCurrent;
    
    const xpTotalInput = document.getElementById('xpTotalInput');
    if (xpTotalInput) xpTotalInput.value = xpTotal;
    
    // Barra de progresso na página de perfil
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
    }
}

/**
 * Atualiza elementos específicos da página atual
 */
function updatePageSpecificElements() {
    // Detectar página atual
    const path = window.location.pathname;
    const isProfilePage = path.includes('profile.html');
    const isCommunityPage = path.includes('community.html');
    const isEventsPage = path.includes('events.html');
    
    if (isProfilePage) {
        updateProfilePageElements();
    } else if (isCommunityPage) {
        updateCommunityPageElements();
    } else if (isEventsPage) {
        updateEventsPageElements();
    }
}

/**
 * Atualiza elementos específicos da página de perfil
 */
function updateProfilePageElements() {
    const profile = sessionState.profile;
    
    // Bio no textarea
    const bioTextarea = document.getElementById('bioTextarea');
    if (bioTextarea) bioTextarea.value = profile.bio || '';
    
    // Estatísticas
    const statsFields = [
        { id: 'winsInput', key: 'wins' },
        { id: 'trophiesInput', key: 'trophies' },
        { id: 'gamesInput', key: 'games' },
        { id: 'statsWins', key: 'wins' },
        { id: 'statsTrophies', key: 'trophies' },
        { id: 'statsGames', key: 'games' }
    ];
    
    statsFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            const value = profile.stats?.[field.key] || 0;
            if (element.tagName === 'INPUT') {
                element.value = value;
            } else {
                element.textContent = value;
            }
        }
    });
}

/**
 * Atualiza elementos específicos da página da comunidade
 */
function updateCommunityPageElements() {
    const profile = sessionState.profile;
    
    // Nome do autor em área de criação de post
    const postAuthorElements = document.querySelectorAll('.post-author-name');
    postAuthorElements.forEach(el => {
        if (el) el.textContent = profile.username;
    });
    
    // Avatar em área de criação de post
    const postAuthorAvatars = document.querySelectorAll('.post-author-avatar');
    postAuthorAvatars.forEach(el => {
        if (el) {
            el.style.background = profile.avatarBg;
            if (!el.querySelector('img')) {
                el.textContent = profile.username.substring(0, 2).toUpperCase();
            }
        }
    });
}

/**
 * Atualiza elementos específicos da página de eventos
 */
function updateEventsPageElements() {
    // Implementar conforme necessário
}

// Expor funções para uso global
window.createSession = createSession;
window.logout = logout;
window.updateAllUserInterfaceElements = updateAllUserInterfaceElements;