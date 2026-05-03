// GANTI 2 BARIS INI DENGAN PROJECT KAMU
const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

function showMessage(text, type) {
    const msg = document.getElementById('message');
    if (!msg) return alert(text);
    msg.textContent = text;
    msg.className = 'message ' + type;
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 3000);
}

// Helper: Check session & profile sekali jalan
async function checkAuth(requiredRole = null) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return { ok: false, redirect: '/login' };

  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error || !profile) return { ok: false, redirect: '/login' };
  if (profile.status !== 'approved') {
    await supabaseClient.auth.signOut();
    return { ok: false, redirect: '/login', msg: 'Akaun pending' };
  }
  if (requiredRole && profile.role !== 'dev' && profile.role !== 'admin') {
    return { ok: false, redirect: '/dashboard', msg: 'Takde akses' };
  }
  
  return { ok: true, profile, session };
}
