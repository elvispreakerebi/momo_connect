
class Header {
    constructor(onApplyFilters) {
        this.header = document.createElement('header');
        this.header.className = 'dashboard-header';
        this.onApplyFilters = onApplyFilters;
        this.loadLucideIcons();
        this.setupHeader();
        this.setupMobileFilterModal();
        this.bindEvents();
    }

    async loadLucideIcons() {
        try {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/lucide@latest';
            document.head.appendChild(script);
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
            lucide.createIcons();
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

    applyFilters() {
        const filters = {
            type: document.getElementById('transactionType')?.value || '',
            startDate: document.getElementById('startDate')?.value || '',
            endDate: document.getElementById('endDate')?.value || '',
            minAmount: document.getElementById('minAmount')?.value || '',
            maxAmount: document.getElementById('maxAmount')?.value || ''
        };

        if (this.onApplyFilters) {
            this.onApplyFilters(filters);
        }
    }

    render() {
        return this.header;
    }
}

export default Header;