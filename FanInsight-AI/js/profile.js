/**
 * FanInsight AI - Sistema de Análise de Perfil de Fãs da FURIA
 * Gerenciamento de Perfil e Links Externos
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar o FanInsight a partir do objeto global
    const FanInsight = window.FanInsight || {};
    
    // Verificar se estamos na página correta
    if (!document.getElementById('external-links-form')) {
        if (document.getElementById('profile-container')) {
            // Estamos na página de perfil final
            setupProfilePage();
        }
        return;
    }
    
    // Preparar objeto para armazenar links externos
    if (!FanInsight.userData.externalLinks) {
        FanInsight.userData.externalLinks = [];
    }
    
    // Elementos dos botões de adição
    const addSteam = document.getElementById('add-steam');
    const addFaceit = document.getElementById('add-faceit');
    const addLiquipedia = document.getElementById('add-liquipedia');
    const addCustom = document.getElementById('add-custom');
    
    // Elementos dos campos de input
    const steamLink = document.getElementById('steam-link');
    const faceitLink = document.getElementById('faceit-link');
    const liquipediaLink = document.getElementById('liquipedia-link');
    const customLink = document.getElementById('custom-link');
    const customLinkType = document.getElementById('custom-link-type');
    
    // Elementos das áreas de confirmação
    const steamAdded = document.getElementById('steam-added');
    const faceitAdded = document.getElementById('faceit-added');
    const liquipediaAdded = document.getElementById('liquipedia-added');
    const customLinksContainer = document.getElementById('custom-links-container');
    const customLinksList = document.getElementById('custom-links-list');
    
    // Elementos de remoção
    const removeSteam = document.getElementById('remove-steam');
    const removeFaceit = document.getElementById('remove-faceit');
    const removeLiquipedia = document.getElementById('remove-liquipedia');
    
    // Outros elementos
    const finishButton = document.getElementById('finish-button');
    const analyzeLinksStatus = document.getElementById('analyze-links-status');
    const linksAnalysisProgress = document.getElementById('links-analysis-progress');
    const analyzeLinksStatusText = document.getElementById('analyze-links-status-text');
    
    // Configurar botões de adição
    addSteam.addEventListener('click', () => addExternalLink('steam', steamLink.value));
    addFaceit.addEventListener('click', () => addExternalLink('faceit', faceitLink.value));
    addLiquipedia.addEventListener('click', () => addExternalLink('liquipedia', liquipediaLink.value));
    addCustom.addEventListener('click', () => addExternalLink(customLinkType.value, customLink.value));
    
    // Configurar botões de remoção
    removeSteam.addEventListener('click', () => removeExternalLink('steam'));
    removeFaceit.addEventListener('click', () => removeExternalLink('faceit'));
    removeLiquipedia.addEventListener('click', () => removeExternalLink('liquipedia'));
    
    // Configurar botão de finalizar
    finishButton.addEventListener('click', () => {
        // Calcular o perfil final
        FanInsight.analyzeProfile();
        
        // Redirecionar para a página de perfil
        window.location.href = 'profile.html';
    });
    
    // Verificar links existentes
    checkExistingLinks();
    
    // Função para verificar links existentes
    function checkExistingLinks() {
        if (FanInsight.userData && FanInsight.userData.externalLinks) {
            const links = FanInsight.userData.externalLinks;
            
            // Verificar cada tipo de link
            links.forEach(link => {
                if (link.type === 'steam') {
                    steamLink.value = link.url;
                    updateLinkUI('steam', true);
                } else if (link.type === 'faceit') {
                    faceitLink.value = link.url;
                    updateLinkUI('faceit', true);
                } else if (link.type === 'liquipedia') {
                    liquipediaLink.value = link.url;
                    updateLinkUI('liquipedia', true);
                } else {
                    // Links personalizados
                    addCustomLinkToUI(link);
                }
            });
            
            // Se existirem links, mostrar análise
            if (links.length > 0) {
                setTimeout(startLinksAnalysis, 1000);
            }
        }
    }
    
    // Função para adicionar um link externo
    function addExternalLink(type, url) {
        // Validar URL
        if (!isValidUrl(url)) {
            alert('Por favor, insira um URL válido.');
            return;
        }
        
        // Verificar se já existe um link do mesmo tipo (exceto personalizado)
        if (type !== 'other' && type !== 'gamepedia' && type !== 'hltv' && type !== 'esports-earnings') {
            const existingIndex = FanInsight.userData.externalLinks.findIndex(link => link.type === type);
            if (existingIndex !== -1) {
                // Atualizar o existente
                FanInsight.userData.externalLinks[existingIndex].url = url;
                FanInsight.saveSession();
                return;
            }
        }
        
        // Criar novo link
        const newLink = {
            type,
            url,
            addedAt: new Date().toISOString()
        };
        
        // Adicionar à lista
        FanInsight.userData.externalLinks.push(newLink);
        
        // Salvar na sessão
        FanInsight.saveSession();
        
        // Atualizar UI
        if (type === 'steam' || type === 'faceit' || type === 'liquipedia') {
            updateLinkUI(type, true);
        } else {
            // Adicionar à lista de links personalizados
            addCustomLinkToUI(newLink);
            
            // Limpar o campo
            customLink.value = '';
        }
        
        // Iniciar análise se for o primeiro link
        if (FanInsight.userData.externalLinks.length === 1) {
            startLinksAnalysis();
        }
    }
    
    // Função para remover um link externo
    function removeExternalLink(type, customId = null) {
        if (customId) {
            // Remover link personalizado específico
            FanInsight.userData.externalLinks = FanInsight.userData.externalLinks.filter(
                (link, index) => !(index === parseInt(customId) && 
                    (link.type === 'other' || link.type === 'gamepedia' || 
                     link.type === 'hltv' || link.type === 'esports-earnings'))
            );
            
            // Atualizar UI
            document.getElementById(`custom-link-${customId}`).remove();
            
            // Se não houver mais links personalizados, esconder o container
            if (!document.querySelector('#custom-links-list li')) {
                customLinksContainer.classList.add('hidden');
            }
        } else {
            // Remover por tipo
            FanInsight.userData.externalLinks = FanInsight.userData.externalLinks.filter(
                link => link.type !== type
            );
            
            // Atualizar UI
            updateLinkUI(type, false);
            
            // Limpar o campo
            const input = document.getElementById(`${type}-link`);
            if (input) input.value = '';
        }
        
        // Salvar na sessão
        FanInsight.saveSession();
        
        // Esconder análise se não houver links
        if (FanInsight.userData.externalLinks.length === 0) {
            analyzeLinksStatus.classList.add('hidden');
        }
    }
    
    // Função para atualizar a UI do link
    function updateLinkUI(type, isAdded) {
        const addedElement = document.getElementById(`${type}-added`);
        
        if (isAdded) {
            addedElement.classList.remove('hidden');
        } else {
            addedElement.classList.add('hidden');
        }
    }
    
    // Função para adicionar um link personalizado à UI
    function addCustomLinkToUI(link) {
        // Encontrar o índice do link
        const linkIndex = FanInsight.userData.externalLinks.findIndex(l => 
            l.url === link.url && 
            (l.type === 'other' || l.type === 'gamepedia' || l.type === 'hltv' || l.type === 'esports-earnings')
        );
        
        if (linkIndex === -1) return;
        
        // Mostrar o container
        customLinksContainer.classList.remove('hidden');
        
        // Verificar se o item já existe
        const existingItem = document.getElementById(`custom-link-${linkIndex}`);
        if (existingItem) return;
        
        // Criar novo item
        const li = document.createElement('li');
        li.id = `custom-link-${linkIndex}`;
        li.className = 'flex items-center text-sm';
        
        // Mapear tipos para nomes amigáveis
        const typeNames = {
            'other': 'Outro',
            'gamepedia': 'Gamepedia',
            'hltv': 'HLTV',
            'esports-earnings': 'Esports Earnings'
        };
        
        // Obter URL formatado
        const urlObj = new URL(link.url);
        const displayUrl = `${urlObj.hostname}${urlObj.pathname.substring(0, 15)}${urlObj.pathname.length > 15 ? '...' : ''}`;
        
        li.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">${typeNames[link.type] || 'Link'}: </span>
            <a href="${link.url}" target="_blank" class="ml-1 text-blue-400 hover:underline">${displayUrl}</a>
            <button type="button" class="ml-auto text-xs text-red-400 hover:text-red-300 remove-custom-link" data-id="${linkIndex}">Remover</button>
        `;
        
        // Adicionar à lista
        customLinksList.appendChild(li);
        
        // Adicionar event listener para o botão de remover
        li.querySelector('.remove-custom-link').addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeExternalLink(null, id);
        });
    }
    
    // Função para validar URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Função para iniciar análise dos links
    function startLinksAnalysis() {
        analyzeLinksStatus.classList.remove('hidden');
        
        // Simular progresso
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            linksAnalysisProgress.style.width = `${progress}%`;
            
            // Atualizar texto de status
            if (progress < 30) {
                analyzeLinksStatusText.textContent = 'Verificando interações relacionadas à FURIA...';
            } else if (progress < 60) {
                analyzeLinksStatusText.textContent = 'Analisando histórico de partidas...';
            } else if (progress < 90) {
                analyzeLinksStatusText.textContent = 'Processando dados com IA...';
            } else {
                analyzeLinksStatusText.textContent = 'Concluindo análise...';
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                analyzeLinksStatusText.textContent = 'Concluindo análise...';
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                analyzeLinksStatusText.textContent = 'Análise concluída!';
                setTimeout(() => {
                    // Adicionar classe para mostrar sucesso
                    analyzeLinksStatus.classList.add('bg-green-800', 'bg-opacity-20', 'border', 'border-green-600');
                    
                    // Atualizar ícone
                    const statusIcon = analyzeLinksStatus.querySelector('.w-8.h-8');
                    statusIcon.classList.remove('bg-blue-600');
                    statusIcon.classList.add('bg-green-600');
                    statusIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
                }, 500);
            }
        }, 200);
    }
});

/**
 * Configuração da página de perfil final
 */
