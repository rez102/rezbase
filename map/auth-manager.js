(function(global) {
    'use strict';

    function createMapAuthManager(config) {
        const appConfig = config || global.MANEATER_MAP_CONFIG || {};
        const sdk = global.supabase;
        const isConfigured = !!(sdk && appConfig.SUPABASE_URL && appConfig.SUPABASE_ANON_KEY);
        const client = isConfigured
            ? sdk.createClient(appConfig.SUPABASE_URL, appConfig.SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: false,
                    flowType: 'pkce'
                }
            })
            : null;

        function ensureClient() {
            if (!client) {
                throw new Error('Supabase の設定が不足しているため認証を開始できません。');
            }
            return client;
        }

        async function getSession() {
            if (!client) return null;
            const { data, error } = await client.auth.getSession();
            if (error) throw error;
            return data.session || null;
        }

        async function getUser() {
            const session = await getSession();
            return session ? session.user : null;
        }

        async function signInWithGoogle() {
            const authClient = ensureClient();
            const redirectTo = typeof appConfig.buildCallbackPageUrl === 'function'
                ? appConfig.buildCallbackPageUrl()
                : global.location.href;
            const { data, error } = await authClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo
                }
            });
            if (error) throw error;
            return data;
        }

        async function signOut() {
            if (!client) return;
            const { error } = await client.auth.signOut();
            if (error) throw error;
        }

        function onAuthStateChange(callback) {
            if (!client) {
                return {
                    data: {
                        subscription: {
                            unsubscribe() {}
                        }
                    }
                };
            }
            return client.auth.onAuthStateChange((event, session) => {
                callback(event, session || null);
            });
        }

        return {
            isConfigured,
            getClient() {
                return client;
            },
            getSession,
            getUser,
            signInWithGoogle,
            signOut,
            onAuthStateChange
        };
    }

    global.createMapAuthManager = createMapAuthManager;
})(window);
