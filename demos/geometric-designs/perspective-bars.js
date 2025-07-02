// script.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bars-container');
    if (!container) return;

    // --- 配置参数 ---
    const totalBars = 50; // 总共的横条数量
    const startColor = { r: 0, g: 172, b: 234 };  // 起始颜色 (蓝色)
    const endColor = { r: 139, g: 226, b: 53 };    // 结束颜色 (绿色)
    const maxRotation = 75; // 最大旋转角度 (deg)
    const gapIndex = Math.floor(totalBars / 2); // 中间间隙的位置
    const gapSize = '40px'; // 间隙的大小

    // --- 颜色插值函数 ---
    // 根据进度 (0 to 1) 计算两种颜色之间的颜色
    function interpolateColor(color1, color2, factor) {
        let result = {};
        result.r = Math.round(color1.r + factor * (color2.r - color1.r));
        result.g = Math.round(color1.g + factor * (color2.g - color1.g));
        result.b = Math.round(color1.b + factor * (color2.b - color1.b));
        return `rgb(${result.r}, ${result.g}, ${result.b})`;
    }

    // --- 生成所有横条 ---
    for (let i = 0; i < totalBars; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');

        // 1. 计算进度和颜色
        const progress = i / (totalBars - 1);
        const color = interpolateColor(startColor, endColor, progress);
        bar.style.backgroundColor = color;

        // 2. 计算透视旋转角度
        // 我们用一个抛物线函数来计算旋转角度，使得中间的旋转最小，两端的最大
        // |i - N/2| 计算当前条到中心条的距离
        const distanceFromCenter = Math.abs(i - (totalBars - 1) / 2);
        // 将距离归一化到 [0, 1] 范围
        const rotationFactor = distanceFromCenter / ((totalBars - 1) / 2);
        const rotation = maxRotation * rotationFactor;
        bar.style.transform = `rotateX(${rotation}deg)`;

        // 3. 创建中间的间隙
        if (i === gapIndex) {
            bar.style.marginTop = gapSize;
        }

        container.appendChild(bar);
    }
});