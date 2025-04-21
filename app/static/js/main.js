// Main JavaScript file for Stock Market Analysis Platform

document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar toggle
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
    });

    // Initialize search functionality
    document.getElementById('searchBtn').addEventListener('click', searchStock);
    document.getElementById('stockSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStock();
        }
    });

    // Initialize tabs in modal
    document.querySelectorAll('#stockTabs button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('#stockTabs button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Add to watchlist button
    document.getElementById('addToWatchlist').addEventListener('click', function() {
        const symbol = document.querySelector('.modal-title').textContent.split(' ')[0];
        addToWatchlist(symbol);
    });

    // Load initial data
    loadMarketIndices();
    loadTrendingStocks();
    loadRecommendations();
});

// Search for a stock
function searchStock() {
    const searchInput = document.getElementById('stockSearch');
    const symbol = searchInput.value.trim().toUpperCase();
    
    if (symbol) {
        showStockDetails(symbol);
        searchInput.value = '';
    }
}

// Add to watchlist
function addToWatchlist(symbol) {
    // This would typically make an API call to save to the user's watchlist
    // For now, we'll just show a toast notification
    alert(`Added ${symbol} to your watchlist!`);
}

// Load market indices
async function loadMarketIndices() {
    const indices = [
        { symbol: '^GSPC', name: 'S&P 500' },
        { symbol: '^DJI', name: 'Dow Jones' },
        { symbol: '^IXIC', name: 'NASDAQ' },
        { symbol: '^RUT', name: 'Russell 2000' }
    ];

    const container = document.getElementById('market-indices');
    // Clear loading skeletons
    container.innerHTML = '';
    
    for (const index of indices) {
        try {
            const response = await fetch(`/api/stocks/quote/${index.symbol}`);
            const data = await response.json();
            
            const change = parseFloat(data['10. change percent']);
            const direction = change >= 0 ? 'up' : 'down';
            const icon = direction === 'up' ? 'bi-arrow-up-circle-fill' : 'bi-arrow-down-circle-fill';
            
            const card = document.createElement('div');
            card.className = 'col-md-3 col-sm-6 mb-3';
            card.innerHTML = `
                <div class="market-index ${direction}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="mb-0">${index.name}</h5>
                        <i class="bi ${icon} fs-5"></i>
                    </div>
                    <div class="price fs-4 fw-bold">$${parseFloat(data['05. price']).toFixed(2)}</div>
                    <div class="change ${direction} d-flex align-items-center mt-2">
                        <i class="bi ${icon === 'bi-arrow-up-circle-fill' ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'} me-1"></i>
                        ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        } catch (error) {
            console.error(`Error loading ${index.name}:`, error);
            // Show error state
            const card = document.createElement('div');
            card.className = 'col-md-3 col-sm-6 mb-3';
            card.innerHTML = `
                <div class="market-index">
                    <h5>${index.name}</h5>
                    <div class="text-muted">Unable to load data</div>
                </div>
            `;
            container.appendChild(card);
        }
    }
}

// Load trending stocks
async function loadTrendingStocks() {
    try {
        const response = await fetch('/api/stocks/trending');
        const stocks = await response.json();
        
        const tbody = document.getElementById('trending-stocks');
        tbody.innerHTML = '';
        
        if (stocks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">No trending stocks available</td></tr>`;
            return;
        }
        
        stocks.forEach(stock => {
            const row = document.createElement('tr');
            const change = parseFloat(stock['10. change percent']);
            const changeClass = change >= 0 ? 'price-up' : 'price-down';
            const icon = change >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right';
            
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="stock-icon me-2 bg-light rounded-circle p-2">
                            <i class="bi bi-graph-up"></i>
                        </div>
                        <div>
                            <div class="fw-bold">${stock['01. symbol']}</div>
                        </div>
                    </div>
                </td>
                <td class="fw-bold">$${parseFloat(stock['05. price']).toFixed(2)}</td>
                <td class="${changeClass}">
                    <i class="bi ${icon} me-1"></i>
                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                </td>
                <td>${parseInt(stock['06. volume']).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="showStockDetails('${stock['01. symbol']}')">
                        <i class="bi bi-info-circle me-1"></i> Details
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading trending stocks:', error);
        const tbody = document.getElementById('trending-stocks');
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading trending stocks</td></tr>`;
    }
}

// Load stock recommendations
async function loadRecommendations() {
    try {
        const response = await fetch('/api/stocks/recommendations');
        const recommendations = await response.json();
        
        const container = document.getElementById('recommended-stocks');
        container.innerHTML = '';
        
        if (recommendations.length === 0) {
            container.innerHTML = `<div class="col-12 text-center">No recommendations available</div>`;
            return;
        }
        
        recommendations.forEach(rec => {
            const confidencePercent = (rec.confidence * 100).toFixed(0);
            const confidenceClass = confidencePercent > 80 ? 'text-success' : 
                                   confidencePercent > 60 ? 'text-primary' : 'text-warning';
            
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-3';
            card.innerHTML = `
                <div class="recommendation-card">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="mb-0">${rec.symbol}</h5>
                        <span class="badge bg-primary">Recommended</span>
                    </div>
                    <p class="recommendation-reason">${rec.reason}</p>
                    <div class="progress mb-2" style="height: 5px;">
                        <div class="progress-bar" role="progressbar" style="width: ${confidencePercent}%" 
                            aria-valuenow="${confidencePercent}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <div class="confidence-score ${confidenceClass}">
                            Confidence: ${confidencePercent}%
                        </div>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="showStockDetails('${rec.symbol}')">
                            <i class="bi bi-bar-chart-fill me-1"></i> View
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading recommendations:', error);
        const container = document.getElementById('recommended-stocks');
        container.innerHTML = `<div class="col-12 text-center text-danger">Error loading recommendations</div>`;
    }
}

// Show stock details in modal
async function showStockDetails(symbol) {
    const modal = new bootstrap.Modal(document.getElementById('stockDetailModal'));
    
    // Show loading state
    document.querySelector('.modal-title').textContent = `${symbol} Details`;
    document.getElementById('stock-info').innerHTML = `<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">Loading stock data...</div></div>`;
    document.getElementById('stock-chart').innerHTML = '';
    
    modal.show();
    
    try {
        const response = await fetch(`/api/stocks/quote/${symbol}`);
        const data = await response.json();
        
        // Update stock info
        const infoContainer = document.getElementById('stock-info');
        const change = parseFloat(data['10. change percent']);
        const changeClass = change >= 0 ? 'price-up' : 'price-down';
        
        infoContainer.innerHTML = `
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Price Information</h5>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="fs-4 fw-bold">$${parseFloat(data['05. price']).toFixed(2)}</span>
                            <span class="${changeClass} fs-5">
                                <i class="bi ${change >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}"></i>
                                ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                            </span>
                        </div>
                        <div class="row">
                            <div class="col-6">
                                <div class="text-muted">Open</div>
                                <div>$${parseFloat(data['02. open']).toFixed(2)}</div>
                            </div>
                            <div class="col-6">
                                <div class="text-muted">Previous Close</div>
                                <div>$${parseFloat(data['08. previous close']).toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Trading Information</h5>
                        <div class="mb-3">
                            <div class="text-muted">Volume</div>
                            <div class="fs-5">${parseInt(data['06. volume']).toLocaleString()}</div>
                        </div>
                        <div class="mb-3">
                            <div class="text-muted">Latest Trading Day</div>
                            <div>${data['07. latest trading day']}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Create chart
        createStockChart(symbol, data);
        
    } catch (error) {
        console.error('Error loading stock details:', error);
        document.getElementById('stock-info').innerHTML = `<div class="col-12 text-center text-danger">Error loading stock data for ${symbol}</div>`;
    }
}

// Create a stock chart
function createStockChart(symbol, data) {
    const chartContainer = document.getElementById('stock-chart');
    
    // In a real application, you would fetch historical data here
    // For now, we'll create a placeholder chart
    
    const ctx = document.createElement('canvas');
    chartContainer.innerHTML = '';
    chartContainer.appendChild(ctx);
    
    // Sample data - in a real app, this would come from an API
    const price = parseFloat(data['05. price']);
    const dates = [];
    const prices = [];
    
    // Generate some fake historical data
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Generate a random price around the current price
        const randomFactor = 0.95 + (Math.random() * 0.1);
        prices.push((price * randomFactor).toFixed(2));
    }
    
    // Create chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: symbol,
                data: prices,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `$${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}
