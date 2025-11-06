// --- script.js: VERSI MUKTAMAD DENGAN DUAL-AI CALL ---

const GEMINI_API_KEY = "AIzaSyCam7BO0kqZ29B5GZUIXCRtts4MnM36_Zo"; 
// Gantikan dengan kunci anda yang sah. Kunci yang diberikan di atas adalah sebagai contoh.

document.addEventListener('DOMContentLoaded', function() {
    const soalanContainer = document.getElementById('soalan-container');
    const submitBtn = document.getElementById('submit-btn');
    const amaranAI = document.getElementById('amaran-ai');
    const amaranAIText = document.getElementById('amaran-ai-text');
    const inputTajuk = document.getElementById('input-tajuk');
    
    submitBtn.disabled = true;

    // =====================================================
    // 1️⃣ Fungsi Klasifikasi Tajuk (Logik AI Lokal)
    // =====================================================
    function klasifikasiTajuk(tajuk) {
        const lower = tajuk.toLowerCase();
        if (lower.includes("tempat kerja")) return "kemalangan_tempat_kerja";
        if (lower.includes("perjalanan ke") || lower.includes("pergi kerja")) return "kemalangan_pergi_kerja";
        if (lower.includes("balik kerja") || lower.includes("pulang")) return "kemalangan_balik_kerja";
        if (lower.includes("majikan") || lower.includes("penyelia")) return "pernyataan_majikan";
        if (lower.includes("saksi") || lower.includes("rakan")) return "pernyataan_saksi";
        if (lower.includes("outstation") || lower.includes("luar kawasan")) return "kemalangan_outstation";
        return "umum";
    }

    // =====================================================
    // 2️⃣ Fungsi Jana Prompt AI Berdasarkan Kategori
    // =====================================================
    function janaPromptAI(tajuk, kategori) {
        // Prompt ini kini lebih ringkas kerana input wajib akan diambil di HTML
        return `Anda adalah Juruaudit dan Penyiasat Tuntutan PERKESO Malaysia. 
Tugas anda ialah menghasilkan set soalan penyiasatan yang kritikal (10-12 soalan) untuk kategori kes: **${tajuk}** (${kategori}).

Fokuskan soalan WAJIB kepada:
1. Aktiviti Tepat Semasa Kejadian (sewaktu kemalangan).
2. Logistik Asas (Masa, Tarikh, Lokasi Tepat, Punca).
3. Kecederaan dan Rawatan (Jenis kecederaan, Hospital/Klinik, Cuti Sakit MC).
4. Kewujudan Saksi.

Format output MESTI: [{"id": "soalan_1", "label": "Teks Soalan 1"}, ...]
JANGAN masukkan teks lain, hanya JSON array tulen.`;
    }

    // =====================================================
    // 3️⃣ Fungsi Panggilan API Gemini (Jana Soalan)
    // =====================================================
    async function generateSoalanOlehGemini(tajukPerkara) {
        const kategori = klasifikasiTajuk(tajukPerkara);
        const promptTeks = janaPromptAI(tajukPerkara, kategori);

        soalanContainer.innerHTML = '<p class="placeholder-text">🤖 Gemini sedang merangka soalan... Sila tunggu.</p>';
        submitBtn.disabled = true;

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
            const cleanText = jsonText.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanText);

        } catch (error) {
            console.error("Ralat Panggilan/Parsing JSON:", error);
            soalanContainer.innerHTML = '<p class="warning-box">❌ Gagal menjana soalan. Cuba tajuk lain.</p>';
            return null;
        }
    }

    // =====================================================
    // 4️⃣ Fungsi Panggilan API Gemini (Jana Laporan Naratif)
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
            return "Gagal menjana laporan naratif disebabkan ralat API/Sambungan. Data mentah telah dikumpul.";
        }
    }

    // =====================================================
    // 5️⃣ Fungsi Paparan Soalan Dinamik & Input Wajib
    // =====================================================
    window.muatSoalanDinamik = async function() {
        const tajukInput = inputTajuk.value.trim();
        if (tajukInput.length < 8) {
            alert("Sila masukkan tajuk yang lebih spesifik (sekurang-kurangnya 8 aksara).");
            return;
        }

        const soalanDraf = await generateSoalanOlehGemini(tajukInput);
        soalanContainer.innerHTML = '';
        if (!soalanDraf || soalanDraf.length === 0) return;

        // Input Wajib Awal (Fakta Kritikal)
        let htmlContent = `
            <div class="question-group" style="background-color: #e6f7ff;">
                <h3>Maklumat Pekerjaan Wajib</h3>
                <label for="nama_pekerja">Nama Penuh Pekerja:</label><input type="text" id="nama_pekerja" placeholder="Contoh: Mohd Ali Bin Ahmad"><br>
                <label for="ic_pekerja">Kad Pengenalan / Passport:</label><input type="text" id="ic_pekerja" placeholder="Contoh: 900101-10-5001"><br>
                <label for="jawatan_rasmi">Jawatan Rasmi:</label><input type="text" id="jawatan_rasmi" placeholder="Contoh: Juruteknik Kanan"><br>
                <label for="gaji_bulanan">Gaji Pokok / Purata Bulanan:</label><input type="text" id="gaji_bulanan" placeholder="Contoh: RM 3500.00">
            </div>
            <h3>Soalan Khusus (Dijana AI)</h3>
        `;
        
        // Input Soalan Dijana
        soalanDraf.forEach((q, index) => {
            const group = document.createElement('div');
            group.className = 'question-group';
            const inputField = `<textarea id="${q.id || 'soalan_' + index}" data-kategori="DYNAMIC" oninput="semakJawapan(this)"></textarea>`;
            group.innerHTML = `<label for="${q.id || 'soalan_' + index}">${index + 1}. ${q.label}</label>${inputField}`;
            htmlContent += group.outerHTML;
        });

        soalanContainer.innerHTML = htmlContent;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Jana Pernyataan Naratif Akhir';
    };

    // =====================================================
    // 6️⃣ Fungsi Semakan & Submit (Integrasi Laporan Naratif)
    // =====================================================
    window.semakJawapan = function(element) {
        const jawapan = element.value.trim();
        amaranAI.classList.add('hidden');
        if (jawapan.length > 0 && jawapan.length < 25) {
            amaranAIText.innerHTML = '⚠️ Jawapan terlalu ringkas. Sila beri keterangan yang lebih terperinci.';
            amaranAI.classList.remove('hidden');
        }
    };

    document.getElementById('pernyataan-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses... Sila Tunggu';

        const inputs = document.querySelectorAll('#pernyataan-form textarea, input, select');
        let ringkasanData = {};
        let naratifPromptData = "";

        inputs.forEach(input => {
            if (input.id && input.value.trim() !== '') {
                const labelElement = document.querySelector(`label[for="${input.id}"]`);
                const label = labelElement ? labelElement.textContent.replace(/:/g, '').trim() : input.id;
                
                ringkasanData[label] = input.value.trim();
                naratifPromptData += `${label}: ${input.value.trim()}\n`;
            }
        });
        
        // Panggil Gemini untuk menjana laporan naratif
        const laporanNaratif = await generateLaporanNaratif(naratifPromptData);

        // Paparkan output naratif akhir
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
        console.log("=== LAPORAN NARATIF AKHIR (Sedia untuk Salinan) ===");
        console.log(laporanNaratif);
        console.log("=== DATA MENTAH DIKUMPUL ===");
        console.table(ringkasanData);
    });
});
