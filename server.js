//*************
//PACKAGES
//*************

const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');

const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('./app/models/user');

//*************
//CONFIGURATION
//*************

let port = process.env.PORT || 8080;
mongoose.connect(config.database, {useNewUrlParser: true}, (err) => {
    if (err) throw err;
    console.log('connected to db')
});
app.set('superSecret', config.secret)

//BODY-PARDER FOR POST AND URL

app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(bodyparser.json());

//MORGAN FOR LOGGING REQUEST IN THE CONSOLE

app.use(morgan('dev'));

//*************
//ROUTES
//*************

//TESTING ROUTE

app.get("/", (req, res) => {
    res.send(`Testing API at html://localhost${port}/api is funtional`)
});

//OTHER ROUTES

app.get('/setup', (req, res) => {

    const bob = new User({
        name: 'bob bob',
        password: 'passwordbob',
        admin: true,
    });
    bob.save()
    .then(response => {
        console.log(`${bob.name} saved succesfully`);
        return res.json({success: true})
    })
    .catch(error => {
        console.log(error, 'test')
        return res.json({error: error});
    })

    
});

//DIOGO's CODE
//app.use('/api', apiRoute);
// app.use(cors());
// let apiRoute = express.Router(cors());
// app.use('/api', apiRoute);


// app.get('/create', function (req, res) {
//     var userExemple = new User({
//         name: 'swartz12',
//         password: 'swartz12',
//         admin: true
//     });

//     console.log('test1');
//     userExemple.save(function (error) {
//         if (error) throw error;
//         console.log('New user create with success');
//         res.json({
//             success: true
//         });

//     });
//     console.log('test2')
// });



//*************
//SERVER INITIALISATION
//*************

app.listen(port);
console.log(`currently functional: http://localhost${port}`);