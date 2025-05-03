// FURIAX - Gerenciador de Feed Inteligente
// Sistema responsável por gerenciar, personalizar e organizar o feed de posts

// Constantes de configuração
const FEED_CONFIG = {
    DEFAULT_POSTS_PER_LOAD: 10,
    MAX_POSTS_IN_MEMORY: 100,
    POST_REFRESH_INTERVAL: 60000, // 1 minuto
    SORT_OPTIONS: ['newest', 'popular', 'trending', 'relevant']
};

// Estado do feed
let feedState = {
    currentFilter: null,
    currentSort: 'newest',
    lastPostTimestamp: 0,
    isLoading: false,
    hasMorePosts: true,
    currentPage: 1,
    postsPerPage: FEED_CONFIG.DEFAULT_POSTS_PER_LOAD
};

// Inicializar o gerenciador de feed
document.addEventListener('DOMContentLoaded', () => {
    initFeedManager();
});

// Inicializar o gerenciador
function initFeedManager() {
    // Adicionar controles de feed
    addFeedControls();
    
    // Inicializar o feed
    initializeFeed();
    
    // Adicionar verificação periódica de novos posts
    setInterval(checkForNewPosts, FEED_CONFIG.POST_REFRESH_INTERVAL);
    
    // Configurar eventos
    setupFeedEventListeners();
}

// Adicionar controles do feed
function addFeedControls() {
    const feedColumn = document.querySelector('.feed-column');
    if (!feedColumn) return;
    
    // Criar controle
    
    // Inserir antes do post creation
    const createPostElement = feedColumn.querySelector('.create-post');
    feedColumn.insertBefore(feedControls, createPostElement);
    
    // Adicionar estilos
    const style = document.createElement('style');
    style.textContent = `
        .feed-filter:hover, .sort-button:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ddd !important;
        }
        .feed-filter.active {
            background: rgba(30, 144, 255, 0.1) !important;
            border-color: #1e90ff !important;
            color: #1e90ff !important;
        }
        .sort-dropdown {
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        .sort-option:hover {
            background: rgba(30, 144, 255, 0.1);
            color: #1e90ff;
        }
        .feed-loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
        .feed-load-more {
            text-align: center;
            padding: 15px;
            margin-top: 10px;
        }
        .load-more-btn {
            background: rgba(30, 144, 255, 0.1);
            border: 1px solid #1e90ff;
            color: #1e90ff;
            padding: 8px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-family: 'Orbitron', sans-serif;
            transition: all 0.3s;
        }
        .load-more-btn:hover {
            background: rgba(30, 144, 255, 0.2);
            transform: translateY(-2px);
        }
        .post-card.new-post {
            animation: highlightNewPost 2s ease-out;
            border-color: #1e90ff;
        }
        @keyframes highlightNewPost {
            0% { box-shadow: 0 0 20px rgba(30, 144, 255, 0.7); }
            100% { box-shadow: none; }
        }
    `;
    document.head.appendChild(style);
}

// Inicializar o feed
function initializeFeed(resetState = true) {
    if (resetState) {
        // Resetar o estado do feed
        feedState = {
            currentFilter: null,
            currentSort: 'newest',
            lastPostTimestamp: 0,
            isLoading: false,
            hasMorePosts: true,
            currentPage: 1,
            postsPerPage: FEED_CONFIG.DEFAULT_POSTS_PER_LOAD
        };
    }
    
    // Obter container de posts
    const postsContainer = document.getElementById('postsFeed');
    if (!postsContainer) return;
    
    // Mostrar indicador de carregamento
    showLoadingIndicator(postsContainer);
    
    // Marcar como carregando
    feedState.isLoading = true;
    
    // Simular delay de rede (em aplicação real isso seria uma chamada de API)
    setTimeout(() => {
        // Limpar container se for a primeira página
        if (feedState.currentPage === 1) {
            postsContainer.innerHTML = '';
        }
        
        // Carregar posts
        const posts = loadPosts();
        
        // Remover indicador de carregamento
        removeLoadingIndicator();
        
        // Verificar se há posts
        if (posts.length === 0 && feedState.currentPage === 1) {
            showEmptyFeedMessage(postsContainer);
            feedState.hasMorePosts = false;
            return;
        }
        
        // Verificar se chegamos ao fim dos posts
        if (posts.length < feedState.postsPerPage) {
            feedState.hasMorePosts = false;
        }
        
        // Adicionar posts ao container
        posts.forEach(post => {
            const postCard = createPostCard(post);
            postsContainer.appendChild(postCard);
        });
        
        // Adicionar botão "Carregar mais" se houver mais posts
        if (feedState.hasMorePosts) {
            addLoadMoreButton(postsContainer);
        } else if (feedState.currentPage > 1) {
            // Adicionar indicador de fim do feed
            addEndOfFeedIndicator(postsContainer);
        }
        
        // Atualizar estado
        feedState.isLoading = false;
        
        // Atualizar timestamp do último post
        if (posts.length > 0) {
            feedState.lastPostTimestamp = Math.max(...posts.map(p => p.timestamp));
        }
    }, 600); // Simular delay de rede
}

