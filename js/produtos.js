// Componente de anúncios patrocinados para a FURIAX
// Este script gerencia os anúncios que aparecem após o preenchimento do formulário Know Your Fan

// Base de dados de anúncios patrocinados
const sponsoredAds = [
    {
        id: 'ad-hyperx-1',
        brand: 'HyperX',
        title: 'HyperX Cloud Alpha - Headset Oficial FURIA',
        description: 'O mesmo headset usado pelos pros da FURIA. Qualidade de áudio premium para suas partidas.',
        imageUrl: '../img/ads/hyperx-headset.jpg',
        placeholderImage: true,
        targetUrl: 'https://www.hyperx.com/furia',
        category: ['hardware', 'audio'],
        games: ['all'],
        badge: '15% OFF EXCLUSIVO',
        couponCode: 'FURIAFAN15'
    },
    {
        id: 'ad-redragon-1',
        brand: 'Redragon',
        title: 'Teclado Mecânico Redragon K552 RGB',
        description: 'Precisão e velocidade para dominar suas partidas. Switches Blue para feedback tátil perfeito.',
        imageUrl: '../img/ads/redragon-keyboard.jpg',
        placeholderImage: true,
        targetUrl: 'https://www.redragon.com.br/furia',
        category: ['hardware', 'teclado'],
        games: ['cs', 'valorant', 'apex'],
        badge: 'CUPOM ESPECIAL',
        couponCode: 'FURIAPRO10'
    },
    {
        id: 'ad-logitech-1',
        brand: 'Logitech G',
        title: 'Mouse Gamer Logitech G Pro X Superlight',
        description: 'Usado pelos campeões mundiais. Ultraleve com sensor HERO 25K para precision aim.',
        imageUrl: '../img/ads/logitech-mouse.jpg',
        placeholderImage: true,
        targetUrl: 'https://www.logitechg.com/furia',
        category: ['hardware', 'mouse'],
        games: ['cs', 'valorant'],
        badge: 'PARCEIRO OFICIAL',
        couponCode: 'FURIACS20'
    },
    {
        id: 'ad-razer-1',
        brand: 'Razer',
        title: 'Razer BlackShark V2 Pro - Edição FURIA',
        description: 'Headset sem fio premium com drivers de titânio de 50mm e microfone com cancelamento de ruído.',
        imageUrl: '../img/ads/razer-headset.jpg',
        placeholderImage: true,
        targetUrl: 'https://www.razer.com/furia',
        category: ['hardware', 'audio'],
        games: ['cs', 'valorant', 'r6'],
        badge: '20% DESCONTO',
        couponCode: 'FURIA20'
    },
    {
        id: 'ad-corsair-1',
        brand: 'Corsair',
        title: 'Corsair K70 RGB - Teclado Edição FURIA',
        description: 'Switches Cherry MX Speed Silver para reações ultrarrápidas em jogos competitivos.',
        imageUrl: '../img/ads/corsair-keyboard.jpg',
        placeholderImage: true,
        targetUrl: 'https://www.corsair.com/furia',
        category: ['hardware', 'teclado'],
        games: ['cs', 'valorant', 'apex'],
        badge: 'EDIÇÃO LIMITADA',
        couponCode: 'FURIAFAN25'
    },
    {
        id: 'ad-steelseries-1',
        brand: 'SteelSeries',
        title: 'Mouse SteelSeries Aerox 3 FURIA Edition',
        description: 'Design ultraleve com 67g para movimentos rápidos. Sensor TrueMove Pro de 18.000 CPI.',
        imageUrl: '../img/ads/steelseries-mouse.jpg',
        placeholderImage: true,
        targetUrl: 'https://www.steelseries.com/furia',
        category: ['hardware', 'mouse'],
        games: ['cs', 'valorant'],
        badge: '15% DESCONTO',
        couponCode: 'FURIAVIP15'
    },
    {
        id: 'ad-asus-1',
        brand: 'ASUS ROG',
        title: 'Monitor ASUS ROG Swift 360Hz',
        description: 'O monitor dos profissionais. 360Hz para a vantagem competitiva que você precisa.',
        imageUrl: '../img/ads/asus-monitor.jpg',
        placeholderImage: true,
        targetUrl: 'https://www.asus.com/rog/furia',
        category: ['hardware', 'monitor'],
        games: ['cs', 'valorant', 'apex'],
        badge: 'FRETE GRÁTIS',
        couponCode: 'FURIAROG'
    },
    {
        id: 'ad-adidas-1',
        brand: 'Adidas',
        title: 'Tênis Adidas X FURIA - Edição Limitada',
        description: 'O estilo FURIA para o seu dia a dia. Conforto e design para os verdadeiros fans.',
        imageUrl: '../img/ads/adidas-shoes.jpg',
        placeholderImage: true,
        targetUrl: 'https://www.adidas.com.br/furia',
        category: ['vestuario', 'casual'],
        games: ['all'],
        badge: 'EXCLUSIVO',
        couponCode: 'FURIAFEET'
    },
    {
        id: 'ad-newera-1',
        brand: 'New Era',
        title: 'Boné New Era 9FORTY FURIA eSports',
        description: 'Modelo oficial usado pelo time. Estilo dentro e fora dos torneios.',
        imageUrl: '../img/ads/newera-cap.jpg',
        placeholderImage: true,
        targetUrl: 'https://www.neweracap.com.br/furia',
        category: ['vestuario', 'acessorios'],
        games: ['all'],
        badge: 'LANÇAMENTO',
        couponCode: 'FURIACAP10'
    },
    {
        id: 'ad-gfuel-1',
        brand: 'G FUEL',
        title: 'G FUEL FURIA Blend - Energia para Campeões',
        description: 'A bebida energética oficial da FURIA. Sabor exclusivo e zero açúcar.',
        imageUrl: '../img/ads/gfuel-energy.jpg',
        placeholderImage: true,
        targetUrl: 'https://gfuel.com/furia',
        category: ['consumivel', 'energia'],
        games: ['all'],
        badge: '25% NA PRIMEIRA COMPRA',
        couponCode: 'FURIAENERGY'
    },
    {
        id: 'ad-secretlab-1',
        brand: 'Secretlab',
        title: 'Cadeira Gamer Secretlab TITAN Evo 2022 FURIA Edition',
        description: 'Design exclusivo FURIA com máximo conforto para suas maratonas de jogo.',
        imageUrl: '../img/ads/secretlab-chair.jpg',
        placeholderImage: true,
        targetUrl: 'https://secretlab.com/furia',
        category: ['moveis', 'cadeira'],
        games: ['all'],
        badge: 'R$400 OFF',
        couponCode: 'FURIASIT'
    },
    {
        id: 'ad-alienware-1',
        brand: 'Alienware',
        title: 'PC Gamer Alienware Aurora R13 - Config FURIA',
        description: 'PC com as mesmas configurações usadas pelos pros da FURIA no bootcamp.',
        imageUrl: '../img/ads/alienware-pc.jpg',
        placeholderImage: true,
        targetUrl: 'https://www.dell.com/alienware/furia',
        category: ['hardware', 'pc'],
        games: ['cs', 'valorant', 'apex'],
        badge: 'PARCELAMENTO ESPECIAL',
        couponCode: 'FURIAGAMER'
    }
];

