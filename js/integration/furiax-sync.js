/**
 * FURIAX - Integração de Perfil nas Páginas
 * Este script deve ser incluído em todas as páginas para garantir 
 * que o perfil do usuário seja consistente em toda a plataforma
 */

// Elementos da página a serem atualizados
const PROFILE_ELEMENTS = {
    // Elementos do nome de usuário
    USERNAME: [
        '#sidebarUsername',          // Sidebar
        '.user-name',                // Diversas áreas
        '.post-user-name',           // Posts
        '.comment-user',             // Comentários
        '.ai-chat-username',         // Chat com IA
        '#previewName',              // Página de perfil
        '.post-author-name'          // Área de criação de post
    ],
    
    // Elementos do título/rank
    TITLE: [
        '#sidebarTitle',             // Sidebar
        '.user-role',                // Diversas áreas
        '.user-title',               // Rótulos
        '#previewTitle'              // Página de perfil
    ],
    
    // Elementos de avatar
    AVATAR: [
        '.avatar',                   // Avatar principal
        '.post-avatar',              // Posts
        '.comment-avatar',           // Comentários
        '.ai-chat-avatar'            // Chat com IA
    ],
    
    // Elementos de nível e progresso
    LEVEL: [
        '#userLevelFill',            // Barra de progresso na sidebar
        '#progressBar',              // Barra de progresso na página de perfil
        '#previewLevel',             // Nível na página de perfil
        '.user-level',               // Nível em outras áreas
        '#previewXP'                 // XP na página de perfil
    ]
};

// Configuração de armazenamento
const STORAGE_KEYS = {
    CURRENT_USER: 'furiax_current_user',
    USER_PROFILE: 'furiax_user_profile',
    SESSION_TOKEN: 'furiax_session_token'
};

// Estado da integração
let integrationState = {
    initialized: false,
    userProfile: null,
    currentUser: null,
    pageType: detectCurrentPage()
};

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('FURIAX Page Integration iniciando...');
    initPageIntegration();
    
    // Adicionar script de sincronização se não existir
    if (!document.querySelector('script[src*="furiax-profile-sync.js"]')) {
        loadSyncScript();
    }
});

/**
 * Inicializa a integração de perfil na página
 */
function initPageIntegration() {
    // Verificar se já inicializado
    if (integrationState.initialized) return;
    
    // Carregar dados do usuário e perfil
    loadUserAndProfile();
    
    // Marcar elementos do usuário atual
    markCurrentUserElements();
    
    // Atualizar elementos da página
    updatePageWithProfileData();
    
    // Configurar eventos de atualização
    setupUpdateEvents();
    
    // Configurar salvamento automático
    setupAutoSave();
    
    // Marcar como inicializado
    integrationState.initialized = true;
    
    console.log('FURIAX Page Integration inicializado com sucesso!');
}

/**
 * Carrega dados do usuário e perfil
 */
function loadUserAndProfile() {
    try {
        // Carregar usuário atual
        const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        integrationState.currentUser = userData ? JSON.parse(userData) : null;
        
        // Se não houver usuário, não prosseguir
        if (!integrationState.currentUser) {
            console.log('Usuário não encontrado, verificando página de login...');
            
            // Se não for página de login, redirecionar
            if (!isLoginPage() && !isIndexPage()) {
                redirectToLogin();
            }
            
            return;
        }
        
        // Carregar perfil
        const profilesData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        const profiles = profilesData ? JSON.parse(profilesData) : {};
        
        // Carregar perfil específico do usuário
        integrationState.userProfile = profiles[integrationState.currentUser.id] || createDefaultProfile();
        
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        integrationState.currentUser = null;
        integrationState.userProfile = null;
    }
}

/**
 * Cria um perfil padrão para o usuário
 */
function createDefaultProfile() {
    const user = integrationState.currentUser;
    return {
        id: user?.id,
        username: user?.username || 'FuriaX_Pro',
        avatarBg: 'linear-gradient(45deg, #1e90ff, #00bfff)',
        avatarStyle: 1,
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
        lastUpdated: Date.now()
    };
}

/**
 * Marca elementos que pertencem ao usuário atual
 */
