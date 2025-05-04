/**
 * Script de integração para Produtos Personalizados FURIAX
 * Este script adiciona a funcionalidade de produtos personalizados à página de experiências,
 * integrando com a interface existente e garantindo uma experiência de usuário fluida.
 */

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar a nova tab de produtos personalizados
    addPersonalizedProductsTab();
    
    // Configurar eventos da nova tab
    setupTabEvents();
    
    // Inicializar a análise de perfil do usuário
    analyzeUserProfile();
    
    // Configurar notificação de boas-vindas personalizada
    setupWelcomeNotification();
});

// Adicionar a tab de produtos personalizados à navegação
function addPersonalizedProductsTab() {
    console.log('Adicionando tab de produtos personalizados...');
    
    // Verificar se a navegação por abas existe
    const tabsNav = document.querySelector('.tabs-nav');
    if (!tabsNav) {
        console.error('Navegação por abas não encontrada');
        return;
    }
    
    // Verificar se já existe a tab
    if (document.querySelector('.tab-item[data-tab="personalized-products"]')) {
        console.log('Tab de produtos personalizados já existe');
        return;
    }
    
    // Criar nova tab
    const newTab = document.createElement('div');
    newTab.className = 'tab-item';
    newTab.setAttribute('data-tab', 'personalized-products');
    newTab.innerHTML = `<i class="fas fa-gift" style="margin-right: 5px;"></i> Para Você`;
    
    // Adicionar à navegação
    tabsNav.appendChild(newTab);
    
    // Verificar se o container de conteúdo existe
    const tabsContainer = document.querySelector('.tabs-container');
    if (!tabsContainer) {
        console.error('Container de abas não encontrado');
        return;
    }
    
    // Conteúdo já foi adicionado à página via HTML
    console.log('Tab de produtos personalizados adicionada com sucesso');
}

// Configurar eventos para a nova tab
function setupTabEvents() {
    // Obter todas as tabs
    const tabs = document.querySelectorAll('.tab-item');
    
    // Adicionar eventos de clique
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover classe ativa de todas as tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Adicionar classe ativa à tab clicada
            this.classList.add('active');
            
            // Ocultar todos os conteúdos
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Mostrar conteúdo correspondente
            const tabType = this.getAttribute('data-tab');
            const targetContent = document.getElementById(tabType + '-content');
            
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Recarregar produtos se for a tab de produtos personalizados
                if (tabType === 'personalized-products') {
                    refreshPersonalizedProducts();
                }
            }
        });
    });
}

// Analisar perfil do usuário para personalização
function analyzeUserProfile() {
    console.log('Analisando perfil do usuário...');
    
    // Tentar obter dados do localStorage
    try {
        const userData = localStorage.getItem('furiax_fan_data');
        
        if (userData) {
            const parsedData = JSON.parse(userData);
            console.log('Dados do usuário encontrados:', parsedData);
            
            // Atualizar perfil na interface
            updateProfileDisplay(parsedData);
            
            // Destacar interesses com base nos dados
            highlightUserInterests(parsedData);
            
            // Categorizar o usuário
            categorizeUser(parsedData);
            
            // Gerar recomendações específicas
            generatePersonalizedRecommendations(parsedData);
        } else {
            console.log('Dados do usuário não encontrados, usando perfil padrão');
            // Usar dados de perfil padrão ou mostrar sugestão para preencher o formulário Know Your Fan
            suggestProfileCompletion();
        }
    } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
        // Fallback para dados padrão
        suggestProfileCompletion();
    }
}

