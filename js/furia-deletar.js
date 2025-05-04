/**
 * FURIAX - Função para Apagar Posts com Animação
 * Esta função permite apagar posts no sistema FURIAX Community com uma animação
 * para disfarçar o processo de exclusão e recarrega a página após a operação
 */

// Executar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🗑️ Inicializando função para apagar posts com animação...');
    
    // Adicionar estilos CSS para as animações
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes fadeOutSlide {
            0% {
                opacity: 1;
                transform: translateY(0);
            }
            50% {
                opacity: 0.5;
                transform: translateY(-10px);
            }
            100% {
                opacity: 0;
                transform: translateY(-30px);
                max-height: 0;
                margin: 0;
                padding: 0;
                border: 0;
            }
        }
        
        @keyframes collapseElement {
            0% {
                max-height: 800px;
                opacity: 0;
                margin-bottom: 15px;
            }
            100% {
                max-height: 0;
                opacity: 0;
                margin: 0;
                padding: 0;
                border: 0;
            }
        }
        
        .post-card.deleting {
            animation: fadeOutSlide 0.8s ease forwards, collapseElement 0.3s ease 0.8s forwards;
            overflow: hidden;
        }
        
        .delete-post-btn {
            background-color: rgba(255, 59, 92, 0.1) !important;
            color: #ff3b5c !important;
            position: relative;
            overflow: hidden;
        }
        
        .delete-post-btn:hover {
            background-color: rgba(255, 59, 92, 0.2) !important;
        }
        
        .delete-post-btn .loading-effect {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                rgba(255, 59, 92, 0),
                rgba(255, 59, 92, 0.2),
                rgba(255, 59, 92, 0)
            );
            animation: loadingEffect 1.5s infinite;
        }
        
        @keyframes loadingEffect {
            0% {
                left: -100%;
            }
            100% {
                left: 100%;
            }
        }
        
        .deletion-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            color: white;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.5s ease;
        }
        
        .deletion-overlay.show {
            opacity: 1;
            pointer-events: all;
        }
        
        .deletion-spinner {
            width: 60px;
            height: 60px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #ff3b5c;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 20px;
        }
        
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(styleElement);
    
    // Criar o overlay de exclusão
    const deletionOverlay = document.createElement('div');
    deletionOverlay.className = 'deletion-overlay';
    deletionOverlay.innerHTML = `
        <div class="deletion-spinner"></div>
        <div class="deletion-text">Excluindo post...</div>
    `;
    document.body.appendChild(deletionOverlay);
    
    // Esperar até que o objeto FURIAXCommunity seja carregado
    const checkInterval = setInterval(function() {
        if (window.FURIAXCommunity && window.FURIAXCommunity.PostManager) {
            clearInterval(checkInterval);
            
            // Adicionar função para apagar post ao PostManager
            window.FURIAXCommunity.PostManager.deletePost = function(postId, withEffect = true) {
                if (!postId) return false;
                
                // Converter para número se for string
                const numericPostId = parseInt(postId);
                
                // Verificar se o post existe antes de qualquer animação
                const posts = this.getPosts();
                const postExists = posts.some(post => post.id === numericPostId);
                
                if (!postExists) {
                    console.error(`❌ Post com ID ${postId} não encontrado`);
                    return false;
                }
                
                // Referência ao post no DOM
                const postElement = document.querySelector(`.post-card[data-id="${postId}"]`);
                
                // Se o efeito de animação estiver ativado e o elemento existir no DOM
                if (withEffect && postElement) {
                    // Mostrar overlay de exclusão
                    deletionOverlay.classList.add('show');
                    
                    // Aplicar efeito de exclusão ao post
                    postElement.classList.add('deleting');
                    
                    // Após um tempo para a animação, realmente excluir o post e recarregar
                    setTimeout(() => {
                        // Filtrar para remover o post com o ID especificado
                        const updatedPosts = posts.filter(post => post.id !== numericPostId);
                        
                        // Salvar os posts atualizados
                        const result = this.savePosts(updatedPosts);
                        
                        if (result) {
                            console.log(`✅ Post com ID ${postId} removido com sucesso`);
                            
                            // Após mais um pequeno atraso para dar tempo para o armazenamento
                            setTimeout(() => {
                                // Recarregar a página
                                window.location.reload();
                            }, 500);
                        } else {
                            // Se falhar, esconder o overlay
                            deletionOverlay.classList.remove('show');
                            console.error(`❌ Erro ao salvar posts após remoção do post ${postId}`);
                            
                            // Mostrar notificação de erro se disponível
                            if (window.FURIAXCommunity.NotificationManager) {
                                window.FURIAXCommunity.NotificationManager.show(
                                    'Erro ao excluir post. Tente novamente.',
                                    'error'
                                );
                            }
                        }
                    }, 1200); // Tempo suficiente para a animação completar
                    
                    return true;
                } else {
                    // Processo de exclusão sem animação
                    // Filtrar para remover o post com o ID especificado
                    const updatedPosts = posts.filter(post => post.id !== numericPostId);
                    
                    // Salvar os posts atualizados
                    const result = this.savePosts(updatedPosts);
                    
                    if (result) {
                        console.log(`✅ Post com ID ${postId} removido com sucesso`);
                        
                        // Atualizar a interface se possível
                        if (window.FURIAXCommunity.UIManager) {
                            try {
                                window.FURIAXCommunity.UIManager.renderPosts();
                            } catch (e) {
                                console.error('Erro ao atualizar interface:', e);
                            }
                        }
                        
                        // Mostrar notificação se disponível
                        if (window.FURIAXCommunity.NotificationManager) {
                            window.FURIAXCommunity.NotificationManager.show(
                                'Post excluído com sucesso!',
                                'success'
                            );
                        }
                        
                        return true;
                    } else {
                        console.error(`❌ Erro ao salvar posts após remoção do post ${postId}`);
                        return false;
                    }
                }
            };
            
            // Adicionar função para adicionar botões de exclusão aos posts
            function addDeleteButtonsToPosts() {
                // Selecionar todos os posts
                document.querySelectorAll('.post-card').forEach(postCard => {
                    // Verificar se já tem botão de deletar
                    if (postCard.querySelector('.delete-post-btn')) {
                        return;
                    }
                    
                    // Obter o ID do post
                    const postId = postCard.dataset.id;
                    if (!postId) return;
                    
                    // Criar botão de deletar
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'post-action-btn delete-post-btn';
                    deleteButton.dataset.action = 'deletar';
                    deleteButton.dataset.id = postId;
                    deleteButton.innerHTML = `
                        <div class="loading-effect"></div>
                        <i class="fas fa-trash"></i> Excluir
                    `;
                    
                    // Adicionar evento de clique
                    deleteButton.addEventListener('click', function() {
                        // Confirmar antes de excluir
                        if (confirm('Tem certeza que deseja excluir este post?')) {
                            // Adicionar efeito de carregamento ao botão
                            deleteButton.classList.add('deleting');
                            deleteButton.disabled = true;
                            
                            // Chamar a função de exclusão com efeito
                            window.FURIAXCommunity.PostManager.deletePost(postId, true);
                        }
                    });
                    
                    // Encontrar a área de ações do post
                    const actionsArea = postCard.querySelector('.post-actions-btns');
                    if (actionsArea) {
                        // Adicionar o botão à área de ações
                        actionsArea.appendChild(deleteButton);
                    }
                });
            }
            
            // Adicionar botões de exclusão aos posts existentes
            setTimeout(addDeleteButtonsToPosts, 1000);
            
            // Observar o DOM para adicionar botões a novos posts
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        // Verificar se foram adicionados novos posts
                        const posts = [...mutation.addedNodes].filter(node => 
                            node.nodeType === 1 && node.classList && node.classList.contains('post-card')
                        );
                        
                        if (posts.length > 0) {
                            // Adicionar botões de exclusão aos novos posts
                            setTimeout(addDeleteButtonsToPosts, 100);
                        }
                    }
                });
            });
            
            // Iniciar observação do feed de posts
            const feedContainer = document.querySelector('.feed-column');
            if (feedContainer) {
                observer.observe(feedContainer, {
                    childList: true,
                    subtree: true
                });
            }
            
            console.log('✅ Função para apagar posts com animação inicializada com sucesso!');
        }
    }, 100);
});