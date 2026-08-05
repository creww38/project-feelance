// ============================================
// TYPES
// ============================================
interface EndpointParam {
  name: string;
  in: 'header' | 'query' | 'path';
  type: string;
  required: boolean;
  desc?: string;
}

interface Endpoint {
  id: string;
  group: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  auth: boolean;
  tags: string[];
  body?: string;
  params: EndpointParam[];
  response200: string;
  errors?: string;
}

interface FilterState {
  method: string;
  auth: string;
  group: string;
  search: string;
}

// ============================================
// DATA
// ============================================
const endpoints: Endpoint[] = [
  {
    id: 'auth-login', group: 'Authentication', method: 'POST', path: '/auth/login',
    summary: 'Login user', auth: false, tags: ['Auth'],
    body: '{\n  "email": "admin@smansa.sch.id",\n  "password": "Admin123!"\n}',
    params: [],
    response200: '{\n  "status": "success",\n  "message": "Login berhasil",\n  "data": {\n    "user": { "id":"uuid", "email":"...", "userRoles":[...] },\n    "accessToken": "eyJhbGciOiJIUzI1NiIs..."\n  }\n}',
    errors: '401 | Email atau password salah\n401 | Akun dinonaktifkan\n400 | Validasi gagal'
  },
  {
    id: 'auth-register', group: 'Authentication', method: 'POST', path: '/auth/register',
    summary: 'Register new user', auth: false, tags: ['Auth'],
    body: '{\n  "email": "user@smansa.sch.id",\n  "username": "user",\n  "password": "Password123!",\n  "namaLengkap": "Nama Lengkap",\n  "role": "GURU"\n}',
    params: [],
    response200: '{\n  "status": "success",\n  "message": "Registrasi berhasil",\n  "data": { "user": { "id":"uuid", "email":"..." } }\n}',
    errors: '400 | Email atau username sudah digunakan\n400 | Validasi gagal'
  },
  {
    id: 'auth-me', group: 'Authentication', method: 'GET', path: '/auth/me',
    summary: 'Current user profile', auth: true, tags: ['Auth'],
    params: [{ name: 'Authorization', in: 'header', type: 'string', required: true, desc: 'Bearer <accessToken>' }],
    response200: '{\n  "status": "success",\n  "data": { "user": { "id":"uuid", "email":"...", "userRoles":[...] } }\n}'
  },
  {
    id: 'auth-refresh', group: 'Authentication', method: 'POST', path: '/auth/refresh-token',
    summary: 'Refresh access token', auth: false, tags: ['Auth'],
    body: '{\n  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."\n}',
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "accessToken": "eyJ..." }\n}',
    errors: '401 | Token tidak valid atau kadaluarsa'
  },
  {
    id: 'auth-logout', group: 'Authentication', method: 'POST', path: '/auth/logout',
    summary: 'Logout user', auth: true, tags: ['Auth'],
    params: [],
    response200: '{\n  "status": "success",\n  "message": "Logout berhasil"\n}'
  },
  {
    id: 'auth-change-password', group: 'Authentication', method: 'POST', path: '/auth/change-password',
    summary: 'Change password', auth: true, tags: ['Auth'],
    body: '{\n  "oldPassword": "PasswordLama",\n  "newPassword": "PasswordBaru123!"\n}',
    params: [],
    response200: '{\n  "status": "success",\n  "message": "Password berhasil diubah"\n}',
    errors: '400 | Password lama salah\n400 | Password minimal 8 karakter'
  },
  {
    id: 'berita-list', group: 'Berita', method: 'GET', path: '/berita',
    summary: 'Get all news (paginated)', auth: false, tags: ['Berita', 'Public'],
    params: [
      { name: 'page', in: 'query', type: 'integer', required: false, desc: 'Page number (default: 1)' },
      { name: 'limit', in: 'query', type: 'integer', required: false, desc: 'Items per page (default: 10)' }
    ],
    response200: '{\n  "status": "success",\n  "data": {\n    "items": [{ "id":"uuid", "judul":"...", "slug":"...", "kategori":{...} }],\n    "meta": { "total":10, "page":1, "limit":10, "totalPages":1 }\n  }\n}'
  },
  {
    id: 'berita-detail', group: 'Berita', method: 'GET', path: '/berita/{slug}',
    summary: 'Get news by slug', auth: false, tags: ['Berita', 'Public'],
    params: [{ name: 'slug', in: 'path', type: 'string', required: true, desc: 'News slug' }],
    response200: '{\n  "status": "success",\n  "data": { "berita": {...} }\n}',
    errors: '404 | Berita tidak ditemukan'
  },
  {
    id: 'berita-create', group: 'Berita', method: 'POST', path: '/berita',
    summary: 'Create news', auth: true, tags: ['Berita'],
    body: '{\n  "judul": "Judul Berita",\n  "konten": "Isi konten berita...",\n  "ringkasan": "Ringkasan singkat",\n  "kategoriId": "uuid-kategori",\n  "status": "PUBLISHED"\n}',
    params: [],
    response200: '{\n  "status": "success",\n  "message": "Berita berhasil dibuat",\n  "data": { "berita": {...} }\n}'
  },
  {
    id: 'berita-update', group: 'Berita', method: 'PUT', path: '/berita/{id}',
    summary: 'Update news', auth: true, tags: ['Berita'],
    params: [{ name: 'id', in: 'path', type: 'string', required: true, desc: 'News ID' }],
    body: '{\n  "judul": "Updated Title",\n  "konten": "Updated content..."\n}',
    response200: '{\n  "status": "success",\n  "data": { "berita": {...} }\n}'
  },
  {
    id: 'berita-delete', group: 'Berita', method: 'DELETE', path: '/berita/{id}',
    summary: 'Delete news', auth: true, tags: ['Berita'],
    params: [{ name: 'id', in: 'path', type: 'string', required: true, desc: 'News ID' }],
    response200: '{\n  "status": "success",\n  "message": "Berita berhasil dihapus"\n}'
  },
  {
    id: 'pengumuman-list', group: 'Pengumuman', method: 'GET', path: '/pengumuman',
    summary: 'Get all announcements', auth: false, tags: ['Pengumuman', 'Public'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "items": [...] }\n}'
  },
  {
    id: 'pengumuman-create', group: 'Pengumuman', method: 'POST', path: '/pengumuman',
    summary: 'Create announcement', auth: true, tags: ['Pengumuman'],
    body: '{\n  "judul": "Pengumuman Baru",\n  "konten": "Isi pengumuman...",\n  "isPinned": false,\n  "priority": 1\n}',
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "pengumuman": {...} }\n}'
  },
  {
    id: 'dashboard-admin', group: 'Dashboard', method: 'GET', path: '/dashboard/admin',
    summary: 'Admin dashboard stats', auth: true, tags: ['Dashboard', 'Admin'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "totalUsers":1, "totalBerita":0, "totalPengumuman":0, "totalPPDB":0 }\n}'
  },
  {
    id: 'dashboard-guru', group: 'Dashboard', method: 'GET', path: '/dashboard/guru',
    summary: 'Teacher dashboard', auth: true, tags: ['Dashboard', 'Guru'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "message":"Guru dashboard" }\n}'
  },
  {
    id: 'dashboard-siswa', group: 'Dashboard', method: 'GET', path: '/dashboard/siswa',
    summary: 'Student dashboard', auth: true, tags: ['Dashboard', 'Siswa'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "message":"Siswa dashboard" }\n}'
  },
  {
    id: 'users-list', group: 'Users', method: 'GET', path: '/users',
    summary: 'Get all users', auth: true, tags: ['Users', 'Admin'],
    params: [
      { name: 'page', in: 'query', type: 'integer', required: false, desc: 'Page number' },
      { name: 'limit', in: 'query', type: 'integer', required: false, desc: 'Items per page' }
    ],
    response200: '{\n  "status": "success",\n  "data": { "items":[...], "meta":{...} }\n}'
  },
  {
    id: 'users-profile', group: 'Users', method: 'GET', path: '/users/profile',
    summary: 'Get own profile', auth: true, tags: ['Users'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "user": {...} }\n}'
  },
  {
    id: 'ppdb-create', group: 'PPDB', method: 'POST', path: '/ppdb',
    summary: 'Submit registration', auth: false, tags: ['PPDB', 'Public'],
    body: '{\n  "namaLengkap": "Calon Siswa",\n  "jenisKelamin": "L",\n  "tempatLahir": "Jakarta",\n  "tanggalLahir": "2008-01-01",\n  "alamat": "Jl. ...",\n  "noTelp": "08123456789",\n  "namaOrtu": "...",\n  "noTelpOrtu": "...",\n  "jurusanId": "uuid"\n}',
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "ppdb": { "no_pendaftaran":"PPDB..." } }\n}'
  },
  {
    id: 'ppdb-check', group: 'PPDB', method: 'GET', path: '/ppdb/check/{noPendaftaran}',
    summary: 'Check registration status', auth: false, tags: ['PPDB', 'Public'],
    params: [{ name: 'noPendaftaran', in: 'path', type: 'string', required: true, desc: 'Registration number' }],
    response200: '{\n  "status": "success",\n  "data": { "ppdb": {...} }\n}',
    errors: '404 | Data pendaftaran tidak ditemukan'
  },
  {
    id: 'galeri-list', group: 'Galeri', method: 'GET', path: '/galeri',
    summary: 'Get gallery items', auth: false, tags: ['Galeri', 'Public'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "items": [...] }\n}'
  },
  {
    id: 'agenda-list', group: 'Agenda', method: 'GET', path: '/agenda',
    summary: 'Get events', auth: false, tags: ['Agenda', 'Public'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "items": [...] }\n}'
  },
  {
    id: 'guru-list', group: 'Guru', method: 'GET', path: '/guru',
    summary: 'Get all teachers', auth: true, tags: ['Guru'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "items": [...] }\n}'
  },
  {
    id: 'siswa-list', group: 'Siswa', method: 'GET', path: '/siswa',
    summary: 'Get all students', auth: true, tags: ['Siswa'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "items": [...] }\n}'
  },
  {
    id: 'absensi-record', group: 'Absensi', method: 'POST', path: '/absensi',
    summary: 'Record attendance', auth: true, tags: ['Absensi', 'Guru'],
    body: '{\n  "siswaId": "uuid",\n  "status": "HADIR",\n  "keterangan": ""\n}',
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "absensi": {...} }\n}'
  },
  {
    id: 'notifikasi-list', group: 'Notifikasi', method: 'GET', path: '/notifikasi',
    summary: 'Get notifications', auth: true, tags: ['Notifikasi'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "items": [...] }\n}'
  },
  {
    id: 'pesan-conversations', group: 'Pesan', method: 'GET', path: '/pesan/conversations',
    summary: 'Get conversations', auth: true, tags: ['Pesan'],
    params: [],
    response200: '{\n  "status": "success",\n  "data": { "items": [...] }\n}'
  },
  {
    id: 'search', group: 'Search', method: 'GET', path: '/search?q=keyword',
    summary: 'Global search', auth: false, tags: ['Search', 'Public'],
    params: [{ name: 'q', in: 'query', type: 'string', required: true, desc: 'Search keyword' }],
    response200: '{\n  "status": "success",\n  "data": { "berita":[...], "users":[...] }\n}'
  },
];

