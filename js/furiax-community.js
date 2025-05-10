/**
 * FURIAX Community - Sistema Completo para Comunidade de Fãs
 * Versão: 2.2.0
 * Desenvolvido para: FURIAX - Conectando a Fúria
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando FURIAX Community System...');
    
    // =====================================================
    // CONFIGURAÇÕES E CONSTANTES
    // =====================================================
    
    const CONFIG = {
        STORAGE_KEYS: {
            POSTS: 'furiax_posts',
            USER_DATA: 'furiax_user_data',
            PROFILE: 'furiaxProfile'
        },
        SENTIMENT: {
            POSITIVE_THRESHOLD: 0.3,
            NEGATIVE_THRESHOLD: -0.3,
            VERY_POSITIVE_THRESHOLD: 0.7,
            VERY_NEGATIVE_THRESHOLD: -0.7
        },
        DEFAULTS: {
            USERNAME: 'FuriaX_User',
            TITLE: 'Furioso Novato'
        },
        SELECTORS: {
            POST_INPUT: '.post-input',
            POST_BUTTON: '#analyzePostBtn',
            FEED_CONTAINER: '.feed-column',
            SIDEBAR_USERNAME: '#sidebarUsername',
            SIDEBAR_TITLE: '#sidebarTitle'
        },
        CSS: {
            NOTIFICATION_ID: 'furiaxNotification',
            POST_CLASS: 'post-card',
            COMMENT_SECTION_CLASS: 'comments-section',
            LIKE_ACTIVE_CLASS: 'liked',
            COMMENT_SHOW_CLASS: 'show',
            GENERATED_CLASS: 'generated'
        }
    };
    
    // =====================================================
    // SISTEMA DE ARMAZENAMENTO LOCAL
    // =====================================================
    
    const StorageManager = {
        get: function(key, defaultValue = null) {
            try {
                const data = localStorage.getItem(key);
                if (!data) return defaultValue;
                
                const parsedData = JSON.parse(data);
                return parsedData || defaultValue;
            } catch (error) {
                console.error(`❌ Erro ao carregar dados (${key}):`, error);
                return defaultValue;
            }
        },
        
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error(`❌ Erro ao salvar dados (${key}):`, error);
                return false;
            }
        },
        
        isAvailable: function() {
            try {
                const testKey = '__storage_test__';
                localStorage.setItem(testKey, testKey);
                localStorage.removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        }
    };
    
    // =====================================================
    // SISTEMA DE GERENCIAMENTO DE PERFIL
    // =====================================================
    
    const ProfileManager = {
        getProfileData: function() {
            return StorageManager.get(CONFIG.STORAGE_KEYS.PROFILE, {
                username: CONFIG.DEFAULTS.USERNAME,
                avatar: CONFIG.DEFAULTS.AVATAR,
                title: CONFIG.DEFAULTS.TITLE,
                level: 1,
                levelProgress: 0,
                bio: 'Olá, sou um fã da FURIA!'
            });
        },
        
        getAvatarHTML: function(avatarPath = null) {
            // Se tiver um caminho de avatar, retorna uma tag img
            
            
            // Se não, usa as iniciais
            const profile = this.getProfileData();
            const initials = profile.username ? profile.username.substring(0, 2).toUpperCase() : CONFIG.DEFAULTS.USERNAME.substring(0, 2).toUpperCase();
            return initials;
        },
        
        updateProfileUI: function() {
            const profileData = this.getProfileData();
            
            // Atualizar nome de usuário e título na sidebar
            const usernameElement = document.querySelector(CONFIG.SELECTORS.SIDEBAR_USERNAME);
            const titleElement = document.querySelector(CONFIG.SELECTORS.SIDEBAR_TITLE);
            
            if (usernameElement) {
                usernameElement.textContent = profileData.username || CONFIG.DEFAULTS.USERNAME;
            }
            
            if (titleElement) {
                titleElement.textContent = profileData.title || CONFIG.DEFAULTS.TITLE;
            }
            
            // Atualizar avatar
            const avatarImage = document.querySelector('.avatar-image');
            if (avatarImage && profileData.avatar) {
                avatarImage.src = profileData.avatar;
                avatarImage.onerror = function() {
                    this.src = CONFIG.DEFAULTS.AVATAR;
                };
            }
        }
    };
    
    // =====================================================
    // SISTEMA DE ANÁLISE DE SENTIMENTO
    // =====================================================
  
    const SentimentAnalyzer = {
        analyze: function(text) {
            if (!text) return { score: 0, magnitude: 0, label: 'neutro' };
            
            // Implementação simplificada de análise de sentimento
            const positiveWords = ['bom', 'ótimo', 'excelente', 'incrível', 'maravilhoso', 'fantástico', 'vitória', 'campeão', 'fúria', 'vamos', 'confiante', 'forte', 'melhor', 'alegria', 'feliz', 'empolgante', 'vencer'];
            const negativeWords = ['ruim', 'péssimo', 'horrível', 'terrível', 'decepcionante', 'fraco', 'pior', 'triste', 'frustração', 'derrota', 'perder', 'falha', 'raiva', 'ódio', 'difícil'];
            
            // Converter para minúsculas e tokenizar
            const words = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
            
            // Contar palavras positivas e negativas
            let positiveCount = 0;
            let negativeCount = 0;
            
            words.forEach(word => {
                if (positiveWords.includes(word)) positiveCount++;
                if (negativeWords.includes(word)) negativeCount++;
            });
            
            // Calcular pontuação (-1 a 1)
            let score = 0;
            if (positiveCount > 0 || negativeCount > 0) {
                score = (positiveCount - negativeCount) / (positiveCount + negativeCount);
            }
            
            // Calcular magnitude (intensidade)
            const magnitude = positiveCount + negativeCount;
            
            // Determinar rótulo
            let label = 'neutro';
            if (score > CONFIG.SENTIMENT.POSITIVE_THRESHOLD) label = 'positivo';
            if (score < CONFIG.SENTIMENT.NEGATIVE_THRESHOLD) label = 'negativo';
            if (score > CONFIG.SENTIMENT.VERY_POSITIVE_THRESHOLD) label = 'muito_positivo';
            if (score < CONFIG.SENTIMENT.VERY_NEGATIVE_THRESHOLD) label = 'muito_negativo';
            
            return {
                score,
                magnitude,
                label
            };
        },
        
        extractHashtags: function(text) {
            if (!text) return [];
            
            const hashtagRegex = /#(\w+)/g;
            const matches = text.match(hashtagRegex);
            
            if (!matches) return [];
            
            return matches.map(tag => tag.substring(1).toLowerCase());
        }
    };
    
    // =====================================================
    // SISTEMA DE FORMATAÇÃO DE TEMPO
    // =====================================================
    
    const TimeFormatter = {
        getRelativeTime: function(timestamp) {
            // Se não tiver timestamp, retorna "agora"
            if (!timestamp) return "agora";
            
            // Converter para número se for string
            if (typeof timestamp === 'string') {
                timestamp = parseInt(timestamp);
            }
            
            // Se não for um número válido, retorna "agora"
            if (isNaN(timestamp)) return "agora";
            
            const now = Date.now();
            const diff = now - timestamp;
            
            // Converter milissegundos para segundos
            const seconds = Math.floor(diff / 1000);
            
            if (seconds < 60) return "agora";
            if (seconds < 120) return "há 1 minuto";
            
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `há ${minutes} minutos`;
            if (minutes < 120) return "há 1 hora";
            
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `há ${hours} horas`;
            if (hours < 48) return "ontem";
            
            const days = Math.floor(hours / 24);
            if (days < 30) return `há ${days} dias`;
            
            const months = Math.floor(days / 30);
            if (months < 12) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
            
            const years = Math.floor(months / 12);
            return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
        }
    };
    
    // =====================================================
    // SISTEMA DE GERENCIAMENTO DE POSTS
    // =====================================================
    
    const PostManager = {
        getPosts: function() {
            const posts = StorageManager.get(CONFIG.STORAGE_KEYS.POSTS, []);
            
            // Garantir que todos os posts tenham as propriedades necessárias
            return posts.map(post => {
                // Garantir que o post tenha um ID (numérico)
                if (typeof post.id === 'string') {
                    post.id = parseInt(post.id);
                }
                
                // Garantir que o post tenha um array de comentários
                if (!Array.isArray(post.comentarios)) {
                    post.comentarios = [];
                }
                
                // Garantir que tenha objeto de sentimento
                if (!post.sentiment) {
                    post.sentiment = SentimentAnalyzer.analyze(post.conteudo);
                }
                
                // Atualizar formato de tempo relativo
                if (typeof post.timestamp === 'number') {
                    post.tempo = TimeFormatter.getRelativeTime(post.timestamp);
                }
                
                return post;
            });
        },
        
        savePosts: function(posts) {
            if (!Array.isArray(posts)) {
                console.error('❌ Tentativa de salvar posts com formato inválido:', posts);
                return false;
            }
            
            // Filtrar posts inválidos
            const validPosts = posts.filter(post => post && typeof post === 'object');
            
            return StorageManager.set(CONFIG.STORAGE_KEYS.POSTS, validPosts);
        },
        
        createPost: function(content) {
            if (!content || content.trim() === '') return null;
            
            // Obter dados do perfil do usuário
            const profileData = ProfileManager.getProfileData();
            
            // Criar objeto do post
            const post = {
                id: Date.now(),
                usuario: profileData.username || CONFIG.DEFAULTS.USERNAME,
                avatar: profileData.avatar || CONFIG.DEFAULTS.AVATAR,
                timestamp: Date.now(),
                tempo: 'agora',
                conteudo: content.trim(),
                curtidas: 0,
                comentarios: [],
                compartilhamentos: 0,
                curtido: false,
                sentiment: SentimentAnalyzer.analyze(content.trim())
            };
            
            // Adicionar ao armazenamento
            const posts = this.getPosts();
            posts.unshift(post);
            this.savePosts(posts);
            
            // Sistema de gamificação (simplificado)
            this.addPoints('post_created', 10);
            
            return post;
        },
        
        toggleLike: function(postId) {
            const posts = this.getPosts();
            let updatedPost = null;
            
            const numericPostId = parseInt(postId);
            
            const updatedPosts = posts.map(post => {
                if (post.id === numericPostId) {
                    post.curtido = !post.curtido;
                    post.curtidas = post.curtido ? post.curtidas + 1 : Math.max(0, post.curtidas - 1);
                    updatedPost = post;
                    
                    // Sistema de gamificação (simplificado)
                    if (post.curtido) {
                        this.addPoints('post_liked', 2);
                    }
                }
                return post;
            });
            
            if (updatedPost) {
                this.savePosts(updatedPosts);
            }
            
            return updatedPost;
        },
        
        addComment: function(postId, commentText) {
            if (!commentText || commentText.trim() === '') return null;
            
            const posts = this.getPosts();
            let updatedPost = null;
            
            const numericPostId = parseInt(postId);
            
            // Obter dados do perfil do usuário
            const profileData = ProfileManager.getProfileData();
            
            const updatedPosts = posts.map(post => {
                if (post.id === numericPostId) {
                    const comment = {
                        id: Date.now(),
                        usuario: profileData.username || CONFIG.DEFAULTS.USERNAME,
                        avatar: profileData.avatar || CONFIG.DEFAULTS.AVATAR,
                        texto: commentText.trim(),
                        timestamp: Date.now(),
                        tempo: 'agora',
                        sentiment: SentimentAnalyzer.analyze(commentText.trim())
                    };
                    
                    // Garantir que comentarios seja um array
                    if (!Array.isArray(post.comentarios)) {
                        post.comentarios = [];
                    }
                    
                    post.comentarios.push(comment);
                    updatedPost = post;
                    
                    // Sistema de gamificação (simplificado)
                    this.addPoints('comment_added', 5);
                }
                return post;
            });
            
            if (updatedPost) {
                this.savePosts(updatedPosts);
            }
            
            return updatedPost;
        },
        
        sharePost: function(postId) {
            const posts = this.getPosts();
            let updatedPost = null;
            
            const numericPostId = parseInt(postId);
            
            const updatedPosts = posts.map(post => {
                if (post.id === numericPostId) {
                    post.compartilhamentos += 1;
                    updatedPost = post;
                    
                    // Sistema de gamificação (simplificado)
                    this.addPoints('post_shared', 8);
                }
                return post;
            });
            
            if (updatedPost) {
                this.savePosts(updatedPosts);
            }
            
            return updatedPost;
        },
        
        addPoints: function(action, points) {
            // Implementação simplificada de gamificação
            const userData = StorageManager.get(CONFIG.STORAGE_KEYS.USER_DATA, {
                points: 0,
                actions: {}
            });
            
            // Adicionar pontos
            userData.points = (userData.points || 0) + points;
            
            // Registrar ação
            if (!userData.actions) {
                userData.actions = {};
            }
            
            if (!userData.actions[action]) {
                userData.actions[action] = 0;
            }
            
            userData.actions[action]++;
            
            // Salvar dados
            StorageManager.set(CONFIG.STORAGE_KEYS.USER_DATA, userData);
        }
    };
    
    // =====================================================
    // SISTEMA DE NOTIFICAÇÕES
    // =====================================================
    
    const NotificationManager = {
        show: function(message, type = 'info', duration = 3000) {
            // Verificar se o elemento de notificação existe
            let notification = document.getElementById(CONFIG.CSS.NOTIFICATION_ID);
            
            // Se não existir, criar um
            if (!notification) {
                notification = document.createElement('div');
                notification.id = CONFIG.CSS.NOTIFICATION_ID;
                document.body.appendChild(notification);
                
                // Adicionar estilos necessários
                const style = document.createElement('style');
                style.textContent = `
                    #${CONFIG.CSS.NOTIFICATION_ID} {
                        position: fixed;
                        bottom: -60px;
                        left: 50%;
                        transform: translateX(-50%);
                        padding: 12px 20px;
                        border-radius: 30px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        z-index: 1000;
                        transition: bottom 0.3s ease-in-out;
                        color: white;
                        font-family: 'Exo 2', sans-serif;
                    }
                    
                    #${CONFIG.CSS.NOTIFICATION_ID}.active {
                        bottom: 20px;
                    }
                    
                    #${CONFIG.CSS.NOTIFICATION_ID}.success {
                        background: linear-gradient(90deg, #00cc66, #1e90ff);
                    }
                    
                    #${CONFIG.CSS.NOTIFICATION_ID}.warning {
                        background: linear-gradient(90deg, #ff9900, #ff6600);
                    }
                    
                    #${CONFIG.CSS.NOTIFICATION_ID}.error {
                        background: linear-gradient(90deg, #ff3b5c, #ff0044);
                    }
                    
                    #${CONFIG.CSS.NOTIFICATION_ID}.info {
                        background: linear-gradient(90deg, #1e90ff, #0066cc);
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Determinar ícone com base no tipo
            let icon;
            switch (type) {
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
            
            // Atualizar conteúdo e estilo
            notification.innerHTML = `${icon} <span>${message}</span>`;
            
            // Limpar classes anteriores
            notification.className = '';
            
            // Adicionar classe de tipo
            notification.classList.add(type);
            
            // Mostrar
            notification.classList.add('active');
            
            // Esconder após um tempo
            setTimeout(() => {
                notification.classList.remove('active');
            }, duration);
        }
    };
    
    // =====================================================
    // SISTEMA DE INTERFACE DO USUÁRIO
    // =====================================================
    
    const UIManager = {
        init: function() {
            console.log('🎮 Inicializando interface...');
            
            // Adicionar estilos CSS
            this.addGlobalStyles();
            
            // Verificar disponibilidade de armazenamento
            if (!StorageManager.isAvailable()) {
                console.error('❌ LocalStorage não disponível!');
                NotificationManager.show('Armazenamento local não disponível. Algumas funcionalidades podem não funcionar.', 'error', 5000);
            }
            
            // Configurar eventos da interface
            this.setupEventListeners();
            
            // Renderizar posts iniciais
            this.renderPosts();
            
            // Atualizar interface de perfil
            ProfileManager.updateProfileUI();
            
            console.log('✅ Interface inicializada com sucesso!');
        },
        
        setupEventListeners: function() {
            // Botão de publicação
            const postButton = document.querySelector(CONFIG.SELECTORS.POST_BUTTON);
            const postInput = document.querySelector(CONFIG.SELECTORS.POST_INPUT);
            
            if (postButton && postInput) {
                // Remover event listeners anteriores para evitar duplicação
                const newPostButton = postButton.cloneNode(true);
                postButton.parentNode.replaceChild(newPostButton, postButton);
                
                // Adicionar novo event listener
                newPostButton.addEventListener('click', () => {
                    const content = postInput.value.trim();
                    
                    if (content) {
                        // Criar post
                        const post = PostManager.createPost(content);
                        
                        if (post) {
                            // Renderizar posts imediatamente
                            this.renderPosts();
                            
                            // Mostrar feedback
                            NotificationManager.show('Post criado com sucesso!', 'success');
                            
                            // Limpar input
                            postInput.value = '';
                        } else {
                            NotificationManager.show('Erro ao criar post. Tente novamente.', 'error');
                        }
                    } else {
                        NotificationManager.show('Comentário criado com sucesso!', 'sucess');
                    }
                });
                
                // Adicionar evento para tecla Enter no input
                postInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        newPostButton.click();
                    }
                });
            } else {
                console.error('❌ Elementos de post não encontrados!');
            }
            
            // Configurar eventos delegados para posts
            this.setupPostEventDelegation();
        },
        
        // Função para atualizar a UI de um único post
        updatePostUI: function(postId, updatedPost) {
            if (!postId || !updatedPost) return false;
            
            const postElement = document.querySelector(`.${CONFIG.CSS.POST_CLASS}[data-id="${postId}"]`);
            if (!postElement) return false;
            
            // Atualizar curtidas
            const likeCounter = postElement.querySelector('.post-stat:first-child');
            if (likeCounter) {
                likeCounter.innerHTML = `<i class="fas fa-heart"></i> ${updatedPost.curtidas || 0}`;
            }
            
            // Atualizar status de curtida
            const likeButton = postElement.querySelector('[data-action="curtir"]');
            if (likeButton) {
                if (updatedPost.curtido) {
                    likeButton.classList.add(CONFIG.CSS.LIKE_ACTIVE_CLASS);
                    likeButton.innerHTML = `<i class="fas fa-heart"></i> Curtido`;
                } else {
                    likeButton.classList.remove(CONFIG.CSS.LIKE_ACTIVE_CLASS);
                    likeButton.innerHTML = `<i class="far fa-heart"></i> Curtir`;
                }
            }
            
            // Atualizar compartilhamentos
            const shareCounter = postElement.querySelector('.post-stat:nth-child(3)');
            if (shareCounter) {
                shareCounter.innerHTML = `<i class="fas fa-share"></i> ${updatedPost.compartilhamentos || 0}`;
            }
            
            // Atualizar comentários
            const commentCounter = postElement.querySelector('.post-stat:nth-child(2)');
            if (commentCounter) {
                commentCounter.innerHTML = `<i class="fas fa-comment"></i> ${updatedPost.comentarios.length}`;
            }
            
            // Atualizar lista de comentários se houver novos
            if (updatedPost.comentarios && updatedPost.comentarios.length > 0) {
                const commentsList = postElement.querySelector('.comment-list');
                if (commentsList) {
                    // Limpar comentários existentes
                    commentsList.innerHTML = '';
                    
                    // Renderizar novos comentários
                    updatedPost.comentarios.forEach(comentario => {
                        // Preparar avatar do comentário
                        const commentAvatarHTML = comentario.avatar 
                            ? `<div class="comment-avatar"><img src="${comentario.avatar}" alt="Avatar" class="avatar-image" onerror="this.src='${CONFIG.DEFAULTS.AVATAR}'"></div>`
                            : `<div class="comment-avatar">${comentario.usuario ? comentario.usuario.substring(0, 2).toUpperCase() : 'FX'}</div>`;
                        
                        // Atualizar tempo relativo do comentário
                        const commentTime = comentario.timestamp 
                            ? TimeFormatter.getRelativeTime(comentario.timestamp) 
                            : (comentario.tempo || 'agora');
                        
                        const commentItem = document.createElement('div');
                        commentItem.className = 'comment-item';
                        commentItem.innerHTML = `
                            ${commentAvatarHTML}
                            <div class="comment-content">
                                <div class="comment-user">${comentario.usuario || CONFIG.DEFAULTS.USERNAME}</div>
                                <div class="comment-text">${comentario.texto}</div>
                                <div class="comment-time">${commentTime}</div>
                            </div>
                        `;
                        
                        commentsList.appendChild(commentItem);
                    });
                    
                    // Mostrar seção de comentários
                    const commentsSection = postElement.querySelector(`.${CONFIG.CSS.COMMENT_SECTION_CLASS}`);
                    if (commentsSection) {
                        commentsSection.classList.add(CONFIG.CSS.COMMENT_SHOW_CLASS);
                    }
                }
            }
            
            return true;
        },
        
        setupPostEventDelegation: function() {
            // Delegação de eventos para ações em posts
            document.addEventListener('click', (event) => {
                // Botão curtir
                const likeButton = event.target.closest('[data-action="curtir"]');
                if (likeButton) {
                    const postId = likeButton.dataset.id;
                    if (postId) {
                        // Alternar curtida e obter post atualizado
                        const updatedPost = PostManager.toggleLike(postId);
                        
                        if (updatedPost) {
                            // Atualizar apenas o post específico na UI
                            this.updatePostUI(postId, updatedPost);
                            
                            // Mostrar notificação
                            if (updatedPost.curtido) {
                                NotificationManager.show('Post curtido!', 'success');
                            }
                        }
                    }
                }
                
                // Botão comentar
                const commentButton = event.target.closest('[data-action="comentar"]');
                if (commentButton) {
                    const postId = commentButton.dataset.id;
                    if (postId) {
                        const postCard = commentButton.closest('.' + CONFIG.CSS.POST_CLASS);
                        const commentsSection = postCard.querySelector('.' + CONFIG.CSS.COMMENT_SECTION_CLASS);
                        
                        if (commentsSection) {
                            commentsSection.classList.toggle(CONFIG.CSS.COMMENT_SHOW_CLASS);
                            
                            // Se está abrindo os comentários, focar no input
                            if (commentsSection.classList.contains(CONFIG.CSS.COMMENT_SHOW_CLASS)) {
                                const commentInput = commentsSection.querySelector('.comment-input');
                                if (commentInput) {
                                    setTimeout(() => commentInput.focus(), 100);
                                }
                            }
                        }
                    }
                }
                
                // Botão enviar comentário
                const submitButton = event.target.closest('.comment-submit');
                if (submitButton) {
                    const postId = submitButton.dataset.id;
                    if (postId) {
                        const commentsSection = submitButton.closest('.' + CONFIG.CSS.COMMENT_SECTION_CLASS);
                        const commentInput = commentsSection.querySelector('.comment-input');
                        const commentText = commentInput.value.trim();
                        
                        if (commentText) {
                            // Adicionar comentário e obter post atualizado
                            const updatedPost = PostManager.addComment(postId, commentText);
                            
                            if (updatedPost) {
                                // Limpar input
                                commentInput.value = '';
                                
                                // Atualizar apenas o post específico na UI
                                this.updatePostUI(postId, updatedPost);
                                
                                // Notificação
                                NotificationManager.show('Comentário adicionado com sucesso!', 'success');
                            }
                        } else {
                            NotificationManager.show('Comentado com sucesso!', 'sucess');
                        }
                    }
                }
                
                // Botão compartilhar
                const shareButton = event.target.closest('[data-action="compartilhar"]');
                if (shareButton) {
                    const postId = shareButton.dataset.id;
                    if (postId) {
                        // Compartilhar post e obter post atualizado
                        const updatedPost = PostManager.sharePost(postId);
                        
                        if (updatedPost) {
                            // Atualizar apenas o post específico na UI
                            this.updatePostUI(postId, updatedPost);
                            
                        
                        }
                    }
                }
            });
        },
        
        renderPosts: function() {
            const container = document.querySelector(CONFIG.SELECTORS.FEED_CONTAINER);
            
            if (!container) {
                console.error('❌ Container de feed não encontrado');
                return;
            }
            
            // Obter posts
            const posts = PostManager.getPosts();
            
            // Remover posts antigos
            container.querySelectorAll('.' + CONFIG.CSS.POST_CLASS + '.' + CONFIG.CSS.GENERATED_CLASS).forEach(post => post.remove());
            
            // Referência para inserir antes (manter posts fixos no fim)
            const firstFixedPost = container.querySelector('.' + CONFIG.CSS.POST_CLASS + ':not(.' + CONFIG.CSS.GENERATED_CLASS + ')');
            
            // Verificar se há posts
            if (!posts || posts.length === 0) {
                console.log('ℹ️ Nenhum post encontrado para renderizar');
                return;
            }
            
            // Renderizar posts
            posts.forEach(post => {
                if (!post || !post.id) {
                    console.error('❌ Post inválido encontrado:', post);
                    return;
                }
                
                // Criar elemento do post
                const card = document.createElement('div');
                card.className = CONFIG.CSS.POST_CLASS + ' ' + CONFIG.CSS.GENERATED_CLASS;
                card.dataset.id = post.id;
                
                // Determinar o sentimento do post
                let sentimento = 'neutro';
                if (post.sentiment && post.sentiment.score > 0.5) sentimento = 'positivo';
                else if (post.sentiment && post.sentiment.score < -0.2) sentimento = 'negativo';
                
                card.setAttribute('data-sentiment', sentimento);
                
                // Garantir que comentários existam
                const comentarios = Array.isArray(post.comentarios) ? post.comentarios : [];
                
                // Atualizar tempo relativo
                const tempo = post.timestamp ? TimeFormatter.getRelativeTime(post.timestamp) : (post.tempo || 'agora');
                
                // Preparar avatar do post
                const avatarHTML = post.avatar
                    ? `<div class="post-avatar"><img src="${post.avatar}" alt="Avatar" class="avatar-image" onerror="this.src='${CONFIG.DEFAULTS.AVATAR}'"></div>`
                    : `<div class="post-avatar">${post.usuario.substring(0, 2).toUpperCase()}</div>`;
                
                // Gerar HTML do post
                card.innerHTML = `
                    <div class="post-header">
                        ${avatarHTML}
                        <div class="post-user-info">
                            <div class="post-user-name">${post.usuario || CONFIG.DEFAULTS.USERNAME}</div>
                            <div class="post-time">${tempo}</div>
                        </div>
                    </div>
                    <div class="post-content">${post.conteudo}</div>
                    <div class="post-footer">
                        <div class="post-stats">
                            <div class="post-stat"><i class="fas fa-heart"></i> ${post.curtidas || 0}</div>
                            <div class="post-stat"><i class="fas fa-comment"></i> ${comentarios.length}</div>
                            <div class="post-stat"><i class="fas fa-share"></i> ${post.compartilhamentos || 0}</div>
                        </div>
                        <div class="post-actions-btns">
                            <button class="post-action-btn ${post.curtido ? CONFIG.CSS.LIKE_ACTIVE_CLASS : ''}" data-action="curtir" data-id="${post.id}">
                                <i class="${post.curtido ? 'fas' : 'far'} fa-heart"></i> ${post.curtido ? 'Curtido' : 'Curtir'}
                            </button>
                            <button class="post-action-btn comment-btn" data-action="comentar" data-id="${post.id}">
                                <i class="far fa-comment"></i> Comentar
                            </button>
                            <button class="post-action-btn" data-action="compartilhar" data-id="${post.id}">
                                <i class="fas fa-share"></i> Compartilhar
                            </button>
                        </div>
                    </div>
                    <div class="${CONFIG.CSS.COMMENT_SECTION_CLASS}" id="comments-${post.id}">
                        <div class="comment-form">
                            <input type="text" class="comment-input" placeholder="Escreva um comentário...">
                            <button class="comment-submit" data-id="${post.id}">Enviar</button>
                        </div>
                        <div class="comment-list">
                            ${comentarios.map(comentario => {
                                // Preparar avatar do comentário
                                const commentAvatarHTML = comentario.avatar 
                                    ? `<div class="comment-avatar"><img src="${comentario.avatar}" alt="Avatar" class="avatar-image" onerror="this.src='${CONFIG.DEFAULTS.AVATAR}'"></div>`
                                    : `<div class="comment-avatar">${comentario.usuario ? comentario.usuario.substring(0, 2).toUpperCase() : 'FX'}</div>`;
                                
                                // Atualizar tempo relativo do comentário
                                const commentTime = comentario.timestamp 
                                    ? TimeFormatter.getRelativeTime(comentario.timestamp) 
                                    : (comentario.tempo || 'agora');
                                
                                return `
                                    <div class="comment-item">
                                        ${commentAvatarHTML}
                                        <div class="comment-content">
                                            <div class="comment-user">${comentario.usuario || CONFIG.DEFAULTS.USERNAME}</div>
                                            <div class="comment-text">${comentario.texto}</div>
                                            <div class="comment-time">${commentTime}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
                
                // Inserir no DOM
                if (firstFixedPost) {
                    container.insertBefore(card, firstFixedPost);
                } else {
                    container.appendChild(card);
                }
            });
        },
        
        addGlobalStyles: function() {
            // Adicionar estilos CSS globais necessários
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .${CONFIG.CSS.POST_CLASS} {
                    animation: fadeIn 0.5s ease-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .${CONFIG.CSS.COMMENT_SECTION_CLASS} {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                }
                
                .${CONFIG.CSS.COMMENT_SECTION_CLASS}.${CONFIG.CSS.COMMENT_SHOW_CLASS} {
                    max-height: 500px !important;
                    overflow-y: auto;
                    padding-top: 10px;
                    margin-top: 10px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .post-avatar img, .comment-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }
                
                .post-action-btn.${CONFIG.CSS.LIKE_ACTIVE_CLASS} {
                    color: #ff3b5c !important;
                }
                
                .post-action-btn.liked {
                    color: #ff3b5c !important;
                }
                
                /* Estilos para diferentes sentimentos */
                .${CONFIG.CSS.POST_CLASS}[data-sentiment="positivo"] {
                    border-left: 3px solid #00cc66;
                }
                
                .${CONFIG.CSS.POST_CLASS}[data-sentiment="negativo"] {
                    border-left: 3px solid #ff3b5c;
                }
                
                /* Efeito de hover em botões */
                .post-action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                /* Adicionar estilos extras para garantir a visibilidade das ações */
                .comment-submit {
                    cursor: pointer;
                    background: linear-gradient(90deg, #1e90ff, #0066cc);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 5px 15px;
                }
                
                .comment-input {
                    flex: 1;
                    padding: 8px;
                    border-radius: 5px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.1);
                    color: white;
                }
                
                .comment-form {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 10px;
                }
            `;
            document.head.appendChild(styleElement);
        }
    };
    
    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================
    
    // Inicializar sistema
    UIManager.init();
    
    // Exportar objetos para uso global (caso necessário)
    window.FURIAXCommunity = {
        PostManager,
        ProfileManager,
        SentimentAnalyzer,
        NotificationManager,
        UIManager,
        TimeFormatter
    };
  });

  /**
 * Fixed Comment Functionality for FURIAX Community
 * This script fixes the comment system in the FURIAX platform
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing comment fix for FURIAX Community...');
    
    // Fix for the comment buttons
    function fixCommentFunctionality() {
        // 1. Fix comment buttons to show/hide comment sections
        const commentButtons = document.querySelectorAll('.comment-btn');
        commentButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const postCard = this.closest('.post-card');
                if (postCard) {
                    const postId = postCard.getAttribute('data-id') || this.getAttribute('data-id');
                    const commentsSection = document.getElementById(`comments-${postId}`) || 
                                           postCard.querySelector('.comments-section');
                    
                    if (commentsSection) {
                        commentsSection.classList.toggle('show');
                        if (commentsSection.classList.contains('show')) {
                            const commentInput = commentsSection.querySelector('.comment-input');
                            if (commentInput) {
                                setTimeout(() => commentInput.focus(), 100);
                            }
                        }
                    }
                }
            });
        });
        
        // 2. Fix comment submission
        const commentForms = document.querySelectorAll('.comment-form');
        commentForms.forEach(form => {
            const submitBtn = form.querySelector('.comment-submit');
            const commentInput = form.querySelector('.comment-input');
            
            if (submitBtn && commentInput) {
                submitBtn.addEventListener('click', function() {
                    const commentText = commentInput.value.trim();
                    if (!commentText) return;
                    
                    const postCard = this.closest('.post-card');
                    const commentsSection = this.closest('.comments-section');
                    const commentList = commentsSection ? commentsSection.querySelector('.comment-list') : null;
                    
                    if (postCard && commentList) {
                        // Create and add the new comment
                        const postId = postCard.getAttribute('data-id') || 
                                      this.getAttribute('data-id') || 
                                      commentsSection.id.replace('comments-', '');
                        
                        if (window.FURIAXCommunity && window.FURIAXCommunity.PostManager) {
                            // If the PostManager is available, use it to add the comment
                            const updatedPost = window.FURIAXCommunity.PostManager.addComment(postId, commentText);
                            if (updatedPost && window.FURIAXCommunity.UIManager) {
                                window.FURIAXCommunity.UIManager.updatePostUI(postId, updatedPost);
                            }
                        } else {
                            // Fallback: Add comment directly to DOM (temporary UI update)
                            const commentItem = document.createElement('div');
                            commentItem.className = 'comment-item';
                            
                            // Get username from sidebar or use default
                            const username = document.getElementById('sidebarUsername')?.textContent || 'FuriaX_User';
                            const userInitials = username.substring(0, 2).toUpperCase();
                            
                            commentItem.innerHTML = `
                                <div class="comment-avatar">${userInitials}</div>
                                <div class="comment-content">
                                    <div class="comment-user">${username}</div>
                                    <div class="comment-text">${commentText}</div>
                                    <div class="comment-time">agora</div>
                                </div>
                            `;
                            
                            commentList.appendChild(commentItem);
                        }
                        
                        // Clear input
                        commentInput.value = '';
                    }
                });
                
                // Allow pressing Enter to submit
                commentInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        submitBtn.click();
                    }
                });
            }
        });
    }
    
    // Fix CSS for comments
    function addCommentStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .comments-section {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease-out;
            }
            
            .comments-section.show {
                max-height: 500px !important;
                overflow-y: auto;
                padding-top: 10px;
                margin-top: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .comment-form {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .comment-input {
                flex: 1;
                padding: 8px;
                border-radius: 5px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.1);
                color: white;
            }
            
            .comment-submit {
                cursor: pointer;
                background: linear-gradient(90deg, #1e90ff, #0066cc);
                color: white;
                border: none;
                border-radius: 5px;
                padding: 5px 15px;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Run the fixes
    addCommentStyles();
    
    // Initial fix
    fixCommentFunctionality();
    
    // Re-run fix when posts are added dynamically
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setTimeout(fixCommentFunctionality, 100);
            }
        });
    });
    
    // Start observing the feed for changes
    const feedContainer = document.querySelector('.feed-column');
    if (feedContainer) {
        observer.observe(feedContainer, { childList: true, subtree: true });
    }
    
    console.log('✅ Comment system fix applied!');
});

/**
 * Fixed Share Button Functionality for FURIAX Community
 * This script fixes the share button which is incorrectly triggering the like action
 *
 * Custom Share Functionality for FURIAX Community
 * This script disables the default browser share and implements a custom share counter
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing custom share fix for FURIAX Community...');
    
    // Fix for the share functionality to prevent browser share dialog
   
    
    // Add a visual animation when sharing
    function showShareAnimation(postElement) {
        // Create a floating share icon
        const floatingIcon = document.createElement('div');
        floatingIcon.className = 'floating-share-icon';
        floatingIcon.innerHTML = '<i class="fas fa-share"></i>';
        
        // Position it above the post
        const rect = postElement.getBoundingClientRect();
        floatingIcon.style.position = 'absolute';
        floatingIcon.style.left = `${rect.left + rect.width / 2}px`;
        floatingIcon.style.top = `${rect.top + rect.height / 2}px`;
        floatingIcon.style.transform = 'translate(-50%, -50%)';
        floatingIcon.style.color = '#1e90ff';
        floatingIcon.style.fontSize = '24px';
        floatingIcon.style.zIndex = '1000';
        floatingIcon.style.opacity = '0';
        floatingIcon.style.transition = 'all 0.8s ease-out';
        
        // Add to body
        document.body.appendChild(floatingIcon);
        
        // Animate
        setTimeout(() => {
            floatingIcon.style.opacity = '1';
            floatingIcon.style.transform = 'translate(-50%, -150%)';
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            floatingIcon.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(floatingIcon);
            }, 300);
        }, 800);
    }
    
    // Simple notification function as fallback
    function showSimpleNotification(message, type = 'success') {
        // Check if notification exists in DOM
        let notification = document.getElementById('furiaxNotification');
        
        // Create notification element if it doesn't exist
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'furiaxNotification';
            document.body.appendChild(notification);
            
            // Add basic styles if they don't exist
            if (!document.getElementById('notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
                style.textContent = `
                    #furiaxNotification {
                        position: fixed;
                        bottom: -60px;
                        left: 50%;
                        transform: translateX(-50%);
                        padding: 12px 20px;
                        border-radius: 30px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        z-index: 1000;
                        transition: bottom 0.3s ease-in-out;
                        color: white;
                        font-family: 'Exo 2', sans-serif;
                    }
                    
                    #furiaxNotification.active {
                        bottom: 20px;
                    }
                    
                    #furiaxNotification.success {
                        background: linear-gradient(90deg, #00cc66, #1e90ff);
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
                document.head.appendChild(style);
            }
        }
        
        // Set icon based on type
        let icon;
        switch (type) {
            case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
            case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
            case 'error': icon = '<i class="fas fa-times-circle"></i>'; break;
            default: icon = '<i class="fas fa-info-circle"></i>'; break;
        }
        
        // Update content and style
        notification.innerHTML = `${icon} <span>${message}</span>`;
        notification.className = '';
        notification.classList.add(type);
        
        // Show notification
        notification.classList.add('active');
        
        // Hide after delay
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
    
    // Run the fixes
    fixShareFunctionality();
    
    // Re-run fix when posts are added dynamically
    const observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                setTimeout(fixShareFunctionality, 100);
                break;
            }
        }
    });
    
    // Start observing the feed for changes
    const feedContainer = document.querySelector('.feed-column');
    if (feedContainer) {
        observer.observe(feedContainer, { childList: true, subtree: true });
    }
    
    console.log('✅ Custom share fix applied!');
});
    
