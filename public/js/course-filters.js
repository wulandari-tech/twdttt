document.addEventListener('DOMContentLoaded', () => {
    const categoryFilterLinks = document.querySelectorAll('#categoryFilter a');
    const instructorFilterSelect = document.getElementById('instructorFilter');
    const sortFilterSelect = document.getElementById('sortFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const courseGridContainer = document.getElementById('courseGridContainer');
    const courseCards = courseGridContainer ? Array.from(courseGridContainer.querySelectorAll('.course-card')) : [];
    const courseCountInfo = document.getElementById('courseCountInfo');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');

    let activeCategory = 'all';
    let activeInstructor = 'all';
    let activeSort = 'relevance';

    function updateCourseDisplay() {
        if (!courseGridContainer || !courseCountInfo) return;

        let filteredCourses = courseCards.filter(card => {
            const categoryMatch = activeCategory === 'all' || card.dataset.category === activeCategory;
            const instructorMatch = activeInstructor === 'all' || card.dataset.instructor === activeInstructor;
            return categoryMatch && instructorMatch;
        });

        if (activeSort === 'newest') {
        } else if (activeSort === 'price-asc') {
            filteredCourses.sort((a, b) => {
                const priceA = parseFloat(a.querySelector('.course-card-price')?.textContent.replace(/[^0-9.-]+/g,"")) || 0;
                const priceB = parseFloat(b.querySelector('.course-card-price')?.textContent.replace(/[^0-9.-]+/g,"")) || 0;
                return priceA - priceB;
            });
        } else if (activeSort === 'price-desc') {
            filteredCourses.sort((a, b) => {
                const priceA = parseFloat(a.querySelector('.course-card-price')?.textContent.replace(/[^0-9.-]+/g,"")) || 0;
                const priceB = parseFloat(b.querySelector('.course-card-price')?.textContent.replace(/[^0-9.-]+/g,"")) || 0;
                return priceB - priceA;
            });
        }


        courseGridContainer.innerHTML = '';
        filteredCourses.forEach(card => courseGridContainer.appendChild(card));
        courseCountInfo.textContent = `Menampilkan ${filteredCourses.length} kursus`;

        if (filteredCourses.length === 0) {
            courseGridContainer.innerHTML = `
                <div class="no-results-found" style="grid-column: 1 / -1; text-align: center; padding: 20px;">
                    <i class="fas fa-search-minus fa-3x"></i>
                    <p>Oops! Tidak ada kursus yang cocok dengan kriteria Anda.</p>
                </div>`;
        }
    }


    categoryFilterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            categoryFilterLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            activeCategory = link.dataset.filterValue;
        });
    });

    if (instructorFilterSelect) {
        instructorFilterSelect.addEventListener('change', (e) => {
            activeInstructor = e.target.value;
        });
    }

    if (sortFilterSelect) {
        sortFilterSelect.addEventListener('change', (e) => {
            activeSort = e.target.value;
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            updateCourseDisplay();
            window.showAppNotification('Filter diterapkan!', 'success');
        });
    }

    if (gridViewBtn && listViewBtn && courseGridContainer) {
        gridViewBtn.addEventListener('click', () => {
            courseGridContainer.classList.remove('list-view');
            courseGridContainer.classList.add('grid-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        });
        listViewBtn.addEventListener('click', () => {
            courseGridContainer.classList.remove('grid-view');
            courseGridContainer.classList.add('list-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
        });
    }


    if (courseCards.length > 0) {
       updateCourseDisplay();
    }
});