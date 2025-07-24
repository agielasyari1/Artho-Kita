// ... seluruh isi <script> dari finance.html dipindahkan ke sini ... 
// Multi-currency logic
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://vofqjygceblthhqbajqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZnFqeWdjZWJsdGhocWJhanFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzkxODgsImV4cCI6MjA2ODkxNTE4OH0.I9dT9PZPfmX6p7QSuYOIkP1TAvsobsxxlGpyGLxBzZc';
const supabase = createClient(supabaseUrl, supabaseKey);

const currencySelect = document.getElementById('currencySelect');
function setCurrency(currency) {
    localStorage.setItem('currency', currency);
    currencySelect.value = currency;
    updateDashboard();
    updateTransactionsPage();
    updateReportsPage();
}
currencySelect.addEventListener('change', () => {
    setCurrency(currencySelect.value);
});
// Inisialisasi currency dari localStorage
(function initCurrency() {
    const saved = localStorage.getItem('currency');
    if (saved) setCurrency(saved);
    else setCurrency('IDR');
})();
// Update formatCurrency agar mengikuti currency
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
