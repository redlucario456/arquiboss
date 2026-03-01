const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const proyectoRoutes = require('./routes/proyectoRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 RUTAS API
app.use('/api/auth', authRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/mensajes', mensajeRoutes);

// 🔥 SERVIR FRONTEND (IMPORTANTE)
app.use(express.static(path.join(__dirname, '../public')));

// 🔥 SPA FIX (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

sequelize.sync()
  .then(() => {
    console.log('✅ DB conectada');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server en puerto ${PORT}`);
    });
  })
  .catch(err => console.error('❌ Error DB:', err));