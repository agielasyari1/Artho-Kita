// main.js
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
const $$ = (selector) => document.querySelectorAll(selector);

const DOMElements = {
    authSection: $('#authSection'),
    appSection: $('#appSection'),
    pageContent: $('#page-content'),
    pageTitle: $('#pageTitle'),
    sidebar: $('#sidebar'),
    sidebarOverlay: $('#sidebarOverlay'),
    mobileMenuButton: $('#mobileMenuButton'),
    userEmail: $('#userEmail'),
    toastContainer: $('#toastContainer'),
    transactionModal: $('#transactionModal'),
    transactionForm: $('#transactionForm'),
};

// === TEMPLATES ===
const getDashboardHTML = () => `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex items-center justify-between">
                <div><p class="text-gray-500">Total Income</p><h2 id="totalIncome" class="text-2xl font-bold text-green-500"></h2></div>
                <div class="bg-green-100 p-3 rounded-full"><i class="fas fa-arrow-up text-green-600"></i></div>
            </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex items-center justify-between">
                <div><p class="text-gray-500">Total Expenses</p><h2 id="totalExpense" class="text-2xl font-bold text-red-500"></h2></div>
                <div class="bg-red-100 p-3 rounded-full"><i class="fas fa-arrow-down text-red-500"></i></div>
            </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div class="flex items-center justify-between">
                <div><p class="text-gray-500">Balance</p><h2 id="totalBalance" class="text-2xl font-bold text-indigo-500"></h2></div>
                <div class="bg-indigo-100 p-3 rounded-full"><i class="fas fa-wallet text-indigo-600"></i></div>
            </div>
        </div>
    </div>
    <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 class="font-bold text-lg mb-4">Recent Transactions</h3>
        <div id="recentTransactions" class="space-y-3"></div>
    </div>`;

// === Fungsi Utility ===
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const showToast = (msg, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i><p>${msg}</p>`;
    DOMElements.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// === Otentikasi ===
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

const handleLogin = async (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value;
    const password = $('#loginPassword').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return showToast(error.message, 'error');
    showToast('Login successful!');
};

const handleRegister = async (e) => {
    e.preventDefault();
    const email = $('#registerEmail').value;
    const password = $('#registerPassword').value;
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return showToast(error.message, 'error');
    showToast('Registration successful! Please check your email to verify.');
};

const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};

// === Navigasi & Render ===
const navigateTo = (page) => {
    state.activePage = page;
    DOMElements.pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
    
    $$('.nav-btn').forEach(btn => {
        btn.classList.toggle('bg-indigo-100', btn.dataset.page === page);
        btn.classList.toggle('text-indigo-700', btn.dataset.page === page);
    });

    DOMElements.pageContent.innerHTML = ''; // Clear previous content

    if (page === 'dashboard') renderDashboard();
    if (page === 'transactions') renderTransactions();

    DOMElements.sidebar.classList.remove('active');
    DOMElements.sidebarOverlay.classList.add('hidden');
};

const renderDashboard = () => {
    DOMElements.pageContent.innerHTML = getDashboardHTML();
    const income = state.transactions.filter(t => t.categories.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = state.transactions.filter(t => t.categories.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    $('#totalIncome').textContent = formatCurrency(income);
    $('#totalExpense').textContent = formatCurrency(expense);
    $('#totalBalance').textContent = formatCurrency(income - expense);
    
    const recentContainer = $('#recentTransactions');
    recentContainer.innerHTML = '';
    state.transactions.slice(0, 5).forEach(trx => {
        const el = document.createElement('div');
        el.className = 'transaction-card bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center';
        el.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="w-10 h-10 flex items-center justify-center rounded-full ${trx.categories.color} text-white text-lg"><i class="fas ${trx.categories.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></span>
                <div>
                    <p class="font-semibold">${trx.categories.name}</p>
                    <p class="text-sm text-gray-500">${new Date(trx.date).toLocaleDateString()}</p>
                </div>
            </div>
            <p class="font-bold ${trx.categories.type === 'income' ? 'text-green-500' : 'text-red-500'}">${formatCurrency(trx.amount)}</p>`;
        recentContainer.appendChild(el);
    });
};

