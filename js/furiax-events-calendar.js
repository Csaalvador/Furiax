// FURIAX - Sistema de Eventos e Calendário
// Responsável por gerenciar eventos, partidas e integração com calendário

// Configurações
const EVENTS_CONFIG = {
    STORAGE_KEY: 'furiax_events',
    CALENDAR_KEY: 'furiax_calendar',
    REGISTRATION_KEY: 'furiax_event_registrations',
    REMINDER_KEY: 'furiax_event_reminders',
    CATEGORIES: {
        MATCH: { name: 'Partida', icon: 'fas fa-gamepad', color: '#1e90ff' },
        MEET: { name: 'Encontro', icon: 'fas fa-users', color: '#00cc66' },
        TOURNAMENT: { name: 'Torneio', icon: 'fas fa-trophy', color: '#ffc107' },
        RELEASE: { name: 'Lançamento', icon: 'fas fa-tag', color: '#ff3b5c' },
        STREAM: { name: 'Transmissão', icon: 'fas fa-video', color: '#9c27b0' }
    },
    CHECK_INTERVAL: 60000 // 1 minuto
};

// Estado do sistema de eventos
let eventsState = {
    upcomingEvents: [],
    userRegistrations: {},
    userReminders: [],
    lastCheck: 0
};

// Inicializar sistema
document.addEventListener('DOMContentLoaded', () => {
    initEventsSystem();
    
    // Verificar eventos a cada intervalo
    setInterval(checkUpcomingEvents, EVENTS_CONFIG.CHECK_INTERVAL);
});

// Inicializar o sistema de eventos
function initEventsSystem() {
    // Inicializar eventos
    initEvents();
    
    // Carregar registros do usuário
    loadUserEventData();
    
    // Verificar eventos próximos
    checkUpcomingEvents();
    
    // Adicionar página de eventos
    addEventsPage();
    
    // Adicionar calendário à página de eventos
    addCalendarToEvents();
    
    // Configurar escuta de eventos
    setupEventsListeners();
}

// Inicializar eventos
function initEvents() {
    const events = getFromStorage(EVENTS_CONFIG.STORAGE_KEY, null);
    
    if (!events) {
        // Criar eventos padrão
        const defaultEvents = [
            // Partidas
            {
                id: 'match-001',
                title: 'FURIA vs Liquid',
                description: 'BLAST Premier: Spring Finals 2025',
                category: 'MATCH',
                location: 'Online',
                startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias no futuro
                endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +2 horas
                streamUrl: 'https://www.twitch.tv/furiatv',
                imageUrl: '/api/placeholder/600/300',
                importance: 'high',
                opponent: 'Team Liquid',
                tournamentStage: 'Semifinal',
                createdAt: Date.now()
            },
            {
                id: 'match-002',
                title: 'FURIA vs NAVI',
                description: 'ESL Pro League Season 21',
                category: 'MATCH',
                location: 'LAN - Copenhague, Dinamarca',
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias no futuro
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +2 horas
                streamUrl: 'https://www.twitch.tv/esl_csgo',
                imageUrl: '/api/placeholder/600/300',
                importance: 'high',
                opponent: 'Natus Vincere',
                tournamentStage: 'Quartas de Final',
                createdAt: Date.now()
            },
            // Encontros
            {
                id: 'meet-001',
                title: 'Encontro de fãs em São Paulo',
                description: 'Evento oficial com os jogadores da FURIA CS:GO e equipe de conteúdo. Sessão de autógrafos, fotos e muito mais!',
                category: 'MEET',
                location: 'Shopping Eldorado - São Paulo, SP',
                startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias no futuro
                endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // +6 horas
                streamUrl: null,
                imageUrl: '/api/placeholder/600/300',
                importance: 'medium',
                capacity: 500,
                registrationRequired: true,
                registrationEndDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia antes
                createdAt: Date.now()
            },
            // Lançamentos
            {
                id: 'release-001',
                title: 'Nova coleção FURIA Major 2025',
                description: 'Lançamento da nova linha de produtos para o próximo Major. Camisetas, moletons, bonés e mais!',
                category: 'RELEASE',
                location: 'Loja online',
                startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias no futuro
                endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // mesmo dia
                streamUrl: 'https://www.instagram.com/furiagg/',
                imageUrl: '/api/placeholder/600/300',
                importance: 'medium',
                storeUrl: 'https://furiagg.com/loja',
                createdAt: Date.now()
            },
            // Transmissões
            {
                id: 'stream-001',
                title: 'Live especial com arT e KSCERATO',
                description: 'Bate-papo exclusivo sobre a preparação para o próximo Major. Perguntas dos fãs serão respondidas ao vivo!',
                category: 'STREAM',
                location: 'Online',
                startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias no futuro
                endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +2 horas
                streamUrl: 'https://www.twitch.tv/furiatv',
                imageUrl: '/api/placeholder/600/300',
                importance: 'medium',
                createdAt: Date.now()
            },
            // Torneios
            {
                id: 'tournament-001',
                title: 'Major CS2 Brasil 2025',
                description: 'O maior torneio de CS2 do mundo chega ao Brasil pela primeira vez! FURIA jogará em casa pelo título.',
                category: 'TOURNAMENT',
                location: 'Allianz Parque - São Paulo, SP',
                startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias no futuro
                endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(), // +7 dias
                streamUrl: 'https://www.twitch.tv/esl_csgo',
                imageUrl: '/api/placeholder/600/300',
                importance: 'high',
                ticketsUrl: 'https://major2025.com/tickets',
                createdAt: Date.now()
            }
        ];
        
        // Salvar eventos
        saveToStorage(EVENTS_CONFIG.STORAGE_KEY, defaultEvents);
    }
}

