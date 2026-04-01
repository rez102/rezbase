const hunterBody = document.body;
const hunterSidebar = document.querySelector(".sidebar");
const hunterOpenSidebarBtn = document.getElementById("main-sidebar-open");
const hunterCloseSidebarBtn = document.getElementById("main-sidebar-close");
const hunterSidebarBackdrop = document.getElementById("sidebar-backdrop");
const hunterSidebarCloseInner = document.querySelector(".main-sidebar-close-inner");

const applyHunterSidebarMode = () => {
    if (window.innerWidth <= 900) {
        hunterBody.classList.add("sidebar-collapsed");
        if (hunterSidebar) hunterSidebar.classList.add("collapsed");
        if (hunterSidebarBackdrop) hunterSidebarBackdrop.classList.add("hidden");
    } else {
        hunterBody.classList.remove("sidebar-collapsed");
        if (hunterSidebar) hunterSidebar.classList.remove("collapsed");
        if (hunterSidebarBackdrop) hunterSidebarBackdrop.classList.add("hidden");
    }
};

applyHunterSidebarMode();
window.addEventListener("resize", applyHunterSidebarMode);

const openHunterSidebar = () => {
    hunterBody.classList.remove("sidebar-collapsed");
    if (hunterSidebar) hunterSidebar.classList.remove("collapsed");
    if (hunterSidebarBackdrop) hunterSidebarBackdrop.classList.remove("hidden");
};

const closeHunterSidebar = () => {
    hunterBody.classList.add("sidebar-collapsed");
    if (hunterSidebar) hunterSidebar.classList.add("collapsed");
    if (hunterSidebarBackdrop) hunterSidebarBackdrop.classList.add("hidden");
};

if (hunterOpenSidebarBtn) hunterOpenSidebarBtn.addEventListener("click", openHunterSidebar);
if (hunterCloseSidebarBtn) hunterCloseSidebarBtn.addEventListener("click", closeHunterSidebar);
if (hunterSidebarBackdrop) hunterSidebarBackdrop.addEventListener("click", closeHunterSidebar);
if (hunterSidebarCloseInner) {
    hunterSidebarCloseInner.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeHunterSidebar();
    });
}