function markCurrentUserElements() {
    if (!integrationState.currentUser) return;
    
    const username = integrationState.currentUser.username;
    
    // Marcar posts do usuário atual
    document.querySelectorAll('.post-card').forEach(post => {
        const authorElement = post.querySelector('.post-user-name');
        if (authorElement && authorElement.textContent === username) {
            // Marcar elementos dentro do post
            ['post-avatar', 'post-user-name'].forEach(className => {
                const element = post.querySelector(`.${className}`);
                if (element) element.dataset.isCurrentUser = 'true';
            });
        }
    });
    
    // Marcar comentários do usuário atual
    document.querySelectorAll('.comment-item').forEach(comment => {
        const authorElement = comment.querySelector('.comment-user');
        if (authorElement && authorElement.textContent === username) {
            // Marcar elementos dentro do comentário
            ['comment-avatar', 'comment-user'].forEach(className => {
                const element = comment.querySelector(`.${className}`);
                if (element) element.dataset.isCurrentUser = 'true';
            });
        }
    });
    
    // Marcar avatar na sidebar
    document.querySelectorAll('.avatar').forEach(avatar => {
        avatar.dataset.isCurrentUser = 'true';
    });
}

/**
 * Atualiza elementos da página com dados do perfil
 */
function updatePageWithProfileData() {
    if (!integrationState.userProfile) return;
    
    const profile = integrationState.userProfile;
    
    // 1. Atualizar nome de usuário
    updateUsernameElements(profile.username);
    
    // 2. Atualizar título
    updateTitleElements(profile.title);
    
    // 3. Atualizar avatares
    updateAvatarElements(profile.avatarBg, profile.username);
    
    // 4. Atualizar nível e progresso
    updateLevelElements(profile.level, profile.xpCurrent, profile.xpTotal);
    
    // 5. Atualizar elementos específicos da página
    updatePageSpecificElements();
}

/**
 * Atualiza elementos de nome de usuário
 */
function updateUsernameElements(username) {
    PROFILE_ELEMENTS.USERNAME.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            // Verificar se é elemento do usuário atual
            if (!selector.includes('[data-is-current-user="true"]') || 
                el.dataset.isCurrentUser === 'true') {
                el.textContent = username;
            }
        });
    });
    
    // Atualizar input de nome de usuário na página de perfil
    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) usernameInput.value = username;
}

/**
 * Atualiza elementos de título
 */
function updateTitleElements(title) {
    PROFILE_ELEMENTS.TITLE.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.textContent = title;
        });
    });
    
    // Atualizar select na página de perfil
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
        
        const titleValue = titleMapping[title] || 
                          Object.keys(titleMapping).find(key => title.includes(key)) || 
                          'novato';
                          
        titleSelect.value = titleValue;
    }
}

/**
 * Atualiza elementos de avatar
 */
function updateAvatarElements(avatarBg, username) {
    PROFILE_ELEMENTS.AVATAR.forEach(selector => {
        document.querySelectorAll(`${selector}[data-is-current-user="true"]`).forEach(el => {
            // Atualizar fundo
            el.style.background = avatarBg;
            
            // Atualizar texto (iniciais) se não tiver imagem
            if (!el.querySelector('img')) {
                el.textContent = username.substring(0, 2).toUpperCase();
            }
        });
    });
    
    // Atualizar avatares na página de perfil
    document.querySelectorAll('#avatarPreview').forEach(el => {
        el.style.background = avatarBg;
    });
}

/**
 * Atualiza elementos de nível e progresso
 */
function updateLevelElements(level, xpCurrent, xpTotal) {
    // Calcular porcentagem
    const percentage = Math.min(100, Math.max(0, (xpCurrent / xpTotal) * 100));
    
    // Atualizar barras de progresso
    document.querySelectorAll('#userLevelFill, #progressBar').forEach(el => {
        if (el) el.style.width = `${percentage}%`;
    });
    
    // Atualizar textos de nível
    document.querySelectorAll('#previewLevel, .user-level').forEach(el => {
        if (el) el.textContent = `Nível ${level}`;
    });
    
    // Atualizar texto de XP
    const xpElement = document.getElementById('previewXP');
    if (xpElement) xpElement.textContent = `${xpCurrent}/${xpTotal} XP`;
    
    // Atualizar inputs na página de perfil
    const inputs = {
        levelInput: level,
        xpCurrentInput: xpCurrent,
        xpTotalInput: xpTotal
    };
    
    Object.entries(inputs).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) input.value = value;
    });
}

