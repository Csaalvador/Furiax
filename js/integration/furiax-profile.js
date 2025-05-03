/**
 * FURIAX - Sistema de Integração de Perfil
 * Este arquivo sincroniza os dados do perfil entre a página profile.html e o resto do sistema
 * 
 * Adicione este script em todas as páginas do sistema FURIAX após os outros scripts
 */

// Namespace para garantir isolamento
const FuriaxProfileIntegration = (() => {
    // Constantes para armazenamento
    const STORAGE_KEYS = {
        LEGACY_PROFILE: 'furiaxProfile',
        SYSTEM_PROFILE: 'furiax_user_profile',
        CURRENT_USER: 'furiax_current_user'
    };

    // Função de inicialização
    function init() {
        console.log('Inicializando sistema de integração de perfil FURIAX...');
        
        // Executar sincronização ao carregar a página
        syncProfiles();
        
        // Adicionar listener para eventos de atualização de perfil
        window.addEventListener('furiaxProfileUpdated', syncProfiles);
        
        // Escutar as mudanças de armazenamento (para sincronizar entre abas)
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEYS.LEGACY_PROFILE || e.key === STORAGE_KEYS.SYSTEM_PROFILE) {
                console.log('Detectada alteração de perfil em outra aba, sincronizando...');
                syncProfiles();
                updateUI();
            }
        });
    }

    // Sincroniza os perfis entre os diferentes armazenamentos
    function syncProfiles() {
        try {
            // Debug output before sync
            debugProfileSync();
            
            // Verificar qual é a origem mais recente
            const legacyProfile = loadLegacyProfile();
            const systemProfile = loadSystemProfile();
            
            // Se não houver perfis, não há nada para sincronizar
            if (!legacyProfile && !systemProfile) {
                return;
            }
            
            // Determinar qual perfil está mais atualizado
            let masterProfile;
            
            if (!legacyProfile) {
                // Apenas sistema existe, use-o como mestre
                masterProfile = convertSystemToLegacy(systemProfile);
                saveLegacyProfile(masterProfile);
            } else if (!systemProfile) {
                // Apenas legacy existe, use-o como mestre
                masterProfile = legacyProfile;
                saveSystemProfile(convertLegacyToSystem(masterProfile));
            } else {
                // Special check for username
                if (legacyProfile.username && 
                    legacyProfile.username !== 'FuriaX_Pro' && 
                    (!systemProfile.username || systemProfile.username === 'FuriaX_Pro')) {
                    // Legacy tem um nome customizado que o sistema não tem
                    console.log('Detectado username customizado no perfil legado');
                    systemProfile.username = legacyProfile.username;
                    saveSystemProfile(systemProfile);
                } else if (systemProfile.username && 
                          systemProfile.username !== 'FuriaX_Pro' && 
                          (!legacyProfile.username || legacyProfile.username === 'FuriaX_Pro')) {
                    // System tem um nome customizado que o legacy não tem
                    console.log('Detectado username customizado no perfil do sistema');
                    legacyProfile.username = systemProfile.username;
                    saveLegacyProfile(legacyProfile);
                }
                
                // Ambos existem, verificar qual é mais recente
                const isDifferent = isProfileDifferent(legacyProfile, systemProfile);
                
                if (isDifferent) {
                    // Diferenças encontradas, usar o perfil do sistema como mestre, 
                    // mas preservando username personalizado se existir
                    masterProfile = convertSystemToLegacy(systemProfile);
                    if (legacyProfile.username && legacyProfile.username !== 'FuriaX_Pro') {
                        masterProfile.username = legacyProfile.username;
                    }
                    saveLegacyProfile(masterProfile);
                    console.log('Perfil sincronizado com username preservado:', masterProfile.username);
                } else {
                    // Sem diferenças significativas, manter ambos
                    masterProfile = legacyProfile;
                }
            }
            
            // Também atualizar o perfil na sessão atual se disponível
            if (window.sessionState && window.sessionState.profile) {
                window.sessionState.profile = convertLegacyToSessionProfile(masterProfile);
                console.log('Perfil na sessão atualizado com username:', 
                            window.sessionState.profile.username);
            }
            
            // Debug output after sync
            console.log('Sincronização de perfil concluída');
            debugProfileSync();
        } catch (error) {
            console.error('Erro ao sincronizar perfis:', error);
        }
    }

    // Carrega o perfil legado (da página profile.html)
    function loadLegacyProfile() {
        try {
            if (!STORAGE_KEYS || !STORAGE_KEYS.LEGACY_PROFILE) {
                console.error('STORAGE_KEYS.LEGACY_PROFILE não está definido.');
                return null;
            }
    
            const data = localStorage.getItem(STORAGE_KEYS.LEGACY_PROFILE);
    
            if (!data) {
                return null;
            }
    
            try {
                return JSON.parse(data);
            } catch (parseError) {
                console.error('Erro ao interpretar JSON do perfil legado:', parseError);
                return null;
            }
    
        } catch (error) {
            console.error('Erro ao carregar perfil legado:', error);
            return null;
        }
    }
    
    // Carrega o perfil do sistema
    function loadSystemProfile() {
        try {
            const currentUser = loadCurrentUser();
            if (!currentUser) return null;
            
            const userId = currentUser.id;
            const data = localStorage.getItem(STORAGE_KEYS.SYSTEM_PROFILE);
            const profiles = data ? JSON.parse(data) : {};
            
            return profiles[userId] || null;
        } catch (error) {
            console.error('Erro ao carregar perfil do sistema:', error);
            return null;
        }
    }
    
    // Carrega o usuário atual
    function loadCurrentUser() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar usuário atual:', error);
            return null;
        }
    }
    
    // Salva o perfil legado
    function saveLegacyProfile(profile) {
        localStorage.setItem(STORAGE_KEYS.LEGACY_PROFILE, JSON.stringify(profile));
    }
    
    // Salva o perfil no sistema
    function saveSystemProfile(profile) {
        try {
            const currentUser = loadCurrentUser();
            if (!currentUser) return;
            
            const userId = currentUser.id;
            const data = localStorage.getItem(STORAGE_KEYS.SYSTEM_PROFILE);
            const profiles = data ? JSON.parse(data) : {};
            
            profiles[userId] = profile;
            localStorage.setItem(STORAGE_KEYS.SYSTEM_PROFILE, JSON.stringify(profiles));
        } catch (error) {
            console.error('Erro ao salvar perfil do sistema:', error);
        }
    }
    
    // Verifica se há diferenças significativas entre os perfis
    function isProfileDifferent(legacyProfile, systemProfile) {
        // Convertemos o perfil do sistema para o formato legado para comparação
        const convertedSystemProfile = convertSystemToLegacy(systemProfile);
        
        // Campos principais para comparar
        const keysToCompare = ['username', 'title', 'level', 'xpCurrent', 'xpTotal', 'avatar'];
        
        for (const key of keysToCompare) {
            if (legacyProfile[key] !== convertedSystemProfile[key]) {
                return true;
            }
        }
        
        // Comparar estatísticas básicas
        const statsToCompare = ['wins', 'trophies', 'games'];
        for (const stat of statsToCompare) {
            const legacyStat = legacyProfile[stat];
            const systemStat = systemProfile.stats ? systemProfile.stats[stat] : undefined;
            
            if (legacyStat !== systemStat && (legacyStat !== undefined || systemStat !== undefined)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Converte o perfil do sistema para o formato legado
    function convertSystemToLegacy(systemProfile) {
        if (!systemProfile) return null;
        
        return {
            username: systemProfile.username || 'FuriaX_Pro', // Ensure username takes priority
            email: systemProfile.email || 'furioso@furiax.com',
            title: systemProfile.title || 'Novato',
            bio: systemProfile.bio || '',
            avatar: systemProfile.avatarStyle || 1,
            level: systemProfile.level || 1,
            xpCurrent: systemProfile.xpCurrent || 0,
            xpTotal: systemProfile.xpTotal || 100,
            wins: systemProfile.stats?.wins || 0,
            trophies: systemProfile.stats?.trophies || 0,
            games: systemProfile.stats?.games || 0
        };
    }
    
    // Converte o perfil legado para o formato do sistema
    function convertLegacyToSystem(legacyProfile) {
        if (!legacyProfile) return null;
        
        const currentUser = loadCurrentUser();
        const userId = currentUser?.id || 'default';
        
        // Make sure username is properly preserved
        const username = legacyProfile.username && legacyProfile.username !== 'FuriaX_Pro' 
            ? legacyProfile.username 
            : (currentUser?.username || 'FuriaX_Pro');
        
        return {
            id: userId,
            username: username, // Use the preserved username
            displayName: username, // Also use it for display name
            email: legacyProfile.email || 'furioso@furiax.com',
            avatarBg: 'linear-gradient(45deg, #1e90ff, #00bfff)',
            avatarStyle: legacyProfile.avatar || 1,
            title: getTitleText(legacyProfile.title) || 'Novato FURIA',
            bio: legacyProfile.bio || 'Fã da FURIA!',
            level: legacyProfile.level || 1,
            xpCurrent: legacyProfile.xpCurrent || 0,
            xpTotal: legacyProfile.xpTotal || 100,
            stats: {
                posts: 0,
                comments: 0,
                likes: 0,
                wins: legacyProfile.wins || 0,
                trophies: legacyProfile.trophies || 0,
                games: legacyProfile.games || 0
            },
            settings: {
                theme: 'dark',
                notifications: true,
                privacy: 'public'
            },
            badges: [],
            joinDate: Date.now(),
            lastUpdated: Date.now()
        };
    }
    
    // Função para depuração de sincronização de perfil
    function debugProfileSync() {
        const legacyProfile = loadLegacyProfile();
        const systemProfile = loadSystemProfile();
        
        console.log('Debug Profile Sync:');
        console.log('Legacy Profile:', legacyProfile);
        console.log('System Profile:', systemProfile);
        
        if (legacyProfile && systemProfile) {
            console.log('Username comparison:');
            console.log('- Legacy username:', legacyProfile.username);
            console.log('- System username:', systemProfile.username);
        }
    }
    
    // Converte o perfil legado para o formato da sessão
    function convertLegacyToSessionProfile(legacyProfile) {
        // Similar ao convertLegacyToSystem, mas adaptado para o formato exato da sessão
        return convertLegacyToSystem(legacyProfile); // Mesmo formato neste caso
    }
    
    // Obtém o texto do título com base no valor
    function getTitleText(titleValue) {
        // Se já for um texto descritivo, retornar ele mesmo
        if (typeof titleValue === 'string' && !titleValue.includes('_')) {
            return titleValue;
        }
        
        const titles = {
            "novato": "Novato FURIA",
            "iniciante": "Iniciante",
            "casual": "Jogador Casual",
            "competitivo": "Competidor",
            "furioso": "Furioso",
            "furioso_elite": "Furioso Elite",
            "lendario": "Furioso Lendário"
        };
        
        return titles[titleValue] || titleValue;
    }
    
    // Atualiza a interface com os dados sincronizados
    function updateUI() {
        // Verificar se a função de atualização da interface está disponível
        if (window.updateAllUserInterfaceElements) {
            window.updateAllUserInterfaceElements();
        }
        
        // Se estivermos na página de perfil, atualizar o preview
        if (window.updatePreview) {
            window.updatePreview();
        }
    }
    
    // Método para salvar o perfil de qualquer lugar do sistema
    function saveProfile(profileData) {
        try {
            // Carregar perfil existente
            const legacyProfile = loadLegacyProfile() || {};

            // Mesclar dados novos
            const updatedProfile = { ...legacyProfile, ...profileData };

            // Salvar perfis nos dois formatos
            saveLegacyProfile(updatedProfile);
            saveSystemProfile(convertLegacyToSystem(updatedProfile));

            // Disparar evento para outras partes do sistema saberem
            const event = new CustomEvent('furiaxProfileUpdated', {
                detail: { profile: updatedProfile }
            });
            window.dispatchEvent(event);

            // Atualizar elementos da interface
            updateUI();

            return true;
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            return false;
        }
    }
    
    // Retornar API pública
    return {
        init,
        saveProfile,
        loadLegacyProfile,
        loadSystemProfile,
        saveLegacyProfile,
        saveSystemProfile,
        syncProfiles,
        updateUI,
        debugProfileSync
    };
})();

// Inicializar o sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    FuriaxProfileIntegration.init();
    
    // Se estivermos na página de perfil, modificar o comportamento do botão Salvar
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        const originalSaveFunction = window.saveProfile; // Salvar referência à função original se existir
        
        // Substituir a função de salvar
        window.saveProfile = function() {
            // Obter valores atuais do formulário
            const userProfile = {
                username: document.getElementById('usernameInput').value,
                email: document.getElementById('emailInput').value,
                title: document.getElementById('titleSelect').value,
                bio: document.getElementById('bioTextarea').value,
                avatar: parseInt(document.querySelector('.avatar-choice.selected').dataset.avatar),
                level: parseInt(document.getElementById('levelInput').value),
                xpCurrent: parseInt(document.getElementById('xpCurrentInput').value),
                xpTotal: parseInt(document.getElementById('xpTotalInput').value),
                wins: parseInt(document.getElementById('winsInput').value),
                trophies: parseInt(document.getElementById('trophiesInput').value),
                games: parseInt(document.getElementById('gamesInput').value)
            };
            
            // Salvar usando o sistema integrado
            const success = FuriaxProfileIntegration.saveProfile(userProfile);
            
            if (success) {
                // Mostrar notificação
                const notification = document.getElementById('notification');
                if (notification) {
                    notification.innerHTML = `<i class="fas fa-check-circle"></i> Perfil salvo com sucesso!`;
                    notification.classList.add('show');
                    
                    setTimeout(() => {
                        notification.classList.remove('show');
                    }, 3000);
                }
            }
            
            // Executar função original se existir
            if (typeof originalSaveFunction === 'function') {
                originalSaveFunction();
            }
        };
        
        // Usar nova função no botão
        saveProfileBtn.addEventListener('click', window.saveProfile);
    }
});

