/**
 * FURIAX - Sistema Global de Avatares
 * Este arquivo deve ser incluído em todas as páginas que precisam exibir avatares
 */

// Função imediatamente invocada para evitar poluição do escopo global
(function() {
    // Mapeamento de IDs de avatar para caminhos de imagem
    const AVATAR_PATHS = {
        2: "../img/avatars/avatar02.jpg",
        3: "../img/avatars/avatar03.jpg",
        4: "../img/avatars/avatar04.png",
        5: "../img/avatars/avatar05.png",
        6: "../img/avatars/avatar06.png",
        1: "../img/avatars/avatar01.jpg",
   
    };
    
    // Função para obter URL do avatar com ajuste de caminho
    function getAvatarUrl(avatarId) {
        // Verifica se estamos em uma subpasta
        const isInSubfolder = window.location.pathname.includes('/pages/');
        
        // Ajusta o caminho base dependendo da localização
        const basePath = isInSubfolder ? '../' : '';
        
        // Retorna o caminho do avatar ou um placeholder
        if (AVATAR_PATHS[avatarId]) {
            return basePath + AVATAR_PATHS[avatarId];
        }
        
        // Fallback para placeholder
        return `/api/placeholder/150/150?avatar=${avatarId}`;
    }
    
    // Função principal para inicializar e gerenciar avatares
    function initFuriaxAvatars() {
        // Carrega perfil do localStorage
        const profileData = localStorage.getItem('furiaxProfile');
        if (!profileData) {
            console.warn("Sistema de Avatares: Perfil não encontrado no localStorage");
            return false;
        }
        
        try {
            // Parse do perfil
            const profile = JSON.parse(profileData);
            
            // Verifica se o perfil tem um avatar
            if (!profile.avatar) {
                console.log("Sistema de Avatares: Avatar não definido no perfil, usando padrão");
                profile.avatar = 1;
                localStorage.setItem('furiaxProfile', JSON.stringify(profile));
            }
            
            // Atualiza todos os elementos de avatar na página
            updateAvatars(profile.avatar);
            
            return true;
        } catch (error) {
            console.error("Sistema de Avatares: Erro ao carregar dados do perfil:", error);
            return false;
        }
    }
    
    // Função para atualizar todos os elementos de avatar na página
    function updateAvatars(avatarId) {
        const avatarUrl = getAvatarUrl(avatarId);
        
        // Seleciona todos os elementos que devem exibir o avatar
        const avatarElements = document.querySelectorAll('.user-avatar, .profile-avatar, .avatar img');
        
        // Atualiza a src de todos os elementos de imagem de avatar
        avatarElements.forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = avatarUrl;
            } else if (el.style) {
                // Para elementos não-imagem, podemos definir o background-image
                el.style.backgroundImage = `url('${avatarUrl}')`;
            }
        });
        
        console.log("Sistema de Avatares: Avatares atualizados com sucesso:", avatarUrl);
    }
    
    // Executar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Sistema de Avatares: Inicializando...");
        initFuriaxAvatars();
        
        // Adicionar observador para mudanças no localStorage
        window.addEventListener('storage', function(e) {
            if (e.key === 'furiaxProfile') {
                console.log("Sistema de Avatares: Perfil atualizado, atualizando avatares");
                try {
                    const profile = JSON.parse(e.newValue);
                    if (profile && profile.avatar) {
                        updateAvatars(profile.avatar);
                    }
                } catch (err) {
                    console.error("Sistema de Avatares: Erro ao processar alteração:", err);
                }
            }
        });
    });
    
    // Expõe funções para o escopo global sob o namespace FURIAX
    window.FURIAX = window.FURIAX || {};
    window.FURIAX.avatars = {
        update: updateAvatars,
        getUrl: getAvatarUrl,
        init: initFuriaxAvatars
    };
})();