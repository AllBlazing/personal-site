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
    initializeHero();
}

// Hero Section Animations
function initializeHero() {
    // Background slideshow
    const slides = document.querySelectorAll('.background-slideshow .slide');
    if (!slides.length) {
        console.warn('No slideshow slides found');
        return;
    }

    // Set image centering for hero background slides
    slides.forEach(slide => {
        slide.style.objectFit = 'cover';
        slide.style.objectPosition = 'center 30%';
    });

    let currentSlide = 0;
    let currentStat = 0;
    const stats = ['Fitness', 'Productivity'];
    const statValues = [85, 82];

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    function updateStats() {
        const statLoaders = document.querySelectorAll('.stat-loader');
        statLoaders.forEach((loader, index) => {
            const progressBar = loader.querySelector('.progress-fill');
            const progressText = loader.querySelector('.progress-text');
            const statLabel = loader.querySelector('.loader-label');
            
            if (progressBar && progressText && statLabel) {
                progressBar.style.width = '0%';
                progressText.textContent = 'Loading...';
                statLabel.textContent = stats[index];
                
                setTimeout(() => {
                    progressBar.style.width = `${statValues[index]}%`;
                    progressText.textContent = `${statValues[index]}%`;
                }, 100);
            }
        });
    }

    // Initialize first slide
    slides[0].classList.add('active');

    // Start slideshow
    setInterval(nextSlide, 5000);

    // Initialize stats
    updateStats();
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
    const sections = document.querySelectorAll('.section');
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    sections.forEach(section => {
        section.classList.add('section-transition');
        observer.observe(section);
    });
}

// Notification helper
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
    try {
        const accessToken = await getStravaAccessToken();
        if (accessToken) {
            await getActivities(accessToken);
        }
    } catch (error) {
        console.error('Strava initialization failed:', error);
        updateStravaUI('Failed to initialize Strava');
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
    try {
        await Promise.all([
            fetchGitHubStats(),
            fetchGitHubContributions()
        ]);
    } catch (error) {
        console.error('GitHub initialization failed:', error);
        updateGitHubUI('Failed to initialize GitHub');
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
        el.textContent = 'Data unavailable';
        el.classList.remove('loading');
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

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = header.offsetHeight;
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

    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    // Add reveal class to sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('reveal');
    });
    
    // Add floating class to specific elements
    document.querySelectorAll('.cta-button, .metric-card').forEach(element => {
        element.classList.add('floating');
    });

    // Check if the messages feature/container exists before calling loadMessages
    const messagesContainerElement = document.getElementById('messages-container'); // Or the relevant container ID
    if (messagesContainerElement) {
        loadMessages(); 
    } else {
        console.warn('Messages container not found. Skipping loadMessages().');
    }
});

// Messages functionality
document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('message-form');
    const messagesContainer = document.getElementById('messages-container');
    
    // Load messages from localStorage on page load
    // Check if the container exists before trying to load messages into it
    if (messagesContainer) {
        loadMessages();
    } else {
        console.warn("Messages container (#messages-container) not found. Skipping initial loadMessages().");
    }
    
    // Handle form submission
    // Check if the form exists before adding a listener
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value,
                attendance: document.getElementById('attendance').value,
                date: new Date().toISOString()
            };
            
            // Save message to localStorage
            saveMessage(formData);
            
            // Add message to the display
            // We need to ensure the container exists here as well
            if (messagesContainer) {
                 addMessageToDisplay(formData);
            } else {
                console.warn("Messages container (#messages-container) not found when trying to display new message.");
            }
            
            // Reset form
            messageForm.reset();
            
            // Show success message
            showNotification('Message sent successfully!', 'success');
        });
    } else {
         console.warn("Message form (#message-form) not found. Skipping form submission listener setup.");
    }
    
    function saveMessage(message) {
        let messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.unshift(message); // Add new message to the beginning
        localStorage.setItem('messages', JSON.stringify(messages));
    }
    
    function loadMessages() {
        // The check is now done *before* calling this function for initial load,
        // but we add it inside too for robustness.
        const container = document.getElementById('messages-container');
        if (!container) {
            console.error('Messages container element not found inside loadMessages.');
            return; // Stop the function if container is missing
        }
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        container.innerHTML = ''; // Now safe to access innerHTML
        messages.forEach(message => addMessageToDisplay(message));
    }
    
    function addMessageToDisplay(message) {
        // Need to check container existence again inside this function if it can be called independently
        const container = document.getElementById('messages-container');
        if (!container) {
            console.error('Messages container element not found inside addMessageToDisplay.');
            return;
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message-item ${message.attendance}`;
        
        const date = new Date(message.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-name">${message.name}</span>
                <span class="message-date">${formattedDate}</span>
            </div>
            <div class="message-content">${message.message}</div>
            <div class="message-attendance ${message.attendance}">
                ${message.attendance === 'attending' ? 'Attending' : 'Not Attending'}
            </div>
        `;
        
        // Use container variable instead of querying the DOM again
        container.prepend(messageElement);
    }
});

