const hunterParams = new URLSearchParams(window.location.search);
const hunterId = (hunterParams.get("id") || "").trim();
const hunterData = hunterId && Object.prototype.hasOwnProperty.call(huntersData, hunterId)
    ? huntersData[hunterId]
    : null;

function setText(id, value, fallback = "未設定") {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value || fallback;
}

function getHunterImagePath(hunter) {
    return `../images/hunters/${hunter.rank}.png`;
}

function renderHunterReward(reward) {
    const container = document.getElementById("hunter-reward");
    if (!container) return;

    container.replaceChildren();

    if (Array.isArray(reward) && reward.length) {
        reward.forEach((item) => {
            const rewardCard = document.createElement("div");
            rewardCard.className = "hunter-reward-item";

            if (item.image) {
                const image = document.createElement("img");
                image.className = "hunter-reward-image";
                image.src = item.image;
                image.alt = item.label || "報酬";
                rewardCard.appendChild(image);
            }

            const textWrap = document.createElement("div");
            textWrap.className = "hunter-reward-copy";

            const label = document.createElement("span");
            label.className = "hunter-reward-name";
            label.textContent = item.label || "報酬";
            textWrap.appendChild(label);

            if (item.amount) {
                const amount = document.createElement("span");
                amount.className = "hunter-reward-amount";
                amount.textContent = item.amount;
                textWrap.appendChild(amount);
            }

            rewardCard.appendChild(textWrap);
            container.appendChild(rewardCard);
        });
        return;
    }

    const text = document.createElement("p");
    text.className = "hunter-reward-text";
    text.textContent = reward || "未登録";
    container.appendChild(text);
}

if (hunterData) {
    document.title = `${hunterData.name} | 悪名ランクハンター`;
    setText("hunter-rank-label", `悪名ランク${hunterData.rank}`);
    setText("hunter-name", hunterData.name);
    setText("hunter-role", hunterData.role, "");
    setText("hunter-loadout", hunterData.loadout ? `船名: ${hunterData.loadout}` : "", "");
    setText("hunter-summary", hunterData.summary);
    renderHunterReward(hunterData.reward);
    setText("hunter-overview", hunterData.overview);

    const emblem = document.getElementById("hunter-emblem");
    if (emblem) {
        const image = document.createElement("img");
        image.className = "hunter-detail-image";
        image.src = getHunterImagePath(hunterData);
        image.alt = hunterData.name;
        image.onerror = () => {
            emblem.replaceChildren();
            emblem.textContent = hunterData.badge || `H${hunterData.rank}`;
        };

        emblem.replaceChildren(image);
    }
} else {
    document.title = "ハンターが見つかりません";
    setText("hunter-rank-label", "悪名ランク");
    setText("hunter-name", "ハンター情報が見つかりません");
    setText("hunter-role", "");
    setText("hunter-loadout", "");
    setText("hunter-summary", "URL の id に対応するハンターが未登録です。");
    renderHunterReward("未登録");
    setText("hunter-overview", "hunters-data.js に対象ハンターを追加すると表示されます。");

    const emblem = document.getElementById("hunter-emblem");
    if (emblem) {
        emblem.replaceChildren();
        emblem.textContent = "?";
    }
}
