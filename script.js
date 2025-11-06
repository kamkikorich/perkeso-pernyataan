// --- script.js: VERSI MUKTAMAD DENGAN DUAL-AI CALL DAN PERANAN ---

const GEMINI_API_KEY = "AIzaSyCam7BO0kqZ29B5GZUIXCRtts4MnM36_Zo"; 

document.addEventListener('DOMContentLoaded', function() {
    // --- Perolehan Elemen DOM ---
    const soalanContainer = document.getElementById('soalan-container');
    const submitBtn = document.getElementById('submit-btn');
    const inputTajuk = document.getElementById('input-tajuk');
    const perananPembuat = document.getElementById('peranan_pembuat');
    const inputTugasan = document.getElementById('input-tugasan');
    const outputTugasan = document.getElementById('output-tugasan');
    const tugasanContent = document.getElementById('tugasan-content');
    
    // ... (Elemen lain seperti amaran, dll.) ...
    
    submitBtn.disabled = true;

    // =====================================================
    // 1️⃣ FUNGSI GENERATE SOALAN (Panggilan Gemini Pertama)
    // =====================================================
    async function generateSoalanOlehGemini(tajukPerkara, peranan) {
        // ... (Kod API Key Check dikekalkan) ...

        const promptTeks = `Anda adalah Juruaudit dan Penyiasat Tuntutan PERKESO Malaysia. Tugas anda ialah menghasilkan set soalan penyiasatan kritikal (10-12 soalan) khusus untuk **${peranan}** (Pihak yang membuat pernyataan) mengenai perkara: **${tajukPerkara}**.

Soalan WAJIB merangkumi:
1.  Jika ${peranan} adalah Pekerja: Fokus pada Jawatan, Gaji, Aktiviti Tepat semasa kejadian.
2.  Jika ${peranan} adalah Majikan: Fokus pada pengesahan tugas, kehadiran di tempat kerja, dan tindakan syarikat.
3.  Jika ${peranan} adalah Waris/Saksi: Fokus pada hubungan, pemerhatian kejadian, dan fakta berkaitan tuntutan (cth: status perkahwinan Waris).
4.  Logistik Asas: Masa, Tarikh, Lokasi Tepat, dan Punca.

Sediakan output dalam format JSON array sahaja, di mana setiap objek mempunyai kunci 'id' dan 'label'. JANGAN masukkan teks lain selain daripada array JSON.`;
        
        // ... (Kod Fetch API call dikekalkan) ...
    }

    // =====================================================
    // 2️⃣ FUNGSI JANA TUGASAN AI LANJUTAN (Panggilan Gemini Khas)
    // =====================================================
    window.janaTugasanAI = async function() {
        const tugasanInput = inputTugasan.value.trim();
        if (tugasanInput.length < 15) {
            alert("Sila masukkan tugasan yang lebih terperinci.");
            return;
        }

        outputTugasan.style.display = 'block';
        tugasanContent.textContent = '🤖 AI sedang menganalisis tugasan anda...';

        const promptTugasan = `Anda adalah seorang Penganalisis Undang-Undang PERKESO yang berpengetahuan luas. Jawab dan jalankan tugasan ini: ${tugasanInput}. Jawapan anda mesti berformat (cth: menggunakan poin bernombor atau senarai) dan ringkas. Sertakan rujukan kepada prosedur/akta Malaysia jika sesuai.`;

        const requestBody = { contents: [{ role: "user", parts: [{ text: promptTugasan }] }] };

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                // ... (API Call details) ...
            });
            const data = await response.json();
            tugasanContent.textContent = data.candidates[0].content.parts[0].text;
        } catch (error) {
            tugasanContent.textContent = '❌ Ralat memproses tugasan. Sila cuba lagi atau semak konsol.';
        }
    };

    // =====================================================
    // 3️⃣ PENGENDALI BORANG UTAMA (muatSoalanDinamik)
    // =====================================================
    window.muatSoalanDinamik = async function() {
        const tajukInput = inputTajuk.value.trim();
        const peranan = perananPembuat.options[perananPembuat.selectedIndex].value;

        // ... (Kod semakan input dikekalkan) ...

        const soalanDraf = await generateSoalanOlehGemini(tajukInput, peranan);
        
        // ... (Kod paparan soalan dijana dikekalkan, termasuk Input Wajib) ...
    };
    
    // ... (Fungsi generateLaporanNaratif, kumpulDataBorang, semakJawapan dan PENGENDALI BORANG SUBMIT dikekalkan) ...
});
