// GANTI 2 BARIS INI DENGAN PROJECT KAMU
const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function showMessage(text, type) {
    const msg = document.getElementById('message');
    if (!msg) return alert(text);
    msg.textContent = text;
    msg.className = 'message ' + type;
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 3000);
}

async function getProfile() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseClient.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return data;
}
