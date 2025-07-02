document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.wrapper');
    
    // --- 最终调整参数 ---
    const numberOfRectangles = 14; // <--- 修改点：进一步减少数量
    const depthGap = 30;          // <--- 修改点：进一步拉大间距
    // ----------------------

    // 循环创建矩形
    for (let i = 0; i < numberOfRectangles; i++) {
        const rectangle = document.createElement('div');
        rectangle.classList.add('rectangle');
        
        const zPosition = -i * depthGap;
        rectangle.style.transform = `translateZ(${zPosition}px)`;
        
        wrapper.appendChild(rectangle);
    }
    
    // 创建并添加中心的光晕
    const glow = document.createElement('div');
    glow.classList.add('glow');
    // 动态计算光晕位置，确保其在最后
    glow.style.transform = `translate(-50%, -50%) translateZ(${-numberOfRectangles * depthGap}px)`;
    wrapper.appendChild(glow);
});