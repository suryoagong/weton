
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
  const wukuList = ["Sinta","Landep","Wukir","Kurantil","Tolu","Gumbreg","Warigalit","Warigagung","Julungwangi","Sungsang",
                    "Galungan","Kuningan","Langkir","Mandasiya","Julungpujud","Pahang","Kuruwelut","Marakeh","Tambir","Medangkungan",
                    "Maktal","Wuye","Manahil","Prangbakat","Bala","Wugu","Wayang","Kelawu","Dukut","Watugunung"];

  const tgl = new Date(birthdate);
  const hari = days[tgl.getDay()];
  const base = new Date('1900-01-01');
  const selisih = Math.floor((tgl - base) / (1000 * 60 * 60 * 24));
  const pasaran = pasarans[(selisih % 5 + 5) % 5];
  const wuku = wukuList[Math.floor(((selisih % 210) + 210) % 210 / 7)];
  const neptu = neptuHari[hari] + neptuPasaran[pasaran];

  const tanggalMasehi = tgl.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

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
    const aiContent = data?.choices?.[0]?.message?.content || '<p>❌ Gagal mendapatkan ramalan dari AI.</p>';

    const html = `
<div class='blok'><h3>📅 Data Kelahiran</h3>
<p><strong>Nama:</strong> ${name}</p>
<p><strong>Tanggal Masehi:</strong> ${tanggalMasehi}</p>
<p><strong>Hari & Pasaran:</strong> ${hari} ${pasaran}</p>
<p><strong>Wuku:</strong> ${wuku}</p>
<p><strong>Neptu:</strong> ${neptu}</p>
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
