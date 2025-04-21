// Main JavaScript file for Stock Market Analysis Platform

// Function to show stocks in a market index
async function showIndexStocks(symbol, indexName) {
    console.log('showIndexStocks called with:', symbol, indexName);
    // Create modal for displaying index stocks
    const modalId = 'indexStocksModal';
    let modal = document.getElementById(modalId);
    
    // If modal doesn't exist, create it
    if (!modal) {
        console.log('Creating new modal');
        const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${modalId}Label">Stocks in <span id="indexNameSpan"></span></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="input-group" style="max-width: 300px;">
                                <input type="text" class="form-control" id="stockSearchInput" placeholder="Search stocks...">
                                <button class="btn btn-outline-secondary" type="button">
                                    <i class="bi bi-search"></i>
                                </button>
                            </div>
                            <div class="d-flex">
                                <div class="me-2">
                                    <select class="form-select" id="sortBySelect">
                                        <option value="market_cap">Market Cap</option>
                                        <option value="price">Price</option>
                                        <option value="change">Change ($)</option>
                                        <option value="change_percent">Change (%)</option>
                                        <option value="volume">Volume</option>
                                        <option value="symbol">Symbol</option>
                                        <option value="name">Name</option>
                                        <option value="sector">Sector</option>
                                    </select>
                                </div>
                                <div>
                                    <select class="form-select" id="sortOrderSelect">
                                        <option value="desc">Descending</option>
                                        <option value="asc">Ascending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Symbol</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Change</th>
                                        <th>Change %</th>
                                        <th>Volume</th>
                                        <th>Market Cap (B)</th>
                                        <th>Sector</th>
                                    </tr>
                                </thead>
                                <tbody id="indexStocksTableBody">
                                    <!-- Stocks will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // Add modal to the document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
        
        modal = document.getElementById(modalId);
    } else {
        console.log('Using existing modal');
    }
    
    // Set the index name in the modal
    document.getElementById('indexNameSpan').textContent = indexName;
    
    try {
        // Load the stocks
        await loadIndexStocks(symbol);
        
        // Show the modal - use a direct approach to ensure it works
        if (typeof bootstrap !== 'undefined') {
            console.log('Using bootstrap modal');
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        } else {
            console.log('Bootstrap not available, using jQuery');
            // Fallback to jQuery if available
            if (typeof $ !== 'undefined') {
                $(modal).modal('show');
            } else {
                console.error('Neither bootstrap nor jQuery is available');
                // Manual fallback
                modal.style.display = 'block';
                modal.classList.add('show');
                document.body.classList.add('modal-open');
                
                // Create backdrop
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
            }
        }
    } catch (error) {
        console.error('Error showing index stocks:', error);
    }
}

// Function to load stocks in an index
async function loadIndexStocks(symbol, sortBy = 'market_cap', sortOrder = 'desc') {
    const tableBody = document.getElementById('indexStocksTableBody');
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';
    
    try {
        const response = await fetch(`/api/indices/${symbol}/stocks?sort_by=${sortBy}&sort_order=${sortOrder}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stocks = await response.json();
        tableBody.innerHTML = '';
        
        stocks.forEach(stock => {
            const row = document.createElement('tr');
            const direction = stock.change >= 0 ? 'positive' : 'negative';
            const icon = direction === 'positive' ? 'bi-arrow-up-right' : 'bi-arrow-down-right';
            
            row.innerHTML = `
                <td><strong>${stock.symbol}</strong></td>
                <td>${stock.name}</td>
                <td>$${stock.price.toFixed(2)}</td>
                <td class="${direction}">$${stock.change.toFixed(2)}</td>
                <td class="${direction}">
                    <i class="bi ${icon} me-1"></i>
                    ${stock.change_percent}
                </td>
                <td>${stock.volume.toLocaleString()}</td>
                <td>$${stock.market_cap.toFixed(2)}B</td>
                <td><span class="badge bg-light text-dark">${stock.sector}</span></td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Store the original data for filtering
        tableBody.dataset.originalContent = tableBody.innerHTML;
        
        // Add event listeners for sorting and filtering
        document.getElementById('sortBySelect').addEventListener('change', function() {
            loadIndexStocks(symbol, this.value, document.getElementById('sortOrderSelect').value);
        });
        
        document.getElementById('sortOrderSelect').addEventListener('change', function() {
            loadIndexStocks(symbol, document.getElementById('sortBySelect').value, this.value);
        });
        
        document.getElementById('stockSearchInput').addEventListener('input', function() {
            filterStocks(this.value);
        });
        
    } catch (error) {
        console.error('Error loading index stocks:', error);
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading stocks. Please try again later.</td></tr>`;
    }
}

// Function to filter stocks based on search input
function filterStocks(searchTerm) {
    const tableBody = document.getElementById('indexStocksTableBody');
    const originalContent = tableBody.dataset.originalContent;
    
    if (!searchTerm.trim()) {
        // If search term is empty, restore original content
        tableBody.innerHTML = originalContent;
        return;
    }
    
    // Create a temporary element to parse the original content
    const tempElement = document.createElement('div');
    tempElement.innerHTML = originalContent;
    const rows = tempElement.querySelectorAll('tr');
    
    // Filter rows based on search term
    const filteredRows = Array.from(rows).filter(row => {
        const text = row.textContent.toLowerCase();
        return text.includes(searchTerm.toLowerCase());
    });
    
    // Update table with filtered rows
    tableBody.innerHTML = '';
    if (filteredRows.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No matching stocks found</td></tr>`;
    } else {
        filteredRows.forEach(row => tableBody.appendChild(row.cloneNode(true)));
    }
}

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

    // Initialize navigation links
    initializeNavigation();

    // Load initial data
    loadMarketIndices();
    loadTrendingStocks();
    loadStockRecommendations();
});

