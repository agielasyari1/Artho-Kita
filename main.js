// main.js (v2 - Robust Event Handling)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// === Konfigurasi Supabase ===
const supabase = createClient('https://vofqjygceblthhqbajqh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZnFqeWdjZWJsdGhocWJhanFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzkxODgsImV4cCI6MjA2ODkxNTE4OH0.I9dT9PZPfmX6p7QSuYOIkP1TAvsobsxxlGpyGLxBzZc');

// === State Aplikasi ===
let state = {
    currentUser: null,
    transactions: [],
    categories: [],
    activePage: 'dashboard',
    editingId: null,
};

// === Elemen DOM Utama ===
const $ = (selector) => document.querySelector(selector);

const DOMElements = {
    authSection: $('#authSection'),
    appSection: $('#appSection'),
    pageContent: $('#page-content'),
    pageTitle: $('#pageTitle'),
    sidebar: $('#sidebar'),
    sidebarOverlay: $('#sidebarOverlay'),
    userEmail: $('#userEmail'),
    toastContainer: $('#toastContainer'),
    transactionModal: $('#transactionModal'),
    transactionForm: $('#transactionForm'),
};

// === TEMPLATES & RENDER ===
const getDashboardHTML = () => `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex items-center justify-between"><div><p class="text-gray-500">Total Income</p><h2 id="totalIncome" class="text-2xl font-bold text-green-500"></h2></div><div class="bg-green-100 p-3 rounded-full"><i class="fas fa-arrow-up text-green-600"></i></div></div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex items-center justify-between"><div><p class="text-gray-500">Total Expenses</p><h2 id="totalExpense" class="text-2xl font-bold text-red-500"></h2></div><div class="bg-red-100 p-3 rounded-full"><i class="fas fa-arrow-down text-red-600"></i></div></div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex items-center justify-between"><div><p class="text-gray-500">Balance</p><h2 id="totalBalance" class="text-2xl font-bold text-indigo-500"></h2></div><div class="bg-indigo-100 p-3 rounded-full"><i class="fas fa-wallet text-indigo-600"></i></div></div>
        </div>
    </div>
    <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-6"><h3 class="font-bold text-lg mb-4">Recent Transactions</h3><div id="recentTransactions" class="space-y-3"></div></div>`;

const getTransactionsPageHTML = () => `<div id="all-transactions-list" class="space-y-3"></div>`;
// Tambahkan template HTML untuk halaman lain di sini (Categories, Reports, Settings)

const renderPageContent = () => {
    DOMElements.pageContent.innerHTML = ''; // Clear previous content
    DOMElements.pageTitle.textContent = state.activePage.charAt(0).toUpperCase() + state.activePage.slice(1);

    if (state.activePage === 'dashboard') {
        DOMElements.pageContent.innerHTML = getDashboardHTML();
        renderDashboardData();
    } else if (state.activePage === 'transactions') {
        DOMElements.pageContent.innerHTML = getTransactionsPageHTML();
        renderTransactionsList();
    }
    // Tambahkan kondisi render untuk halaman lain
};

