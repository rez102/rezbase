const body = document.body;
const sidebar = document.querySelector('.sidebar');
const openSidebarBtn = document.getElementById('main-sidebar-open');
const closeSidebarBtn = document.getElementById('main-sidebar-close');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const sidebarCloseInner = document.querySelector('.main-sidebar-close-inner');

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
