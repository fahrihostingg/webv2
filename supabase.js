// GANTI 2 BARIS INI DENGAN PROJECT KAMU
/*
const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
*/
const supabaseUrl = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// CACHE untuk elak query berulang
let profileCache = null;
let cacheExpiry = 0;

async function checkAuth(requiredRole = null, useCache = true) {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        profileCache = null;
        return { ok: false, redirect: '/login', msg: 'Sila login dulu' };
    }

    // Guna cache kalau belum expired (5 minit)
    const now = Date.now();
    if (useCache && profileCache && profileCache.id === user.id && now < cacheExpiry) {
        const profile = profileCache;
        
        if (profile.status === 'pending') {
            return { ok: false, redirect: '/login', msg: 'Akaun pending.' };
        }
        if (profile.status === 'rejected') {
            return { ok: false, redirect: '/login', msg: 'Akaun ditolak.' };
        }
        if (requiredRole && !['admin', 'dev'].includes(profile.role)) {
            return { ok: false, redirect: '/dashboard', msg: 'Access denied.' };
        }
        return { ok: true, profile, user };
    }

    // Query sekali je, select column yang perlu je
    const { data: profile, error } = await supabaseClient
       .from('profiles')
       .select('id,email,full_name,role,status')
       .eq('id', user.id)
       .single();

    if (!profile || error) {
        await supabaseClient.auth.signOut();
        profileCache = null;
        return { ok: false, redirect: '/login', msg: 'Profile tak jumpa' };
    }

    // Cache 5 minit
    profileCache = profile;
    cacheExpiry = now + 300000; // 5 min

    if (profile.status === 'pending') {
        await supabaseClient.auth.signOut();
        profileCache = null;
        return { ok: false, redirect: '/login', msg: 'Akaun pending. Tunggu admin approve.' };
    }

    if (profile.status === 'rejected') {
        await supabaseClient.auth.signOut();
        profileCache = null;
        return { ok: false, redirect: '/login', msg: 'Akaun ditolak.' };
    }

    if (requiredRole && !['admin', 'dev'].includes(profile.role)) {
        return { ok: false, redirect: '/dashboard', msg: 'Access denied. Admin only.' };
    }

    return { ok: true, profile, user };
}

// Clear cache masa logout
function clearCache() {
    profileCache = null;
    cacheExpiry = 0;
}
