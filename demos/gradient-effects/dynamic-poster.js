document.addEventListener('DOMContentLoaded', function() {
    const posterGrid = document.querySelector('.poster-grid');

    // Define all possible gradient styles
    const gradientClasses = ['gradient-right', 'gradient-down', 'gradient-left', 'gradient-up'];

    // Create 48 cells (6 columns × 8 rows)
    for (let i = 0; i < 48; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        
        // Through a random threshold, decide whether this cell has gradient effect
        // Math.random() > 0.7 means approximately 30% probability of adding gradient
        if (Math.random() > 0.7) {
            // Randomly select one from the gradient styles array
            const randomGradient = gradientClasses[Math.floor(Math.random() * gradientClasses.length)];
            cell.classList.add(randomGradient);
        }
        
        posterGrid.appendChild(cell);
    }
});