// Configuração do banner de anúncios
let adSettings = {
    showInterval: 20000, // Intervalo entre anúncios automáticos (20 segundos)
    maxAdsShown: 4,      // Máximo de anúncios mostrados por sessão
    adsShown: 0,         // Contador de anúncios mostrados
    autoRotate: true,    // Rotação automática de anúncios
    currentAdIndex: 0,   // Índice do anúncio atual
    lastShown: 0,        // Timestamp do último anúncio mostrado
    timerID: null        // ID do timer para rotação automática
};

// Função principal para inicializar o sistema de anúncios
function initAdSystem() {
    console.log("Inicializando sistema de anúncios FURIAX...");
    
    // Criar container para anúncios se não existir
    createAdContainer();
    
    // Adicionar estilos necessários
    addAdStyles();
    
    // Adicionar ouvintes de eventos para formulário
    setupFormListeners();
    
    // Configurar fechamento de anúncios
    setupAdClosing();
    
    console.log("Sistema de anúncios inicializado com sucesso");
}

// Criar container para anúncios
function createAdContainer() {
    // Verificar se já existe
    if (document.getElementById('furiax-ad-container')) return;
    
    // Criar container principal
    const adContainer = document.createElement('div');
    adContainer.id = 'furiax-ad-container';
    adContainer.classList.add('furiax-ad-container');
    adContainer.style.display = 'none'; // Inicialmente oculto
    
    // Adicionar HTML interno
    adContainer.innerHTML = `
        <div class="furiax-ad-content">
            <div class="furiax-ad-header">
                <div class="furiax-ad-title">
                    <span class="furiax-ad-sponsored">Patrocinado</span>
                    <span class="furiax-ad-brand-name">Parceiro FURIA</span>
                </div>
                <div class="furiax-ad-close">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            <div class="furiax-ad-body">
                <!-- O conteúdo do anúncio será inserido aqui -->
            </div>
            <div class="furiax-ad-footer">
                <div class="furiax-ad-disclaimer">
                    Recomendado com base no seu perfil de fã
                </div>
                <button class="furiax-ad-cta">
                    <i class="fas fa-external-link-alt"></i> Acessar
                </button>
            </div>
        </div>
    `;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(adContainer);
}

// Adicionar estilos CSS necessários
function addAdStyles() {
    // Verificar se já existem estilos
    if (document.getElementById('furiax-ad-styles')) return;
    
    // Criar elemento de estilo
    const styleElement = document.createElement('style');
    styleElement.id = 'furiax-ad-styles';
    
    // Definir estilos CSS
    styleElement.textContent = `
        .furiax-ad-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-width: 90vw;
            background: linear-gradient(145deg, #101010, #151515);
            border-radius: 15px;
            border: 1px solid rgba(30, 144, 255, 0.2);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(30, 144, 255, 0.1);
            overflow: hidden;
            z-index: 1000;
            font-family: 'Exo 2', sans-serif;
            color: #f0f0f0;
            transform: translateY(100%);
            opacity: 0;
            transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                        opacity 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .furiax-ad-container.visible {
            transform: translateY(0);
            opacity: 1;
        }
        
        .furiax-ad-content {
            position: relative;
        }
        
        .furiax-ad-header {
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .furiax-ad-title {
            display: flex;
            flex-direction: column;
        }
        
        .furiax-ad-sponsored {
            font-size: 0.7rem;
            color: #aaa;
            margin-bottom: 2px;
        }
        
        .furiax-ad-brand-name {
            font-weight: bold;
            font-family: 'Orbitron', sans-serif;
            color: var(--primary);
        }
        
        .furiax-ad-close {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .furiax-ad-close:hover {
            background: rgba(255, 59, 92, 0.2);
            color: var(--secondary);
        }
        
        .furiax-ad-body {
            padding: 0;
            position: relative;
        }
        
        .furiax-ad-image {
            width: 100%;
            height: 180px;
            position: relative;
            overflow: hidden;
        }
        
        .furiax-ad-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .furiax-ad-container:hover .furiax-ad-image img {
            transform: scale(1.05);
        }
        
        .furiax-ad-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(90deg, var(--warning), #ffad33);
            font-size: 0.7rem;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 10px;
            color: #222;
            z-index: 1;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        
        .furiax-ad-info {
            padding: 15px;
        }
        
        .furiax-ad-product-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 1rem;
            margin-bottom: 6px;
            font-weight: bold;
        }
        
        .furiax-ad-product-description {
            font-size: 0.85rem;
            color: #aaa;
            line-height: 1.4;
            margin-bottom: 10px;
        }
        
        .furiax-ad-coupon {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            background: rgba(0, 0, 0, 0.2);
            padding: 8px 10px;
            border-radius: 5px;
        }
        
        .furiax-ad-coupon-icon {
            font-size: 1.1rem;
            color: var(--warning);
        }
        
        .furiax-ad-coupon-code {
            font-family: 'Orbitron', sans-serif;
            font-weight: bold;
            letter-spacing: 1px;
            font-size: 0.9rem;
            background: linear-gradient(90deg, var(--warning), #ffad33);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            cursor: pointer;
        }
        
        .furiax-ad-coupon-text {
            color: #aaa;
            font-size: 0.75rem;
            margin-left: auto;
        }
        
        .furiax-ad-footer {
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .furiax-ad-disclaimer {
            font-size: 0.75rem;
            color: #666;
        }
        
        .furiax-ad-cta {
            background: linear-gradient(90deg, var(--primary), #36a6ff);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 12px;
            font-family: 'Exo 2', sans-serif;
            font-size: 0.8rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 2px 10px rgba(30, 144, 255, 0.2);
        }
        
        .furiax-ad-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
        }
        
        @keyframes adPulse {
            0% { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(30, 144, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(30, 144, 255, 0); }
        }
        
        .furiax-ad-pulse {
            animation: adPulse 2s infinite;
        }
        
        /* Responsividade */
        @media screen and (max-width: 480px) {
            .furiax-ad-container {
                width: calc(100% - 40px);
                bottom: 10px;
                right: 10px;
                left: 10px;
            }
            
            .furiax-ad-image {
                height: 150px;
            }
        }
    `;
    
    // Adicionar ao cabeçalho
    document.head.appendChild(styleElement);
}

