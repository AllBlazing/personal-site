// Gallery implementation with navigation
const images = [
    {
        src: 'images-for-journey/yemen-wedding.jpeg',
        title: 'Wedding in Yemen'
    },
    {
        src: 'images-for-journey/summit-of-potosi,-bolivia.jpeg',
        title: 'Summit of Potosi, Bolivia'
    },
    {
        src: 'images-for-journey/saudi-marathon.jpeg',
        title: 'Saudi Marathon'
    },
    {
        src: 'images-for-journey/saudi-desert-125cc.jpeg',
        title: 'Desert Riding in Saudi'
    },
    {
        src: 'images-for-journey/rics.jpeg',
        title: 'RICS'
    },
    {
        src: 'images-for-journey/on-top-of-car-saudi.jpg',
        title: 'On Top of Car in Saudi'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.48.03.png',
        title: 'Project Screenshot 1'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.46.17.png',
        title: 'Project Screenshot 2'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.45.54.png',
        title: 'Project Screenshot 3'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.45.09.png',
        title: 'Project Screenshot 4'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.45.00.png',
        title: 'Project Screenshot 5'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.44.35.png',
        title: 'Project Screenshot 6'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.44.19.png',
        title: 'Project Screenshot 7'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.44.04.png',
        title: 'Project Screenshot 8'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.43.44.png',
        title: 'Project Screenshot 9'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.43.31.png',
        title: 'Project Screenshot 10'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.42.58.png',
        title: 'Project Screenshot 11'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.42.14.png',
        title: 'Project Screenshot 12'
    },
    {
        src: 'images-for-journey/Screenshot-2025-04-19-at-19.38.35.png',
        title: 'Project Screenshot 13'
    }
];

let currentIndex = 0;
const imagesPerView = 3;

function initGallery() {
    const container = document.querySelector('#journey-gallery');
    if (!container) {
        console.warn('Gallery container not found, will retry in 100ms');
        setTimeout(initGallery, 100);
        return;
    }

    // Create gallery structure if it doesn't exist
    if (!container.querySelector('.gallery-grid')) {
        container.innerHTML = `
            <button class="gallery-nav prev" aria-label="Previous image">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="gallery-grid"></div>
            <button class="gallery-nav next" aria-label="Next image">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }

    const gallery = container.querySelector('.gallery-grid');
    const prevButton = container.querySelector('.gallery-nav.prev');
    const nextButton = container.querySelector('.gallery-nav.next');

    if (!gallery || !prevButton || !nextButton) {
        console.error('Gallery elements not found');
        return;
    }

    function updateGallery() {
        gallery.innerHTML = '';
        
        for (let i = currentIndex; i < currentIndex + imagesPerView && i < images.length; i++) {
            const image = images[i];
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'gallery-img-wrapper';
            
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.title;
            img.loading = 'lazy';
            img.style.objectFit = 'cover';
            img.style.objectPosition = 'center 30%';
            
            const caption = document.createElement('div');
            caption.className = 'gallery-caption';
            caption.textContent = image.title;
            
            imgWrapper.appendChild(img);
            item.appendChild(imgWrapper);
            item.appendChild(caption);
            gallery.appendChild(item);
            
            // Handle image load errors
            img.onerror = () => {
                console.warn(`Failed to load image: ${image.src}`);
                imgWrapper.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-image"></i>
                        <span>Image not found</span>
                    </div>
                `;
            };
        }

        // Update button visibility
        prevButton.style.display = currentIndex === 0 ? 'none' : 'flex';
        nextButton.style.display = currentIndex + imagesPerView >= images.length ? 'none' : 'flex';
    }

    // Navigation handlers
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex = Math.max(0, currentIndex - imagesPerView);
            updateGallery();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex + imagesPerView < images.length) {
            currentIndex = Math.min(images.length - imagesPerView, currentIndex + imagesPerView);
            updateGallery();
        }
    });

    // Initialize gallery
    updateGallery();
    container.classList.add('loaded');
}

// Initialize gallery when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
} 