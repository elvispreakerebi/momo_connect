import Dashboard from './dashboard.js';
import TransactionList from './transactionList.js';
import TransactionDetails from './transactionDetails.js';

// Router for handling SPA navigation
class Router {
    constructor() {
        this.routes = {};
        this.currentPath = '';
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        window.addEventListener('popstate', this.handleRoute.bind(this));
    }

    addRoute(path, callback) {
        this.routes[path] = callback;
    }

    navigateTo(path) {
        window.location.hash = path;
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        const path = hash.slice(1); // Remove the # from the hash

        // Check for transaction details routes
        const transactionDetailsMatch = path.match(/^\/transactions\/([\w-]+)\/([\w-]+)$/);
        if (transactionDetailsMatch) {
            const transactionType = transactionDetailsMatch[1].split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            const transactionId = transactionDetailsMatch[2];
            const app = document.getElementById('app');
            const transactionDetails = new TransactionDetails(transactionType, transactionId);
            app.innerHTML = '';
            app.appendChild(transactionDetails.render());
            return;
        }

        // Check for transaction list routes
        const transactionMatch = path.match(/^\/transactions\/([\w-]+)$/);
        if (transactionMatch) {
            const transactionType = transactionMatch[1].split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            const app = document.getElementById('app');
            const transactionList = new TransactionList(transactionType);
            app.innerHTML = '';
            app.appendChild(transactionList.render());
            return;
        }

        // Handle other routes
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

export default router;