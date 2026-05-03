// GANTI 2 BARIS INI DENGAN PROJECT KAMU
const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return null;

    // Check profile status
    const { data: profile } = await supabaseClient
       .from('profiles')
       .select('status, role')
       .eq('id', session.user.id)
       .single();

    if (!profile || profile.status!== 'approved') {
        await supabaseClient.auth.signOut();
        return null;
    }

    session.user.profile = profile;
    return session;
}

async function requireAuth() {
    const session = await checkAuth();
    if (!session) {
        window.location.replace('/login');
        return null;
    }
    return session.user;
}

async function requireGuest() {
    const session = await checkAuth();
    if (session) {
        window.location.replace('/dashboard');
        return true;
    }
    return false;
}

async function requireRole(roles) {
    const user = await requireAuth();
    if (!user) return null;

    if (!roles.includes(user.profile.role)) {
        window.location.replace('/dashboard');
        return null;
    }
    return user;
}

function showMessage(text, type) {
    const msg = document.getElementById('message');
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'message ' + type;
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 5000);
}

async function signOut() {
    await supabaseClient.auth.signOut();
    window.location.replace('/login');
}