// Initialize navigation links
function initializeNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('#sidebar .nav-link');
    
    // Add click event listeners to each link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Get the href attribute (section ID)
            const targetSection = this.getAttribute('href').substring(1);
            
            // Handle different sections
            switch(targetSection) {
                case 'dashboard':
                    showDashboard();
                    break;
                case 'discover':
                    showDiscover();
                    break;
                case 'watchlist':
                    showWatchlist();
                    break;
                case 'news':
                    showNews();
                    break;
                case 'settings':
                    showSettings();
                    break;
                default:
                    showDashboard();
            }
        });
    });
}

// Search for a stock
function searchStock() {
    const searchInput = document.getElementById('stockSearch');
    const symbol = searchInput.value.trim().toUpperCase();
    
    if (symbol) {
        showStockDetails(symbol);
        searchInput.value = '';
    }
}

// Show Dashboard Section
function showDashboard() {
    // Get the content container
    const contentContainer = document.querySelector('#content .container-fluid');
    
    // Show all dashboard sections
    document.querySelectorAll('.row.mb-4').forEach(section => {
        section.style.display = 'flex';
    });
}

// Show Discover Section
function showDiscover() {
    // Get the content container
    const contentContainer = document.querySelector('#content .container-fluid');
    
    // Hide all sections first
    document.querySelectorAll('.row.mb-4').forEach(section => {
        section.style.display = 'none';
    });
    
    // Create discover content if it doesn't exist
    let discoverSection = document.getElementById('discover-section');
    if (!discoverSection) {
        discoverSection = document.createElement('div');
        discoverSection.id = 'discover-section';
        discoverSection.className = 'row mb-4';
        discoverSection.innerHTML = `
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="card-title mb-0">Discover New Stocks</h5>
                    </div>
                    <div class="card-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="sectorFilter">Filter by Sector</label>
                                    <select class="form-control" id="sectorFilter">
                                        <option value="">All Sectors</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Consumer">Consumer</option>
                                        <option value="Energy">Energy</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="marketCapFilter">Filter by Market Cap</label>
                                    <select class="form-control" id="marketCapFilter">
                                        <option value="">All Market Caps</option>
                                        <option value="large">Large Cap (>$10B)</option>
                                        <option value="mid">Mid Cap ($2B-$10B)</option>
                                        <option value="small">Small Cap ($300M-$2B)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="text-center py-5">
                            <div class="spinner-border text-primary" role="status"></div>
                            <p class="mt-3">This feature will be available in the next update.</p>
                            <p>The discover section will allow you to find new investment opportunities based on various filters and criteria.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contentContainer.appendChild(discoverSection);
    }
    
    // Show discover section
    discoverSection.style.display = 'flex';
}

// Show Watchlist Section
function showWatchlist() {
    // Get the content container
    const contentContainer = document.querySelector('#content .container-fluid');
    
    // Hide all sections first
    document.querySelectorAll('.row.mb-4').forEach(section => {
        section.style.display = 'none';
    });
    
    // Create watchlist content if it doesn't exist
    let watchlistSection = document.getElementById('watchlist-section');
    if (!watchlistSection) {
        watchlistSection = document.createElement('div');
        watchlistSection.id = 'watchlist-section';
        watchlistSection.className = 'row mb-4';
        watchlistSection.innerHTML = `
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="card-title mb-0">Your Watchlist</h5>
                    </div>
                    <div class="card-body">
                        <div class="text-center py-5">
                            <i class="bi bi-star fs-1 text-warning mb-3"></i>
                            <h4>Your watchlist is empty</h4>
                            <p class="text-muted">Add stocks to your watchlist to track them here.</p>
                            <p>Use the "Add to Watchlist" button when viewing stock details.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contentContainer.appendChild(watchlistSection);
    }
    
    // Show watchlist section
    watchlistSection.style.display = 'flex';
}

