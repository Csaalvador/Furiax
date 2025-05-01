// FanInsight AI - Controlador de Verificação
// Gerencia verificação de identidade e documentos

const Identity = require('../models/Identity');
const User = require('../models/User');
const OCRService = require('../services/OCRService');
const FaceRecognitionService = require('../services/FaceRecognitionService');
const logger = require('../utils/logger');

/**
 * Controlador para gerenciar verificação de identidade
 */
class VerificationController {
  /**
   * Submete documentos para verificação
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async submitVerification(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Verificar se já existe uma verificação pendente ou concluída
      const existingVerification = await Identity.findByUserId(userId);
      if (existingVerification && existingVerification.status === 'verified') {
        return res.status(400).json({ error: 'Usuário já verificado' });
      }
      
      // Obter os arquivos
      const { document, selfie } = req.files;
      
      if (!document || !selfie) {
        return res.status(400).json({ error: 'Documento e selfie são obrigatórios' });
      }
      
      // Iniciar processamento de verificação
      logger.info(`Iniciando verificação para o usuário ${userId}`);
      
      // 1. Extrair texto do documento usando OCR
      const documentData = await OCRService.extractText(document.path);
      logger.info(`OCR concluído para o usuário ${userId}`);
      
      // 2. Verificar se os dados do documento correspondem aos dados do usuário
      const isDataConsistent = this.validateDocumentData(documentData, user.personalInfo);
      
      if (!isDataConsistent) {
        logger.warn(`Dados inconsistentes no documento para o usuário ${userId}`);
        
        // Salvar a tentativa
        await Identity.create({
          userId,
          status: 'failed',
          reason: 'inconsistent_data',
          documentType: documentData.type,
          processingData: {
            documentConfidence: documentData.confidence,
            dataMatch: false
          },
          createdAt: new Date()
        });
        
        return res.status(400).json({
          success: false,
          status: 'failed',
          message: 'Os dados do documento não correspondem aos dados do cadastro'
        });
      }
      
      // 3. Verificar correspondência facial
      const faceMatchResult = await FaceRecognitionService.compareImages(
        document.path,
        selfie.path
      );
      
      logger.info(`Comparação facial concluída para o usuário ${userId}: ${faceMatchResult.match ? 'Sucesso' : 'Falha'}`);
      
      if (!faceMatchResult.match) {
        // Salvar a tentativa
        await Identity.create({
          userId,
          status: 'failed',
          reason: 'face_mismatch',
          documentType: documentData.type,
          processingData: {
            documentConfidence: documentData.confidence,
            dataMatch: true,
            faceMatch: false,
            faceConfidence: faceMatchResult.confidence
          },
          createdAt: new Date()
        });
        
        return res.status(400).json({
          success: false,
          status: 'failed',
          message: 'Não foi possível confirmar a correspondência facial'
        });
      }
      
      // 4. Verificação bem-sucedida
      // Registrar a verificação
      const verification = await Identity.create({
        userId,
        status: 'verified',
        documentType: documentData.type,
        documentNumber: documentData.documentNumber,
        processingData: {
          documentConfidence: documentData.confidence,
          dataMatch: true,
          faceMatch: true,
          faceConfidence: faceMatchResult.confidence
        },
        verifiedAt: new Date(),
        createdAt: new Date()
      });
      
      // Atualizar o status de verificação do usuário
      await User.updateVerificationStatus(userId, true, new Date());
      
      logger.info(`Verificação concluída com sucesso para o usuário ${userId}`);
      
      return res.status(200).json({
        success: true,
        status: 'verified',
        message: 'Identidade verificada com sucesso',
        verifiedAt: verification.verifiedAt
      });
    } catch (error) {
      logger.error(`Erro na verificação para o usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao processar verificação de identidade' });
    }
  }
  
  /**
   * Verifica o status atual da verificação
   * @param {Object} req - Requisição
   * @param {Object} res - Resposta
   */
  async checkStatus(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      
      // Obter o status atual da verificação
      const verification = await Identity.findByUserId(userId);
      
      if (!verification) {
        return res.status(200).json({
          status: 'not_started',
          message: 'Verificação não iniciada'
        });
      }
      
      let message = '';
      switch (verification.status) {
        case 'verified':
          message = 'Identidade verificada com sucesso';
          break;
        case 'failed':
          message = 'Verificação falhou. Por favor, tente novamente.';
          break;
        case 'pending':
          message = 'Verificação em andamento. Aguarde.';
          break;
        default:
          message = 'Status desconhecido';
      }
      
      return res.status(200).json({
        status: verification.status,
        message,
        verifiedAt: verification.verifiedAt,
        updatedAt: verification.updatedAt
      });
    } catch (error) {
      logger.error(`Erro ao verificar status para o usuário ${req.userId}: ${error.message}`);
      return res.status(500).json({ error: 'Erro ao verificar status de identidade' });
    }
  }
  
  /**
   * Valida se os dados do documento correspondem aos dados do usuário
   * @param {Object} documentData - Dados extraídos do documento
   * @param {Object} userInfo - Dados do usuário
   * @returns {boolean} - Indica se os dados são consistentes
   */
  validateDocumentData(documentData, userInfo) {
    // Função para normalizar strings para comparação (remover acentos, espaços extras, etc.)
    const normalize = (str) => {
      if (!str) return '';
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    // Comparar nome
    const docName = normalize(documentData.fullName);
    const userName = normalize(userInfo.fullName);
    
    // Comparar CPF
    const docCPF = documentData.cpf ? documentData.cpf.replace(/\D/g, '') : '';
    const userCPF = userInfo.cpf ? userInfo.cpf.replace(/\D/g, '') : '';
    
    // Verificar data de nascimento
    let docBirthDate = null;
    let userBirthDate = null;
    
    try {
      if (documentData.birthDate) {
        docBirthDate = new Date(documentData.birthDate).toISOString().split('T')[0];
      }
      
      if (userInfo.birthDate) {
        userBirthDate = new Date(userInfo.birthDate).toISOString().split('T')[0];
      }
    } catch (e) {
      logger.error(`Erro ao processar datas: ${e.message}`);
    }
    
    // Calcular pontuação de correspondência
    let matchScore = 0;
    let possibleScore = 0;
    
    // Pontuação para o nome (vale mais pontos)
    if (docName && userName) {
      possibleScore += 3;
      
      // Verificar se o nome do documento contém o nome do usuário ou vice-versa
      if (docName.includes(userName) || userName.includes(docName)) {
        matchScore += 2;
      } else if (this.calculateSimilarity(docName, userName) > 0.8) {
        // Se os nomes são muito parecidos (porém não idênticos)
        matchScore += 1;
      }
    }
    
    // Pontuação para o CPF
    if (docCPF && userCPF) {
      possibleScore += 3;
      if (docCPF === userCPF) {
        matchScore += 3;
      }
    }
    
    // Pontuação para a data de nascimento
    if (docBirthDate && userBirthDate) {
      possibleScore += 2;
      if (docBirthDate === userBirthDate) {
        matchScore += 2;
      }
    }
    
    // Calcular porcentagem de correspondência
    const matchPercentage = possibleScore > 0 ? (matchScore / possibleScore) * 100 : 0;
    
    // Definir limiar de aceitação (80%)
    return matchPercentage >= 80;
  }
  
  /**
   * Calcula a similaridade entre duas strings (usando distância de Levenshtein)
   * @param {string} str1 - Primeira string
   * @param {string} str2 - Segunda string
   * @returns {number} - Similaridade (0-1)
   */
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Matriz para o algoritmo de Levenshtein
    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
    
    // Inicializar primeira coluna e linha
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    // Preencher a matriz
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // Deleção
          matrix[i][j - 1] + 1, // Inserção
          matrix[i - 1][j - 1] + cost // Substituição
        );
      }
    }
    
    // Calcular distância de Levenshtein
    const distance = matrix[len1][len2];
    
    // Converter para similaridade (0-1)
    return 1 - (distance / Math.max(len1, len2));
  }
}

module.exports = new VerificationController();