// FanInsight AI - Controlador de Redes Sociais
// Gerencia conexões e análises de redes sociais

const SocialProfile = require('../models/SocialProfile');
const User = require('../models/User');
const SocialAnalysisService = require('../services/SocialAnalysisService');
const NLPService = require('../services/NLPService');
const oauthConfig = require('../config/oauth');
const logger = require('../utils/logger');

/**
 * Controlador para gerenciar redes sociais
 */
class SocialController {
  /**
   * Conecta uma rede social
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async connect(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      const { platform, authCode } = req.body;
      
      // Verificar se a plataforma é suportada
      if (!this.isSupportedPlatform(platform)) {
        return res.status(400).json({ error: `Plataforma ${platform} não suportada` });
      }
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Obter configuração OAuth para a plataforma
      const platformConfig = oauthConfig[platform];
      
      // Obter token de acesso usando o código de autorização
      const tokenData = await this.exchangeAuthCodeForToken(authCode, platformConfig);
      
      if (!tokenData) {
        return res.status(400).json({ error: 'Código de autorização inválido' });
      }
      
      // Obter dados do perfil do usuário na rede social
      const profileData = await this.fetchSocialProfileData(platform, tokenData.accessToken);
      
      if (!profileData) {
        return res.status(500).json({ error: 'Não foi possível obter dados do perfil' });
      }
      
      // Verificar se já existe uma conexão para esta plataforma
      const existingConnection = await SocialProfile.findByUserIdAndPlatform(userId, platform);
      
      let socialProfile;
      
      if (existingConnection) {
        // Atualizar conexão existente
        socialProfile = await SocialProfile.update(existingConnection.id, {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          expiresAt: new Date(Date.now() + (tokenData.expiresIn * 1000)),
          username: profileData.username,
          displayName: profileData.displayName,
          profileUrl: profileData.profileUrl,
          updatedAt: new Date()
        });
        
        logger.info(`Conexão atualizada para ${platform}: ${userId}`);
      } else {
        // Criar nova conexão
        socialProfile = await SocialProfile.create({
          userId,
          platform,
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          expiresAt: new Date(Date.now() + (tokenData.expiresIn * 1000)),
          username: profileData.username,
          displayName: profileData.displayName,
          profileUrl: profileData.profileUrl,
          connectedAt: new Date(),
          updatedAt: new Date()
        });
        
        logger.info(`Nova conexão para ${platform}: ${userId}`);
      }
      
      // Iniciar análise assíncrona
      this.startAsyncAnalysis(userId, platform, socialProfile.id, tokenData.accessToken);
      
      // Remover tokens da resposta por segurança
      const { accessToken, refreshToken, ...safeProfile } = socialProfile;
      
      return res.status(200).json({
        success: true,
        platform,
        username: profileData.username,
        connectedAt: socialProfile.connectedAt
      });
    } catch (error) {
      logger.error(`Erro ao conectar rede social para o usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao conectar rede social' });
    }
  }
  
  /**
   * Obtém todas as conexões de redes sociais do usuário
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async getConnections(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Obter conexões
      const connections = await SocialProfile.findByUserId(userId);
      
      // Remover tokens por segurança
      const safeConnections = connections.map(conn => {
        const { accessToken, refreshToken, ...safeConn } = conn;
        return safeConn;
      });
      
      return res.status(200).json(safeConnections);
    } catch (error) {
      logger.error(`Erro ao obter conexões para o usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao obter conexões de redes sociais' });
    }
  }
  
  /**
   * Desconecta uma rede social
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async disconnect(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      const { platform } = req.params;
      
      // Verificar se a plataforma é suportada
      if (!this.isSupportedPlatform(platform)) {
        return res.status(400).json({ error: `Plataforma ${platform} não suportada` });
      }
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Verificar se existe uma conexão para esta plataforma
      const connection = await SocialProfile.findByUserIdAndPlatform(userId, platform);
      
      if (!connection) {
        return res.status(404).json({ error: `Conexão com ${platform} não encontrada` });
      }
      
      // Em uma implementação real, revogaríamos o token na API da plataforma
      
      // Remover a conexão
      await SocialProfile.delete(connection.id);
      
      logger.info(`Conexão removida para ${platform}: ${userId}`);
      
      return res.status(200).json({
        success: true,
        message: `Conexão com ${platform} removida com sucesso`
      });
    } catch (error) {
      logger.error(`Erro ao desconectar rede social para o usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao desconectar rede social' });
    }
  }
  
  /**
   * Analisa os dados das redes sociais conectadas
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async analyzeSocialData(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Obter todas as conexões
      const connections = await SocialProfile.findByUserId(userId);
      
      if (connections.length === 0) {
        return res.status(400).json({ error: 'Nenhuma rede social conectada' });
      }
      
      // Preparar dados para análise
      const connectionsData = {};
      connections.forEach(conn => {
        connectionsData[conn.platform] = {
          username: conn.username,
          insights: conn.insights || {}
        };
      });
      
      // Realizar análise consolidada
      const analysisResult = await SocialAnalysisService.analyze(userId, connectionsData);
      
      // Atualizar score de engajamento social do usuário
      if (analysisResult.score) {
        await User.updateSocialEngagementScore(userId, analysisResult.score);
      }
      
      logger.info(`Análise social concluída para o usuário ${userId}`);
      
      return res.status(200).json(analysisResult);
    } catch (error) {
      logger.error(`Erro na análise social para o usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao analisar dados sociais' });
    }
  }
  
  /**
   * Inicia análise assíncrona de uma rede social
   * @param {string} userId - ID do usuário
   * @param {string} platform - Nome da plataforma
   * @param {string} profileId - ID do perfil social
   * @param {string} accessToken - Token de acesso
   */
  async startAsyncAnalysis(userId, platform, profileId, accessToken) {
    try {
      logger.info(`Iniciando análise assíncrona para ${platform} do usuário ${userId}`);
      
      // Obter dados para análise
      const userData = await this.fetchSocialDataForAnalysis(platform, accessToken);
      
      if (!userData || !userData.posts) {
        logger.warn(`Não foi possível obter dados para análise de ${platform} do usuário ${userId}`);
        return;
      }
      
      // Realizar análise NLP nos posts/conteúdos
      const textAnalysis = await NLPService.analyzeSocialContent(userData.posts);
      
      // Gerar insights específicos da plataforma
      const platformInsights = this.generatePlatformInsights(platform, userData);
      
      // Calcular pontuação de relevância FURIA
      const furiaRelevance = this.calculateFuriaRelevance(textAnalysis, userData, platform);
      
      // Criar objeto de insights
      const insights = {
        postCount: userData.posts.length,
        furiaRelevance,
        sentimentAnalysis: textAnalysis.sentiment,
        topEntities: textAnalysis.entities,
        engagementMetrics: platformInsights.engagementMetrics,
        lastAnalyzed: new Date()
      };
      
      // Adicionar métricas específicas da plataforma
      if (platform === 'twitter') {
        insights.tweetCount = userData.stats.tweetCount;
        insights.likeCount = userData.stats.likeCount;
      } else if (platform === 'instagram') {
        insights.postCount = userData.stats.postCount;
        insights.storyCount = userData.stats.storyCount;
      } else if (platform === 'youtube') {
        insights.videoCount = userData.stats.videoCount;
        insights.commentCount = userData.stats.commentCount;
      }
      
      // Atualizar o perfil com os insights
      await SocialProfile.updateInsights(profileId, insights);
      
      logger.info(`Análise assíncrona concluída para ${platform} do usuário ${userId}`);
    } catch (error) {
      logger.error(`Erro na análise assíncrona para ${platform} do usuário ${userId}: ${error.message}`);
    }
  }
  
