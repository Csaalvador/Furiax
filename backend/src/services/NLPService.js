// FanInsight AI - Serviço de Processamento de Linguagem Natural (NLP)
// Realiza análise semântica, extração de entidades e análise de sentimento

const logger = require('../utils/logger');

/**
 * Serviço para processamento de linguagem natural
 */
class NLPService {
  /**
   * Inicializa o serviço NLP
   * Carregar modelos e configurações
   */
  constructor() {
    // Em um sistema real, aqui carregaríamos modelos de NLP pré-treinados
    this.initialized = true;
    this.supportedLanguages = ['pt', 'en', 'es'];
    
    // Lista de entidades relacionadas à FURIA para detecção
    this.furiaEntities = {
      players: [
        'arT', 'art', 'Andrei Piovezan', 'Andrei', 'Piovezan',
        'KSCERATO', 'kscerato', 'Kaike Cerato', 'Kaike', 'Cerato',
        'yuurih', 'Yuri Santos', 'Yuri', 'Santos',
        'drop', 'DROP', 'André Abreu', 'André', 'Abreu',
        'saffee', 'SAFFEE', 'Rafael Costa', 'Rafael', 'Costa',
        'chelo', 'CHELO', 'Marcelo Cespedes', 'Marcelo', 'Cespedes',
        'honda', 'HONDA', 'Lucas Honda', 'Lucas', 'Cano',
        'guerri', 'GUERRI', 'Nicholas Nogueira', 'Nicholas', 'Nogueira'
      ],
      teams: [
        'FURIA', 'Furia', 'furia', 'FURIA Esports', 'FURIA Academy', 'FURIA Feminina'
      ],
      games: [
        'CS:GO', 'CS2', 'CSGO', 'CS', 'Counter-Strike', 'Counter Strike',
        'Valorant', 'VAL',
        'League of Legends', 'LoL', 'LOL',
        'Apex Legends', 'Apex',
        'Rainbow Six', 'R6', 'Rainbow 6', 'Siege',
        'FIFA', 'EA FC', 'FC 24'
      ],
      tournaments: [
        'Major', 'ESL', 'BLAST', 'IEM', 'PGL', 'Pro League',
        'RMR', 'Challengers', 'Champions', 'Masters'
      ],
      general: [
        'MVP', 'ace', 'clutch', 'headshot', 'flick', 'flank',
        'jogada', 'play', 'stream', 'livestream', 'campeonato',
        'torneio', 'vitória', 'derrota', 'classificação',
        'eliminação', 'semifinal', 'final', 'campeão', 'vice'
      ]
    };
  }
  
  /**
   * Verifica se o serviço está inicializado
   * @returns {boolean} - Status de inicialização
   */
  isInitialized() {
    return this.initialized;
  }
  
