w// auth.js - Client-side authentication handler

// OAuth Configuration for different platforms
const oauthConfig = {
    google: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID',
        redirectUri: 'http://localhost:3000/auth/google/callback',
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        scope: 'profile email',
        responseType: 'code'
    },
    twitter: {
        clientId: 'YOUR_TWITTER_CLIENT_ID',
        redirectUri: 'http://localhost:3000/auth/twitter/callback',
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        scope: 'tweet.read users.read follows.read',
        responseType: 'code'
    },
    instagram: {
        clientId: 'YOUR_INSTAGRAM_CLIENT_ID',
        redirectUri: 'http://localhost:3000/auth/instagram/callback',
        authUrl: 'https://api.instagram.com/oauth/authorize',
        scope: 'user_profile user_media',
        responseType: 'code'
    },
    twitch: {
        clientId: 'YOUR_TWITCH_CLIENT_ID',
        redirectUri: 'http://localhost:3000/auth/twitch/callback',
        authUrl: 'https://id.twitch.tv/oauth2/authorize',
        scope: 'user:read:email',
        responseType: 'code'
    },
    facebook: {
        clientId: 'YOUR_FACEBOOK_CLIENT_ID',
        redirectUri: 'http://localhost:3000/auth/facebook/callback',
        authUrl: 'https://www.facebook.com/v16.0/dialog/oauth',
        scope: 'public_profile,email',
        responseType: 'code'
    }
};

/**
 * Initiates the OAuth authentication flow for a specific platform
 * @param {string} platform - The social media platform to authenticate with
 */
function initiateOAuth(platform) {
    const config = oauthConfig[platform];
    if (!config) {
        showNotification('Erro', `Plataforma não suportada: ${platform}`, 'error');
        return;
    }

    // Generate a random state value for security
    const state = generateRandomString(16);
    // Store state in localStorage to verify when the user returns
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_platform', platform);
    
    // Build the authorization URL
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', config.redirectUri);
    authUrl.searchParams.append('response_type', config.responseType);
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('state', state);
    
    // Open the authentication window
    window.location.href = authUrl.toString();
}

/**
 * Handles the OAuth callback from the social platform
 * @returns {Promise<Object>} User profile data
 */
async function handleOAuthCallback() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    // Check for errors
    if (error) {
        throw new Error(`Authentication error: ${error}`);
    }
    
    // Verify state to prevent CSRF attacks
    const savedState = localStorage.getItem('oauth_state');
    const platform = localStorage.getItem('oauth_platform');
    
    if (!state || state !== savedState) {
        throw new Error('Invalid state parameter. Authentication attempt may have been compromised.');
    }
    
    // Clear state from localStorage
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_platform');
    
    if (!code) {
        throw new Error('No authorization code received');
    }
    
    // Exchange authorization code for tokens
    try {
        const response = await fetch(`/api/auth/${platform}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to exchange code for tokens');
        }
        
        const data = await response.json();
        
        // Fetch user profile with token
        const profileResponse = await fetch(`/api/auth/${platform}/profile`, {
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        });
        
        if (!profileResponse.ok) {
            const errorData = await profileResponse.json();
            throw new Error(errorData.message || 'Failed to fetch user profile');
        }
        
        const profileData = await profileResponse.json();
        
        // Store tokens in localStorage (or preferably in an HttpOnly cookie managed by your backend)
        localStorage.setItem(`${platform}_token`, data.access_token);
        if (data.refresh_token) {
            localStorage.setItem(`${platform}_refresh_token`, data.refresh_token);
        }
        
        // Store user profile data
        localStorage.setItem(`${platform}_profile`, JSON.stringify(profileData));
        
        return profileData;
    } catch (error) {
        console.error('Error during token exchange:', error);
        throw error;
    }
}

/**
 * Check if user is connected to a specific platform
 * @param {string} platform - Social media platform to check
 * @returns {boolean} True if connected
 */
function isConnectedTo(platform) {
    return localStorage.getItem(`${platform}_token`) !== null;
}

/**
 * Get user profile data for a platform
 * @param {string} platform - Social media platform
 * @returns {Object|null} User profile or null if not connected
 */
function getProfileData(platform) {
    const profileStr = localStorage.getItem(`${platform}_profile`);
    return profileStr ? JSON.parse(profileStr) : null;
}

/**
 * Generate a random string for OAuth state
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    
    return result;
}

/**
 * Disconnect a social media account
 * @param {string} platform - Platform to disconnect from
 */
function disconnectSocialMedia(platform) {
    // Remove tokens and profile from localStorage
    localStorage.removeItem(`${platform}_token`);
    localStorage.removeItem(`${platform}_refresh_token`);
    localStorage.removeItem(`${platform}_profile`);
    
    // Call API to revoke access if needed
    fetch(`/api/auth/${platform}/revoke`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }).catch(error => {
        console.error(`Error revoking ${platform} access:`, error);
    });
    
    // Update UI
    updateSocialAccountsList();
}

// Export functions for use in other scripts
window.auth = {
    initiateOAuth,
    handleOAuthCallback,
    isConnectedTo,
    getProfileData,
    disconnectSocialMedia
};