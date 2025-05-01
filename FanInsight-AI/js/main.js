/**
 * FanInsight AI - Sistema de Análise de Perfil de Fãs da FURIA
 * Arquivo Principal de JavaScript
 */

// Objeto principal do aplicativo
const FanInsight = {
    // Armazena os dados do usuário durante a sessão
    userData: {
        personal: {},
        interests: {},
        verification: {
            documentVerified: false,
            faceVerified: false
        },
        socialConnections: [],
        externalLinks: [],
        profileScore: 0
    },

    // Inicializa o aplicativo
    init: function() {
        console.log('FanInsight AI iniciado');
        this.setupEventListeners();
        this.checkSessionStatus();
    },

    // Configura os listeners de eventos
    setupEventListeners: function() {
        // Formulário de dados pessoais
        const personalForm = document.getElementById('personal-form');
        if (personalForm) {
            personalForm.addEventListener('submit', this.handlePersonalFormSubmit.bind(this));
        }

        // Ouvintes de eventos adicionais serão configurados conforme o usuário navega pelo sistema
        document.addEventListener('DOMContentLoaded', () => {
            this.setupFormValidation();
        });
    },

    // Verifica se o usuário tem uma sessão ativa
    checkSessionStatus: function() {
        const sessionData = localStorage.getItem('fanInsightSession');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                if (session.active && session.lastActivity > (Date.now() - 24 * 60 * 60 * 1000)) {
                    this.userData = {...this.userData, ...session.userData};
                    this.redirectToPreviousStep();
                    return;
                }
            } catch (error) {
                console.error('Erro ao recuperar sessão:', error);
            }
        }
        // Limpa qualquer sessão expirada
        localStorage.removeItem('fanInsightSession');
    },

    // Redireciona o usuário para a etapa onde parou
    redirectToPreviousStep: function() {
        if (!this.userData.personal.name) {
            // Permanece na página inicial
            return;
        }

    },

    // Manipula o envio do formulário pessoal
    handlePersonalFormSubmit: function(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Coleta dados pessoais
        this.userData.personal = {
            name: formData.get('name'),
            cpf: formData.get('cpf'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        };
        
        // Coleta interesses
        const games = Array.from(form.querySelector('#games').selectedOptions).map(option => option.value);
        const teams = Array.from(form.querySelector('#teams').selectedOptions).map(option => option.value);
        const products = Array.from(form.querySelectorAll('input[name="products"]:checked')).map(checkbox => checkbox.value);
        
        this.userData.interests = {
            games,
            teams,
            products
        };
        
        // Salva na sessão
        this.saveSession();
        
        // Redireciona para a página de verificação
        window.location.href = 'pages/verification.html';
    },

    // Configurações de validação de formulários
    setupFormValidation: function() {
        // CPF Validation
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.slice(0, 11);
                
                if (value.length > 9) {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else if (value.length > 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
                } else if (value.length > 3) {
                    value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
                }
                
                e.target.value = value;
            });
        }
        
        // Phone validation
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.slice(0, 11);
                
                if (value.length > 10) {
                    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                } else if (value.length > 6) {
                    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else if (value.length > 2) {
                    value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                }
                
                e.target.value = value;
            });
        }
    },

    // Salva os dados na sessão local
    saveSession: function() {
        const session = {
            active: true,
            lastActivity: Date.now(),
            userData: this.userData
        };
        
        localStorage.setItem('fanInsightSession', JSON.stringify(session));
    },

    // API de verificação de documentos (simulada)
    verifyDocument: async function(documentImage) {
        try {
            // Simula uma chamada de API para o backend
            const formData = new FormData();
            formData.append('document', documentImage);
            
            // Em um cenário real, isso seria uma chamada fetch para uma API
            // const response = await fetch('/api/verify', {
            //     method: 'POST',
            //     body: formData
            // });
            
            // Simulação de resposta
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        data: {
                            name: this.userData.personal.name,
                            cpf: this.userData.personal.cpf,
                            verified: true
                        }
                    });
                }, 2000);
            });
        } catch (error) {
            console.error('Erro na verificação de documento:', error);
            return { success: false, error: 'Falha na verificação do documento' };
        }
    },

    // API de comparação facial (simulada)
    compareFaces: async function(documentImage, selfieImage) {
        try {
            // Simulação de resposta da API de comparação facial
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        match: true,
                        confidence: 0.92
                    });
                }, 1500);
            });
        } catch (error) {
            console.error('Erro na comparação facial:', error);
            return { success: false, error: 'Falha na comparação facial' };
        }
    },

    // Analisa e pontua o perfil do usuário
    analyzeProfile: function() {
        let score = 0;
        
        // Pontuação baseada nos interesses
        if (this.userData.interests.games) {
            score += this.userData.interests.games.length * 5;
        }
        
        if (this.userData.interests.teams) {
            score += this.userData.interests.teams.length * 10;
        }
        
        if (this.userData.interests.products) {
            score += this.userData.interests.products.length * 15;
        }
        
        // Pontuação baseada nas conexões sociais
        score += this.userData.socialConnections.length * 20;
        
        // Pontuação baseada nos links externos
        score += this.userData.externalLinks.length * 15;
        
        // Salva a pontuação
        this.userData.profileScore = score;
        
        // Determina o nível do fã
        let fanLevel;
        if (score < 50) {
            fanLevel = 'Iniciante';
        } else if (score < 100) {
            fanLevel = 'Engajado';
        } else if (score < 150) {
            fanLevel = 'Dedicado';
        } else {
            fanLevel = 'Superfã';
        }
        
        this.userData.fanLevel = fanLevel;
        
        // Salva na sessão
        this.saveSession();
        
        return {
            score,
            level: fanLevel
        };
    }
};

// Inicializa o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    FanInsight.init();
});