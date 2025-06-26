// --- Main site JavaScript ---
// Add/expand comments for clarity and maintainability throughout
// Remove legacy or unused code (messages feature, etc.)
// Suggest modularization if file grows further

// DOM Ready handler
document.addEventListener('DOMContentLoaded', () => {
    try { initializeUI(); } catch (e) { console.error('UI init error:', e); }
    try { initializeHyroxDashboard(); } catch (e) { console.error('HyroxDashboard error:', e); }
    try { initializeProjectCards(); } catch (e) { console.error('ProjectCards error:', e); }
    try { initializeActivityTabs(); } catch (e) { console.error('ActivityTabs error:', e); }
    try {
        // Tab functionality for .tabs-container (Training section)
        const tabsContainers = document.querySelectorAll('.tabs-container');
        tabsContainers.forEach(container => {
            const buttons = container.querySelectorAll('.tab-button');
            const panes = container.querySelectorAll('.tab-pane');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    buttons.forEach(btn => btn.classList.remove('active'));
                    panes.forEach(pane => pane.classList.remove('active'));
                    button.classList.add('active');
                    const targetTab = button.dataset.tab;
                    const targetPane = container.querySelector(`#${targetTab}`);
                    if (targetPane) targetPane.classList.add('active');
                });
            });
            if (container.querySelector('.tab-button.active') === null) {
                const firstButton = container.querySelector('.tab-button');
                const firstPane = container.querySelector('.tab-pane');
                if (firstButton) firstButton.classList.add('active');
                if (firstPane) firstPane.classList.add('active');
            }
        });
    } catch (e) { console.error('Tabs error:', e); }
    try {
        // Timeline filter buttons
        const filterBtns = document.querySelectorAll('.timeline-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const source = btn.dataset.source;
                const githubOverview = document.getElementById('github-overview');
                const stravaOverview = document.getElementById('strava-overview');

                if (githubOverview && stravaOverview) {
                    if (source === 'all') {
                        // Hide both overviews on All tab - only show timeline
                        githubOverview.style.display = 'none';
                        stravaOverview.style.display = 'none';
                    } else if (source === 'github') {
                        githubOverview.style.display = 'block';
                        stravaOverview.style.display = 'none';
                    } else if (source === 'strava') {
                        githubOverview.style.display = 'none';
                        stravaOverview.style.display = 'block';
                    }
                }

                if (typeof updateTimeline === 'function') updateTimeline(source);
            });
        });
    } catch (e) { console.error('Timeline tabs error:', e); }
    try { if (typeof updateTimeline === 'function') updateTimeline(); } catch (e) { console.error('Timeline update error:', e); }
    try { if (typeof initializeStrava === 'function') initializeStrava(); } catch (e) { console.error('Strava error:', e); }
    try { initializeGitHubGraph(); } catch (e) { console.error('GitHub Graph error:', e); }
    // Other DOMContentLoaded code blocks can be added here as needed
});

// Initialize UI components
function initializeUI() {
    const header = document.querySelector('.header');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (header) {
        initializeHeader();
    }
    
    if (mobileNav) {
        initializeMobileNav();
    }
    
    initializeSmoothScroll();
    initializeShare();
    handleSectionTransitions();
}

// Header scroll effect
function initializeHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });
}

// Mobile navigation
function initializeMobileNav() {
    const mobileNav = document.querySelector('.mobile-nav');
    if (!mobileNav) return;
    
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                mobileNav.classList.remove('active');
            }
        });
    });
}

// Smooth scroll
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const header = document.querySelector('.header');
                const headerOffset = header ? header.offsetHeight : 0;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Share functionality
function initializeShare() {
    const shareButtons = document.querySelectorAll('.share-button');
    if (!shareButtons.length) return;
    
    shareButtons.forEach(button => {
        button.addEventListener('click', async () => {
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: document.title,
                        url: window.location.href
                    });
                } else {
                    // Fallback
                    navigator.clipboard.writeText(window.location.href);
                    showNotification('Link copied to clipboard!');
                }
            } catch (err) {
                console.error('Share failed:', err);
            }
        });
    });
}

