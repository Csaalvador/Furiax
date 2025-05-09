/**
 * FURIAX Reload Animation Effect - Versão Simplificada
 * Versão: 1.1.0
 * 
 * Uma versão simplificada para garantir compatibilidade com o sistema existente
 */

// Esta função deve ser chamada diretamente após a criação de um post
function ativarFuriaxReloadEfeito() {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'furiax-reload-overlay';
    
    // Criar spinner
    const spinner = document.createElement('div');
    spinner.className = 'furiax-reload-spinner';
    
    // Criar mensagem
    const message = document.createElement('div');
    message.className = 'furiax-reload-message';
    message.textContent = 'Publicando post...';
    
    // Organizar elementos
    overlay.appendChild(spinner);
    overlay.appendChild(message);
    document.body.appendChild(overlay);
    
    // Adicionar estilos
    const style = document.createElement('style');
    style.textContent = `
        .furiax-reload-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .furiax-reload-spinner {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 5px solid rgba(30, 144, 255, 0.3);
            border-top-color: #1e90ff;
            animation: furiax-spinner-rotate 1s linear infinite;
            margin-bottom: 20px;
        }
        
        .furiax-reload-message {
            color: white;
            font-family: 'Exo 2', sans-serif;
            font-size: 24px;
            text-align: center;
            max-width: 80%;
            animation: furiax-message-pulse 1.5s infinite ease-in-out;
        }
        
        @keyframes furiax-spinner-rotate {
            to { transform: rotate(360deg); }
        }
        
        @keyframes furiax-message-pulse {
            0% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
            100% { opacity: 0.6; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Mudar a mensagem algumas vezes antes de recarregar
    const mensagens = [
        "Analisando sentimento...",
        "Processando conteúdo...",
        "Finalizando publicação..."
    ];
    
    let contador = 0;
    const intervalo = setInterval(() => {
        if (contador >= mensagens.length) {
            clearInterval(intervalo);
            setTimeout(() => {
                location.reload();
            }, 500);
            return;
        }
        
        message.textContent = mensagens[contador];
        contador++;
    }, 800);
}

// Adicionar ao botão de post
document.addEventListener('DOMContentLoaded', function() {
    const botaoPost = document.querySelector('#analyzePostBtn');
    
    if (botaoPost) {
        // Salvar função original se existir
        const clickOriginal = botaoPost.onclick;
        
        botaoPost.onclick = function(e) {
            // Verificar se há texto
            const postInput = document.querySelector('.post-input');
            if (!postInput || !postInput.value.trim()) {
                return; // Deixar o comportamento padrão lidar com campo vazio
            }
            
            // Se houver função original, chamá-la primeiro
            if (typeof clickOriginal === 'function') {
                clickOriginal.call(this, e);
            }
            
            // Tentar criar post diretamente se possível
            if (window.FURIAXCommunity && window.FURIAXCommunity.PostManager) {
                try {
                    window.FURIAXCommunity.PostManager.createPost(postInput.value.trim());
                    
                    // Limpar campo após criação bem-sucedida
                    postInput.value = '';
                } catch (err) {
                    console.error('Erro ao criar post:', err);
                }
            }
            
            // Ativar efeito e recarregar
            setTimeout(() => {
                ativarFuriaxReloadEfeito();
            }, 100);
            
            // Impedir comportamento padrão apenas após o processamento
            e.preventDefault();
            return false;
        };
    }
});