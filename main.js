// main.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// === Konfigurasi Supabase ===

const supabase = createClient('https://vofqjygceblthhqbajqh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZnFqeWdjZWJsdGhocWJhanFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzkxODgsImV4cCI6MjA2ODkxNTE4OH0.I9dT9PZPfmX6p7QSuYOIkP1TAvsobsxxlGpyGLxBzZc');
let currentUser = null;


// === Test koneksi ===
(async () => {
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    if (error) {
      console.error('❌ Supabase error:', error.message);
    } else {
      console.log('✅ Supabase connected! Contoh data:', data);
    }
  })();
// === Toast Notification ===
function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = type === 'success' ? `<i class='fas fa-check-circle'></i> ${msg}` : `<i class='fas fa-exclamation-circle'></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// === Auth ===
async function checkAuthStatus() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
    document.getElementById('userEmail').textContent = currentUser.email;
    loadInitialData();
  } else {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('appSection').classList.add('hidden');
  }
}

async function handleLogin() {
  // ... validasi ...
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast('Login gagal: ' + error.message, 'error');
    return;
  }
  currentUser = data.user;
  showToast('Login berhasil!', 'success');
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('appSection').classList.remove('hidden');
  document.getElementById('userEmail').textContent = currentUser.email;
  loadInitialData();
}

async function handleRegister() {
  // ... validasi ...
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    showToast('Registrasi gagal: ' + error.message, 'error');
    return;
  }
  showToast('Registrasi berhasil! Silakan cek email konfirmasi.', 'success');
  document.getElementById('showLoginBtn').click();
}

async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('appSection').classList.add('hidden');
  showToast('Anda telah logout.', 'success');
}

// === Navigasi Sidebar ===
const dashboardBtn = document.getElementById('dashboardBtn');
const transactionsBtn = document.getElementById('transactionsBtn');
const categoriesBtn = document.getElementById('categoriesBtn');
const reportsBtn = document.getElementById('reportsBtn');
const settingsBtn = document.getElementById('settingsBtn');
const dashboardPage = document.getElementById('dashboardPage');
const transactionsPage = document.getElementById('transactionsPage');
const categoriesPage = document.getElementById('categoriesPage');
const reportsPage = document.getElementById('reportsPage');
const settingsPage = document.getElementById('settingsPage');
const pageTitle = document.getElementById('pageTitle');

function showPage(page) {
  dashboardPage.classList.add('hidden');
  transactionsPage.classList.add('hidden');
  categoriesPage.classList.add('hidden');
  reportsPage.classList.add('hidden');
  settingsPage.classList.add('hidden');
  dashboardBtn.classList.remove('bg-indigo-50', 'text-indigo-700');
  transactionsBtn.classList.remove('bg-indigo-50', 'text-indigo-700');
  categoriesBtn.classList.remove('bg-indigo-50', 'text-indigo-700');
  reportsBtn.classList.remove('bg-indigo-50', 'text-indigo-700');
  settingsBtn.classList.remove('bg-indigo-50', 'text-indigo-700');
  switch (page) {
    case 'dashboard':
      dashboardPage.classList.remove('hidden');
      pageTitle.textContent = 'Dashboard';
      dashboardBtn.classList.add('bg-indigo-50', 'text-indigo-700');
      break;
    case 'transactions':
      transactionsPage.classList.remove('hidden');
      pageTitle.textContent = 'Transactions';
      transactionsBtn.classList.add('bg-indigo-50', 'text-indigo-700');
      break;
    case 'categories':
      categoriesPage.classList.remove('hidden');
      pageTitle.textContent = 'Categories';
      categoriesBtn.classList.add('bg-indigo-50', 'text-indigo-700');
      break;
    case 'reports':
      reportsPage.classList.remove('hidden');
      pageTitle.textContent = 'Reports';
      reportsBtn.classList.add('bg-indigo-50', 'text-indigo-700');
      break;
    case 'settings':
      settingsPage.classList.remove('hidden');
      pageTitle.textContent = 'Settings';
      settingsBtn.classList.add('bg-indigo-50', 'text-indigo-700');
      break;
  }
}

if (dashboardBtn) dashboardBtn.addEventListener('click', () => showPage('dashboard'));
if (transactionsBtn) transactionsBtn.addEventListener('click', () => showPage('transactions'));
if (categoriesBtn) categoriesBtn.addEventListener('click', () => showPage('categories'));
if (reportsBtn) reportsBtn.addEventListener('click', () => showPage('reports'));
if (settingsBtn) settingsBtn.addEventListener('click', () => showPage('settings'));

// === Currency & Dark Mode ===
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
const darkModeToggle = document.getElementById('darkModeToggle');
function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark');
    localStorage.setItem('darkMode', '1');
    darkModeToggle.checked = true;
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('darkMode', '0');
    darkModeToggle.checked = false;
  }
}
if (darkModeToggle) {
  darkModeToggle.addEventListener('change', () => setDarkMode(darkModeToggle.checked));
  const saved = localStorage.getItem('darkMode');
  if (saved === '1') setDarkMode(true);
  else if (saved === '0') setDarkMode(false);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setDarkMode(true);
}

// === Backup & Restore ===
const backupDataBtn = document.getElementById('backupDataBtn');
if (backupDataBtn) backupDataBtn.addEventListener('click', backupData);
async function backupData() {
  if (!currentUser) return showToast('Anda harus login!', 'error');
  const { data: categories, error: catErr } = await supabase.from('categories').select('*').eq('user_id', currentUser.id);
  const { data: transactions, error: trxErr } = await supabase.from('transactions').select('*').eq('user_id', currentUser.id);
  if (catErr || trxErr) return showToast('Gagal backup data', 'error');
  const backup = { user: currentUser.email, exportedAt: new Date().toISOString(), categories, transactions };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rupiahtracker-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Backup berhasil diunduh!', 'success');
}
const restoreDataInput = document.getElementById('restoreDataInput');
if (restoreDataInput) restoreDataInput.addEventListener('change', restoreData);
async function restoreData(e) {
  if (!currentUser) return showToast('Anda harus login!', 'error');
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    if (!json.categories || !json.transactions) throw new Error('Format file tidak valid');
    if (!confirm('Restore akan menghapus semua data lama dan menggantinya dengan data dari file. Lanjutkan?')) return;
    await supabase.from('transactions').delete().eq('user_id', currentUser.id);
    await supabase.from('categories').delete().eq('user_id', currentUser.id);
    for (const cat of json.categories) {
      const { id, user_id, ...rest } = cat;
      await supabase.from('categories').insert([{ ...rest, user_id: currentUser.id }]);
    }
    for (const trx of json.transactions) {
      const { id, user_id, ...rest } = trx;
      await supabase.from('transactions').insert([{ ...rest, user_id: currentUser.id }]);
    }
    await loadCategories();
    await loadTransactions();
    updateDashboard();
    updateTransactionsPage();
    updateCategoriesPage();
    updateReportsPage();
    showToast('Restore data berhasil!', 'success');
  } catch (err) {
    showToast('Restore gagal: ' + err.message, 'error');
  }
  restoreDataInput.value = '';
}

// === Inisialisasi ===
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  if (dashboardPage) showPage('dashboard');
  // Tambah event listener login/register/logout
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) registerBtn.addEventListener('click', handleRegister);
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
});

// === Placeholder: CRUD, loadInitialData, updateDashboard, updateTransactionsPage, updateCategoriesPage, updateReportsPage ===
let categories = [];
let transactions = [];

// === CRUD: Load Categories ===
async function loadCategories() {
  if (!currentUser) return;
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', currentUser.id);
  if (error) {
    showToast('Gagal memuat kategori', 'error');
    return;
  }
  categories = data;
  updateCategoriesPage();
}

// === CRUD: Load Transactions ===
async function loadTransactions() {
  if (!currentUser) return;
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(name, color, type)')
    .eq('user_id', currentUser.id)
    .order('date', { ascending: false });
  if (error) {
    showToast('Gagal memuat transaksi', 'error');
    return;
  }
  transactions = data;
  updateDashboard();
  updateTransactionsPage();
  updateReportsPage();
}

// === Update UI: Categories Page ===
function updateCategoriesPage() {
  const categoriesList = document.getElementById('categoriesList');
  if (!categoriesList) return;
  categoriesList.innerHTML = '';
  if (categories.length === 0) {
    categoriesList.innerHTML = `<div class="text-center py-8 text-gray-500 col-span-full">
      <i class="fas fa-tags text-4xl mb-2"></i>
      <p>No categories yet</p>
    </div>`;
    return;
  }
  categories.forEach(category => {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center category-badge';
    categoryElement.innerHTML = `
      <div class="w-12 h-12 rounded-full ${category.color} flex items-center justify-center text-white mb-2">
        <i class="fas ${category.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
      </div>
      <h4 class="font-medium text-center">${category.name}</h4>
      <p class="text-sm text-gray-500">${category.type}</p>
      <div class="flex gap-2 mt-2">
        <button class="text-sm text-indigo-500 hover:text-indigo-700 edit-category" data-id="${category.id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="text-sm text-red-500 hover:text-red-700 delete-category" data-id="${category.id}"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `;
    categoriesList.appendChild(categoryElement);
  });
  // Event listener edit/hapus kategori
  document.querySelectorAll('.edit-category').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.getAttribute('data-id');
      const cat = categories.find(c => c.id === id);
      if (!cat) return;
      editingCategoryId = id;
      document.getElementById('categoryName').value = cat.name;
      document.getElementById('categoryType').value = cat.type;
      document.getElementById('selectedColor').value = cat.color;
      categoryModal.classList.remove('hidden');
    });
  });
  document.querySelectorAll('.delete-category').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Hapus kategori ini?')) deleteCategory(id);
    });
  });
}

