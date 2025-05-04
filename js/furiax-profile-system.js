// furiax-profile-sync.js
// Script para sincronizar o perfil do usuário entre páginas da plataforma FURIAX
/**
 * FURIAX Multi-Profile Manager
 * This fix allows multiple profiles to be stored in localStorage
 * Each profile will be saved with a unique identifier
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Initializing FURIAX Multi-Profile System...');
    
    // =====================================================
    // ENHANCED MULTI-PROFILE SYSTEM
    // =====================================================
    
    const MultiProfileManager = {
        // Store of all available profiles
        PROFILES_KEY: 'furiax_all_profiles',
        // Current active profile ID
        ACTIVE_PROFILE_KEY: 'furiax_active_profile',
        
        /**
         * Initialize the multi-profile system
         */
        init: function() {
            // Check if the profiles storage exists
            if (!StorageManager.get(this.PROFILES_KEY)) {
                // Initialize empty profiles object
                StorageManager.set(this.PROFILES_KEY, {});
                
                // Migrate existing profile if available
                const existingProfile = StorageManager.get(CONFIG.STORAGE_KEYS.PROFILE);
                if (existingProfile) {
                    // Generate a unique ID for the existing profile
                    const profileId = 'profile_' + Date.now();
                    
                    // Save as first profile
                    const profiles = {};
                    profiles[profileId] = existingProfile;
                    StorageManager.set(this.PROFILES_KEY, profiles);
                    
                    // Set as active profile
                    StorageManager.set(this.ACTIVE_PROFILE_KEY, profileId);
                }
            }
            
            console.log('✅ Multi-Profile System initialized');
        },
        
        /**
         * Get the ID of the currently active profile
         */
        getActiveProfileId: function() {
            return StorageManager.get(this.ACTIVE_PROFILE_KEY) || null;
        },
        
        /**
         * Set the active profile by ID
         */
        setActiveProfile: function(profileId) {
            if (!profileId) return false;
            
            const profiles = this.getAllProfiles();
            if (!profiles[profileId]) return false;
            
            // Set as active profile
            StorageManager.set(this.ACTIVE_PROFILE_KEY, profileId);
            
            // For compatibility, also update the original profile storage
            StorageManager.set(CONFIG.STORAGE_KEYS.PROFILE, profiles[profileId]);
            
            return true;
        },
        
        /**
         * Get all available profiles
         */
        getAllProfiles: function() {
            return StorageManager.get(this.PROFILES_KEY, {});
        },
        
        /**
         * Get profile data for the currently active profile
         */
        getActiveProfileData: function() {
            const activeId = this.getActiveProfileId();
            const profiles = this.getAllProfiles();
            
            if (activeId && profiles[activeId]) {
                return profiles[activeId];
            }
            
            // Return default profile if no active profile
            return {
                username: CONFIG.DEFAULTS.USERNAME,
                avatar: CONFIG.DEFAULTS.AVATAR,
                title: CONFIG.DEFAULTS.TITLE,
                level: 1,
                levelProgress: 0,
                bio: 'Olá, sou um fã da FURIA!'
            };
        },
        
        /**
         * Create a new profile
         */
        createProfile: function(profileData) {
            if (!profileData || typeof profileData !== 'object') return null;
            
            // Generate unique ID
            const profileId = 'profile_' + Date.now();
            
            // Get all profiles
            const profiles = this.getAllProfiles();
            
            // Add new profile
            profiles[profileId] = {
                ...profileData,
                createdAt: Date.now()
            };
            
            // Save profiles
            StorageManager.set(this.PROFILES_KEY, profiles);
            
            // Set as active
            this.setActiveProfile(profileId);
            
            return profileId;
        },
        
        /**
         * Update an existing profile
         */
        updateProfile: function(profileId, profileData) {
            if (!profileId || !profileData) return false;
            
            const profiles = this.getAllProfiles();
            if (!profiles[profileId]) return false;
            
            // Update profile
            profiles[profileId] = {
                ...profiles[profileId],
                ...profileData,
                updatedAt: Date.now()
            };
            
            // Save profiles
            StorageManager.set(this.PROFILES_KEY, profiles);
            
            // If this is the active profile, update the original profile storage
            const activeId = this.getActiveProfileId();
            if (activeId === profileId) {
                StorageManager.set(CONFIG.STORAGE_KEYS.PROFILE, profiles[profileId]);
            }
            
            return true;
        },
        
        /**
         * Delete a profile
         */
        deleteProfile: function(profileId) {
            if (!profileId) return false;
            
            const profiles = this.getAllProfiles();
            if (!profiles[profileId]) return false;
            
            // Delete profile
            delete profiles[profileId];
            
            // Save profiles
            StorageManager.set(this.PROFILES_KEY, profiles);
            
            // If this was the active profile, set another one as active
            const activeId = this.getActiveProfileId();
            if (activeId === profileId) {
                const profileIds = Object.keys(profiles);
                if (profileIds.length > 0) {
                    this.setActiveProfile(profileIds[0]);
                } else {
                    // No profiles left, clear active profile
                    StorageManager.set(this.ACTIVE_PROFILE_KEY, null);
                    // Also clear original profile storage
                    StorageManager.set(CONFIG.STORAGE_KEYS.PROFILE, null);
                }
            }
            
            return true;
        }
    };
    
    // =====================================================
    // OVERRIDE EXISTING PROFILE MANAGER
    // =====================================================
    
    // Initialize the multi-profile system
    MultiProfileManager.init();
    
    // Override existing ProfileManager methods
    const originalProfileManager = window.FURIAXCommunity.ProfileManager;
    
    window.FURIAXCommunity.ProfileManager = {
        ...originalProfileManager,
        
        // Override getProfileData to use the multi-profile system
        getProfileData: function() {
            return MultiProfileManager.getActiveProfileData();
        },
        
        // Method to create a new profile
        createNewProfile: function(profileData) {
            return MultiProfileManager.createProfile(profileData);
        },
        
        // Method to update current profile
        updateCurrentProfile: function(profileData) {
            const activeId = MultiProfileManager.getActiveProfileId();
            if (activeId) {
                return MultiProfileManager.updateProfile(activeId, profileData);
            }
            return false;
        },
        
        // Method to switch to a different profile
        switchProfile: function(profileId) {
            const result = MultiProfileManager.setActiveProfile(profileId);
            if (result) {
                // Update UI with new profile
                this.updateProfileUI();
                
                // Show notification
                if (window.FURIAXCommunity.NotificationManager) {
                    window.FURIAXCommunity.NotificationManager.show('Perfil alterado com sucesso!', 'success');
                }
            }
            return result;
        },
        
        // Get list of all profiles
        getAllProfiles: function() {
            return MultiProfileManager.getAllProfiles();
        },
        
        // Get current profile ID
        getCurrentProfileId: function() {
            return MultiProfileManager.getActiveProfileId();
        }
    };
    
    // Make MultiProfileManager available globally
    window.FURIAXCommunity.MultiProfileManager = MultiProfileManager;
    
    console.log('✅ Profile system enhanced with multi-profile support');
});
// Função principal para sincronizar os dados do perfil do usuário
function syncUserProfile() {
    // Verificar se existe um usuário logado
    const currentUser = localStorage.getItem('furiax_current_user');
    if (!currentUser) {
        // Redirecionar para login se não estiver logado
        window.location.href = '../login.html';
        return false;
    }
    
    // Verificar se a sessão está válida
    const sessionData = JSON.parse(localStorage.getItem('furiax_session_token') || 'null');
    if (!sessionData || sessionData.expires < Date.now()) {
        // Sessão expirada, limpar dados e redirecionar para login
        localStorage.removeItem('furiax_current_user');
        localStorage.removeItem('furiax_session_token');
        window.location.href = '../login.html';
        return false;
    }
    
    // Carregar e aplicar os dados do perfil na interface
    loadAndApplyProfileData();
    
    return true;
}

