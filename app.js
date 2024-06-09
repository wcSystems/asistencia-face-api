const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcryptjs = require('bcryptjs');
const morgan = require('morgan');
const mysqlConection = require('./database');
const fs = require('fs').promises;

const config = require('./config.json');
const jwt = require('jsonwebtoken');
const jwtHelpers = require('./_helpers/jwt');

// configuracion de correo
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anthonycarriedo2013@gmail.com',
        pass: '$0p0rt3W'
    }
  });
  
  async function mainEmail(email) {

    transporter.sendMail({
        from: `”Willinthon Carriedo 👻” <anthonycarriedo2013@gmail.com>`,
        to: email, // Cambia esta parte por el destinatario
        subject: "formulario.asunto",
        html: `
        <strong>Nombre:</strong> ff <br/>
        <strong>E-mail:</strong> ff <br/>
        <strong>Mensaje:</strong> fff
        `
        }, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
  }





const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

// app.use(cors({origin: "*"}));


app.use(express.json());
app.use(morgan('dev'));


// use JWT auth to secure the api
app.use(jwtHelpers());

app.use(express.static('public'));

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


















///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////




// REGISTRO DE COMPAÑIA
app.post('/company', async ( req, res ) => {
    const company = req.body.company
    const email  = req.body.email;
    const password  = req.body.password;
    let passwordHash = await bcryptjs.hash(password,8);
    const data = {
        id: null,
        company: company,
        email: email,
        password: passwordHash
    }

    mysqlConection.query(`SELECT * FROM company WHERE email = ?`, [email], (err, rows, fields) => {
        let firstRow = rows[0];
        if( firstRow.email === email ){
            res.send({
                status:'error',
                message:'Email ya registrado'
            });
        }
    })

    mysqlConection.query(`SELECT * FROM company WHERE company = ?`, [company], (err, rows, fields) => {
        let firstRow = rows[0];
        if( firstRow.company === company ){
            res.send({
                status:'error',
                message:'Compañia ya registrada'
            });
        }
    })

    mysqlConection.query(`INSERT INTO company set ?`, [data]);
    res.send({
        status:'success',
        message:'Porfavor verifique email'
    });
});




// LOGIN DE COMPAÑIA
app.post('/company-login', async ( req, res ) => {
    const email  = req.body.email;
    const password  = req.body.password;
    mysqlConection.query(`SELECT * FROM company WHERE email = ?`, [email], (err, rows, fields) => {
        let firstRow = rows[0];
        let passVerificado = bcryptjs.compareSync(password, firstRow.password);
        
        if(!passVerificado){
            res.send({error:'Usuario o contraseña errada'});
        }else{
            

            const token = jwt.sign({ sub: firstRow.id }, config.secret, { expiresIn: '7d' });

            res.send({
                ...omitPassword(firstRow),
                token
            });

        }
    })
});


function omitPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}



///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////





















// PUERTO DE CONEXION
app.listen(3000,()=>{ })