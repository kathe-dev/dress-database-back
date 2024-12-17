//server.js

const express = require('express');
const { Pool } = require('pg'); // Importamos el cliente de PostgreSQL
require('dotenv').config(); // Carga variables de entorno

const app = express();
const port = 3000;

// Configuración de conexión a la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Para Neon (ya que usa SSL)
    },
});


// handling CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", 
               "http://localhost:4200");
    res.header("Access-Control-Allow-Headers", 
               "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// route for handling requests from the Angular client
app.get('/api/message', (req, res) => {
    res.json({ message: 
            'Amo a mi bebe' });
});

// Probar conexión
pool.connect()
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => console.error('Error al conectar a la base de datos', err));


// Crear tabla
app.get('/setup-db', async (req, res) => {
    const query = `
        CREATE TABLE IF NOT EXISTS dresses (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price NUMERIC(10, 2) NOT NULL,
            color VARCHAR(50),
            size VARCHAR(10),
            category VARCHAR(100),
            image_url TEXT
        );
    `;

    try {
        await pool.query(query);
        res.send('Tabla creada exitosamente');
    } catch (error) {
        console.error('Error al crear la tabla', error);
        res.status(500).send('Error al crear la tabla');
    }
});

// traer datos
app.get('/api/dresses', async (req, res) => {
    const { category, color, size } = req.query;
    const query = `
        SELECT * FROM dresses
        WHERE ($1::text IS NULL OR category = $1)
          AND ($2::text IS NULL OR color = $2)
          AND ($3::text IS NULL OR size = $3);
    `;
    try {
        const result = await pool.query(query, [category, color, size]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al filtrar datos', error);
        res.status(500).send('Error al filtrar datos');
    }
});


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});