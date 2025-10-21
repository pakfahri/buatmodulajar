// app.js

// ===============================================
// Import Modul Firebase (Gunakan versi 12.4.0)
// ===============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";


// ===============================================
// 1. KONFIGURASI FIREBASE ANDA (WAJIB GANTI!)
// ===============================================
const firebaseConfig = {
    apiKey: "AIzaSyAS5gU7KrFMyJ6S1QmHNfQo2yFcFLQlZJk", // Ganti dengan API Key Anda
    authDomain: "aigenmod.firebaseapp.com",
    projectId: "aigenmod",
    storageBucket: "aigenmod.firebasestorage.app",
    messagingSenderId: "719649273501",
    appId: "1:719649273501:web:8a0b4294623cb9714c4674"
};

// ===============================================
// 2. DAFTAR EMAIL YANG DIIZINKAN (WAJIB GANTI!)
// ===============================================
// Hanya email yang ada di array ini yang akan mendapatkan akses konten setelah login.
const ALLOWED_EMAILS = [
    "admin@modul.id",
    "guru-valid@sekolah.com",
    // Tambahkan semua email lain yang diizinkan di sini
];

// ===============================================
// 3. VARIABEL AUTO-LOGOUT
// ===============================================
// 5 * 60 * 1000 = 300.000 ms = 5 menit. Ganti jika perlu.
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; 
let logoutTimer; // Variabel untuk menyimpan ID timer


// ===============================================
// 4. INISIALISASI FIREBASE
// ===============================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Dapatkan instance Autentikasi


// ===============================================
// 5. FUNGSI LOGIKA AUTENTIKASI
// ===============================================

function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDisplay = document.getElementById('auth-error');
    errorDisplay.textContent = ''; 

    if (!email || !password) {
        errorDisplay.textContent = "Email dan Kata Sandi wajib diisi.";
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            console.log("Login berhasil.");
        })
        .catch((error) => {
            let errorMessage = "Login Gagal. Email atau kata sandi salah.";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "Email tidak terdaftar.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Kata sandi salah.";
            }
            errorDisplay.textContent = errorMessage;
        });
}

function logoutUser() {
    signOut(auth)
        .then(() => {
            console.log("Logout berhasil.");
        })
        .catch((error) => {
            console.error("Error logout:", error);
        });
}


// ===============================================
// 6. FUNGSI AUTO-LOGOUT
// ===============================================

// Mengatur (atau mereset) timer logout
function resetLogoutTimer() {
    // Hentikan timer sebelumnya
    clearTimeout(logoutTimer); 

    // Atur timer baru
    logoutTimer = setTimeout(() => {
        // Cek apakah pengguna masih terautentikasi sebelum logout
        if (auth.currentUser) {
            logoutUser();
            alert('Anda telah di-logout secara otomatis karena tidak ada aktivitas selama ' + (INACTIVITY_TIMEOUT_MS / 60000) + ' menit.');
        }
    }, INACTIVITY_TIMEOUT_MS);
}

// Menghentikan timer (dipanggil saat logout manual atau logout paksa)
function stopLogoutTimer() {
    clearTimeout(logoutTimer);
}


// ===============================================
// 7. EVENT LISTENERS & LOGIKA UTAMA
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    
    // Menghubungkan Tombol Login (Solusi untuk 'ReferenceError')
    if (loginButton) {
        loginButton.addEventListener('click', loginUser);
    }

    // Menghubungkan Tombol Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }
    
    // Menambahkan Event Listener untuk mendeteksi aktivitas pengguna
    // Hanya reset timer jika pengguna sedang login
    const activityHandler = () => {
        if (auth.currentUser) {
            resetLogoutTimer();
        }
    };

    document.addEventListener('mousemove', activityHandler);
    document.addEventListener('keypress', activityHandler);
    document.addEventListener('click', activityHandler);
});


// ===============================================
// 8. LOGIKA PEMBATASAN AKSES DAN RENDER TAMPILAN
// ===============================================

onAuthStateChanged(auth, (user) => {
    const authContainer = document.getElementById('auth-container');
    const contentContainer = document.getElementById('content-container');
    const errorDisplay = document.getElementById('auth-error');
    
    errorDisplay.textContent = ''; 

    if (user) {
        const userEmail = user.email;

        // FILTER AKSES: Cek apakah email pengguna ada di daftar yang diizinkan
        if (ALLOWED_EMAILS.includes(userEmail)) {
            // Diizinkan: Tampilkan konten utama
            authContainer.classList.add('hidden');
            contentContainer.classList.remove('hidden');
            document.getElementById('user-email-display').textContent = userEmail;
            
            // AKTIFKAN AUTO-LOGOUT
            resetLogoutTimer(); 

        } else {
            // TIDAK Diizinkan: Paksa logout dan berikan pesan error
            stopLogoutTimer();
            logoutUser();
            errorDisplay.textContent = "Akses ditolak. Email Anda tidak terdaftar sebagai pengguna yang diizinkan.";
            authContainer.classList.remove('hidden');
            contentContainer.classList.add('hidden');
        }

    } else {
        // Pengguna belum login (atau sudah logout)
        stopLogoutTimer(); // Pastikan timer mati saat tidak ada pengguna
        authContainer.classList.remove('hidden');
        contentContainer.classList.add('hidden');
    }
});