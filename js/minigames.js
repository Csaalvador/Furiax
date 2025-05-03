// Sistema de minigames integrado com o sistema de gamificação
// Este arquivo deve ser incluído em missions.html

// Configurações de minigames
const MINIGAMES_CONFIG = {
    quiz: {
        id: 'quiz',
        name: 'Quiz FURIA',
        description: 'Teste seus conhecimentos sobre a FURIA',
        icon: 'fas fa-question-circle',
        color: '#8a2be2',
        xpReward: 20,  // por resposta correta
        perfectXpReward: 100
    },
    word: {
        id: 'word',
        name: 'Palavra do Dia',
        description: 'Adivinhe a palavra relacionada à FURIA',
        icon: 'fas fa-font',
        color: '#3cb371',
        xpReward: 25
    },
    prediction: {
        id: 'prediction',
        name: 'Previsão de Partidas',
        description: 'Preveja os resultados das próximas partidas',
        icon: 'fas fa-chart-line',
        color: '#ff4500',
        xpReward: 15,
        correctPredictionReward: 50
    }
};

// Estado global dos jogos
let quizState = {
    currentQuiz: null,
    currentQuestion: 0,
    score: 0,
    selectedOption: null,
    completed: false
};

let wordState = {
    currentWord: null,
    completed: false
};

let predictionState = {
    predictions: {},
    completed: false
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página de mini-games
    if (window.location.href.includes('missions.html')) {
        initMinigames();
    }
});

// Inicializar sistema de mini-games
function initMinigames() {
    console.log('Inicializando sistema de mini-games...');
    
    // Carregar estado dos jogos
    loadGameStates();
    
    // Adicionar event listeners para modais dos jogos
    setupGameModals();
    
    // Verificar se algum jogo foi completo hoje
    checkCompletedGames();
    
    // Atualizar estatísticas
    if (typeof updateStats === 'function') {
        updateStats();
    } else {
        console.warn('Função updateStats não encontrada. Importou o furiax-gamification.js?');
    }
}

// Carregar estados dos jogos do localStorage
function loadGameStates() {
    // Verificar se o usuário já completou o quiz hoje
    const today = new Date().toDateString();
    const completedGames = JSON.parse(localStorage.getItem('furiax_completed_games') || '[]');
    
    // Verificar quiz
    const quizCompleted = completedGames.some(game => 
        game.id === 'quiz' && game.date === today
    );
    quizState.completed = quizCompleted;
    
    // Verificar palavra do dia
    const wordCompleted = completedGames.some(game => 
        game.id === 'word' && game.date === today
    );
    wordState.completed = wordCompleted;
    
    // Verificar previsões
    const predictionCompleted = completedGames.some(game => 
        game.id === 'prediction' && game.date === today
    );
    predictionState.completed = predictionCompleted;
    
    // Atualizar botões com estado completo se necessário
    updateGameButtons();
}

// Configurar modais dos jogos
function setupGameModals() {
    // Quiz Modal
    const quizButton = document.querySelector('.game-button[onclick="openQuizModal()"]');
    if (quizButton) {
        quizButton.onclick = function() {
            openQuizModal();
        };
    }
    
    // Word Game Modal
    const wordButton = document.querySelector('.game-button[onclick="openWordGameModal()"]');
    if (wordButton) {
        wordButton.onclick = function() {
            openWordGameModal();
        };
    }
    
    // Prediction Modal
    const predictionButton = document.querySelector('.game-button[onclick="openPredictionModal()"]');
    if (predictionButton) {
        predictionButton.onclick = function() {
            openPredictionModal();
        };
    }
    
    // Adicionar event listeners para fechar modais
    document.addEventListener('click', function(e) {
        // Fechar Quiz Modal
        if (e.target.id === 'closeMissionsPage' || e.target.classList.contains('modal-close')) {
            const modalOverlay = e.target.closest('.modal-overlay');
            if (modalOverlay) {
                closeModal(modalOverlay.id);
            }
        }
    });
}

