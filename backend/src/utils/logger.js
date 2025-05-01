// FanInsight AI - Utilitário de Logging
// Sistema de logging centralizado para toda a aplicação

/**
 * Classe para gerenciar logs da aplicação
 */
class Logger {
    /**
     * Inicializa o logger
     */
    constructor() {
      this.logLevel = process.env.LOG_LEVEL || 'info';
      this.logLevels = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
      };
      
      // Em um sistema real, aqui configuraria a saída de logs (arquivo, console, serviço externo, etc.)
      this.enableConsole = process.env.ENABLE_CONSOLE_LOG !== 'false';
      this.enableFile = process.env.ENABLE_FILE_LOG === 'true';
      this.fileLogPath = process.env.LOG_FILE_PATH || './logs/faninsight.log';
      
      // Formato de hora para os logs
      this.timeFormat = new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
    
    /**
     * Registra uma mensagem de log
     * @param {string} level - Nível do log
     * @param {string} message - Mensagem do log
     */
    log(level, message) {
      // Verificar se o nível de log é válido
      if (!(level in this.logLevels)) {
        level = 'info';
      }
      
      // Verificar se o nível de log está habilitado
      if (this.logLevels[level] > this.logLevels[this.logLevel]) {
        return;
      }
      
      // Construir a mensagem de log
      const timestamp = this.timeFormat.format(new Date());
      const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
      
      // Registrar no console
      if (this.enableConsole) {
        switch (level) {
          case 'error':
            console.error(formattedMessage);
            break;
          case 'warn':
            console.warn(formattedMessage);
            break;
          case 'info':
            console.info(formattedMessage);
            break;
          case 'debug':
            console.debug(formattedMessage);
            break;
          default:
            console.log(formattedMessage);
        }
      }
      
      // Em um sistema real, aqui registraríamos em arquivo ou serviço externo
      if (this.enableFile) {
        // Simulação simplificada, em um caso real usaríamos fs.appendFile
        this.appendToFile(formattedMessage);
      }
    }
    
    /**
     * Registra uma mensagem de erro
     * @param {string} message - Mensagem de erro
     */
    error(message) {
      this.log('error', message);
    }
    
    /**
     * Registra uma mensagem de aviso
     * @param {string} message - Mensagem de aviso
     */
    warn(message) {
      this.log('warn', message);
    }
    
    /**
     * Registra uma mensagem informativa
     * @param {string} message - Mensagem informativa
     */
    info(message) {
      this.log('info', message);
    }
    
    /**
     * Registra uma mensagem de depuração
     * @param {string} message - Mensagem de depuração
     */
    debug(message) {
      this.log('debug', message);
    }
    
    /**
     * Registra um objeto como JSON
     * @param {string} level - Nível do log
     * @param {Object} obj - Objeto a ser registrado
     */
    logObject(level, obj) {
      let message;
      
      try {
        message = JSON.stringify(obj);
      } catch (error) {
        message = `[Não serializável] ${Object.prototype.toString.call(obj)}`;
      }
      
      this.log(level, message);
    }
    
    /**
     * Configura o nível de log
     * @param {string} level - Nível de log
     * @returns {boolean} Sucesso da operação
     */
    setLogLevel(level) {
      if (level in this.logLevels) {
        this.logLevel = level;
        this.info(`Nível de log alterado para: ${level}`);
        return true;
      }
      
      this.warn(`Nível de log inválido: ${level}`);
      return false;
    }
    
    /**
     * Escreve uma mensagem em arquivo de log
     * @param {string} message - Mensagem a ser escrita
     * @private
     */
    appendToFile(message) {
      // Em um sistema real, aqui escreveríamos no arquivo
      // Como é um exemplo, apenas simulamos
      
      // Código que seria usado em um ambiente Node.js:
      /*
      const fs = require('fs');
      const path = require('path');
      
      try {
        // Criar diretório se não existir
        const dir = path.dirname(this.fileLogPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Adicionar quebra de linha e escrever no arquivo
        fs.appendFileSync(this.fileLogPath, message + '\n');
      } catch (error) {
        console.error(`Erro ao escrever no arquivo de log: ${error.message}`);
      }
      */
    }
  }
  
  module.exports = new Logger();