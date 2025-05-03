// furiax-profile-sync.js
// Script para sincronizar o perfil do usuário entre páginas da plataforma FURIAX

// Função principal para sincronizar os dados do perfil do usuário
function syncUserProfile() {
    // Verificar se existe um usuário logado
    const currentUser = localStorage.getItem('furiax_current_user');
    if (!currentUser) {
        // Redirecionar para login se não estiver logado
        window.location.href = '../login.html';
        return false;
    }
    
    // Verificar se a sessão está válida
    const sessionData = JSON.parse(localStorage.getItem('furiax_session_token') || 'null');
    if (!sessionData || sessionData.expires < Date.now()) {
        // Sessão expirada, limpar dados e redirecionar para login
        localStorage.removeItem('furiax_current_user');
        localStorage.removeItem('furiax_session_token');
        window.location.href = '../login.html';
        return false;
    }
    
    // Carregar e aplicar os dados do perfil na interface
    loadAndApplyProfileData();
    
    return true;
}

// Função para carregar e aplicar os dados do perfil na interface
function loadAndApplyProfileData() {
    // Obter dados do perfil
    const profileData = localStorage.getItem('furiaxProfile');
    
    if (!profileData) {
        console.warn('Dados de perfil não encontrados');
        return false;
    }
    
    try {
        const profile = JSON.parse(profileData);
        
        // Aplicar dados em elementos da interface
        updateProfileElements(profile);
        
        // Configurar barra de nível
        updateLevelBar(profile.level, profile.levelProgress);
        
        console.log('✅ Perfil sincronizado com sucesso!', profile);
        return true;
    } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        return false;
    }
}

// Função para atualizar elementos da interface com dados do perfil
function updateProfileElements(profile) {
    // Atualizar nome de usuário nos elementos com ID 'sidebarUsername'
    const usernameElements = document.querySelectorAll('#sidebarUsername');
    usernameElements.forEach(el => {
        if (el) el.textContent = profile.username || 'Usuário FURIAX';
    });
    
    // Atualizar título/role nos elementos com ID 'sidebarTitle'
    const titleElements = document.querySelectorAll('#sidebarTitle');
    titleElements.forEach(el => {
        if (el) {
            // Mapear valor do título para texto mais amigável
            const titles = {
                "novato": "Novato",
                "iniciante": "Iniciante",
                "casual": "Jogador Casual",
                "competitivo": "Competidor", 
                "furioso": "Furioso",
                "furioso_elite": "Furioso Elite",
                "lendario": "Furioso Lendário"
            };
            
            el.textContent = titles[profile.title] || profile.title || 'Novato';
        }
    });
    
    // Atualizar avatar se ele existir
    const avatarElements = document.querySelectorAll('.user-avatar, .profile-avatar');
    if (profile.avatar) {
        avatarElements.forEach(el => {
            if (el && el.tagName === 'IMG') {
                el.src = profile.avatar;
            }
        });
    }
    
    // Atualizar bio se existir o elemento
    const bioElements = document.querySelectorAll('.user-bio');
    bioElements.forEach(el => {
        if (el) el.textContent = profile.bio || 'Olá, sou um fã da FURIA!';
    });
}

// Função para atualizar a barra de nível
function updateLevelBar(level, progress) {
    const levelElements = document.querySelectorAll('.user-level-text');
    levelElements.forEach(el => {
        if (el) el.textContent = `Nível ${level || 1}`;
    });
    
    const progressBars = document.querySelectorAll('.user-level-fill');
    progressBars.forEach(el => {
        if (el) el.style.width = `${progress || 0}%`;
    });
}

// Evento para sincronizar o perfil quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', syncUserProfile);

// Observador para detectar mudanças no localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'furiaxProfile' || e.key === 'furiax_current_user') {
        // Atualizar dados do perfil quando houver alterações
        loadAndApplyProfileData();
    }
});

// Verificar e sincronizar a cada 5 minutos para manter a sessão ativa
setInterval(syncUserProfile, 5 * 60 * 1000);

// Botão de logout
document.addEventListener('DOMContentLoaded', function() {
    const logoutButtons = document.querySelectorAll('.logout-button');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Limpar dados da sessão
            localStorage.removeItem('furiax_current_user');
            localStorage.removeItem('furiax_session_token');
            
            // Redirecionar para página de login
            window.location.href = '../pages/login.html';
        });
    });
});