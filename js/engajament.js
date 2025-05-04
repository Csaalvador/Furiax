/**
 * FURIAX - Sistema de Contas Sociais e Engajamento
 * 
 * Este script corrige:
 * 1. Funcionalidade de contas sociais conectadas (Twitter, Instagram, etc.)
 * 2. Sistema de pontuação de engajamento e progresso de recompensas
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔌 FURIAX Social & Engagement System - Iniciando...');
    
    // ==============================================
    // CONFIGURAÇÕES
    // ==============================================
    
    const CONFIG = {
        STORAGE_KEYS: {
            SOCIAL_ACCOUNTS: 'furiax_social_accounts',
            ENGAGEMENT: 'furiax_engagement_score',
            USER_DATA: 'furiax_user_data'
        },
        SELECTORS: {
            SOCIAL_ACCOUNTS: '.social-account',
            ENGAGEMENT_SCORE: '.score-value',
            ENGAGEMENT_LEVEL: '.score-label',
            ENGAGEMENT_ITEMS: '.engagement-item',
            REWARD_ITEMS: '.reward-item'
        },
        ENGAGEMENT: {
            LEVELS: [
                { name: 'NOVATO', min: 0, max: 29 },
                { name: 'INICIANTE', min: 30, max: 49 },
                { name: 'REGULAR', min: 50, max: 69 },
                { name: 'AVANÇADO', min: 70, max: 84 },
                { name: 'ELITE', min: 85, max: 100 }
            ],
            POINT_VALUES: {
                post: 10,
                comment: 5,
                like: 2,
                share: 8,
                social_connect: 15,
                daily_login: 3
            }
        }
    };
    
    // ==============================================
    // DADOS DE ESTADO E INICIALIZAÇÃO
    // ==============================================
    
    // Estado da aplicação
    let STATE = {
        socialAccounts: {
            twitter: true,
            instagram: true,
            twitch: false,
            youtube: false
        },
        engagement: {
            score: 85,
            breakdown: {
                community: 92,
                events: 76,
                support: 88,
                reputation: 81
            },
            lastUpdated: new Date().toISOString()
        }
    };
    
    // Inicialização principal
    initSocialEngagementSystem();
    
    function initSocialEngagementSystem() {
        // Carregar dados do localStorage
        loadSavedData();
        
        // Inicializar os componentes principais
        initSocialAccounts();
        initEngagementSystem();
        
        // Atualizar a interface com os dados
        updateSocialAccountsUI();
        updateEngagementUI();
        
        console.log('✅ FURIAX Social & Engagement System - Inicializado com sucesso');
    }
    
    // Carregar dados salvos do localStorage
    function loadSavedData() {
        try {
            // Carregar contas sociais
            const savedSocial = localStorage.getItem(CONFIG.STORAGE_KEYS.SOCIAL_ACCOUNTS);
            if (savedSocial) {
                STATE.socialAccounts = JSON.parse(savedSocial);
            } else {
                // Salvar estado inicial como padrão
                saveSocialAccounts();
            }
            
            // Carregar dados de engajamento
            const savedEngagement = localStorage.getItem(CONFIG.STORAGE_KEYS.ENGAGEMENT);
            if (savedEngagement) {
                STATE.engagement = JSON.parse(savedEngagement);
            } else {
                // Salvar estado inicial como padrão
                saveEngagementData();
            }
        } catch (error) {
            console.error('Erro ao carregar dados salvos:', error);
        }
    }
    
    // ==============================================
    // SISTEMA DE CONTAS SOCIAIS
    // ==============================================
    
    function initSocialAccounts() {
        // Adicionar interatividade a cada conta social
        const socialAccounts = document.querySelectorAll(CONFIG.SELECTORS.SOCIAL_ACCOUNTS);
        
        socialAccounts.forEach(accountElement => {
            // Identificar a plataforma da conta social
            const platform = identifySocialPlatform(accountElement);
            if (!platform) return;
            
            // Adicionar evento de clique para conectar/desconectar
            accountElement.addEventListener('click', function() {
                toggleSocialAccount(platform);
            });
        });
    }
    
    // Identificar plataforma de mídia social com base no elemento DOM
    function identifySocialPlatform(accountElement) {
        if (accountElement.querySelector('.twitter-icon')) return 'twitter';
        if (accountElement.querySelector('.instagram-icon')) return 'instagram';
        if (accountElement.querySelector('.twitch-icon')) return 'twitch';
        if (accountElement.querySelector('.youtube-icon')) return 'youtube';
        
        // Fallback: tentar identificar pelo texto
        const text = accountElement.textContent.toLowerCase();
        if (text.includes('twitter')) return 'twitter';
        if (text.includes('instagram')) return 'instagram';
        if (text.includes('twitch')) return 'twitch';
        if (text.includes('youtube')) return 'youtube';
        
        return null;
    }
    
    // Alternar o estado de conexão de uma conta social
    function toggleSocialAccount(platform) {
        if (!platform || !STATE.socialAccounts.hasOwnProperty(platform)) return;
        
        // Se já estiver conectado, mostrar diálogo de desconexão
        if (STATE.socialAccounts[platform]) {
            showDisconnectDialog(platform);
        } else {
            // Se não estiver conectado, mostrar diálogo de conexão
            showConnectDialog(platform);
        }
    }
    
    // Mostrar diálogo de conexão de conta social
    function showConnectDialog(platform) {
        // Criar e configurar o diálogo
        const dialog = createSocialDialog({
            platform: platform,
            title: `Conectar ${getPlatformName(platform)}`,
            message: `Conecte sua conta do ${getPlatformName(platform)} para compartilhar conteúdo automaticamente.`,
            type: 'connect'
        });
        
        // Adicionar ao DOM
        document.body.appendChild(dialog);
        
        // Mostrar o diálogo com animação
        setTimeout(() => dialog.classList.add('active'), 10);
        
        // Configurar botões
        const connectBtn = dialog.querySelector('.connect-btn');
        const cancelBtn = dialog.querySelector('.cancel-btn');
        
        if (connectBtn) {
            connectBtn.addEventListener('click', function() {
                // Conectar a conta
                STATE.socialAccounts[platform] = true;
                saveSocialAccounts();
                updateSocialAccountsUI();
                
                // Adicionar pontos de engajamento pela conexão
                addEngagementPoints('social_connect');
                
                // Mostrar notificação
                showNotification(`Conta do ${getPlatformName(platform)} conectada com sucesso!`, 'success');
                
                // Fechar diálogo
                dialog.classList.remove('active');
                setTimeout(() => dialog.remove(), 300);
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                // Fechar diálogo
                dialog.classList.remove('active');
                setTimeout(() => dialog.remove(), 300);
            });
        }
    }
    
    // Mostrar diálogo de desconexão de conta social
    function showDisconnectDialog(platform) {
        // Criar e configurar o diálogo
        const dialog = createSocialDialog({
            platform: platform,
            title: `Desconectar ${getPlatformName(platform)}`,
            message: `Tem certeza que deseja desconectar sua conta do ${getPlatformName(platform)}?`,
            type: 'disconnect'
        });
        
        // Adicionar ao DOM
        document.body.appendChild(dialog);
        
        // Mostrar o diálogo com animação
        setTimeout(() => dialog.classList.add('active'), 10);
        
        // Configurar botões
        const disconnectBtn = dialog.querySelector('.disconnect-btn');
        const cancelBtn = dialog.querySelector('.cancel-btn');
        
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', function() {
                // Desconectar a conta
                STATE.socialAccounts[platform] = false;
                saveSocialAccounts();
                updateSocialAccountsUI();
                
                // Mostrar notificação
                showNotification(`Conta do ${getPlatformName(platform)} desconectada.`, 'info');
                
                // Fechar diálogo
                dialog.classList.remove('active');
                setTimeout(() => dialog.remove(), 300);
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                // Fechar diálogo
                dialog.classList.remove('active');
                setTimeout(() => dialog.remove(), 300);
            });
        }
    }
    
    // Criar elemento do diálogo de conta social
    function createSocialDialog({ platform, title, message, type }) {
        // Criar o elemento principal do diálogo
        const dialog = document.createElement('div');
        dialog.className = 'furiax-dialog social-dialog';
        
        // Cor e ícone baseados na plataforma
        const platformIcon = getPlatformIcon(platform);
        const platformColor = getPlatformColor(platform);
        
        // Conteúdo do diálogo
        let dialogContent;
        
        if (type === 'connect') {
            dialogContent = `
                <div class="dialog-header" style="border-color: ${platformColor}40;">
                    <div class="dialog-title">
                        <i class="${platformIcon}" style="color: ${platformColor};"></i>
                        ${title}
                    </div>
                    <button class="dialog-close" aria-label="Fechar">×</button>
                </div>
                <div class="dialog-body">
                    <p>${message}</p>
                    <div class="dialog-form">
                        <div class="form-group">
                            <label>Nome de usuário:</label>
                            <input type="text" class="dialog-input username-input" placeholder="Seu nome de usuário no ${getPlatformName(platform)}">
                        </div>
                        <div class="form-group">
                            <label>Senha:</label>
                            <div class="password-wrapper">
                                <input type="password" class="dialog-input password-input" placeholder="Sua senha">
                                <button class="toggle-password"><i class="fas fa-eye"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="dialog-button cancel-btn">Cancelar</button>
                    <button class="dialog-button connect-btn" style="background: ${platformColor};">Conectar</button>
                </div>
            `;
        } else { // disconnect
            dialogContent = `
                <div class="dialog-header" style="border-color: ${platformColor}40;">
                    <div class="dialog-title">
                        <i class="${platformIcon}" style="color: ${platformColor};"></i>
                        ${title}
                    </div>
                    <button class="dialog-close" aria-label="Fechar">×</button>
                </div>
                <div class="dialog-body">
                    <p>${message}</p>
                    <div class="warning-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Você não poderá compartilhar conteúdo automaticamente nesta plataforma até reconectar sua conta.</span>
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="dialog-button cancel-btn">Cancelar</button>
                    <button class="dialog-button disconnect-btn">Desconectar</button>
                </div>
            `;
        }
        
        dialog.innerHTML = dialogContent;
        
        // Configurar eventos do diálogo
        const closeBtn = dialog.querySelector('.dialog-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                dialog.classList.remove('active');
                setTimeout(() => dialog.remove(), 300);
            });
        }
        
        // Configurar togglePassword se existir
        const togglePasswordBtn = dialog.querySelector('.toggle-password');
        const passwordInput = dialog.querySelector('.password-input');
        
        if (togglePasswordBtn && passwordInput) {
            togglePasswordBtn.addEventListener('click', function() {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    passwordInput.type = 'password';
                    togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        }
        
        return dialog;
    }
    
    // Atualizar interface das contas sociais
    function updateSocialAccountsUI() {
        document.querySelectorAll(CONFIG.SELECTORS.SOCIAL_ACCOUNTS).forEach(accountElement => {
            const platform = identifySocialPlatform(accountElement);
            if (!platform) return;
            
            const statusElement = accountElement.querySelector('.social-status');
            if (!statusElement) return;
            
            // Atualizar status visual
            if (STATE.socialAccounts[platform]) {
                statusElement.textContent = 'Conectado';
                statusElement.classList.remove('not-connected');
            } else {
                statusElement.textContent = 'Não conectado';
                statusElement.classList.add('not-connected');
            }
        });
    }
    
    // Salvar status das contas sociais
    function saveSocialAccounts() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SOCIAL_ACCOUNTS, JSON.stringify(STATE.socialAccounts));
        } catch (error) {
            console.error('Erro ao salvar contas sociais:', error);
        }
    }
    
    // ==============================================
    // SISTEMA DE ENGAJAMENTO
    // ==============================================
    
    function initEngagementSystem() {
        // Inicializar escutadores de eventos para ações que geram pontos
        setupEngagementListeners();
    }
    
    // Configurar event listeners para ações de engajamento
    function setupEngagementListeners() {
        // Escutar cliques em botões de curtir
        document.querySelectorAll('.post-action-btn:nth-child(1)').forEach(button => {
            // Verificar se já possui listener
            if (button.hasAttribute('data-engagement-listener')) return;
            
            button.setAttribute('data-engagement-listener', 'true');
            button.addEventListener('click', function() {
                // Se não estiver curtido ainda
                if (!this.classList.contains('liked')) {
                    addEngagementPoints('like');
                }
            });
        });
        
        // Escutar cliques em botões de compartilhar
        document.querySelectorAll('.post-action-btn:nth-child(3)').forEach(button => {
            // Verificar se já possui listener
            if (button.hasAttribute('data-engagement-listener')) return;
            
            button.setAttribute('data-engagement-listener', 'true');
            button.addEventListener('click', function() {
                addEngagementPoints('share');
            });
        });
        
        // Escutar envios de comentários
        document.querySelectorAll('.comment-submit').forEach(button => {
            // Verificar se já possui listener
            if (button.hasAttribute('data-engagement-listener')) return;
            
            button.setAttribute('data-engagement-listener', 'true');
            button.addEventListener('click', function() {
                const input = this.closest('.comment-form').querySelector('.comment-input');
                if (input && input.value.trim()) {
                    addEngagementPoints('comment');
                }
            });
        });
        
        // Escutar publicação de posts
        const postButton = document.getElementById('analyzePostBtn');
        if (postButton && !postButton.hasAttribute('data-engagement-listener')) {
            postButton.setAttribute('data-engagement-listener', 'true');
            
            // O botão de post já tem um event listener para reload, vamos adicionar
            // um evento para registrar pontos antes do reload
            const originalClick = postButton.onclick;
            postButton.onclick = function(e) {
                const postInput = document.querySelector('.post-input');
                if (postInput && postInput.value.trim()) {
                    addEngagementPoints('post');
                    
                    // Executar o comportamento original após um pequeno delay
                    setTimeout(() => {
                        if (originalClick) originalClick.call(this, e);
                    }, 100);
                }
            };
        }
    }
    
    // Adicionar pontos de engajamento por uma ação
    function addEngagementPoints(actionType) {
        if (!actionType || !CONFIG.ENGAGEMENT.POINT_VALUES[actionType]) return;
        
        // Pontos para esta ação
        const points = CONFIG.ENGAGEMENT.POINT_VALUES[actionType];
        
        // Categoria para atualizar
        let category;
        switch (actionType) {
            case 'post':
            case 'comment':
                category = 'community';
                break;
            case 'like':
            case 'share':
                category = 'support';
                break;
            case 'social_connect':
                category = 'reputation';
                break;
            default:
                category = 'community';
        }
        
        // Atualizar pontuação de engajamento
        updateEngagementScore(points, category);
        
        // Atualizar interface
        updateEngagementUI();
        
        // Mostrar notificação só para ações significativas
        if (points >= 5) {
            showNotification(`+${points} pontos de engajamento adicionados!`, 'success');
        }
    }
    
    // Atualizar pontuação de engajamento
    function updateEngagementScore(points, category) {
        // Garantir que os dados existam
        ensureEngagementStructure();
        
        // Adicionar pontos à categoria específica (se houver)
        if (category && STATE.engagement.breakdown[category] !== undefined) {
            STATE.engagement.breakdown[category] = Math.min(100, STATE.engagement.breakdown[category] + points * 0.1);
        }
        
        // Calcular nova pontuação geral com base nas categorias
        let totalScore = 0;
        let categories = 0;
        
        for (const cat in STATE.engagement.breakdown) {
            if (STATE.engagement.breakdown[cat] !== undefined) {
                totalScore += STATE.engagement.breakdown[cat];
                categories++;
            }
        }
        
        // Média das categorias
        STATE.engagement.score = Math.round(totalScore / (categories || 1));
        
        // Limitar entre 0-100
        STATE.engagement.score = Math.max(0, Math.min(100, STATE.engagement.score));
        
        // Atualizar timestamp
        STATE.engagement.lastUpdated = new Date().toISOString();
        
        // Salvar alterações
        saveEngagementData();
        
        // Retornar nova pontuação
        return STATE.engagement.score;
    }
    
    // Garantir que a estrutura de dados de engajamento existe
    function ensureEngagementStructure() {
        if (!STATE.engagement) {
            STATE.engagement = {
                score: 0,
                breakdown: {},
                lastUpdated: new Date().toISOString()
            };
        }
        
        if (!STATE.engagement.breakdown) {
            STATE.engagement.breakdown = {};
        }
        
        // Garantir que todas as categorias existam
        const categories = ['community', 'events', 'support', 'reputation'];
        categories.forEach(category => {
            if (STATE.engagement.breakdown[category] === undefined) {
                STATE.engagement.breakdown[category] = 50; // Valor padrão inicial
            }
        });
    }
    
    // Atualizar a interface com os dados de engajamento
    function updateEngagementUI() {
        // Atualizar pontuação principal
        const scoreElement = document.querySelector(CONFIG.SELECTORS.ENGAGEMENT_SCORE);
        if (scoreElement) {
            scoreElement.textContent = STATE.engagement.score;
        }
        
        // Atualizar nível de engajamento
        const levelElement = document.querySelector(CONFIG.SELECTORS.ENGAGEMENT_LEVEL);
        if (levelElement) {
            const level = getEngagementLevel(STATE.engagement.score);
            levelElement.textContent = `Nível de Engajamento: ${level}`;
        }
        
        // Atualizar breakdown de categorias
        document.querySelectorAll(CONFIG.SELECTORS.ENGAGEMENT_ITEMS).forEach((item, index) => {
            const valueElement = item.querySelector('.engagement-value');
            if (!valueElement) return;
            
            // Identificar categoria
            let category;
            const label = item.querySelector('.engagement-label');
            if (label) {
                const text = label.textContent.toLowerCase();
                if (text.includes('comunidade')) category = 'community';
                else if (text.includes('eventos')) category = 'events';
                else if (text.includes('suporte')) category = 'support';
                else if (text.includes('reputação')) category = 'reputation';
            }
            
            // Se não conseguimos identificar por texto, usar o índice
            if (!category) {
                const categories = ['community', 'events', 'support', 'reputation'];
                category = categories[index] || 'community';
            }
            
            // Atualizar valor
            const value = STATE.engagement.breakdown[category];
            if (value !== undefined) {
                valueElement.textContent = `${Math.round(value)}/100`;
            }
        });
        
        // Atualizar progresso nas recompensas
        updateRewardsProgress();
    }
    
    // Atualizar progresso nas recompensas com base no engajamento
    function updateRewardsProgress() {
        const rewardItems = document.querySelectorAll(CONFIG.SELECTORS.REWARD_ITEMS);
        
        rewardItems.forEach((item, index) => {
            const progressFill = item.querySelector('.progress-fill');
            const progressText = item.querySelector('.progress-text');
            
            if (!progressFill || !progressText) return;
            
            // Calcular progresso baseado no engajamento e dificuldade da recompensa
            let progress;
            
            // Recompensas ficam mais difíceis de conseguir
            switch (index) {
                case 0: // Primeira recompensa (mais fácil)
                    progress = Math.min(100, STATE.engagement.score + 15);
                    break;
                case 1: // Segunda recompensa (média)
                    progress = Math.min(100, STATE.engagement.score - 25);
                    break;
                case 2: // Terceira recompensa (mais difícil)
                    progress = Math.min(100, STATE.engagement.score - 50);
                    break;
                default:
                    progress = STATE.engagement.score;
            }
            
            // Garantir que o progresso esteja entre 0-100
            progress = Math.max(0, Math.min(100, progress));
            
            // Atualizar elementos visuais
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
            
            // Adicionar classe para recompensas completas
            if (progress >= 100) {
                item.classList.add('reward-completed');
            } else {
                item.classList.remove('reward-completed');
            }
        });
    }
    
    // Salvar dados de engajamento
    function saveEngagementData() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.ENGAGEMENT, JSON.stringify(STATE.engagement));
            
            // Também salvar integrado no USER_DATA para compatibilidade
            const userData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA) || '{}');
            userData.engagementScore = STATE.engagement.score;
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        } catch (error) {
            console.error('Erro ao salvar dados de engajamento:', error);
        }
    }
    
    // Obter nível de engajamento baseado na pontuação
    function getEngagementLevel(score) {
        for (const level of CONFIG.ENGAGEMENT.LEVELS) {
            if (score >= level.min && score <= level.max) {
                return level.name;
            }
        }
        return 'ELITE'; // Fallback
    }
    
    // ==============================================
    // UTILITÁRIOS DE INTERFACE
    // ==============================================
    
    // Mostrar notificação na tela
    function showNotification(message, type = 'info') {
        // Verificar se já existe uma notificação
        let notification = document.getElementById('furiaxNotification');
        
        // Criar se não existir
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'furiaxNotification';
            document.body.appendChild(notification);
        }
        
        // Ícone baseado no tipo
        let icon;
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        // Conteúdo
        notification.innerHTML = `${icon} <span>${message}</span>`;
        
        // Estilo baseado no tipo
        notification.className = type;
        
        // Mostrar
        notification.classList.add('show');
        
        // Esconder após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Nomes amigáveis para plataformas
    function getPlatformName(platform) {
        const names = {
            'twitter': 'Twitter',
            'instagram': 'Instagram',
            'twitch': 'Twitch',
            'youtube': 'YouTube'
        };
        
        return names[platform] || platform;
    }
    
    // Ícones para plataformas
    function getPlatformIcon(platform) {
        const icons = {
            'twitter': 'fab fa-twitter',
            'instagram': 'fab fa-instagram',
            'twitch': 'fab fa-twitch',
            'youtube': 'fab fa-youtube'
        };
        
        return icons[platform] || 'fas fa-link';
    }
    
    // Cores de marca para plataformas
    function getPlatformColor(platform) {
        const colors = {
            'twitter': '#1DA1F2',
            'instagram': '#E1306C',
            'twitch': '#6441A4',
            'youtube': '#FF0000'
        };
        
        return colors[platform] || '#1e90ff';
    }
    
    // Adicionar estilos CSS necessários
    function addRequiredStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Estilos para diálogos sociais */
            .furiax-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s, visibility 0.3s;
            }
            
            .furiax-dialog.active {
                opacity: 1;
                visibility: visible;
                flex-direction:column;
            }
            
            .furiax-dialog > div {
                background-color: #1a1a2e;
                border-radius: 10px;
                width: 90%;
                max-width: 450px;
                box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
                transform: translateY(20px);
                transition: transform 0.3s ease;
                overflow: hidden;
            }
            
            .furiax-dialog.active > div {
                transform: translateY(0);
            }
            
            .dialog-header {
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .dialog-title {
                color: white;
                font-size: 1.1rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .dialog-title i {
                font-size: 1.3rem;
            }
            
            .dialog-close {
                background: none;
                border: none;
                color: #777;
                font-size: 1.5rem;
                cursor: pointer;
                transition: color 0.2s;
            }
            
            .dialog-close:hover {
                color: white;
            }
            
            .dialog-body {
                padding: 20px;
                color: #ccc;
            }
            
            .dialog-footer {
                padding: 15px 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .dialog-button {
                padding: 8px 15px;
                border-radius: 5px;
                border: 1px solid #333;
                background: rgba(255, 255, 255, 0.05);
                color: white;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .dialog-button:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .dialog-button.connect-btn {
                background: #1e90ff;
                border-color: transparent;
            }
            
            .disconnect-btn {
                background: #ff3b5c;
                border-color: transparent;
            }
            
            .disconnect-btn:hover {
                background: #e01a3c;
            }
            
            .warning-message {
                background: rgba(255, 59, 92, 0.1);
                border-radius: 5px;
                padding: 10px;
                margin: 15px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .warning-message i {
                color: #ff3b5c;
            }
            
            .dialog-form {
                margin: 15px 0;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                color: #aaa;
            }
            
            .dialog-input {
                width: 100%;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid #333;
                border-radius: 5px;
                padding: 10px;
                color: white;
                font-family: 'Exo 2', sans-serif;
            }
            
            .dialog-input:focus {
                outline: none;
                border-color: #1e90ff;
                box-shadow: 0 0 0 2px rgba(30, 144, 255, 0.2);
            }
            
            .password-wrapper {
                position: relative;
            }
            
            .toggle-password {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #777;
                font-size: 0.9rem;
                cursor: pointer;
            }
            
            .toggle-password:hover {
                color: white;
            }
            
            /* Estilo para notificações */
            #furiaxNotification {
                position: fixed;
                bottom: -60px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 20px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: white;
                font-family: 'Exo 2', sans-serif;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                transition: bottom 0.3s ease-out;
                z-index: 1000;
            }
            
            #furiaxNotification.show {
                bottom: 20px;
            }
            
            #furiaxNotification.success {
                background: linear-gradient(90deg, #00cc66, #33d67d);
            }
            
            #furiaxNotification.error {
                background: linear-gradient(90deg, #ff3b5c, #ff0044);
            }
            
            #furiaxNotification.warning {
                background: linear-gradient(90deg, #ff9900, #ff6600);
            }
            
            #furiaxNotification.info {
                background: linear-gradient(90deg, #1e90ff, #0066cc);
            }
            
            /* Estilo para contas sociais */
            .social-account {
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
            }
            
            .social-account:hover {
                transform: translateY(-3px);
                background: rgba(255, 255, 255, 0.05);
            }
            
            .social-account::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 0;
                height: 2px;
                transition: width 0.3s ease;
            }
            
            .social-account:hover::after {
                width: 100%;
            }
            
            .social-account:nth-child(1)::after {
                background: #1DA1F2; /* Twitter */
            }
            
            .social-account:nth-child(2)::after {
                background: #E1306C; /* Instagram */
            }
            
            .social-account:nth-child(3)::after {
                background: #6441A4; /* Twitch */
            }
            
            .social-account:nth-child(4)::after {
                background: #FF0000; /* YouTube */
            }
            
            .social-status {
                position: relative;
                padding-left: 15px;
            }
            
            .social-status::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #00cc66;
            }
            
            .social-status.not-connected::before {
                background-color: #777;
            }
            
            /* Estilos para engajamento */
            .score-circle {
                position: relative;
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: linear-gradient(45deg, #111, #222);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                margin: 0 auto 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Orbitron', sans-serif;
                font-size: 2.5rem;
                color: #1e90ff;
                border: 3px solid rgba(30, 144, 255, 0.2);
                text-shadow: 0 0 10px rgba(30, 144, 255, 0.3);
                transition: all 0.3s ease;
            }
            
            .score-circle::before {
                content: '';
                position: absolute;
                top: -3px;
                left: -3px;
                right: -3px;
                bottom: -3px;
                border-radius: 50%;
                border: 3px solid transparent;
                border-top-color: #1e90ff;
                border-right-color: #1e90ff;
                animation: rotate 2s linear infinite;
            }
            
            @keyframes rotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .engagement-breakdown {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 20px;
            }
            
            .engagement-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                padding: 10px 15px;
                transition: all 0.2s ease;
            }
            
            .engagement-item:hover {
                background: rgba(255, 255, 255, 0.05);
                transform: translateX(5px);
            }
            
            .engagement-label {
                font-size: 0.9rem;
                color: #ccc;
            }
            
            .engagement-value {
                color: #1e90ff;
                font-weight: bold;
                font-family: 'Orbitron', sans-serif;
            }
            
            /* Estilos para recompensas */
            .reward-item {
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .reward-item:hover {
                transform: translateY(-3px);
            }
            
            .reward-item.reward-completed {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0.4); }
                70% { box-shadow: 0 0 0 7px rgba(30, 144, 255, 0); }
                100% { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0); }
            }
            
            .reward-item.reward-completed .progress-fill {
                background: linear-gradient(90deg, #00cc66, #33d67d);
            }
            
            .reward-item.reward-completed .reward-title {
                color: #00cc66;
            }
            
            .reward-item.reward-completed::after {
                content: '\\f00c';
                font-family: 'Font Awesome 5 Free';
                font-weight: 900;
                position: absolute;
                right: 10px;
                top: 10px;
                color: #00cc66;
                font-size: 1.2rem;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Adicionar estilos requeridos
    addRequiredStyles();
});