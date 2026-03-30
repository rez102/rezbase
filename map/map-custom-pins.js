function loadCustomPins() {
    try {
        const rawPins = Array.isArray(customPins) ? customPins : [];
        const normalizedPins = rawPins.map(pin => {
            const title = pin.title || pin.name || '無題';
            const createdAt = pin.createdAt || new Date().toISOString();
            return {
                ...pin,
                title,
                name: title,
                detail: pin.detail || '',
                map: normalizeOverlayMode(pin.map),
                createdAt,
                updatedAt: pin.updatedAt || createdAt,
                visibility: pin.visibility !== false,
                obtained: !!pin.obtained,
                userId: pin.userId ?? null
            };
        });
        customPins = normalizedPins;
        const visibleIds = normalizedPins.filter(pin => pin.visibility !== false).map(pin => pin.id);
        const obtainedIds = new Set([
            ...normalizedPins.filter(pin => pin.obtained).map(pin => pin.id),
            ...customPinObtained
        ]);
        setCustomPinVisibilitySet(new Set(visibleIds));
        setCustomPinObtainedSet(obtainedIds);
        syncAllCustomPinRecords();
    } catch (e) {
        customPins = [];
        setCustomPinVisibilitySet(new Set());
    }
}

function saveCustomPins() {
    return queueUserDataSave();
}

function renderCustomPins() {
    customPinMarkers.forEach(marker => marker.remove());
    customPinMarkers.clear();
    customPinById = new Map();
    if (customPins.length > 0 && customPinVisibility.size === 0) {
        setCustomPinVisibilitySet(new Set(customPins.map(pin => pin.id)));
    }
    const previousVisibility = new Set(customPinVisibility);
    setCustomPinVisibilitySet(new Set(
        customPins
            .filter(pin => previousVisibility.size === 0 || previousVisibility.has(pin.id))
            .map(pin => pin.id)
    ));
    customPins.forEach(pin => {
        if (previousVisibility.size !== 0 && !previousVisibility.has(pin.id)) {
            customPinVisibility.add(pin.id);
        }
    });
    customPins.forEach(pin => {
        customPinById.set(pin.id, pin);
        addCustomPinMarker(pin);
    });
    if (currentRouteView === 'create') {
        customPinMarkers.forEach(marker => {
            if (marker.getPopup()) {
                marker._tempPopup = marker.getPopup();
                marker.unbindPopup();
            }
        });
    }
    applyCustomPinVisibility();
    renderCustomPinList();
}

function addCustomPinMarker(pin) {
    const icon = getCustomPinIcon(pin.type);
    const marker = L.marker([pin.lat, pin.lng], { icon, customId: pin.id, customMap: pin.map });
    marker.on('click', (e) => {
        if (batchMode) {
            toggleCustomPinBatchSelection(pin.id, marker);
            L.DomEvent.stop(e);
        } else if (currentRouteView === 'create') {
            if (marker.getPopup()) marker.unbindPopup();
            addPinToRoute(pin.id);
            L.DomEvent.stop(e);
            return;
        }
    });
    marker.on('mouseover', () => {
        if (currentRouteView === 'create' && !batchMode) {
            showRouteHoverPreview(pin.id);
        }
    });
    marker.on('mouseout', () => {
        if (currentRouteView === 'create' && !batchMode) {
            clearRouteHoverPreview();
        }
    });
    const popup = buildCustomPinPopup(pin);
    if (currentRouteView !== 'create') {
        marker.bindPopup(popup, { autoPan: false });
    }
    marker.addTo(map);
    customPinMarkers.set(pin.id, marker);
    updateCustomPinObtainedAppearance(pin.id);
}

window.deleteCustomPin = function(id) {
    const marker = customPinMarkers.get(id);
    if (marker) marker.remove();
    customPinMarkers.delete(id);
    customPins = customPins.filter(p => p.id !== id);
    customPinVisibility.delete(id);
    customPinObtained.delete(id);
    saveCustomPins();
    saveCustomPinObtained();
    updateCustomPinCount();
    renderCustomPinList();
    refreshMapDisplay();
};