// Atualizar botões de jogos com estado completado
function updateGameButtons() {
    // Quiz Button
    const quizButton = document.querySelector('.game-button[onclick="openQuizModal()"]');
    if (quizButton && quizState.completed) {
        quizButton.classList.add('completed');
        quizButton.innerHTML = '<i class="fas fa-check"></i> Completado';
    }
    
    // Word Game Button
    const wordButton = document.querySelector('.game-button[onclick="openWordGameModal()"]');
    if (wordButton && wordState.completed) {
        wordButton.classList.add('completed');
        wordButton.innerHTML = '<i class="fas fa-check"></i> Completado';
    }
    
    // Prediction Button
    const predictionButton = document.querySelector('.game-button[onclick="openPredictionModal()"]');
    if (predictionButton && predictionState.completed) {
        predictionButton.classList.add('completed');
        predictionButton.innerHTML = '<i class="fas fa-check"></i> Completado';
    }
}

// Verificar jogos completados hoje
function checkCompletedGames() {
    const today = new Date().toDateString();
    const completedGames = JSON.parse(localStorage.getItem('furiax_completed_games') || '[]');
    
    // Filtrar jogos completados hoje
    const todayGames = completedGames.filter(game => game.date === today);
    
    // Obter jogos únicos completados
    const uniqueGames = [...new Set(todayGames.map(game => game.id))];
    
    // Atualizar contador na UI
    const gamesPlayedElement = document.getElementById('gamesPlayed');
    if (gamesPlayedElement) {
        gamesPlayedElement.textContent = uniqueGames.length;
    }
    
    // Verificar missão diária de jogos
    if (typeof checkDailyGamesProgress === 'function' && uniqueGames.length > 0) {
        checkDailyGamesProgress();
    }
}

// Registrar jogo completado no sistema de gamificação
function completeGame(gameId, score = 0) {
    // Verificar se a função registerCompletedGame existe
    if (typeof registerCompletedGame === 'function') {
        registerCompletedGame(gameId, score);
    } else {
        // Fallback se a função não estiver disponível
        console.warn('Função registerCompletedGame não encontrada. Usando método alternativo...');
        
        const today = new Date().toDateString();
        const completedGames = JSON.parse(localStorage.getItem('furiax_completed_games') || '[]');
        
        // Adicionar jogo completado
        completedGames.push({
            id: gameId,
            date: today,
            score: score,
            timestamp: Date.now()
        });
        
        // Salvar jogos completados
        localStorage.setItem('furiax_completed_games', JSON.stringify(completedGames));
        
        // Conceder XP
        if (typeof addUserXP === 'function') {
            addUserXP(MINIGAMES_CONFIG[gameId]?.xpReward || 30);
        }
    }
    
    // Marcar jogo como completado
    switch (gameId) {
        case 'quiz':
            quizState.completed = true;
            break;
        case 'word':
            wordState.completed = true;
            break;
        case 'prediction':
            predictionState.completed = true;
            break;
    }
    
    // Atualizar botões
    updateGameButtons();
    
    // Verificar jogos completados
    checkCompletedGames();
    
    // Mostrar notificação
    showNotification(`${MINIGAMES_CONFIG[gameId]?.name || 'Jogo'} completado! +${score} XP`, 'success');
}

// Mostrar notificação
function showNotification(message, type = 'default') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) return;
    
    // Configurar tipo de notificação
    notification.className = 'notification';
    if (type === 'success') notification.classList.add('success');
    if (type === 'error') notification.classList.add('error');
    
    // Atualizar texto
    notificationText.textContent = message;
    
    // Mostrar notificação
    notification.classList.add('show');
    
    // Esconder após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ======================================================
// IMPLEMENTAÇÃO DO QUIZ
// ======================================================

