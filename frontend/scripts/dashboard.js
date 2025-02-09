import Header from './header.js';
import MainDashboard from './mainDashboard.js';

class Dashboard {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'dashboard-container';
        this.setupHeader();
        this.setupMainDashboard();
    }

    setupHeader() {
        const header = new Header();
        this.container.appendChild(header.render());
    }

    setupMainDashboard() {
        const mainDashboard = new MainDashboard();
        this.container.appendChild(mainDashboard.render());
    }

    render() {
        return this.container;
    }
}

export default Dashboard;