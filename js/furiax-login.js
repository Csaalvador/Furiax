function getCorrectPath(page) {
    const isInPagesDir = window.location.pathname.includes('/pages/');
    
    // Remover extensão .html se presente
    const pageName = page.endsWith('.html') ? page.slice(0, -5) : page;
    
    if (pageName === 'login') {
        return isInPagesDir ? 'login.html' : 'pages/login.html';
    } else if (pageName === 'index' || pageName === 'home') {
        return isInPagesDir ? '../index.html' : 'index.html';
    } else if (pageName === 'community') {
        // Tratamento específico para a página de comunidade
        return isInPagesDir ? 'community.html' : 'pages/community.html';
    } else {
        // Para outras páginas
        return isInPagesDir ? pageName + '.html' : 'pages/' + pageName + '.html';
    }
}