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
                    githubOverview.style.display = source === 'github' ? 'block' : 'none';
                    stravaOverview.style.display = source === 'strava' ? 'block' : 'none';
                }
                if (typeof updateTimeline === 'function') updateTimeline(source);
            });
        });
    } catch (e) { console.error('Timeline tabs error:', e); }
    try { if (typeof updateTimeline === 'function') updateTimeline(); } catch (e) { console.error('Timeline update error:', e); }
    try { if (typeof initializeStrava === 'function') initializeStrava(); } catch (e) { console.error('Strava error:', e); }
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
        const res = await fetch('https://api.github.com/users/AllBlazing/events/public?per_page=30');
        if (!res.ok) {
            console.error('GitHub API response not OK:', await res.text());
            return [];
        }
        const events = await res.json();
        return events
            .filter(e => ['PushEvent', 'PullRequestEvent', 'IssuesEvent'].includes(e.type))
            .slice(0, 5)
            .map(e => {
                let icon = '💻', title = '', desc = '';
                if (e.type === 'PushEvent') {
                    icon = '⬆️';
                    title = `Committed to ${e.repo.name}`;
                    desc = e.payload.commits ? e.payload.commits.map(c => c.message).join(' | ') : '';
                } else if (e.type === 'PullRequestEvent') {
                    icon = '🔀';
                    title = `PR: ${e.repo.name}`;
                    desc = e.payload.pull_request?.title || '';
                } else if (e.type === 'IssuesEvent') {
                    icon = '❗';
                    title = `Issue: ${e.repo.name}`;
                    desc = e.payload.issue?.title || '';
                }
                return {
                    type: 'github',
                    icon, title, desc,
                    date: new Date(e.created_at),
                    badge: 'GitHub',
                    badgeClass: 'github',
                    raw: e
                };
            });
    } catch (error) {
        console.error('Error fetching GitHub timeline:', error);
        return [];
    }
}

function displayStravaStats(activities) {
    const distanceEl = document.getElementById('total-distance');
    const timeEl = document.getElementById('total-time');
    const elevationEl = document.getElementById('elevation-gain');
    const countEl = document.getElementById('activity-count');

    if (!distanceEl || !timeEl || !elevationEl || !countEl) {
        console.warn('One or more Strava stat elements are missing.');
        return;
    }

    if (!activities || !activities.length) {
        distanceEl.textContent = '0 km';
        timeEl.textContent = '0h 0m';
        elevationEl.textContent = '0m';
        countEl.textContent = '0';
        return;
    }

    const stats = activities.reduce((acc, activity) => {
        const rawActivity = activity.raw || activity;
        return {
            distance: acc.distance + (rawActivity.distance || 0),
            time: acc.time + (rawActivity.moving_time || 0),
            elevation: acc.elevation + (rawActivity.total_elevation_gain || 0)
        };
    }, { distance: 0, time: 0, elevation: 0 });

    distanceEl.textContent = `${(stats.distance / 1000).toFixed(1)} km`;
    timeEl.textContent = formatDuration(stats.time);
    elevationEl.textContent = `${Math.round(stats.elevation)}m`;
    countEl.textContent = activities.length.toString();
}

