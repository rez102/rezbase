// Persistence and auth helpers for the map page.

function createUserDataSnapshot() {
    syncAllCustomPinRecords();
    return {
        [USER_DATA_KEYS.obtainedPins]: [...state.obtainedPins],
        [USER_DATA_KEYS.customPins]: customPins.map(pin => ({
            id: pin.id,
            type: pin.type,
            title: getCustomPinTitle(pin),
            detail: pin.detail || '',
            lat: pin.lat,
            lng: pin.lng,
            map: pin.map || 'base',
            createdAt: pin.createdAt || new Date().toISOString(),
            updatedAt: pin.updatedAt || pin.createdAt || new Date().toISOString(),
            visibility: customPinVisibility.has(pin.id),
            obtained: customPinObtained.has(pin.id),
            userId: pin.userId ?? null
        })),
        [USER_DATA_KEYS.customPinObtained]: [...state.customPinObtained],
        [USER_DATA_KEYS.routes]: myRoutes,
        [USER_DATA_KEYS.pinnedRoutes]: [...pinnedRoutes],
        [USER_DATA_KEYS.preferences]: {
            overlay: state.overlay,
            activeSources: [...state.activeSources],
            activeAreas: [...state.activeAreas],
            activeBaseTypes: [...state.activeBaseTypes],
            activeDlcTypes: [...state.activeDlcTypes],
            showObtained: state.showObtained,
            showCustomPins: state.showCustomPins,
            customPinVisibility: [...state.customPinVisibility],
            customPinSortMode,
            sidebar: { ...state.sidebar },
            route: {
                view: state.route.view,
                activeTab: state.route.activeTab,
                currentId: state.route.current ? state.route.current.id : null
            }
        }
    };
}

function syncRouteMirrorState() {
    routes = JSON.parse(JSON.stringify(myRoutes));
}

function getNormalizedUserData(input = {}) {
    if (storageController && typeof storageController.normalizeUserMapData === 'function') {
        return storageController.normalizeUserMapData(input);
    }
    return input;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('map-toast-container');
    if (!container || !message) return;

    const toast = document.createElement('div');
    toast.className = `map-toast toast-${type}`.trim();
    toast.innerText = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));

    window.setTimeout(() => {
        toast.classList.remove('visible');
        window.setTimeout(() => toast.remove(), 220);
    }, 3200);
}

