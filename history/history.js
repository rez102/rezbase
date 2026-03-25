const historyData = [
    {
        date: "2026年3月25日",
        tag: "大型更新",
        title: "マップ機能を大幅更新",
        points: [
            "マップにDLCを含めたクエストなどのマップピンを追加しました。",
            "カスタムピン、ルート機能を追加しました。",
            "スマホでも快適に利用できるようUIを調節しました。",
            "その他細かな調整を行いました。"
        ]
    },
    {
        date: "2026年3月13日",
        tag: "機能追加",
        title: "マップ機能を追加",
        points: [
            "マップページを公開しました。",
            "収集要素・クエストを確認できるようになりました。"
        ]
    },
    {
        date: "2026年3月11日",
        tag: "機能追加",
        title: "装備機能を追加",
        points: [
            "装備一覧ページを公開しました。",
            "装備詳細を確認できるようになりました。"
        ]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    setupMobileSidebar();
    renderHistory();
});

function renderHistory() {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    const totalCount = document.getElementById("history-total-count");
    const lastDate = document.getElementById("history-last-date");

    if (totalCount) totalCount.textContent = String(historyData.length);
    if (lastDate) lastDate.textContent = historyData[0]?.date || "-";

    historyList.innerHTML = "";

    historyData.forEach(item => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const historyCard = document.createElement("article");
        historyCard.className = "history-card";

        const meta = document.createElement("div");
        meta.className = "history-meta";

        const dateElement = document.createElement("div");
        dateElement.className = "history-date";
        dateElement.textContent = item.date;
        meta.appendChild(dateElement);

        if (item.tag) {
            const tagElement = document.createElement("span");
            tagElement.className = "history-tag";
            tagElement.textContent = item.tag;
            meta.appendChild(tagElement);
        }

        historyCard.appendChild(meta);

        const titleElement = document.createElement("h2");
        titleElement.className = "history-title";
        titleElement.textContent = item.title || item.content || "更新";
        historyCard.appendChild(titleElement);

        if (Array.isArray(item.points) && item.points.length > 0) {
            const listElement = document.createElement("ul");
            listElement.className = "history-points";
            item.points.forEach(point => {
                const pointElement = document.createElement("li");
                pointElement.textContent = point;
                listElement.appendChild(pointElement);
            });
            historyCard.appendChild(listElement);
        } else {
            const contentElement = document.createElement("p");
            contentElement.className = "history-content";
            contentElement.textContent = item.content || "";
            historyCard.appendChild(contentElement);
        }

        historyItem.appendChild(historyCard);
        historyList.appendChild(historyItem);
    });
}

function setupMobileSidebar() {
    const body = document.body;
    const sidebar = document.querySelector(".sidebar");
    const openSidebarBtn = document.getElementById("main-sidebar-open");
    const closeSidebarBtn = document.getElementById("main-sidebar-close");
    const sidebarBackdrop = document.getElementById("sidebar-backdrop");
    const sidebarCloseInner = document.querySelector(".main-sidebar-close-inner");

    const applySidebarMode = () => {
        if (window.innerWidth <= 900) {
            body.classList.add("sidebar-collapsed");
            if (sidebar) sidebar.classList.add("collapsed");
            if (sidebarBackdrop) sidebarBackdrop.classList.add("hidden");
        } else {
            body.classList.remove("sidebar-collapsed");
            if (sidebar) sidebar.classList.remove("collapsed");
            if (sidebarBackdrop) sidebarBackdrop.classList.add("hidden");
        }
    };

    const openSidebar = () => {
        body.classList.remove("sidebar-collapsed");
        if (sidebar) sidebar.classList.remove("collapsed");
        if (sidebarBackdrop) sidebarBackdrop.classList.remove("hidden");
    };

    const closeSidebar = () => {
        body.classList.add("sidebar-collapsed");
        if (sidebar) sidebar.classList.add("collapsed");
        if (sidebarBackdrop) sidebarBackdrop.classList.add("hidden");
    };

    applySidebarMode();
    window.addEventListener("resize", applySidebarMode);
    if (openSidebarBtn) openSidebarBtn.addEventListener("click", openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeSidebar);
    if (sidebarCloseInner) {
        sidebarCloseInner.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
        });
    }
}
