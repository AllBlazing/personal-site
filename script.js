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
            // Remove loading state if present
            const loadingElements = document.querySelectorAll('.loading');
            loadingElements.forEach(el => el.remove());
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
        this.baseUrl = 'https://www.polaraccesslink.com/v3';
        this.init();
    }

    init() {
        // Remove loading states immediately
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => {
            el.textContent = 'Data unavailable';
            el.classList.remove('loading');
        });

        // Initialize displays with default values
        this.updateVO2MaxDisplay({ value: '--', trend: 'neutral' });
        this.updateHRVDisplay({ value: '--', trend: 'neutral' });
    }

    async getVO2Max() {
        try {
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
        const valueElement = document.getElementById('vo2max-value');
        const trendElement = document.getElementById('vo2max-trend');
        
        if (valueElement) {
            valueElement.textContent = data.value;
        }
        
        if (trendElement) {
            trendElement.className = 'trend-indicator ' + data.trend;
        }
    }

    updateHRVDisplay(data) {
        const valueElement = document.getElementById('hrv-value');
        const trendElement = document.getElementById('hrv-trend');
        
        if (valueElement) {
            valueElement.textContent = data.value;
        }
        
        if (trendElement) {
            trendElement.className = 'trend-indicator ' + data.trend;
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
});

// Messages functionality
document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('message-form');
    const messagesContainer = document.getElementById('messages-container');
    
    // Load messages from localStorage on page load
    loadMessages();
    
    // Handle form submission
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
        addMessageToDisplay(formData);
        
        // Reset form
        messageForm.reset();
        
        // Show success message
        showNotification('Message sent successfully!', 'success');
    });
    
    function saveMessage(message) {
        let messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.unshift(message); // Add new message to the beginning
        localStorage.setItem('messages', JSON.stringify(messages));
    }
    
    function loadMessages() {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messagesContainer.innerHTML = '';
        messages.forEach(message => addMessageToDisplay(message));
    }
    
    function addMessageToDisplay(message) {
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
        
        messagesContainer.prepend(messageElement);
    }
    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
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

// Terminal Window Updates
const statusMessages = [
    "brewing fresh coffee ☕️",
    "pushing code to production 🚀",
    "debugging like a detective 🔍",
    "building something cool 🛠️",
    "learning new tech stack 📚",
    "optimizing performance ⚡️",
    "squashing bugs 🐛",
    "shipping features ✨"
];

const projectMessages = [
    "HyTracker: tracking those gains 💪",
    "ScanSleepAI: optimizing rest 😴",
    "WishListExtAI: making shopping smarter 🛍️",
    "Personal Site: adding indie vibes ✨",
    "New Secret Project: stay tuned 🤫"
];

function updateTerminal() {
    const currentStatus = document.getElementById('current-status');
    const currentProject = document.getElementById('current-project');
    const workspace = document.getElementById('ascii-workspace');

    // Update status with random message
    currentStatus.textContent = statusMessages[Math.floor(Math.random() * statusMessages.length)];
    
    // Update project with random message
    currentProject.textContent = projectMessages[Math.floor(Math.random() * projectMessages.length)];
    
    // Update coffee and energy levels randomly
    const coffeeLevel = Math.floor(Math.random() * 10) + 1;
    const energyLevel = Math.floor(Math.random() * 10) + 1;
    
    workspace.innerHTML = `
      💻 Current Workspace
      ├── ☕️ Coffee Level: [${'█'.repeat(coffeeLevel)}${'-'.repeat(10-coffeeLevel)}] ${coffeeLevel*10}%
      ├── 💪 Energy Level: [${'█'.repeat(energyLevel)}${'-'.repeat(10-energyLevel)}] ${energyLevel*10}%
      ├── 🎯 Focus Mode: ${Math.random() > 0.3 ? 'activated' : 'recharging'}
      └── 🚀 Ship Status: ${Math.random() > 0.5 ? 'ready to launch' : 'preparing for takeoff'}
    `;
}

// Update terminal every 5 seconds
setInterval(updateTerminal, 5000);

// Initial update
updateTerminal();
