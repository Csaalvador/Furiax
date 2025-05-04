// server.js - Express server with OAuth routes

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Database connection
mongoose.connect('mongodb://localhost:27017/furiax', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// OAuth configuration
const oauthConfig = {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/auth/google/callback',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        profileUrl: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    twitter: {
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/auth/twitter/callback',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        profileUrl: 'https://api.twitter.com/2/users/me',
        profileParams: '?user.fields=name,username,profile_image_url,public_metrics,description'
    },
    instagram: {
        clientId: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/auth/instagram/callback',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        profileUrl: 'https://graph.instagram.com/me',
        profileParams: '?fields=id,username,account_type,media_count'
    },
    twitch: {
        clientId: process.env.TWITCH_CLIENT_ID,
        clientSecret: process.env.TWITCH_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/auth/twitch/callback',
        tokenUrl: 'https://id.twitch.tv/oauth2/token',
        profileUrl: 'https://api.twitch.tv/helix/users'
    },
    facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/auth/facebook/callback',
        tokenUrl: 'https://graph.facebook.com/v16.0/oauth/access_token',
        profileUrl: 'https://graph.facebook.com/me',
        profileParams: '?fields=id,name,email,picture'
    }
};

// Token exchange endpoint for each platform
app.post('/api/auth/:platform/token', async (req, res) => {
    const { platform } = req.params;
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ message: 'Authorization code is required' });
    }
    
    const config = oauthConfig[platform];
    if (!config) {
        return res.status(400).json({ message: 'Unsupported platform' });
    }
    
    try {
        let tokenResponse;
        
        // Different platforms have slightly different token request formats
        if (platform === 'instagram') {
            // Instagram uses application/x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('client_id', config.clientId);
            params.append('client_secret', config.clientSecret);
            params.append('grant_type', 'authorization_code');
            params.append('redirect_uri', config.redirectUri);
            params.append('code', code);
            
            tokenResponse = await axios.post(config.tokenUrl, params);
        } else {
            // Other platforms use JSON
            tokenResponse = await axios.post(config.tokenUrl, {
                client_id: config.clientId,
                client_secret: config.clientSecret,
                grant_type: 'authorization_code',
                redirect_uri: config.redirectUri,
                code
            });
        }
        
        const tokenData = tokenResponse.data;
        
        // Store token in session
        req.session.tokens = req.session.tokens || {};
        req.session.tokens[platform] = tokenData;
        
        return res.status(200).json(tokenData);
    } catch (error) {
        console.error(`Error exchanging ${platform} token:`, error.response?.data || error.message);
        return res.status(500).json({ 
            message: 'Failed to exchange authorization code for tokens',
            error: error.response?.data || error.message
        });
    }
});

// Profile fetching endpoint for each platform
app.get('/api/auth/:platform/profile', async (req, res) => {
    const { platform } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header is required' });
    }
    
    const token = authHeader.split(' ')[1];
    const config = oauthConfig[platform];
    
    if (!config) {
        return res.status(400).json({ message: 'Unsupported platform' });
    }
    
    try {
        let profileResponse;
        const requestUrl = `${config.profileUrl}${config.profileParams || ''}`;
        
        if (platform === 'twitch') {
            // Twitch requires client-id header
            profileResponse = await axios.get(requestUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Client-ID': config.clientId
                }
            });
        } else {
            profileResponse = await axios.get(requestUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
        
        let userData = profileResponse.data;
        
        // Different platforms return data in different formats
        if (platform === 'twitch') {
            userData = userData.data[0];
        } else if (platform === 'twitter') {
            userData = userData.data;
        }
        
        // Store user data in database
        await updateUserSocialProfile(req.session.userId, platform, userData);
        
        return res.status(200).json(userData);
    } catch (error) {
        console.error(`Error fetching ${platform} profile:`, error.response?.data || error.message);
        return res.status(500).json({ 
            message: 'Failed to fetch user profile',
            error: error.response?.data || error.message
        });
    }
});

// Revoke token endpoint
app.post('/api/auth/:platform/revoke', async (req, res) => {
    const { platform } = req.params;
    const userId = req.session.userId;
    
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    
    try {
        // Remove social profile from user document
        await User.updateOne(
            { _id: userId },
            { $unset: { [`socialProfiles.${platform}`]: 1 } }
        );
        
        // Remove token from session
        if (req.session.tokens && req.session.tokens[platform]) {
            delete req.session.tokens[platform];
        }
        
        return res.status(200).json({ message: 'Successfully disconnected' });
    } catch (error) {
        console.error(`Error revoking ${platform} access:`, error);
        return res.status(500).json({ message: 'Failed to revoke access' });
    }
});

// Helper function to update user's social profile in database
async function updateUserSocialProfile(userId, platform, profileData) {
    if (!userId) return;
    
    try {
        // Format profile data based on platform
        let formattedData = {
            platform,
            verified: true,
            verificationDate: new Date()
        };
        
        switch (platform) {
            case 'google':
                formattedData = {
                    ...formattedData,
                    id: profileData.sub,
                    name: profileData.name,
                    email: profileData.email,
                    picture: profileData.picture,
                    locale: profileData.locale
                };
                break;
                
            case 'twitter':
                formattedData = {
                    ...formattedData,
                    id: profileData.id,
                    name: profileData.name,
                    username: profileData.username,
                    profileImage: profileData.profile_image_url,
                    description: profileData.description,
                    followersCount: profileData.public_metrics?.followers_count,
                    followingCount: profileData.public_metrics?.following_count
                };
                break;
                
            case 'instagram':
                formattedData = {
                    ...formattedData,
                    id: profileData.id,
                    username: profileData.username,
                    accountType: profileData.account_type,
                    mediaCount: profileData.media_count
                };
                break;
                
            case 'twitch':
                formattedData = {
                    ...formattedData,
                    id: profileData.id,
                    login: profileData.login,
                    displayName: profileData.display_name,
                    profileImage: profileData.profile_image_url,
                    type: profileData.type,
                    broadcasterType: profileData.broadcaster_type,
                    description: profileData.description,
                    viewCount: profileData.view_count
                };
                break;
                
            case 'facebook':
                formattedData = {
                    ...formattedData,
                    id: profileData.id,
                    name: profileData.name,
                    email: profileData.email,
                    picture: profileData.picture?.data?.url
                };
                break;
                
            default:
                formattedData = {
                    ...formattedData,
                    rawData: profileData
                };
        }
        
        // Update user document with social profile data
        await User.updateOne(
            { _id: userId },
            { 
                $set: { [`socialProfiles.${platform}`]: formattedData },
                $inc: { engagementScore: 15 } // Increase engagement score for connecting a social account
            },
            { upsert: true }
        );
    } catch (error) {
        console.error(`Error updating ${platform} profile:`, error);
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;