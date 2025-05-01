// FanInsight AI - Módulo de Autenticação
// Gerencia autenticação, autorização e estado do usuário

import { verifyToken, getAuthToken, login, logout as apiLogout } from './api.js';
import { showNotification, state } from './app.js';
import { navigateTo } from './routes.js';

// Estado de autenticação
let isLoggedIn = false;
let currentUser = null;

// Inicializar o sistema de autenticação
export async function initAuth() {
  console.log('[Auth] Inicializando sistema de autenticação');
  
  // Verificar se há um token existente
  const token = getAuthToken();
  
  if (token) {
    try {
      // Verificar se o token é válido
      const isValid = await verifyToken();
      
      if (isValid) {
        isLoggedIn = true;
        
        // Buscar dados do usuário (em um ambiente real, isso viria da API)
        // Esses dados vão apenas simular um usuário para nossa demonstração
        currentUser = {
          id: 'usr_mock123',
          username: 'furiafan',
          email: 'fan@furia.org',
          name: 'Carlos Silva'
        };
        
        // Atualizar o estado global
        state.user = currentUser;
        
        console.log('[Auth] Usuário autenticado:', currentUser.username);
      }
    } catch (error) {
      console.error('[Auth] Erro ao verificar token:', error);
      isLoggedIn = false;
      currentUser = null;
    }
  }
  
  return isLoggedIn;
}

// Verificar se o usuário está autenticado
export function isAuthenticated() {
  return isLoggedIn;
}

// Obter usuário atual
export function getCurrentUser() {
  return currentUser;
}

// Realizar login
export async function loginUser(email, password) {
  try {
    const response = await login(email, password);
    
    if (response.success) {
      isLoggedIn = true;
      currentUser = response.user;
      
      // Atualizar o estado global
      state.user = currentUser;
      
      showNotification('Login realizado com sucesso!', 'success');
      return true;
    } else {
      showNotification('Credenciais inválidas. Tente novamente.', 'error');
      return false;
    }
  } catch (error) {
    console.error('[Auth] Erro ao fazer login:', error);
    showNotification('Erro ao fazer login. Tente novamente.', 'error');
    return false;
  }
}

// Realizar logout
export async function logoutUser() {
  try {
    await apiLogout();
  } catch (error) {
    console.error('[Auth] Erro ao fazer logout:', error);
  } finally {
    isLoggedIn = false;
    currentUser = null;
    
    // Atualizar o estado global
    state.user = null;
    
    // Redirecionar para a página inicial
    navigateTo('/');
    
    showNotification('Logout realizado com sucesso!', 'success');
  }
}

// Proteger rotas que requerem autenticação
export function requireAuth(callback) {
  return function(container) {
    if (isAuthenticated()) {
      return callback(container);
    } else {
      showNotification('Você precisa estar logado para acessar esta página.', 'error');
      navigateTo('/');
      return false;
    }
  };
}

// Criar um modal de login
export function showLoginModal(onSuccess = null) {
  const modalContent = `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6 text-center">Login FanInsight AI</h2>
      
      <form id="login-form" class="space-y-4">
        <div>
          <label for="login-email" class="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
          <input type="email" id="login-email" required
            class="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-furia-blue"
            placeholder="seu.email@exemplo.com">
        </div>
        
        <div>
          <label for="login-password" class="block text-sm font-medium text-gray-300 mb-1">Senha</label>
          <input type="password" id="login-password" required
            class="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-furia-blue"
            placeholder="••••••••">
        </div>
        
        <div class="pt-2">
          <button type="submit" 
            class="w-full bg-furia-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Entrar
          </button>
        </div>
      </form>
      
      <div class="mt-6 text-center text-sm">
        <p class="text-gray-400">
          Não tem uma conta ainda?
          <button id="register-link" class="text-furia-blue hover:underline ml-1">
            Crie seu perfil
          </button>
        </p>
        
        <p class="mt-2">
          <button id="forgot-password" class="text-gray-400 hover:text-white text-sm">
            Esqueceu sua senha?
          </button>
        </p>
      </div>
      
      <div class="mt-4 pt-4 border-t border-gray-700 text-center">
        <button data-close-modal class="text-gray-400 hover:text-white text-sm">
          Cancelar
        </button>
      </div>
    </div>
  `;
  
  // Mostrar o modal (usando a função global definida em app.js)
  window.showModal(modalContent, () => {
    // Callback quando o modal é fechado
  });
  
  // Adicionar handlers de eventos após o modal ser inserido no DOM
  setTimeout(() => {
    const loginForm = document.getElementById('login-form');
    const registerLink = document.getElementById('register-link');
    const forgotPassword = document.getElementById('forgot-password');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
          showNotification('Por favor, preencha todos os campos.', 'error');
          return;
        }
        
        // Mostrar indicador de carregamento no botão
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <div class="flex items-center justify-center">
            <div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            <span>Processando...</span>
          </div>
        `;
        
        try {
          const success = await loginUser(email, password);
          
          if (success) {
            document.querySelector('[data-close-modal]').click();
            
            if (onSuccess) {
              onSuccess();
            }
          }
        } catch (error) {
          console.error('Erro ao fazer login:', error);
          showNotification('Erro ao fazer login. Tente novamente.', 'error');
        } finally {
          // Restaurar o botão
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      });
    }
    
    if (registerLink) {
      registerLink.addEventListener('click', () => {
        document.querySelector('[data-close-modal]').click();
        navigateTo('/register');
      });
    }
    
    if (forgotPassword) {
      forgotPassword.addEventListener('click', () => {
        // Implementação de recuperação de senha (opcional)
        showNotification('Uma solicitação de redefinição de senha foi enviada para seu e-mail.', 'info');
      });
    }
  }, 100);
}

// Função para simular login e cadastro em ambiente de desenvolvimento
export function setupDemoAccount() {
  // Usuário demo para testes
  const demoUser = {
    id: 'usr_demo123',
    username: 'furiafan',
    email: 'demo@furia.org',
    name: 'Carlos Silva'
  };
  
  isLoggedIn = true;
  currentUser = demoUser;
  
  // Atualizar o estado global
  state.user = currentUser;
  
  // Configurar status de verificação para o fluxo de demo
  state.verificationStatus = 'verified';
  
  console.log('[Auth] Usuário demo configurado:', demoUser.username);
  return demoUser;
}

// Funções para validação de dados
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePassword(password) {
  // Pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

export function validateCPF(cpf) {
  // Remover caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verificar se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;
  
  if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;
  
  return digitoVerificador2 === parseInt(cpf.charAt(10));
}