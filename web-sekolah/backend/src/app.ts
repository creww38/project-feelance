import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Import Supabase
import './config/supabase';

// Import Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import beritaRoutes from './routes/berita.routes';
import pengumumanRoutes from './routes/pengumuman.routes';
import agendaRoutes from './routes/agenda.routes';
import galeriRoutes from './routes/galeri.routes';
import ppdbRoutes from './routes/ppdb.routes';
import dashboardRoutes from './routes/dashboard.routes';
import guruRoutes from './routes/guru.routes';
import siswaRoutes from './routes/siswa.routes';
import absensiRoutes from './routes/absensi.routes';
import perpustakaanRoutes from './routes/perpustakaan.routes';
import notifikasiRoutes from './routes/notifikasi.routes';
import pesanRoutes from './routes/pesan.routes';
import searchRoutes from './routes/search.routes';
import uploadRoutes from './routes/upload.routes';

// Import Middlewares
import { errorHandler } from './middlewares/error.middleware';
import { authenticate } from './middlewares/auth.middleware';

const app = express();

// ============================================
// SECURITY
// ============================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================
// RATE LIMITING
// ============================================
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { status: 'error', message: 'Too many requests' },
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { status: 'error', message: 'Too many auth attempts' },
});
app.use('/api/auth/login', authLimiter);

// ============================================
// BODY PARSER
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(compression());

// ============================================
// LOGGING
// ============================================
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ============================================
// STATIC FILES
// ============================================
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

const publicPath = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
}
app.use('/public', express.static(publicPath));

