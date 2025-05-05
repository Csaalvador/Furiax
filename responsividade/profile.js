/**
 * Script para corrigir o menu hambúrguer escuro e não funcionando
 * Versão simplificada e direta
 */

// Executar assim que a página carregar
window.addEventListener('DOMContentLoaded', function() {
    // Criar botão hambúrguer garantido
    criarBotaoHamburger();
    
    // Configurar eventos do botão
    configurarEventosMenu();
});

/**
 * Cria o botão hambúrguer com estilo visível garantido
 */
function criarBotaoHamburger() {
    // Remover botão antigo se existir
    const botaoAntigo = document.querySelector('.menu-toggle');
    if (botaoAntigo) {
        botaoAntigo.remove();
    }
    
    // Criar novo botão com estilo garantido
    const botao = document.createElement('button');
    botao.className = 'menu-toggle';
    botao.id = 'menuHamburger';
    botao.innerHTML = '<i class="fas fa-bars" style="color: white;"></i>';
    
    // Aplicar estilos inline para garantir visibilidade
    botao.style.display = 'flex';
    botao.style.position = 'fixed';
    botao.style.top = '15px';
    botao.style.left = '15px';
    botao.style.zIndex = '9999';
    botao.style.background = '#1e90ff';
    botao.style.color = 'white';
    botao.style.border = 'none';
    botao.style.borderRadius = '8px';
    botao.style.width = '40px';
    botao.style.height = '40px';
    botao.style.cursor = 'pointer';
    botao.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    botao.style.alignItems = 'center';
    botao.style.justifyContent = 'center';
    botao.style.fontSize = '18px';
    
    // Adicionar ao documento
    document.body.appendChild(botao);
    
    // Criar backdrop do menu se não existir
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        backdrop.style.display = 'none';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.right = '0';
        backdrop.style.bottom = '0';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        backdrop.style.zIndex = '998';
        
        document.body.appendChild(backdrop);
    }
    
    // Esconder botão em desktop
    ajustarVisibilidadeBotao();
    
    // Monitorar mudanças na janela
    window.addEventListener('resize', ajustarVisibilidadeBotao);
}

/**
 * Ajusta visibilidade do botão com base no tamanho da tela
 */
function ajustarVisibilidadeBotao() {
    const botao = document.getElementById('menuHamburger');
    if (botao) {
        botao.style.display = window.innerWidth <= 991 ? 'flex' : 'none';
    }
}

/**
 * Configura eventos para o menu hambúrguer
 */
function configurarEventosMenu() {
    // Selecionar elementos
    const botao = document.getElementById('menuHamburger');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');
    
    if (!botao || !sidebar) return;
    
    // Configurar clique no botão
    botao.addEventListener('click', function(e) {
        // Evitar comportamento padrão
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle da classe active no sidebar
        sidebar.classList.toggle('active');
        
        // Ajustar visibilidade do backdrop
  
        
        // Ajustar posição do sidebar
        sidebar.style.transform = sidebar.classList.contains('active') ? 'translateX(0)' : 'translateX(-100%)';
        
        // Ajustar ícone do botão
        const icon = this.querySelector('i');
        if (icon) {
            if (sidebar.classList.contains('active')) {
                icon.className = 'fas fa-times';
                icon.style.color = 'white';
            } else {
                icon.className = 'fas fa-bars';
                icon.style.color = 'white';
            }
        }
        
        // Log para depuração
        console.log('Menu hambúrguer clicado', sidebar.classList.contains('active'));
    });
    
    // Configurar clique no backdrop
    if (backdrop) {
        backdrop.addEventListener('click', function() {
            // Fechar sidebar
            sidebar.classList.remove('active');
            this.style.display = 'none';
            
            // Reajustar posição
            sidebar.style.transform = 'translateX(-100%)';
            
            // Restaurar ícone
            const icon = botao.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
                icon.style.color = 'white';
            }
        });
    }
    
    // Ajustar cliques em botões do sidebar para fechá-lo em mobile
    const botoesMenu = sidebar.querySelectorAll('button');
    botoesMenu.forEach(btn => {
        btn.addEventListener('click', function() {
            if (window.innerWidth <= 991) {
                sidebar.classList.remove('active');
                if (backdrop) backdrop.style.display = 'none';
                sidebar.style.transform = 'translateX(-100%)';
                
                // Restaurar ícone
                const icon = botao.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                    icon.style.color = 'white';
                }
            }
        });
    });
    
    // Garantir posição e estilo correto do sidebar
    ajustarEstiloSidebar();
}

/**
 * Garante que o sidebar tenha o estilo correto
 */
function ajustarEstiloSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Estilo para o sidebar
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.left = '0';
    sidebar.style.zIndex = '997';
    sidebar.style.height = '100vh';
    sidebar.style.overflowY = 'auto';
    
    // Estilo específico para mobile
    if (window.innerWidth <= 991) {
        sidebar.style.width = '80%';
        sidebar.style.maxWidth = '300px';
        sidebar.style.transform = sidebar.classList.contains('active') ? 'translateX(0)' : 'translateX(-100%)';
        sidebar.style.transition = 'transform 0.3s ease';
    } else {
        // Estilo para desktop
        sidebar.style.width = '240px';
        sidebar.style.transform = 'none';
    }
}