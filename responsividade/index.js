// FURIAX - Script responsivo avançado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos em uma visualização mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // ===== CRIAR ELEMENTOS DE TRANSIÇÃO E UI MOBILE =====
      // Adicionar animação de carregamento
      createLoadingTransition();
      
      // Criar barra superior mobile
      createMobileTopBar();
      
      // Adicionar overlay do sidebar
      createSidebarOverlay();
      
      // Adicionar botão de menu
      
      // Adicionar botão de iniciar fixo
      createStartButton();
      
      // Criar indicador "Pull to refresh"
      createPullToRefresh();
      
      // ===== SUBSTITUIR ELEMENTOS PARA MOBILE =====
      // Substituir vídeo por explicações em cards
      createExplanationCards();
      
      // Substituir cards de nível por jornada evolutiva
      createEvolveJourney();
      
      // ===== CONFIGURAR COMPORTAMENTOS MOBILE =====
      // Configurar menu lateral
      setupMobileMenu();
      
      // Configurar detecção de "pull to refresh"
      setupPullToRefresh();
      
      // Iniciar animações após carregamento
      setTimeout(pageLoaded, 2500);
    }
  });
  
  // ===== FUNÇÕES DE CRIAÇÃO DE ELEMENTOS =====
  
  // Criar animação de carregamento
  function createLoadingTransition() {
    const loadingTransition = document.createElement('div');
    loadingTransition.className = 'page-transition';
    
    // Logo animada
    const logoImg = document.createElement('img');
    logoImg.src = './img/logo/logoFuriax.png';
    logoImg.alt = 'FURIAX';
    logoImg.className = 'loading-logo';
    
    // Barra de progresso
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'loading-bar-container';
    
    const loadingBar = document.createElement('div');
    loadingBar.className = 'loading-bar';
    
    loadingContainer.appendChild(loadingBar);
    loadingTransition.appendChild(logoImg);
    loadingTransition.appendChild(loadingContainer);
    
    document.body.appendChild(loadingTransition);
  }
  
  // Criar barra superior mobile
  function createMobileTopBar() {
    const topBar = document.createElement('div');
    topBar.className = 'mobile-top-bar';
    
    const logoImg = document.createElement('img');
    logoImg.src = './img/logo/logoFuriax.png';
    logoImg.alt = 'FURIAX';
    logoImg.className = 'mobile-logo';
    
    topBar.appendChild(logoImg);
    document.body.appendChild(topBar);
  }
  
  // Criar overlay do sidebar
  function createSidebarOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }
  
  // Criar botão de menu
  function createMobileMenuButton() {
    const menuBtn = document.createElement('button');
    menuBtn.className = '';
    menuBtn.innerHTML = '';
    document.body.appendChild(menuBtn);
  }
  
  // Criar botão de iniciar fixo
  function createStartButton() {
    const startBtn = document.createElement('a');
    startBtn.href = './pages/login.html';
    startBtn.className = 'mobile-start-button';
    startBtn.innerHTML = '<i class="fas fa-play-circle"></i> Começar Agora';
    
    startBtn.addEventListener('click', function(e) {
      // Adicionar efeito visual ao clicar
      this.style.transform = 'translateX(-50%) scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'translateX(-50%)';
      }, 150);
    });
    
    document.body.appendChild(startBtn);
  }
  
  // Criar indicador "Pull to refresh"
  function createPullToRefresh() {
    const pullIndicator = document.createElement('div');
    pullIndicator.className = 'pull-to-refresh';
    pullIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Puxe para atualizar';
    document.body.appendChild(pullIndicator);
  }
  
  // Criar cards de explicação
  function createExplanationCards() {
    const explanations = [
      {
        icon: 'fa-bolt',
        title: 'O que é o FURIAX?',
        content: 'FURIAX é a plataforma definitiva que conecta fãs e transforma emoções em conquistas épicas. Uma experiência gamificada para os verdadeiros fãs da FURIA.'
      },
      {
        icon: 'fa-lightbulb',
        title: 'Principais Recursos',
        content: 'Chatbot com IA, feed personalizado, ranking de fãs, sistema de conquistas, missões diárias e experiências gamificadas para transformar sua paixão em reconhecimento.'
      },
      {
        icon: 'fa-map-signs',
        title: 'Como Funciona',
        content: 'Interaja com o bot, participe dos desafios, acumule XP e desbloqueie conquistas lendárias. A cada interação você sobe de nível e se aproxima do status de lenda.'
      },
      {
        icon: 'fa-star',
        title: 'Destaques',
        content: 'Veja os fãs mais engajados, os momentos mais emocionantes e as recompensas da semana. Tenha seu nome entre os mais dedicados fãs da FURIA.'
      }
    ];
    
    const container = document.createElement('div');
    container.className = 'explanation-cards';
    
    explanations.forEach(item => {
      const card = document.createElement('div');
      card.className = 'explanation-card';
      card.innerHTML = `
        <div class="explanation-header">
          <div class="explanation-icon">
            <i class="fas ${item.icon}"></i>
          </div>
          <div class="explanation-title">${item.title}</div>
          <div class="explanation-toggle">
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
        <div class="explanation-content">
          ${item.content}
        </div>
      `;
      
      container.appendChild(card);
      
      // Adicionar evento de clique
      card.querySelector('.explanation-header').addEventListener('click', function() {
        // Fechar todos os outros cards
        document.querySelectorAll('.explanation-card').forEach(c => {
          if (c !== card) c.classList.remove('active');
        });
        
        // Abrir/fechar este card
        card.classList.toggle('active');
        
        // Efeito de vibração no ícone
        const icon = card.querySelector('.explanation-icon');
        icon.style.transform = 'scale(1.2) rotate(10deg)';
        setTimeout(() => {
          icon.style.transform = '';
        }, 300);
      });
    });
    
    // Inserir após o progresso do vídeo
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
      videoContainer.style.display = 'none';
      videoContainer.parentNode.insertBefore(container, videoContainer.nextSibling);
      
      // Abrir o primeiro card automaticamente após um delay
      setTimeout(() => {
        container.querySelector('.explanation-card').classList.add('active');
      }, 3000);
    }
  }
  
  // Criar jornada de evolução
  function createEvolveJourney() {
    // Remover a seção de níveis existente
    const oldLevelsSection = document.querySelector('.levels-section');
    if (oldLevelsSection) {
      oldLevelsSection.remove();
    }
    
    // Criar nova seção de jornada
    const journeySection = document.createElement('div');
    journeySection.className = 'evolve-journey';
    journeySection.innerHTML = `
      <h3 class="evolve-title">
        <i class="fas fa-rocket"></i> Evolua sua Jornada
      </h3>
      
<div class="journey-steps">
      <div class="journey-step" data-step="1">
        <div class="step-icon step-active">
          <i class="fas fa-seedling"></i>
        </div>
        <div class="step-label">Novato</div>
      </div>
      
      <div class="journey-step" data-step="2">
        <div class="step-icon">
          <i class="fas fa-fire"></i>
        </div>
        <div class="step-label">Furioso</div>
      </div>
      
      <div class="journey-step" data-step="3">
        <div class="step-icon">
          <i class="fas fa-crown"></i>
        </div>
        <div class="step-label">Elite</div>
      </div>
      
      <div class="journey-step" data-step="4">
        <div class="step-icon">
          <i class="fas fa-dragon"></i>
        </div>
        <div class="step-label">Lenda</div>
      </div>
    </div>
    
    <div class="journey-detail active" id="step-detail-1">
      <div class="detail-title">
        <i class="fas fa-seedling"></i> Nível Novato
      </div>
      <div class="detail-text">
        Primeiros passos no universo FURIAX, descubra as mecânicas básicas e comece sua jornada como um verdadeiro fã da FURIA.
      </div>
    </div>
    
    <div class="journey-detail" id="step-detail-2">
      <div class="detail-title">
        <i class="fas fa-fire"></i> Nível Furioso
      </div>
      <div class="detail-text">
        Domine os sistemas do FURIAX e participe da comunidade. Acumule XP completando desafios e aumente seu reconhecimento.
      </div>
    </div>
    
    <div class="journey-detail" id="step-detail-3">
      <div class="detail-title">
        <i class="fas fa-crown"></i> Nível Elite
      </div>
      <div class="detail-text">
        Torne-se referência na comunidade FURIAX, desbloqueie áreas exclusivas e tenha acesso a conteúdos especiais reservados para membros elite.
      </div>
    </div>
    
    <div class="journey-detail" id="step-detail-4">
      <div class="detail-title">
        <i class="fas fa-dragon"></i> Nível Lenda
      </div>
      <div class="detail-text">
        O auge da experiência FURIAX com benefícios exclusivos. Entre para o hall da fama e seja reconhecido como uma verdadeira lenda FURIA.
      </div>
    </div>
  `;
  
  // Adicionar após os cards de explicação
  const explanationCards = document.querySelector('.explanation-cards');
  if (explanationCards) {
    explanationCards.parentNode.insertBefore(journeySection, explanationCards.nextSibling);
  } else {
    // Caso os cards não existam, adicionar após o container de vídeo
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
      videoContainer.parentNode.insertBefore(journeySection, videoContainer.nextSibling);
    } else {
      // Caso último recurso, adicionar ao main content
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.appendChild(journeySection);
      }
    }
  }
  
  // Adicionar eventos de clique aos passos
  setupJourneySteps();
}

