// --- script.js: BAHAGIAN AWAL (Perbaikan Ralat Rujukan) ---

// Dapatkan rujukan elemen DOM (PENTING: Pindahkan ke atas untuk mengatasi ReferenceError)
const soalanContainer = document.getElementById('soalan-container');
const submitBtn = document.getElementById('submit-btn');
const amaranAI = document.getElementById('amaran-ai');
const amaranAIText = document.getElementById('amaran-ai-text');
const inputTajuk = document.getElementById('input-tajuk');


// Masukkan API Key anda
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_DI_SINI"; 


// FUNGSI 1: Memanggil Gemini untuk Merangka Soalan
async function generateSoalanOlehGemini(tajukPerkara) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_DI_SINI") {
        soalanContainer.innerHTML = '<p class="warning-box">Sila masukkan Gemini API Key yang sah untuk mengaktifkan fungsi ini.</p>';
        return null;
    }

    // Gantikan "skenario" dengan "perkara"
    soalanContainer.innerHTML = '<p class="placeholder-text">🤖 Gemini sedang merangka soalan... Sila tunggu.</p>';
    submitBtn.disabled = true;

    // Prompt yang mengarahkan Gemini untuk fokus kepada konteks PERKESO Malaysia
    const promptTeks = `Anda adalah Pegawai Penyiasat Bencana Kerja PERKESO Malaysia. Tugas anda adalah merangka set soalan panduan yang sangat kritikal (5-8 soalan) untuk penyiasat bagi perkara: **${tajukPerkara}**. Soalan mesti berfokus kepada faktor penentu kelayakan tuntutan PERKESO (cth: rute, masa, tugas rasmi, perincian insiden). Sediakan jawapan dalam format JSON array sahaja, di mana setiap objek mempunyai kunci 'id' (dalam format snake_case) dan 'label'. JANGAN masukkan sebarang teks lain selain array JSON.`;

    const requestBody = {
        contents: [{ role: "user", parts: [{ text: promptTeks }] }],
        config: {
            responseMimeType: "application/json", 
        }
    };
    
    // Panggilan API ke Gemini
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        const jsonText = data.candidates[0].content.parts[0].text;
        const soalanArray = JSON.parse(jsonText);
        
        return soalanArray;

    } catch (error) {
        console.error("Ralat memanggil Gemini API:", error);
        soalanContainer.innerHTML = '<p class="warning-box">❌ Ralat API. Sila semak API Key dan konsol.</p>';
        return null;
    }
}


// FUNGSI 2: Muat Soalan Draf ke Page menggunakan Input Teks Dinamik
window.muatSoalanDinamik = async function() {
    const tajukInput = inputTajuk.value.trim();

    if (tajukInput.length < 10) {
        alert("Sila masukkan tajuk perkara yang lebih spesifik (sekurang-kurangnya 10 aksara).");
        return;
    }
    
    // Panggil Gemini menggunakan input tajuk pengguna
    const soalanDraf = await generateSoalanOlehGemini(tajukInput);

    soalanContainer.innerHTML = ''; // Kosongkan container
    
    if (soalanDraf && soalanDraf.length > 0) {
        // Bina borang
        soalanDraf.forEach((q, index) => {
            const group = document.createElement('div');
            group.className = 'question-group';
            
            // Kita gunakan textarea sebagai input default yang paling fleksibel
            const inputField = `<textarea id="${q.id || 'soalan_' + index}" data-kategori="DYNAMIC" oninput="semakJawapan(this)"></textarea>`;

            group.innerHTML = `<label for="${q.id || 'soalan_' + index}">${(index + 1)}. ${q.label || 'Soalan Tidak Diketahui'}</label>${inputField}`;
            soalanContainer.appendChild(group);
        });
        submitBtn.disabled = false;
    } else if (soalanDraf) {
         soalanContainer.innerHTML = '<p class="warning-box">Gemini tidak menghasilkan soalan. Sila cuba lagi atau semak output API.</p>';
    }
    
    // Logik semakJawapan dan submit dikekalkan
};

// ... (Kekalkan fungsi semakJawapan dan submit form di bawah ini) ...

// FUNGSI 3: Logik AI Asas (Pengesan Risiko & Pencetus Amaran)
// Walaupun soalan dijanakan Gemini, kita boleh gunakan logik ini untuk menganalisis input
window.semakJawapan = function(element) {
    const jawapan = element.value.trim();
    let amaranDipicu = false;
    
    amaranAI.classList.add('hidden'); 

    // LOGIK UMUM: Jawapan Terlalu Ringkas (Risiko maklumat tidak lengkap)
    // Walaupun soalan dijana, kita masih pastikan jawapan adalah berkualiti
    if (jawapan.length > 0 && element.tagName.toLowerCase() === 'textarea' && jawapan.length < 20) {
        amaranAIText.innerHTML = '⚠️ **Jawapan Terlalu Ringkas!** Kenyataan fakta memerlukan huraian yang terperinci. Sila masukkan maklumat yang lebih lengkap.';
        amaranDipicu = true;
    }
    
    if (amaranDipicu) {
        amaranAI.classList.remove('hidden');
    }
};


// FUNGSI 4: Logik Hantar Borang (Tempat Integrasi Firebase)
document.getElementById('pernyataan-form').addEventListener('submit', function(e) {
    e.preventDefault();
    submitBtn.disabled = true;

    // ... (Logik untuk mengumpul data dan hantar ke Firebase) ...
    
    alert(`✅ Borang Sedia! Sila masukkan kod Firebase Firestore anda di dalam fungsi submit ini.`);
    
    // Reset selepas hantar
    document.getElementById('pernyataan-form').reset();
    submitBtn.disabled = false;
});
