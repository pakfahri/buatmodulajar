// app.js (KODE TERAMAN: Tanpa ALLOWED_EMAILS)

// ... (Import Firebase modules) ...

// ===============================================
// 1. KONFIGURASI FIREBASE ANDA 
// ===============================================
const firebaseConfig = {
    apiKey: "AIzaSyAS5gU7KrFMyJ6S1QmHNfQo2yFcFLQlZJk", // Ganti dengan API Key Anda
    authDomain: "aigenmod.firebaseapp.com",
    projectId: "aigenmod",
    // ... Detail konfigurasi lainnya ...
};

// ... (Variabel Auto-Logout dan Inisialisasi Firebase) ...
// ... (Fungsi loginUser, logoutUser, resetLogoutTimer, stopLogoutTimer - sama) ...
// ... (Event Listeners - sama) ...

// ===============================================
// 8. LOGIKA PEMBATASAN AKSES (MENGGUNAKAN CUSTOM CLAIMS DARI SERVER)
// ===============================================

onAuthStateChanged(auth, async (user) => {
    const authContainer = document.getElementById('auth-container');
    const contentContainer = document.getElementById('content-container');
    const errorDisplay = document.getElementById('auth-error');
    
    errorDisplay.textContent = ''; 

    if (user) {
        // --- LANGKAH KRITIS: Minta Izin dari Server ---
        const idTokenResult = await user.getIdTokenResult(true);
        // Cek apakah server telah memberi klaim 'allowed' = true
        const isAllowed = idTokenResult.claims.allowed === true; 

        if (isAllowed) {
            // Diizinkan: Tampilkan konten utama
            authContainer.classList.add('hidden');
            contentContainer.classList.remove('hidden');
            
            document.getElementById('user-email-display').textContent = user.email;
            
            resetLogoutTimer(); 

        } else {
            // TIDAK Diizinkan: Akses ditolak karena tidak ada klaim dari server
            stopLogoutTimer();
            
            setTimeout(() => {
                logoutUser();
                errorDisplay.textContent = `Akses ditolak. Akun Anda belum diizinkan oleh administrator.`;
                authContainer.classList.remove('hidden');
                contentContainer.classList.add('hidden');
            }, 100); 
        }

    } else {
        // Pengguna belum login (atau sudah logout)
        stopLogoutTimer(); 
        authContainer.classList.remove('hidden');
        contentContainer.classList.add('hidden');
    }
});
