// main.js (v4 - Full Category CRUD)
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
    addMainBtn: $('#add-main-btn'),
    // Modals
    transactionModal: $('#transactionModal'),
    transactionForm: $('#transactionForm'),
    categoryModal: $('#categoryModal'),
    categoryForm: $('#categoryForm'),
};

// === TEMPLATES & RENDER ===
const getDashboardHTML = () => ``;
const getTransactionsPageHTML = () => `<div id="all-transactions-list" class="space-y-3"></div>`;
const getCategoriesPageHTML = () => `<div id="category-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>`;

const renderPageContent = () => {
    DOMElements.pageContent.innerHTML = '';
    DOMElements.pageTitle.textContent = state.activePage.charAt(0).toUpperCase() + state.activePage.slice(1);
    $('#add-main-btn span').textContent = `Add ${state.activePage === 'categories' ? 'Category' : 'Transaction'}`;

    let pageHTML = '';
    if (state.activePage === 'dashboard') pageHTML = getDashboardHTML();
    else if (state.activePage === 'transactions') pageHTML = getTransactionsPageHTML();
    else if (state.activePage === 'categories') pageHTML = getCategoriesPageHTML();
    
    DOMElements.pageContent.innerHTML = pageHTML;

    // Panggil fungsi render data yang sesuai
    if (state.activePage === 'dashboard') renderDashboardData();
    else if (state.activePage === 'transactions') renderTransactionsList();
    else if (state.activePage === 'categories') renderCategoriesList();
};

const renderDashboardData = () => { /* ... (fungsi sama seperti sebelumnya) ... */ };
const renderTransactionsList = () => { /* ... (fungsi sama seperti sebelumnya) ... */ };

