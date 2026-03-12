const historyData = [
    {
        date: "2026年3月11日",
        content: "サイトを公開しました。"
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
