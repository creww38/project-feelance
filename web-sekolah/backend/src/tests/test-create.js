const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5MzE5ZjZlLTkyYTEtNDcyYS1iM2QxLWYxYjFiY2Y1Y2EzMSIsImVtYWlsIjoiYWRtaW5Ac21hbnNhLnNjaC5pZCIsImlhdCI6MTc4NTY1NTYzNiwiZXhwIjoxNzg1NjU2NTM2fQ.ZCsOfgHFUr0DuIZPA8-eHtFfBmC6xwABBFp5051yUyo';

function apiRequest(method, path, data = null) {
  return new Promise((resolve) => {
    const body = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'localhost', port: 5000, path: path, method: method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': body ? Buffer.byteLength(body) : 0,
      },
    };

    const req = http.request(options, (res) => {
      let result = '';
      res.on('data', (chunk) => { result += chunk; });
      res.on('end', () => {
        console.log(`\n${method} ${path} -> ${res.statusCode}`);
        console.log(JSON.stringify(JSON.parse(result), null, 2));
        resolve();
      });
    });

    req.on('error', (e) => console.error(e));
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  console.log('🧪 Testing Create & Read...\n');

  // Create berita
  await apiRequest('POST', '/api/berita', {
    judul: 'Berita Pertama',
    konten: 'Ini adalah berita pertama di website sekolah.',
    ringkasan: 'Berita pertama',
    kategoriId: null,
    status: 'PUBLISHED',
  });

  // Create pengumuman
  await apiRequest('POST', '/api/pengumuman', {
    judul: 'Pengumuman Penting',
    konten: 'Besok libur nasional.',
    status: 'PUBLISHED',
  });

  // Get berita
  await apiRequest('GET', '/api/berita');

  // Get pengumuman
  await apiRequest('GET', '/api/pengumuman');

  console.log('\n✅ Done!');
}

run();