// Carregar posts com base nos filtros e ordenação atuais
function loadPosts() {
    // Obter todos os posts do localStorage
    let posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    
    // Aplicar filtro, se houver
    if (feedState.currentFilter) {
        switch (feedState.currentFilter) {
            case 'popular':
                // Filtrar posts com mais de 50 likes
                posts = posts.filter(post => post.likes > 50);
                break;
            case 'official':
                // Filtrar posts de contas oficiais
                posts = posts.filter(post => post.author.includes('FURIA') || post.author.includes('Official'));
                break;
        }
    }
    
    // Aplicar ordenação
    switch (feedState.currentSort) {
        case 'newest':
            // Ordenar por data (mais recentes primeiro)
            posts.sort((a, b) => b.timestamp - a.timestamp);
            break;
        case 'popular':
            // Ordenar por likes (mais curtidos primeiro)
            posts.sort((a, b) => b.likes - a.likes);
            break;
        case 'trending':
            // Ordenar por "tendência" (combinação de recência e popularidade)
            posts.sort((a, b) => {
                // Calcular score de tendência (likes * fator de recência)
                const now = Date.now();
                const scoreA = a.likes * (1 + 1/(1 + (now - a.timestamp)/(1000*60*60*24)));
                const scoreB = b.likes * (1 + 1/(1 + (now - b.timestamp)/(1000*60*60*24)));
                return scoreB - scoreA;
            });
            break;
        case 'relevant':
            // Ordenar por relevância para o usuário (baseado em interações)
            const user = getCurrentUser();
            if (user) {
                // Aqui teríamos um algoritmo mais complexo baseado em interações do usuário
                // Por simplicidade, vamos priorizar posts com hashtags populares
                const tags = getFromStorage(STORAGE_KEYS.TAGS, [])
                    .slice(0, 5)
                    .map(tag => tag.text.toLowerCase());
                
                posts.sort((a, b) => {
                    let scoreA = a.likes * 0.5 + a.comments.length;
                    let scoreB = b.likes * 0.5 + b.comments.length;
                    
                    // Bonus para posts com tags populares
                    tags.forEach(tag => {
                        if (a.content.toLowerCase().includes(tag)) scoreA += 50;
                        if (b.content.toLowerCase().includes(tag)) scoreB += 50;
                    });
                    
                    // Fator de recência
                    const now = Date.now();
                    scoreA *= (1 + 1/(1 + (now - a.timestamp)/(1000*60*60*24)));
                    scoreB *= (1 + 1/(1 + (now - b.timestamp)/(1000*60*60*24)));
                    
                    return scoreB - scoreA;
                });
            } else {
                // Se não houver usuário logado, usar ordenação de tendência
                posts.sort((a, b) => b.timestamp - a.timestamp);
            }
            break;
    }
    
    // Paginar resultados
    const startIndex = (feedState.currentPage - 1) * feedState.postsPerPage;
    const endIndex = startIndex + feedState.postsPerPage;
    
    return posts.slice(startIndex, endIndex);
}