function saveCustomPinObtained() {
    return queueUserDataSave();
}

function updateCustomPinObtainedAppearance(id) {
    const marker = customPinMarkers.get(id);
    if (!marker) return;
    const el = marker.getElement();
    if (!el) {
        marker.on('add', () => updateCustomPinObtainedAppearance(id));
        return;
    }
    const obtained = batchMode ? batchCustomObtained.has(id) : customPinObtained.has(id);
    if (obtained) {
        el.classList.add('marker-obtained');
    } else {
        el.classList.remove('marker-obtained');
    }
}

function toggleCustomPinBatchSelection(id, marker) {
    if (batchCustomObtained.has(id)) {
        batchCustomObtained.delete(id);
    } else {
        batchCustomObtained.add(id);
    }
    updateCustomPinObtainedAppearance(id);
    updateBatchCount();
}

window.toggleCustomPinObtained = function(id) {
    if (customPinObtained.has(id)) {
        customPinObtained.delete(id);
    } else {
        customPinObtained.add(id);
    }
    syncCustomPinRecord(id);
    saveCustomPins();
    saveCustomPinObtained();
    updateCustomPinObtainedAppearance(id);
    renderCustomPinList();
    const marker = customPinMarkers.get(id);
    if (marker && marker.getPopup()) {
        const btn = marker.getPopup().getElement().querySelector('.obtained-toggle');
        if (btn) {
            btn.classList.toggle('active');
            btn.innerText = customPinObtained.has(id) ? '✓ 取得済み' : '取得済みにする';
        }
    }
    refreshMapDisplay({ updateCounts: true });
};

function applyCustomPinVisibility() {
    customPinMarkers.forEach(marker => {
        const id = marker.options && marker.options.customId;
        const pinData = id ? customPinById.get(id) : null;
        const mapValue = pinData ? pinData.map : (marker.options && marker.options.customMap);
        const mapOk = !mapValue || mapValue === mapOverlayMode;
        const obtainedOk = !id || showObtained || !customPinObtained.has(id);
        const pinVisible = showCustomPins && (!id || customPinVisibility.has(id)) && mapOk && obtainedOk;
        if (pinVisible) {
            if (!map.hasLayer(marker)) marker.addTo(map);
        } else if (map.hasLayer(marker)) {
            marker.remove();
        }
    });
}

function updateCustomPinCount() {
    const titleEl = document.getElementById('custom-pin-section-title');
    if (titleEl) titleEl.innerText = `新規マップピン (${customPins.length})`;
}

function getRoutePinMeta(pinId, route = null) {
    const collectible = getCollectibleById(pinId);
    if (collectible) {
        return {
            name: collectible.name,
            type: collectible.type,
            iconUrl: (icons[collectible.type] && icons[collectible.type].options && icons[collectible.type].options.iconUrl) || '',
            map: collectible.map,
            latlng: L.latLng(collectible.lat, collectible.lng)
        };
    }
    const routeCustomPin = getRouteScopedCustomPin(pinId, route);
    if (routeCustomPin) {
        return {
            name: getCustomPinTitle(routeCustomPin),
            type: routeCustomPin.type,
            isCustom: true,
            iconUrl: (icons[routeCustomPin.type] && icons[routeCustomPin.type].options && icons[routeCustomPin.type].options.iconUrl)
                || (customPinIcon.options && customPinIcon.options.iconUrl)
                || '',
            map: normalizeOverlayMode(routeCustomPin.map),
            latlng: L.latLng(routeCustomPin.lat, routeCustomPin.lng)
        };
    }
    const cpin = customPins.find(p => p.id === pinId);
    if (cpin) {
        return {
            name: getCustomPinTitle(cpin),
            type: cpin.type,
            isCustom: true,
            iconUrl: (icons[cpin.type] && icons[cpin.type].options && icons[cpin.type].options.iconUrl) || (customPinIcon.options && customPinIcon.options.iconUrl) || '',
            map: cpin.map || mapOverlayMode,
            latlng: L.latLng(cpin.lat, cpin.lng)
        };
    }
    return null;
}

