// GANTI 2 BARIS INI DENGAN PROJECT KAMU

const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
/*
const supabaseUrl = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
*/
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// VERSION CONFIG - UPDATE SINI JE
const APP_VERSION = 'v1.7.2';
const APP_NAME = 'Pahri Platform';

// Auto-inject version badge kat semua page
document.addEventListener('DOMContentLoaded', () => {
    updateVersionBadge();
});

function updateVersionBadge() {
    const badges = document.querySelectorAll('.version-badge');
    badges.forEach(badge => {
        badge.innerHTML = `<span class="dot"></span>${APP_VERSION}`;
    });
    
    // Update title kalau ada
    const titles = document.querySelectorAll('title');
    titles.forEach(t => {
        if (!t.textContent.includes(APP_VERSION)) {
            t.textContent = t.textContent.replace(/v\d+\.\d+\.\d+/, APP_VERSION);
        }
    });
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

    // CHECK MAINTENANCE MODE - DEV BYPASS
    const { data: settings } = await supabaseClient
     .from('system_settings')
     .select('maintenance_mode')
     .eq('id', 1)
     .single();

    if (settings && settings.maintenance_mode && profile.role!== 'dev') {
        return { ok: false, redirect: '/maintenance', msg: 'Website maintenance' };
    }

    // CHECK BANNED
    if (profile.is_banned) {
        return { ok: false, redirect: '/banned', msg: `Account BANNED: ${profile.banned_reason || 'No reason'}` };
    }

    if (profile.status === 'pending') {
        return { ok: false, redirect: '/login', msg: 'Akaun masih pending' };
    }

    if (profile.status === 'rejected') {
        return { ok: false, redirect: '/login', msg: 'Akaun ditolak' };
    }

    // DEV dapat akses semua
    if (requiredRole && profile.role!== requiredRole && profile.role!== 'dev') {
        return { ok: false, redirect: '/dashboard', msg: 'Takde akses' };
    }

    return { ok: true, profile: profile, session: session };
}
