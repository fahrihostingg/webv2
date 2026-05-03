// GANTI 2 BARIS INI DENGAN PROJECT KAMU
const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return null;

    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('status, role')
      .eq('id', session.user.id)
      .single();

    if (error || !profile || profile.status !== 'approved') {
        await supabaseClient.auth.signOut();
        return null;
    }

    session.user.profile = profile;
    return session;
}

async function requireAuth() {
    const session = await checkAuth();
    if (!session) const SUPABASE_URL = 'https://tfqhznjxepgwmuzupnqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcWh6bmp4ZXBnd211enVwbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDQzNTgsImV4cCI6MjA2MTI4MDM1OH0.0rVy8dEIRFcxLuwN5-AADJDA6dzL1mA4YUqnG_aNsJ4';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
    setTimeout(() => msg.style.display = 'none', 4000);
}

// Force fetch fresh dari DB setiap kali
async function getProfile() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
    
  return data;
}