// Carregar dados de eventos do usuário
function loadUserEventData() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Carregar registros
    const registrations = getFromStorage(EVENTS_CONFIG.REGISTRATION_KEY, {});
    eventsState.userRegistrations = registrations[user.id] || {};
    
    // Carregar lembretes
    const reminders = getFromStorage(EVENTS_CONFIG.REMINDER_KEY, {});
    eventsState.userReminders = reminders[user.id] || [];
}

// Verificar eventos próximos
function checkUpcomingEvents() {
    const now = Date.now();
    
    // Evitar verificações muito próximas
    if (now - eventsState.lastCheck < 30000) return;
    
    // Atualizar timestamp
    eventsState.lastCheck = now;
    
    // Obter todos os eventos
    const events = getFromStorage(EVENTS_CONFIG.STORAGE_KEY, []);
    
    // Filtrar eventos futuros
    const futureEvents = events.filter(event => {
        const startDate = new Date(event.startDate).getTime();
        return startDate > now;
    });
    
    // Ordenar por data
    futureEvents.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    
    // Atualizar estado
    eventsState.upcomingEvents = futureEvents;
    
    // Verificar eventos próximos para notificações
    checkEventReminders(futureEvents);
    
    // Atualizar UI se página de eventos estiver aberta
    updateEventsUI();
}

// Verificar lembretes de eventos
function checkEventReminders(events) {
    const user = getCurrentUser();
    if (!user) return;
    
    const now = Date.now();
    const reminders = getFromStorage(EVENTS_CONFIG.REMINDER_KEY, {});
    const userReminders = reminders[user.id] || [];
    
    // Verificar eventos com lembrete ativo
    events.forEach(event => {
        const eventStart = new Date(event.startDate).getTime();
        const timeUntilEvent = eventStart - now;
        
        // Verificar se o evento começa em menos de 1 hora e tem lembrete
        if (timeUntilEvent > 0 && timeUntilEvent < 60 * 60 * 1000) {
            // Verificar se o usuário configurou lembrete
            if (userReminders.includes(event.id)) {
                // Verificar se já notificou (para não mostrar múltiplas vezes)
                const notifiedKey = `notified_${event.id}`;
                if (!localStorage.getItem(notifiedKey)) {
                    // Mostrar notificação
                    showEventReminderNotification(event);
                    
                    // Marcar como notificado
                    localStorage.setItem(notifiedKey, 'true');
                    
                    // Remover do array de lembretes
                    const index = userReminders.indexOf(event.id);
                    if (index !== -1) {
                        userReminders.splice(index, 1);
                    }
                }
            }
        }
    });
    
    // Atualizar lembretes do usuário
    reminders[user.id] = userReminders;
    saveToStorage(EVENTS_CONFIG.REMINDER_KEY, reminders);
}

