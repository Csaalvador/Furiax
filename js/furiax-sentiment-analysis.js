/**
 * FURIAX - Sistema Avançado de Análise de Sentimentos
 * Versão: 2.0.0
 * Implementação com persistência de dados e conexão com redes sociais
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Sistema Avançado de Análise de Sentimentos FURIAX...');
    
    // Configurações e constantes
    const CONFIG = {
      SENTIMENTS: {
        POSITIVE: 'positive',
        NEGATIVE: 'negative',
        NEUTRAL: 'neutral'
      },
      THRESHOLDS: {
        POSITIVE: 0.3,
        NEGATIVE: -0.3
      },
      STORAGE_KEYS: {
        POSTS: 'furiax_posts',
        COMMENTS: 'furiax_comments',
        USER_PROFILE: 'furiax_user_profile',
        SENTIMENT_DATA: 'furiax_sentiment_data',
        SOCIAL_CONNECTIONS: 'furiax_social_connections'
      },
      COLORS: {
        POSITIVE: '#00cc66',
        NEGATIVE: '#ff3b5c',
        NEUTRAL: '#1e90ff'
      },
      DEFAULT_PROFILE: {
        username: 'FuriaX_User',
        fullName: 'Ricardo Silva',
        userType: 'Super Fã',
        level: 4,
        engagementScore: 75,
        fanSince: '2 anos',
        eventsAttended: 7,
        totalSpent: 'R$ 1.450',
        bio: 'Fã apaixonado da FURIA desde o início!',
        avatar: null
      },
      SOCIAL_NETWORKS: [
        { id: 'instagram', name: 'Instagram', icon: 'instagram', connected: false, username: '' },
        { id: 'twitter', name: 'Twitter', icon: 'twitter', connected: false, username: '' },
        { id: 'facebook', name: 'Facebook', icon: 'facebook', connected: false, username: '' },
        { id: 'youtube', name: 'YouTube', icon: 'youtube', connected: false, username: '' },
        { id: 'twitch', name: 'Twitch', icon: 'twitch', connected: false, username: '' }
      ],
      // Banco de palavras para análise de sentimento em português
      SENTIMENT_WORDS: {
        positive: [
          "vitória", "incrível", "bom", "excelente", "parabéns", "feliz",
          "orgulho", "melhor", "top", "venceu", "campeão", "épico", "insano", 
          "maravilhoso", "lindo", "foda", "sensacional", "confiante", "ganhamos",
          "genial", "golaço", "jogada", "perfeito", "fantástico", "brilhante",
          "talento", "sucesso", "habilidade", "amei", "amo", "aplausos", "força"
        ],
        negative: [
          "derrota", "ruim", "pior", "perdeu", "fraco", "triste", "decepção", 
          "decepcionar", "péssimo", "horrível", "terrível", "lamentável", 
          "vergonhoso", "inaceitável", "frustrante", "perdemos", "fracasso",
          "desempenho", "desapontado", "decepcionante", "erro", "falha", "culpa",
          "ridículo", "desastroso", "preocupante", "péssima", "lixo", "porcaria"
        ]
      }
    };
  
    // Classes de interface
    const UI_CLASSES = {
      POST_CARD: 'post-card',
      COMMENT_ITEM: 'comment-item',
      SENTIMENT_NOTIFICATION: 'sentiment-notification',
      SENTIMENT_POSITIVE: 'sentiment-positive',
      SENTIMENT_NEGATIVE: 'sentiment-negative',
      SENTIMENT_NEUTRAL: 'sentiment-neutral',
      SENTIMENT_ICON: 'sentiment-icon',
      REAL_TIME_ANALYSIS: 'real-time-analysis',
      GAUGE_FILL: 'gauge-fill',
      GAUGE_MARKER: 'gauge-marker'
    };
  
    /**
     * Gerenciador de Perfil do Usuário
     * Responsável por gerenciar os dados do perfil do usuário
     */
    class UserProfileManager {
      constructor() {
        this.profile = this.loadProfile();
        this.socialConnections = this.loadSocialConnections();
      }
  
      // Carregar perfil do usuário
      loadProfile() {
        let profile = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PROFILE));
        
        if (!profile) {
          profile = CONFIG.DEFAULT_PROFILE;
          localStorage.setItem(CONFIG.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
        }
        
        return profile;
      }
  
      // Salvar perfil do usuário
      saveProfile() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.profile));
      }
  
      // Carregar conexões sociais
      loadSocialConnections() {
        let connections = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SOCIAL_CONNECTIONS));
        
        if (!connections) {
          connections = CONFIG.SOCIAL_NETWORKS;
          localStorage.setItem(CONFIG.STORAGE_KEYS.SOCIAL_CONNECTIONS, JSON.stringify(connections));
        }
        
        return connections;
      }
  
      // Salvar conexões sociais
      saveSocialConnections() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.SOCIAL_CONNECTIONS, JSON.stringify(this.socialConnections));
      }
  
      // Atualizar dados do perfil
      updateProfile(newData) {
        this.profile = { ...this.profile, ...newData };
        this.saveProfile();
        this.updateProfileUI();
      }
  
      // Conectar rede social
      connectSocialNetwork(networkId, username) {
        const networkIndex = this.socialConnections.findIndex(network => network.id === networkId);
        
        if (networkIndex !== -1) {
          this.socialConnections[networkIndex].connected = true;
          this.socialConnections[networkIndex].username = username;
          this.saveSocialConnections();
          this.updateSocialConnectionsUI();
          
          return true;
        }
        
        return false;
      }
  
      // Desconectar rede social
      disconnectSocialNetwork(networkId) {
        const networkIndex = this.socialConnections.findIndex(network => network.id === networkId);
        
        if (networkIndex !== -1) {
          this.socialConnections[networkIndex].connected = false;
          this.socialConnections[networkIndex].username = '';
          this.saveSocialConnections();
          this.updateSocialConnectionsUI();
          
          return true;
        }
        
        return false;
      }
  
      // Atualizar UI do perfil
      updateProfileUI() {
        // Atualizar nome no painel de identidade
        const fanName = document.querySelector('.fan-name');
        if (fanName) {
          fanName.textContent = this.profile.fullName;
        }
  
        // Atualizar tipo de fã
        const fanType = document.querySelector('.fan-type');
        if (fanType) {
          fanType.textContent = this.profile.userType;
        }
  
        // Atualizar nível de fã (dots)
        for (let i = 1; i <= 5; i++) {
          const dot = document.querySelector(`.fan-level-dot:nth-child(${i})`);
          if (dot) {
            if (i <= this.profile.level) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          }
        }
  
        // Atualizar score de engajamento
        const scoreText = document.querySelector('.score-text');
        if (scoreText) {
          scoreText.textContent = this.profile.engagementScore + '%';
        }
  
        // Atualizar círculo de score
        const circle = document.querySelector('.circle');
        if (circle) {
          circle.setAttribute('stroke-dasharray', `${this.profile.engagementScore}, 100`);
        }
  
        // Atualizar estatísticas vitais
        const fanSince = document.querySelector('.vital-value:nth-of-type(1)');
        if (fanSince) {
          fanSince.textContent = this.profile.fanSince;
        }
  
        const eventsAttended = document.querySelector('.vital-value:nth-of-type(2)');
        if (eventsAttended) {
          eventsAttended.textContent = this.profile.eventsAttended;
        }
  
        const totalSpent = document.querySelector('.vital-value:nth-of-type(3)');
        if (totalSpent) {
          totalSpent.textContent = this.profile.totalSpent;
        }
  
        // Atualizar avatar
        const avatar = document.querySelector('.fan-avatar i');
        if (avatar && !this.profile.avatar) {
          avatar.className = 'fas fa-user';
        }
      }
  
      // Atualizar UI de conexões sociais
      updateSocialConnectionsUI() {
        const networksContainer = document.querySelector('.networks-icons');
        if (!networksContainer) return;
  
        // Limpar container
        networksContainer.innerHTML = '';
  
        // Adicionar ícones de redes sociais
        this.socialConnections.forEach(network => {
          const networkIcon = document.createElement('div');
          networkIcon.className = `network-icon ${network.connected ? 'connected' : ''}`;
          networkIcon.dataset.network = network.id;
          networkIcon.innerHTML = `<i class="fab fa-${network.icon}"></i>`;
          
          // Adicionar tooltip
          networkIcon.title = network.connected ? 
            `Conectado como ${network.username}` : 
            `Conectar ${network.name}`;
          
          // Adicionar evento de clique
          networkIcon.addEventListener('click', () => {
            this.toggleSocialConnection(network.id);
          });
          
          networksContainer.appendChild(networkIcon);
        });
  
        // Atualizar painel de contas
        this.updateSocialAccountsPanel();
      }
  
      // Atualizar painel de contas sociais
      updateSocialAccountsPanel() {
        const accountsContainer = document.querySelector('.social-accounts');
        if (!accountsContainer) return;
  
        // Limpar container
        accountsContainer.innerHTML = '';
  
        // Adicionar contas sociais
        this.socialConnections.forEach(network => {
          const accountElement = document.createElement('div');
          accountElement.className = 'social-account';
          
          accountElement.innerHTML = `
            <div class="social-icon ${network.id}-icon">
              <i class="fab fa-${network.icon}"></i>
            </div>
            <div class="social-name">${network.name}</div>
            <div class="social-status ${!network.connected ? 'not-connected' : ''}">
              ${network.connected ? 'Conectado' : 'Não conectado'}
            </div>
          `;
          
          // Adicionar evento de clique
          accountElement.addEventListener('click', () => {
            this.toggleSocialConnection(network.id);
          });
          
          accountsContainer.appendChild(accountElement);
        });
      }
  
      // Alternar conexão de rede social
      toggleSocialConnection(networkId) {
        const network = this.socialConnections.find(n => n.id === networkId);
        
        if (!network) return;
        

  
      // Simular atividade social após conexão
      simulateSocialActivity(networkId, username) {
        // Encontrar container de atividade social
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;
        
        // Criar nova atividade
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const network = this.socialConnections.find(n => n.id === networkId);
        const networkName = network ? network.name : networkId;
        
        // Hora atual formatada
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        let activityText = '';
        
        // Texto de atividade baseado na rede
        switch (networkId) {
          case 'instagram':
            activityText = 'Compartilhou foto da FURIA';
            break;
          case 'twitter':
            activityText = 'Retweetou post oficial da FURIA';
            break;
          case 'facebook':
            activityText = 'Curtiu a página oficial da FURIA';
            break;
          case 'youtube':
            activityText = 'Comentou no último vídeo da FURIA';
            break;
          case 'twitch':
            activityText = 'Inscreveu-se no canal da FURIA';
            break;
          default:
            activityText = 'Conectou-se com a FURIA';
        }
        
        activityItem.innerHTML = `
          <div class="activity-time">agora</div>
          <div class="activity-content">
            <div class="activity-text">${activityText}</div>
            <div class="activity-platform">
              <i class="fab fa-${network ? network.icon : 'globe'}"></i>
              ${networkName}
            </div>
          </div>
          <div class="activity-meta">
            <div class="activity-stat">
              <i class="fas fa-heart"></i>
              0
            </div>
            <div class="activity-stat">
              <i class="fas fa-comment"></i>
              0
            </div>
          </div>
        `;
        
        // Adicionar com animação de entrada
        activityItem.style.opacity = '0';
        activityItem.style.transform = 'translateY(20px)';
        activityList.prepend(activityItem);
        
        // Animar entrada
        setTimeout(() => {
          activityItem.style.transition = 'all 0.5s ease';
          activityItem.style.opacity = '1';
          activityItem.style.transform = 'translateY(0)';
        }, 100);
        
        // Atualizar contador de estatísticas gradualmente
        let count = 0;
        const maxCount = Math.floor(Math.random() * 20) + 5;
        
        const updateInterval = setInterval(() => {
          count++;
          const likeCounter = activityItem.querySelector('.activity-stat:nth-child(1)');
          if (likeCounter) {
            likeCounter.innerHTML = `<i class="fas fa-heart"></i> ${count}`;
          }
          
          if (count >= maxCount) {
            clearInterval(updateInterval);
          }
        }, 300);
      }
    }
  
    /**
     * Analisador de Sentimentos
     * Responsável por analisar sentimentos em textos
     */
    class SentimentAnalyzer {
      constructor() {
        this.sentimentData = this.loadSentimentData();
      }
  
      // Carregar dados de sentimentos ou criar novos se não existirem
      loadSentimentData() {
        let data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SENTIMENT_DATA));
        
        if (!data) {
          data = {
            overallSentiment: 0.5,
            postsAnalyzed: 0,
            sentimentHistory: [],
            lastUpdate: Date.now(),
            positiveWords: {},
            negativeWords: {},
            stats: {
              positive: 0,
              negative: 0,
              neutral: 0
            }
          };
          localStorage.setItem(CONFIG.STORAGE_KEYS.SENTIMENT_DATA, JSON.stringify(data));
        }
        
        return data;
      }
  
      // Salvar dados de sentimentos
      saveSentimentData() {
        this.sentimentData.lastUpdate = Date.now();
        localStorage.setItem(CONFIG.STORAGE_KEYS.SENTIMENT_DATA, JSON.stringify(this.sentimentData));
      }
  
      // Analisar texto para sentimento
      analyzeText(text) {
        if (!text || typeof text !== 'string') {
          return {
            score: 0,
            sentiment: CONFIG.SENTIMENTS.NEUTRAL,
            keywords: []
          };
        }
        
        const lowerText = text.toLowerCase();
        const words = lowerText.match(/\b\w+\b/g) || [];
        let score = 0;
        const foundKeywords = [];
        
        // Analisar palavras positivas
        CONFIG.SENTIMENT_WORDS.positive.forEach(word => {
          if (lowerText.includes(word)) {
            score += 0.3;
            foundKeywords.push({ word, type: 'positive' });
          }
        });
        
        // Analisar palavras negativas
        CONFIG.SENTIMENT_WORDS.negative.forEach(word => {
          if (lowerText.includes(word)) {
            score -= 0.3;
            foundKeywords.push({ word, type: 'negative' });
          }
        });
        
        // Limitar score entre -1 e 1
        score = Math.max(-1, Math.min(1, score));
        
        // Determinar sentimento com base no score
        let sentiment;
        if (score >= CONFIG.THRESHOLDS.POSITIVE) {
          sentiment = CONFIG.SENTIMENTS.POSITIVE;
        } else if (score <= CONFIG.THRESHOLDS.NEGATIVE) {
          sentiment = CONFIG.SENTIMENTS.NEGATIVE;
        } else {
          sentiment = CONFIG.SENTIMENTS.NEUTRAL;
        }
        
        return {
          score,
          sentiment,
          keywords: foundKeywords,
          text
        };
      }
  
      // Atualizar dados de sentimento com nova análise
      updateSentimentData(analysis) {
        // Incrementar contador de posts analisados
        this.sentimentData.postsAnalyzed++;
        
        // Atualizar sentimento geral (média ponderada)
        const previousSentiment = this.sentimentData.overallSentiment;
        const weight = 1 / this.sentimentData.postsAnalyzed;
        this.sentimentData.overallSentiment = (previousSentiment * (1 - weight)) + (analysis.score * weight);
        
        // Atualizar estatísticas de sentimento
        if (analysis.sentiment === CONFIG.SENTIMENTS.POSITIVE) {
          this.sentimentData.stats.positive++;
        } else if (analysis.sentiment === CONFIG.SENTIMENTS.NEGATIVE) {
          this.sentimentData.stats.negative++;
        } else {
          this.sentimentData.stats.neutral++;
        }
        
        // Registrar palavras-chave
        analysis.keywords.forEach(keyword => {
          if (keyword.type === 'positive') {
            this.sentimentData.positiveWords[keyword.word] = (this.sentimentData.positiveWords[keyword.word] || 0) + 1;
          } else if (keyword.type === 'negative') {
            this.sentimentData.negativeWords[keyword.word] = (this.sentimentData.negativeWords[keyword.word] || 0) + 1;
          }
        });
        
        // Adicionar ao histórico (limitado a 20 entradas)
        this.sentimentData.sentimentHistory.unshift({
          timestamp: Date.now(),
          score: analysis.score,
          sentiment: analysis.sentiment,
          text: analysis.text.substring(0, 50) + (analysis.text.length > 50 ? '...' : '')
        });
        
        if (this.sentimentData.sentimentHistory.length > 20) {
          this.sentimentData.sentimentHistory.pop();
        }
        
        // Salvar dados
        this.saveSentimentData();
        
        return this.sentimentData;
      }
  
      // Calcular intenção de compra
      calculatePurchaseIntent() {
        // Quanto mais positivo o sentimento, maior a intenção de compra
        const sentimentFactor = ((this.sentimentData.overallSentiment + 1) / 2); // Normaliza para 0-1
        const activityFactor = Math.min(1, this.sentimentData.postsAnalyzed / 20); // Fator de atividade
        
        // Combinação ponderada
        const purchaseIntent = (sentimentFactor * 0.7) + (activityFactor * 0.3);
        return Math.round(purchaseIntent * 100);
      }
  
      // Calcular interesse em eventos
      calculateEventInterest() {
        // Baseado em sentimento e atividade
        const sentimentFactor = ((this.sentimentData.overallSentiment + 1) / 2);
        const positiveRatio = this.sentimentData.stats.positive / 
                            (this.sentimentData.stats.positive + this.sentimentData.stats.negative + this.sentimentData.stats.neutral || 1);
        
        // Combinação ponderada
        const eventInterest = (sentimentFactor * 0.6) + (positiveRatio * 0.4);
        return Math.round(eventInterest * 100);
      }
  
      // Calcular risco de abandono
      calculateChurnRisk() {
        // Quanto mais negativo o sentimento, maior o risco de abandono
        const sentimentFactor = ((this.sentimentData.overallSentiment + 1) / 2);
        const negativeRatio = this.sentimentData.stats.negative / 
                            (this.sentimentData.stats.positive + this.sentimentData.stats.negative + this.sentimentData.stats.neutral || 1);
        
        // Combinação ponderada (invertida para risco)
        const churnRisk = (1 - sentimentFactor) * 0.6 + negativeRatio * 0.4;
        return Math.round(churnRisk * 100);
      }
    }
  
    /**
     * Gerenciador de Notificações
     * Responsável por exibir notificações na interface
     */
    class NotificationManager {
      static show(message, type = 'info', duration = 4000) {
        // Remover notificação existente
        const existingNotification = document.querySelector('.sentiment-notification');
        if (existingNotification) {
          existingNotification.remove();
        }
        
        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = 'sentiment-notification';
        
        // Definir conteúdo baseado no tipo
        let icon, color;
        switch (type) {
          case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            color = CONFIG.COLORS.POSITIVE;
            break;
          case 'error':
            icon = '<i class="fas fa-times-circle"></i>';
            color = CONFIG.COLORS.NEGATIVE;
            break;
          case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            color = '#ffcc00';
            break;
          default:
            icon = '<i class="fas fa-info-circle"></i>';
            color = CONFIG.COLORS.NEUTRAL;
            break;
        }
        
        notification.innerHTML = `${icon} <span>${message}</span>`;
        notification.style.backgroundColor = color;
        
        // Adicionar ao corpo do documento
        document.body.appendChild(notification);
        
        // Iniciar animação de entrada
        setTimeout(() => {
          notification.classList.add('show');
        }, 10);
        
        // Remover após alguns segundos
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => notification.remove(), 300);
        }, duration);
      }
    }
  
    /**
     * Controlador de UI
     * Responsável por manipular a interface do usuário
     */
    class UIController {
      constructor(profileManager, sentimentAnalyzer) {
        this.profileManager = profileManager;
        this.sentimentAnalyzer = sentimentAnalyzer;
        this.setupEventListeners();
        this.setupRealTimeAnalysis();
        this.updateSentimentUI();
        this.setupStyles();
      }
  
      // Configurar ouvintes de eventos
      setupEventListeners() {
        // Botão de post
        const postButton = document.querySelector('#analyzePostBtn');
        const postInput = document.querySelector('.post-input');
        
        if (postButton && postInput) {
          postButton.addEventListener('click', () => {
            const content = postInput.value.trim();
            if (content) {
              const analysis = this.sentimentAnalyzer.analyzeText(content);
              this.sentimentAnalyzer.updateSentimentData(analysis);
              this.updateSentimentUI();
              this.addPostToFeed(content, analysis);
              postInput.value = '';
              
              // Notificar usuário
              NotificationManager.show('Post publicado com sucesso!', 'success');
            } else {
              NotificationManager.show('Digite algo para publicar!', 'warning');
            }
          });
        }
  
        // Comentários
        document.addEventListener('click', (e) => {
          // Botão de comentário
          if (e.target.classList.contains('comment-btn') || e.target.closest('.comment-btn')) {
            const postCard = e.target.closest('.post-card');
            if (postCard) {
              const commentsSection = postCard.querySelector('.comments-section');
              if (commentsSection) {
                commentsSection.classList.toggle('show');
              }
            }
          }
          
          // Botão de enviar comentário
          if (e.target.classList.contains('comment-submit') || e.target.closest('.comment-submit')) {
            const commentSection = e.target.closest('.comments-section');
            if (commentSection) {
              const commentInput = commentSection.querySelector('.comment-input');
              if (commentInput && commentInput.value.trim()) {
                const content = commentInput.value.trim();
                const analysis = this.sentimentAnalyzer.analyzeText(content);
                this.sentimentAnalyzer.updateSentimentData(analysis);
                this.updateSentimentUI();
                this.addCommentToPost(commentSection, content, analysis);
                commentInput.value = '';
                
                // Notificar usuário
                NotificationManager.show('Comentário adicionado!', 'success');
              }
            }
          }
          
          // Botão de curtir
          if (e.target.classList.contains('post-action-btn') || e.target.closest('.post-action-btn')) {
            const button = e.target.classList.contains('post-action-btn') ? e.target : e.target.closest('.post-action-btn');
            
            // Se não for botão de comentário
            if (!button.classList.contains('comment-btn')) {
              // Verificar se já está curtido
              if (!button.classList.contains('liked')) {
                button.classList.add('liked');
                
                // Mudar ícone e texto
                if (button.querySelector('i')) {
                  button.querySelector('i').className = 'fas fa-heart';
                  button.innerHTML = `<i class="fas fa-heart"></i> Curtido`;
                }
                
                // Atualizar contador de curtidas
                const postCard = button.closest('.post-card');
                if (postCard) {
                  const likeCount = postCard.querySelector('.post-stat:first-child');
                  if (likeCount) {
                    const currentCount = parseInt(likeCount.textContent.match(/\d+/)[0]);
                    likeCount.innerHTML = `<i class="fas fa-heart"></i> ${currentCount + 1}`;
                  }
                }
                
                NotificationManager.show('Post curtido!', 'success');
              }
            }
          }
          
          // Botão de compartilhar
          if (e.target.closest('[data-action="compartilhar"]')) {
            const button = e.target.closest('[data-action="compartilhar"]');
            const postCard = button.closest('.post-card');
            
            if (postCard) {
              const shareCount = postCard.querySelector('.post-stat:nth-child(3)');
              if (shareCount) {
                const currentCount = parseInt(shareCount.textContent.match(/\d+/)[0]);
                shareCount.innerHTML = `<i class="fas fa-share"></i> ${currentCount + 1}`;
              }
              
              NotificationManager.show('Post compartilhado!', 'success');
            }
          }
        });
  
        // Abas de análise
        document.querySelectorAll('.analysis-tab').forEach(tab => {
          tab.addEventListener('click', () => {
            // Remover classe ativa de todas as abas
            document.querySelectorAll('.analysis-tab').forEach(t => t.classList.remove('active'));
            // Adicionar classe ativa à aba clicada
            tab.classList.add('active');
            
            // Ocultar todos os conteúdos
            document.querySelectorAll('.analysis-content').forEach(content => {
              content.classList.remove('active');
            });
            
            // Mostrar conteúdo correspondente
            const contentId = tab.getAttribute('data-tab') + '-content';
            const content = document.getElementById(contentId);
            if (content) {
              content.classList.add('active');
            }
          });
        });
  
        // Botão de atualização de análise
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
          refreshBtn.addEventListener('click', () => {
            // Animar ícone de atualização
            refreshBtn.classList.add('rotating');
            setTimeout(() => {
              refreshBtn.classList.remove('rotating');
            }, 1000);
            
            // Atualizar UI
            this.updateSentimentUI();
            
            // Notificar usuário
            NotificationManager.show('Análise de sentimentos atualizada!', 'info');
          });
        }
  
        // Botões de conexão de redes sociais
        document.addEventListener('click', (e) => {
          const networkIcon = e.target.closest('.network-icon');
          if (networkIcon) {
            const networkId = networkIcon.dataset.network;
            if (networkId) {
              this.profileManager.toggleSocialConnection(networkId);
            }
          }
          
          const socialAccount = e.target.closest('.social-account');
          if (socialAccount) {
            const icon = socialAccount.querySelector('.social-icon i');
            if (icon) {
              const networkClass = Array.from(icon.classList).find(cls => cls.startsWith('fa-'));
              if (networkClass) {
                const networkId = networkClass.replace('fa-', '');
                this.profileManager.toggleSocialConnection(networkId);
              }
            }
          }
          
          // Botão de conectar mais redes
          const connectMoreBtn = e.target.closest('.connect-more-btn');
          if (connectMoreBtn) {
            this.showSocialConnectModal();
          }
        });
  
        // Ações recomendadas
        document.querySelectorAll('.action-item').forEach(item => {
          item.addEventListener('click', () => {
            const actionText = item.querySelector('.action-text')?.textContent;
            if (actionText) {
              NotificationManager.show(`Ação iniciada: ${actionText}`, 'success');
              this.simulateActionProgress(item);
            }
          });
        });
  
        // Botão de atualização de ações
        const actionsRefresh = document.querySelector('.actions-refresh');
        if (actionsRefresh) {
          actionsRefresh.addEventListener('click', () => {
            // Animar ícone
            actionsRefresh.classList.add('rotating');
            setTimeout(() => {
              actionsRefresh.classList.remove('rotating');
            }, 1000);
            
            // Atualizar ações recomendadas
            this.updateRecommendedActions();
            
            // Notificar usuário
            NotificationManager.show('Ações recomendadas atualizadas!', 'info');
          });
        }
      }
  
      // Configurar análise em tempo real
      setupRealTimeAnalysis() {
        // Configurar análise em tempo real para campos de entrada existentes
        document.querySelectorAll('.post-input, .comment-input').forEach(input => {
          this.setupRealTimeInputAnalysis(input);
        });
        
        // Observer para novos inputs
        const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.addedNodes) {
              mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  // Verificar se o novo nó contém inputs
                  const inputs = node.querySelectorAll('.post-input, .comment-input');
                  inputs.forEach(input => this.setupRealTimeInputAnalysis(input));
                }
              });
            }
          });
        });
        
        observer.observe(document.body, { 
          childList: true, 
          subtree: true 
        });
      }
  
      // Configurar análise em tempo real para um input
      setupRealTimeInputAnalysis(input) {
        let typingTimer;
        const doneTypingInterval = 500; // meio segundo
        
        input.addEventListener('input', () => {
          clearTimeout(typingTimer);
          
          if (input.value.trim()) {
            typingTimer = setTimeout(() => {
              const analysis = this.sentimentAnalyzer.analyzeText(input.value.trim());
              this.updateRealTimeUI(input, analysis);
            }, doneTypingInterval);
          } else {
            // Remover indicadores de sentimento quando o campo estiver vazio
            this.clearRealTimeUI(input);
          }
        });
      }
  
      // Atualizar UI em tempo real
      updateRealTimeUI(input, analysis) {
        // Remover classes de sentimento anteriores
        input.classList.remove('positive-input', 'negative-input', 'neutral-input');
        
        // Adicionar classe baseada no sentimento
        if (analysis.sentiment === CONFIG.SENTIMENTS.POSITIVE) {
          input.classList.add('positive-input');
        } else if (analysis.sentiment === CONFIG.SENTIMENTS.NEGATIVE) {
          input.classList.add('negative-input');
        } else {
          input.classList.add('neutral-input');
        }
        
        // Mostrar indicador flutuante
        this.showFloatingIndicator(input, analysis);
        
        // Atualizar painel de análise em tempo real
        this.updateRealtimeSentimentPanel(analysis);
      }
  
      // Limpar UI em tempo real
      clearRealTimeUI(input) {
        input.classList.remove('positive-input', 'negative-input', 'neutral-input');
        
        // Remover indicador flutuante
        const indicator = document.querySelector('.floating-sentiment-indicator');
        if (indicator) indicator.remove();
        
        // Resetar painel em tempo real
        const realTimeStatus = document.querySelector('.realtime-status');
        if (realTimeStatus) {
          realTimeStatus.textContent = 'Pronto para analisar';
          realTimeStatus.classList.remove('active', 'positive', 'negative');
        }
        
        // Resetar marcador de sentimento
        const sentimentMarker = document.querySelector('.sentiment-gauge-marker');
        if (sentimentMarker) {
          sentimentMarker.style.left = '50%';
        }
      }
  
      // Mostrar indicador flutuante
      showFloatingIndicator(input, analysis) {
        // Remover indicador existente
        const existingIndicator = document.querySelector('.floating-sentiment-indicator');
        if (existingIndicator) existingIndicator.remove();
        
        // Criar novo indicador
        const indicator = document.createElement('div');
        indicator.className = 'floating-sentiment-indicator';
        
        // Definir conteúdo baseado no sentimento
        let icon, color, text;
        if (analysis.sentiment === CONFIG.SENTIMENTS.POSITIVE) {
          icon = '<i class="fas fa-smile"></i>';
          color = CONFIG.COLORS.POSITIVE;
          text = 'Sentimento Positivo';
        } else if (analysis.sentiment === CONFIG.SENTIMENTS.NEGATIVE) {
          icon = '<i class="fas fa-frown"></i>';
          color = CONFIG.COLORS.NEGATIVE;
          text = 'Sentimento Negativo';
        } else {
          icon = '<i class="fas fa-meh"></i>';
          color = CONFIG.COLORS.NEUTRAL;
          text = 'Sentimento Neutro';
        }
        
        indicator.innerHTML = `${icon} <span>${text}</span>`;
        indicator.style.backgroundColor = color;
        
        // Posicionar o indicador próximo ao campo
        const inputRect = input.getBoundingClientRect();
        indicator.style.top = (inputRect.bottom + window.scrollY + 5) + 'px';
        indicator.style.left = (inputRect.left + window.scrollX) + 'px';
        
        // Adicionar ao corpo do documento
        document.body.appendChild(indicator);
        
        // Animar entrada
        setTimeout(() => {
          indicator.classList.add('show');
        }, 10);
        
        // Remover após alguns segundos
        setTimeout(() => {
          indicator.classList.remove('show');
          setTimeout(() => indicator.remove(), 300);
        }, 3000);
      }
  
      // Atualizar painel de sentimento em tempo real
      updateRealtimeSentimentPanel(analysis) {
        const realTimeStatus = document.querySelector('.realtime-status');
        if (realTimeStatus) {
          realTimeStatus.classList.add('active');
          realTimeStatus.classList.remove('positive', 'negative');
          
          if (analysis.sentiment === CONFIG.SENTIMENTS.POSITIVE) {
            realTimeStatus.classList.add('positive');
            realTimeStatus.innerHTML = `<div class="dot"></div> Sentimento Positivo Detectado`;
          } else if (analysis.sentiment === CONFIG.SENTIMENTS.NEGATIVE) {
            realTimeStatus.classList.add('negative');
            realTimeStatus.innerHTML = `<div class="dot"></div> Sentimento Negativo Detectado`;
          } else {
            realTimeStatus.innerHTML = `<div class="dot"></div> Analisando Conteúdo`;
          }
        }
        
        // Atualizar marcador de sentimento
        const sentimentMarker = document.querySelector('.sentiment-gauge-marker');
        if (sentimentMarker) {
          let position;
          if (analysis.sentiment === CONFIG.SENTIMENTS.POSITIVE) {
            position = '75%';
          } else if (analysis.sentiment === CONFIG.SENTIMENTS.NEGATIVE) {
            position = '25%';
          } else {
            position = '50%';
          }
          
          sentimentMarker.style.left = position;
        }
        
        // Atualizar keywords em tempo real
        const keywordsContainer = document.querySelector('.keywords-cloud');
        if (keywordsContainer && analysis.keywords.length > 0) {
          // Limpar container
          keywordsContainer.innerHTML = '';
          
          // Adicionar palavras-chave
          analysis.keywords.forEach(keyword => {
            const keywordElement = document.createElement('div');
            keywordElement.className = `keyword ${keyword.type}`;
            keywordElement.innerHTML = `
              <span>${keyword.word}</span>
              <span class="keyword-count">1</span>
            `;
            keywordsContainer.appendChild(keywordElement);
          });
        }
      }
  
      // Atualizar interface com dados de sentimento
      updateSentimentUI() {
        // Atualizar previsões
        const purchaseIntent = this.sentimentAnalyzer.calculatePurchaseIntent();
        const eventInterest = this.sentimentAnalyzer.calculateEventInterest();
        const churnRisk = this.sentimentAnalyzer.calculateChurnRisk();
        
        this.updatePredictionGauge('purchase-intent', purchaseIntent);
        this.updatePredictionGauge('event-interest', eventInterest);
        this.updatePredictionGauge('churn-risk', churnRisk);
        
        // Atualizar gauge de sentimento
        this.updateSentimentGauge();
        
        // Atualizar histórico de análises
        this.updateAnalysisHistory();
        
        // Atualizar nuvem de tags
        this.updateTagsCloud();
        
        // Atualizar ações recomendadas
        this.updateRecommendedActions();
      }
  
      // Atualizar gauge de sentimento
      updateSentimentGauge() {
        const sentimentValue = ((this.sentimentAnalyzer.sentimentData.overallSentiment + 1) / 2) * 100; // Converte de [-1,1] para [0,100]
        
        const gaugeMarker = document.querySelector('.gauge-marker');
        if (gaugeMarker) {
          gaugeMarker.style.left = `${sentimentValue}%`;
        }
      }
  
      // Atualizar gauge de previsão
      updatePredictionGauge(gaugeClass, value) {
        const gaugeFill = document.querySelector(`.${gaugeClass} .gauge-fill`);
        if (gaugeFill) {
          gaugeFill.style.width = `${value}%`;
        }
        
        const gaugeMarker = document.querySelector(`.${gaugeClass} .gauge-marker`);
        if (gaugeMarker) {
          gaugeMarker.style.left = `${value}%`;
        }
        
        const gaugeValue = document.querySelector(`.${gaugeClass}-value`);
        if (gaugeValue) {
          gaugeValue.textContent = `${value}%`;
          
          // Animar valor com destaque
          gaugeValue.classList.add('highlight');
          setTimeout(() => {
            gaugeValue.classList.remove('highlight');
          }, 1000);
        }
      }
  
      // Atualizar histórico de análises
      updateAnalysisHistory() {
        const historyContainer = document.querySelector('.sentiment-history');
        if (!historyContainer) {
          this.createHistoryContainer();
          return;
        }
        
        const historyList = historyContainer.querySelector('.history-items');
        if (!historyList) return;
        
        // Limpar lista
        historyList.innerHTML = '';
        
        // Adicionar entradas do histórico
        this.sentimentAnalyzer.sentimentData.sentimentHistory.slice(0, 5).forEach(entry => {
          const historyItem = document.createElement('div');
          historyItem.className = 'history-item';
          
          // Determinar cor e ícone baseado no sentimento
          let icon, color, sentimentClass;
          if (entry.sentiment === CONFIG.SENTIMENTS.POSITIVE) {
            icon = '<i class="fas fa-smile"></i>';
            color = CONFIG.COLORS.POSITIVE;
            sentimentClass = 'positive';
          } else if (entry.sentiment === CONFIG.SENTIMENTS.NEGATIVE) {
            icon = '<i class="fas fa-frown"></i>';
            color = CONFIG.COLORS.NEGATIVE;
            sentimentClass = 'negative';
          } else {
            icon = '<i class="fas fa-meh"></i>';
            color = CONFIG.COLORS.NEUTRAL;
            sentimentClass = 'neutral';
          }
          
          // Formatar data
          const date = new Date(entry.timestamp);
          const formattedDate = date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });
          
          historyItem.innerHTML = `
            <div class="history-icon" style="color: ${color};">${icon}</div>
            <div class="history-content">
              <div class="history-text">${entry.text}</div>
              <div class="history-time">${formattedDate}</div>
            </div>
            <div class="history-sentiment ${sentimentClass}">
              ${Math.round(entry.score * 100)}%
            </div>
          `;
          
          historyList.appendChild(historyItem);
        });
      }
  
      // Criar container de histórico se não existir
      createHistoryContainer() {
        const sentimentContent = document.getElementById('sentiment-content');
        if (!sentimentContent) return;
        
        const historyContainer = document.createElement('div');
        historyContainer.className = 'sentiment-history';
        
        historyContainer.innerHTML = `
          <div class="history-title">
            <i class="fas fa-history"></i> Histórico de Análises Recentes
          </div>
          <div class="history-items"></div>
        `;
        
        sentimentContent.appendChild(historyContainer);
        
        // Chamar novamente para preencher o histórico
        this.updateAnalysisHistory();
      }
  
      // Atualizar nuvem de tags
      updateTagsCloud() {
        // Verificar se o container existe ou criar um
        let tagsCloud = document.querySelector('.tags-cloud');
        const sentimentContent = document.getElementById('sentiment-content');
        
        if (!tagsCloud && sentimentContent) {
          tagsCloud = document.createElement('div');
          tagsCloud.className = 'tags-cloud';
          
          tagsCloud.innerHTML = `
            <div class="tags-title">
              <i class="fas fa-tags"></i> Palavras-Chave Mais Frequentes
            </div>
            <div class="tags-items"></div>
          `;
          
          sentimentContent.appendChild(tagsCloud);
        }
        
        if (!tagsCloud) return;
        
        const tagsItems = tagsCloud.querySelector('.tags-items');
        if (!tagsItems) return;
        
        // Limpar tags
        tagsItems.innerHTML = '';
        
        // Obter palavras positivas mais frequentes
        const positiveWords = Object.entries(this.sentimentAnalyzer.sentimentData.positiveWords)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        // Obter palavras negativas mais frequentes
        const negativeWords = Object.entries(this.sentimentAnalyzer.sentimentData.negativeWords)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        // Adicionar palavras positivas
        positiveWords.forEach(([word, count]) => {
          const tag = document.createElement('div');
          tag.className = 'tag positive';
          tag.innerHTML = `
            <span class="tag-text">${word}</span>
            <span class="tag-count">${count}</span>
          `;
          tagsItems.appendChild(tag);
        });
        
        // Adicionar palavras negativas
        negativeWords.forEach(([word, count]) => {
          const tag = document.createElement('div');
          tag.className = 'tag negative';
          tag.innerHTML = `
            <span class="tag-text">${word}</span>
            <span class="tag-count">${count}</span>
          `;
          tagsItems.appendChild(tag);
        });
      }
  
      // Atualizar ações recomendadas
      updateRecommendedActions() {
        const actionsList = document.querySelector('.actions-list');
        if (!actionsList) return;
        
        // Limpar lista
        actionsList.innerHTML = '';
        
        // Determinar ações com base nas métricas
        const purchaseIntent = this.sentimentAnalyzer.calculatePurchaseIntent();
        const eventInterest = this.sentimentAnalyzer.calculateEventInterest();
        const churnRisk = this.sentimentAnalyzer.calculateChurnRisk();
        
        // Ações para alta intenção de compra
        if (purchaseIntent > 60) {
          this.addRecommendedAction(
            actionsList,
            'tshirt',
            'Oferecer nova camiseta com desconto exclusivo',
            `+${Math.round(purchaseIntent * 0.2)}% probabilidade de compra`
          );
        }
        
        // Ações para alto interesse em eventos
        if (eventInterest > 50) {
          this.addRecommendedAction(
            actionsList,
            'ticket-alt',
            'Enviar oferta de pré-venda para o próximo evento',
            `+${Math.round(eventInterest * 0.3)}% probabilidade de conversão`
          );
        }
        
        // Ações para combater alto risco de abandono
        if (churnRisk > 40) {
          this.addRecommendedAction(
            actionsList,
            'gift',
            'Enviar brinde exclusivo para manter engajamento',
            `-${Math.round(churnRisk * 0.2)}% risco de abandono`
          );
        }
        
        // Ação baseada no jogador favorito
        this.addRecommendedAction(
          actionsList,
          'envelope',
          'Enviar conteúdo exclusivo sobre Carlos Almeida',
          '+30% engajamento'
        );
        
        // Ajustar se a lista estiver vazia
        if (actionsList.children.length === 0) {
          this.addRecommendedAction(
            actionsList,
            'sync',
            'Aguarde mais interações para recomendações personalizadas',
            'Recomendações serão atualizadas em breve'
          );
        }
      }
  
      // Adicionar ação recomendada
      addRecommendedAction(container, icon, text, effect) {
        const actionItem = document.createElement('div');
        actionItem.className = 'action-item';
        
        actionItem.innerHTML = `
          <div class="action-icon">
            <i class="fas fa-${icon}"></i>
          </div>
          <div>
            <div class="action-text">${text}</div>
            <div class="action-effect">${effect}</div>
          </div>
        `;
        
        // Adicionar efeito de clique
        actionItem.addEventListener('click', () => {
          NotificationManager.show(`Ação iniciada: ${text}`, 'success');
          this.simulateActionProgress(actionItem);
        });
        
        container.appendChild(actionItem);
      }
  
      // Simular progresso de uma ação
      simulateActionProgress(actionItem) {
        // Adicionar classe de processamento
        actionItem.classList.add('processing');
        
        // Adicionar barra de progresso
        const progressBar = document.createElement('div');
        progressBar.className = 'action-progress';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'action-progress-fill';
        progressBar.appendChild(progressFill);
        
        actionItem.appendChild(progressBar);
        
        // Animar progresso
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          progressFill.style.width = `${progress}%`;
          
          if (progress >= 100) {
            clearInterval(interval);
            
            // Remover barra de progresso
            setTimeout(() => {
              progressBar.remove();
              actionItem.classList.remove('processing');
              actionItem.classList.add('completed');
              
              // Adicionar ícone de conclusão
              const icon = actionItem.querySelector('.action-icon i');
              if (icon) {
                icon.className = 'fas fa-check';
              }
              
              // Atualizar texto de efeito
              const effectText = actionItem.querySelector('.action-effect');
              if (effectText) {
                effectText.textContent = 'Ação concluída com sucesso';
              }
              
              // Mostrar notificação
              NotificationManager.show('Ação concluída com sucesso!', 'success');
            }, 500);
          }
        }, 100);
      }
  
      // Mostrar modal de conexão de redes sociais
      showSocialConnectModal() {
        // Verificar se já existe um modal
        let modal = document.querySelector('.social-connect-modal');
        
        if (!modal) {
          // Criar modal
          modal = document.createElement('div');
          modal.className = 'social-connect-modal';
          
          // Conteúdo do modal
          modal.innerHTML = `
            <div class="modal-content">
              <div class="modal-header">
                <h3>Conectar Redes Sociais</h3>
                <span class="close-modal">&times;</span>
              </div>
              <div class="modal-body">
                <p>Conecte suas redes sociais para uma experiência mais completa!</p>
                <div class="social-connect-list"></div>
              </div>
            </div>
          `;
          
          // Adicionar ao corpo do documento
          document.body.appendChild(modal);
          
          // Adicionar evento de fechar
          const closeBtn = modal.querySelector('.close-modal');
          if (closeBtn) {
            closeBtn.addEventListener('click', () => {
              modal.classList.remove('show');
              setTimeout(() => modal.remove(), 300);
            });
          }
          
          // Fechar ao clicar fora do modal
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              modal.classList.remove('show');
              setTimeout(() => modal.remove(), 300);
            }
          });
        }
        
        // Preencher lista de redes sociais
        const networksList = modal.querySelector('.social-connect-list');
        if (networksList) {
          // Limpar lista
          networksList.innerHTML = '';
          
          // Adicionar redes sociais
          this.profileManager.socialConnections.forEach(network => {
            const networkItem = document.createElement('div');
            networkItem.className = `social-network-item ${network.connected ? 'connected' : ''}`;
            networkItem.dataset.network = network.id;
            
            networkItem.innerHTML = `
              <div class="network-icon">
                <i class="fab fa-${network.icon}"></i>
              </div>
              <div class="network-info">
                <div class="network-name">${network.name}</div>
                <div class="network-status">
                  ${network.connected ? `Conectado como ${network.username}` : 'Não conectado'}
                </div>
              </div>
              <button class="network-action-btn">
                ${network.connected ? 'Desconectar' : 'Conectar'}
              </button>
            `;
            
            // Adicionar evento de clique
            networkItem.querySelector('.network-action-btn').addEventListener('click', () => {
              this.profileManager.toggleSocialConnection(network.id);
              modal.classList.remove('show');
              setTimeout(() => modal.remove(), 300);
            });
            
            networksList.appendChild(networkItem);
          });
        }
        
        // Mostrar modal
        setTimeout(() => modal.classList.add('show'), 10);
      }
  
      // Adicionar post ao feed
      addPostToFeed(content, analysis) {
        const feedColumn = document.querySelector('.main-column');
        if (!feedColumn) return;
        
        // Criar elemento do post
        const postCard = document.createElement('div');
        postCard.className = `post-card sentiment-${analysis.sentiment}`;
        
        // Carregar dados do perfil
        const profile = this.profileManager.profile;
        
        // Gerar iniciais do nome
        const initials = profile.username
          .split('_')[0]
          .substring(0, 2)
          .toUpperCase();
        
        // Data e hora atual formatadas
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Determinar ícone de sentimento
        let sentimentIcon = '';
        if (analysis.sentiment === CONFIG.SENTIMENTS.POSITIVE) {
          sentimentIcon = '<i class="fas fa-smile sentiment-icon positive"></i>';
        } else if (analysis.sentiment === CONFIG.SENTIMENTS.NEGATIVE) {
          sentimentIcon = '<i class="fas fa-frown sentiment-icon negative"></i>';
        } else {
          sentimentIcon = '<i class="fas fa-meh sentiment-icon"></i>';
        }
        
        // Montar HTML do post
        postCard.innerHTML = `
          <div class="post-header">
            <div class="post-avatar">${initials}</div>
            <div class="post-user-info">
              <div class="post-user-name">${profile.username}</div>
              <div class="post-time">Agora</div>
            </div>
            <div class="sentiment-icon-container">
              ${sentimentIcon}
            </div>
          </div>
          <div class="post-content">${content}</div>
          <div class="post-footer">
            <div class="post-stats">
              <div class="post-stat"><i class="fas fa-heart"></i> 0</div>
              <div class="post-stat"><i class="fas fa-comment"></i> 0</div>
              <div class="post-stat"><i class="fas fa-share"></i> 0</div>
            </div>
            <div class="post-actions-btns">
              <button class="post-action-btn"><i class="far fa-heart"></i> Curtir</button>
              <button class="post-action-btn comment-btn"><i class="far fa-comment"></i> Comentar</button>
              <button class="post-action-btn"><i class="fas fa-share"></i> Compartilhar</button>
            </div>
          </div>
          <div class="comments-section">
            <div class="comment-form">
              <input type="text" class="comment-input" placeholder="Escreva um comentário...">
              <button class="comment-submit">Enviar</button>
            </div>
            <div class="comment-list"></div>
          </div>
        `;
        
        // Inserir no início do feed, após o form de criação
        const createPost = feedColumn.querySelector('.create-post');
        if (createPost && createPost.nextSibling) {
          feedColumn.insertBefore(postCard, createPost.nextSibling);
        } else {
          feedColumn.appendChild(postCard);
        }
        
        // Configurar análise em tempo real para o input de comentário
        const commentInput = postCard.querySelector('.comment-input');
        if (commentInput) {
          this.setupRealTimeInputAnalysis(commentInput);
        }
        
        // Animar entrada
        postCard.style.opacity = 0;
        postCard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          postCard.style.transition = 'all 0.5s ease';
          postCard.style.opacity = 1;
          postCard.style.transform = 'translateY(0)';
        }, 10);
      }
  
      // Adicionar comentário a um post
      addCommentToPost(commentSection, content, analysis) {
        const commentList = commentSection.querySelector('.comment-list');
        if (!commentList) return;
        
        // Criar elemento do comentário
        const commentItem = document.createElement('div');
        commentItem.className = `comment-item sentiment-${analysis.sentiment}`;
        
        // Carregar dados do perfil
        const profile = this.profileManager.profile;
        
        // Gerar iniciais do nome
        const initials = profile.username
          .split('_')[0]
          .substring(0, 2)
          .toUpperCase();
        
        // Montar HTML do comentário
        commentItem.innerHTML = `
          <div class="comment-avatar">${initials}</div>
          <div class="comment-content">
            <div class="comment-user">${profile.username}</div>
            <div class="comment-text">${content}</div>
            <div class="comment-time">Agora</div>
          </div>
        `;
        
        // Adicionar borda de acordo com o sentimento
        // Adicionar borda de acordo com o sentimento
        if (analysis.sentiment === CONFIG.SENTIMENTS.POSITIVE) {
            commentItem.style.borderLeft = `3px solid ${CONFIG.COLORS.POSITIVE}`;
          } else if (analysis.sentiment === CONFIG.SENTIMENTS.NEGATIVE) {
            commentItem.style.borderLeft = `3px solid ${CONFIG.COLORS.NEGATIVE}`;
          } else {
            commentItem.style.borderLeft = `3px solid ${CONFIG.COLORS.NEUTRAL}`;
          }
          
          // Inserir no início da lista
          commentList.prepend(commentItem);
          
          // Garantir que a seção de comentários esteja visível
          commentSection.classList.add('show');
          
          // Animar entrada
          commentItem.style.opacity = 0;
          commentItem.style.transform = 'translateY(10px)';
          
          setTimeout(() => {
            commentItem.style.transition = 'all 0.5s ease';
            commentItem.style.opacity = 1;
            commentItem.style.transform = 'translateY(0)';
          }, 10);
          
          // Atualizar contador de comentários no post
          const postCard = commentSection.closest('.post-card');
          if (postCard) {
            const commentCount = postCard.querySelector('.post-stat:nth-child(2)');
            if (commentCount) {
              const currentCount = parseInt(commentCount.textContent.match(/\d+/)[0]) || 0;
              commentCount.innerHTML = `<i class="fas fa-comment"></i> ${currentCount + 1}`;
            }
          }
        }
  
        // Adicionar estilos CSS necessários
        setupStyles() {
          const styleElement = document.createElement('style');
          styleElement.textContent = `
            /* Estilos para notificações de sentimento */
            .sentiment-notification {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: rgba(30, 144, 255, 0.9);
              color: white;
              padding: 12px 20px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              gap: 10px;
              font-size: 14px;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
              z-index: 1000;
              opacity: 0;
              transform: translateY(20px);
              transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .sentiment-notification.show {
              opacity: 1;
              transform: translateY(0);
            }
            
            .sentiment-notification i {
              font-size: 18px;
            }
            
            /* Estilos para indicadores flutuantes de sentimento */
            .floating-sentiment-indicator {
              position: absolute;
              background: rgba(30, 144, 255, 0.9);
              color: white;
              padding: 8px 12px;
              border-radius: 20px;
              font-size: 12px;
              display: flex;
              align-items: center;
              gap: 8px;
              z-index: 100;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
              opacity: 0;
              transform: translateY(10px);
              transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .floating-sentiment-indicator.show {
              opacity: 1;
              transform: translateY(0);
            }
            
            .floating-sentiment-indicator i {
              font-size: 14px;
            }
            
            /* Estilos para campos de entrada com análise em tempo real */
            .post-input, .comment-input {
              transition: border-color 0.3s ease, box-shadow 0.3s ease;
            }
            
            .positive-input {
              border-color: ${CONFIG.COLORS.POSITIVE} !important;
              box-shadow: 0 0 10px rgba(0, 204, 102, 0.2) !important;
            }
            
            .negative-input {
              border-color: ${CONFIG.COLORS.NEGATIVE} !important;
              box-shadow: 0 0 10px rgba(255, 59, 92, 0.2) !important;
            }
            
            .neutral-input {
              border-color: ${CONFIG.COLORS.NEUTRAL} !important;
              box-shadow: 0 0 10px rgba(30, 144, 255, 0.2) !important;
            }
            
            /* Estilos para post cards com análise de sentimento */
            .post-card.sentiment-positive {
              border-left: 3px solid ${CONFIG.COLORS.POSITIVE};
            }
            
            .post-card.sentiment-negative {
              border-left: 3px solid ${CONFIG.COLORS.NEGATIVE};
            }
            
            .post-card.sentiment-neutral {
              border-left: 3px solid ${CONFIG.COLORS.NEUTRAL};
            }
            
            /* Estilos para ícones de sentimento */
            .sentiment-icon-container {
              margin-left: auto;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 30px;
              height: 30px;
            }
            
            .sentiment-icon {
              font-size: 1.2rem;
              color: #888;
            }
            
            .sentiment-icon.positive {
              color: ${CONFIG.COLORS.POSITIVE};
            }
            
            .sentiment-icon.negative {
              color: ${CONFIG.COLORS.NEGATIVE};
            }
            
            /* Estilos para histórico de análises */
            .sentiment-history {
              margin-top: 20px;
              background: rgba(30, 40, 60, 0.3);
              border-radius: 10px;
              padding: 15px;
              border: 1px solid #333;
            }
            
            .history-title {
              font-size: 14px;
              color: #ccc;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .history-items {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 8px;
              overflow: hidden;
            }
            
            .history-item {
              display: flex;
              align-items: center;
              padding: 10px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
              transition: background-color 0.2s ease;
            }
            
            .history-item:last-child {
              border-bottom: none;
            }
            
            .history-item:hover {
              background-color: rgba(30, 144, 255, 0.1);
            }
            
            .history-icon {
              font-size: 18px;
              margin-right: 10px;
              min-width: 20px;
              text-align: center;
            }
            
            .history-content {
              flex: 1;
            }
            
            .history-text {
              font-size: 13px;
              color: #ddd;
            }
            
            .history-time {
              font-size: 11px;
              color: #888;
              margin-top: 4px;
            }
            
            .history-sentiment {
              padding: 3px 8px;
              border-radius: 10px;
              font-size: 11px;
              text-align: center;
              min-width: 60px;
            }
            
            .history-sentiment.positive {
              background: rgba(0, 204, 102, 0.2);
              color: #00cc66;
            }
            
            .history-sentiment.negative {
              background: rgba(255, 59, 92, 0.2);
              color: #ff3b5c;
            }
            
            .history-sentiment.neutral {
              background: rgba(30, 144, 255, 0.2);
              color: #1e90ff;
            }
            
            /* Estilos para nuvem de tags */
            .tags-cloud {
              margin-top: 20px;
              padding: 15px;
              background: rgba(30, 40, 60, 0.3);
              border-radius: 10px;
              border: 1px solid #333;
            }
            
            .tags-title {
              font-size: 14px;
              color: #ccc;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .tags-items {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 10px;
            }
            
            .tag {
              padding: 5px 10px;
              border-radius: 20px;
              font-size: 12px;
              color: white;
              display: flex;
              align-items: center;
              gap: 5px;
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .tag:hover {
              transform: translateY(-3px);
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            }
            
            .tag.positive {
              background: linear-gradient(135deg, ${CONFIG.COLORS.POSITIVE}, rgba(0, 204, 102, 0.7));
            }
            
            .tag.negative {
              background: linear-gradient(135deg, ${CONFIG.COLORS.NEGATIVE}, rgba(255, 59, 92, 0.7));
            }
            
            .tag-text {
              font-weight: bold;
            }
            
            .tag-count {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 10px;
              padding: 2px 5px;
              font-size: 10px;
            }
            
            /* Estilos para keywords em tempo real */
            .keywords-cloud {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 15px;
            }
            
            .keyword {
              padding: 5px 10px;
              border-radius: 15px;
              font-size: 12px;
              color: white;
              display: flex;
              align-items: center;
              gap: 5px;
            }
            
            .keyword.positive {
              background: linear-gradient(135deg, #00cc66, rgba(0, 204, 102, 0.7));
            }
            
            .keyword.negative {
              background: linear-gradient(135deg, #ff3b5c, rgba(255, 59, 92, 0.7));
            }
            
            /* Animação de rotação para ícones de refresh */
            .rotating {
              animation: rotate 1s linear;
            }
            
            @keyframes rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            
            /* Estilos para conexões de redes sociais */
            .network-icon {
              width: 40px;
              height: 40px;
              background: rgba(30, 40, 60, 0.6);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #aaa;
              font-size: 18px;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            
            .network-icon:hover {
              transform: scale(1.1);
              box-shadow: 0 0 15px rgba(30, 144, 255, 0.3);
            }
            
            .network-icon.connected {
              background: rgba(30, 144, 255, 0.2);
              color: #1e90ff;
              box-shadow: 0 0 10px rgba(30, 144, 255, 0.2);
            }
            
            .networks-icons {
              display: flex;
              gap: 10px;
              margin-top: 10px;
            }
            
            .connect-more-btn {
              margin-top: 15px;
              font-size: 13px;
              color: #1e90ff;
              display: flex;
              align-items: center;
              gap: 5px;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            
            .connect-more-btn:hover {
              color: #00aaff;
              transform: translateX(5px);
            }
            
            /* Estilo para ícones de redes sociais no painel de contas */
            .social-icon {
              width: 36px;
              height: 36px;
              background: rgba(20, 30, 50, 0.4);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #aaa;
              font-size: 16px;
              margin-right: 10px;
            }
            
            .instagram-icon i {
              color: #e1306c;
            }
            
            .twitter-icon i {
              color: #1da1f2;
            }
            
            .facebook-icon i {
              color: #4267b2;
            }
            
            .youtube-icon i {
              color: #ff0000;
            }
            
            .twitch-icon i {
              color: #9146ff;
            }
            
            .social-account {
              display: flex;
              align-items: center;
              padding: 10px;
              border-radius: 8px;
              margin-bottom: 10px;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            
            .social-account:hover {
              background: rgba(30, 144, 255, 0.1);
            }
            
            .social-name {
              font-weight: bold;
              color: #ddd;
            }
            
            .social-status {
              font-size: 12px;
              color: #00cc66;
              margin-top: 3px;
            }
            
            .social-status.not-connected {
              color: #aaa;
            }
            
            /* Estilos para o modal de conexão de redes sociais */
            .social-connect-modal {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              opacity: 0;
              visibility: hidden;
              transition: all 0.3s ease;
            }
            
            .social-connect-modal.show {
              opacity: 1;
              visibility: visible;
            }
            
            .modal-content {
              background: linear-gradient(145deg, #1a1a2e, #242444);
              border-radius: 10px;
              width: 90%;
              max-width: 500px;
              max-height: 90vh;
              overflow-y: auto;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
              transform: translateY(20px);
              transition: all 0.3s ease;
            }
            
            .social-connect-modal.show .modal-content {
              transform: translateY(0);
            }
            
            .modal-header {
              padding: 15px 20px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            
            .modal-header h3 {
              margin: 0;
              color: #fff;
              font-size: 18px;
              font-family: 'Orbitron', sans-serif;
            }
            
            .close-modal {
              font-size: 24px;
              color: #aaa;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            
            .close-modal:hover {
              color: #fff;
            }
            
            .modal-body {
              padding: 20px;
            }
            
            .social-network-item {
              display: flex;
              align-items: center;
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 10px;
              background: rgba(255, 255, 255, 0.05);
              transition: all 0.2s ease;
            }
            
            .social-network-item:hover {
              background: rgba(255, 255, 255, 0.1);
            }
            
            .social-network-item .network-icon {
              margin-right: 15px;
            }
            
            .social-network-item .network-info {
              flex: 1;
            }
            
            .network-action-btn {
              background: #1e90ff;
              color: white;
              border: none;
              border-radius: 20px;
              padding: 8px 15px;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            
            .network-action-btn:hover {
              background: #0066cc;
              transform: translateY(-2px);
            }
            
            .social-network-item.connected .network-action-btn {
              background: #333;
            }
            
            .social-network-item.connected .network-action-btn:hover {
              background: #ff3b5c;
            }
            
            /* Estilos para ações recomendadas */
            .action-item {
              position: relative;
              overflow: hidden;
            }
            
            .action-item.processing {
              pointer-events: none;
            }
            
            .action-item.completed .action-icon {
              background: rgba(0, 204, 102, 0.2);
              color: #00cc66;
            }
            
            .action-progress {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 4px;
              background: rgba(0, 0, 0, 0.2);
            }
            
            .action-progress-fill {
              height: 100%;
              width: 0%;
              background: #1e90ff;
              transition: width 0.1s linear;
            }
            
            /* Estilos para paneis em tempo real */
            .realtime-analysis {
              background: rgba(20, 30, 50, 0.3);
              border-radius: 10px;
              border: 1px solid #333;
              margin-top: 20px;
              overflow: hidden;
            }
            
            .realtime-header {
              padding: 15px;
              background: linear-gradient(to right, #1a1a2e, #20203a);
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-family: 'Orbitron', sans-serif;
              font-size: 14px;
              color: #eee;
            }
            
            .realtime-status {
              font-size: 12px;
              display: flex;
              align-items: center;
              gap: 5px;
              color: #888;
            }
            
            .realtime-status.active {
              color: #1e90ff;
            }
            
            .realtime-status.positive {
              color: #00cc66;
            }
            
            .realtime-status.negative {
              color: #ff3b5c;
            }
            
            .realtime-status .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #888;
            }
            
            .realtime-status.active .dot {
              background: #1e90ff;
              animation: pulse 1.5s infinite;
            }
            
            .realtime-status.positive .dot {
              background: #00cc66;
            }
            
            .realtime-status.negative .dot {
              background: #ff3b5c;
            }
            
            .realtime-content {
              padding: 20px;
            }
            
            .sentiment-gauge {
              height: 8px;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 4px;
              position: relative;
              margin: 15px 0;
            }
            
            .sentiment-gauge-track {
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              width: 100%;
              background: linear-gradient(to right, #ff3b5c 0%, #aaa 50%, #00cc66 100%);
              border-radius: 4px;
              opacity: 0.5;
            }
            
            .sentiment-gauge-marker {
              position: absolute;
              top: -4px;
              left: 50%;
              width: 16px;
              height: 16px;
              background: white;
              border-radius: 50%;
              transform: translateX(-50%);
              box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
              transition: left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .highlight {
              animation: highlight 1s ease;
            }
            
            @keyframes highlight {
              0% { color: #fff; transform: scale(1); }
              50% { color: #1e90ff; transform: scale(1.2); }
              100% { color: inherit; transform: scale(1); }
            }
            
            @keyframes pulse {
              0% { transform: scale(0.8); opacity: 0.8; }
              50% { transform: scale(1.2); opacity: 1; }
              100% { transform: scale(0.8); opacity: 0.8; }
            }
            
            /* Animações para entrada de elementos */
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            /* Animações para posts e comentários */
            .post-card, .comment-item {
              animation: fadeIn 0.5s ease-out;
            }
          `;
          
          document.head.appendChild(styleElement);
        }
      }
    
      /**
       * Função para criar e adicionar elementos de UI para análise de sentimentos
       * Cria os paineis de análise em tempo real e outras melhorias de interface
       */
      function enhanceSentimentUI() {
        // Adicionar painel de análise em tempo real
        const sentimentContent = document.getElementById('sentiment-content');
        if (sentimentContent && !sentimentContent.querySelector('.realtime-analysis')) {
          // Criar painel
          const realtimePanel = document.createElement('div');
          realtimePanel.className = 'realtime-analysis';
          
          realtimePanel.innerHTML = `
            <div class="realtime-header">
              <i class="fas fa-bolt"></i> Análise em Tempo Real
              <div class="realtime-status">
                <div class="dot"></div>
                Pronto para analisar
              </div>
            </div>
            <div class="realtime-content">
              <div class="sentiment-labels">
                <div class="sentiment-label negative">Negativo</div>
                <div class="sentiment-label">Neutro</div>
                <div class="sentiment-label positive">Positivo</div>
              </div>
              <div class="sentiment-gauge">
                <div class="sentiment-gauge-track"></div>
                <div class="sentiment-gauge-marker"></div>
              </div>
              
              <div class="sentiment-keywords">
                <div class="keywords-title">
                  <i class="fas fa-key"></i> Palavras-chave Detectadas
                </div>
                <div class="keywords-cloud"></div>
              </div>
            </div>
          `;
          
          // Adicionar ao início do painel
          sentimentContent.insertBefore(realtimePanel, sentimentContent.firstChild);
        }
        
        // Configurar gauges de previsão
        document.querySelectorAll('.gauge-container').forEach(container => {
          if (!container.querySelector('.gauge-marker')) {
            const marker = document.createElement('div');
            marker.className = 'gauge-marker';
            container.appendChild(marker);
          }
        });
        
        // Conectar com redes sociais - adicionar opção "Conectar mais redes"
        const networksContainer = document.querySelector('.networks-icons');
        if (networksContainer) {
          const connectMoreBtn = document.createElement('div');
          connectMoreBtn.className = 'connect-more-btn';
          connectMoreBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Conectar mais redes';
          
          const parentElement = networksContainer.parentElement;
          if (parentElement) {
            parentElement.appendChild(connectMoreBtn);
          }
        }
        
        // Melhorar os gauges de previsão
        updateGaugeStyles();
      }
      
      /**
       * Função para melhorar os estilos dos gauges de previsão
       */
      function updateGaugeStyles() {
        // Buscar todos os gauges
        const purchaseGauge = document.querySelector('.purchase-intent .gauge-fill');
        const eventGauge = document.querySelector('.event-interest .gauge-fill');
        const churnGauge = document.querySelector('.churn-risk .gauge-fill');
        
        // Adicionando estilos personalizados para cada tipo de gauge
        if (purchaseGauge) {
          purchaseGauge.style.background = 'linear-gradient(to right, #cccccc, #00cc66)';
        }
        
        if (eventGauge) {
          eventGauge.style.background = 'linear-gradient(to right, #cccccc, #1e90ff)';
        }
        
        if (churnGauge) {
          churnGauge.style.background = 'linear-gradient(to right, #cccccc, #ff3b5c)';
        }
      }
    
      /**
       * Função para inicializar os dados de perfil de usuário
       * Preenche o localStorage com dados iniciais
       */
      function initializeProfileData() {
        // Verificar se já existe perfil
        const existingProfile = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PROFILE);
        if (!existingProfile) {
          // Criar perfil padrão personalizado
          const defaultProfile = {
            username: 'FuriaX_User',
            fullName: 'Ricardo Silva',
            userType: 'Super Fã',
            level: 4,
            engagementScore: 75,
            fanSince: '2 anos',
            eventsAttended: 7,
            totalSpent: 'R$ 1.450',
            bio: 'Fã apaixonado da FURIA desde o início!',
            avatar: null
          };
          
          // Salvar no localStorage
          localStorage.setItem(CONFIG.STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultProfile));
        }
        
        // Verificar se já existem conexões sociais
        const existingConnections = localStorage.getItem(CONFIG.STORAGE_KEYS.SOCIAL_CONNECTIONS);
        if (!existingConnections) {
          // Criar conexões padrão
          localStorage.setItem(CONFIG.STORAGE_KEYS.SOCIAL_CONNECTIONS, JSON.stringify(CONFIG.SOCIAL_NETWORKS));
        }
      }
    
      // Inicializar dados
      initializeProfileData();
      
      // Inicializar o sistema
      console.log('🔧 Criando melhorias de interface...');
      enhanceSentimentUI();
      
      console.log('🧠 Iniciando gerenciadores...');
      const profileManager = new UserProfileManager();
      const sentimentAnalyzer = new SentimentAnalyzer();
      
      console.log('🎮 Configurando controlador de UI...');
      const uiController = new UIController(profileManager, sentimentAnalyzer);
      
      // Atualizar interfaces iniciais
      profileManager.updateProfileUI();
      profileManager.updateSocialConnectionsUI();
      uiController.updateSentimentUI();
      
      console.log('✅ Sistema Avançado de Análise de Sentimentos FURIAX inicializado com sucesso!');
      
      // Exportar para uso global
      window.FURIAX_SentimentSystem = {
        profileManager,
        sentimentAnalyzer,
        uiController,
        
        // Utilitários
        analyze: text => sentimentAnalyzer.analyzeText(text),
        notify: (message, type) => NotificationManager.show(message, type)
      };
  });