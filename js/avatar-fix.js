/**
 * FURIAX Avatar Fix - Script para corrigir a exibição de avatares nos posts
 * Versão: 1.0.0
 * 
 * Este script resolve o problema de sincronização de avatares nos posts da comunidade
 * Ele garante que a foto de perfil do usuário seja corretamente exibida em cada post criado
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🖼️ Inicializando correção de avatares FURIAX...');
    
    // Função para obter dados de perfil do localStorage de forma confiável
    function getUserProfile() {
        // Tentar obter do sistema multi-perfil primeiro (se disponível)
        if (window.FURIAXCommunity && window.FURIAXCommunity.MultiProfileManager) {
            const profileData = window.FURIAXCommunity.MultiProfileManager.getActiveProfileData();
            if (profileData) return profileData;
        }
        
        // Tentar obter do ProfileManager
        if (window.FURIAXCommunity && window.FURIAXCommunity.ProfileManager) {
            const profileData = window.FURIAXCommunity.ProfileManager.getProfileData();
            if (profileData) return profileData;
        }
        
        // Tentar obter diretamente do localStorage
        try {
            const profileString = localStorage.getItem('furiaxProfile');
            if (profileString) {
                return JSON.parse(profileString);
            }
        } catch (e) {
            console.error('Erro ao carregar perfil do localStorage:', e);
        }
        
        // Dados padrão se nada for encontrado
        return {
            username: 'FuriaX_User',
            avatar: '../img/logo/logoFuriax.png',
            title: 'Furioso Novato'
        };
    }
    
    // Função para sincronizar usuário atual com o elemento sidebar
    function syncSidebarProfile() {
        const profile = getUserProfile();
        
        // Atualizar nome de usuário na sidebar
        const usernameElement = document.getElementById('sidebarUsername');
        if (usernameElement) {
            usernameElement.textContent = profile.username;
        }
        
        // Atualizar título/role na sidebar
        const titleElement = document.getElementById('sidebarTitle');
        if (titleElement) {
            titleElement.textContent = profile.title;
        }
        
        // Atualizar avatar na sidebar
     
        
        console.log('✅ Perfil na sidebar atualizado');
    }
    
    // Função para gerar HTML de avatar com fallback
    function getAvatarHTML(avatarUrl) {
        if (!avatarUrl) avatarUrl = '../img/logo/logoFuriax.png';
        
      
    }
    
    // Função principal para aplicar avatares nos posts
    function applyAvatarsToAllPosts() {
        const profile = getUserProfile();
        console.log('🔍 Aplicando avatar a todos os posts do usuário:', profile.username);
        
        // Verificar todos os posts
        const allPosts = document.querySelectorAll('.post-card');
        
        allPosts.forEach(post => {
            const usernameElement = post.querySelector('.post-user-name');
            
            // Verificar se é um post do usuário atual
            if (usernameElement && profile.username === usernameElement.textContent.trim()) {
                const avatarContainer = post.querySelector('.post-avatar');
                
                if (avatarContainer) {
                    // Substituir o conteúdo do avatar pelo HTML correto
                    avatarContainer.innerHTML = getAvatarHTML(profile.avatar);
                    console.log('✓ Avatar aplicado ao post de:', profile.username);
                }
            }
        });
        
        // Aplicar também aos comentários
        const allComments = document.querySelectorAll('.comment-item');
        
        allComments.forEach(comment => {
            const commentUsername = comment.querySelector('.comment-user');
            
            if (commentUsername && profile.username === commentUsername.textContent.trim()) {
                const commentAvatar = comment.querySelector('.comment-avatar');
                
                if (commentAvatar) {
                    commentAvatar.innerHTML = getAvatarHTML(profile.avatar);
                    console.log('✓ Avatar aplicado ao comentário de:', profile.username);
                }
            }
        });
    }
    
    // Modificar PostManager para garantir que novos posts usem o avatar correto
    function fixPostManagerAvatar() {
        // Verificar se o PostManager está disponível
        if (!window.FURIAXCommunity || !window.FURIAXCommunity.PostManager) {
            console.warn('⚠️ PostManager não encontrado, verificando novamente em breve...');
            setTimeout(fixPostManagerAvatar, 1000);
            return;
        }
        
        // Verificar se já foi corrigido
        if (window.FURIAXCommunity.PostManager._avatarFixed) {
            return;
        }
        
        // Armazenar a função original
        const originalCreatePost = window.FURIAXCommunity.PostManager.createPost;
        
        // Sobrescrever com versão corrigida
        window.FURIAXCommunity.PostManager.createPost = function(content) {
            // Obter perfil atualizado
            const profile = getUserProfile();
            
            // Criar post usando a função original
            const post = originalCreatePost.call(this, content);
            
            if (post) {
                // Garantir que o avatar e username estejam corretos
                post.avatar = profile.avatar;
                post.usuario = profile.username;
                
                // Atualizar o post no storage
                const posts = this.getPosts();
                const updatedPosts = posts.map(p => p.id === post.id ? post : p);
                this.savePosts(updatedPosts);
                
                console.log('✅ Novo post criado com avatar correto:', profile.avatar);
            }
            
            return post;
        };
        
        // Marcar como corrigido
        window.FURIAXCommunity.PostManager._avatarFixed = true;
        console.log('✅ PostManager corrigido para usar avatar atual');
    }
    
    // Corrigir também a função addComment
    function fixCommentManagerAvatar() {
        // Verificar se o PostManager está disponível
        if (!window.FURIAXCommunity || !window.FURIAXCommunity.PostManager) {
            console.warn('⚠️ PostManager não encontrado para correção de comentários');
            setTimeout(fixCommentManagerAvatar, 1000);
            return;
        }
        
        // Verificar se já foi corrigido
        if (window.FURIAXCommunity.PostManager._commentAvatarFixed) {
            return;
        }
        
        // Armazenar a função original
        const originalAddComment = window.FURIAXCommunity.PostManager.addComment;
        
        // Sobrescrever com versão corrigida
        window.FURIAXCommunity.PostManager.addComment = function(postId, commentText) {
            // Obter perfil atualizado
            const profile = getUserProfile();
            
            // Criar comentário usando a função original
            const updatedPost = originalAddComment.call(this, postId, commentText);
            
            if (updatedPost && updatedPost.comentarios && updatedPost.comentarios.length > 0) {
                // Garantir que o último comentário tenha o avatar correto
                const lastComment = updatedPost.comentarios[updatedPost.comentarios.length - 1];
                lastComment.avatar = profile.avatar;
                lastComment.usuario = profile.username;
                
                // Atualizar o post no storage
                const posts = this.getPosts();
                const updatedPosts = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
                this.savePosts(updatedPosts);
                
                console.log('✅ Novo comentário criado com avatar correto');
            }
            
            return updatedPost;
        };
        
        // Marcar como corrigido
        window.FURIAXCommunity.PostManager._commentAvatarFixed = true;
        console.log('✅ Função de comentários corrigida para usar avatar atual');
    }
    
    // Configurar observador do DOM para atualizar novos posts/comentários
    function setupDOMObserver() {
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;
            
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    // Verificar se algum dos nós adicionados é um post ou comentário
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.classList && 
                            (node.classList.contains('post-card') || 
                             node.classList.contains('comment-item'))) {
                            shouldUpdate = true;
                            break;
                        }
                    }
                    
                    if (shouldUpdate) break;
                }
            }
            
            if (shouldUpdate) {
                console.log('🔄 Novos elementos detectados, atualizando avatares...');
                setTimeout(applyAvatarsToAllPosts, 50);
            }
        });
        
        // Observar toda a coluna de feed
        const feedColumn = document.querySelector('.feed-column');
        if (feedColumn) {
            observer.observe(feedColumn, { childList: true, subtree: true });
            console.log('👀 Observador do DOM configurado para a coluna de feed');
        }
    }
    
    // Inicialização completa
    function initialize() {
        // Sincronizar perfil da sidebar
        syncSidebarProfile();
        
        // Aplicar avatares aos posts existentes
        applyAvatarsToAllPosts();
        
        // Corrigir o PostManager para posts futuros
        fixPostManagerAvatar();
        
        // Corrigir gerenciador de comentários
        fixCommentManagerAvatar();
        
        // Configurar observador para mudanças no DOM
        setupDOMObserver();
        
        // Fazer nova verificação depois de algum tempo para garantir
        setTimeout(applyAvatarsToAllPosts, 1500);
        
        console.log('✅ Correção de avatares inicializada com sucesso!');
    }
    
    // Iniciar depois de um pequeno atraso para garantir que o DOM esteja pronto
    setTimeout(initialize, 500);
    
    // Adicionar ouvinte para mudanças no localStorage (alterações de perfil)
    window.addEventListener('storage', function(e) {
        if (e.key === 'furiaxProfile' || e.key === CONFIG.STORAGE_KEYS.PROFILE || 
            e.key.includes('furiax_')) {
            console.log('🔄 Mudança detectada no perfil, atualizando avatares...');
            syncSidebarProfile();
            applyAvatarsToAllPosts();
        }
    });
});