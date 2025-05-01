// FanInsight AI - Modelo de Perfil Externo
// Gerencia operações relacionadas a perfis de jogos e plataformas externas dos usuários

const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Modelo para operações relacionadas a perfis externos
 */
class ExternalProfile {
  /**
   * Cria um novo perfil externo
   * @param {Object} profileData - Dados do perfil externo
   * @returns {Object} Perfil externo criado
   */
  async create(profileData) {
    try {
      // Em uma implementação real, isso seria uma inserção no banco de dados
      logger.info(`Criando perfil externo para o usuário: ${profileData.userId} (${profileData.platform}/${profileData.username})`);
      
      // Gerar um ID único
      const profileId = `ext_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Criar objeto de perfil externo
      const profile = {
        id: profileId,
        ...profileData,
        relevanceScore: null, // Será preenchido após análise
        insights: null,       // Será preenchido após análise
        gameStats: null,      // Será preenchido após análise
        analyzedAt: null,     // Será preenchido após análise
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Em um ambiente real, armazenar no banco de dados
      // Aqui vamos simular o armazenamento em memória
      if (!global.externalProfiles) {
        global.externalProfiles = {};
      }
      
      global.externalProfiles[profileId] = profile;
      
      return profile;
    } catch (error) {
      logger.error(`Erro ao criar perfil externo: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Atualiza um perfil externo existente
   * @param {string} profileId - ID do perfil externo
   * @param {Object} updates - Dados a serem atualizados
   * @returns {Object} Perfil externo atualizado
   */
  async update(profileId, updates) {
    try {
      logger.info(`Atualizando perfil externo: ${profileId}`);
      
      // Buscar perfil
      const profile = await this.findById(profileId);
      
      if (!profile) {
        throw new Error('Perfil externo não encontrado');
      }
      
      // Atualizar campos
      const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date()
      };
      
      // Em um ambiente real, atualizar no banco de dados
      // Aqui vamos atualizar em memória
      global.externalProfiles[profileId] = updatedProfile;
      
      return updatedProfile;
    } catch (error) {
      logger.error(`Erro ao atualizar perfil externo ${profileId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Busca um perfil externo pelo ID
   * @param {string} profileId - ID do perfil externo
   * @returns {Object|null} Perfil externo encontrado ou null
   */
  async findById(profileId) {
    try {
      // Em um ambiente real, buscar no banco de dados
      // Aqui vamos buscar em memória
      if (!global.externalProfiles) {
        global.externalProfiles = {};
      }
      
      return global.externalProfiles[profileId] || null;
    } catch (error) {
      logger.error(`Erro ao buscar perfil externo ${profileId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Busca perfis externos pelo ID do usuário
   * @param {string} userId - ID do usuário
   * @returns {Array} Lista de perfis externos
   */
  async findByUserId(userId) {
    try {
      // Em um ambiente real, buscar no banco de dados
      // Aqui vamos buscar em memória
      if (!global.externalProfiles) {
        global.externalProfiles = {};
      }
      
      // Filtrar perfis pelo ID do usuário
      return Object.values(global.externalProfiles)
        .filter(profile => profile.userId === userId);
    } catch (error) {
      logger.error(`Erro ao buscar perfis externos para o usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Busca um perfil externo pelo ID do usuário, plataforma e nome de usuário
   * @param {string} userId - ID do usuário
   * @param {string} platform - Nome da plataforma
   * @param {string} username - Nome de usuário na plataforma
   * @returns {Object|null} Perfil externo encontrado ou null
   */
  async findByUserIdAndPlatformAndUsername(userId, platform, username) {
    try {
      // Em um ambiente real, buscar no banco de dados
      // Aqui vamos buscar em memória
      if (!global.externalProfiles) {
        global.externalProfiles = {};
      }
      
      // Filtrar perfis pelo ID do usuário, plataforma e nome de usuário
      const profiles = Object.values(global.externalProfiles)
        .filter(profile => 
          profile.userId === userId &&
          profile.platform === platform &&
          profile.username === username
        );
      
      return profiles.length > 0 ? profiles[0] : null;
    } catch (error) {
      logger.error(`Erro ao buscar perfil externo para o usuário ${userId}, plataforma ${platform} e username ${username}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Deleta um perfil externo
   * @param {string} profileId - ID do perfil externo
   * @returns {boolean} Sucesso da operação
   */
  async delete(profileId) {
    try {
      logger.info(`Deletando perfil externo: ${profileId}`);
      
      // Verificar se existe
      const profile = await this.findById(profileId);
      
      if (!profile) {
        throw new Error('Perfil externo não encontrado');
      }
      
      // Em um ambiente real, deletar do banco de dados
      // Aqui vamos deletar da memória
      delete global.externalProfiles[profileId];
      
      return true;
    } catch (error) {
      logger.error(`Erro ao deletar perfil externo ${profileId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Busca perfis externos por plataforma
   * @param {string} platform - Nome da plataforma
   * @returns {Array} Lista de perfis externos
   */
  async findByPlatform(platform) {
    try {
      // Em um ambiente real, buscar no banco de dados
      // Aqui vamos buscar em memória
      if (!global.externalProfiles) {
        global.externalProfiles = {};
      }
      
      // Filtrar perfis pela plataforma
      return Object.values(global.externalProfiles)
        .filter(profile => profile.platform === platform);
    } catch (error) {
      logger.error(`Erro ao buscar perfis externos para a plataforma ${platform}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Busca perfis externos pelos jogos presentes nas estatísticas
   * @param {string} gameName - Nome do jogo
   * @returns {Array} Lista de perfis externos
   */
  async findByGame(gameName) {
    try {
      // Em um ambiente real, buscar no banco de dados
      // Aqui vamos buscar em memória
      if (!global.externalProfiles) {
        global.externalProfiles = {};
      }
      
      // Filtrar perfis que contêm o jogo nas estatísticas
      return Object.values(global.externalProfiles)
        .filter(profile => {
          if (!profile.gameStats || !Array.isArray(profile.gameStats)) {
            return false;
          }
          
          return profile.gameStats.some(game => 
            game.name.toLowerCase() === gameName.toLowerCase()
          );
        });
    } catch (error) {
      logger.error(`Erro ao buscar perfis externos para o jogo ${gameName}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Conta perfis externos por plataforma
   * @returns {Object} Contagem por plataforma
   */
  async countByPlatform() {
    try {
      // Em um ambiente real, isso seria uma consulta agregada no banco de dados
      // Aqui vamos computar em memória
      if (!global.externalProfiles) {
        global.externalProfiles = {};
      }
      
      const profiles = Object.values(global.externalProfiles);
      const countByPlatform = {};
      
      profiles.forEach(profile => {
        if (profile.platform) {
          countByPlatform[profile.platform] = (countByPlatform[profile.platform] || 0) + 1;
        }
      });
      
      return countByPlatform;
    } catch (error) {
      logger.error(`Erro ao contar perfis externos por plataforma: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Busca perfis externos que ainda não foram analisados
   * @returns {Array} Lista de perfis externos não analisados
   */
  async findUnanalyzed() {
    try {
      // Em um ambiente real, buscar no banco de dados
      // Aqui vamos buscar em memória
      if (!global.externalProfiles) {
        global.externalProfiles = {};
      }
      
      // Filtrar perfis não analisados
      return Object.values(global.externalProfiles)
        .filter(profile => profile.analyzedAt === null);
    } catch (error) {
      logger.error(`Erro ao buscar perfis externos não analisados: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Busca perfis externos com uma pontuação de relevância mínima
   * @param {number} minScore - Pontuação mínima de relevância
   * @returns {Array} Lista de perfis externos
   */
  async findByMinimumRelevanceScore(minScore) {
    try {
      // Em um ambiente real, buscar no banco de dados
      // Aqui vamos buscar em memória
      if (!global.externalProfiles) {
        global.externalProfiles = {};
      }
      
      // Filtrar perfis pela pontuação de relevância
      return Object.values(global.externalProfiles)
        .filter(profile => profile.relevanceScore !== null && profile.relevanceScore >= minScore);
    } catch (error) {
      logger.error(`Erro ao buscar perfis externos com pontuação mínima de relevância ${minScore}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Gera estatísticas de jogos consolidadas para um usuário
   * @param {string} userId - ID do usuário
   * @returns {Array} Estatísticas de jogos consolidadas
   */
  async getConsolidatedGameStats(userId) {
    try {
      // Buscar todos os perfis do usuário
      const profiles = await this.findByUserId(userId);
      
      // Extrair estatísticas de jogos
      const allGameStats = [];
      
      profiles.forEach(profile => {
        if (profile.gameStats && Array.isArray(profile.gameStats)) {
          allGameStats.push(...profile.gameStats);
        }
      });
      
      // Consolidar estatísticas por jogo
      const gamesByName = {};
      
      allGameStats.forEach(game => {
        if (!gamesByName[game.name]) {
          gamesByName[game.name] = { name: game.name, hours: 0 };
        }
        gamesByName[game.name].hours += game.hours;
      });
      
      // Converter para array e ordenar por horas
      return Object.values(gamesByName)
        .sort((a, b) => b.hours - a.hours);
    } catch (error) {
      logger.error(`Erro ao gerar estatísticas de jogos consolidadas para o usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Calcula a pontuação média de relevância para um usuário
   * @param {string} userId - ID do usuário
   * @returns {number} Pontuação média
   */
  async getAverageRelevanceScore(userId) {
    try {
      // Buscar todos os perfis do usuário
      const profiles = await this.findByUserId(userId);
      
      // Filtrar perfis analisados
      const analyzedProfiles = profiles.filter(profile => profile.relevanceScore !== null);
      
      if (analyzedProfiles.length === 0) {
        return 0;
      }
      
      // Calcular média
      const totalScore = analyzedProfiles.reduce((sum, profile) => sum + profile.relevanceScore, 0);
      return totalScore / analyzedProfiles.length;
    } catch (error) {
      logger.error(`Erro ao calcular pontuação média de relevância para o usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ExternalProfile();