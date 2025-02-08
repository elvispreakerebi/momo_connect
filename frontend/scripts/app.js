import Dashboard from './dashboard.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize router
    router.init();

    // Set up initial route
    const app = document.getElementById('app');
    const dashboard = new Dashboard();
    app.innerHTML = '';
    app.appendChild(dashboard.render());

    // Log that the application has started
    console.log('MoMo Connect application initialized');
});