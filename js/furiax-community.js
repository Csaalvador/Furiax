/**
 * FURIAX Community - Sistema Completo para Comunidade de Fãs
 * Versão: 2.0.0
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
          PROFILE: 'furiaxProfile',
          TAGS: 'furiax_tags'
      },
      SENTIMENT: {
          POSITIVE_THRESHOLD: 0.3,
          NEGATIVE_THRESHOLD: -0.3,
          VERY_POSITIVE_THRESHOLD: 0.7,
          VERY_NEGATIVE_THRESHOLD: -0.7
      },
      DEFAULTS: {
          USERNAME: 'FuriaX_User',
          AVATAR: '../img/logo/logoFuriax.png',
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
          if (avatarPath) {
              return `<img src="${avatarPath}" alt="Avatar" class="avatar-image" onerror="this.src='${CONFIG.DEFAULTS.AVATAR}'">`;
          }
          
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
    
    updateStats: function(text) {
        // Função para atualizar estatísticas de sentimento
        const sentiment = this.analyze(text);
        
        // Armazenar estatísticas (opcional)
        const stats = StorageManager.get('furiax_sentiment_stats', {
            total: 0,
            positivo: 0,
            negativo: 0,
            neutro: 0
        });
        
        stats.total++;
        stats[sentiment.label.split('_')[0]]++;
        
        StorageManager.set('furiax_sentiment_stats', stats);
        
        return sentiment;
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
  // SISTEMA DE GERENCIAMENTO DE TAGS
  // =====================================================
  
  // =====================================================
// SISTEMA DE GERENCIAMENTO DE TAGS
// =====================================================

const TagManager = {
    getTags: function() {
        return StorageManager.get(CONFIG.STORAGE_KEYS.TAGS, {});
    },
    
    updateTags: function(tags, sentimentScore) {
        if (!Array.isArray(tags) || tags.length === 0) return;
        
        // Obter tags existentes
        const existingTags = this.getTags();
        
        // Atualizar contagem e sentimento para cada tag
        tags.forEach(tag => {
            if (!existingTags[tag]) {
                existingTags[tag] = {
                    count: 0,
                    sentiment: 0,
                    lastUsed: Date.now()
                };
            }
            
            existingTags[tag].count++;
            
            // Atualizar sentimento médio
            const oldSentiment = existingTags[tag].sentiment;
            const oldCount = existingTags[tag].count - 1;
            existingTags[tag].sentiment = (oldSentiment * oldCount + sentimentScore) / existingTags[tag].count;
            
            // Atualizar última utilização
            existingTags[tag].lastUsed = Date.now();
        });
        
        // Salvar tags atualizadas
        StorageManager.set(CONFIG.STORAGE_KEYS.TAGS, existingTags);
    },
    
    getTopTags: function(limit = 10) {
        const tags = this.getTags();
        
        // Converter para array
        const tagsArray = Object.keys(tags).map(key => ({
            tag: key,
            ...tags[key]
        }));
        
        // Ordenar por contagem (decrescente)
        tagsArray.sort((a, b) => b.count - a.count);
        
        // Retornar os primeiros N
        return tagsArray.slice(0, limit);
    },
    
    getRecentTags: function(limit = 10) {
        const tags = this.getTags();
        
        // Converter para array
        const tagsArray = Object.keys(tags).map(key => ({
            tag: key,
            ...tags[key]
        }));
        
        // Ordenar por última utilização (mais recente primeiro)
        tagsArray.sort((a, b) => b.lastUsed - a.lastUsed);
        
        // Retornar os primeiros N
        return tagsArray.slice(0, limit);
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
          
          // Atualizar estatísticas de sentimento
          SentimentAnalyzer.updateStats(content.trim());
          
          // Extrair e adicionar tags
          const hashtags = SentimentAnalyzer.extractHashtags(content.trim());
          if (hashtags.length > 0) {
              TagManager.updateTags(hashtags, post.sentiment.score);
          }
          
          // Sistema de gamificação (simplificado)
          this.addPoints('post_created', 10);
          
          return post;
      },
      
      toggleLike: function(postId) {
          const posts = this.getPosts();
          let updated = false;
          
          const numericPostId = parseInt(postId);
          
          const updatedPosts = posts.map(post => {
              if (post.id === numericPostId) {
                  post.curtido = !post.curtido;
                  post.curtidas = post.curtido ? post.curtidas + 1 : Math.max(0, post.curtidas - 1);
                  updated = true;
                  
                  // Sistema de gamificação (simplificado)
                  if (post.curtido) {
                      this.addPoints('post_liked', 2);
                  }
              }
              return post;
          });
          
          if (updated) {
              this.savePosts(updatedPosts);
          }
          
          return updated;
      },
      
      addComment: function(postId, commentText) {
          if (!commentText || commentText.trim() === '') return false;
          
          const posts = this.getPosts();
          let updated = false;
          
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
                      tempo: 'agora',
                      sentiment: SentimentAnalyzer.analyze(commentText.trim())
                  };
                  
                  // Garantir que comentarios seja um array
                  if (!Array.isArray(post.comentarios)) {
                      post.comentarios = [];
                  }
                  
                  post.comentarios.push(comment);
                  updated = true;
                  
                  // Atualizar estatísticas de sentimento
                  SentimentAnalyzer.updateStats(commentText.trim());
                  
                  // Sistema de gamificação (simplificado)
                  this.addPoints('comment_added', 5);
              }
              return post;
          });
          
          if (updated) {
              this.savePosts(updatedPosts);
          }
          
          return updated;
      },
      
      sharePost: function(postId) {
          const posts = this.getPosts();
          let updated = false;
          
          const numericPostId = parseInt(postId);
          
          const updatedPosts = posts.map(post => {
              if (post.id === numericPostId) {
                  post.compartilhamentos += 1;
                  updated = true;
                  
                  // Sistema de gamificação (simplificado)
                  this.addPoints('post_shared', 8);
              }
              return post;
          });
          
          if (updated) {
              this.savePosts(updatedPosts);
              return true;
          }
          
          return false;
      },
      
      deletePost: function(postId) {
          const posts = this.getPosts();
          const numericPostId = parseInt(postId);
          
          const postIndex = posts.findIndex(post => post.id === numericPostId);
          
          if (postIndex !== -1) {
              // Remover post do array
              posts.splice(postIndex, 1);
              
              // Salvar posts atualizados
              this.savePosts(posts);
              
              return true;
          }
          
          return false;
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
          
          // Adicionar estilos CSS
          this.addGlobalStyles();
          
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
                      NotificationManager.show('Digite algo para publicar!', 'warning');
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
          
          // Tabs da análise
          document.querySelectorAll('.analysis-tab').forEach(tab => {
              tab.addEventListener('click', function() {
                  // Remover classe ativa de todas as tabs
                  document.querySelectorAll('.analysis-tab').forEach(t => t.classList.remove('active'));
                  // Adicionar classe ativa à tab clicada
                  this.classList.add('active');
                  
                  // Esconder todos os conteúdos
                  document.querySelectorAll('.analysis-content').forEach(content => {
                      content.style.display = 'none';
                  });
                  
                  // Mostrar conteúdo relevante
                  const contentId = this.dataset.tab + '-content';
                  const content = document.getElementById(contentId);
                  if (content) {
                      content.style.display = 'block';
                  }
              });
          });
          
          // Configurar eventos delegados para posts
          this.setupPostEventDelegation();
      },
      
      setupPostEventDelegation: function() {
          // Delegação de eventos para ações em posts
          document.addEventListener('click', (event) => {
              // Botão curtir
              const likeButton = event.target.closest('[data-action="curtir"]');
              if (likeButton) {
                  const postId = likeButton.dataset.id;
                  if (postId) {
                      // Alternar curtida
                      PostManager.toggleLike(postId);
                      
                      // Atualizar UI imediatamente
                      if (likeButton.classList.contains(CONFIG.CSS.LIKE_ACTIVE_CLASS)) {
                          likeButton.classList.remove(CONFIG.CSS.LIKE_ACTIVE_CLASS);
                          likeButton.innerHTML = `<i class="far fa-heart"></i> Curtir`;
                      } else {
                          likeButton.classList.add(CONFIG.CSS.LIKE_ACTIVE_CLASS);
                          likeButton.innerHTML = `<i class="fas fa-heart"></i> Curtido`;
                      }
                      
                      // Atualizar contador
                      const post = likeButton.closest('.' + CONFIG.CSS.POST_CLASS);
                      const likesCounter = post.querySelector('.post-stat:first-child');
                      if (likesCounter) {
                          const currentCount = parseInt(likesCounter.textContent.match(/\d+/)[0] || 0);
                          likesCounter.innerHTML = `<i class="fas fa-heart"></i> ${likeButton.classList.contains(CONFIG.CSS.LIKE_ACTIVE_CLASS) ? currentCount + 1 : Math.max(0, currentCount - 1)}`;
                      }
                  }
              }
              
              // Botão comentar
              const commentButton = event.target.closest('[data-action="comentar"]');
              if (commentButton) {
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
              
              // Botão enviar comentário
              const submitButton = event.target.closest('.comment-submit');
              if (submitButton) {
                  const postId = submitButton.dataset.id;
                  if (postId) {
                      const commentsSection = submitButton.closest('.' + CONFIG.CSS.COMMENT_SECTION_CLASS);
                      const commentInput = commentsSection.querySelector('.comment-input');
                      const commentText = commentInput.value.trim();
                      
                      if (commentText) {
                          // Adicionar comentário
                          PostManager.addComment(postId, commentText);
                          
                          // Limpar input
                          commentInput.value = '';
                          
                          // Renderizar posts atualizados
                          this.renderPosts();
                          
                          // Manter seção de comentários aberta
                          setTimeout(() => {
                              const updatedCommentsSection = document.querySelector(`.${CONFIG.CSS.POST_CLASS}[data-id="${postId}"] .${CONFIG.CSS.COMMENT_SECTION_CLASS}`);
                              if (updatedCommentsSection) {
                                  updatedCommentsSection.classList.add(CONFIG.CSS.COMMENT_SHOW_CLASS);
                              }
                          }, 100);
                      }
                  }
              }
              
              // Botão compartilhar
              const shareButton = event.target.closest('[data-action="compartilhar"]');
              if (shareButton) {
                  const postId = shareButton.dataset.id;
                  if (postId) {
                      // Compartilhar post
                      PostManager.sharePost(postId);
                      
                      // Atualizar contador
                      const shareCounter = shareButton.closest('.' + CONFIG.CSS.POST_CLASS).querySelector('.post-stat:nth-child(3)');
                      if (shareCounter) {
                          const currentCount = parseInt(shareCounter.textContent.match(/\d+/)[0] || 0);
                          shareCounter.innerHTML = `<i class="fas fa-share"></i> ${currentCount + 1}`;
                      }
                      
                      // Mostrar notificação
                      NotificationManager.show('Post compartilhado com sucesso!', 'success');
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
                          <div class="post-time">${post.tempo || 'agora'}</div>
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
                              
                              return `
                                  <div class="comment-item">
                                      ${commentAvatarHTML}
                                      <div class="comment-content">
                                          <div class="comment-user">${comentario.usuario || CONFIG.DEFAULTS.USERNAME}</div>
                                          <div class="comment-text">${comentario.texto}</div>
                                          <div class="comment-time">${comentario.tempo || 'agora'}</div>
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
                  max-height: 500px;
                  overflow-y: auto;
              }
              
              .post-avatar img, .comment-avatar img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  border-radius: 50%;
              }
              
              .post-action-btn.${CONFIG.CSS.LIKE_ACTIVE_CLASS} {
                  color: #ff3b5c;
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
      TagManager,
      NotificationManager,
      UIManager
  };
});