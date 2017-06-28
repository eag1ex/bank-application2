"use scrict"

// server
var express = require('express');
var apiRoutes = express.Router();
var myapp = express.Router();
var app = express();

//http 
var cors = require('cors');
var multer = require('multer');
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');

//mongodb 
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require(__dirname + '/config'); // config file
var Bankuser = require(__dirname + '/models/bank_user.js'); // orm model

/// for generating new db from json file
var json = require('json-file');
var jsonData = json.read(__dirname + '/initial_data.json').data;


// configuration =========
app.enable('trust proxy');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//console logging 
app.use(morgan('dev'));
app.use(express.static(config.PUBLIC));

app.use(function (req, res, next) {
    next();
});

apiRoutes.use(function (req, res, next) {
    next();
});




app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', config.PUBLIC);


var port = app.set('port', process.env.PORT || config.SERVER_PORT);
//==============


// connect to database
mongoose.Promise = global.Promise;
mongoose.connect(config.database, function (err, db) {
    if (err) {
        // throw err;
        console.log('error connecting to mongo db');
        throw err;
    } else {
        console.log('data base connected');
    }
});


// define file name and destination to save
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('uploading image to ', __dirname + '\\images')
        cb(null, __dirname + '\\images')
    },
    filename: (req, file, cb) => {
       
        let ext = file.originalname.split('.');
         console.log('uploading filename',ext)
        ext = ext[ext.length - 1];
        cb(null, 'uploads-' + Date.now() + '.' + ext);
    }
});


// define what file type to accept
var filter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        console.log('all good uploading')
        cb(null, true);
    } else {
        console.log('Failed: format not supported')
        cb('Failed: format not supported');
    }
}

// set multer config
var upload = multer({
    storage: storage,
    fileFilter: filter
}).single('appForm');



apiRoutes.post('/upload', (req, res) => {

    upload(req, res, (err) => {
        if (err) {
            return res.end("Error uploading file.");
        }
           
        res.status(200).json({
            file: req.protocol + '://' + req.get('host') + '/images/' + req.file.originalname,
            response:req.file
        })
    });


})



apiRoutes.get('/remove', function (req, res) {
    removeModel('bankuser');
    res.json({
        message: 'bankuser table removed from mongo db',
        success: true
    });
});

apiRoutes.get('/setup', function (req, res) {

    //console.log('model is found', findModel('bankuser'))

    if (!jsonData.data) {
        console.log('json data not available for new db');
        res.json({
            message: 'json data not available for new db',
            success: false
        });
        return;
    }

    // create
    var newIndex = [];
    for (var i = 0; i < jsonData.data.length; i++) {
        newIndex.push(jsonData.data[i]);
    }

    var obj1 = new Bankuser({
        name: 'user',
        indexes: newIndex
    });

    // save
    obj1.save(function (err) {
        if (err) throw err;

        console.log('saved successfully', obj1);
        res.json({
            message: 'populated db for jsonfile',
            success: true
        });
    });

});

/**
 * 
 * @findmodel
 */

function findModel(name) {
    var query = Bankuser.where({ name: name });
    query.findOne(function (err, obj) {
        if (obj === null) {
            console.log('no model found')
        }

        if (err) return handleError(err);
        if (obj) {
            console.log('we found your obj', obj)
        }
    });
};


function removeModel(name) {
    var query = Bankuser.where({ name: name });
    Bankuser.remove({ name: name }, function (err) {
        if (!err) {
            console.log('object removed');
            query.findOne(function (err, obj) {
                if (err) return handleError(err);
                if (obj) {
                    console.log('object found', obj)
                }
            });
        }
        else {

            console.log('error trying to remove')
        }
    });
};



apiRoutes.get('/', function (req, res) {

    var query = Bankuser.where({ name: 'user' });
    // console.log('query',query)
    query.findOne(function (err, obj) {
        if (obj === null) {
            console.log('no model found')

            res.json({
                message: 'no data found',
                success: false
            })
            res.status(404);
        }

        if (err) return handleError(err);
        if (obj) {
            // res.json(jsonData.data)
            res.json(obj.indexes)
            console.log('we found your obj', obj)
        }
    });


});

myapp.get(['/','/application'], (req, res, next) => {
    res.render('index', {
        /**
         * render server address API_MAIN in index.html
         * not working at moment??
         */
        API_MAIN: "http://localhost:" + app.get('port')+"/api"
    });
})



app.get('/application',function (req, res, next) {
    res.redirect('/app');
});

app.use('/api', apiRoutes);
app.use('/app', myapp);

// start server and listen
var newport = app.get('port');
var server = app.listen(newport, function () {
    console.log('server started. listening on http://localhost:' + newport);
    console.log('Open Browser on http://localhost:' + newport);
});




/*
.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
        newport++;
        console.log('Address in use, retrying on port ' + newport);
        setTimeout(function () {
            app.listen(newport);
        }, 250);
    }
});
*/





