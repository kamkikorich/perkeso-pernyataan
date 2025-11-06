// --- script.js: VERSI MUKTAMAD DENGAN DUAL-AI CALL ---

// Kunci API Gemini yang telah diaktifkan
const GEMINI_API_KEY = "AIzaSyCam7BO0kqZ29B5GZUIXCRtts4MnM36_Zo"; 


// PENTING: Bungkus semua kod logik di dalam DOMContentLoaded untuk mengelakkan ReferenceError
document.addEventListener('DOMContentLoaded', function() {
    // --- Perolehan Elemen DOM ---
    const soalanContainer = document.getElementById('soalan-container');
    const submitBtn = document.getElementById('submit-btn');
    const amaranAI = document.getElementById('amaran-ai');
    const amaranAIText = document.getElementById('amaran-ai-text');
    const inputTajuk = document.getElementById('input-tajuk');
    
    // Tetapan awal
    submitBtn.disabled = true;

    // =====================================================
    // 1️⃣ FUNGSI GENERATE SOALAN (Panggilan Gemini Pertama)
    // =====================================================
    async function generateSoalanOlehGemini(tajukPerkara) {
        if (!GEMINI_API_KEY) {
            soalanContainer.innerHTML = '<p class="warning-box">Sila masukkan Gemini API Key yang sah untuk mengaktifkan fungsi ini.</p>';
            return null;
        }

        // Tunjukkan status loading
        soalanContainer.innerHTML = '<p class="placeholder-text">🤖 Gemini sedang merangka soalan... Sila tunggu.</p>';
        submitBtn.disabled = true;

        // PROMPT SISTEM MUKTAMAD: Menekankan Fakta Kritikal PERKESO
        const promptTeks = `Anda adalah Juruaudit dan Penyiasat Tuntutan PERKESO Malaysia. Tugas anda adalah merangka set soalan panduan yang sangat kritikal dan terperinci (12-15 soalan) untuk penyiasat bagi perkara: **${tajukPerkara}**. Soalan mesti membolehkan penyiasat melengkapkan Borang Tuntutan PERKESO.

Soalan WAJIB merangkumi:
1.  **Aktiviti Tepat Semasa Kejadian:** Soalan secara eksplisit meminta apakah aktiviti sebenar yang sedang dilakukan pada saat kemalangan berlaku.
2.  **LOGISTIK ASAS:** Masa, Tarikh, Lokasi Tepat, dan Punca (Bagaimana ia berlaku).
3.  **KLINIKAL & SOKONGAN:** Jenis Kecederaan, Nama Fasiliti Rawatan (Hospital/Klinik), Jumlah Cuti Sakit (MC) yang diberikan, dan Kewujudan Saksi.

Sediakan output dalam format JSON array sahaja, di mana setiap objek mempunyai kunci 'id' (dalam format snake_case) dan 'label'. JANGAN masukkan sebarang teks lain atau pengenalan selain daripada array JSON.`;

        const requestBody = { contents: [{ role: "user", parts: [{ text: promptTeks }] }] };
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
            soalanContainer.innerHTML = '<p class="warning-box">❌ Gemini GAGAL merangka soalan. Sila semak Konsol (F12) untuk maklumat ralat.</p>';
            return null;
        }
    }

    // =====================================================
    // 2️⃣ FUNGSI GENERATE LAPORAN NARATIF (Panggilan Gemini Kedua)
    // =====================================================
    async function generateLaporanNaratif(dataRingkasan) {
        submitBtn.textContent = 'Menjana Laporan Naratif...';
        
        const promptLaporan = `Anda adalah editor laporan rasmi PERKESO. Berdasarkan fakta-fakta soalan-jawapan berikut, sila susunkan satu pernyataan naratif yang koheren, formal, dan berbentuk perenggan. Pastikan semua fakta utama (Nama, IC, Jawatan, Gaji, Masa, Tarikh, Lokasi, Kecederaan, Rawatan) dimasukkan. Mulakan naratif tanpa sebarang pengenalan atau tajuk.

        FAKTA DATA DARI PENYIASATAN:
        ---
        ${dataRingkasan}
        ---
        `;

        const requestBody = { contents: [{ role: "user", parts: [{ text: promptLaporan }] }] };
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
    // 3️⃣ FUNGSI PENGENDALI BORANG DAN SUBMIT
    // =====================================================
    
    // Fungsi Pembantu: Mengumpul semua data dari borang
    function kumpulDataBorang() {
        const inputs = document.getElementById('pernyataan-form').querySelectorAll('textarea, select, input');
        let ringkasanTeks = "";
        
        inputs.forEach(input => {
             if (input.id && input.value.trim() !== '') {
                const labelElement = document.querySelector(`label[for="${input.id}"]`);
                // Gunakan label sebagai kunci, jika tidak ada, guna ID
                const label = labelElement ? labelElement.textContent.replace(/[:*]/g, '').trim() : input.id;
                
                ringkasanTeks += `${label}: ${input.value.trim()}\n`;
             }
        });
        
        return ringkasanTeks;
    }

    // Pengendali Butang Rangka Soalan
    window.muatSoalanDinamik = async function() {
        const tajukInput = inputTajuk.value.trim();

        if (tajukInput.length < 10) {
            alert("Sila masukkan tajuk perkara yang lebih spesifik.");
            return;
        }
        
        const soalanDraf = await generateSoalanOlehGemini(tajukInput);

        // Hanya masukkan soalan dinamik di bawah maklumat wajib sedia ada
        const inputWajibDiv = document.querySelector('.wajib-fakta');
        let htmlContent = '<h3>Soalan Khusus (Dijana AI)</h3>';

        if (soalanDraf && soalanDraf.length > 0) {
            // Bina borang dari output Gemini
            soalanDraf.forEach((q, index) => {
                const group = document.createElement('div');
                group.className = 'question-group';
                
                const inputField = `<textarea id="${q.id || 'soalan_' + index}" data-kategori="DYNAMIC" oninput="semakJawapan(this)"></textarea>`;

                group.innerHTML = `<label for="${q.id || 'soalan_' + index}">${(index + 1)}. ${q.label || 'Soalan Tidak Diketahui'}</label>${inputField}`;
                htmlContent += group.outerHTML;
            });
            
            soalanContainer.innerHTML = htmlContent;
            submitBtn.disabled = false;
        } else if (soalanDraf) {
             soalanContainer.innerHTML = '<p class="warning-box">Gemini berjaya dihubungi tetapi output soalan adalah kosong. Sila cuba lagi.</p>';
        }
    };
    
    // Fungsi semakJawapan (Logik AI Asas untuk kualiti input)
    window.semakJawapan = function(element) {
        const jawapan = element.value.trim();
        let amaranDipicu = false;
        amaranAI.classList.add('hidden'); 

        // Logik umum (Jawapan Terlalu Ringkas)
        if (jawapan.length > 0 && element.tagName.toLowerCase() === 'textarea' && jawapan.length < 20) {
            amaranAIText.innerHTML = '⚠️ **Jawapan Terlalu Ringkas!** Kenyataan fakta memerlukan huraian yang terperinci.';
            amaranDipicu = true;
        }
        
        if (amaranDipicu) {
            amaranAI.classList.remove('hidden');
        }
    };

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
        
        // Paparkan output
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

}); // TAMAT DOMContentLoaded
