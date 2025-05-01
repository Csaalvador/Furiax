// FanInsight AI - Módulo de Redes Sociais
// Gerencia conexões com redes sociais, análise de engajamento e processamento de dados

import { connectSocialNetwork, getSocialConnections, analyzeSocialData } from './api.js';
import { analyzeSocialText } from './ai.js';
import { showLoading, hideLoading, showNotification, state } from './app.js';

// Configurações de OAuth
const OAUTH_CONFIG = {
  twitter: {
    clientId: 'YOUR_TWITTER_CLIENT_ID',
    redirectUri: '/auth/callback/twitter',
    scopes: ['tweet.read', 'users.read', 'follows.read']
  },
  instagram: {
    clientId: 'YOUR_INSTAGRAM_CLIENT_ID',
    redirectUri: '/auth/callback/instagram',
    scopes: ['user_profile', 'user_media']
  },
  youtube: {
    clientId: 'YOUR_YOUTUBE_CLIENT_ID',
    redirectUri: '/auth/callback/youtube',
    scopes: ['https://www.googleapis.com/auth/youtube.readonly']
  }
};

// Estado das conexões sociais
let socialConnections = [];
let socialAnalysis = null;

// Inicializar conexões sociais
export async function initSocialConnections() {
  try {
    // Obter conexões existentes
    socialConnections = await getSocialConnections();
    console.log(`[Social] ${socialConnections.length} conexões sociais carregadas`);
    
    // Analisar conexões (se houver)
    if (socialConnections.length > 0) {
      await analyzeSocial();
    }
    
    return socialConnections;
  } catch (error) {
    console.error('[Social] Erro ao carregar conexões sociais:', error);
    return [];
  }
}

// Obter conexões sociais atuais
export function getSocialConnectionsList() {
  return socialConnections;
}

// Obter análise social atual
export function getSocialAnalysis() {
  return socialAnalysis;
}

// Função para conectar uma rede social
export async function connectSocial(platform) {
  if (!OAUTH_CONFIG[platform]) {
    showNotification(`Plataforma ${platform} não suportada`, 'error');
    return null;
  }
  
  showLoading();
  
  try {
    console.log(`[Social] Iniciando conexão com ${platform}`);
    
    // Em um sistema real, abriríamos uma janela de OAuth
    // Aqui vamos simular o processo
    
    // 1. Simular resposta de autorização bem-sucedida
    const socialData = await simulateOAuthFlow(platform);
    
    // 2. Enviar dados para a API
    const result = await connectSocialNetwork(platform);
    
    // 3. Adicionar à lista local
    const existingIndex = socialConnections.findIndex(conn => conn.platform === platform);
    
    if (existingIndex >= 0) {
      // Atualizar conexão existente
      socialConnections[existingIndex] = result;
    } else {
      // Adicionar nova conexão
      socialConnections.push(result);
    }
    
    // 4. Analisar as conexões atualizadas
    await analyzeSocial();
    
    // 5. Atualizar estado global
    state.socialConnections = socialConnections;
    
    showNotification(`${platform} conectado com sucesso!`, 'success');
    return result;
  } catch (error) {
    console.error(`[Social] Erro ao conectar ${platform}:`, error);
    showNotification(`Erro ao conectar ${platform}. Tente novamente.`, 'error');
    return null;
  } finally {
    hideLoading();
  }
}

// Analisar dados sociais
export async function analyzeSocial() {
  if (socialConnections.length === 0) {
    return null;
  }
  
  showLoading();
  
  try {
    console.log('[Social] Analisando dados sociais');
    
    // Preparar dados para análise
    const connectionsData = {};
    
    socialConnections.forEach(conn => {
      connectionsData[conn.platform] = conn;
    });
    
    // Enviar para a API
    socialAnalysis = await analyzeSocialData(connectionsData);
    
    // Atualizar estado global
    state.socialAnalysis = socialAnalysis;
    
    console.log('[Social] Análise concluída:', socialAnalysis);
    return socialAnalysis;
  } catch (error) {
    console.error('[Social] Erro na análise social:', error);
    return null;
  } finally {
    hideLoading();
  }
}

// Simular fluxo de OAuth (para fins de demonstração)
async function simulateOAuthFlow(platform) {
  // Simular delay de rede e processamento
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simular resposta de autorização
  const mockAuthResponse = {
    platform,
    accessToken: `mock_${platform}_access_token_${Date.now()}`,
    refreshToken: `mock_${platform}_refresh_token_${Date.now()}`,
    expiresIn: 3600,
    scope: OAUTH_CONFIG[platform].scopes.join(' ')
  };
  
  console.log(`[Social] OAuth simulado para ${platform}`);
  return mockAuthResponse;
}

