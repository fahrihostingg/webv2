// GANTI 2 BARIS INI DENGAN PROJECT KAMU
const SUPABASE_URL = 'https://gcjoxanfwnmdrphnfbjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjam94YW5md25tZHJwaG5mYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDUyMTUsImV4cCI6MjA5MzI4MTIxNX0.uuWhaeuPnvXKbmAv6zN825y2EKiaQ84k8-aDtZWMbsQ';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function showMessage(text, type) {
  const msg = document.getElementById('message')
  if (!msg) return
  msg.textContent = text
  msg.className = `message ${type}`
  msg.style.display = 'block'
  setTimeout(() => msg.style.display = 'none', 4000)
}

async function checkAuth(requiredRole = null) {
  const { data: { session } } = await supabaseClient.auth.getSession()
  if (!session) return { ok: false, redirect: '/login', msg: 'Sila login dulu' }

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('id, full_name, email, role, status')
    .eq('id', session.user.id)
    .single()

  if (!profile) return { ok: false, redirect: '/login', msg: 'Profile tak jumpa' }
  if (profile.status !== 'approved') return { ok: false, redirect: '/login', msg: 'Akaun belum approve' }
  if (requiredRole && profile.role !== requiredRole && profile.role !== 'dev') {
    return { ok: false, redirect: '/dashboard', msg: 'Admin je boleh masuk' }
  }

  return { ok: true, profile, session }
}
