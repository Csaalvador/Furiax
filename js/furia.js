// Função para criar a simulação de jogo CS:GO
document.addEventListener('DOMContentLoaded', () => {
    // Selecionar o botão "Assistir"
    const watchBtn = document.querySelector('.watch-btn');
    
    if (watchBtn) {
        watchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Criar o modal de configuração de times
            createTeamSetupModal();
        });
    }
    
    // Função para criar o modal de configuração de times
    function createTeamSetupModal() {
        const setupModal = document.createElement('div');
        setupModal.className = 'team-setup-modal';
        
        setupModal.innerHTML = `
            <div class="team-setup-content">
                <div class="team-setup-header">
                    <h2>CONFIGURAÇÃO DO JOGO</h2>
                    <button class="setup-close-btn" id="setupCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="team-setup-body">
                    <div class="team-setup-section">
                        <h3>TIME ADVERSÁRIO</h3>
                        <div class="form-group">
                            <label for="opponentName">Nome do Time:</label>
                            <input type="text" id="opponentName" placeholder="Ex: Astralis" value="Astralis" maxlength="20">
                        </div>
                        <div class="form-group">
                            <label for="opponentLogo">URL do Logo (opcional):</label>
                            <input type="url" id="opponentLogo" placeholder="Ex: https://..." value="../img/section-furia/csgo/australis.png">
                        </div>
                        <div class="players-section">
                            <h4>Jogadores do Time Adversário:</h4>
                            <div class="player-inputs">
                                <input type="text" id="player1" placeholder="Jogador 1" value="blameF" maxlength="15">
                                <input type="text" id="player2" placeholder="Jogador 2" value="Xyp9x" maxlength="15">
                                <input type="text" id="player3" placeholder="Jogador 3" value="device" maxlength="15">
                                <input type="text" id="player4" placeholder="Jogador 4" value="gla1ve" maxlength="15">
                                <input type="text" id="player5" placeholder="Jogador 5" value="Magisk" maxlength="15">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="mapName">Mapa:</label>
                            <select id="mapName">
                                <option value="INFERNO">Inferno</option>
                                <option value="MIRAGE">Mirage</option>
                                <option value="DUST2">Dust 2</option>
                                <option value="NUKE">Nuke</option>
                                <option value="OVERPASS">Overpass</option>
                                <option value="VERTIGO">Vertigo</option>
                                <option value="ANCIENT">Ancient</option>
                            </select>
                        </div>
                    </div>
                    <div class="team-setup-actions">
                        <button class="setup-btn setup-btn-start" id="startGameSetup">INICIAR JOGO</button>
                        <button class="setup-btn setup-btn-cancel" id="cancelSetup">CANCELAR</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(setupModal);
        
        // Adicionar estilos para o modal de setup
        addSetupModalStyles();
        
        // Configurar eventos do modal de setup
        setupSetupModalEvents(setupModal);
        
        // Mostrar modal com animação
        setTimeout(() => {
            setupModal.classList.add('active');
        }, 10);
    }
    
    // Adicionar estilos do modal de setup
    function addSetupModalStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .team-setup-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 1600;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.4s ease, visibility 0.4s ease;
                backdrop-filter: blur(5px);
            }
            
            .team-setup-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .team-setup-content {
                width: 500px;
                max-width: 90%;
                background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
                border-radius: 10px;
                box-shadow: 0 0 40px rgba(30, 144, 255, 0.3);
                overflow: hidden;
                border: 2px solid rgba(30, 144, 255, 0.3);
                transform: scale(0.95);
                transition: transform 0.3s ease;
            }
            
            .team-setup-modal.active .team-setup-content {
                transform: scale(1);
            }
            
            .team-setup-header {
                padding: 20px;
                background: rgba(30, 144, 255, 0.1);
                border-bottom: 1px solid rgba(30, 144, 255, 0.3);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .team-setup-header h2 {
                font-family: 'Orbitron', sans-serif;
                font-size: 1.2rem;
                font-weight: 700;
                color: #1e90ff;
                margin: 0;
            }
            
            .setup-close-btn {
                width: 35px;
                height: 35px;
                background: rgba(255, 255, 255, 0.05);
                border: none;
                border-radius: 50%;
                color: #fff;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .setup-close-btn:hover {
                transform: rotate(90deg);
            }
            
            .team-setup-body {
                padding: 30px;
            }
            
            .team-setup-section {
                margin-bottom: 30px;
            }
            
            .team-setup-section h3 {
                font-family: 'Orbitron', sans-serif;
                font-size: 1.1rem;
                font-weight: 700;
                color: #fff;
                margin-bottom: 20px;
                text-align: center;
                text-transform: uppercase;
                border-bottom: 2px solid rgba(30, 144, 255, 0.3);
                padding-bottom: 10px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 8px;
                font-family: 'Orbitron', sans-serif;
            }
            
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 5px;
                background: rgba(0, 0, 0, 0.3);
                color: #fff;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group select:focus {
                outline: none;
                border-color: #1e90ff;
                box-shadow: 0 0 0 2px rgba(30, 144, 255, 0.2);
            }
            
            .players-section {
                margin-top: 25px;
            }
            
            .players-section h4 {
                font-size: 0.95rem;
                color: rgba(255, 255, 255, 0.9);
                margin-bottom: 15px;
                font-family: 'Orbitron', sans-serif;
            }
            
            .player-inputs {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }
            
            .player-inputs input {
                padding: 8px 10px;
                font-size: 0.85rem;
            }
            
            .team-setup-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 30px;
            }
            
            .setup-btn {
                padding: 12px 30px;
                border: none;
                border-radius: 5px;
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
            }
            
            .setup-btn-start {
                background: linear-gradient(135deg, #1e90ff, #4fa8ff);
                color: white;
                box-shadow: 0 4px 10px rgba(30, 144, 255, 0.3);
            }
            
            .setup-btn-start:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(30, 144, 255, 0.4);
                background: linear-gradient(135deg, #0066cc, #1e90ff);
            }
            
            .setup-btn-cancel {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .setup-btn-cancel:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
            }
            
            @media (max-width: 768px) {
                .team-setup-content {
                    width: 90%;
                    margin: 20px;
                }
                
                .team-setup-body {
                    padding: 20px;
                }
                
                .player-inputs {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Configurar eventos do modal de setup
    function setupSetupModalEvents(setupModal) {
        const closeBtn = document.getElementById('setupCloseBtn');
        const startBtn = document.getElementById('startGameSetup');
        const cancelBtn = document.getElementById('cancelSetup');
        
        // Fechar/cancelar setup
        const closeSetup = () => {
            setupModal.classList.remove('active');
            setTimeout(() => {
                setupModal.remove();
            }, 400);
        };
        
        closeBtn.addEventListener('click', closeSetup);
        cancelBtn.addEventListener('click', closeSetup);
        
        // Iniciar jogo com configurações personalizadas
        startBtn.addEventListener('click', () => {
            // Coletar dados do formulário
            const opponentName = document.getElementById('opponentName').value.trim() || 'Astralis';
            const opponentLogo = document.getElementById('opponentLogo').value.trim() || '../img/section-furia/csgo/australis.png';
            const mapName = document.getElementById('mapName').value || 'INFERNO';
            
            // Coletar jogadores do time adversário
            const opponentPlayers = [
                document.getElementById('player1').value.trim() || 'Player1',
                document.getElementById('player2').value.trim() || 'Player2',
                document.getElementById('player3').value.trim() || 'Player3',
                document.getElementById('player4').value.trim() || 'Player4',
                document.getElementById('player5').value.trim() || 'Player5'
            ];
            
            // Fechar modal de setup
            closeSetup();
            
            // Criar simulação com dados personalizados
            createGameSimulation({
                opponentName,
                opponentLogo,
                opponentPlayers,
                mapName
            });
        });
    }
    
    // Função para criar o modal de simulação de jogo
    function createGameSimulation(customData = null) {
        // Usar dados padrão se não houver customização
        const gameData = customData || {
            opponentName: 'ASTRALIS',
            opponentLogo: '../img/section-furia/csgo/australis.png',
            opponentPlayers: ['blameF', 'Xyp9x', 'device', 'gla1ve', 'Magisk'],
            mapName: 'INFERNO'
        };
        
        // Criar o container do modal
        const gameModal = document.createElement('div');
        gameModal.className = 'game-simulation-modal';
        
        // Conteúdo do modal
        gameModal.innerHTML = `
            <div class="game-simulation-content">
                <div class="game-simulation-header">
                    <div class="game-teams">
                        <div class="team team-furia">
                            <img src="../img/section-furia/csgo/furiia.png" alt="FURIA" class="team-logo">
                            <span class="team-name">FURIA</span>
                            <span class="team-score" id="furiaScore">0</span>
                        </div>
                        <div class="match-info">
                            <div class="match-map">${gameData.mapName}</div>
                            <div class="match-round">ROUND <span id="currentRound">1</span>/30</div>
                        </div>
                        <div class="team team-opponent">
                            <span class="team-score" id="opponentScore">0</span>
                            <span class="team-name">${gameData.opponentName.toUpperCase()}</span>
                            <img src="${gameData.opponentLogo}" alt="${gameData.opponentName}" class="team-logo">
                        </div>
                    </div>
                    <div class="header-buttons">
                        <button class="game-fullscreen-btn" id="fullscreenBtn">
                            <i class="fas fa-expand"></i>
                        </button>
                        <button class="game-close-btn" id="closeGameBtn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="game-simulation-body">
                    <div class="game-map">
                        <div class="map-container">
                            <div class="player-markers" id="playerMarkers"></div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <button class="control-btn" id="startGameBtn">INICIAR JOGO</button>
                        <button class="control-btn" id="pauseGameBtn" disabled>PAUSAR</button>
                        <button class="control-btn" id="nextRoundBtn" disabled>PRÓXIMO ROUND</button>
                    </div>
                    <div class="game-feed" id="gameFeed">
                        <div class="feed-title">FEED DE JOGO</div>
                        <div class="feed-content" id="feedContent">
                            <div class="feed-item">Bem-vindo à transmissão de FURIA vs ${gameData.opponentName}!</div>
                            <div class="feed-item">Clique em INICIAR JOGO para começar a simulação.</div>
                        </div>
                    </div>
                </div>
                <div class="game-stats">
                    <div class="stats-tables">
                        <div class="stats-table furia-stats">
                            <div class="stats-header">FURIA</div>
                            <div class="player-stats-row header">
                                <div class="player-name">JOGADOR</div>
                                <div class="player-stat">K</div>
                                <div class="player-stat">D</div>
                                <div class="player-stat">A</div>
                                <div class="player-stat">ADR</div>
                            </div>
                            <div class="player-stats-row">
                                <div class="player-name">FalleN</div>
                                <div class="player-stat" id="fallen-k">0</div>
                                <div class="player-stat" id="fallen-d">0</div>
                                <div class="player-stat" id="fallen-a">0</div>
                                <div class="player-stat" id="fallen-adr">0</div>
                            </div>
                            <div class="player-stats-row">
                                <div class="player-name">KSCERATO</div>
                                <div class="player-stat" id="kscerato-k">0</div>
                                <div class="player-stat" id="kscerato-d">0</div>
                                <div class="player-stat" id="kscerato-a">0</div>
                                <div class="player-stat" id="kscerato-adr">0</div>
                            </div>
                            <div class="player-stats-row">
                                <div class="player-name">yuurih</div>
                                <div class="player-stat" id="yuurih-k">0</div>
                                <div class="player-stat" id="yuurih-d">0</div>
                                <div class="player-stat" id="yuurih-a">0</div>
                                <div class="player-stat" id="yuurih-adr">0</div>
                            </div>
                            <div class="player-stats-row">
                                <div class="player-name">molodoy</div>
                                <div class="player-stat" id="molodoy-k">0</div>
                                <div class="player-stat" id="molodoy-d">0</div>
                                <div class="player-stat" id="molodoy-a">0</div>
                                <div class="player-stat" id="molodoy-adr">0</div>
                            </div>
                            <div class="player-stats-row">
                                <div class="player-name">YEKINDAR</div>
                                <div class="player-stat" id="yekindar-k">0</div>
                                <div class="player-stat" id="yekindar-d">0</div>
                                <div class="player-stat" id="yekindar-a">0</div>
                                <div class="player-stat" id="yekindar-adr">0</div>
                            </div>
                        </div>
                        <div class="stats-table opponent-stats">
                            <div class="stats-header">${gameData.opponentName.toUpperCase()}</div>
                            <div class="player-stats-row header">
                                <div class="player-name">JOGADOR</div>
                                <div class="player-stat">K</div>
                                <div class="player-stat">D</div>
                                <div class="player-stat">A</div>
                                <div class="player-stat">ADR</div>
                            </div>
                            ${gameData.opponentPlayers.map(player => `
                                <div class="player-stats-row">
                                    <div class="player-name">${player}</div>
                                    <div class="player-stat" id="${player.toLowerCase()}-k">0</div>
                                    <div class="player-stat" id="${player.toLowerCase()}-d">0</div>
                                    <div class="player-stat" id="${player.toLowerCase()}-a">0</div>
                                    <div class="player-stat" id="${player.toLowerCase()}-adr">0</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar o modal ao corpo do documento
        document.body.appendChild(gameModal);
        
        // Adicionar estilo ao modal
        addGameSimulationStyles();
        
        // Configurar eventos
        setupGameEvents(gameData);
        
        // Mostrar o modal com animação
        setTimeout(() => {
            gameModal.classList.add('active');
        }, 10);
    }
    
    // Função para adicionar os estilos da simulação
    function addGameSimulationStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `



            .game-simulation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 1500;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.4s ease, visibility 0.4s ease;
                backdrop-filter: blur(5px);
            }
            
            .game-simulation-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .game-simulation-content {
                width: 85%;
                max-width: 1000px;
                height: 80vh;
                background: linear-gradient(135deg, #0a0a0a, #111);
                border-radius: 8px;
                box-shadow: 0 0 30px rgba(30, 144, 255, 0.3);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                border: 1px solid rgba(30, 144, 255, 0.3);
                transform: scale(0.95);
                transition: transform 0.3s ease;
            }
            
            .game-simulation-modal.fullscreen .game-simulation-content {
                width: 95%;
                max-width: none;
                height: 90vh;
            }
            
            .game-simulation-modal.active .game-simulation-content {
                transform: scale(1);
                height: 90vh;
            }
            
            .game-simulation-header {
                padding: 10px 15px;
                background: rgba(0, 0, 0, 0.4);
                border-bottom: 1px solid rgba(30, 144, 255, 0.3);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .game-teams {
                display: flex;
                align-items: center;
                gap: 15px;
                flex: 1;
            }
            
            .team {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .team-logo {
                width: 32px;
                height: 32px;
                object-fit: contain;
            }
            
            .team-name {
                font-family: 'Orbitron', sans-serif;
                font-size: 1rem;
                font-weight: 700;
                text-transform: uppercase;
            }
            
            .team-furia .team-name {
                color: #1e90ff;
            }
            
            .team-opponent .team-name {
                color: #ff3b5c;
            }
            
            .team-score {
                font-family: 'Orbitron', sans-serif;
                font-size: 1.5rem;
                font-weight: 700;
                min-width: 25px;
                text-align: center;
            }
            
            .match-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            
            .match-map {
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                font-weight: 700;
                color: #f0f0f0;
                background: rgba(255, 255, 255, 0.1);
                padding: 3px 10px;
                border-radius: 4px;
            }
            
            .match-round {
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .header-buttons {
                display: flex;
                gap: 8px;
            }
            
            .game-fullscreen-btn,
            .game-close-btn {
                width: 35px;
                height: 35px;
                background: rgba(255, 255, 255, 0.05);
                border: none;
                border-radius: 50%;
                color: #fff;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .game-fullscreen-btn:hover {
                background: #1e90ff;
                transform: scale(1.1);
            }
            
            .game-close-btn:hover {
                background: #ff3b5c;
                transform: rotate(90deg);
            }
            
            .game-simulation-body {
                display: grid;
                grid-template-columns: 1fr 280px;
                grid-template-rows: 1fr auto;
                gap: 15px;
                padding: 15px;
                flex: 1;
                overflow: hidden;
            }
            
            .game-map {
                grid-row: 1 / 2;
                grid-column: 1 / 2;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            
            .map-container {
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
            }
            
            .map-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                opacity: 0.9;
            }
            
            .player-markers {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            
            .player-marker {
                position: absolute;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.6rem;
                font-weight: bold;
                color: #000;
                transition: all 0.5s ease;
                z-index: 5;
                opacity: 1;
                border: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            .player-marker.dead {
                opacity: 0.3;
                filter: grayscale(100%);
            }
            
            .player-marker.furia {
                background: rgba(30, 144, 255, 0.9);
                border-color: #1e90ff;
            }
            
            .player-marker.opponent {
                background: rgba(255, 59, 92, 0.9);
                border-color: #ff3b5c;
            }
            
            .game-controls {
                grid-row: 2 / 3;
                grid-column: 1 / 2;
                display: flex;
                gap: 12px;
                justify-content: center;
                padding: 12px 0;
            }
            
            .control-btn {
                background: linear-gradient(135deg, #1e90ff, #4fa8ff);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-family: 'Orbitron', sans-serif;
                font-size: 0.85rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
            }
            
            .control-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 12px rgba(0, 0, 0, 0.3);
                background: linear-gradient(135deg, #0066cc, #1e90ff);
            }
            
            .control-btn:disabled {
                background: #333;
                cursor: not-allowed;
                opacity: 0.7;
            }
            
            .game-feed {
                grid-row: 1 / 3;
                grid-column: 2 / 3;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .feed-title {
                padding: 8px 12px;
                background: rgba(30, 144, 255, 0.3);
                font-family: 'Orbitron', sans-serif;
                font-size: 0.8rem;
                font-weight: 700;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .feed-content {
                flex: 1;
                padding: 12px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 8px;
                justify-content: flex-start;
                max-height: calc(100% - 40px);
                scrollbar-width: thin;
                scrollbar-color: rgba(30, 144, 255, 0.5) rgba(0, 0, 0, 0.2);
            }
            
            .feed-content::-webkit-scrollbar {
                width: 6px;
            }
            
            .feed-content::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 3px;
            }
            
            .feed-content::-webkit-scrollbar-thumb {
                background: rgba(30, 144, 255, 0.5);
                border-radius: 3px;
            }
            
            .feed-item {
                padding: 6px 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
                font-size: 0.75rem;
                line-height: 1.4;
                border-left: 2px solid rgba(30, 144, 255, 0.5);
            }
            
            .feed-item.kill {
                border-left-color: #ff3b5c;
            }
            
            .feed-item.round {
                border-left-color: #00cc66;
                background: rgba(0, 204, 102, 0.1);
            }
            
            .feed-item.headshot {
                border-left-color: #ff8800;
            }
            
            .feed-item.clutch {
                border-left-color: #9900cc;
                background: rgba(153, 0, 204, 0.1);
            }
            
            .feed-item.elimination {
                border-left-color: #ffcc00;
                background: rgba(255, 204, 0, 0.1);
                font-weight: bold;
            }
            
            .game-stats {
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid rgba(30, 144, 255, 0.3);
                overflow-y: auto;
            }
            
            .stats-title {
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                font-weight: 700;
                margin-bottom: 12px;
                text-align: center;
            }
            
            .stats-tables {
                display: flex;
                gap: 15px;
            }
            
            .stats-table {
                flex: 1;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                overflow: hidden;
                font-size: 0.75rem;
            }
            
            .stats-header {
                padding: 6px 8px;
                font-family: 'Orbitron', sans-serif;
                font-weight: 700;
                font-size: 0.8rem;
                text-align: center;
            }
            
            .furia-stats .stats-header {
                background: rgba(30, 144, 255, 0.3);
            }
            
            .opponent-stats .stats-header {
                background: rgba(255, 59, 92, 0.3);
            }
            
            .player-stats-row {
                display: flex;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .player-stats-row:last-child {
                border-bottom: none;
            }
            
            .player-stats-row.header {
                background: rgba(255, 255, 255, 0.05);
                font-weight: 700;
            }
            
            .player-name {
                flex: 1;
                font-size: 11px;
                padding: 6px 8px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            
            .player-stat {
                width: 35px;
                padding: 6px 4px;
                text-align: center;
                border-left: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            @media (max-width: 992px) {
                .game-simulation-content {
                    width: 90%;
                    height: 80vh;
                }
                
                .game-simulation-body {
                    grid-template-columns: 1fr;
                    grid-template-rows: 1fr auto auto;
                }
                
                .game-feed {
                    grid-row: 3 / 4;
                    grid-column: 1 / 2;
                    height: 150px;
                }
                
                .stats-tables {
                    flex-direction: column;
                }
                
                .game-stats {
                    max-height: 250px;
                }
            }
            
            @keyframes flashKill {
                0% { background-color: rgba(255, 59, 92, 0.5); }
                100% { background-color: transparent; }
            }
            
            .flash-kill {
                animation: flashKill 1s ease;
            }




            .game-simulation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 1500;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.4s ease, visibility 0.4s ease;
                backdrop-filter: blur(5px);
            }
            
            .game-simulation-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .game-simulation-content {
                width: 85%;
                max-width: 1000px;
                height: 75vh;
                background: linear-gradient(135deg, #0a0a0a, #111);
                border-radius: 8px;
                box-shadow: 0 0 30px rgba(30, 144, 255, 0.3);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                border: 1px solid rgba(30, 144, 255, 0.3);
                transform: scale(0.95);
                transition: transform 0.3s ease;
            }
            
            .game-simulation-modal.fullscreen .game-simulation-content {
                width: 95%;
                max-width: none;
                height: 90vh;
            }
            
            .game-simulation-modal.active .game-simulation-content {
                transform: scale(1);
            }
            
            .game-simulation-header {
                padding: 10px 15px;
                background: rgba(0, 0, 0, 0.4);
                border-bottom: 1px solid rgba(30, 144, 255, 0.3);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .game-teams {
                display: flex;
                align-items: center;
                gap: 15px;
                flex: 1;
            }
            
            .team {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .team-logo {
                width: 32px;
                height: 32px;
                object-fit: contain;
            }
            
            .team-name {
                font-family: 'Orbitron', sans-serif;
                font-size: 1rem;
                font-weight: 700;
                text-transform: uppercase;
            }
            
            .team-furia .team-name {
                color: #1e90ff;
            }
            
            .team-opponent .team-name {
                color: #ff3b5c;
            }
            
            .team-score {
                font-family: 'Orbitron', sans-serif;
                font-size: 1.5rem;
                font-weight: 700;
                min-width: 25px;
                text-align: center;
            }
            
            .match-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            
            .match-map {
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                font-weight: 700;
                color: #f0f0f0;
                background: rgba(255, 255, 255, 0.1);
                padding: 3px 10px;
                border-radius: 4px;
            }
            
            .match-round {
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .header-buttons {
                display: flex;
                gap: 8px;
            }
            
            .game-fullscreen-btn,
            .game-close-btn {
                width: 35px;
                height: 35px;
                background: rgba(255, 255, 255, 0.05);
                border: none;
                border-radius: 50%;
                color: #fff;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .game-fullscreen-btn:hover {
                background: #1e90ff;
                transform: scale(1.1);
            }
            
            .game-close-btn:hover {
                background: #ff3b5c;
                transform: rotate(90deg);
            }
            
            .game-simulation-body {
                display: grid;
                grid-template-columns: 1fr 280px;
                grid-template-rows: 1fr auto;
                gap: 15px;
                padding: 15px;
                flex: 1;
                overflow: hidden;
            }
            
            .game-map {
                grid-row: 1 / 2;
                grid-column: 1 / 2;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            
            .map-container {
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
            }
            
            .map-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                opacity: 0.9;
            }
            
            .player-markers {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            
            .player-marker {
                position: absolute;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.6rem;
                font-weight: bold;
                color: #000;
                transition: all 0.5s ease;
                z-index: 5;
                opacity: 1;
                border: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            .player-marker.dead {
                opacity: 0.3;
                filter: grayscale(100%);
            }
            
            .player-marker.furia {
                background: rgba(30, 144, 255, 0.9);
                border-color: #1e90ff;
            }
            
            .player-marker.opponent {
                background: rgba(255, 59, 92, 0.9);
                border-color: #ff3b5c;
            }
            
            .game-controls {
                grid-row: 2 / 3;
                grid-column: 1 / 2;
                display: flex;
                gap: 12px;
                justify-content: center;
                padding: 12px 0;
            }
            
            .control-btn {
                background: linear-gradient(135deg, #1e90ff, #4fa8ff);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-family: 'Orbitron', sans-serif;
                font-size: 0.85rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
            }
            
            .control-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 12px rgba(0, 0, 0, 0.3);
                background: linear-gradient(135deg, #0066cc, #1e90ff);
            }
            
            .control-btn:disabled {
                background: #333;
                cursor: not-allowed;
                opacity: 0.7;
            }
            
            .game-feed {
                grid-row: 1 / 3;
                grid-column: 2 / 3;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .feed-title {
                padding: 8px 12px;
                background: rgba(30, 144, 255, 0.3);
                font-family: 'Orbitron', sans-serif;
                font-size: 0.8rem;
                font-weight: 700;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .feed-content {
                flex: 1;
                padding: 12px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 8px;
                justify-content: flex-start;
                max-height: calc(100% - 40px);
                scrollbar-width: thin;
                scrollbar-color: rgba(30, 144, 255, 0.5) rgba(0, 0, 0, 0.2);
            }
            
            .feed-content::-webkit-scrollbar {
                width: 6px;
            }
            
            .feed-content::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 3px;
            }
            
            .feed-content::-webkit-scrollbar-thumb {
                background: rgba(30, 144, 255, 0.5);
                border-radius: 3px;
            }
            
            .feed-item {
                padding: 6px 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
                font-size: 0.75rem;
                line-height: 1.4;
                border-left: 2px solid rgba(30, 144, 255, 0.5);
            }
            
            .feed-item.kill {
                border-left-color: #ff3b5c;
            }
            
            .feed-item.round {
                border-left-color: #00cc66;
                background: rgba(0, 204, 102, 0.1);
            }
            
            .feed-item.headshot {
                border-left-color: #ff8800;
            }
            
            .feed-item.clutch {
                border-left-color: #9900cc;
                background: rgba(153, 0, 204, 0.1);
            }
            
            .feed-item.elimination {
                border-left-color: #ffcc00;
                background: rgba(255, 204, 0, 0.1);
                font-weight: bold;
            }
            
            .game-stats {
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid rgba(30, 144, 255, 0.3);
                overflow-y: auto;
            }
            
            .stats-title {
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                font-weight: 700;
                margin-bottom: 12px;
                text-align: center;
            }
            
            .stats-tables {
                display: flex;
                gap: 15px;
            }
            
            .stats-table {
                flex: 1;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                overflow: hidden;
                font-size: 0.75rem;
            }
            
            .stats-header {
                padding: 6px 8px;
                font-family: 'Orbitron', sans-serif;
                font-weight: 700;
                font-size: 0.8rem;
                text-align: center;
            }
            
            .furia-stats .stats-header {
                background: rgba(30, 144, 255, 0.3);
            }
            
            .opponent-stats .stats-header {
                background: rgba(255, 59, 92, 0.3);
            }
            
            .player-stats-row {
                display: flex;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .player-stats-row:last-child {
                border-bottom: none;
            }
            
            .player-stats-row.header {
                background: rgba(255, 255, 255, 0.05);
                font-weight: 700;
            }
            
            .player-name {
                flex: 1;
                padding: 6px 8px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            
            .player-stat {
                width: 35px;
                padding: 6px 4px;
                text-align: center;
                border-left: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            @media (max-width: 992px) {
                .game-simulation-content {
                    width: 90%;
                    height: 80vh;
                }
                
                .game-simulation-body {
                    grid-template-columns: 1fr;
                    grid-template-rows: 1fr auto auto;
                }
                
                .game-feed {
                    grid-row: 3 / 4;
                    grid-column: 1 / 2;
                    height: 150px;
                }
                
                .stats-tables {
                    flex-direction: column;
                }
                
                .game-stats {
                    max-height: 250px;
                }
            }
            
            @keyframes flashKill {
                0% { background-color: rgba(255, 59, 92, 0.5); }
                100% { background-color: transparent; }
            }
            
            .flash-kill {
                animation: flashKill 1s ease;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Configurar os eventos do jogo
    function setupGameEvents(gameData) {
        // Botões
        const closeBtn = document.getElementById('closeGameBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const startBtn = document.getElementById('startGameBtn');
        const pauseBtn = document.getElementById('pauseGameBtn');
        const nextRoundBtn = document.getElementById('nextRoundBtn');
        
        // Elementos do jogo
        const gameModal = document.querySelector('.game-simulation-modal');
        const feedContent = document.getElementById('feedContent');
        const currentRoundEl = document.getElementById('currentRound');
        const furiaScoreEl = document.getElementById('furiaScore');
        const opponentScoreEl = document.getElementById('opponentScore');
        const playerMarkers = document.getElementById('playerMarkers');
        
        // Dados do jogo
        let gameRunning = false;
        let gameInterval;
        let currentRound = 1;
        let furiaScore = 0;
        let opponentScore = 0;
        let roundTime = 0;
        let roundInProgress = false;
        
        // Jogadores da FURIA (fixos)
        const furiaPlayers = ['FalleN', 'KSCERATO', 'yuurih', 'molodoy', 'YEKINDAR'];
        
        // Jogadores do time adversário (customizáveis)
        const opponentPlayers = gameData.opponentPlayers;
        
        // Status dos jogadores no round atual (vivos/mortos)
        let playersAlive = {
            furia: [...furiaPlayers],
            opponent: [...opponentPlayers]
        };
        
        // Estatísticas dos jogadores
        const playerStats = {};
        
        // Inicializar estatísticas
        furiaPlayers.forEach(player => {
            const id = player.toLowerCase();
            playerStats[id] = { kills: 0, deaths: 0, assists: 0, adr: 0 };
        });
        
        opponentPlayers.forEach(player => {
            const id = player.toLowerCase();
            playerStats[id] = { kills: 0, deaths: 0, assists: 0, adr: 0 };
        });
        
        // Fullscreen toggle
        fullscreenBtn.addEventListener('click', () => {
            gameModal.classList.toggle('fullscreen');
            const icon = fullscreenBtn.querySelector('i');
            if (gameModal.classList.contains('fullscreen')) {
                icon.className = 'fas fa-compress';
            } else {
                icon.className = 'fas fa-expand';
            }
        });
        
        // Fechar o modal
        closeBtn.addEventListener('click', () => {
            // Parar o jogo se estiver rodando
            if (gameInterval) {
                clearInterval(gameInterval);
            }
            
            // Remover o modal com animação
            gameModal.classList.remove('active');
            setTimeout(() => {
                gameModal.remove();
            }, 400);
        });
        
        // Iniciar o jogo
        startBtn.addEventListener('click', () => {
            startGame();
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            nextRoundBtn.disabled = false;
        });
        
        // Pausar o jogo
        pauseBtn.addEventListener('click', () => {
            if (gameRunning) {
                clearInterval(gameInterval);
                gameRunning = false;
                pauseBtn.textContent = 'CONTINUAR';
                addFeedItem('Jogo pausado', 'info');
            } else {
                startGame();
                pauseBtn.textContent = 'PAUSAR';
                addFeedItem('Jogo continuado', 'info');
            }
        });
        
        // Próximo round
        nextRoundBtn.addEventListener('click', () => {
            if (gameRunning) {
                clearInterval(gameInterval);
                gameRunning = false;
            }
            
            if (currentRound < 30) {
                currentRound++;
                currentRoundEl.textContent = currentRound;
                
                // Finalizar round atual se estiver em progresso
                if (roundInProgress) {
                    roundInProgress = false;
                }
                
                // Iniciar novo round
                startNewRound();
                
                // Sempre iniciar o jogo novamente com os intervalos corretos
                pauseBtn.textContent = 'PAUSAR';
                startGame();
            } else {
                addFeedItem('O jogo chegou ao fim!', 'round');
                endGame();
            }
        });
        
        // Função para iniciar o jogo
        function startGame() {
            if (!gameRunning) {
                gameRunning = true;
                
                // Iniciar o primeiro round se ainda não começou
                if (currentRound === 1 && !roundInProgress) {
                    startNewRound();
                }
                
                // Intervalo principal do jogo
                gameInterval = setInterval(() => {
                    if (roundInProgress) {
                        simulateRoundAction();
                        roundTime++;
                        
                        // Verificar apenas se o tempo acabou (não verificar eliminação aqui)
                        if (roundTime >= 20) {
                            endRound();
                        }
                    }
                }, 1500); // Cada "tick" representa ~4-5 segundos do jogo real
            }
        }
        
        // Iniciar um novo round
        function startNewRound() {
            roundInProgress = true;
            roundTime = 0;
            
            // Resetar jogadores vivos
            playersAlive = {
                furia: [...furiaPlayers],
                opponent: [...opponentPlayers]
            };
            
            // Criar feed do início do round
            addFeedItem(`Round ${currentRound} iniciado!`, 'round');
            
            // Resetar marcadores visuais
            document.querySelectorAll('.player-marker').forEach(marker => {
                marker.classList.remove('dead');
            });
            
            // Posicionar jogadores no mapa
            positionPlayers();
        }
        
        // Finalizar um round
        function endRound() {
            // Verificar se o round já foi finalizado para evitar dupla contagem
            if (!roundInProgress) {
                return;
            }
            
            roundInProgress = false;
            
            // Determinar vencedor do round
            let furiaWins;
            
            if (playersAlive.furia.length === 0) {
                // Adversário eliminou todos da FURIA
                furiaWins = false;
                addFeedItem(`💀 ${gameData.opponentName} elimina todos da FURIA!`, 'elimination');
            } else if (playersAlive.opponent.length === 0) {
                // FURIA eliminou todos do adversário
                furiaWins = true;
                addFeedItem(`💀 FURIA elimina todos do ${gameData.opponentName}!`, 'elimination');
            } else {
                // Round acabou por tempo - usar lógica antiga (60% chance FURIA)
                furiaWins = Math.random() < 0.6;
                addFeedItem('⌛ Tempo esgotado!', 'info');
            }
            
            if (furiaWins) {
                furiaScore++;
                furiaScoreEl.textContent = furiaScore;
                addFeedItem(`✅ FURIA vence o Round ${currentRound}! (${furiaScore}-${opponentScore})`, 'round');
                
                // Adicionar um highlight especial ocasionalmente
                if (Math.random() < 0.3) {
                    const player = furiaPlayers[Math.floor(Math.random() * furiaPlayers.length)];
                    addFeedItem(`🌟 Destaque: ${player} com uma jogada fenomenal!`, 'clutch');
                }
            } else {
                opponentScore++;
                opponentScoreEl.textContent = opponentScore;
                addFeedItem(`❌ ${gameData.opponentName} vence o Round ${currentRound}! (${furiaScore}-${opponentScore})`, 'round');
            }
            
            // Checar se o jogo terminou (16 rounds para vencer)
            if (furiaScore >= 16 || opponentScore >= 16 || currentRound >= 30) {
                clearInterval(gameInterval);
                gameRunning = false;
                endGame();
                return;
            }
            
            // Próximo round automaticamente
            currentRound++;
            currentRoundEl.textContent = currentRound;
            
            // Aguardar 3 segundos antes de começar o próximo round
            setTimeout(() => {
                startNewRound();
                // Reiniciar o interval se o jogo estiver pausado
                if (!gameRunning) {
                    startGame();
                }
            }, 3000);
        }
        
        // Finalizar o jogo
        function endGame() {
            clearInterval(gameInterval);
            gameRunning = false;
            roundInProgress = false;
            
            // Determinar vencedor
            if (furiaScore > opponentScore) {
                addFeedItem(`🏆 FURIA vence o jogo por ${furiaScore}-${opponentScore}!`, 'clutch');
                addFeedItem(`GG WP! FURIA é vitoriosa no mapa ${gameData.mapName}!`, 'clutch');
            } else if (opponentScore > furiaScore) {
                addFeedItem(`🏆 ${gameData.opponentName} vence o jogo por ${opponentScore}-${furiaScore}!`, 'round');
                addFeedItem(`GG WP! ${gameData.opponentName} leva a melhor desta vez.`, 'round');
            } else {
                addFeedItem(`🤝 Jogo termina empatado ${furiaScore}-${opponentScore}!`, 'info');
                addFeedItem(`GG WP! Um empate justo entre duas grandes equipes!`, 'info');
            }
            
            // Desabilitar botões
            pauseBtn.disabled = true;
            nextRoundBtn.disabled = true;
            startBtn.disabled = false;
            startBtn.textContent = 'NOVO JOGO';
            
            // Estatísticas finais
            addFeedItem(`📊 Estatísticas finais do jogo:`, 'info');
            
            // Mostrar MVP
            let mvp = '';
            let maxKills = 0;
            
            for (const player in playerStats) {
                if (playerStats[player].kills > maxKills) {
                    maxKills = playerStats[player].kills;
                    mvp = player;
                }
            }
            
            // Determinar se o MVP é da FURIA ou do adversário
            const mvpTeam = furiaPlayers.map(p => p.toLowerCase()).includes(mvp) ? 'FURIA' : gameData.opponentName;
            
            // Formatando o nome para exibição (primeira letra maiúscula)
            const mvpDisplay = mvp.charAt(0).toUpperCase() + mvp.slice(1);
            
            addFeedItem(`🌟 MVP do jogo: ${mvpDisplay} com ${maxKills} kills!`, 'clutch');
        }
        
        // Simular uma ação durante o round
        function simulateRoundAction() {
            // Verificar se ainda há jogadores vivos em ambos os times
            if (playersAlive.furia.length === 0 || playersAlive.opponent.length === 0) {
                return; // Round já acabou por eliminação
            }
            
            // 80% de chance de ser uma eliminação
            if (Math.random() < 0.8) {
                simulateKill();
            } else {
                // Outros eventos: troca de bombsite, uso de utility, etc.
                const actions = [
                    'Smoke no meio',
                    'Flash para entrada A',
                    'Molotov para limpar posição',
                    'Rotação para o bombsite B',
                    'Defesa do bombsite A',
                    'Planta da bomba',
                    'Defuse iniciado',
                    'Tentativa de retake'
                ];
                
                const action = actions[Math.floor(Math.random() * actions.length)];
                const team = Math.random() < 0.6 ? 'FURIA' : gameData.opponentName;
                
                addFeedItem(`${team}: ${action}`, 'info');
            }
        }
        
        // Simular uma eliminação
        function simulateKill() {
            // Verificar se ainda há jogadores vivos em ambos os times
            if (playersAlive.furia.length === 0 || playersAlive.opponent.length === 0) {
                return; // Round já acabou por eliminação
            }
            
            // Determinar times (60% de chance da FURIA conseguir a kill)
            const furiaKill = Math.random() < 0.6;
            
            // Selecionar jogadores
            let killer, victim, assister;
            
            if (furiaKill && playersAlive.furia.length > 0 && playersAlive.opponent.length > 0) {
                killer = playersAlive.furia[Math.floor(Math.random() * playersAlive.furia.length)];
                victim = playersAlive.opponent[Math.floor(Math.random() * playersAlive.opponent.length)];
                
                // Remover vítima do time adversário
                playersAlive.opponent = playersAlive.opponent.filter(p => p !== victim);
                
                // 30% de chance de assist
                if (Math.random() < 0.3 && playersAlive.furia.length > 1) {
                    const possibleAssisters = playersAlive.furia.filter(p => p !== killer);
                    if (possibleAssisters.length > 0) {
                        assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
                    }
                }
            } else if (!furiaKill && playersAlive.opponent.length > 0 && playersAlive.furia.length > 0) {
                killer = playersAlive.opponent[Math.floor(Math.random() * playersAlive.opponent.length)];
                victim = playersAlive.furia[Math.floor(Math.random() * playersAlive.furia.length)];
                
                // Remover vítima do time da FURIA
                playersAlive.furia = playersAlive.furia.filter(p => p !== victim);
                
                // 30% de chance de assist
                if (Math.random() < 0.3 && playersAlive.opponent.length > 1) {
                    const possibleAssisters = playersAlive.opponent.filter(p => p !== killer);
                    if (possibleAssisters.length > 0) {
                        assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
                    }
                }
            } else {
                return; // Não há jogadores para matar
            }
            
            // Determinar se é headshot (40% de chance)
            const isHeadshot = Math.random() < 0.4;
            
            // Determinar a arma usada
            const weapons = ['AK-47', 'M4A4', 'AWP', 'Desert Eagle', 'USP-S', 'Glock', 'SSG 08', 'Famas', 'Galil'];
            const weapon = weapons[Math.floor(Math.random() * weapons.length)];
            
            // Formatar e exibir a mensagem de kill
            let killMessage = `${killer} eliminou ${victim} com ${weapon}`;
            
            if (isHeadshot) {
                killMessage += ' (headshot)';
            }
            
            if (assister) {
                killMessage += ` (assist: ${assister})`;
            }
            
            // Adicionar ao feed com classe apropriada
            addFeedItem(killMessage, isHeadshot ? 'headshot' : 'kill');
            
            // Atualizar estatísticas
            updatePlayerStats(killer.toLowerCase(), victim.toLowerCase(), assister ? assister.toLowerCase() : null);
            
            // Marcar jogador como morto visualmente
            markPlayerAsDead(victim);
            
            // Verificar se algum time foi eliminado completamente
            if (playersAlive.furia.length === 0) {
                addFeedItem(`💀 FURIA foi eliminada completamente!`, 'elimination');
                clearInterval(gameInterval);
                gameRunning = false;
                setTimeout(() => endRound(), 1000);
            } else if (playersAlive.opponent.length === 0) {
                addFeedItem(`💀 ${gameData.opponentName} foi eliminado completamente!`, 'elimination');
                clearInterval(gameInterval);
                gameRunning = false;
                setTimeout(() => endRound(), 1000);
            } else {
                // Mostrar status do confronto apenas quando há poucos jogadores
                if (playersAlive.furia.length <= 2 || playersAlive.opponent.length <= 2) {
                    addFeedItem(`📈 Status: FURIA ${playersAlive.furia.length}v${playersAlive.opponent.length} ${gameData.opponentName}`, 'info');
                }
            }
        }
        
        // Marcar jogador como morto visualmente no mapa
        function markPlayerAsDead(playerName) {
            const markers = document.querySelectorAll('.player-marker');
            markers.forEach(marker => {
                if (marker.title === playerName) {
                    marker.classList.add('dead');
                }
            });
        }
        
        // Atualizar estatísticas dos jogadores
        function updatePlayerStats(killer, victim, assister) {
            // Incrementar kills para o matador
            playerStats[killer].kills++;
            
            // Atualizar o elemento HTML
            const killerElement = document.getElementById(`${killer}-k`);
            if (killerElement) {
                killerElement.textContent = playerStats[killer].kills;
                killerElement.classList.add('flash-kill');
                setTimeout(() => {
                    killerElement.classList.remove('flash-kill');
                }, 1000);
            }
            
            // Incrementar deaths para a vítima
            playerStats[victim].deaths++;
            const victimElement = document.getElementById(`${victim}-d`);
            if (victimElement) {
                victimElement.textContent = playerStats[victim].deaths;
            }
            
            // Incrementar assists para o assistente, se houver
            if (assister && playerStats[assister]) {
                playerStats[assister].assists++;
                const assisterElement = document.getElementById(`${assister}-a`);
                if (assisterElement) {
                    assisterElement.textContent = playerStats[assister].assists;
                }
            }
            
            // Atualizar ADR (dano médio por round)
            // Simulando valores de dano para manter realismo
            const damageDealt = 20 + Math.floor(Math.random() * 90); // 20-110 de dano
            const currentADR = playerStats[killer].adr;
            const totalRounds = currentRound;
            
            // Calcular novo ADR
            playerStats[killer].adr = Math.floor((currentADR * (totalRounds - 1) + damageDealt) / totalRounds);
            const adrElement = document.getElementById(`${killer}-adr`);
            if (adrElement) {
                adrElement.textContent = playerStats[killer].adr;
            }
        }
        
        // Adicionar item ao feed
        function addFeedItem(message, type = 'info') {
            const feedItem = document.createElement('div');
            feedItem.className = `feed-item ${type}`;
            feedItem.textContent = message;
            
            // Adicionar ao final do feed (mais recente no fundo)
            feedContent.appendChild(feedItem);
            
            // Limitar o número de itens no feed (máx 30)
            if (feedContent.children.length > 30) {
                feedContent.removeChild(feedContent.firstChild);
            }
            
            // Scroll para o fundo - mostrar sempre a mensagem mais recente
            feedContent.scrollTop = feedContent.scrollHeight;
        }
        
        // Posicionar jogadores no mapa
        function positionPlayers() {
            // Limpar marcadores anteriores
            playerMarkers.innerHTML = '';
            
            // Posições possíveis no mapa (coordenadas relativas em %)
            const mapPositions = [
                {x: 25, y: 20}, {x: 35, y: 40}, {x: 70, y: 30}, 
                {x: 50, y: 50}, {x: 80, y: 60}, {x: 40, y: 75},
                {x: 60, y: 15}, {x: 20, y: 60}, {x: 75, y: 80},
                {x: 15, y: 40}
            ];
            
            // Embaralhar posições
            const shuffledPositions = [...mapPositions].sort(() => Math.random() - 0.5);
            
            // Criar marcadores para jogadores da FURIA
            furiaPlayers.forEach((player, index) => {
                const pos = shuffledPositions[index];
                createPlayerMarker(player, pos.x, pos.y, 'furia');
            });
            
            // Criar marcadores para jogadores do adversário
            opponentPlayers.forEach((player, index) => {
                const pos = shuffledPositions[index + 5]; // Usar posições diferentes
                createPlayerMarker(player, pos.x, pos.y, 'opponent');
            });
        }
        
        // Criar um marcador de jogador no mapa
        function createPlayerMarker(player, x, y, team) {
            const marker = document.createElement('div');
            marker.className = `player-marker ${team}`;
            marker.textContent = player.charAt(0); // Primeira letra do nome
            marker.style.left = `${x}%`;
            marker.style.top = `${y}%`;
            marker.title = player;
            
            playerMarkers.appendChild(marker);
            
            // Animar movimentos ocasionalmente (apenas se o jogador estiver vivo)
            setInterval(() => {
                if (roundInProgress && !marker.classList.contains('dead') && Math.random() < 0.3) {
                    const newX = Math.max(10, Math.min(90, x + (Math.random() * 20 - 10)));
                    const newY = Math.max(10, Math.min(90, y + (Math.random() * 20 - 10)));
                    
                    marker.style.left = `${newX}%`;
                    marker.style.top = `${newY}%`;
                    
                    x = newX;
                    y = newY;
                }
            }, 5000);
        }
    }
});

// Função para mostrar aviso sobre configuração de times
function showConfigurationNotice() {
    // Criar o modal de aviso
    const noticeModal = document.createElement('div');
    noticeModal.className = 'config-notice-modal';
    
    noticeModal.innerHTML = `
        <div class="config-notice-content">
            <div class="config-notice-header">
                <h2>CONFIGURAÇÃO DE TIMES</h2>
                <button class="notice-close-btn" id="noticeCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="config-notice-body">
                <div class="notice-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="notice-message">
                    <p class="notice-title">Equipe Adversária Padrão Carregada</p>
                    <p class="notice-description">
                        O sistema carregou automaticamente o time <strong>Astralis</strong> como adversário padrão, 
                        com seus jogadores clássicos: <em>blameF, Xyp9x, device, gla1ve e Magisk</em>.
                    </p>
                    <p class="notice-tip">
                        <i class="fas fa-lightbulb"></i> 
                        Você pode editar facilmente o nome do time, logo e jogadores para personalizar 
                        o seu confronto da forma que desejar!
                    </p>
                </div>
                <div class="notice-actions">
                    <button class="notice-btn notice-btn-understand" id="understandBtn">ENTENDI</button>
                    <button class="notice-btn notice-btn-config" id="configNowBtn">IR PARA CONFIGURAÇÃO</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(noticeModal);
    
    // Adicionar estilos do modal de aviso
    addNoticeModalStyles();
    
    // Configurar eventos
    setupNoticeEvents(noticeModal);
    
    // Mostrar modal com animação
    setTimeout(() => {
        noticeModal.classList.add('active');
    }, 10);
}

// Adicionar estilos para o modal de aviso
function addNoticeModalStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .config-notice-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 1700;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease, visibility 0.4s ease;
            backdrop-filter: blur(8px);
        }
        
        .config-notice-modal.active {
            opacity: 1;
            visibility: visible;
        }
        
        .config-notice-content {
            width: 600px;
            max-width: 90%;
            background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
            border-radius: 12px;
            box-shadow: 0 0 50px rgba(30, 144, 255, 0.4);
            overflow: hidden;
            border: 2px solid rgba(30, 144, 255, 0.3);
            transform: scale(0.95) translateY(20px);
            transition: transform 0.3s ease;
        }
        
        .config-notice-modal.active .config-notice-content {
            transform: scale(1) translateY(0);
        }
        
        .config-notice-header {
            padding: 20px;
            background: linear-gradient(135deg, rgba(30, 144, 255, 0.15), rgba(0, 150, 255, 0.15));
            border-bottom: 1px solid rgba(30, 144, 255, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .config-notice-header h2 {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.3rem;
            font-weight: 700;
            color: #1e90ff;
            margin: 0;
            text-transform: uppercase;
        }
        
        .notice-close-btn {
            width: 35px;
            height: 35px;
            background: rgba(255, 255, 255, 0.05);
            border: none;
            border-radius: 50%;
            color: #fff;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notice-close-btn:hover {
            background: #ff3b5c;
            transform: rotate(90deg);
        }
        
        .config-notice-body {
            padding: 30px;
            text-align: center;
        }
        
        .notice-icon {
            font-size: 3rem;
            color: #1e90ff;
            margin-bottom: 20px;
        }
        
        .notice-message {
            margin-bottom: 30px;
        }
        
        .notice-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.2rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 15px;
        }
        
        .notice-description {
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.6;
            font-size: 1rem;
            margin-bottom: 20px;
        }
        
        .notice-description strong {
            color: #1e90ff;
            font-weight: 700;
        }
        
        .notice-description em {
            color: rgba(255, 255, 255, 0.9);
        }
        
        .notice-tip {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.95rem;
            background: rgba(30, 144, 255, 0.05);
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid rgba(30, 144, 255, 0.1);
        }
        
        .notice-tip i.fa-lightbulb {
            color: #ffcc00;
            font-size: 1.1rem;
        }
        
        .notice-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .notice-btn {
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
        }
        
        .notice-btn-understand {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .notice-btn-understand:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        
        .notice-btn-config {
            background: linear-gradient(135deg, #1e90ff, #4fa8ff);
            color: white;
            box-shadow: 0 4px 12px rgba(30, 144, 255, 0.3);
        }
        
        .notice-btn-config:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(30, 144, 255, 0.4);
            background: linear-gradient(135deg, #0066cc, #1e90ff);
        }
        
        @media (max-width: 768px) {
            .config-notice-content {
                width: 95%;
                margin: 20px;
            }
            
            .config-notice-body {
                padding: 20px;
            }
            
            .notice-actions {
                flex-direction: column;
            }
            
            .notice-btn {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Configurar eventos do modal de aviso
function setupNoticeEvents(noticeModal) {
    const closeBtn = document.getElementById('noticeCloseBtn');
    const understandBtn = document.getElementById('understandBtn');
    const configNowBtn = document.getElementById('configNowBtn');
    
    // Função para fechar o modal
    const closeNotice = () => {
        noticeModal.classList.remove('active');
        setTimeout(() => {
            noticeModal.remove();
        }, 400);
    };
    
    // Eventos de botões
    closeBtn.addEventListener('click', closeNotice);
    
    understandBtn.addEventListener('click', () => {
        closeNotice();
        // Aqui você abriria o modal de configuração normalmente
        createTeamSetupModal();
    });
    
    configNowBtn.addEventListener('click', () => {
        closeNotice();
        // Aqui você abriria o modal de configuração normalmente
        createTeamSetupModal();
    });
    
    // Fechar ao clicar fora do modal
    noticeModal.addEventListener('click', (e) => {
        if (e.target === noticeModal) {
            closeNotice();
        }
    });
}

// ------ Integração com o código existente ------

// Para integrar com seu código atual, modifique o event listener do botão "Assistir":
const watchBtn = document.querySelector('.watch-btn');

if (watchBtn) {
    watchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Primeiro, mostrar o aviso sobre a configuração
        showConfigurationNotice();
        // O modal de configuração será aberto depois do usuário clicar nos botões
    });
}