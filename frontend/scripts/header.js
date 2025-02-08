
import { API_CONFIG } from './config.js';

class Header {
    constructor(onApplyFilters) {
        this.header = document.createElement('header');
        this.header.className = 'dashboard-header';
        this.onApplyFilters = onApplyFilters;
        this.loadLucideIcons().then(() => {
            this.setupHeader();
            this.setupMobileFilterModal();
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
        // Title
        const title = document.createElement('h1');
        title.className = 'dashboard-title';
        title.textContent = 'Momo Dashboard';

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
        ['All Types', 'Incoming Money', "Bank Deposit", "Cash Power", "bundles and packs", 'Airtime Purchase', 'Payment to Code Holders', 'Transfer to Mobile Number', "Withdrawals from Agents"].forEach(type => {
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

        // Mobile filter button
        const mobileFilterBtn = document.createElement('button');
        mobileFilterBtn.className = 'mobile-filter-button';
        mobileFilterBtn.innerHTML = '<i data-lucide="filter"></i>';
        mobileFilterBtn.onclick = () => this.toggleMobileFilter();

        // Append elements
        filterContainer.appendChild(typeContainer);
        filterContainer.appendChild(dateContainer);
        filterContainer.appendChild(amountContainer);
        filterContainer.appendChild(filterButton);

        this.header.appendChild(title);
        this.header.appendChild(mobileFilterBtn);
        this.header.appendChild(filterContainer);
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

    setupMobileFilterModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'mobile-filter-modal hidden';
        this.modal.innerHTML = `
            <div class="mobile-filter-content">
                <div class="mobile-filter-header">
                    <h3 class="mobile-filter-title">Filters</h3>
                    <button class="close-filter-button" id="closeFilterModal">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="mobile-filter-controls" id="mobileFilterControls"></div>
                <button class="filter-button" id="applyMobileFilters">
                    Apply Filters
                </button>
            </div>
        `;
        document.body.appendChild(this.modal);
        
        // Add click handler to close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.classList.add('hidden');
            }
        });

        // Add media query listener for responsive behavior
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        const handleMediaQueryChange = (e) => {
            if (e.matches) {
                this.modal.classList.add('hidden');
            }
        };
        mediaQuery.addListener(handleMediaQueryChange);

        // Initialize Lucide icons for the modal
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    toggleMobileFilter() {
        this.modal.classList.toggle('hidden');
        if (!this.modal.classList.contains('hidden')) {
            const mobileFilterControls = document.getElementById('mobileFilterControls');
            mobileFilterControls.innerHTML = '';
            
            // Clone desktop filters for mobile
            const desktopFilters = Array.from(this.header.querySelectorAll('.filter-container > .filter-group'));
            desktopFilters.forEach(filter => {
                const clone = filter.cloneNode(true);
                // Get the original input elements
                const originalInputs = filter.querySelectorAll('select, input');
                originalInputs.forEach(originalInput => {
                    // Find the corresponding cloned input
                    const clonedInput = clone.querySelector(`[id="${originalInput.id}"]`);
                    if (clonedInput) {
                        // Copy the ID and value
                        clonedInput.id = originalInput.id;
                        clonedInput.value = originalInput.value;
                        // For select elements, ensure options are selected correctly
                        if (originalInput.tagName === 'SELECT') {
                            Array.from(originalInput.options).forEach((opt, index) => {
                                clonedInput.options[index].selected = opt.selected;
                            });
                        }
                    }
                });
                mobileFilterControls.appendChild(clone);
            });
        }
    }

    bindEvents() {
        const closeButton = document.getElementById('closeFilterModal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.modal.classList.add('hidden');
            });
        }

        const applyMobileFilters = document.getElementById('applyMobileFilters');
        if (applyMobileFilters) {
            applyMobileFilters.addEventListener('click', () => {
                this.applyFilters();
                this.modal.classList.add('hidden');
            });
        }
    }

    applyFilters() {
        // Get transaction type from either desktop or mobile view
        const desktopType = document.querySelector('.filter-container #transactionType');
        const mobileType = document.querySelector('.mobile-filter-controls #transactionType');
        const transactionType = (desktopType && desktopType.value) ? desktopType : (mobileType && mobileType.value ? mobileType : null);

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

        // Close the mobile filter modal if it exists
        if (this.modal) {
            this.modal.classList.add('hidden');
        }

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