// social-connection.js - Handles social media platform connections

// Import auth utility functions
// Make sure you included auth.js before this script

// Configuration for permissions and descriptions by platform
const platformConfig = {
    google: {
        icon: 'google',
        color: '#4285F4',
        name: 'Google',
        permissions: [
            'Acessar informações básicas do perfil',
            'Ver seu email',
            'Não teremos acesso à sua senha'
        ],
        description: 'Conecte sua conta Google para facilitar o login e personalizar sua experiência.'
    },
    twitter: {
        icon: 'twitter',
        color: '#1DA1F2',
        name: 'Twitter',
        permissions: [
            'Acessar informações públicas do perfil',
            'Ver contas que você segue',
            'Não publicaremos em seu nome'
        ],
        description: 'Conecte sua conta do Twitter para analisarmos seus interesses em eSports.'
    },
    facebook: {
        icon: 'facebook',
        color: '#4267B2',
        name: 'Facebook',
        permissions: [
            'Acessar seu perfil público',
            'Ver seu email',
            'Não publicaremos em seu nome'
        ],
        description: 'Analise páginas de eSports que você segue.'
    },
    instagram: {
        icon: 'instagram',
        color: '#E1306C',
        name: 'Instagram',
        permissions: [
            'Acessar informações públicas do perfil',
            'Ver conteúdo básico',
            'Não publicaremos ou editaremos seu conteúdo'
        ],
        description: 'Descubra recomendações baseadas em suas interações.'
    },
    twitch: {
        icon: 'twitch',
        color: '#9146FF',
        name: 'Twitch',
        permissions: [
            'Acessar informações públicas do perfil',
            'Ver streamers que você segue',
            'Não faremos transmissões em seu nome'
        ],
        description: 'Conecte para verificarmos os streamers que você segue.'
    }
};

// Current platform being authenticated
let currentPlatform = null;

/**
 * Iniciar o processo de conexão com uma plataforma de mídia social
 * @param {string} platform - Nome da plataforma (google, twitter, etc.)
 */
function connectSocialPlatform(platform) {
    if (!platformConfig[platform]) {
        showNotification('Erro', `Plataforma não suportada: ${platform}`, 'error');
        return;
    }
    
    currentPlatform = platform;
    const config = platformConfig[platform];
    
    // Configurar o modal de autenticação
    document.getElementById('socialAuthTitle').textContent = `Conectar ${config.name}`;
    document.getElementById('socialAuthDescription').textContent = config.description;
    
    // Configurar ícone
    const iconElement = document.getElementById('authPlatformIcon').querySelector('i');
    iconElement.className = `fab fa-${config.icon}`;
    document.getElementById('authPlatformIcon').style.color = config.color;
    
    // Configurar nome da plataforma
    document.getElementById('authPlatformName').textContent = config.name;
    
    // Configurar permissões
    const permissionsList = document.getElementById('authPermissionsList');
    permissionsList.innerHTML = '';
    config.permissions.forEach(permission => {
        const li = document.createElement('li');
        li.textContent = permission;
        permissionsList.appendChild(li);
    });
    
    // Resetar estado do modal
    document.getElementById('socialAuthContent').style.display = 'block';
    document.getElementById('socialAuthLoading').style.display = 'none';
    document.getElementById('socialAuthError').style.display = 'none';
    document.getElementById('startAuthBtn').disabled = false;
    
    // Abrir modal
    openModal('socialAuthModal');
}

/**
 * Iniciar o fluxo de autenticação OAuth
 */
function startAuthentication() {
    if (!currentPlatform) {
        showNotification('Erro', 'Nenhuma plataforma selecionada', 'error');
        return;
    }
    
    // Mostrar tela de carregamento
    document.getElementById('socialAuthContent').style.display = 'none';
    document.getElementById('socialAuthLoading').style.display = 'block';
    document.getElementById('startAuthBtn').disabled = true;
    
    try {
        // Chamar a função de autenticação da biblioteca auth.js
        setTimeout(() => {
            // Iniciar autenticação OAuth (auth.js)
            window.auth.initiateOAuth(currentPlatform);
        }, 1000);
    } catch (error) {
        console.error('Erro ao iniciar autenticação:', error);
        showAuthError(error.message);
    }
}

/**
 * Manipular erro na autenticação
 * @param {string} message - Mensagem de erro
 */
function showAuthError(message) {
    document.getElementById('socialAuthContent').style.display = 'none';
    document.getElementById('socialAuthLoading').style.display = 'none';
    document.getElementById('socialAuthError').style.display = 'block';
    document.getElementById('socialAuthErrorMessage').textContent = message || 'Erro ao conectar com a plataforma.';
    document.getElementById('startAuthBtn').disabled = false;
}

/**
 * Verificar callback de autenticação na URL
 * Deve ser chamado quando a página é carregada
 */
