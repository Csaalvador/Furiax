/**
 * FanInsight AI - Sistema de Análise de Perfil de Fãs da FURIA
 * Autenticação e Validação
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se um usuário está logado
    checkAuthStatus();
    
    // Formulário de login (se existir na página)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Botão de logout (se existir na página)
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Verificar status de autenticação
    function checkAuthStatus() {
        // Inicializar o FanInsight a partir do objeto global
        const FanInsight = window.FanInsight || {};
        
        // Verificar se há uma sessão ativa
        const sessionData = localStorage.getItem('fanInsightSession');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                if (session.active && session.lastActivity > (Date.now() - 24 * 60 * 60 * 1000)) {
                    // Sessão ativa e válida
                    console.log('Usuário autenticado');
                    
                    // Adicionar classe ao body para indicar que o usuário está logado
                    document.body.classList.add('user-logged-in');
                    
                    // Atualizar UI se necessário
                    updateAuthUI(true);
                    
                    return true;
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
            }
        }
        
        // Sem sessão válida
        console.log('Usuário não autenticado');
        document.body.classList.remove('user-logged-in');
        updateAuthUI(false);
        
        return false;
    }
    
    // Atualizar elementos da UI com base no status de autenticação
    function updateAuthUI(isLoggedIn) {
        // Elementos de login/logout
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        const profileButton = document.getElementById('profile-button');
        const userNameDisplay = document.getElementById('user-name');
        
        if (isLoggedIn) {
            // Usuário logado
            if (loginButton) loginButton.classList.add('hidden');
            if (logoutButton) logoutButton.classList.remove('hidden');
            if (profileButton) profileButton.classList.remove('hidden');
            
            // Exibir nome do usuário se disponível
            if (userNameDisplay) {
                const sessionData = localStorage.getItem('fanInsightSession');
                if (sessionData) {
                    try {
                        const session = JSON.parse(sessionData);
                        if (session.userData && session.userData.personal && session.userData.personal.name) {
                            const firstName = session.userData.personal.name.split(' ')[0];
                            userNameDisplay.textContent = firstName;
                            userNameDisplay.classList.remove('hidden');
                        }
                    } catch (error) {
                        console.error('Erro ao obter nome do usuário:', error);
                    }
                }
            }
        } else {
            // Usuário não logado
            if (loginButton) loginButton.classList.remove('hidden');
            if (logoutButton) logoutButton.classList.add('hidden');
            if (profileButton) profileButton.classList.add('hidden');
            if (userNameDisplay) userNameDisplay.classList.add('hidden');
        }
    }
    
    // Manipular envio do formulário de login
    function handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Validar campos
        if (!email || !password) {
            showError('Por favor, preencha todos os campos.');
            return;
        }
        
        // Simulação de autenticação (em produção, seria uma chamada ao backend)
        if (email === 'demo@furia.com' && password === 'demo123') {
                            // Login bem-sucedido
            createSession({
                id: '12345',
                email: email,
                personal: {
                    name: 'Usuário de Demonstração',
                    cpf: '123.456.789-00',
                    phone: '(11) 98765-4321',
                    address: 'Rua de Exemplo, 123 - São Paulo, SP'
                },
                interests: {
                    games: ['csgo', 'valorant'],
                    teams: ['csgo', 'valorant'],
                    products: ['jersey', 'accessories']
                },
                verification: {
                    documentVerified: true,
                    faceVerified: true,
                    verifiedAt: new Date().toISOString()
                },
                socialConnections: [
                    {
                        network: 'twitter',
                        username: 'fan_furia',
                        connectedAt: new Date().toISOString()
                    },
                    {
                        network: 'instagram',
                        username: 'furia_fan',
                        connectedAt: new Date().toISOString()
                    }
                ],
                externalLinks: [
                    {
                        type: 'steam',
                        url: 'https://steamcommunity.com/id/furiafan',
                        addedAt: new Date().toISOString()
                    }
                ],
                profileScore: 85,
                fanLevel: 'Engajado'
            });
            
            // Redirecionar para a página de perfil
            window.location.href = 'pages/profile.html';
        } else {
            // Login falhou
            showError('E-mail ou senha incorretos.');
        }
    }
    
    // Manipular logout
    function handleLogout() {
        // Remover sessão
        localStorage.removeItem('fanInsightSession');
        
        // Atualizar UI
        document.body.classList.remove('user-logged-in');
        updateAuthUI(false);
        
        // Redirecionar para a página inicial
        window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
    }
    
    // Criar uma nova sessão
    function createSession(userData) {
        const session = {
            active: true,
            lastActivity: Date.now(),
            userData: userData
        };
        
        localStorage.setItem('fanInsightSession', JSON.stringify(session));
        
        // Atualizar UI
        document.body.classList.add('user-logged-in');
        updateAuthUI(true);
    }
    
    // Exibir mensagem de erro
    function showError(message) {
        const errorElement = document.getElementById('login-error');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
            
            // Esconder após 5 segundos
            setTimeout(() => {
                errorElement.classList.add('hidden');
            }, 5000);
        } else {
            // Fallback para alert se não houver elemento de erro na página
            alert(message);
        }
    }
    
    /**
     * Funções de validação para formulários
     */
    
    // Validar CPF
    function validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }
        
        // Verificação de dígitos
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        
        if (remainder === 10 || remainder === 11) {
            remainder = 0;
        }
        
        if (remainder !== parseInt(cpf.substring(9, 10))) {
            return false;
        }
        
        sum = 0;
        
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        
        if (remainder === 10 || remainder === 11) {
            remainder = 0;
        }
        
        if (remainder !== parseInt(cpf.substring(10, 11))) {
            return false;
        }
        
        return true;
    }
    
    // Validar e-mail
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Validar URL
    function validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Validar telefone
    function validatePhone(phone) {
        phone = phone.replace(/\D/g, '');
        return phone.length >= 10 && phone.length <= 11;
    }
    
    // Exportar funções de validação para uso em outros arquivos
    window.FanInsightValidation = {
        validateCPF,
        validateEmail,
        validateURL,
        validatePhone
    };
});