// Newsletter Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.newsletter-form');
    const successMessage = document.querySelector('.form-success');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = form.querySelector('.subscribe-btn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                // Get form data
                const formData = new FormData(form);
                
                // Submit to Netlify
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    body: new URLSearchParams(formData).toString()
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Show success message
                form.classList.add('hidden');
                successMessage.style.display = 'flex';
                
                // Reset form
                form.reset();
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    form.classList.remove('hidden');
                }, 5000);
            } catch (error) {
                console.error('Form submission error:', error);
                // Show error message to user
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-error';
                errorMessage.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <p>There was an error submitting the form. Please try again later.</p>
                `;
                form.insertBefore(errorMessage, form.firstChild);
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorMessage.remove();
                }, 5000);
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Particle Animation
function initParticles() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('particles');
    
    if (!container) return;
    
    container.appendChild(canvas);
    
    const particles = [];
    const particleCount = 50;
    
    function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(187, 243, 76, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    function init() {
        resize();
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', resize);
    init();
    animate();
}

// Initialize particles when DOM is loaded
document.addEventListener('DOMContentLoaded', initParticles);

// Loading states
function showContent(elementId) {
    const loadingElement = document.getElementById(`${elementId}-loading`);
    const contentElement = document.querySelector(`#${elementId} .${elementId}-content`);
    
    if (loadingElement && contentElement) {
        loadingElement.style.display = 'none';
        contentElement.style.display = 'block';
    }
}

// Health content
setTimeout(() => {
    showContent('health');
}, 1500);

// Gallery content
setTimeout(() => {
    showContent('gallery');
}, 2000);

// Lazy loading for images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '50px 0px',
    threshold: 0.1
});

document.querySelectorAll('img.lazy').forEach(img => {
    imageObserver.observe(img);
});

// Mobile navigation improvements
const mobileNav = document.querySelector('.mobile-nav');
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    mobileNav.classList.remove('active');
                }, 500);
            }
        }
    });
});

// Gallery navigation improvements
const galleryScroll = document.querySelector('.gallery-scroll');
const galleryNav = document.querySelectorAll('.gallery-nav');

// Check if gallery navigation elements exist before adding listeners
if (galleryScroll && galleryNav.length > 0) {
    galleryNav.forEach(button => {
        button.addEventListener('click', () => {
            const scrollAmount = galleryScroll.offsetWidth;
            const direction = button.classList.contains('prev') ? -1 : 1;
            
            galleryScroll.scrollBy({
                left: scrollAmount * direction,
                behavior: 'smooth'
            });
        });
    });
} else {
    console.warn("Gallery navigation elements (.gallery-scroll or .gallery-nav) not found. Skipping navigation button listeners.");
}

// Touch improvements for mobile
let touchStartX = 0;
let touchEndX = 0;

// Check if gallery scroll element exists before adding touch listeners
if (galleryScroll) {
    galleryScroll.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    galleryScroll.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
} else {
     console.warn("Gallery scroll element (.gallery-scroll) not found. Skipping touch listeners.");
}

// Ensure handleSwipe is defined only if galleryScroll exists, or check inside handleSwipe
function handleSwipe() {
    // Add check inside handleSwipe as well for safety
    if (!galleryScroll) return; 
    
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) > 50) {
        const scrollAmount = galleryScroll.offsetWidth;
        galleryScroll.scrollBy({
            left: swipeDistance > 0 ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Performance optimizations
window.addEventListener('load', () => {
    // Initialize Strava API after page load
    initializeStrava();
    
    // Remove loading placeholders
    document.querySelectorAll('.loading-placeholder').forEach(placeholder => {
        placeholder.style.display = 'none';
    });
});