// ============================================
// API DOCUMENTATION
// ============================================
app.get('/docs', (req, res) => {
    const docsPath = path.join(__dirname, '..', 'public', 'api-docs.html');
    
    if (!fs.existsSync(docsPath)) {
        // If docs file doesn't exist, serve a simple built-in docs page
        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SISTech API v1.0</title>
    <style>
        body { background: #0a0a0c; color: #e8e8ed; font-family: 'Courier New', monospace; padding: 40px; }
        h1 { color: #ffb020; }
        .endpoint { background: #131316; border: 1px solid #26262d; padding: 16px; margin: 12px 0; }
        .method { display: inline-block; padding: 4px 10px; font-weight: bold; font-size: 12px; }
        .get { background: rgba(0,212,255,0.15); color: #00d4ff; }
        .post { background: rgba(0,255,127,0.15); color: #00ff7f; }
        .put { background: rgba(255,176,32,0.15); color: #ffb020; }
        .delete { background: rgba(255,51,102,0.15); color: #ff3366; }
        .path { color: #e8e8ed; font-size: 14px; margin-left: 10px; }
        .desc { color: #8a8a93; font-size: 11px; margin-top: 8px; }
        a { color: #00d4ff; }
    </style>
</head>
<body>
    <h1>SISTech API v1.0</h1>
    <p style="color:#8a8a93">Base URL: <code style="color:#00ff7f">http://localhost:5000/api</code></p>
    <p style="color:#8a8a93">Auth: Bearer Token (JWT) - Get token via <code style="color:#ffb020">POST /auth/login</code></p>
    
    <h2 style="color:#ffb020;margin-top:30px">Endpoints</h2>
    
    <div class="endpoint"><span class="method post">POST</span><span class="path">/auth/login</span><div class="desc">Login user - Body: {email, password}</div></div>
    <div class="endpoint"><span class="method post">POST</span><span class="path">/auth/register</span><div class="desc">Register user</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/auth/me</span><div class="desc">Current user profile (Auth required)</div></div>
    <div class="endpoint"><span class="method post">POST</span><span class="path">/auth/refresh-token</span><div class="desc">Refresh access token</div></div>
    <div class="endpoint"><span class="method post">POST</span><span class="path">/auth/logout</span><div class="desc">Logout (Auth required)</div></div>
    <div class="endpoint"><span class="method post">POST</span><span class="path">/auth/change-password</span><div class="desc">Change password (Auth required)</div></div>
    
    <div class="endpoint"><span class="method get">GET</span><span class="path">/berita</span><div class="desc">Get all news (paginated)</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/berita/{slug}</span><div class="desc">Get news by slug</div></div>
    <div class="endpoint"><span class="method post">POST</span><span class="path">/berita</span><div class="desc">Create news (Auth)</div></div>
    <div class="endpoint"><span class="method put">PUT</span><span class="path">/berita/{id}</span><div class="desc">Update news (Auth)</div></div>
    <div class="endpoint"><span class="method delete">DELETE</span><span class="path">/berita/{id}</span><div class="desc">Delete news (Auth)</div></div>
    
    <div class="endpoint"><span class="method get">GET</span><span class="path">/pengumuman</span><div class="desc">Get all announcements</div></div>
    <div class="endpoint"><span class="method post">POST</span><span class="path">/pengumuman</span><div class="desc">Create announcement (Auth)</div></div>
    
    <div class="endpoint"><span class="method get">GET</span><span class="path">/agenda</span><div class="desc">Get all events</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/galeri</span><div class="desc">Get gallery items</div></div>
    
    <div class="endpoint"><span class="method post">POST</span><span class="path">/ppdb</span><div class="desc">Submit PPDB registration</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/ppdb/check/{no}</span><div class="desc">Check registration status</div></div>
    
    <div class="endpoint"><span class="method get">GET</span><span class="path">/dashboard/admin</span><div class="desc">Admin dashboard (Auth)</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/dashboard/guru</span><div class="desc">Teacher dashboard (Auth)</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/dashboard/siswa</span><div class="desc">Student dashboard (Auth)</div></div>
    
    <div class="endpoint"><span class="method get">GET</span><span class="path">/users</span><div class="desc">Get all users (Auth)</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/users/profile</span><div class="desc">Get own profile (Auth)</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/users/stats</span><div class="desc">User statistics (Auth)</div></div>
    
    <div class="endpoint"><span class="method get">GET</span><span class="path">/guru</span><div class="desc">Get all teachers (Auth)</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/siswa</span><div class="desc">Get all students (Auth)</div></div>
    <div class="endpoint"><span class="method post">POST</span><span class="path">/absensi</span><div class="desc">Record attendance (Auth)</div></div>
    
    <div class="endpoint"><span class="method get">GET</span><span class="path">/notifikasi</span><div class="desc">Get notifications (Auth)</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/pesan/conversations</span><div class="desc">Get conversations (Auth)</div></div>
    <div class="endpoint"><span class="method get">GET</span><span class="path">/search?q=</span><div class="desc">Global search</div></div>
    
    <p style="color:#56565d;margin-top:30px;font-size:11px">SISTech API v1.0 | Running on port ${process.env.PORT || 5000}</p>
</body>
</html>`);
        return;
    }
    
    res.sendFile(docsPath, (err) => {
        if (err) {
            res.status(500).json({ status: 'error', message: 'Failed to load documentation' });
        }
    });
});

// ============================================
// PUBLIC API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/berita', beritaRoutes);
app.use('/api/pengumuman', pengumumanRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/galeri', galeriRoutes);
app.use('/api/ppdb', ppdbRoutes);
app.use('/api/search', searchRoutes);

// ============================================
// PROTECTED API ROUTES
// ============================================
app.use('/api/users', authenticate, userRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/guru', authenticate, guruRoutes);
app.use('/api/siswa', authenticate, siswaRoutes);
app.use('/api/absensi', authenticate, absensiRoutes);
app.use('/api/perpustakaan', authenticate, perpustakaanRoutes);
app.use('/api/notifikasi', authenticate, notifikasiRoutes);
app.use('/api/pesan', authenticate, pesanRoutes);
app.use('/api/upload', authenticate, uploadRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage(),
    });
});

// ============================================
// ROOT
// ============================================
app.get('/', (req, res) => {
    res.json({
        name: 'SISTech API',
        version: '1.0.0',
        docs: '/docs',
        health: '/health',
        base: '/api',
    });
});

// ============================================
// 404
// ============================================
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use(errorHandler);

export default app;