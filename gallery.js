// Simple gallery implementation
const images = [
    {
        src: 'images-for-vibe-section/yemen-wedding.jpeg',
        title: 'Wedding in Yemen'
    },
    {
        src: 'images-for-vibe-section/summit-of-potosi,-bolivia.jpeg',
        title: 'Summit of Potosi, Bolivia'
    },
    {
        src: 'images-for-vibe-section/saudi-marathon.jpeg',
        title: 'Saudi Marathon'
    },
    {
        src: 'images-for-vibe-section/saudi-desert-125cc.jpeg',
        title: 'Desert Riding in Saudi'
    },
    {
        src: 'images-for-vibe-section/rics.jpeg',
        title: 'RICS'
    },
    {
        src: 'images-for-vibe-section/on-top-of-car-saudi.jpg',
        title: 'On Top of Car in Saudi'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.48.03.png',
        title: 'Project Screenshot 1'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.46.17.png',
        title: 'Project Screenshot 2'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.45.54.png',
        title: 'Project Screenshot 3'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.45.09.png',
        title: 'Project Screenshot 4'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.45.00.png',
        title: 'Project Screenshot 5'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.44.35.png',
        title: 'Project Screenshot 6'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.44.19.png',
        title: 'Project Screenshot 7'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.44.04.png',
        title: 'Project Screenshot 8'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.43.44.png',
        title: 'Project Screenshot 9'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.43.31.png',
        title: 'Project Screenshot 10'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.42.58.png',
        title: 'Project Screenshot 11'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.42.14.png',
        title: 'Project Screenshot 12'
    },
    {
        src: 'images-for-vibe-section/Screenshot-2025-04-19-at-19.38.35.png',
        title: 'Project Screenshot 13'
    }
];

function createGallery() {
    const container = document.getElementById('journey-gallery');
    if (!container) {
        console.error('Gallery container not found');
        return;
    }

    // Create loading state
    container.innerHTML = '<div class="gallery-loading">Loading gallery...</div>';

    // Create gallery grid
    const gallery = document.createElement('div');
    gallery.className = 'gallery-grid';
    
    // Track loaded images
    let loadedImages = 0;
    const totalImages = images.length;

    // Create and load all images
    images.forEach(image => {
        const item = document.createElement('div');
        item.className = 'gallery-item loading';
        
        const img = new Image();
        img.src = image.src;
        img.alt = image.title;
        
        img.onload = () => {
            loadedImages++;
            item.classList.remove('loading');
            if (loadedImages === totalImages) {
                container.innerHTML = '';
                container.appendChild(gallery);
                container.classList.add('loaded');
            }
        };

        img.onerror = () => {
            console.error('Failed to load image:', image.src);
            item.classList.remove('loading');
            item.classList.add('error');
            item.innerHTML = `<div class="error-message">Failed to load image: ${image.title}</div>`;
            loadedImages++;
            if (loadedImages === totalImages) {
                container.innerHTML = '';
                container.appendChild(gallery);
                container.classList.add('loaded');
            }
        };
        
        const caption = document.createElement('div');
        caption.className = 'gallery-caption';
        caption.textContent = image.title;
        
        item.appendChild(img);
        item.appendChild(caption);
        gallery.appendChild(item);
    });
}

// Initialize gallery when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createGallery);
} else {
    createGallery();
} 