// models/user.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for social media profiles
const SocialProfileSchema = new Schema({
    platform: {
        type: String,
        required: true,
        enum: ['google', 'twitter', 'instagram', 'twitch', 'facebook']
    },
    id: String,
    username: String,
    name: String,
    email: String,
    profileImage: String,
    verified: {
        type: Boolean,
        default: false
    },
    verificationDate: Date,
    followersCount: Number,
    followingCount: Number,
    mediaCount: Number,
    description: String,
    interests: [String],
    rawData: Schema.Types.Mixed // For storing additional platform-specific data
}, { _id: false });

// Schema for esports profiles
const EsportsProfileSchema = new Schema({
    platform: {
        type: String,
        required: true,
        enum: ['faceit', 'esea', 'gamersclub', 'battlefy', 'other']
    },
    username: {
        type: String,
        required: true
    },
    profileUrl: String,
    verified: {
        type: Boolean,
        default: false
    },
    verificationDate: Date,
    level: Number,
    matches: Number,
    winRate: Number,
    hoursPlayed: Number,
    games: [{
        id: String,
        name: String,
        level: Number
    }]
}, { _id: false });

// Schema for verified documents
const VerifiedDocumentSchema = new Schema({
    documentType: {
        type: String,
        required: true,
        enum: ['rg', 'cnh', 'passport', 'other']
    },
    documentId: {
        type: String,
        required: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verificationDate: Date,
    extractedInfo: {
        name: String,
        id: String,
        birthDate: Date
    }
}, { _id: false });

// Main user schema
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    hashedPassword: String,
    phone: String,
    city: String,
    state: String,
    country: String,
    birthDate: Date,
    registrationDate: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    fanLevel: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
        default: 'bronze'
    },
    engagementScore: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
    },
    socialProfiles: {
        type: Map,
        of: SocialProfileSchema
    },
    esportsProfiles: [EsportsProfileSchema],
    verifiedDocuments: [VerifiedDocumentSchema],
    preferences: {
        games: [String],
        teams: [String],
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
        }
    }
}, {
    timestamps: true
});

// User model methods

// Calculate fan level based on engagement score
UserSchema.methods.calculateFanLevel = function() {
    const score = this.engagementScore;
    
    if (score >= 90) {
        this.fanLevel = 'diamond';
    } else if (score >= 70) {
        this.fanLevel = 'platinum';
    } else if (score >= 50) {
        this.fanLevel = 'gold';
    } else if (score >= 30) {
        this.fanLevel = 'silver';
    } else {
        this.fanLevel = 'bronze';
    }
    
    return this.fanLevel;
};

// Update engagement score based on profile completeness
UserSchema.methods.updateEngagementScore = function() {
    let score = 20; // Base score
    
    // Add points for verified documents
    if (this.verifiedDocuments && this.verifiedDocuments.length > 0) {
        const verifiedDocs = this.verifiedDocuments.filter(doc => doc.verificationStatus === 'verified');
        score += verifiedDocs.length * 20;
    }
    
    // Add points for social accounts
    if (this.socialProfiles) {
        score += this.socialProfiles.size * 15;
    }
    
    // Add points for esports profiles
    if (this.esportsProfiles && this.esportsProfiles.length > 0) {
        const verifiedProfiles = this.esportsProfiles.filter(profile => profile.verified);
        score += verifiedProfiles.length * 25;
    }
    
    // Cap at 100
    this.engagementScore = Math.min(score, 100);
    
    // Update fan level
    this.calculateFanLevel();
    
    return this.engagementScore;
};

// Get available benefits based on fan level
UserSchema.methods.getAvailableBenefits = function() {
    const benefits = [
        {
            id: 'ticket_presale',
            name: 'Pré-venda de Ingressos',
            description: 'Acesso antecipado a ingressos para eventos',
            icon: 'ticket-alt',
            minLevel: 'bronze'
        },
        {
            id: 'store_discount',
            name: '10% de Desconto',
            description: 'Em todos os produtos da loja',
            icon: 'store',
            minLevel: 'silver'
        },
        {
            id: 'exclusive_item',
            name: 'Item Exclusivo',
            description: 'Brinde exclusivo físico',
            icon: 'gift',
            minLevel: 'gold'
        },
        {
            id: 'exclusive_news',
            name: 'Notícias Exclusivas',
            description: 'Seja o primeiro a saber',
            icon: 'bullhorn',
            minLevel: 'platinum'
        },
        {
            id: 'meet_players',
            name: 'Meet & Greet',
            description: 'Encontro com jogadores',
            icon: 'users',
            minLevel: 'diamond'
        }
    ];
    
    const levelOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const userLevelIndex = levelOrder.indexOf(this.fanLevel);
    
    return benefits.filter(benefit => {
        const benefitLevelIndex = levelOrder.indexOf(benefit.minLevel);
        return benefitLevelIndex <= userLevelIndex;
    });
};

// Set up model
const User = mongoose.model('User', UserSchema);

module.exports = User;