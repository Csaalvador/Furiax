document.addEventListener('DOMContentLoaded', function() {
    // Create mobile toggle button if it doesn't exist
    if (!document.querySelector('.mobile-menu-toggle')) {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(mobileToggle);
        
        // Add event listener for sidebar toggle
        mobileToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking outside
    document.addEvenatListener('click', function(event) {
        const sidebar = document.querySelector('.sidebar');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (sidebar && mobileToggle && 
            !sidebar.contains(event.target) && 
            event.target !== mobileToggle && 
            !mobileToggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    });
    
    // Fix for tab functionality on mobile
    const tabs = document.querySelectorAll('.analysis-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.analysis-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const targetContent = document.getElementById(target + '-content');
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Smooth scroll to content on mobile
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        targetContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            }
        });
    });
    
    // Make comment sections responsive
    const commentBtns = document.querySelectorAll('.comment-btn');
    commentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const postCard = this.closest('.post-card');
            const commentsSection = postCard.querySelector('.comments-section');
            
            if (commentsSection) {
                commentsSection.classList.toggle('active');
                
                // Scroll to comments when opened on mobile
                if (commentsSection.classList.contains('active') && window.innerWidth <= 768) {
                    setTimeout(() => {
                        commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            }
        });
    });
    
    // Add touch event handlers for better mobile experience
    if ('ontouchstart' in window) {
        const touchElements = document.querySelectorAll('.post-action-btn, .comment-submit, .attachment-button, .analysis-tab');
        
        touchElements.forEach(el => {
            el.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            el.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
        });
    }
    
    // Handle viewport height issues on mobile
    function setMobileViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setMobileViewportHeight();
    window.addEventListener('resize', setMobileViewportHeight);
    
    // Fix for initial active tab
    const defaultTab = document.querySelector('.analysis-tab');
    if (defaultTab) {
        defaultTab.click();
    }
    
    // Add media query detection for responsive JS behavior
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleMediaQueryChange(e) {
        if (e.matches) {
            // Mobile mode
            document.body.classList.add('mobile-view');
        } else {
            // Desktop mode
            document.body.classList.remove('mobile-view');
            // Reset sidebar state when returning to desktop
            document.querySelector('.sidebar')?.classList.remove('active');
        }
    }
    
    // Run once at initialization
    handleMediaQueryChange(mediaQuery);
    
    // Add listener for changes
    mediaQuery.addEventListener('change', handleMediaQueryChange);
});

// Adicione este script ao final do seu arquivo community.html
document.addEventListener('DOMContentLoaded', function() {
    // Função para garantir que a página carregue no topo
    function scrollToTop() {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0; // Para Safari
      document.documentElement.scrollTop = 0; // Para Chrome, Firefox, IE e Opera
    }
    
    // Executar imediatamente quando a página carrega
    scrollToTop();
    
    // Adicionar um pequeno atraso para garantir que funcione após qualquer outro código de inicialização
    setTimeout(scrollToTop, 100);
    
    // Garantir que a aba "profile" seja ativada por padrão, mas sem rolar a página
    const profileTab = document.querySelector('.analysis-tab[data-tab="profile"]');
    if (profileTab) {
      // Prevenir o comportamento padrão de rolagem ao clicar nas abas
      const allTabs = document.querySelectorAll('.analysis-tab');
      allTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
          // Armazenar a posição de rolagem atual
          const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
          
          // Ativar a aba
          const target = this.getAttribute('data-tab');
          
          // Remover classes ativas de todas as abas e conteúdos
          allTabs.forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.analysis-content').forEach(c => c.classList.remove('active'));
          
          // Adicionar classes ativas à aba clicada e seu conteúdo
          this.classList.add('active');
          const targetContent = document.getElementById(target + '-content');
          if (targetContent) {
            targetContent.classList.add('active');
          }
          
          // Restaurar a posição de rolagem (previne rolagem automática)
          setTimeout(() => {
            window.scrollTo(0, currentScrollPos);
          }, 10);
          
          e.preventDefault();
        });
      });
      
      // Ativar a aba "profile" sem rolar a página
      const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
      profileTab.click();
      setTimeout(() => {
        window.scrollTo(0, currentScrollPos);
      }, 10);
    }
    
    // Corrigir os links do menu para que, ao clicar na comunidade, role para o topo
    const communityLinks = document.querySelectorAll('a[href*="community.html"], a[href*="comunidade.html"]');
    communityLinks.forEach(link => {
      // Se estamos na própria página da comunidade, modificar o comportamento
      if (window.location.pathname.includes('community') || window.location.pathname.includes('comunidade')) {
        link.addEventListener('click', function(e) {
          // Se clicarmos no link da comunidade enquanto já estamos na página da comunidade
          e.preventDefault();
          scrollToTop();
          // Fechar o menu mobile se estiver aberto
          const sidebar = document.querySelector('.sidebar');
          if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
          }
        });
      }
    });
    
    // Sobrescrever o comportamento padrão do comunidade.js para não rolar a página
    if (window.innerWidth <= 768) {
      // Sobrescrever o comportamento das tabs em mobile
      const originalTabFunction = document.querySelectorAll('.analysis-tab')[0]?.onclick;
      document.querySelectorAll('.analysis-tab').forEach(tab => {
        tab.onclick = function(e) {
          const target = this.getAttribute('data-tab');
          
          // Remover classes ativas
          document.querySelectorAll('.analysis-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.analysis-content').forEach(c => c.classList.remove('active'));
          
          // Adicionar classes ativas
          this.classList.add('active');
          const targetContent = document.getElementById(target + '-content');
          if (targetContent) {
            targetContent.classList.add('active');
            // NÃO fazer o scroll automático
          }
        };
      });
    }
  });
