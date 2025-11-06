// --- script.js: BAHAGIAN KONFIGURASI GLOBAL ---

// Kunci API Gemini yang telah diaktifkan
// PENTING: Kunci anda yang sah
const GEMINI_API_KEY = "AIzaSyCam7BO0kqZ29B5GZUIXCRtts4MnM36_Zo"; 


// PENTING: Bungkus semua kod logik di dalam DOMContentLoaded untuk mengelakkan ReferenceError
document.addEventListener('DOMContentLoaded', function() {
    // --- Perbaikan Ralat Rujukan (ReferenceError) ---
    const soalanContainer = document.getElementById('soalan-container');
    const submitBtn = document.getElementById('submit-btn');
    const amaranAI = document.getElementById('amaran-ai');
    const amaranAIText = document.getElementById('amaran-ai-text');
    const inputTajuk = document.getElementById('input-tajuk');
    
    // Lumpuhkan butang submit pada mulanya
    submitBtn.disabled = true;

    // ----------------------------------------------------
    // KOD FUNGSI GENERATE SOALAN OLEH GEMINI
    // ----------------------------------------------------
    async function generateSoalanOlehGemini(tajukPerkara) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_DI_SINI") {
            soalanContainer.innerHTML = '<p class="warning-box">Sila masukkan Gemini API Key yang sah untuk mengaktifkan fungsi ini.</p>';
            return null;
        }

        // Tunjukkan status loading
        soalanContainer.innerHTML = '<p class="placeholder-text">🤖 Gemini sedang merangka soalan... Sila tunggu.</p>';
        submitBtn.disabled = true;

        // PROMPT SISTEM BAHARU: Fokus pada Fakta, Logistik, Gaji, dan Rawatan
        const promptTeks = `Anda adalah Juruaudit dan Penyiasat Tuntutan PERKESO Malaysia. Tugas anda adalah merangka set soalan panduan yang sangat kritikal (10-12 soalan) untuk penyiasat bagi perkara: **${tajukPerkara}**. 

Soalan WAJIB merangkumi:
1. Fakta Asas Kejadian (Masa, Tarikh, Lokasi Tepat, Punca).
2. Perincian Pekerjaan (Tempoh bertugas di syarikat, Gaji bulanan, Bidang Tugas Rasmi, Waktu Bekerja Rasmi).
3. Perincian Kecederaan dan Rawatan (Jenis kecederaan, Tempat rawatan (Hospital/Klinik), tempoh Cuti Sakit (MC) yang diberikan).
4. Kewujudan Saksi dan Laporan Polis/Majikan.

Sediakan output dalam format JSON array sahaja, di mana setiap objek mempunyai kunci 'id' (dalam format snake_case) dan 'label'. JANGAN masukkan sebarang teks lain atau pengenalan selain daripada array JSON.`;

        const requestBody = {
            contents: [{ role: "user", parts: [{ text: promptTeks }] }],
        };
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            if (data.error) {
                soalanContainer.innerHTML = `<p class="warning-box">❌ Ralat API. Sila semak konsol (F12) untuk detail. (${data.error.message})</p>`;
                return null;
            }

            const jsonText = data.candidates[0].content.parts[0].text;
            
            // Mekanisme Pembersihan JSON (Untuk mengelakkan ralat parsing)
            let cleanText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim(); 
            
            const soalanArray = JSON.parse(cleanText);
            
            return soalanArray;

        } catch (error) {
            console.error("Ralat Parsing JSON selepas panggilan API:", error);
            soalanContainer.innerHTML = '<p class="warning-box">❌ Gemini dihubungi tetapi GAGAL merangka jawapan dalam format JSON yang betul. Sila cuba tajuk yang berbeza.</p>';
            return null;
        }
    }


    // ----------------------------------------------------
    // KOD FUNGSI MUAT SOALAN DINAMIK (PENGENDALI UTAMA)
    // ----------------------------------------------------
    window.muatSoalanDinamik = async function() {
        const tajukInput = inputTajuk.value.trim();

        if (tajukInput.length < 10) {
            alert("Sila masukkan tajuk perkara yang lebih spesifik (sekurang-kurangnya 10 aksara).");
            return;
        }
        
        const soalanDraf = await generateSoalanOlehGemini(tajukInput);

        soalanContainer.innerHTML = ''; // Kosongkan container
        
        if (soalanDraf && soalanDraf.length > 0) {
            // Bina borang
            soalanDraf.forEach((q, index) => {
                const group = document.createElement('div');
                group.className = 'question-group';
                
                // Gunakan textarea yang paling fleksibel
                const inputField = `<textarea id="${q.id || 'soalan_' + index}" data-kategori="DYNAMIC" oninput="semakJawapan(this)"></textarea>`;

                group.innerHTML = `<label for="${q.id || 'soalan_' + index}">${(index + 1)}. ${q.label || 'Soalan Tidak Diketahui'}</label>${inputField}`;
                soalanContainer.appendChild(group);
            });
            submitBtn.disabled = false;
        } else if (soalanDraf) {
             soalanContainer.innerHTML = '<p class="warning-box">Gemini berjaya dihubungi tetapi output soalan adalah kosong. Sila cuba lagi.</p>';
        }
    };


    // ----------------------------------------------------
    // KOD FUNGSI SEMAK JAWAPAN DAN SUBMIT
    // ----------------------------------------------------
    
    // Fungsi semakJawapan (Logik AI Asas untuk kualiti input)
    window.semakJawapan = function(element) {
        const jawapan = element.value.trim();
        let amaranDipicu = false;
        
        amaranAI.classList.add('hidden'); 

        // Logik umum (Jawapan Terlalu Ringkas)
        if (jawapan.length > 0 && element.tagName.toLowerCase() === 'textarea' && jawapan.length < 20) {
            amaranAIText.innerHTML = '⚠️ **Jawapan Terlalu Ringkas!** Kenyataan fakta memerlukan huraian yang terperinci. Sila masukkan maklumat yang lebih lengkap.';
            amaranDipicu = true;
        }
        
        if (amaranDipicu) {
            amaranAI.classList.remove('hidden');
        }
    };

    // PENGENDALI BORANG SUBMIT (Simulasi)
    document.getElementById('pernyataan-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitBtn.disabled = true;

        // Kumpul Data dan Sediakan Ringkasan
        const inputs = document.getElementById('pernyataan-form').querySelectorAll('textarea, select, input');
        let ringkasanData = {};
        
        inputs.forEach(input => {
             if (input.id) {
                ringkasanData[input.id] = input.value;
             }
        });
        
        // Paparkan output
        console.log("=================================================");
        console.log("✅ RINGKASAN DATA PERNYATAAN (Sedia untuk Laporan)");
        console.log("Tajuk Perkara:", inputTajuk.value);
        console.log("-------------------------------------------------");
        console.log(ringkasanData);
        console.log("=================================================");
        
        alert(`✅ Pernyataan Berjaya Dihantar! Data telah dikumpul di Konsol Log (F12).`);
        
        // Reset selepas hantar
        document.getElementById('pernyataan-form').reset();
        soalanContainer.innerHTML = '<p class="placeholder-text">Sila masukkan tajuk perkara di atas untuk memulakan borang pernyataan.</p>';
        submitBtn.disabled = false;
    });

}); // TAMAT DOMContentLoaded
