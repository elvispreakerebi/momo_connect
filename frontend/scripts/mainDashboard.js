import { fetchTransactionVolume } from './api.js';

class MainDashboard {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'main-dashboard';
        this.transactionTypes = [
            'Airtime',
            'Bank Deposit',
            'Bundles and Packs',
            'Cash Power',
            'Incoming Money',
            'Payment to Code Holders',
            'Transfer to Mobile Number',
            'Withdrawal from Agent'
        ];
        this.setupContainers();
    }

    setupContainers() {
        // Create main content container
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';

        // Create cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'cards-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

        // Create transaction cards
        this.transactionTypes.forEach(type => {
            const card = this.createTransactionCard(type);
            cardsContainer.appendChild(card);
        });

        mainContent.appendChild(cardsContainer);
        this.container.appendChild(mainContent);

        // Fetch and update transaction data
        this.fetchAndUpdateData();
    }

    createTransactionCard(type) {
        const card = document.createElement('div');
        card.className = 'card transaction-card';
        card.innerHTML = `
            <h3 class="card-title">${type}</h3>
            <div class="card-content">
                <div class="stat-item">
                    <span class="stat-value amount" data-type="${type}" data-stat="amount">-</span>
                </div>
                <div class="stat-item transaction-count">
                    <span class="stat-label count" data-type="${type}" data-stat="count">-</span>
                    <span class="stat-label">transactions</span>
                </div>
            </div>
        `;
        return card;
    }

    async fetchAndUpdateData() {
        try {
            const data = await fetchTransactionVolume();
            this.updateCards(data);
        } catch (error) {
            console.error('Error fetching transaction data:', error);
        }
    }

    updateCards(data) {
        data.forEach(item => {
            const countElement = document.querySelector(`[data-type="${item.type}"][data-stat="count"]`);
            const amountElement = document.querySelector(`[data-type="${item.type}"][data-stat="amount"]`);

            if (countElement) {
                countElement.textContent = item.count.toLocaleString();
            }
            if (amountElement) {
                amountElement.textContent = item.totalAmount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'RWF'
                });
            }
        });
    }

    render() {
        return this.container;
    }
}

export default MainDashboard;