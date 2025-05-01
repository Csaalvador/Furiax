// FanInsight AI - Serviço de Análise Social
// Analisa dados de redes sociais para determinar engajamento com a FURIA

const NLPService = require('./NLPService');
const logger = require('../utils/logger');

/**
 * Serviço para análise de redes sociais
 */
class SocialAnalysisService {
  /**
   * Analisa dados de redes sociais para determinar engajamento com a FURIA
   * @param {string} userId - ID do usuário
   * @param {Object} connectionsData - Dados de conexões sociais
   * @returns {Object} - Resultados da análise
   */
  async analyze(userId, connectionsData) {
    try {
      logger.info(`Iniciando análise social para o usuário ${userId}`);
      
      // Verificar se há conexões para analisar
      if (!connectionsData || Object.keys(connectionsData).length === 0) {
        return {
          score: 0,
          insights: [],
          overallEngagement: 'Não Definido'
        };
      }
      
      // Calcular pontuação para cada plataforma
      const platformScores = {};
      let totalScore = 0;
      let platformsCount = 0;
      
      for (const [platform, data] of Object.entries(connectionsData)) {
        const platformScore = this.calculatePlatformScore(platform, data);
        platformScores[platform] = platformScore;
        totalScore += platformScore;
        platformsCount++;
      }
      
      // Calcular pontuação média
      const averageScore = platformsCount > 0 ? Math.round(totalScore / platformsCount) : 0;
      
      // Ajustar pontuação final com base no número de plataformas conectadas
      // Bônus por ter múltiplas plataformas (máx. 15 pontos)
      const platformBonus = Math.min((platformsCount - 1) * 5, 15);
      
      // Pontuação final (limitada a 100)
      const finalScore = Math.min(averageScore + platformBonus, 100);
      
      // Determinar nível de engajamento com base na pontuação
      const engagementLevel = this.determineEngagementLevel(finalScore);
      
      // Gerar insights
      const insights = this.generateInsights(connectionsData, platformScores, finalScore, platformsCount);
      
      logger.info(`Análise social concluída para o usuário ${userId}: Score ${finalScore}, Nível ${engagementLevel}`);
      
      return {
        score: finalScore,
        platformScores,
        insights,
        overallEngagement: engagementLevel
      };
    } catch (error) {
      logger.error(`Erro na análise social para o usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Calcula pontuação para uma plataforma específica
   * @param {string} platform - Nome da plataforma
   * @param {Object} data - Dados da plataforma
   * @returns {number} - Pontuação calculada
   */
  calculatePlatformScore(platform, data) {
    // Se não houver insights, retornar pontuação baixa
    if (!data.insights || Object.keys(data.insights).length === 0) {
      return 20; // Pontuação base para plataformas sem análise detalhada
    }
    
    const insights = data.insights;
    
    // Pontuação base por plataforma
    let baseScore = 0;
    
    switch (platform) {
      case 'twitter':
        // Pontuação baseada em tweets e likes
        const tweetPoints = Math.min(insights.tweetCount * 2, 30);
        const likePoints = Math.min(insights.likeCount * 0.5, 20);
        baseScore = tweetPoints + likePoints;
        break;
        
      case 'instagram':
        // Pontuação baseada em posts e stories
        const postPoints = Math.min(insights.postCount * 3, 30);
        const storyPoints = Math.min(insights.storyCount * 1.5, 20);
        baseScore = postPoints + storyPoints;
        break;
        
      case 'youtube':
        // Pontuação baseada em vídeos assistidos e comentários
        const videoPoints = Math.min(insights.videoCount * 3, 30);
        const commentPoints = Math.min(insights.commentCount * 0.8, 20);
        baseScore = videoPoints + commentPoints;
        break;
        
      default:
        baseScore = 25; // Pontuação média para outras plataformas
    }
    
    // Adicionar pontuação da relevância FURIA (se disponível)
    if (insights.furiaRelevance && typeof insights.furiaRelevance.score === 'number') {
      return Math.round((baseScore + insights.furiaRelevance.score) / 2);
    }
    
    return Math.round(baseScore);
  }
  
  /**
   * Determina o nível de engajamento com base na pontuação
   * @param {number} score - Pontuação calculada
   * @returns {string} - Nível de engajamento
   */
  determineEngagementLevel(score) {
    if (score >= 85) return 'Superfã';
    if (score >= 70) return 'Fã Dedicado';
    if (score >= 50) return 'Fã Regular';
    if (score >= 30) return 'Fã Casual';
    return 'Iniciante';
  }
  
  /**
   * Gera insights com base nos dados analisados
   * @param {Object} connectionsData - Dados de conexões
   * @param {Object} platformScores - Pontuações por plataforma
   * @param {number} finalScore - Pontuação final
   * @param {number} platformsCount - Número de plataformas
   * @returns {Array} - Lista de insights
   */
  generateInsights(connectionsData, platformScores, finalScore, platformsCount) {
    const insights = [];
    
    // Insights baseados na pontuação final
    if (finalScore >= 85) {
      insights.push('Você demonstra alto engajamento com o conteúdo da FURIA nas redes sociais');
      insights.push('Suas interações são consistentes e frequentes');
      insights.push('Você é um dos fãs mais ativos nas redes sociais');
    } else if (finalScore >= 70) {
      insights.push('Você interage regularmente com o conteúdo da FURIA');
      insights.push('Suas interações mostram um forte interesse na organização');
      insights.push('Continue interagindo para aumentar seu nível de engajamento');
    } else if (finalScore >= 50) {
      insights.push('Você demonstra interesse moderado na FURIA');
      insights.push('Suas interações são ocasionais mas positivas');
      insights.push('Interaja mais com o conteúdo para aumentar seu nível de fã');
    } else {
      insights.push('Você está começando a demonstrar interesse na FURIA');
      insights.push('Conecte mais redes sociais para uma análise mais precisa');
      insights.push('Interaja mais com o conteúdo da FURIA nas redes sociais');
    }
    
    // Insights baseados no número de plataformas
    if (platformsCount >= 3) {
      insights.push('Sua presença em múltiplas redes sociais mostra dedicação abrangente à FURIA');
    } else if (platformsCount === 1) {
      insights.push('Conecte mais redes sociais para melhorar sua análise de engajamento');
    }
    
    // Insights específicos por plataforma
    for (const [platform, data] of Object.entries(connectionsData)) {
      const score = platformScores[platform];
      
      if (score >= 80) {
        insights.push(`Seu engajamento no ${this.formatPlatformName(platform)} é excepcional`);
      } else if (score >= 60 && platform === 'twitter') {
        insights.push('Seus tweets sobre a FURIA mostram conhecimento e dedicação');
      } else if (score >= 60 && platform === 'instagram') {
        insights.push('Seu conteúdo visual sobre a FURIA é de alta qualidade');
      } else if (score >= 60 && platform === 'youtube') {
        insights.push('Sua participação em conteúdo da FURIA no YouTube é notável');
      }
    }
    
    // Limitar a 5 insights
    return insights.slice(0, 5);
  }
  
  /**
   * Formata o nome da plataforma para exibição
   * @param {string} platform - Nome da plataforma
   * @returns {string} - Nome formatado
   */
  formatPlatformName(platform) {
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
}

module.exports = new SocialAnalysisService();