// Configurar ouvintes para o formulário
function setupFormListeners() {
    // Ouvinte para envio do formulário
    document.addEventListener('formSubmitted', (event) => {
        // Mostrar primeiro anúncio após 3 segundos
        setTimeout(() => {
            showRandomAd();
            
            // Iniciar rotação automática
            if (adSettings.autoRotate) {
                startAdRotation();
            }
        }, 3000);
    });
    
    // Simular envio do formulário para fins de teste (remover em produção)
    document.addEventListener('DOMContentLoaded', () => {
        // Verificar se há botão de submissão no formulário
        const submitButton = document.querySelector('.btn-primary[onclick="submitForm()"]');
        
        if (submitButton) {
            submitButton.addEventListener('click', () => {
                // Disparar evento de envio de formulário
                document.dispatchEvent(new CustomEvent('formSubmitted'));
            });
        }
    });
}

// Configurar fechamento de anúncios
function setupAdClosing() {
    document.addEventListener('click', (event) => {
        // Verificar se o clique foi no botão de fechar
        if (event.target.closest('.furiax-ad-close')) {
            hideAd();
        }
        
        // Verificar se o clique foi no botão CTA
        if (event.target.closest('.furiax-ad-cta')) {
            const ad = getCurrentAd();
            if (ad) {
                // Abrir URL em nova aba
                window.open(ad.targetUrl, '_blank');
                // Esconder anúncio
                hideAd();
            }
        }
        
        // Verificar se o clique foi no código do cupom
        if (event.target.closest('.furiax-ad-coupon-code')) {
            const couponCode = event.target.closest('.furiax-ad-coupon-code').textContent;
            
            // Copiar para a área de transferência
            navigator.clipboard.writeText(couponCode).then(() => {
                // Mostrar mensagem de sucesso
                showCopyFeedback('Código copiado para a área de transferência!');
            }).catch(err => {
                console.error('Erro ao copiar: ', err);
            });
        }
    });
}

// Iniciar rotação automática de anúncios
function startAdRotation() {
    // Limpar timer existente
    if (adSettings.timerID) {
        clearInterval(adSettings.timerID);
    }
    
    // Definir novo timer
    adSettings.timerID = setInterval(() => {
        // Verificar se atingiu o limite
        if (adSettings.adsShown >= adSettings.maxAdsShown) {
            clearInterval(adSettings.timerID);
            return;
        }
        
        // Mostrar próximo anúncio
        showRandomAd();
    }, adSettings.showInterval);
}

// Parar rotação automática
function stopAdRotation() {
    if (adSettings.timerID) {
        clearInterval(adSettings.timerID);
        adSettings.timerID = null;
    }
}

// Mostrar anúncio aleatório
function showRandomAd() {
    // Verificar se atingiu o limite
    if (adSettings.adsShown >= adSettings.maxAdsShown) return;
    
    // Obter dados do usuário
    const userData = getUserData();
    
    // Filtrar anúncios relevantes com base no perfil
    const relevantAds = filterRelevantAds(userData);
    
    // Verificar se há anúncios disponíveis
    if (relevantAds.length === 0) return;
    
    // Selecionar anúncio aleatório
    const randomIndex = Math.floor(Math.random() * relevantAds.length);
    const selectedAd = relevantAds[randomIndex];
    
    // Mostrar anúncio
    showAd(selectedAd);
    
    // Atualizar contadores
    adSettings.adsShown++;
    adSettings.lastShown = Date.now();
    adSettings.currentAdIndex = sponsoredAds.findIndex(ad => ad.id === selectedAd.id);
}

// Filtrar anúncios relevantes com base no perfil do usuário
function filterRelevantAds(userData) {
    // Se não houver dados do usuário, retornar todos os anúncios
    if (!userData) return [...sponsoredAds];
    
    // Pontuação para cada anúncio
    const scoredAds = sponsoredAds.map(ad => {
        let score = 0;
        
        // Verificar interesses em jogos
        if (ad.games.includes('all')) {
            score += 2;
        } else if (userData.gameInterests) {
            ad.games.forEach(game => {
                if (userData.gameInterests[game] && userData.gameInterests[game] >= 3) {
                    score += userData.gameInterests[game] / 2;
                }
            });
        }
        
        // Verificar categorias de interesse
        if (userData.topicInterests) {
            ad.category.forEach(category => {
                if (category === 'hardware' && userData.topicInterests.includes('hardware')) {
                    score += 3;
                } else if (category === 'vestuario' && userData.purchasedProducts && 
                           userData.purchasedProducts.includes('jersey')) {
                    score += 2;
                }
            });
        }
        
        return {
            ...ad,
            relevanceScore: score
        };
    });
    
    // Ordenar por pontuação e pegar os mais relevantes
    return scoredAds
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 8); // Limitar aos 8 mais relevantes
}

// Mostrar anúncio específico
function showAd(ad) {
    const adContainer = document.getElementById('furiax-ad-container');
    if (!adContainer) return;
    
    // Atualizar conteúdo do anúncio
    updateAdContent(ad);
    
    // Mostrar container
    adContainer.style.display = 'block';
    
    // Iniciar animação após um pequeno delay
    setTimeout(() => {
        adContainer.classList.add('visible');
    }, 50);
}

