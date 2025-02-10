// Import necessary dependencies
import { fetchFromAPI } from './api.js';
// Chart.js is loaded globally via CDN

// Initialize charts when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCharts);

async function initializeCharts() {
    try {
        // Fetch data for each chart type
        const [volumeResponse, monthlyResponse, distributionResponse] = await Promise.all([
            fetchFromAPI('/visualization/transaction-volume'),
            fetchFromAPI('/visualization/monthly-summary'),
            fetchFromAPI('/visualization/distribution')
        ]);

        // Check if any requests failed
        if (!volumeResponse || !monthlyResponse || !distributionResponse) {
            throw new Error('Failed to fetch visualization data');
        }
        
        // Create charts with the fetched data
        createTransactionVolumeChart(volumeResponse);
        createMonthlyTrendsChart(monthlyResponse);
        createTransactionDistributionChart(distributionResponse);
    } catch (error) {
        console.error('Error initializing charts:', error);
        // Show error message to user
        const snackbar = document.querySelector('.snackbar');
        if (snackbar) {
            snackbar.textContent = 'Failed to load charts';
            snackbar.classList.add('show');
            setTimeout(() => snackbar.classList.remove('show'), 3000);
        }
    }
}

function createTransactionVolumeChart(data) {
    const ctx = document.getElementById('transactionVolumeChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.type),
            datasets: [{
                label: 'Number of Transactions',
                data: data.map(item => item.count),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Transaction Volume by Type'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function createMonthlyTrendsChart(data) {
    const ctx = document.getElementById('monthlyTrendsChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.month),
            datasets: [{
                label: 'Total Amount',
                data: data.map(item => item.totalAmount),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Transaction Trends'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `RWF ${value.toLocaleString()}`
                    }
                }
            }
        }
    });
}

function createTransactionDistributionChart(data) {
    const ctx = document.getElementById('transactionDistributionChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(item => item.type),
            datasets: [{
                data: data.map(item => item.amount),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(34, 197, 94, 0.5)',
                    'rgba(249, 115, 22, 0.5)',
                    'rgba(168, 85, 247, 0.5)',
                    'rgba(236, 72, 153, 0.5)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(34, 197, 94)',
                    'rgb(249, 115, 22)',
                    'rgb(168, 85, 247)',
                    'rgb(236, 72, 153)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Transaction Distribution'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}