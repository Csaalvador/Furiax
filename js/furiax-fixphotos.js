
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando correção do sistema de amigos FURIAX...');
    
    // ===================================================
    // CONFIGURAÇÕES
    // ===================================================
    const CONFIG = {
        // Chaves para armazenamento
        STORAGE: {
            FRIENDS: 'furiaxFriends',
            CURRENT_USER: 'furiaxCurrentUser',
            USER_PROFILES: 'furiaxUserProfiles'
        },
        // Seletores CSS
        SELECTORS: {
            ADMIN_LIST: '#admin-list',
            BOT_LIST: '#bot-list',
            ONLINE_LIST: '#online-list',
            OFFLINE_LIST: '#offline-list',
            FRIEND_SEARCH: '#friend-search',
            COUNTERS: {
                ADMIN: '#admin-count',
                BOT: '#bot-count',
                ONLINE: '#online-count',
                OFFLINE: '#offline-count'
            }
        },
        // Lista de amigos padrão
        DEFAULT_FRIENDS: [
            { id: 1, name: 'Cauã Salvador', status: 'online', type: 'admin', avatar: 'CS' },
            { id: 2, name: 'Milton Stiilpen Jr', status: 'online', type: 'bot', isApp: true, activity: 'Game Solaris usando os comandos', avatar: 'EZ' },
            { id: 3, name: 'FalleN 1', status: 'online', type: 'bot', isApp: true, activity: 'Assistindo: 2.3 Million Users.', avatar: 'O1' },
            { id: 4, name: 'João Pedro Piva', status: 'offline', type: 'member', avatar: 'JP' }
        ],
        // Estilos para correção visual
        CSS_FIXES: `
            /* Corrigir tamanho da imagem de perfil */
            .avatar-image, .profile-avatar img {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                max-width: none !important;
                max-height: none !important;
            }
            
            /* Estilização dos amigos */
            .user-item {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                margin: 1px 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.1s;
            }
            
            .user-item:hover {
                background-color: rgba(79, 84, 92, 0.3);
            }
            
            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background-color: #36393f;
                margin-right: 12px;
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            
            .user-info {
                flex: 1;
                overflow: hidden;
            }
            
            .user-name {
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .user-name.admin {
                color: #ed4245;
            }
            
            .user-name.bot {
                color: #5865f2;
            }
            
            .user-name.offline {
                color: #96989d;
            }
            
            .user-status {
                font-size: 12px;
                color: #b9bbbe;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .status-indicator {
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                bottom: 0;
                right: 0;
                border: 2px solid #202225;
            }
            
            .status-online {
                background-color: #3ba55c;
            }
            
            .status-offline {
                background-color: #747f8d;
            }
            
            .app-badge {
                background-color: #5865f2;
                color: white;
                font-size: 10px;
                padding: 1px 4px;
                border-radius: 3px;
                margin-left: 8px;
                font-weight: 600;
            }
        `
    };
    
    // ===================================================
    // GERENCIADOR DE ARMAZENAMENTO
    // ===================================================
    
    const StorageManager = {
        /**
         * Salva dados no localStorage
         * @param {string} key - Chave para armazenamento
         * @param {any} data - Dados para salvar
         * @returns {boolean} - Sucesso da operação
         */
        save: function(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Erro ao salvar dados:', e);
                return false;
            }
        },
        
        /**
         * Carrega dados do localStorage
         * @param {string} key - Chave para buscar
         * @param {any} defaultValue - Valor padrão se não encontrar
         * @returns {any} - Dados carregados ou valor padrão
         */
        load: function(key, defaultValue = null) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch (e) {
                console.error('Erro ao carregar dados:', e);
                return defaultValue;
            }
        }
    };
    
    // ===================================================
    // GERENCIADOR DE AMIGOS
    // ===================================================
    
    const FriendsManager = {
        /**
         * Carrega a lista de amigos ou cria uma padrão
         * @returns {Array} - Lista de amigos
         */
        getFriends: function() {
            let friends = StorageManager.load(CONFIG.STORAGE.FRIENDS);
            
            // Se não encontrou amigos, criar lista padrão
            if (!friends || !Array.isArray(friends) || friends.length === 0) {
                friends = CONFIG.DEFAULT_FRIENDS;
                this.saveFriends(friends);
            }
            
            return friends;
        },
        
        /**
         * Salva a lista de amigos
         * @param {Array} friends - Lista de amigos para salvar
         * @returns {boolean} - Sucesso da operação
         */
        saveFriends: function(friends) {
            return StorageManager.save(CONFIG.STORAGE.FRIENDS, friends);
        },
        
        /**
         * Obtém as iniciais do nome
         * @param {string} name - Nome para extrair iniciais
         * @returns {string} - Iniciais do nome
         */
        getInitials: function(name) {
            if (!name || typeof name !== 'string') return '??';
            
            return name.split(' ')
                .map(part => part.charAt(0))
                .join('')
                .toUpperCase()
                .substring(0, 2);
        }
    };
    
    // ===================================================
    // GERENCIADOR DE INTERFACE
    // ===================================================
    
    const UIManager = {
        /**
         * Inicializa a interface
         */
        init: function() {
            // Adicionar estilos CSS
            this.addStyles();
            
            // Renderizar amigos
            this.renderFriends();
            
            // Configurar pesquisa
            this.setupSearch();
            
            // Corrigir problemas visuais
            this.fixVisualIssues();
        },
        
        /**
         * Adiciona estilos CSS para correções
         */
        addStyles: function() {
            const styleElement = document.createElement('style');
            styleElement.textContent = CONFIG.CSS_FIXES;
            document.head.appendChild(styleElement);
        },
        
        /**
         * Renderiza a lista de amigos
         */
        renderFriends: function() {
            // Obter elementos da lista
            const adminList = document.querySelector(CONFIG.SELECTORS.ADMIN_LIST);
            const botList = document.querySelector(CONFIG.SELECTORS.BOT_LIST);
            const onlineList = document.querySelector(CONFIG.SELECTORS.ONLINE_LIST);
            const offlineList = document.querySelector(CONFIG.SELECTORS.OFFLINE_LIST);
            
            // Se não encontrar listas, sair
            if (!adminList || !botList || !onlineList || !offlineList) {
                console.error('Listas de amigos não encontradas');
                return;
            }
            
            // Limpar listas
            adminList.innerHTML = '';
            botList.innerHTML = '';
            onlineList.innerHTML = '';
            offlineList.innerHTML = '';
            
            // Obter lista de amigos
            const friends = FriendsManager.getFriends();
            
            // Filtrar por termo de busca
            const searchInput = document.querySelector(CONFIG.SELECTORS.FRIEND_SEARCH);
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            
            // Contadores
            let adminCount = 0;
            let botCount = 0;
            let onlineCount = 0;
            let offlineCount = 0;
            
            // Renderizar cada amigo
            friends.forEach(friend => {
                // Verificar se corresponde à busca
                if (searchTerm && !friend.name.toLowerCase().includes(searchTerm)) {
                    return;
                }
                
                // Criar elemento do amigo
                const element = this.createFriendElement(friend);
                
                // Adicionar à lista apropriada
                if (friend.type === 'admin') {
                    adminList.appendChild(element);
                    adminCount++;
                } else if (friend.type === 'bot') {
                    botList.appendChild(element);
                    botCount++;
                } else if (friend.status === 'online') {
                    onlineList.appendChild(element);
                    onlineCount++;
                } else {
                    offlineList.appendChild(element);
                    offlineCount++;
                }
            });
            
            // Atualizar contadores
            const adminCounter = document.querySelector(CONFIG.SELECTORS.COUNTERS.ADMIN);
            const botCounter = document.querySelector(CONFIG.SELECTORS.COUNTERS.BOT);
            const onlineCounter = document.querySelector(CONFIG.SELECTORS.COUNTERS.ONLINE);
            const offlineCounter = document.querySelector(CONFIG.SELECTORS.COUNTERS.OFFLINE);
            
            if (adminCounter) adminCounter.textContent = adminCount;
            if (botCounter) botCounter.textContent = botCount;
            if (onlineCounter) onlineCounter.textContent = onlineCount;
            if (offlineCounter) offlineCounter.textContent = offlineCount;
        },
        
        /**
         * Cria o elemento HTML para um amigo
         * @param {Object} friend - Dados do amigo
         * @returns {HTMLElement} - Elemento HTML do amigo
         */
        createFriendElement: function(friend) {
            const element = document.createElement('div');
            element.className = 'user-item';
            element.dataset.id = friend.id;
            
            // Determinar status e atividade
            const statusText = friend.status === 'online' 
                ? (friend.activity || 'Online') 
                : 'Offline';
            
            // Classe especial para nome
            let nameClass = '';
            if (friend.type === 'admin') nameClass = 'admin';
            else if (friend.type === 'bot') nameClass = 'bot';
            else if (friend.status === 'offline') nameClass = 'offline';
            
            // Badge para apps
            const appBadge = friend.isApp ? '<span class="app-badge">APP</span>' : '';
            
            // Avatar - usar texto ou imagem
            const avatarContent = friend.avatarUrl 
                ? `<img src="${friend.avatarUrl}" alt="Avatar" class="avatar-image">` 
                : (friend.avatar || FriendsManager.getInitials(friend.name));
            
            // HTML do amigo
            element.innerHTML = `
                <div class="user-avatar">
                    ${avatarContent}
                    <div class="status-indicator status-${friend.status}"></div>
                </div>
                <div class="user-info">
                    <div class="user-name ${nameClass}">${friend.name} ${appBadge}</div>
                    <div class="user-status">${statusText}</div>
                </div>
            `;
            
            return element;
        },
        
        /**
         * Configura a funcionalidade de pesquisa
         */
        setupSearch: function() {
            const searchInput = document.querySelector(CONFIG.SELECTORS.FRIEND_SEARCH);
            if (!searchInput) return;
            
            // Adicionar evento de input
            searchInput.addEventListener('input', () => {
                this.renderFriends();
            });
        },
        
        /**
         * Corrige problemas visuais específicos
         */
        fixVisualIssues: function() {
            // Corrigir tamanho das imagens de perfil
            const avatarImages = document.querySelectorAll('.avatar-image, .profile-avatar img');
            avatarImages.forEach(img => {
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
            });
            
            // Aplicar observer para novas imagens
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // Somente elementos
                                const newImages = node.querySelectorAll('.avatar-image, .profile-avatar img');
                                newImages.forEach(img => {
                                    img.style.maxWidth = '100%';
                                    img.style.maxHeight = '100%';
                                    img.style.width = '100%';
                                    img.style.height = '100%';
                                    img.style.objectFit = 'cover';
                                });
                            }
                        });
                    }
                });
            });
            
            // Observar mudanças no DOM
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    };
    
    // ===================================================
    // CORREÇÃO DE POSTAGENS
    // ===================================================
    
    const PostFixer = {
        /**
         * Inicializa a correção de postagens
         */
        init: function() {
            this.fixPostButton();
        },
        
        /**
         * Corrige o botão de post para garantir funcionamento
         */
        fixPostButton: function() {
            const postButton = document.querySelector('#analyzePostBtn');
            if (!postButton) {
                console.error('Botão de post não encontrado');
                return;
            }
            
            // Verificar se já está funcionando
            if (postButton._fixed) return;
            
            // Marcar como corrigido
            postButton._fixed = true;
            
            // Remover todos os event listeners anteriores
            const newPostButton = postButton.cloneNode(true);
            postButton.parentNode.replaceChild(newPostButton, postButton);
            
            // Adicionar listener funcional
            newPostButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Capturar texto do post
                const postInput = document.querySelector('.post-input');
                if (!postInput) return;
                
                const postText = postInput.value.trim();
                if (!postText) {
                    alert('Digite algo para publicar!');
                    return;
                }
                
                // Criar um post na estrutura correta
                if (window.FURIAXCommunity && window.FURIAXCommunity.PostManager) {
                    window.FURIAXCommunity.PostManager.createPost(postText);
                } else {
                    // Implementação alternativa se não tiver o sistema FURIAX
                    this.createSimplePost(postText);
                }
                
                // Limpar input
                postInput.value = '';
                
                // Atualizar posts
                if (window.FURIAXCommunity && window.FURIAXCommunity.UIManager) {
                    window.FURIAXCommunity.UIManager.renderPosts();
                }
            });
        },
        
        /**
         * Cria um post simples (caso não tenha o sistema FURIAX)
         * @param {string} text - Texto do post
         */
        createSimplePost: function(text) {
            // Usuário atual
            const username = document.getElementById('sidebarUsername')?.textContent || 'FuriaX_User';
            
            // Criar estrutura do post
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            
            // Avatar
            const avatar = document.querySelector('.profile-avatar img')?.src || '';
            const avatarHTML = avatar 
                ? `<div class="post-avatar"><img src="${avatar}" alt="Avatar" class="avatar-image"></div>`
                : `<div class="post-avatar">${username.substring(0, 2).toUpperCase()}</div>`;
            
            // Conteúdo do post
            postCard.innerHTML = `
                <div class="post-header">
                    ${avatarHTML}
                    <div class="post-user-info">
                        <div class="post-user-name">${username}</div>
                        <div class="post-time">agora</div>
                    </div>
                </div>
                <div class="post-content">${text}</div>
                <div class="post-footer">
                    <div class="post-stats">
                        <div class="post-stat"><i class="fas fa-heart"></i> 0</div>
                        <div class="post-stat"><i class="fas fa-comment"></i> 0</div>
                        <div class="post-stat"><i class="fas fa-share"></i> 0</div>
                    </div>
                    <div class="post-actions-btns">
                        <button class="post-action-btn" data-action="curtir">
                            <i class="far fa-heart"></i> Curtir
                        </button>
                        <button class="post-action-btn comment-btn" data-action="comentar">
                            <i class="far fa-comment"></i> Comentar
                        </button>
                        <button class="post-action-btn" data-action="compartilhar">
                            <i class="fas fa-share"></i> Compartilhar
                        </button>
                    </div>
                </div>
                <div class="comments-section" id="comments-${Date.now()}">
                    <div class="comment-form">
                        <input type="text" class="comment-input" placeholder="Escreva um comentário...">
                        <button class="comment-submit">Enviar</button>
                    </div>
                    <div class="comment-list"></div>
                </div>
            `;
            
            // Adicionar ao feed
            const feedContainer = document.querySelector('.feed-column');
            if (feedContainer) {
                const firstChild = feedContainer.firstChild;
                if (firstChild && firstChild.classList && firstChild.classList.contains('create-post')) {
                    feedContainer.insertBefore(postCard, firstChild.nextSibling);
                } else {
                    feedContainer.insertBefore(postCard, firstChild);
                }
            }
        }
    };
    
    // ===================================================
    // INICIALIZAÇÃO
    // ===================================================
    
    // Inicializar componentes
    UIManager.init();
    PostFixer.init();
    
    console.log('✅ Correção do sistema de amigos aplicada com sucesso!');
});
