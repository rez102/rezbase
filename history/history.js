const historyData = [
    {
        date: "2026年3月13日",
        content: "マップ機能を追加しました。"
    },
    {
        date: "2026年3月11日",
        content: "装備機能を追加しました。"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    historyData.forEach(item => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const dateElement = document.createElement("div");
        dateElement.className = "history-date";
        dateElement.textContent = item.date;

        const contentElement = document.createElement("div");
        contentElement.className = "history-content";
        contentElement.textContent = item.content;

        historyItem.appendChild(dateElement);
        historyItem.appendChild(contentElement);
        historyList.appendChild(historyItem);
    });
});