/**
 * Atualiza elementos específicos com base na página atual
 */
function updatePageSpecificElements() {
    const profile = integrationState.userProfile;
    const pageType = integrationState.pageType;
    
    switch (pageType) {
        case 'profile':
            updateProfilePageElements(profile);
            break;
        case 'community':
            updateCommunityPageElements(profile);
            break;
        case 'events':
            updateEventsPageElements(profile);
            break;
        case 'ai':
            updateAIAssistantElements(profile);
            break;
    }
}

/**
 * Atualiza elementos específicos da página de perfil
 */
function updateProfilePageElements(profile) {
    // Bio
    const bioTextarea = document.getElementById('bioTextarea');
    if (bioTextarea) bioTextarea.value = profile.bio || '';
    
    // Estatísticas
    const statsElements = [
        { id: 'winsInput', key: 'wins' },
        { id: 'trophiesInput', key: 'trophies' },
        { id: 'gamesInput', key: 'games' },
        { id: 'statsWins', key: 'wins' },
        { id: 'statsTrophies', key: 'trophies' },
        { id: 'statsGames', key: 'games' }
    ];
    
    statsElements.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            const value = profile.stats?.[item.key] || 0;
            if (element.tagName === 'INPUT') {
                element.value = value;
            } else {
                element.textContent = value;
            }
        }
    });
    
    // Avatar selecionado
    if (profile.avatarStyle) {
        document.querySelectorAll('.avatar-choice').forEach(choice => {
            const isSelected = parseInt(choice.dataset.avatar) === profile.avatarStyle;
            choice.classList.toggle('selected', isSelected);
        });
    }
}

/**
 * Atualiza elementos específicos da página da comunidade
 */
function updateCommunityPageElements(profile) {
    // Calcular pontuação de engajamento
    const { posts = 0, comments = 0, likes = 0 } = profile.stats || {};
    const engagementScore = Math.min(99, Math.round((profile.level * 5) + (posts * 3) + (comments * 2) + (likes * 0.5)));
    
    // Atualizar score de engajamento
    document.querySelectorAll('.score-value').forEach(el => {
        if (el) el.textContent = engagementScore;
    });
    
    // Atualizar gráfico circular
    document.querySelectorAll('.score-circle').forEach(el => {
        if (el) {
            el.style.background = `conic-gradient(#1e90ff 0% ${engagementScore}%, #333 ${engagementScore}% 100%)`;
        }
    });
}

/**
 * Atualiza elementos específicos da página de eventos
 */
function updateEventsPageElements(profile) {
    // Implementação depende da estrutura da página de eventos
}

/**
 * Atualiza elementos do assistente de IA
 */
function updateAIAssistantElements(profile) {
    // Atualizar nome nas mensagens de IA
    document.querySelectorAll('.ai-message').forEach(message => {
        const text = message.textContent;
        if (text.includes('Olá') && text.includes('!')) {
            // Substituir apenas o nome, mantendo o resto da saudação
            message.innerHTML = message.innerHTML.replace(
                /Olá,\s+[^!]+!/g, 
                `Olá, ${profile.username}!`
            );
        }
    });
}

/**
 * Configura eventos de atualização de perfil
 */
function setupUpdateEvents() {
    // Escutar evento personalizado de atualização
    window.addEventListener('furiax:profileUpdated', () => {
        console.log('Evento de atualização de perfil detectado!');
        
        // Recarregar dados
        loadUserAndProfile();
        
        // Atualizar elementos
        updatePageWithProfileData();
    });
    
    // Verificar atualizações de armazenamento de outras abas
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.USER_PROFILE || e.key === STORAGE_KEYS.CURRENT_USER) {
            console.log('Alteração de armazenamento detectada:', e.key);
            
            // Recarregar dados
            loadUserAndProfile();
            
            // Atualizar elementos
            updatePageWithProfileData();
        }
    });
}

