// Content Management System
class ContentManager {
    constructor() {
        this.content = {
            training: {},
            supplements: {},
            smoothies: {}
        };
        this.searchInput = document.getElementById('content-search');
        this.contentGrid = document.getElementById('content-grid');
    }

    async loadContent() {
        try {
            const response = await fetch('/api/content');
            this.content = await response.json();
            this.renderContent();
            this.setupSearch();
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    renderContent() {
        if (!this.contentGrid) return;

        const html = Object.entries(this.content).map(([category, items]) => `
            <div class="content-item" data-category="${category}">
                <h3>${category}</h3>
                <div class="content-details">
                    ${this.renderItems(items)}
                </div>
            </div>
        `).join('');

        this.contentGrid.innerHTML = html;
    }

    renderItems(items) {
        return Object.entries(items).map(([key, value]) => `
            <div class="item" data-key="${key}">
                <h4>${value.title}</h4>
                <p>${value.description}</p>
            </div>
        `).join('');
    }

    setupSearch() {
        if (!this.searchInput) return;

        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.content-item');

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }
}

// Polar Device Integration
class PolarIntegration {
    constructor() {
        this.apiKey = process.env.POLAR_API_KEY;
        this.userId = process.env.POLAR_USER_ID;
        this.clientId = process.env.POLAR_CLIENT_ID;
        this.clientSecret = process.env.POLAR_CLIENT_SECRET;
        this.accessToken = process.env.POLAR_ACCESS_TOKEN;
        this.baseUrl = 'https://www.polaraccesslink.com/v3';
        this.tokenExpiry = null;
    }

    async ensureValidToken() {
        if (!this.accessToken || (this.tokenExpiry && Date.now() >= this.tokenExpiry)) {
            await this.refreshToken();
        }
    }

    async refreshToken() {
        try {
            const response = await fetch('https://polarremote.com/v2/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: this.accessToken
                })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);
            
            // Update .env file with new token
            await this.updateEnvToken(data.access_token);
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    }

    async updateEnvToken(newToken) {
        try {
            const response = await fetch('/api/update-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: newToken
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update token');
            }
        } catch (error) {
            console.error('Error updating token:', error);
        }
    }

    async getVO2Max() {
        try {
            await this.ensureValidToken();
            const response = await fetch(`${this.baseUrl}/users/${this.userId}/vo2max`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                value: data.vo2max,
                trend: this.calculateTrend(data.history),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching VO2Max:', error);
            return null;
        }
    }

    async getHRV() {
        try {
            await this.ensureValidToken();
            const response = await fetch(`${this.baseUrl}/users/${this.userId}/hrv`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                value: data.hrv,
                trend: this.calculateTrend(data.history),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching HRV:', error);
            return null;
        }
    }

    calculateTrend(history) {
        if (!history || history.length < 2) return 'neutral';
        
        const recent = history.slice(-2);
        const diff = recent[1] - recent[0];
        
        if (diff > 0) return 'up';
        if (diff < 0) return 'down';
        return 'neutral';
    }

    async updateMetrics() {
        const vo2max = await this.getVO2Max();
        const hrv = await this.getHRV();
        
        if (vo2max) {
            this.updateVO2MaxDisplay(vo2max);
            this.storeMetric('vo2max', vo2max);
        }
        
        if (hrv) {
            this.updateHRVDisplay(hrv);
            this.storeMetric('hrv', hrv);
        }
    }

    storeMetric(type, data) {
        const storedData = JSON.parse(localStorage.getItem(`polar_${type}`) || '[]');
        storedData.push(data);
        localStorage.setItem(`polar_${type}`, JSON.stringify(storedData));
    }

    updateVO2MaxDisplay(data) {
        const vo2maxElement = document.getElementById('vo2max-value');
        const trendElement = document.getElementById('vo2max-trend');
        
        if (vo2maxElement) {
            vo2maxElement.textContent = data.value.toFixed(1);
            vo2maxElement.setAttribute('data-timestamp', data.timestamp);
        }
        
        if (trendElement) {
            trendElement.className = `trend-indicator ${data.trend}`;
        }
    }

    updateHRVDisplay(data) {
        const hrvElement = document.getElementById('hrv-value');
        const trendElement = document.getElementById('hrv-trend');
        
        if (hrvElement) {
            hrvElement.textContent = data.value.toFixed(1);
            hrvElement.setAttribute('data-timestamp', data.timestamp);
        }
        
        if (trendElement) {
            trendElement.className = `trend-indicator ${data.trend}`;
        }
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Lazy Loading Implementation
class LazyLoader {
    constructor() {
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
    }

    observeImages() {
        document.querySelectorAll('img.lazy-image').forEach(img => {
            this.observer.observe(img);
        });
    }
}

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    const contentManager = new ContentManager();
    const polarIntegration = new PolarIntegration();
    const lazyLoader = new LazyLoader();

    // Load initial content
    contentManager.loadContent();
    lazyLoader.observeImages();

    // Update metrics every 5 minutes
    polarIntegration.updateMetrics();
    setInterval(() => polarIntegration.updateMetrics(), 300000);

    // Initialize mobile navigation
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileNavToggle && mobileNav) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
        });
    }
});
