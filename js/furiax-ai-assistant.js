const STORAGE_KEYS = {
    CHAT_HISTORY: 'furiax_chat_history',
    USER_ENGAGEMENT: 'furiax_user_engagement'
};

const AI_CONFIG = {
    NAME: 'FURIA Intelligence',
    DEFAULT_GREETING: 'Olá! Eu sou a IA da FURIA. Como posso ajudar você hoje?',
    TYPING_SPEED: 50,
    MAX_HISTORY: 50,
    PERSONALITIES: {
        DEFAULT: 'assistant',
        ART: 'art',
        KSCERATO: 'kscerato',
        COACH: 'coach'
    },
    CURRENT_PERSONALITY: 'assistant'
};

let chatState = {
    isOpen: false,
    isTyping: false,
    history: [],
    typingTimeout: null,
    activePersonality: AI_CONFIG.PERSONALITIES.DEFAULT
};

document.addEventListener('DOMContentLoaded', () => {
    initAIAssistant();
    createParticles();
    setupEventListeners();
});

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const numParticles = 20;
    
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 15 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        const duration = Math.random() * 20 + 10;
        particle.style.animationDuration = `${duration}s`;
        
        const delay = Math.random() * 10;
        particle.style.animationDelay = `${delay}s`;
        
        const opacity = Math.random() * 0.4 + 0.1;
        particle.style.opacity = opacity;
        
        particlesContainer.appendChild(particle);
    }
}

function setupEventListeners() {
    const mainChatBtn = document.getElementById('mainChatBtn');
    if (mainChatBtn) {
        mainChatBtn.addEventListener('click', () => {
            const chatModal = document.getElementById('aiChatModal');
            if (chatModal) {
                chatModal.classList.add('active');
                chatState.isOpen = true;
                updateChatUI();
                
                setTimeout(() => {
                    const input = document.getElementById('aiInput');
                    if (input) input.focus();
                }, 300);
            }
        });
    }
    
    const badges = document.querySelectorAll('.furia-badge');
    badges.forEach(badge => {
        badge.addEventListener('click', () => {
            const personality = badge.dataset.personality;
            if (personality) {
                chatState.activePersonality = personality;
                
                const chatModal = document.getElementById('aiChatModal');
                if (chatModal) {
                    chatModal.classList.add('active');
                    chatState.isOpen = true;
                    
                    let personalityName;
                    switch(personality) {
                        case 'art': personalityName = 'arT (Capitão)'; break;
                        case 'kscerato': personalityName = 'KSCERATO'; break;
                        case 'coach': personalityName = 'Coach FURIA'; break;
                        default: personalityName = 'Assistente FURIA';
                    }
                    
                    chatState.history = [];
                    
                    addSystemMessage(`Você está conversando com: ${personalityName}`);
                    
                    const greeting = getPersonalityGreeting(personality);
                    addBotMessage(greeting, personality);
                    
                    updateChatUI();
                    
                    setTimeout(() => {
                        const input = document.getElementById('aiInput');
                        if (input) input.focus();
                    }, 300);
                }
            }
        });
    });
}

function initAIAssistant() {
    chatState.history = getFromStorage(STORAGE_KEYS.CHAT_HISTORY, [
        {
            isBot: true,
            message: AI_CONFIG.DEFAULT_GREETING,
            timestamp: Date.now(),
            personality: AI_CONFIG.PERSONALITIES.DEFAULT
        }
    ]);
    
    setupAIChatEventListeners();
}

function setupAIChatEventListeners() {
    const chatTrigger = document.getElementById('aiChatTrigger');
    const chatModal = document.getElementById('aiChatModal');
    const chatClose = document.getElementById('aiChatClose');
    const chatInput = document.getElementById('aiInput');
    const sendButton = document.getElementById('aiSendBtn');
    
    if (chatTrigger && chatModal) {
        chatTrigger.addEventListener('click', () => {
            chatModal.classList.add('active');
            chatState.isOpen = true;
            
            updateChatUI();
            
            setTimeout(() => {
                if (chatInput) chatInput.focus();
            }, 300);
        });
    }
    
    if (chatClose && chatModal) {
        chatClose.addEventListener('click', () => {
            chatModal.classList.remove('active');
            chatState.isOpen = false;
        });
    }
    
    if (chatInput && sendButton) {
        sendButton.addEventListener('click', () => {
            sendChatMessage();
        });
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
    
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const input = document.getElementById('aiInput');
            if (input) {
                input.value = chip.textContent.trim();
                input.focus();
            }
        });
        
        chip.addEventListener('mouseover', () => {
            chip.style.transform = 'translateY(-2px)';
            chip.style.boxShadow = '0 2px 5px rgba(30, 144, 255, 0.2)';
        });
        
        chip.addEventListener('mouseout', () => {
            chip.style.transform = 'translateY(0)';
            chip.style.boxShadow = 'none';
        });
    });
}

function getPersonalityGreeting(personality) {
    switch(personality) {
        case 'art':
            return "Fala aí! arT na área. Capitão da FURIA pronto pra trocar ideia. Pode perguntar sobre CS, táticas ou qualquer coisa do nosso time! 🔫";
        case 'kscerato':
            return "Olá! Aqui é o KSCERATO. Estou disponível para responder suas perguntas sobre a FURIA e conversar sobre CS. Como posso ajudar?";
        case 'coach':
            return "Boa! Aqui é o Coach da FURIA. Vamos falar sobre estratégias, preparação e como levamos nosso time ao próximo nível? Estou aqui para compartilhar conhecimento.";
        default:
            return AI_CONFIG.DEFAULT_GREETING;
    }
}

function sendChatMessage() {
    const input = document.getElementById('aiInput');
    if (!input) return;
    
    const messageText = input.value.trim();
    
    if (!messageText || chatState.isTyping) return;
    
    addUserMessage(messageText);
    
    input.value = '';
    
    simulateBotResponse(messageText);
    
    saveToStorage(STORAGE_KEYS.CHAT_HISTORY, chatState.history);
    
    updateChatUI();
}

function addUserMessage(message) {
    chatState.history.push({
        isBot: false,
        message: message,
        timestamp: Date.now()
    });
    
    if (chatState.history.length > AI_CONFIG.MAX_HISTORY) {
        chatState.history.shift();
    }
}

function addBotMessage(message, personality = null) {
    const activePers = personality || chatState.activePersonality;
    
    chatState.history.push({
        isBot: true,
        message: message,
        timestamp: Date.now(),
        personality: activePers
    });
    
    if (chatState.history.length > AI_CONFIG.MAX_HISTORY) {
        chatState.history.shift();
    }
}

function addSystemMessage(message) {
    chatState.history.push({
        isBot: true,
        isSystem: true,
        message: message,
        timestamp: Date.now()
    });
    
    if (chatState.history.length > AI_CONFIG.MAX_HISTORY) {
        chatState.history.shift();
    }
}

function simulateBotResponse(userMessage) {
    showTypingIndicator();
    
    const response = generateBotResponse(userMessage, chatState.activePersonality);
    
    const typingTime = Math.min(3000, Math.max(800, response.length / AI_CONFIG.TYPING_SPEED * 1000));
    
    chatState.typingTimeout = setTimeout(() => {
        hideTypingIndicator();
        addBotMessage(response, chatState.activePersonality);
        updateChatUI();
        
        saveToStorage(STORAGE_KEYS.CHAT_HISTORY, chatState.history);
        
        scrollToBottom();
        
        updateUserEngagement('chat_message', 1);
    }, typingTime);
}