// Mostrar notificação de lembrete
function showEventReminderNotification(event) {
    const category = EVENTS_CONFIG.CATEGORIES[event.category];
    
    const notification = document.createElement('div');
    notification.className = 'event-reminder-notification';
    notification.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.9); color: white; border-radius: 15px; padding: 25px; z-index: 2000; box-shadow: 0 0 30px rgba(${hexToRgb(category.color)}, 0.5); max-width: 400px; text-align: center;">
            <div style="margin-bottom: 20px; width: 70px; height: 70px; background: ${category.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i class="${category.icon}" style="font-size: 2rem; color: white;"></i>
            </div>
            <div style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; margin-bottom: 10px;">Evento em breve!</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: ${category.color}; margin-bottom: 15px;">${event.title}</div>
            <div style="font-size: 0.9rem; color: #ddd; margin-bottom: 15px;">${formatEventDate(event.startDate)}</div>
            <div style="font-size: 0.9rem; color: #aaa; margin-bottom: 20px;">${event.location}</div>
            
            ${event.streamUrl ? `
                <a href="${event.streamUrl}" target="_blank" style="display: inline-block; background: ${category.color}; color: white; padding: 8px 20px; border-radius: 20px; text-decoration: none; font-family: 'Orbitron', sans-serif; margin-bottom: 15px;">
                    <i class="fas fa-play-circle"></i> ASSISTIR
                </a>
            ` : ''}
            
            <button id="closeReminderBtn" style="background: rgba(255, 255, 255, 0.1); border: none; color: #aaa; padding: 8px 20px; border-radius: 20px; cursor: pointer; font-family: 'Orbitron', sans-serif; margin-top: 10px;">
                FECHAR
            </button>
        </div>
    `;
    
    // Adicionar ao corpo
    document.body.appendChild(notification);
    
    // Adicionar evento para fechar
    document.getElementById('closeReminderBtn').addEventListener('click', () => {
        notification.style.animation = 'fadeOut 0.5s ease-out forwards';
        
        // Adicionar animação de saída
        const exitStyle = document.createElement('style');
        exitStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(exitStyle);
        
        setTimeout(() => {
            notification.remove();
        }, 500);
    });
    
    // Reproduzir som
    playSound('notification');
}

// Reproduzir som
function playSound(sound) {
    const sounds = {
        notification: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3'
    };
    
    if (!sounds[sound]) return;
    
    const audio = new Audio(sounds[sound]);
    audio.volume = 0.3;
    audio.play();
}

// Adicionar página de eventos
function addEventsPage() {
    // Adicionar evento ao botão de eventos na sidebar
    const eventsButton = document.querySelector('.sidebar button:nth-child(5)');
    
    if (eventsButton) {
        eventsButton.addEventListener('click', showEventsPage);
    }
}

// Mostrar página de eventos
function showEventsPage() {
    // Criar página
    const eventsPage = document.createElement('div');
    eventsPage.className = 'events-page';
    eventsPage.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); z-index: 1500; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease-out;">
            <div style="background: linear-gradient(145deg, #111, #181818); border-radius: 15px; width: 90%; max-width: 1000px; height: 90vh; overflow: hidden; position: relative; animation: slideIn 0.4s ease-out; display: flex; flex-direction: column;">
                <div style="padding: 20px 30px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-family: 'Orbitron', sans-serif; color: #1e90ff; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-calendar"></i> Eventos e Calendário
                    </h2>
                    <button id="closeEventsPage" style="background: none; border: none; color: #777; font-size: 1.5rem; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="display: flex; height: calc(90vh - 70px);">
                    <!-- Painel esquerdo - Lista de eventos -->
                    <div style="flex: 1; padding: 20px; overflow-y: auto; border-right: 1px solid #333;">
                        <div style="margin-bottom: 20px; display: flex; gap: 10px;">
                            <button class="event-filter active" data-filter="all" style="flex: 1; padding: 8px; border: none; background: rgba(30, 144, 255, 0.1); color: #1e90ff; border-radius: 10px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 0.8rem;">TODOS</button>
                            <button class="event-filter" data-filter="MATCH" style="flex: 1; padding: 8px; border: none; background: rgba(255, 255, 255, 0.05); color: #aaa; border-radius: 10px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 0.8rem;">PARTIDAS</button>
                            <button class="event-filter" data-filter="MEET" style="flex: 1; padding: 8px; border: none; background: rgba(255, 255, 255, 0.05); color: #aaa; border-radius: 10px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 0.8rem;">ENCONTROS</button>
                            <button class="event-filter" data-filter="TOURNAMENT" style="flex: 1; padding: 8px; border: none; background: rgba(255, 255, 255, 0.05); color: #aaa; border-radius: 10px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 0.8rem;">TORNEIOS</button>
                        </div>
                        
                        <div class="events-list" id="eventsList">
                            <!-- Lista de eventos será preenchida dinamicamente -->
                            <div style="text-align: center; padding: 30px; color: #777;">
                                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px;"></i>
                                <p>Carregando eventos...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Painel direito - Calendário e detalhes -->
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <!-- Calendário -->
                        <div style="padding: 20px; border-bottom: 1px solid #333;" id="calendarContainer">
                            <!-- Calendário será adicionado aqui -->
                        </div>
                        
                        <!-- Detalhes do evento -->
                        <div style="flex: 1; padding: 20px; overflow-y: auto;" id="eventDetails">
                            <div style="text-align: center; padding: 30px; color: #777;">
                                <i class="fas fa-calendar-day" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.5;"></i>
                                <p>Selecione um evento para ver detalhes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Criar estilo para animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .event-filter {
            transition: all 0.3s;
        }
        
        .event-filter:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ddd !important;
        }
        
        .event-filter.active {
            background: rgba(30, 144, 255, 0.1) !important;
            color: #1e90ff !important;
        }
        
        .event-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            cursor: pointer;
            transition: all 0.3s;
            border-left: 3px solid transparent;
        }
        
        .event-card:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateX(5px);
        }
        
        .event-card.selected {
            background: rgba(30, 144, 255, 0.05);
            border-left-color: #1e90ff;
        }
        
        .calendar-day {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.3s;
        }
        
        .calendar-day:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .calendar-day.event {
            position: relative;
        }
        
        .calendar-day.event::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #1e90ff;
        }
        
        .calendar-day.today {
            background: rgba(30, 144, 255, 0.1);
            color: #1e90ff;
            font-weight: bold;
        }
        
        .calendar-day.selected {
            background: #1e90ff;
            color: white;
        }
        
        .event-action-btn {
            background: rgba(30, 144, 255, 0.1);
            border: 1px solid #1e90ff;
            color: #1e90ff;
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.8rem;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        .event-action-btn:hover {
            background: rgba(30, 144, 255, 0.2);
            transform: translateY(-2px);
        }
        
        .event-action-btn.registered {
            background: rgba(0, 204, 102, 0.1);
            border-color: #00cc66;
            color: #00cc66;
        }
        
        .event-action-btn.reminder-set {
            background: rgba(255, 152, 0, 0.1);
            border-color: #ff9800;
            color: #ff9800;
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar à página
    document.body.appendChild(eventsPage);
    
    // Configurar eventos
    document.getElementById('closeEventsPage').addEventListener('click', () => {
        eventsPage.style.animation = 'fadeOut 0.3s ease-out forwards';
        
        // Adicionar animação de saída
        const exitStyle = document.createElement('style');
        exitStyle.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(exitStyle);
        
        setTimeout(() => {
            eventsPage.remove();
        }, 300);
    });
    
    // Eventos de filtro
    const eventFilters = document.querySelectorAll('.event-filter');
    eventFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remover classe ativa de todos os filtros
            eventFilters.forEach(f => {
                f.classList.remove('active');
                f.style.background = 'rgba(255, 255, 255, 0.05)';
                f.style.color = '#aaa';
            });
            
            // Adicionar classe ativa ao filtro clicado
            filter.classList.add('active');
            filter.style.background = 'rgba(30, 144, 255, 0.1)';
            filter.style.color = '#1e90ff';
            
            // Filtrar eventos
            const filterValue = filter.dataset.filter;
            filterEvents(filterValue);
        });
    });
    
    // Carregar eventos
    loadEvents();
}

// Carregar eventos
function loadEvents() {
    // Obter eventos
    const events = getFromStorage(EVENTS_CONFIG.STORAGE_KEY, []);
    
    // Ordenar por data
    events.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    
    // Atualizar UI
    updateEventsListUI(events);
}

// Filtrar eventos
function filterEvents(filter) {
    // Obter eventos
    const events = getFromStorage(EVENTS_CONFIG.STORAGE_KEY, []);
    
    // Aplicar filtro
    let filteredEvents;
    if (filter === 'all') {
        filteredEvents = events;
    } else {
        filteredEvents = events.filter(event => event.category === filter);
    }
    
    // Ordenar por data
    filteredEvents.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    
    // Atualizar UI
    updateEventsListUI(filteredEvents);
}

// Atualizar UI da lista de eventos
function updateEventsListUI(events) {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    // Limpar lista
    eventsList.innerHTML = '';
    
    // Verificar se não há eventos
    if (events.length === 0) {
        eventsList.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #777;">
                <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Nenhum evento encontrado</p>
            </div>
        `;
        return;
    }
    
    // Adicionar eventos
    events.forEach(event => {
        const category = EVENTS_CONFIG.CATEGORIES[event.category];
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.dataset.id = event.id;
        
        // Verificar se passou
        const isPast = new Date(event.startDate) < new Date();
        
        eventCard.innerHTML = `
            <div style="display: flex; gap: 15px;">
                <div style="width: 40px; height: 40px; background: rgba(${hexToRgb(category.color)}, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: ${category.color}; flex-shrink: 0;">
                    <i class="${category.icon}"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 1rem; color: #ddd; margin-bottom: 5px;">${event.title}</div>
                    <div style="font-size: 0.8rem; color: #777; margin-bottom: 10px;">
                        <i class="far fa-calendar"></i> ${formatEventDate(event.startDate)}
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="font-size: 0.8rem; color: #aaa;">
                            <i class="fas fa-map-marker-alt"></i> ${event.location}
                        </div>
                        ${isPast ? `
                            <div style="font-size: 0.7rem; background: rgba(255, 59, 92, 0.1); color: #ff3b5c; padding: 3px 8px; border-radius: 10px;">
                                Encerrado
                            </div>
                        ` : `
                            <div style="font-size: 0.7rem; background: rgba(${hexToRgb(category.color)}, 0.1); color: ${category.color}; padding: 3px 8px; border-radius: 10px;">
                                ${category.name}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        eventsList.appendChild(eventCard);
        
        // Adicionar evento de clique
        eventCard.addEventListener('click', () => {
            // Remover seleção de todos os cards
            document.querySelectorAll('.event-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Selecionar este card
            eventCard.classList.add('selected');
            
            // Mostrar detalhes
            showEventDetails(event);
        });
    });
}