function getRoutePinSummaryType(meta) {
    if (!meta || !meta.type) return null;
    return meta.isCustom ? 'custom' : meta.type;
}

function renderRouteScopedCustomPins(route) {
    routePreviewMarkers.forEach(marker => marker.remove());
    routePreviewMarkers = [];

    const routeCustomPins = getRouteCustomPins(route);
    if (routeCustomPins.length === 0) return;
    const referencedPinIds = new Set();
    if (route && Array.isArray(route.sections)) {
        route.sections.forEach(section => {
            if (!section || !Array.isArray(section.pins)) return;
            section.pins.forEach(pinId => referencedPinIds.add(pinId));
        });
    }

    const uniquePins = new Map();
    routeCustomPins.forEach(pin => {
        if (!pin || !pin.id) return;
        if (referencedPinIds.size > 0 && !referencedPinIds.has(pin.id)) return;
        uniquePins.set(pin.id, pin);
    });

    uniquePins.forEach(pin => {
        const pinMap = normalizeOverlayMode(pin.map);
        if (pinMap !== mapOverlayMode) return;
        if (isPersistedCustomPinVisible(pin.id)) return;

        const marker = L.marker([pin.lat, pin.lng], {
            icon: getCustomPinIcon(pin.type),
            routeCustomId: pin.id,
            customMap: pinMap
        });
        marker.bindPopup(buildRouteScopedCustomPinPopup(pin), { autoPan: false });
        marker.addTo(map);
        routePreviewMarkers.push(marker);
    });
}

function syncActiveRouteScopedCustomPins() {
    if (currentRouteView === 'detail' && currentDetailedRoute) {
        renderRouteScopedCustomPins(currentDetailedRoute);
        return;
    }
    if (currentRouteView === 'create' && creatingRoute) {
        renderRouteScopedCustomPins(creatingRoute);
        return;
    }
    routePreviewMarkers.forEach(marker => marker.remove());
    routePreviewMarkers = [];
}

function renderCustomPinList() {
    const list = document.getElementById('custom-pin-list');
    if (!list) return;
    list.innerHTML = '';
    const sortedPins = [...customPins];
    if (customPinSortMode === 'name') {
        sortedPins.sort((a, b) => getCustomPinTitle(a).localeCompare(getCustomPinTitle(b), 'ja'));
    }
    sortedPins.forEach(pin => {
        const btn = document.createElement('button');
        btn.className = 'filter-type-btn custom-pin-item';
        btn.dataset.customPinId = pin.id;
        btn.classList.toggle('active', customPinVisibility.has(pin.id));
        btn.classList.toggle('obtained', customPinObtained.has(pin.id));
        const iconUrl = (icons[pin.type] && icons[pin.type].options && icons[pin.type].options.iconUrl)
            ? icons[pin.type].options.iconUrl
            : '../images/map/新規マップピン.png';
        const name = getCustomPinTitle(pin);
        const iconWrap = document.createElement('div');
        iconWrap.className = 'icon-wrap';
        const img = document.createElement('img');
        img.src = iconUrl;
        img.alt = '';
        const obtained = document.createElement('span');
        obtained.className = 'custom-pin-obtained';
        obtained.innerText = '✓';
        iconWrap.append(img, obtained);

        const label = document.createElement('span');
        label.innerText = name;
        btn.append(iconWrap, label);
        btn.addEventListener('click', () => {
            if (customPinVisibility.has(pin.id)) {
                customPinVisibility.delete(pin.id);
            } else {
                customPinVisibility.add(pin.id);
            }
            syncCustomPinRecord(pin.id);
            saveCustomPins();
            btn.classList.toggle('active', customPinVisibility.has(pin.id));
            applyCustomPinVisibility();
            updateSectionMasterToggles();
            refreshMapDisplay({ updateCounts: false });
        });
        list.appendChild(btn);
    });
}

