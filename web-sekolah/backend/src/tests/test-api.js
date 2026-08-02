const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5MzE5ZjZlLTkyYTEtNDcyYS1iM2QxLWYxYjFiY2Y1Y2EzMSIsImVtYWlsIjoiYWRtaW5Ac21hbnNhLnNjaC5pZCIsImlhdCI6MTc4NTY1NTYzNiwiZXhwIjoxNzg1NjU2NTM2fQ.ZCsOfgHFUr0DuIZPA8-eHtFfBmC6xwABBFp5051yUyo';

function testAPI(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log(`\n${method} ${path} -> ${res.statusCode}`);
        console.log(JSON.parse(body));
        resolve();
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing APIs...\n');

  await testAPI('GET', '/api/auth/me');
  await testAPI('GET', '/api/berita');
  await testAPI('GET', '/api/pengumuman');
  await testAPI('GET', '/api/dashboard/admin');
  await testAPI('GET', '/api/users');

  console.log('\n✅ All tests done!');
}

runTests().catch(console.error);