function renderTimeline(entries) {
    const feed = document.getElementById('activity-timeline-feed');
    if (!feed) {
        console.error('Timeline feed element not found');
        return;
    }
    
    if (!entries || entries.length === 0) {
        feed.innerHTML = '<div style="color:#fff;text-align:center;padding:2rem;">No recent activity found.</div>';
        return;
    }
    
    feed.innerHTML = entries.map((e, i) => `
        <div class="timeline-entry ${e.type}" style="animation-delay:${i*0.07}s">
            <div class="timeline-dot">${e.icon}</div>
            <div class="timeline-content">
                <div class="timeline-title">${e.title}</div>
                <div class="timeline-desc">${e.desc}</div>
                <div class="timeline-meta">
                    <span class="timeline-time">${timeAgo(e.date)}</span>
                    <span class="timeline-badge ${e.badgeClass}">${e.badge}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function timeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
}

async function updateTimeline(filter = 'all') {
    const feed = document.getElementById('activity-timeline-feed');
    if (!feed) return;

    try {
        feed.innerHTML = '<div style="color:#fff;text-align:center;padding:2rem;">Loading activities...</div>';
        
        const [stravaData, github] = await Promise.all([fetchStravaTimeline(), fetchGitHubTimeline()]);
        console.log('Fetched activities:', { strava: stravaData.length, github: github.length });

        // Sort the Strava data to ensure it's in the correct order
        const strava = stravaData.sort((a, b) => b.date - a.date);

        // Calculate and display monthly stats using the full strava array
        displayStravaStats(strava);
        
        // Slice the strava activities for the timeline view
        const stravaForTimeline = strava.slice(0, 5);
        
        let all = [...stravaForTimeline, ...github].sort((a, b) => b.date - a.date);
        
        if (filter === 'strava') {
            all = stravaForTimeline;
        } else if (filter === 'github') {
            all = github;
        }
        
        renderTimeline(all);
    } catch (error) {
        console.error('Error updating timeline:', error);
        feed.innerHTML = '<div style="color:#fff;text-align:center;padding:2rem;">Error loading activities. Please try again later.</div>';
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
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return { days, hours, minutes, seconds };
    }

    // Initial render to create elements
    let last = {};
    const initialTime = getTimeLeft();
    countdownEl.innerHTML = `
        <div class="countdown-segment"><span class="countdown-value">${pad(initialTime.days)}</span><span class="countdown-label">Days</span></div>
        <div class="countdown-segment"><span class="countdown-value">${pad(initialTime.hours)}</span><span class="countdown-label">Hours</span></div>
        <div class="countdown-segment"><span class="countdown-value">${pad(initialTime.minutes)}</span><span class="countdown-label">Minutes</span></div>
        <div class="countdown-segment"><span class="countdown-value">${pad(initialTime.seconds)}</span><span class="countdown-label">Seconds</span></div>
    `;

    // Get references to the spans after initial render
    const daysSpan = countdownEl.querySelector('.countdown-segment:nth-child(1) .countdown-value');
    const hoursSpan = countdownEl.querySelector('.countdown-segment:nth-child(2) .countdown-value');
    const minutesSpan = countdownEl.querySelector('.countdown-segment:nth-child(3) .countdown-value');
    const secondsSpan = countdownEl.querySelector('.countdown-segment:nth-child(4) .countdown-value');

    function renderCountdown() {
        const { days, hours, minutes, seconds } = getTimeLeft();
        const values = [days, hours, minutes, seconds];
        const spans = [daysSpan, hoursSpan, minutesSpan, secondsSpan];

        values.forEach((val, i) => {
            const paddedVal = pad(val);
            // Check if value has actually changed
            if (spans[i] && spans[i].textContent !== paddedVal) {
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

// --- Activity Tab Functionality ---
function initializeActivityTabs() {
    const activityTabsContainer = document.querySelector('#activity .tabs-container');
    if (!activityTabsContainer) return;

    const buttons = activityTabsContainer.querySelectorAll('.tab-button');
    const panes = activityTabsContainer.querySelectorAll('.tab-pane');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes in this container
            buttons.forEach(btn => btn.classList.remove('active'));
            panes.forEach(pane => pane.classList.remove('active'));

            // Add active class to the clicked button
            button.classList.add('active');

            // Get the target tab pane ID from the data attribute
            const targetTabId = button.dataset.tab;
            const targetPane = activityTabsContainer.querySelector(`#${targetTabId}`);

            // Add active class to the target pane
            if (targetPane) {
                targetPane.classList.add('active');

                // Update timestamp if Notes tab is activated
                if (targetTabId === 'notes') {
                    updateNotesTimestamp();
                }
            }
        });
    });

    // Activate the first tab by default if none are active
    if (activityTabsContainer.querySelector('.tab-button.active') === null) {
        const firstButton = activityTabsContainer.querySelector('.tab-button');
        const firstPane = activityTabsContainer.querySelector('.tab-pane');
        if (firstButton) firstButton.classList.add('active');
        if (firstPane) firstPane.classList.add('active');
        // If the first tab is 'notes', update timestamp on load
        if (firstButton && firstButton.dataset.tab === 'notes') {
             updateNotesTimestamp();
        }
    }
}

// Update timestamp for Notes tab
function updateNotesTimestamp() {
    const timestampSpan = document.getElementById('notes-last-updated');
    if (timestampSpan) {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        timestampSpan.textContent = now.toLocaleDateString('en-US', options);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const heroBg = document.querySelector('.hero-background');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            setTimeout(() => {
                const confirmation = document.createElement('div');
                confirmation.textContent = 'Thank you for subscribing!';
                confirmation.style.background = 'var(--accent-color)';
                confirmation.style.color = '#000';
                confirmation.style.padding = '1rem 2rem';
                confirmation.style.borderRadius = '8px';
                confirmation.style.marginTop = '1rem';
                confirmation.style.textAlign = 'center';
                confirmation.style.fontWeight = 'bold';
                newsletterForm.parentNode.insertBefore(confirmation, newsletterForm.nextSibling);
            }, 500);
        });
    }
});

