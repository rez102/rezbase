function getHunterEntries() {
    return Object.entries(huntersData).sort(([, left], [, right]) => left.rank - right.rank);
}

function getHunterImagePath(hunter) {
    return `../images/hunters/${hunter.rank}.png`;
}

function createHunterCard(hunterId, hunter) {
    const card = document.createElement("a");
    card.className = "hunter-card";
    card.href = `hunter.html?id=${encodeURIComponent(hunterId)}`;

    const icon = document.createElement("div");
    icon.className = "hunter-card-icon";
    const image = document.createElement("img");
    image.className = "hunter-card-image";
    image.src = getHunterImagePath(hunter);
    image.alt = hunter.name;
    image.onerror = () => {
        image.remove();

        const badge = document.createElement("div");
        badge.className = "hunter-card-badge";
        badge.textContent = hunter.badge || `H${hunter.rank}`;
        icon.appendChild(badge);
    };
    icon.appendChild(image);

    const rank = document.createElement("p");
    rank.className = "hunter-card-rank";
    rank.textContent = `Rank ${hunter.rank}`;

    const name = document.createElement("h2");
    name.className = "hunter-card-name";
    name.textContent = hunter.name;

    const role = document.createElement("p");
    role.className = "hunter-card-role";
    role.textContent = hunter.role || "";

    card.append(icon, rank, name, role);
    return card;
}

function renderHunters() {
    const container = document.getElementById("hunters-container");
    if (!container) return;

    const entries = getHunterEntries();
    container.replaceChildren();

    if (!entries.length) {
        const empty = document.createElement("p");
        empty.className = "hunter-empty";
        empty.textContent = "ハンター情報がまだ登録されていません。";
        container.appendChild(empty);
        return;
    }

    entries.forEach(([hunterId, hunter]) => {
        container.appendChild(createHunterCard(hunterId, hunter));
    });

}

document.addEventListener("DOMContentLoaded", renderHunters);
