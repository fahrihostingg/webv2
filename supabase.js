// GANTI 2 BARIS INI DENGAN PROJECT KAMU
/*
const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
*/
const supabaseUrl = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function checkAuth(requiredRole = null) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        return { ok: false, redirect: '/login', msg: 'Sila login dulu' };
    }

    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // FIX: Kalau profile takde, auto create pending
    if (!profile) {
        await supabaseClient.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            role: 'user',
            status: 'pending'
        });
        await supabaseClient.auth.signOut();
        return { ok: false, redirect: '/login', msg: 'Akaun baru, tunggu approve' };
    }

    if (profile.status === 'pending') {
        await supabaseClient.auth.signOut();
        return { ok: false, redirect: '/login', msg: 'Akaun pending. Tunggu admin approve.' };
    }

    if (profile.status === 'rejected') {
        await supabaseClient.auth.signOut();
        return { ok: false, redirect: '/login', msg: 'Akaun ditolak.' };
    }

    if (requiredRole && !['admin', 'dev'].includes(profile.role)) {
        return { ok: false, redirect: '/dashboard', msg: 'Access denied. Admin only.' };
    }

    return { ok: true, profile, user };
}
