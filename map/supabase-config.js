(function(global) {
    'use strict';

    const existing = global.MANEATER_MAP_CONFIG || {};

    function trimSlashes(value = '') {
        return String(value).replace(/^\/+|\/+$/g, '');
    }

    function normalizeBasePath(value = '') {
        const trimmed = trimSlashes(value);
        return trimmed ? `/${trimmed}` : '';
    }

    function inferBasePath() {
        const pathname = global.location && global.location.pathname ? global.location.pathname : '/';
        const segments = pathname.split('/').filter(Boolean);
        const mapIndex = segments.lastIndexOf('map');

        if (mapIndex >= 0) {
            return normalizeBasePath(segments.slice(0, mapIndex).join('/'));
        }

        if (segments.length > 0 && /\.html?$/i.test(segments[segments.length - 1])) {
            segments.pop();
        }

        return normalizeBasePath(segments.join('/'));
    }

    function inferSiteUrl(basePath) {
        if (!global.location || !global.location.origin || global.location.origin === 'null') {
            return '';
        }
        return `${global.location.origin}${basePath}`;
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

    const APP_BASE_PATH = normalizeBasePath(existing.APP_BASE_PATH || '/rezbase');
    const SITE_URL = (existing.SITE_URL || 'https://rez102.github.io/rezbase').replace(/\/+$/, '');

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
