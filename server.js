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
mongoose.connect(config.database, {
    useNewUrlParser: true
}, (err) => {
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

//Testing route

app.get("/", (req, res) => {
    res.send(`Testing API at html://localhost${port}/api is funtional`)
});

//Creating custom user

app.get('/setup', (req, res) => {

    const bob = new User({
        name: 'bob bob',
        password: 'passwordbob',
        admin: true,
    });
    bob.save()
        .then(response => {
            console.log(`${bob.name} saved succesfully`);
            return res.json({
                success: true
            })
        })
        .catch(error => {
            console.log(error, 'test')
            return res.json({
                error: error
            });
        })


});

//Other routes

let apiRoutes = express.Router();

apiRoutes.post('/authenticate', (req, res) => {
    User.findOne({
        name: req.body.name
    }, (err, user) => {
        if (err) {
            throw err
        };

        if (!user) {
            res.json({
                success: false,
                message: "Authntication failed. User not found"
            });
        } else if (user) {
            if (user.password != req.body.password) {
                res.json({
                    success: false,
                    message: "Authentication failed. Inncorrect password"
                })
            } else {
                const payload = {
                    admin: user.admin,
                };

                let token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: 1440
                });

                res.json({
                    success: true,
                    message: "Have your token",
                    token: token
                })
            }
        }
    });
});

//Protecting APIs

apiRoutes.use((req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, app.get('superSecret'), (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token'
                })
            } else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        return res.status(403).send({success: false, message:'No token provided'});
    }
});

apiRoutes.get("/", (req, res) => {
    res.json({
        message: "Second test, for the api routes"
    })
});

apiRoutes.get("/users", (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            throw err
        }
        res.json(users)
    })
});

app.use('/api', apiRoutes);





//*************
//SERVER INITIALISATION
//*************

app.listen(port);
console.log(`currently functional: http://localhost${port}`);