// Show News Section
function showNews() {
    // Get the content container
    const contentContainer = document.querySelector('#content .container-fluid');
    
    // Hide all sections first
    document.querySelectorAll('.row.mb-4').forEach(section => {
        section.style.display = 'none';
    });
    
    // Create news content if it doesn't exist
    let newsSection = document.getElementById('news-section');
    if (!newsSection) {
        newsSection = document.createElement('div');
        newsSection.id = 'news-section';
        newsSection.className = 'row mb-4';
        newsSection.innerHTML = `
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="card-title mb-0">Market News</h5>
                    </div>
                    <div class="card-body">
                        <div class="text-center py-5">
                            <i class="bi bi-newspaper fs-1 text-primary mb-3"></i>
                            <h4>Market News Coming Soon</h4>
                            <p class="text-muted">This feature will be available in the next update.</p>
                            <p>Stay tuned for the latest market news and analysis.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contentContainer.appendChild(newsSection);
    }
    
    // Show news section
    newsSection.style.display = 'flex';
}

// Show Settings Section
function showSettings() {
    // Get the content container
    const contentContainer = document.querySelector('#content .container-fluid');
    
    // Hide all sections first
    document.querySelectorAll('.row.mb-4').forEach(section => {
        section.style.display = 'none';
    });
    
    // Create settings content if it doesn't exist
    let settingsSection = document.getElementById('settings-section');
    if (!settingsSection) {
        settingsSection = document.createElement('div');
        settingsSection.id = 'settings-section';
        settingsSection.className = 'row mb-4';
        settingsSection.innerHTML = `
            <div class="col-12">
                <div class="card shadow-sm">
                    <div class="card-header bg-transparent">
                        <h5 class="card-title mb-0">Settings</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="mb-3">Display Settings</h6>
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="darkModeToggle">
                                    <label class="form-check-label" for="darkModeToggle">Dark Mode</label>
                                </div>
                                <div class="form-check form-switch mb-3">
                                    <input class="form-check-input" type="checkbox" id="compactViewToggle">
                                    <label class="form-check-label" for="compactViewToggle">Compact View</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h6 class="mb-3">API Settings</h6>
                                <div class="mb-3">
                                    <label for="apiKeyInput" class="form-label">Alpha Vantage API Key</label>
                                    <input type="password" class="form-control" id="apiKeyInput" value="********">
                                </div>
                                <div class="text-muted small">API key is stored securely in your .env file</div>
                            </div>
                        </div>
                        <div class="row mt-4">
                            <div class="col-12">
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Settings functionality will be fully implemented in the next update.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contentContainer.appendChild(settingsSection);
    }
    
    // Show settings section
    settingsSection.style.display = 'flex';
}

// Add to watchlist
function addToWatchlist(symbol) {
    // This would typically make an API call to save to the user's watchlist
    // For now, we'll just show a toast notification
    alert(`Added ${symbol} to your watchlist!`);
}

