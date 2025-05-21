// --- Main site JavaScript ---
// Add/expand comments for clarity and maintainability throughout
// Remove legacy or unused code (messages feature, etc.)
// Suggest modularization if file grows further

// DOM Ready handler
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize core UI components
        initializeUI();
        
        // Initialize Strava integration
        await initializeStrava();
        
        // Initialize GitHub integration
        await initializeGitHub();
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
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

// Strava integration
const STRAVA_CONFIG = {
    clientId: '155072',
    clientSecret: '4d9a962bc7ad7abc7b65a3fb7aa9d77922569d7c',
    refreshToken: '0dea72859bd9f5d1feb008a1fed6b1f485792ebb'
};

async function initializeStrava() {
    // Guard execution if Strava elements are not present
    const activitiesContainer = document.getElementById('activities-list');
    const distanceEl = document.getElementById('total-distance');
    const timeEl = document.getElementById('total-time');
    const elevationEl = document.getElementById('elevation-gain');
    const countEl = document.getElementById('activity-count');
    const statsContainer = document.querySelector('#stats .training-schedule'); // Assuming stats are in this container structure

    if (!activitiesContainer && !distanceEl && !timeEl && !elevationEl && !countEl && !statsContainer) {
        console.warn('Strava related DOM elements not found. Skipping Strava initialization.');
        return;
    }

    try {
        const accessToken = await getStravaAccessToken();
        if (accessToken) {
            await getActivities(accessToken);
        }
    } catch (error) {
        console.error('Strava initialization failed:', error);
        // Update UI only if elements exist
        if (activitiesContainer) updateActivityUI('Failed to load activities');
        if (distanceEl) updateStatsUI('0');
    }
}

async function getStravaAccessToken() {
    try {
        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: STRAVA_CONFIG.clientId,
                client_secret: STRAVA_CONFIG.clientSecret,
                refresh_token: STRAVA_CONFIG.refreshToken,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting Strava access token:', error);
        return null;
    }
}

async function getActivities(accessToken) {
    const activitiesContainer = document.getElementById('activities-list');
    
    if (!activitiesContainer) {
        console.warn('Activities container not found');
        return;
    }
    
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const response = await fetch(
            `https://www.strava.com/api/v3/athlete/activities?after=${Math.floor(startOfMonth.getTime() / 1000)}&per_page=30`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const activities = await response.json();
        
        // Display the data
        displayMonthlyStats(activities);
        displayActivities(activities);
        
    } catch (error) {
        console.error('Error fetching activities:', error);
        updateActivityUI('Failed to load activities');
    }
}

function displayMonthlyStats(activities) {
    const distanceEl = document.getElementById('total-distance');
    const timeEl = document.getElementById('total-time');
    const elevationEl = document.getElementById('elevation-gain');
    const countEl = document.getElementById('activity-count');
    
    if (!activities || !activities.length) {
        updateStatsUI('0');
        return;
    }
    
    const stats = activities.reduce((acc, activity) => ({
        distance: acc.distance + (activity.distance || 0),
        time: acc.time + (activity.moving_time || 0),
        elevation: acc.elevation + (activity.total_elevation_gain || 0)
    }), { distance: 0, time: 0, elevation: 0 });
    
    if (distanceEl) distanceEl.textContent = `${(stats.distance / 1000).toFixed(1)} km`;
    if (timeEl) timeEl.textContent = formatDuration(stats.time);
    if (elevationEl) elevationEl.textContent = `${Math.round(stats.elevation)}m`;
    if (countEl) countEl.textContent = activities.length.toString();
}

