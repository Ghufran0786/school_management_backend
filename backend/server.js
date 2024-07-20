const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/schoolImages', express.static(path.join(__dirname, 'schoolImages')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '786Ghufran#',
    database: 'schoolDB'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('MySQL Connected...');
});

const storage = multer.diskStorage({
    destination: './schoolImages/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
}).single('image');

app.post('/addschool', (req, res) => {
    upload(req, res, err => {
        if (err) {
            console.error('Error during file upload:', err);
            return res.status(500).json({ error: 'Error during file upload' });
        }
        const { name, address, city, state, contact, email_id } = req.body;
        const image = req.file ? `/schoolImages/${req.file.filename}` : '';

        const sql = "INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(sql, [name, address, city, state, contact, image, email_id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json({ message: 'School added successfully' });
        });
    });
});

app.get('/schools', (req, res) => {
    const sql = "SELECT id, name, address, city, image FROM schools";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