// Perguntas do Quiz
const quizQuestions = [
    {
        question: "Em que ano a FURIA foi fundada?",
        options: ["2017", "2018", "2019", "2020"],
        correctIndex: 0
    },
    {
        question: "Qual jogador foi o primeiro capitão da equipe de CS:GO da FURIA?",
        options: ["arT", "KSCERATO", "yuurih", "HEN1"],
        correctIndex: 0
    },
    {
        question: "Em qual modalidade a FURIA conquistou seu primeiro grande título internacional?",
        options: ["CS:GO", "Free Fire", "Rainbow Six", "Valorant"],
        correctIndex: 0
    },
    {
        question: "Qual é o mascote da FURIA?",
        options: ["Leão", "Tigre", "Pantera", "Águia"],
        correctIndex: 2
    },
    {
        question: "Qual foi o primeiro Major de CS:GO que a FURIA participou?",
        options: ["FACEIT Major London 2018", "IEM Katowice Major 2019", "StarLadder Berlin Major 2019", "PGL Stockholm Major 2021"],
        correctIndex: 2
    }
];

// Abrir modal do Quiz
function openQuizModal() {
    if (quizState.completed) {
        showNotification("Você já completou o Quiz hoje!", "default");
        return;
    }
    
    const quizModal = document.getElementById('quizModal');
    if (!quizModal) return;
    
    // Reiniciar estado do quiz
    quizState = {
        currentQuiz: getRandomQuizQuestions(3),
        currentQuestion: 0,
        score: 0,
        selectedOption: null,
        completed: false
    };
    
    // Mostrar primeira pergunta
    showQuizQuestion();
    
    // Mostrar modal
    quizModal.style.display = 'flex';
}

// Selecionar perguntas aleatórias do quiz
function getRandomQuizQuestions(count) {
    const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Mostrar pergunta atual
function showQuizQuestion() {
    if (!quizState.currentQuiz) return;
    
    const questionElement = document.getElementById('question');
    const optionsElements = document.querySelectorAll('.quiz-option');
    const nextButton = document.getElementById('quizNextBtn');
    
    // Resetar seleção
    quizState.selectedOption = null;
    nextButton.disabled = true;
    
    // Atualizar progresso
    updateQuizProgress();
    
    // Obter pergunta atual
    const currentQ = quizState.currentQuiz[quizState.currentQuestion];
    
    // Atualizar texto da pergunta
    questionElement.textContent = currentQ.question;
    
    // Atualizar opções
    optionsElements.forEach((option, index) => {
        option.textContent = currentQ.options[index];
        option.className = 'quiz-option';
        option.onclick = function() {
            selectOption(this, index);
        };
    });
}

// Atualizar barra de progresso do quiz
function updateQuizProgress() {
    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3')
    ];
    
    steps.forEach((step, index) => {
        if (index < quizState.currentQuestion) {
            // Pergunta já respondida
            step.className = quizState.currentQuiz[index].correct ? 'progress-step correct' : 'progress-step incorrect';
        } else if (index === quizState.currentQuestion) {
            // Pergunta atual
            step.className = 'progress-step active';
        } else {
            // Pergunta futura
            step.className = 'progress-step';
        }
    });
}

// Selecionar opção no quiz
function selectOption(optionElement, optionIndex) {
    // Desmarcar todas as opções
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Marcar a opção selecionada
    optionElement.classList.add('selected');
    
    // Salvar seleção
    quizState.selectedOption = optionIndex;
    
    // Habilitar botão de próxima
    document.getElementById('quizNextBtn').disabled = false;
}

// Avançar para próxima pergunta
function nextQuestion() {
    if (quizState.selectedOption === null) return;
    
    // Verificar resposta
    const currentQ = quizState.currentQuiz[quizState.currentQuestion];
    const isCorrect = quizState.selectedOption === currentQ.correctIndex;
    
    // Salvar resultado da questão
    currentQ.correct = isCorrect;
    
    // Adicionar pontuação
    if (isCorrect) {
        quizState.score += MINIGAMES_CONFIG.quiz.xpReward;
    }
    
    // Marcar visualmente a resposta
    const options = document.querySelectorAll('.quiz-option');
    options[currentQ.correctIndex].classList.add('correct');
    
    if (!isCorrect) {
        options[quizState.selectedOption].classList.add('incorrect');
    }
    
    // Desabilitar cliques nas opções
    options.forEach(opt => {
        opt.onclick = null;
    });
    
    // Desabilitar botão de próxima
    document.getElementById('quizNextBtn').disabled = true;
    
    // Esperar um pouco e avançar
    setTimeout(() => {
        quizState.currentQuestion++;
        
        // Verificar se acabou
        if (quizState.currentQuestion >= quizState.currentQuiz.length) {
            finishQuiz();
        } else {
            showQuizQuestion();
        }
    }, 1500);
}

