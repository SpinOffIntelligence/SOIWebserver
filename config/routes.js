var config = require('./config'),
    path = require('path'),
    utilities = require('../components/utilities.js');
    
  module.exports = function(app,express){

  var SEOProxy = function(req, res, next) {
    //console.log('req.url:',req.url);

    // if(req.url == '/frm/') {
    //   res.redirect('http://www.garp.org/#!/frm/');
    //   return;
    // }
    var q = '';
    var DBEncryptID = '';
    var CertificateType = '';
    for(var propt in req.query){

      if(propt == 'DBEncryptID') {
        DBEncryptID = req.query[propt];
      }
      if(propt == 'CertificateType') {
        CertificateType = req.query[propt];
      }

      if(q=='') {
        q = '?' + propt + '=' + req.query[propt];
      } else {
        q = q + '&' + propt + '=' + req.query[propt];
      }
    }

    if(utilities.defined(utilities,"routeTable.length")) {
      for(var i=0; i<utilities.routeTable.length; i++) {
        //console.log('Check:' + req.url.indexOf(utilities.routeTable[i].route) + ':' + req.url);
        if(req.url == utilities.routeTable[i].route) {
          if(utilities.defined(utilities.routeTable[i],"dest")) {
            console.log('* * * Redirect:' + utilities.routeTable[i].dest);
            res.redirect(utilities.routeTable[i].dest + q);
            return;
          }              
        }
      }        
    }    
    return express.static(path.join(__dirname, config.microsites), {index:false, redirect:false})(req, res, next);  
  };

  app.use(SEOProxy);
  app.use("/frmapp", express.static(path.join(__dirname, '../../frmapp')));
  app.use("/www", express.static(path.join(__dirname, '../public')));
  app.use("/rpt", express.static(path.join(__dirname, '../reports')));
  app.use("/", express.static(path.join(__dirname, config.microsites + '/index.html')));


  app.use(function(req,res){
      
      //console.dir(req.query);
      var q = '';
      var DBEncryptID = '';
      var CertificateType = '';
      for(var propt in req.query){

        if(propt == 'DBEncryptID') {
          DBEncryptID = req.query[propt];
        }
        if(propt == 'CertificateType') {
          CertificateType = req.query[propt];
        }

        if(q=='') {
          q = '?' + propt + '=' + req.query[propt];
        } else {
          q = q + '&' + propt + '=' + req.query[propt];
        }
      }

      if(req.url.indexOf('frmcertifieddigitalbadge.aspx') > -1) {
        var garpId = utilities.Base64.decode(DBEncryptID);
        if(CertificateType == 'FRM') {
          console.log('Redirect: ' + 'http://my.garp.org/DigitalBadgeFRM?id=' + garpId);
          res.redirect('http://my.garp.org/DigitalBadgeFRM?id=' + garpId);
          return;
        } else {
          console.log('Redirect: ' + 'http://my.garp.org/DigitalBadgeERP?id=' + garpId);
          res.redirect('http://my.garp.org/DigitalBadgeERP?id=' + garpId);
          return;
        }

      }

      var reqUrl = req.url;
      if(q != '') {
        var idx = req.url.indexOf('?');
        if(idx > -1) {
          reqUrl = reqUrl.substring(0,idx);
        }
      }

      console.log('reqUrl:' + reqUrl);

      if(utilities.defined(utilities,"routeTable.length")) {
        for(var i=0; i<utilities.routeTable.length; i++) {
          //console.log('Check:' + utilities.routeTable[i].route + ':' + reqUrl);
          if(reqUrl == utilities.routeTable[i].route) {
            if(utilities.defined(utilities.routeTable[i],"dest")) {
              console.log('* * * Redirect:' + utilities.routeTable[i].dest + q);
              res.redirect(utilities.routeTable[i].dest + q);
              return;
            }              
          }
        }        
      }

      res.redirect('/#!/404/');
      
  });

}