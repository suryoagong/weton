
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, birthdate } = JSON.parse(event.body || '{}');
  if (!birthdate) return { statusCode: 400, body: 'Missing birthdate' };

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const pasarans = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];
  const neptuHari = { Minggu: 5, Senin: 4, Selasa: 3, Rabu: 7, Kamis: 8, Jumat: 6, Sabtu: 9 };
  const neptuPasaran = { Legi: 5, Pahing: 9, Pon: 7, Wage: 4, Kliwon: 8 };
  const kamarokamHari = { Minggu: 5, Senin: 4, Selasa: 3, Rabu: 7, Kamis: 7, Jumat: 6, Sabtu: 9 };
  const kamarokamPasaran = { Legi: 2, Pahing: 3, Pon: 1, Wage: 4, Kliwon: 5 };

  const wukuList = ["Sinta", "Landep", "Wukir", "Kurantil", "Tolu", "Gumbreg", "Warigalit", "Warigagung",
                    "Julungwangi", "Sungsang", "Galungan", "Kuningan", "Langkir", "Mandasiya", "Julungpujud",
                    "Pahang", "Kuruwelut", "Marakeh", "Tambir", "Medangkungan", "Maktal", "Wuye", "Manahil",
                    "Prangbakat", "Bala", "Wugu", "Wayang", "Kelawu", "Dukut", "Watugunung"];

  const tgl = new Date(birthdate + "T00:00:00");
  
  const tgl = new Date(birthdate + "T00:00:00");
  const baseRef = new Date("1944-06-08T00:00:00"); // Kamis Legi
  const hariList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const pasaranList = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
  const daysBetween = Math.floor((tgl - baseRef) / (1000 * 60 * 60 * 24));
  const hariIndex = (4 + daysBetween % 7 + 7) % 7;
  const pasaranIndex = (0 + daysBetween % 5 + 5) % 5;
  const hari = hariList[hariIndex];
  const pasaran = pasaranList[pasaranIndex];

  const base = new Date('1900-01-01T00:00:00');
  const selisih = Math.floor((tgl - base) / (1000 * 60 * 60 * 24));
  // pasaran dihitung dari patokan otentik
  const wuku = wukuList[Math.floor(((selisih % 210) + 210) % 210 / 7)];
  const neptu = neptuHari[hari] + neptuPasaran[pasaran];
  const pancasuda = neptuHari[hari] + neptuPasaran[pasaran];
  const kamarokam = kamarokamHari[hari] + kamarokamPasaran[pasaran];

  const tanggalMasehi = tgl.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const hijriRes = await fetch(`https://api.aladhan.com/v1/gToH?date=${tgl.getDate()}-${tgl.getMonth() + 1}-${tgl.getFullYear()}`);
  const hijriData = await hijriRes.json();
  // Tanggal Jawa estimasi berdasar epoch tetap (simulasi)
  const jawaEpoch = new Date('1945-08-17');
  const daysBetween = Math.floor((tgl - jawaEpoch) / (1000 * 60 * 60 * 24));
  const sasiList = ["Sura", "Sapar", "Mulud", "Bakda Mulud", "Jumadil Awal", "Jumadil Akhir", "Rejeb", "Ruwah", "Pasa", "Sawal", "Dulkaidah", "Besar"];
  const tahunList = ["Alip", "Ehe", "Jimawal", "Je", "Dal", "Be", "Wawu", "Jimakir"];
  const jawaTgl = (daysBetween % 30 + 1);
  const sasiIdx = Math.floor(daysBetween / 30) % 12;
  const taunIdx = Math.floor(daysBetween / 354.367) % 8;
  const tahunJawa = 1878 + Math.floor(daysBetween / 354.367); // simulasi base 1945
  const tanggalJawa = `${jawaTgl} ${sasiList[sasiIdx]} ${tahunJawa} ${tahunList[taunIdx]}`;
  
const hijriRaw = hijriData?.data?.hijri?.date || '';
const [hDay, hMonth, hYear] = hijriRaw.split('-');
const hijriMonthName = {
  "01": "Muharram", "02": "Safar", "03": "Rabiul Awal", "04": "Rabiul Akhir",
  "05": "Jumadil Awal", "06": "Jumadil Akhir", "07": "Rajab", "08": "Syaban",
  "09": "Ramadhan", "10": "Syawal", "11": "Zulkaidah", "12": "Zulhijjah"
}[hMonth] || hMonth;
const tanggalHijriah = `${hDay} ${hijriMonthName} ${hYear}`;


  const prompt = `Berdasarkan weton kelahiran seseorang:
Hari dan Pasaran: ${hari} ${pasaran}
Wuku: ${wuku}
Neptu: ${neptu}

Tuliskan ramalan Weton Jawa secara naratif dan sopan, langsung dalam HTML:
<div class='blok'><h3>🙂 Deskripsi Weton</h3><p>...</p></div>
<div class='blok'><h3>👨‍💼 Pekerjaan</h3><p>...</p></div>
<div class='blok'><h3>📅 Hari Baik Memulai Usaha</h3><p>...</p></div>
<div class='blok'><h3>💘 Cinta</h3><p>...</p></div>
<div class='blok'><h3>💰 Rejeki</h3><p>...</p></div>
<div class='blok'><h3>📍 Arah Rejeki</h3><p>...</p></div>`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer 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',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    
    let aiContent = '';
    if (data?.choices?.[0]?.message?.content) {
      aiContent = data.choices[0].message.content;
    } else {
      // Fallback ke Gemini jika Groq gagal
      const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=AIzaSyAGSNcqLSl3IKOJA5Ea5Z4iDA8o2ethYcA', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const geminiData = await geminiRes.json();
      aiContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '<p>❌ Gagal memuat ramalan dari kedua AI.</p>';
    }
    

    const html = `
<div class='blok'><h3>📅 Data Kelahiran</h3>
<p><strong>Nama:</strong> ${name}</p>
<p><strong>Tanggal Masehi:</strong> ${tanggalMasehi}</p>
<p><strong>Tanggal Hijriah:</strong> ${tanggalHijriah}</p>
<p><strong>Tanggal Jawa:</strong> ${tanggalJawa}</p>
<p><strong>Hari & Pasaran:</strong> ${hari} ${pasaran}</p>
<p><strong>Wuku:</strong> ${wuku}</p>
<p><strong>Neptu:</strong> ${neptu}</p>
<p><strong>Pancasuda:</strong> ${pancasuda}</p>
<p><strong>Kamarokam:</strong> ${kamarokam}</p>
</div>
${aiContent}
`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: html }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Gagal menghubungi AI', detail: err.message }),
    };
  }
};