// ============================================
// STATE
// ============================================
const state: FilterState = {
  method: 'all',
  auth: 'all',
  group: 'all',
  search: '',
};

let activeId: string | null = null;

// ============================================
// DOM ELEMENTS
// ============================================
const content = document.getElementById('content') as HTMLElement;
const searchInput = document.getElementById('search') as HTMLInputElement;
const clockEl = document.getElementById('clock') as HTMLElement;

// ============================================
// HELPERS
// ============================================
function highlightJSON(json: string): string {
  return json
    .replace(/(".*?")\s*:/g, '<span class="key">$1</span>:')
    .replace(/: ("[^"]*")/g, ': <span class="str">$1</span>')
    .replace(/: (\d+)/g, ': <span class="num">$1</span>')
    .replace(/: (true|false|null)/g, ': <span class="bool">$1</span>')
    .replace(/\/\/.*/g, '<span class="cmt">$&</span>');
}

function getFilteredEndpoints(): Endpoint[] {
  return endpoints.filter((ep) => {
    if (state.method !== 'all' && ep.method.toLowerCase() !== state.method) return false;
    if (state.auth !== 'all' && String(ep.auth) !== state.auth) return false;
    if (state.group !== 'all' && ep.group !== state.group) return false;
    if (state.search && !JSON.stringify(ep).toLowerCase().includes(state.search.toLowerCase())) return false;
    return true;
  });
}

// ============================================
// RENDER ENDPOINT CARD
// ============================================
function renderEndpointCard(ep: Endpoint): string {
  const methodClass = ep.method.toLowerCase();
  const authTag = ep.auth
    ? '<span class="ep-tag auth">AUTH</span>'
    : '<span class="ep-tag pub">PUBLIC</span>';

  let html = `
    <div class="endpoint" data-id="${ep.id}" data-method="${ep.method.toLowerCase()}" data-auth="${ep.auth}" data-group="${ep.group}">
      <div class="ep-header" data-action="toggle" data-id="${ep.id}">
        <span class="ep-method ${methodClass}">${ep.method}</span>
        <span class="ep-path">${ep.path}</span>
        <div class="ep-tags">${authTag}</div>
        <span class="ep-summary">${ep.summary}</span>
      </div>
      <div class="ep-body" id="body-${ep.id}">`;

  if (ep.params.length > 0) {
    html += `<div class="ep-label">Parameters</div>
      <table><tr><th>Name</th><th>In</th><th>Type</th><th>Required</th><th>Description</th></tr>`;
    ep.params.forEach((p) => {
      html += `<tr><td>${p.name}</td><td>${p.in}</td><td>${p.type}</td><td>${p.required ? '<span class="required">YES</span>' : 'no'}</td><td>${p.desc || '-'}</td></tr>`;
    });
    html += `</table>`;
  }

  if (ep.body) {
    html += `<div class="ep-label">Request Body</div>
      <div class="code-block">${highlightJSON(ep.body)}</div>`;
  }

  html += `<div class="ep-label">Response 200</div>
    <div class="code-block">${highlightJSON(ep.response200)}</div>`;

  if (ep.errors) {
    html += `<div class="ep-label">Error Codes</div>
      <div class="code-block" style="color:var(--red)">${ep.errors}</div>`;
  }

  let curl = `curl -X ${ep.method} http://localhost:5000/api${ep.path}`;
  if (ep.auth) curl += ` \\\n  -H "Authorization: Bearer <TOKEN>"`;
  if (ep.body) curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${ep.body.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()}'`;

  html += `<div class="ep-label">cURL</div>
    <div class="code-block">${curl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    <div style="margin-top:8px"><button class="try-btn" data-action="copy" data-id="${ep.id}">COPY</button></div>`;

  html += `</div></div>`;
  return html;
}

// ============================================
// RENDER ALL
// ============================================
function renderAll(): void {
  const filtered = getFilteredEndpoints();

  if (filtered.length === 0) {
    content.innerHTML = `<div class="section-info">No endpoints match your filters. <a href="#" id="reset-link">Reset all filters</a></div>`;
    return;
  }

  let html = `<div class="section-header">API Reference</div>
    <div class="section-desc">${filtered.length} endpoint${filtered.length !== 1 ? 's' : ''} found. Click header to expand.</div>
    <div class="section-info">
      <b>Base URL:</b> http://localhost:5000/api<br>
      <b>Authentication:</b> Bearer Token (JWT)<br>
      <b>Content-Type:</b> application/json<br>
      <b>Access Token:</b> Obtained via <a href="#" data-action="scroll" data-id="auth-login">POST /auth/login</a>
    </div>`;

  filtered.forEach((ep) => { html += renderEndpointCard(ep); });
  content.innerHTML = html;
  content.scrollTop = 0;
}

// ============================================
// FILTERS
// ============================================
function updateFilterUI(): void {
  document.querySelectorAll('#filters li').forEach((li) => {
    li.classList.toggle('active', (li as HTMLElement).dataset.filter === state.method);
  });
  document.querySelectorAll('#auth-filters li').forEach((li) => {
    li.classList.toggle('active', (li as HTMLElement).dataset.auth === state.auth);
  });
  document.querySelectorAll('#group-filters li').forEach((li) => {
    li.classList.toggle('active', (li as HTMLElement).dataset.group === state.group);
  });
}

function populateFilters(): void {
  const methodCounts: Record<string, number> = {};
  const authCounts: Record<string, number> = { true: 0, false: 0 };
  const groupCounts: Record<string, number> = {};

  endpoints.forEach((ep) => {
    methodCounts[ep.method.toLowerCase()] = (methodCounts[ep.method.toLowerCase()] || 0) + 1;
    authCounts[String(ep.auth)] = (authCounts[String(ep.auth)] || 0) + 1;
    groupCounts[ep.group] = (groupCounts[ep.group] || 0) + 1;
  });

  // Method filters
  const methods = ['all', 'get', 'post', 'put', 'delete'];
  const filtersEl = document.getElementById('filters')!;
  filtersEl.innerHTML = methods
    .map(
      (m) =>
        `<li class="${m === 'all' ? 'active' : ''}" data-filter="${m}"><span class="ck">+</span> ${m === 'all' ? 'ALL' : m.toUpperCase()} <em>${m === 'all' ? endpoints.length : methodCounts[m] || 0}</em></li>`
    )
    .join('');

  // Auth filters
  const authEl = document.getElementById('auth-filters')!;
  authEl.innerHTML = `
    <li class="active" data-auth="all"><span class="ck">+</span> ALL</li>
    <li data-auth="true"><span class="ck">+</span> AUTH REQUIRED <em>${authCounts['true']}</em></li>
    <li data-auth="false"><span class="ck">+</span> PUBLIC <em>${authCounts['false']}</em></li>`;

  // Group filters
  const groups = [...new Set(endpoints.map((e) => e.group))];
  const groupEl = document.getElementById('group-filters')!;
  groupEl.innerHTML = `<li class="active" data-group="all"><span class="ck">+</span> ALL</li>` +
    groups.map((g) => `<li data-group="${g}"><span class="ck">+</span> ${g}</li>`).join('');

  // Counts
  document.getElementById('ep-count')!.textContent = String(endpoints.length);
  document.getElementById('auth-count')!.textContent = String(authCounts['true']);
  document.getElementById('pub-count')!.textContent = String(authCounts['false']);
}

// ============================================
// TRENDING & METHODS LIST
// ============================================
function populateTrending(): void {
  const trending = [
    { rank: '01', search: 'login', label: 'POST /auth/login', change: '+412%' },
    { rank: '02', search: 'berita', label: 'GET /berita', change: '+289%' },
    { rank: '03', search: 'pengumuman', label: 'GET /pengumuman', change: '+186%' },
    { rank: '04', search: 'dashboard', label: 'GET /dashboard', change: '+147%' },
    { rank: '05', search: 'ppdb', label: 'POST /ppdb', change: '+93%' },
  ];

  const trendEl = document.getElementById('trend-list')!;
  trendEl.innerHTML = trending
    .map((t) => `<li data-search="${t.search}"><span class="rank">${t.rank}</span> ${t.label} <em>${t.change}</em></li>`)
    .join('');
}

function populateMethodsList(): void {
  const counts: Record<string, number> = {};
  endpoints.forEach((ep) => {
    counts[ep.method] = (counts[ep.method] || 0) + 1;
  });

  const total = endpoints.length;
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const methodsEl = document.getElementById('methods-list')!;
  methodsEl.innerHTML = methods
    .map((m) => {
      const count = counts[m] || 0;
      const pct = Math.round((count / total) * 100);
      return `<li><span class="bar"><span style="width:${pct}%"></span></span><span>${m}</span><em>${count}</em></li>`;
    })
    .join('');
}

// ============================================
// EVENT HANDLERS
// ============================================
function toggleEndpoint(id: string): void {
  const body = document.getElementById('body-' + id);
  if (body) body.classList.toggle('open');
}

function copyCurl(btn: HTMLButtonElement, id: string): void {
  const ep = endpoints.find((e) => e.id === id);
  if (!ep) return;

  let curl = `curl -X ${ep.method} http://localhost:5000/api${ep.path}`;
  if (ep.auth) curl += ` -H "Authorization: Bearer <TOKEN>"`;
  if (ep.body) curl += ` -H "Content-Type: application/json" -d '${ep.body.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()}'`;

  navigator.clipboard.writeText(curl).then(() => {
    btn.textContent = 'COPIED';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'COPY'; btn.classList.remove('copied'); }, 1500);
  });
}

