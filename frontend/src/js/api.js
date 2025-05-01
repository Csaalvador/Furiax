// FanInsight AI - Módulo de API
// Gerencia todas as chamadas para o servidor e manipulação de dados

// API Base URL - Em um ambiente real, isso viria de uma configuração
const API_BASE_URL = 'https://api.faninsight.furia.org/v1';

// Token de autenticação
let authToken = localStorage.getItem('faninsight_token') || null;

// Função para configurar a URL base da API
export function setupAPI(baseUrl) {
  if (baseUrl) {
    API_BASE_URL = baseUrl;
  }
}

// Função para definir o token de autenticação
export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('faninsight_token', token);
  } else {
    localStorage.removeItem('faninsight_token');
  }
}

// Função para obter o token atual
export function getAuthToken() {
  return authToken;
}

// Função para criar cabeçalhos de requisição
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

// Wrapper para chamadas de API com tratamento de erros
async function apiCall(endpoint, method = 'GET', data = null) {
  // Em um ambiente de desenvolvimento, simular respostas
  if (process.env.NODE_ENV === 'development' || !API_BASE_URL.startsWith('http')) {
    return mockApiResponse(endpoint, method, data);
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: getHeaders(),
  };
  
  if (data) {
    if (data instanceof FormData) {
      // Remover content-type para que o navegador defina corretamente com boundary
      delete options.headers['Content-Type'];
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
    }
  }
  
  try {
    const response = await fetch(url, options);
    
    // Verificar se a resposta está ok
    if (!response.ok) {
      // Verificar se a resposta contém JSON com detalhes do erro
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro: ${response.status} ${response.statusText}`);
      } catch (e) {
        // Se não conseguir ler o JSON, lançar erro padrão
        throw new Error(`Erro: ${response.status} ${response.statusText}`);
      }
    }
    
    // Verificar se a resposta contém conteúdo
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro na chamada de API:', error);
    throw error;
  }
}

// --------------------- Autenticação --------------------- //

// Registro de novo usuário
export async function registerUser(userData) {
  const response = await apiCall('/auth/register', 'POST', userData);
  if (response.token) {
    setAuthToken(response.token);
  }
  return response;
}

// Login
export async function login(email, password) {
  const response = await apiCall('/auth/login', 'POST', { email, password });
  if (response.token) {
    setAuthToken(response.token);
  }
  return response;
}

// Logout
export async function logout() {
  await apiCall('/auth/logout', 'POST');
  setAuthToken(null);
}

// Verificar se o token é válido
export async function verifyToken() {
  if (!authToken) return false;
  
  try {
    await apiCall('/auth/verify');
    return true;
  } catch (error) {
    setAuthToken(null);
    return false;
  }
}

// --------------------- Verificação de Identidade --------------------- //

// Enviar documentos para verificação
export async function submitVerification(formData) {
  return await apiCall('/verification/submit', 'POST', formData);
}

// Verificar status da verificação
export async function checkVerificationStatus() {
  return await apiCall('/verification/status');
}

// --------------------- Redes Sociais --------------------- //

// Conectar rede social
export async function connectSocialNetwork(platform) {
  return await apiCall('/social/connect', 'POST', { platform });
}

// Obter redes sociais conectadas
export async function getSocialConnections() {
  return await apiCall('/social/connections');
}

// Analisar dados sociais
export async function analyzeSocialData(socialData) {
  return await apiCall('/social/analyze', 'POST', socialData);
}

// --------------------- Perfis Externos --------------------- //

// Adicionar perfil externo
export async function addExternalProfile(profileData) {
  return await apiCall('/profiles/add', 'POST', profileData);
}

// Obter perfis externos
export async function getExternalProfiles() {
  return await apiCall('/profiles/list');
}

// Analisar perfis externos
export async function analyzeExternalProfiles(profiles) {
  return await apiCall('/profiles/analyze', 'POST', { profiles });
}

// Analisar um perfil individual
export async function analyzeSingleProfile(profile) {
  return await apiCall('/profiles/analyze/single', 'POST', profile);
}

// --------------------- Perfil de Usuário --------------------- //

// Obter perfil completo do usuário
export async function getUserProfile() {
  return await apiCall('/user/profile');
}

// Obter insights do fã
export async function getFanInsights() {
  return await apiCall('/user/insights');
}

// --------------------- Funções de Simulação --------------------- //

// Função para simular resposta da API durante desenvolvimento
// Esta função é crucial para podermos testar o frontend sem o backend
function mockApiResponse(endpoint, method, data) {
  console.log(`[API Mock] ${method} ${endpoint}`, data);
  
  // Simulação de delay de rede (entre 300ms e 1000ms)
  const delay = Math.floor(Math.random() * 700) + 300;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simular respostas baseadas no endpoint
      if (endpoint === '/auth/register' && method === 'POST') {
        resolve({
          success: true,
          user: {
            id: 'usr_mock123',
            username: data.personalInfo.email.split('@')[0],
            email: data.personalInfo.email
          },
          token: 'mock_jwt_token_for_testing'
        });
      }
      
      else if (endpoint === '/auth/login' && method === 'POST') {
        resolve({
          success: true,
          user: {
            id: 'usr_mock123',
            username: data.email.split('@')[0],
            email: data.email
          },
          token: 'mock_jwt_token_for_testing'
        });
      }
      
      else if (endpoint === '/auth/logout' && method === 'POST') {
        resolve({ success: true });
      }
      
      else if (endpoint === '/auth/verify') {
        resolve({ valid: true });
      }
      
      else if (endpoint === '/verification/submit' && method === 'POST') {
        // Simular verificação bem-sucedida 90% das vezes
        if (Math.random() > 0.1) {
          resolve({
            success: true,
            status: 'verified',
            message: 'Identidade verificada com sucesso!'
          });
        } else {
          resolve({
            success: false,
            status: 'failed',
            message: 'Não foi possível verificar sua identidade. Por favor, tente novamente.'
          });
        }
      }
      
      else if (endpoint === '/verification/status') {
        resolve({
          status: 'verified',
          verifiedAt: new Date().toISOString()
        });
      }
      
      else if (endpoint === '/social/connect' && method === 'POST') {
        // Gerar dados fictícios para cada plataforma
        const platform = data.platform;
        let username, insights;
        
        switch (platform) {
          case 'twitter':
            username = 'furiaFan' + Math.floor(Math.random() * 1000);
            insights = {
              tweetCount: Math.floor(Math.random() * 30) + 10,
              likeCount: Math.floor(Math.random() * 100) + 50
            };
            break;
          case 'instagram':
            username = 'furiaLover' + Math.floor(Math.random() * 1000);
            insights = {
              postCount: Math.floor(Math.random() * 15) + 5,
              storyCount: Math.floor(Math.random() * 25) + 10
            };
            break;
          case 'youtube':
            username = 'FURIA ' + (Math.random() > 0.5 ? 'Fan' : 'Supporter') + Math.floor(Math.random() * 100);
            insights = {
              videoCount: Math.floor(Math.random() * 50) + 20,
              commentCount: Math.floor(Math.random() * 40) + 15
            };
            break;
          default:
            username = 'user' + Math.floor(Math.random() * 1000);
            insights = {};
        }
        
        resolve({
          success: true,
          platform,
          username,
          insights,
          connectedAt: new Date().toISOString()
        });
      }
      
      else if (endpoint === '/social/connections') {
        // Simular lista de conexões sociais
        resolve([
          {
            platform: 'twitter',
            username: 'furiaFan123',
            insights: {
              tweetCount: 23,
              likeCount: 87
            },
            connectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
          },
          {
            platform: 'instagram',
            username: 'furialover42',
            insights: {
              postCount: 8,
              storyCount: 15
            },
            connectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 dias atrás
          }
        ]);
      }
      
      else if (endpoint === '/social/analyze' && method === 'POST') {
        // Calcular pontuação com base nas conexões
        const connections = Object.values(data).filter(conn => conn !== null);
        
        // Calcular pontuação entre 20 e 95
        const baseScore = 20;
        const maxScore = 95;
        const connectionsBonus = connections.length * 15;
        const randomFactor = Math.floor(Math.random() * 15);
        const score = Math.min(baseScore + connectionsBonus + randomFactor, maxScore);
        
        // Gerar insights com base na pontuação
        let insights = [];
        
        if (score >= 80) {
          insights = [
            'Você demonstra alto engajamento com o conteúdo da FURIA nas redes sociais',
            'Suas interações são consistentes e frequentes',
            'Você é um dos fãs mais ativos nas redes sociais'
          ];
        } else if (score >= 60) {
          insights = [
            'Você interage regularmente com o conteúdo da FURIA',
            'Suas interações mostram um forte interesse na organização',
            'Continue interagindo para aumentar seu nível de engajamento'
          ];
        } else if (score >= 40) {
          insights = [
            'Você demonstra interesse moderado na FURIA',
            'Suas interações são ocasionais mas positivas',
            'Interaja mais com o conteúdo para aumentar seu nível de fã'
          ];
        } else {
          insights = [
            'Você está começando a demonstrar interesse na FURIA',
            'Conecte mais redes sociais para uma análise mais precisa',
            'Interaja mais com o conteúdo da FURIA nas redes sociais'
          ];
        }
        
        resolve({
          score,
          insights,
          overallEngagement: score >= 80 ? 'Superfã' : score >= 60 ? 'Fã Assíduo' : score >= 40 ? 'Fã Regular' : 'Fã Casual'
        });
      }
      
      else if (endpoint === '/profiles/add' && method === 'POST') {
        resolve({
          success: true,
          id: 'prf_' + Math.random().toString(36).substring(2, 10),
          ...data
        });
      }
      
      else if (endpoint === '/profiles/list') {
        // Simular lista de perfis externos
        resolve([
          {
            id: 'prf_steam123',
            platform: 'steam',
            username: 'FURIAfan123',
            url: 'https://steamcommunity.com/id/furiafan123',
            addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            relevanceScore: 78,
            insights: 'Vários jogos relacionados à FURIA na biblioteca. Participação em eventos da comunidade.',
            gameStats: [
              { name: 'CS:GO', hours: 450 },
              { name: 'Valorant', hours: 120 },
              { name: 'Apex Legends', hours: 85 }
            ]
          },
          {
            id: 'prf_faceit456',
            platform: 'faceit',
            username: 'furioso_player',
            url: 'https://www.faceit.com/en/players/furioso_player',
            addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            relevanceScore: 92,
            insights: 'Participação em torneios organizados pela FURIA. Histórico de partidas com jogadores da organização.',
            gameStats: [
              { name: 'CS:GO', hours: 780 },
              { name: 'Valorant', hours: 240 }
            ]
          }
        ]);
      }
      
      else if (endpoint === '/profiles/analyze' && method === 'POST') {
        // Calcular pontuação média de relevância
        const profiles = data.profiles || [];
        const totalRelevance = profiles.reduce((sum, profile) => sum + (profile.relevanceScore || 0), 0);
        const avgRelevance = profiles.length > 0 ? totalRelevance / profiles.length : 0;
        
        // Determinar nível baseado na pontuação média
        let level;
        if (avgRelevance >= 80) level = 'Pro-Player';
        else if (avgRelevance >= 60) level = 'Semi-Pro';
        else if (avgRelevance >= 40) level = 'Competitivo';
        else if (avgRelevance >= 20) level = 'Amador';
        else level = 'Casual';
        
        // Criar lista de jogos combinada
        const allGameStats = profiles
          .filter(p => p.gameStats)
          .flatMap(p => p.gameStats);
        
        const gamesByName = {};
        allGameStats.forEach(game => {
          if (!gamesByName[game.name]) {
            gamesByName[game.name] = { name: game.name, hours: 0 };
          }
          gamesByName[game.name].hours += game.hours;
        });
        
        const topGames = Object.values(gamesByName)
          .sort((a, b) => b.hours - a.hours)
          .slice(0, 5);
        
        // Gerar insights baseados nos perfis
        let insights;
        if (avgRelevance >= 80) {
          insights = [
            'Seu perfil mostra um nível profissional de jogo',
            'Alta atividade em jogos que a FURIA compete',
            'Forte engajamento em competições da FURIA',
            'Horas significativas em jogos competitivos'
          ];
        } else if (avgRelevance >= 60) {
          insights = [
            'Você demonstra habilidades de alto nível',
            'Participação ativa em torneios relacionados à FURIA',
            'Presença constante em jogos competitivos',
            'Continue evoluindo para alcançar o nível profissional'
          ];
        } else if (avgRelevance >= 40) {
          insights = [
            'Seu perfil mostra participação regular em competições',
            'Interesse consistente em jogos da FURIA',
            'Potencial para crescimento competitivo'
          ];
        } else {
          insights = [
            'Você mostra interesse em jogos que a FURIA compete',
            'Considere participar de mais eventos da comunidade',
            'Conecte mais perfis para uma análise mais completa'
          ];
        }
        
        resolve({
          competitiveScore: Math.round(avgRelevance),
          competitiveLevel: level,
          topGames,
          insights
        });
      }
      
      else if (endpoint === '/profiles/analyze/single' && method === 'POST') {
        // Gerar pontuação aleatória entre 30 e 95
        const relevanceScore = Math.floor(Math.random() * 65) + 30;
        
        // Insights específicos baseados na plataforma
        let insights;
        switch (data.platform.toLowerCase()) {
          case 'steam':
            insights = 'Jogos com temática FURIA detectados na biblioteca. Vários emblemas de eventos da FURIA conquistados.';
            break;
          case 'faceit':
            insights = 'Participação em 3 hubs da FURIA detectada. Histórico de partidas com jogadores da FURIA.';
            break;
          case 'twitch':
            insights = 'Alto engajamento em streams da FURIA. Inscrição em 2 canais da FURIA nos últimos 6 meses.';
            break;
          case 'riot':
            insights = 'Várias menções a jogadores da FURIA em chats de partida. Participação em torneios comunitários da FURIA.';
            break;
          default:
            insights = 'Menções à FURIA detectadas no perfil. Engajamento moderado com conteúdo da organização.';
        }
        
        resolve({
          relevanceScore,
          insights
        });
      }
      
      else if (endpoint === '/user/profile') {
        // Simular perfil completo do usuário
        resolve({
          id: 'usr_mock123',
          username: 'furiafan',
          profileImage: 'https://i.pravatar.cc/300',
          fanLevel: 'Fã Dedicado',
          fanScore: 75,
          engagementScore: 82,
          competitiveScore: 68,
          loyaltyScore: 70,
          eventsAttended: 3,
          registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          
          personalInfo: {
            fullName: 'Carlos Silva',
            email: 'carlos.silva@exemplo.com',
            phone: '(11) 98765-4321',
            birthDate: '1992-05-15T00:00:00Z',
            cpf: '123.456.789-00'
          },
          
          address: {
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 45',
            neighborhood: 'Jardim Paulista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567'
          },
          
          interests: {
            games: ['CS:GO', 'Valorant', 'League of Legends'],
            teams: ['CS:GO', 'Valorant', 'FURIA Feminina'],
            events: 'Major Rio 2022, IEM São Paulo, FURIA Fan Day',
            products: 'Camiseta FURIA 2023, Mousepad FURIA, Ingresso VIP Major Rio'
          },
          
          socialConnections: [
            { platform: 'twitter', username: 'furiaFan123' },
            { platform: 'instagram', username: 'furialover42' }
          ],
          
          gameProfiles: [
            { platform: 'steam', username: 'FURIAfan123' },
            { platform: 'faceit', username: 'furioso_player' }
          ]
        });
      }
      
      else if (endpoint === '/user/insights') {
        // Simular insights do fã
        resolve({
          fanScore: 75,
          socialEngagement: {
            level: 'Alto',
            score: 82
          },
          competitiveEngagement: {
            level: 'Médio-Alto',
            score: 68
          },
          loyaltyScore: 70,
          
          // Métricas sociais
          socialMentions: 42,
          socialInteractions: 128,
          interactionFrequency: 'Alta',
          
          // Resumo de interações recentes
          recentInteractions: [
            {
              type: 'social_post',
              title: 'Tweet sobre a FURIA',
              description: 'Você mencionou a FURIA em um tweet sobre a vitória no último campeonato',
              platform: 'Twitter',
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              type: 'event',
              title: 'Participação em Evento',
              description: 'Você marcou presença no FURIA Fan Day',
              date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              type: 'purchase',
              title: 'Compra de Produto',
              description: 'Você adquiriu a nova camiseta oficial da FURIA',
              date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          
          // Recomendações personalizadas
          recommendations: [
            'Participar do próximo meet & greet com os jogadores',
            'Seguir os canais oficiais da FURIA em outras plataformas',
            'Considerar a inscrição na FURIA+, o programa de assinatura exclusivo'
          ]
        });
      }
      
      else {
        // Endpoint não encontrado
        resolve({
          error: 'Endpoint não implementado no mock',
          endpoint,
          method
        });
      }
    }, delay);
  });
}