function showTypingIndicator() {
    chatState.isTyping = true;
    
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;
    
    if (messagesContainer.querySelector('.typing-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    
    messagesContainer.appendChild(indicator);
    
    scrollToBottom();
}

function hideTypingIndicator() {
    chatState.isTyping = false;
    
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function updateChatUI() {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    chatState.history.forEach(message => {
        if (message.isSystem) {
            const systemElement = document.createElement('div');
            systemElement.className = 'system-message';
            systemElement.textContent = message.message;
            messagesContainer.appendChild(systemElement);
        } else {
            const messageElement = document.createElement('div');
            messageElement.className = `ai-message ${message.isBot ? 'incoming' : 'outgoing'}`;
            
            if (message.isBot && message.personality && message.personality !== 'assistant') {
                let avatarIcon;
                let avatarColor;
                
                switch(message.personality) {
                    case 'art':
                        avatarIcon = 'fas fa-crosshairs';
                        avatarColor = '#ff3b5c';
                        break;
                    case 'kscerato':
                        avatarIcon = 'fas fa-crown';
                        avatarColor = '#ffc107';
                        break;
                    case 'coach':
                        avatarIcon = 'fas fa-chalkboard-teacher';
                        avatarColor = '#00cc66';
                        break;
                    default:
                        avatarIcon = 'fas fa-robot';
                        avatarColor = '#1e90ff';
                }
                
                messageElement.innerHTML = `
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <div style="width: 24px; height: 24px; min-width: 24px; background: ${avatarColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 2px;">
                            <i class="${avatarIcon}" style="font-size: 0.8rem; color: white;"></i>
                        </div>
                        <div>${formatMessageWithLinks(message.message)}</div>
                    </div>
                `;
            } else {
                messageElement.innerHTML = formatMessageWithLinks(message.message);
            }
            
            messagesContainer.appendChild(messageElement);
        }
    });
    
    scrollToBottom();
}

function formatMessageWithLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const withLinks = text.replace(urlRegex, url => `<a href="${url}" target="_blank" style="color: #1e90ff; text-decoration: underline;">${url}</a>`);
    
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    return withLinks.replace(hashtagRegex, (match, tag) => 
        `<a href="javascript:void(0)" onclick="filterFeedByTag('${tag}')" style="color: #1e90ff; text-decoration: underline;">${match}</a>`
    );
}

function filterFeedByTag(tag) {
    alert(`Filtrando feed pela tag: #${tag}`);
}

function generateBotResponse(userMessage, personalityType) {
    const lowerMessage = userMessage.toLowerCase();
    
    switch(personalityType) {
        case 'art':
            return generateArtResponse(lowerMessage);
        case 'kscerato':
            return generateKsceratoResponse(lowerMessage);
        case 'coach':
            return generateCoachResponse(lowerMessage);
        default:
            return generateDefaultResponse(lowerMessage);
    }
}

function generateDefaultResponse(lowerMessage) {
    // BASIC INFORMATION QUERIES
    if (lowerMessage.includes('próximo jogo') || lowerMessage.includes('quando joga') || lowerMessage.includes('próximo match')) {
        return "O próximo jogo da FURIA será quinta-feira às 15h contra a Liquid no torneio BLAST Premier! Será transmitido nos canais oficiais da BLAST e do time. Vai ser fogo! 🔥";
    }
    
    // CS2 TEAM INFORMATION - UPDATED FOR 2025
    if (lowerMessage.includes('jogadores') || lowerMessage.includes('line-up') || lowerMessage.includes('elenco') || lowerMessage.includes('time') || lowerMessage.includes('cs2') || lowerMessage.includes('counter-strike')) {
        return "O atual line-up da FURIA CS2 é: FalleN (AWPer/Capitão), KSCERATO (Rifler), yuurih (Rifler), YEKINDAR (Entry Fragger) e molodoy (Rifler), com sidde como treinador. A equipe passou por mudanças significativas em abril de 2025, com as saídas de chelo e skullz, e as contratações de molodoy e YEKINDAR.";
    }
    
    if (lowerMessage.includes('major') || lowerMessage.includes('campeonato')) {
        return "A FURIA está classificada para o BLAST.tv Major: Austin 2025! Apesar de ter enfrentado dificuldades na IEM Katowice 2025, onde foi eliminada após derrotas para NAVI e Astralis, a equipe tem trabalhado intensamente no bootcamp para representar o Brasil da melhor forma possível no Major.";
    }
    
    // CS2 PLAYER INFORMATION - UPDATED
    if (lowerMessage.includes('fallen') || lowerMessage.includes('gabriel toledo')) {
        return "Gabriel \"FalleN\" Toledo é o atual AWPer e capitão da FURIA CS2. Lenda do Counter-Strike brasileiro, ele trouxe sua vasta experiência e liderança para a equipe. Conhecido como 'The Godfather of Brazilian CS', FalleN é respeitado mundialmente por sua visão tática e habilidade com a AWP.";
    }
    
    if (lowerMessage.includes('art') || lowerMessage.includes('andrei') || lowerMessage.includes('capitão antigo')) {
        return "Andrei \"arT\" Piovezan foi um dos principais jogadores da história da FURIA, conhecido pelo seu estilo agressivo e arriscado como AWPer e capitão. Ele foi fundamental para o desenvolvimento da identidade da equipe nos anos anteriores.";
    }
    
    if (lowerMessage.includes('kscerato') || lowerMessage.includes('kaike')) {
        return "Kaike \"KSCERATO\" Cerato continua sendo um dos pilares da FURIA CS2. Considerado um dos melhores jogadores do mundo, ele mantém sua mira incrível e consciência tática excepcional. Sua consistência é impressionante, sendo uma das peças-chave do time atual.";
    }

    if (lowerMessage.includes('yuurih') || lowerMessage.includes('yuri santos')) {
        return "Yuri \"yuurih\" Santos permanece como um dos jogadores mais talentosos e versáteis da FURIA. Um dos veteranos da organização, sua capacidade de adaptação e clutch continua sendo um diferencial. Com um estilo de jogo muito inteligente, ele segue decisivo nos momentos mais importantes para a equipe.";
    }
    
    if (lowerMessage.includes('yekindar') || lowerMessage.includes('marek')) {
        return "Marek \"YEKINDAR\" Galinskis é a nova adição internacional ao time da FURIA CS2, substituindo skullz. Este jogador letão é reconhecido mundialmente como um dos melhores entry fraggers, com um estilo agressivo e dinâmico que deve trazer uma nova dimensão ao jogo da equipe durante o BLAST.tv Major: Austin 2025.";
    }
    
    if (lowerMessage.includes('molodoy') || lowerMessage.includes('danil')) {
        return "Danil \"molodoy\" Golubenko é uma das novas aquisições da FURIA CS2, vindo da AMKAL Esports. O sniper foi contratado em abril de 2025 para fortalecer o arsenal da equipe após a saída de chelo. É um jogador com grande potencial que deve agregar muito ao time.";
    }
    
    // VALORANT TEAM - COMPLETELY UPDATED FOR 2025
    if (lowerMessage.includes('valorant') || lowerMessage.includes('val')) {
        return "A FURIA reformulou completamente sua equipe de VALORANT para 2025! O atual lineup é: Khalil \"khalil\" Schmidt, Ilan \"havoc\" Eloy, Olavo \"heat\" Marcelo, Rafael \"raafa\" Lima, Luis \"pryze\" Henrique (substituindo Leonardo \"mwzera\" Serrati, afastado por questões de saúde), e Pedro \"peu\" Lopes como treinador principal. A equipe tem mostrado bom desempenho, inclusive vencendo a 2GAME Esports por 2-0 no VCT 2025: Americas Kickoff.";
    }
    
    // LOL TEAM - NEW FOR 2025
    if (lowerMessage.includes('league') || lowerMessage.includes('lol') || lowerMessage.includes('legends')) {
        return "Para 2025, a FURIA montou uma nova equipe de League of Legends para disputar a primeira edição da LTA Sul! O elenco conta com Guigo (Top), Tatu (Jungler), Tutsz (Mid), Ayu (ADC), JoJo (Support), Thinkcard (Head Coach) e furyz (Assistente Técnico). A prioridade da equipe é a comunicação em português e um balanceamento entre experiência e novos talentos.";
    }
    
    // MERCHANDISE AND STORE
    if (lowerMessage.includes('loja') || lowerMessage.includes('comprar') || lowerMessage.includes('produto') || lowerMessage.includes('camisa')) {
        return "Você pode encontrar todos os produtos oficiais da FURIA na nossa loja virtual: furiagg.com/loja. Temos camisetas, moletons, mousepads e muito mais! As novas coleções de 2025 já estão disponíveis, incluindo itens com a identidade dos novos times de CS2, VALORANT e LoL! 🛒";
    }
    
    // EVENTS
    if (lowerMessage.includes('evento') || lowerMessage.includes('encontro') || lowerMessage.includes('meet') || lowerMessage.includes('presencial')) {
        return "Teremos um encontro de fãs em São Paulo no próximo fim de semana! Vai ser no Shopping Eldorado, das 14h às 20h, com sessões de autógrafos, fotos com os jogadores e muito mais! Este evento contará com a presença de jogadores dos times de CS2, VALORANT e LoL. Confira todos os detalhes na aba Eventos da plataforma FURIAX!";
    }
    
    // TEAM CHANGES AND TRANSFERS
    if (lowerMessage.includes('mudança') || lowerMessage.includes('transferência') || lowerMessage.includes('nova equipe') || lowerMessage.includes('troca') || lowerMessage.includes('contratação')) {
        return "2025 tem sido um ano de grandes mudanças para a FURIA! No CS2, saíram chelo e skullz, e chegaram molodoy e YEKINDAR. No VALORANT, a equipe foi completamente reformulada com khalil, havoc, heat, raafa e pryze, além do técnico peu. E a organização formou um novo time de LoL para a LTA Sul com Guigo, Tatu, Tutsz, Ayu, JoJo e o técnico Thinkcard. Todas essas mudanças visam fortalecer a FURIA em diversas modalidades!";
    }
    
    // PERFORMANCE AND RECENT RESULTS
    if (lowerMessage.includes('resultado') || lowerMessage.includes('desempenho') || lowerMessage.includes('performance') || lowerMessage.includes('como foi')) {
        return "Resultados recentes da FURIA: No CS2, a equipe foi eliminada na IEM Katowice 2025 após derrotas para NAVI e Astralis, mas segue classificada para o BLAST.tv Major: Austin 2025. No VALORANT, começou bem o VCT 2025: Americas Kickoff com vitória de 2-0 contra a 2GAME Esports, mesmo com problemas de visto que exigiram substitutos. E o time de LoL está iniciando sua jornada na primeira edição da LTA Sul.";
    }
    
    // TRAINING AND PREPARATION
    if (lowerMessage.includes('treino') || lowerMessage.includes('preparação') || lowerMessage.includes('bootcamp')) {
        return "A preparação das equipes da FURIA para 2025 tem sido intensiva! O time de CS2 está em bootcamp focado no BLAST.tv Major: Austin, trabalhando na integração dos novos jogadores YEKINDAR e molodoy. A equipe de VALORANT superou desafios iniciais com problemas de visto e segue forte no VCT. E o novo time de LoL tem focado no desenvolvimento da comunicação e sinergia para a LTA Sul. Todas as modalidades contam com estrutura completa de treinadores, analistas e preparadores.";
    }
    
    // FUTURE PLANS AND GOALS
    if (lowerMessage.includes('plano') || lowerMessage.includes('futuro') || lowerMessage.includes('objetivo') || lowerMessage.includes('meta')) {
        return "Os objetivos da FURIA para 2025 são ambiciosos! No CS2, o foco imediato é ter um bom desempenho no BLAST.tv Major: Austin e consolidar o novo lineup. No VALORANT, estabelecer-se como uma das principais forças do VCT Americas. E no LoL, construir uma base sólida na primeira edição da LTA Sul. A organização segue comprometida em ser uma das principais potências do esports brasileiro e expandir sua presença global.";
    }
    
    // TEAM COMPARISON
    if (lowerMessage.includes('comparar') || lowerMessage.includes('melhor equipe') || lowerMessage.includes('diferença') || lowerMessage.includes('vs') || lowerMessage.includes('versus')) {
        return "Comparando os times da FURIA: o line-up de CS2 é o mais experiente e consolidado, mesmo com as recentes mudanças, contando com lendas como FalleN, KSCERATO e yuurih. O time de VALORANT foi completamente reformulado, trazendo jogadores de alto potencial como heat e raafa, e deve precisar de mais tempo para atingir seu ápice. Já a equipe de LoL é inteiramente nova na organização, formada especificamente para a LTA Sul, combinando experiência e talentos promissores.";
    }
    
    // BASIC CHATBOT INTERACTIONS    
    if (lowerMessage.includes('obrigado') || lowerMessage.includes('valeu') || lowerMessage.includes('thanks')) {
        return "Por nada! Sempre à disposição para ajudar os fãs da FURIA! Se tiver mais perguntas sobre nossos times de CS2, VALORANT, LoL ou qualquer outro assunto relacionado à organização, é só chamar. #SomosFURIA 🔵⚫";
    }
    
    if (lowerMessage.includes('quem é você') || lowerMessage.includes('o que você é') || lowerMessage.includes('quem você')) {
        return "Eu sou a IA da FURIA, atualizada para 2025! Estou aqui para ajudar os fãs com informações sobre todos os nossos times (CS2, VALORANT, LoL), jogadores, eventos, conquistas e muito mais! Faço parte da plataforma FURIAX, que visa conectar a comunidade de fãs da melhor forma possível. Como posso te ajudar hoje?";
    }

    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('e aí') || lowerMessage.includes('fala')) {
        return "Oi! Eu sou a IA da FURIA, atualizada com todas as informações sobre nossos times de CS2, VALORANT e LoL para 2025! Como posso ajudar você hoje?";
    }

    // GREETINGS AND BASIC INTERACTIONS
if (lowerMessage.includes('bom dia') || lowerMessage.includes('good morning')) {
    return "Bom dia, torcedor da FURIA! Que seu dia seja tão vitorioso quanto nossos jogos! Como posso ajudar você hoje com informações sobre nossos times? #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('boa tarde') || lowerMessage.includes('good afternoon')) {
    return "Boa tarde! O dia está ótimo para conversarmos sobre a FURIA! Nossos times de CS2, VALORANT e LoL estão a todo vapor em 2025. O que você gostaria de saber? #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('boa noite') || lowerMessage.includes('good night')) {
    return "Boa noite! Mesmo a essa hora estou aqui para conversar sobre a FURIA! Talvez neste momento algum de nossos times esteja treinando em bootcamp enquanto conversamos. O que deseja saber? #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('tchau') || lowerMessage.includes('adeus') || lowerMessage.includes('até mais') || lowerMessage.includes('bye')) {
    return "Até a próxima! Sempre que quiser informações atualizadas sobre a FURIA, estarei aqui! Não se esqueça de acompanhar nossos jogos e torcer muito! #SomosFURIA 🔵⚫";
}

// TEAM HISTORY AND BACKGROUND
if (lowerMessage.includes('história') || lowerMessage.includes('surgiu') || lowerMessage.includes('fundação') || lowerMessage.includes('origem')) {
    return "A FURIA foi fundada em 2017 por André Akkari e Jaime Pádua, inicialmente focada em CS:GO. Desde então, evoluímos para uma das maiores organizações de esports do Brasil, com equipes competitivas em CS2, VALORANT, League of Legends e outras modalidades. Nossa missão sempre foi representar o Brasil no cenário internacional com excelência e paixão. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('akkari') || lowerMessage.includes('fundador')) {
    return "André Akkari é um dos fundadores da FURIA! Além de ser um jogador profissional de poker de sucesso, ele trouxe sua visão empreendedora para criar uma organização que valoriza o desenvolvimento dos atletas e a conexão com os fãs. Sua liderança tem sido fundamental para o crescimento da FURIA como uma potência no cenário de esports. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('logo') || lowerMessage.includes('símbolo') || lowerMessage.includes('cores')) {
    return "O logo da FURIA representa força e determinação! As cores azul e preto simbolizam profissionalismo e ambição. O design foi pensado para transmitir a energia e a paixão que definem nossa organização, tanto aos jogadores quanto aos fãs. É um símbolo que carregamos com orgulho em todas as competições! #SomosFURIA 🔵⚫";
}

// GAME-SPECIFIC QUERIES
if (lowerMessage.includes('mapa') || lowerMessage.includes('mapas favorito')) {
    return "Os mapas favoritos da nossa equipe de CS2 em 2025 são Inferno e Mirage, onde temos as maiores taxas de vitória! No VALORANT, nosso time tem se destacado em Lotus e Ascent. Cada equipe trabalha constantemente para dominar todos os mapas do pool competitivo, desenvolvendo estratégias específicas para cada cenário. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('arma') || lowerMessage.includes('weapon') || lowerMessage.includes('gun')) {
    return "No CS2, nossos jogadores têm preferências variadas! FalleN é lendário com a AWP, enquanto KSCERATO tem uma mira impressionante com rifles como AK-47 e M4A1. YEKINDAR costuma brilhar com SMGs em eco rounds. Os treinos individuais incluem prática com diferentes armas para garantir versatilidade tática em qualquer situação de jogo. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('agente') || lowerMessage.includes('personagem') || lowerMessage.includes('agent')) {
    return "No VALORANT, nosso time de 2025 tem especialistas em diversos agentes! Heat se destaca com duelistas como Jett e Raze, enquanto raafa domina com controladores como Omen e Astra. Cada jogador mantém um pool de pelo menos 3-4 agentes para adaptar-se a diferentes composições e estratégias conforme necessário. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('campeão') || lowerMessage.includes('champion') || lowerMessage.includes('champ')) {
    return "No League of Legends, nosso time da LTA Sul tem picks signature interessantes! Guigo é conhecido por seu pool de campeões de top lane como Aatrox e Jax, enquanto Ayu domina ADCs como Kai'Sa e Zeri. Nossos jogadores estão sempre adaptando suas pools conforme o meta evolui, mas mantendo alguns comfort picks característicos. #SomosFURIA 🔵⚫";
}

// BEHIND THE SCENES
if (lowerMessage.includes('rotina') || lowerMessage.includes('dia a dia') || lowerMessage.includes('daily')) {
    return "A rotina dos times da FURIA em 2025 é intensa! Os dias começam com preparação física, seguidos de treinos individuais de mecânica. Depois, há revisões táticas, análise de adversários e scrims. As equipes também dedicam tempo para criação de conteúdo, atividades mentais com psicólogos esportivos e, claro, momentos de descontração para manter o equilíbrio. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('treino') || lowerMessage.includes('practice') || lowerMessage.includes('scrim')) {
    return "Os treinos da FURIA são metodicamente estruturados! Incluem práticas individuais para aprimorar mecânica, sessões teóricas para estudar estratégias, e scrims contra outras equipes de elite. Em 2025, incorporamos mais análise de dados e ferramentas de IA para identificar padrões e otimizar performances. Cada modalidade tem programas específicos adaptados às necessidades de cada jogo. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('gaming house') || lowerMessage.includes('casa') || lowerMessage.includes('instalação')) {
    return "As instalações da FURIA em 2025 são de nível mundial! Contamos com complexos em São Paulo e Miami, equipados com setups de alta performance, salas de estratégia, academia, espaços de lazer e estúdios para criação de conteúdo. Tudo pensado para proporcionar o melhor ambiente possível para o desenvolvimento dos atletas e equipes de suporte. #SomosFURIA 🔵⚫";
}

// RESULTS AND COMPETITIONS
if (lowerMessage.includes('título') || lowerMessage.includes('conquista') || lowerMessage.includes('ganhou') || lowerMessage.includes('champion')) {
    return "A FURIA coleciona conquistas importantes ao longo de sua história! Entre os destaques estão o BLAST Premier Fall 2020 e a ESL Pro League Season 12 no CS:GO. Em 2025, seguimos na busca por novos troféus com nossas equipes renovadas de CS2, VALORANT e estreando na LTA Sul de League of Legends. A sede por vitórias e excelência continua sendo nossa marca registrada! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('último jogo') || lowerMessage.includes('last match') || lowerMessage.includes('última partida')) {
    return "No último jogo importante, nossa equipe de CS2 enfrentou desafios na IEM Katowice 2025, onde fomos eliminados após partidas contra NAVI e Astralis. Já no VALORANT, o time começou bem o VCT 2025: Americas Kickoff vencendo a 2GAME Esports por 2-0. Estamos sempre trabalhando para melhorar e apresentar performances ainda mais sólidas nos próximos confrontos! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('próximo torneio') || lowerMessage.includes('campeonato')) {
    return "O próximo grande torneio para nossa equipe de CS2 é o BLAST.tv Major: Austin 2025, uma das competições mais importantes do ano! No VALORANT, seguimos na disputa do VCT 2025: Americas. E nosso time de LoL está competindo na primeira edição da LTA Sul. Fique de olho nas redes sociais da FURIA para acompanhar todas as datas e horários! #SomosFURIA 🔵⚫";
}

// COMMUNITY AND FAN ENGAGEMENT
if (lowerMessage.includes('sócio') || lowerMessage.includes('membro') || lowerMessage.includes('member') || lowerMessage.includes('fã clube')) {
    return "Ser um membro oficial da torcida FURIA traz vantagens exclusivas! Você pode se tornar um através do site furiagg.com/membership, onde oferecemos diferentes níveis com benefícios como descontos em produtos, acesso antecipado a eventos, conteúdo exclusivo, interações com os jogadores e muito mais. É a melhor forma de se conectar ainda mais com a FURIA e mostrar seu apoio! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('redes sociais') || lowerMessage.includes('instagram') || lowerMessage.includes('twitter') || lowerMessage.includes('social media')) {
    return "Siga a FURIA nas redes sociais para não perder nenhuma novidade! Instagram: @furiagg, Twitter: @furiagg, YouTube: FURIA Esports, Twitch: furiatv, TikTok: @furiaesports. Em 2025, estamos mais ativos do que nunca, com conteúdo exclusivo, bastidores dos times, entrevistas com jogadores e muito mais. É o jeito perfeito de se manter conectado com tudo que acontece na organização! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('evento') || lowerMessage.includes('meet') || lowerMessage.includes('presencial')) {
    return "A FURIA está sempre promovendo eventos para aproximar fãs e jogadores! Em 2025, temos encontros regulares em SP, RJ e outras cidades, além de presenças em feiras de games e esports. O próximo grande evento será no Shopping Eldorado em São Paulo, com toda a equipe de CS2! Acompanhe nossas redes sociais para ficar por dentro de todos os eventos e não perder a chance de conhecer seus ídolos! #SomosFURIA 🔵⚫";
}

// PLAYER INTERACTIONS
if (lowerMessage.includes('mensagem para') || lowerMessage.includes('diga para') || lowerMessage.includes('falar com')) {
    return "Embora eu não possa encaminhar mensagens diretamente para os jogadores, você pode interagir com eles nas redes sociais! Todos os atletas da FURIA são ativos no Twitter/Instagram e frequentemente respondem fãs. Além disso, eles costumam fazer lives na Twitch onde é possível mandar mensagens no chat. Outra opção é participar dos encontros presenciais que organizamos regularmente! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('autógrafo') || lowerMessage.includes('foto com') || lowerMessage.includes('conhecer pessoalmente')) {
    return "Para conseguir autógrafos e fotos com os jogadores, a melhor oportunidade é nos eventos presenciais que organizamos regularmente! Também temos sessões de autógrafos quando participamos de grandes torneios e feiras de games. Fique de olho nas nossas redes sociais para saber quando o próximo evento acontecerá. Os membros do programa de fãs também têm acesso privilegiado a esses momentos! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('stream') || lowerMessage.includes('live') || lowerMessage.includes('twitch')) {
    return "Vários jogadores da FURIA mantêm streams regulares na Twitch! FalleN, KSCERATO e heat são alguns dos mais ativos em 2025. Além disso, temos o canal oficial da FURIA (furiatv) onde transmitimos conteúdo exclusivo, bastidores e até mesmo watch parties de competições. É uma ótima forma de conhecer melhor a personalidade dos jogadores e interagir com eles fora das competições oficiais! #SomosFURIA 🔵⚫";
}

// TEAM COMPARISONS AND RIVALRIES
if (lowerMessage.includes('rival') || lowerMessage.includes('adversário') || lowerMessage.includes('inimigo')) {
    return "A FURIA tem rivalidades históricas com várias equipes! No CS2, os confrontos contra Team Liquid, NAVI e FaZe Clan são sempre intensos e disputados. No cenário brasileiro, a rivalidade com a MIBR é um clássico. No VALORANT, times como Sentinels e LOUD representam grandes desafios. Essas rivalidades elevam o nível das partidas e proporcionam momentos inesquecíveis para os fãs! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('melhor time') || lowerMessage.includes('best team') || lowerMessage.includes('rank')) {
    return "Em 2025, nossa equipe de CS2 ocupa a 8ª posição no ranking mundial, com o objetivo de retornar ao Top 5 como já estivemos em 2020. No VALORANT, após as mudanças, estamos em ascensão no ranking das Américas. E no LoL, nossa nova equipe começa a construir sua história na LTA Sul. A FURIA sempre trabalha para estar entre as melhores organizações em todas as modalidades que compete! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('internacional') || lowerMessage.includes('global') || lowerMessage.includes('fora do brasil')) {
    return "A presença internacional da FURIA só cresce em 2025! Além de competir nos principais torneios globais de CS2 e VALORANT, mantemos operações nos EUA e parcerias estratégicas na Europa e Ásia. Nossos jogadores são reconhecidos mundialmente, como FalleN, KSCERATO e YEKINDAR. A missão continua sendo representar o Brasil no cenário global e conquistar títulos internacionais de prestigio! #SomosFURIA 🔵⚫";
}

// MERCHANDISE AND PRODUCTS
if (lowerMessage.includes('camisa') || lowerMessage.includes('jersey') || lowerMessage.includes('uniforme')) {
    return "Os jerseys oficiais da FURIA 2025 estão disponíveis na nossa loja! As novas camisas trazem um design moderno mantendo a identidade das cores azul e preto, com versões para cada modalidade (CS2, VALORANT e LoL). São feitas com tecido de alta performance, confortáveis para usar no dia a dia ou durante seus próprios jogos. Acesse furiagg.com/loja para conferir a coleção completa! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('moletom') || lowerMessage.includes('hoodie') || lowerMessage.includes('jaqueta')) {
    return "Nossa linha de moletons e jaquetas 2025 está imperdível! Com opções que vão desde o clássico moletom preto com logo minimalista até edições especiais temáticas de cada jogo. O material é super confortável e durável, perfeito para mostrar seu apoio à FURIA em qualquer lugar. Temos tamanhos do PP ao 3G para atender todos os fãs. Confira a coleção completa em furiagg.com/loja! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('coleção') || lowerMessage.includes('collection') || lowerMessage.includes('linha')) {
    return "A coleção FURIA 2025 está incrível! Além dos tradicionais jerseys e moletons, temos bonés, mousepads de diferentes tamanhos, canecas, adesivos, mascotes de pelúcia e até cadernos e posters. A linha 'FURIA Lifestyle' traz peças mais casuais para o dia a dia, enquanto a 'FURIA Pro' oferece produtos de performance. Há também itens exclusivos de edição limitada celebrando momentos especiais da organização! #SomosFURIA 🔵⚫";
}

// TECHNICAL AND GAMEPLAY QUESTIONS
if (lowerMessage.includes('dica') || lowerMessage.includes('melhorar') || lowerMessage.includes('tip') || lowerMessage.includes('conselho')) {
    return "Dica dos profissionais da FURIA para melhorar seu gameplay: foque nos fundamentos antes de tudo! Treine sua mira diariamente, aprenda utilidades básicas nos mapas, entenda a economia do jogo e, principalmente, desenvolva uma boa comunicação. Assistir demos de profissionais com atenção nos detalhes também ajuda muito. A consistência no treino é mais importante que sessões longas e esporádicas. E lembre-se: até os melhores começaram do zero! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('configuração') || lowerMessage.includes('setup') || lowerMessage.includes('periférico') || lowerMessage.includes('gear')) {
    return "Os setups dos jogadores da FURIA em 2025 incluem PCs com processadores de última geração e GPUs potentes, monitores de alta taxa de atualização (360Hz), mouses leves com sensores precisos, teclados mecânicos personalizados e headsets com cancelamento de ruído. Cada jogador tem preferências específicas de sensibilidade e configurações. O mais importante é encontrar equipamentos confortáveis que se adaptem ao seu estilo de jogo! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('sens') || lowerMessage.includes('dpi') || lowerMessage.includes('sensibilidade') || lowerMessage.includes('sensitivity')) {
    return "As configurações de sensibilidade variam entre nossos jogadores! No CS2, KSCERATO usa 400 DPI com sens 1.8, enquanto FalleN prefere 400 DPI com sens 2.2. No VALORANT, heat joga com 800 DPI e sens 0.3. O importante é encontrar uma configuração que permita tanto micro-ajustes precisos quanto movimentos rápidos. Recomendamos começar com uma sens média e ajustar conforme sua preferência e espaço disponível. #SomosFURIA 🔵⚫";
}

// PERSONAL STORIES
if (lowerMessage.includes('momento') || lowerMessage.includes('memorable') || lowerMessage.includes('inesquecível')) {
    return "Entre os momentos mais memoráveis da história da FURIA estão a semi-final do PGL Major Stockholm 2021, a vitória no BLAST Premier Fall 2020 e a campanha história na ESL Pro League Season 12. Em 2025, já tivemos momentos especiais como a estreia do novo lineup de CS2 com FalleN e YEKINDAR, e a vitória expressiva da nova equipe de VALORANT no início do VCT. Cada conquista escreve um novo capítulo na nossa história! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('desafio') || lowerMessage.includes('dificuldade') || lowerMessage.includes('challenge') || lowerMessage.includes('superar')) {
    return "Como qualquer organização competitiva, a FURIA enfrentou diversos desafios ao longo de sua história! Desde adaptações a metas em constante mudança até transições entre jogos (como de CS:GO para CS2). Em 2025, lidamos com desafios como a integração de novos jogadores internacionais no CS2 e problemas de visto para nossa equipe de VALORANT. A mentalidade sempre foi transformar obstáculos em oportunidades de crescimento! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('motivação') || lowerMessage.includes('inspiration') || lowerMessage.includes('inspiração')) {
    return "A motivação da FURIA vem de várias fontes! A paixão pelo jogo competitivo, o desejo de representar o Brasil no cenário internacional, a conexão com nossa incrível torcida e a busca constante pela excelência. Como organização, nos inspiramos em grandes times esportivos tradicionais e em outras organizações de esports que construíram legados duradouros. Nossa visão é ser um exemplo de profissionalismo e sucesso nos esports! #SomosFURIA 🔵⚫";
}

// FUTURE AND VISION
if (lowerMessage.includes('futuro') || lowerMessage.includes('future') || lowerMessage.includes('próximos anos')) {
    return "A visão de futuro da FURIA para os próximos anos é ambiciosa! Queremos consolidar nossa posição entre as principais organizações de esports do mundo, expandir para novas modalidades estrategicamente, desenvolver ainda mais nossa base de fãs global e continuar investindo em infraestrutura e tecnologia de ponta. Acreditamos que os esports continuarão crescendo, e a FURIA quer estar na vanguarda dessa evolução! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('expansão') || lowerMessage.includes('novo jogo') || lowerMessage.includes('expansion') || lowerMessage.includes('nova modalidade')) {
    return "A FURIA está sempre avaliando oportunidades estratégicas de expansão! Além do foco atual em CS2, VALORANT e LoL, estamos atentos ao cenário de esports mobile e outros títulos emergentes. Qualquer entrada em uma nova modalidade segue critérios rigorosos: potencial competitivo, afinidade com nossa base de fãs e alinhamento com nossos valores. Quando houver novidades oficiais sobre expansões, anunciaremos primeiro em nossas redes sociais! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('objetivo') || lowerMessage.includes('meta') || lowerMessage.includes('goal')) {
    return "Os objetivos da FURIA para 2025 são claros e ambiciosos! No CS2, queremos um desempenho de destaque no BLAST.tv Major: Austin e retornar ao Top 5 mundial. No VALORANT, estabelecer o novo lineup como potência no VCT Americas. No LoL, construir uma base sólida na LTA Sul. Além disso, seguimos expandindo nossa presença global, fortalecendo conexões com os fãs e desenvolvendo talentos para o futuro! #SomosFURIA 🔵⚫";
}

// ESPORTS INDUSTRY
if (lowerMessage.includes('carreira') || lowerMessage.includes('trabalhar') || lowerMessage.includes('career')) {
    return "Uma carreira nos esports vai muito além de ser jogador profissional! A FURIA emprega profissionais de diversas áreas: treinadores, analistas, fisioterapeutas, psicólogos, nutricionistas, gestores, profissionais de marketing, social media, produção de conteúdo, design, TI e muito mais. Para oportunidades na organização, fique atento às vagas divulgadas em nossas redes sociais ou envie seu currículo para careers@furiagg.com! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('indústria') || lowerMessage.includes('mercado') || lowerMessage.includes('industry')) {
    return "A indústria de esports continua em expansão em 2025! Vemos crescimento em audiência global, investimentos de grandes marcas e maior profissionalização das estruturas. A FURIA se posiciona como uma organização inovadora neste cenário, combinando excelência competitiva com gestão empresarial sólida e conexão autêntica com a comunidade. Acreditamos que os esports seguirão ganhando cada vez mais relevância cultural e econômica! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('patrocínio') || lowerMessage.includes('parceria') || lowerMessage.includes('sponsor')) {
    return "A FURIA conta com parceiros de peso em 2025! Temos patrocinadores como Nike (vestuário), Red Bull (bebidas energéticas), HyperX (periféricos), AOC (monitores) e Lenovo (computadores). Estas parcerias são fundamentais para o desenvolvimento da organização, proporcionando não apenas suporte financeiro, mas também produtos de qualidade para nossos atletas e ativações especiais para os fãs. Para parcerias comerciais: partnerships@furiagg.com. #SomosFURIA 🔵⚫";
}

// TRAINING AND SKILL DEVELOPMENT
if (lowerMessage.includes('físico') || lowerMessage.includes('academia') || lowerMessage.includes('physical') || lowerMessage.includes('workout')) {
    return "O preparo físico é parte fundamental da rotina dos atletas da FURIA! Todos seguem programas personalizados desenvolvidos por profissionais especializados, incluindo treinos de força, condicionamento cardiovascular e flexibilidade. Esses treinos ajudam a prevenir lesões (como síndrome do túnel do carpo), melhorar postura, aumentar resistência para longas sessões e otimizar funções cognitivas essenciais para o desempenho nos jogos. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('mental') || lowerMessage.includes('psicológico') || lowerMessage.includes('psychology')) {
    return "O preparo mental é tão importante quanto o técnico na FURIA! Contamos com psicólogos esportivos que trabalham diversos aspectos: gestão de pressão em competições, comunicação eficiente, resiliência após derrotas, foco durante treinos e partidas, e equilíbrio emocional. Técnicas como meditação, visualização e exercícios de respiração fazem parte da rotina dos jogadores, contribuindo para performances mais consistentes e saudáveis. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('nutrição') || lowerMessage.includes('alimentação') || lowerMessage.includes('nutrition') || lowerMessage.includes('dieta')) {
    return "A nutrição adequada é essencial para nossos atletas! Todos seguem planos alimentares desenvolvidos por nutricionistas esportivos, focados em energia sustentada, saúde cerebral e tempos de reação otimizados. As refeições são balanceadas em macro e micronutrientes, com atenção especial à hidratação e controle de cafeína. Durante bootcamps e competições, o controle alimentar é ainda mais rigoroso para garantir performance máxima nos momentos decisivos. #SomosFURIA 🔵⚫";
}

// FAN SUPPORT AND CHEERING
if (lowerMessage.includes('torcer') || lowerMessage.includes('apoiar') || lowerMessage.includes('support') || lowerMessage.includes('cheer')) {
    return "Seu apoio como torcedor é fundamental para a FURIA! Você pode apoiar assistindo às partidas ao vivo (Twitch, YouTube), interagindo positivamente nas redes sociais, compartilhando conteúdo, adquirindo produtos oficiais, participando de eventos presenciais e se tornando membro do programa de fãs. A energia da torcida motiva os jogadores, especialmente nos momentos difíceis. Sua paixão faz parte da nossa força! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('fã') || lowerMessage.includes('torcedor') || lowerMessage.includes('fan')) {
    return "A torcida da FURIA é reconhecida como uma das mais apaixonadas e fiéis do cenário de esports! O apoio incondicional dos fãs, seja nas vitórias ou nas derrotas, é um dos maiores diferenciais da organização. Em 2025, nossa base de fãs continua crescendo globalmente, mantendo a essência brasileira de vibração e energia. Vocês são parte fundamental da nossa história e motivação diária para buscar a excelência! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('assistir') || lowerMessage.includes('watch') || lowerMessage.includes('transmissão')) {
    return "Você pode assistir a todos os jogos da FURIA através de plataformas como Twitch e YouTube! Os canais oficiais dos torneios (ESL, BLAST, VCT, Riot Games) transmitem as partidas principais, enquanto o canal furiatv ocasionalmente oferece watch parties com comentários exclusivos. Siga nossas redes sociais para ficar por dentro dos horários de todas as partidas de CS2, VALORANT e LoL. Não perca nenhum jogo da nossa equipe em 2025! #SomosFURIA 🔵⚫";
}

// PARTNERSHIPS AND BUSINESS
if (lowerMessage.includes('investir') || lowerMessage.includes('invest') || lowerMessage.includes('ação') || lowerMessage.includes('empresa')) {
    return "A FURIA opera como uma empresa completa de entretenimento e esports, com diversas frentes de negócio além das equipes competitivas. Para oportunidades de investimento corporativo, parcerias estratégicas ou outras consultas de negócios, o contato ideal é business@furiagg.com. Nossa visão inclui expansão sustentável, mantendo a essência e valores que construíram nossa reputação no mercado de esports. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('imprensa') || lowerMessage.includes('press') || lowerMessage.includes('entrevista') || lowerMessage.includes('mídia')) {
    return "Para contatos de imprensa e solicitações de entrevistas com jogadores ou representantes da FURIA, o canal apropriado é press@furiagg.com. Nossa equipe de Relações Públicas está disponível para fornecer informações, agendar entrevistas e apoiar a cobertura midiática de nossas atividades. Valorizamos a relação com a imprensa e o papel fundamental que desempenha na divulgação dos esports! #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('eae')) {
    return "Fala, fã da FURIA! Pronto pra acompanhar os melhores momentos dos nossos times? 😎🔥 #GoFURIA";
}

if (lowerMessage.includes('tchau') || lowerMessage.includes('falou') || lowerMessage.includes('até mais')) {
    return "Valeu por colar aqui! A FURIA te espera na próxima. 💙 #SomosFURIA";
}

if (lowerMessage.includes('obrigado') || lowerMessage.includes('valeu') || lowerMessage.includes('thanks')) {
    return "Por nada! Sempre à disposição para ajudar os fãs da FURIA! Se tiver mais perguntas sobre nossos times de CS2, VALORANT, LoL ou qualquer outro assunto relacionado à organização, é só chamar. #SomosFURIA 🔵⚫";
}

if (lowerMessage.includes('cs2') || lowerMessage.includes('csgo') || lowerMessage.includes('counter-strike')) {
    return "A FURIA manda bem no CS2! Nosso elenco atual está em constante evolução, com foco total nos campeonatos internacionais. Quer saber os jogadores atuais?";
}

if (lowerMessage.includes('valorant')) {
    return "No VALORANT, a FURIA vem mostrando cada vez mais força no cenário. Acompanha as partidas?";
}

if (lowerMessage.includes('lol') || lowerMessage.includes('league of legends')) {
    return "Sim! A FURIA também tem time de League of Legends e disputa o CBLOL. Torce por alguém em especial?";
}

if (lowerMessage.includes('free fire')) {
    return "A FURIA já marcou presença no Free Fire também! A gente se joga em tudo que for competitivo 🔥";
}

if (lowerMessage.includes('quem é o capitão') || lowerMessage.includes('líder do time')) {
    return "O capitão atual depende da lineup ativa (CS2, LoL, etc), mas em CS2, por exemplo, o arT foi um grande líder até 2024!";
}

if (lowerMessage.includes('art ainda está') || lowerMessage.includes('art saiu')) {
    return "O arT foi colocado no banco da FURIA em 2024 e atualmente joga pelo Fluxo. Um ícone da nossa história!";
}

if (lowerMessage.includes('jogadores') || lowerMessage.includes('lineup') || lowerMessage.includes('escalação')) {
    return "Quer saber os jogadores atuais? Você pode conferir a lineup completa no site oficial da FURIA ou em nossas redes sociais! 🐾";
}

if (lowerMessage.includes('quando foi fundada') || lowerMessage.includes('fundação da furia')) {
    return "A FURIA foi fundada em agosto de 2017 e desde então vem crescendo como uma das maiores orgs do Brasil! 💪";
}

if (lowerMessage.includes('redes sociais') || lowerMessage.includes('instagram') || lowerMessage.includes('twitter') || lowerMessage.includes('x')) {
    return "Siga a FURIA nas redes: Instagram (@furia), X/Twitter (@FURIA), TikTok (@furia.gg) e YouTube (FURIA Esports)! 📱";
}

if (lowerMessage.includes('somos furia') || lowerMessage.includes('#somosfuria')) {
    return "#SomosFURIA sempre! Obrigado por fazer parte dessa família com a gente. 🖤💙";
}

if (lowerMessage.includes('loja') || lowerMessage.includes('camisa') || lowerMessage.includes('uniforme')) {
    return "Quer garantir o manto da FURIA? Acesse a loja oficial: https://store.furia.gg/ 👕🔥";
}

if (lowerMessage.includes('onde assistir') || lowerMessage.includes('assistir jogo') || lowerMessage.includes('live da furia')) {
    return "Você pode assistir os jogos da FURIA nos canais oficiais da Twitch e no YouTube! Fique ligado nas redes para saber quando entramos no servidor 🎥💥";
}

if (lowerMessage.includes('meme') || lowerMessage.includes('piada') || lowerMessage.includes('zoeira')) {
    return "Sabe por que a FURIA nunca perde na chuva? Porque já está acostumada a jogar no servidor molhado de suor dos adversários! 😅🐱‍🏍";
}

if (lowerMessage.includes('campeonato') || lowerMessage.includes('próximo jogo') || lowerMessage.includes('agenda')) {
    return "Acompanhe o calendário de jogos da FURIA pelo site oficial ou pelas redes sociais. Tem muito jogo insano vindo aí! 📅🔥";
}

if (lowerMessage.includes('furia é br') || lowerMessage.includes('furia representa')) {
    return "A FURIA é Brasil, é garra, é raça! Representamos o país nos maiores palcos do mundo! 🇧🇷🔥";
}

if (lowerMessage.includes('site oficial') || lowerMessage.includes('website')) {
    return "Acesse nosso site oficial em https://www.furia.gg para conferir tudo sobre nossos times, conteúdo e loja!";
}

if(lowerMessage.includes('/help') || lowerMessage.includes('ajuda') || lowerMessage.includes('socorro') || lowerMessage.includes('comando')) {
    return "Posso responder sobre diversos tópicos relacionados à FURIA em 2025! Pergunte sobre:\n\n" +
           "📋 TIMES E JOGOS:\n" +
           "- CS2 / CSGO / Counter-Strike\n" +
           "- VALORANT / VAL\n" +
           "- League of Legends / LoL\n" +
           "- Free Fire\n\n" +
           
           "🏆 INFORMAÇÕES DE TIMES:\n" +
           "- Jogadores / lineup / elenco\n" +
           "- Próximo jogo / quando joga\n" +
           "- Major / campeonato / torneio\n" +
           "- Resultado / desempenho\n\n" +
           
           "👤 JOGADORES:\n" +
           "- FalleN / Gabriel Toledo\n" +
           "- KSCERATO / Kaike\n" +
           "- yuurih / Yuri Santos\n" +
           "- YEKINDAR / Marek\n" +
           "- molodoy / Danil\n" +
           "- arT / Andrei\n\n" +
           
           "🏢 ORGANIZAÇÃO:\n" +
           "- História / fundação / origem\n" +
           "- Akkari / fundador\n" +
           "- Logo / símbolo / cores\n" +
           "- Mudança / transferência\n" +
           "- Plano / futuro / objetivo\n\n" +
           
           "🏋️ PREPARAÇÃO:\n" +
           "- Treino / bootcamp\n" +
           "- Rotina / dia a dia\n" +
           "- Físico / academia\n" +
           "- Mental / psicológico\n" +
           "- Configuração / setup\n\n" +
           
           "👥 COMUNIDADE:\n" +
           "- Loja / comprar / produto\n" +
           "- Evento / encontro / meet\n" +
           "- Redes sociais\n" +
           "- Assistir / transmissão\n" +
           "- Torcer / apoiar\n\n" +
           
           "💬 BÁSICOS:\n" +
           "- Olá / oi / e aí / fala\n" +
           "- Bom dia / boa tarde / boa noite\n" +
           "- Obrigado / valeu / thanks\n" +
           "- Tchau / adeus / até mais\n\n" +
           
           "#SomosFURIA 🔵⚫";
}

    // FALLBACK RESPONSES
    const generalResponses = [
        "2025 está sendo um ano de renovação para a FURIA em várias modalidades! Novos jogadores, novas equipes e muitas expectativas. O que mais você gostaria de saber sobre a organização?",
        
        "Nossa comunidade de fãs continua sendo uma das mais apaixonadas do cenário de esports! Agora com ainda mais modalidades para acompanhar, com CS2, VALORANT e LoL. O que mais você gostaria de saber sobre a FURIA?",
        
        "Estamos trabalhando em novidades incríveis para os fãs em 2025! Fique ligado nas redes sociais e aqui na plataforma FURIAX para não perder nenhuma atualização sobre nossos times de CS2, VALORANT e LoL. Tem algo específico que você gostaria de saber?",
        
        "Os treinos das equipes da FURIA estão a todo vapor para as próximas competições de 2025! Nosso objetivo é sempre buscar a melhor performance possível em todas as modalidades. Em que mais posso ajudar você?",
        
        "A FURIA continua valorizando muito o apoio dos fãs em 2025! Vocês são parte fundamental do sucesso da organização em todas as modalidades. Como mais posso te ajudar hoje?"
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

    

function generateArtResponse(message) {
    if (message.includes('próximo jogo') || message.includes('quando joga')) {
        return "Fala mano! Nosso próximo jogo é quinta contra a Liquid. Estamos na preparação forte, revisando demos e treinando. Vai ser um jogão! Tu vai assistir?";
    }
    
    if (message.includes('tática') || message.includes('estratégia')) {
        return "Como IGL, sempre tento inovar nas táticas. Às vezes a galera acha que sou maluco, mas tem método na loucura! 😂 A gente tá sempre tentando surpreender os adversários com jogadas diferentes. Tô sempre bolando coisas novas nos treinos.";
    }
    
    if (message.includes('awp') || message.includes('sniper')) {
        return "Mano, AWP é minha paixão! Sei que meu estilo é agressivo pra caramba, não sou o AWPer convencional. Gosto de ser imprevisível, fazer jogadas que ninguém espera. Às vezes dá errado, mas quando dá certo... 🔥";
    }
    
    if (message.includes('conselho') || message.includes('dica')) {
        return "Dica de quem tá no jogo há tempo: treina sua comunicação e joga em equipe. CS não é só mira. É decisão rápida, timing, conhecer os mapas. E confia na tua game sense - às vezes tem que sentir o jogo, não dá pra explicar. É coisa de milhares de horas jogando.";
    }

    if (message.includes('olá') || message.includes('oi') || message.includes('e aí') || message.includes('fala')) {
        return "Fala aí! arT na área. Como que tá? Pode perguntar qualquer coisa sobre CS ou sobre o time!";
    }

    

    
    const responses = [
        "Fala meu mano! O que tá pegando? Pode perguntar qualquer coisa aí sobre o time ou CS.",
        "Estamos focados no próximo torneio. A preparação tá insana, confia!",
        "CS2 tem mudado várias dinâmicas do jogo, mas a gente tá se adaptando rápido. O time todo tá evoluindo bem.",
        "Mano, essa comunidade da FURIA é diferenciada demais! Vocês são parte do time também.",
        "Bora Brasil! A gente vai representar com tudo nos próximos campeonatos. Pode confiar!"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function generateKsceratoResponse(message) {
    if (message.includes('treino') || message.includes('prática')) {
        return "Minha rotina de treino é bem intensa. Além das horas com o time, sempre faço DM e workshop maps para manter a mira afiada. Consistência vem de trabalho duro diário, não tem segredo.";
    }
    
    if (message.includes('mira') || message.includes('aim')) {
        return "Sobre aim, eu foco muito em treinar micro-ajustes e spray control. Tenho uma sensibilidade relativamente baixa, o que ajuda na precisão. Mas o principal é a repetição e manter a calma nas situações de pressão.";
    }
    
    if (message.includes('major') || message.includes('campeonato')) {
        return "Estamos muito focados para o próximo Major. A preparação está diferente dessa vez, estamos estudando muito os adversários. Sinto que podemos ir muito longe. O time está em ótima forma e confiante.";
    }
    
    if (message.includes('clutch') || message.includes('1v1')) {
        return "Situações de clutch são sobre manter a calma e jogar com informação. Tento sempre ter uma boa leitura do jogo e não apressar decisões. É mais mental do que mecânico na maioria das vezes.";
    }

    if (message.includes('olá') || message.includes('oi') || message.includes('e aí') || message.includes('fala')) {
        return "Olá! Aqui é o KSCERATO. Como posso ajudar você hoje? Pode perguntar sobre o time ou sobre CS.";
    }

    
    const responses = [
        "Estou sempre buscando evoluir como jogador. Cada torneio é uma nova oportunidade de aprendizado.",
        "O ambiente na FURIA é muito bom para desenvolvimento. Temos uma ótima estrutura e staff técnico.",
        "Representar o Brasil internacionalmente é uma honra enorme. Damos o máximo em cada partida por vocês.",
        "Valorizo muito o apoio dos fãs. Vocês são parte fundamental das nossas conquistas.",
        "Estamos com grandes expectativas para as próximas competições. O time está trabalhando muito."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function generateCoachResponse(message) {
    if (message.includes('treino') || message.includes('preparação')) {
        return "Nossa metodologia de treino é bastante estruturada. Dividimos entre teoria, prática de execução e scrims. Também fazemos muita análise de demos, tanto nossas quanto dos adversários. É um processo contínuo de aprendizado e adaptação.";
    }
    
    if (message.includes('tática') || message.includes('estratégia') || message.includes('mapa')) {
        return "Desenvolvemos um playbook extenso para cada mapa, com variações de execuções e adaptações mid-round. O diferencial da FURIA é a capacidade de improvisar a partir de bases sólidas. Não queremos ser previsíveis, mas também precisamos de estrutura.";
    }
    
    if (message.includes('adversário') || message.includes('time') || message.includes('oponente')) {
        return "A análise de adversários é fundamental no nosso processo. Temos uma equipe dedicada a estudar padrões, tendências e contra-estratégias. Cada time tem seus confortos e desconfortos, e trabalhamos para explorar isso ao máximo.";
    }
    
    if (message.includes('carreira') || message.includes('coach') || message.includes('técnico')) {
        return "A carreira de coach exige uma visão macro do jogo e habilidade de comunicação. É preciso saber equilibrar autoridade e proximidade com os jogadores. Meu objetivo é criar um ambiente onde todos possam atingir seu potencial máximo dentro do sistema do time.";
    }
    
    if (message.includes('olá') || message.includes('oi') || message.includes('eaí') || message.includes('fala')) {
        return "Boa! Aqui é o Coach da FURIA. Como posso ajudar você hoje? Vamos falar sobre estratégias e preparação?";
    }
    
    const responses = [
        "O sucesso de uma equipe está nos detalhes. Trabalhamos constantemente para refinar cada aspecto do nosso jogo.",
        "Estamos implementando novos sistemas de jogo que serão revelados nas próximas competições. Acho que vão surpreender muita gente.",
        "O mental é tão importante quanto a habilidade técnica. Investimos muito em preparação psicológica para momentos de pressão.",
        "Nosso objetivo é construir um estilo de jogo que seja adaptável a qualquer meta ou adversário. Flexibilidade é chave no CS atual.",
        "A evolução da FURIA é um processo contínuo. Estamos sempre buscando novos limites e desafiando o status quo."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function getFromStorage(key, defaultValue) {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Erro ao ler ${key} do localStorage:`, error);
        return defaultValue;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
}

function updateUserEngagement(type, value) {
    try {
        const engagement = getFromStorage(STORAGE_KEYS.USER_ENGAGEMENT, {
            chat_messages: 0,
            visits: 0,
            last_visit: null,
            interests: {},
            custom: 0
        });
        
        if (type === 'visit') {
            engagement.visits += value;
            engagement.last_visit = Date.now();
        } else if (type === 'chat_message') {
            engagement.chat_messages += value;
        } else if (type === 'interest') {
            engagement.interests[value] = (engagement.interests[value] || 0) + 1;
        } else if (type === 'custom') {
            engagement.custom += value;
        }
        
        saveToStorage(STORAGE_KEYS.USER_ENGAGEMENT, engagement);
    } catch (error) {
        console.error('Erro ao atualizar engajamento:', error);
    }
}

updateUserEngagement('visit', 1);