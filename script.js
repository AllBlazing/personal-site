// Visitor counter
document.addEventListener('DOMContentLoaded', () => {
    // Get the visitor counter element
    const visitorCounter = document.querySelector('.visitor-counter');
    
    // Get the current count from localStorage or initialize it
    let count = localStorage.getItem('visitorCount');
    if (!count) {
        count = 0;
    }
    
    // Increment the count
    count++;
    
    // Save the new count to localStorage
    localStorage.setItem('visitorCount', count);
    
    // Update the display
    visitorCounter.textContent = `You are visitor number ${count}`;
}); 