// Handle section transitions
function handleSectionTransitions() {
    const sections = document.querySelectorAll('.section-transition'); // Target elements with this class
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    }, options);

    sections.forEach(section => {
        // Observe the section for future scrolling into view
        observer.observe(section);

        // Also check if the section is already in the viewport on load
        const rect = section.getBoundingClientRect();
        const isAlreadyVisible = (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
            rect.bottom >= 0 &&
            rect.right >= 0
        );

        if (isAlreadyVisible) {
            section.classList.add('active');
            observer.unobserve(section); // Stop observing if already visible
        }
    });
}

// --- Notification helper ---
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Strava integration - This is now handled via the timeline functions
// The old client-side logic has been removed.

// --- Timeline Section ---
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

async function fetchStravaTimeline() {
    try {
        // Note: This fetch will only succeed on the deployed Netlify site.
        // On a local server, it will fail, and the timeline will show GitHub data only.
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
            return []; // Return empty array on local dev to prevent errors
        }

        const response = await fetch('/.netlify/functions/strava');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const activities = await response.json();
        
        // Map the raw Strava data to the format the timeline renderer expects
        return activities.map(a => ({
            type: 'strava',
            icon: a.type.toLowerCase().includes('run') ? '🏃‍♂️' : a.type.toLowerCase().includes('ride') ? '🚴‍♂️' : a.type.toLowerCase().includes('swim') ? '🏊‍♂️' : '💪',
            title: a.name,
            desc: `${(a.distance / 1000).toFixed(1)}km · ${formatDuration(a.moving_time)}${a.total_elevation_gain ? ` · ⛰️ ${Math.round(a.total_elevation_gain)}m` : ''}`,
            date: new Date(a.start_date),
            badge: 'Strava',
            badgeClass: 'strava',
            raw: a
        }));
    } catch (error) {
        console.error('Error fetching Strava timeline:', error);
        return []; // Return empty array on error
    }
}

async function fetchGitHubTimeline() {
    try {
        const response = await fetch('https://api.github.com/users/AllBlazing/events/public');
        if (!response.ok) throw new Error('Network response was not ok.');
        const events = await response.json();
        
        return events
            .filter(e => e.type === 'PushEvent' && e.payload.commits)
            .map(e => ({
                type: 'github',
                icon: '💻',
                title: `Pushed to ${e.repo.name.split('/')[1]}`,
                desc: `${e.payload.commits.length} commit${e.payload.commits.length > 1 ? 's' : ''}. Last: "${e.payload.commits[0].message}"`,
                date: new Date(e.created_at),
                badge: 'GitHub',
                badgeClass: 'github'
            }));
    } catch (error) {
        console.error('Error fetching GitHub timeline:', error);
        return [];
    }
}

