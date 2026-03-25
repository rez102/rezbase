(function(global) {
    'use strict';

    const config = global.MANEATER_MAP_CONFIG || {};
    const sdk = global.supabase;
    const statusElement = global.document.getElementById('callback-status');
    const detailElement = global.document.getElementById('callback-detail');
    const REDIRECT_DELAY_MS = 1600;

    function setStatus(message, detail = '') {
        if (statusElement) {
            statusElement.textContent = message;
        }
        if (detailElement) {
            detailElement.textContent = detail;
        }
    }

    function getMapPageUrl() {
        if (typeof config.buildMapPageUrl === 'function') {
            return config.buildMapPageUrl();
        }
        return '../map/map.html';
    }

    function cleanupCallbackUrl() {
        if (!global.history || !global.history.replaceState) return;
        const cleanedUrl = new URL(global.location.href);
        [
            'code',
            'error',
            'error_description',
            'provider_token',
            'refresh_token',
            'access_token',
            'token_type',
            'expires_in',
            'expires_at',
            'type'
        ].forEach((key) => {
            cleanedUrl.searchParams.delete(key);
        });
        cleanedUrl.hash = '';
        global.history.replaceState({}, global.document.title, cleanedUrl.toString());
    }

    function redirectToMap(params = null, delayMs = 0) {
        const target = new URL(getMapPageUrl(), global.location.href);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) {
                    target.searchParams.set(key, value);
                }
            });
        }

        global.setTimeout(() => {
            global.location.replace(target.toString());
        }, delayMs);
    }

    function createSupabaseClient() {
        if (!sdk || typeof sdk.createClient !== 'function') {
            throw new Error('Supabase JS SDK の読み込みに失敗しました。');
        }
        if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
            throw new Error('Supabase の設定が不足しています。');
        }

        return sdk.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false,
                flowType: 'pkce'
            }
        });
    }

    function getCallbackCode() {
        const searchParams = new URLSearchParams(global.location.search);
        return searchParams.get('code');
    }

    function getCallbackErrorMessage() {
        const searchParams = new URLSearchParams(global.location.search);
        const hashParams = new URLSearchParams(global.location.hash.replace(/^#/, ''));
        return searchParams.get('error_description')
            || hashParams.get('error_description')
            || searchParams.get('error')
            || hashParams.get('error')
            || '';
    }

    async function handleAuthCallback() {
        setStatus('認証を確認しています...', '少しお待ちください');

        try {
            const callbackError = getCallbackErrorMessage();
            if (callbackError) {
                throw new Error(callbackError);
            }

            const code = getCallbackCode();
            if (!code) {
                cleanupCallbackUrl();
                setStatus('認証情報が見つかりませんでした', 'マップへ戻ります');
                redirectToMap(null, 600);
                return;
            }

            const client = createSupabaseClient();
            const { error } = await client.auth.exchangeCodeForSession(code);
            if (error) {
                throw error;
            }

            cleanupCallbackUrl();
            setStatus('認証が完了しました', 'マップへ移動します');
            redirectToMap();
        } catch (error) {
            cleanupCallbackUrl();
            const message = error && error.message
                ? error.message
                : '認証の処理に失敗しました。';
            setStatus('認証に失敗しました', message);
            redirectToMap({ error_description: message }, REDIRECT_DELAY_MS);
        }
    }

    global.addEventListener('DOMContentLoaded', () => {
        handleAuthCallback();
    });
})(window);
