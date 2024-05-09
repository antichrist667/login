const express = require('express');
const app = express();

// Heroku dynamically sets a port
const PORT = process.env.PORT || 5000

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv')
dotenv.config({path:'./env/.env'});

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');


const session = require('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}));

//invocamos al modulo de conexion
const connection = require('./database/db');

//estableciendo rutas

app.get('/login', (req, res)=>{
    res.render('login');
})

app.get('/register', (req, res)=>{
    res.render('register');
})

//registro
app.post('/register', async (req, res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    connection.query('INSERT INTO users SET?', {user:user, name:name, rol:rol, pass:pass}, async(error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('register',{
                alert: true,
                alertTitle: "Registration",
                alertMessage:"¡Registro Exitoso!",
                alertIcon:'success',
                showConfirmButton:false,
                timer:1500,
                ruta:''
            })
        }
        
    })
})

//autenticación
app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    if(user && pass){
        connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results)=>{
            if(results.length == 0 || pass != results[0].pass){
                res.render('login',{
                alert: true,
                alertTitle: "Error",
                alertMessage:"Usuario o contraseña incorrecta",
                alertIcon:'error',
                showConfirmButton: true,
                timer:false,
                ruta:'login'
                });
            }else{
                req.session.loggedin = true;
                req.session.name = results[0].name
                res.render('login',{
                alert: true,
                alertTitle: "Conexión Exitosa",
                alertMessage:"Login Correcto!",
                alertIcon:'success',
                showConfirmButton: false,
                timer:1500,
                ruta:''
                });
            }
        } )
    }else{
        res.render('login',{
            alert: true,
            alertTitle: "Advertencia",
            alertMessage:"Ingrese un usuario y/o contraseña",
            alertIcon:"warning",
            showConfirmButton: true,
            timer:false,
            ruta:'login'
            });
    }
})

//auth paginas
app.get('/', (req, res)=>{
    if(req.session.loggedin){
        res.render('index' ,{
            login: true,
            name: req.session.name
        });    
    }else{
        res.render('index', {
            login:false,
            name:'Debe inciar sesión'
        })
    }
})

//logout
app.get('/logout', (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})