// Atualizar conteúdo do anúncio
function updateAdContent(ad) {
    const adContainer = document.getElementById('furiax-ad-container');
    if (!adContainer) return;
    
    // Atualizar título
    const brandName = adContainer.querySelector('.furiax-ad-brand-name');
    if (brandName) brandName.textContent = ad.brand;
    
    // Atualizar corpo do anúncio
    const adBody = adContainer.querySelector('.furiax-ad-body');
    if (adBody) {
        // Limpar conteúdo anterior
        adBody.innerHTML = '';
        
        // Criar elemento de imagem
        const imageContainer = document.createElement('div');
        imageContainer.className = 'furiax-ad-image';
        
        // Determinar URL da imagem
        let imageUrl = ad.imageUrl;
        if (ad.placeholderImage) {
            // Usar imagem de placeholder se necessário
            imageUrl = `https://via.placeholder.com/350x180/0a0a0a/1e90ff?text=${encodeURIComponent(ad.brand)}`;
        }
        
        imageContainer.innerHTML = `
            <img src="${imageUrl}" alt="${ad.title}" />
            ${ad.badge ? `<div class="furiax-ad-badge">${ad.badge}</div>` : ''}
        `;
        adBody.appendChild(imageContainer);
        
        // Criar seção de informações
        const infoContainer = document.createElement('div');
        infoContainer.className = 'furiax-ad-info';
        infoContainer.innerHTML = `
            <div class="furiax-ad-product-title">${ad.title}</div>
            <div class="furiax-ad-product-description">${ad.description}</div>
            ${ad.couponCode ? `
                <div class="furiax-ad-coupon">
                    <div class="furiax-ad-coupon-icon">
                        <i class="fas fa-ticket-alt"></i>
                    </div>
                    <div class="furiax-ad-coupon-code">${ad.couponCode}</div>
                    <div class="furiax-ad-coupon-text">Clique para copiar</div>
                </div>
            ` : ''}
        `;
        adBody.appendChild(infoContainer);
    }
    
    // Atualizar botão CTA
    const ctaButton = adContainer.querySelector('.furiax-ad-cta');
    if (ctaButton) {
        ctaButton.innerHTML = `<i class="fas fa-external-link-alt"></i> Comprar agora`;
    }
}

// Esconder anúncio atual
function hideAd() {
    const adContainer = document.getElementById('furiax-ad-container');
    if (!adContainer) return;
    
    // Remover classe visível
    adContainer.classList.remove('visible');
    
    // Esconder após animação
    setTimeout(() => {
        adContainer.style.display = 'none';
    }, 500);
}

