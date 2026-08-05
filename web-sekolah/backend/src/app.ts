import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

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
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// ============================================
// API DOCUMENTATION
// ============================================
app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'api-docs.html'));
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