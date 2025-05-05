// Script para corrigir a funcionalidade de curtir posts
document.addEventListener('DOMContentLoaded', function() {
    // Função para inicializar os botões de curtir
    function initializeLikeButtons() {
      // Seleciona TODOS os botões de curtir (tanto os que têm o texto "Curtir" quanto os "Curtido")
      const allLikeButtons = document.querySelectorAll('.post-action-btn:first-child');
      
      // Remover quaisquer event listeners anteriores (para evitar duplicação)
      allLikeButtons.forEach(button => {
        // Cria uma cópia do botão para remover os event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
      });
      
      // Adiciona eventos para os botões novos
      document.querySelectorAll('.post-action-btn:first-child').forEach(button => {
        button.addEventListener('click', handleLikeButton);
      });
    }
    
    // Função para lidar com o clique no botão de curtir
    function handleLikeButton(event) {
      // Evita a propagação do evento
      event.preventDefault();
      event.stopPropagation();
      
      // Obtém o botão clicado
      const button = event.currentTarget;
      
      // Encontra o post-card pai
      const postCard = button.closest('.post-card');
      if (!postCard) return;
      
      // Encontra o contador de curtidas
      const likeCounter = postCard.querySelector('.post-stat:first-child');
      if (!likeCounter) return;
      
      // Obtém o número atual de curtidas
      const counterText = likeCounter.textContent;
      const currentLikes = parseInt(counterText.replace(/[^\d]/g, '')) || 0;
      
      // Verifica se o botão já está curtido
      const isLiked = button.classList.contains('liked') || button.innerHTML.includes('Curtido');
      
      if (isLiked) {
        // Já está curtido, vamos descurtir
        button.classList.remove('liked');
        button.innerHTML = '<i class="far fa-heart"></i> Curtir';
        
        // Atualiza o contador (diminui 1)
        const newCount = Math.max(0, currentLikes - 1); // Impede números negativos
        likeCounter.innerHTML = `<i class="fas fa-heart"></i> ${newCount}`;
      } else {
        // Não está curtido, vamos curtir
        button.classList.add('liked');
        button.innerHTML = '<i class="fas fa-heart"></i> Curtido';
        
        // Atualiza o contador (aumenta 1)
        likeCounter.innerHTML = `<i class="fas fa-heart"></i> ${currentLikes + 1}`;
        
        // Adiciona efeito visual
        addLikeEffect(postCard);
      }
      
      // Adiciona efeito de pulsação ao botão
      button.classList.add('pulse');
      setTimeout(() => {
        button.classList.remove('pulse');
      }, 300);
      
      return false; // Previne comportamentos padrão
    }
    
    // Função para adicionar efeito visual ao curtir
    function addLikeEffect(postCard) {
      const heartEffect = document.createElement('div');
      heartEffect.className = 'heart-effect';
      heartEffect.innerHTML = '<i class="fas fa-heart"></i>';
      postCard.appendChild(heartEffect);
      
      // Remove o efeito após a animação
      setTimeout(() => {
        if (heartEffect && heartEffect.parentNode) {
          heartEffect.parentNode.removeChild(heartEffect);
        }
      }, 1000);
    }
    
    // Adiciona estilos CSS necessários
    function addStyles() {
      // Verifica se os estilos já foram adicionados
      if (document.getElementById('like-button-styles')) return;
      
      const styleElement = document.createElement('style');
      styleElement.id = 'like-button-styles';
      styleElement.textContent = `
        /* Estilo para o botão curtido */
        .post-action-btn.liked,
        .post-action-btn.liked i {
          color: #ff3b5c !important;
          font-weight: bold;
        }
        
        /* Animação de pulsação */
        .post-action-btn.pulse {
          animation: pulse-animation 0.3s ease;
        }
        
        @keyframes pulse-animation {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        /* Efeito de coração ao curtir */
        .heart-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ff3b5c;
          font-size: 50px;
          opacity: 0;
          pointer-events: none;
          z-index: 9999;
          animation: heart-animation 1s ease forwards;
        }
        
        @keyframes heart-animation {
          0% { 
            transform: translate(-50%, -50%) scale(0);
            opacity: 0; 
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.8; 
          }
          100% { 
            transform: translate(-50%, -50%) scale(2);
            opacity: 0; 
          }
        }
        
        /* Melhora a aparência dos botões de interação */
        .post-action-btn {
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .post-action-btn:hover {
          background-color: rgba(30, 144, 255, 0.1);
          border-radius: 5px;
        }
        
        .post-action-btn:active {
          transform: scale(0.95);
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    // Inicializa o componente
    function init() {
      // Adicionar estilos
      addStyles();
      
      // Inicializar botões de curtir
      initializeLikeButtons();
      
      // Monitorar novas adições ao DOM (para posts dinâmicos)
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            // Verifica se há novos posts adicionados
            mutation.addedNodes.forEach(function(node) {
              if (node.classList && node.classList.contains('post-card')) {
                // Novo post adicionado, inicializa seus botões
                initializeLikeButtons();
              }
            });
          }
        });
      });
      
      // Iniciar observação
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Log para verificar inicialização
      console.log('Sistema de curtidas inicializado com sucesso!');
    }
    
    // Inicializa o sistema
    init();
    
    // Expõe a função para reinicialização
    window.reinitializeLikeButtons = initializeLikeButtons;
  });