function toggleCustomPinSidebar(forceOpen = null) {
    const sidebar = document.getElementById('custom-pin-sidebar');
    if (!sidebar) return;
    const settingsPopover = document.getElementById('settings-popover');
    const settingsBtn = document.getElementById('toggle-settings-btn');
    const mobilePlaceLayer = document.getElementById('mobile-pin-place-layer');
    const isHidden = sidebar.classList.contains('hidden');
    const willOpen = forceOpen === null ? isHidden : forceOpen;
    const isMobile = window.innerWidth <= 900;

    const openMobilePlacementLayer = () => {
        if (!mobilePlaceLayer) return;
        mobilePlaceLayer.classList.remove('hidden');
        mobileCustomPinPlacementMode = true;
        customPinMode = true;
    };

    const closeMobilePlacementLayer = () => {
        if (!mobilePlaceLayer) return;
        mobilePlaceLayer.classList.add('hidden');
        mobileCustomPinPlacementMode = false;
    };

    if (willOpen) {
        // スマホはまず座標位置を選択してから詳細入力へ
        if (isMobile && !customPinDraft) {
            openMobilePlacementLayer();
            return;
        }
        // 他の右サイドバーを閉じる
        togglePinBulkSidebar(false);
        if (settingsPopover) settingsPopover.classList.add('hidden');
        if (settingsBtn) settingsBtn.classList.remove('active');
        sidebar.classList.remove('hidden');
        requestAnimationFrame(() => sidebar.classList.add('active'));
        if (isMobile) {
            customPinMode = false;
            mobileCustomPinPlacementMode = false;
            const mapEl = document.getElementById('map');
            if (mapEl) mapEl.style.cursor = '';
            setCustomPinIconSelection(customPinSelectedType);
        } else {
            enterCustomPinMode();
        }
    } else {
        sidebar.classList.remove('active');
        exitCustomPinMode();
        closeMobilePlacementLayer();
        setTimeout(() => {
            sidebar.classList.add('hidden');
        }, 250);
    }
}

function enterCustomPinMode() {
    customPinMode = true;
    mobileCustomPinPlacementMode = false;
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.style.cursor = 'crosshair';
    setCustomPinIconSelection(customPinSelectedType);
}

function exitCustomPinMode() {
    customPinMode = false;
    mobileCustomPinPlacementMode = false;
    customPinDraft = null;
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.style.cursor = '';
    if (customPinDraftMarker) {
        customPinDraftMarker.remove();
        customPinDraftMarker = null;
    }
    const nameInput = document.getElementById('custom-pin-name');
    if (nameInput) nameInput.value = '';
    const detailInput = document.getElementById('custom-pin-detail');
    if (detailInput) detailInput.value = '';
    const detailCount = document.getElementById('custom-pin-detail-count');
    if (detailCount) detailCount.innerText = '0';
    updateCustomPinCoords(null);
}

function updateCustomPinCoords(latlng) {
    const latEl = document.getElementById('custom-pin-lat');
    const lngEl = document.getElementById('custom-pin-lng');
    if (!latEl || !lngEl) return;
    if (!latlng) {
        latEl.innerText = '-';
        lngEl.innerText = '-';
        return;
    }
    latEl.innerText = latlng.lat.toFixed(2);
    lngEl.innerText = latlng.lng.toFixed(2);
}

function setCustomPinDraft(latlng) {
    customPinDraft = { lat: latlng.lat, lng: latlng.lng };
    updateCustomPinCoords(customPinDraft);
    if (customPinDraftMarker) {
        customPinDraftMarker.setLatLng([customPinDraft.lat, customPinDraft.lng]);
    } else {
        customPinDraftMarker = L.marker([customPinDraft.lat, customPinDraft.lng], {
            icon: getCustomPinIcon(customPinSelectedType),
            opacity: 0.7
        }).addTo(map);
    }
}

function setCustomPinIconSelection(type) {
    customPinSelectedType = type;
    document.querySelectorAll('.custom-pin-icon-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.iconType === type);
    });
    if (customPinDraftMarker) {
        customPinDraftMarker.setIcon(getCustomPinIcon(type));
    }
}

function getCustomPinIcon(type) {
    const pinMeta = getPinMeta(type);
    if (pinMeta.leaflet) {
        const { className, ...leafletMeta } = pinMeta.leaflet;
        return L.icon(leafletMeta);
    }
    return icons[type] || customPinIcon;
}
