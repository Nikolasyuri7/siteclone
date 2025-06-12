document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.student-video').forEach(fig => {
        const video = fig.querySelector('video');
        const playBtn = fig.querySelector('.play-button');
        const backBtn = fig.querySelector('.back-button');
        if (!video || !playBtn || !backBtn) return;
        video.removeAttribute('controls');
        playBtn.addEventListener('click', () => {
            playBtn.style.display = 'none';
            backBtn.style.display = 'flex';
            video.setAttribute('controls', '');
            video.play();
        });
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.currentTime = Math.max(0, video.currentTime - 5);
        });
        video.addEventListener('play', () => {
            playBtn.style.display = 'none';
            backBtn.style.display = 'flex';
        });
        video.addEventListener('pause', () => {
            playBtn.style.display = 'flex';
        });
        video.addEventListener('ended', () => {
            playBtn.style.display = 'flex';
        });
    });
});