// === Update UI: Dashboard ===
function updateDashboard() {
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(transaction => {
    if (transaction.categories && transaction.categories.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });
  document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
  document.getElementById('totalExpense').textContent = formatCurrency(totalExpense);
  document.getElementById('totalBalance').textContent = formatCurrency(totalIncome - totalExpense);
  // Recent transactions
  const recentTransactionsContainer = document.getElementById('recentTransactions');
  recentTransactionsContainer.innerHTML = '';
  if (transactions.length === 0) {
    recentTransactionsContainer.innerHTML = `<div class="text-center py-8 text-gray-500">
      <i class="fas fa-exchange-alt text-4xl mb-2"></i>
      <p>No transactions yet</p>
    </div>`;
    return;
  }
  const recentTransactions = transactions.slice(0, 5);
  recentTransactions.forEach(transaction => {
    const isIncome = transaction.categories && transaction.categories.type === 'income';
    const amountClass = isIncome ? 'text-green-600' : 'text-red-600';
    const icon = isIncome ? 'fa-arrow-up' : 'fa-arrow-down';
    const transactionElement = document.createElement('div');
    transactionElement.className = 'bg-white border border-gray-200 rounded-lg p-4 transaction-card transition-all duration-200';
    transactionElement.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full ${transaction.categories ? transaction.categories.color : ''} flex items-center justify-center text-white">
            <i class="fas ${icon}"></i>
          </div>
          <div>
            <h4 class="font-medium">${transaction.categories ? transaction.categories.name : ''}</h4>
            <p class="text-sm text-gray-500">${new Date(transaction.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="${amountClass} font-medium">${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}</p>
          ${transaction.description ? `<p class="text-sm text-gray-500 truncate max-w-xs">${transaction.description}</p>` : ''}
        </div>
      </div>
    `;
    recentTransactionsContainer.appendChild(transactionElement);
  });
}

// === Update UI: Transactions Page ===
function updateTransactionsPage() {
  const allTransactionsContainer = document.getElementById('allTransactions');
  if (!allTransactionsContainer) return;
  allTransactionsContainer.innerHTML = '';
  if (transactions.length === 0) {
    allTransactionsContainer.innerHTML = `<div class="text-center py-12 text-gray-500">
      <i class="fas fa-exchange-alt text-4xl mb-2"></i>
      <p>No transactions found</p>
    </div>`;
    return;
  }
  transactions.forEach(transaction => {
    const isIncome = transaction.categories && transaction.categories.type === 'income';
    const amountClass = isIncome ? 'text-green-600' : 'text-red-600';
    const icon = isIncome ? 'fa-arrow-up' : 'fa-arrow-down';
    const transactionElement = document.createElement('div');
    transactionElement.className = 'bg-white border border-gray-200 rounded-lg p-4 mb-3 transaction-card transition-all duration-200';
    transactionElement.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full ${transaction.categories ? transaction.categories.color : ''} flex items-center justify-center text-white">
            <i class="fas ${icon}"></i>
          </div>
          <div>
            <h4 class="font-medium">${transaction.categories ? transaction.categories.name : ''}</h4>
            <p class="text-sm text-gray-500">${new Date(transaction.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <p class="${amountClass} font-medium">${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}</p>
            ${transaction.description ? `<p class="text-sm text-gray-500 truncate max-w-xs">${transaction.description}</p>` : ''}
          </div>
          <button class="text-gray-400 hover:text-indigo-500 edit-transaction" data-id="${transaction.id}"><i class="fas fa-edit"></i></button>
          <button class="text-gray-400 hover:text-red-500 delete-transaction" data-id="${transaction.id}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    allTransactionsContainer.appendChild(transactionElement);
  });
  // Event listener edit/hapus transaksi
  document.querySelectorAll('.edit-transaction').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.getAttribute('data-id');
      const trx = transactions.find(t => t.id === id);
      if (!trx) return;
      editingTransactionId = id;
      document.querySelector(`input[name="transactionType"][value="${trx.categories ? trx.categories.type : 'expense'}"]`).checked = trx.categories && trx.categories.type === 'income';
      document.getElementById('transactionAmount').value = trx.amount;
      document.getElementById('transactionCategory').value = trx.category_id;
      document.getElementById('transactionDate').value = trx.date.slice(0, 10);
      document.getElementById('transactionDescription').value = trx.description || '';
      transactionModal.classList.remove('hidden');
    });
  });
  document.querySelectorAll('.delete-transaction').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.getAttribute('data-id');
      if (confirm('Hapus transaksi ini?')) deleteTransaction(id);
    });
  });
}

// === Update UI: Reports Page (placeholder) ===
function updateReportsPage() {
  // Implementasi chart dan laporan sesuai kebutuhan
}

// === Tambah/Edit/Hapus Kategori ===
async function saveCategory(isEdit = false, categoryId = null) {
  const name = document.getElementById('categoryName').value.trim();
  const type = document.getElementById('categoryType').value;
  const color = document.getElementById('selectedColor').value;
  if (!name) return showToast('Nama kategori wajib diisi', 'error');
  if (isEdit && categoryId) {
    // Edit
    const { error } = await supabase.from('categories').update({ name, type, color }).eq('id', categoryId);
    if (error) return showToast('Gagal update kategori', 'error');
    showToast('Kategori berhasil diupdate!', 'success');
  } else {
    // Tambah
    const { error } = await supabase.from('categories').insert([{ user_id: currentUser.id, name, type, color }]);
    if (error) return showToast('Gagal tambah kategori', 'error');
    showToast('Kategori berhasil ditambah!', 'success');
  }
  await loadCategories();
}
async function deleteCategory(categoryId) {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);
  if (error) return showToast('Gagal hapus kategori', 'error');
  showToast('Kategori berhasil dihapus!', 'success');
  await loadCategories();
}

// === Tambah/Edit/Hapus Transaksi ===
async function saveTransaction(isEdit = false, transactionId = null) {
  const type = document.querySelector('input[name="transactionType"]:checked').value;
  const amount = parseFloat(document.getElementById('transactionAmount').value);
  const categoryId = document.getElementById('transactionCategory').value;
  const date = document.getElementById('transactionDate').value;
  const description = document.getElementById('transactionDescription').value;
  if (!amount || !categoryId || !date) return showToast('Isi semua field wajib', 'error');
  if (isEdit && transactionId) {
    // Edit
    const { error } = await supabase.from('transactions').update({ category_id: categoryId, amount, date, description }).eq('id', transactionId);
    if (error) return showToast('Gagal update transaksi', 'error');
    showToast('Transaksi berhasil diupdate!', 'success');
  } else {
    // Tambah
    const { error } = await supabase.from('transactions').insert([{ user_id: currentUser.id, category_id: categoryId, amount, date, description }]);
    if (error) return showToast('Gagal tambah transaksi', 'error');
    showToast('Transaksi berhasil ditambah!', 'success');
  }
  await loadTransactions();
}
async function deleteTransaction(transactionId) {
  const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
  if (error) return showToast('Gagal hapus transaksi', 'error');
  showToast('Transaksi berhasil dihapus!', 'success');
  await loadTransactions();
}

// === Chart di Reports (Chart.js) ===
let yearlyChart = null;
let expensePieChart = null;
function updateReportsPage() {
  // Yearly Overview
  const ctxYearly = document.getElementById('yearlyChart').getContext('2d');
  if (yearlyChart) yearlyChart.destroy();
  // Data per bulan
  const months = Array.from({length: 12}, (_, i) => i+1);
  const incomePerMonth = Array(12).fill(0);
  const expensePerMonth = Array(12).fill(0);
  transactions.forEach(trx => {
    const m = new Date(trx.date).getMonth();
    if (trx.categories && trx.categories.type === 'income') incomePerMonth[m] += trx.amount;
    else expensePerMonth[m] += trx.amount;
  });
  yearlyChart = new Chart(ctxYearly, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [
        { label: 'Income', data: incomePerMonth, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.3, fill: true },
        { label: 'Expenses', data: expensePerMonth, borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.3, fill: true }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
  // Expense Breakdown Pie
  const ctxPie = document.getElementById('expensePieChart').getContext('2d');
  if (expensePieChart) expensePieChart.destroy();
  const expenseCategories = {};
  transactions.forEach(trx => {
    if (trx.categories && trx.categories.type === 'expense') {
      if (!expenseCategories[trx.categories.name]) expenseCategories[trx.categories.name] = 0;
      expenseCategories[trx.categories.name] += trx.amount;
    }
  });
  expensePieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: Object.keys(expenseCategories),
      datasets: [{ data: Object.values(expenseCategories), backgroundColor: ['#EF4444','#3B82F6','#10B981','#F59E0B','#8B5CF6','#6B7280'] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// === Load Data Awal ===
function loadInitialData() {
  loadCategories();
  loadTransactions();
}