// Mostrar detalhes do evento
function showEventDetails(event) {
    const eventDetails = document.getElementById('eventDetails');
    if (!eventDetails) return;
    
    const category = EVENTS_CONFIG.CATEGORIES[event.category];
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const isPast = startDate < new Date();
    
    // Formatar datas
    const dateStr = formatEventFullDate(startDate, endDate);
    
    // Verificar se o usuário está registrado
    const isRegistered = checkEventRegistration(event.id);
    
    // Verificar se o usuário configurou lembrete
    const hasReminder = checkEventReminder(event.id);
    
    eventDetails.innerHTML = `
        <div style="padding: 20px; background: rgba(255, 255, 255, 0.02); border-radius: 15px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <div style="width: 40px; height: 40px; background: ${category.color}; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white;">
                    <i class="${category.icon}"></i>
                </div>
                <div style="font-size: 1.3rem; font-weight: bold; color: white;">${event.title}</div>
            </div>
            
            <div style="margin-bottom: 20px;">
                ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;">` : ''}
                
                <div style="font-size: 0.9rem; color: #ddd; margin-bottom: 20px; line-height: 1.5;">
                    ${event.description}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 10px;">
                    <div style="font-size: 0.8rem; color: #777; margin-bottom: 5px;">Data e Hora</div>
                    <div style="font-size: 0.9rem; color: #ddd; display: flex; align-items: center; gap: 8px;">
                        <i class="far fa-calendar-alt" style="color: ${category.color};"></i> ${dateStr}
                    </div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 10px;">
                    <div style="font-size: 0.8rem; color: #777; margin-bottom: 5px;">Local</div>
                    <div style="font-size: 0.9rem; color: #ddd; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-map-marker-alt" style="color: ${category.color};"></i> ${event.location}
                    </div>
                </div>
                
                ${event.opponent ? `
                    <div style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 0.8rem; color: #777; margin-bottom: 5px;">Adversário</div>
                        <div style="font-size: 0.9rem; color: #ddd; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-users" style="color: ${category.color};"></i> ${event.opponent}
                        </div>
                    </div>
                ` : ''}
                
                ${event.tournamentStage ? `
                    <div style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 0.8rem; color: #777; margin-bottom: 5px;">Fase do Torneio</div>
                        <div style="font-size: 0.9rem; color: #ddd; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-trophy" style="color: ${category.color};"></i> ${event.tournamentStage}
                        </div>
                    </div>
                ` : ''}
                
                ${event.capacity ? `
                    <div style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 0.8rem; color: #777; margin-bottom: 5px;">Capacidade</div>
                        <div style="font-size: 0.9rem; color: #ddd; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-users" style="color: ${category.color};"></i> ${event.capacity} pessoas
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
                ${event.streamUrl ? `
                    <a href="${event.streamUrl}" target="_blank" class="event-action-btn">
                        <i class="fas fa-play-circle"></i> Assistir Stream
                    </a>
                ` : ''}
                
                ${event.ticketsUrl ? `
                    <a href="${event.ticketsUrl}" target="_blank" class="event-action-btn">
                        <i class="fas fa-ticket-alt"></i> Comprar Ingressos
                    </a>
                ` : ''}
                
                ${event.storeUrl ? `
                    <a href="${event.storeUrl}" target="_blank" class="event-action-btn">
                        <i class="fas fa-shopping-cart"></i> Acessar Loja
                    </a>
                ` : ''}
                
                ${!isPast && event.registrationRequired ? `
                    <button id="registerBtn" class="event-action-btn ${isRegistered ? 'registered' : ''}">
                        <i class="fas ${isRegistered ? 'fa-check-circle' : 'fa-user-plus'}"></i> ${isRegistered ? 'Inscrito' : 'Inscrever-se'}
                    </button>
                ` : ''}
                
                ${!isPast ? `
                    <button id="reminderBtn" class="event-action-btn ${hasReminder ? 'reminder-set' : ''}">
                        <i class="fas ${hasReminder ? 'fa-bell-slash' : 'fa-bell'}"></i> ${hasReminder ? 'Remover Lembrete' : 'Lembrar-me'}
                    </button>
                ` : ''}
                
                <button id="shareEventBtn" class="event-action-btn">
                    <i class="fas fa-share-alt"></i> Compartilhar
                </button>
            </div>
        </div>
        
        ${event.category === 'MATCH' ? `
            <div style="background: rgba(255, 255, 255, 0.02); border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <div style="font-size: 1rem; color: #1e90ff; margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">Prévia da Partida</div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <div style="text-align: center; flex: 1;">
                        <div style="font-size: 2rem; color: #ddd; font-weight: bold; margin-bottom: 5px;">FURIA</div>
                        <div style="font-size: 0.8rem; color: #777;">Brasil</div>
                    </div>
                    
                    <div style="text-align: center; font-size: 1.5rem; color: #777; padding: 0 20px;">VS</div>
                    
                    <div style="text-align: center; flex: 1;">
                        <div style="font-size: 2rem; color: #ddd; font-weight: bold; margin-bottom: 5px;">${event.opponent}</div>
                        <div style="font-size: 0.8rem; color: #777;">Internacional</div>
                    </div>
                </div>
                
                <div style="font-size: 0.9rem; color: #aaa; line-height: 1.5; margin-bottom: 20px;">
                    A FURIA entra nesta partida após uma sequência de 3 vitórias consecutivas. O time tem mostrado uma forma excepcional, especialmente nas partidas de Mirage e Inferno. 
                    ${event.opponent} também chega com bons resultados, tendo vencido suas duas últimas partidas.
                </div>
                
                <div style="font-size: 0.9rem; color: #1e90ff; margin-bottom: 10px;">Histórico recente:</div>
                
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <div style="color: #ddd;">FURIA 16 - 10 ${event.opponent}</div>
                        <div style="color: #777;">2 meses atrás</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <div style="color: #ddd;">FURIA 13 - 16 ${event.opponent}</div>
                        <div style="color: #777;">4 meses atrás</div>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <div style="color: #ddd;">FURIA 16 - 8 ${event.opponent}</div>
                        <div style="color: #777;">7 meses atrás</div>
                    </div>
                </div>
                
                <div style="font-size: 0.8rem; color: #777; text-align: center;">
                    Não perca essa grande partida! Ligue o lembrete e acompanhe ao vivo.
                </div>
            </div>
        ` : ''}
        
        ${event.category === 'TOURNAMENT' ? `
            <div style="background: rgba(255, 255, 255, 0.02); border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                <div style="font-size: 1rem; color: #ffc107; margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">Informações do Torneio</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 0.8rem; color: #777; margin-bottom: 5px;">Premiação Total</div>
                        <div style="font-size: 1.1rem; color: #ffc107;">$1,000,000</div>
                    </div>
                    
                    <div style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 10px;">
                        <div style="font-size: 0.8rem; color: #777; margin-bottom: 5px;">Times Participantes</div>
                        <div style="font-size: 1.1rem; color: #ddd;">16 equipes</div>
                    </div>
                </div>
                
                <div style="font-size: 0.9rem; color: #aaa; line-height: 1.5; margin-bottom: 15px;">
                    Este será um dos maiores torneios do ano, reunindo as melhores equipes do mundo. A FURIA está no Grupo B junto com Team Liquid, Natus Vincere e FaZe Clan.
                </div>
                
                <div style="font-size: 0.9rem; color: #ffc107; margin-bottom: 10px;">Formato do Torneio:</div>
                
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 10px;">
                    <div style="margin-bottom: 10px;">
                        <div style="color: #ddd; margin-bottom: 5px;">Fase de Grupos (26-29 Maio)</div>
                        <div style="color: #aaa; font-size: 0.8rem;">Formato GSL, MD3</div>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <div style="color: #ddd; margin-bottom: 5px;">Quartas de Final (30-31 Maio)</div>
                        <div style="color: #aaa; font-size: 0.8rem;">Eliminação simples, MD3</div>
                    </div>
                    
                    <div>
                        <div style="color: #ddd; margin-bottom: 5px;">Semifinais e Final (1-2 Junho)</div>
                        <div style="color: #aaa; font-size: 0.8rem;">Semifinais MD3, Final MD5</div>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
    
    // Adicionar eventos
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            if (isRegistered) {
                cancelEventRegistration(event.id);
            } else {
                registerForEvent(event.id);
            }
            
            // Atualizar detalhes
            showEventDetails(event);
        });
    }
    
    const reminderBtn = document.getElementById('reminderBtn');
    if (reminderBtn) {
        reminderBtn.addEventListener('click', () => {
            if (hasReminder) {
                removeEventReminder(event.id);
            } else {
                setEventReminder(event.id);
            }
            
            // Atualizar detalhes
            showEventDetails(event);
        });
    }
    
    const shareEventBtn = document.getElementById('shareEventBtn');
    if (shareEventBtn) {
        shareEventBtn.addEventListener('click', () => {
            shareEvent(event);
        });
    }
}

