document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    const openSidebarBtn = document.getElementById('main-sidebar-open');
    const closeSidebarBtn = document.getElementById('main-sidebar-close');
    const filterToggleBtn = document.getElementById('equipment-filter-toggle');
    const filterPopover = document.getElementById('filter-popover');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const sidebarCloseInner = document.querySelector('.main-sidebar-close-inner');
    const isMobileLayout = () => window.innerWidth <= 900;

    const applySidebarMode = () => {
        if (window.innerWidth <= 900) {
            body.classList.add('sidebar-collapsed');
            if (sidebar) sidebar.classList.add('collapsed');
            if (sidebarBackdrop) sidebarBackdrop.classList.add('hidden');
        } else {
            body.classList.remove('sidebar-collapsed');
            if (sidebar) sidebar.classList.remove('collapsed');
            if (sidebarBackdrop) sidebarBackdrop.classList.add('hidden');
        }
    };

    applySidebarMode();
    window.addEventListener('resize', applySidebarMode);

    const openSidebar = () => {
        body.classList.remove('sidebar-collapsed');
        if (sidebar) sidebar.classList.remove('collapsed');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('hidden');
    };

    const closeSidebar = () => {
        body.classList.add('sidebar-collapsed');
        if (sidebar) sidebar.classList.add('collapsed');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('hidden');
    };

    if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);
    if (sidebarCloseInner) {
        sidebarCloseInner.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
        });
    }

    if (filterToggleBtn && filterPopover) {
        filterToggleBtn.addEventListener('click', (e) => {
            if (!isMobileLayout()) return;
            e.stopPropagation();
            filterPopover.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!isMobileLayout()) return;
            if (!filterPopover.contains(e.target) && e.target !== filterToggleBtn) {
                filterPopover.classList.add('hidden');
            }
        });
        window.addEventListener('resize', () => {
            if (!isMobileLayout()) {
                filterPopover.classList.remove('hidden');
            } else {
                filterPopover.classList.add('hidden');
            }
        });
    }

    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.equipment-card');

    let activeElement = null;
    let activeSlot = null;

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            const type = btn.getAttribute('data-filter-type');

            if (type === 'element') {
                if (activeElement === filter) {
                    activeElement = null;
                    btn.classList.remove('active');
                } else {
                    if (activeElement) {
                        document.querySelector(`.filter-btn[data-filter="${activeElement}"]`).classList.remove('active');
                    }
                    activeElement = filter;
                    btn.classList.add('active');
                }
            } else if (type === 'slot') {
                if (activeSlot === filter) {
                    activeSlot = null;
                    btn.classList.remove('active');
                } else {
                    if (activeSlot) {
                        document.querySelector(`.filter-btn[data-filter="${activeSlot}"]`).classList.remove('active');
                    }
                    activeSlot = filter;
                    btn.classList.add('active');
                }
            }

            applyFilters();
        });
    });

    function applyFilters() {
        cards.forEach((card) => {
            const cardElement = card.getAttribute('data-element');
            const cardSlot = card.getAttribute('data-slot');

            const matchElement = !activeElement || cardElement === activeElement;
            const matchSlot = !activeSlot || cardSlot === activeSlot;

            if (matchElement && matchSlot) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
});
