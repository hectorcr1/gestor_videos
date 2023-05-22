const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cors()); 

// Configura la conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4'
});

// Establece la conexión a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos MySQL');
});

// Obtener todos los videos
app.get('/videos', (req, res) => {
  const sql = 'SELECT * FROM videos order by id desc';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener los videos:', err);
      res.status(500).json({ error: 'Error al obtener los videos' });
      return;
    }
    res.json(results);
  });
});

// Obtener un video específico
app.get('/videos/:id', (req, res) => {
  const videoId = req.params.id;
  const sql = 'SELECT * FROM videos WHERE id = ?';
  connection.query(sql, [videoId], (err, results) => {
    if (err) {
      console.error('Error al obtener el video:', err);
      res.status(500).json({ error: 'Error al obtener el video' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Video no encontrado' });
      return;
    }
    res.json(results[0]);
  });
});

// Agregar un nuevo video pero validar antes que no exista
app.post('/videos', (req, res) => {
  const { url, title, description, duration, thumbnail } = req.body;
  const sql = 'SELECT * FROM videos WHERE url = ?';
  connection.query(sql, [url], (err, results) => {
    if (err) {
      console.error('Error al obtener el video:', err);
      res.status(500).json({ error: 'Error al obtener el video' });
      return;
    }
    if (results.length > 0) {
      res.status(409).json({ error: 'El video ya existe' });
      return;
    }
    const sql = 'INSERT INTO videos (url, title, description, duration, thumbnail) VALUES (?, ?, ?, ?, ?)';
    const values = [url, title, description, duration, thumbnail];
    connection.query(sql, values, (err, results) => {
      if (err) {
        console.error('Error al agregar el video:', err);
        res.status(500).json({ error: 'Error al agregar el video' });
        return;
      }
      res.status(201).json({ message: 'Video agregado exitosamente' });
    });
  });
});


// Eliminar un video
app.delete('/videos/:id', (req, res) => {
  const videoId = req.params.id;
  const sql = 'DELETE FROM videos WHERE id = ?';
  connection.query(sql, [videoId], (err, results) => {
    if (err) {
      console.error('Error al eliminar el video:', err);
      res.status(500).json({ error: 'Error al eliminar el video' });
      return;
    }
    res.json({ message: 'Video eliminado exitosamente' });
  });
});

// Inicia el servidor
app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
