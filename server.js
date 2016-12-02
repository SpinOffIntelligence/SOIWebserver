    var express = require('express'); 
    var config = require('./config/config');

    var OrientDB = require('orientjs');
    var odb =  require('./components/orientdb.js');
    var fs = require('fs');
    
    var app = express(); 
    var bodyParser = require('body-parser');
    var multer = require('multer');

    app.use(function(req, res, next) { //allow cross origin requests
      res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
      res.header("Access-Control-Allow-Origin", "http://localhost");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    /** Serving from the same express Server
    No cors required */
    app.use("/uploader", express.static('../fileupload/client'));
    //app.use("/sioapp", express.static('../soiapp'));
    
    require('./config/routes.js')(app, express);
    
    // Bootstrap routes
    var routes_path = __dirname + '/app/routes';
    var walk = function(path) {
      fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
          if (/(.*)\.(js$|coffee$)/.test(file)) {
            require(newPath)(app);
          }
            // We skip the app/routes/middlewares directory as it is meant to be
            // used and shared by routes as further middlewares and is not a 
            // route by itself
          } else if (stat.isDirectory() && file !== 'middlewares') {
            walk(newPath);
          }
        });
    };
    walk(routes_path);  
    
    odb.init(function(err, res) {
    });


    app.listen('8080', function(){
      console.log('running on 8080...');
    });