// Finalizar quiz
function finishQuiz() {
    const quizModal = document.getElementById('quizModal');
    if (!quizModal) return;
    
    // Verificar se o quiz foi perfeito
    const isPerfect = quizState.currentQuiz.every(q => q.correct);
    
    // Se foi perfeito, disparar evento e adicionar XP bônus
    if (isPerfect) {
        // Adicionar pontuação de perfeito
        quizState.score += MINIGAMES_CONFIG.quiz.perfectXpReward;
        
        // Disparar evento para o sistema de gamificação
        document.dispatchEvent(new CustomEvent('quizPerfect'));
    }
    
    // Completar jogo
    completeGame('quiz', quizState.score);
    
    // Fechar modal
    closeModal('quizModal');
}

// Fechar modal do Quiz
function closeQuizModal() {
    closeModal('quizModal');
}

// ======================================================
// IMPLEMENTAÇÃO DO JOGO DE PALAVRA DO DIA
// ======================================================

// Palavras do jogo
const wordGameData = [
    {
        word: "VALORANT",
        hint: "Jogo FPS da Riot Games onde a FURIA tem uma equipe competitiva"
    },
    {
        word: "CSGO",
        hint: "Principal modalidade de esports da FURIA"
    },
    {
        word: "KSCERATO",
        hint: "Um dos jogadores mais conhecidos de CS:GO da FURIA"
    },
    {
        word: "FURIA",
        hint: "Nome da organização de esports brasileira"
    },
    {
        word: "PANTERA",
        hint: "Animal que representa o mascote da FURIA"
    }
];

// Abrir modal da Palavra do Dia
function openWordGameModal() {
    if (wordState.completed) {
        showNotification("Você já completou a Palavra do Dia hoje!", "default");
        return;
    }
    
    const wordGameModal = document.getElementById('wordGameModal');
    if (!wordGameModal) return;
    
    // Inicializar palavra do dia
    initWordOfTheDay();
    
    // Mostrar modal
    wordGameModal.style.display = 'flex';
    
    // Focar no input
    setTimeout(() => {
        const wordInput = document.getElementById('wordInput');
        if (wordInput) wordInput.focus();
    }, 300);
}

// Inicializar palavra do dia
function initWordOfTheDay() {
    // Pegar a data para usar como seed
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Selecionar palavra baseada na data (pseudoaleatória)
    const wordIndex = seed % wordGameData.length;
    wordState.currentWord = wordGameData[wordIndex];
    
    // Atualizar dica
    const hintElement = document.getElementById('wordHint');
    if (hintElement) {
        hintElement.textContent = wordState.currentWord.hint;
    }
    
    // Criar letras da palavra (em branco)
    updateWordLetters(true);
}

// Atualizar exibição das letras da palavra
function updateWordLetters(blank = false) {
    if (!wordState.currentWord) return;
    
    const lettersContainer = document.getElementById('wordLetters');
    if (!lettersContainer) return;
    
    // Limpar container
    lettersContainer.innerHTML = '';
    
    // Adicionar uma caixa para cada letra
    for (let i = 0; i < wordState.currentWord.word.length; i++) {
        const letterBox = document.createElement('div');
        letterBox.className = 'letter-box';
        
        // Se não for para mostrar em branco, mostrar letra
        if (!blank) {
            letterBox.textContent = wordState.currentWord.word.charAt(i);
        }
        
        lettersContainer.appendChild(letterBox);
    }
}

