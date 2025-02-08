import Dashboard from './dashboard.js';

// Router for handling SPA navigation
class Router {
    constructor() {
        this.routes = {};
        this.currentPath = '';
        window.addEventListener('popstate', this.handleRoute.bind(this));
    }

    addRoute(path, callback) {
        this.routes[path] = callback;
    }

    navigateTo(path) {
        window.history.pushState(null, null, path);
        this.handleRoute();
    }

    handleRoute() {
        const path = window.location.pathname || '/';
        this.currentPath = path;
        const callback = this.routes[path] || this.routes['/'];
        if (callback) {
            callback();
        }
    }

    init() {
        // Register the default route
        this.addRoute('/', () => {
            const app = document.getElementById('app');
            const dashboard = new Dashboard();
            app.innerHTML = '';
            app.appendChild(dashboard.render());
        });
        
        this.handleRoute();
    }
}

const router = new Router();
window.router = router; // Make router globally accessible