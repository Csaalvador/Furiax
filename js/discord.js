/**
 * FURIAX Community - Página de callback do Discord
 * Esta página processa o retorno da autenticação do Discord
 *//**
 * Script simples para mudar o status do Discord para "Conectado" ao clicar
 */
document.addEventListener('DOMContentLoaded', function() {
    // Encontrar todos os elementos Discord
    const allElements = document.querySelectorAll('.social-account');
    
    allElements.forEach(account => {
      const nameElement = account.querySelector('.social-name');
      
      // Se for o elemento do Discord
      if (nameElement && nameElement.textContent.includes('Discord')) {
        // Adiciona evento de clique ao elemento inteiro
        account.addEventListener('click', function(e) {
          // Impedir comportamento padrão
          e.preventDefault();
          
          // Encontrar o elemento de status dentro desta conta
          const statusElement = account.querySelector('.social-status');
          
          if (statusElement) {
            // Atualizar o status para "Conectado" em verde
            statusElement.innerHTML = 'Conectado';
            statusElement.style.color = '#43b581'; // Verde do Discord
            statusElement.style.backgroundColor = 'rgba(67, 181, 129, 0.2)';
            statusElement.style.padding = '4px 8px';
            statusElement.style.borderRadius = '4px';
            statusElement.style.fontWeight = 'bold';
            statusElement.classList.remove('not-connected');
            
            // Salvar no localStorage para persistir
            localStorage.setItem('discord_connected', 'true');
            
            console.log('Discord conectado!');
          }
        });
      }
    });
  });

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Página de callback do Discord carregada');
    
    // Função para processar parâmetros da URL
    function processCallbackParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        // Elemento para mostrar status
        const statusElement = document.getElementById('auth-status') || document.createElement('div');
        statusElement.id = 'auth-status';
        document.body.appendChild(statusElement);
        
        // Estilizar elemento de status
       
        
        if (code) {
            // Temos um código de autorização
            console.log('✅ Código de autorização recebido:', code);
            
            // Atualizar status
            statusElement.innerHTML = `
                <div style="font-size: 48px; color: #7289da; margin-bottom: 20px;">
                    <i class="fab fa-discord"></i>
                </div>
                <h2 style="margin: 0 0 10px; color: white;">Autenticando...</h2>
                <p style="margin: 0 0 20px; color: #b9bbbe;">Processando autenticação com Discord</p>
                <div class="loading-spinner" style="
                    width: 32px;
                    height: 32px;
                    border: 3px solid rgba(114, 137, 218, 0.3);
                    border-top-color: #7289da;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                "></div>
                <style>
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            // Enviar código para a página principal
            try {
                // Tentar enviar para a janela pai (se for um popup)
                if (window.opener && !window.opener.closed) {
                    console.log('📨 Enviando código para janela pai');
                    window.opener.postMessage({
                        type: 'discord-callback',
                        code: code
                    }, window.location.origin);
                    
                    // Atualizar status
                    setTimeout(() => {
                        statusElement.innerHTML = `
                            <div style="font-size: 48px; color: #43b581; margin-bottom: 20px;">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h2 style="margin: 0 0 10px; color: white;">Autenticado!</h2>
                            <p style="margin: 0 0 20px; color: #b9bbbe;">Você será redirecionado automaticamente...</p>
                        `;
                        
                        // Fechar janela após um pequeno delay (se for popup)
                        setTimeout(() => {
                            window.close();
                        }, 2000);
                    }, 1500);
                    
                    return;
                }
                
                // Se não for popup, armazenar código no localStorage e redirecionar
                console.log('💾 Armazenando código no localStorage');
                localStorage.setItem('discord_auth_code', code);
                localStorage.setItem('discord_auth_time', Date.now().toString());
                
                // Redirecionar para a página principal
                setTimeout(() => {
                    statusElement.innerHTML = `
                        <div style="font-size: 48px; color: #43b581; margin-bottom: 20px;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h2 style="margin: 0 0 10px; color: white;">Autenticado!</h2>
                        <p style="margin: 0 0 20px; color: #b9bbbe;">Redirecionando para a página principal...</p>
                    `;
                    
                    // Redirecionar para a página principal após breve delay
                    setTimeout(() => {
                        window.location.href = '/'; // Redirecionar para a raiz do site
                    }, 1500);
                }, 1000);
            } catch (e) {
                console.error('❌ Erro ao processar código:', e);
                
                // Mostrar erro
                statusElement.innerHTML = `
                    <div style="font-size: 48px; color: #f04747; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h2 style="margin: 0 0 10px; color: white;">Erro</h2>
                    <p style="margin: 0 0 20px; color: #b9bbbe;">Ocorreu um erro ao processar a autenticação.</p>
                    <button id="returnButton" style="
                        background-color: #7289da;
                        color: white;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">Voltar para a página principal</button>
                `;
                
                // Adicionar evento ao botão
                document.getElementById('returnButton').addEventListener('click', () => {
                    window.location.href = '/';
                });
            }
        } else if (error) {
            // Erro na autenticação
            console.error('❌ Erro de autenticação:', error);
            
            // Mostrar erro
            statusElement.innerHTML = `
                <div style="font-size: 48px; color: #f04747; margin-bottom: 20px;">
                    <i class="fas fa-times-circle"></i>
                </div>
                <h2 style="margin: 0 0 10px; color: white;">Autenticação Cancelada</h2>
                <p style="margin: 0 0 20px; color: #b9bbbe;">${error}</p>
                <button id="returnButton" style="
                    background-color: #7289da;
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                ">Voltar para a página principal</button>
            `;
            
            // Adicionar evento ao botão
            document.getElementById('returnButton').addEventListener('click', () => {
                window.location.href = '/';
            });
            
            // Tentar enviar erro para a janela pai
            try {
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({
                        type: 'discord-callback',
                        error: error
                    }, window.location.origin);
                    
                    // Fechar janela após um delay
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                }
            } catch (e) {
                console.error('❌ Erro ao enviar mensagem para janela pai:', e);
            }
        } else {
            // Nem código nem erro - situação inesperada
            console.log('⚠️ Página de callback aberta sem parâmetros');
            
            // Mostrar mensagem
        
                
                
            
            // Adicionar eventos aos botões
            document.getElementById('loginButton').addEventListener('click', () => {
                // Gerar URL de autenticação do Discord (igual ao da página principal)
                const CLIENT_ID = '1369749356793823302';
                const REDIRECT_URI = encodeURIComponent(window.location.origin + '/pages/discord-callback.html');
                
                const SCOPES = encodeURIComponent('identify guilds.members.read relationships.read');
                const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}`;
                window.location.href = authUrl;
            });
            
            document.getElementById('returnButton').addEventListener('click', () => {
                window.location.href = '/';
            });
        }
    }
    
    // Processar os parâmetros
    processCallbackParams();
});


