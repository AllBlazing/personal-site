// Gallery implementation with navigation
// --- Per-image style overrides for zoom, position, orientation, etc. ---
const imageStyleOverrides = {
    'Yemen wedding, 2011': { objectFit: 'contain', objectPosition: 'center center', transform: 'scale(0.8)' },
    'UK Ironman Sherbourne, 2006': { objectFit: 'contain', objectPosition: 'center center', transform: 'scale(0.8)' },
    'Summit of Potosi, Bolivia, 2006': { objectFit: 'contain', objectPosition: 'center center', transform: 'scale(0.8)' },
    'Qualifying as a Chartered Surveyor, 2003': { objectFit: 'contain', objectPosition: 'center center', transform: 'scale(0.8)' },
    'London to Istanbul by Motorbike, 2011': { objectFit: 'contain', objectPosition: 'center center', transform: 'scale(0.8)' },
    'Saudi Arabia Marathon, 2012': { objectFit: 'contain', objectPosition: 'center center', transform: 'scale(0.8)' },
    'Amsterdam Marathon, 2019 - breaking sub3': { objectFit: 'contain', objectPosition: 'center center', transform: 'scale(0.8)' },
    'Summit of Cerro Chirripo, Costa Rica, 2005': { objectFit: 'contain', objectPosition: 'center center', transform: 'scale(0.8)' }
};

// --- Gallery image data ---
const images = [
    {
        src: 'images-for-journey/Hyrox Berlin, 2025.jpg',
        title: 'Hyrox Berlin, 2025'
    },
    {
        src: 'images-for-journey/Yemen wedding, 2011, 20.jpeg',
        title: 'Yemen wedding, 2011'
    },
    {
        src: 'images-for-journey/Summit-of-potosi,-bolivia, 2006.jpeg',
        title: 'Summit of Potosi, Bolivia, 2006'
    },
    {
        src: 'images-for-journey/Amsterdam Marathon, 2019 - breaking sub3.png',
        title: 'Amsterdam Marathon, 2019 - breaking sub3'
    },
    {
        src: 'images-for-journey/Summit of Cerro Chirripo, Costa Rica, 2005.png',
        title: 'Summit of Cerro Chirripo, Costa Rica, 2005'
    },
    {
        src: 'images-for-journey/Sana, Yemen, 2011.png',
        title: 'Sana, Yemen, 2011'
    },
    {
        src: 'images-for-journey/Petra, 2012 .png',
        title: 'Petra, Jordan, 2012'
    },
    {
        src: 'images-for-journey/Pennine 100, Ultramarathon, 2006.png',
        title: 'Pennine 100, Ultramarathon, 2006'
    },
    {
        src: 'images-for-journey/Getting lost in Guatmalua, 2005.png',
        title: 'Getting lost in Guatemala, 2005'
    },
    {
        src: 'images-for-journey/Madain Salih, Saudi Arabia 2012.png',
        title: 'Madain Salih, Saudi Arabia 2012'
    },
    {
        src: 'images-for-journey/UK Ironman Sherbourne, 2006.png',
        title: 'UK Ironman Sherbourne, 2006'
    },
    {
        src: 'images-for-journey/Solo hike : climb to summit of Sajama, Bolivia, 2006.png',
        title: 'Solo hike / climb to summit of Sajama, Bolivia, 2006'
    },
    {
        src: 'images-for-journey/Papillon, London, 2004.png',
        title: 'Papillon, London, 2004'
    },
    {
        src: 'images-for-journey/The Dead Sea, 2012.png',
        title: 'The Dead Sea, 2012'
    },
    {
        src: 'images-for-journey/London to Istanbul by Motorbike, 2011.png',
        title: 'London to Istanbul by Motorbike, 2011'
    },
    {
        src: 'images-for-journey/Saudi Arabia Marathon, 2012.jpeg',
        title: 'Saudi Arabia Marathon, 2012'
    },
    {
        src: 'images-for-journey/Journey across the desert, Saudi Arabia, 2012.jpeg',
        title: 'Journey across the desert, Saudi Arabia, 2012'
    },
    {
        src: 'images-for-journey/Qualifying as a Chartered Surveyor, 2003.png',
        title: 'Qualifying as a Chartered Surveyor, 2003'
    }
];

// Sort images by year (descending, most recent first)
function extractYear(str) {
    const match = str.match(/(20\d{2}|19\d{2})/);
    return match ? parseInt(match[0], 10) : 0;
}
images.sort((a, b) => extractYear(b.src) - extractYear(a.src));

let currentIndex = 0;
const imagesPerView = 3;

// --- Initialize the gallery and navigation ---
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

    // --- Render the gallery images and navigation ---
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
            img.title = image.title;
            img.loading = 'lazy';
            // --- Apply per-image style overrides if present ---
            const styleOverride = imageStyleOverrides[image.title];
            if (styleOverride) {
                Object.assign(img.style, styleOverride);
            } else {
                img.style.objectFit = 'cover';
                img.style.objectPosition = 'center 30%';
            }
            const caption = document.createElement('div');
            caption.className = 'gallery-caption';
            caption.textContent = image.title;
            imgWrapper.appendChild(img);
            item.appendChild(imgWrapper);
            item.appendChild(caption);
            gallery.appendChild(item);
            // --- Handle image load errors gracefully ---
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
        // --- Update navigation button visibility ---
        prevButton.style.display = currentIndex === 0 ? 'none' : 'flex';
        nextButton.style.display = currentIndex + imagesPerView >= images.length ? 'none' : 'flex';
    }

    // --- Navigation handlers ---
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
    // --- Initialize gallery ---
    updateGallery();
    container.classList.add('loaded');
}

// --- Initialize gallery when DOM is ready ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}
// --- End of gallery.js --- 