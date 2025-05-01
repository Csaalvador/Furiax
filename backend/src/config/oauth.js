// FanInsight AI - Configuração OAuth
// Configurações para autenticação OAuth com plataformas de redes sociais

/**
 * Configurações de OAuth para diferentes plataformas
 */
module.exports = {
    // Twitter (X)
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || 'YOUR_TWITTER_CLIENT_ID',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || 'YOUR_TWITTER_CLIENT_SECRET',
      redirectUri: process.env.TWITTER_REDIRECT_URI || 'http://localhost:3000/auth/callback/twitter',
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      revokeUrl: 'https://api.twitter.com/2/oauth2/revoke',
      scope: 'tweet.read users.read follows.read offline.access',
      userInfoUrl: 'https://api.twitter.com/2/users/me',
      apiVersion: '2'
    },
    
    // Instagram
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID || 'YOUR_INSTAGRAM_CLIENT_ID',
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || 'YOUR_INSTAGRAM_CLIENT_SECRET',
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/auth/callback/instagram',
      authUrl: 'https://api.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      scope: 'user_profile,user_media',
      userInfoUrl: 'https://graph.instagram.com/me',
      apiVersion: 'v18.0'
    },
    
    // YouTube
    youtube: {
      clientId: process.env.YOUTUBE_CLIENT_ID || 'YOUR_YOUTUBE_CLIENT_ID',
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET || 'YOUR_YOUTUBE_CLIENT_SECRET',
      redirectUri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/auth/callback/youtube',
      authUrl: 'https://accounts.google.com/o/oauth2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      revokeUrl: 'https://oauth2.googleapis.com/revoke',
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      userInfoUrl: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      apiVersion: 'v3'
    },
    
    // Função utilitária para construir URLs de autorização
    buildAuthUrl: function(platform, state, options = {}) {
      if (!this[platform]) {
        throw new Error(`Plataforma ${platform} não configurada`);
      }
      
      const config = this[platform];
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scope,
        state: state
      });
      
      // Adicionar parâmetros adicionais específicos da plataforma
      if (platform === 'twitter') {
        params.append('code_challenge', options.codeChallenge || '');
        params.append('code_challenge_method', 'S256');
      }
      
      if (platform === 'youtube') {
        params.append('access_type', 'offline');
        params.append('prompt', 'consent');
      }
      
      // Adicionar quaisquer opções personalizadas
      for (const [key, value] of Object.entries(options)) {
        if (!params.has(key)) {
          params.append(key, value);
        }
      }
      
      return `${config.authUrl}?${params.toString()}`;
    },
    
    // Função para gerar nonce aleatório para PKCE (Proof Key for Code Exchange)
    generateCodeVerifier: function() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      let result = '';
      const length = 128;
      
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      return result;
    },
    
    // Função para gerar code challenge de um code verifier (para PKCE)
    generateCodeChallenge: function(codeVerifier) {
      // Em um ambiente Node.js real, usaríamos crypto
      // Para este exemplo simplificado, simulamos
      return codeVerifier; // Em um caso real, isso seria o SHA-256 hash do codeVerifier em base64
    },
    
    // Função para validar um token
    validateToken: async function(platform, accessToken) {
      if (!this[platform]) {
        throw new Error(`Plataforma ${platform} não configurada`);
      }
      
      // Em uma implementação real, faríamos uma requisição à API da plataforma
      // Para validar o token. Como é um exemplo, retornamos true
      return true;
    },
    
    // Função para revogar um token
    revokeToken: async function(platform, token) {
      if (!this[platform]) {
        throw new Error(`Plataforma ${platform} não configurada`);
      }
      
      const config = this[platform];
      
      if (!config.revokeUrl) {
        throw new Error(`Plataforma ${platform} não suporta revogação de token`);
      }
      
      // Em uma implementação real, faríamos uma requisição à API de revogação
      // Como é um exemplo, simulamos sucesso
      return true;
    }
  };