// Verificar registro em evento
function checkEventRegistration(eventId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const registrations = getFromStorage(EVENTS_CONFIG.REGISTRATION_KEY, {});
    const userRegistrations = registrations[user.id] || {};
    
    return !!userRegistrations[eventId];
}

// Registrar para evento
function registerForEvent(eventId) {
    const user = getCurrentUser();
    if (!user) {
        showToast('É necessário estar logado para se inscrever em eventos.', 'error');
        return false;
    }
    
    // Obter eventos
    const events = getFromStorage(EVENTS_CONFIG.STORAGE_KEY, []);
    const event = events.find(e => e.id === eventId);
    
    if (!event) return false;
    
    // Verificar se o evento já passou
    if (new Date(event.startDate) < new Date()) {
        showToast('Este evento já ocorreu.', 'error');
        return false;
    }
    
    // Verificar se o registro ainda está aberto
    if (event.registrationEndDate && new Date(event.registrationEndDate) < new Date()) {
        showToast('As inscrições para este evento já foram encerradas.', 'error');
        return false;
    }
    
    // Obter registros
    const registrations = getFromStorage(EVENTS_CONFIG.REGISTRATION_KEY, {});
    
    // Inicializar registros do usuário se não existirem
    if (!registrations[user.id]) {
        registrations[user.id] = {};
    }
    
    // Registrar
    registrations[user.id][eventId] = {
        timestamp: Date.now(),
        eventId: eventId,
        eventTitle: event.title,
        eventDate: event.startDate
    };
    
    // Salvar
    saveToStorage(EVENTS_CONFIG.REGISTRATION_KEY, registrations);
    
    // Atualizar estado
    eventsState.userRegistrations = registrations[user.id];
    
    // Adicionar XP
    addUserXP(50);
    
    // Mostrar toast
    showToast('Inscrição realizada com sucesso!', 'success');
    
    // Verificar missões
    checkEventRegistrationMissions();
    
    return true;
}

