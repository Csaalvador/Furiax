// FanInsight AI - Controlador de Perfis Externos
// Gerencia perfis de jogos e plataformas externas

const ExternalProfile = require('../models/ExternalProfile');
const User = require('../models/User');
const NLPService = require('../services/NLPService');
const logger = require('../utils/logger');

/**
 * Controlador para gerenciar perfis externos
 */
class ProfileController {
  /**
   * Adiciona um perfil externo
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async addProfile(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      const profileData = req.body;
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Validar dados do perfil
      if (!profileData.platform || !profileData.username || !profileData.url) {
        return res.status(400).json({ error: 'Dados incompletos. Platform, username e url são obrigatórios' });
      }
      
      // Verificar se já existe um perfil para esta plataforma/username
      const existingProfile = await ExternalProfile.findByUserIdAndPlatformAndUsername(
        userId, 
        profileData.platform, 
        profileData.username
      );
      
      let profile;
      
      if (existingProfile) {
        // Atualizar perfil existente
        profile = await ExternalProfile.update(existingProfile.id, {
          ...profileData,
          updatedAt: new Date()
        });
        
        logger.info(`Perfil externo atualizado: ${existingProfile.id} (${profileData.platform}/${profileData.username})`);
      } else {
        // Criar novo perfil
        profile = await ExternalProfile.create({
          userId,
          platform: profileData.platform,
          username: profileData.username,
          url: profileData.url,
          customPlatform: profileData.customPlatform || null,
          addedAt: new Date(),
          updatedAt: new Date()
        });
        
        logger.info(`Novo perfil externo adicionado: ${profile.id} (${profileData.platform}/${profileData.username})`);
      }
      
      // Iniciar análise assíncrona do perfil
      this.startAsyncAnalysis(userId, profile);
      
      return res.status(201).json({
        success: true,
        id: profile.id,
        platform: profile.platform,
        username: profile.username,
        addedAt: profile.addedAt
      });
    } catch (error) {
      logger.error(`Erro ao adicionar perfil externo para o usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao adicionar perfil externo' });
    }
  }
  
  /**
   * Lista todos os perfis externos do usuário
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async listProfiles(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Obter perfis
      const profiles = await ExternalProfile.findByUserId(userId);
      
      return res.status(200).json(profiles);
    } catch (error) {
      logger.error(`Erro ao listar perfis externos para o usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao listar perfis externos' });
    }
  }
  
  /**
   * Remove um perfil externo
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async removeProfile(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      const { profileId } = req.params;
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Verificar se o perfil existe e pertence ao usuário
      const profile = await ExternalProfile.findById(profileId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Perfil não encontrado' });
      }
      
      if (profile.userId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      // Remover o perfil
      await ExternalProfile.delete(profileId);
      
      logger.info(`Perfil externo removido: ${profileId}`);
      
      return res.status(200).json({
        success: true,
        message: 'Perfil removido com sucesso'
      });
    } catch (error) {
      logger.error(`Erro ao remover perfil externo ${req.params.profileId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao remover perfil externo' });
    }
  }
  
  /**
   * Analisa os perfis externos do usuário
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async analyzeProfiles(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Obter perfis
      const profiles = await ExternalProfile.findByUserId(userId);
      
      if (profiles.length === 0) {
        return res.status(400).json({ error: 'Nenhum perfil externo encontrado' });
      }
      
      // Perfis com análise concluída
      const analyzedProfiles = profiles.filter(profile => profile.relevanceScore !== null);
      
      if (analyzedProfiles.length === 0) {
        return res.status(200).json({
          message: 'Análises ainda em andamento',
          competitiveScore: 0,
          competitiveLevel: 'Não Definido',
          topGames: [],
          insights: ['Aguarde a conclusão das análises de perfil']
        });
      }
      
      // Calcular pontuação média de relevância
      const totalRelevance = analyzedProfiles.reduce((sum, profile) => sum + profile.relevanceScore, 0);
      const avgRelevance = totalRelevance / analyzedProfiles.length;
      
      // Determinar nível competitivo
      let competitiveLevel;
      if (avgRelevance >= 80) competitiveLevel = 'Pro-Player';
      else if (avgRelevance >= 60) competitiveLevel = 'Semi-Pro';
      else if (avgRelevance >= 40) competitiveLevel = 'Competitivo';
      else if (avgRelevance >= 20) competitiveLevel = 'Amador';
      else competitiveLevel = 'Casual';
      
      // Extrair estatísticas de jogos
      const allGameStats = [];
      
          profiles.forEach(profile => {
            if (profile.gameStats && Array.isArray(profile.gameStats)) {
              allGameStats.push(...profile.gameStats);
            }
          });
    
          // Continue with further processing (if any)
        } catch (error) {
          logger.error(`Erro ao analisar perfis externos para o usuário ${req.userId}: ${error.message}`);
          return res.status(500).json({ error: 'Erro ao analisar perfis externos' });
        }
      }
    }