/**
 * FanInsight AI - Sistema de Análise de Perfil de Fãs da FURIA
 * Gerenciamento de Integração com Redes Sociais
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página de redes sociais
    if (!document.getElementById('connect-twitter')) return;
    
    // Inicializar o FanInsight a partir do objeto global
    const FanInsight = window.FanInsight || {};
    
    // Preparar objeto para armazenar conexões
    if (!FanInsight.userData.socialConnections) {
        FanInsight.userData.socialConnections = [];
    }
    
    // Elementos dos botões de conexão
    const connectTwitter = document.getElementById('connect-twitter');
    const connectInstagram = document.getElementById('connect-instagram');
    const connectYoutube = document.getElementById('connect-youtube');
    const connectTwitch = document.getElementById('connect-twitch');
    
    // Elementos das áreas de conexão
    const twitterConnected = document.getElementById('twitter-connected');
    const instagramConnected = document.getElementById('instagram-connected');
    const youtubeConnected = document.getElementById('youtube-connected');
    const twitchConnected = document.getElementById('twitch-connected');
    
    // Elementos de nome de usuário
    const twitterUsername = document.getElementById('twitter-username');
    const instagramUsername = document.getElementById('instagram-username');
    const youtubeUsername = document.getElementById('youtube-username');
    const twitchUsername = document.getElementById('twitch-username');
    
    // Elementos de desconexão
    const disconnectTwitter = document.getElementById('disconnect-twitter');
    const disconnectInstagram = document.getElementById('disconnect-instagram');
    const disconnectYoutube = document.getElementById('disconnect-youtube');
    const disconnectTwitch = document.getElementById('disconnect-twitch');
    
    // Outros elementos
    const continueButton = document.getElementById('continue-button');
    const analyzeStatus = document.getElementById('analyze-status');
    const analysisProgress = document.getElementById('analysis-progress');
    const analyzeStatusText = document.getElementById('analyze-status-text');
    
    // Configurar botões de conexão
    connectTwitter.addEventListener('click', () => connectSocialNetwork('twitter'));
    connectInstagram.addEventListener('click', () => connectSocialNetwork('instagram'));
    connectYoutube.addEventListener('click', () => connectSocialNetwork('youtube'));
    connectTwitch.addEventListener('click', () => connectSocialNetwork('twitch'));
    
    // Configurar botões de desconexão
    disconnectTwitter.addEventListener('click', () => disconnectSocialNetwork('twitter'));
    disconnectInstagram.addEventListener('click', () => disconnectSocialNetwork('instagram'));
    disconnectYoutube.addEventListener('click', () => disconnectSocialNetwork('youtube'));
    disconnectTwitch.addEventListener('click', () => disconnectSocialNetwork('twitch'));
    
    // Configurar botão de continuar
    continueButton.addEventListener('click', () => {
        if (!continueButton.disabled) {
            window.location.href = 'external-links.html';
        }
    });
    
    // Verificar estado das conexões ao carregar a página
    checkConnections();
    
    // Função para verificar estado das conexões
    function checkConnections() {
        // Recuperar dados da sessão
        if (FanInsight.userData && FanInsight.userData.socialConnections) {
            const connections = FanInsight.userData.socialConnections;
            
            // Verificar cada rede social
            connections.forEach(connection => {
                updateConnectionUI(connection.network, true, connection.username);
            });
            
            // Atualizar botão de continuar
            updateContinueButton();
        }
    }
    
    // Função para conectar uma rede social (simulada)
    function connectSocialNetwork(network) {
        // Em uma implementação real, aqui seria redirecionado para a autenticação OAuth
        // Por enquanto, vamos simular o processo
        
        // Desabilitar o botão durante o "carregamento"
        const button = document.getElementById(`connect-${network}`);
        button.disabled = true;
        button.innerHTML = `<svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
        
        // Simular atraso da API
        setTimeout(() => {
            const usernames = {
                twitter: 'fan_furia',
                instagram: 'furia_fan',
                youtube: 'FuriaFanático',
                twitch: 'furia_supporter'
            };
            
            // Adicionar à lista de conexões se ainda não estiver
            const existingIndex = FanInsight.userData.socialConnections.findIndex(conn => conn.network === network);
            if (existingIndex === -1) {
                FanInsight.userData.socialConnections.push({
                    network,
                    username: usernames[network],
                    connectedAt: new Date().toISOString()
                });
            }
            
            // Salvar na sessão
            FanInsight.saveSession();
            
            // Atualizar a UI
            updateConnectionUI(network, true, usernames[network]);
            
            // Iniciar análise
            if (FanInsight.userData.socialConnections.length === 1) {
                startAnalysis();
            }
            
            // Atualizar botão de continuar
            updateContinueButton();
            
            // Restaurar botão
            button.disabled = false;
            button.textContent = 'Conectar';
        }, 1500);
    }
    
    // Função para desconectar uma rede social
    function disconnectSocialNetwork(network) {
        // Remover da lista de conexões
        FanInsight.userData.socialConnections = FanInsight.userData.socialConnections.filter(
            conn => conn.network !== network
        );
        
        // Salvar na sessão
        FanInsight.saveSession();
        
        // Atualizar a UI
        updateConnectionUI(network, false);
        
        // Atualizar botão de continuar
        updateContinueButton();
        
        // Esconder análise se não houver conexões
        if (FanInsight.userData.socialConnections.length === 0) {
            analyzeStatus.classList.add('hidden');
        }
    }
    
    // Função para atualizar a UI de conexão
    function updateConnectionUI(network, isConnected, username = '') {
        const connectButton = document.getElementById(`connect-${network}`);
        const connectedArea = document.getElementById(`${network}-connected`);
        const usernameElement = document.getElementById(`${network}-username`);
        
        if (isConnected) {
            connectButton.textContent = 'Reconectar';
            connectButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            connectButton.classList.add('bg-gray-600', 'hover:bg-gray-700');
            
            connectedArea.classList.remove('hidden');
            usernameElement.textContent = username;
        } else {
            connectButton.textContent = 'Conectar';
            connectButton.classList.remove('bg-gray-600', 'hover:bg-gray-700');
            connectButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
            
            connectedArea.classList.add('hidden');
        }
    }
    
    // Função para atualizar o botão de continuar
    function updateContinueButton() {
        if (FanInsight.userData.socialConnections.length > 0) {
            continueButton.disabled = false;
            continueButton.classList.remove('opacity-50', 'cursor-not-allowed');
            document.querySelector('.text-sm.text-gray-400.mt-3').classList.add('hidden');
        } else {
            continueButton.disabled = true;
            continueButton.classList.add('opacity-50', 'cursor-not-allowed');
            document.querySelector('.text-sm.text-gray-400.mt-3').classList.remove('hidden');
        }
    }
    
    // Função para simular o início da análise
    function startAnalysis() {
        analyzeStatus.classList.remove('hidden');
        
        // Simular progresso
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            analysisProgress.style.width = `${progress}%`;
            
            // Atualizar texto de status
            if (progress < 30) {
                analyzeStatusText.textContent = 'Encontrando interações relacionadas à FURIA...';
            } else if (progress < 60) {
                analyzeStatusText.textContent = 'Analisando padrões de engajamento...';
            } else if (progress < 90) {
                analyzeStatusText.textContent = 'Processando dados com IA...';
            } else {
                analyzeStatusText.textContent = 'Concluindo análise...';
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                analyzeStatusText.textContent = 'Análise concluída!';
                setTimeout(() => {
                    // Adicionar classe para mostrar sucesso
                    analyzeStatus.classList.add('bg-green-800', 'bg-opacity-20', 'border', 'border-green-600');
                    
                    // Atualizar ícone
                    const statusIcon = analyzeStatus.querySelector('.w-8.h-8');
                    statusIcon.classList.remove('bg-blue-600');
                    statusIcon.classList.add('bg-green-600');
                    statusIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
                }, 500);
            }
        }, 200);
    }
    
    // Verificar se há análise a ser feita
    if (FanInsight.userData.socialConnections && FanInsight.userData.socialConnections.length > 0) {
        setTimeout(startAnalysis, 1000);
    }
});