// Load market indices
async function loadMarketIndices() {
    const container = document.getElementById('market-indices');
    // Clear loading skeletons
    container.innerHTML = '';
    
    try {
        const response = await fetch('/api/markets/indices');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const marketIndicesContainer = document.getElementById('market-indices');
        marketIndicesContainer.innerHTML = '';
        
        data.forEach(data => {
            const direction = data.change > 0 ? 'positive' : 'negative';
            const icon = direction === 'positive' ? 'bi-arrow-up-circle-fill' : 'bi-arrow-down-circle-fill';
            
            const card = document.createElement('div');
            card.className = 'col-md-3 col-sm-6 mb-3';
            card.innerHTML = `
                <div class="market-index ${direction}" data-symbol="${data.symbol}" data-name="${data.name}">
                    <i class="bi ${icon} index-icon"></i>
                    <div class="d-flex flex-column">
                        <h5 class="mb-1 fw-bold">${data.name}</h5>
                        <small class="text-muted mb-2">Last updated: ${new Date().toLocaleTimeString()}</small>
                    </div>
                    <div class="price">$${data.price}</div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="change ${direction}">
                            <i class="bi ${icon === 'bi-arrow-up-circle-fill' ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'} me-1"></i>
                            ${data.change_percent}
                        </div>
                        <div class="text-muted small">Today</div>
                    </div>
                </div>
            `;
            
            // Add click event to show stocks in this index
            card.querySelector('.market-index').addEventListener('click', function(e) {
                console.log('Market index clicked');
                const symbol = this.getAttribute('data-symbol');
                const name = this.getAttribute('data-name');
                console.log('Opening index:', symbol, name);
                showIndexStocks(symbol, name);
                e.preventDefault();
                e.stopPropagation();
            });
            
            marketIndicesContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading market indices:', error);
        
        // Fallback data in case the API fails
        const fallbackIndices = [
            { symbol: '^GSPC', name: 'S&P 500', price: '4,514.02', change: '+1.53%', direction: 'up' },
            { symbol: '^DJI', name: 'Dow Jones', price: '35,390.15', change: '+1.12%', direction: 'up' },
            { symbol: '^IXIC', name: 'NASDAQ', price: '14,176.32', change: '+1.54%', direction: 'up' },
            { symbol: '^RUT', name: 'Russell 2000', price: '1,792.55', change: '+1.36%', direction: 'up' }
        ];
        
        // Create cards with fallback data
        for (const index of fallbackIndices) {
            const icon = index.direction === 'up' ? 'bi-arrow-up-circle-fill' : 'bi-arrow-down-circle-fill';
            
            const card = document.createElement('div');
            card.className = 'col-md-3 col-sm-6 mb-3';
            card.innerHTML = `
                <div class="market-index ${index.direction}" data-symbol="${index.symbol}" data-name="${index.name}">
                    <i class="bi ${icon} index-icon"></i>
                    <div class="d-flex flex-column">
                        <h5 class="mb-1 fw-bold">${index.name}</h5>
                        <small class="text-muted mb-2">Last updated: ${new Date().toLocaleTimeString()}</small>
                    </div>
                    <div class="price">$${index.price}</div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="change ${index.direction}">
                            <i class="bi ${icon === 'bi-arrow-up-circle-fill' ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'} me-1"></i>
                            ${index.change}
                        </div>
                        <div class="text-muted small">Today</div>
                    </div>
                </div>
            `;
            
            // Add click event to show stocks in this index
            card.querySelector('.market-index').addEventListener('click', function(e) {
                console.log('Market index clicked');
                const symbol = this.getAttribute('data-symbol');
                const name = this.getAttribute('data-name');
                console.log('Opening index:', symbol, name);
                showIndexStocks(symbol, name);
                e.preventDefault();
                e.stopPropagation();
            });
            
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
        
        // Safely parse numeric values with fallbacks
        const safeParseFloat = (value) => {
            if (!value || value === 'NaN' || value === 'null' || value === 'undefined') return 0;
            const parsed = parseFloat(value.toString().replace('%', ''));
            return isNaN(parsed) ? 0 : parsed;
        };
        
        const safeParseInt = (value) => {
            if (!value || value === 'NaN' || value === 'null' || value === 'undefined') return 0;
            const parsed = parseInt(value);
            return isNaN(parsed) ? 0 : parsed;
        };
        
        // Get price and change values with fallbacks
        const price = safeParseFloat(data['05. price']);
        const changePercent = safeParseFloat(data['10. change percent']);
        const open = safeParseFloat(data['02. open']);
        const prevClose = safeParseFloat(data['08. previous close']);
        const volume = safeParseInt(data['06. volume']);
        const tradingDay = data['07. latest trading day'] || 'Not available';
        
        // Determine change direction
        const changeClass = changePercent >= 0 ? 'price-up' : 'price-down';
        
        infoContainer.innerHTML = `
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Price Information</h5>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="fs-4 fw-bold">$${price.toFixed(2)}</span>
                            <span class="${changeClass} fs-5">
                                <i class="bi ${changePercent >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}"></i>
                                ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%
                            </span>
                        </div>
                        <div class="row">
                            <div class="col-6">
                                <div class="text-muted">Open</div>
                                <div>$${open.toFixed(2)}</div>
                            </div>
                            <div class="col-6">
                                <div class="text-muted">Previous Close</div>
                                <div>$${prevClose.toFixed(2)}</div>
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
                            <div class="fs-5">${volume.toLocaleString()}</div>
                        </div>
                        <div class="mb-3">
                            <div class="text-muted">Latest Trading Day</div>
                            <div>${tradingDay}</div>
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
