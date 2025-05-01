// FanInsight AI - Modelo de Usuário
// Gerencia operações relacionadas aos dados de usuário

const bcrypt = require('bcrypt');
const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Modelo para operações relacionadas a usuários
 */
class User {
  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Usuário criado
   */
  async create(userData) {
    try {
      // Em uma implementação real, isso seria uma inserção no banco de dados
      logger.info(`Criando novo usuário: ${userData.personalInfo.email}`);
      
      // Gerar um ID único
      const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Criar objeto de usuário
      const user = {
        id: userId,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Em um ambiente real, armazenar no banco de dados
      // Aqui vamos simular o armazenamento em memória
      if (!global.users) {
        global.users = {};
      }
      
      global.users[userId] = user;
      
      return user;
    } catch (error) {
      logger.error(`Erro ao criar usuário: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Atualiza um usuário existente
   * @param {string} userId - ID do usuário
   * @param {Object} updates - Dados a serem atualizados
   * @returns {Object} Usuário atualizado
   */
  async update(userId, updates) {
    try {
      logger.info(`Atualizando usuário: ${userId}`);
      
      // Buscar usuário
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Atualizar campos
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date()
      };
      
      // Em um ambiente real, atualizar no banco de dados
      // Aqui vamos atualizar em memória
      global.users[userId] = updatedUser;
      
      return updatedUser;
    } catch (error) {
      logger.error(`Erro ao atualizar usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Busca um usuário pelo ID
   * @param {string} userId - ID do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  async findById(userId) {
    try {
      // Em um ambiente real, buscar no banco de dados
      // Aqui vamos buscar em memória
      if (!global.users) {
        global.users = {};
      }
      
      return global.users[userId] || null;
    } catch (error) {
      logger.error(`Erro ao buscar usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Busca um usuário pelo e-mail
   * @param {string} email - E-mail do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  async findByEmail(email) {
    try {
      // Em um ambiente real, buscar no banco de dados
      // Aqui vamos buscar em memória
      if (!global.users) {
        global.users = {};
      }
      
      // Buscar entre os usuários em memória
      const users = Object.values(global.users);
      return users.find(user => user.personalInfo && user.personalInfo.email === email) || null;
    } catch (error) {
      logger.error(`Erro ao buscar usuário por e-mail ${email}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Deleta um usuário
   * @param {string} userId - ID do usuário
   * @returns {boolean} Sucesso da operação
   */
  async delete(userId) {
    try {
      logger.info(`Deletando usuário: ${userId}`);
      
      // Verificar se o usuário existe
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Em um ambiente real, deletar do banco de dados
      // Aqui vamos deletar da memória
      delete global.users[userId];
      
      return true;
    } catch (error) {
      logger.error(`Erro ao deletar usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Criptografa uma senha
   * @param {string} password - Senha a ser criptografada
   * @returns {string} Senha criptografada
   */
  async hashPassword(password) {
    try {
      // Usar bcrypt para criptografia
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error(`Erro ao criptografar senha: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Compara uma senha com um hash
   * @param {string} password - Senha a ser comparada
   * @param {string} hash - Hash para comparação
   * @returns {boolean} Resultado da comparação
   */
  async comparePassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error(`Erro ao comparar senha: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Atualiza o status de verificação do usuário
   * @param {string} userId - ID do usuário
   * @param {boolean} isVerified - Status de verificação
   * @param {Date} verifiedAt - Data da verificação
   * @returns {Object} Usuário atualizado
   */
  async updateVerificationStatus(userId, isVerified, verifiedAt) {
    try {
      logger.info(`Atualizando status de verificação do usuário ${userId}: ${isVerified}`);
      
      // Buscar usuário
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Atualizar status
      const updatedUser = {
        ...user,
        verifiedAt: isVerified ? verifiedAt : null,
        updatedAt: new Date()
      };
      
      // Em um ambiente real, atualizar no banco de dados
      // Aqui vamos atualizar em memória
      global.users[userId] = updatedUser;
      
      return updatedUser;
    } catch (error) {
      logger.error(`Erro ao atualizar status de verificação do usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Atualiza score de engajamento social do usuário
   * @param {string} userId - ID do usuário
   * @param {number} score - Pontuação de engajamento social
   * @returns {Object} Usuário atualizado
   */
  async updateSocialEngagementScore(userId, score) {
    try {
      logger.info(`Atualizando score de engajamento social do usuário ${userId}: ${score}`);
      
      // Buscar usuário
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Atualizar score
      const updatedUser = {
        ...user,
        engagementScore: score,
        updatedAt: new Date()
      };
      
      // Em um ambiente real, atualizar no banco de dados
      // Aqui vamos atualizar em memória
      global.users[userId] = updatedUser;
      
      return updatedUser;
    } catch (error) {
      logger.error(`Erro ao atualizar score de engajamento social do usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Atualiza score competitivo do usuário
   * @param {string} userId - ID do usuário
   * @param {number} score - Pontuação competitiva
   * @returns {Object} Usuário atualizado
   */
  async updateCompetitiveScore(userId, score) {
    try {
      logger.info(`Atualizando score competitivo do usuário ${userId}: ${score}`);
      
      // Buscar usuário
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Atualizar score
      const updatedUser = {
        ...user,
        competitiveScore: score,
        updatedAt: new Date()
      };
      
      // Em um ambiente real, atualizar no banco de dados
      // Aqui vamos atualizar em memória
      global.users[userId] = updatedUser;
      
      return updatedUser;
    } catch (error) {
      logger.error(`Erro ao atualizar score competitivo do usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Atualiza a senha do usuário
   * @param {string} userId - ID do usuário
   * @param {string} hashedPassword - Nova senha já criptografada
   * @returns {boolean} Sucesso da operação
   */
  async updatePassword(userId, hashedPassword) {
    try {
      logger.info(`Atualizando senha do usuário: ${userId}`);
      
      // Buscar usuário
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Atualizar senha
      const updatedUser = {
        ...user,
        password: hashedPassword,
        updatedAt: new Date()
      };
      
      // Em um ambiente real, atualizar no banco de dados
      // Aqui vamos atualizar em memória
      global.users[userId] = updatedUser;
      
      return true;
    } catch (error) {
      logger.error(`Erro ao atualizar senha do usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Gera insights personalizados para o usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} Insights gerados
   */
  async generateInsights(userId) {
    try {
      logger.info(`Gerando insights para o usuário: ${userId}`);
      
      // Buscar usuário
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Em um sistema real, aqui teríamos um algoritmo complexo
      // para analisar todas as informações do usuário e gerar insights
      
      // Para este exemplo, vamos criar alguns insights fictícios
      const insights = {
        fanScore: user.fanScore || Math.floor(Math.random() * 60) + 30, // 30-90
        socialEngagement: {
          level: this.determineLevel(user.engagementScore || Math.floor(Math.random() * 60) + 30),
          score: user.engagementScore || Math.floor(Math.random() * 60) + 30
        },
        competitiveEngagement: {
          level: this.determineLevel(user.competitiveScore || Math.floor(Math.random() * 60) + 30),
          score: user.competitiveScore || Math.floor(Math.random() * 60) + 30
        },
        loyaltyScore: Math.floor(Math.random() * 60) + 30, // 30-90
        
        // Métricas sociais
        socialMentions: Math.floor(Math.random() * 50) + 5, // 5-55
        socialInteractions: Math.floor(Math.random() * 100) + 20, // 20-120
        interactionFrequency: this.determineFrequency(Math.random()),
        
        // Interações recentes
        recentInteractions: this.generateRecentInteractions(),
        
        // Recomendações
        recommendations: [
          'Participe do próximo meet & greet com os jogadores da FURIA',
          'Siga os canais oficiais da FURIA em outras plataformas',
          'Considere a inscrição na FURIA+, o programa de assinatura exclusivo',
          'Não perca o próximo torneio onde a FURIA estará competindo',
          'Conecte mais redes sociais para melhorar seu perfil de fã'
        ]
      };
      
      return insights;
    } catch (error) {
      logger.error(`Erro ao gerar insights para o usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Determina o nível com base em uma pontuação
   * @param {number} score - Pontuação
   * @returns {string} Nível determinado
   */
  determineLevel(score) {
    if (score >= 80) return 'Alto';
    if (score >= 50) return 'Médio';
    return 'Baixo';
  }
  
  /**
   * Determina a frequência com base em um valor
   * @param {number} value - Valor entre 0 e 1
   * @returns {string} Frequência determinada
   */
  determineFrequency(value) {
    if (value >= 0.7) return 'Alta';
    if (value >= 0.4) return 'Média';
    return 'Baixa';
  }
  
  /**
   * Gera interações recentes fictícias
   * @returns {Array} Lista de interações
   */
  generateRecentInteractions() {
    const interactionTypes = ['social_post', 'event', 'purchase', 'game'];
    const interactions = [];
    
    // Gerar 3-5 interações
    const count = Math.floor(Math.random() * 3) + 3; // 3-5
    
    for (let i = 0; i < count; i++) {
      const type = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      
      // Data nos últimos 30 dias
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      let interaction = {
        type,
        date: date.toISOString()
      };
      
      // Personalizar com base no tipo
      switch (type) {
        case 'social_post':
          interaction.title = 'Interação nas Redes Sociais';
          interaction.description = 'Você mencionou a FURIA em uma publicação que teve boa repercussão.';
          interaction.platform = ['Twitter', 'Instagram', 'YouTube'][Math.floor(Math.random() * 3)];
          break;
        case 'event':
          interaction.title = 'Participação em Evento';
          interaction.description = 'Você participou de um evento oficial da FURIA.';
          break;
        case 'purchase':
          interaction.title = 'Compra de Produto';
          interaction.description = 'Você adquiriu um produto oficial da FURIA.';
          break;
        case 'game':
          interaction.title = 'Partida com a FURIA';
          interaction.description = 'Você jogou uma partida com membros da FURIA.';
          interaction.platform = ['CS:GO', 'CS2', 'Valorant', 'League of Legends'][Math.floor(Math.random() * 4)];
          break;
      }
      
      interactions.push(interaction);
    }
    
    // Ordenar por data (mais recente primeiro)
    return interactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  
  /**
   * Salva um token de redefinição de senha
   * @param {string} userId - ID do usuário
   * @param {string} token - Token de redefinição
   * @returns {boolean} Sucesso da operação
   */
  async saveResetToken(userId, token) {
    try {
      logger.info(`Salvando token de redefinição para o usuário: ${userId}`);
      
      // Buscar usuário
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Atualizar com token
      const updatedUser = {
        ...user,
        resetToken: token,
        resetTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hora
        updatedAt: new Date()
      };
      
      // Em um ambiente real, atualizar no banco de dados
      // Aqui vamos atualizar em memória
      global.users[userId] = updatedUser;
      
      return true;
    } catch (error) {
      logger.error(`Erro ao salvar token de redefinição para o usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Valida um token de redefinição de senha
   * @param {string} userId - ID do usuário
   * @param {string} token - Token de redefinição
   * @returns {boolean} Resultado da validação
   */
  async validateResetToken(userId, token) {
    try {
      // Buscar usuário
      const user = await this.findById(userId);
      
      if (!user) {
        return false;
      }
      
      // Verificar token
      if (user.resetToken !== token) {
        return false;
      }
      
      // Verificar expiração
      if (new Date() > new Date(user.resetTokenExpiresAt)) {
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Erro ao validar token de redefinição para o usuário ${userId}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Limpa o token de redefinição de senha
   * @param {string} userId - ID do usuário
   * @returns {boolean} Sucesso da operação
   */
  async clearResetToken(userId) {
    try {
      logger.info(`Limpando token de redefinição para o usuário: ${userId}`);
      
      // Buscar usuário
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Remover token
      const updatedUser = {
        ...user,
        resetToken: null,
        resetTokenExpiresAt: null,
        updatedAt: new Date()
      };
      
      // Em um ambiente real, atualizar no banco de dados
      // Aqui vamos atualizar em memória
      global.users[userId] = updatedUser;
      
      return true;
    } catch (error) {
      logger.error(`Erro ao limpar token de redefinição para o usuário ${userId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new User();