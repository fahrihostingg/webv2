// GANTI 2 BARIS INI DENGAN PROJECT KAMU

const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
/*
const supabaseUrl = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
*/
// SUPABASE CLIENT v1.8.1 - DEV GOD MODE

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ROLE GUARD - DEV MUTLAK
async function checkAuth(allowedRoles = []) {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        return { ok: false, msg: 'Sila login dulu', redirect: '/login' };
    }

    const { data: profile, error } = await supabaseClient
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .single();

    if (error ||!profile) {
        return { ok: false, msg: 'Profile tak jumpa', redirect: '/login' };
    }

    // Dev immune dari ban
    if (profile.role !== 'dev' && (profile.is_banned || profile.status === 'banned')) {
        return { ok: false, msg: 'Account kena banned: ' + (profile.ban_reason || 'No reason'), redirect: '/banned' };
    }

    // Dev boleh masuk mana-mana - GOD MODE
    if (profile.role === 'dev') {
        return { ok: true, profile, session };
    }

    // Check role untuk admin/user
    if (allowedRoles.length > 0 &&!allowedRoles.includes(profile.role)) {
        return { ok: false, msg: 'Access denied', redirect: '/dashboard' };
    }

    return { ok: true, profile, session };
}

async function requireLogin() {
    return await checkAuth([]);
}

async function requireAdmin() {
    return await checkAuth(['admin', 'dev']);
}

async function requireDev() {
    return await checkAuth(['dev']);
}

// Helper: Check boleh edit user tak
function canEditUser(currentRole, targetRole) {
    if (currentRole === 'dev') return true;
    if (currentRole === 'admin' && targetRole === 'dev') return false;
    if (currentRole === 'admin') return true;
    return false;
}

// Toast helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Theme helper
function applyTheme() {
    const theme = localStorage.getItem('theme');
    const isDark = theme === 'dark';
    if (isDark) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.textContent = '🌙';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme();
    showToast(`Tema tukar ke ${newTheme === 'dark'? 'Gelap' : 'Terang'}!`, 'success');
}
