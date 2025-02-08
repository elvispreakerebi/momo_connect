import Header from './header.js';

// Dashboard component
class Dashboard {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'dashboard-container';
        this.setupHeader();
    }

    setupHeader() {
        const header = new Header();
        this.container.appendChild(header.render());
    }

    render() {
        return this.container;
    }
}

export default Dashboard;