function scrollToEndpoint(id: string): void {
  state.method = 'all';
  state.auth = 'all';
  state.group = 'all';
  state.search = '';
  searchInput.value = '';
  updateFilterUI();
  renderAll();
  setTimeout(() => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toggleEndpoint(id);
    }
  }, 100);
}

function resetFilters(): void {
  state.method = 'all';
  state.auth = 'all';
  state.group = 'all';
  state.search = '';
  searchInput.value = '';
  updateFilterUI();
  renderAll();
}

// ============================================
// DELEGATED EVENT LISTENERS
// ============================================
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  // Endpoint header toggle
  const header = target.closest('[data-action="toggle"]') as HTMLElement;
  if (header) {
    const id = header.dataset.id!;
    toggleEndpoint(id);
    activeId = id;
    return;
  }

  // Copy button
  const copyBtn = target.closest('[data-action="copy"]') as HTMLButtonElement;
  if (copyBtn) {
    e.stopPropagation();
    copyCurl(copyBtn, copyBtn.dataset.id!);
    return;
  }

  // Scroll link
  const scrollLink = target.closest('[data-action="scroll"]') as HTMLElement;
  if (scrollLink) {
    e.preventDefault();
    scrollToEndpoint(scrollLink.dataset.id!);
    return;
  }

  // Reset link
  if ((target as HTMLElement).id === 'reset-link') {
    e.preventDefault();
    resetFilters();
    return;
  }

  // Filter items
  const filterLi = target.closest('#filters li') as HTMLElement;
  if (filterLi) {
    state.method = filterLi.dataset.filter!;
    updateFilterUI();
    renderAll();
    return;
  }

  const authLi = target.closest('#auth-filters li') as HTMLElement;
  if (authLi) {
    state.auth = authLi.dataset.auth!;
    updateFilterUI();
    renderAll();
    return;
  }

  const groupLi = target.closest('#group-filters li') as HTMLElement;
  if (groupLi) {
    state.group = groupLi.dataset.group!;
    updateFilterUI();
    renderAll();
    return;
  }

  // Trending list
  const trendLi = target.closest('#trend-list li') as HTMLElement;
  if (trendLi) {
    const q = trendLi.dataset.search || '';
    searchInput.value = q;
    state.search = q;
    renderAll();
    return;
  }
});

