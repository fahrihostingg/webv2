// GANTI 2 BARIS INI DENGAN PROJECT KAMU

const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
/*
const supabaseUrl = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';
*/
// SUPABASE CLIENT v1.9.0 - NEON GOD MODE

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// ROLE HIERARCHY: dev > admin > user
const ROLES = {
    DEV: 'dev',
    ADMIN: 'admin', 
    USER: 'user'
};

// GOD MODE GUARD - DEV MUTLAK
async function checkAuth(allowedRoles = []) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return { ok: false, msg: 'Sila login dulu', redirect: '/login.html' };

    const { data: profile, error } = await supabaseClient
 .from('profiles')
 .select('*')
 .eq('id', session.user.id)
 .single();

    if (error ||!profile) return { ok: false, msg: 'Profile tak jumpa', redirect: '/login.html' };

    // DEV IMMUNE - Tak boleh kena ban
    if (profile.role!== ROLES.DEV && (profile.is_banned || profile.status === 'banned')) {
        return { ok: false, msg: `Account banned: ${profile.ban_reason || 'No reason'}`, redirect: '/banned.html' };
    }

    // DEV = GOD MODE - Skip semua check
    if (profile.role === ROLES.DEV) {
        return { ok: true, profile, session, isGod: true };
    }

    // Check role untuk admin/user
    if (allowedRoles.length > 0 &&!allowedRoles.includes(profile.role)) {
        return { ok: false, msg: 'Access denied - Insufficient role', redirect: '/dashboard.html' };
    }

    return { ok: true, profile, session, isGod: false };
}

async function requireLogin() { return await checkAuth([]); }
async function requireAdmin() { return await checkAuth([ROLES.ADMIN, ROLES.DEV]); }
async function requireDev() { return await checkAuth([ROLES.DEV]); }

// PERMISSION CHECK - Admin tak boleh sentuh Dev
function canEditUser(currentProfile, targetProfile) {
    if (currentProfile.role === ROLES.DEV) return true; // Dev boleh edit semua
    if (currentProfile.role === ROLES.ADMIN && targetProfile.role === ROLES.DEV) return false; // Admin tak boleh sentuh Dev
    if (currentProfile.role === ROLES.ADMIN) return true;
    return false;
}

function canDeleteUser(currentProfile, targetProfile) {
    return canEditUser(currentProfile, targetProfile) && targetProfile.role!== ROLES.DEV;
}

// REALTIME SUBSCRIPTION
function subscribeToTable(table, callback) {
    return supabaseClient
 .channel(`${table}_changes`)
 .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
 .subscribe();
}

// TOAST SYSTEM v2
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️', god: '👑' };
    const colors = { 
        success: '#10b981', 
        error: '#ef4444', 
        info: '#3b82f6', 
        warning: '#f59e0b',
        god: '#ffd700'
    };
    
    toast.className = `toast ${type}`;
    toast.style.borderLeft = `4px solid ${colors[type]}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// THEME SYSTEM v2
function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = current === 'dark'? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`Tema ${newTheme === 'dark'? 'Gelap' : 'Terang'} activated`, 'info');
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark'? '☀️' : '🌙';
}

// FORMAT HELPERS
const formatCurrency = (num) => `Rp ${(parseFloat(num) || 0).toLocaleString('id-ID')}`;
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatNumber = (num) => (parseInt(num) || 0).toLocaleString('id-ID');

// INIT
document.addEventListener('DOMContentLoaded', initTheme);