// ===== FUNÇÕES DE CONFIGURAÇÃO =====

// Configurar menu mobile
function setupMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (!menuBtn || !sidebar || !overlay) return;
  
  // Função para alternar o menu
  function toggleMenu() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Alternar ícone
    if (sidebar.classList.contains('active')) {
      menuBtn.innerHTML = '<i class="fas fa-times"></i>';
    } else {
      menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
  }
  
  // Eventos de clique
  menuBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);
  
  // Configurar cliques nos botões do sidebar
  const sidebarButtons = sidebar.querySelectorAll('button');
  sidebarButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      // Fechar o menu ao clicar
      toggleMenu();
      
      // Abrir o card correspondente
      setTimeout(() => {
        const cards = document.querySelectorAll('.explanation-card');
        if (cards[index]) {
          // Fechar todos os cards
          cards.forEach(card => card.classList.remove('active'));
          
          // Abrir o card clicado
          cards[index].classList.add('active');
          
          // Rolar até o card
          cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    });
  });
}

// Configurar passos da jornada
function setupJourneySteps() {
  const journeySteps = document.querySelectorAll('.journey-step');
  const journeyDetails = document.querySelectorAll('.journey-detail');
  
  if (!journeySteps.length || !journeyDetails.length) return;
  
  // Adicionar eventos de clique aos passos
  journeySteps.forEach(step => {
    step.addEventListener('click', function() {
      const stepNum = this.getAttribute('data-step');
      
      // Resetar todos os passos e detalhes
      journeySteps.forEach(s => s.querySelector('.step-icon').classList.remove('step-active'));
      journeyDetails.forEach(d => d.classList.remove('active'));
      
      // Ativar o passo clicado
      this.querySelector('.step-icon').classList.add('step-active');
      document.getElementById(`step-detail-${stepNum}`).classList.add('active');
      
      // Efeito de brilho ao selecionar
      const icon = this.querySelector('.step-icon');
      icon.style.transform = 'scale(1.2)';
      setTimeout(() => {
        icon.style.transform = '';
      }, 300);
    });
  });
  
  // Auto-rotação dos níveis a cada 5 segundos
  let currentStep = 1;
  const autoRotate = setInterval(() => {
    currentStep = currentStep % 4 + 1;
    
    // Resetar todos os passos e detalhes
    journeySteps.forEach(s => s.querySelector('.step-icon').classList.remove('step-active'));
    journeyDetails.forEach(d => d.classList.remove('active'));
    
    // Ativar o próximo passo
    const nextStep = document.querySelector(`.journey-step[data-step="${currentStep}"]`);
    if (nextStep) {
      nextStep.querySelector('.step-icon').classList.add('step-active');
      document.getElementById(`step-detail-${currentStep}`).classList.add('active');
    }
  }, 5000);
  
  // Pausar a rotação automática quando o mouse estiver sobre a seção
  const journeySection = document.querySelector('.evolve-journey');
  if (journeySection) {
    journeySection.addEventListener('mouseenter', () => {
      clearInterval(autoRotate);
    });
    
    // Quando o mouse sair, reiniciar a rotação
    journeySection.addEventListener('mouseleave', () => {
      currentStep = currentStep % 4 + 1;
      autoRotate = setInterval(() => {
        currentStep = currentStep % 4 + 1;
        
        // Resetar todos os passos e detalhes
        journeySteps.forEach(s => s.querySelector('.step-icon').classList.remove('step-active'));
        journeyDetails.forEach(d => d.classList.remove('active'));
        
        // Ativar o próximo passo
        const nextStep = document.querySelector(`.journey-step[data-step="${currentStep}"]`);
        if (nextStep) {
          nextStep.querySelector('.step-icon').classList.add('step-active');
          document.getElementById(`step-detail-${currentStep}`).classList.add('active');
        }
      }, 5000);
    });
  }
}

