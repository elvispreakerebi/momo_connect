
import { API_CONFIG } from './config.js';

class Header {
    constructor(onApplyFilters) {
        this.header = document.createElement('header');
        this.header.className = 'dashboard-header';
        this.onApplyFilters = onApplyFilters;
        this.loadLucideIcons().then(() => {
            this.setupHeader();
            this.bindEvents();
        });
    }

    async loadLucideIcons() {
        try {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/lucide@latest';
            await new Promise((resolve, reject) => {
                script.onload = () => {
                    if (typeof lucide !== 'undefined') {
                        resolve();
                    } else {
                        reject(new Error('Lucide failed to load'));
                    }
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        } catch (error) {
            console.error('Failed to load Lucide icons:', error);
        }
    }

    setupHeader() {
        // Header top section
        const headerTop = document.createElement('div');
        headerTop.className = 'header-top';

        // Title
        const title = document.createElement('h1');
        title.className = 'dashboard-title';
        title.textContent = 'Momo Dashboard';

        // Mobile filter toggle button container
        const mobileFilterBtn = document.createElement('button');
        mobileFilterBtn.className = 'mobile-filter-button';
        
        // Create both chevron icons
        const chevronDown = document.createElement('i');
        chevronDown.setAttribute('data-lucide', 'chevron-down');
        chevronDown.className = 'chevron-down';
        
        const chevronUp = document.createElement('i');
        chevronUp.setAttribute('data-lucide', 'chevron-up');
        chevronUp.className = 'chevron-up';
        chevronUp.style.display = 'none';
        
        mobileFilterBtn.appendChild(chevronDown);
        mobileFilterBtn.appendChild(chevronUp);
        mobileFilterBtn.onclick = () => this.toggleMobileFilter();

        headerTop.appendChild(title);
        headerTop.appendChild(mobileFilterBtn);

        // Filter container
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';

        // Transaction type filter
        const typeContainer = this.createFilterGroup('Transaction Type', 'type');
        const typeInputs = document.createElement('div');
        typeInputs.className = 'filter-group-inputs';
        const typeSelect = document.createElement('select');
        typeSelect.className = 'filter-input';
        typeSelect.id = 'transactionType';
        ['All Types', 'Incoming Money', "Bank Deposit", "Cash Power", "bundles and packs", 'Airtime Purchase', 'Payment to Code Holder', 'Transfer to Mobile Number', "Withdrawals from Agents"].forEach(type => {
            const option = document.createElement('option');
            option.value = type === 'All Types' ? '' : type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
        typeInputs.appendChild(typeSelect);
        typeContainer.appendChild(typeInputs);

        // Date range filters
        const dateContainer = this.createFilterGroup('Date Range', 'date');
        const dateInputs = document.createElement('div');
        dateInputs.className = 'filter-group-inputs';
        const startDate = document.createElement('input');
        startDate.type = 'date';
        startDate.className = 'filter-input';
        startDate.id = 'startDate';
        const endDate = document.createElement('input');
        endDate.type = 'date';
        endDate.className = 'filter-input';
        endDate.id = 'endDate';
        dateInputs.appendChild(startDate);
        dateInputs.appendChild(endDate);
        dateContainer.appendChild(dateInputs);

        // Amount range filters
        const amountContainer = this.createFilterGroup('Amount Range', 'amount');
        const amountInputs = document.createElement('div');
        amountInputs.className = 'filter-group-inputs';
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
        amountInputs.appendChild(minAmount);
        amountInputs.appendChild(maxAmount);
        amountContainer.appendChild(amountInputs);

        // Filter button
        const filterButton = document.createElement('button');
        filterButton.className = 'filter-button';
        filterButton.textContent = 'Apply Filters';
        filterButton.onclick = () => this.applyFilters();

        // Append elements
        filterContainer.appendChild(typeContainer);
        filterContainer.appendChild(dateContainer);
        filterContainer.appendChild(amountContainer);
        filterContainer.appendChild(filterButton);

        this.header.appendChild(headerTop);
        this.header.appendChild(filterContainer);

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
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

    toggleMobileFilter() {
        const filterContainer = this.header.querySelector('.filter-container');
        const chevronDown = this.header.querySelector('.chevron-down');
        const chevronUp = this.header.querySelector('.chevron-up');
        
        // Toggle the show class on filter container
        const isExpanded = filterContainer.classList.toggle('show');
        
        // Toggle visibility of chevron icons
        chevronDown.style.display = isExpanded ? 'none' : 'block';
        chevronUp.style.display = isExpanded ? 'block' : 'none';
        
        // Update Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    bindEvents() {
        // Add media query listener for responsive behavior
        const mediaQuery = window.matchMedia('(min-width: 784px)');
        const handleMediaQueryChange = (e) => {
            if (e.matches) {
                const filterContainer = this.header.querySelector('.filter-container');
                const chevronDown = this.header.querySelector('.chevron-down');
                const chevronUp = this.header.querySelector('.chevron-up');
                
                filterContainer.classList.remove('show');
                chevronDown.style.display = 'block';
                chevronUp.style.display = 'none';
                
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        };
        mediaQuery.addListener(handleMediaQueryChange);
        // Initial check
        handleMediaQueryChange(mediaQuery);
    }

    applyFilters() {
        const transactionType = document.getElementById('transactionType');

        const filters = {
            type: transactionType ? transactionType.value : '',
            startDate: document.getElementById('startDate')?.value || '',
            endDate: document.getElementById('endDate')?.value || '',
            minAmount: document.getElementById('minAmount')?.value || '',
            maxAmount: document.getElementById('maxAmount')?.value || ''
        };

        // Validate transaction type
        if (!transactionType || !transactionType.value) {
            console.error('Transaction type is required');
            alert('Please select a transaction type');
            return;
        }

        console.log('Applying filters:', filters);

        fetch(`${API_CONFIG.baseUrl}/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filters)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.message || 'Failed to fetch filtered transactions');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Filtered transactions:', data);
            if (this.onApplyFilters) {
                this.onApplyFilters(data);
            }

            // Reset all filter inputs
            document.getElementById('transactionType').value = '';
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            document.getElementById('minAmount').value = '';
            document.getElementById('maxAmount').value = '';

            // Close mobile filter container after applying filters
            if (window.innerWidth <= 784) {
                const filterContainer = this.header.querySelector('.filter-container');
                const chevronDown = this.header.querySelector('.chevron-down');
                const chevronUp = this.header.querySelector('.chevron-up');
                
                filterContainer.classList.remove('show');
                chevronDown.style.display = 'block';
                chevronUp.style.display = 'none';
                
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        })
        .catch(error => {
            console.error('Error applying filters:', error.message);
            alert('Error applying filters: ' + error.message);
        });
    }

    render() {
        return this.header;
    }
}

export default Header;