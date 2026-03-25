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
                    detectSessionInUrl: true,
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

        async function signInAnonymously() {
            const authClient = ensureClient();
            const { data, error } = await authClient.auth.signInAnonymously();
            if (error) throw error;
            return data;
        }

        async function signInWithGoogle() {
            const authClient = ensureClient();
            const redirectTo = typeof appConfig.buildMapPageUrl === 'function'
                ? appConfig.buildMapPageUrl()
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

        function resolveProvider(user) {
            if (!user) return null;
            if (user.is_anonymous) return 'anonymous';
            if (user.app_metadata && user.app_metadata.provider) {
                return user.app_metadata.provider;
            }
            if (Array.isArray(user.identities) && user.identities[0] && user.identities[0].provider) {
                return user.identities[0].provider;
            }
            return null;
        }

        function isAnonymousUser(user) {
            return resolveProvider(user) === 'anonymous';
        }

        function isPermanentUser(user) {
            return !!user && !isAnonymousUser(user);
        }

        return {
            isConfigured,
            getClient() {
                return client;
            },
            getSession,
            getUser,
            signInAnonymously,
            signInWithGoogle,
            signOut,
            onAuthStateChange,
            isAnonymousUser,
            isPermanentUser
        };
    }

    global.createMapAuthManager = createMapAuthManager;
})(window);
