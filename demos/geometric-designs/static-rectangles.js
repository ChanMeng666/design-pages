document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.wrapper');
    
    // --- Final adjustment parameters ---
    const numberOfRectangles = 14; // <--- Modification point: Further reduce quantity
    const depthGap = 30;          // <--- Modification point: Further increase spacing
    // ----------------------

    // Loop to create rectangles
    for (let i = 0; i < numberOfRectangles; i++) {
        const rectangle = document.createElement('div');
        rectangle.classList.add('rectangle');
        
        const zPosition = -i * depthGap;
        rectangle.style.transform = `translateZ(${zPosition}px)`;
        
        wrapper.appendChild(rectangle);
    }
    
    // Create and add center glow
    const glow = document.createElement('div');
    glow.classList.add('glow');
    // Dynamically calculate glow position, ensure it's at the end
    glow.style.transform = `translate(-50%, -50%) translateZ(${-numberOfRectangles * depthGap}px)`;
    wrapper.appendChild(glow);
});