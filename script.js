// --- script.js: VERSI MUKTAMAD DENGAN DUAL-AI CALL DAN PERANAN ---

const GEMINI_API_KEY = "AIzaSyCam7BO0kqZ29B5GZUIXCRtts4MnM36_Zo"; 

document.addEventListener('DOMContentLoaded', function() {
    // --- Perolehan Elemen DOM ---
    const soalanContainer = document.getElementById('soalan-container');
    const submitBtn = document.getElementById('submit-btn');
    const amaranAI = document.getElementById('amaran-ai');
    const amaranAIText = document.getElementById('amaran-ai-text');
    const inputTajuk = document.getElementById('input-tajuk');
    const perananPembuat = document.getElementById('peranan_pembuat');
    const inputTugasan = document.getElementById('input-tugasan');
    const outputTugasan = document.getElementById('output-tugasan');
    const tugasanContent = document.getElementById('tugasan-content');

    submitBtn.disabled = true;

    // =====================================================
    // 1️⃣ FUNGSI KLASIFIKASI & PROMPT GENERATOR
    // =====================================================
    function janaPromptAI(tajuk, peranan) {
        // Prompt Sistem yang disasarkan untuk konteks PERKESO Malaysia
        return `Anda adalah Juruaudit dan Penyiasat Tuntutan PERKESO Malaysia. Tugas anda ialah menghasilkan set soalan penyiasatan kritikal (10-12 soalan) khusus untuk **${peranan}** (Pihak yang membuat pernyataan) mengenai perkara: **${tajuk}**.

Soalan WAJIB merangkumi:
1.  Fokus pada Jawatan, Gaji, Aktiviti Tepat semasa kejadian.
2.  Logistik Asas (Masa, Tarikh, Lokasi Tepat, Punca).
3.  Kecuaian dan Kewujudan Saksi.
4.  Butiran Kecederaan dan Rawatan (Hospital, Cuti Sakit).
5.  Jika ${peranan} adalah Waris/Majikan, masukkan soalan pengesahan hubungan/tindakan syarikat.

Sediakan output dalam format JSON array sahaja, di mana setiap objek mempunyai kunci 'id' dan 'label'. JANGAN masukkan teks lain selain daripada array JSON.`;
    }

    // =====================================================
    // 2️⃣ FUNGSI GENERATE SOALAN (Panggilan Gemini Pertama)
    // =====================================================
    async function generateSoalanOlehGemini(tajukPerkara, peranan) {
        // ... (Kod API Key Check dikekalkan) ...
        const promptTeks = janaPromptAI(tajukPerkara, peranan);
        
        // ... (Logik API Call dan error handling dikekalkan) ...
        // (Sila gunakan logik try/catch dan fetch API penuh dari jawapan sebelumnya di sini)
    }

    // =====================================================
    // 3️⃣ FUNGSI GENERATE LAPORAN NARATIF (Panggilan Gemini Kedua)
    // =====================================================
    async function generateLaporanNaratif(dataRingkasan) {
        // Logik laporan naratif di sini
        const promptLaporan = `Anda adalah editor laporan rasmi PERKESO. Berdasarkan fakta-fakta soalan-jawapan berikut, sila susunkan satu pernyataan naratif yang koheren, formal, dan berbentuk perenggan. Pastikan semua fakta utama dimasukkan. **Jika terdapat bahagian 'Nota Tambahan', sila integrasikan maklumat tersebut sebagai sebahagian dari Laporan Rasmi.** Mulakan naratif tanpa sebarang pengenalan atau tajuk.

        FAKTA DATA DARI PENYIASATAN:
        ---
        ${dataRingkasan}
        ---
        `;

        const requestBody = { contents: [{ role: "user", parts: [{ text: promptLaporan }] }] };
        
        try {
            // ... (Kod fetch API call dan return data dikekalkan) ...
        } catch (error) {
            return "Gagal menjana laporan naratif disebabkan ralat API/Sambungan.";
        }
    }
    
    // =====================================================
    // 4️⃣ FUNGSI KUMPUL DATA DAN UTAMA (muatSoalanDinamik)
    // =====================================================
    
    // Fungsi Pembantu: Mengumpul semua data dari borang
    function kumpulDataBorang() {
        // Pastikan anda mengumpul SEMUA input (termasuk yang wajib dan nota tambahan)
        const inputs = document.getElementById('pernyataan-form').querySelectorAll('textarea, select, input');
        let ringkasanTeks = "";
        
        inputs.forEach(input => {
             if (input.id && input.value.trim() !== '') {
                const labelElement = document.querySelector(`label[for="${input.id}"]`);
                const label = labelElement ? labelElement.textContent.replace(/[:*]/g, '').trim() : input.id;
                
                ringkasanTeks += `${label}: ${input.value.trim()}\n`;
             }
        });
        
        return ringkasanTeks;
    }

    window.muatSoalanDinamik = async function() {
        // Logik untuk mencetuskan generateSoalanOlehGemini
        // ... (kod ini dikekalkan) ...
    };

    // =====================================================
    // 5️⃣ FUNGSI TUGASAN AI LANJUTAN (MODUL 2)
    // =====================================================
    window.janaTugasanAI = async function() {
        // Logik untuk menjana tugasan AI lanjut
        // ... (kod ini dikekalkan) ...
    };

    // =====================================================
    // 6️⃣ PENGENDALI BORANG SUBMIT (MENCETUSKAN LAPORAN NARATIF)
    // =====================================================
    document.getElementById('pernyataan-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menjana Pernyataan Naratif... Sila Tunggu';

        const naratifPromptData = kumpulDataBorang();
        
        if (!naratifPromptData) {
            alert("Sila isi borang sebelum menjana laporan.");
            submitBtn.textContent = 'Jana Pernyataan Naratif Akhir';
            submitBtn.disabled = false;
            return;
        }

        const laporanNaratif = await generateLaporanNaratif(naratifPromptData);
        
        // Paparkan output laporan naratif
        soalanContainer.innerHTML = `
            <div class="question-group" style="border-left: 5px solid #28a745; background-color: #e6ffe6;">
                <h2>✅ Laporan Naratif Rasmi (Sedia Disalin)</h2>
                <p><strong>Tajuk Perkara:</strong> ${inputTajuk.value}</p>
                <hr>
                <div style="white-space: pre-wrap; font-size: 1.1em; line-height: 1.6; padding: 10px;">${laporanNaratif}</div>
            </div>
            <p>Sila salin teks di atas untuk dimasukkan ke dalam dokumen rasmi PERKESO.</p>
        `;
        
        console.log("=================================================");
        console.log("✅ LAPORAN NARATIF AKHIR PERNYATAAN");
        console.log("-------------------------------------------------");
        console.log(laporanNaratif);
        console.log("=================================================");
        
        submitBtn.textContent = 'Sediakan Ringkasan Pernyataan';
    });
    
    // ... (Fungsi semakJawapan dan penutup DOMContentLoaded) ...
});