// Função para carregar e aplicar os dados do perfil na interface
function loadAndApplyProfileData() {
    // Obter dados do perfil
    const profileData = localStorage.getItem('furiaxProfile');
    
    if (!profileData) {
        console.warn('Dados de perfil não encontrados');
        return false;
    }
    
    try {
        const profile = JSON.parse(profileData);
        
        // Aplicar dados em elementos da interface
        updateProfileElements(profile);
        
        // Configurar barra de nível
        updateLevelBar(profile.level, profile.levelProgress);
        
        console.log('✅ Perfil sincronizado com sucesso!', profile);
        return true;
    } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        return false;
    }
}

// Função para atualizar elementos da interface com dados do perfil
function updateProfileElements(profile) {
    // Atualizar nome de usuário nos elementos com ID 'sidebarUsername'
    const usernameElements = document.querySelectorAll('#sidebarUsername');
    usernameElements.forEach(el => {
        if (el) el.textContent = profile.username || 'Usuário FURIAX';
    });
    
    // Atualizar título/role nos elementos com ID 'sidebarTitle'
    const titleElements = document.querySelectorAll('#sidebarTitle');
    titleElements.forEach(el => {
        if (el) {
            // Mapear valor do título para texto mais amigável
            const titles = {
                "novato": "Novato",
                "iniciante": "Iniciante",
                "casual": "Jogador Casual",
                "competitivo": "Competidor", 
                "furioso": "Furioso",
                "furioso_elite": "Furioso Elite",
                "lendario": "Furioso Lendário"
            };
            
            el.textContent = titles[profile.title] || profile.title || 'Novato';
        }
    });
    
    // Atualizar avatar se ele existir
    const avatarElements = document.querySelectorAll('.user-avatar, .profile-avatar');
    if (profile.avatar) {
        avatarElements.forEach(el => {
            if (el && el.tagName === 'IMG') {
                el.src = profile.avatar;
            }
        });
    }
    
    // Atualizar bio se existir o elemento
    const bioElements = document.querySelectorAll('.user-bio');
    bioElements.forEach(el => {
        if (el) el.textContent = profile.bio || 'Olá, sou um fã da FURIA!';
    });
}

// Função para atualizar a barra de nível
function updateLevelBar(level, progress) {
    const levelElements = document.querySelectorAll('.user-level-text');
    levelElements.forEach(el => {
        if (el) el.textContent = `Nível ${level || 1}`;
    });
    
    const progressBars = document.querySelectorAll('.user-level-fill');
    progressBars.forEach(el => {
        if (el) el.style.width = `${progress || 0}%`;
    });
}

// Evento para sincronizar o perfil quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', syncUserProfile);

// Observador para detectar mudanças no localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'furiaxProfile' || e.key === 'furiax_current_user') {
        // Atualizar dados do perfil quando houver alterações
        loadAndApplyProfileData();
    }
});

// Verificar e sincronizar a cada 5 minutos para manter a sessão ativa
setInterval(syncUserProfile, 5 * 60 * 1000);

// Botão de logout
document.addEventListener('DOMContentLoaded', function() {
    const logoutButtons = document.querySelectorAll('.logout-button');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Limpar dados da sessão
            localStorage.removeItem('furiax_current_user');
            localStorage.removeItem('furiax_session_token');
            
            // Redirecionar para página de login
            window.location.href = '../pages/login.html';
        });
    });
});