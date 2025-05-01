// FanInsight AI - Controlador de Usuários
// Gerencia operações relacionadas a usuários

const User = require('../models/User');
const { generateToken } = require('../utils/security');
const logger = require('../utils/logger');

/**
 * Controlador para gerenciar usuários
 */
class UserController {
  /**
   * Registra um novo usuário
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async register(req, res) {
    try {
      const userData = req.body;
      
      // Verificar se o e-mail já está em uso
      const existingUser = await User.findByEmail(userData.personalInfo.email);
      if (existingUser) {
        return res.status(400).json({ error: 'E-mail já está em uso' });
      }
      
      // Criptografar a senha
      const hashedPassword = await User.hashPassword(userData.password);
      
      // Criar o usuário
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        registeredAt: new Date(),
        username: generateUsername(userData.personalInfo.fullName)
      });
      
      // Gerar token JWT
      const token = generateToken({ id: user.id, email: user.personalInfo.email });
      
      // Registrar no log
      logger.info(`Novo usuário registrado: ${user.id}`);
      
      // Retornar dados do usuário (sem a senha) e o token
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json({
        success: true,
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      logger.error(`Erro ao registrar usuário: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }
  
  /**
   * Obtém o perfil do usuário
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async getProfile(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Remover senha do resultado
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      logger.error(`Erro ao obter perfil do usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao obter perfil do usuário' });
    }
  }
  
  /**
   * Atualiza o perfil do usuário
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async updateProfile(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      const updates = req.body;
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Não permitir atualização de campos sensíveis
      delete updates.password;
      delete updates.id;
      delete updates.registeredAt;
      delete updates.verifiedAt;
      
      // Atualizar o usuário
      const updatedUser = await User.update(userId, updates);
      
      // Registrar no log
      logger.info(`Perfil atualizado: ${userId}`);
      
      // Remover senha do resultado
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      logger.error(`Erro ao atualizar perfil do usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao atualizar perfil do usuário' });
    }
  }
  
  /**
   * Obtém insights do fã
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async getFanInsights(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Obter insights personalizados
      const insights = await User.generateInsights(userId);
      
      return res.status(200).json(insights);
    } catch (error) {
      logger.error(`Erro ao obter insights do usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao obter insights do usuário' });
    }
  }
  
  /**
   * Deleta uma conta de usuário
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async deleteAccount(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Verificar senha para confirmação
      const { password } = req.body;
      const isPasswordValid = await User.comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha inválida' });
      }
      
      // Deletar o usuário
      await User.delete(userId);
      
      // Registrar no log
      logger.info(`Usuário deletado: ${userId}`);
      
      return res.status(200).json({
        success: true,
        message: 'Conta deletada com sucesso'
      });
    } catch (error) {
      logger.error(`Erro ao deletar usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao deletar conta de usuário' });
    }
  }
}

/**
 * Gera um nome de usuário a partir do nome completo
 * @param {string} fullName - Nome completo
 * @returns {string} Nome de usuário
 */
function generateUsername(fullName) {
  if (!fullName) return `user_${Date.now().toString(36)}`;
  
  // Remover caracteres especiais, acentos e espaços
  const normalizedName = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .toLowerCase();
  
  // Pegar primeiro nome e sobrenome
  const parts = normalizedName.split(' ');
  let username = parts[0];
  
  // Adicionar sobrenome se existir
  if (parts.length > 1) {
    username += parts[parts.length - 1];
  }
  
  // Adicionar número aleatório para garantir unicidade
  username += Math.floor(Math.random() * 1000);
  
  return username;
}

module.exports = new UserController();