function checkAuthCallback() {
    // Verificar se a URL contém parâmetros de callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (code || error) {
        // Mostrar modal de callback
        openModal('authCallbackModal');
        
        // Processar resultado da autenticação
        processAuthCallback();
        
        // Limpar URL
        if (history.pushState) {
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({path: newUrl}, '', newUrl);
        }
    }
}

/**
 * Processar o callback de autenticação
 */
async function processAuthCallback() {
    try {
        // Chamar a função de processamento da biblioteca auth.js
        const profileData = await window.auth.handleOAuthCallback();
        
        // Exibir resultado de sucesso
        document.getElementById('callbackLoading').style.display = 'none';
        document.getElementById('callbackSuccess').style.display = 'block';
        document.getElementById('callbackFooter').style.display = 'flex';
        
        // Obter plataforma do localStorage
        const platform = localStorage.getItem('oauth_platform');
        const config = platformConfig[platform];
        
        // Atualizar mensagem de sucesso
        document.getElementById('callbackTitle').textContent = `${config?.name || 'Conta'} Conectada`;
        document.getElementById('callbackSuccessMessage').textContent = 
            `Sua conta ${config?.name || ''} foi conectada com sucesso.`;
        
        // Exibir resumo do perfil
        displayProfileSummary(profileData, platform);
        
        // Atualizar lista de contas conectadas
        updateSocialAccountsList();
        
        // Atualizar nível de fã
        updateFanLevel();
        
        // Mostrar notificação
        showNotification('Conta conectada', 
            `Sua conta ${config?.name || ''} foi conectada com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao processar callback:', error);
        
        // Exibir erro
        document.getElementById('callbackLoading').style.display = 'none';
        document.getElementById('callbackError').style.display = 'block';
        document.getElementById('callbackFooter').style.display = 'flex';
        document.getElementById('callbackErrorMessage').textContent = 
            error.message || 'Ocorreu um erro ao finalizar a autenticação.';
    }
}

/**
 * Exibir resumo do perfil conectado
 * @param {Object} profileData - Dados do perfil
 * @param {string} platform - Nome da plataforma
 */
function displayProfileSummary(profileData, platform) {
    const summaryContainer = document.getElementById('profileSummary');
    
    let profileImage = '';
    let name = '';
    let username = '';
    let additionalInfo = '';
    
    // Extrair informações específicas de cada plataforma
    switch (platform) {
        case 'google':
            profileImage = profileData.picture;
            name = profileData.name;
            username = profileData.email;
            break;
            
        case 'twitter':
            profileImage = profileData.profile_image_url;
            name = profileData.name;
            username = `@${profileData.username}`;
            if (profileData.public_metrics) {
                additionalInfo = `
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-value">${formatNumber(profileData.public_metrics.followers_count)}</span>
                            <span class="stat-label">Seguidores</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${formatNumber(profileData.public_metrics.following_count)}</span>
                            <span class="stat-label">Seguindo</span>
                        </div>
                    </div>
                `;
            }
            break;
            
        case 'instagram':
            name = profileData.username;
            username = profileData.account_type || '';
            if (profileData.media_count) {
                additionalInfo = `
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-value">${formatNumber(profileData.media_count)}</span>
                            <span class="stat-label">Publicações</span>
                        </div>
                    </div>
                `;
            }
            break;
            
        case 'twitch':
            profileImage = profileData.profile_image_url;
            name = profileData.display_name;
            username = profileData.login;
            if (profileData.view_count) {
                additionalInfo = `
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-value">${formatNumber(profileData.view_count)}</span>
                            <span class="stat-label">Visualizações</span>
                        </div>
                    </div>
                `;
            }
            break;
            
        case 'facebook':
            if (profileData.picture && profileData.picture.data) {
                profileImage = profileData.picture.data.url;
            }
            name = profileData.name;
            username = profileData.email || '';
            break;
            
        default:
            name = 'Usuário';
            username = 'Conectado';
    }
    
    // Criar HTML do resumo
    summaryContainer.innerHTML = `
        <div class="profile-card" style="margin: 0 auto; max-width: 400px;">
            ${profileImage ? `
                <div class="profile-avatar">
                    <img src="${profileImage}" alt="Avatar" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                </div>
            ` : `
                <div class="profile-icon" style="margin: 0 auto 15px;">
                    <i class="fab fa-${platformConfig[platform]?.icon || platform}"></i>
                </div>
            `}
            <div class="profile-info">
                <div class="profile-name" style="font-size: 1.2rem; font-weight: bold;">${name}</div>
                <div class="profile-username" style="color: var(--gray);">${username}</div>
                ${additionalInfo}
            </div>
        </div>
    `;
}

/**
 * Atualizar a lista de contas sociais conectadas
 */
function updateSocialAccountsList() {
    const container = document.getElementById('socialProfilesContainer');
    const noAccountsMessage = document.getElementById('no-social-accounts');
    
    // Mostrar loader
    document.getElementById('social-accounts-loader').style.display = 'block';
    
    // Buscar contas conectadas
    setTimeout(() => {
        let connectedAccounts = [];
        
        // Verificar cada plataforma
        Object.keys(platformConfig).forEach(platform => {
            if (window.auth.isConnectedTo(platform)) {
                const profileData = window.auth.getProfileData(platform);
                connectedAccounts.push({
                    platform,
                    profileData
                });
            }
        });
        
        // Atualizar UI
        if (connectedAccounts.length === 0) {
            noAccountsMessage.style.display = 'block';
            container.innerHTML = '';
        } else {
            noAccountsMessage.style.display = 'none';
            
            let html = '';
            
            connectedAccounts.forEach(account => {
                const platform = account.platform;
                const profileData = account.profileData;
                const config = platformConfig[platform];
                
                let name = '';
                let username = '';
                
                // Extrair informações específicas de cada plataforma
                switch (platform) {
                    case 'google':
                        name = profileData.name;
                        username = profileData.email;
                        break;
                        
                    case 'twitter':
                        name = profileData.name;
                        username = `@${profileData.username}`;
                        break;
                        
                    case 'instagram':
                        name = config.name;
                        username = profileData.username;
                        break;
                        
                    case 'twitch':
                        name = config.name;
                        username = profileData.display_name;
                        break;
                        
                    case 'facebook':
                        name = config.name;
                        username = profileData.name;
                        break;
                        
                    default:
                        name = config?.name || 'Conta';
                        username = 'Conectado';
                }
                
                html += `
                    <div class="profile-card">
                        <div class="profile-icon" style="color: ${config?.color || 'var(--primary)'}">
                            <i class="fab fa-${config?.icon || platform}"></i>
                        </div>
                        <div class="profile-info">
                            <div class="profile-name">${name}</div>
                            <div class="profile-username">${username}</div>
                        </div>
                        <div class="profile-actions">
                            <div class="profile-status status-verified">Verificado</div>
                            <button class="btn btn-sm btn-danger" onclick="disconnectSocial('${platform}')" style="margin-left: 10px;">
                                <i class="fas fa-unlink"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
        
        // Esconder loader
        document.getElementById('social-accounts-loader').style.display = 'none';
        
        // Atualizar nível de fã - aqui usamos a mesma lógica do código original
        // porque ainda não temos a integração real com o backend
        userProfile.socialAccounts = connectedAccounts.map(account => ({
            platform: account.platform,
            username: getAccountUsername(account),
            verified: true,
            verificationDate: new Date(),
            followersCount: getFollowersCount(account)
        }));
        
        updateFanLevel();
    }, 1000);
}

