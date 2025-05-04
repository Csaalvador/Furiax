/**
 * FURIAX - Sistema de Login com Depuração Avançada
 * Versão: 1.0.6
 * Este script corrige problemas de autenticação e adiciona depuração detalhada
 */

// Esperar o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIALIZAÇÃO DO SISTEMA DE LOGIN FURIAX ===');
    console.log('Versão: 1.0.6 - Debug Edition');
    console.log('Ambiente: ' + window.location.pathname);
    console.log('User Agent: ' + navigator.userAgent);
    
    // Anti-loop: Verificar se já tentamos redirecionar várias vezes
    const redirectCount = sessionStorage.getItem('furiax_redirect_count') || 0;
    if (redirectCount > 3) {
        console.error('Detectado possível loop de redirecionamento! Redefinindo contagem.');
        sessionStorage.removeItem('furiax_redirect_count');
        localStorage.removeItem('furiax_redirect_attempt');
        // Se já redirecionamos demais, não tentamos novamente
        alert('Houve um problema no sistema de login. Por favor, carregue novamente.');
        return;
    }
    
    // Registrar última vez que a página foi carregada
    const lastLoadTime = localStorage.getItem('furiax_last_load_time');
    const currentTime = Date.now();
    localStorage.setItem('furiax_last_load_time', currentTime);
    
    // Verificar se estamos recarregando muito rápido (possível sinal de loop)
    if (lastLoadTime && (currentTime - lastLoadTime < 2000)) {
        console.warn('Página carregada muito rapidamente após última carga. Possível loop detectado.');
        const loopCount = parseInt(localStorage.getItem('furiax_loop_count') || '0') + 1;
        localStorage.setItem('furiax_loop_count', loopCount);
        
        if (loopCount > 3) {
            console.error('Loop de carregamento detectado e interrompido');
            localStorage.removeItem('furiax_loop_count');
            return; // Impedir execução do resto do script
        }
    } else {
        localStorage.removeItem('furiax_loop_count');
    }
    
    // ====== ELEMENTOS DOM ======
    console.log('Procurando elementos DOM necessários...');
    
    const loginTab = document.querySelector('.login-tab[data-tab="login"]');
    const registerTab = document.querySelector('.login-tab[data-tab="register"]');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegisterBtn = document.getElementById('switchToRegister');
    const switchToLoginBtn = document.getElementById('switchToLogin');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const notification = document.getElementById('notification');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingStatus = document.getElementById('loadingStatus');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    
    // Log de debug para elementos encontrados
    console.log('Elementos encontrados:');
    console.log('- Login Tab:', loginTab ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Register Tab:', registerTab ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Login Form:', loginForm ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Register Form:', registerForm ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Switch To Register Btn:', switchToRegisterBtn ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Switch To Login Btn:', switchToLoginBtn ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Password Toggles:', passwordToggles ? passwordToggles.length : 'NÃO ENCONTRADO');
    console.log('- Login Button:', loginButton ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Register Button:', registerButton ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Notification:', notification ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Loading Overlay:', loadingOverlay ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Loading Status:', loadingStatus ? 'Sim' : 'NÃO ENCONTRADO');
    console.log('- Forgot Password Link:', forgotPasswordLink ? 'Sim' : 'NÃO ENCONTRADO');
    
    // Verificações de segurança para elementos DOM críticos
    if (!loginButton) {
        console.error('ERRO CRÍTICO: Elemento loginButton não encontrado!');
        alert('Erro ao carregar a página de login. O botão de login não foi encontrado.');
        return;
    }
    
    if (!registerButton) {
        console.error('ERRO CRÍTICO: Elemento registerButton não encontrado!');
        alert('Erro ao carregar a página de login. O botão de registro não foi encontrado.');
        return;
    }
    
    // ====== CONFIGURAÇÕES DO SISTEMA ======
    const CONFIG = {
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
        MIN_PASSWORD_LENGTH: 6,
        STORAGE_KEYS: {
            USERS: 'furiax_users',
            CURRENT_USER: 'furiax_current_user',
            SESSION_TOKEN: 'furiax_session_token',
            PROFILE: 'furiaxProfile'
        },
        DEBUG: true // Modo de depuração ativado
    };

    // Verificar dados no localStorage
    if (CONFIG.DEBUG) {
        console.log('--- VERIFICAÇÃO DE DADOS NO LOCALSTORAGE ---');
        console.log('USERS:', localStorage.getItem(CONFIG.STORAGE_KEYS.USERS) ? 'Presente' : 'Ausente');
        console.log('CURRENT_USER:', localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER) ? 'Presente' : 'Ausente');
        console.log('SESSION_TOKEN:', localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN) ? 'Presente' : 'Ausente');
        console.log('PROFILE:', localStorage.getItem(CONFIG.STORAGE_KEYS.PROFILE) ? 'Presente' : 'Ausente');
        
        // Verificar usuários cadastrados
        try {
            const usersData = localStorage.getItem(CONFIG.STORAGE_KEYS.USERS);
            if (usersData) {
                const users = JSON.parse(usersData);
                console.log(`Total de usuários cadastrados: ${users.length}`);
                console.log('Lista de usuários:');
                users.forEach((user, index) => {
                    console.log(`[${index + 1}] ${user.username} / ${user.email}`);
                });
            } else {
                console.log('Nenhum usuário cadastrado ainda.');
            }
        } catch (error) {
            console.error('Erro ao carregar dados de usuários:', error);
        }
    }

    // ====== FUNÇÃO DE REDIRECIONAMENTO PARA COMMUNITY ======
    function redirectToCommunity() {
        try {
            console.log('INICIANDO REDIRECIONAMENTO para a página da comunidade...');
            
            // Verificar se o usuário está realmente autenticado
            if (!FuriaxAuth.isLoggedIn()) {
                console.error('ERRO: Tentativa de redirecionamento sem estar autenticado!');
                hideLoading();
                showNotification('Erro de autenticação. Por favor, faça login novamente.', 'error');
                return false;
            }
            
            console.log('Autenticação verificada. Prosseguindo com redirecionamento...');
            
            // Registrar tentativa de redirecionamento para evitar loops
            localStorage.setItem('furiax_redirect_attempt', Date.now());
            
            // Incrementar contador de redirecionamentos
            const redirectCount = parseInt(sessionStorage.getItem('furiax_redirect_count') || '0') + 1;
            sessionStorage.setItem('furiax_redirect_count', redirectCount);
            console.log(`Contador de redirecionamentos: ${redirectCount}`);
            
            // Determinar caminho para community.html
            const isInPagesDir = window.location.pathname.includes('/pages/');
            const communityPath = isInPagesDir ? 'community.html' : 'pages/community.html';
            
            console.log("Redirecionando para:", communityPath);
            console.log("URL completa:", new URL(communityPath, window.location.href).href);
            
            // Executar redirecionamento
            window.location.href = communityPath;
            return true;
        } catch (error) {
            console.error("ERRO GRAVE durante redirecionamento:", error);
            hideLoading();
            showNotification('Erro ao redirecionar. Por favor, tente novamente mais tarde.', 'error');
            return false;
        }
    }
    
    // ====== FUNÇÕES BÁSICAS ======
    function showTab(tabName) {
        console.log(`Alterando para aba: ${tabName}`);
        
        if (!loginTab || !registerTab || !loginForm || !registerForm) {
            console.error('Elementos de tab não encontrados!');
            return;
        }
        
        loginTab.classList.toggle('active', tabName === 'login');
        registerTab.classList.toggle('active', tabName === 'register');
        
        loginForm.classList.toggle('active', tabName === 'login');
        registerForm.classList.toggle('active', tabName === 'register');
        
        console.log(`Aba '${tabName}' ativada com sucesso.`);
    }
    
    function togglePasswordVisibility(passwordInput, icon) {
        if (!passwordInput || !icon) {
            console.error('ERRO: Elementos de senha não encontrados para alternância de visibilidade.');
            return;
        }
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
            if (CONFIG.DEBUG) console.log('Senha agora visível');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
            if (CONFIG.DEBUG) console.log('Senha agora oculta');
        }
    }
    
    function showNotification(message, type = 'info') {
        console.log(`NOTIFICAÇÃO (${type}): ${message}`);
        
        if (!notification) {
            console.error('Elemento de notificação não encontrado!');
            alert(message);
            return;
        }
        
        // Adicionar ícone baseado no tipo
        let iconHTML = '';
        if (type === 'success') {
            iconHTML = '<i class="fas fa-check-circle"></i> ';
        } else if (type === 'error') {
            iconHTML = '<i class="fas fa-exclamation-circle"></i> ';
        } else {
            iconHTML = '<i class="fas fa-info-circle"></i> ';
        }
        
        notification.innerHTML = iconHTML + message;
        notification.className = 'notification';
        
        if (type === 'success') notification.classList.add('success');
        if (type === 'error') notification.classList.add('error');
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    function showLoading(message = 'Iniciando sessão...') {
        console.log(`LOADING: ${message}`);
        
        if (!loadingOverlay) {
            console.error('Elemento de loading não encontrado!');
            return;
        }
        
        if (loadingStatus) loadingStatus.textContent = message;
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';
    }
    
    function hideLoading() {
        console.log('Escondendo loading...');
        
        if (!loadingOverlay) {
            console.error('Elemento de loading não encontrado!');
            return;
        }
        
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            console.log('Loading removido.');
        }, 500);
    }
    
    function validateEmail(email) {
        if (!email) return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        if (CONFIG.DEBUG) {
            console.log(`Validação de email: "${email}" - ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
        }
        
        return isValid;
    }
    
    function validatePassword(password) {
        if (!password) return false;
        
        const isValid = password.length >= CONFIG.MIN_PASSWORD_LENGTH;
        
        if (CONFIG.DEBUG) {
            console.log(`Validação de senha: Comprimento ${password.length} - ${isValid ? 'VÁLIDO' : 'INVÁLIDO (min: ' + CONFIG.MIN_PASSWORD_LENGTH + ')'}`);
        }
        
        return isValid;
    }
    
    function validateUsername(username) {
        if (!username) return false;
        
        // Username deve ter pelo menos 3 caracteres e não conter caracteres especiais
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        const isValid = usernameRegex.test(username);
        
        if (CONFIG.DEBUG) {
            console.log(`Validação de username: "${username}" - ${isValid ? 'VÁLIDO' : 'INVÁLIDO (deve ter entre 3-20 caracteres alfanuméricos)'}`);
        }
        
        return isValid;
    }
    
    // ====== FUNÇÕES DE AUTENTICAÇÃO ======
    // Sistema de autenticação com depuração melhorada
    const FuriaxAuth = {
        /**
         * Realiza o login do usuário
         * @param {string} username - Nome de usuário ou email
         * @param {string} password - Senha do usuário
         * @returns {Promise} - Promessa com o resultado do login
         */
        login: function(username, password) {
            return new Promise((resolve, reject) => {
                console.log("=== INICIANDO PROCESSO DE LOGIN ===");
                console.log("Tentando login para:", username);
                
                try {
                    // Verificar campos vazios
                    if (!username || !password) {
                        console.error("Erro de login: Campos vazios");
                        return reject({message: 'Por favor, preencha todos os campos.'});
                    }
                    
                    // Carregar usuários cadastrados ou usar padrão para teste
                    let users = [];
                    const usersData = localStorage.getItem(CONFIG.STORAGE_KEYS.USERS);
                    
                    if (usersData) {
                        users = JSON.parse(usersData);
                        console.log(`Dados de usuários carregados. Total: ${users.length}`);
                    } else {
                        // Criar usuário de teste se não houver usuários
                        users = [{
                            id: "test_user_123",
                            username: "admin",
                            email: "admin@furiax.com",
                            password: "admin123",
                            level: 10,
                            levelProgress: 75
                        }];
                        localStorage.setItem(CONFIG.STORAGE_KEYS.USERS, JSON.stringify(users));
                        console.log("Usuário de teste criado: admin / admin123");
                    }
                    
                    // Procurar usuário por nome ou email
                    console.log("Buscando usuário por login ou email...");
                    const user = users.find(u => 
                        (u.username.toLowerCase() === username.toLowerCase() || 
                         u.email?.toLowerCase() === username.toLowerCase()) && 
                        u.password === password
                    );
                    
                    if (!user) {
                        console.error("Usuário não encontrado ou senha incorreta");
                        return reject({message: 'Usuário ou senha incorretos.'});
                    }
                    
                    console.log(`Usuário encontrado: ${user.username} (ID: ${user.id})`);
                    
                    // Criar token de sessão
                    const sessionToken = {
                        token: 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
                        expires: Date.now() + CONFIG.SESSION_TIMEOUT
                    };
                    
                    // Criar objeto de usuário sem a senha
                    const currentUser = {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        level: user.level || 1,
                        levelProgress: user.levelProgress || 0,
                        displayName: user.displayName || user.username,
                        lastLogin: Date.now()
                    };
                    
                    // Salvar no localStorage com tratamento de erro
                    try {
                        localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
                        localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN, JSON.stringify(sessionToken));
                    } catch (storageError) {
                        console.error("ERRO AO SALVAR DADOS DE SESSÃO:", storageError);
                        return reject({message: 'Erro ao salvar dados de sessão. Verifique seu navegador.'});
                    }
                    
                    console.log("Login realizado com sucesso!");
                    console.log("Token de sessão expira em:", new Date(sessionToken.expires).toLocaleString());
                    
                    // Criar perfil simplificado para a sessão
                    const simplifiedProfile = {
                        username: user.username,
                        id: user.id,
                        title: user.title || 'Torcedor Iniciante',
                        avatar: user.avatar || 1,
                        bio: user.bio || 'Olá, sou um fã da FURIA!',
                        level: user.level || 1,
                        levelProgress: user.levelProgress || 0
                    };
                    
                    // Salvar perfil
                    try {
                        localStorage.setItem(CONFIG.STORAGE_KEYS.PROFILE, JSON.stringify(simplifiedProfile));
                        console.log("Perfil do usuário salvo com sucesso");
                    } catch (profileError) {
                        console.warn("Aviso: Erro ao salvar perfil:", profileError);
                        // Não rejeitamos a promessa aqui, pois o login ainda é válido
                    }
                    
                    console.log("=== PROCESSO DE LOGIN CONCLUÍDO COM SUCESSO ===");
                    resolve(currentUser);
                } catch (error) {
                    console.error("ERRO GRAVE durante login:", error);
                    reject({message: 'Ocorreu um erro durante o login. Tente novamente.'});
                }
            });
        },
        
        /**
         * Registra um novo usuário
         * @param {string} username - Nome de usuário
         * @param {string} email - Email do usuário
         * @param {string} password - Senha
         * @param {string} confirmPassword - Confirmação de senha
         * @returns {Promise} - Promessa com o resultado do registro
         */
        register: function(username, email, password, confirmPassword) {
            return new Promise((resolve, reject) => {
                console.log("=== INICIANDO PROCESSO DE REGISTRO ===");
                console.log("Dados recebidos para registro:", username, email);
                
                try {
                    // Verificar campos vazios
                    if (!username || !email || !password || !confirmPassword) {
                        console.error("Erro de registro: Campos vazios");
                        return reject({message: 'Por favor, preencha todos os campos.'});
                    }
                    
                    // Validar username
                    if (!validateUsername(username)) {
                        return reject({message: 'Nome de usuário inválido. Use entre 3 e 20 caracteres (letras, números e _).'});
                    }
                    
                    // Validar email
                    if (!validateEmail(email)) {
                        return reject({message: 'Email inválido. Por favor, insira um email válido.'});
                    }
                    
                    // Validar senha
                    if (!validatePassword(password)) {
                        return reject({message: `A senha deve conter pelo menos ${CONFIG.MIN_PASSWORD_LENGTH} caracteres.`});
                    }
                    
                    // Verificar senhas iguais
                    if (password !== confirmPassword) {
                        console.error("Erro de registro: Senhas não coincidem");
                        return reject({message: 'As senhas não coincidem.'});
                    }

                    // Carregar usuários cadastrados
                    let users = [];
                    try {
                        const usersData = localStorage.getItem(CONFIG.STORAGE_KEYS.USERS);
                        users = usersData ? JSON.parse(usersData) : [];
                        console.log(`Dados de usuários carregados. Total existente: ${users.length}`);
                    } catch (parseError) {
                        console.error("Erro ao carregar usuários existentes:", parseError);
                        // Se houver erro ao ler, consideramos que não há usuários
                        users = [];
                    }
                    
                    // Verificar se já existe usuário com mesmo username ou email
                    const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
                    if (usernameExists) {
                        console.error("Erro de registro: Nome de usuário já em uso");
                        return reject({message: 'Este nome de usuário já está em uso.'});
                    }
                    
                    const emailExists = users.some(u => u.email?.toLowerCase() === email.toLowerCase());
                    if (emailExists) {
                        console.error("Erro de registro: Email já cadastrado");
                        return reject({message: 'Este email já está cadastrado.'});
                    }
                    
                    // Criar novo usuário
                    const newUser = {
                        id: "user_" + Math.random().toString(36).substring(2) + Date.now().toString(36),
                        username: username,
                        email: email,
                        password: password,
                        level: 1,
                        levelProgress: 0,
                        displayName: username,
                        createdAt: Date.now()
                    };
                    
                    // Adicionar usuário e salvar
                    users.push(newUser);
                    
                    try {
                        localStorage.setItem(CONFIG.STORAGE_KEYS.USERS, JSON.stringify(users));
                        console.log("Usuários salvos com sucesso. Total atualizado:", users.length);
                    } catch (saveError) {
                        console.error("ERRO AO SALVAR USUÁRIO:", saveError);
                        return reject({message: 'Erro ao salvar novo usuário. Verifique seu navegador.'});
                    }
                    
                    console.log("Usuário registrado com sucesso:", newUser.username, "(ID: " + newUser.id + ")");
                    console.log("=== PROCESSO DE REGISTRO CONCLUÍDO COM SUCESSO ===");
                    
                    resolve(newUser);
                } catch (error) {
                    console.error("ERRO GRAVE durante registro:", error);
                    reject({message: 'Ocorreu um erro durante o registro. Tente novamente.'});
                }
            });
        },
        
        /**
         * Recuperação de senha
         * @param {string} email - Email para recuperação
         * @returns {Promise} - Promessa com o resultado da operação
         */
        forgotPassword: function(email) {
            return new Promise((resolve, reject) => {
                console.log("=== INICIANDO PROCESSO DE RECUPERAÇÃO DE SENHA ===");
                console.log("Email para recuperação:", email);
                
                try {
                    if (!email) {
                        return reject({message: 'Por favor, informe seu email.'});
                    }
                    
                    if (!validateEmail(email)) {
                        return reject({message: 'Email inválido. Por favor, insira um email válido.'});
                    }
                    
                    // Verificar se o email existe
                    let users = [];
                    try {
                        const usersData = localStorage.getItem(CONFIG.STORAGE_KEYS.USERS);
                        users = usersData ? JSON.parse(usersData) : [];
                    } catch (error) {
                        console.error("Erro ao carregar usuários:", error);
                        return reject({message: 'Erro ao verificar email. Tente novamente.'});
                    }
                    
                    const userWithEmail = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
                    
                    if (!userWithEmail) {
                        console.error("Email não encontrado no sistema");
                        return reject({message: 'Este email não está cadastrado no sistema.'});
                    }
                    
                    console.log("Email encontrado para usuário:", userWithEmail.username);
                    console.log("Simulando envio de email de recuperação...");
                    
                    setTimeout(() => {
                        console.log("=== PROCESSO DE RECUPERAÇÃO CONCLUÍDO ===");
                        resolve({success: true, message: 'Instruções de recuperação enviadas para seu email.'});
                    }, 1500);
                    
                } catch (error) {
                    console.error("ERRO GRAVE na recuperação de senha:", error);
                    reject({message: 'Ocorreu um erro. Tente novamente mais tarde.'});
                }
            });
        },
        
        /**
         * Verifica se o usuário está logado
         * @returns {boolean} - Se o usuário está logado
         */
        isLoggedIn: function() {
            try {
                console.log("Verificando status de login...");
                
                const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
                const tokenStr = localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
                
                if (!userStr || !tokenStr) {
                    console.log("Login não encontrado: dados de usuário ou token ausentes");
                    return false;
                }
                
                let token;
                try {
                    token = JSON.parse(tokenStr);
                } catch (e) {
                    console.error("Token de sessão inválido:", e);
                    return false;
                }
                
                // Verificar se o token expirou
                if (token.expires < Date.now()) {
                    console.log("Token de sessão expirado em:", new Date(token.expires).toLocaleString());
                    return false;
                }
                
                console.log("Usuário está logado! Token válido até:", new Date(token.expires).toLocaleString());
                return true;
            } catch (error) {
                console.error("Erro ao verificar login:", error);
                return false;
            }
        },
        
        /**
         * Obtém o usuário atualmente logado
         * @returns {Object|null} - Objeto de usuário ou null
         */
        getCurrentUser: function() {
            try {
                if (!this.isLoggedIn()) {
                    console.log("Tentativa de obter usuário, mas ninguém está logado");
                    return null;
                }
                
                const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
                if (!userStr) return null;
                
                const user = JSON.parse(userStr);
                console.log("Usuário atual recuperado:", user.username);
                return user;
            } catch (error) {
                console.error("Erro ao obter usuário atual:", error);
                return null;
            }
        }
    };
    
    // Expor o sistema de autenticação globalmente
    window.FuriaxAuth = FuriaxAuth;
    
    // ====== EVENT LISTENERS ======
    console.log('Configurando event listeners...');
    
    // Alternar entre os formulários
    if (loginTab) loginTab.addEventListener('click', () => showTab('login'));
    if (registerTab) registerTab.addEventListener('click', () => showTab('register'));
    if (switchToRegisterBtn) switchToRegisterBtn.addEventListener('click', () => showTab('register'));
    if (switchToLoginBtn) switchToLoginBtn.addEventListener('click', () => showTab('login'));
    
    // Alternância de visibilidade das senhas
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            togglePasswordVisibility(passwordInput, icon);
        });
    });
    
    // Comportamento de login (COM REDIRECIONAMENTO PARA COMMUNITY E TRATAMENTO DE ERROS APRIMORADO)
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            console.log('Botão de login clicado!');
            
            // Obter valores de input com verificação
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            
            if (!usernameInput || !passwordInput) {
                console.error("ERRO CRÍTICO: Campos de login não encontrados!");
                showNotification('Erro ao processar login. Campos não encontrados.', 'error');
                return;
            }
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            console.log(`Tentando login com: ${username} / [senha]`);
            
            if (!username || !password) {
                showNotification('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            showLoading('Autenticando...');
            
            FuriaxAuth.login(username, password)
                .then(user => {
                    console.log('Login bem-sucedido! Usuário:', user.username);
                    showNotification(`Bem-vindo, ${user.username}!`, 'success');
                    
                    // Verificação adicional para confirmar autenticação
                    if (!FuriaxAuth.isLoggedIn()) {
                        console.error("ERRO: Login bem-sucedido, mas verificação falhou!");
                        hideLoading();
                        showNotification('Ocorreu um erro ao finalizar o login. Tente novamente.', 'error');
                        return;
                    }
                    
                    // Aguardar um momento para mostrar a mensagem de sucesso
                    setTimeout(() => {
                        loadingStatus.textContent = 'Redirecionando...';
                        
                        // Verificar armazenamento antes de redirecionar
                        const currentUserCheck = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
                        const sessionTokenCheck = localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
                        
                        if (!currentUserCheck || !sessionTokenCheck) {
                            console.error("ERRO CRÍTICO: Dados de sessão não disponíveis após login!");
                            hideLoading();
                            showNotification('Falha ao salvar os dados da sessão. Tente novamente.', 'error');
                            return;
                        }
                        
                        console.log("Tudo pronto para redirecionamento!");
                        
                        // Redirecionar para community
                        redirectToCommunity();
                    }, 1500);
                })
                .catch(error => {
                    console.error("Erro durante login:", error);
                    hideLoading();
                    showNotification(error.message || 'Falha na autenticação. Tente novamente.', 'error');
                });
        });
        console.log('Event listener de login configurado com sucesso');
    }
    
    // Comportamento de registro (COM LOGIN E REDIRECIONAMENTO APÓS SUCESSO)
    if (registerButton) {
        registerButton.addEventListener('click', function() {
            console.log('Botão de registro clicado!');
            
            // Obter valores de input com verificação
            const usernameInput = document.getElementById('newUsername');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('newPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            
            if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
                console.error("ERRO CRÍTICO: Campos de registro não encontrados!");
                showNotification('Erro ao processar registro. Campos não encontrados.', 'error');
                return;
            }
            
            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (!username || !email || !password || !confirmPassword) {
                showNotification('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            showLoading('Criando conta...');
            
            FuriaxAuth.register(username, email, password, confirmPassword)
                .then(user => {
                    console.log('Registro bem-sucedido!', user);
                    showNotification('Conta criada com sucesso!', 'success');
                    
                    // Fazer login automático após registro
                    setTimeout(() => {
                        loadingStatus.textContent = 'Fazendo login...';
                        
                        FuriaxAuth.login(username, password)
                            .then(user => {
                                console.log('Login pós-registro bem-sucedido!');
                                
                                // Verificação adicional para confirmar autenticação
                                if (!FuriaxAuth.isLoggedIn()) {
                                    console.error("ERRO: Login pós-registro bem-sucedido, mas verificação falhou!");
                                    hideLoading();
                                    showNotification('Conta criada, mas houve um erro ao fazer login. Por favor, faça login manualmente.', 'info');
                                    showTab('login');
                                    return;
                                }
                                
                                setTimeout(() => {
                                    loadingStatus.textContent = 'Redirecionando...';
                                    // Redirecionar para community
                                    redirectToCommunity();
                                }, 1000);
                            })
                            .catch(error => {
                                console.error("Erro no login pós-registro:", error);
                                hideLoading();
                                showNotification('Conta criada, mas houve um erro ao fazer login. Por favor, faça login manualmente.', 'info');
                                showTab('login');
                            });
                    }, 1500);
                })
                .catch(error => {
                    console.error("Erro durante registro:", error);
                    hideLoading();
                    showNotification(error.message || 'Erro ao criar conta. Tente novamente.', 'error');
                });
        });
        console.log('Event listener de registro configurado com sucesso');
    }
    
    // Recuperação de senha
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Link de recuperação de senha clicado');
            
            const email = prompt("Digite seu email para receber instruções de recuperação:");
            
            if (!email) {
                console.log('Recuperação de senha cancelada pelo usuário');
                return;
            }
            
            showLoading('Enviando instruções...');
            
            FuriaxAuth.forgotPassword(email)
                .then(result => {
                    console.log('Recuperação de senha processada:', result);
                    hideLoading();
                    showNotification(result.message, 'success');
                })
                .catch(error => {
                    console.error("Erro na recuperação de senha:", error);
                    hideLoading();
                    showNotification(error.message || 'Erro ao processar recuperação. Tente novamente.', 'error');
                });
        });
        console.log('Event listener de recuperação de senha configurado');
    }
    
    // Permitir login com Enter
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && loginButton) {
                console.log('Tecla Enter pressionada no campo de usuário');
                loginButton.click();
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && loginButton) {
                console.log('Tecla Enter pressionada no campo de senha');
                loginButton.click();
            }
        });
    }
    
    // Tecla Enter no formulário de registro
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && registerButton) {
                console.log('Tecla Enter pressionada no campo de confirmação de senha');
                registerButton.click();
            }
        });
    }
    
    // Atualizar rodapé com ano atual
    const footerYear = document.querySelector('.login-footer');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = `&copy; ${currentYear} FURIAX - Todos os direitos reservados`;
    }
    
    // Verificar se o localStorage está funcionando
    try {
        localStorage.setItem('furiax_storage_test', 'test');
        const test = localStorage.getItem('furiax_storage_test');
        if (test !== 'test') {
            console.error('ERRO CRÍTICO: localStorage não está funcionando corretamente!');
            alert('Seu navegador não suporta armazenamento local ou está com cookies bloqueados. O sistema de login pode não funcionar corretamente.');
        }
        localStorage.removeItem('furiax_storage_test');
    } catch (e) {
        console.error('ERRO CRÍTICO: localStorage não disponível:', e);
        alert('Seu navegador não suporta armazenamento local ou está com cookies bloqueados. O sistema de login não funcionará.');
    }
    
    // Debug final - verificar status atual
    if (CONFIG.DEBUG) {
        console.log('=== VERIFICAÇÃO FINAL DE ESTADO DO SISTEMA ===');
        
        // Verificar se já existe usuário logado
        const isLoggedIn = FuriaxAuth.isLoggedIn();
        console.log('Usuário já logado?', isLoggedIn ? 'SIM' : 'NÃO');
        
        if (isLoggedIn) {
            const currentUser = FuriaxAuth.getCurrentUser();
            console.log('Usuário atual:', currentUser ? currentUser.username : 'ERRO: Não foi possível recuperar');
        }
        
        // Verificar ambiente
        console.log('Localização atual:', window.location.pathname);
        console.log('URL completa:', window.location.href);
        console.log('Está na pasta pages?', window.location.pathname.includes('/pages/'));
    }
    
    console.log('=== INICIALIZAÇÃO COMPLETA DA PÁGINA DE LOGIN ===');
});