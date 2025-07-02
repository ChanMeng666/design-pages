document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('posterGrid');
    const columns = 6;
    const rows = 8;
    const totalCells = columns * rows;

    // 定义所有可能的渐变样式
    const gradientClasses = ['gradient-right', 'gradient-down', 'gradient-left', 'gradient-up'];

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        // 通过一个随机阈值，决定这个单元格是否有渐变效果
        // Math.random() > 0.7 表示大约有 30% 的概率添加渐变
        if (Math.random() > 0.7) {
            // 从渐变样式数组中随机选一个
            const randomGradient = gradientClasses[Math.floor(Math.random() * gradientClasses.length)];
            cell.classList.add(randomGradient);
        }

        gridContainer.appendChild(cell);
    }
});