// Verificar resposta da palavra do dia
function checkWordAnswer() {
    const wordInput = document.getElementById('wordInput');
    if (!wordInput || !wordState.currentWord) return;
    
    // Obter resposta e normalizar
    const answer = wordInput.value.trim().toUpperCase();
    const correctWord = wordState.currentWord.word.toUpperCase();
    
    // Verificar se está correto
    if (answer === correctWord) {
        // Mostrar palavra correta
        updateWordLetters(false);
        
        // Mostrar notificação
        showNotification("Palavra correta! Parabéns!", "success");
        
        // Completar jogo
        completeGame('word', MINIGAMES_CONFIG.word.xpReward);
        
        // Fechar modal após um tempo
        setTimeout(() => {
            closeModal('wordGameModal');
        }, 2000);
    } else {
        // Mostrar erro
        showNotification("Tente novamente!", "error");
        
        // Aplicar efeito de shake no input
        wordInput.classList.add('shake');
        setTimeout(() => {
            wordInput.classList.remove('shake');
        }, 500);
        
        // Limpar input
        wordInput.value = '';
        wordInput.focus();
    }
}

// Fechar modal da Palavra do Dia
function closeWordGameModal() {
    closeModal('wordGameModal');
}

// ======================================================
// IMPLEMENTAÇÃO DA PREVISÃO DE PARTIDAS
// ======================================================

// Partidas para previsão
const matchPredictionData = [
    {
        id: "match1",
        tournament: "ESL Pro League",
        date: "30 de Abril",
        team1: "FURIA",
        team2: "Team Liquid"
    },
    {
        id: "match2",
        tournament: "BLAST Premier",
        date: "2 de Maio",
        team1: "FURIA",
        team2: "Navi"
    }
];

// Abrir modal de Previsão de Partidas
function openPredictionModal() {
    if (predictionState.completed) {
        showNotification("Você já fez suas previsões hoje!", "default");
        return;
    }
    
    const predictionModal = document.getElementById('predictionModal');
    if (!predictionModal) return;
    
    // Reiniciar previsões
    predictionState.predictions = {};
    
    // Mostrar modal
    predictionModal.style.display = 'flex';
}

// Selecionar previsão
function selectPrediction(predictionElement, predictionValue) {
    // Obter card de partida
    const matchCard = predictionElement.closest('.match-card');
    if (!matchCard) return;
    
    // Obter ID da partida
    const matchId = matchCard.getAttribute('data-match-id') || `match${Math.random()}`;
    
    // Desmarcar todas as opções deste card
    matchCard.querySelectorAll('.prediction-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Marcar a opção selecionada
    predictionElement.classList.add('selected');
    
    // Salvar previsão
    predictionState.predictions[matchId] = predictionValue;
}

// Enviar previsões
function submitPredictions() {
    // Verificar se pelo menos uma previsão foi feita
    if (Object.keys(predictionState.predictions).length === 0) {
        showNotification("Faça pelo menos uma previsão!", "error");
        return;
    }
    
    // Calcular score (15 XP base + 0 XP por previsão porque o resultado só será conhecido depois)
    const score = MINIGAMES_CONFIG.prediction.xpReward;
    
    // Completar jogo
    completeGame('prediction', score);
    
    // Fechar modal
    closeModal('predictionModal');
}

// Fechar modal de Previsão de Partidas
function closePredictionModal() {
    closeModal('predictionModal');
}

// ======================================================
// FUNÇÕES UTILITÁRIAS
// ======================================================

// Fechar qualquer modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Exportar funções para uso global
window.openQuizModal = openQuizModal;
window.closeQuizModal = closeQuizModal;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;

window.openWordGameModal = openWordGameModal;
window.closeWordGameModal = closeWordGameModal;
window.checkWordAnswer = checkWordAnswer;

window.openPredictionModal = openPredictionModal;
window.closePredictionModal = closePredictionModal;
window.selectPrediction = selectPrediction;
window.submitPredictions = submitPredictions;