// Configurar detecção de "pull to refresh"
function setupPullToRefresh() {
  let touchStartY = 0;
  let touchEndY = 0;
  const minSwipeDistance = 80;
  const pullIndicator = document.querySelector('.pull-to-refresh');
  
  if (!pullIndicator) return;
  
  document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  document.addEventListener('touchmove', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    
    // Se estiver no topo da página e puxando para baixo
    if (window.scrollY <= 0 && touchEndY > touchStartY) {
      const pullDistance = touchEndY - touchStartY;
      
      if (pullDistance > minSwipeDistance / 2) {
        pullIndicator.classList.add('visible');
      } else {
        pullIndicator.classList.remove('visible');
      }
    }
  }, { passive: true });
  
  document.addEventListener('touchend', function(e) {
    // Verificar se é um pull-to-refresh
    const swipeDistance = touchEndY - touchStartY;
    
    if (window.scrollY <= 0 && swipeDistance > minSwipeDistance) {
      // Simular atualização
      pullIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizando...';
      
      setTimeout(() => {
        pullIndicator.innerHTML = '<i class="fas fa-check-circle"></i> Atualizado!';
        
        setTimeout(() => {
          pullIndicator.classList.remove('visible');
          
          // Resetar para o texto original
          setTimeout(() => {
            pullIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Puxe para atualizar';
          }, 500);
        }, 1500);
      }, 1500);
    } else {
      pullIndicator.classList.remove('visible');
    }
  }, { passive: true });
}

// Animar página após carregamento
function pageLoaded() {
  const pageTransition = document.querySelector('.page-transition');
  if (pageTransition) {
    pageTransition.classList.add('loaded');
    
    // Remover após a animação terminar para não interferir com os clicks
    setTimeout(() => {
      pageTransition.remove();
    }, 1000);
  }
}

// ===== UTILITÁRIOS =====

// Criar animação de digitação para textos
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Função para detectar suporte a haptic feedback
function hasHapticFeedback() {
  return 'vibrate' in navigator;
}

// Adicionar feedback háptico leve
function lightHapticFeedback() {
  if (hasHapticFeedback()) {
    navigator.vibrate(10);
  }
}

// Adicionar feedback háptico médio
function mediumHapticFeedback() {
  if (hasHapticFeedback()) {
    navigator.vibrate([15, 10, 15]);
  }
}

// Adicionar feedback háptico forte
function heavyHapticFeedback() {
  if (hasHapticFeedback()) {
    navigator.vibrate([20, 20, 40]);
  }
}