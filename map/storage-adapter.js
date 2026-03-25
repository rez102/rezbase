(function(global) {
    'use strict';

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function uniqueArray(items) {
        return [...new Set(Array.isArray(items) ? items.filter(item => item !== null && item !== undefined) : [])];
    }

    function normalizeRouteList(routes) {
        return Array.isArray(routes) ? deepClone(routes) : [];
    }

    function normalizePreferences(input) {
        const preferences = input && typeof input === 'object' ? input : {};
        const sidebar = preferences.sidebar && typeof preferences.sidebar === 'object'
            ? { ...preferences.sidebar }
            : {};
        const route = preferences.route && typeof preferences.route === 'object'
            ? { ...preferences.route }
            : {};

        return {
            overlay: preferences.overlay === 'dlc' ? 'dlc' : 'base',
            activeSources: uniqueArray(preferences.activeSources && preferences.activeSources.length ? preferences.activeSources : ['base', 'dlc']),
            showObtained: preferences.showObtained !== false,
            showCustomPins: preferences.showCustomPins !== false,
            activeAreas: uniqueArray(preferences.activeAreas && preferences.activeAreas.length ? preferences.activeAreas : ['all']),
            activeBaseTypes: uniqueArray(preferences.activeBaseTypes),
            activeDlcTypes: uniqueArray(preferences.activeDlcTypes),
            customPinVisibility: uniqueArray(preferences.customPinVisibility),
            customPinSortMode: preferences.customPinSortMode === 'name' ? 'name' : 'created',
            sidebar,
            route
        };
    }

    function normalizeUserMapData(input) {
        const data = input && typeof input === 'object' ? input : {};
        const routes = normalizeRouteList(data.routes || data.myRoutes);
        return {
            obtainedPins: uniqueArray(data.obtainedPins),
            customPins: Array.isArray(data.customPins) ? deepClone(data.customPins) : [],
            customPinObtained: uniqueArray(data.customPinObtained),
            routes,
            pinnedRoutes: uniqueArray(data.pinnedRoutes),
            preferences: normalizePreferences(data.preferences),
            migratedFromLocal: !!data.migratedFromLocal,
            updatedAt: data.updatedAt || null,
            createdAt: data.createdAt || null
        };
    }

    function mergeUserMapData(baseData, partialData) {
        const base = normalizeUserMapData(baseData);
        const partial = normalizeUserMapData(partialData);
        return normalizeUserMapData({
            ...base,
            ...partial,
            preferences: {
                ...base.preferences,
                ...partial.preferences
            },
            migratedFromLocal: partialData && Object.prototype.hasOwnProperty.call(partialData, 'migratedFromLocal')
                ? !!partialData.migratedFromLocal
                : base.migratedFromLocal,
            updatedAt: partial.updatedAt || base.updatedAt,
            createdAt: partial.createdAt || base.createdAt
        });
    }

    function hasMeaningfulUserMapData(input) {
        const data = normalizeUserMapData(input);
        if (data.obtainedPins.length > 0) return true;
        if (data.customPins.length > 0) return true;
        if (data.customPinObtained.length > 0) return true;
        if (data.routes.length > 0) return true;
        if (data.pinnedRoutes.length > 0) return true;
        if (data.preferences.overlay !== 'base') return true;
        if (data.preferences.showObtained === false) return true;
        if (data.preferences.showCustomPins === false) return true;
        if (data.preferences.activeSources.length !== 2 || !data.preferences.activeSources.includes('base') || !data.preferences.activeSources.includes('dlc')) return true;
        if (data.preferences.activeAreas.length !== 1 || data.preferences.activeAreas[0] !== 'all') return true;
        if (data.preferences.activeBaseTypes.length > 0) return true;
        if (data.preferences.activeDlcTypes.length > 0) return true;
        if (data.preferences.customPinVisibility.length > 0) return true;
        if ((data.preferences.route && Object.keys(data.preferences.route).length > 0) || (data.preferences.sidebar && Object.keys(data.preferences.sidebar).length > 0)) return true;
        return false;
    }

    function createMapStorageController(options) {
        const authManager = options.authManager;
        const storageKeys = options.storageKeys;
        const onCloudError = typeof options.onCloudError === 'function' ? options.onCloudError : () => {};
        let activeMode = 'local';
        let lastLoadedData = normalizeUserMapData();

        function parseLocalJson(key, fallback) {
            try {
                const raw = global.localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (error) {
                return fallback;
            }
        }

        function writeLocalJson(key, value) {
            global.localStorage.setItem(key, JSON.stringify(value));
        }

        const localAdapter = {
            async loadUserMapData() {
                const preferences = parseLocalJson(storageKeys.preferences, {});
                const overlay = global.localStorage.getItem(storageKeys.overlay);
                const routes = parseLocalJson(storageKeys.routes, null);
                const legacyRoutes = parseLocalJson(storageKeys.myRoutes, []);

                return normalizeUserMapData({
                    obtainedPins: parseLocalJson(storageKeys.obtainedPins, []),
                    customPins: parseLocalJson(storageKeys.customPins, []),
                    customPinObtained: parseLocalJson(storageKeys.customPinObtained, []),
                    routes: routes || legacyRoutes,
                    pinnedRoutes: parseLocalJson(storageKeys.pinnedRoutes, []),
                    preferences: {
                        ...preferences,
                        overlay: preferences.overlay || overlay || 'base'
                    }
                });
            },
            async saveUserMapData(partialData) {
                const current = await this.loadUserMapData();
                const merged = mergeUserMapData(current, partialData);
                await this.replaceUserMapData(merged);
                return merged;
            },
            async replaceUserMapData(fullData) {
                const normalized = normalizeUserMapData(fullData);
                writeLocalJson(storageKeys.obtainedPins, normalized.obtainedPins);
                writeLocalJson(storageKeys.customPins, normalized.customPins);
                writeLocalJson(storageKeys.customPinObtained, normalized.customPinObtained);
                writeLocalJson(storageKeys.routes, normalized.routes);
                writeLocalJson(storageKeys.myRoutes, normalized.routes);
                writeLocalJson(storageKeys.pinnedRoutes, normalized.pinnedRoutes);
                writeLocalJson(storageKeys.preferences, normalized.preferences);
                global.localStorage.setItem(storageKeys.overlay, normalized.preferences.overlay);
                lastLoadedData = normalized;
                return normalized;
            },
            async exportLocalData() {
                return this.loadUserMapData();
            },
            async clearLocalData() {
                [
                    storageKeys.overlay,
                    storageKeys.obtainedPins,
                    storageKeys.customPins,
                    storageKeys.customPinObtained,
                    storageKeys.routes,
                    storageKeys.myRoutes,
                    storageKeys.pinnedRoutes,
                    storageKeys.preferences
                ].forEach(key => global.localStorage.removeItem(key));
            }
        };

        function mapCloudRecordToUserData(record) {
            if (!record) {
                return normalizeUserMapData();
            }
            return normalizeUserMapData({
                obtainedPins: record.obtained_pins,
                customPins: record.custom_pins,
                customPinObtained: record.custom_pin_obtained,
                routes: record.routes,
                pinnedRoutes: record.pinned_routes,
                preferences: record.preferences,
                migratedFromLocal: !!record.migrated_from_local,
                createdAt: record.created_at || null,
                updatedAt: record.updated_at || null
            });
        }

        async function getCloudUser() {
            const user = await authManager.getUser();
            if (!user) {
                throw new Error('クラウド保存にはログインが必要です。');
            }
            return user;
        }

        const supabaseAdapter = {
            async loadUserMapData() {
                const client = authManager.getClient();
                if (!client) return normalizeUserMapData();
                const user = await getCloudUser();
                const { data, error } = await client
                    .from('user_map_data')
                    .select('obtained_pins, custom_pins, custom_pin_obtained, routes, pinned_routes, preferences, migrated_from_local, created_at, updated_at')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (error) throw error;

                const normalized = mapCloudRecordToUserData(data || null);
                lastLoadedData = normalized;
                return normalized;
            },
            async saveUserMapData(partialData, extraOptions = {}) {
                const current = await this.loadUserMapData();
                const merged = mergeUserMapData(current, partialData);
                return this.replaceUserMapData(merged, extraOptions);
            },
            async replaceUserMapData(fullData, extraOptions = {}) {
                const client = authManager.getClient();
                if (!client) {
                    throw new Error('Supabase クライアントが初期化されていません。');
                }

                const user = await getCloudUser();
                const normalized = normalizeUserMapData(fullData);
                const payload = {
                    user_id: user.id,
                    obtained_pins: normalized.obtainedPins,
                    custom_pins: normalized.customPins,
                    custom_pin_obtained: normalized.customPinObtained,
                    routes: normalized.routes,
                    pinned_routes: normalized.pinnedRoutes,
                    preferences: normalized.preferences,
                    migrated_from_local: extraOptions.migratedFromLocal === true || normalized.migratedFromLocal === true,
                    updated_at: new Date().toISOString()
                };

                const { data, error } = await client
                    .from('user_map_data')
                    .upsert(payload, { onConflict: 'user_id' })
                    .select('obtained_pins, custom_pins, custom_pin_obtained, routes, pinned_routes, preferences, migrated_from_local, created_at, updated_at')
                    .single();

                if (error) throw error;

                const mapped = mapCloudRecordToUserData(data);
                lastLoadedData = mapped;
                return mapped;
            }
        };

        async function refreshAdapter() {
            const user = await authManager.getUser().catch(() => null);
            activeMode = user && authManager.isConfigured ? 'cloud' : 'local';
            return activeMode;
        }

        return {
            normalizeUserMapData,
            hasMeaningfulUserMapData,
            async init() {
                return refreshAdapter();
            },
            async refreshAdapter() {
                return refreshAdapter();
            },
            getActiveMode() {
                return activeMode;
            },
            isCloudActive() {
                return activeMode === 'cloud';
            },
            async loadUserMapData() {
                await refreshAdapter();
                const data = activeMode === 'cloud'
                    ? await supabaseAdapter.loadUserMapData()
                    : await localAdapter.loadUserMapData();
                lastLoadedData = normalizeUserMapData(data);
                return deepClone(lastLoadedData);
            },
            async saveUserMapData(partialData) {
                await refreshAdapter();
                const mergedShadow = mergeUserMapData(lastLoadedData, partialData);
                await localAdapter.replaceUserMapData(mergedShadow);

                if (activeMode !== 'cloud') {
                    lastLoadedData = mergedShadow;
                    return deepClone(lastLoadedData);
                }

                try {
                    const cloudData = await supabaseAdapter.saveUserMapData(partialData);
                    await localAdapter.replaceUserMapData(cloudData);
                    lastLoadedData = normalizeUserMapData(cloudData);
                    return deepClone(lastLoadedData);
                } catch (error) {
                    onCloudError(error);
                    lastLoadedData = mergedShadow;
                    throw error;
                }
            },
            async replaceUserMapData(fullData, extraOptions = {}) {
                await refreshAdapter();
                const normalized = normalizeUserMapData(fullData);
                await localAdapter.replaceUserMapData(normalized);

                if (activeMode !== 'cloud') {
                    lastLoadedData = normalized;
                    return deepClone(lastLoadedData);
                }

                try {
                    const cloudData = await supabaseAdapter.replaceUserMapData(normalized, extraOptions);
                    await localAdapter.replaceUserMapData(cloudData);
                    lastLoadedData = normalizeUserMapData(cloudData);
                    return deepClone(lastLoadedData);
                } catch (error) {
                    onCloudError(error);
                    lastLoadedData = normalized;
                    throw error;
                }
            },
            async exportLocalData() {
                return localAdapter.exportLocalData();
            },
            async clearLocalData() {
                return localAdapter.clearLocalData();
            },
            async saveLocalShadow(partialData) {
                const current = await localAdapter.loadUserMapData();
                const merged = mergeUserMapData(current, partialData);
                await localAdapter.replaceUserMapData(merged);
                lastLoadedData = merged;
                return deepClone(lastLoadedData);
            },
            async migrateLocalToCloudIfNeeded(options = {}) {
                await refreshAdapter();
                if (activeMode !== 'cloud') {
                    return { status: 'skipped', reason: 'not_authenticated' };
                }

                const localData = await localAdapter.loadUserMapData();
                if (!hasMeaningfulUserMapData(localData)) {
                    return { status: 'skipped', reason: 'no_local_data' };
                }

                const cloudData = await supabaseAdapter.loadUserMapData();
                if (!hasMeaningfulUserMapData(cloudData)) {
                    const migrated = await supabaseAdapter.replaceUserMapData(localData, { migratedFromLocal: true });
                    await localAdapter.replaceUserMapData(migrated);
                    lastLoadedData = normalizeUserMapData(migrated);
                    return { status: 'migrated', data: deepClone(lastLoadedData) };
                }

                let shouldOverwrite = false;
                if (typeof options.confirmOverwrite === 'function') {
                    shouldOverwrite = await options.confirmOverwrite({
                        localData: deepClone(localData),
                        cloudData: deepClone(cloudData)
                    });
                }

                if (!shouldOverwrite) {
                    lastLoadedData = normalizeUserMapData(cloudData);
                    return { status: 'kept_cloud', data: deepClone(lastLoadedData) };
                }

                const migrated = await supabaseAdapter.replaceUserMapData(localData, { migratedFromLocal: true });
                await localAdapter.replaceUserMapData(migrated);
                lastLoadedData = normalizeUserMapData(migrated);
                return { status: 'overwritten', data: deepClone(lastLoadedData) };
            }
        };
    }

    global.createMapStorageController = createMapStorageController;
})(window);