// ============================================
// SEARCH
// ============================================
searchInput.addEventListener('input', () => {
  state.search = searchInput.value.toLowerCase().trim();
  renderAll();
});

// ============================================
// KEYBOARD NAVIGATION
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
    return;
  }
  if (e.key === 'Escape') {
    if (document.activeElement === searchInput) {
      searchInput.blur();
      searchInput.value = '';
      state.search = '';
      renderAll();
    } else {
      resetFilters();
    }
    return;
  }
  if (e.key === 'r' && document.activeElement !== searchInput) {
    resetFilters();
    return;
  }
  if (document.activeElement === searchInput) return;

  const visible = Array.from(document.querySelectorAll('.endpoint:not(.hidden)'));
  const currentIdx = visible.findIndex((el) => (el as HTMLElement).dataset.id === activeId);

  if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault();
    const next = Math.min(currentIdx + 1, visible.length - 1);
    if (visible[next]) {
      activeId = (visible[next] as HTMLElement).dataset.id!;
      visible[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = Math.max(currentIdx - 1, 0);
    if (visible[prev]) {
      activeId = (visible[prev] as HTMLElement).dataset.id!;
      visible[prev].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  if (e.key === 'Enter' && activeId) {
    toggleEndpoint(activeId);
  }
});

// ============================================
// SPARKLINE
// ============================================
function drawSpark(): void {
  const sparkLine = document.getElementById('spark-line');
  const sparkFill = document.getElementById('spark-fill');
  if (!sparkLine || !sparkFill) return;

  const pts: string[] = [];
  for (let x = 0; x <= 200; x += 6) {
    const y = 30 + Math.sin(x * 0.05 + Date.now() * 0.001) * 14 + (Math.random() - 0.5) * 8;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  sparkLine.setAttribute('points', pts.join(' '));
  sparkFill.setAttribute('points', `0,60 ${pts.join(' ')} 200,60`);
}

// ============================================
// LIVE STATS
// ============================================
function updateLiveStats(): void {
  const peak = document.getElementById('peak-req');
  const live = document.getElementById('live-req');
  if (peak) peak.textContent = (2 + Math.random() * 3).toFixed(1) + 'K/hr';
  if (live) live.textContent = String(Math.floor(600 + Math.random() * 400));
}

function updateClock(): void {
  const d = new Date();
  if (clockEl) {
    clockEl.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((n) => String(n).padStart(2, '0'))
      .join(':');
  }
}

// ============================================
// INIT
// ============================================
function init(): void {
  populateFilters();
  populateTrending();
  populateMethodsList();
  updateFilterUI();
  renderAll();
  drawSpark();
  updateClock();

  setInterval(drawSpark, 2000);
  setInterval(updateLiveStats, 3000);
  setInterval(updateClock, 1000);
}

document.addEventListener('DOMContentLoaded', init);