// Cancelar registro em evento
function cancelEventRegistration(eventId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Obter registros
    const registrations = getFromStorage(EVENTS_CONFIG.REGISTRATION_KEY, {});
    
    // Verificar se usuário tem registros
    if (!registrations[user.id]) return false;
    
    // Verificar se está registrado neste evento
    if (!registrations[user.id][eventId]) return false;
    
    // Remover registro
    delete registrations[user.id][eventId];
    
    // Salvar
    saveToStorage(EVENTS_CONFIG.REGISTRATION_KEY, registrations);
    
    // Atualizar estado
    eventsState.userRegistrations = registrations[user.id];
    
    // Mostrar toast
    showToast('Inscrição cancelada.', 'info');
    
    return true;
}

// Verificar se tem lembrete para evento
function checkEventReminder(eventId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const reminders = getFromStorage(EVENTS_CONFIG.REMINDER_KEY, {});
    const userReminders = reminders[user.id] || [];
    
    return userReminders.includes(eventId);
}

// Configurar lembrete para evento
function setEventReminder(eventId) {
    const user = getCurrentUser();
    if (!user) {
        showToast('É necessário estar logado para configurar lembretes.', 'error');
        return false;
    }
    
    // Obter eventos
    const events = getFromStorage(EVENTS_CONFIG.STORAGE_KEY, []);
    const event = events.find(e => e.id === eventId);
    
    if (!event) return false;
    
    // Verificar se o evento já passou
    if (new Date(event.startDate) < new Date()) {
        showToast('Este evento já ocorreu.', 'error');
        return false;
    }
    
    // Obter lembretes
    const reminders = getFromStorage(EVENTS_CONFIG.REMINDER_KEY, {});
    
    // Inicializar lembretes do usuário se não existirem
    if (!reminders[user.id]) {
        reminders[user.id] = [];
    }
    
    // Verificar se já tem lembrete
    if (reminders[user.id].includes(eventId)) return false;
    
    // Adicionar lembrete
    reminders[user.id].push(eventId);
    
    // Salvar
    saveToStorage(EVENTS_CONFIG.REMINDER_KEY, reminders);
    
    // Atualizar estado
    eventsState.userReminders = reminders[user.id];
    
    // Mostrar toast
    showToast('Lembrete configurado com sucesso!', 'success');
    
    return true;
}

