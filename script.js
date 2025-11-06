// --- script.js: Kemas Kini Fungsi ---

// Gantikan ini dengan API Key anda (ATAU gunakan Firebase Functions untuk keselamatan)
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_DI_SINI"; 
// Dapatkan rujukan elemen baharu
const inputTajuk = document.getElementById('input-tajuk');


// FUNGSI 1: Memanggil Gemini untuk Merangka Soalan (TIADA PERUBAHAN BESAR PADA LOGIK INI)
async function generateSoalanOlehGemini(tajukSkenario) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_DI_SINI") {
        // ... (Logik amaran API Key dikekalkan) ...
        soalanContainer.innerHTML = '<p class="warning-box">Sila masukkan Gemini API Key yang sah untuk mengaktifkan fungsi ini.</p>';
        return null;
    }

    soalanContainer.innerHTML = '<p class="placeholder-text">🤖 Gemini sedang merangka soalan... Sila tunggu.</p>';
    submitBtn.disabled = true;

    // Prompt yang MENGARAHKAN GEMINI ke konteks PERKESO
    const promptTeks = `Anda adalah Pegawai Penyiasat Bencana Kerja PERKESO Malaysia. Tugas anda adalah merangka set soalan panduan yang sangat kritikal (5-8 soalan) untuk penyiasat bagi kes: **${tajukSkenario}**. Soalan mesti berfokus kepada faktor penentu kelayakan tuntutan PERKESO (cth: rute, masa, tugas rasmi). Sediakan jawapan dalam format JSON array sahaja, di mana setiap objek mempunyai kunci 'id' (dalam format snake_case) dan 'label'. JANGAN masukkan sebarang teks lain selain array JSON.`;

    const requestBody = {
        // ... (Badan permintaan API yang lain dikekalkan) ...
    };
    
    // ... (Logik API Call dan Parsing JSON dikekalkan) ...

    try {
        // [Gantikan dengan kod Fetch API call yang disediakan sebelum ini]
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            // ... headers, body, etc. ...
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


// FUNGSI 2: Muat Soalan Draf ke Page menggunakan Input Teks
window.muatSoalanDinamik = async function() {
    const tajukInput = inputTajuk.value.trim();

    if (tajukInput.length < 10) {
        alert("Sila masukkan tajuk skenario yang lebih spesifik (sekurang-kurangnya 10 aksara).");
        return;
    }
    
    // Panggil Gemini menggunakan input tajuk pengguna
    const soalanDraf = await generateSoalanOlehGemini(tajukInput);

    soalanContainer.innerHTML = ''; // Kosongkan container
    
    if (soalanDraf && soalanDraf.length > 0) {
        // Loop dan bina borang seperti biasa
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
