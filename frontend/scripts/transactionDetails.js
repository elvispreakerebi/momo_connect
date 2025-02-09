import { API_CONFIG } from './config.js';

class TransactionDetails {
    constructor(type, transactionId) {
        this.container = document.createElement('div');
        this.container.className = 'transaction-details-page';
        this.transactionType = type;
        this.transactionId = transactionId;
        this.setupHeader();
        this.setupDetailsCard();
        this.fetchTransactionDetails();
    }

    setupHeader() {
        const header = document.createElement('div');
        header.className = 'transaction-details-header';

        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        const arrowIcon = document.createElement('i');
        arrowIcon.className = 'lucide lucide-chevron-left';
        arrowIcon.setAttribute('data-lucide', 'chevron-left');
        backButton.appendChild(arrowIcon);
        backButton.addEventListener('click', () => {
            window.location.hash = `/transactions/${this.transactionType.toLowerCase().replace(/ /g, '-')}`;
        });

        const title = document.createElement('h2');
        title.className = 'transaction-details-title';
        title.textContent = 'Transaction Details';

        header.appendChild(backButton);
        header.appendChild(title);
        this.container.appendChild(header);

        // Initialize Lucide icons after DOM elements are added
        setTimeout(() => lucide.createIcons(), 0);
    }

    setupDetailsCard() {
        const content = document.createElement('div');
        content.className = 'transaction-details-content';
        
        this.detailsElement = document.createElement('div');
        this.detailsElement.className = 'transaction-details-card';
        
        content.appendChild(this.detailsElement);
        this.container.appendChild(content);
    }

    showLoading() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-spinner';
        loadingElement.innerHTML = '<div class="spinner"></div>';
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(loadingElement);
    }

    async fetchTransactionDetails() {
        try {
            this.showLoading();
            const endpoint = this.transactionType.toLowerCase().replace(/ /g, '-');
            const response = await fetch(`${API_CONFIG.baseUrl}/${endpoint}/${this.transactionId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch transaction details`);
            }

            const data = await response.json();
            this.renderDetails(data.data);
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            this.showError('Failed to load transaction details');
        }
    }

    renderDetails(transaction) {
        this.detailsElement.innerHTML = '';
        if (!transaction) {
            this.showError('Transaction not found');
            return;
        }

        const detailsCard = document.createElement('div');
        detailsCard.className = 'transaction-info-grid';

        // Amount (displayed prominently at the top)
        const amount = document.createElement('div');
        amount.className = 'transaction-amount-large';
        amount.textContent = parseFloat(transaction.amount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'RWF'
        });
        detailsCard.appendChild(amount);

        // Date and Time
        const timestamp = transaction.timestamp ? new Date(transaction.timestamp) : new Date();
        if (!isNaN(timestamp.getTime())) {
            const dateTimeItem = document.createElement('div');
            dateTimeItem.className = 'transaction-info-item';
            
            const dateTimeLabel = document.createElement('span');
            dateTimeLabel.className = 'info-label';
            dateTimeLabel.textContent = 'Date and Time';
            
            const dateTime = document.createElement('span');
            dateTime.className = 'info-value';
            dateTime.textContent = timestamp.toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'medium'
            });
            detailsCard.appendChild(dateTime);
        }

        // Other transaction details
        const detailsList = document.createElement('div');
        detailsList.className = 'transaction-info-grid';

        // Add all other transaction properties except id and those already displayed
        Object.entries(transaction).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'amount' && key !== 'timestamp' && key !== 'created_at') {
                const detailItem = document.createElement('div');
                detailItem.className = 'transaction-info-item';
                
                const label = document.createElement('span');
                label.className = 'info-label';
                label.textContent = key.replace(/_/g, ' ').replace(/\w/g, l => l.toUpperCase());
                
                const value = document.createElement('span');
                value.className = 'info-value';
                value.textContent = transaction[key] || 'N/A';
                
                detailItem.appendChild(label);
                detailItem.appendChild(value);
                detailsList.appendChild(detailItem);
            }
        });

        detailsCard.appendChild(detailsList);
        this.detailsElement.appendChild(detailsCard);
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        this.detailsElement.innerHTML = '';
        this.detailsElement.appendChild(errorElement);
    }

    render() {
        return this.container;
    }
}

export default TransactionDetails;