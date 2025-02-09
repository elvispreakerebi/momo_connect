import { API_CONFIG } from './config.js';

class TransactionList {
    constructor(type) {
        this.container = document.createElement('div');
        this.container.className = 'transaction-list-container';
        this.transactionType = type;
        this.setupHeader();
        this.setupTransactionList();
        this.fetchTransactions();
    }

    setupHeader() {
        const header = document.createElement('div');
        header.className = 'transaction-list-header';

        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        const arrowIcon = document.createElement('i');
        arrowIcon.setAttribute('data-lucide', 'chevron-left');
        backButton.appendChild(arrowIcon);
        backButton.addEventListener('click', () => {
            window.location.hash = '#/';
        });

        const title = document.createElement('h2');
        title.className = 'transaction-type-title';
        title.textContent = this.transactionType;

        header.appendChild(backButton);
        header.appendChild(title);
        this.container.appendChild(header);

        // Initialize Lucide icons
        lucide.createIcons();
    }

    setupTransactionList() {
        this.transactionListElement = document.createElement('div');
        this.transactionListElement.className = 'transactions-list';
        this.container.appendChild(this.transactionListElement);
    }

    createTransactionCard(transaction) {
        const card = document.createElement('div');
        card.className = 'transaction-item-card';

        const amount = document.createElement('div');
        amount.className = 'transaction-amount';
        amount.textContent = parseFloat(transaction.amount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'RWF'
        });

        const dateTime = document.createElement('div');
        dateTime.className = 'transaction-datetime';
        const timestamp = transaction.timestamp ? new Date(transaction.timestamp) : new Date();
        if (isNaN(timestamp.getTime())) {
            dateTime.textContent = 'Date not available';
        } else {
            dateTime.textContent = timestamp.toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        }

        card.appendChild(amount);
        card.appendChild(dateTime);

        return card;
    }

    showLoading() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-spinner';
        loadingElement.innerHTML = '<div class="spinner"></div>';
        this.transactionListElement.innerHTML = '';
        this.transactionListElement.appendChild(loadingElement);
    }

    async fetchTransactions() {
        try {
            this.showLoading();
            const endpoint = this.transactionType.toLowerCase().replace(/ /g, '-');
            const response = await fetch(`${API_CONFIG.baseUrl}/${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch ${this.transactionType} transactions`);
            }

            const data = await response.json();
            this.renderTransactions(data.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            this.showError('Failed to load transactions');
        }
    }

    renderTransactions(transactions) {
        this.transactionListElement.innerHTML = '';
        if (!transactions || transactions.length === 0) {
            this.showError('No transactions found');
            return;
        }

        transactions.forEach(transaction => {
            const card = this.createTransactionCard(transaction);
            this.transactionListElement.appendChild(card);
        });
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        this.transactionListElement.innerHTML = '';
        this.transactionListElement.appendChild(errorElement);
    }

    render() {
        return this.container;
    }
}

export default TransactionList;