function displayActivities(activities) {
    const container = document.getElementById('activities-list');
    if (!container) return;
    
    if (!activities || !activities.length) {
        container.innerHTML = '<div class="schedule-day">No activities found this month</div>';
        return;
    }
    
    const recentActivities = activities.slice(0, 4); // Show only 4 most recent activities
    container.innerHTML = recentActivities.map(activity => {
        const date = new Date(activity.start_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        let activityClass = 'mixed-day';
        let activityIcon = '🏃‍♂️';
        
        if (activity.type.toLowerCase().includes('run')) {
            activityClass = 'cardio-day';
            activityIcon = '🏃‍♂️';
        } else if (activity.type.toLowerCase().includes('weight') || activity.type.toLowerCase().includes('workout')) {
            activityClass = 'strength-day';
            activityIcon = '💪';
        } else if (activity.type.toLowerCase().includes('ride')) {
            activityClass = 'hiit-day';
            activityIcon = '🚴‍♂️';
        } else if (activity.type.toLowerCase().includes('swim')) {
            activityClass = 'hiit-day';
            activityIcon = '🏊‍♂️';
        }
        
        return `
            <div class="schedule-day ${activityClass}">
                <h4>${activityIcon} ${activity.name}</h4>
                <div class="training-${activityClass.replace('-day', '')}">
                    <div class="activity-details">
                        <span class="activity-type">${activity.type} · ${date}</span>
                        <span class="activity-stat">${(activity.distance / 1000).toFixed(1)}km · ${formatDuration(activity.moving_time)}</span>
                        ${activity.total_elevation_gain ? `<span class="activity-stat">⛰️ ${Math.round(activity.total_elevation_gain)}m</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function updateStatsUI(value) {
    const elements = ['total-distance', 'total-time', 'elevation-gain', 'activity-count'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function updateActivityUI(message) {
    const container = document.getElementById('activities-list');
    if (container) {
        container.innerHTML = `<div class="schedule-day"><div class="error-message">${message}</div></div>`;
    }
}

// GitHub Integration
const GITHUB_USERNAME = 'AllBlazing';

async function initializeGitHub() {
    // Guard execution if GitHub elements are not present
    const reposEl = document.getElementById('github-repos');
    const commitsEl = document.getElementById('github-commits');
    const streakEl = document.getElementById('github-streak');
    const contributionsContainer = document.querySelector('.github-contributions');

    if (!reposEl && !commitsEl && !streakEl && !contributionsContainer) {
        console.warn('GitHub related DOM elements not found. Skipping GitHub initialization.');
        return;
    }

    try {
        await Promise.all([
            fetchGitHubStats(),
            fetchGitHubContributions()
        ]);
    } catch (error) {
        console.error('GitHub initialization failed:', error);
        // Update UI only if elements exist
        if (reposEl) reposEl.textContent = '0';
        if (commitsEl) commitsEl.textContent = '0';
        if (streakEl) streakEl.textContent = '0';
        if (contributionsContainer) contributionsContainer.innerHTML = '<p class="error-message">Failed to load GitHub contributions</p>';
    }
}

async function fetchGitHubStats() {
    try {
        // Fetch user data
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        // Update repos count
        document.getElementById('github-repos').textContent = data.public_repos;
        
        // Fetch recent commits (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const eventsResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public`);
        if (!eventsResponse.ok) throw new Error(`HTTP error! status: ${eventsResponse.status}`);
        const events = await eventsResponse.json();
        
        // Count commits from push events
        const commitCount = events
            .filter(event => event.type === 'PushEvent')
            .reduce((acc, event) => acc + event.payload.commits.length, 0);
        
        document.getElementById('github-commits').textContent = commitCount;
        
        // Calculate current streak from events
        let currentStreak = 0;
        const today = new Date().toDateString();
        const uniqueDates = new Set();
        
        events.forEach(event => {
            const eventDate = new Date(event.created_at).toDateString();
            if (event.type === 'PushEvent') {
                uniqueDates.add(eventDate);
            }
        });
        
        // Convert dates to array and sort
        const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(b) - new Date(a));
        
        // Calculate streak
        for (let i = 0; i < sortedDates.length; i++) {
            const date = new Date(sortedDates[i]);
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            
            if (date.toDateString() === expectedDate.toDateString()) {
                currentStreak++;
            } else {
                break;
            }
        }
        
        document.getElementById('github-streak').textContent = currentStreak;
        
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        document.getElementById('github-repos').textContent = '0';
        document.getElementById('github-commits').textContent = '0';
        document.getElementById('github-streak').textContent = '0';
    }
}

async function fetchGitHubContributions() {
    try {
        const container = document.querySelector('.github-contributions');
        if (!container) return;
        
        // Create a placeholder contribution graph
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        // Calculate exact number of weeks between dates
        const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weeksCount = Math.ceil((today - oneYearAgo) / millisecondsPerWeek);
        
        const cellSize = 10;
        const cellGap = 2;
        const monthLabelHeight = 20;
        const dayLabelWidth = 30;
        
        // Create SVG container with space for labels
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', (dayLabelWidth + weeksCount * (cellSize + cellGap)) + 'px');
        svg.setAttribute('height', (monthLabelHeight + 7 * (cellSize + cellGap)) + 'px');
        svg.style.maxWidth = '800px';
        svg.style.width = '100%';
        svg.style.height = 'auto';
        
        // Add day labels (only Mon/Wed/Fri)
        const days = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
        days.forEach((day, index) => {
            if (day) { // Only create labels for Mon/Wed/Fri
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', '0');
                text.setAttribute('y', monthLabelHeight + (index * (cellSize + cellGap)) + cellSize);
                text.setAttribute('class', 'contribution-label day-label');
                text.textContent = day;
                svg.appendChild(text);
            }
        });
        
        // Add month labels
        const months = [];
        let currentDate = new Date(oneYearAgo);
        
        for (let week = 0; week < weeksCount; week++) {
            if (currentDate.getDate() <= 7) {
                months.push({
                    name: currentDate.toLocaleString('default', { month: 'short' }),
                    x: dayLabelWidth + week * (cellSize + cellGap)
                });
            }
            currentDate.setDate(currentDate.getDate() + 7);
        }
        
        months.forEach(month => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', month.x.toString());
            text.setAttribute('y', '10');
            text.setAttribute('class', 'contribution-label month-label');
            text.textContent = month.name;
            svg.appendChild(text);
        });
        
        // Create contribution cells
        for (let week = 0; week < weeksCount; week++) {
            for (let day = 0; day < 7; day++) {
                const cellDate = new Date(oneYearAgo);
                cellDate.setDate(cellDate.getDate() + (week * 7) + day);
                
                // Only create cells up to today
                if (cellDate <= today) {
                    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect.setAttribute('x', dayLabelWidth + week * (cellSize + cellGap));
                    rect.setAttribute('y', monthLabelHeight + day * (cellSize + cellGap));
                    rect.setAttribute('width', cellSize);
                    rect.setAttribute('height', cellSize);
                    rect.setAttribute('rx', 2);
                    rect.setAttribute('class', 'ContributionCalendar-day');
                    rect.setAttribute('data-level', '0');
                    
                    // Add title for tooltip
                    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                    title.textContent = `${cellDate.toLocaleDateString()} - No contributions`;
                    rect.appendChild(title);
                    
                    svg.appendChild(rect);
                }
            }
        }
        
        container.innerHTML = '';
        container.appendChild(svg);
        
        // Fetch contribution data from GitHub API
        const eventsResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public`);
        if (!eventsResponse.ok) throw new Error(`HTTP error! status: ${eventsResponse.status}`);
        const events = await eventsResponse.json();
        
        // Process events and update contribution cells
        const contributionMap = new Map();
        events.forEach(event => {
            if (event.type === 'PushEvent') {
                const date = new Date(event.created_at).toDateString();
                const currentCount = contributionMap.get(date) || 0;
                contributionMap.set(date, currentCount + event.payload.commits.length);
            }
        });
        
        // Update cell colors and tooltips based on contribution count
        contributionMap.forEach((count, dateString) => {
            const date = new Date(dateString);
            if (date >= oneYearAgo && date <= today) {
                const daysSinceStart = Math.floor((date - oneYearAgo) / (1000 * 60 * 60 * 24));
                const weekIndex = Math.floor(daysSinceStart / 7);
                const dayIndex = date.getDay();
                
                const cellIndex = weekIndex * 7 + dayIndex + months.length + days.length;
                const cell = svg.children[cellIndex];
                if (cell) {
                    const level = count === 0 ? '0' : 
                                count <= 2 ? '1' : 
                                count <= 4 ? '2' : 
                                count <= 6 ? '3' : '4';
                    cell.setAttribute('data-level', level);
                    
                    // Update tooltip
                    const title = cell.querySelector('title');
                    if (title) {
                        title.textContent = `${date.toLocaleDateString()} - ${count} contribution${count !== 1 ? 's' : ''}`;
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching GitHub contributions:', error);
        const container = document.querySelector('.github-contributions');
        if (container) {
            container.innerHTML = '<p class="error-message">Failed to load GitHub contributions</p>';
        }
    }
}

// Helper function to update UI on error
function updateGitHubUI(message) {
    const containers = ['github-repos', 'github-commits', 'github-streak'];
    containers.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '0';
    });
    
    const contributionsContainer = document.querySelector('.github-contributions');
    if (contributionsContainer) {
        contributionsContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }
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

// Parallax Effect
document.addEventListener('DOMContentLoaded', () => {
    const parallaxWrapper = document.querySelector('.parallax-wrapper');
    const parallaxBg = document.querySelector('.parallax-bg');
    
    if (parallaxWrapper && parallaxBg) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const speed = parallaxWrapper.dataset.speed || 0.5;
            const yPos = scrolled * speed;
            parallaxBg.style.transform = `translateY(${yPos}px) translateZ(-1px) scale(2)`;
        });
    }

    // Scroll Reveal
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
});

// 3D Card Effect
document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    // Remove any loading states
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        if (el) { // Add a check here too
            el.textContent = 'Data unavailable';
            el.classList.remove('loading');
        }
    });

    const lazyLoader = new LazyLoader();

    // Load initial content
    lazyLoader.observeImages();

    // Initialize mobile navigation
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileNavToggle && mobileNav) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
        });
    }

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScroll = 0;

    // Add check before adding event listener
    if (header) {
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

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
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

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add check before observing sections
    document.querySelectorAll('.section').forEach(section => {
        if (section) { // Add a check here
            section.classList.add('fade-in');
            observer.observe(section);
        }
    });

    // Add reveal class to sections
    document.querySelectorAll('.section').forEach(section => {
        if (section) { // Add a check here
            section.classList.add('reveal');
        }
    });
    
    // Add floating class to specific elements
    document.querySelectorAll('.cta-button, .metric-card').forEach(element => {
        if (element) { // Add a check here
            element.classList.add('floating');
        }
    });

    // Check if the messages feature/container exists before calling loadMessages
    const messagesContainerElement = document.getElementById('messages-container'); // Or the relevant container ID
    if (messagesContainerElement && typeof loadMessages === 'function') { // Also check if loadMessages function exists
        loadMessages(); 
    } else if (!messagesContainerElement) {
        console.warn('Messages container not found. Skipping loadMessages().');
    } else {
         console.warn('loadMessages function not found. Skipping loadMessages().');
    }
});

// --- Section reveal/intersection observer ---
// ... existing code ...

// --- Gallery navigation improvements ---
// ... existing code ...

// --- Touch improvements for mobile ---
// ... existing code ...

// --- Remove legacy messages feature (if not used) ---
// (Commented out for now, can be deleted if confirmed unused)
// document.addEventListener('DOMContentLoaded', function() {
//     ...
// });

// --- End of script.js ---

// HYROX Training Dashboard
function initializeHyroxDashboard() {
    const movementStats = {
        'Wall Balls': { target: 100, current: 85 },
        'Sled Push': { target: 100, current: 75 },
        'Burpee Broad Jumps': { target: 100, current: 90 }
    };

    // Update progress bars
    Object.entries(movementStats).forEach(([movement, stats]) => {
        // Fix: Use a supported method to find the stat-card and progress bar
        // The :has and :contains selectors are not universally supported in querySelector
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const heading = card.querySelector('h3');
            if (heading && heading.textContent.includes(movement)) {
                const progressBar = card.querySelector('.progress');
                const statText = card.querySelector('.stat');
                
                if (progressBar && statText) {
                    const percentage = (stats.current / stats.target) * 100;
                    progressBar.style.width = `${percentage}%`;
                    statText.textContent = `${percentage}% of target`;
                }
            }
        });
    });
}

// HYROX Project Cards Animation
function initializeProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });
}

// Initialize HYROX components
document.addEventListener('DOMContentLoaded', () => {
    initializeHyroxDashboard();
    initializeProjectCards();
    
    // ... existing initialization code ...
});

// --- HYROX Race Countdown Timer ---
document.addEventListener('DOMContentLoaded', function() {
    const countdownEl = document.getElementById('race-countdown');
    if (!countdownEl) return;
    const targetDate = new Date('2025-09-19T00:00:00+02:00'); // Maastricht is CEST

    function pad(n) { return n < 10 ? '0' + n : n; }

    function getTimeLeft() {
        const now = new Date();
        let diff = targetDate - now;
        if (diff < 0) diff = 0;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        // const hours = Math.floor((diff / (1000 * 60 * 60)) % 24); // Removed
        // const minutes = Math.floor((diff / (1000 * 60)) % 60); // Removed
        // const seconds = Math.floor((diff / 1000) % 60); // Removed
        return { days /*, hours, minutes, seconds*/ }; // Only return days
    }

    // Initial render to create elements (only for days)
    let last = {};
    const initialTime = getTimeLeft();
    countdownEl.innerHTML = `
        <div class="countdown-segment"><span class="countdown-value">${pad(initialTime.days)}</span><span class="countdown-label">Days Left</span></div>
        <!-- Removed segments for Hours, Minutes, Seconds -->
    `;

    // Get references to the spans after initial render (only for days)
    const daysSpan = countdownEl.querySelector('.countdown-segment:nth-child(1) .countdown-value');
    // const hoursSpan = countdownEl.querySelector('.countdown-segment:nth-child(2) .countdown-value'); // Removed
    // const minutesSpan = countdownEl.querySelector('.countdown-segment:nth-child(3) .countdown-value'); // Removed
    // const secondsSpan = countdownEl.querySelector('.countdown-segment:nth-child(4) .countdown-value'); // Removed

    function renderCountdown() {
        const { days /*, hours, minutes, seconds*/ } = getTimeLeft();
        const values = [days /*, hours, minutes, seconds*/ ];
        const spans = [daysSpan /*, hoursSpan, minutesSpan, secondsSpan*/ ];
        const labels = ['Days Left' /*, 'Hours', 'Minutes', 'Seconds'*/ ];

        values.forEach((val, i) => {
            const paddedVal = pad(val);
            // Check if value has actually changed
            if (spans[i] && spans[i].textContent !== paddedVal) { // Added check for span existence
                spans[i].textContent = paddedVal;
                // Apply animation
                spans[i].classList.remove('countdown-animate');
                // Force reflow
                void spans[i].offsetWidth;
                spans[i].classList.add('countdown-animate');
            }
        });
    }

    // Initial call to set up spans and values
    renderCountdown(); 
    // Set interval for subsequent updates
    setInterval(renderCountdown, 1000);
});

// Tab Functionality
document.addEventListener('DOMContentLoaded', () => {
    const tabsContainers = document.querySelectorAll('.tabs-container');

    tabsContainers.forEach(container => {
        const buttons = container.querySelectorAll('.tab-button');
        const panes = container.querySelectorAll('.tab-pane');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panes in this container
                buttons.forEach(btn => btn.classList.remove('active'));
                panes.forEach(pane => pane.classList.remove('active'));

                // Add active class to the clicked button
                button.classList.add('active');

                // Get the target tab pane ID from the data attribute
                const targetTab = button.dataset.tab;
                const targetPane = container.querySelector(`#${targetTab}`);

                // Add active class to the target pane
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });

        // Activate the first tab by default if none are active
        if (container.querySelector('.tab-button.active') === null) {
             const firstButton = container.querySelector('.tab-button');
             const firstPane = container.querySelector('.tab-pane');
             if (firstButton) firstButton.classList.add('active');
             if (firstPane) firstPane.classList.add('active');
        }
    });
});