const renderCategoriesList = () => {
    const container = $('#category-list');
    container.innerHTML = '';
    if (state.categories.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-8 col-span-full">No categories found. Click 'Add Category' to start.</p>`;
        return;
    }
    state.categories.forEach(cat => {
        const el = document.createElement('div');
        el.className = `category-badge p-4 rounded-lg shadow flex flex-col items-center justify-center text-center ${cat.color.replace('bg-', 'dark:bg-opacity-50 bg-opacity-20 ')}`;
        el.innerHTML = `
            <div class="w-12 h-12 ${cat.color} rounded-full flex items-center justify-center text-white text-xl mb-3">
                <i class="fas ${cat.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
            </div>
            <p class="font-bold">${cat.name}</p>
            <p class="text-xs text-gray-500 capitalize">${cat.type}</p>
            <div class="mt-3 space-x-3">
                <button class="edit-cat-btn text-sm text-gray-400 hover:text-indigo-500" data-id="${cat.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-cat-btn text-sm text-gray-400 hover:text-red-500" data-id="${cat.id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        container.appendChild(el);
    });
};

// === Utility & Navigasi ===
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const showToast = (msg, type = 'success') => { /* ... (fungsi sama seperti sebelumnya) ... */ };
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

// === Otentikasi & Data Loading ===
const handleAuth = async () => { /* ... (fungsi sama seperti sebelumnya) ... */ };
const loadInitialData = async () => { /* ... (fungsi sama seperti sebelumnya) ... */ };

// === CRUD & Modals ===
// --- Transaksi ---
const openTransactionModal = (trx = null) => { /* ... (fungsi sama seperti sebelumnya) ... */ };
const closeTransactionModal = () => DOMElements.transactionModal.classList.add('hidden');
const handleTransactionSubmit = async (e) => { /* ... (fungsi sama seperti sebelumnya, pastikan ada 'delete trxData.type;') ... */ };
const deleteTransaction = async (id) => { /* ... (fungsi sama seperti sebelumnya) ... */ };

// --- Kategori ---
const openCategoryModal = (cat = null) => {
    state.editingId = cat ? cat.id : null;
    DOMElements.categoryModal.querySelector('#categoryModalTitle').textContent = cat ? 'Edit Category' : 'Add Category';
    
    const form = DOMElements.categoryForm;
    form.reset();
    
    // Generate color options
    const colorContainer = form.querySelector('#color-options');
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'];
    colorContainer.innerHTML = colors.map(c => `<button type="button" data-color="${c}" class="color-option w-8 h-8 rounded-full ${c} border-2 border-transparent"></button>`).join('');

    if (cat) {
        form.querySelector('[name="name"]').value = cat.name;
        form.querySelector(`[name="type"][value="${cat.type}"]`).checked = true;
        form.querySelector('[name="color"]').value = cat.color;
        const selectedColorBtn = form.querySelector(`[data-color="${cat.color}"]`);
        if(selectedColorBtn) selectedColorBtn.classList.add('selected');
    } else {
        // Default untuk kategori baru
        form.querySelector('[name="color"]').value = colors[0];
        form.querySelector(`[data-color="${colors[0]}"]`).classList.add('selected');
    }
    
    DOMElements.categoryModal.classList.remove('hidden');
};

const closeCategoryModal = () => DOMElements.categoryModal.classList.add('hidden');

const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const catData = Object.fromEntries(formData.entries());
    catData.user_id = state.currentUser.id;

    if (!catData.name || !catData.color) return showToast('Name and color are required', 'error');

    const { error } = state.editingId
        ? await supabase.from('categories').update(catData).eq('id', state.editingId)
        : await supabase.from('categories').insert([catData]);
    
    if (error) return showToast(error.message, 'error');
    
    showToast(`Category ${state.editingId ? 'updated' : 'added'}!`);
    closeCategoryModal();
    await loadInitialData();
    renderPageContent();
};

const deleteCategory = async (id) => {
    // Cek dulu apakah ada transaksi yang menggunakan kategori ini
    const { data, error } = await supabase.from('transactions').select('id').eq('category_id', id).limit(1);
    if (error) return showToast(error.message, 'error');
    if (data.length > 0) return showToast('Cannot delete category with existing transactions.', 'error');
    
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', id);
    if (deleteError) return showToast(deleteError.message, 'error');
    
    showToast('Category deleted.');
    await loadInitialData();
    renderPageContent();
};

// === Event Listener Utama ===
const setupEventListeners = () => {
    document.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        // --- AUTH ---
        // ... (Logika Auth sama seperti sebelumnya)

        // --- NAVIGASI & AKSI UTAMA ---
        if (button.closest('.nav-btn')) navigateTo(button.closest('.nav-btn').dataset.page);
        if (button.id === 'mobileMenuButton') { /* ... */ }
        if (button.id === 'add-main-btn') {
            if (state.activePage === 'categories') openCategoryModal();
            else openTransactionModal();
        }

        // --- AKSI CRUD KATEGORI ---
        if (button.closest('.edit-cat-btn')) {
            const id = button.closest('.edit-cat-btn').dataset.id;
            const cat = state.categories.find(c => c.id === id);
            openCategoryModal(cat);
        }
        if (button.closest('.delete-cat-btn')) {
            const id = button.closest('.delete-cat-btn').dataset.id;
            deleteCategory(id);
        }
         if (button.closest('.color-option')) {
            e.preventDefault();
            const form = button.closest('form');
            form.querySelector('#categoryColor').value = button.dataset.color;
            form.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        }

        // --- AKSI CRUD TRANSAKSI ---
        if (button.closest('.edit-btn')) { /* ... */ }
        if (button.closest('.delete-btn')) { /* ... */ }

        // --- MODALS ---
        if (button.closest('.close-modal-btn')) {
            closeTransactionModal();
            closeCategoryModal();
        }
    });

    DOMElements.sidebarOverlay.onclick = () => { /* ... */ };

    // --- Form Submissions ---
    DOMElements.transactionForm.addEventListener('submit', handleTransactionSubmit);
    DOMElements.categoryForm.addEventListener('submit', handleCategorySubmit);

    supabase.auth.onAuthStateChange((_event, session) => {
        state.currentUser = session?.user;
        handleAuth();
    });
};

document.addEventListener('DOMContentLoaded', setupEventListeners);