// Mostrar feedback de cópia
function showCopyFeedback(message) {
    // Verificar se já existe um feedback
    let feedback = document.getElementById('copy-feedback');
    
    if (!feedback) {
        // Criar elemento de feedback
        feedback = document.createElement('div');
        feedback.id = 'copy-feedback';
        feedback.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: rgba(0, 204, 102, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 0.9rem;
            z-index: 1001;
            transition: opacity 0.3s ease, transform 0.3s ease;
            opacity: 0;
            transform: translateY(10px);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        `;
        
        // Adicionar ao DOM
        document.body.appendChild(feedback);
    }
    
    // Atualizar mensagem
    feedback.textContent = message;
    
    // Mostrar feedback
    feedback.style.opacity = '1';
    feedback.style.transform = 'translateY(0)';
    
    // Esconder após 3 segundos
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(10px)';
        
        // Remover do DOM após animação
        setTimeout(() => {
            if (feedback.parentNode) {
                document.body.removeChild(feedback);
            }
        }, 300);
    }, 3000);
}

// Obter anúncio atual
function getCurrentAd() {
    const index = adSettings.currentAdIndex;
    return index >= 0 && index < sponsoredAds.length ? sponsoredAds[index] : null;
}

// Obter dados do usuário
function getUserData() {
    try {
        // Tentar carregar do localStorage
        const savedData = localStorage.getItem('furiax_fan_data');
        if (savedData) {
            return JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
    
    // Usar dados de mockup se necessário
    return getMockUserData();
}

// Dados mockup para teste
function getMockUserData() {
    return {
        personalData: {
            name: "João Silva",
            nickname: "FuriaX_Fan",
            location: { city: "São Paulo", state: "SP" }
        },
        gameInterests: {
            cs: 5,
            valorant: 4,
            lol: 2, 
            r6: 3,
            apex: 1
        },
        topicInterests: ["campeonatos", "bastidores", "jogadores", "estrategias", "hardware"],
        purchasedProducts: ["jersey", "mousepad", "cap"],
        purchaseAmount: "500to1000",
        contentType: "videos",
        watchFrequency: "most",
        attendedEvents: ["fan-fest-sp", "meet-greet-eldorado"]
    };
}

// Função para exibir anúncios em popup
function showPopupAd() {
    // Obter dados do usuário
    const userData = getUserData();
    
    // Filtrar anúncios relevantes
    const relevantAds = filterRelevantAds(userData);
    
    // Verificar se há anúncios disponíveis
    if (relevantAds.length === 0) return;
    
    // Selecionar anúncio aleatório
    const randomIndex = Math.floor(Math.random() * relevantAds.length);
    const selectedAd = relevantAds[randomIndex];
    
    // Criar elemento de popup
    const popupContainer = document.createElement('div');
    popupContainer.className = 'furiax-popup-ad';
    popupContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1001;
        opacity: 0;
        transition: opacity 0.5s ease;
        backdrop-filter: blur(5px);
    `;
    
    // Conteúdo do popup
    const popupContent = document.createElement('div');
    popupContent.className = 'furiax-popup-content';
    popupContent.style.cssText = `
        background: linear-gradient(145deg, #111, #151515);
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        position: relative;
        transform: scale(0.9);
        transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        overflow: hidden;
        border: 1px solid rgba(30, 144, 255, 0.2);
    `;
    
    // Determinar URL da imagem
    let imageUrl = selectedAd.imageUrl;
    if (selectedAd.placeholderImage) {
        // Usar imagem de placeholder se necessário
        imageUrl = `https://via.placeholder.com/600x300/0a0a0a/1e90ff?text=${encodeURIComponent(selectedAd.brand)}`;
    }
    
    // HTML do popup
    popupContent.innerHTML = `
        <div class="furiax-popup-close" style="position: absolute; top: 15px; right: 15px; width: 30px; height: 30px; background: rgba(0, 0, 0, 0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1; color: #fff; font-size: 16px;">
            <i class="fas fa-times"></i>
        </div>
        <div class="furiax-popup-image" style="height: 220px; overflow: hidden;">
            <img src="${imageUrl}" alt="${selectedAd.title}" style="width: 100%; height: 100%; object-fit: cover;">
            ${selectedAd.badge ? `<div class="furiax-popup-badge" style="position: absolute; top: 15px; left: 15px; background: linear-gradient(90deg, var(--warning), #ffad33); font-size: 0.8rem; font-weight: bold; padding: 5px 10px; border-radius: 20px; color: #222; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">${selectedAd.badge}</div>` : ''}
        </div>
        <div class="furiax-popup-info" style="padding: 20px;">
            <div class="furiax-popup-sponsor" style="font-size: 0.8rem; color: var(--primary); margin-bottom: 5px;">
                <i class="fas fa-ad" style="margin-right: 5px;"></i> Patrocinado por ${selectedAd.brand}
            </div>
            <div class="furiax-popup-title" style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; font-weight: bold; margin-bottom: 10px; color: #fff;">
                ${selectedAd.title}
            </div>
            <div class="furiax-popup-description" style="color: #aaa; font-size: 0.9rem; line-height: 1.5; margin-bottom: 15px;">
                ${selectedAd.description}
            </div>
            ${selectedAd.couponCode ? `
                <div class="furiax-popup-coupon" style="background: rgba(0, 0, 0, 0.2); padding: 12px 15px; border-radius: 8px; display: flex; align-items: center; margin-bottom: 20px; border: 1px dashed rgba(255, 193, 7, 0.3);">
                    <div class="furiax-popup-coupon-icon" style="font-size: 1.5rem; color: var(--warning); margin-right: 15px;">
                        <i class="fas fa-ticket-alt"></i>
                    </div>
                    <div>
                        <div class="furiax-popup-coupon-code" style="font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 1.2rem; background: linear-gradient(90deg, var(--warning), #ffad33); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 3px; cursor: pointer;">
                            ${selectedAd.couponCode}
                        </div>
                        <div class="furiax-popup-coupon-text" style="font-size: 0.8rem; color: #666;">
                            Clique para copiar o código
                        </div>
                    </div>
                </div>
            ` : ''}
            <div class="furiax-popup-cta-wrapper" style="display: flex; justify-content: center;">
                <button class="furiax-popup-cta" style="background: linear-gradient(90deg, var(--primary), #36a6ff); color: white; border: none; border-radius: 8px; padding: 12px 25px; font-family: 'Orbitron', sans-serif; font-size: 0.9rem; font-weight: bold; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; box-shadow: 0 3px 15px rgba(30, 144, 255, 0.2);">
                    <i class="fas fa-external-link-alt"></i> Acessar oferta
                </button>
            </div>
        </div>
        <div class="furiax-popup-footer" style="padding: 10px 20px; border-top: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; font-size: 0.8rem; color: #666;">
            <div>Personalizado para seu perfil</div>
            <div class="furiax-popup-skip" style="cursor: pointer;">Pular anúncio</div>
        </div>
    `;
    
    // Adicionar ao DOM
    popupContainer.appendChild(popupContent);
    document.body.appendChild(popupContainer);
    
    // Animar entrada
    setTimeout(() => {
        popupContainer.style.opacity = '1';
        popupContent.style.transform = 'scale(1)';
    }, 100);
    
    // Configurar evento de clique para fechar
    popupContainer.addEventListener('click', (event) => {
        if (event.target === popupContainer || 
            event.target.closest('.furiax-popup-close') ||
            event.target.closest('.furiax-popup-skip')) {
            // Animar saída
            popupContainer.style.opacity = '0';
            popupContent.style.transform = 'scale(0.9)';
            
            // Remover do DOM após animação
            setTimeout(() => {
                if (popupContainer.parentNode) {
                    document.body.removeChild(popupContainer);
                }
            }, 500);
        }
    });
    
    // Configurar evento para o botão CTA
    const ctaButton = popupContent.querySelector('.furiax-popup-cta');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            // Abrir URL em nova aba
            window.open(selectedAd.targetUrl, '_blank');
            
            // Fechar popup
            popupContainer.style.opacity = '0';
            popupContent.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                if (popupContainer.parentNode) {
                    document.body.removeChild(popupContainer);
                }
            }, 500);
        });
    }
    
    // Configurar evento para copiar código do cupom
    const couponCode = popupContent.querySelector('.furiax-popup-coupon-code');
    if (couponCode) {
        couponCode.addEventListener('click', () => {
            // Copiar para a área de transferência
            navigator.clipboard.writeText(selectedAd.couponCode).then(() => {
                // Mostrar mensagem de sucesso
                showCopyFeedback('Código copiado para a área de transferência!');
            }).catch(err => {
                console.error('Erro ao copiar: ', err);
            });
        });
    }
}