  /**
   * Verifica se uma plataforma é suportada
   * @param {string} platform - Nome da plataforma
   * @returns {boolean} - Indica se a plataforma é suportada
   */
  isSupportedPlatform(platform) {
    return ['twitter', 'instagram', 'youtube'].includes(platform);
  }
  
  /**
   * Troca o código de autorização por um token de acesso
   * @param {string} authCode - Código de autorização
   * @param {Object} platformConfig - Configuração OAuth da plataforma
   * @returns {Object} - Dados do token
   */
  async exchangeAuthCodeForToken(authCode, platformConfig) {
    try {
      // Em uma implementação real, faríamos uma requisição à API de OAuth da plataforma
      // Simulação simplificada para este exemplo
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
        expiresIn: 3600 // 1 hora
      };
    } catch (error) {
      logger.error(`Erro ao trocar código por token: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Obtém dados do perfil do usuário na rede social
   * @param {string} platform - Nome da plataforma
   * @param {string} accessToken - Token de acesso
   * @returns {Object} - Dados do perfil
   */
  async fetchSocialProfileData(platform, accessToken) {
    try {
      // Em uma implementação real, faríamos uma requisição à API da plataforma
      // Simulação simplificada para este exemplo
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Gerar dados fictícios com base na plataforma
      let username, displayName, profileUrl;
      
      switch (platform) {
        case 'twitter':
          username = `furia_fan${Math.floor(Math.random() * 1000)}`;
          displayName = 'Fã da FURIA';
          profileUrl = `https://twitter.com/${username}`;
          break;
        case 'instagram':
          username = `furiagram${Math.floor(Math.random() * 1000)}`;
          displayName = 'Fã da FURIA';
          profileUrl = `https://instagram.com/${username}`;
          break;
        case 'youtube':
          username = `FURIA Fan`;
          displayName = 'Fã da FURIA';
          profileUrl = `https://youtube.com/c/randomchannel${Math.floor(Math.random() * 1000)}`;
          break;
        default:
          username = `user${Math.floor(Math.random() * 1000)}`;
          displayName = 'Usuário';
          profileUrl = '';
      }
      
      return { username, displayName, profileUrl };
    } catch (error) {
      logger.error(`Erro ao obter dados do perfil: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Obtém dados para análise de uma rede social
   * @param {string} platform - Nome da plataforma
   * @param {string} accessToken - Token de acesso
   * @returns {Object} - Dados para análise
   */
  async fetchSocialDataForAnalysis(platform, accessToken) {
    try {
      // Em uma implementação real, faríamos requisições às APIs da plataforma
      // Simulação simplificada para este exemplo
      
      // Simular delay de rede e processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulação de posts/conteúdos para análise de texto
      const posts = this.generateMockPosts(platform);
      
      // Estatísticas ficticias
      let stats = {};
      
      switch (platform) {
        case 'twitter':
          stats = {
            tweetCount: Math.floor(Math.random() * 50) + 10,
            likeCount: Math.floor(Math.random() * 100) + 20,
            followerCount: Math.floor(Math.random() * 500) + 50
          };
          break;
        case 'instagram':
          stats = {
            postCount: Math.floor(Math.random() * 30) + 5,
            storyCount: Math.floor(Math.random() * 20) + 5,
            followerCount: Math.floor(Math.random() * 800) + 100
          };
          break;
        case 'youtube':
          stats = {
            videoCount: Math.floor(Math.random() * 10) + 2,
            commentCount: Math.floor(Math.random() * 50) + 10,
            subscriberCount: Math.floor(Math.random() * 200) + 20
          };
          break;
      }
      
      return { posts, stats };
    } catch (error) {
      logger.error(`Erro ao obter dados para análise: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Gera posts fictícios para análise
   * @param {string} platform - Nome da plataforma
   * @returns {Array} - Lista de posts
   */
  generateMockPosts(platform) {
    const furiaRelatedContents = [
      'Esse jogo da FURIA foi incrível! Os jogadores estão em outro nível.',
      'Amando o novo uniforme da FURIA! Já comprei o meu #FURIANation',
      'O arT jogou demais hoje! FURIA mostrando que é a melhor equipe do Brasil.',
      'Mal posso esperar para ver a FURIA no próximo Major. Eles têm chances reais!',
      'A FURIA feminina está dominando! Muito orgulho dessa equipe!',
      'KSCERATO é simplesmente o melhor. FURIA tem muita sorte de ter ele no time.',
      'Fui ao evento da FURIA ontem e foi incrível conhecer os jogadores!',
      'Novo sticker da FURIA no CS2 ficou lindo demais!'
    ];
    
    const generalContents = [
      'Quem está assistindo ao campeonato hoje?',
      'Esse meta do jogo atual está muito chato.',
      'Alguém quer jogar uma partida mais tarde?',
      'Mal posso esperar pelo próximo torneio!',
      'Esse novo mapa é muito divertido de jogar.'
    ];
    
    // Selecionar conteúdos aleatórios
    const numPosts = Math.floor(Math.random() * 5) + 3; // 3-7 posts
    const posts = [];
    
    for (let i = 0; i < numPosts; i++) {
      // 70% de chance de ser relacionado à FURIA
      const collection = Math.random() < 0.7 ? furiaRelatedContents : generalContents;
      const randomIndex = Math.floor(Math.random() * collection.length);
      
      posts.push({
        content: collection[randomIndex],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
      });
    }
    
    return posts;
  }
  
  /**
   * Gera insights específicos para uma plataforma
   * @param {string} platform - Nome da plataforma
   * @param {Object} userData - Dados do usuário na plataforma
   * @returns {Object} - Insights específicos
   */
  generatePlatformInsights(platform, userData) {
    // Métricas de engajamento fictícias
    const engagementMetrics = {
      postFrequency: Math.random() < 0.3 ? 'Baixa' : Math.random() < 0.7 ? 'Média' : 'Alta',
      engagementRate: (Math.random() * 0.15 + 0.01).toFixed(2),
      furiaContentPercentage: Math.floor(Math.random() * 60) + 20
    };
    
    return { engagementMetrics };
  }
  
  /**
   * Calcula relevância para a FURIA com base na análise NLP
   * @param {Object} textAnalysis - Resultado da análise NLP
   * @param {Object} userData - Dados do usuário na plataforma
   * @param {string} platform - Nome da plataforma
   * @returns {Object} - Relevância FURIA
   */
  calculateFuriaRelevance(textAnalysis, userData, platform) {
    // Calcular pontuação entre 0-100
    const baseScore = Math.floor(Math.random() * 40) + 30; // 30-70
    
    // Adicionar bônus aleatório para simulação
    const bonus = Math.floor(Math.random() * 30);
    
    // Limitar a 100
    const score = Math.min(baseScore + bonus, 100);
    
    // Determinar nível com base na pontuação
    let level;
    if (score >= 80) level = 'Muito Alto';
    else if (score >= 60) level = 'Alto';
    else if (score >= 40) level = 'Médio';
    else if (score >= 20) level = 'Baixo';
    else level = 'Muito Baixo';
    
    return { score, level };
  }
}

module.exports = new SocialController();