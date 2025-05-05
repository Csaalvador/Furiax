document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const mobileTrigger = document.getElementById('mobileTrigger');
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    
    // Show swipe hint for first-time users
    const swipeHint = document.createElement('div');
    swipeHint.className = 'swipe-hint';
    document.body.appendChild(swipeHint);
    
    // Hide swipe hint after 5 seconds
    setTimeout(() => {
        swipeHint.style.opacity = '0';
        setTimeout(() => {
            swipeHint.remove();
        }, 500);
    }, 5000);
    
    // Toggle menu function
    function toggleMenu() {
        mobileNavMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        hamburgerIcon.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }
    
    // Event listeners
    mobileTrigger.addEventListener('click', toggleMenu);
    mobileMenuClose.addEventListener('click', toggleMenu);
    mobileMenuOverlay.addEventListener('click', toggleMenu);
    
    // Close menu when clicking on navigation items
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            toggleMenu();
        });
    });
    
    // Touch gestures for swipe to open menu
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 70;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, false);
    
    function handleSwipeGesture() {
        // Only detect right swipes from the left edge to open menu
        if (touchEndX - touchStartX > minSwipeDistance && touchStartX < 30) {
            if (!mobileNavMenu.classList.contains('active')) {
                toggleMenu();
            }
        }
        
        // Close on left swipe when menu is open
        if (touchStartX - touchEndX > minSwipeDistance && mobileNavMenu.classList.contains('active')) {
            toggleMenu();
        }
    }
    
    // Close menu on resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileNavMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Update user info
    function updateUserInfo() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('furiax_current_user'));
            if (currentUser) {
                document.querySelector('.user-name-small').textContent = currentUser.username || 'FuriaX_Pro';
                document.querySelector('.user-role-small').textContent = currentUser.title || 'Furioso Elite';
            }
        } catch (error) {
            console.error('Error updating user info:', error);
        }
    }
    
    // Call update function
    updateUserInfo();
});