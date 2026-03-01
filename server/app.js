const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan'); // Para logs de peticiones
const helmet = require('helmet'); // Seguridad de headers
require('dotenv').config();
const sequelize = require('./config/db');

const app = express();

// --- 1. CONFIGURACIÓN DE CARPETAS ---
// Aseguramos que la carpeta de subidas exista siempre
const uploadsPath = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// --- 2. MIDDLEWARES DE SEGURIDAD Y LOGS ---
app.use(helmet({
    contentSecurityPolicy: false, // Permitir que React cargue recursos sin conflictos
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors()); 
app.use(morgan('dev')); // Verás GET /api/proyectos 200 en tu consola
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// --- 3. SERVIR ARCHIVOS ESTÁTICOS ---
// Servir imágenes subidas
app.use('/uploads', express.static(uploadsPath));

// Determinar ruta del Frontend (Ajustado para Railway/Estructuras comunes)
const frontendPath = fs.existsSync(path.join(__dirname, 'public')) 
    ? path.join(__dirname, 'public') 
    : path.join(process.cwd(), 'client', 'dist'); // Por si usas carpetas tipo /client/dist (Vite)

app.use(express.static(frontendPath));

// --- 4. RUTAS DE LA API ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clima', require('./routes/climaRoutes'));
app.use('/api/proyectos', require('./routes/proyectoRoutes'));
app.use('/api/mensajes', require('./routes/mensajeRoutes'));

// --- 5. MANEJO DE ERRORES DE API (404) ---
// Si alguien busca una ruta /api/ que no existe, devolvemos JSON, no HTML
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        status: 'error',
        message: `La ruta de API [${req.originalUrl}] no fue encontrada en este servidor.` 
    });
});

// --- 6. CLIENT-SIDE ROUTING (PARA REACT/VUE/ANGULAR) ---
// Esto captura cualquier ruta que NO empiece por /api y sirve el index.html
app.get('*', (req, res) => {
    const indexPath = path.join(frontendPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #e74c3c;">ArquiBOSS - Error de Despliegue</h1>
                <p>El servidor está <b>ONLINE</b> 🟢, pero no encuentro el Frontend.</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; display: inline-block;">
                    <p><b>Ruta esperada:</b> <code>${indexPath}</code></p>
                </div>
                <p style="margin-top: 20px;">Verifica que hayas corrido <code>npm run build</code> antes de subir.</p>
            </body>
        `);
    }
});

// --- 7. MANEJO GLOBAL DE EXCEPCIONES ---
// Evita que el servidor muera si hay un error no controlado
app.use((err, req, res, next) => {
    console.error('💥 ERROR NO CONTROLADO:', err.stack);
    res.status(500).json({ 
        error: 'Algo salió muy mal en el servidor.',
        details: process.env.NODE_ENV === 'development' ? err.message : null 
    });
});

// --- 8. ARRANQUE DEL SISTEMA ---
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Autenticar conexión antes de sincronizar
        await sequelize.authenticate();
        console.log('✅ BASE DE DATOS: Conexión establecida correctamente.');

        await sequelize.sync({ force: false });
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log('-------------------------------------------');
            console.log(`🚀 SERVIDOR ARQUIBOSS ONLINE`);
            console.log(`📡 URL local: http://localhost:${PORT}`);
            console.log(`🌍 Network: Accesible en puerto ${PORT}`);
            console.log('-------------------------------------------');
        });
    } catch (error) {
        console.error('❌ FATAL: No se pudo conectar a la base de datos:', error);
        process.exit(1); // Cerramos el proceso si no hay DB
    }
};

startServer();