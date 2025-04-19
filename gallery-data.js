// Gallery data structure
const galleryData = [
    {
        src: "images for vibe section/saudi desert 125cc.jpeg",
        caption: "Exploring the Saudi desert on a 125cc bike",
        date: "2023",
        location: "Saudi Arabia"
    },
    {
        src: "images for vibe section/saudi marathon.jpeg",
        caption: "Crossing the finish line at Saudi Marathon",
        date: "2023",
        location: "Saudi Arabia"
    },
    {
        src: "images for vibe section/rics.jpeg",
        caption: "Training session at RICS",
        date: "2024",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/yemen wedding.jpeg",
        caption: "Traditional Yemeni wedding celebration",
        date: "2022",
        location: "Yemen"
    },
    {
        src: "images for vibe section/summit of potosi, bolivia.jpeg",
        caption: "Reaching the summit of Potosi",
        date: "2022",
        location: "Bolivia"
    },
    {
        src: "images for vibe section/on top of car saudi.jpg",
        caption: "Desert adventure in Saudi Arabia",
        date: "2023",
        location: "Saudi Arabia"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.48.03.png",
        caption: "Training progress",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.46.17.png",
        caption: "Workout session",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.45.54.png",
        caption: "Fitness tracking",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.45.09.png",
        caption: "Training metrics",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.45.00.png",
        caption: "Performance stats",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.44.35.png",
        caption: "Workout progress",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.44.19.png",
        caption: "Training session",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.44.04.png",
        caption: "Fitness tracking",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.43.44.png",
        caption: "Workout metrics",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.43.31.png",
        caption: "Training progress",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.42.58.png",
        caption: "Performance tracking",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.42.14.png",
        caption: "Workout session",
        date: "2025",
        location: "Netherlands"
    },
    {
        src: "images for vibe section/Screenshot 2025-04-19 at 19.38.35.png",
        caption: "Training metrics",
        date: "2025",
        location: "Netherlands"
    }
];

// Function to load gallery items
function loadGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) {
        console.error('Gallery grid element not found');
        return;
    }

    // Clear any existing content
    galleryGrid.innerHTML = '';

    // Create and append gallery items
    galleryData.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <a href="${item.src}" class="gallery-link" data-sub-html="<h4>${item.caption}</h4><p>${item.date} | ${item.location}</p>">
                <img src="${item.src}" alt="${item.caption}" loading="lazy">
                <div class="gallery-caption">
                    <h3>${item.caption}</h3>
                    <p>${item.date} | ${item.location}</p>
                </div>
            </a>
        `;
        galleryGrid.appendChild(galleryItem);
    });

    // Initialize lightGallery
    const gallery = lightGallery(galleryGrid, {
        selector: '.gallery-link',
        download: false,
        counter: false,
        plugins: [lgZoom, lgFullscreen]
    });

    // Refresh gallery after images are loaded
    window.addEventListener('load', () => {
        gallery.refresh();
    });
}

// Load gallery when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadGallery();
    initializeGalleryNavigation();
});

function initializeGalleryNavigation() {
    const container = document.querySelector('.gallery-container');
    const prevBtn = document.querySelector('.gallery-nav.prev');
    const nextBtn = document.querySelector('.gallery-nav.next');
    const scrollAmount = 300; // Width of one image

    if (prevBtn && nextBtn && container) {
        // Update button visibility on scroll
        function updateButtonVisibility() {
            const maxScroll = container.scrollWidth - container.clientWidth;
            
            // Show/hide previous button
            if (container.scrollLeft <= 0) {
                prevBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
            }
            
            // Show/hide next button
            if (container.scrollLeft >= maxScroll) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'flex';
            }
        }

        // Navigation button click handlers
        prevBtn.addEventListener('click', () => {
            container.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        // Add scroll event listener
        container.addEventListener('scroll', updateButtonVisibility);

        // Initial visibility check
        updateButtonVisibility();

        // Update visibility when window is resized
        window.addEventListener('resize', updateButtonVisibility);
    }
} 