// Dashboard component
class Dashboard {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'dashboard-container';
        this.setupHeader();
        this.setupMainContent();
        this.setupMobileFilterModal();
        this.bindEvents();
    }

    setupHeader() {
        this.header = document.createElement('header');
        this.header.className = 'dashboard-header';
        
        // Title
        const title = document.createElement('h1');
        title.className = 'dashboard-title';
        title.textContent = 'Momo Dashboard';

        // Filter container
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';

        // Transaction type filter
        const typeContainer = this.createFilterGroup('Transaction Type', 'type');
        const typeSelect = document.createElement('select');
        typeSelect.className = 'filter-input';
        typeSelect.id = 'transactionType';
        ['All Types', 'Payment to Code Holders', 'Transfer to Mobile Number'].forEach(type => {
            const option = document.createElement('option');
            option.value = type === 'All Types' ? '' : type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
        typeContainer.appendChild(typeSelect);

        // Date range filters
        const dateContainer = this.createFilterGroup('Date Range', 'date');
        const startDate = document.createElement('input');
        startDate.type = 'date';
        startDate.className = 'filter-input';
        startDate.id = 'startDate';
        const endDate = document.createElement('input');
        endDate.type = 'date';
        endDate.className = 'filter-input';
        endDate.id = 'endDate';
        dateContainer.appendChild(startDate);
        dateContainer.appendChild(endDate);

        // Amount range filters
        const amountContainer = this.createFilterGroup('Amount Range', 'amount');
        const minAmount = document.createElement('input');
        minAmount.type = 'number';
        minAmount.className = 'filter-input';
        minAmount.id = 'minAmount';
        minAmount.placeholder = 'Min';
        const maxAmount = document.createElement('input');
        maxAmount.type = 'number';
        maxAmount.className = 'filter-input';
        maxAmount.id = 'maxAmount';
        maxAmount.placeholder = 'Max';
        amountContainer.appendChild(minAmount);
        amountContainer.appendChild(maxAmount);

        // Filter button
        const filterButton = document.createElement('button');
        filterButton.className = 'filter-button';
        filterButton.textContent = 'Apply Filters';
        filterButton.onclick = () => this.applyFilters();

        // Mobile filter button
        const mobileFilterBtn = document.createElement('button');
        mobileFilterBtn.className = 'mobile-filter-button';
        mobileFilterBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>`;
        mobileFilterBtn.onclick = () => this.toggleMobileFilter();

        // Append elements
        filterContainer.appendChild(typeContainer);
        filterContainer.appendChild(dateContainer);
        filterContainer.appendChild(amountContainer);
        filterContainer.appendChild(filterButton);

        this.header.appendChild(title);
        this.header.appendChild(mobileFilterBtn);
        this.header.appendChild(filterContainer);

        this.container.appendChild(this.header);
    }

    createFilterGroup(label, name) {
        const group = document.createElement('div');
        group.className = 'filter-group';
        
        const labelElement = document.createElement('label');
        labelElement.className = 'filter-label';
        labelElement.textContent = label;
        
        group.appendChild(labelElement);
        return group;
    }

    setupMainContent() {
        this.mainContent = document.createElement('main');
        this.mainContent.className = 'main-content';
        this.mainContent.innerHTML = '<div class="text-center">Loading transactions...</div>';
        this.container.appendChild(this.mainContent);
    }

    setupMobileFilterModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'mobile-filter-modal hidden';
        this.modal.innerHTML = `
            <div class="mobile-filter-content">
                <div class="mobile-filter-header">
                    <h3 class="mobile-filter-title">Filters</h3>
                    <button class="close-filter-button" id="closeFilterModal">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="mobile-filter-controls" id="mobileFilterControls"></div>
                <button class="filter-button" id="applyMobileFilters">
                    Apply Filters
                </button>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    toggleMobileFilter() {
        this.modal.classList.toggle('hidden');
        if (!this.modal.classList.contains('hidden')) {
            const mobileFilterControls = document.getElementById('mobileFilterControls');
            mobileFilterControls.innerHTML = '';
            
            // Clone desktop filters for mobile
            const desktopFilters = Array.from(this.header.querySelectorAll('.filter-container > div'));
            desktopFilters.forEach(filter => {
                const clone = filter.cloneNode(true);
                clone.className = 'filter-group';
                mobileFilterControls.appendChild(clone);
            });
        }
    }

    bindEvents() {
        document.getElementById('closeFilterModal').onclick = () => {
            this.modal.classList.add('hidden');
        };

        document.getElementById('applyMobileFilters').onclick = () => {
            this.applyFilters();
            this.modal.classList.add('hidden');
        };
    }

    async applyFilters() {
        const filters = {
            type: document.getElementById('transactionType')?.value || '',
            startDate: document.getElementById('startDate')?.value || '',
            endDate: document.getElementById('endDate')?.value || '',
            minAmount: document.getElementById('minAmount')?.value || '',
            maxAmount: document.getElementById('maxAmount')?.value || ''
        };

        try {
            this.mainContent.innerHTML = '<div class="text-center">Loading transactions...</div>';
            
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`/api/transactions/filter?${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success) {
                this.updateTransactionsList(data.data);
            } else {
                throw new Error(data.error || 'Failed to filter transactions');
            }
        } catch (error) {
            console.error('Error applying filters:', error);
            this.mainContent.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
        }
    }

    updateTransactionsList(transactions) {
        if (!transactions || transactions.length === 0) {
            this.mainContent.innerHTML = '<div class="text-center">No transactions found</div>';
            return;
        }

        const transactionList = document.createElement('div');
        transactionList.className = 'transaction-list';

        transactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            transactionItem.innerHTML = `
                <div class="transaction-header">
                    <span class="transaction-type">${transaction.type}</span>
                    <span class="transaction-amount">${transaction.amount}</span>
                </div>
                <div class="transaction-details">
                    <span class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</span>
                    <span class="transaction-status">${transaction.status}</span>
                </div>
            `;

            transactionItem.onclick = () => {
                // Navigate to transaction details page
                router.navigate(`/transaction/${transaction.id}`);
            };

            transactionList.appendChild(transactionItem);
        });

        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(transactionList);
    }

    render() {
        return this.container;
    }
}

// Initialize dashboard when route changes to dashboard page
router.addRoute('/', () => {
    const app = document.getElementById('app');
    const dashboard = new Dashboard();
    app.innerHTML = '';
    app.appendChild(dashboard.render());
});