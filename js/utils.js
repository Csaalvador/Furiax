/**
 * FURIAX Utilidades - Biblioteca de funções utilitárias
 * Este arquivo contém funções e configurações básicas utilizadas por todo o sistema
 */

// Constantes e configurações globais
const CONFIG = {
    STORAGE_KEYS: {
      POSTS: 'furiax_posts',
      SENTIMENT: 'furiax_sentiment',
      USER_DATA: 'furiax_user_data',
      ENGAGEMENT: 'furiax_engagement',
      TAGS: 'furiax_tags',
      CURRENT_USER: 'furiax_current_user'
    },
    SENTIMENT: {
      POSITIVE_THRESHOLD: 0.3,
      NEGATIVE_THRESHOLD: -0.3,
      VERY_POSITIVE_THRESHOLD: 0.7,
      VERY_NEGATIVE_THRESHOLD: -0.7
    },
    ANIMATIONS: {
      DURATION: 300,
      EASING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    DEFAULTS: {
      USERNAME: 'você',
      AVATAR: 'FP',
      SENTIMENT: {
        overall: 0.75,
        postsAnalyzed: 1243,
        trend: 0.12
      }
    }
  };
  
  /**
   * Gerenciador de armazenamento - Permite salvar e recuperar dados do localStorage
   */
  class StorageManager {
    /**
     * Obtém dados do localStorage
     * @param {string} key - Chave para buscar
     * @param {any} defaultValue - Valor padrão caso não exista
     * @returns {any} - Dados armazenados ou valor padrão
     */
    static get(key, defaultValue = null) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch (error) {
        console.error(`Erro ao carregar dados (${key}):`, error);
        return defaultValue;
      }
    }
  
    /**
     * Salva dados no localStorage
     * @param {string} key - Chave para salvar
     * @param {any} value - Valor a ser salvo
     * @returns {boolean} - Sucesso da operação
     */
    static set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error(`Erro ao salvar dados (${key}):`, error);
        
        if (error.name === 'QuotaExceededError') {
          NotificationManager.show('Armazenamento excedido. Alguns dados podem não ser salvos.', 'error');
        }
        
        return false;
      }
    }
  
    /**
     * Remove dados do localStorage
     * @param {string} key - Chave para remover
     * @returns {boolean} - Sucesso da operação
     */
    static remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error(`Erro ao remover dados (${key}):`, error);
        return false;
      }
    }
  
    /**
     * Limpa todos os dados do localStorage
     * @returns {boolean} - Sucesso da operação
     */
    static clear() {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('Erro ao limpar armazenamento:', error);
        return false;
      }
    }
  }
  
  /**
   * Gerenciador de notificações - Exibe notificações na interface
   */
  class NotificationManager {
    /**
     * Exibe uma notificação na tela
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo de notificação (info, success, error, warning)
     * @param {number} duration - Duração em ms
     */
    static show(message, type = 'info', duration = 3000) {
      // Verificar se o elemento de notificação existe
      let notification = document.getElementById('notification');
      
      if (!notification) {
        // Criar elemento
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '10px';
        notification.style.color = 'white';
        notification.style.zIndex = '9999';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        notification.style.transition = `all ${CONFIG.ANIMATIONS.DURATION}ms ${CONFIG.ANIMATIONS.EASING}`;
        
        document.body.appendChild(notification);
      }
      
      // Ajustar estilo com base no tipo
      switch (type) {
        case 'success':
          notification.style.background = 'rgba(0, 204, 102, 0.9)';
          notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
          break;
        case 'error':
          notification.style.background = 'rgba(255, 59, 92, 0.9)';
          notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
          break;
        case 'warning':
          notification.style.background = 'rgba(255, 170, 0, 0.9)';
          notification.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
          break;
        default:
          notification.style.background = 'rgba(30, 144, 255, 0.9)';
          notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
      }
      
      // Mostrar notificação
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      }, 10);
      
      // Esconder após o tempo definido
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        // Remover elemento após animação
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, CONFIG.ANIMATIONS.DURATION);
      }, duration);
    }
  
    /**
     * Exibe feedback sobre análise de sentimento
     * @param {number} sentiment - Valor do sentimento (-1 a 1)
     */
    static showSentimentFeedback(sentiment) {
      // Verificar se o elemento existe
      const notificationEl = document.getElementById('sentimentNotification');
      if (!notificationEl) return;
      
      // Personalizar mensagem com base no score
      let message = 'Análise de sentimento concluída!';
      let icon = 'fas fa-chart-line';
      let color = '#1e90ff';
      
      if (sentiment >= CONFIG.SENTIMENT.VERY_POSITIVE_THRESHOLD) {
        message = 'Post muito positivo detectado!';
        icon = 'fas fa-grin-stars';
        color = '#00cc66';
      } else if (sentiment >= CONFIG.SENTIMENT.POSITIVE_THRESHOLD) {
        message = 'Sentimento positivo detectado!';
        icon = 'fas fa-smile';
        color = '#1e90ff';
      } else if (sentiment <= CONFIG.SENTIMENT.VERY_NEGATIVE_THRESHOLD) {
        message = 'Post muito negativo detectado!';
        icon = 'fas fa-angry';
        color = '#ff3b5c';
      } else if (sentiment <= CONFIG.SENTIMENT.NEGATIVE_THRESHOLD) {
        message = 'Sentimento negativo detectado!';
        icon = 'fas fa-frown';
        color = '#ff9800';
      }
      
      // Atualizar notificação
      notificationEl.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
      notificationEl.style.background = color;
      
      // Mostrar notificação
      notificationEl.classList.add('show');
      
      // Esconder após 3 segundos
      setTimeout(() => {
        notificationEl.classList.remove('show');
      }, 3000);
    }
  }
  
  /**
   * Funções utilitárias diversas
   */
  const Utils = {
    /**
     * Obtém o nome de usuário atual
     * @returns {string} - Nome do usuário logado ou padrão
     */
    getCurrentUsername() {
      try {
        const userData = StorageManager.get(CONFIG.STORAGE_KEYS.CURRENT_USER);
        if (!userData) return CONFIG.DEFAULTS.USERNAME;
        
        return userData.username || CONFIG.DEFAULTS.USERNAME;
      } catch (error) {
        console.error('Erro ao buscar nome de usuário atual:', error);
        return CONFIG.DEFAULTS.USERNAME;
      }
    },
    
    /**
     * Gera iniciais a partir de um nome
     * @param {string} name - Nome completo
     * @returns {string} - Iniciais (até 2 caracteres)
     */
    getInitials(name) {
      if (!name || typeof name !== 'string') return CONFIG.DEFAULTS.AVATAR;
      
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },
    
    /**
     * Formata um timestamp para tempo relativo (ex: "há 5 minutos")
     * @param {string|Date} timestamp - Data a ser formatada
     * @returns {string} - Texto formatado
     */
    getRelativeTime(timestamp) {
      if (!timestamp) return 'agora';
      
      const now = new Date();
      const time = timestamp instanceof Date ? timestamp : new Date(timestamp);
      const diff = now - time;
      
      if (diff < 60000) return 'agora mesmo';
      if (diff < 3600000) return `Há ${Math.floor(diff / 60000)} minutos`;
      if (diff < 86400000) return `Há ${Math.floor(diff / 3600000)} horas`;
      if (diff < 2592000000) return `Há ${Math.floor(diff / 86400000)} dias`;
      if (diff < 31536000000) return `Há ${Math.floor(diff / 2592000000)} meses`;
      return `Há ${Math.floor(diff / 31536000000)} anos`;
    },
    
    /**
     * Detecta e formata hashtags em um texto
     * @param {string} text - Texto a ser processado
     * @returns {string} - Texto com hashtags formatadas como links
     */
    formatHashtags(text) {
      if (!text) return '';
      return text.replace(/(#[a-záàâãéèêíïóôõöúçñ\d]+)/gi, '<span class="hashtag">$1</span>');
    }
  };
  
  // Expor para uso global
  window.CONFIG = CONFIG;
  window.StorageManager = StorageManager;
  window.NotificationManager = NotificationManager;
  window.Utils = Utils;