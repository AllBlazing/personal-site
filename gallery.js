// Simple gallery implementation
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

function createGallery() {
    console.log('Creating gallery...');
    
    const container = document.getElementById('journey-gallery');
    if (!container) {
        console.error('Gallery container not found');
        return;
    }
    console.log('Found gallery container:', container);

    // Create loading state
    container.innerHTML = '<div class="gallery-loading">Loading gallery...</div>';
    console.log('Added loading message');

    // Create gallery grid
    const gallery = document.createElement('div');
    gallery.className = 'gallery-grid';
    
    // Add images immediately without waiting for load
    images.forEach((image, index) => {
        console.log(`Creating item for image ${index + 1}:`, image.src);
        
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.title;
        
        const caption = document.createElement('div');
        caption.className = 'gallery-caption';
        caption.textContent = image.title;
        
        item.appendChild(img);
        item.appendChild(caption);
        gallery.appendChild(item);
        
        // Log any image load errors
        img.onerror = () => {
            console.error(`Failed to load image ${index + 1}:`, image.src);
            item.innerHTML = `<div class="error-message">Failed to load: ${image.title}</div>`;
        };
    });

    // Replace loading message with gallery
    container.innerHTML = '';
    container.appendChild(gallery);
    container.classList.add('loaded');
    console.log('Gallery created and added to container');
}

// Initialize gallery when DOM is ready
console.log('Gallery script loaded');
if (document.readyState === 'loading') {
    console.log('Document still loading, adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', createGallery);
} else {
    console.log('Document already loaded, creating gallery immediately');
    createGallery();
} 