function displayStravaStats(activities) {
    if (!activities || activities.length === 0) return;
    
    const monthlyStats = activities.reduce((acc, activity) => {
        const month = activity.raw.start_date.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
            acc[month] = { distance: 0, moving_time: 0, elevation_gain: 0, count: 0 };
        }
        acc[month].distance += activity.raw.distance;
        acc[month].moving_time += activity.raw.moving_time;
        acc[month].elevation_gain += activity.raw.total_elevation_gain;
        acc[month].count++;
        return acc;
    }, {});
    
    const statsContainer = document.getElementById('strava-stats-container');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = Object.entries(monthlyStats).map(([month, stats]) => `
        <div class="stat-card">
            <div class="stat-header">
                <h4>${new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
            </div>
            <div class="stat-content">
                <div class="stat-item">
                    <span class="stat-label">Activities</span>
                    <span class="stat-value">${stats.count}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Distance</span>
                    <span class="stat-value">${(stats.distance / 1000).toFixed(1)} km</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Time</span>
                    <span class="stat-value">${formatDuration(stats.moving_time)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Elevation</span>
                    <span class="stat-value">${Math.round(stats.elevation_gain)} m</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderTimeline(entries) {
    const timeline = document.getElementById('timeline-list');
    if (!timeline) return;

    // Sort entries chronologically, most recent first
    entries.sort((a, b) => b.date - a.date);

    if (entries.length === 0) {
        timeline.innerHTML = '<li class="timeline-item-empty">No recent activity to display.</li>';
        return;
    }

    timeline.innerHTML = entries.map(entry => `
        <li class="timeline-item">
            <div class="timeline-marker">
                <div class="timeline-icon">${entry.icon}</div>
            </div>
            <div class="timeline-card">
                <div class="timeline-header">
                    <span class="badge ${entry.badgeClass}">${entry.badge}</span>
                    <span class="timeline-date">${timeAgo(entry.date)}</span>
                </div>
                <div class="timeline-content">
                    <h5>${entry.title}</h5>
                    <p>${entry.desc}</p>
                </div>
            </div>
        </li>
    `).join('');
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
}

async function updateTimeline(filter = 'all') {
    const timelineList = document.getElementById('timeline-list');
    const githubOverview = document.getElementById('github-overview');
    const stravaOverview = document.getElementById('strava-overview');
    
    if (!timelineList) return;
    
    timelineList.innerHTML = '<li class="loading">Loading timeline...</li>';
    
    let stravaEntries = [];
    let githubEntries = [];
    
    try {
        // Fetch all data first
        if (filter === 'all' || filter === 'strava') {
            stravaEntries = await fetchStravaTimeline();
        }
        if (filter === 'all' || filter === 'github') {
            githubEntries = await fetchGitHubTimeline();
        }

        // Handle different tab content
        if (filter === 'strava') {
            // Show Strava monthly stats and only 5 recent activities
            if (stravaEntries.length > 0) {
                displayStravaStats(stravaEntries);
                
                // Filter for recent activities (last 7 days) and limit to 5
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const recentStrava = stravaEntries
                    .filter(entry => entry.date >= sevenDaysAgo)
                    .slice(0, 5);
                
                renderTimeline(recentStrava);
                
                // Show Strava overview, hide GitHub
                if (stravaOverview) stravaOverview.style.display = 'block';
                if (githubOverview) githubOverview.style.display = 'none';
            } else {
                const statsContainer = document.getElementById('strava-stats-container');
                if (statsContainer) statsContainer.innerHTML = '<p class="no-data">No Strava data available.</p>';
                timelineList.innerHTML = '<li class="timeline-item-empty">No Strava activities found.</li>';
            }
        } else if (filter === 'github') {
            // GitHub tab shows contribution graph and timeline (limit to 5 entries)
            if (githubEntries.length > 0) {
                const recentGitHub = githubEntries.slice(0, 5);
                renderTimeline(recentGitHub);
            } else {
                timelineList.innerHTML = '<li class="timeline-item-empty">No GitHub activity found.</li>';
            }
            
            // Show GitHub overview, hide Strava
            if (githubOverview) githubOverview.style.display = 'block';
            if (stravaOverview) stravaOverview.style.display = 'none';
        } else {
            // All tab: combine and show mixed timeline only (max 5 each)
            const timelineStrava = stravaEntries.slice(0, 5);
            const timelineGitHub = githubEntries.slice(0, 5);
            
            // Combine and sort chronologically
            let allEntries = [...timelineStrava, ...timelineGitHub];
            allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (allEntries.length > 0) {
                renderTimeline(allEntries);
            } else {
                timelineList.innerHTML = '<li class="timeline-item-empty">No recent activity to display.</li>';
            }
            
            // Hide both overviews on All tab
            if (stravaOverview) stravaOverview.style.display = 'none';
            if (githubOverview) githubOverview.style.display = 'none';
        }

    } catch (error) {
        console.error('Failed to update timeline:', error);
        timelineList.innerHTML = '<li class="error">Could not load timeline.</li>';
    }
}


// --- Lazy Loading for Images & Videos ---
class LazyLoader {
    constructor() {
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadMedia(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px 100px 0px' });
    }

    observeImages() {
        document.querySelectorAll('img[data-src]').forEach(img => this.observer.observe(img));
    }

    observeVideos() {
        document.querySelectorAll('video[data-src]').forEach(video => this.observer.observe(video));
    }

    loadMedia(element) {
        if (element.tagName === 'IMG') {
            element.src = element.dataset.src;
        } else if (element.tagName === 'VIDEO') {
            const source = document.createElement('source');
            source.src = element.dataset.src;
            source.type = 'video/mp4';
            element.appendChild(source);
            element.load();
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const lazyLoader = new LazyLoader();
    lazyLoader.observeImages();
    lazyLoader.observeVideos();
});

// --- Hyrox Race Countdown & Training Dashboard ---
// Wrap all Hyrox-related logic in a single initialization function
// This keeps the global scope clean and logic organized
function initializeHyroxDashboard() {
    const countdownElement = document.getElementById('race-countdown');
    const raceDate = new Date('2025-09-19T09:00:00Z'); // Store race date here

    if (!countdownElement) {
        // console.warn("Countdown element 'race-countdown' not found. Skipping.");
        return; // Exit if the dashboard isn't on the current page
    }

    // --- Core Countdown Logic ---
    // Moved the countdown logic inside the dashboard initializer
    // This ensures it only runs when the #race-countdown element is present
    function renderCountdown() {
        const now = new Date();
        const timeLeft = raceDate - now;

        if (timeLeft <= 0) {
            countdownElement.innerHTML = `<div class="race-finished">Good luck, Mark!</div>`;
            return; // Stop the countdown
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `
            <div class="countdown-item"><span>${days}</span>Days</div>
            <div class="countdown-item"><span>${hours}</span>Hours</div>
            <div class="countdown-item"><span>${minutes}</span>Mins</div>
            <div class="countdown-item"><span>${seconds}</span>Secs</div>
        `;
    }

    // Initial render and set interval to update every second
    renderCountdown();
    setInterval(renderCountdown, 1000);
}

// --- Project Cards Hover Effect ---
// This function adds a 3D-like hover effect to project cards
function initializeProjectCards() {
    const cards = document.querySelectorAll('.project-card, .stat-card, .training-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotateX = (y / rect.height - 0.5) * -15; // Invert for natural feel
            const rotateY = (x / rect.width - 0.5) * 15;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}
// Utility to pad numbers for the clock
function pad(n) { return n < 10 ? '0' + n : n; }

// Combined clock and date function
function getTimeLeft() {
    const now = new Date();
    
    // Time
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 24hr to 12hr format
    const timeString = `${pad(displayHours)}:${pad(minutes)} ${ampm}`;
    
    // Date
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const year = now.getFullYear();
    const dateString = `${day}, ${month} ${date}, ${year}`;

    return { timeString, dateString };
}

// Render clock and date
function renderCountdown() {
    const { timeString, dateString } = getTimeLeft();
    
    const timeEl = document.getElementById('live-time');
    const dateEl = document.getElementById('live-date');
    
    if (timeEl) timeEl.textContent = timeString;
    if (dateEl) dateEl.textContent = dateString;
}

// Initial call and update every minute
// renderCountdown();
// setInterval(renderCountdown, 60 * 1000); // No need for seconds-level precision


// --- Strava Data Fetching & Rendering ---
// This function encapsulates all Strava-related API calls and DOM updates.
// It is called once on page load.
async function initializeStrava() {
    // Note: The Strava integration relies on a Netlify Function to securely handle API keys.
    // This function is only available on the deployed Netlify site.
    // On a local test server, this section will display a fallback message.
    const container = document.getElementById('strava-overview');
    if (!container) {
        // console.warn("Strava container not found. Skipping initialization.");
        return;
    }
    
    // Set initial loading state
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading Strava data...</p></div>';

    try {
        // Check if we're in local development
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            // Show fallback message for local development
            container.innerHTML = '<div class="error-state"><p>Strava data is only available on the live site.</p></div>';
            return;
        }
        
        const response = await fetch('/.netlify/functions/strava');
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const activities = await response.json();
        
        // Check for empty or invalid data
        if (!activities || activities.length === 0) {
            container.innerHTML = '<p class="text-center">No recent Strava activities found.</p>';
            return;
        }

        // Process and render data
        renderStravaActivities(activities, container);
        // showStravaLiveIndicator(activities); // Optional: show live data indicator
        
    } catch (error) {
        console.error("Error initializing Strava data:", error);
        container.innerHTML = '<div class="error-state"><p>Could not load Strava data. Please try again later.</p></div>';
    }
}

// Renders the fetched Strava activities into the DOM
function renderStravaActivities(activities, container) {
    // Sort activities by date, most recent first
    activities.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    // Get the last 5 activities
    const recentActivities = activities.slice(0, 5);
    
    // --- Monthly Stats Calculation ---
    const monthlyStats = activities.reduce((acc, activity) => {
        const month = activity.start_date.substring(0, 7); // "YYYY-MM"
        if (!acc[month]) {
            acc[month] = { distance: 0, moving_time: 0, elevation_gain: 0, count: 0 };
        }
        acc[month].distance += activity.distance;
        acc[month].moving_time += activity.moving_time;
        acc[month].elevation_gain += activity.total_elevation_gain;
        acc[month].count++;
        return acc;
    }, {});
    
    // --- Generate HTML ---
    const statsHTML = Object.entries(monthlyStats).map(([month, stats]) => `
        <div class="stat-card">
            <div class="stat-header">
                <h4>${new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
            </div>
            <div class="stat-content">
                <div class="stat-item">
                    <span class="stat-label">Activities</span>
                    <span class="stat-value">${stats.count}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Distance</span>
                    <span class="stat-value">${(stats.distance / 1000).toFixed(1)} km</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Time</span>
                    <span class="stat-value">${formatDuration(stats.moving_time)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Elevation</span>
                    <span class="stat-value">${Math.round(stats.elevation_gain)} m</span>
                </div>
            </div>
        </div>
    `).join('');

    const timelineHTML = recentActivities.map(activity => {
        const icon = activity.type.toLowerCase().includes('run') ? '🏃‍♂️' :
                     activity.type.toLowerCase().includes('ride') ? '🚴‍♂️' :
                     activity.type.toLowerCase().includes('swim') ? '🏊‍♂️' : '💪';
        
        return `
            <li class="timeline-item">
                <div class="timeline-icon">${icon}</div>
                <div class="timeline-content">
                    <span class="timeline-date">${timeAgo(new Date(activity.start_date))}</span>
                    <h5>${activity.name}</h5>
                    <p>
                        ${(activity.distance / 1000).toFixed(1)}km · 
                        ${formatDuration(activity.moving_time)}
                        ${activity.total_elevation_gain ? ` · ⛰️ ${Math.round(activity.total_elevation_gain)}m` : ''}
                    </p>
                </div>
            </li>
        `;
    }).join('');

    // --- Update DOM ---
    container.innerHTML = `
        <div class="strava-header">
            <h3>Monthly Snapshot</h3>
        </div>
        <div class="stats-grid">
            ${statsHTML}
        </div>
        <h3 class="mt-4">Recent Activities (Last 5)</h3>
        <ul class="timeline-list">
            ${timelineHTML}
        </ul>
    `;
    
    // Re-initialize hover effects for the newly added stat cards
    initializeProjectCards();
}

// Function to format duration from seconds to a readable format
function formatDuration(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// --- Training Section Tabs & Content ---
function initializeActivityTabs() {
    const tabs = document.querySelectorAll('.training-tabs .tab-button');
    const contents = document.querySelectorAll('.training-content .tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and panes
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Activate the clicked tab and corresponding pane
            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.tab);
            if (target) {
                target.classList.add('active');
            }
        });
    });

    // Set a default active tab if none is set
    const activeTab = document.querySelector('.training-tabs .tab-button.active');
    if (!activeTab && tabs.length > 0) {
        tabs[0].classList.add('active');
        const defaultContent = document.getElementById(tabs[0].dataset.tab);
        if (defaultContent) {
            defaultContent.classList.add('active');
        }
    }
}


// --- Daily Notes Feature ---
// This allows for quick, local-storage-based notes.
function initializeNotes() {
    const notesTextarea = document.getElementById('daily-notes-textarea');
    const lastUpdatedEl = document.getElementById('notes-last-updated');
    
    if (!notesTextarea || !lastUpdatedEl) return;
    
    // Load saved notes
    const savedNotes = localStorage.getItem('dailyNotes');
    if (savedNotes) {
        notesTextarea.value = savedNotes;
    }
    
    // Update timestamp
    updateNotesTimestamp();

    // Save notes on input
    notesTextarea.addEventListener('input', () => {
        localStorage.setItem('dailyNotes', notesTextarea.value);
        updateNotesTimestamp();
    });
}

// Updates the 'last updated' timestamp for the notes
function updateNotesTimestamp() {
    const lastUpdatedEl = document.getElementById('notes-last-updated');
    if (lastUpdatedEl) {
        lastUpdatedEl.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
    }
}

document.addEventListener('DOMContentLoaded', initializeNotes);


// --- Advanced UI Enhancements ---

// Dynamic typewriter effect for headlines
function typewriterEffect(element, text, speed = 60) {
    let i = 0;
    element.innerHTML = ""; // Clear existing text
  
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
}
// Usage Example:
// const headline = document.querySelector('#hero h1');
// if (headline) {
//   const text = headline.textContent;
//   typewriterEffect(headline, text);
// }


// Live indicator for fresh data (e.g., from Strava)
async function showStravaLiveIndicator(activities) {
    if (!activities || activities.length === 0) return;

    const latestActivityDate = new Date(activities[0].start_date);
    const now = new Date();
    const hoursSinceLastActivity = (now - latestActivityDate) / (1000 * 60 * 60);

    if (hoursSinceLastActivity < 24) { // If data is less than 24 hours old
        const indicator = document.createElement('div');
        indicator.className = 'live-indicator';
        indicator.title = `Data updated ${timeAgo(latestActivityDate)}`;
        
        const stravaHeader = document.querySelector('.strava-header h3');
        if (stravaHeader) {
            stravaHeader.style.position = 'relative';
            stravaHeader.appendChild(indicator);
        }
    }
}


// GitHub contribution graph animation
function animateGitHubGraph() {
    const days = document.querySelectorAll('.github-graph .day');
    days.forEach((day, i) => {
        day.style.animation = `fadeIn 0.5s ease-in-out ${i * 0.01}s forwards`;
    });
}
// To be called when the graph section is scrolled into view.
// You can integrate this with the IntersectionObserver in handleSectionTransitions.


// --- GitHub Commit Feed ---
// Fetches and displays the latest commits from a specific repository
async function updateCommitFeed() {
    const feedElement = document.getElementById('github-commit-feed');
    if (!feedElement) return;

    try {
        // Using a public repo for demonstration
        const response = await fetch('https://api.github.com/repos/AllBlazing/personal-site/commits');
        const commits = await response.json();
        
        const commitList = commits.slice(0, 5).map(commit => `
            <li>
                <a href="${commit.html_url}" target="_blank">${commit.commit.message}</a>
                <span class="commit-date">${timeAgo(new Date(commit.commit.author.date))}</span>
            </li>
        `).join('');
        
        feedElement.innerHTML = `<ul>${commitList}</ul>`;

    } catch (error) {
        console.error("Error fetching GitHub commits:", error);
        feedElement.innerHTML = '<p>Could not load commits.</p>';
    }
}
// document.addEventListener('DOMContentLoaded', updateCommitFeed);

// --- Fun & Interactive Elements ---

// Confetti effect on button click
function launchConfetti() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particles = [];
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: W / 2,
            y: H,
            r: Math.random() * 6 + 2,
            d: Math.random() * particleCount,
            color: `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 0.8)`,
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngle: 0,
            tiltAngleIncrement: Math.random() * 0.07 + 0.05
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.tiltAngle += p.tiltAngleIncrement;
            p.y -= (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.d);
            p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
        }

        if (particles.every(p => p.y < -30)) {
            canvas.remove();
        } else {
            requestAnimationFrame(draw);
        }
    }
    draw();
}
// Example Usage: Attach to a button
// document.getElementById('my-button').addEventListener('click', launchConfetti);

// --- Gallery Navigation ---
let currentImageSet = 0;
const imagesPerSet = 3;
const totalImages = 18; // Total number of images in the gallery
const totalSets = Math.ceil(totalImages / imagesPerSet);

function changeGalleryImage(direction) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Calculate new set index
    currentImageSet += direction;
    
    // Handle wrapping around
    if (currentImageSet >= totalSets) {
        currentImageSet = 0;
    } else if (currentImageSet < 0) {
        currentImageSet = totalSets - 1;
    }
    
    // Hide all images first
    galleryItems.forEach(item => {
        item.style.display = 'none';
    });
    
    // Show images for current set
    const startIndex = currentImageSet * imagesPerSet;
    const endIndex = Math.min(startIndex + imagesPerSet, totalImages);
    
    for (let i = startIndex; i < endIndex; i++) {
        if (galleryItems[i]) {
            galleryItems[i].style.display = 'block';
        }
    }
}

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', () => {
    // Show first 3 images
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        if (index < 3) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    currentImageSet = 0;
});

function initializeGitHubGraph() {
    const container = document.getElementById('github-graph-container');
    if (!container) return;

    container.classList.remove('loading-placeholder');
    const graphImage = document.createElement('img');
    graphImage.src = 'https://ghchart.rshah.org/AllBlazing';
    graphImage.alt = 'GitHub contribution graph for AllBlazing';
    graphImage.style.width = '100%';
    container.innerHTML = ''; // Clear the "Loading..." text
    container.appendChild(graphImage);
}

