document.addEventListener('DOMContentLoaded', () => {
    const lessonVideoPlayer = document.getElementById('lessonVideoPlayer');
    const lessonSidebar = document.querySelector('.lesson-sidebar-public');
    const lessonContentArea = document.querySelector('.lesson-content-area-public');
    const siteHeader = document.querySelector('.navbar'); // Asumsi header/navbar Anda punya kelas .navbar

    function adjustLayoutHeight() {
        if (lessonSidebar && lessonContentArea && siteHeader) {
            const headerHeight = siteHeader.offsetHeight;
            const viewportHeight = window.innerHeight;
            const contentHeight = viewportHeight - headerHeight;

            lessonSidebar.style.height = `${contentHeight}px`;
            lessonSidebar.style.top = `${headerHeight}px`;
            // lessonContentArea.style.minHeight = `${contentHeight}px`; // Opsional jika konten bisa lebih pendek
        }
    }

    if (lessonVideoPlayer) {
        lessonVideoPlayer.addEventListener('contextmenu', e => e.preventDefault());
    }

    if (lessonSidebar && lessonContentArea && siteHeader) {
        adjustLayoutHeight();
        window.addEventListener('resize', adjustLayoutHeight);
    }

    const activeLessonNavItem = document.querySelector('.lesson-nav-item-public.active');
    if (activeLessonNavItem && lessonSidebar) {
        const sidebarRect = lessonSidebar.getBoundingClientRect();
        const activeItemRect = activeLessonNavItem.getBoundingClientRect();

        if (activeItemRect.bottom > sidebarRect.bottom || activeItemRect.top < sidebarRect.top) {
            activeLessonNavItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
});