/**
 * Configura salvamento automático na página de perfil
 */
function setupAutoSave() {
    // Verificar se estamos na página de perfil
    if (integrationState.pageType !== 'profile') return;
    
    // Configurar evento de salvar perfil
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            saveProfileChanges();
        });
    }
}

/**
 * Salva alterações feitas no perfil
 */
function saveProfileChanges() {
    // Verificar se estamos na página de perfil
    if (integrationState.pageType !== 'profile') return false;
    
    // Capturar dados do formulário
    const formData = captureProfileFormData();
    if (!formData) return false;
    
    try {
        // Carregar perfis
        let profiles = {};
        const profilesData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (profilesData) {
            profiles = JSON.parse(profilesData);
        }
        
        // Obter perfil atual
        const userId = integrationState.currentUser.id;
        const currentProfile = profiles[userId] || createDefaultProfile();
        
        // Mesclar perfil atual com novos dados
        const updatedProfile = {
            ...currentProfile,
            ...formData,
            lastUpdated: Date.now()
        };
        
        // Atualizar estatísticas (manter outros valores existentes)
        updatedProfile.stats = {
            ...currentProfile.stats,
            ...formData.stats
        };
        
        // Salvar perfil atualizado
        profiles[userId] = updatedProfile;
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profiles));
        
        // Verificar se o username mudou
        if (formData.username && formData.username !== integrationState.currentUser.username) {
            // Atualizar usuário atual
            const updatedUser = {
                ...integrationState.currentUser,
                username: formData.username
            };
            
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }
        
        // Atualizar estado local
        integrationState.userProfile = updatedProfile;
        
        // Atualizar elementos da página
        updatePageWithProfileData();
        
        // Disparar evento de atualização
        window.dispatchEvent(new CustomEvent('furiax:profileUpdated'));
        
        // Mostrar notificação
        showNotification('Perfil atualizado com sucesso!', 'success');
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        showNotification('Erro ao salvar perfil. Tente novamente.', 'error');
        return false;
    }
}

/**
 * Captura dados do formulário de perfil
 */
function captureProfileFormData() {
    const result = {
        stats: {}
    };
    
    // Coletar valores dos campos
    const fields = {
                        // Campos principais
        username: 'usernameInput',
        bio: 'bioTextarea',
        title: {
            id: 'titleSelect',
            transform: (value) => {
                // Converter valor do select para texto
                const titleMapping = {
                    'novato': 'Novato FURIA',
                    'iniciante': 'Iniciante',
                    'casual': 'Jogador Casual',
                    'competitivo': 'Competidor',
                    'furioso': 'Furioso',
                    'furioso_elite': 'Furioso Elite',
                    'lendario': 'Furioso Lendário'
                };
                return titleMapping[value] || value;
            }
        },
        
        // Campos numéricos
        level: { id: 'levelInput', type: 'number' },
        xpCurrent: { id: 'xpCurrentInput', type: 'number' },
        xpTotal: { id: 'xpTotalInput', type: 'number' },
        
        // Estatísticas
        'stats.wins': { id: 'winsInput', type: 'number' },
        'stats.trophies': { id: 'trophiesInput', type: 'number' },
        'stats.games': { id: 'gamesInput', type: 'number' }
    };
    
    // Capturar cada campo
    Object.entries(fields).forEach(([key, config]) => {
        let id, transform, type;
        
        if (typeof config === 'string') {
            id = config;
            transform = null;
            type = 'string';
        } else {
            id = config.id;
            transform = config.transform;
            type = config.type || 'string';
        }
        
        const element = document.getElementById(id);
        if (!element) return;
        
        let value = element.value;
        
        // Converter tipo se necessário
        if (type === 'number') {
            value = parseInt(value) || 0;
        }
        
        // Aplicar transformação se existir
        if (transform) {
            value = transform(value);
        }
        
        // Aplicar ao resultado (lidar com caminhos aninhados como 'stats.wins')
        if (key.includes('.')) {
            const [parent, child] = key.split('.');
            if (!result[parent]) result[parent] = {};
            result[parent][child] = value;
        } else {
            result[key] = value;
        }
    });
    
    // Capturar avatar selecionado
    const selectedAvatar = document.querySelector('.avatar-choice.selected');
    if (selectedAvatar) {
        result.avatarStyle = parseInt(selectedAvatar.dataset.avatar) || 1;
        
        // Gerar background para o avatar
        const avatarStyles = [
            'linear-gradient(45deg, #1e90ff, #00bfff)',
            'linear-gradient(45deg, #ff3b5c, #ff9800)',
            'linear-gradient(45deg, #9c27b0, #ff3b5c)',
            'linear-gradient(45deg, #00cc66, #1e90ff)',
            'linear-gradient(45deg, #ffc107, #ff9800)',
            'linear-gradient(45deg, #333, #666)'
        ];
        
        result.avatarBg = avatarStyles[result.avatarStyle - 1] || avatarStyles[0];
    }
    
    return result;
}

