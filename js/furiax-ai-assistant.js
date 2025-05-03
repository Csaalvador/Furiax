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
    if (lowerMessage.includes('próximo jogo') || lowerMessage.includes('quando joga') || lowerMessage.includes('próximo match')) {
        return "O próximo jogo da FURIA será quinta-feira às 15h contra a Liquid no torneio BLAST Premier! Será transmitido nos canais oficiais da BLAST e do time. Vai ser fogo! 🔥";
    }
    
    if (lowerMessage.includes('jogadores') || lowerMessage.includes('line-up') || lowerMessage.includes('elenco') || lowerMessage.includes('time')) {
        return "O atual line-up da FURIA CS:GO é: arT (AWPer/Capitão), KSCERATO (Rifler), yuurih (Rifler), saffee (Rifler), drop (Rifler) e tacitus (Coach). Um time incrível com muito talento brasileiro!";
    }
    
    if (lowerMessage.includes('major') || lowerMessage.includes('campeonato')) {
        return "O próximo Major de CS2 será em três meses e a FURIA já está classificada! A equipe está em bootcamp intensivo para representar o Brasil da melhor forma possível. As expectativas estão altíssimas após os últimos resultados!";
    }
    
    if (lowerMessage.includes('art') || lowerMessage.includes('capitão')) {
        return "Andrei \"arT\" Piovezan é o capitão e AWPer da FURIA. Conhecido pelo seu estilo agressivo e arriscado, ele é um dos jogadores mais criativos e carismáticos do cenário. Sua liderança dentro e fora do jogo é fundamental para o sucesso da equipe!";
    }
    
    if (lowerMessage.includes('kscerato')) {
        return "Kaike \"KSCERATO\" Cerato é um dos riflers da FURIA. Considerado um dos melhores jogadores do mundo, ele tem uma mira incrível e uma consciência tática excepcional. Sua consistência é impressionante, mantendo sempre alto nível nas competições!";
    }
    
    if (lowerMessage.includes('loja') || lowerMessage.includes('comprar') || lowerMessage.includes('produto') || lowerMessage.includes('camisa')) {
        return "Você pode encontrar todos os produtos oficiais da FURIA na nossa loja virtual: furiagg.com/loja. Temos camisetas, moletons, mousepads e muito mais! Já viu a nova coleção que está chegando para o Major? 🛒";
    }
    
    if (lowerMessage.includes('evento') || lowerMessage.includes('encontro') || lowerMessage.includes('meet') || lowerMessage.includes('presencial')) {
        return "Teremos um encontro de fãs em São Paulo no próximo fim de semana! Vai ser no Shopping Eldorado, das 14h às 20h, com sessões de autógrafos, fotos com os jogadores e muito mais! Confira todos os detalhes na aba Eventos da plataforma FURIAX!";
    }
    
    if (lowerMessage.includes('valorant') || lowerMessage.includes('val')) {
        return "A FURIA também tem um time feminino de VALORANT super competitivo! As meninas têm mostrado um desempenho incrível nos torneios recentes e estão entre as melhores equipes da América Latina. Acompanhe as partidas nos canais oficiais!";
    }
    
    if (lowerMessage.includes('obrigado') || lowerMessage.includes('valeu') || lowerMessage.includes('thanks')) {
        return "Por nada! Sempre à disposição para ajudar os fãs da FURIA! Se tiver mais perguntas, é só chamar. #SomosFURIA 🔵⚫";
    }
    
    if (lowerMessage.includes('quem é você') || lowerMessage.includes('o que você é') || lowerMessage.includes('quem você')) {
        return "Eu sou a IA da FURIA, criada para ajudar os fãs com informações sobre o time, jogadores, eventos e muito mais! Faço parte da plataforma FURIAX, que visa conectar a comunidade de fãs da melhor forma possível. Como posso te ajudar hoje?";
    }

    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('e aí') || lowerMessage.includes('fala')) {
        return "Oi! Eu sou a IA da FURIA. Como posso ajudar você hoje?";
    }
    if(lowerMessage.includes('help') || lowerMessage.includes('ajuda') || lowerMessage.includes('socorro')) {
        return "Os comandos são \n: Olá, \npróximo jogo, \njogadores, \nmajor, \nloja, \nevento, \nVALORANT, \nobrigado, \nquem é você, \nolá, \noi, \ne aí ou fala. Você pode perguntar sobre qualquer coisa relacionada à FURIA!";
    }   
    
    
    const generalResponses = [
        "A FURIA está em constante evolução para se manter entre as melhores equipes do mundo! Temos grandes expectativas para os próximos torneios. O que mais você gostaria de saber sobre o time?",
        "Nossa comunidade de fãs é uma das mais apaixonadas do cenário de esports! O que mais você gostaria de saber sobre a FURIA?",
        "Estamos trabalhando em novidades incríveis para os fãs! Fique ligado nas redes sociais e aqui na plataforma FURIAX para não perder nenhuma atualização. Tem algo específico que você gostaria de saber?",
        "Os treinos da equipe estão a todo vapor para as próximas competições! Nosso objetivo é sempre buscar a melhor performance possível. Em que mais posso ajudar você?",
        "A FURIA valoriza muito o apoio dos fãs! Vocês são parte fundamental do sucesso da equipe. Como mais posso te ajudar hoje?"
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

    if(message.includes('help') || message.includes('ajuda') || message.includes('socorro')) {
        return "Os comandos são: Olá, próximo jogo, jogadores, major, loja, evento, VALORANT, obrigado, quem é você, olá, oi, e aí ou fala. Você pode perguntar sobre qualquer coisa relacionada à FURIA!";
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

    if(message.includes('help') || message.includes('ajuda') || message.includes('socorro')) {
        return "Os comandos são: Olá, próximo jogo, jogadores, major, loja, evento, VALORANT, obrigado, quem é você, olá, oi, e aí ou fala. Você pode perguntar sobre qualquer coisa relacionada à FURIA!";
    }
    if(message.includes('help') || message.includes('ajuda') || message.includes('socorro')) {
        return "Os comandos são: Olá, próximo jogo, jogadores, major, loja, evento, VALORANT, obrigado, quem é você, olá, oi, e aí ou fala. Você pode perguntar sobre qualquer coisa relacionada à FURIA!";
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
    if(message.includes('help') || message.includes('ajuda') || message.includes('socorro')) {
        return "Os comandos são: Olá, próximo jogo, jogadores, major, loja, evento, VALORANT, obrigado, quem é você, olá, oi, e aí ou fala. Você pode perguntar sobre qualquer coisa relacionada à FURIA!";
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