// Processar callback de OAuth
export async function handleOAuthCallback(platform, code) {
  showLoading();
  
  try {
    console.log(`[Social] Processando callback OAuth para ${platform}`);
    
    // Em um sistema real, trocaríamos o código por tokens
    // Aqui vamos simular o processo
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular resposta de troca de código
    const tokenResponse = {
      accessToken: `${platform}_access_token_${Date.now()}`,
      refreshToken: `${platform}_refresh_token_${Date.now()}`,
      expiresIn: 3600
    };
    
    // Enviar tokens para a API
    const result = await connectSocialNetwork(platform);
    
    // Adicionar à lista local
    const existingIndex = socialConnections.findIndex(conn => conn.platform === platform);
    
    if (existingIndex >= 0) {
      // Atualizar conexão existente
      socialConnections[existingIndex] = result;
    } else {
      // Adicionar nova conexão
      socialConnections.push(result);
    }
    
    // Analisar as conexões atualizadas
    await analyzeSocial();
    
    // Atualizar estado global
    state.socialConnections = socialConnections;
    
    showNotification(`${platform} conectado com sucesso!`, 'success');
    return result;
  } catch (error) {
    console.error(`[Social] Erro ao processar callback OAuth para ${platform}:`, error);
    showNotification(`Erro ao conectar ${platform}. Tente novamente.`, 'error');
    return null;
  } finally {
    hideLoading();
  }
}

// Desconectar uma rede social
export async function disconnectSocial(platform) {
  showLoading();
  
  try {
    console.log(`[Social] Desconectando ${platform}`);
    
    // Em um sistema real, revogaríamos o acesso e tokens
    // Aqui vamos simular o processo
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remover da lista local
    socialConnections = socialConnections.filter(conn => conn.platform !== platform);
    
    // Analisar as conexões atualizadas
    if (socialConnections.length > 0) {
      await analyzeSocial();
    } else {
      socialAnalysis = null;
    }
    
    // Atualizar estado global
    state.socialConnections = socialConnections;
    state.socialAnalysis = socialAnalysis;
    
    showNotification(`${platform} desconectado com sucesso!`, 'success');
    return true;
  } catch (error) {
    console.error(`[Social] Erro ao desconectar ${platform}:`, error);
    showNotification(`Erro ao desconectar ${platform}. Tente novamente.`, 'error');
    return false;
  } finally {
    hideLoading();
  }
}

// Analisar interações públicas de uma rede social
export async function analyzePublicInteractions(platform, username) {
  showLoading();
  
  try {
    console.log(`[Social] Analisando interações públicas de ${username} no ${platform}`);
    
    // Em um sistema real, obteríamos dados da API da rede social
    // Aqui vamos simular alguns dados
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular análise de NLP em um texto fictício
    const sampleText = generateSampleSocialText(platform);
    const textAnalysis = await analyzeSocialText(sampleText, platform);
    
    // Gerar estatísticas fictícias
    const stats = {
      platform,
      username,
      mentionsCount: Math.floor(Math.random() * 50) + 5,
      engagementRate: (Math.random() * 0.15 + 0.05).toFixed(2),
      sentimentScore: parseFloat(textAnalysis.sentiment.score),
      sentimentLabel: textAnalysis.sentiment.label,
      relevanceScore: textAnalysis.furiaRelevance.score,
      entities: textAnalysis.entities,
      lastAnalyzed: new Date().toISOString()
    };
    
    console.log(`[Social] Análise concluída para ${username} no ${platform}:`, stats);
    return stats;
  } catch (error) {
    console.error(`[Social] Erro ao analisar interações de ${username} no ${platform}:`, error);
    return null;
  } finally {
    hideLoading();
  }
}

// Gerar texto fictício para simular análise de rede social
function generateSampleSocialText(platform) {
  const furiaReferences = [
    'Amando acompanhar os jogos da FURIA!',
    'Os jogadores da FURIA estão incríveis nesse campeonato!',
    'FURIA é simplesmente o melhor time, não tem jeito!',
    'Quem viu o último jogo da FURIA? Que vitória incrível!',
    'Mal posso esperar para ver a FURIA no próximo Major.',
    'arT e KSCERATO jogando em outro nível hoje pela FURIA!'
  ];
  
  const generalPhrases = [
    'Esse jogo está incrível!',
    'Quem está assistindo ao campeonato hoje?',
    'Jogada inacreditável nessa partida!',
    'Mal posso esperar pelo próximo jogo.',
    'CS2 é muito melhor que Valorant, não tem comparação.'
  ];
  
  // Selecionar algumas frases aleatórias
  const numFuriaReferences = Math.floor(Math.random() * 3) + 1;
  const numGeneralPhrases = Math.floor(Math.random() * 2) + 1;
  
  let text = '';
  
  // Adicionar referências à FURIA
  for (let i = 0; i < numFuriaReferences; i++) {
    const randomIndex = Math.floor(Math.random() * furiaReferences.length);
    text += furiaReferences[randomIndex] + ' ';
  }
  
  // Adicionar frases gerais
  for (let i = 0; i < numGeneralPhrases; i++) {
    const randomIndex = Math.floor(Math.random() * generalPhrases.length);
    text += generalPhrases[randomIndex] + ' ';
  }
  
  return text.trim();
}

// Formatar nome da plataforma para exibição
export function formatPlatformName(platform) {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return 'Twitter';
    case 'instagram':
      return 'Instagram';
    case 'youtube':
      return 'YouTube';
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
}

// Verificar se uma plataforma já está conectada
export function isPlatformConnected(platform) {
  return socialConnections.some(conn => conn.platform === platform);
}

// Obter ícone para uma plataforma
export function getPlatformIcon(platform) {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return '<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" /></svg>';
    case 'instagram':
      return '<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>';
    case 'youtube':
      return '<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" /></svg>';
    default:
      return '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
  }
}