// --- Typewriter effect for hero headline ---
function typewriterEffect(element, text, speed = 60) {
  let i = 0;
  function type() {
    if (i <= text.length) {
      element.textContent = text.substring(0, i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}
document.addEventListener('DOMContentLoaded', () => {
  const tw = document.getElementById('typewriter');
  if (tw) typewriterEffect(tw, 'AI Developer & Athlete');
});

// --- Nav transparency on scroll ---
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (!header) return;
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// --- Strava live indicator ---
async function showStravaLiveIndicator(activities) {
  const indicator = document.getElementById('strava-live-indicator');
  if (!indicator) return;
  const today = new Date().toDateString();
  if (activities && activities.length && new Date(activities[0].start_date).toDateString() === today) {
    indicator.style.display = 'inline-block';
  } else {
    indicator.style.display = 'none';
  }
}
// Patch into displayActivities
const origDisplayActivities = window.displayActivities;
window.displayActivities = function(activities) {
  origDisplayActivities && origDisplayActivities(activities);
  showStravaLiveIndicator(activities);
};

// --- GitHub animated graph and tooltips ---
function animateGitHubGraph() {
  const cells = document.querySelectorAll('.activity-github-graph .ContributionCalendar-day');
  cells.forEach((cell, i) => {
    setTimeout(() => cell.classList.add('animated-cell'), i * 10);
    cell.addEventListener('mouseenter', e => {
      let tooltip = document.createElement('div');
      tooltip.className = 'github-tooltip';
      tooltip.textContent = `${cell.getAttribute('data-count') || 0} contributions! Keep it up!`;
      document.body.appendChild(tooltip);
      const rect = cell.getBoundingClientRect();
      tooltip.style.left = rect.left + window.scrollX + 'px';
      tooltip.style.top = rect.top + window.scrollY - 36 + 'px';
      setTimeout(() => tooltip.classList.add('active'), 10);
      cell.addEventListener('mouseleave', () => {
        tooltip.classList.remove('active');
        setTimeout(() => tooltip.remove(), 200);
      }, { once: true });
    });
  });
}
document.addEventListener('DOMContentLoaded', animateGitHubGraph);

// --- GitHub live commit feed ---
async function updateCommitFeed() {
  const feed = document.getElementById('github-commit-feed');
  if (!feed) return;
  try {
    const res = await fetch('https://api.github.com/users/AllBlazing/events/public');
    const events = await res.json();
    const commits = events.filter(e => e.type === 'PushEvent').flatMap(e => e.payload.commits.map(c => ({
      msg: c.message,
      repo: e.repo.name,
      time: new Date(e.created_at).toLocaleString()
    })));
    feed.innerHTML = '';
    commits.slice(0, 5).forEach((c, i) => {
      const div = document.createElement('div');
      div.className = 'commit-item';
      div.style.animationDelay = (i * 0.2) + 's';
      div.innerHTML = `<strong>${c.repo}</strong>: ${c.msg} <span style="color:#aaa;font-size:0.9em;">(${c.time})</span>`;
      feed.appendChild(div);
    });
  } catch (e) { feed.innerHTML = '<em>Could not load commits</em>'; }
}
document.addEventListener('DOMContentLoaded', updateCommitFeed);

// --- Confetti for streak celebration ---
function launchConfetti() {
  const confetti = document.createElement('canvas');
  confetti.className = 'confetti';
  document.body.appendChild(confetti);
  const ctx = confetti.getContext('2d');
  confetti.width = window.innerWidth;
  confetti.height = window.innerHeight;
  const pieces = Array.from({length: 120}, () => ({
    x: Math.random() * confetti.width,
    y: Math.random() * -confetti.height,
    r: Math.random() * 6 + 4,
    d: Math.random() * 40 + 10,
    color: `hsl(${Math.random()*360},90%,60%)`,
    tilt: Math.random() * 10 - 10
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0,0,confetti.width,confetti.height);
    pieces.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += Math.cos(frame/10 + p.d) + 2 + p.r/2;
      p.x += Math.sin(frame/10) * 2;
      if (p.y > confetti.height) p.y = -10;
    });
    frame++;
    if (frame < 180) requestAnimationFrame(draw);
    else confetti.remove();
  }
  draw();
}
// Patch into streak update
const origFetchGitHubStats = window.fetchGitHubStats;
window.fetchGitHubStats = async function() {
  const prevStreak = Number(document.getElementById('github-streak')?.textContent || 0);
  await origFetchGitHubStats?.();
  const newStreak = Number(document.getElementById('github-streak')?.textContent || 0);
  if (newStreak > prevStreak && newStreak > 0) launchConfetti();
};