document.addEventListener('DOMContentLoaded', function() {
    console.log('🔌 Inicializando integração avançada com Discord...');
    
    // Configurações da API Discord
    const DISCORD_CONFIG = {
        CLIENT_ID: '1369749356793823302', // ID do cliente Discord fornecido
        CLIENT_SECRET: 'SqsTTs0TDdn1KfkJWXBA-kCujXPUXAZk', // Segredo do cliente Discord fornecido
        REDIRECT_URI: encodeURIComponent(window.location.origin + '/http://127.0.0.1:5501/pages/community.html'),
        API_ENDPOINT: 'https://discord.com/api/v10',
        SCOPES: encodeURIComponent('identify guilds.members.read relationships.read'),
        STORAGE_KEY: 'furiax_discord_auth',
        FRIENDS_CONTAINER_ID: 'discord-friends-list'
    };
    
    // Status dos amigos do Discord
    const DISCORD_STATUS = {
        ONLINE: { 
            label: 'Online', 
            class: 'status-online',
            icon: '<i class="fas fa-circle status-icon online"></i>'
        },
        IDLE: { 
            label: 'Ausente', 
            class: 'status-idle',
            icon: '<i class="fas fa-moon status-icon idle"></i>' 
        },
        DND: { 
            label: 'Não perturbe', 
            class: 'status-dnd',
            icon: '<i class="fas fa-minus-circle status-icon dnd"></i>' 
        },
        OFFLINE: { 
            label: 'Offline', 
            class: 'status-offline',
            icon: '<i class="fas fa-circle status-icon offline"></i>' 
        }
    };
    
    // Gerenciador do Discord
    const DiscordManager = {
        // Dados de autenticação
        auth: null,
        
        // Dados do usuário
        userData: null,
        
        // Lista de amigos
        friends: [],
        
        // Estado da conexão
        isConnected: false,
        
        // Inicializar o módulo
        init: function() {
            console.log('⚡ Inicializando gerenciador real do Discord...');
            
            // Adicionar estilo CSS
            this.addStyles();
            
            // Carregar dados salvos
            this.loadStoredAuth();
            
            // Verificar autenticação e buscar amigos se estiver conectado
            this.checkAuth();
            
            // Configurar eventos de UI
            this.setupUIEvents();
            
            return this;
        },
        
        // Adicionar estilos CSS
        addStyles: function() {
            const styleEl = document.createElement('style');
            styleEl.innerHTML = `
                /* Estilo da seção Discord */
              
                
                .discord-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .discord-title {
                    font-size: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .discord-title i {
                    color: #5865F2;
                }
                
                .discord-status {
                    font-size: 12px;
                    padding: 3px 8px;
                    border-radius: 12px;
                }
                
                .discord-status.connected {
                    background: rgba(82, 196, 26, 0.2);
                    color: #52c41a;
                }
                
                .discord-status.disconnected {
                    color: #ff4d4f;
                }
                
                /* Botão de login com Discord */
                .discord-login-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: #5865F2;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 10px 15px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    transition: background 0.2s;
                }
                
                .discord-login-btn:hover {
                    background: #4752C4;
                }
                
                .discord-login-info {
                    text-align: center;
                    font-size: 12px;
                    color: #b9bbbe;
                    margin-top: 10px;
                }
                
                /* Perfil do usuário Discord */
                .discord-user-profile {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .discord-user-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #36393f;
                }
                
                .discord-user-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .discord-user-info {
                    flex: 1;
                }
                
                .discord-username {
                    font-weight: 600;
                    font-size: 14px;
                    color: white;
                }
                
                .discord-tag {
                    font-size: 12px;
                    color: #b9bbbe;
                }
                
                /* Lista de amigos */
                .discord-friends-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .discord-friends-title {
                    font-size: 14px;
                    color: #b9bbbe;
                    font-weight: 600;
                }
                
                .discord-refresh-btn {
                    font-size: 12px;
                    color: #5865F2;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .discord-refresh-btn:hover {
                    text-decoration: underline;
                }
                
                .discord-search-bar {
                    display: flex;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 5px;
                    padding: 5px 10px;
                    margin-bottom: 10px;
                }
                
                .discord-search-bar i {
                    color: #b9bbbe;
                    margin-right: 8px;
                }
                
                .discord-search-bar input {
                    background: transparent;
                    border: none;
                    color: white;
                    flex: 1;
                    font-size: 13px;
                    outline: none;
                }
                
                .discord-search-bar input::placeholder {
                    color: #72767d;
                }
                
                .discord-friends-list {
                    max-height: 350px;
                    overflow-y: auto;
                    padding-right: 5px;
                }
                
                /* Estilização para scrollbar */
                .discord-friends-list::-webkit-scrollbar {
                    width: 6px;
                }
                
                .discord-friends-list::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 3px;
                }
                
                .discord-friends-list::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }
                
                .discord-friends-list::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                
                /* Item de amigo */
                .discord-friend {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px;
                    border-radius: 5px;
                    transition: background 0.2s;
                    cursor: pointer;
                    position: relative;
                    margin-bottom: 2px;
                }
                
                .discord-friend:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .friend-avatar {
                    position: relative;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #36393f;
                }
                
                .friend-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .status-icon {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    font-size: 10px;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #2f3136;
                    border: 2px solid #2f3136;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .status-icon.online {
                    color: #3ba55c;
                }
                
                .status-icon.idle {
                    color: #faa61a;
                }
                
                .status-icon.dnd {
                    color: #ed4245;
                }
                
                .status-icon.offline {
                    color: #747f8d;
                }
                
                .friend-info {
                    flex: 1;
                    overflow: hidden;
                }
                
                .friend-name {
                    font-weight: 500;
                    font-size: 14px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .friend-activity {
                    font-size: 12px;
                    color: #b9bbbe;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                /* Estados da lista de amigos */
                .friends-empty {
                    text-align: center;
                    padding: 20px 0;
                    color: #b9bbbe;
                    font-size: 13px;
                }
                
                .loading-friends {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px 0;
                    color: #b9bbbe;
                    font-size: 13px;
                }
                
                .loading-spinner {
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top: 3px solid #5865F2;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 10px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Botão de logout */
                .discord-logout {
                    text-align: center;
                    font-size: 12px;
                    color: #b9bbbe;
                    margin-top: 10px;
                    cursor: pointer;
                }
                
                .discord-logout:hover {
                    color: #ed4245;
                    text-decoration: underline;
                }
            `;
            document.head.appendChild(styleEl);
        },
        
        // Carregar dados de autenticação do localStorage
        loadStoredAuth: function() {
            try {
                const storedAuth = localStorage.getItem(DISCORD_CONFIG.STORAGE_KEY);
                if (storedAuth) {
                    this.auth = JSON.parse(storedAuth);
                    
                    // Verificar se o token expirou
                    if (this.auth && this.auth.expires_at) {
                        const now = Date.now();
                        if (now >= this.auth.expires_at) {
                            console.log('🔄 Token Discord expirado');
                            this.auth = null;
                            localStorage.removeItem(DISCORD_CONFIG.STORAGE_KEY);
                        } else {
                            this.isConnected = true;
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao carregar dados de autenticação:', error);
                this.auth = null;
                this.isConnected = false;
            }
        },
        
        // Salvar dados de autenticação
        saveAuth: function(authData) {
            try {
                localStorage.setItem(DISCORD_CONFIG.STORAGE_KEY, JSON.stringify(authData));
                return true;
            } catch (error) {
                console.error('❌ Erro ao salvar dados de autenticação:', error);
                return false;
            }
        },
        
        // Verificar autenticação e iniciar busca de amigos
        checkAuth: function() {
            if (this.isConnected && this.auth && this.auth.access_token) {
                // Buscar dados do usuário
                this.fetchUserProfile()
                    .then(userData => {
                        this.userData = userData;
                        this.renderDiscordUI();
                        
                        // Buscar amigos depois de obter dados do usuário
                        return this.fetchFriends();
                    })
                    .then(friends => {
                        this.friends = friends;
                        this.renderFriendsList();
                    })
                    .catch(error => {
                        console.error('❌ Erro ao verificar autenticação:', error);
                        this.isConnected = false;
                        this.renderDiscordUI();
                    });
            } else {
                this.isConnected = false;
                this.renderDiscordUI();
            }
        },
        
        // Iniciar processo de login com Discord
        login: function() {
            console.log('🔑 Iniciando login com Discord...');
            
            const authUrl = `${DISCORD_CONFIG.API_ENDPOINT}/oauth2/authorize?client_id=${DISCORD_CONFIG.CLIENT_ID}&redirect_uri=${DISCORD_CONFIG.REDIRECT_URI}&response_type=code&scope=${DISCORD_CONFIG.SCOPES}`;
            
            // Abrir janela de autorização
            const authWindow = window.open(authUrl, 'discord-auth', 'width=600,height=800');
            
            // Ouvir mensagem do callback
            window.addEventListener('message', (event) => {
                // Verificar origem da mensagem
                if (event.origin !== window.location.origin) return;
                
                // Processar código de autorização
                if (event.data && event.data.type === 'discord-callback' && event.data.code) {
                    console.log('📩 Código de autorização recebido');
                    
                    // Trocar código por token (simulado para demonstração)
                    this.exchangeCodeForToken(event.data.code);
                    
                    // Fechar janela de autorização
                    if (authWindow && !authWindow.closed) {
                        authWindow.close();
                    }
                }
            });
        },
        
        // Trocar código de autorização por token (simulado)
        exchangeCodeForToken: function(code) {
            console.log('🔄 Trocando código por token...');
            
            // Simulação de troca de código por token
            // Em produção, isso deve ser feito no backend por segurança
            setTimeout(() => {
                // Dados simulados do token
                const tokenData = {
                    access_token: `discord_${DISCORD_CONFIG.CLIENT_SECRET.substring(0, 10)}`,
                    refresh_token: 'refresh_' + Math.random().toString(36).substring(2),
                    expires_in: 604800, // 7 dias
                    token_type: 'Bearer',
                    scope: 'identify guilds.members.read relationships.read',
                    expires_at: Date.now() + 604800000 // Data atual + 7 dias
                };
                
                // Salvar token
                this.auth = tokenData;
                this.isConnected = true;
                this.saveAuth(tokenData);
                
                // Buscar dados do usuário e amigos
                this.checkAuth();
                
                // Exibir notificação
                this.showNotification('Conectado ao Discord com sucesso!', 'success');
            }, 1000);
        },
        
        // Buscar perfil do usuário (simulado)
        fetchUserProfile: function() {
            return new Promise((resolve, reject) => {
                if (!this.auth || !this.auth.access_token) {
                    reject(new Error('Não autenticado'));
                    return;
                }
                
                // Simulação de requisição à API
                setTimeout(() => {
                    // Dados simulados do usuário
                    const userData = {
                        id: '123456789012345678',
                        username: 'FURIAX_Fan',
                        discriminator: '1234',
                        avatar: null,
                        banner: null,
                        banner_color: '#5865F2',
                        accent_color: 5793266,
                        locale: 'pt-BR',
                        verified: true
                    };
                    
                    resolve(userData);
                }, 500);
            });
        },
        
        // Buscar amigos (simulado)
        fetchFriends: function() {
            return new Promise((resolve, reject) => {
                if (!this.auth || !this.auth.access_token) {
                    reject(new Error('Não autenticado'));
                    return;
                }
                
                // Exibir carregamento
                const friendsContainer = document.getElementById(DISCORD_CONFIG.FRIENDS_CONTAINER_ID);
                if (friendsContainer) {
                    friendsContainer.innerHTML = `
                        <div class="loading-friends">
                            <div class="loading-spinner"></div>
                            <span>Carregando seus amigos...</span>
                        </div>
                    `;
                }
                
                // Simulação de requisição à API
                setTimeout(() => {
                    // Lista de amigos simulados com status e atividades
                    const friends = [
                        {
                            id: '111222333444555',
                            username: 'ArtFan',
                            discriminator: '4321',
                            avatar: null,
                            status: 'online',
                            activity: {
                                name: 'Counter-Strike 2',
                                type: 0
                            }
                        },
                        {
                            id: '222333444555666',
                            username: 'FuriaLovers',
                            discriminator: '5678',
                            avatar: null,
                            status: 'idle',
                            activity: null
                        },
                        {
                            id: '333444555666777',
                            username: 'KscePRO',
                            discriminator: '9012',
                            avatar: null,
                            status: 'dnd',
                            activity: {
                                name: 'Valorant',
                                type: 0
                            }
                        },
                        {
                            id: '444555666777888',
                            username: 'FalleNator',
                            discriminator: '3456',
                            avatar: null,
                            status: 'online',
                            activity: {
                                name: 'League of Legends',
                                type: 0
                            }
                        },
                        {
                            id: '555666777888999',
                            username: 'BrazilGaming',
                            discriminator: '7890',
                            avatar: null,
                            status: 'offline',
                            activity: null
                        }
                    ];
                    
                    resolve(friends);
                }, 800);
            });
        },
        
        // Desconectar do Discord
        logout: function() {
            console.log('👋 Desconectando do Discord...');
            
            // Limpar dados
            this.auth = null;
            this.userData = null;
            this.friends = [];
            this.isConnected = false;
            
            // Remover do localStorage
            localStorage.removeItem(DISCORD_CONFIG.STORAGE_KEY);
            
            // Atualizar UI
            this.renderDiscordUI();
            
            // Exibir notificação
            this.showNotification('Desconectado do Discord', 'info');
        },
        
        // Atualizar lista de amigos
        refreshFriends: function() {
            console.log('🔄 Atualizando lista de amigos...');
            
            // Exibir estado de carregamento
            const friendsContainer = document.getElementById(DISCORD_CONFIG.FRIENDS_CONTAINER_ID);
            if (friendsContainer) {
                friendsContainer.innerHTML = `
                    <div class="loading-friends">
                        <div class="loading-spinner"></div>
                        <span>Atualizando amigos...</span>
                    </div>
                `;
            }
            
            // Buscar amigos novamente
            this.fetchFriends()
                .then(friends => {
                    this.friends = friends;
                    this.renderFriendsList();
                    this.showNotification('Lista de amigos atualizada!', 'success');
                })
                .catch(error => {
                    console.error('❌ Erro ao atualizar amigos:', error);
                    this.renderFriendsList();
                    this.showNotification('Erro ao atualizar amigos', 'error');
                });
        },
        
        // Renderizar UI do Discord no painel de amigos
        renderDiscordUI: function() {
            console.log('🎨 Renderizando UI do Discord');
            
            // Encontrar o contêiner de amigos do Discord
            const friendsPanel = document.querySelector('.discord-friends-panel');
            if (!friendsPanel) {
                console.error('❌ Contêiner de amigos não encontrado');
                return;
            }
            
            // Substituir o conteúdo existente
            friendsPanel.innerHTML = `
                <div class="fan-stat-title">
                    <i class="fab fa-discord"></i> Discord
                    <span class="discord-status ${this.isConnected ? 'connected' : 'disconnected'}">
                    </span>
                </div>
                <div class="fan-stat-value">
                    ${this.isConnected ? this.getConnectedUI() : this.getDisconnectedUI()}
                </div>
            `;
            
            // Configurar eventos se conectado
            if (this.isConnected) {
                // Evento para atualizar amigos
                const refreshBtn = friendsPanel.querySelector('.discord-refresh-btn');
                if (refreshBtn) {
                    refreshBtn.addEventListener('click', () => this.refreshFriends());
                }
                
                // Evento para desconectar
                const logoutBtn = friendsPanel.querySelector('.discord-logout');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => this.logout());
                }
                
                // Configurar busca
                const searchInput = friendsPanel.querySelector('#friend-search');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => this.filterFriends(e.target.value));
                }
            } else {
                // Evento para conectar
                const loginBtn = friendsPanel.querySelector('.discord-login-btn');
                if (loginBtn) {
                    loginBtn.addEventListener('click', () => this.login());
                }
            }
        },
        
        // Obter HTML para UI conectada
        getConnectedUI: function() {
            const username = this.userData ? this.userData.username : 'Discord User';
            const discriminator = this.userData ? this.userData.discriminator : '0000';
            
            return `
                <div class="discord-connected-ui">
                    <div class="discord-user-profile">
                        <div class="discord-user-avatar">
                            ${this.userData && this.userData.avatar 
                                ? `<img src="https://cdn.discordapp.com/avatars/${this.userData.id}/${this.userData.avatar}.png" alt="Avatar">`
                                : `<div class="avatar-placeholder">${username.substring(0, 2).toUpperCase()}</div>`
                            }
                        </div>
                        <div class="discord-user-info">
                            <div class="discord-username">${username}</div>
                            <div class="discord-tag">#${discriminator}</div>
                        </div>
                    </div>
                    
                    <div class="discord-friends-header">
                        <div class="discord-friends-title">Amigos Online</div>
                        <div class="discord-refresh-btn">
                            <i class="fas fa-sync-alt"></i> Atualizar
                        </div>
                    </div>
                    
                    <div class="discord-search-bar">
                        <i class="fas fa-search"></i>
                        <input type="text" id="friend-search" placeholder="Buscar amigo...">
                    </div>
                    
                    <div class="discord-friends-list" id="${DISCORD_CONFIG.FRIENDS_CONTAINER_ID}">
                        <div class="loading-friends">
                            <div class="loading-spinner"></div>
                            <span>Carregando seus amigos...</span>
                        </div>
                    </div>
                    
                    <div class="discord-logout">Desconectar Discord</div>
                </div>
            `;
        },
        
        // Obter HTML para UI desconectada
        getDisconnectedUI: function() {
            return `
                <div class="c">
                 <a href="https://discord.com/oauth2/authorize?client_id=1369749356793823302&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A5501%2Fpages%2Fdiscord-callback.html&scope=identify">   
                <button class="discord-login-btn">
                        <i class="fab fa-discord"></i>
                     Conectar com Discord
                 

                    </button>
                       </a>
                    <div class="discord-login-info">
                        Conecte sua conta para nós saber mais sobre você!
                    </div>
                </div>
            `;
            
        },
        
        // Renderizar lista de amigos
        renderFriendsList: function() {
            const friendsContainer = document.getElementById(DISCORD_CONFIG.FRIENDS_CONTAINER_ID);
            if (!friendsContainer) return;
            
            // Verificar se há amigos
            if (!this.friends || this.friends.length === 0) {
                friendsContainer.innerHTML = `
                    <div class="friends-empty">
                        <i class="fas fa-user-friends"></i>
                        <p>Nenhum amigo online encontrado</p>
                    </div>
                `;
                return;
            }
            
            // Filtrar amigos online primeiro
            const sortedFriends = [...this.friends].sort((a, b) => {
                // Ordem: online, idle, dnd, offline
                const statusOrder = { online: 1, idle: 2, dnd: 3, offline: 4 };
                return statusOrder[a.status] - statusOrder[b.status];
            });
            
            // Renderizar lista de amigos
            friendsContainer.innerHTML = sortedFriends.map(friend => {
                const status = DISCORD_STATUS[friend.status.toUpperCase()] || DISCORD_STATUS.OFFLINE;
                const activity = friend.activity ? `Jogando ${friend.activity.name}` : status.label;
                
                return `
                    <div class="discord-friend" data-id="${friend.id}" data-username="${friend.username.toLowerCase()}">
                        <div class="friend-avatar">
                            ${friend.avatar 
                                ? `<img src="https://cdn.discordapp.com/avatars/${friend.id}/${friend.avatar}.png" alt="Avatar">`
                                : `<div class="avatar-placeholder">${friend.username.substring(0, 2).toUpperCase()}</div>`
                            }
                            ${status.icon}
                        </div>
                        <div class="friend-info">
                            <div class="friend-name">${friend.username}</div>
                            <div class="friend-activity">${activity}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Adicionar eventos de clique nos amigos
            const friendElements = friendsContainer.querySelectorAll('.discord-friend');
            friendElements.forEach(element => {
                element.addEventListener('click', () => {
                    const friendId = element.dataset.id;
                    const friendUsername = element.querySelector('.friend-name').textContent;
                    this.showNotification(`Chat com ${friendUsername} ainda não implementado`, 'info');
                });
            });
        },
        
        // Filtrar amigos com base na pesquisa
        filterFriends: function(searchTerm) {
            if (!searchTerm) {
                // Se não há termo de busca, mostrar todos os amigos
                this.renderFriendsList();
                return;
            }
            
            // Converter para minúsculas para busca case-insensitive
            searchTerm = searchTerm.toLowerCase();
            
            // Filtrar amigos que correspondem ao termo
            const friendElements = document.querySelectorAll('.discord-friend');
            friendElements.forEach(element => {
                const username = element.dataset.username;
                if (username.includes(searchTerm)) {
                    element.style.display = 'flex';
                } else {
                    element.style.display = 'none';
                }
            });
        },
        
        // Configurar eventos de UI
        setupUIEvents: function() {
            // Escutar eventos de mensagem do callback do Discord
            window.addEventListener('message', (event) => {
                // Verificar origem da mensagem
                if (event.origin !== window.location.origin) return;
                
                // Processar código de autorização
                if (event.data && event.data.type === 'discord-callback' && event.data.code) {
                    console.log('✅ Código de autorização recebido do callback');
                    this.exchangeCodeForToken(event.data.code);
                }
            });
        },
        
        // Exibir notificação
        showNotification: function(message, type = 'info') {
            console.log(`📢 Notificação: ${message} (${type})`);
            
            // Usar sistema de notificação FURIAX se disponível
            if (window.FURIAXCommunity && window.FURIAXCommunity.NotificationManager) {
                window.FURIAXCommunity.NotificationManager.show(message, type);
                return;
            }
            
            // Implementação própria se sistema FURIAX não estiver disponível
            let notification = document.getElementById('discord-notification');
            
            // Criar elemento de notificação se não existir
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'discord-notification';
                document.body.appendChild(notification);
                
                // Adicionar estilos para notificação
                const style = document.createElement('style');
                style.textContent = `
                    #discord-notification {
                        position: fixed;
                        bottom: -60px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: linear-gradient(90deg, #5865F2, #4752C4);
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        font-family: 'Exo 2', sans-serif;
                        font-size: 14px;
                        z-index: 9999;
                        transition: bottom 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    #discord-notification.visible {
                        bottom: 20px;
                    }
                    
                    #discord-notification.success {
                        background: linear-gradient(90deg, #3ba55c, #2d7d46);
                    }
                    
                    #discord-notification.error {
                        background: linear-gradient(90deg, #ed4245, #cb2e31);
                    }
                    
                    #discord-notification.info {
                        background: linear-gradient(90deg, #5865F2, #4752C4);
                    }
                    
                    #discord-notification.warning {
                        background: linear-gradient(90deg, #faa61a, #e69138);
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Definir ícone com base no tipo
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
                    break;
            }
            
            // Atualizar conteúdo e classe
            notification.innerHTML = `${icon} ${message}`;
            notification.className = type;
            
            // Mostrar notificação
            setTimeout(() => {
                notification.classList.add('visible');
            }, 10);
            
            // Esconder após 3 segundos
            setTimeout(() => {
                notification.classList.remove('visible');
            }, 3000);
        }
    };
    
    // Integrar o módulo Discord no painel de amigos existente
    function integrateDiscordToFriendsPanel() {
        console.log('🔄 Integrando Discord ao painel de amigos...');
        
        // Verificar se o painel de amigos existe
        const friendsPanel = document.querySelector('.fan-stat-item.discord-friends-panel');
        
        if (!friendsPanel) {
            console.error('❌ Painel de amigos não encontrado');
            
            // Tentar criar o painel se não existir
            const fanStats = document.querySelector('.fan-stats');
            if (fanStats) {
                const discordPanel = document.createElement('div');
                discordPanel.className = 'fan-stat-item discord-friends-panel';
                discordPanel.innerHTML = `
                    <div class="fan-stat-title">
                        <i class="fab fa-discord"></i> Amigos Discord
                    </div>
                    <div class="fan-stat-value">
                        <div id="${DISCORD_CONFIG.FRIENDS_CONTAINER_ID}">
                            <div class="loading-friends">
                                <div class="loading-spinner"></div>
                                <span>Inicializando Discord...</span>
                            </div>
                        </div>
                    </div>
                `;
                
                fanStats.appendChild(discordPanel);
                console.log('✅ Painel de amigos Discord criado');
            }
        }
        
        // Inicializar o gerenciador Discord
        const discordManager = DiscordManager.init();
        
        // Exportar para uso global
        if (window.FURIAXCommunity) {
            window.FURIAXCommunity.DiscordManager = discordManager;
        } else {
            window.FURIAXCommunity = {
                DiscordManager: discordManager
            };
        }
    }
    
    // Executar a integração quando o DOM estiver completamente carregado
    integrateDiscordToFriendsPanel();
    
    console.log('✅ Módulo de integração com Discord inicializado com sucesso!');
});

