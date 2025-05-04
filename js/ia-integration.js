// ai-integration.js
// Middleware for AI integration in Know Your Fan platform

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configure environment
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'your-anthropic-api-key';

// Document analysis service
const documentVerificationService = {
    /**
     * Analyze document image to extract information and verify authenticity
     * @param {string} filePath - Path to uploaded document file
     * @param {string} documentType - Type of document (rg, cnh, passport)
     * @returns {Promise<Object>} - Document analysis results
     */
    async analyzeDocument(filePath, documentType) {
        try {
            console.log(`Analyzing ${documentType} document at ${filePath}`);
            
            // Read file and encode as base64
            const fileBuffer = fs.readFileSync(filePath);
            const base64Image = fileBuffer.toString('base64');
            const mimeType = this._getMimeType(filePath);
            
            // Use OpenAI Vision model to analyze document
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: "gpt-4-vision-preview",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: `You are a document verification assistant. Please analyze this ${documentType} document image. Check if it appears to be a legitimate document, extract any key information (like name, ID number, date of birth or issue date), and determine if it's valid. Format your response as follows:
                                    
                                    VALID: [yes/no/uncertain]
                                    CONFIDENCE: [high/medium/low]
                                    NAME: [extracted name]
                                    ID: [extracted ID number]
                                    DATE: [extracted date]
                                    ANALYSIS: [brief explanation]

                                    Keep your analysis concise.`
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${mimeType};base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 500
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Process and structure the response
            const analysisText = response.data.choices[0].message.content;
            const structuredAnalysis = this._parseAnalysisResponse(analysisText);
            
            return {
                success: true,
                documentType,
                analysisTime: new Date().toISOString(),
                rawAnalysis: analysisText,
                analysis: structuredAnalysis
            };
            
        } catch (error) {
            console.error('Document analysis error:', error);
            return {
                success: false,
                error: error.message || 'Unknown error during document analysis'
            };
        }
    },
    
    /**
     * Parse the AI model's text response into structured data
     * @param {string} analysisText - Raw text response from AI
     * @returns {Object} - Structured analysis data
     */
    _parseAnalysisResponse(analysisText) {
        // Extract key information using regex
        const validMatch = analysisText.match(/VALID:\s*(yes|no|uncertain)/i);
        const confidenceMatch = analysisText.match(/CONFIDENCE:\s*(high|medium|low)/i);
        const nameMatch = analysisText.match(/NAME:\s*(.+?)(?=\n|$)/i);
        const idMatch = analysisText.match(/ID:\s*(.+?)(?=\n|$)/i);
        const dateMatch = analysisText.match(/DATE:\s*(.+?)(?=\n|$)/i);
        const analysisMatch = analysisText.match(/ANALYSIS:\s*(.+?)(?=\n|$)/i);
        
        // Determine verification status
        let verificationStatus;
        if (validMatch && validMatch[1].toLowerCase() === 'yes') {
            verificationStatus = 'verified';
        } else if (validMatch && validMatch[1].toLowerCase() === 'no') {
            verificationStatus = 'rejected';
        } else {
            verificationStatus = 'needs_review';
        }
        
        return {
            verificationStatus,
            confidence: confidenceMatch ? confidenceMatch[1].toLowerCase() : 'unknown',
            extractedInfo: {
                name: nameMatch ? nameMatch[1].trim() : null,
                id: idMatch ? idMatch[1].trim() : null,
                date: dateMatch ? dateMatch[1].trim() : null
            },
            analysis: analysisMatch ? analysisMatch[1].trim() : 'No detailed analysis provided',
            needsManualReview: verificationStatus === 'needs_review'
        };
    },
    
    /**
     * Get MIME type from file path
     * @param {string} filePath - Path to file
     * @returns {string} - MIME type
     */
    _getMimeType(filePath) {
        const extension = path.extname(filePath).toLowerCase();
        
        switch (extension) {
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.png':
                return 'image/png';
            case '.pdf':
                return 'application/pdf';
            default:
                return 'application/octet-stream';
        }
    }
};

