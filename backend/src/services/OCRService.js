// FanInsight AI - Serviço de OCR (Reconhecimento Óptico de Caracteres)
// Extrai texto de documentos para verificação de identidade

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Serviço para OCR e extração de texto de documentos
 */
class OCRService {
  /**
   * Inicializa o serviço de OCR
   */
  constructor() {
    // Em um sistema real, aqui inicializaríamos o modelo de OCR
    this.initialized = true;
    this.supportedFormats = ['image/jpeg', 'image/png', 'application/pdf'];
    this.modelConfig = {
      minConfidence: 0.7,
      documentTypes: ['RG', 'CNH', 'Passaporte'],
      languageOptions: ['por', 'eng']
    };
    
    logger.info('Serviço de OCR inicializado');
  }
  
  /**
   * Verifica se o serviço está inicializado
   * @returns {boolean} Status de inicialização
   */
  isInitialized() {
    return this.initialized;
  }
  
  /**
   * Extrai texto de uma imagem de documento
   * @param {string} imagePath - Caminho da imagem
   * @returns {Object} Dados extraídos do documento
   */
  async extractText(imagePath) {
    try {
      logger.info(`Extraindo texto de: ${path.basename(imagePath)}`);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(imagePath)) {
        throw new Error('Arquivo de documento não encontrado');
      }
      
      // Em um sistema real, faríamos:
      // 1. Pré-processar a imagem (alinhamento, ajuste de contraste, etc.)
      // 2. Identificar tipo de documento
      // 3. Aplicar OCR específico para o tipo de documento
      // 4. Extrair informações estruturadas usando regras específicas
      
      // Simular processamento
      await this.simulateProcessingDelay();
      
      // Identificar tipo de documento
      const documentType = await this.identifyDocumentType(imagePath);
      
      // Extrair dados específicos do documento
      let documentData;
      
      switch (documentType) {
        case 'RG':
          documentData = this.extractRGData();
          break;
        case 'CNH':
          documentData = this.extractCNHData();
          break;
        case 'Passaporte':
          documentData = this.extractPassportData();
          break;
        default:
          throw new Error('Tipo de documento não suportado');
      }
      
      // Adicionar informações gerais
      documentData.type = documentType;
      documentData.confidence = parseFloat((Math.random() * 0.2 + 0.8).toFixed(2)); // 0.8-1.0
      documentData.processingTime = Math.floor(Math.random() * 2000) + 1000; // 1000-3000ms
      
      logger.info(`Extração concluída: ${documentType} processado com confiança ${documentData.confidence}`);
      
      return documentData;
    } catch (error) {
      logger.error(`Erro na extração de texto: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Identifica o tipo de documento
   * @param {string} imagePath - Caminho da imagem
   * @returns {string} Tipo de documento
   */
  async identifyDocumentType(imagePath) {
    // Em um sistema real, analisaríamos a estrutura, características e texto para identificar
    // Aqui vamos simular uma identificação
    
    // Tipos possíveis
    const types = this.modelConfig.documentTypes;
    
    // Gerar para testes (distribuição não uniforme)
    const random = Math.random();
    
    if (random < 0.5) {
      return 'RG'; // 50% de chance
    } else if (random < 0.9) {
      return 'CNH'; // 40% de chance
    } else {
      return 'Passaporte'; // 10% de chance
    }
  }
  
  /**
   * Extrai dados específicos de um RG
   * @returns {Object} Dados extraídos do RG
   */
  extractRGData() {
    // Gerar dados simulados de um RG brasileiro
    return {
      fullName: this.generateRandomName(),
      cpf: this.generateRandomCPF(),
      rg: this.generateRandomRG(),
      birthDate: this.generateRandomBirthDate(),
      issueDate: this.generateRandomIssueDate(),
      issuingAuthority: this.generateRandomIssuingAuthority(),
      filiation: {
        mother: this.generateRandomName('female'),
        father: Math.random() < 0.8 ? this.generateRandomName('male') : '' // 20% sem pai no documento
      },
      naturalness: this.generateRandomCity(),
      documentNumber: this.generateRandomRG()
    };
  }
  
  /**
   * Extrai dados específicos de uma CNH
   * @returns {Object} Dados extraídos da CNH
   */
  extractCNHData() {
    // Gerar dados simulados de uma CNH brasileira
    return {
      fullName: this.generateRandomName(),
      cpf: this.generateRandomCPF(),
      rg: this.generateRandomRG(),
      birthDate: this.generateRandomBirthDate(),
      issueDate: this.generateRandomIssueDate(),
      expirationDate: this.generateRandomExpirationDate(),
      category: this.generateRandomDriverCategory(),
      driverLicense: this.generateRandomDriverLicense(),
      issuingAuthority: 'DETRAN',
      filiation: {
        mother: this.generateRandomName('female'),
        father: Math.random() < 0.8 ? this.generateRandomName('male') : '' // 20% sem pai no documento
      },
      naturalness: this.generateRandomCity(),
      documentNumber: this.generateRandomDriverLicense()
    };
  }
  
  /**
   * Extrai dados específicos de um Passaporte
   * @returns {Object} Dados extraídos do Passaporte
   */
  extractPassportData() {
    // Gerar dados simulados de um passaporte brasileiro
    return {
      fullName: this.generateRandomName(),
      cpf: this.generateRandomCPF(),
      passportNumber: this.generateRandomPassportNumber(),
      birthDate: this.generateRandomBirthDate(),
      issueDate: this.generateRandomIssueDate(),
      expirationDate: this.generateRandomExpirationDate(),
      issuingAuthority: 'Polícia Federal',
      birthplace: this.generateRandomCity(),
      nationality: 'Brasileira',
      sex: Math.random() < 0.5 ? 'M' : 'F',
      documentNumber: this.generateRandomPassportNumber()
    };
  }
  
  /**
   * Pré-processa uma imagem de documento para melhorar OCR
   * @param {string} imagePath - Caminho da imagem
   * @returns {string} - Caminho da imagem processada
   */
  async preprocessImage(imagePath) {
    // Em um sistema real, faríamos:
    // 1. Converter para escala de cinza
    // 2. Ajustar contraste
    // 3. Remover ruído
    // 4. Corrigir alinhamento
    // 5. Recortar área relevante
    
    // Como é um exemplo, apenas simulamos o processamento
    logger.info(`Pré-processando imagem: ${path.basename(imagePath)}`);
    
    await this.simulateProcessingDelay();
    
    return imagePath; // No exemplo, retornamos o mesmo caminho
  }
  
  /**
   * Gera um nome aleatório
   * @param {string} gender - Gênero (male, female, ou undefined)
   * @returns {string} Nome gerado
   */
  generateRandomName(gender) {
    const maleFirstNames = ['João', 'Pedro', 'Carlos', 'Antônio', 'José', 'Francisco', 'Paulo', 'Lucas', 'Marcos', 'Luis'];
    const femaleFirstNames = ['Maria', 'Ana', 'Julia', 'Fernanda', 'Mariana', 'Gabriela', 'Patricia', 'Camila', 'Juliana', 'Luciana'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima', 'Araújo', 'Fernandes'];
    
    // Selecionar primeiro nome com base no gênero
    let firstNamesList;
    if (gender === 'male') {
      firstNamesList = maleFirstNames;
    } else if (gender === 'female') {
      firstNamesList = femaleFirstNames;
    } else {
      // Se gênero não especificado, selecionar aleatoriamente
      firstNamesList = Math.random() < 0.5 ? maleFirstNames : femaleFirstNames;
    }
    
    // Selecionar primeiro nome
    const firstName = firstNamesList[Math.floor(Math.random() * firstNamesList.length)];
    
    // Selecionar 1-2 sobrenomes
    const numLastNames = Math.floor(Math.random() * 2) + 1;
    const selectedLastNames = [];
    
    for (let i = 0; i < numLastNames; i++) {
      let lastName;
      do {
        lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      } while (selectedLastNames.includes(lastName)); // Evitar duplicatas
      
      selectedLastNames.push(lastName);
    }
    
    // Combinar primeiro nome e sobrenomes
    return `${firstName} ${selectedLastNames.join(' ')}`;
  }
  
  /**
   * Gera um CPF aleatório válido
   * @returns {string} CPF formatado
   */
  generateRandomCPF() {
    // Gerar 9 dígitos aleatórios
    const digits = [];
    for (let i = 0; i < 9; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let remainder = sum % 11;
    const firstVerifier = remainder < 2 ? 0 : 11 - remainder;
    digits.push(firstVerifier);
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    remainder = sum % 11;
    const secondVerifier = remainder < 2 ? 0 : 11 - remainder;
    digits.push(secondVerifier);
    
    // Formatar CPF
    const cpf = `${digits.slice(0, 3).join('')}.${digits.slice(3, 6).join('')}.${digits.slice(6, 9).join('')}-${digits.slice(9).join('')}`;
    
    return cpf;
  }
  
  /**
   * Gera um número de RG aleatório
   * @returns {string} RG formatado
   */
  generateRandomRG() {
    // Gerar 8-9 dígitos aleatórios
    const numDigits = Math.random() < 0.5 ? 8 : 9;
    const digits = [];
    
    for (let i = 0; i < numDigits - 1; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    
    // Último dígito pode ser X (10) em alguns estados
    const lastDigit = Math.random() < 0.1 ? 'X' : Math.floor(Math.random() * 10).toString();
    
    // Formatar RG
    let rg;
    if (numDigits === 8) {
      rg = `${digits.slice(0, 2).join('')}.${digits.slice(2, 5).join('')}.${digits.slice(5).join('')}-${lastDigit}`;
    } else {
      rg = `${digits.slice(0, 2).join('')}.${digits.slice(2, 5).join('')}.${digits.slice(5, 8).join('')}-${lastDigit}`;
    }
    
    return rg;
  }
  
  /**
   * Gera uma data de nascimento aleatória
   * @returns {string} Data no formato DD/MM/AAAA
   */
  generateRandomBirthDate() {
    // Gerar data entre 18 e 70 anos atrás
    const now = new Date();
    const minYear = now.getFullYear() - 70;
    const maxYear = now.getFullYear() - 18;
    
    const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    const month = Math.floor(Math.random() * 12) + 1;
    
    // Determinar o número máximo de dias no mês
    let maxDay = 31;
    if ([4, 6, 9, 11].includes(month)) {
      maxDay = 30;
    } else if (month === 2) {
      // Verificar se é ano bissexto
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        maxDay = 29;
      } else {
        maxDay = 28;
      }
    }
    
    const day = Math.floor(Math.random() * maxDay) + 1;
    
    // Formatar data
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  }
  
  /**
   * Gera uma data de emissão aleatória
   * @returns {string} Data no formato DD/MM/AAAA
   */
  generateRandomIssueDate() {
    // Gerar data entre 1 mês e 10 anos atrás
    const now = new Date();
    const minDate = new Date(now);
    minDate.setFullYear(now.getFullYear() - 10);
    
    const maxDate = new Date(now);
    maxDate.setMonth(now.getMonth() - 1);
    
    const randomDate = new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));
    
    const day = randomDate.getDate();
    const month = randomDate.getMonth() + 1;
    const year = randomDate.getFullYear();
    
    // Formatar data
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  }
  
  /**
   * Gera uma data de validade aleatória
   * @returns {string} Data no formato DD/MM/AAAA
   */
  generateRandomExpirationDate() {
    // Gerar data entre 1 e 10 anos no futuro
    const now = new Date();
    const minDate = new Date(now);
    minDate.setFullYear(now.getFullYear() + 1);
    
    const maxDate = new Date(now);
    maxDate.setFullYear(now.getFullYear() + 10);
    
    const randomDate = new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));
    
    const day = randomDate.getDate();
    const month = randomDate.getMonth() + 1;
    const year = randomDate.getFullYear();
    
    // Formatar data
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  }
  
  /**
   * Gera uma categoria de CNH aleatória
   * @returns {string} Categoria(s) de CNH
   */
  generateRandomDriverCategory() {
    const categories = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'];
    const index = Math.floor(Math.random() * categories.length);
    return categories[index];
  }
  
  /**
   * Gera um número de CNH aleatório
   * @returns {string} Número de CNH
   */
  generateRandomDriverLicense() {
    // CNH brasileira tem 11 dígitos
    let number = '';
    for (let i = 0; i < 11; i++) {
      number += Math.floor(Math.random() * 10).toString();
    }
    return number;
  }
  
  /**
   * Gera um número de passaporte aleatório
   * @returns {string} Número de passaporte
   */
  generateRandomPassportNumber() {
    // Passaporte brasileiro: 2 letras seguidas por 6 dígitos
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let number = '';
    
    // 2 letras
    for (let i = 0; i < 2; i++) {
      number += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // 6 dígitos
    for (let i = 0; i < 6; i++) {
      number += Math.floor(Math.random() * 10).toString();
    }
    
    return number;
  }
  
  /**
   * Gera uma cidade brasileira aleatória
   * @returns {string} Nome da cidade
   */
  generateRandomCity() {
    const cities = [
      'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador',
      'Fortaleza', 'Recife', 'Porto Alegre', 'Curitiba', 'Manaus',
      'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís',
      'Maceió', 'Natal', 'Teresina', 'João Pessoa', 'Santos'
    ];
    
    return cities[Math.floor(Math.random() * cities.length)];
  }
  
  /**
   * Gera um órgão emissor aleatório
   * @returns {string} Nome do órgão emissor
   */
  generateRandomIssuingAuthority() {
    const authorities = [
      'SSP/SP', 'SSP/RJ', 'SSP/MG', 'SSP/BA', 'SSP/RS',
      'SSP/PR', 'SSP/SC', 'SSP/PE', 'SSP/CE', 'SSP/GO',
      'SSP/MA', 'SSP/PA', 'SSP/ES', 'SSP/DF', 'SSP/MT'
    ];
    
    return authorities[Math.floor(Math.random() * authorities.length)];
  }
  
  /**
   * Simula um atraso para processamento
   * @returns {Promise} Promessa resolvida após o atraso
   */
  simulateProcessingDelay() {
    const delay = Math.floor(Math.random() * 1000) + 500; // 500-1500ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

module.exports = new OCRService();