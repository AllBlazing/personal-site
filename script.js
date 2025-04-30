// Content Management System
class ContentManager {
    constructor() {
        this.content = {
            training: {},
            supplements: {},
            smoothies: {}
        };
        this.initialized = false;
    }

    async initialize() {
        this.searchInput = document.getElementById('content-search');
        this.contentGrid = document.getElementById('content-grid');
        await this.loadContent();
        this.setupSearch();
        this.initialized = true;
    }

    async loadContent() {
        try {
            const response = await fetch('/content.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            try {
                this.content = JSON.parse(text);
                this.renderContent();
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                this.handleError('Invalid content format');
            }
        } catch (error) {
            console.error('Error loading content:', error);
            this.handleError('Failed to load content');
        }
    }

    handleError(message) {
        // Remove loading state if present
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => el.remove());
        
        // Show error message
        if (this.contentGrid) {
            this.contentGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                </div>
            `;
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

// DOM Ready handler
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize core UI components first
        initializeUI();
        
        // Initialize content manager
        const contentManager = new ContentManager();
        await contentManager.initialize();
        
        // Initialize Strava integration
        await initializeStrava();
        
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

// Section transitions
function handleSectionTransitions() {
    const sections = document.querySelectorAll('.section-transition');
    if (!sections.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
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
    const statsContainer = document.getElementById('monthly-stats');
    if (!statsContainer) return;
    
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
    const statsContainer = document.getElementById('monthly-stats');
    const activitiesContainer = document.getElementById('activities-list');
    const typesContainer = document.getElementById('activity-types');
    
    if (!statsContainer || !activitiesContainer) {
        console.warn('Required containers not found');
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
        displayActivityTypes(activities);
        displayActivities(activities);
        
    } catch (error) {
        console.error('Error fetching activities:', error);
        statsContainer.innerHTML = '<div class="error-message">Failed to load stats</div>';
        activitiesContainer.innerHTML = '<div class="error-message">Failed to load activities</div>';
        if (typesContainer) {
            typesContainer.innerHTML = '<div class="error-message">Failed to load activity types</div>';
        }
    }
}

function displayMonthlyStats(activities) {
    const distanceEl = document.getElementById('total-distance');
    const timeEl = document.getElementById('total-time');
    const elevationEl = document.getElementById('elevation-gain');
    const countEl = document.getElementById('activity-count');
    
    if (!activities || !activities.length) {
        [distanceEl, timeEl, elevationEl, countEl].forEach(el => {
            if (el) el.textContent = '0';
        });
        return;
    }
    
    const stats = activities.reduce((acc, activity) => ({
        distance: acc.distance + (activity.distance || 0),
        time: acc.time + (activity.moving_time || 0),
        elevation: acc.elevation + (activity.total_elevation_gain || 0)
    }), { distance: 0, time: 0, elevation: 0 });
    
    if (distanceEl) distanceEl.textContent = (stats.distance / 1000).toFixed(1);
    if (timeEl) timeEl.textContent = formatDuration(stats.time);
    if (elevationEl) elevationEl.textContent = Math.round(stats.elevation);
    if (countEl) countEl.textContent = activities.length;
}

function displayActivityTypes(activities) {
    const container = document.getElementById('activity-types');
    if (!container || !activities || !activities.length) return;
    
    const types = new Set(activities.map(activity => activity.type));
    container.innerHTML = Array.from(types)
        .map(type => `<span class="type-tag">${type}</span>`)
        .join('');
}

function displayActivities(activities) {
    const container = document.getElementById('activities-list');
    if (!container) return;
    
    if (!activities || !activities.length) {
        container.innerHTML = '<div class="no-activities">No activities found this month</div>';
        return;
    }
    
    const recentActivities = activities.slice(0, 5);
    container.innerHTML = recentActivities.map(activity => {
        const date = new Date(activity.start_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="activity-item">
                <div class="activity-header">
                    <h4 class="activity-name">${activity.name}</h4>
                    <span class="activity-date">${date}</span>
                </div>
                <div class="activity-details">
                    <span class="activity-type">${activity.type}</span>
                    <span class="activity-stat">${(activity.distance / 1000).toFixed(1)}km</span>
                    <span class="activity-stat">${formatDuration(activity.moving_time)}</span>
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

    const contentManager = new ContentManager();
    const lazyLoader = new LazyLoader();

    // Load initial content
    contentManager.loadContent();
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

