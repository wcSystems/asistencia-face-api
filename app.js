const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcryptjs = require('bcryptjs');
const morgan = require('morgan');
const mysqlConection = require('./database');
const fs = require('fs').promises;

const app = express();

// app.use(cors({origin: "*"}));
app.use(cors({
    origin: ['*'],
    "methods": "GET,PUT,POST",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));


// SUBIR IMAGENES CON MULTER
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

const storage = multer.diskStorage({
    destination: ( req, file, cb ) => {
        cb(null,'uploads')
    },
    filename: ( req, file, cb ) => {
        cb( null, file.originalname )
    }
});

const upload = multer({storage});

// MOSTRAR TODAS LAS IMAGENES
app.get('/upload', (req, res) => {
    mysqlConection.query(`SELECT * FROM files`, (err, rows, fields) => {
        if( !err ) {
            res.json(rows)
        } else {
            console.log(err);
            return;
        }
    });
})


// MOSTRAR UNA SOLA IMAGEN
app.get('/imagen/:id', (req, res)=>{

    const id = req.params.id;
    mysqlConection.query(`SELECT imagen, username FROM files WHERE id = ?`, id, (err, rows, fields) => {
        [{imagen,username}] = rows;

        res.send({imagen,username});
    })
})

// SUBIR IMAGENES Y PASSWORD
app.post('/file', upload.single('file'), async ( req, res, next ) => {
    

    const file = req.file;
    const username  = req.body.username;
    const password  = req.body.password;

    let passwordHash = await bcryptjs.hash(password,8);

    const filesImg = {
        id: null,
        nombre: file.filename,
        username: username,
        imagen: file.path,
        password: passwordHash
    }

    if( !file ){
        const error = new Error("No file")
        error.httpStatusCode = 400;
        return next(error);
    }

    res.send(file)

    mysqlConection.query(`INSERT INTO files set ?`, [filesImg]);

});

// ELIMINAR IMAGENES
app.delete('/delete/:id', ( req, res) => {
    const { id } = req.params;
    deleteFile(id);
    mysqlConection.query(`DELETE FROM files WHERE id = ?`, [id]);
    res.json({message:'Imagen y password eliminados correctamente'});
})

// LOGIN
app.post('/auth/:id',(req, res)=>{
    
    const id = req.params.id;

    let pass = req.body.password;

    mysqlConection.query(`SELECT id, password FROM files WHERE id = ?`, id, (err, rows, fields)=>{
        [{password}] = rows;

        let passVerificado = bcryptjs.compareSync(pass, password);

        if( !passVerificado){
            res.status('400').json({message: "password invalido"});
        } else {
            res.send({message: "ok"});
        }
    })
})

function deleteFile(id){
    mysqlConection.query(`SELECT * FROM files WHERE id`, [id] ,(err, rows, fields)=>{
        const [{ imagen }] = rows;
        fs.unlink(path.resolve(`./${imagen}`)).then(()=>{ })
    })
}

// PUERTO DE CONEXION
app.listen(3000,()=>{ })