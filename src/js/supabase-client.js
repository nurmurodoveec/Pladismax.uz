import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Initialize Supabase client from CDN
export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helper functions
export async function signIn(phone, password) {
    return await supabaseClient.auth.signInWithPassword({ phone, password });
}

export async function signOut() {
    return await supabaseClient.auth.signOut();
}

export async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

export async function getCurrentProfile() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    return data;
}

export function onAuthStateChange(callback) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        (async () => {
            await callback(event, session);
        })();
    });
}
