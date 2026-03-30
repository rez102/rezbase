// Popup builders for collectible and route-related markers.

function createPopupActionButton(label, className, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `popup-btn ${className}`.trim();
    button.innerText = label;
    button.addEventListener('click', handler);
    return button;
}

function buildCollectiblePopup(item, isObtained) {
    const popupContent = document.createElement('div');
    popupContent.className = 'custom-popup';

    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    title.innerText = item.name;

    const area = document.createElement('div');
    area.style.fontSize = '0.8rem';
    area.style.color = '#aaa';
    area.style.marginBottom = '10px';
    area.innerText = item.areaLabel;

    const actions = document.createElement('div');
    actions.className = 'popup-buttons';

    const obtainedBtn = createPopupActionButton(
        isObtained ? '✓ 取得済み' : '取得済みにする',
        isObtained ? 'obtained-toggle active' : 'obtained-toggle',
        () => toggleObtainedFromPopup(item.id)
    );
    const batchBtn = createPopupActionButton('一括表記', '', () => startBatchFromPopup());
    actions.append(obtainedBtn, batchBtn);
    popupContent.append(title, area, actions);
    return popupContent;
}

function buildCustomPinPopup(pin) {
    const popup = document.createElement('div');
    popup.className = 'custom-popup';

    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    title.innerText = getCustomPinTitle(pin);
    popup.appendChild(title);

    if (pin.detail) {
        const detail = document.createElement('div');
        detail.style.fontSize = '0.85rem';
        detail.style.color = '#ddd';
        detail.style.marginBottom = '6px';
        detail.innerText = pin.detail;
        popup.appendChild(detail);
    }

    const actions = document.createElement('div');
    actions.className = 'popup-buttons';
    const obtained = customPinObtained.has(pin.id);
    const obtainedBtn = createPopupActionButton(
        obtained ? '✓ 取得済み' : '取得済みにする',
        obtained ? 'obtained-toggle active' : 'obtained-toggle',
        () => toggleCustomPinObtained(pin.id)
    );
    const batchBtn = createPopupActionButton('一括表記', '', () => startBatchFromPopup());
    const deleteBtn = createPopupActionButton('削除', '', () => deleteCustomPin(pin.id));
    actions.append(obtainedBtn, batchBtn, deleteBtn);
    popup.appendChild(actions);

    return popup;
}

function buildRouteScopedCustomPinPopup(pin) {
    const popup = document.createElement('div');
    popup.className = 'custom-popup';

    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    title.innerText = getCustomPinTitle(pin);
    popup.appendChild(title);

    if (pin.detail) {
        const detail = document.createElement('div');
        detail.style.fontSize = '0.85rem';
        detail.style.color = '#ddd';
        detail.style.marginBottom = '6px';
        detail.innerText = pin.detail;
        popup.appendChild(detail);
    }

    const note = document.createElement('div');
    note.style.fontSize = '0.75rem';
    note.style.color = '#9fb0c9';
    note.innerText = 'このピンはルート閲覧中のみ表示されます';
    popup.appendChild(note);

    return popup;
}