function setupProfilePage() {
    // Inicializar o FanInsight a partir do objeto global
    const FanInsight = window.FanInsight || {};
    
    // Elementos da página de perfil
    const profileContainer = document.getElementById('profile-container');
    const profileName = document.getElementById('profile-name');
    const profileLevel = document.getElementById('profile-level');
    const profileScore = document.getElementById('profile-score');
    const profileProgress = document.getElementById('profile-progress');
    const profileBadge = document.getElementById('profile-badge');
    
    // Estatísticas
    const statsGames = document.getElementById('stats-games');
    const statsTeams = document.getElementById('stats-teams');
    const statsProducts = document.getElementById('stats-products');
    const statsSocial = document.getElementById('stats-social');
    const statsLinks = document.getElementById('stats-links');
    
    // Verificar se temos dados de perfil
    if (!FanInsight.userData || !FanInsight.userData.personal || !FanInsight.userData.personal.name) {
        // Redirecionar para a página inicial se não tiver perfil
        window.location.href = '../index.html';
        return;
    }
    
    // Preencher dados do perfil
    if (profileName) profileName.textContent = FanInsight.userData.personal.name;
    
    // Preencher nível de fã
    if (profileLevel) {
        const level = FanInsight.userData.fanLevel || 'Iniciante';
        profileLevel.textContent = level;
        
        // Definir cor do badge baseado no nível
        if (profileBadge) {
            if (level === 'Superfã') {
                profileBadge.classList.add('bg-purple-600');
            } else if (level === 'Dedicado') {
                profileBadge.classList.add('bg-blue-600');
            } else if (level === 'Engajado') {
                profileBadge.classList.add('bg-green-600');
            } else {
                profileBadge.classList.add('bg-gray-600');
            }
        }
    }
    
    // Preencher pontuação
    if (profileScore) {
        const score = FanInsight.userData.profileScore || 0;
        profileScore.textContent = score;
        
        // Atualizar barra de progresso
        if (profileProgress) {
            // Máximo é 200 pontos
            const percentage = Math.min(100, (score / 200) * 100);
            profileProgress.style.width = `${percentage}%`;
        }
    }
    
    // Preencher estatísticas
    if (statsGames && FanInsight.userData.interests && FanInsight.userData.interests.games) {
        statsGames.textContent = FanInsight.userData.interests.games.length;
    }
    
    if (statsTeams && FanInsight.userData.interests && FanInsight.userData.interests.teams) {
        statsTeams.textContent = FanInsight.userData.interests.teams.length;
    }
    
    if (statsProducts && FanInsight.userData.interests && FanInsight.userData.interests.products) {
        statsProducts.textContent = FanInsight.userData.interests.products.length;
    }
    
    if (statsSocial && FanInsight.userData.socialConnections) {
        statsSocial.textContent = FanInsight.userData.socialConnections.length;
    }
    
    if (statsLinks && FanInsight.userData.externalLinks) {
        statsLinks.textContent = FanInsight.userData.externalLinks.length;
    }
    
    // Popular seção de redes sociais
    populateSocialNetworks();
    
    // Popular seção de links externos
    populateExternalLinks();
    
    // Popular seção de recomendações
    generateRecommendations();
    
    /**
     * Popular seção de redes sociais
     */
    function populateSocialNetworks() {
        const socialNetworksContainer = document.getElementById('social-networks-container');
        if (!socialNetworksContainer || !FanInsight.userData.socialConnections) return;
        
        // Limpar container
        socialNetworksContainer.innerHTML = '';
        
        // Ícones para as redes sociais
        const icons = {
            twitter: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            instagram: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            youtube: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>',
            twitch: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z" fill-rule="evenodd" clip-rule="evenodd"/></svg>'
        };
        
        // Adicionar cada rede social
        FanInsight.userData.socialConnections.forEach(connection => {
            const div = document.createElement('div');
            div.className = 'flex items-center p-3 border border-gray-700 rounded-lg';
            
            div.innerHTML = `
                <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    ${icons[connection.network] || '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>'}
                </div>
                <div>
                    <p class="font-medium">${capitalize(connection.network)}</p>
                    <p class="text-sm text-gray-400">@${connection.username}</p>
                </div>
            `;
            
            socialNetworksContainer.appendChild(div);
        });
        
        // Se não houver redes sociais, mostrar mensagem
        if (FanInsight.userData.socialConnections.length === 0) {
            socialNetworksContainer.innerHTML = `
                <div class="p-4 text-center text-gray-400">
                    <p>Nenhuma rede social conectada</p>
                </div>
            `;
        }
    }
    
    /**
     * Popular seção de links externos
     */
    function populateExternalLinks() {
        const externalLinksContainer = document.getElementById('external-links-container');
        if (!externalLinksContainer || !FanInsight.userData.externalLinks) return;
        
        // Limpar container
        externalLinksContainer.innerHTML = '';
        
        // Ícones para os links
        const icons = {
            steam: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/></svg>',
            faceit: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.97 16.114V16H6v-2.726L11.03 8.4v.114H16v2.613l-4.97 4.987z"/></svg>',
            liquipedia: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.14 5.86a4 4 0 00-5.66 0L12 7.36l-1.48-1.5a4 4 0 00-5.66 5.66l1.48 1.5L12 19.36l5.66-5.66 1.48-1.5a3.98 3.98 0 000-5.66z" /></svg>',
            other: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>',
            gamepedia: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
            hltv: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>',
            'esports-earnings': '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
        };
        
        // Mapear tipos para nomes amigáveis
        const typeNames = {
            'steam': 'Steam',
            'faceit': 'FACEIT',
            'liquipedia': 'Liquipedia',
            'other': 'Link Personalizado',
            'gamepedia': 'Gamepedia',
            'hltv': 'HLTV',
            'esports-earnings': 'Esports Earnings'
        };
        
        // Adicionar cada link externo
        FanInsight.userData.externalLinks.forEach(link => {
            const div = document.createElement('div');
            div.className = 'flex items-center p-3 border border-gray-700 rounded-lg';
            
            // Obter URL formatado
            let displayUrl = '';
            try {
                const urlObj = new URL(link.url);
                displayUrl = `${urlObj.hostname}${urlObj.pathname.substring(0, 15)}${urlObj.pathname.length > 15 ? '...' : ''}`;
            } catch (_) {
                displayUrl = link.url.substring(0, 30) + (link.url.length > 30 ? '...' : '');
            }
            
            div.innerHTML = `
                <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    ${icons[link.type] || icons.other}
                </div>
                <div>
                    <p class="font-medium">${typeNames[link.type] || 'Link Externo'}</p>
                    <a href="${link.url}" target="_blank" class="text-sm text-blue-400 hover:underline">${displayUrl}</a>
                </div>
            `;
            
            externalLinksContainer.appendChild(div);
        });
        
        // Se não houver links externos, mostrar mensagem
        if (FanInsight.userData.externalLinks.length === 0) {
            externalLinksContainer.innerHTML = `
                <div class="p-4 text-center text-gray-400">
                    <p>Nenhum link externo adicionado</p>
                </div>
            `;
        }
    }
    
    /**
     * Gerar recomendações baseadas no perfil
     */
    function generateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations-container');
        if (!recommendationsContainer) return;
        
        // Limpar container
        recommendationsContainer.innerHTML = '';
        
        // Recomendações baseadas no nível de fã
        const level = FanInsight.userData.fanLevel || 'Iniciante';
        const score = FanInsight.userData.profileScore || 0;
        
        // Lista de recomendações
        const recommendations = [];
        
        // Recomendações para iniciantes
        if (level === 'Iniciante') {
            recommendations.push({
                title: 'Conheça a história da FURIA',
                description: 'Descubra como a FURIA se tornou uma das principais organizações de e-sports do Brasil.',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>'
            });
            
            recommendations.push({
                title: 'Acompanhe a FURIA nas redes sociais',
                description: 'Siga a FURIA no Twitter, Instagram e YouTube para ficar por dentro de todas as novidades.',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>'
            });
        } 
        // Recomendações para engajados
        else if (level === 'Engajado') {
            recommendations.push({
                title: 'Assista às partidas ao vivo',
                description: 'Acompanhe as próximas partidas da FURIA ao vivo e participe dos chats durante as transmissões.',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>'
            });
            
            recommendations.push({
                title: 'Adquira produtos oficiais',
                description: 'Visite a loja oficial da FURIA e adquira camisetas, moletons e acessórios exclusivos.',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>'
            });
        } 
        // Recomendações para dedicados
        else if (level === 'Dedicado') {
            recommendations.push({
                title: 'Participe dos eventos presenciais',
                description: 'Confira o calendário de eventos e participe dos encontros oficiais da FURIA com os fãs.',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>'
            });
            
            recommendations.push({
                title: 'Entre para o clube de membros',
                description: 'Torne-se um membro oficial da FURIA e tenha acesso a conteúdos exclusivos e promoções especiais.',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>'
            });
        } 
        // Recomendações para superfãs
        else {
            recommendations.push({
                title: 'Experiências VIP exclusivas',
                description: 'Como Superfã, você tem acesso a experiências VIP como conhecer os jogadores e visitar o training center.',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>'
            });
            
            recommendations.push({
                title: 'Participe de ações exclusivas',
                description: 'Seja convidado para participar de campanhas, vídeos e ações de marketing exclusivas da FURIA.',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>'
            });
        }
        
        // Adicionar recomendações ao container
        recommendations.forEach(recommendation => {
            const div = document.createElement('div');
            div.className = 'p-4 border border-gray-700 rounded-lg mb-4';
            
            div.innerHTML = `
                <div class="flex items-start">
                    <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        ${recommendation.icon}
                    </div>
                    <div>
                        <h4 class="font-semibold mb-1">${recommendation.title}</h4>
                        <p class="text-sm text-gray-400">${recommendation.description}</p>
                    </div>
                </div>
            `;
            
            recommendationsContainer.appendChild(div);
        });
        
        // Recomendação específica baseada na pontuação
        if (score < 50) {
            const div = document.createElement('div');
            div.className = 'p-4 border border-blue-700 bg-blue-900 bg-opacity-20 rounded-lg';
            
            div.innerHTML = `
                <div class="flex items-start">
                    <div class="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-1">Aumente seu nível de fã</h4>
                        <p class="text-sm">Adicione mais redes sociais e links externos para aumentar seu nível de fã e desbloquear recomendações exclusivas!</p>
                    </div>
                </div>
            `;
            
            recommendationsContainer.appendChild(div);
        }
    }
    
    // Utilitário para capitalizar primeira letra
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}
/**
 * FanInsight AI - Sistema de Análise de Perfil de Fãs da FURIA
 * Gerenciamento de Perfil e Links Externos
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar o FanInsight a partir do objeto global
    const FanInsight = window.FanInsight || {};
    
    // Verificar se estamos na página correta
    if (!document.getElementById('external-links-form')) {
        if (document.getElementById('profile-container')) {
            // Estamos na página de perfil final
            setupProfilePage();
        }
        return;
    }
    
    // Preparar objeto para armazenar links externos
    if (!FanInsight.userData.externalLinks) {
        FanInsight.userData.externalLinks = [];
    }
    
    // Elementos dos botões de adição
    const addSteam = document.getElementById('add-steam');
    const addFaceit = document.getElementById('add-faceit');
    const addLiquipedia = document.getElementById('add-liquipedia');
    const addCustom = document.getElementById('add-custom');
    
    // Elementos dos campos de input
    const steamLink = document.getElementById('steam-link');
    const faceitLink = document.getElementById('faceit-link');
    const liquipediaLink = document.getElementById('liquipedia-link');
    const customLink = document.getElementById('custom-link');
    const customLinkType = document.getElementById('custom-link-type');
    
    // Elementos das áreas de confirmação
    const steamAdded = document.getElementById('steam-added');
    const faceitAdded = document.getElementById('faceit-added');
    const liquipediaAdded = document.getElementById('liquipedia-added');
    const customLinksContainer = document.getElementById('custom-links-container');
    const customLinksList = document.getElementById('custom-links-list');
    
    // Elementos de remoção
    const removeSteam = document.getElementById('remove-steam');
    const removeFaceit = document.getElementById('remove-faceit');
    const removeLiquipedia = document.getElementById('remove-liquipedia');
    
    // Outros elementos
    const finishButton = document.getElementById('finish-button');
    const analyzeLinksStatus = document.getElementById('analyze-links-status');
    const linksAnalysisProgress = document.getElementById('links-analysis-progress');
    const analyzeLinksStatusText = document.getElementById('analyze-links-status-text');
    
    // Configurar botões de adição
    addSteam.addEventListener('click', () => addExternalLink('steam', steamLink.value));
    addFaceit.addEventListener('click', () => addExternalLink('faceit', faceitLink.value));
    addLiquipedia.addEventListener('click', () => addExternalLink('liquipedia', liquipediaLink.value));
    addCustom.addEventListener('click', () => addExternalLink(customLinkType.value, customLink.value));
    
    // Configurar botões de remoção
    removeSteam.addEventListener('click', () => removeExternalLink('steam'));
    removeFaceit.addEventListener('click', () => removeExternalLink('faceit'));
    removeLiquipedia.addEventListener('click', () => removeExternalLink('liquipedia'));
    
    // Configurar botão de finalizar
    finishButton.addEventListener('click', () => {
        // Calcular o perfil final
        FanInsight.analyzeProfile();
        
        // Redirecionar para a página de perfil
        window.location.href = 'profile.html';
    });
    
    // Verificar links existentes
    checkExistingLinks();
    
    // Função para verificar links existentes
    function checkExistingLinks() {
        if (FanInsight.userData && FanInsight.userData.externalLinks) {
            const links = FanInsight.userData.externalLinks;
            
            // Verificar cada tipo de link
            links.forEach(link => {
                if (link.type === 'steam') {
                    steamLink.value = link.url;
                    updateLinkUI('steam', true);
                } else if (link.type === 'faceit') {
                    faceitLink.value = link.url;
                    updateLinkUI('faceit', true);
                } else if (link.type === 'liquipedia') {
                    liquipediaLink.value = link.url;
                    updateLinkUI('liquipedia', true);
                } else {
                    // Links personalizados
                    addCustomLinkToUI(link);
                }
            });
            
            // Se existirem links, mostrar análise
            if (links.length > 0) {
                setTimeout(startLinksAnalysis, 1000);
            }
        }
    }
    
    // Função para adicionar um link externo
    function addExternalLink(type, url) {
        // Validar URL
        if (!isValidUrl(url)) {
            alert('Por favor, insira um URL válido.');
            return;
        }
        
        // Verificar se já existe um link do mesmo tipo (exceto personalizado)
        if (type !== 'other' && type !== 'gamepedia' && type !== 'hltv' && type !== 'esports-earnings') {
            const existingIndex = FanInsight.userData.externalLinks.findIndex(link => link.type === type);
            if (existingIndex !== -1) {
                // Atualizar o existente
                FanInsight.userData.externalLinks[existingIndex].url = url;
                FanInsight.saveSession();
                return;
            }
        }
        
        // Criar novo link
        const newLink = {
            type,
            url,
            addedAt: new Date().toISOString()
        };
        
        // Adicionar à lista
        FanInsight.userData.externalLinks.push(newLink);
        
        // Salvar na sessão
        FanInsight.saveSession();
        
        // Atualizar UI
        if (type === 'steam' || type === 'faceit' || type === 'liquipedia') {
            updateLinkUI(type, true);
        } else {
            // Adicionar à lista de links personalizados
            addCustomLinkToUI(newLink);
            
            // Limpar o campo
            customLink.value = '';
        }
        
        // Iniciar análise se for o primeiro link
        if (FanInsight.userData.externalLinks.length === 1) {
            startLinksAnalysis();
        }
    }
    
    // Função para remover um link externo
    function removeExternalLink(type, customId = null) {
        if (customId) {
            // Remover link personalizado específico
            FanInsight.userData.externalLinks = FanInsight.userData.externalLinks.filter(
                (link, index) => !(index === parseInt(customId) && 
                    (link.type === 'other' || link.type === 'gamepedia' || 
                     link.type === 'hltv' || link.type === 'esports-earnings'))
            );
            
            // Atualizar UI
            document.getElementById(`custom-link-${customId}`).remove();
            
            // Se não houver mais links personalizados, esconder o container
            if (!document.querySelector('#custom-links-list li')) {
                customLinksContainer.classList.add('hidden');
            }
        } else {
            // Remover por tipo
            FanInsight.userData.externalLinks = FanInsight.userData.externalLinks.filter(
                link => link.type !== type
            );
            
            // Atualizar UI
            updateLinkUI(type, false);
            
            // Limpar o campo
            const input = document.getElementById(`${type}-link`);
            if (input) input.value = '';
        }
        
        // Salvar na sessão
        FanInsight.saveSession();
        
        // Esconder análise se não houver links
        if (FanInsight.userData.externalLinks.length === 0) {
            analyzeLinksStatus.classList.add('hidden');
        }
    }
    
    // Função para atualizar a UI do link
    function updateLinkUI(type, isAdded) {
        const addedElement = document.getElementById(`${type}-added`);
        
        if (isAdded) {
            addedElement.classList.remove('hidden');
        } else {
            addedElement.classList.add('hidden');
        }
    }
    
    // Função para adicionar um link personalizado à UI
    function addCustomLinkToUI(link) {
        // Encontrar o índice do link
        const linkIndex = FanInsight.userData.externalLinks.findIndex(l => 
            l.url === link.url && 
            (l.type === 'other' || l.type === 'gamepedia' || l.type === 'hltv' || l.type === 'esports-earnings')
        );
        
        if (linkIndex === -1) return;
        
        // Mostrar o container
        customLinksContainer.classList.remove('hidden');
        
        // Verificar se o item já existe
        const existingItem = document.getElementById(`custom-link-${linkIndex}`);
        if (existingItem) return;
        
        // Criar novo item
        const li = document.createElement('li');
        li.id = `custom-link-${linkIndex}`;
        li.className = 'flex items-center text-sm';
        
        // Mapear tipos para nomes amigáveis
        const typeNames = {
            'other': 'Outro',
            'gamepedia': 'Gamepedia',
            'hltv': 'HLTV',
            'esports-earnings': 'Esports Earnings'
        };
        
        // Obter URL formatado
        const urlObj = new URL(link.url);
        const displayUrl = `${urlObj.hostname}${urlObj.pathname.substring(0, 15)}${urlObj.pathname.length > 15 ? '...' : ''}`;
        
        li.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">${typeNames[link.type] || 'Link'}: </span>
            <a href="${link.url}" target="_blank" class="ml-1 text-blue-400 hover:underline">${displayUrl}</a>
            <button type="button" class="ml-auto text-xs text-red-400 hover:text-red-300 remove-custom-link" data-id="${linkIndex}">Remover</button>
        `;
        
        // Adicionar à lista
        customLinksList.appendChild(li);
        
        // Adicionar event listener para o botão de remover
        li.querySelector('.remove-custom-link').addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeExternalLink(null, id);
        });
    }
    
    // Função para validar URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Função para iniciar análise dos links
    function startLinksAnalysis() {
        analyzeLinksStatus.classList.remove('hidden');
        
        // Simular progresso
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            linksAnalysisProgress.style.width = `${progress}%`;
            
            // Atualizar texto de status
            if (progress < 30) {
                analyzeLinksStatusText.textContent = 'Verificando interações relacionadas à FURIA...';
            } else if (progress < 60) {
                analyzeLinksStatusText.textContent = 'Analisando histórico de partidas...';
            } else if (progress < 90) {
                analyzeLinksStatusText.textContent = 'Processando dados com IA...';
            } else {
                analyzeLinksStatusText.textContent = 'Concluindo análise...';
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                analyzeLinksStatusText.textContent = 'Análise concluída!';
                linksAnalysisProgress.style.width = '100%';
                setTimeout(() => {
                    analyzeLinksStatus.classList.add('hidden');
                }, 2000);
            }
                }, 1000);
            }
        });