  /**
   * Analisa conteúdo social para detecção de entidades e sentimento
   * @param {Array} posts - Lista de posts/conteúdos para análise
   * @returns {Object} - Resultado da análise
   */
  async analyzeSocialContent(posts) {
    try {
      // Verificar se há conteúdo para analisar
      if (!posts || posts.length === 0) {
        return {
          entities: {},
          sentiment: {
            score: 0,
            label: 'neutro',
            confidence: 0.5
          }
        };
      }
      
      logger.info(`Analisando ${posts.length} posts`);
      
      // Combinar todo o texto para análise
      const combinedText = posts.map(post => post.content).join(' ');
      
      // Extrair entidades mencionadas
      const entities = this.extractEntities(combinedText);
      
      // Analisar sentimento
      const sentiment = this.analyzeSentiment(combinedText);
      
      return {
        entities,
        sentiment
      };
    } catch (error) {
      logger.error(`Erro na análise de conteúdo social: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Extrai entidades de um texto
   * @param {string} text - Texto para análise
   * @returns {Object} - Entidades extraídas agrupadas por categoria
   */
  extractEntities(text) {
    // Normalizar o texto (remover acentos, converter para minúsculas)
    const normalizedText = this.normalizeText(text);
    
    // Resultado das entidades
    const result = {
      players: [],
      teams: [],
      games: [],
      tournaments: [],
      general: []
    };
    
    // Buscar cada categoria de entidade no texto
    for (const [category, entityList] of Object.entries(this.furiaEntities)) {
      const found = new Set();
      
      entityList.forEach(entity => {
        // Normalizar a entidade para comparação
        const normalizedEntity = this.normalizeText(entity);
        
        // Verificar se a entidade está presente no texto
        if (normalizedText.includes(normalizedEntity)) {
          // Usar a versão original (não normalizada) para adicionar ao resultado
          found.add(entity);
        }
      });
      
      // Adicionar entidades encontradas
      if (category in result) {
        result[category] = [...found];
      }
    }
    
    // Contar o total de entidades encontradas
    const totalEntities = Object.values(result).reduce((sum, arr) => sum + arr.length, 0);
    
    logger.info(`Extraídas ${totalEntities} entidades do texto`);
    
    return result;
  }
  
  /**
   * Analisa o sentimento de um texto
   * @param {string} text - Texto para análise
   * @returns {Object} - Resultado da análise de sentimento
   */
  analyzeSentiment(text) {
    try {
      // Em um sistema real, usaríamos um modelo de ML para análise de sentimento
      // Aqui vamos simular uma análise baseada em palavras-chave
      
      const positiveWords = [
        'bom', 'incrível', 'ótimo', 'excelente', 'melhor', 'vitória', 'venceu',
        'ganhou', 'top', 'espetacular', 'campeão', 'amei', 'adorei', 'parabéns',
        'demais', 'orgulho', 'gg', 'lendário', 'sensacional', 'perfeito'
      ];
      
      const negativeWords = [
        'ruim', 'péssimo', 'terrível', 'pior', 'derrota', 'perdeu', 'fraco',
        'erro', 'falha', 'decepção', 'triste', 'chateado', 'lamentável',
        'desastre', 'horrível', 'vergonha', 'decepcionante', 'desapontado'
      ];
      
      // Normalizar o texto
      const normalizedText = this.normalizeText(text);
      // Dividir em palavras
      const words = normalizedText.split(/\s+/);
      
      // Contar palavras positivas e negativas
      let positiveCount = 0;
      let negativeCount = 0;
      
      words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
      });
      
      // Calcular score (-1 a 1)
      let score = 0;
      const totalSentimentWords = positiveCount + negativeCount;
      
      if (totalSentimentWords > 0) {
        score = (positiveCount - negativeCount) / totalSentimentWords;
      }
      
      // Determinar rótulo e confiança
      let label, confidence;
      
      if (score > 0.2) {
        label = 'positivo';
        confidence = 0.5 + Math.min(score, 0.5); // 0.5 a 1.0
      } else if (score < -0.2) {
        label = 'negativo';
        confidence = 0.5 + Math.min(Math.abs(score), 0.5); // 0.5 a 1.0
      } else {
        label = 'neutro';
        confidence = 0.7; // Valor fixo para neutro
      }
      
      return {
        score: parseFloat(score.toFixed(2)),
        label,
        confidence: parseFloat(confidence.toFixed(2))
      };
    } catch (error) {
      logger.error(`Erro na análise de sentimento: ${error.message}`);
      
      // Retornar valor neutro em caso de erro
      return {
        score: 0,
        label: 'neutro',
        confidence: 0.5
      };
    }
  }
  
  /**
   * Analisa o texto de um perfil externo para determinar relevância
   * @param {string} text - Texto do perfil
   * @param {string} platform - Plataforma do perfil
   * @returns {Object} - Resultado da análise
   */
  analyzeProfileText(text, platform) {
    try {
      // Extrair entidades
      const entities = this.extractEntities(text);
      
      // Calcular pontuação de relevância
      let relevanceScore = 0;
      
      // Cada entidade FURIA tem um peso diferente
      const weights = {
        players: 2.5,
        teams: 3,
        games: 1.5,
        tournaments: 2,
        general: 1
      };
      
      // Somar pontuação ponderada
      for (const [category, items] of Object.entries(entities)) {
        relevanceScore += (items.length * (weights[category] || 1));
      }
      
      // Normalizar para escala 0-100
      relevanceScore = Math.min(Math.round(relevanceScore * 3), 100);
      
      // Definir nível com base na pontuação
      let level;
      if (relevanceScore >= 80) level = 'Muito Alto';
      else if (relevanceScore >= 60) level = 'Alto';
      else if (relevanceScore >= 40) level = 'Médio';
      else if (relevanceScore >= 20) level = 'Baixo';
      else level = 'Muito Baixo';
      
      return {
        score: relevanceScore,
        level,
        entities: {
          count: Object.values(entities).flat().length,
          types: Object.keys(entities).filter(key => entities[key].length > 0)
        }
      };
    } catch (error) {
      logger.error(`Erro na análise de texto do perfil: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Normaliza o texto para análise
   * @param {string} text - Texto para normalização
   * @returns {string} - Texto normalizado
   */
  normalizeText(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ')        // Remove pontuação
      .replace(/\s+/g, ' ')            // Normaliza espaços
      .trim();
  }
  
  /**
   * Detecta o idioma do texto
   * @param {string} text - Texto para detecção
   * @returns {string} - Código do idioma detectado
   */
  detectLanguage(text) {
    // Em um sistema real, usaríamos uma biblioteca de detecção de idioma
    // Aqui vamos simular uma detecção simplificada
    
    // Palavras específicas por idioma para detecção
    const ptWords = ['e', 'o', 'a', 'de', 'que', 'para', 'com', 'não', 'uma', 'os', 'no', 'se'];
    const enWords = ['the', 'and', 'of', 'to', 'in', 'a', 'is', 'that', 'for', 'it', 'with', 'as'];
    const esWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por'];
    
    // Normalizar e dividir o texto
    const words = this.normalizeText(text).split(/\s+/);
    
    // Contar ocorrências de palavras por idioma
    const counts = {
      pt: 0,
      en: 0,
      es: 0
    };
    
    words.forEach(word => {
      if (ptWords.includes(word)) counts.pt++;
      if (enWords.includes(word)) counts.en++;
      if (esWords.includes(word)) counts.es++;
    });
    
    // Determinar o idioma com mais ocorrências
    let maxCount = 0;
    let detectedLanguage = 'pt'; // Padrão português
    
    for (const [lang, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        detectedLanguage = lang;
      }
    }
    
    return detectedLanguage;
  }
  
  /**
   * Calcula a similaridade entre dois textos (usando distância de Levenshtein)
   * @param {string} str1 - Primeiro texto
   * @param {string} str2 - Segundo texto
   * @returns {number} - Valor de similaridade (0-1)
   */
  calculateTextSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    // Normalizar os textos
    const normalizedStr1 = this.normalizeText(str1);
    const normalizedStr2 = this.normalizeText(str2);
    
    // Matriz para o algoritmo de Levenshtein
    const len1 = normalizedStr1.length;
    const len2 = normalizedStr2.length;
    
    // Matriz para o algoritmo
    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
    
    // Inicializar primeira coluna e linha
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    // Preencher a matriz
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = normalizedStr1[i - 1] === normalizedStr2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,       // Deleção
          matrix[i][j - 1] + 1,       // Inserção
          matrix[i - 1][j - 1] + cost // Substituição
        );
      }
    }
    
    // Calcular distância
    const distance = matrix[len1][len2];
    
    // Converter para similaridade (0-1)
    return 1 - (distance / Math.max(len1, len2));
  }
}

module.exports = new NLPService();