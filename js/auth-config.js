// Add these to the bottom of your HTML file, before the closing </body> tag
// oauth-config.js - Configuration for OAuth providers
const oauthConfig = {
    google: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID',
        redirectUri: `${window.location.origin}/auth/google/callback`,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        scope: 'profile email',
        responseType: 'code'
    },
    instagram: {
        clientId: 'YOUR_INSTAGRAM_CLIENT_ID',
        redirectUri: `${window.location.origin}/auth/instagram/callback`,
        authUrl: 'https://api.instagram.com/oauth/authorize',
        scope: 'user_profile',
        responseType: 'code'
    },
    twitter: {
        clientId: 'YOUR_TWITTER_CLIENT_ID',
        redirectUri: `${window.location.origin}/auth/twitter/callback`,
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        scope: 'tweet.read users.read',
        responseType: 'code'
    },
    twitch: {
        clientId: 'YOUR_TWITCH_CLIENT_ID',
        redirectUri: `${window.location.origin}/auth/twitch/callback`,
        authUrl: 'https://id.twitch.tv/oauth2/authorize',
        scope: 'user:read:email',
        responseType: 'code'
    },
    facebook: {
        clientId: 'YOUR_FACEBOOK_CLIENT_ID',
        redirectUri: `${window.location.origin}/auth/facebook/callback`,
        authUrl: 'https://www.facebook.com/v17.0/dialog/oauth',
        scope: 'email,public_profile',
        responseType: 'code'
    }
};

// Function to initialize OAuth flow
function initializeOAuth(provider) {
    const config = oauthConfig[provider.toLowerCase()];
    if (!config) {
        showNotification('Erro', `Provedor ${provider} não configurado.`, 'error');
        return;
    }

    // Build OAuth URL
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', config.redirectUri);
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('response_type', config.responseType);
    authUrl.searchParams.append('state', generateState(provider));

    // Open OAuth popup
    const popup = window.open(authUrl.toString(), `${provider}Auth`, 'width=600,height=700');
    
    // Set up message listener for the OAuth callback
    window.addEventListener('message', function(event) {
        // Verify origin for security
        if (event.origin !== window.location.origin) return;
        
        // Handle incoming OAuth data
        if (event.data.type === 'oauth_callback' && event.data.provider === provider) {
            handleOAuthCallback(event.data);
            if (popup) popup.close();
        }
    });
}

// Generate a random state string to prevent CSRF
function generateState(provider) {
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
    // Store the state in localStorage to verify later
    localStorage.setItem('oauth_state_' + provider.toLowerCase(), state);
    return state;
}

// Handle OAuth callback
function handleOAuthCallback(data) {
    if (data.error) {
        showNotification('Erro de Autenticação', data.error, 'error');
        return;
    }

    // Verify state to prevent CSRF
    const storedState = localStorage.getItem('oauth_state_' + data.provider.toLowerCase());
    if (!storedState || storedState !== data.state) {
        showNotification('Erro de Segurança', 'Falha na verificação de estado.', 'error');
        return;
    }

    // Clean up state
    localStorage.removeItem('oauth_state_' + data.provider.toLowerCase());

    // Exchange code for token (this should ideally be done server-side)
    exchangeCodeForToken(data.provider, data.code);
}

// Exchange authorization code for token
function exchangeCodeForToken(provider, code) {
    // In a real implementation, this should be a server call
    // Client-side token exchange is not secure for production
    const config = oauthConfig[provider.toLowerCase()];
    
    // Show loading state
    showNotification('Conectando...', `Finalizando conexão com ${provider}...`, 'info');
    
    // Simulate API call - in production replace with actual API call
    setTimeout(() => {
        // Simulate successful authentication
        const socialAccount = {
            platform: provider,
            username: provider === 'Google' ? 'user@example.com' : `user_${Math.floor(Math.random() * 10000)}`,
            verified: true,
            verificationDate: new Date(),
            followersCount: Math.floor(Math.random() * 500) + 50,
            interests: ['esports', 'gaming', 'counterstrike', 'valorant']
        };

        // Add account to user profile
        if (!userProfile.socialAccounts.some(acc => acc.platform === provider)) {
            userProfile.socialAccounts.push(socialAccount);
            updateSocialAccountsList();
            updateFanLevel();
            showNotification('Conectado', `Sua conta ${provider} foi conectada com sucesso!`, 'success');
        } else {
            showNotification('Já Conectado', `Você já tem uma conta ${provider} conectada.`, 'info');
        }

        // If the social media modal is open, close it
        closeModal('socialMediaModal');
    }, 1500);
}

// Update the openSocialModal function
function openSocialModal(platform) {
    // Use the OAuth flow directly
    initializeOAuth(platform);
}

// Add this callback handling script
// In a separate file called oauth-callback.js that would be loaded on your callback pages
function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    const provider = window.location.pathname.split('/')[2]; // Extract from /auth/[provider]/callback
    
    // Send message to opener window
    if (window.opener) {
        window.opener.postMessage({
            type: 'oauth_callback',
            provider: provider,
            code: code,
            error: error,
            state: state
        }, window.location.origin);
    }
    
    // Show completion message
    document.body.innerHTML = '<h1>Autenticação concluída!</h1><p>Você pode fechar esta janela agora.</p>';
}

// Function to create the callback pages
// You'll need to create these pages on your server
// For local testing, you can create a simple HTML file for each provider:
// /auth/google/callback.html, /auth/twitter/callback.html, etc.
// Each should load oauth-callback.js and call handleCallback() on load