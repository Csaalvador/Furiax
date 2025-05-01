// FanInsight AI - Utilitário de Segurança
// Funções para autenticação, autorização e segurança

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

/**
 * Classe para funções de segurança da aplicação
 */
class Security {
  /**
   * Inicializa o módulo de segurança
   */
  constructor() {
    // Chave secreta para tokens JWT
    this.jwtSecret = process.env.JWT_SECRET || 'faninsight-ai-default-secret-key';
    
    // Duração padrão do token JWT (1 dia)
    this.jwtExpiration = process.env.JWT_EXPIRATION || '1d';
    
    // Algoritmo de hash para tokens
    this.hashAlgorithm = 'sha256';
    
    logger.info('Módulo de segurança inicializado');
  }
  
  /**
   * Gera um token JWT
   * @param {Object} payload - Dados a serem incluídos no token
   * @param {string} expiration - Tempo de expiração (opcional)
   * @returns {string} Token JWT
   */
  generateToken(payload, expiration = null) {
    try {
      const options = {
        expiresIn: expiration || this.jwtExpiration
      };
      
      return jwt.sign(payload, this.jwtSecret, options);
    } catch (error) {
      logger.error(`Erro ao gerar token JWT: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Verifica e decodifica um token JWT
   * @param {string} token - Token JWT
   * @returns {Object} Payload decodificado
   * @throws {Error} Se o token for inválido
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      logger.error(`Erro ao verificar token JWT: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Decodifica um token JWT sem verificar assinatura
   * @param {string} token - Token JWT
   * @returns {Object} Payload decodificado
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error(`Erro ao decodificar token JWT: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Calcula o hash de uma string
   * @param {string} data - String a ser hashada
   * @returns {string} Hash em hexadecimal
   */
  calculateHash(data) {
    try {
      return crypto
        .createHash(this.hashAlgorithm)
        .update(data)
        .digest('hex');
    } catch (error) {
      logger.error(`Erro ao calcular hash: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Gera um ID único
   * @param {string} prefix - Prefixo para o ID (opcional)
   * @returns {string} ID único
   */
  generateUniqueId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    
    return `${prefix}${timestamp}${randomStr}`;
  }
  
  /**
   * Verifica se uma senha atende aos requisitos de segurança
   * @param {string} password - Senha a ser verificada
   * @returns {Object} Resultado da verificação
   */
  validatePasswordStrength(password) {
    // Definir requisitos
    const minLength = 8;
    const requireUppercase = true;
    const requireLowercase = true;
    const requireNumbers = true;
    const requireSpecialChars = false;
    
    // Verificar comprimento
    const isLongEnough = password.length >= minLength;
    
    // Verificar presença de caracteres específicos
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    // Validar com base nos requisitos
    const isValid = isLongEnough &&
      (!requireUppercase || hasUppercase) &&
      (!requireLowercase || hasLowercase) &&
      (!requireNumbers || hasNumbers) &&
      (!requireSpecialChars || hasSpecialChars);
    
    // Calcular pontuação de força (0-100)
    let strength = 0;
    
    // 40% para comprimento (até 16 caracteres)
    strength += Math.min(password.length, 16) * 2.5;
    
    // 20% para tipos de caracteres
    if (hasUppercase) strength += 20;
    if (hasLowercase) strength += 20;
    if (hasNumbers) strength += 20;
    if (hasSpecialChars) strength += 20;
    
    // Limitar a 100
    strength = Math.min(strength, 100);
    
    return {
      isValid,
      strength,
      issues: [
        !isLongEnough && `A senha deve ter pelo menos ${minLength} caracteres`,
        requireUppercase && !hasUppercase && 'A senha deve conter pelo menos uma letra maiúscula',
        requireLowercase && !hasLowercase && 'A senha deve conter pelo menos uma letra minúscula',
        requireNumbers && !hasNumbers && 'A senha deve conter pelo menos um número',
        requireSpecialChars && !hasSpecialChars && 'A senha deve conter pelo menos um caractere especial'
      ].filter(Boolean)
    };
  }
  
  /**
   * Sanitiza uma string para prevenir injeção
   * @param {string} input - String a ser sanitizada
   * @returns {string} String sanitizada
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  /**
   * Gera uma string aleatória
   * @param {number} length - Comprimento da string
   * @returns {string} String aleatória
   */
  generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    const randomValues = new Uint8Array(length);
    crypto.randomFillSync(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomValues[i] % chars.length);
    }
    
    return result;
  }
  
  /**
   * Gera um código de verificação numérico
   * @param {number} length - Comprimento do código
   * @returns {string} Código numérico
   */
  generateVerificationCode(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    
    // Usar crypto para maior segurança
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = (randomBytes.readUInt32BE(0) / 0xFFFFFFFF) * (max - min) + min;
    
    return Math.floor(randomNumber).toString();
  }
  
  /**
   * Verifica se um token de acesso expirou
   * @param {Date|string} expiresAt - Data de expiração
   * @returns {boolean} Se o token expirou
   */
  isTokenExpired(expiresAt) {
    if (!expiresAt) return true;
    
    const expirationDate = typeof expiresAt === 'string'
      ? new Date(expiresAt)
      : expiresAt;
    
    return expirationDate <= new Date();
  }
  
  /**
   * Obtém a informação de um IP
   * @param {Object} req - Objeto de requisição
   * @returns {string} Endereço IP
   */
  getClientIp(req) {
    return req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
  }
  
  /**
   * Gera um nonce para CSRF (Cross-Site Request Forgery)
   * @returns {string} Nonce
   */
  generateCsrfToken() {
    return this.generateRandomString(32);
  }
  
  /**
   * Verifica um nonce CSRF
   * @param {string} token - Token recebido
   * @param {string} storedToken - Token armazenado
   * @returns {boolean} Se o token é válido
   */
  verifyCsrfToken(token, storedToken) {
    if (!token || !storedToken) {
      return false;
    }
    
    return token === storedToken;
  }
}

module.exports = new Security();