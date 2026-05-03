// GANTI 2 BARIS INI DENGAN PROJECT KAMU
/*
const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
*/
const supabaseUrl = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function initTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
    }
}

async function checkAuth(requiredRole = null) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        return { ok: false, redirect: '/login', msg: 'Sila login dulu' };
    }

    const { data: profile } = await supabaseClient
       .from('profiles')
       .select('*')
       .eq('id', session.user.id)
       .single();

    if (!profile) {
        return { ok: false, redirect: '/login', msg: 'Profile tak jumpa' };
    }

    if (profile.status === 'pending') {
        return { ok: false, redirect: '/login', msg: 'Akaun masih pending' };
    }

    if (profile.status === 'rejected') {
        return { ok: false, redirect: '/login', msg: 'Akaun ditolak' };
    }

    if (requiredRole && profile.role !== requiredRole && profile.role !== 'dev') {
        return { ok: false, redirect: '/dashboard', msg: 'Takde akses' };
    }

    return { ok: true, profile: profile, session: session };
}

if (typeof window !== 'undefined') {
    initTheme();
}