// Exibir banner de anúncio na parte superior
function showTopBanner() {
    // Obter dados do usuário
    const userData = getUserData();
    
    // Filtrar anúncios relevantes
    const relevantAds = filterRelevantAds(userData);
    
    // Verificar se há anúncios disponíveis
    if (relevantAds.length === 0) return;
    
    // Selecionar anúncio aleatório
    const randomIndex = Math.floor(Math.random() * relevantAds.length);
    const selectedAd = relevantAds[randomIndex];
    
    // Verificar se o banner já existe
    let banner = document.getElementById('furiax-top-banner');
    
    if (!banner) {
        // Criar elemento de banner
        banner = document.createElement('div');
        banner.id = 'furiax-top-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(90deg, #0a0a0a, #111);
            border-bottom: 1px solid rgba(30, 144, 255, 0.2);
            padding: 10px 20px;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transform: translateY(-100%);
            transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        `;
        
        // Determinar URL da imagem
        let imageUrl = selectedAd.imageUrl;
        if (selectedAd.placeholderImage) {
            // Usar imagem de placeholder se necessário
            imageUrl = `https://via.placeholder.com/100x50/0a0a0a/1e90ff?text=${encodeURIComponent(selectedAd.brand)}`;
        }
        
        // HTML do banner
        banner.innerHTML = `
            <div class="furiax-banner-left" style="display: flex; align-items: center; gap: 15px;">
                <div class="furiax-banner-brand" style="font-family: 'Orbitron', sans-serif; color: var(--primary); font-weight: bold; font-size: 0.9rem;">
                    <i class="fas fa-ad" style="margin-right: 5px;"></i> ${selectedAd.brand}
                </div>
                <div class="furiax-banner-divider" style="width: 1px; height: 30px; background: rgba(255, 255, 255, 0.1);"></div>
                <div class="furiax-banner-title" style="font-size: 0.9rem; color: #fff; font-weight: 500; max-width: 500px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${selectedAd.title}
                </div>
                ${selectedAd.couponCode ? `
                    <div class="furiax-banner-coupon" style="background: rgba(255, 193, 7, 0.1); padding: 3px 8px; border-radius: 4px; color: var(--warning); font-size: 0.8rem; font-family: 'Orbitron', sans-serif; cursor: pointer;">
                        <i class="fas fa-ticket-alt" style="margin-right: 5px;"></i> ${selectedAd.couponCode}
                    </div>
                ` : ''}
            </div>
            <div class="furiax-banner-right" style="display: flex; align-items: center; gap: 15px;">
                <button class="furiax-banner-cta" style="background: linear-gradient(90deg, var(--primary), #36a6ff); color: white; border: none; border-radius: 5px; padding: 6px 12px; font-size: 0.8rem; cursor: pointer; white-space: nowrap;">
                    Acessar
                </button>
                <div class="furiax-banner-close" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border-radius: 50%; cursor: pointer; color: #aaa;">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        `;
        
        // Adicionar ao DOM
        document.body.appendChild(banner);
    }
    
    // Atualizar banner com dados do anúncio
    const brandEl = banner.querySelector('.furiax-banner-brand');
    if (brandEl) brandEl.innerHTML = `<i class="fas fa-ad" style="margin-right: 5px;"></i> ${selectedAd.brand}`;
    
    const titleEl = banner.querySelector('.furiax-banner-title');
    if (titleEl) titleEl.textContent = selectedAd.title;
    
    const couponEl = banner.querySelector('.furiax-banner-coupon');
    if (couponEl && selectedAd.couponCode) {
        couponEl.innerHTML = `<i class="fas fa-ticket-alt" style="margin-right: 5px;"></i> ${selectedAd.couponCode}`;
    } else if (couponEl) {
        couponEl.remove();
    }
    
    // Animar entrada
    setTimeout(() => {
        banner.style.transform = 'translateY(0)';
    }, 100);
    
    // Configurar eventos
    const closeButton = banner.querySelector('.furiax-banner-close');
    if (closeButton) {
        closeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            banner.style.transform = 'translateY(-100%)';
        });
    }
    
    const ctaButton = banner.querySelector('.furiax-banner-cta');
    if (ctaButton) {
        ctaButton.addEventListener('click', (event) => {
            event.stopPropagation();
            window.open(selectedAd.targetUrl, '_blank');
        });
    }
    
    const couponCode = banner.querySelector('.furiax-banner-coupon');
    if (couponCode) {
        couponCode.addEventListener('click', (event) => {
            event.stopPropagation();
            navigator.clipboard.writeText(selectedAd.couponCode).then(() => {
                showCopyFeedback('Código copiado para a área de transferência!');
            });
        });
    }
    
    // Auto-ocultar após 15 segundos
    setTimeout(() => {
        banner.style.transform = 'translateY(-100%)';
    }, 15000);
}

