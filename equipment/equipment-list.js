const SLOT_FILTER_MAP = {
    '内蔵': 'organ',
    'あご': 'jaw',
    'ひれ': 'fin',
    'しっぽ': 'tail',
    'からだ': 'body',
    'あたま': 'head'
};

const ELEMENT_FILTER_MAP = {
    'アトミック': 'atomic',
    'シャドウ': 'shadow',
    'バイオエレクトリック': 'bioelectric',
    'ボーン': 'bone'
};

function normalizeEquipmentImagePath(imagePath = '') {
    return imagePath.replace(/^\.\.\//, '');
}

function createEquipmentCard(equipmentId, equipment) {
    const card = document.createElement('a');
    card.className = 'equipment-card';
    card.href = `equipment/equipment.html?id=${encodeURIComponent(equipmentId)}`;
    card.style.backgroundColor = 'black';
    card.style.borderRadius = '10px';

    const slotFilter = SLOT_FILTER_MAP[equipment.slot];
    if (slotFilter) {
        card.dataset.slot = slotFilter;
    }

    const elementFilter = ELEMENT_FILTER_MAP[equipment.element];
    if (elementFilter) {
        card.dataset.element = elementFilter;
    }

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'equipment-img-wrapper';

    const image = document.createElement('img');
    image.src = normalizeEquipmentImagePath(equipment.image);
    image.className = 'equipment-img';
    image.alt = equipment.name;
    imageWrapper.appendChild(image);

    const name = document.createElement('div');
    name.className = 'equipment-name';
    name.textContent = equipment.name;

    card.append(imageWrapper, name);
    return card;
}

function renderEquipmentCards() {
    const container = document.getElementById('equipment-container');
    if (!container || !equipmentData) return [];

    container.replaceChildren();

    const cards = Object.entries(equipmentData).map(([equipmentId, equipment]) => {
        const card = createEquipmentCard(equipmentId, equipment);
        container.appendChild(card);
        return card;
    });

    return cards;
}

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    const openSidebarBtn = document.getElementById('main-sidebar-open');
    const closeSidebarBtn = document.getElementById('main-sidebar-close');
    const filterToggleBtn = document.getElementById('equipment-filter-toggle');
    const filterPopover = document.getElementById('filter-popover');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const sidebarCloseInner = document.querySelector('.main-sidebar-close-inner');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const equipmentCards = renderEquipmentCards();
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
        sidebarCloseInner.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            closeSidebar();
        });
    }

    if (filterToggleBtn && filterPopover) {
        filterToggleBtn.addEventListener('click', (event) => {
            if (!isMobileLayout()) return;
            event.stopPropagation();
            filterPopover.classList.toggle('hidden');
        });
        document.addEventListener('click', (event) => {
            if (!isMobileLayout()) return;
            if (!filterPopover.contains(event.target) && event.target !== filterToggleBtn) {
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

    let activeElement = null;
    let activeSlot = null;

    function applyFilters() {
        equipmentCards.forEach((card) => {
            const cardElement = card.getAttribute('data-element');
            const cardSlot = card.getAttribute('data-slot');

            const matchElement = !activeElement || cardElement === activeElement;
            const matchSlot = !activeSlot || cardSlot === activeSlot;

            card.style.display = matchElement && matchSlot ? '' : 'none';
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            const filterType = button.getAttribute('data-filter-type');

            if (filterType === 'element') {
                if (activeElement === filter) {
                    activeElement = null;
                    button.classList.remove('active');
                } else {
                    if (activeElement) {
                        document.querySelector(`.filter-btn[data-filter="${activeElement}"]`)?.classList.remove('active');
                    }
                    activeElement = filter;
                    button.classList.add('active');
                }
            } else if (filterType === 'slot') {
                if (activeSlot === filter) {
                    activeSlot = null;
                    button.classList.remove('active');
                } else {
                    if (activeSlot) {
                        document.querySelector(`.filter-btn[data-filter="${activeSlot}"]`)?.classList.remove('active');
                    }
                    activeSlot = filter;
                    button.classList.add('active');
                }
            }

            applyFilters();
        });
    });
});
