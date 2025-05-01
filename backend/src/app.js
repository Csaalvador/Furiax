// FanInsight AI - Aplicação Principal
// Inicializa e configura o servidor backend

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('./utils/logger');
const db = require('./config/database');

// Controladores
const UserController = require('./controllers/UserController');
const AuthController = require('./controllers/AuthController');
const VerificationController = require('./controllers/VerificationController');
const SocialController = require('./controllers/SocialController');
const ProfileController = require('./controllers/ProfileController');

// Middleware de autenticação
const authMiddleware = require('./middleware/auth');

// Inicializar aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configurações de middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Pasta para arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para logging de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Importar rotas
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const verificationRoutes = require('./routes/verification');
const socialRoutes = require('./routes/social');
const profileRoutes = require('./routes/profile');

// Configurar rotas
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/profile', profileRoutes);

// Rota para verificar estado da API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Rota catch-all para servir o frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  logger.error(`Erro: ${err.message}`);
  
  // Verificar se o erro já possui um status HTTP
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Verificar conexão com banco de dados
    logger.info('Verificando conexão com banco de dados...');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Servidor FanInsight AI rodando na porta ${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error(`Erro ao iniciar servidor: ${error.message}`);
    process.exit(1);
  }
}

// Tratamento de sinais para encerramento gracioso
process.on('SIGTERM', async () => {
  logger.info('Recebido sinal SIGTERM');
  await shutdownServer();
});

process.on('SIGINT', async () => {
  logger.info('Recebido sinal SIGINT');
  await shutdownServer();
});

// Função para encerramento gracioso
async function shutdownServer() {
  logger.info('Iniciando encerramento gracioso...');
  
  try {
    // Fechar conexão com banco de dados
    await db.close();
    logger.info('Conexão com banco de dados fechada');
    
    // Outros recursos a serem liberados...
    
    logger.info('Encerramento concluído');
    process.exit(0);
  } catch (error) {
    logger.error(`Erro durante encerramento: ${error.message}`);
    process.exit(1);
  }
}

// Iniciar aplicação
if (require.main === module) {
  startServer();
}

module.exports = app;