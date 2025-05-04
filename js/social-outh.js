// social-auth.js - Integração de login com redes sociais reais
// Adicione este script à sua página HTML antes do fechamento do </body>

// Configurações
const API_BASE_URL = 'http://localhost:3000/api'; // Ajuste para seu ambiente

// Verificar se o usuário já tem token de autenticação
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há token de autenticação
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
        // Usuário já autenticado, carregar perfil
        fetchUserProfile(token, userId);
    }
    
    // Configurar botões de redes sociais
    setupSocialButtons();
    
    // Configurar listener para notificações
    document.querySelector('.notification-close').addEventListener('click', hideNotification);
});

// Configurar botões de redes sociais para autenticação OAuth
function setupSocialButtons() {
    // Substituir o comportamento dos botões sociais existentes
    const socialPlatforms = document.querySelectorAll('.social-platform');
    
    socialPlatforms.forEach(platform => {
        // Remover evento de clique existente (se houver)
        const clone = platform.cloneNode(true);
        platform.parentNode.replaceChild(clone, platform);
        
        // Obter o nome da plataforma
        const platformTitle = clone.querySelector('.social-platform-title');
        const platformName = platformTitle ? platformTitle.textContent.trim() : '';
        
        // Adicionar novo evento de clique para autenticação OAuth
        clone.addEventListener('click', function() {
            if (platformName) {
                connectWithSocialMedia(platformName.toLowerCase());
            }
        });
    });
}

// Conectar com rede social via OAuth
function connectWithSocialMedia(platform) {
    // Verificar se o usuário já está autenticado
    const token = localStorage.getItem('authToken');
    
    if (token) {
        // Se o usuário já estiver autenticado, abrir janela popup para conectar conta adicional
        openSocialAuthPopup(platform, token);
    } else {
        // Se não estiver autenticado, redirecionar para a página de login
        window.location.href = `/login.html?social=${platform}`;
    }
}