const renderDashboardData = () => {
    // Fungsi ini sekarang hanya mengisi data, bukan membuat ulang HTML
    const income = state.transactions.filter(t => t.categories.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = state.transactions.filter(t => t.categories.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    $('#totalIncome').textContent = formatCurrency(income);
    $('#totalExpense').textContent = formatCurrency(expense);
    $('#totalBalance').textContent = formatCurrency(income - expense);
    
    const recentContainer = $('#recentTransactions');
    recentContainer.innerHTML = ''; // Clear only the list
    state.transactions.slice(0, 5).forEach(trx => {
        const el = document.createElement('div');
        el.className = 'transaction-card bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center';
        el.innerHTML = `<div class="flex items-center gap-3"><span class="w-10 h-10 flex items-center justify-center rounded-full ${trx.categories.color} text-white text-lg"><i class="fas ${trx.categories.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></span><div><p class="font-semibold">${trx.categories.name}</p><p class="text-sm text-gray-500">${new Date(trx.date).toLocaleDateString()}</p></div></div><p class="font-bold ${trx.categories.type === 'income' ? 'text-green-500' : 'text-red-500'}">${formatCurrency(trx.amount)}</p>`;
        recentContainer.appendChild(el);
    });
    if (state.transactions.length === 0) {
        recentContainer.innerHTML = `<p class="text-center text-gray-500 py-4">No recent transactions.</p>`;
    }
};

const renderTransactionsList = () => {
    const container = $('#all-transactions-list');
    container.innerHTML = '';

    if (state.transactions.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-8">No transactions found.</p>`;
        return;
    }
    
    state.transactions.forEach(trx => {
        const el = document.createElement('div');
        el.className = 'transaction-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center';
        el.innerHTML = `<div class="flex items-center gap-4"><span class="w-10 h-10 flex items-center justify-center rounded-full ${trx.categories.color} text-white text-lg"><i class="fas ${trx.categories.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></span><div><p class="font-bold">${trx.categories.name}</p><p class="text-sm text-gray-500">${new Date(trx.date).toLocaleDateString()}</p>${trx.description ? `<p class="text-xs text-gray-400 italic">${trx.description}</p>` : ''}</div></div><div class="text-right"><p class="font-bold text-lg ${trx.categories.type === 'income' ? 'text-green-500' : 'text-red-500'}">${formatCurrency(trx.amount)}</p><div><button class="edit-btn text-sm text-gray-400 hover:text-indigo-500" data-id="${trx.id}"><i class="fas fa-edit"></i></button><button class="delete-btn text-sm text-gray-400 hover:text-red-500" data-id="${trx.id}"><i class="fas fa-trash"></i></button></div></div>`;
        container.appendChild(el);
    });
};

// === Fungsi Utility ===
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const showToast = (msg, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i><p>${msg}</p>`;
    DOMElements.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// === Navigasi ===
const navigateTo = (page) => {
    state.activePage = page;
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('bg-indigo-100', btn.dataset.page === page);
        btn.classList.toggle('text-indigo-700', btn.dataset.page === page);
    });
    renderPageContent();
    DOMElements.sidebar.classList.remove('active');
    DOMElements.sidebarOverlay.classList.add('hidden');
};

// === Otentikasi & Data ===
const handleAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    state.currentUser = session?.user;

    if (state.currentUser) {
        DOMElements.authSection.classList.add('hidden');
        DOMElements.appSection.classList.remove('hidden');
        DOMElements.userEmail.textContent = state.currentUser.email;
        await loadInitialData();
        navigateTo('dashboard');
    } else {
        DOMElements.authSection.classList.remove('hidden');
        DOMElements.appSection.classList.add('hidden');
    }
};

const loadInitialData = async () => {
    const [catRes, trxRes] = await Promise.all([
        supabase.from('categories').select('*').eq('user_id', state.currentUser.id),
        supabase.from('transactions').select('*, categories(name, color, type)').eq('user_id', state.currentUser.id).order('date', { ascending: false })
    ]);
    if (catRes.error || trxRes.error) return showToast('Failed to load data.', 'error');
    state.categories = catRes.data;
    state.transactions = trxRes.data;
};

// === CRUD & Modal ===
const openTransactionModal = (trx = null) => {
    state.editingId = trx ? trx.id : null;
    $('#transactionModalTitle').textContent = trx ? 'Edit Transaction' : 'Add Transaction';
    
    const form = DOMElements.transactionForm;
    form.reset();
    
    const categorySelect = form.querySelector('[name="category_id"]');
    const typeRadios = form.querySelectorAll('[name="type"]');
    
    const updateCategoryOptions = (type) => {
        const filteredCategories = state.categories.filter(c => c.type === type);
        categorySelect.innerHTML = filteredCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    };

    typeRadios.forEach(radio => radio.onchange = () => updateCategoryOptions(radio.value));

    if (trx) {
        const type = state.categories.find(c => c.id === trx.category_id)?.type || 'expense';
        form.querySelector(`[name="type"][value="${type}"]`).checked = true;
        updateCategoryOptions(type);
        form.querySelector('[name="amount"]').value = trx.amount;
        form.querySelector('[name="category_id"]').value = trx.category_id;
        form.querySelector('[name="date"]').value = trx.date;
        form.querySelector('[name="description"]').value = trx.description;
    } else {
        form.querySelector('[name="type"][value="expense"]').checked = true;
        updateCategoryOptions('expense');
        form.querySelector('[name="date"]').value = new Date().toISOString().slice(0, 10);
    }
    
    DOMElements.transactionModal.classList.remove('hidden');
};

const closeTransactionModal = () => DOMElements.transactionModal.classList.add('hidden');

const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const trxData = Object.fromEntries(formData.entries());
    trxData.amount = parseFloat(trxData.amount);
    trxData.user_id = state.currentUser.id;

    const { error } = state.editingId 
        ? await supabase.from('transactions').update(trxData).eq('id', state.editingId)
        : await supabase.from('transactions').insert([trxData]);

    if (error) return showToast(error.message, 'error');
    
    showToast(`Transaction ${state.editingId ? 'updated' : 'added'}!`);
    closeTransactionModal();
    await loadInitialData();
    renderPageContent(); // Re-render the current page
};

const deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) return showToast(error.message, 'error');
    showToast('Transaction deleted.');
    await loadInitialData();
    renderPageContent(); // Re-render
};

// === Event Listeners ===
const setupEventListeners = () => {
    // Gunakan satu event listener di level dokumen
    document.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        // Auth Buttons
        if (target.id === 'loginBtn') {
            const email = $('#loginEmail').value;
            const password = $('#loginPassword').value;
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) showToast(error.message, 'error');
        }
        if (target.id === 'registerBtn') {
            const email = $('#registerEmail').value;
            const password = $('#registerPassword').value;
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) showToast(error.message, 'error');
            else showToast('Registration successful! Check your email.');
        }
        if (target.id === 'logoutBtn') await supabase.auth.signOut();
        if (target.id === 'showRegisterBtn') {
            $('#loginForm').classList.add('hidden');
            $('#registerForm').classList.remove('hidden');
        }
        if (target.id === 'showLoginBtn') {
            $('#registerForm').classList.add('hidden');
            $('#loginForm').classList.remove('hidden');
        }

        // App Buttons
        if (target.closest('.nav-btn')) navigateTo(target.closest('.nav-btn').dataset.page);
        if (target.id === 'mobileMenuButton' || target.closest('#mobileMenuButton')) {
            DOMElements.sidebar.classList.add('active');
            DOMElements.sidebarOverlay.classList.remove('hidden');
        }
        if (target.id === 'addTransactionBtn') openTransactionModal();
        if (target.closest('.edit-btn')) {
            const id = target.closest('.edit-btn').dataset.id;
            const trx = state.transactions.find(t => t.id === id);
            openTransactionModal(trx);
        }
        if (target.closest('.delete-btn')) {
            const id = target.closest('.delete-btn').dataset.id;
            deleteTransaction(id);
        }

        // Modal Buttons
        if (target.closest('.close-modal-btn')) closeTransactionModal();
    });

    // Listener untuk overlay mobile
    DOMElements.sidebarOverlay.onclick = () => {
        DOMElements.sidebar.classList.remove('active');
        DOMElements.sidebarOverlay.classList.add('hidden');
    };

    // Listener untuk form submit
    DOMElements.transactionForm.addEventListener('submit', handleTransactionSubmit);

    // Listener untuk perubahan status otentikasi
    supabase.auth.onAuthStateChange((_event, session) => {
        state.currentUser = session?.user;
        handleAuth();
    });
};

// === Inisialisasi Aplikasi ===
document.addEventListener('DOMContentLoaded', setupEventListeners);