// Atualizar exibição do perfil
function updateProfileDisplay(userData) {
    // Atualizar nome no perfil
    const profileNameElement = document.getElementById('profileName');
    if (profileNameElement && userData.personalData && userData.personalData.name) {
        profileNameElement.textContent = userData.personalData.name;
    }
    
    // Atualizar localização
    const locationElement = document.querySelector('.profile-meta-item:nth-child(2)');
    if (locationElement && userData.personalData && userData.personalData.location) {
        const location = userData.personalData.location;
        const locationText = location.city && location.state ? 
            `${location.city}, ${location.state}` : 
            (location.city || location.state || 'Local não definido');
        
        locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${locationText}`;
    }
    
    // Atualizar outros elementos de perfil conforme necessário
}

// Destacar interesses do usuário nas tags
function highlightUserInterests(userData) {
    const interestTags = document.querySelectorAll('.interest-tag');
    if (!interestTags.length) return;
    
    // Reset de todos os interesses
    interestTags.forEach(tag => tag.classList.remove('active'));
    
    // Destacar interesses baseados nos dados do usuário
    if (userData.gameInterests) {
        // Destacar tags de jogos com base nas pontuações
        for (const [game, rating] of Object.entries(userData.gameInterests)) {
            if (rating >= 4) { // Destacar apenas jogos bem avaliados
                const gameTag = [...interestTags].find(tag => 
                    tag.textContent.toLowerCase().includes(game.toLowerCase())
                );
                
                if (gameTag) {
                    gameTag.classList.add('active');
                }
            }
        }
    }
    
    // Destacar outros interesses (tópicos)
    if (userData.topicInterests && Array.isArray(userData.topicInterests)) {
        userData.topicInterests.forEach(topic => {
            const topicTag = [...interestTags].find(tag => 
                tag.textContent.toLowerCase().includes(topic.toLowerCase())
            );
            
            if (topicTag) {
                topicTag.classList.add('active');
            }
        });
    }
    
    // Verificar frequência de assistir
    if (userData.watchFrequency === 'all' || userData.watchFrequency === 'most') {
        const streamingTag = [...interestTags].find(tag => 
            tag.textContent.toLowerCase().includes('streaming')
        );
        
        if (streamingTag) {
            streamingTag.classList.add('active');
        }
    }
    
    // Verificar eventos assistidos
    if (userData.attendedEvents && userData.attendedEvents.length > 0) {
        const eventsTag = [...interestTags].find(tag => 
            tag.textContent.toLowerCase().includes('eventos')
        );
        
        if (eventsTag) {
            eventsTag.classList.add('active');
        }
    }
}

// Categorizar o usuário com base no perfil
function categorizeUser(userData) {
    const fanCategoryElement = document.getElementById('fanCategory');
    if (!fanCategoryElement) return;
    
    // Determinar categoria do fã
    let fanCategory = {
        type: 'Fã Casual',
        icon: 'gamepad'
    };
    
    // Verificar jogos favoritos
    const gameRatings = Object.values(userData.gameInterests || {});
    const maxRating = Math.max(...gameRatings, 0);
    
    // Verificar frequência de assistir
    const watchesFrequently = userData.watchFrequency === 'all' || userData.watchFrequency === 'most';
    
    // Verificar produtos comprados
    const hasPurchases = userData.purchasedProducts && userData.purchasedProducts.length > 2;
    
    // Verificar eventos assistidos
    const attendsEvents = userData.attendedEvents && userData.attendedEvents.length > 0;
    
    // Determinar categoria com base nos critérios
    if (maxRating >= 4 && watchesFrequently && (hasPurchases || attendsEvents)) {
        fanCategory = {
            type: 'Gamer Hardcore',
            icon: 'gamepad'
        };
    } else if (hasPurchases) {
        fanCategory = {
            type: 'Colecionador',
            icon: 'trophy'
        };
    } else if (attendsEvents) {
        fanCategory = {
            type: 'Fã de Eventos',
            icon: 'calendar-alt'
        };
    } else if (watchesFrequently) {
        fanCategory = {
            type: 'Espectador Ávido',
            icon: 'tv'
        };
    }
    
    // Atualizar no DOM
    fanCategoryElement.innerHTML = `<i class="fas fa-${fanCategory.icon}"></i> ${fanCategory.type}`;
}

// Sugerir preenchimento do perfil caso não haja dados
function suggestProfileCompletion() {
    // Verificar se já existe a notificação
    if (document.querySelector('.profile-completion-notice')) return;
    
    // Obter seção de perfil
    const profileSection = document.querySelector('.profile-summary-card');
    if (!profileSection) return;
    
    // Criar notificação
    const notice = document.createElement('div');
    notice.className = 'profile-completion-notice';
    
    // Estilizar notificação
    Object.assign(notice.style, {
        background: 'linear-gradient(90deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05))',
        borderRadius: '10px',
        padding: '15px',
        marginTop: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px',
        border: '1px solid rgba(255, 193, 7, 0.2)'
    });
    
    // HTML da notificação
    notice.innerHTML = `
        <div style="font-size: 1.5rem; color: var(--warning);"><i class="fas fa-lightbulb"></i></div>
        <div>
            <div style="font-weight: bold; margin-bottom: 5px;">Personalize sua experiência</div>
            <div style="color: var(--gray); font-size: 0.9rem; margin-bottom: 10px;">
                Complete seu perfil no <strong>Know Your Fan</strong> para receber recomendações exclusivas e personalizadas baseadas nas suas preferências.
            </div>
            <a href="./know-your-fan.html" class="btn btn-secondary" style="font-size: 0.8rem;">
                <i class="fas fa-user-edit"></i> Completar Perfil
            </a>
        </div>
    `;
    
    // Adicionar à seção de perfil
    profileSection.appendChild(notice);
}

// Gerar recomendações personalizadas com base no perfil
function generatePersonalizedRecommendations(userData) {
    console.log('Gerando recomendações personalizadas...');
    
    // Será implementado pelo script específico de produtos personalizados
    // Observar evento personalizado para quando o script de produtos estiver pronto
    document.addEventListener('personalizedProductsReady', function(e) {
        if (e.detail && typeof e.detail.refreshProducts === 'function') {
            e.detail.refreshProducts(userData);
        }
    });
}

// Atualizar produtos personalizados
function refreshPersonalizedProducts() {
    // Dispatch evento que será capturado pelo script específico de produtos
    const event = new CustomEvent('refreshPersonalizedProducts');
    document.dispatchEvent(event);
}

// Configurar notificação de boas-vindas personalizada
function setupWelcomeNotification() {
    // Aguardar alguns segundos antes de mostrar notificação
    setTimeout(() => {
        // Obter dados do usuário para personalizar notificação
        try {
            const userData = localStorage.getItem('furiax_fan_data');
            
            if (userData) {
                const parsedData = JSON.parse(userData);
                const nickname = parsedData.personalData?.nickname || 
                                  parsedData.personalData?.name?.split(' ')[0] || 
                                  'Furioso';
                
                // Criar notificação personalizada
                showCustomNotification(`Olá ${nickname}! Temos produtos personalizados exclusivos para você. Confira a nova aba "Para Você"!`);
            } else {
                // Notificação padrão
                showCustomNotification('Confira nossa nova experiência de produtos personalizados! Preencha seu perfil para ver produtos exclusivos para você.');
            }
        } catch (error) {
            console.error('Erro ao gerar notificação personalizada:', error);
            // Notificação padrão em caso de erro
            showCustomNotification('Descubra os novos produtos exclusivos da FURIA na aba "Para Você"!');
        }
    }, 2000);
}

// Exibir notificação personalizada
function showCustomNotification(message) {
    // Verificar se já existe uma notificação
    let notification = document.querySelector('.custom-notification');
    
    if (notification) {
        // Atualizar mensagem
        notification.querySelector('.notification-message').textContent = message;
    } else {
        // Criar nova notificação
        notification = document.createElement('div');
        notification.className = 'custom-notification';
        
        // HTML da notificação
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-gift"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <div class="notification-close">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        // Estilizar notificação
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'linear-gradient(90deg, var(--primary), #36a6ff)',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            zIndex: '1000',
            maxWidth: '350px',
            transform: 'translateY(100px)',
            opacity: '0',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });
        
        // Estilizar ícone
        const iconEl = notification.querySelector('.notification-icon');
        Object.assign(iconEl.style, {
            fontSize: '1.5rem',
            color: 'white'
        });
        
        // Estilizar conteúdo
        const contentEl = notification.querySelector('.notification-content');
        Object.assign(contentEl.style, {
            flex: '1'
        });
        
        // Estilizar botão de fechar
        const closeEl = notification.querySelector('.notification-close');
        Object.assign(closeEl.style, {
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.7)',
            transition: 'var(--transition)'
        });
        
        // Adicionar ao DOM
        document.body.appendChild(notification);
        
        // Adicionar evento de fechar
        closeEl.addEventListener('click', function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(100px)';
            
            // Remover do DOM após animação
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 500);
        });
    }
    
    // Mostrar notificação
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Esconder notificação após alguns segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(100px)';
        
        // Remover do DOM após animação
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 7000);
}

// Evento de integração - disparado quando tudo estiver pronto
document.dispatchEvent(new CustomEvent('furiaxIntegrationReady'));

console.log('✅ Script de integração FURIAX carregado com sucesso');