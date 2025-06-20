class PolarIntegration {
    constructor() {
        this.clientId = process.env.POLAR_CLIENT_ID;
        this.clientSecret = process.env.POLAR_CLIENT_SECRET;
        this.userId = process.env.POLAR_USER_ID;
        this.accessToken = process.env.POLAR_ACCESS_TOKEN;
        this.tokenExpiry = null;
    }

    async ensureValidToken() {
        if (!this.accessToken || this.isTokenExpired()) {
            await this.refreshToken();
        }
    }

    isTokenExpired() {
        return this.tokenExpiry && Date.now() >= this.tokenExpiry;
    }

    async refreshToken() {
        try {
            const response = await fetch('https://www.polaraccesslink.com/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: process.env.POLAR_REFRESH_TOKEN
                })
            });

            if (!response.ok) {
                throw new Error(`Token refresh failed: ${response.status}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);

            // Update token on server
            await fetch('/api/update-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: this.accessToken })
            });

            return true;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return false;
        }
    }

    async getVO2Max() {
        await this.ensureValidToken();
        try {
            const response = await fetch('/api/polar/vo2max');
            if (!response.ok) {
                throw new Error(`Failed to fetch VO2Max: ${response.status}`);
            }
            const data = await response.json();
            this.storeMetric('vo2max', data);
            return data;
        } catch (error) {
            console.error('Error fetching VO2Max:', error);
            return null;
        }
    }

    async getHRV() {
        await this.ensureValidToken();
        try {
            const response = await fetch('/api/polar/hrv');
            if (!response.ok) {
                throw new Error(`Failed to fetch HRV: ${response.status}`);
            }
            const data = await response.json();
            this.storeMetric('hrv', data);
            return data;
        } catch (error) {
            console.error('Error fetching HRV:', error);
            return null;
        }
    }

    storeMetric(metric, data) {
        const storedData = JSON.parse(localStorage.getItem(`polar_${metric}`) || '[]');
        storedData.push({
            value: data.value,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(`polar_${metric}`, JSON.stringify(storedData));
    }

    displayVO2Max(data) {
        const vo2maxElement = document.getElementById('vo2max-value');
        if (!vo2maxElement || !data) return;

        const storedData = JSON.parse(localStorage.getItem('polar_vo2max') || '[]');
        const previousValue = storedData.length > 1 ? storedData[storedData.length - 2].value : null;
        
        let trendIndicator = '';
        if (previousValue) {
            const difference = data.value - previousValue;
            trendIndicator = difference > 0 ? '↑' : difference < 0 ? '↓' : '→';
        }

        vo2maxElement.innerHTML = `
            <div class="metric-value">${data.value}</div>
            <div class="metric-trend">${trendIndicator}</div>
            <div class="metric-timestamp">Last updated: ${new Date().toLocaleString()}</div>
        `;
    }

    displayHRV(data) {
        const hrvElement = document.getElementById('hrv-value');
        if (!hrvElement || !data) return;

        const storedData = JSON.parse(localStorage.getItem('polar_hrv') || '[]');
        const previousValue = storedData.length > 1 ? storedData[storedData.length - 2].value : null;
        
        let trendIndicator = '';
        if (previousValue) {
            const difference = data.value - previousValue;
            trendIndicator = difference > 0 ? '↑' : difference < 0 ? '↓' : '→';
        }

        hrvElement.innerHTML = `
            <div class="metric-value">${data.value}</div>
            <div class="metric-trend">${trendIndicator}</div>
            <div class="metric-timestamp">Last updated: ${new Date().toLocaleString()}</div>
        `;
    }
}

// Initialize Polar integration
const polar = new PolarIntegration();

// Update metrics every 5 minutes
setInterval(async () => {
    const vo2max = await polar.getVO2Max();
    const hrv = await polar.getHRV();
    
    polar.displayVO2Max(vo2max);
    polar.displayHRV(hrv);
}, 300000);

// Initial update
polar.getVO2Max().then(polar.displayVO2Max);
polar.getHRV().then(polar.displayHRV); 