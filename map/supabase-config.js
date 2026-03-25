(function(global) {
    'use strict';

    const existing = global.MANEATER_MAP_CONFIG || {};
    const hostname = global.location && global.location.hostname ? global.location.hostname : '';
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

    function trimSlashes(value = '') {
        return String(value).replace(/^\/+|\/+$/g, '');
    }

    function normalizeBasePath(value = '') {
        const trimmed = trimSlashes(value);
        return trimmed ? `/${trimmed}` : '';
    }

    function buildAbsoluteUrl(siteUrl, relativePath) {
        if (siteUrl) {
            const root = siteUrl.replace(/\/+$/, '');
            const suffix = trimSlashes(relativePath);
            return suffix ? `${root}/${suffix}` : root;
        }

        const href = global.location && global.location.href ? global.location.href : '/';
        return new URL(relativePath || '.', href).toString();
    }

    const APP_BASE_PATH = normalizeBasePath(
        existing.APP_BASE_PATH || (isLocalHost ? '' : '/rezbase')
    );
    const SITE_URL = (
        existing.SITE_URL || (
            isLocalHost
                ? `${global.location.protocol}//${global.location.host}`
                : 'https://rez102.github.io/rezbase'
        )
    ).replace(/\/+$/, '');

    global.MANEATER_MAP_CONFIG = {
        SUPABASE_URL: existing.SUPABASE_URL || 'https://ddieubjzcwfrwsleyrkk.supabase.co',
        SUPABASE_ANON_KEY: existing.SUPABASE_ANON_KEY || 'sb_publishable_bVVJuClhuTWUghT8C62kuw_Kh6mt31e',
        SITE_URL,
        APP_BASE_PATH,
        MAP_PAGE_PATH: existing.MAP_PAGE_PATH || 'map/map.html',
        buildAppUrl(relativePath = '') {
            return buildAbsoluteUrl(SITE_URL, relativePath);
        },
        buildMapPageUrl() {
            return buildAbsoluteUrl(SITE_URL, this.MAP_PAGE_PATH);
        }
    };
})(window);
