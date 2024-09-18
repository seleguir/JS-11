const express = require('express');
const mysql = require('mysql');
const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos usando variables de entorno
let conexion = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : "",
    database : 'score'
});

// Conectar a la base de datos
conexion.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.stack);
        return;
    }
    console.log('Conexión exitosa');
});

conexion.end(); 

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Middleware para manejar datos en formato JSON
app.use(express.json());

// Ruta para obtener las puntuaciones
app.get('/api/scores', (req, res) => {
    const query = 'SELECT * FROM score ORDER BY puntos DESC, tiempo ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las puntuaciones:', err);
            res.status(500).json({ error: 'Error al obtener las puntuaciones' });
        } else {
            // Formatear la fecha
            const formattedResults = results.map(result => {
                return {
                    ...result,
                    fecha: new Date(result.fecha).toISOString().split('T')[0] // Formatear como YYYY-MM-DD
                };
            });
            res.status(200).json(formattedResults);
        }
    });
});

// Guardar una nueva puntuación
app.post('/api/scores', (req, res) => {
    const { nombre, tiempo, puntos, fecha } = req.body;
    if (!nombre || !tiempo || !puntos) {
        return res.status(400).json({ error: 'Nombre, tiempo y puntos son requeridos' });
    }
   
    const query = 'INSERT INTO score (nombre, tiempo, puntos, fecha) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, tiempo, puntos, fecha], (err, results) => {
        if (err) {
            console.error('Error al guardar la puntuación:', err);
            return res.status(500).json({ error: 'Error al guardar la puntuación' });
        } 
        res.status(201).json({ message: 'Puntuación guardada con éxito' });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});