// Social media analysis service
const socialMediaAnalysisService = {
    /**
     * Analyze social media profile to extract gaming and esports interests
     * @param {Object} profileData - Social media profile data
     * @param {string} platform - Social media platform
     * @returns {Promise<Object>} - Analysis results
     */
    async analyzeSocialProfile(profileData, platform) {
        try {
            // Format profile data for AI analysis
            const prompt = this._generateSocialAnalysisPrompt(profileData, platform);
            
            // Use Claude model for analysis
            const response = await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                    model: "claude-3-opus-20240229",
                    max_tokens: 1000,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    system: "You are an AI assistant specializing in gaming and esports analysis. Your task is to analyze social media profiles to detect gaming preferences, esports interests, and fan engagement patterns."
                },
                {
                    headers: {
                        'x-api-key': ANTHROPIC_API_KEY,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Extract and structure the response
            const analysisText = response.data.content[0].text;
            const structuredAnalysis = this._parseClaudeResponse(analysisText);
            
            return {
                success: true,
                platform,
                analysisTime: new Date().toISOString(),
                rawAnalysis: analysisText,
                analysis: structuredAnalysis
            };
            
        } catch (error) {
            console.error('Social media analysis error:', error);
            return {
                success: false,
                error: error.message || 'Unknown error during social media analysis'
            };
        }
    },
    
    /**
     * Generate prompt for AI to analyze social media profile
     * @param {Object} profileData - Social media profile data
     * @param {string} platform - Social media platform
     * @returns {string} - Formatted prompt
     */
    _generateSocialAnalysisPrompt(profileData, platform) {
        return `
            Please analyze this user's ${platform} profile data and identify their esports interests:
            
            Username: ${profileData.username}
            Followed Pages/Accounts: ${profileData.followedPages.join(', ')}
            Interests: ${profileData.interests.join(', ')}
            Sample Posts: 
            ${profileData.posts.map(post => `- "${post.content}" (posted: ${post.timestamp})`).join('\n')}
            
            Please provide your analysis in the following structured format:
            
            INTEREST_LEVEL: [high/medium/low]
            GAMES: [list of game IDs they likely follow, e.g., "cs,valorant,lol"]
            FAN_LEVEL: [casual/regular/dedicated/superfan]
            CONTENT_PREFERENCES: [list of content types they'd likely engage with]
            PRODUCT_RECOMMENDATIONS: [list of product categories they might be interested in]
            ANALYSIS: [brief explanation of your findings]
            
            Focus specifically on detecting:
            1. Their interest in FURIA esports
            2. Which games they follow (CS2, Valorant, LoL, R6, Apex, etc.)
            3. What type of content they would engage with most
            4. Their level of engagement as an esports fan
            5. What products they might be interested in
        `;
    },
    
    /**
     * Parse Claude's response to structured data
     * @param {string} responseText - Raw text response from Claude
     * @returns {Object} - Structured analysis data
     */
    _parseClaudeResponse(responseText) {
        // Extract key information using regex
        const interestLevelMatch = responseText.match(/INTEREST_LEVEL:\s*(high|medium|low)/i);
        const gamesMatch = responseText.match(/GAMES:\s*(.+?)(?=\n|$)/i);
        const fanLevelMatch = responseText.match(/FAN_LEVEL:\s*(casual|regular|dedicated|superfan)/i);
        const contentPrefMatch = responseText.match(/CONTENT_PREFERENCES:\s*(.+?)(?=\n|$)/i);
        const productRecMatch = responseText.match(/PRODUCT_RECOMMENDATIONS:\s*(.+?)(?=\n|$)/i);
        const analysisMatch = responseText.match(/ANALYSIS:\s*(.+?)(?=\n|$)/is);
        
        // Process games list
        let games = [];
        if (gamesMatch && gamesMatch[1]) {
            games = gamesMatch[1].split(/,\s*/).map(game => game.trim().toLowerCase());
        }
        
        // Process content preferences
        let contentPreferences = [];
        if (contentPrefMatch && contentPrefMatch[1]) {
            contentPreferences = contentPrefMatch[1].split(/,\s*/).map(pref => pref.trim().toLowerCase());
        }
        
        // Process product recommendations
        let productRecommendations = [];
        if (productRecMatch && productRecMatch[1]) {
            productRecommendations = productRecMatch[1].split(/,\s*/).map(prod => prod.trim().toLowerCase());
        }
        
        return {
            interestLevel: interestLevelMatch ? interestLevelMatch[1].toLowerCase() : 'unknown',
            games,
            fanLevel: fanLevelMatch ? fanLevelMatch[1].toLowerCase() : 'casual',
            contentPreferences,
            productRecommendations,
            analysis: analysisMatch ? analysisMatch[1].trim() : 'No detailed analysis provided'
        };
    }
};

// eSports profile validation service
const esportsProfileService = {
    /**
     * Validate and analyze an eSports profile
     * @param {string} platform - eSports platform (faceit, esea, etc.)
     * @param {string} username - Username on the platform
     * @param {string} profileUrl - URL to the profile
     * @returns {Promise<Object>} - Validation and analysis results
     */
    async validateEsportsProfile(platform, username, profileUrl) {
        try {
            // In a real implementation, you'd scrape the profile page or use the platform's API
            // For this example, we'll simulate with GPT-3.5
            
            const prompt = this._generateProfileValidationPrompt(platform, username, profileUrl);
            
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are an esports profile validator. Your task is to analyze a profile URL and determine if it's valid and relevant to FURIA fans."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 500
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Process and structure the response
            const analysisText = response.data.choices[0].message.content;
            const structuredAnalysis = this._parseValidationResponse(analysisText, platform, username);
            
            return {
                success: true,
                platform,
                username,
                profileUrl,
                analysisTime: new Date().toISOString(),
                rawAnalysis: analysisText,
                analysis: structuredAnalysis
            };
            
        } catch (error) {
            console.error('eSports profile validation error:', error);
            return {
                success: false,
                error: error.message || 'Unknown error during profile validation'
            };
        }
    },
    
    /**
     * Generate prompt for eSports profile validation
     * @param {string} platform - eSports platform
     * @param {string} username - Username
     * @param {string} profileUrl - Profile URL
     * @returns {string} - Formatted prompt
     */
    _generateProfileValidationPrompt(platform, username, profileUrl) {
        return `
            You are tasked with analyzing an eSports profile URL for ${platform} with username ${username}.
            The profile URL is: ${profileUrl}
            
            Please determine:
            1. If this appears to be a valid eSports profile URL for the platform
            2. If the username in the URL matches the provided username
            3. What games the profile is likely associated with
            4. The relevance of this profile to FURIA eSports fan identification
            
            Analyze the structure of the URL and any available information to make these determinations.
            
            Present your findings in this format:
            
            VALID_URL: [yes/no]
            USERNAME_MATCH: [yes/no]
            GAMES: [comma-separated list of game IDs: cs,valorant,lol,etc.]
            RELEVANCE: [high/medium/low]
            ANALYSIS: [brief explanation]
            
            For this simulation, you can generate plausible skill levels and stats that would be found on such a profile.
        `;
    },
    
    /**
     * Parse validation response to structured data
     * @param {string} responseText - Raw text response
     * @param {string} platform - eSports platform
     * @param {string} username - Username
     * @returns {Object} - Structured validation data
     */
    _parseValidationResponse(responseText, platform, username) {
        // Extract key information using regex
        const validUrlMatch = responseText.match(/VALID_URL:\s*(yes|no)/i);
        const usernameMatch = responseText.match(/USERNAME_MATCH:\s*(yes|no)/i);
        const gamesMatch = responseText.match(/GAMES:\s*(.+?)(?=\n|$)/i);
        const relevanceMatch = responseText.match(/RELEVANCE:\s*(high|medium|low)/i);
        const analysisMatch = responseText.match(/ANALYSIS:\s*(.+?)(?=\n|$)/is);
        
        // Process games list
        let games = [];
        if (gamesMatch && gamesMatch[1]) {
            const gameIds = gamesMatch[1].split(/,\s*/).map(game => game.trim().toLowerCase());
            
            games = gameIds.map(id => {
                let name;
                let level = Math.floor(Math.random() * 6) + 5; // Random level between 5-10
                
                switch (id) {
                    case 'cs':
                    case 'cs2':
                    case 'csgo':
                        name = 'Counter-Strike';
                        break;
                    case 'valorant':
                        name = 'VALORANT';
                        break;
                    case 'lol':
                        name = 'League of Legends';
                        break;
                    case 'r6':
                        name = 'Rainbow Six Siege';
                        break;
                    case 'apex':
                        name = 'APEX Legends';
                        break;
                    default:
                        name = id.charAt(0).toUpperCase() + id.slice(1);
                }
                
                return { id, name, level };
            });
        }
        
        // Generate random stats
        const stats = {
            matches: Math.floor(Math.random() * 1000) + 50,
            winRate: Math.floor(Math.random() * 30) + 40, // 40-70%
            hoursPlayed: Math.floor(Math.random() * 3000) + 500,
            ranking: Math.floor(Math.random() * 2000) + 1 // 1-2000
        };
        
        const isValid = validUrlMatch && validUrlMatch[1].toLowerCase() === 'yes';
        const isUsernameMatch = usernameMatch && usernameMatch[1].toLowerCase() === 'yes';
        
        return {
            verified: isValid && isUsernameMatch,
            validUrl: isValid,
            usernameMatch: isUsernameMatch,
            stats,
            games,
            relevance: relevanceMatch ? relevanceMatch[1].toLowerCase() : 'unknown',
            analysis: analysisMatch ? analysisMatch[1].trim() : 'No detailed analysis provided'
        };
    }
};

// Export the services
module.exports = {
    documentVerificationService,
    socialMediaAnalysisService,
    esportsProfileService
};