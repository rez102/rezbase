// DOM event binding for the map page.

function promptUnsavedChanges(onConfirm) {
    if (currentRouteView !== 'create' || !routeIsModified) {
        onConfirm();
        return;
    }

    const modal = document.getElementById('route-exit-alert-modal');
    if (!modal) {
        onConfirm();
        return;
    }
    modal.classList.remove('hidden');

    const okBtn = document.getElementById('alert-ok-btn');
    const cancelBtn = document.getElementById('alert-cancel-btn');

    const newOk = okBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    newOk.addEventListener('click', () => {
        modal.classList.add('hidden');
        onConfirm();
    });

    newCancel.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}

function confirmLeaveIfUnsaved(targetHref) {
    if (currentRouteView !== 'create' || !routeIsModified) {
        window.location.href = targetHref;
        return;
    }
    promptUnsavedChanges(() => {
        window.location.href = targetHref;
    });
}

function setupEventListeners() {
    const mapSidebar = document.getElementById('map-sidebar');
    const routeFilterPanelRoot = document.getElementById('route-filter-panel');
    const areaOverlay = document.getElementById('area-overlay');
    const routeAreaTree = document.getElementById('route-area-tree');
    const customPinIconGrid = document.getElementById('custom-pin-icon-grid');

    const handleFilterButtonClick = (event) => {
        const button = event.target.closest('.filter-type-btn[data-type]');
        if (!button) return;
        const type = button.dataset.type;
        const source = button.dataset.source;
        toggleTypeFilter(type, source);
        refreshMapDisplay({ syncButtons: true });
    };

    if (mapSidebar) {
        mapSidebar.addEventListener('click', (event) => {
            const areaCard = event.target.closest('.area-card[data-area-id]');
            if (areaCard) {
                selectArea(areaCard.dataset.areaId);
                if (areaOverlay) areaOverlay.classList.add('hidden');
                if (window.innerWidth <= 900) {
                    closeMobileFilterPanel();
                }
                return;
            }

            const filterButton = event.target.closest('.filter-type-btn[data-type]');
            if (filterButton) {
                handleFilterButtonClick(event);
            }
        });
    }

    if (routeFilterPanelRoot) {
        routeFilterPanelRoot.addEventListener('click', handleFilterButtonClick);
    }

    if (routeAreaTree) {
        routeAreaTree.addEventListener('click', (event) => {
            const areaButton = event.target.closest('.route-area-item[data-area-id]');
            if (!areaButton) return;
            selectArea(areaButton.dataset.areaId);
            closeRouteCreatePanels();
        });
    }

    if (customPinIconGrid) {
        customPinIconGrid.addEventListener('click', (event) => {
            const iconButton = event.target.closest('.custom-pin-icon-btn[data-icon-type]');
            if (!iconButton) return;
            setCustomPinIconSelection(iconButton.dataset.iconType);
        });
    }

    document.querySelectorAll('.section-master-toggle').forEach(master => {
        master.addEventListener('change', () => {
            const section = master.dataset.section;
            if (section === 'custom-pins') {
                setShowCustomPins(master.checked);
                setCustomPinVisibilitySet(master.checked ? new Set(customPins.map(p => p.id)) : new Set());
                renderCustomPinList();
                refreshMapDisplay();
                return;
            }
            const group = document.querySelector(`[data-section-group="${section}"]`);
            if (!group) return;
            const buttons = [...group.querySelectorAll('.filter-type-btn')];
            buttons.forEach(btn => {
                const t = btn.dataset.type;
                const source = btn.dataset.source;
                setTypeActiveState(t, source || 'base', master.checked);
                if (!source) {
                    const pinMeta = getPinMeta(t);
                    (pinMeta.sources || ['base']).forEach(src => setTypeActiveState(t, src, master.checked));
                }
            });
            refreshMapDisplay({ syncButtons: true });
        });
    });

    const customPinSaveBtn = document.getElementById('custom-pin-save-btn');
    const customPinCancelBtn = document.getElementById('custom-pin-cancel-btn');
    const customPinCloseBtn = document.getElementById('custom-pin-close-btn');
    const mobilePinPlaceOkBtn = document.getElementById('mobile-pin-place-ok');
    const mobilePinPlaceCloseBtn = document.getElementById('mobile-pin-place-close');
    const mobilePinPlaceLayer = document.getElementById('mobile-pin-place-layer');

    if (customPinSaveBtn) {
        customPinSaveBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('custom-pin-name');
            const name = nameInput ? nameInput.value.trim() : '';
            const detailInput = document.getElementById('custom-pin-detail');
            const detail = detailInput ? detailInput.value.trim() : '';
            if (!customPinDraft) {
                showToast('マップ上をクリックして座標を選んでください。', 'error');
                return;
            }
            const customPinValidationError = validateCustomPinInput({
                title: name,
                detail
            });
            if (customPinValidationError) {
                showToast(customPinValidationError, 'error');
                return;
            }
            const now = new Date().toISOString();
            const newPin = {
                id: Date.now().toString(),
                name,
                title: name,
                lat: customPinDraft.lat,
                lng: customPinDraft.lng,
                type: customPinSelectedType,
                map: mapOverlayMode,
                createdAt: now,
                updatedAt: now,
                visibility: true,
                obtained: false,
                userId: null,
                detail
            };
            customPins.push(newPin);
            customPinById.set(newPin.id, newPin);
            customPinVisibility.add(newPin.id);
            saveCustomPins();
            if (customPinDraftMarker) {
                customPinDraftMarker.remove();
                customPinDraftMarker = null;
            }
            addCustomPinMarker(newPin);
            updateCustomPinCount();
            renderCustomPinList();
            toggleCustomPinSidebar(false);
            refreshMapDisplay();
        });
    }

    if (customPinCancelBtn) {
        customPinCancelBtn.addEventListener('click', () => {
            toggleCustomPinSidebar(false);
        });
    }

    if (customPinCloseBtn) {
        customPinCloseBtn.addEventListener('click', () => {
            toggleCustomPinSidebar(false);
        });
    }

    if (mobilePinPlaceOkBtn) {
        mobilePinPlaceOkBtn.addEventListener('click', () => {
            const center = map.getCenter();
            setCustomPinDraft(center);
            mobileCustomPinPlacementMode = false;
            customPinMode = false;
            if (mobilePinPlaceLayer) mobilePinPlaceLayer.classList.add('hidden');
            toggleCustomPinSidebar(true);
        });
    }

    if (mobilePinPlaceCloseBtn) {
        mobilePinPlaceCloseBtn.addEventListener('click', () => {
            mobileCustomPinPlacementMode = false;
            customPinMode = false;
            customPinDraft = null;
            if (mobilePinPlaceLayer) mobilePinPlaceLayer.classList.add('hidden');
        });
    }

    const pinBulkCloseBtn = document.getElementById('pin-bulk-close-btn');
    if (pinBulkCloseBtn) {
        pinBulkCloseBtn.addEventListener('click', () => {
            togglePinBulkSidebar(false);
        });
    }

    const customPinDetailInput = document.getElementById('custom-pin-detail');
    if (customPinDetailInput) {
        customPinDetailInput.addEventListener('input', () => {
            const count = document.getElementById('custom-pin-detail-count');
            if (count) count.innerText = customPinDetailInput.value.length;
        });
    }

    const areaHeaderBtn = document.getElementById('area-header-btn');
    const closeAreaBtn = document.getElementById('close-area-overlay');

    if (areaHeaderBtn) {
        areaHeaderBtn.addEventListener('click', () => {
            areaOverlay.classList.remove('hidden');
        });
    }

    if (closeAreaBtn) {
        closeAreaBtn.addEventListener('click', () => {
            areaOverlay.classList.add('hidden');
            if (window.innerWidth <= 900) {
                closeMobileFilterPanel();
            }
        });
    }

    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            setActiveBaseTypes(new Set(DEFAULT_BASE_TYPES));
            setActiveDlcTypes(new Set(DEFAULT_DLC_TYPES));
            setShowCustomPins(true);
            setCustomPinVisibilitySet(new Set(customPins.map(p => p.id)));
            setSources(['base', 'dlc']);
            selectArea('all');
            refreshMapDisplay({ syncButtons: true });
        });
    }

    const resetAllPinsBtn = document.getElementById('reset-all-pins-btn');
    if (resetAllPinsBtn) {
        resetAllPinsBtn.addEventListener('click', () => {
            if (confirm('全てのピンを未取得の状態に戻しますか？\nこの操作は取り消せません。')) {
                obtainedPins.clear();
                setCustomPinObtainedSet(new Set());
                syncAllCustomPinRecords();
                saveObtained();
                saveCustomPins();
                saveCustomPinObtained();
                markers.forEach(m => updateMarkerAppearance(m.marker, m.item.id));
                customPins.forEach(pin => updateCustomPinObtainedAppearance(pin.id));
                renderCustomPinList();
                refreshMapDisplay();
                alert('全てのピンをリセットしました。');
            }
        });
    }

    const routeIconBtn = document.getElementById('route-mode-btn');
    if (routeIconBtn) {
        routeIconBtn.addEventListener('click', () => {
            if (currentSidebar === 'route' && currentRouteView === 'create') {
                promptUnsavedChanges(() => toggleRouteSidebar(false, true));
            } else if (currentSidebar === 'route') {
                toggleRouteSidebar(false, true);
            } else {
                toggleRouteSidebar(true);
            }
        });
    }

    const closeRouteSidebarBtn = document.getElementById('close-route-sidebar-btn');
    if (closeRouteSidebarBtn) {
        closeRouteSidebarBtn.addEventListener('click', () => {
            promptUnsavedChanges(() => toggleRouteSidebar(false));
        });
    }

    document.querySelectorAll('.route-tab').forEach(btn => {
        btn.addEventListener('click', () => switchRouteTab(btn.dataset.tab));
    });

    const backBtn = document.getElementById('back-to-browse-btn');
    if (backBtn) {
        backBtn.addEventListener('click', backToBrowse);
    }

    const backFromCreateBtn = document.getElementById('back-from-create-btn');
    if (backFromCreateBtn) {
        backFromCreateBtn.addEventListener('click', () => {
            promptUnsavedChanges(() => exitCreateMode());
        });
    }

    const routeFilterBtn = document.getElementById('route-filter-btn');
    const routeAreaBtn = document.getElementById('route-area-btn');
    const routeFilterPanel = document.getElementById('route-filter-panel');
    const routeAreaPanel = document.getElementById('route-area-panel');
    const quickviewToggle = document.getElementById('route-quickview-toggle');
    const quickviewWrap = document.getElementById('route-quickview');
    const quickviewAllBtn = document.getElementById('route-quickview-all');

    if (routeFilterBtn && routeFilterPanel) {
        routeFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = routeFilterPanel.classList.contains('hidden');
            closeRouteCreatePanels();
            if (willOpen) {
                routeFilterPanel.classList.remove('hidden');
                routeFilterPanel.classList.add('active');
                routeFilterBtn.classList.add('active');
                updateRouteFilterPanelCounts();
            }
        });
    }

    if (routeAreaBtn && routeAreaPanel) {
        routeAreaBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = routeAreaPanel.classList.contains('hidden');
            closeRouteCreatePanels();
            if (willOpen) {
                routeAreaPanel.classList.remove('hidden');
                routeAreaPanel.classList.add('active');
                routeAreaBtn.classList.add('active');
            }
        });
    }

    if (quickviewToggle && quickviewWrap) {
        quickviewToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            quickviewWrap.classList.toggle('collapsed');
        });
    }

    if (quickviewAllBtn) {
        quickviewAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setActiveBaseTypes(new Set(DEFAULT_BASE_TYPES));
            setActiveDlcTypes(new Set(DEFAULT_DLC_TYPES));
            refreshMapDisplay({ syncButtons: true });
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#route-create-actions')) {
            closeRouteCreatePanels();
        }
    });

    document.querySelectorAll('.sidebar a[href]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href) return;
            if (currentRouteView === 'create' && routeIsModified) {
                e.preventDefault();
                confirmLeaveIfUnsaved(href);
            }
        });
    });

    const routeSearchInput = document.getElementById('route-search-input');
    if (routeSearchInput) {
        routeSearchInput.addEventListener('input', () => renderRouteList());
    }

    const startCreateBtn = document.getElementById('start-create-route-btn');
    if (startCreateBtn) {
        startCreateBtn.addEventListener('click', () => enterCreateMode());
    }

    const editRouteBtn = document.getElementById('edit-route-btn');
    if (editRouteBtn) {
        editRouteBtn.addEventListener('click', () => startEditingRoute());
    }

    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', () => addSection());
    }

    const saveRouteBtn = document.getElementById('save-route-btn');
    if (saveRouteBtn) {
        saveRouteBtn.addEventListener('click', () => saveMyRoute());
    }

    const routeNameInput = document.getElementById('route-name-input');
    if (routeNameInput) {
        routeNameInput.addEventListener('input', () => {
            creatingRoute.name = routeNameInput.value;
            routeIsModified = true;
        });
    }

    const routeDescInput = document.getElementById('route-desc-input');
    if (routeDescInput) {
        routeDescInput.addEventListener('input', () => {
            creatingRoute.description = routeDescInput.value;
            routeIsModified = true;
            document.getElementById('current-char-count').innerText = routeDescInput.value.length;
        });
    }

    const settingsBtn = document.getElementById('toggle-settings-btn');
    const settingsPopover = document.getElementById('settings-popover');
    const settingsPopoverCloseBtn = document.getElementById('settings-popover-close');
    const showObtainedCheck = document.getElementById('show-obtained-check');
    const showBaseCheck = document.getElementById('show-base-check');
    const showDlcCheck = document.getElementById('show-dlc-check');
    const showBaseOnlyBtn = document.getElementById('show-base-only-btn');
    const showDlcOnlyBtn = document.getElementById('show-dlc-only-btn');
    const showAllSourcesBtn = document.getElementById('show-all-sources-btn');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            settingsPopover.classList.toggle('hidden');
            settingsBtn.classList.toggle('active');
            e.stopPropagation();
        });
    }

    if (settingsPopoverCloseBtn) {
        settingsPopoverCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (settingsPopover) settingsPopover.classList.add('hidden');
            if (settingsBtn) settingsBtn.classList.remove('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (settingsPopover && !settingsPopover.contains(e.target) && e.target !== settingsBtn) {
            settingsPopover.classList.add('hidden');
            if (settingsBtn) settingsBtn.classList.remove('active');
        }
    });

    if (showObtainedCheck) {
        showObtainedCheck.checked = showObtained;
        showObtainedCheck.addEventListener('change', () => {
            setShowObtained(showObtainedCheck.checked);
            refreshMapDisplay();
        });
    }

    if (showBaseCheck) {
        showBaseCheck.checked = activeSources.has('base');
        showBaseCheck.addEventListener('change', () => {
            if (showBaseCheck.checked) activeSources.add('base');
            else activeSources.delete('base');
            refreshMapDisplay();
        });
    }

    if (showDlcCheck) {
        showDlcCheck.checked = activeSources.has('dlc');
        showDlcCheck.addEventListener('change', () => {
            if (showDlcCheck.checked) activeSources.add('dlc');
            else activeSources.delete('dlc');
            refreshMapDisplay();
        });
    }

    if (showBaseOnlyBtn) {
        showBaseOnlyBtn.addEventListener('click', () => {
            setSources(['base']);
            if (showBaseCheck) showBaseCheck.checked = true;
            if (showDlcCheck) showDlcCheck.checked = false;
            refreshMapDisplay();
        });
    }

    if (showDlcOnlyBtn) {
        showDlcOnlyBtn.addEventListener('click', () => {
            setSources(['dlc']);
            if (showBaseCheck) showBaseCheck.checked = false;
            if (showDlcCheck) showDlcCheck.checked = true;
            refreshMapDisplay();
        });
    }

    if (showAllSourcesBtn) {
        showAllSourcesBtn.addEventListener('click', () => {
            setSources(['base', 'dlc']);
            if (showBaseCheck) showBaseCheck.checked = true;
            if (showDlcCheck) showDlcCheck.checked = true;
            refreshMapDisplay();
        });
    }

    const mapOverlayBaseBtn = document.getElementById('map-overlay-base-btn');
    const mapOverlayDlcBtn = document.getElementById('map-overlay-dlc-btn');
    const routeMapBaseBtn = document.getElementById('route-map-base-btn');
    const routeMapDlcBtn = document.getElementById('route-map-dlc-btn');
    if (mapOverlayBaseBtn) {
        mapOverlayBaseBtn.addEventListener('click', () => {
            setActiveAreas(new Set(['all']));
            syncAreaSelectionUi('all');
            setMapOverlay('base');
        });
    }

    const detailUnmarkAllBtn = document.getElementById('detail-unmark-all-btn');
    if (detailUnmarkAllBtn) {
        detailUnmarkAllBtn.addEventListener('click', () => {
            if (!currentDetailedRoute) return;
            const pinIds = [];
            currentDetailedRoute.sections.forEach(section => {
                if (section && Array.isArray(section.pins)) pinIds.push(...section.pins);
            });
            if (pinIds.length === 0) return;
            batchMarkSection(pinIds, false, currentDetailedRoute);
        });
    }

    const detailMarkAllBtn = document.getElementById('detail-mark-all-btn');
    if (detailMarkAllBtn) {
        detailMarkAllBtn.addEventListener('click', () => {
            if (!currentDetailedRoute) return;
            const pinIds = [];
            currentDetailedRoute.sections.forEach(section => {
                if (section && Array.isArray(section.pins)) pinIds.push(...section.pins);
            });
            if (pinIds.length === 0) return;
            batchMarkSection(pinIds, true, currentDetailedRoute);
        });
    }
    if (mapOverlayDlcBtn) {
        mapOverlayDlcBtn.addEventListener('click', () => {
            setActiveAreas(new Set(['plover-island']));
            syncAreaSelectionUi('plover-island');
            setMapOverlay('dlc');
        });
    }
    if (routeMapBaseBtn) {
        routeMapBaseBtn.addEventListener('click', () => {
            setMapOverlay('base');
        });
    }
    if (routeMapDlcBtn) {
        routeMapDlcBtn.addEventListener('click', () => {
            setMapOverlay('dlc');
        });
    }

    setMapOverlay(mapOverlayMode);

    const batchCancelBtn = document.getElementById('batch-cancel-btn');
    if (batchCancelBtn) batchCancelBtn.addEventListener('click', () => setBatchMode(false));

    const batchOkBtn = document.getElementById('batch-ok-btn');
    if (batchOkBtn) {
        batchOkBtn.addEventListener('click', () => {
            setObtainedPinSet(new Set(batchObtainedPins));
            saveObtained();
            setCustomPinObtainedSet(new Set(batchCustomObtained));
            saveCustomPinObtained();
            setBatchMode(false);
            renderCustomPinList();
            refreshMapDisplay();
        });
    }

    const leftToggleBtn = document.getElementById('toggle-left-sidebar-btn');
    const closeLeftBtn = document.getElementById('close-left-sidebar-btn');
    if (leftToggleBtn) {
        leftToggleBtn.addEventListener('click', () => {
            const mainSidebar = document.getElementById('map-sidebar');
            const routeSidebar = document.getElementById('route-sidebar');
            leftToggleBtn.classList.add('hidden');
            if (closeLeftBtn) closeLeftBtn.classList.remove('hidden');
            if (lastSidebar === 'route') {
                setSidebarCurrent('route');
                routeSidebar.classList.remove('hidden');
                mainSidebar.classList.add('hidden');
            } else {
                setSidebarCurrent('main');
                mainSidebar.classList.remove('hidden');
                routeSidebar.classList.add('hidden');
            }
        });
    }
    if (closeLeftBtn) {
        closeLeftBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const mainSidebar = document.getElementById('map-sidebar');
            const routeSidebar = document.getElementById('route-sidebar');
            if (currentSidebar === 'route') {
                setSidebarLast('route');
                routeSidebar.classList.add('hidden');
            } else {
                setSidebarLast('main');
                mainSidebar.classList.add('hidden');
            }
            setSidebarCurrent('none');
            if (leftToggleBtn) leftToggleBtn.classList.remove('hidden');
            closeLeftBtn.classList.add('hidden');
        });
    }

    const mobileAreaSwitch = document.getElementById('mobile-area-switch');
    const mobileAreaName = document.getElementById('mobile-current-area');
    const areaHeaderBtn2 = document.getElementById('area-header-btn');
    const mobileFilterOpen = document.getElementById('mobile-filter-open');
    const mobileCustomPinOpen = document.getElementById('mobile-custom-pin-open');
    const mobileFilterClose = document.getElementById('mobile-filter-close');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const openMobileFilterPanel = () => {
        document.body.classList.add('mobile-filter-open');
        if (sidebarBackdrop && document.body.classList.contains('sidebar-collapsed')) {
            sidebarBackdrop.classList.remove('hidden');
        }
    };
    const closeMobileFilterPanel = () => {
        document.body.classList.remove('mobile-filter-open');
        if (sidebarBackdrop && document.body.classList.contains('sidebar-collapsed')) {
            sidebarBackdrop.classList.add('hidden');
        }
    };

    if (mobileAreaSwitch && areaHeaderBtn2) {
        mobileAreaSwitch.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                openMobileFilterPanel();
                if (areaOverlay) {
                    areaOverlay.classList.remove('hidden');
                }
                return;
            }
            areaHeaderBtn2.click();
        });
    }

    if (mobileAreaName) {
        const desktopAreaName = document.getElementById('current-area-name');
        if (desktopAreaName) mobileAreaName.innerText = desktopAreaName.innerText;
    }

    if (mobileFilterOpen) {
        mobileFilterOpen.addEventListener('click', () => {
            if (document.body.classList.contains('mobile-filter-open')) {
                closeMobileFilterPanel();
            } else {
                openMobileFilterPanel();
            }
        });
    }

    if (mobileCustomPinOpen) {
        mobileCustomPinOpen.addEventListener('click', () => {
            closeMobileFilterPanel();
            toggleCustomPinSidebar(true);
        });
    }

    if (mobileFilterClose) {
        mobileFilterClose.addEventListener('click', () => {
            closeMobileFilterPanel();
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => {
            closeMobileFilterPanel();
        });
    }

    document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('mobile-filter-open')) return;
        const sidebar = document.getElementById('map-sidebar');
        const clickedMobileAreaBar = !!e.target.closest('#mobile-area-bar');
        const clickedMobileFilterBar = !!e.target.closest('#mobile-filter-bar');
        if (
            sidebar &&
            !sidebar.contains(e.target) &&
            e.target !== mobileFilterOpen &&
            !clickedMobileAreaBar &&
            !clickedMobileFilterBar
        ) {
            closeMobileFilterPanel();
        }
    });

    const mainSidebar = document.querySelector('.sidebar');
    const mainOpenBtn = document.getElementById('main-sidebar-open');
    const mainCloseBtn = document.getElementById('main-sidebar-close');
    const mainCloseInner = document.querySelector('.main-sidebar-close-inner');
    const mainBackdrop = document.getElementById('sidebar-backdrop');
    const applySidebarMode = () => {
        if (window.innerWidth <= 900) {
            document.body.classList.add('sidebar-collapsed');
            if (mainSidebar) mainSidebar.classList.add('collapsed');
            if (mainBackdrop) mainBackdrop.classList.add('hidden');
        } else {
            document.body.classList.remove('sidebar-collapsed');
            document.body.classList.remove('mobile-filter-open');
            if (mainSidebar) mainSidebar.classList.remove('collapsed');
            if (mainBackdrop) mainBackdrop.classList.add('hidden');
        }
    };
    applySidebarMode();
    window.addEventListener('resize', applySidebarMode);
    const openMainSidebar = () => {
        document.body.classList.remove('sidebar-collapsed');
        if (mainSidebar) mainSidebar.classList.remove('collapsed');
        if (mainBackdrop) mainBackdrop.classList.remove('hidden');
    };
    const closeMainSidebar = () => {
        document.body.classList.add('sidebar-collapsed');
        document.body.classList.remove('mobile-filter-open');
        if (mainSidebar) mainSidebar.classList.add('collapsed');
        if (mainBackdrop) mainBackdrop.classList.add('hidden');
    };
    if (mainOpenBtn) mainOpenBtn.addEventListener('click', openMainSidebar);
    if (mainCloseBtn) mainCloseBtn.addEventListener('click', closeMainSidebar);
    if (mainCloseInner) {
        mainCloseInner.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMainSidebar();
        });
    }
    if (mainBackdrop) {
        mainBackdrop.addEventListener('click', closeMainSidebar);
    }

    const customPinSortBtn = document.getElementById('custom-pin-sort-btn');
    if (customPinSortBtn) {
        customPinSortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            customPinSortMode = customPinSortMode === 'created' ? 'name' : 'created';
            customPinSortBtn.innerText = customPinSortMode === 'created' ? '作成順' : '名前順';
            renderCustomPinList();
            savePreferences();
        });
    }

    const authGoogleBtn = document.getElementById('auth-google-btn');
    const authSignOutBtn = document.getElementById('auth-signout-btn');

    if (authGoogleBtn) {
        authGoogleBtn.addEventListener('click', async () => {
            if (!authManager || !authManager.isConfigured) {
                showToast('Supabase の設定が未完了です', 'error');
                return;
            }
            try {
                await flushUserDataSave();
                await authManager.signInWithGoogle();
            } catch (error) {
                console.error('[signInWithGoogle]', error);
                showToast(error && error.message ? error.message : 'Google ログインに失敗しました', 'error');
            }
        });
    }

    if (authSignOutBtn) {
        authSignOutBtn.addEventListener('click', async () => {
            if (!authManager) return;
            try {
                await flushUserDataSave();
                await authManager.signOut();
                showToast('ログアウトしました', 'success');
            } catch (error) {
                console.error('[signOut]', error);
                showToast(error && error.message ? error.message : 'ログアウトに失敗しました', 'error');
            }
        });
    }

    window.addEventListener('beforeunload', (e) => {
        if (currentRouteView === 'create' && routeIsModified) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}