// Mostrar indicador de carregamento
function showLoadingIndicator(container) {
    // Criar indicador de carregamento
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'feed-loading';
    loadingIndicator.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; padding: 30px;">
            <div style="width: 40px; height: 40px; border: 3px solid rgba(30, 144, 255, 0.3); border-top: 3px solid #1e90ff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px;"></div>
            <div style="color: #888; font-family: 'Orbitron', sans-serif;">Carregando posts...</div>
        </div>
    `;
    
    // Adicionar estilos de animação se não existirem
    if (!document.getElementById('loading-animation-style')) {
        const style = document.createElement('style');
        style.id = 'loading-animation-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Adicionar ao container
    if (feedState.currentPage === 1) {
        container.innerHTML = '';
    }
    container.appendChild(loadingIndicator);
}

// Remover indicador de carregamento
function removeLoadingIndicator() {
    const loadingIndicator = document.querySelector('.feed-loading');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Mostrar mensagem de feed vazio
function showEmptyFeedMessage(container) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-feed-message';
    emptyMessage.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; background: rgba(0,0,0,0.2); border-radius: 15px; margin: 20px 0;">
            <i class="fas fa-comment-slash" style="font-size: 3rem; color: #555; margin-bottom: 20px;"></i>
            <h3 style="color: #aaa; font-size: 1.2rem; margin-bottom: 10px;">Nenhum post encontrado</h3>
            <p style="color: #777; margin-bottom: 20px;">Seja o primeiro a compartilhar algo com a comunidade!</p>
            <button id="emptyFeedPostBtn" style="background: linear-gradient(90deg, #1e90ff, #00bfff); border: none; color: white; padding: 10px 20px; border-radius: 30px; font-family: 'Orbitron', sans-serif; cursor: pointer;">
                <i class="fas fa-plus"></i> Criar Novo Post
            </button>
        </div>
    `;
    
    container.appendChild(emptyMessage);
    
    // Adicionar evento ao botão
    document.getElementById('emptyFeedPostBtn').addEventListener('click', () => {
        // Focar no campo de texto do post
        const postInput = document.querySelector('.post-input');
        if (postInput) {
            postInput.focus();
        }
    });
}

// Adicionar botão para carregar mais posts
function addLoadMoreButton(container) {
    // Remover botão existente se houver
    const existingButton = document.querySelector('.feed-load-more');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Criar novo botão
    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.className = 'feed-load-more';
    loadMoreContainer.innerHTML = `
        <button class="load-more-btn">
            <i class="fas fa-sync-alt"></i> Carregar Mais
        </button>
    `;
    
    container.appendChild(loadMoreContainer);
    
    // Adicionar evento
    loadMoreContainer.querySelector('.load-more-btn').addEventListener('click', () => {
        // Incrementar página
        feedState.currentPage++;
        
        // Recarregar feed
        initializeFeed(false);
    });
}

