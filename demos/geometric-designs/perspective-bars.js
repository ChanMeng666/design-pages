// script.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bars-container');
    if (!container) return;

    // --- Configuration parameters ---
    const totalBars = 50; // Total number of bars
    const startColor = { r: 0, g: 172, b: 234 };  // Starting color (blue)
    const endColor = { r: 139, g: 226, b: 53 };    // Ending color (green)
    const maxRotation = 75; // Maximum rotation angle (deg)
    const gapIndex = Math.floor(totalBars / 2); // Position of middle gap
    const gapSize = '40px'; // Size of the gap

    // --- Color interpolation function ---
    // Calculate color between two colors based on progress (0 to 1)
    function interpolateColor(color1, color2, factor) {
        let result = {};
        result.r = Math.round(color1.r + factor * (color2.r - color1.r));
        result.g = Math.round(color1.g + factor * (color2.g - color1.g));
        result.b = Math.round(color1.b + factor * (color2.b - color1.b));
        return `rgb(${result.r}, ${result.g}, ${result.b})`;
    }

    // --- Generate all bars ---
    for (let i = 0; i < totalBars; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');

        // 1. Calculate progress and color
        const progress = i / (totalBars - 1);
        const color = interpolateColor(startColor, endColor, progress);
        bar.style.backgroundColor = color;

        // 2. Calculate perspective rotation angle
        // We use a parabolic function to calculate rotation angle, making middle rotation minimal and ends maximal
        // |i - N/2| calculates distance from current bar to center bar
        const distanceFromCenter = Math.abs(i - (totalBars - 1) / 2);
        // Normalize distance to [0, 1] range
        const rotationFactor = distanceFromCenter / ((totalBars - 1) / 2);
        const rotation = maxRotation * rotationFactor;
        bar.style.transform = `rotateX(${rotation}deg)`;

        // 3. Create middle gap
        if (i === gapIndex) {
            bar.style.marginTop = gapSize;
        }

        container.appendChild(bar);
    }
});