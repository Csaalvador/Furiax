// Adicione ao arquivo furiax-community.js dentro do método UIManager.setupEventListeners

// Encontre este trecho no código existente:
if (postButton) {
    // Remover listeners anteriores
    const newButton = postButton.cloneNode(true);
    postButton.parentNode.replaceChild(newButton, postButton);
    
    // Adicionar novo listener
    document.getElementById('analyzePostBtn').addEventListener('click', () => {
        const postInput = document.querySelector('.post-input');
        const content = postInput.value.trim();
        
        if (content) {
            // Mostrar notificação de análise
            const notification = document.getElementById('sentimentNotification');
            if (notification) notification.classList.add('show');
            
            // Criar post com animação de typing
            setTimeout(() => {
                // Criar post
                const post = PostManager.createPost(content);
                
                // ADICIONE ESTAS LINHAS ABAIXO:
                // Criar e adicionar o post ao DOM imediatamente
                const feedColumn = document.querySelector('.feed-column');
                const createPost = document.querySelector('.create-post');
                
                if (feedColumn && createPost) {
                    // Renderizar posts sem esperar o timeout
                    UIManager.renderPosts();
                }
                // FIM DAS LINHAS ADICIONADAS
                
                // Esconder notificação
                if (notification) notification.classList.remove('show');
                
                // Mostrar feedback do sentimento
                NotificationManager.showSentimentFeedback(post.sentiment.score);
                
                // Limpar input
                postInput.value = '';
                
                // Renderizar posts
                this.renderPosts();
                
                // Atualizar interface de sentimento
                this.updateSentimentUI();
                
                // Atualizar interface de tags se tiver hashtags
                if (post.sentiment.hashtags && post.sentiment.hashtags.length > 0) {
                    this.updateTagsUI();
                }
            }, 1000); // ALTERE ESTE VALOR PARA 0 para tornar a criação instantânea
        }
    });
}