// Exibir anúncios in-line entre conteúdos
function showInlineAds() {
    // Verificar se atingiu o limite
    if (adSettings.adsShown >= adSettings.maxAdsShown) return;
    
    // Obter dados do usuário
    const userData = getUserData();
    
    // Filtrar anúncios relevantes
    const relevantAds = filterRelevantAds(userData);
    
    // Verificar se há anúncios disponíveis
    if (relevantAds.length === 0) return;
    
    // Selecionar anúncio aleatório
    const randomIndex = Math.floor(Math.random() * relevantAds.length);
    const selectedAd = relevantAds[randomIndex];
    
    // Procurar lugares para inserir o anúncio (após seções)
    const sections = document.querySelectorAll('.form-section, .section-title, .profile-summary-card, .recommendation-card');
    
    if (sections.length > 3) {
        // Selecionar uma seção aleatória (não a primeira ou a última)
        const randomSectionIndex = Math.floor(Math.random() * (sections.length - 3)) + 2;
        const targetSection = sections[randomSectionIndex];
        
        // Verificar se já existe um anúncio após esta seção
        if (targetSection.nextElementSibling && 
            targetSection.nextElementSibling.classList.contains('furiax-inline-ad')) {
            return;
        }
        
        // Criar elemento de anúncio
        const inlineAd = document.createElement('div');
        inlineAd.className = 'furiax-inline-ad';
        inlineAd.style.cssText = `
            margin: 30px 0;
            background: linear-gradient(145deg, rgba(0, 0, 0, 0.2), rgba(10, 10, 15, 0.3));
            border-radius: 15px;
            border: 1px solid rgba(30, 144, 255, 0.1);
            overflow: hidden;
            position: relative;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        `;
        
        // Efeito hover
        inlineAd.addEventListener('mouseenter', () => {
            inlineAd.style.transform = 'translateY(-5px)';
            inlineAd.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
        });
        
        inlineAd.addEventListener('mouseleave', () => {
            inlineAd.style.transform = '';
            inlineAd.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.15)';
        });
        
        // Determinar URL da imagem
        let imageUrl = selectedAd.imageUrl;
        if (selectedAd.placeholderImage) {
            // Usar imagem de placeholder se necessário
            imageUrl = `https://via.placeholder.com/800x200/0a0a0a/1e90ff?text=${encodeURIComponent(selectedAd.brand)}`;
        }
        
        // HTML do anúncio
        inlineAd.innerHTML = `
            <div class="furiax-inline-sponsor" style="position: absolute; top: 10px; left: 10px; background: rgba(0, 0, 0, 0.6); padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; color: #aaa;">
                <i class="fas fa-ad" style="margin-right: 3px;"></i> Patrocinado por ${selectedAd.brand}
            </div>
            <div class="furiax-inline-close" style="position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; background: rgba(0, 0, 0, 0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #aaa; z-index: 1;">
                <i class="fas fa-times"></i>
            </div>
            ${selectedAd.badge ? `
                <div class="furiax-inline-badge" style="position: absolute; top: 10px; right: 45px; background: linear-gradient(90deg, var(--warning), #ffad33); font-size: 0.7rem; font-weight: bold; padding: 4px 8px; border-radius: 4px; color: #222; z-index: 1;">
                    ${selectedAd.badge}
                </div>
            ` : ''}
            <div style="display: flex; flex-direction: column; @media (min-width: 768px) { flex-direction: row; }">
                <div class="furiax-inline-image" style="flex: 1; height: 180px; overflow: hidden;">
                    <img src="${imageUrl}" alt="${selectedAd.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="furiax-inline-content" style="flex: 2; padding: 20px; display: flex; flex-direction: column;">
                    <div class="furiax-inline-title" style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; font-weight: bold; margin-bottom: 10px; color: #fff;">
                        ${selectedAd.title}
                    </div>
                    <div class="furiax-inline-description" style="color: #aaa; font-size: 0.9rem; flex: 1; margin-bottom: 15px;">
                        ${selectedAd.description}
                    </div>
                    <div class="furiax-inline-footer" style="display: flex; align-items: center; justify-content: space-between;">
                        ${selectedAd.couponCode ? `
                            <div class="furiax-inline-coupon" style="display: flex; align-items: center; gap: 10px; background: rgba(0, 0, 0, 0.2); padding: 8px 12px; border-radius: 5px; cursor: pointer;">
                                <i class="fas fa-ticket-alt" style="color: var(--warning);"></i>
                                <span class="furiax-inline-code" style="font-family: 'Orbitron', sans-serif; color: var(--warning); font-weight: bold; font-size: 0.9rem;">
                                    ${selectedAd.couponCode}
                                </span>
                            </div>
                        ` : `<div></div>`}
                        <button class="furiax-inline-cta" style="background: linear-gradient(90deg, var(--primary), #36a6ff); color: white; border: none; border-radius: 5px; padding: 8px 15px; font-size: 0.9rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-external-link-alt"></i> Acessar oferta
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Inserir após a seção alvo
        targetSection.insertAdjacentElement('afterend', inlineAd);
        
        // Configurar eventos
        const closeButton = inlineAd.querySelector('.furiax-inline-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                // Animar saída
                inlineAd.style.opacity = '0';
                inlineAd.style.height = '0';
                inlineAd.style.margin = '0';
                inlineAd.style.padding = '0';
                inlineAd.style.transition = 'opacity 0.3s ease, height 0.5s ease, margin 0.5s ease, padding 0.5s ease';
                
                // Remover do DOM após animação
                setTimeout(() => {
                    if (inlineAd.parentNode) {
                        inlineAd.parentNode.removeChild(inlineAd);
                    }
                }, 500);
            });
        }
        
        const ctaButton = inlineAd.querySelector('.furiax-inline-cta');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                window.open(selectedAd.targetUrl, '_blank');
            });
        }
        
        const couponEl = inlineAd.querySelector('.furiax-inline-coupon');
        if (couponEl) {
            couponEl.addEventListener('click', () => {
                navigator.clipboard.writeText(selectedAd.couponCode).then(() => {
                    showCopyFeedback('Código copiado para a área de transferência!');
                });
            });
        }
        
        // Atualizar contadores
        adSettings.adsShown++;
        adSettings.lastShown = Date.now();
    }
}

// Exibir anúncios relacionados ao conteúdo
function showRelatedAds() {
    // Verificar se há cards de recomendação
    const recommendationGrids = document.querySelectorAll('.recommendations-grid');
    if (!recommendationGrids.length) return;
    
    // Obter dados do usuário
    const userData = getUserData();
    
    // Filtrar anúncios relevantes
    const relevantAds = filterRelevantAds(userData);
    
    // Verificar se há anúncios disponíveis
    if (relevantAds.length === 0) return;
    
    // Para cada grade de recomendações
    recommendationGrids.forEach(grid => {
        // Verificar se já tem anúncios
        if (grid.querySelector('.furiax-ad-card')) return;
        
        // Verificar se há cards suficientes para justificar anúncios
        const cards = grid.querySelectorAll('.recommendation-card');
        if (cards.length < 3) return;
        
        // Selecionar até 2 anúncios
        const adCount = Math.min(2, relevantAds.length);
        
        for (let i = 0; i < adCount; i++) {
            // Selecionar anúncio
            const adIndex = i % relevantAds.length;
            const selectedAd = relevantAds[adIndex];
            
            // Calcular posição (após o 2º card e depois a cada 4 cards)
            const position = (i === 0) ? 1 : 4 + (i - 1) * 3;
            
            // Verificar se há cards suficientes
            if (position >= cards.length) continue;
            
            // Determinar URL da imagem
            let imageUrl = selectedAd.imageUrl;
            if (selectedAd.placeholderImage) {
                // Usar imagem de placeholder se necessário
                imageUrl = `https://via.placeholder.com/300x160/0a0a0a/1e90ff?text=${encodeURIComponent(selectedAd.brand)}`;
            }
            
            // Criar elemento de anúncio
            const adCard = document.createElement('div');
            adCard.className = 'recommendation-card furiax-ad-card';
            
            // Estilizar semelhante aos outros cards
            adCard.style.position = 'relative';
            adCard.style.border = '1px solid rgba(30, 144, 255, 0.15)';
            adCard.style.background = 'linear-gradient(145deg, rgba(0, 0, 0, 0.2), rgba(10, 10, 15, 0.3))';
            
            // HTML do anúncio
            adCard.innerHTML = `
                <div class="recommendation-image">
                    <img src="${imageUrl}" alt="${selectedAd.title}">
                </div>
                <div class="recommendation-content">
                   <div class="recommendation-sponsor" style="margin-bottom: 5px; font-size: 0.7rem; color: #aaa;">
                        <i class="fas fa-ad"></i> Patrocinado por ${selectedAd.brand}
                    </div>
                    <div class="recommendation-title">
                        ${selectedAd.title}
                    </div>
                    <div class="recommendation-description">
                        ${selectedAd.description}
                    </div>
                    <div class="recommendation-meta">
                        <div class="recommendation-category">${selectedAd.badge || 'Oferta'}</div>
                        ${selectedAd.couponCode ? `
                            <div class="recommendation-date">
                                <i class="fas fa-ticket-alt"></i> ${selectedAd.couponCode}
                            </div>
                        ` : ''}
                    </div>
                    <div class="recommendation-actions">
                        <button class="btn btn-primary furiax-ad-button" data-url="${selectedAd.targetUrl}">
                            <i class="fas fa-external-link-alt"></i> Ver oferta
                        </button>
                        <button class="btn-icon furiax-ad-dismiss">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Inserir no grid após a posição calculada
            const targetCard = cards[position];
            if (targetCard && targetCard.parentNode) {
                targetCard.insertAdjacentElement('afterend', adCard);
            } else {
                // Se não conseguir posicionar após um card específico, adicione ao final
                grid.appendChild(adCard);
            }
            
            // Configurar eventos
            const adButton = adCard.querySelector('.furiax-ad-button');
            if (adButton) {
                adButton.addEventListener('click', () => {
                    const url = adButton.getAttribute('data-url');
                    if (url) window.open(url, '_blank');
                });
            }
            
            const dismissButton = adCard.querySelector('.furiax-ad-dismiss');
            if (dismissButton) {
                dismissButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    
                    // Animar saída
                    adCard.style.opacity = '0';
                    adCard.style.transform = 'scale(0.9)';
                    adCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    
                    // Remover após animação
                    setTimeout(() => {
                        if (adCard.parentNode) {
                            adCard.parentNode.removeChild(adCard);
                        }
                    }, 300);
                });
            }
            
            // Configurar evento para copiar cupom
            const couponEl = adCard.querySelector('.recommendation-date');
            if (couponEl && selectedAd.couponCode) {
                couponEl.style.cursor = 'pointer';
                couponEl.addEventListener('click', (event) => {
                    event.stopPropagation();
                    navigator.clipboard.writeText(selectedAd.couponCode).then(() => {
                        showCopyFeedback('Código copiado para a área de transferência!');
                    });
                });
            }
        }
    });
}

// Gerar conjunto de anúncios para o usuário atual
function generateUserAdSet() {
    // Obter dados do usuário
    const userData = getUserData();
    
    // Filtrar anúncios relevantes
    return filterRelevantAds(userData);
}

// Exibir diferentes tipos de anúncios após o formulário
function showFormCompletionAds() {
    console.log('Exibindo anúncios após conclusão do formulário');
    
    // Definir sequência de exibição
    const adSequence = [
        // Primeiro anúncio: popup após 3 segundos
        { type: 'popup', delay: 3000 },
        // Segundo anúncio: banner superior após 15 segundos
        { type: 'banner', delay: 15000 },
        // Terceiro anúncio: card flutuante após 30 segundos
        { type: 'floatingCard', delay: 30000 },
        // Quarto anúncio: anúncios relacionados após 1 minuto
        { type: 'related', delay: 60000 }
    ];
    
    // Executar sequência
    adSequence.forEach((adItem, index) => {
        setTimeout(() => {
            switch (adItem.type) {
                case 'popup':
                    showPopupAd();
                    break;
                case 'banner':
                    showTopBanner();
                    break;
                case 'floatingCard':
                    showAd(generateUserAdSet()[0]);
                    break;
                case 'related':
                    showRelatedAds();
                    break;
                case 'inline':
                    showInlineAds();
                    break;
            }
        }, adItem.delay);
    });
}

// Funções de integração com a plataforma FURIAX

// Integrar com o formulário Know Your Fan
function integrateWithKnowYourFan() {
    console.log('Integrando sistema de anúncios com formulário Know Your Fan');
    
    // Observar envio do formulário
    const submitButton = document.querySelector('.btn-primary[onclick="submitForm()"]');
    
    if (submitButton) {
        // Remover handlers existentes para evitar duplicação
        const newButton = submitButton.cloneNode(true);
        submitButton.parentNode.replaceChild(newButton, submitButton);
        
        // Adicionar novo handler
        newButton.addEventListener('click', function() {
            // Executar a função original (importante manter!)
            if (typeof submitForm === 'function') {
                submitForm();
            }
            
            // Disparar evento de envio do formulário
            console.log('Formulário enviado, preparando anúncios...');
            document.dispatchEvent(new CustomEvent('formSubmitted'));
            
            // Iniciar sequência de anúncios
            showFormCompletionAds();
        });
    } else {
        console.log('Botão de envio do formulário não encontrado');
    }
}

// Integrar com a tela de conclusão
function integrateWithCompletionScreen() {
    // Observar quando a tela de conclusão for exibida
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'style' &&
                mutation.target.id === 'complete-content' &&
                mutation.target.style.display !== 'none') {
                
                console.log('Tela de conclusão detectada, preparando anúncios...');
                
                // Disparar evento de formulário enviado
                document.dispatchEvent(new CustomEvent('formSubmitted'));
                
                // Iniciar sequência de anúncios
                showFormCompletionAds();
                
                // Desconectar observador após detecção
                observer.disconnect();
            }
        });
    });
    
    // Configurar observador
    const completionScreen = document.getElementById('complete-content');
    if (completionScreen) {
        observer.observe(completionScreen, { attributes: true });
    }
}

// Inicialização do sistema após carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de anúncios personalizados FURIAX...');
    
    // Inicializar sistema de anúncios
    initAdSystem();
    
    // Integrar com o formulário
    integrateWithKnowYourFan();
    
    // Integrar com a tela de conclusão
    integrateWithCompletionScreen();
    
    // Para demonstração, podemos mostrar alguns anúncios automaticamente
    if (window.location.search.includes('demo=true')) {
        setTimeout(() => {
            showFormCompletionAds();
        }, 2000);
    }
});

// Interface pública para uso externo
window.FuriaxAds = {
    showPopupAd,
    showTopBanner,
    showInlineAds,
    showRelatedAds,
    showAd,
    hideAd
};