document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const friendsList = document.getElementById('discord-friends-list');
    const friendSearch = document.getElementById('friend-search');
    
    // Lista de amigos
    let friends = [];
    
    // Função para obter iniciais do nome
    function getInitials(name) {
        if (!name || typeof name !== 'string') return '??';
        return name.split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }
    
    // Criar lista de demonstração de amigos
    function createDemoFriends() {
        return [
            {
                id: 1,
                name: 'Cauã Salvador',
                status: 'online',
                type: 'admin',
                activity: null,
                avatar: 'CS'
            },
            {
                id: 2,
                name: 'RoninDaFuria',
                status: 'online',
                game: 'CS2',
                gameType: 'csgo',
                activity: 'Jogando CS2',
                avatar: 'RD'
            },
            {
                id: 3,
                name: 'CSniper_PRO',
                status: 'online',
                game: 'Valorant',
                gameType: 'valorant',
                activity: 'Jogando Valorant',
                avatar: 'CP'
            },
            {
                id: 4,
                name: 'KSCERATO_Lover',
                status: 'idle',
                activity: 'Ausente',
                avatar: 'KL'
            },
            {
                id: 5,
                name: 'Lobinha_FURIA',
                status: 'dnd',
                activity: 'Não perturbe',
                avatar: 'LF'
            },
            {
                id: 6,
                name: 'Valkiria_FURIA',
                status: 'online',
                game: 'League of Legends',
                gameType: 'lol',
                activity: 'Jogando League of Legends',
                avatar: 'VF'
            },
            {
                id: 7,
                name: 'Art_Fan',
                status: 'offline',
                activity: 'Offline há 3h',
                avatar: 'AF'
            },
            {
                id: 8,
                name: 'FalleN_BR',
                status: 'online',
                activity: 'Spotify: FURIA Mix',
                avatar: 'FB'
            }
        ];
    }
    
    // Buscar amigos do localStorage ou usar lista de demonstração
    function loadFriends() {
        try {
            // Tentar carregar amigos do localStorage
            const storedFriends = localStorage.getItem('furiaxFriends');
            if (storedFriends) {
                return JSON.parse(storedFriends);
            }
            
            // Verificar outras chaves possíveis
            const possibleKeys = ['friends', 'discord_friends', 'userFriends'];
            for (const key of possibleKeys) {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            return parsed;
                        }
                    } catch (e) {
                        console.error(`Erro ao processar chave ${key}:`, e);
                    }
                }
            }
            
            // Se não encontrar nada, usar lista de demonstração
            return createDemoFriends();
        } catch (error) {
            console.error('Erro ao carregar amigos:', error);
            return createDemoFriends();
        }
    }
    
    // Normalizar dados dos amigos
    function normalizeFriends(friendsList) {
        return friendsList.map((friend, index) => {
            // Detectar jogo a partir da atividade ou status
            let game = null;
            let gameType = null;
            
            if (friend.game) {
                game = friend.game;
            } else if (friend.activity && typeof friend.activity === 'string') {
                const activity = friend.activity.toLowerCase();
                
                if (activity.includes('cs2') || activity.includes('csgo') || activity.includes('counter-strike')) {
                    game = 'CS2';
                    gameType = 'csgo';
                } else if (activity.includes('valorant')) {
                    game = 'Valorant';
                    gameType = 'valorant';
                } else if (activity.includes('lol') || activity.includes('league of legends')) {
                    game = 'League of Legends';
                    gameType = 'lol';
                } else if (activity.includes('rainbow') || activity.includes('r6')) {
                    game = 'Rainbow Six Siege';
                    gameType = 'r6';
                }
            }
            
            return {
                id: friend.id || index + 1,
                name: friend.name || `Amigo ${index + 1}`,
                status: friend.status || (Math.random() > 0.5 ? 'online' : 'offline'),
                type: friend.type || (index === 0 ? 'admin' : 'member'),
                activity: friend.activity || null,
                avatar: friend.avatar || getInitials(friend.name || `Amigo ${index + 1}`),
                game: game,
                gameType: gameType
            };
        });
    }
    
    // Criar elemento HTML para um amigo
    function createFriendElement(friend) {
        const element = document.createElement('div');
        element.className = 'friend-item';
        element.dataset.id = friend.id;
        element.dataset.name = friend.name;
        
        // Verificar se está jogando
        const isPlaying = friend.game !== null;
        
        // Criar conteúdo HTML
        let html = `
            <div class="friend-avatar">
                ${friend.avatar}
                <div class="status-indicator status-${friend.status}"></div>
            </div>
            <div class="friend-info">
                <div class="friend-name">
                    ${friend.name}
                    ${isPlaying ? `<button class="invite-btn">Juntar-se</button>` : ''}
                </div>
                <div class="friend-status ${isPlaying ? 'friend-playing' : ''}">
                    ${isPlaying ? `<i class="fas fa-gamepad"></i> ${friend.game}` : friend.activity || capitalizeStatus(friend.status)}
                </div>
            </div>
        `;
        
        // Adicionar tooltip para jogadores
        if (isPlaying) {
            html += `
                <div class="friend-tooltip">
                    <div class="tooltip-title">${friend.name}</div>
                    <div class="tooltip-info"><span class="tooltip-key">Jogando:</span> ${friend.game}</div>
                    <div class="tooltip-info"><span class="tooltip-key">Status:</span> Online</div>
                    <div class="tooltip-info"><span class="tooltip-key">Desde:</span> ${getRandomPlayTime()}</div>
                </div>
            `;
        }
        
        element.innerHTML = html;
        
        // Adicionar evento de clique ao botão de convite
        if (isPlaying) {
            const inviteBtn = element.querySelector('.invite-btn');
            inviteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Impedir propagação do evento
                showInviteMessage(friend);
            });
        }
        
        // Evento de clique no amigo
        element.addEventListener('click', () => {
            showFriendProfile(friend);
        });
        
        return element;
    }
    
    // Mostrar perfil do amigo
    function showFriendProfile(friend) {
        console.log(`Perfil de ${friend.name}`);
        
        // Verificar se existe uma função no sistema principal para mostrar perfil
        if (window.showFriendProfile) {
            window.showFriendProfile(friend.id);
        } else if (window.openChat) {
            window.openChat(friend.id);
        } else {
            // Criar notificação simples
            showMessage(`Perfil de ${friend.name}`, 'info');
        }
    }
    
    // Mostrar mensagem de convite
    function showInviteMessage(friend) {
        // Criar overlay de mensagem
        const overlay = document.createElement('div');
        overlay.className = 'game-invite-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'game-invite-modal';
        modal.style.cssText = `
            background: linear-gradient(145deg, #111, #181818);
            border: 1px solid #3ba55c;
            border-radius: 10px;
            padding: 20px;
            max-width: 300px;
            text-align: center;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        `;
        
        // Ícone de jogo
        let gameIcon = 'gamepad';
        if (friend.gameType === 'csgo') gameIcon = 'crosshairs';
        else if (friend.gameType === 'valorant') gameIcon = 'shield-alt';
        else if (friend.gameType === 'lol') gameIcon = 'hat-wizard';
        else if (friend.gameType === 'r6') gameIcon = 'user-shield';
        
        modal.innerHTML = `
            <div style="font-size: 40px; color: #3ba55c; margin-bottom: 15px;"><i class="fas fa-${gameIcon}"></i></div>
            <h3 style="color: white; margin: 0 0 10px; font-family: 'Orbitron', sans-serif;">Juntar-se a ${friend.name}</h3>
            <p style="color: #b9bbbe; margin: 0 0 20px; font-size: 14px;">Deseja se juntar ao jogo de ${friend.game}?</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="cancel-invite" style="background: rgba(255, 255, 255, 0.1); color: #dcddde; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Cancelar</button>
                <button id="confirm-invite" style="background: linear-gradient(90deg, #3ba55c, #1e90ff); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">Juntar-se</button>
            </div>
        `;
        
        // Adicionar à página
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Adicionar eventos aos botões
        document.getElementById('cancel-invite').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        document.getElementById('confirm-invite').addEventListener('click', () => {
            document.body.removeChild(overlay);
            
            // Simular juntar-se ao jogo
            showMessage(`Conectando-se ao jogo de ${friend.name}...`, 'success');
            
            // Se existir uma função no sistema principal, chamá-la
            if (window.joinGame) {
                window.joinGame(friend.id, friend.game);
            }
        });
        
        // Fechar ao clicar fora
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
    
    // Mostrar mensagem temporária
    function showMessage(message, type) {
        // Remover mensagens anteriores
        const existingMessages = document.querySelectorAll('.message-toast');
        existingMessages.forEach(msg => document.body.removeChild(msg));
        
        // Criar elemento de mensagem
        const messageEl = document.createElement('div');
        messageEl.className = `message-toast ${type}`;
        messageEl.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-family: 'Exo 2', sans-serif;
            z-index: 9999;
            animation: fadeIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        if (type === 'success') {
            messageEl.style.background = 'linear-gradient(90deg, #3ba55c, #1e90ff)';
        } else if (type === 'error') {
            messageEl.style.background = 'linear-gradient(90deg, #ed4245, #ff3b5c)';
        } else {
            messageEl.style.background = 'linear-gradient(90deg, #1e90ff, #00bfff)';
        }
        
        messageEl.innerHTML = `<div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle')}" style="font-size: 16px;"></i>
            <span>${message}</span>
        </div>`;
        
        // Adicionar à página
        document.body.appendChild(messageEl);
        
        // Remover após 3 segundos
        setTimeout(() => {
            if (document.body.contains(messageEl)) {
                document.body.removeChild(messageEl);
            }
        }, 3000);
    }
    
    // Obter tempo de jogo aleatório
    function getRandomPlayTime() {
        const hours = Math.floor(Math.random() * 5) + 1;
        const minutes = Math.floor(Math.random() * 60);
        
        if (hours > 1) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${hours}h ${minutes}m`;
        }
    }
    
    // Capitalizar status
    function capitalizeStatus(status) {
        switch(status) {
            case 'online': return 'Online';
            case 'offline': return 'Offline';
            case 'idle': return 'Ausente';
            case 'dnd': return 'Não perturbe';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    }
    
    // Renderizar lista de amigos
    function renderFriendsList() {
        // Limpar lista
        friendsList.innerHTML = '';
        
        // Filtrar amigos pelo termo de busca
        const searchTerm = friendSearch.value.toLowerCase();
        const filteredFriends = friends.filter(friend => 
            friend.name.toLowerCase().includes(searchTerm)
        );
        
        // Filtrar amigos online primeiro
        const onlineFriends = filteredFriends.filter(friend => friend.status === 'online');
        const otherFriends = filteredFriends.filter(friend => friend.status !== 'online');
        
        // Ordenar jogadores primeiro
        onlineFriends.sort((a, b) => {
            // Jogadores primeiro
            if (a.game && !b.game) return -1;
            if (!a.game && b.game) return 1;
            
            // Depois por nome
            return a.name.localeCompare(b.name);
        });
        
        // Combinar listas
        const sortedFriends = [...onlineFriends, ...otherFriends];
        
        if (sortedFriends.length === 0) {
            friendsList.innerHTML = `
                <div class="no-friends">
                    <i class="fas fa-user-slash"></i>
                    <p>Nenhum amigo encontrado</p>
                </div>
            `;
            return;
        }
        
        // Renderizar cada amigo
        sortedFriends.forEach(friend => {
            friendsList.appendChild(createFriendElement(friend));
        });
    }
    
    // Inicializar
    function init() {
        // Mostrar loading
        friendsList.innerHTML = `
            <div class="loading-friends">
                <div class="loading-spinner"></div>
                <span>Conectando ao Discord...</span>
            </div>
        `;
        
        // Carregar amigos com delay para simular conexão
        setTimeout(() => {
            // Carregar e normalizar amigos
            friends = normalizeFriends(loadFriends());
            
            // Renderizar lista
            renderFriendsList();
            
            // Se tiver amigos online, mostrar notificação
            const onlineCount = friends.filter(f => f.status === 'online').length;
            if (onlineCount > 0) {
                showMessage(`${onlineCount} amigos online`, 'info');
            }
        }, 1000);
    }
    
    // Evento de busca
    friendSearch.addEventListener('input', renderFriendsList);
    
    // Iniciar
    init();
    
    // Simular alterações de status ocasionalmente
    function simulateStatusChanges() {
        setInterval(() => {
            // Selecionar um amigo aleatório
            const index = Math.floor(Math.random() * friends.length);
            const friend = friends[index];
            
            // Alterar status
            const statuses = ['online', 'idle', 'dnd', 'offline'];
            const currentIndex = statuses.indexOf(friend.status);
            const newIndex = (currentIndex + 1) % statuses.length;
            friend.status = statuses[newIndex];
            
            // Se ficar online, talvez adicionar um jogo
            if (friend.status === 'online' && Math.random() > 0.5) {
                const games = [
                    { name: 'CS2', type: 'csgo' },
                    { name: 'Valorant', type: 'valorant' },
                    { name: 'League of Legends', type: 'lol' },
                    { name: 'Rainbow Six Siege', type: 'r6' }
                ];
                
                const randomGame = games[Math.floor(Math.random() * games.length)];
                friend.game = randomGame.name;
                friend.gameType = randomGame.type;
                friend.activity = `Jogando ${randomGame.name}`;
            } else {
                friend.game = null;
                friend.gameType = null;
                
                if (friend.status === 'offline') {
                    friend.activity = `Offline há ${Math.floor(Math.random() * 5) + 1}h`;
                } else if (friend.status === 'idle') {
                    friend.activity = 'Ausente';
                } else if (friend.status === 'dnd') {
                    friend.activity = 'Não perturbe';
                } else {
                    friend.activity = null;
                }
            }
            
            // Renderizar novamente
            renderFriendsList();
        }, 15000); // A cada 15 segundos
    }
    
    // Iniciar simulação (opcional - descomente para ativar)
    // simulateStatusChanges();
    
    // Expor API para uso externo
    window.discordFriends = {
        getFriends: () => [...friends],
        updateFriend: (id, updates) => {
            const friend = friends.find(f => f.id === id);
            if (friend) {
                Object.assign(friend, updates);
                renderFriendsList();
            }
        },
        addFriend: (friendData) => {
            const newFriend = {
                id: Math.max(...friends.map(f => f.id)) + 1,
                ...friendData,
                avatar: friendData.avatar || getInitials(friendData.name)
            };
            friends.push(newFriend);
            renderFriendsList();
            return newFriend.id;
        },
        removeFriend: (id) => {
            const index = friends.findIndex(f => f.id === id);
            if (index !== -1) {
                friends.splice(index, 1);
                renderFriendsList();
                return true;
            }
            return false;
        }
    };
});