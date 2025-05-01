// FanInsight AI - Controlador de Autenticação
// Gerencia login, logout e verificação de tokens

const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/security');
const logger = require('../utils/logger');

/**
 * Controlador para gerenciar autenticação
 */
class AuthController {
  /**
   * Realiza login de usuário
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Verificar se o usuário existe
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      // Verificar senha
      const isPasswordValid = await User.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      // Gerar token JWT
      const token = generateToken({ id: user.id, email: user.email });
      
      // Registrar login no log
      logger.info(`Login realizado: ${user.id}`);
      
      // Remover senha do resultado
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json({
        success: true,
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      logger.error(`Erro no login: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao realizar login' });
    }
  }
  
  /**
   * Realiza logout (invalidação de token)
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async logout(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      
      // Em uma implementação real, adicionaríamos o token a uma lista negra
      // Aqui apenas registramos o logout
      logger.info(`Logout realizado: ${userId}`);
      
      return res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      logger.error(`Erro no logout: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao realizar logout' });
    }
  }
  
  /**
   * Verifica se o token é válido
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async verify(req, res) {
    try {
      // O middleware de autenticação já validou o token
      // Se chegou aqui, o token é válido
      
      return res.status(200).json({
        valid: true
      });
    } catch (error) {
      logger.error(`Erro na verificação de token: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao verificar token' });
    }
  }
  
  /**
   * Atualiza a senha do usuário
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async updatePassword(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      const { currentPassword, newPassword } = req.body;
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Verificar senha atual
      const isPasswordValid = await User.comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }
      
      // Criptografar a nova senha
      const hashedPassword = await User.hashPassword(newPassword);
      
      // Atualizar a senha
      await User.updatePassword(userId, hashedPassword);
      
      // Registrar atualização no log
      logger.info(`Senha atualizada: ${userId}`);
      
      return res.status(200).json({
        success: true,
        message: 'Senha atualizada com sucesso'
      });
    } catch (error) {
      logger.error(`Erro na atualização de senha: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
  }
  
  /**
   * Envia e-mail para recuperação de senha
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      // Verificar se o usuário existe
      const user = await User.findByEmail(email);
      if (!user) {
        // Por segurança, não informamos se o e-mail existe ou não
        return res.status(200).json({
          success: true,
          message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha'
        });
      }
      
      // Gerar token de redefinição (expira em 1 hora)
      const resetToken = generateToken({ id: user.id, email: user.email }, '1h');
      
      // Salvar token no banco (em uma implementação real)
      await User.saveResetToken(user.id, resetToken);
      
      // Enviar e-mail com o token (simulado aqui)
      // Em uma implementação real, integraríamos com um serviço de e-mail
      logger.info(`Token de recuperação enviado para: ${email}`);
      
      return res.status(200).json({
        success: true,
        message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha'
      });
    } catch (error) {
      logger.error(`Erro no envio de e-mail de recuperação: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao solicitar recuperação de senha' });
    }
  }
  
  /**
   * Redefine a senha usando o token de recuperação
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      // Verificar o token
      let decodedToken;
      try {
        decodedToken = verifyToken(token);
      } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }
      
      // Verificar se o usuário existe
      const user = await User.findById(decodedToken.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Verificar se o token está salvo no banco (em uma implementação real)
      const isTokenValid = await User.validateResetToken(user.id, token);
      if (!isTokenValid) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }
      
      // Criptografar a nova senha
      const hashedPassword = await User.hashPassword(newPassword);
      
      // Atualizar a senha
      await User.updatePassword(user.id, hashedPassword);
      
      // Invalidar o token usado
      await User.clearResetToken(user.id);
      
      // Registrar redefinição no log
      logger.info(`Senha redefinida: ${user.id}`);
      
      return res.status(200).json({
        success: true,
        message: 'Senha redefinida com sucesso'
      });
    } catch (error) {
      logger.error(`Erro na redefinição de senha: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
  }
}

module.exports = new AuthController();