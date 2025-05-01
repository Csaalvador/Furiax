// FanInsight AI - Arquivo Principal
// Inicializa e coordena todos os módulos do sistema

import { initAuth, isAuthenticated, setupDemoAccount } from './auth.js';
import { initRoutes, navigateTo } from './routes.js';
import { setupAPI } from './api.js';
import { initAI } from './ai.js';
import { initSocialConnections } from './social.js';
import { loadUserProfile } from './profile.js';
import { 
  showLoading, 
  hideLoading, 
  showNotification, 
  showModal, 
  closeModal,
  updateNavigation,
  CONFIG
} from './app.js';

// Modo de desenvolvimento
const DEV_MODE = true;

// Inicialização do sistema
async function initSystem() {
  console.log('Inicializando FanInsight AI...');
  
  // Mostrar loading inicial
  showLoading();
  
  try {
    // Configurar API
    setupAPI(CONFIG.apiUrl);
    console.log('API configurada:', CONFIG.apiUrl);
    
    // Inicializar autenticação
    const authResult = await initAuth();
    console.log('Autenticação inicializada:', authResult ? 'Usuário autenticado' : 'Sem usuário');
    
    // Em modo de desenvolvimento, configurar conta de teste se não houver usuário
    if (DEV_MODE && !authResult) {
      console.log('Modo de desenvolvimento: configurando conta de teste');
      setupDemoAccount();
    }
    
    // Inicializar serviços de IA
    await initAI();
    console.log('Serviços de IA inicializados');
    
    // Se autenticado, carregar dados do usuário
    if (isAuthenticated()) {
      // Carregar perfil do usuário
      await loadUserProfile();
      console.log('Perfil do usuário carregado');
    }
    
    // Configurar rotas e navegação
    initRoutes();
    updateNavigation();
    console.log('Rotas e navegação inicializadas');
    
    // Configurar eventos globais
    setupGlobalEvents();
    console.log('Eventos globais configurados');
    
    // Rodar verificações do sistema
    runSystemChecks();
    
    // Sistema inicializado com sucesso
    console.log('FanInsight AI inicializado com sucesso!');
    
    // Mostrar modal de boas-vindas no modo de desenvolvimento (apenas primeira vez)
    if (DEV_MODE && !localStorage.getItem('welcomeShown')) {
      showWelcomeModal();
      localStorage.setItem('welcomeShown', 'true');
    }
  } catch (error) {
    // Tratar erro de inicialização
    console.error('Erro ao inicializar FanInsight AI:', error);
    showErrorScreen('Não foi possível inicializar o sistema. Tente novamente mais tarde.');
  } finally {
    // Esconder loading
    hideLoading();
  }
}

// Configurar eventos globais
function setupGlobalEvents() {
  // Lidar com cliques em links de navegação
  document.addEventListener('click', e => {
    // Verificar se é um link interno
    if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
      e.preventDefault();
      const path = e.target.pathname;
      navigateTo(path);
    }
  });
  
  // Lidar com navegação do histórico
  window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    navigateTo(path);
  });
  
  // Lidar com teclas de atalho
  document.addEventListener('keydown', e => {
    // ESC para fechar modal
    if (e.key === 'Escape') {
      closeModal();
    }
  });
  
  // Detectar mudanças de tamanho da janela
  window.addEventListener('resize', handleResize);
  
  // Verificar conexão com a internet
  window.addEventListener('online', () => {
    showNotification('Conexão com a internet restaurada', 'success');
  });
  
  window.addEventListener('offline', () => {
    showNotification('Conexão com a internet perdida. Algumas funcionalidades podem não estar disponíveis.', 'error');
  });
}

// Lidar com mudanças de tamanho da janela
function handleResize() {
  // Ajustar layout para dispositivos móveis/desktop
  const isMobile = window.innerWidth < 768;
  document.body.classList.toggle('is-mobile', isMobile);
  
  // Ajustar menus e componentes responsivos
  const mainNav = document.getElementById('main-nav');
  if (mainNav) {
    if (isMobile) {
      mainNav.classList.add('hidden');
    } else {
      mainNav.classList.remove('hidden');
    }
  }
}

// Executar verificações do sistema
function runSystemChecks() {
  // Verificar suporte a recursos necessários
  const checks = {
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    fileAPI: typeof FileReader !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    canvas: !!document.createElement('canvas').getContext
  };
  
  // Registrar resultados
  console.log('Verificações do sistema:', checks);
  
  // Alertar sobre recursos não suportados
  const unsupportedFeatures = Object.keys(checks).filter(key => !checks[key]);
  
  if (unsupportedFeatures.length > 0) {
    console.warn('Recursos não suportados:', unsupportedFeatures);
    showNotification(`Seu navegador pode não suportar todos os recursos necessários: ${unsupportedFeatures.join(', ')}`, 'warning');
  }
}

// Mostrar tela de erro
function showErrorScreen(message) {
  // Limpar conteúdo atual
  const appContainer = document.getElementById('app');
  
  if (appContainer) {
    appContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div class="bg-red-600 bg-opacity-20 p-6 rounded-lg mb-8 max-w-md">
          <svg class="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 class="text-xl font-bold text-white mb-2">Erro de Inicialização</h2>
          <p class="text-gray-300">${message}</p>
        </div>
        
        <button id="retry-btn" class="bg-furia-blue hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
          Tentar Novamente
        </button>
      </div>
    `;
    
    // Adicionar evento ao botão de retry
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }
}

// Mostrar modal de boas-vindas ao sistema
function showWelcomeModal() {
  showModal(`
    <div class="text-center">
      <div class="bg-furia-blue bg-opacity-20 inline-block p-3 rounded-full mx-auto mb-4">
        <svg class="h-12 w-12 text-furia-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">Bem-vindo ao FanInsight AI</h2>
      
      <p class="text-gray-300 mb-6">
        Crie seu perfil digital inteligente e verificável como fã da FURIA.
        Conecte suas redes sociais, perfis de jogos e desbloqueie experiências exclusivas!
      </p>
      
      <p class="text-gray-400 text-sm mb-8">
        Este é um ambiente de demonstração. Os dados não são reais e nenhuma informação é armazenada permanentemente.
      </p>
      
      <div>
        <button id="start-demo-btn" class="bg-furia-blue hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
          Começar Demonstração
        </button>
      </div>
    </div>
  `);
  
  // Adicionar evento ao botão
  setTimeout(() => {
    const startDemoBtn = document.getElementById('start-demo-btn');
    if (startDemoBtn) {
      startDemoBtn.addEventListener('click', () => {
        closeModal();
        navigateTo('/register');
      });
    }
  }, 100);
}

// Expor API global para debug em modo de desenvolvimento
if (DEV_MODE) {
  window.fanInsightAPI = {
    showNotification,
    showModal,
    navigateTo,
    isAuthenticated
  };
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initSystem);

// Exportar funções úteis
export {
  initSystem
}; 
      await initSocialConnections();
      
      //