// Abrir janela popup para autenticação social
function openSocialAuthPopup(platform, token) {
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    // URL da API com token de autenticação (para conectar conta adicional)
    const authUrl = `${API_BASE_URL}/auth/${platform}?token=${token}`;
    
    // Abrir janela popup
    const popup = window.open(
        authUrl,
        `${platform}Auth`,
        `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // Verificar periodicamente se a janela foi fechada
    const checkPopup = setInterval(() => {
        if (popup.closed) {
            clearInterval(checkPopup);
            
            // Recarregar informações do perfil
            const userId = localStorage.getItem('userId');
            if (userId && token) {
                fetchUserProfile(token, userId);
                showNotification('Conta conectada', `Sua conta do ${platform} foi conectada com sucesso!`, 'success');
            }
        }
    }, 500);
}

// Buscar perfil do usuário na API
function fetchUserProfile(token, userId) {
    fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao carregar perfil do usuário');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Atualizar a interface com os dados do usuário
            updateUserInterface(data.user);
        } else {
            showNotification('Erro', data.message || 'Erro ao carregar dados do usuário', 'error');
        }
    })
    .catch(error => {
        console.error('Erro ao carregar perfil do usuário:', error);
        showNotification('Erro de conexão', 'Não foi possível carregar seu perfil. Tente novamente mais tarde.', 'error');
    });
}

// Atualizar interface com dados do usuário
function updateUserInterface(userData) {
    // Atualizar redes sociais conectadas
    if (userData.socialAccounts && userData.socialAccounts.length > 0) {
        updateSocialAccountsList(userData.socialAccounts);
    }
    
    // Atualizar perfis de esports
    if (userData.esportsProfiles && userData.esportsProfiles.length > 0) {
        updateEsportsProfilesList(userData.esportsProfiles);
    }
    
    // Atualizar nível de fã
    if (userData.engagementScore !== undefined) {
        updateFanLevel(userData.engagementScore, userData.loyaltyTier);
    }
    
    // Atualizar dados globais
    window.userProfile = userData;
}

// Atualizar lista de contas sociais
function updateSocialAccountsList(accounts) {
    const container = document.getElementById('socialProfilesContainer');
    
    if (!accounts || accounts.length === 0) {
        container.innerHTML = '<p>Nenhuma rede social conectada ainda.</p>';
        return;
    }
    
    let html = '';
    
    accounts.forEach(account => {
        const iconClass = account.platform.toLowerCase();
        
        html += `
            <div class="profile-card">
                <div class="profile-icon">
                    <i class="fab fa-${iconClass}"></i>
                </div>
                <div class="profile-info">
                    <div class="profile-name">${account.platform}</div>
                    <div class="profile-username">@${account.username}</div>
                </div>
                <div class="profile-status status-verified">Verificado</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Atualizar lista de perfis de esports
function updateEsportsProfilesList(profiles) {
    const container = document.getElementById('esportsProfilesContainer');
    
    if (!profiles || profiles.length === 0) {
        container.innerHTML = '<p>Nenhum perfil de eSports verificado ainda.</p>';
        return;
    }
    
    let html = '';
    
    profiles.forEach(profile => {
        let iconClass;
        switch (profile.platform.toLowerCase()) {
            case 'faceit':
                iconClass = 'fa-crosshairs';
                break;
            case 'esea':
                iconClass = 'fa-shield-alt';
                break;
            case 'gamersclub':
                iconClass = 'fa-gamepad';
                break;
            default:
                iconClass = 'fa-globe';
        }
        
        html += `
            <div class="profile-card">
                <div class="profile-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="profile-info">
                    <div class="profile-name">${profile.platform}</div>
                    <div class="profile-username">${profile.username}</div>
                    <div style="font-size: 0.8rem; margin-top: 5px;">
                        <span><i class="fas fa-trophy"></i> Nível ${profile.level || '-'}</span> &middot;
                        <span><i class="fas fa-chart-bar"></i> ${profile.winRate || '0'}% vitórias</span>
                    </div>
                </div>
                <div class="profile-status status-verified">Verificado</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Atualizar nível de fã
function updateFanLevel(score, tier) {
    // Atualizar pontuação
    document.getElementById('fanScoreText').innerHTML = `Pontuação atual: <strong>${score}/100</strong>`;
    
    // Atualizar barra de progresso
    document.getElementById('fanLevelProgress').style.width = `${score}%`;
    
    // Atualizar nível exibido
    document.getElementById('currentFanLevel').textContent = tier || 'Bronze';
    
    // Atualizar marcadores de nível
    let levelIndex;
    switch (tier) {
        case 'Diamante':
            levelIndex = 4;
            break;
        case 'Platina':
            levelIndex = 3;
            break;
        case 'Ouro':
            levelIndex = 2;
            break;
        case 'Prata':
            levelIndex = 1;
            break;
        default:
            levelIndex = 0; // Bronze
    }
    
    const markers = document.querySelectorAll('.level-marker');
    markers.forEach((marker, index) => {
        if (index <= levelIndex) {
            marker.classList.add('active');
        } else {
            marker.classList.remove('active');
        }
    });
    
    // Atualizar benefícios desbloqueados
    updateUnlockedBenefits(levelIndex);
}

// Atualizar benefícios desbloqueados
function updateUnlockedBenefits(levelIndex) {
    const benefits = document.querySelectorAll('.fan-benefit');
    
    benefits.forEach((benefit, index) => {
        if (index <= levelIndex) {
            benefit.classList.remove('locked');
            const lockIcon = benefit.querySelector('.benefit-lock');
            if (lockIcon) {
                lockIcon.remove();
            }
        } else {
            // Certificar-se de que os benefícios de nível superior estão bloqueados
            if (!benefit.classList.contains('locked')) {
                benefit.classList.add('locked');
                
                // Adicionar ícone de cadeado se não existir
                if (!benefit.querySelector('.benefit-lock')) {
                    const lockIcon = document.createElement('div');
                    lockIcon.className = 'benefit-lock';
                    lockIcon.innerHTML = '<i class="fas fa-lock"></i>';
                    benefit.appendChild(lockIcon);
                }
            }
        }
    });
}

// Função para mostrar notificações
function showNotification(title, message, type = 'info') {
    const notification = document.getElementById('notification');
    const iconEl = notification.querySelector('.notification-icon i');
    const titleEl = notification.querySelector('.notification-title');
    const messageEl = notification.querySelector('.notification-message');
    
    // Atualizar conteúdo
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Remover classes anteriores
    notification.className = 'notification';
    
    // Adicionar classe para o tipo
    notification.classList.add(type);
    
    // Atualizar ícone
    if (type === 'success') {
        iconEl.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        iconEl.className = 'fas fa-exclamation-circle';
    } else {
        iconEl.className = 'fas fa-info-circle';
    }
    
    // Mostrar notificação
    notification.classList.add('visible');
    
    // Esconder após 5 segundos
    setTimeout(hideNotification, 5000);
}

// Esconder notificação
function hideNotification() {
    document.getElementById('notification').classList.remove('visible');
}

// Adicionar função de logout
function logout() {
    // Limpar dados de autenticação
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    
    // Redirecionar para a página de login
    window.location.href = '/login.html';
}

// Adicionar botão de logout (se não existir)
function addLogoutButton() {
    if (!document.getElementById('logoutBtn')) {
        const container = document.querySelector('.container');
        const header = document.querySelector('.header');
        
        if (container && header) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.className = 'btn btn-secondary';
            logoutBtn.style.position = 'absolute';
            logoutBtn.style.top = '20px';
            logoutBtn.style.right = '20px';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
            
            logoutBtn.addEventListener('click', logout);
            
            container.insertBefore(logoutBtn, header);
        }
    }
}

// Chamar função para adicionar botão de logout
document.addEventListener('DOMContentLoaded', addLogoutButton);