// Adicionar indicador de fim do feed
function addEndOfFeedIndicator(container) {
    const endIndicator = document.createElement('div');
    endIndicator.className = 'feed-end-indicator';
    endIndicator.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666; margin-top: 10px; border-top: 1px solid #333;">
            <i class="fas fa-check-circle" style="margin-right: 8px;"></i> Você chegou ao fim do feed
        </div>
    `;
    
    container.appendChild(endIndicator);
}

// Verificar novos posts
function checkForNewPosts() {
    // Obter todos os posts
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    
    // Verificar se há posts mais recentes que o último carregado
    const newPosts = posts.filter(post => post.timestamp > feedState.lastPostTimestamp);
    
    // Se houver novos posts e estivermos na ordenação por recentes, mostrar notificação
    if (newPosts.length > 0 && feedState.currentSort === 'newest' && feedState.currentPage === 1) {
        // Adicionar notificação de novos posts
        showNewPostsNotification(newPosts.length);
    }
}

// Mostrar notificação de novos posts
function showNewPostsNotification(count) {
    // Verificar se já existe uma notificação
    let notification = document.querySelector('.new-posts-notification');
    
    if (notification) {
        // Atualizar contagem
        notification.querySelector('.count').textContent = count;
        return;
    }
    
    // Criar notificação
    notification = document.createElement('div');
    notification.className = 'new-posts-notification';
    notification.innerHTML = `
        <div style="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: rgba(30, 144, 255, 0.9); color: white; padding: 10px 20px; border-radius: 30px; display: flex; align-items: center; gap: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); z-index: 100; cursor: pointer; font-family: 'Orbitron', sans-serif;">
            <i class="fas fa-arrow-up"></i>
            <span><span class="count">${count}</span> ${count === 1 ? 'novo post' : 'novos posts'}</span>
        </div>
    `;
    
    // Adicionar à página
    document.body.appendChild(notification);
    
    // Adicionar evento
    notification.addEventListener('click', () => {
        // Remover notificação
        notification.remove();
        
        // Recarregar feed
        feedState.currentPage = 1;
        initializeFeed();
        
        // Rolar para o topo
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Auto-remover após 10 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

// Configurar event listeners
function setupFeedEventListeners() {
    // Filtros de feed
    document.querySelectorAll('.feed-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            // Remover classe ativa de todos os filtros
            document.querySelectorAll('.feed-filter').forEach(f => {
                f.classList.remove('active');
                f.style.background = 'rgba(255, 255, 255, 0.05)';
                f.style.borderColor = '#333';
                f.style.color = '#aaa';
            });
            
            // Adicionar classe ativa ao filtro clicado
            filter.classList.add('active');
            filter.style.background = 'rgba(30, 144, 255, 0.1)';
            filter.style.borderColor = '#1e90ff';
            filter.style.color = '#1e90ff';
            
            // Atualizar filtro atual
            feedState.currentFilter = filter.dataset.filter === 'all' ? null : filter.dataset.filter;
            
            // Resetar página
            feedState.currentPage = 1;
            
            // Recarregar feed
            initializeFeed(false);
        });
    });
    
    // Dropdown de ordenação
    const sortButton = document.querySelector('.sort-button');
    const sortDropdown = document.querySelector('.sort-dropdown');
    
    if (sortButton && sortDropdown) {
        // Mostrar/esconder dropdown
        sortButton.addEventListener('click', () => {
            if (sortDropdown.style.display === 'none' || !sortDropdown.style.display) {
                sortDropdown.style.display = 'block';
            } else {
                sortDropdown.style.display = 'none';
            }
        });
        
        // Esconder dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!sortButton.contains(e.target) && !sortDropdown.contains(e.target)) {
                sortDropdown.style.display = 'none';
            }
        });
        
        // Opções de ordenação
        document.querySelectorAll('.sort-option').forEach(option => {
            option.addEventListener('click', () => {
                // Atualizar label do botão
                const sortType = option.dataset.sort;
                let sortLabel;
                
                switch (sortType) {
                    case 'newest': sortLabel = 'Recentes'; break;
                    case 'popular': sortLabel = 'Populares'; break;
                    case 'trending': sortLabel = 'Em Alta'; break;
                    case 'relevant': sortLabel = 'Para Mim'; break;
                }
                
                document.querySelector('.sort-label').textContent = sortLabel;
                
                // Atualizar estilo das opções
                document.querySelectorAll('.sort-option').forEach(opt => {
                    opt.style.color = '#aaa';
                });
                option.style.color = '#1e90ff';
                
                // Esconder dropdown
                sortDropdown.style.display = 'none';
                
                // Atualizar ordenação atual
                feedState.currentSort = sortType;
                
                // Resetar página
                feedState.currentPage = 1;
                
                // Recarregar feed
                initializeFeed(false);
            });
        });
    }
    
    // Publicar novo post
    const publishBtn = document.getElementById('publishPostBtn');
    if (publishBtn) {
        // Preservar o handler original e adicionar atualização do feed
        const originalClickHandler = publishBtn.onclick;
        publishBtn.onclick = null;
        
        publishBtn.addEventListener('click', () => {
            const postInput = document.getElementById('postInput');
            const content = postInput.value.trim();
            
            if (!content) return;
            
            // Criar novo post
            if (createPost(content)) {
                // Limpar input
                postInput.value = '';
                
                // Resetar feed
                feedState.currentPage = 1;
                
                // Recarregar feed
                initializeFeed();
                
                // Mostrar toast
                showToast('Post publicado com sucesso!', 'success');
            }
        });
    }
    
    // Responder a eventos de scroll para detectar final da página
    window.addEventListener('scroll', () => {
        // Verificar se estamos próximos do final da página
        if (feedState.hasMorePosts && !feedState.isLoading) {
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Se estiver a 300px do final da página, carregar mais posts
            if (scrollPosition >= documentHeight - 300) {
                // Incrementar página
                feedState.currentPage++;
                
                // Recarregar feed
                initializeFeed(false);
            }
        }
    });
}

// Filtrar feed por tag
function filterFeedByTag(tag) {
    showToast(`Filtrando posts por ${tag}`, 'info');
    
    // Obter todos os posts
    const posts = getFromStorage(STORAGE_KEYS.POSTS, []);
    
    // Filtrar posts que contêm a tag
    const filteredPosts = posts.filter(post => 
        post.content.toLowerCase().includes(tag.toLowerCase())
    );
    
    // Atualizar feed com posts filtrados
    updateFeedWithFilteredPosts(filteredPosts);
    
    // Adicionar indicador de filtro ativo
    addActiveFilterIndicator(tag);
}

// Atualizar feed com posts filtrados
function updateFeedWithFilteredPosts(filteredPosts) {
    const postsContainer = document.getElementById('postsFeed');
    if (!postsContainer) return;
    
    // Limpar container
    postsContainer.innerHTML = '';
    
    // Verificar se há posts
    if (filteredPosts.length === 0) {
        const noPostsMessage = document.createElement('div');
        noPostsMessage.className = 'no-posts-message';
        noPostsMessage.innerHTML = `
            <div style="text-align: center; padding: 30px; background: rgba(0,0,0,0.2); border-radius: 10px; margin: 20px 0;">
                <i class="fas fa-search" style="font-size: 2rem; color: #666; margin-bottom: 10px;"></i>
                <p style="color: #aaa; font-size: 1.1rem;">Nenhum post encontrado com este filtro.</p>
                <button id="clearFilterBtn" style="margin-top: 15px; background: #1e90ff; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-times"></i> Limpar Filtro
                </button>
            </div>
        `;
        
        postsContainer.appendChild(noPostsMessage);
        
        // Adicionar evento ao botão de limpar filtro
        const clearFilterBtn = document.getElementById('clearFilterBtn');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => {
                // Resetar estado do feed
                feedState.currentFilter = null;
                feedState.currentPage = 1;
                
                // Atualizar UI de filtros
                updateFilterUI();
                
                // Recarregar feed
                initializeFeed();
                
                // Remover indicador de filtro ativo
                removeActiveFilterIndicator();
                
                showToast('Filtro removido', 'success');
            });
        }
        
        return;
    }
    
    // Ordenar por mais recentes
    filteredPosts.sort((a, b) => b.timestamp - a.timestamp);
    
    // Criar cards para cada post
    filteredPosts.forEach(post => {
        const postCard = createPostCard(post);
        postsContainer.appendChild(postCard);
    });
}

// Adicionar indicador de filtro ativo
function addActiveFilterIndicator(tag) {
    // Remover indicador existente
    removeActiveFilterIndicator();
    
    // Criar novo indicador
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'active-filter-indicator';
    indicatorContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(30, 144, 255, 0.1); padding: 10px 15px; border-radius: 10px; margin-bottom: 15px; border: 1px solid #1e90ff;">
            <div style="display: flex; align-items: center; gap: 8px; color: #1e90ff;">
                <i class="fas fa-filter"></i>
                <span>Filtrando por: <strong>${tag}</strong></span>
            </div>
            <button id="removeFilterBtn" style="background: none; border: none; color: #1e90ff; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Adicionar ao feed
    const feedColumn = document.querySelector('.feed-column');
    const createPostElement = feedColumn.querySelector('.create-post');
    feedColumn.insertBefore(indicatorContainer, createPostElement.nextSibling);
    
    // Adicionar evento ao botão de remover
    document.getElementById('removeFilterBtn').addEventListener('click', () => {
        // Resetar estado do feed
        feedState.currentFilter = null;
        feedState.currentPage = 1;
        
        // Atualizar UI de filtros
        updateFilterUI();
        
        // Recarregar feed
        initializeFeed();
        
        // Remover indicador
        removeActiveFilterIndicator();
        
        showToast('Filtro removido', 'success');
    });
}

// Remover indicador de filtro ativo
function removeActiveFilterIndicator() {
    const indicator = document.querySelector('.active-filter-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Atualizar UI de filtros
function updateFilterUI() {
    // Resetar todos os filtros
    document.querySelectorAll('.feed-filter').forEach(filter => {
        filter.classList.remove('active');
        filter.style.background = 'rgba(255, 255, 255, 0.05)';
        filter.style.borderColor = '#333';
        filter.style.color = '#aaa';
    });
    
    // Ativar filtro 'all'
    const allFilter = document.querySelector('.feed-filter[data-filter="all"]');
    if (allFilter) {
        allFilter.classList.add('active');
        allFilter.style.background = 'rgba(30, 144, 255, 0.1)';
        allFilter.style.borderColor = '#1e90ff';
        allFilter.style.color = '#1e90ff';
    }
}

// Exportar funções necessárias para uso global
window.filterFeedByTag = filterFeedByTag;