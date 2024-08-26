const neonImage = document.querySelector('.neon-image');
const animations = ['flicker1', 'flicker2', 'flicker3']; // Add more if needed

neonImage.addEventListener('mouseover', () => {
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    neonImage.style.animation = `${randomAnimation} 2s infinite alternate`;
});

neonImage.addEventListener('mouseout', () => {
    neonImage.style.animation = ''; // Reset animation when hover ends
});