/**
 * Desconectar uma conta de mídia social
 * @param {string} platform - Nome da plataforma (google, twitter, etc.)
 */
function disconnectSocial(platform) {
    if (!window.auth.isConnectedTo(platform)) {
        showNotification('Erro', 'Esta conta não está conectada', 'error');
        return;
    }
    
    // Confirmar ação

    
    // Desconectar (auth.js)
    window.auth.disconnectSocialMedia(platform);
    
    // Atualizar UI
    updateSocialAccountsList();
    
    // Mostrar notificação
    showNotification('Conta desconectada', 
        `Sua conta ${platformConfig[platform]?.name || platform} foi desconectada.`, 'info');
}

/**
 * Obter nome de usuário de uma conta conectada
 * @param {Object} account - Objeto de conta
 * @returns {string} Nome de usuário
 */
function getAccountUsername(account) {
    const platform = account.platform;
    const profileData = account.profileData;
    
    switch (platform) {
        case 'google':
            return profileData.email;
        case 'twitter':
            return profileData.username;
        case 'instagram':
            return profileData.username;
        case 'twitch':
            return profileData.login;
        case 'facebook':
            return profileData.name;
        default:
            return 'user';
    }
}

/**
 * Obter contagem de seguidores (se disponível)
 * @param {Object} account - Objeto de conta
 * @returns {number} Número de seguidores ou valor aleatório
 */
function getFollowersCount(account) {
    const platform = account.platform;
    const profileData = account.profileData;
    
    if (platform === 'twitter' && profileData.public_metrics) {
        return profileData.public_metrics.followers_count;
    } else if (platform === 'twitch' && profileData.view_count) {
        return Math.floor(profileData.view_count / 10); // Estimativa
    }
    
    // Valor aleatório para simulação
    return Math.floor(Math.random() * 500) + 50;
}

/**
 * Formatar número para exibição (ex: 1.5K)
 * @param {number} num - Número para formatar
 * @returns {string} Número formatado
 */
function formatNumber(num) {
    if (!num) return '0';
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    
    return num.toString();
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há um callback de autenticação na URL
    checkAuthCallback();
    
    // Carregar contas conectadas
    updateSocialAccountsList();
});