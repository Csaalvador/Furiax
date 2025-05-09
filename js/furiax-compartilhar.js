/**
 * FURIAX - Modal de Compartilhamento Aprimorado
 * Um modal moderno e imersivo para o sistema de compartilhamento FURIAX
 */

// Função autoexecutável para evitar conflitos com outras variáveis
(function() {
    console.log('🚀 Inicializando modal de compartilhamento aprimorado FURIAX...');
    
    // Evitar execução duplicada
    if (window.furiaxShareModalApplied) return;
    window.furiaxShareModalApplied = true;
    
    // Configurações
    const CONFIG = {
        SHARE_BUTTON_SELECTOR: '[data-action="compartilhar"]',
        MODAL_ID: 'furiax-share-modal',
        STORAGE_KEY: 'furiax_posts'
    };
    
    // 1. Adicionar estilos CSS para o modal
    function addShareModalStyles() {
        // Verificar se os estilos já foram adicionados
        if (document.getElementById('furiax-share-modal-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'furiax-share-modal-styles';
        styleElement.textContent = `
            /* Overlay do modal */
            .furiax-share-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
            }
            
            .furiax-share-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            /* Container do conteúdo */
            .furiax-share-container {
                width: 90%;
                max-width: 550px;
                background: linear-gradient(145deg, #181818, #222);
                border: 1px solid #333;
                border-radius: 16px;
                padding: 0;
                overflow: hidden;
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
                transform: translateY(30px) scale(0.95);
                transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                position: relative;
            }
            
            .furiax-share-modal.active .furiax-share-container {
                transform: translateY(0) scale(1);
            }
            
            /* Cabeçalho do modal */
            .furiax-share-header {
                background: linear-gradient(90deg, #111, #222);
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #333;
            }
            
            .furiax-share-title {
                margin: 0;
                font-family: 'Orbitron', sans-serif;
                font-size: 1.4rem;
                font-weight: 600;
                background: linear-gradient(90deg, #1e90ff, #00bfff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .furiax-share-close {
                background: rgba(255, 255, 255, 0.05);
                border: none;
                color: #aaa;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .furiax-share-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                transform: rotate(90deg);
            }
            
            /* Corpo do modal */
            .furiax-share-body {
                padding: 20px;
            }
            
            /* Post preview */
            .furiax-post-preview {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 20px;
                font-size: 0.9rem;
                color: #ddd;
                border: 1px solid #333;
                max-height: 100px;
                overflow: hidden;
                position: relative;
            }
            
            .furiax-post-preview::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 40px;
                background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
                pointer-events: none;
            }
            
            /* Subtítulos */
            .furiax-share-subtitle {
                font-family: 'Orbitron', sans-serif;
                font-size: 1rem;
                color: #aaa;
                margin: 25px 0 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* Plataformas */
            .furiax-share-platforms {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                margin-bottom: 25px;
            }
            
            .furiax-share-platform {
                display: flex;
                flex-direction: column;
                align-items: center;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid #333;
                border-radius: 12px;
                padding: 15px 0;
                cursor: pointer;
                transition: all 0.3s;
                text-decoration: none;
            }
            
            .furiax-share-platform:hover {
                transform: translateY(-5px);
                background: rgba(30, 144, 255, 0.05);
                border-color: rgba(30, 144, 255, 0.3);
            }
            
            .furiax-share-platform:active {
                transform: scale(0.95);
            }
            
            .furiax-platform-icon {
                font-size: 2rem;
                margin-bottom: 8px;
                transition: transform 0.3s;
            }
            
            .furiax-share-platform:hover .furiax-platform-icon {
                transform: scale(1.2);
            }
            
            .furiax-platform-name {
                font-size: 0.8rem;
                color: #bbb;
                transition: color 0.3s;
            }
            
            .furiax-share-platform:hover .furiax-platform-name {
                color: white;
            }
            
            /* Cores dos ícones */
            .twitter-icon { color: #1DA1F2; }
            .facebook-icon { color: #4267B2; }
            .whatsapp-icon { color: #25D366; }
            .telegram-icon { color: #0088cc; }
            .reddit-icon { color: #FF5700; }
            .tiktok-icon { color: #ff0050; }
            .instagram-icon { color: #C13584; }
            .email-icon { color: #D44638; }
            
            /* Link */
            .furiax-share-link-container {
                display: flex;
                gap: 10px;
                align-items: stretch;
            }
            
            .furiax-share-link-input {
                flex: 1;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid #444;
                border-radius: 8px;
                padding: 12px 15px;
                color: #ddd;
                font-family: 'Exo 2', sans-serif;
                font-size: 0.9rem;
            }
            
            .furiax-share-copy-btn {
                background: linear-gradient(90deg, #1e90ff, #0078d7);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 0 20px;
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .furiax-share-copy-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(30, 144, 255, 0.3);
            }
            
            .furiax-share-copy-btn:active {
                transform: translateY(0);
            }
            
            /* QR Code */
            .furiax-qr-section {
                margin-top: 25px;
                display: flex;
                align-items: stretch;
                gap: 15px;
            }
            
            .furiax-qr-code {
                width: 120px;
                height: 120px;
                background: white;
                padding: 10px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .furiax-qr-code img {
                width: 100%;
                height: 100%;
            }
            
            .furiax-qr-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .furiax-qr-title {
                font-family: 'Orbitron', sans-serif;
                font-size: 1rem;
                color: #1e90ff;
                margin-bottom: 8px;
            }
            
            .furiax-qr-desc {
                font-size: 0.85rem;
                color: #aaa;
                line-height: 1.4;
            }
            
            /* Notificação */
            .furiax-share-notification {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: rgba(0, 204, 102, 0.9);
                color: white;
                padding: 12px 25px;
                border-radius: 30px;
                box-shadow: 0 5px 20px rgba(0, 204, 102, 0.3);
                font-family: 'Exo 2', sans-serif;
                display: flex;
                align-items: center;
                gap: 10px;
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                z-index: 10;
                pointer-events: none;
            }
            
            .furiax-share-notification.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            
            /* Animação de sharing */
            @keyframes furiax-share-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            .furiax-share-platform.sharing {
                animation: furiax-share-pulse 0.5s ease-in-out 2;
                background: rgba(30, 144, 255, 0.1);
                border-color: #1e90ff;
            }
            
            /* Versão mobile */
            @media (max-width: 768px) {
                .furiax-share-platforms {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .furiax-qr-section {
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                
                .furiax-qr-info {
                    text-align: center;
                }
            }
            
            @media (max-width: 480px) {
                .furiax-share-platforms {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .furiax-share-header {
                    padding: 12px 15px;
                }
                
                .furiax-share-title {
                    font-size: 1.2rem;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
        console.log('✅ Estilos do modal de compartilhamento adicionados');
    }
    
    // 2. Criar estrutura HTML do modal
    function createShareModal() {
        // Verificar se o modal já existe
        if (document.getElementById(CONFIG.MODAL_ID)) return;
        
        // Criar elemento do modal
        const modalElement = document.createElement('div');
        modalElement.id = CONFIG.MODAL_ID;
        modalElement.className = 'furiax-share-modal';
        
        // Estrutura HTML do modal
        modalElement.innerHTML = `
            <div class="furiax-share-container">
                <div class="furiax-share-header">
                    <h3 class="furiax-share-title">
                        <i class="fas fa-share-alt"></i>
                        Compartilhar Post
                    </h3>
                    <button class="furiax-share-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="furiax-share-body">
                    <!-- Preview do conteúdo -->
                    <div class="furiax-post-preview"></div>
                    
                    <!-- Redes sociais -->
                    <div class="furiax-share-subtitle">
                        <i class="fas fa-globe"></i>
                        Compartilhar nas redes
                    </div>
                    
                    <div class="furiax-share-platforms">
                        <a href="#" class="furiax-share-platform" data-platform="twitter">
                            <div class="furiax-platform-icon twitter-icon">
                                <i class="fab fa-twitter"></i>
                            </div>
                            <div class="furiax-platform-name">Twitter</div>
                        </a>
                        
                        <a href="#" class="furiax-share-platform" data-platform="facebook">
                            <div class="furiax-platform-icon facebook-icon">
                                <i class="fab fa-facebook-f"></i>
                            </div>
                            <div class="furiax-platform-name">Facebook</div>
                        </a>
                        
                        <a href="#" class="furiax-share-platform" data-platform="whatsapp">
                            <div class="furiax-platform-icon whatsapp-icon">
                                <i class="fab fa-whatsapp"></i>
                            </div>
                            <div class="furiax-platform-name">WhatsApp</div>
                        </a>
                        
                        <a href="#" class="furiax-share-platform" data-platform="telegram">
                            <div class="furiax-platform-icon telegram-icon">
                                <i class="fab fa-telegram-plane"></i>
                            </div>
                            <div class="furiax-platform-name">Telegram</div>
                        </a>
                        
                        <a href="#" class="furiax-share-platform" data-platform="instagram">
                            <div class="furiax-platform-icon instagram-icon">
                                <i class="fab fa-instagram"></i>
                            </div>
                            <div class="furiax-platform-name">Instagram</div>
                        </a>
                        
                        <a href="#" class="furiax-share-platform" data-platform="tiktok">
                            <div class="furiax-platform-icon tiktok-icon">
                                <i class="fab fa-tiktok"></i>
                            </div>
                            <div class="furiax-platform-name">TikTok</div>
                        </a>
                        
                        <a href="#" class="furiax-share-platform" data-platform="reddit">
                            <div class="furiax-platform-icon reddit-icon">
                                <i class="fab fa-reddit-alien"></i>
                            </div>
                            <div class="furiax-platform-name">Reddit</div>
                        </a>
                        
                        <a href="#" class="furiax-share-platform" data-platform="email">
                            <div class="furiax-platform-icon email-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="furiax-platform-name">Email</div>
                        </a>
                    </div>
                    
                    <!-- Link -->
                    <div class="furiax-share-subtitle">
                        <i class="fas fa-link"></i>
                        Link direto
                    </div>
                    
                    <div class="furiax-share-link-container">
                        <input type="text" class="furiax-share-link-input" readonly>
                        <button class="furiax-share-copy-btn">
                            <i class="far fa-copy"></i>
                            Copiar
                        </button>
                    </div>
                    
                    <!-- QR Code -->
                    <div class="furiax-qr-section">
                        <div class="furiax-qr-code">
                            <img src="" alt="QR Code">
                        </div>
                        <div class="furiax-qr-info">
                            <div class="furiax-qr-title">Compartilhe via QR Code</div>
                            <div class="furiax-qr-desc">
                                Escaneie o código ao lado para acessar este post diretamente. 
                                Perfeito para compartilhar com amigos próximos durante eventos FURIA!
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Notificação flutuante -->
                <div class="furiax-share-notification">
                    <i class="fas fa-check-circle"></i>
                    <span class="notification-text">Copiado com sucesso!</span>
                </div>
            </div>
        `;
        
        // Adicionar ao corpo do documento
        document.body.appendChild(modalElement);
        
        // Configurar eventos do modal
        setupModalEvents(modalElement);
        
        console.log('✅ Modal de compartilhamento criado');
    }
    
    // 3. Configurar eventos do modal
    function setupModalEvents(modal) {
        // Botão de fechar
        const closeButton = modal.querySelector('.furiax-share-close');
        closeButton.addEventListener('click', closeShareModal);
        
        // Fechar ao clicar no fundo
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeShareModal();
            }
        });
        
        // Fechar com Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeShareModal();
            }
        });
        
        // Botão de copiar link
        const copyButton = modal.querySelector('.furiax-share-copy-btn');
        copyButton.addEventListener('click', function() {
            const linkInput = modal.querySelector('.furiax-share-link-input');
            linkInput.select();
            document.execCommand('copy');
            
            // Mostrar notificação
            showNotification('Copiado com sucesso!');
        });
        
        // Eventos de plataformas de compartilhamento
        const sharePlatforms = modal.querySelectorAll('.furiax-share-platform');
        sharePlatforms.forEach(platform => {
            platform.addEventListener('click', function(e) {
                e.preventDefault();
                
                const platformName = this.getAttribute('data-platform');
                const postId = modal.getAttribute('data-post-id');
                
                // Aplicar classe de animação
                this.classList.add('sharing');
                
                // Remover classe após animação
                setTimeout(() => {
                    this.classList.remove('sharing');
                }, 1000);
                
                // Executar compartilhamento
                shareToSocialMedia(platformName, postId);
                
                // Mostrar notificação
                showNotification(`Compartilhado no ${getPlatformDisplayName(platformName)}!`);
            });
        });
    }
    
    // 4. Abrir o modal de compartilhamento
    function openShareModal(postId) {
        const modal = document.getElementById(CONFIG.MODAL_ID);
        if (!modal) return;
        
        // Salvar ID do post no modal
        modal.setAttribute('data-post-id', postId);
        
        // Obter dados do post
        const post = getPostData(postId);
        
        // Definir preview do post
        const preview = modal.querySelector('.furiax-post-preview');
        if (preview && post) {
            preview.textContent = post.conteudo || 'Conteúdo do post não disponível';
        }
        
        // Gerar URL do post
        const postUrl = getPostUrl(postId);
        
        // Definir URL no campo de entrada
        const linkInput = modal.querySelector('.furiax-share-link-input');
        if (linkInput) {
            linkInput.value = postUrl;
        }
        
        // Gerar QR Code (usando API externa gratuita)
        const qrCodeImg = modal.querySelector('.furiax-qr-code img');
        if (qrCodeImg) {
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(postUrl)}`;
        }
        
        // Atualizar links de compartilhamento
        updateSocialShareLinks(postUrl, post);
        
        // Mostrar o modal
        modal.classList.add('active');
        
        // Incrementar contador de compartilhamentos
        incrementShareCount(postId);
    }
    
    // 5. Fechar o modal
    function closeShareModal() {
        const modal = document.getElementById(CONFIG.MODAL_ID);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // 6. Mostrar notificação
    function showNotification(message) {
        const notification = document.querySelector('.furiax-share-notification');
        if (!notification) return;
        
        const textElement = notification.querySelector('.notification-text');
        if (textElement) {
            textElement.textContent = message;
        }
        
        // Mostrar notificação
        notification.classList.add('show');
        
        // Esconder após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // 7. Obter dados do post
    function getPostData(postId) {
        if (window.FURIAXCommunity && window.FURIAXCommunity.PostManager) {
            const posts = window.FURIAXCommunity.PostManager.getPosts();
            return posts.find(post => post.id == postId);
        } else {
            try {
                const postsData = localStorage.getItem(CONFIG.STORAGE_KEY);
                if (postsData) {
                    const posts = JSON.parse(postsData);
                    return posts.find(post => post.id == postId);
                }
            } catch (e) {
                console.error('Erro ao obter dados do post:', e);
            }
        }
        return null;
    }
    
    // 8. Gerar URL do post
    function getPostUrl(postId) {
        // Usar a URL atual com parâmetro post
        return `${window.location.origin}${window.location.pathname}?post=${postId}`;
    }
    
    // 9. Atualizar links de compartilhamento das redes sociais
    function updateSocialShareLinks(url, post) {
        const modal = document.getElementById(CONFIG.MODAL_ID);
        if (!modal) return;
        
        // Texto de compartilhamento
        const title = post ? post.conteudo.substring(0, 100) + '...' : 'Post da comunidade FURIAX';
        const text = 'Confira este post da comunidade FURIAX!';
        
        // Atualizar cada plataforma
        const platforms = modal.querySelectorAll('.furiax-share-platform');
        platforms.forEach(platform => {
            const platformName = platform.getAttribute('data-platform');
            let shareUrl = '';
            
            switch (platformName) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n\n' + url)}`;
                    break;
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                    break;
                case 'reddit':
                    shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${encodeURIComponent('Post FURIAX')}&body=${encodeURIComponent(text + '\n\n' + url)}`;
                    break;
                case 'instagram':
                    // Instagram não tem API de compartilhamento direta, usamos uma mensagem
                    shareUrl = '#';
                    break;
                case 'tiktok':
                    // TikTok não tem API de compartilhamento direta, usamos uma mensagem
                    shareUrl = '#';
                    break;
            }
            
            platform.setAttribute('href', shareUrl);
            if (platformName !== 'email') {
                platform.setAttribute('target', '_blank');
            }
        });
    }
    
    // 10. Compartilhar em rede social
    function shareToSocialMedia(platform, postId) {
        const modal = document.getElementById(CONFIG.MODAL_ID);
        if (!modal) return;
        
        const platformElement = modal.querySelector(`.furiax-share-platform[data-platform="${platform}"]`);
        
        // Verificar se é plataforma sem API direta
        if (platform === 'instagram' || platform === 'tiktok') {
            // Copiar link para área de transferência
            const linkInput = modal.querySelector('.furiax-share-link-input');
            if (linkInput) {
                linkInput.select();
                document.execCommand('copy');
                
                // Mostrar notificação específica
                showNotification(`Link copiado para compartilhar no ${getPlatformDisplayName(platform)}!`);
            }
            return;
        }
        
        // Para outras plataformas, seguir o fluxo normal
        if (platformElement && platformElement.getAttribute('href') !== '#') {
            // Se for mobile, abrir em nova janela
            window.open(platformElement.getAttribute('href'), '_blank');
        }
        
        // Incrementar contador
        incrementShareCount(postId);
        updateShareCountUI(postId);
    }
    
    // 11. Incrementar contador de compartilhamentos
    function incrementShareCount(postId) {
        if (window.FURIAXCommunity && window.FURIAXCommunity.PostManager) {
            window.FURIAXCommunity.PostManager.sharePost(postId);
        } else {
            try {
                const postsData = localStorage.getItem(CONFIG.STORAGE_KEY);
                if (postsData) {
                    const posts = JSON.parse(postsData);
                    const updatedPosts = posts.map(post => {
                        if (post.id == postId) {
                            post.compartilhamentos = (post.compartilhamentos || 0) + 1;
                        }
                        return post;
                    });
                    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(updatedPosts));
                }
            } catch (e) {
                console.error('Erro ao incrementar compartilhamentos:', e);
            }
        }
    }
    
    // 12. Atualizar UI com a nova contagem
    function updateShareCountUI(postId) {
        const shareCounter = document.querySelector(`.post-card[data-id="${postId}"] .post-stat:nth-child(3)`);
        if (!shareCounter) return;
        
        // Obter contagem atualizada
        let count = 0;
        
        if (window.FURIAXCommunity && window.FURIAXCommunity.PostManager) {
            const posts = window.FURIAXCommunity.PostManager.getPosts();
            const post = posts.find(p => p.id == postId);
            if (post) count = post.compartilhamentos || 0;
        } else {
            try {
                const postsData = localStorage.getItem(CONFIG.STORAGE_KEY);
                if (postsData) {
                    const posts = JSON.parse(postsData);
                    const post = posts.find(p => p.id == postId);
                    if (post) count = post.compartilhamentos || 0;
                }
            } catch (e) {
                console.error('Erro ao obter compartilhamentos:', e);
            }
        }
        
        // Atualizar contador
        shareCounter.innerHTML = `<i class="fas fa-share"></i> ${count}`;
    }
    
    // 13. Obter nome de exibição da plataforma
    function getPlatformDisplayName(platform) {
        const displayNames = {
            'twitter': 'Twitter',
            'facebook': 'Facebook',
            'whatsapp': 'WhatsApp',
            'telegram': 'Telegram',
            'reddit': 'Reddit',
            'email': 'Email',
            'instagram': 'Instagram',
            'tiktok': 'TikTok'
        };
        
        return displayNames[platform] || platform;
    }
    
    // 14. Corrigir todos os botões de compartilhar
    function fixShareButtons() {
        // Encontrar botões de compartilhar
        document.querySelectorAll(CONFIG.SHARE_BUTTON_SELECTOR).forEach(button => {
            // Verificar se já foi corrigido
            if (button.hasAttribute('data-share-fixed')) return;
            
            // Criar cópia do botão para remover event listeners anteriores
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Adicionar novo event listener
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const postId = this.getAttribute('data-id');
                if (!postId) return;
                
                // Abrir modal de compartilhamento
                openShareModal(postId);
            });
            
            // Marcar como corrigido
            newButton.setAttribute('data-share-fixed', 'true');
        });
        
        console.log('✅ Botões de compartilhar corrigidos');
    }
    
    // 15. Observar mudanças no DOM para corrigir novos botões
    function observeDOMChanges() {
        const observer = new MutationObserver(mutations => {
            let hasNewShareButtons = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    // Verificar se algum novo botão de compartilhar foi adicionado
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1) {
                            const hasButtons = node.querySelectorAll ? 
                                node.querySelectorAll(CONFIG.SHARE_BUTTON_SELECTOR).length > 0 : false;
                                
                            const isButton = node.getAttribute ? 
                                node.getAttribute('data-action') === 'compartilhar' : false;
                                
                            if (hasButtons || isButton) {
                                hasNewShareButtons = true;
                            }
                        }
                    });
                }
            });
            
            if (hasNewShareButtons) {
                // Corrigir novos botões
                setTimeout(fixShareButtons, 50);
            }
        });
        
        // Observar a coluna de feed
        const feedColumn = document.querySelector('.feed-column');
        if (feedColumn) {
            observer.observe(feedColumn, { 
                childList: true, 
                subtree: true 
            });
            console.log('👀 Observando mudanças para novos botões de compartilhar');
        }
    }
    
    // 16. Adicionar efeitos visuais de animação
    function addVisualEffects() {
        // Verificar se os estilos já foram adicionados
        if (document.getElementById('furiax-share-effects')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'furiax-share-effects';
        styleElement.textContent = `
            /* Efeito de partículas ao compartilhar */
            @keyframes particle-animation {
                0% {
                    opacity: 1;
                    transform: translate(0, 0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(var(--tx), var(--ty)) scale(0);
                }
            }
            
            .share-particle {
                position: fixed;
                width: 8px;
                height: 8px;
                background: var(--color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                opacity: 0;
            }
            
            .share-particle.animate {
                animation: particle-animation 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            
            /* Efeito de ripple no botão compartilhar */
            [data-action="compartilhar"] {
                position: relative;
                overflow: hidden;
            }
            
            .share-ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-effect 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple-effect {
                to {
                    transform: scale(2.5);
                    opacity: 0;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
        console.log('✅ Efeitos visuais adicionados');
    }
    
    // 17. Adicionar efeito de ripple aos botões
    function addRippleEffect() {
        document.addEventListener('click', function(e) {
            const target = e.target.closest('[data-action="compartilhar"]');
            if (!target) return;
            
            // Criar elemento de ripple
            const ripple = document.createElement('span');
            ripple.className = 'share-ripple';
            
            // Calcular posição do clique relativa ao botão
            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Definir posição e tamanho
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
            
            // Adicionar ao botão
            target.appendChild(ripple);
            
            // Remover após animação
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
    
    // 18. Adicionar efeito de partículas ao compartilhar
    function createShareParticles(x, y, color) {
        const colors = color ? [color] : ['#1e90ff', '#00bfff', '#00cc66', '#ff3b5c'];
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            // Criar partícula
            const particle = document.createElement('div');
            particle.className = 'share-particle';
            
            // Definir posição inicial
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            // Definir cor aleatória
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.setProperty('--color', randomColor);
            
            // Definir direção aleatória
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            // Adicionar ao documento
            document.body.appendChild(particle);
            
            // Iniciar animação
            setTimeout(() => {
                particle.classList.add('animate');
                
                // Remover após animação
                setTimeout(() => {
                    particle.remove();
                }, 1000);
            }, 10);
        }
    }
    
    // 19. Inicialização principal
    function init() {
        // Adicionar estilos do modal
        addShareModalStyles();
        
        // Adicionar efeitos visuais
        addVisualEffects();
        
        // Criar o modal
        createShareModal();
        
        // Corrigir botões existentes
        fixShareButtons();
        
        // Adicionar efeito de ripple
        addRippleEffect();
        
        // Observar mudanças no DOM
        observeDOMChanges();
        
        // Corrigir sistema de criação de posts
        if (typeof window.addPostToDom === 'function') {
            const originalAddPostToDom = window.addPostToDom;
            window.addPostToDom = function(post) {
                const result = originalAddPostToDom.call(this, post);
                setTimeout(fixShareButtons, 50);
                return result;
            };
        }
        
        console.log('✅ Modal de compartilhamento aprimorado inicializado com sucesso!');
    }
    
    // Executar inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expor funções que podem ser úteis para outros scripts
    window.FURIAXShareModal = {
        open: openShareModal,
        close: closeShareModal,
        createParticles: createShareParticles
    };
})();