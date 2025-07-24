// main.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// === Konfigurasi Supabase ===
const supabaseUrl = 'https://vofqjygceblthhqbajqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZnFqeWdjZWJsdGhocWJhanFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzkxODgsImV4cCI6MjA2ODkxNTE4OH0.I9dT9PZPfmX6p7QSuYOIkP1TAvsobsxxlGpyGLxBzZc';
const supabase = createClient(supabaseUrl, supabaseKey);

// === Test koneksi ===
(async () => {
  const { data, error } = await supabase.from('categories').select('*').limit(1);
  if (error) {
    console.error('❌ Supabase error:', error.message);
  } else {
    console.log('✅ Supabase connected! Contoh data:', data);
  }
})();

// === Fungsi Currency ===
const currencySelect = document.getElementById('currencySelect');
function formatCurrency(amount) {
  const currency = localStorage.getItem('currency') || 'IDR';
  let symbol = 'Rp';
  let locale = 'id-ID';
  if (currency === 'USD') { symbol = '$'; locale = 'en-US'; }
  if (currency === 'EUR') { symbol = '€'; locale = 'de-DE'; }
  if (currency === 'GBP') { symbol = '£'; locale = 'en-GB'; }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount).replace(/[A-Z]{3}|IDR|USD|EUR|GBP/, symbol);
}

function setCurrency(currency) {
  localStorage.setItem('currency', currency);
  if (currencySelect) currencySelect.value = currency;
  updateDashboard(); updateTransactionsPage(); updateReportsPage();
}

if (currencySelect) {
  currencySelect.addEventListener('change', () => setCurrency(currencySelect.value));
  const saved = localStorage.getItem('currency');
  setCurrency(saved || 'IDR');
}

// === Placeholder Update Functions ===
function updateDashboard() {
  console.log('updateDashboard() dipanggil');
}
function updateTransactionsPage() {
  console.log('updateTransactionsPage() dipanggil');
}
function updateReportsPage() {
  console.log('updateReportsPage() dipanggil');
}

// === Login/Register ===
let currentUser = null;

const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login gagal:', error.message);
      alert('Login gagal: ' + error.message);
    } else {
      currentUser = data.user;
      console.log('✅ Login berhasil:', currentUser.email);
      alert('Login berhasil!');
      document.getElementById('authScreen').classList.add('hidden');
      document.getElementById('appContent').classList.remove('hidden');
      document.getElementById('userEmail').textContent = currentUser.email;
    }
  });
}

const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
  registerBtn.addEventListener('click', async () => {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Register gagal:', error.message);
      alert('Registrasi gagal: ' + error.message);
    } else {
      console.log('✅ Registrasi berhasil, silakan login');
      alert('Registrasi berhasil! Silakan login');
    }
  });
}

// === Logout ===
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    currentUser = null;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('appContent').classList.add('hidden');
    alert('Anda telah logout.');
  });
}

// === Autologin jika ada sesi ===
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appContent').classList.remove('hidden');
    document.getElementById('userEmail').textContent = currentUser.email;
    console.log('✅ Auto login:', currentUser.email);
  } else {
    console.log('🔒 Belum login');
  }
})();
