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