/**
 * Detecta o tipo da página atual
 */
function detectCurrentPage() {
    const url = window.location.href.toLowerCase();
    
    if (url.includes('profile.html')) return 'profile';
    if (url.includes('comunidade.html') || url.includes('community.html')) return 'community';
    if (url.includes('eventos.html') || url.includes('events.html')) return 'events';
    if (url.includes('chat.html')) return 'ai';
    if (url.includes('login.html')) return 'login';
    if (url.includes('index.html') || url.endsWith('/')) return 'index';
    
    return 'other';
}

/**
 * Verifica se a página atual é a de login
 */
function isLoginPage() {
    return integrationState.pageType === 'login';
}

/**
 * Verifica se a página atual é a página inicial
 */
function isIndexPage() {
    return integrationState.pageType === 'index';
}

/**
 * Redireciona para página de login
 * CORRIGIDO: Agora usa caminhos corretos considerando a estrutura do projeto
 */
function redirectToLogin() {
    const returnUrl = encodeURIComponent(window.location.href);
    
    // Verificar se estamos em uma página dentro da pasta "pages"
    const isInPagesDir = window.location.pathname.includes('/pages/');
    
    if (isInPagesDir) {
        // Já estamos na pasta pages, só precisa navegar para login.html
        window.location.href = 'login.html?return=' + returnUrl;
    } else {
        // Estamos na raiz, precisa navegar para pages/login.html
        window.location.href = 'pages/login.html?return=' + returnUrl;
    }
}

/**
 * Carrega o script de sincronização de perfil
 * CORRIGIDO: Ajustado para usar o caminho correto
 */
function loadSyncScript() {
    const script = document.createElement('script');
    
    // Verificar se estamos em uma página dentro da pasta "pages"
    const isInPagesDir = window.location.pathname.includes('/pages/');
    
    if (isInPagesDir) {
        script.src = '../js/integration/furiax-profile-sync.js';
    } else {
        script.src = 'js/integration/furiax-profile-sync.js';
    }
    
    script.async = true;
    document.head.appendChild(script);
}

/**
 * Exibe uma notificação na interface
 */
function showNotification(message, type = 'success') {
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '10px';
        notification.style.color = 'white';
        notification.style.fontFamily = "'Orbitron', sans-serif";
        notification.style.zIndex = '1000';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';
        notification.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        notification.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        document.body.appendChild(notification);
    }
    
    // Definir cor com base no tipo
    if (type === 'success') {
        notification.style.background = 'rgba(0, 204, 102, 0.9)';
    } else if (type === 'error') {
        notification.style.background = 'rgba(255, 59, 92, 0.9)';
    } else {
        notification.style.background = 'rgba(30, 144, 255, 0.9)';
    }
    
    // Definir ícone com base no tipo
    let icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'info') icon = 'info-circle';
    
    notification.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    
    // Mostrar notificação
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Esconder após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
    }, 3000);
}

/**
 * Função para atualizar o perfil entre páginas
 */
function updateProfileGlobally() {
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('furiax:profileUpdated'));
}

// Exportar funções principais para uso global
window.FuriaxPageIntegration = {
    initialize: initPageIntegration,
    updateProfile: updatePageWithProfileData,
    saveProfile: saveProfileChanges,
    showNotification,
    updateProfileGlobally
};

// Inicializar integração
initPageIntegration();