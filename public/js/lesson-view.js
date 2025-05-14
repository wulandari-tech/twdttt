document.addEventListener('DOMContentLoaded', () => {
    const markCompleteBtn = document.getElementById('markCompleteBtn');
    const lessonVideoPlayer = document.getElementById('lessonVideoPlayer');

    if (markCompleteBtn) {
        markCompleteBtn.addEventListener('click', () => {
            markCompleteBtn.classList.toggle('completed');
            if (markCompleteBtn.classList.contains('completed')) {
                markCompleteBtn.innerHTML = '<i class="fas fa-check-double"></i> Ditandai Selesai';
                window.showAppNotification('Pelajaran ditandai selesai!', 'success');
            } else {
                markCompleteBtn.innerHTML = '<i class="fas fa-check-circle"></i> Tandai Selesai';
            }
        });
    }

    if (lessonVideoPlayer) {
        lessonVideoPlayer.addEventListener('contextmenu', e => e.preventDefault());
    }

    const lessonNavItems = document.querySelectorAll('.lesson-sidebar .lesson-nav-item a');
    lessonNavItems.forEach(item => {
        item.addEventListener('click', function() {
           const currentActive = document.querySelector('.lesson-sidebar .lesson-nav-item.active');
           if(currentActive) currentActive.classList.remove('active');
           this.parentElement.classList.add('active');
        });
    });
});