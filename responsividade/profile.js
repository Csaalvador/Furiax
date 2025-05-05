// Adicione este código no final do seu arquivo HTML, antes de </body>

document.addEventListener('DOMContentLoaded', function() {
  // Criar o botão do menu hamburger
  const menuButton = document.createElement('button');
  menuButton.className = 'menu-toggle';
  menuButton.innerHTML = '☰';
  document.body.appendChild(menuButton);
  
  // Criar o backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  document.body.appendChild(backdrop);
  
  // Referência para a sidebar
  const sidebar = document.querySelector('.sidebar');
  
  // Função para abrir o menu
  function openMenu() {
    sidebar.style.left = '0';
    backdrop.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  
  // Função para fechar o menu
  function closeMenu() {
    sidebar.style.left = '-250px';
    backdrop.style.display = 'none';
    document.body.style.overflow = '';
  }
  
  // Eventos de clique
  menuButton.addEventListener('click', function() {
    if (sidebar.style.left === '0px') {
      closeMenu();
    } else {
      openMenu();
    }
  });
  
  backdrop.addEventListener('click', closeMenu);
  
  // Tornar links da sidebar funcionais
  const sidebarLinks = sidebar.querySelectorAll('a');
  sidebarLinks.forEach(link => {
    // Remover qualquer onclick existente
    if (link.getAttribute('onclick')) {
      const onclickContent = link.getAttribute('onclick');
      if (onclickContent.includes('getCorrectPath')) {
        const match = onclickContent.match(/getCorrectPath\(['"]([^'"]+)['"]\)/);
        if (match && match[1]) {
          const pageName = match[1];
          // Usar a função getCorrectPath diretamente para obter o URL correto
          link.href = window.getCorrectPath(pageName);
          link.removeAttribute('onclick');
        }
      }
    }
    
    // Adicionar evento para fechar o menu ao clicar no link
    link.addEventListener('click', function() {
      setTimeout(closeMenu, 100);
    });
  });
  
  // Garantir que botões dentro de links funcionem
  const buttonsInLinks = sidebar.querySelectorAll('a button');
  buttonsInLinks.forEach(button => {
    button.addEventListener('click', function(e) {
      // Propagar o clique para o link pai
      const parentLink = button.closest('a');
      if (parentLink && parentLink.href) {
        e.preventDefault();
        window.location.href = parentLink.href;
      }
    });
  });

  // Ajustar estilos CSS diretamente via JavaScript
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @media screen and (max-width: 991px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: -250px;
        height: 100vh;
        width: 240px;
        z-index: 100;
        transition: left 0.3s ease;
      }
      
      .menu-toggle {
        display: flex;
        position: fixed;
        top: 15px;
        left: 15px;
        width: 40px;
        height: 40px;
        background-color: #1e90ff;
        color: white;
        border: none;
        border-radius: 8px;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        z-index: 1000;
        cursor: pointer;
      }
      
      .sidebar-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 99;
        display: none;
      }
      
      .main-content {
        width: 100%;
        margin-left: 0;
        padding-top: 70px;
      }
    }
  `;
  document.head.appendChild(styleSheet);
});

// Solução para navegação mobile sem abas superiores
document.addEventListener('DOMContentLoaded', function() {
    // Função principal para ajustar as abas em ambiente móvel
    function setupMobileNavigation() {
      // Verifica se estamos em viewport móvel
      if (window.innerWidth <= 991) {
        // 1. Esconde as abas superiores
        hideTopTabs();
        
        // 2. Adiciona navegação móvel na parte inferior
        addMobileTabBar();
        
        // 3. Garante que o conteúdo das abas funcione
        setupTabsContent();
      } else {
        // Em desktop, restaura o comportamento normal
        showTopTabs();
        removeMobileTabBar();
      }
    }
    
    // Função para esconder as abas superiores em dispositivos móveis
    function hideTopTabs() {
      const tabButtons = document.querySelector('.config-tab-buttons');
      if (tabButtons) {
        tabButtons.style.display = 'none';
      }
    }
    
    // Função para restaurar as abas superiores em desktop
    function showTopTabs() {
      const tabButtons = document.querySelector('.config-tab-buttons');
      if (tabButtons) {
        tabButtons.style.display = '';
      }
    }
    
    // Função para adicionar barra de navegação móvel na parte inferior
    function addMobileTabBar() {
      // Verifica se a barra já existe
      if (document.querySelector('.mobile-tabs-bar')) {
        return;
      }
      
      // Cria o elemento da barra
      const mobileBar = document.createElement('div');
      mobileBar.className = 'mobile-tabs-bar';
      
      // Adiciona botões para cada aba
      mobileBar.innerHTML = `
        <button class="mobile-tab-btn active" data-tab="personal">
          <i class="fas fa-user"></i>
          <span>Perfil</span>
        </button>
        <button class="mobile-tab-btn" data-tab="appearance">
          <i class="fas fa-camera"></i>
          <span>Aparência</span>
        </button>
        <button class="mobile-tab-btn" data-tab="stats">
          <i class="fas fa-chart-bar"></i>
          <span>Stats</span>
        </button>
      `;
      
      // Adiciona ao body
      document.body.appendChild(mobileBar);
      
      // Adiciona estilo CSS para a barra
      addMobileTabStyles();
      
      // Adiciona evento de clique aos botões
      const mobileTabBtns = mobileBar.querySelectorAll('.mobile-tab-btn');
      mobileTabBtns.forEach(button => {
        button.addEventListener('click', function() {
          // Remove classe ativa dos outros botões
          mobileTabBtns.forEach(btn => btn.classList.remove('active'));
          
          // Adiciona classe ativa ao botão atual
          this.classList.add('active');
          
          // Obtém o ID da tab
          const tabId = this.getAttribute('data-tab');
          
          // Ativa o conteúdo da aba correspondente
          activateTab(tabId);
          
          // Rola até a seção de configuração
          const configSection = document.querySelector('.config-section');
          if (configSection) {
            configSection.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }
    
    // Função para remover a barra de navegação móvel
    function removeMobileTabBar() {
      const mobileBar = document.querySelector('.mobile-tabs-bar');
      if (mobileBar) {
        mobileBar.remove();
      }
    }
    
    // Função para ativar uma aba específica
    function activateTab(tabId) {
      // Esconde todas as abas
      const allTabs = document.querySelectorAll('.config-tab');
      allTabs.forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
      });
      
      // Mostra a aba selecionada
      const selectedTab = document.getElementById(tabId);
      if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
      }
    }
    
    // Função para garantir que o conteúdo das abas funcione
    function setupTabsContent() {
      // Verifica se há uma aba ativa inicialmente
      const activeTab = document.querySelector('.config-tab.active');
      if (!activeTab) {
        // Se não houver, ativa a aba "personal" por padrão
        activateTab('personal');
      }
    }
    
    // Função para adicionar estilos CSS necessários
    function addMobileTabStyles() {
      // Verifica se os estilos já existem
      if (document.getElementById('mobile-tabs-styles')) {
        return;
      }
      
      // Cria o elemento de estilo
      const styleElement = document.createElement('style');
      styleElement.id = 'mobile-tabs-styles';
      
      // Define os estilos
      styleElement.textContent = `
        /* Estilos para barra de navegação móvel */
        .mobile-tabs-bar {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, #0a0a0a, #181818);
          border-top: 1px solid #333;
          z-index: 1000;
          height: 60px;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.5);
        }
        
        .mobile-tab-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #aaa;
          font-family: 'Orbitron', sans-serif;
          padding: 5px;
          font-size: 0.75rem;
          gap: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .mobile-tab-btn i {
          font-size: 1.2rem;
          color: #777;
          transition: all 0.3s ease;
        }
        
        .mobile-tab-btn.active {
          color: #1e90ff;
        }
        
        .mobile-tab-btn.active i {
          color: #1e90ff;
        }
        
        /* Criar espaço para a barra inferior */
        @media screen and (max-width: 991px) {
          body {
            padding-bottom: 60px;
          }
          
          .main-content {
            padding-bottom: 70px;
          }
          
          /* Garantir que as abas sejam visíveis quando ativas */
          .config-tab {
            display: none;
          }
          
          .config-tab.active {
            display: block;
          }
        }
      `;
      
      // Adiciona ao head
      document.head.appendChild(styleElement);
    }
    
    // Inicializa a navegação móvel
    setupMobileNavigation();
    
    // Atualiza quando a janela é redimensionada
    window.addEventListener('resize', setupMobileNavigation);
  });