// Remover lembrete para evento
function removeEventReminder(eventId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Obter lembretes
    const reminders = getFromStorage(EVENTS_CONFIG.REMINDER_KEY, {});
    
    // Verificar se usuário tem lembretes
    if (!reminders[user.id]) return false;
    
    // Verificar se tem lembrete para este evento
    const index = reminders[user.id].indexOf(eventId);
    if (index === -1) return false;
    
    // Remover lembrete
    reminders[user.id].splice(index, 1);
    
    // Salvar
    saveToStorage(EVENTS_CONFIG.REMINDER_KEY, reminders);
    
    // Atualizar estado
    eventsState.userReminders = reminders[user.id];
    
    // Mostrar toast
    showToast('Lembrete removido.', 'info');
    
    return true;
}

// Compartilhar evento
function shareEvent(event) {
    // Em uma aplicação real, isso abriria opções de compartilhamento
    const shareText = `${event.title} - ${formatEventDate(event.startDate)} - ${event.location} | Via FURIAX`;
    
    // Simular compartilhamento
    const shareDialog = document.createElement('div');
    shareDialog.className = 'share-dialog';
    shareDialog.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.9); color: white; border-radius: 15px; padding: 25px; z-index: 2000; max-width: 400px; text-align: center;">
            <div style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; margin-bottom: 15px;">Compartilhar Evento</div>
            
            <div style="padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; color: #ddd; text-align: left; margin-bottom: 20px;">
                ${shareText}
            </div>
            
            <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                <button class="share-btn" style="width: 50px; height: 50px; border-radius: 50%; border: none; background: #1DA1F2; color: white; font-size: 1.2rem; cursor: pointer;">
                    <i class="fab fa-twitter"></i>
                </button>
                <button class="share-btn" style="width: 50px; height: 50px; border-radius: 50%; border: none; background: #4267B2; color: white; font-size: 1.2rem; cursor: pointer;">
                    <i class="fab fa-facebook-f"></i>
                </button>
                <button class="share-btn" style="width: 50px; height: 50px; border-radius: 50%; border: none; background: #25D366; color: white; font-size: 1.2rem; cursor: pointer;">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <button class="share-btn" style="width: 50px; height: 50px; border-radius: 50%; border: none; background: #333; color: white; font-size: 1.2rem; cursor: pointer;">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            
            <button id="closeShareDialog" style="background: rgba(255, 255, 255, 0.1); border: none; color: #aaa; padding: 8px 20px; border-radius: 20px; cursor: pointer; font-family: 'Orbitron', sans-serif;">
                CANCELAR
            </button>
        </div>
    `;
    
    // Adicionar ao corpo
    document.body.appendChild(shareDialog);
    
    // Adicionar eventos
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Simular compartilhamento
            showToast('Evento compartilhado com sucesso!', 'success');
            
            // Fechar diálogo
            shareDialog.remove();
        });
    });
    
    document.getElementById('closeShareDialog').addEventListener('click', () => {
        shareDialog.remove();
    });
}

// Verificar missões de registro em eventos
function checkEventRegistrationMissions() {
    // No futuro, podemos implementar missões específicas para eventos
}

// Formatar data de evento
function formatEventDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('pt-BR', options);
}

// Formatar data completa de evento
function formatEventFullDate(startDate, endDate) {
    // Verificar se é no mesmo dia
    const sameDay = startDate.getDate() === endDate.getDate() && 
                    startDate.getMonth() === endDate.getMonth() &&
                    startDate.getFullYear() === endDate.getFullYear();
    
    // Formatar
    if (sameDay) {
        // No mesmo dia, mostrar apenas horário de início e fim
        return `${startDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })} • ${startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        // Dias diferentes
        return `${startDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} ${startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} ${endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
}

// ======================================================
// COMPONENTE DE CALENDÁRIO
// ======================================================

// Adicionar calendário à página de eventos
function addCalendarToEvents() {
    const calendarContainer = document.getElementById('calendarContainer');
    if (!calendarContainer) return;
    
    // Obter data atual
    const now = new Date();
    
    // Renderizar calendário
    renderCalendar(calendarContainer, now.getMonth(), now.getFullYear());
}

// Renderizar calendário
function renderCalendar(container, month, year) {
    // Obter eventos
    const events = getFromStorage(EVENTS_CONFIG.STORAGE_KEY, []);
    
    // Data atual
    const today = new Date();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    // Dia da semana do primeiro dia (0 = Domingo, 6 = Sábado)
    const firstDayOfWeek = firstDay.getDay();
    
    // Número de dias no mês
    const daysInMonth = lastDay.getDate();
    
    // Nomes dos meses
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    // Nomes dos dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // HTML do calendário
    let calendarHTML = `
        <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <button id="prevMonth" style="background: none; border: none; color: #777; cursor: pointer; font-size: 1.2rem;">
                <i class="fas fa-chevron-left"></i>
            </button>
            
            <div style="font-family: 'Orbitron', sans-serif; color: #1e90ff; font-size: 1.2rem;">
                ${monthNames[month]} ${year}
            </div>
            
            <button id="nextMonth" style="background: none; border: none; color: #777; cursor: pointer; font-size: 1.2rem;">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center;">
    `;
    
    // Dias da semana
    weekDays.forEach(day => {
        calendarHTML += `
            <div style="padding: 5px; font-size: 0.8rem; color: #777;">${day}</div>
        `;
    });
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarHTML += `<div></div>`;
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        
        // Verificar se tem eventos neste dia
        const hasEvents = events.some(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getDate() === day && 
                   eventDate.getMonth() === month && 
                   eventDate.getFullYear() === year;
        });
        
        // Verificar se é hoje
        const isToday = today.getDate() === day && 
                        today.getMonth() === month && 
                        today.getFullYear() === year;
        
        calendarHTML += `
            <div class="calendar-day ${hasEvents ? 'event' : ''} ${isToday ? 'today' : ''}" data-date="${date.toISOString()}" style="padding: 5px; font-size: 0.9rem; color: ${hasEvents ? '#ddd' : '#aaa'};">
                ${day}
            </div>
        `;
    }
    
    calendarHTML += `</div>`;
    
    // Adicionar ao container
    container.innerHTML = calendarHTML;
    
    // Adicionar eventos
    // - Botão de mês anterior
    document.getElementById('prevMonth').addEventListener('click', () => {
        let newMonth = month - 1;
        let newYear = year;
        
        if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        }
        
        renderCalendar(container, newMonth, newYear);
    });
    
    // - Botão de próximo mês
    document.getElementById('nextMonth').addEventListener('click', () => {
        let newMonth = month + 1;
        let newYear = year;
        
        if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        }
        
        renderCalendar(container, newMonth, newYear);
    });
    
    // - Clique nos dias
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.addEventListener('click', () => {
            // Remover seleção de todos os dias
            document.querySelectorAll('.calendar-day').forEach(d => {
                d.classList.remove('selected');
            });
            
            // Selecionar este dia
            day.classList.add('selected');
            
            // Filtrar eventos deste dia
            if (day.dataset.date) {
                const selectedDate = new Date(day.dataset.date);
                filterEventsByDate(selectedDate);
            }
        });
    });
}

// Filtrar eventos por data
function filterEventsByDate(date) {
    // Obter eventos
    const events = getFromStorage(EVENTS_CONFIG.STORAGE_KEY, []);
    
    // Filtrar eventos deste dia
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getDate() === date.getDate() && 
               eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
    });
    
    // Ordenar por hora
    filteredEvents.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    
    // Atualizar UI
    updateEventsListUI(filteredEvents);
    
    // Resetar filtros
    document.querySelectorAll('.event-filter').forEach(filter => {
        filter.classList.remove('active');
        filter.style.background = 'rgba(255, 255, 255, 0.05)';
        filter.style.color = '#aaa';
    });
    
    // Ativar filtro "Todos"
    const allFilter = document.querySelector('.event-filter[data-filter="all"]');
    if (allFilter) {
        allFilter.classList.add('active');
        allFilter.style.background = 'rgba(30, 144, 255, 0.1)';
        allFilter.style.color = '#1e90ff';
    }
}

// Atualizar UI de eventos
function updateEventsUI() {
    // Atualizar lista de eventos se estiver aberta
    const eventsList = document.getElementById('eventsList');
    if (eventsList) {
        // Obter filtro ativo
        const activeFilter = document.querySelector('.event-filter.active');
        if (activeFilter) {
            const filter = activeFilter.dataset.filter;
            filterEvents(filter);
        } else {
            loadEvents();
        }
    }
}

// Configurar escuta de eventos
function setupEventsListeners() {
    // Botão de eventos na sidebar
    const eventsButton = document.querySelector('.sidebar button:nth-child(5)');
    if (eventsButton) {
        eventsButton.addEventListener('click', showEventsPage);
    }
}

// Exportar funções
window.showEventsPage = showEventsPage;