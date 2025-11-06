// --- script.js: VERSI MUKTAMAD (MODEL PRO) ---

// Kunci API Gemini anda yang sah
const GEMINI_API_KEY = "AIzaSyCam7BO0kqZ29B5GZUIXCRtts4MnM36_Zo"; 

// Tentukan model yang hendak digunakan (Pro)
const GEMINI_MODEL = "gemini-2.5-pro";

// Bungkus semua kod logik di dalam DOMContentLoaded
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
    const generateBtn = document.getElementById('generate-btn'); 
    const tugasanBtn = document.getElementById('tugasan-btn'); 
    
    submitBtn.disabled = true;

    // =====================================================
    // FUNGSI 1: GENERATE SOALAN (Panggilan Gemini Pertama)
    // =====================================================
    async function generateSoalanOlehGemini(tajukPerkara, peranan) {
        soalanContainer.innerHTML = '<p class="placeholder-text">🤖 Gemini Pro sedang merangka soalan... Sila tunggu.</p>';
        submitBtn.disabled = true;

        const promptTeks = `Anda adalah Juruaudit dan Penyiasat Tuntutan PERKESO Malaysia. Tugas anda ialah menghasilkan set soalan penyiasatan kritikal (10-12 soalan) khusus untuk **${peranan}** (Pihak yang membuat pernyataan) mengenai perkara: **${tajukPerkara}**.

Soalan WAJIB merangkumi:
1.  Fokus pada Jawatan, Gaji, Aktiviti Tepat semasa kejadian.
2.  Logistik Asas (Masa, Tarikh, Lokasi Tepat, Punca).
3.  Kecuaian dan Kewujudan Saksi.
4.  Butiran Kecederaan dan Rawatan (Hospital, Cuti Sakit).
5.  Jika ${peranan} adalah Waris/Majikan, masukkan soalan pengesahan hubungan/tindakan syarikat.

Sediakan output dalam format JSON array sahaja, di mana setiap objek mempunyai kunci 'id' dan 'label'. JANGAN masukkan teks lain selain daripada array JSON.`;

        const requestBody = { contents: [{ role: "user", parts: [{ text: promptTeks }] }] };
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            const jsonText = data.candidates[0].content.parts[0].text;
            let cleanText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim(); 
            return JSON.parse(cleanText);

        } catch (error) {
            console.error("Ralat memanggil/parsing JSON:", error);
            soalanContainer.innerHTML = '<p class="warning-box">❌ Gemini GAGAL merangka soalan. Sila semak konsol.</p>';
            return null;
        }
    }

    // =====================================================
    // FUNGSI 2: GENERATE LAPORAN NARATIF (Panggilan Gemini Kedua)
    // =====================================================
    async function generateLaporanNaratif(dataRingkasan) {
        submitBtn.textContent = 'Menjana Laporan Naratif...';
        
        const promptLaporan = `Anda adalah editor laporan rasmi PERKESO. Berdasarkan fakta-fakta soalan-jawapan berikut, sila susunkan satu pernyataan naratif yang koheren, formal, dan berbentuk perenggan. Pastikan semua fakta utama (Nama, IC, Jawatan, Gaji, Masa, Tarikh, Lokasi, Kecederaan, Rawatan) dimasukkan. **Jika terdapat bahagian 'Nota Tambahan Penyiasat', sila integrasikan maklumat tersebut sebagai sebahagian dari Laporan Rasmi.** Mulakan naratif tanpa sebarang pengenalan atau tajuk.

        FAKTA DATA DARI PENYIASATAN:
        ---
        ${dataRingkasan}
        ---
        `;

        const requestBody = { contents: [{ role: "user", parts: [{ text: promptLaporan }] }] };
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;

        } catch (error) {
            console.error("Ralat menjana Laporan Naratif:", error);
            return "Gagal menjana laporan naratif disebabkan ralat API/Sambungan.";
        }
    }

    // =====================================================
    // FUNGSI 3: JANA TUGASAN AI LANJUTAN (Panggilan Gemini Ketiga)
    // =====================================================
    async function janaTugasanAI() {
        const tugasanInput = inputTugasan.value.trim();
        if (tugasanInput.length < 15) {
            alert("Sila masukkan tugasan yang lebih terperinci.");
            return;
        }

        outputTugasan.style.display = 'block';
        tugasanContent.textContent = '🤖 AI Pro sedang menganalisis tugasan anda...';

        const promptTugasan = `Anda adalah seorang Penganalisis Undang-Undang PERKESO. Jawab dan jalankan tugasan ini: ${tugasanInput}. Jawapan anda mesti berformat dan ringkas. Sertakan rujukan kepada prosedur/akta Malaysia jika sesuai.`;

        const requestBody = { contents: [{ role: "user", parts: [{ text: promptTugasan }] }] };
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody)
            });
            const data = await response.json();
            tugasanContent.textContent = data.candidates[0].content.parts[0].text;
        } catch (error) {
            tugasanContent.textContent = '❌ Ralat memproses tugasan. Sila cuba lagi atau semak konsol.';
        }
    }

    // =====================================================
    // FUNGSI 4: PEMBANTU & PENGENDALI BORANG UTAMA
    // =====================================================
    
    // Fungsi Pembantu: Mengumpul semua data dari borang
    function kumpulDataBorang() {
        const inputs = document.getElementById('pernyataan-form').querySelectorAll('textarea, select, input');
        let ringkasanTeks = "";
        
        inputs.forEach(input => {
             if (input.id && input.value.trim() !== '') {
                const labelElement = document.querySelector(`label[for="${input.id}"]`);
                const label = labelElement ? labelElement.textContent.replace(/[:*()]/g, '').trim() : input.id;
                
                ringkasanTeks += `${label}: ${input.value.trim()}\n`;
             }
        });
        
        return ringkasanTeks;
    }

    // Pengendali Butang Rangka Soalan
    async function muatSoalanDinamik() {
        const tajukInput = inputTajuk.value.trim();
        const peranan = perananPembuat.options[perananPembuat.selectedIndex].value;

        if (tajukInput.length < 8) {
            alert("Sila masukkan tajuk yang lebih spesifik.");
            return;
        }
        
        const soalanDraf = await generateSoalanOlehGemini(tajukInput, peranan);
        soalanContainer.innerHTML = ''; // Kosongkan soalan lama

        if (soalanDraf && soalanDraf.length > 0) {
            let htmlContent = '<h3>Soalan Khusus (Dijana AI)</h3>';
            
            soalanDraf.forEach((q, index) => {
                const group = document.createElement('div');
                group.className = 'question-group';
                
                const inputField = `<textarea id="${q.id || 'soalan_'_ + index}" data-kategori="DYNAMIC" oninput="semakJawapan(this)"></textarea>`;

                group.innerHTML = `<label for="${q.id || 'soalan_' + index}">${(index + 1)}. ${q.label || 'Soalan Tidak Diketahui'}</label>${inputField}`;
                htmlContent += group.outerHTML;
            });
            
            soalanContainer.innerHTML = htmlContent;
            submitBtn.disabled = false;
        } else if (soalanDraf) {
             soalanContainer.innerHTML = '<p class="warning-box">Gemini berjaya dihubungi tetapi output soalan adalah kosong.</p>';
        }
    }

    // Fungsi semakJawapan (dijadikan global untuk diakses oleh `oninput` di HTML)
    window.semakJawapan = function(element) {
        const jawapan = element.value.trim();
        amaranAI.classList.add('hidden'); 

        if (jawapan.length > 0 && jawapan.length < 20) {
            amaranAIText.innerHTML = '⚠️ **Jawapan Terlalu Ringkas!** Kenyataan fakta memerlukan huraian yang terperinci.';
            amaranAI.classList.remove('hidden');
        }
    };

    // =====================================================
    // 5️⃣ PENGENDALI ACARA (EVENT LISTENERS) - MENGELAKKAN Ralat ReferenceError
    // =====================================================
    
    // Memautkan butang ke fungsi JavaScript
    generateBtn.addEventListener('click', muatSoalanDinamik);
    tugasanBtn.addEventListener('click', janaTugasanAI);

    // PENGENDALI BORANG SUBMIT (Panggilan Gemini Kedua untuk Laporan)
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
        
        submitBtn.textContent = 'Selesai! Terima Kasih';
    });

}); // TAMAT DOMContentLoaded