const renderTransactions = () => {
    DOMElements.pageContent.innerHTML = `<div id="all-transactions-list" class="space-y-3"></div>`;
    const container = $('#all-transactions-list');
    container.innerHTML = '';

    if (state.transactions.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-8">No transactions yet.</p>`;
        return;
    }
    
    state.transactions.forEach(trx => {
        const el = document.createElement('div');
        el.className = 'transaction-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center';
        el.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="w-10 h-10 flex items-center justify-center rounded-full ${trx.categories.color} text-white text-lg"><i class="fas ${trx.categories.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></span>
                <div>
                    <p class="font-bold">${trx.categories.name}</p>
                    <p class="text-sm text-gray-500">${new Date(trx.date).toLocaleDateString()}</p>
                    ${trx.description ? `<p class="text-xs text-gray-400 italic">${trx.description}</p>` : ''}
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-lg ${trx.categories.type === 'income' ? 'text-green-500' : 'text-red-500'}">${formatCurrency(trx.amount)}</p>
                <div>
                    <button class="edit-btn text-sm text-gray-400 hover:text-indigo-500" data-id="${trx.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn text-sm text-gray-400 hover:text-red-500" data-id="${trx.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        container.appendChild(el);
    });
};


// === CRUD Operasi ===
const loadInitialData = async () => {
    const [catRes, trxRes] = await Promise.all([
        supabase.from('categories').select('*').eq('user_id', state.currentUser.id),
        supabase.from('transactions').select('*, categories(name, color, type)').eq('user_id', state.currentUser.id).order('date', { ascending: false })
    ]);
    if (catRes.error || trxRes.error) return showToast('Failed to load data.', 'error');
    state.categories = catRes.data;
    state.transactions = trxRes.data;
};

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
    
    showToast(`Transaction ${state.editingId ? 'updated' : 'added'} successfully!`);
    closeTransactionModal();
    await loadInitialData();
    navigateTo(state.activePage);
};

const deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) return showToast(error.message, 'error');
    showToast('Transaction deleted.');
    await loadInitialData();
    navigateTo(state.activePage);
};

// === Modal Handling ===
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

const closeTransactionModal = () => {
    DOMElements.transactionModal.classList.add('hidden');
    state.editingId = null;
};


// === Event Listeners ===
const setupEventListeners = () => {
    // Auth
    $('#loginBtn').addEventListener('click', handleLogin);
    $('#registerBtn').addEventListener('click', handleRegister);
    $('#logoutBtn').addEventListener('click', handleLogout);
    $('#showRegisterBtn').addEventListener('click', () => {
        $('#loginForm').classList.add('hidden');
        $('#registerForm').classList.remove('hidden');
    });
    $('#showLoginBtn').addEventListener('click', () => {
        $('#registerForm').classList.add('hidden');
        $('#loginForm').classList.remove('hidden');
    });
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            handleAuth();
        } else if (event === 'SIGNED_OUT') {
            handleAuth();
        }
    });

    // Navigasi
    $('#nav-buttons').addEventListener('click', (e) => {
        const page = e.target.closest('.nav-btn')?.dataset.page;
        if (page) navigateTo(page);
    });

    // Mobile Menu
    DOMElements.mobileMenuButton.onclick = () => {
        DOMElements.sidebar.classList.add('active');
        DOMElements.sidebarOverlay.classList.remove('hidden');
    };
    DOMElements.sidebarOverlay.onclick = () => {
        DOMElements.sidebar.classList.remove('active');
        DOMElements.sidebarOverlay.classList.add('hidden');
    };
    
    // Tombol Global & CRUD
    $('#addTransactionBtn').addEventListener('click', () => openTransactionModal());
    DOMElements.transactionForm.addEventListener('submit', handleTransactionSubmit);
    
    DOMElements.pageContent.addEventListener('click', e => {
        if(e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            const trx = state.transactions.find(t => t.id === id);
            openTransactionModal(trx);
        }
        if(e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;
            deleteTransaction(id);
        }
    });
    
    // Modal
    $$('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeTransactionModal));
};

// === Inisialisasi Aplikasi ===
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    handleAuth();
});
