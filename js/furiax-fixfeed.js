

(function() {
    console.log('🔵 Iniciando correção para background azul em avatares...');
    
    // Configurações
    const CONFIG = {
        STORAGE_KEY_PROFILE: 'furiaxProfile',
        DEFAULT_AVATAR: '../img/logo/logoFuriax.png',
        DEBUG: true
    };
    
    // Função para depuração
    function debug(message) {
        if (CONFIG.DEBUG) {
            console.log(`🔵 [Avatar BG Fix] ${message}`);
        }
    }
    
    // 1. Verificar se os caminhos dos avatares estão corretos
    const avatarMappings = {
        1: "../img/avatars/avatar01.jpg", 
        2: "../img/avatars/avatar02.jpg",
        3: "../img/avatars/avatar03.jpg",
        4: "../img/avatars/avatar04.png",
        5: "../img/avatars/avatar05.png",
        6: "../img/avatars/avatar06.jpg"
    };
    
    // Verificar se os avatares estão acessíveis
    function checkAvatarPaths() {
        debug("Verificando caminhos dos avatares...");
        
        Object.keys(avatarMappings).forEach(key => {
            const img = new Image();
            img.onload = function() {
                debug(`✅ Avatar ${key} carregado com sucesso: ${img.src}`);
            };
            img.onerror = function() {
                console.error(`❌ ERRO: Avatar ${key} não encontrado em: ${img.src}`);
                
                // Tente caminho alternativo
                const alternativePath = avatarMappings[key].replace('../', './');
                debug(`Tentando caminho alternativo: ${alternativePath}`);
                
                const altImg = new Image();
                altImg.onload = function() {
                    debug(`✅ Avatar ${key} carregado com caminho alternativo: ${alternativePath}`);
                    avatarMappings[key] = alternativePath; // Atualiza o mapeamento
                };
                altImg.onerror = function() {
                    console.error(`❌ ERRO: Avatar também não encontrado no caminho alternativo: ${alternativePath}`);
                };
                altImg.src = alternativePath;
            };
            img.src = avatarMappings[key];
        });
    }
    
    // 2. Função para obter perfil do usuário
    function getProfile() {
        try {
            const profileData = localStorage.getItem(CONFIG.STORAGE_KEY_PROFILE);
            if (profileData) {
                return JSON.parse(profileData);
            }
        } catch (e) {
            console.error('Erro ao obter perfil:', e);
        }
        return null;
    }
    
    // 3. Função para garantir que as imagens sejam exibidas corretamente
    function fixAvatarImages() {
        debug("Aplicando correção para backgrounds azuis...");
        
        const profile = getProfile();
        if (!profile || !profile.avatar) {
            debug("Perfil não encontrado ou sem avatar definido");
            return;
        }
        
        // Determinar URL do avatar
        let avatarUrl;
        const avatarId = parseInt(profile.avatar);
        
        if (!isNaN(avatarId) && avatarMappings[avatarId]) {
            avatarUrl = avatarMappings[avatarId];
            debug(`Avatar ID ${avatarId} mapeado para: ${avatarUrl}`);
        } else if (typeof profile.avatar === 'string' && 
                  (profile.avatar.startsWith('http') || 
                   profile.avatar.startsWith('../') || 
                   profile.avatar.startsWith('/'))) {
            // É uma URL completa
            avatarUrl = profile.avatar;
            debug(`Avatar é uma URL: ${avatarUrl}`);
        } else {
            // Fallback para logo padrão
            avatarUrl = CONFIG.DEFAULT_AVATAR;
            debug(`Usando avatar padrão: ${avatarUrl}`);
        }
        
        // Função para corrigir container de avatar
        function fixContainer(container, username) {
            // Verificar se é um container do usuário atual
            const parent = container.closest('.post-card, .comment-item');
            if (!parent) return;
            
            const userElement = parent.querySelector('.post-user-name, .comment-user');
            if (!userElement || userElement.textContent !== profile.username) return;
            
            debug(`Corrigindo avatar para ${profile.username} em ${container.className}`);
            
            // Remover background azul
            container.style.background = 'none';
            
            // Garantir que exista uma imagem
            let avatarImg = container.querySelector('img');
            
            if (!avatarImg) {
                // Criar imagem se não existir
                avatarImg = document.createElement('img');
                avatarImg.alt = 'Avatar';
                avatarImg.className = 'avatar-image';
                container.appendChild(avatarImg);
                debug("Imagem de avatar criada");
            }
            
            // Garantir estilos corretos na imagem
            avatarImg.style.width = '100%';
            avatarImg.style.height = '100%';
            avatarImg.style.objectFit = 'cover';
            avatarImg.style.borderRadius = '50%';
            
            // Definir src da imagem
            avatarImg.src = avatarUrl;
            
            // Adicionar fallback
            avatarImg.onerror = function() {
                debug(`Erro ao carregar imagem: ${avatarUrl}, usando fallback`);
                this.src = CONFIG.DEFAULT_AVATAR;
                // Adicionar borda para visualização
                this.style.border = '2px solid red';
            };
            
            debug(`Avatar atualizado para: ${avatarUrl}`);
        }
        
        // Aplicar correção a todos os containers de avatar
        document.querySelectorAll('.post-avatar, .comment-avatar').forEach(container => {
            fixContainer(container);
        });
    }
    
    // 4. Corrigir estilos CSS problemáticos
    function fixCSSStyles() {
        debug("Corrigindo estilos CSS problemáticos...");
        
        // Adicionar estilos que garantem que a imagem seja exibida corretamente
        const styleEl = document.createElement('style');
        styleEl.id = 'avatar-background-fix-styles';
        styleEl.textContent = `
            /* Garantir que o container não tenha background que sobreponha a imagem */
            .post-avatar, .comment-avatar {
                background: transparent !important;
                overflow: hidden !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
            }
            
            /* Garantir que a imagem ocupe todo o espaço disponível */
            .post-avatar img, .comment-avatar img {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                border-radius: 50% !important;
                display: block !important;
            }
            
            /* Adicionar efeito de hover para melhor feedback visual */
            .post-avatar:hover img, .comment-avatar:hover img {
                transform: scale(1.05);
                transition: transform 0.2s ease;
            }
        `;
        
        // Adicionar ao head apenas se ainda não existir
        if (!document.getElementById('avatar-background-fix-styles')) {
            document.head.appendChild(styleEl);
            debug("Estilos CSS corretivos adicionados");
        }
    }
    
    // 5. Observar mudanças no DOM para aplicar a correção a novos elementos
    function observeDOMChanges() {
        debug("Configurando observador para novas alterações...");
        
        const observer = new MutationObserver(function(mutations) {
            let shouldFix = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    // Verificar se algum novo elemento relevante foi adicionado
                    const hasRelevantNodes = Array.from(mutation.addedNodes).some(node => 
                        node.nodeType === 1 && (
                            node.classList?.contains('post-card') || 
                            node.classList?.contains('comment-item') ||
                            node.querySelector?.('.post-avatar, .comment-avatar')
                        )
                    );
                    
                    if (hasRelevantNodes) {
                        shouldFix = true;
                    }
                }
            });
            
            if (shouldFix) {
                debug("Novos elementos detectados, reaplicando correção...");
                setTimeout(fixAvatarImages, 50);
            }
        });
        
        // Observar a coluna de feed
        const feedColumn = document.querySelector('.feed-column');
        if (feedColumn) {
            observer.observe(feedColumn, { 
                childList: true, 
                subtree: true 
            });
            debug("Observando mudanças no feed");
        }
    }
    
    // Iniciar o processo de correção
    function init() {
        // Verificar caminhos de avatar
        checkAvatarPaths();
        
        // Corrigir estilos CSS
        fixCSSStyles();
        
        // Aplicar correção aos avatares existentes
        fixAvatarImages();
        
        // Observar mudanças no DOM
        observeDOMChanges();
        
        // Aplicar novamente após um tempo para garantir
        setTimeout(fixAvatarImages, 1000);
        setTimeout(fixAvatarImages, 3000);
        
        debug("Correção para background azul inicializada com sucesso");
    }
    
    // Executar inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Reexecutar quando a página estiver totalmente carregada
    window.addEventListener('load', fixAvatarImages);
    
    // Monitorar alterações no localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === CONFIG.STORAGE_KEY_PROFILE) {
            debug("Perfil alterado, reaplicando correção...");
            fixAvatarImages();
        }
    });
})();

