// Debug script to check gallery initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Check if gallery container exists
    const container = document.getElementById('journey-gallery');
    console.log('Gallery container:', container);
    
    // Check if gallery.js is loaded
    const scripts = Array.from(document.scripts);
    const galleryScript = scripts.find(script => script.src.includes('gallery.js'));
    console.log('Gallery script loaded:', !!galleryScript);
    
    // Try to create gallery manually
    if (container) {
        console.log('Attempting to create gallery manually');
        createGallery();
    }
}); 