function sanitizeUrlMessage(value, maxLength = 300) {
    if (typeof value !== 'string') return '';
    return value
        .replace(/[\u0000-\u001F\u007F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
}

function handleCloudSaveError(error) {
    console.error('[cloud-save]', error);
    showToast('クラウド保存に失敗しました', 'error');
}

function queueUserDataSave({ immediate = false } = {}) {
    if (suppressPersistence || !storageController) {
        return Promise.resolve();
    }

    latestUserDataSnapshot = createUserDataSnapshot();
    storageController.saveLocalShadow(latestUserDataSnapshot).catch(error => {
        console.error('[save-local-shadow]', error);
    });

    if (pendingSaveTimer) {
        clearTimeout(pendingSaveTimer);
        pendingSaveTimer = null;
    }

    if (immediate) {
        return flushUserDataSave();
    }

    return new Promise(resolve => {
        pendingSaveTimer = window.setTimeout(() => {
            flushUserDataSave().finally(resolve);
        }, SAVE_DEBOUNCE_MS);
    });
}

function flushUserDataSave() {
    if (pendingSaveTimer) {
        clearTimeout(pendingSaveTimer);
        pendingSaveTimer = null;
    }

    if (suppressPersistence || !storageController) {
        return Promise.resolve();
    }

    const snapshot = latestUserDataSnapshot || createUserDataSnapshot();
    pendingSavePromise = pendingSavePromise.then(async () => {
        try {
            syncRouteMirrorState();
            await storageController.saveUserMapData(snapshot);
        } catch (error) {
            console.error('[save-user-data]', error);
        }
    });
    return pendingSavePromise;
}

function savePinnedRoutes() {
    return queueUserDataSave();
}

function saveMyRoutes() {
    syncRouteMirrorState();
    return queueUserDataSave();
}

function savePreferences() {
    return queueUserDataSave();
}

function updateAuthUi(user = currentAuthUser) {
    const badge = document.getElementById('auth-status-badge');
    const caption = document.getElementById('auth-sync-caption');
    const googleBtn = document.getElementById('auth-google-btn');
    const signOutBtn = document.getElementById('auth-signout-btn');
    if (!badge || !caption || !googleBtn || !signOutBtn) return;

    badge.classList.remove('auth-status-local', 'auth-status-google');

    if (!authManager || !authManager.isConfigured) {
        badge.classList.add('auth-status-local');
        badge.innerText = '未ログイン';
        caption.innerText = 'Supabase 未設定のため、この端末だけに保存されます';
        googleBtn.classList.remove('hidden');
        googleBtn.disabled = true;
        signOutBtn.classList.add('hidden');
        return;
    }

    googleBtn.disabled = false;

    if (!user) {
        badge.classList.add('auth-status-local');
        badge.innerText = '未ログイン';
        caption.innerText = 'この端末だけに保存されます';
        googleBtn.classList.remove('hidden');
        signOutBtn.classList.add('hidden');
        return;
    }

    googleBtn.classList.add('hidden');
    signOutBtn.classList.remove('hidden');

    badge.classList.add('auth-status-google');
    badge.innerText = 'Googleログイン中';
    caption.innerText = '同期中: Google アカウントでクラウド保存されています';
}

function showCloudMigrationModal() {
    const modal = document.getElementById('cloud-migration-modal');
    const keepBtn = document.getElementById('migration-keep-local-btn');
    const migrateBtn = document.getElementById('migration-to-cloud-btn');
    if (!modal || !keepBtn || !migrateBtn) {
        return Promise.resolve(false);
    }

    modal.classList.remove('hidden');

    return new Promise(resolve => {
        const cleanup = (result) => {
            modal.classList.add('hidden');
            keepBtn.replaceWith(keepBtn.cloneNode(true));
            migrateBtn.replaceWith(migrateBtn.cloneNode(true));
            resolve(result);
        };

        keepBtn.addEventListener('click', () => cleanup(false), { once: true });
        migrateBtn.addEventListener('click', () => cleanup(true), { once: true });
    });
}

function clearAuthCallbackQuery() {
    if (!window.history || !window.history.replaceState) return;
    const url = new URL(window.location.href);
    ['code', 'error', 'error_description', 'provider_token', 'refresh_token'].forEach(key => {
        url.searchParams.delete(key);
    });
    if (url.hash && /error=|access_token=|refresh_token=|type=/.test(url.hash)) {
        url.hash = '';
    }
    window.history.replaceState({}, document.title, url.toString());
}

function getMigrationCheckKey(user) {
    return user && user.id ? `maneater_migration_checked_${user.id}` : null;
}

function hasMigrationBeenChecked(user) {
    const key = getMigrationCheckKey(user);
    if (!key) {
        return false;
    }

    try {
        return window.localStorage.getItem(key) === '1';
    } catch (error) {
        return false;
    }
}

function markMigrationChecked(user) {
    const key = getMigrationCheckKey(user);
    if (!key) {
        return;
    }

    try {
        window.localStorage.setItem(key, '1');
    } catch (error) {
        // Ignore storage write failures and allow the prompt to reappear later.
    }
}

function showAuthCallbackErrorIfNeeded() {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const message = sanitizeUrlMessage(searchParams.get('error_description')
        || hashParams.get('error_description')
        || searchParams.get('error')
        || hashParams.get('error'));
    if (message) {
        showToast(message, 'error');
    }
}

function applyLoadedUserData(data) {
    const normalized = getNormalizedUserData(data || {});
    const migrated = migrateCollectibleReferencesInUserData(normalized);
    const normalizedData = migrated.data;
    pendingCollectibleIdMigrationSave = migrated.changed;
    const preferences = normalizedData.preferences || {};
    const activeSources = preferences.activeSources && preferences.activeSources.length
        ? preferences.activeSources
        : ['base', 'dlc'];
    const activeAreas = preferences.activeAreas && preferences.activeAreas.length
        ? preferences.activeAreas
        : ['all'];
    const baseTypes = preferences.activeBaseTypes && preferences.activeBaseTypes.length
        ? preferences.activeBaseTypes
        : DEFAULT_BASE_TYPES;
    const dlcTypes = preferences.activeDlcTypes && preferences.activeDlcTypes.length
        ? preferences.activeDlcTypes
        : DEFAULT_DLC_TYPES;

    suppressPersistence = true;
    try {
        setOverlay(normalizeOverlayMode(preferences.overlay || 'base'));
        setSources(activeSources);
        setActiveAreas(new Set(activeAreas));
        setActiveBaseTypes(new Set(baseTypes));
        setActiveDlcTypes(new Set(dlcTypes));
        setShowObtained(preferences.showObtained !== false);
        setShowCustomPins(preferences.showCustomPins !== false);
        setObtainedPinSet(new Set(normalizedData.obtainedPins || []));
        customPins = Array.isArray(normalizedData.customPins) ? JSON.parse(JSON.stringify(normalizedData.customPins)) : [];
        myRoutes = Array.isArray(normalizedData.routes) ? JSON.parse(JSON.stringify(normalizedData.routes)) : [];
        syncRouteMirrorState();
        pinnedRoutes = new Set(normalizedData.pinnedRoutes || []);
        setCustomPinObtainedSet(new Set(normalizedData.customPinObtained || []));
        const storedVisibility = preferences.customPinVisibility && preferences.customPinVisibility.length
            ? preferences.customPinVisibility
            : customPins.filter(pin => pin.visibility !== false).map(pin => pin.id);
        setCustomPinVisibilitySet(new Set(storedVisibility));
        customPinSortMode = preferences.customPinSortMode === 'name' ? 'name' : 'created';

        setSidebarCurrent(preferences.sidebar && preferences.sidebar.current ? preferences.sidebar.current : 'main');
        setSidebarLast(preferences.sidebar && preferences.sidebar.last ? preferences.sidebar.last : 'main');
        setRouteTab(preferences.route && preferences.route.activeTab === 'my' ? 'my' : 'trend');
        setRouteView('browse');
        setCurrentRoute(null);
        latestUserDataSnapshot = createUserDataSnapshot();
    } finally {
        suppressPersistence = false;
    }
}

async function persistCollectibleIdMigrationIfNeeded() {
    if (!pendingCollectibleIdMigrationSave || !storageController) {
        return;
    }

    pendingCollectibleIdMigrationSave = false;

    try {
        await queueUserDataSave({ immediate: true });
        showToast('旧ピンIDを固定IDへ移行しました', 'info');
    } catch (error) {
        console.error('[collectible-id-migration]', error);
    }
}

function syncUiFromLoadedData() {
    const customPinSortBtn = document.getElementById('custom-pin-sort-btn');
    const showObtainedCheck = document.getElementById('show-obtained-check');
    if (customPinSortBtn) {
        customPinSortBtn.innerText = customPinSortMode === 'created' ? '作成順' : '名前順';
    }
    if (showObtainedCheck) {
        showObtainedCheck.checked = showObtained;
    }
    document.querySelectorAll('.route-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === activeRouteTab);
    });

    suppressPersistence = true;
    try {
        setMapOverlay(state.overlay);
        loadCustomPins();
        renderMarkers();
        renderCustomPins();
        updateCustomPinCount();
        renderRouteList();
        syncAreaSelectionUi(getCurrentAreaId());
        refreshMapDisplay({ syncButtons: true, skipPersistence: true });
        updateAuthUi();
    } finally {
        suppressPersistence = false;
    }
}

async function initializePersistence() {
    authManager = window.createMapAuthManager(window.MANEATER_MAP_CONFIG || {});
    storageController = window.createMapStorageController({
        authManager,
        storageKeys: STORAGE_KEYS,
        onCloudError: handleCloudSaveError
    });

    await storageController.init();
    currentAuthUser = await authManager.getUser().catch(() => null);
    updateAuthUi(currentAuthUser);

    let loadedData = await storageController.loadUserMapData();
    if (currentAuthUser && !hasMigrationBeenChecked(currentAuthUser)) {
        const migrationResult = await storageController.migrateLocalToCloudIfNeeded({
            confirmOverwrite: showCloudMigrationModal
        });
        if (migrationResult.data) {
            loadedData = migrationResult.data;
        }
        if (migrationResult.status === 'migrated' || migrationResult.status === 'overwritten') {
            showToast('ローカルデータをクラウドへ反映しました', 'success');
        }
        markMigrationChecked(currentAuthUser);
    }

    applyLoadedUserData(loadedData);
    await persistCollectibleIdMigrationIfNeeded();
    showAuthCallbackErrorIfNeeded();
    clearAuthCallbackQuery();

    const subscriptionResult = authManager.onAuthStateChange((event, session) => {
        handleAuthStateChange(event, session);
    });
    authSubscription = subscriptionResult && subscriptionResult.data ? subscriptionResult.data.subscription : null;
}

async function handleAuthStateChange(event, session) {
    const nextUser = session ? session.user : await authManager.getUser().catch(() => null);
    const previousUserId = currentAuthUser ? currentAuthUser.id : null;
    const nextUserId = nextUser ? nextUser.id : null;

    if (previousUserId === nextUserId && event !== 'SIGNED_OUT') {
        updateAuthUi(nextUser);
        return;
    }

    currentAuthUser = nextUser;
    updateAuthUi(nextUser);

    try {
        await storageController.refreshAdapter();
        let loadedData = await storageController.loadUserMapData();

        if (nextUser && previousUserId !== nextUserId && !hasMigrationBeenChecked(nextUser)) {
            const migrationResult = await storageController.migrateLocalToCloudIfNeeded({
                confirmOverwrite: showCloudMigrationModal
            });
            if (migrationResult.data) {
                loadedData = migrationResult.data;
            }
            if (migrationResult.status === 'migrated' || migrationResult.status === 'overwritten') {
                showToast('ローカルデータをクラウドへ反映しました', 'success');
            }
            markMigrationChecked(nextUser);
        }

        applyLoadedUserData(loadedData);
        await persistCollectibleIdMigrationIfNeeded();
        if (isAppReady) {
            syncUiFromLoadedData();
        }
    } catch (error) {
        console.error('[auth-state-change]', error);
        showToast(error && error.message ? error.message : '認証状態の反映に失敗しました', 'error');
    }
}
