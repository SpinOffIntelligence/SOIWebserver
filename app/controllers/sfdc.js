'use strict';

var Services = require('../services/sfdc');
var sfdccomp = require('../../components/jsforce.js');
var utilities = require('../../components/utilities.js');
var config = require('../../config/config');
var ical = require('ical-generator');
var cal = ical();
var https = require('https');
var fs = require("fs");
var util = require('util');
var moment = require('moment');
var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  var localStorage = new LocalStorage('./scratch', 5 * 1024 * 1024 * 1024);
}

function formatDate(sdt) {
  var regex = /([^T]*)T([^\.]*)\./;
  var result = sdt.match(regex);

  console.log('regex:' + result);

  var dt3 = sdt;
  if(result != null && result.length > 1) {
    var dt3 = util.format("%s",result[1]);
  }
  return dt3;
}

function formatDateTime(sdt) {
  var regex = /([^T]*)T([^\.]*)\./;
  var result = sdt.match(regex);

  console.log('regex:' + result);

  var dt3 = sdt;
  if(result != null && result.length > 1) {
    var dt3 = util.format("%s %s",result[1], result[2]);
  }
  return dt3;
}

function isNull(sdata) {
  if(sdata == null)
    return '';
  else return sdata;
}


function addressLimit(sdata) {
  if(sdata != null && sdata.length > 40) {
    return sdata.substring(0,40);
  } else {
    return sdata;
  }

}


exports.getjobTargetJobs = function(req, res, next) {

  try {



    var agentOptions;
    var agent;

    agentOptions = {
      host: 'www.example.com'
      , port: '80'
      , path: '/'
      , rejectUnauthorized: false
    };

    agent = new https.Agent(agentOptions);

    console.log('agent :' + agent);

    request({
      url: "http://careers.garp.com/distrib/jobs/widget.cfm?code=iG9k525rVB3N56pp5FSy0tRypV34PSMN&rand=705"
      , method: 'GET'
    }, function (err, resp, body) {
      // ...
      console.log('return :' + err + ':' + body);
      //res.json(body);

      var $ = cheerio.load(body);

      var jobs = {
        count: 0,
        jobs: []
      };

      $('.jt_job_position').each(function(i, elem) {
        var obj = {
          name: $(this).text(),
          location: null,
          company: null,
          description: null,
          url: null
        }
        jobs.jobs.push(obj);
      });

      $('.jt_job_location').each(function(i, elem) {
        jobs.jobs[i].location = $(this).text();
      });

      $('.jt_job_description').each(function(i, elem) {
        jobs.jobs[i].description = $(this).text();
      });

      $('.jt_job_company').each(function(i, elem) {
        jobs.jobs[i].company = $(this).text();
      });

      $('.jt_job').each(function(i, elem) {
        console.log('------------');
        var ahref = $(this).find('a').attr('href');
        console.log(ahref);
        jobs.jobs[i].url = ahref;
      });


      jobs.count = jobs.jobs.length-1;
      console.log('len:' + jobs.length);
      console.log(jobs);

      res.json(jobs);

    });



} catch (e) {
  console.dir(e);
  res.send(e);
}

}


exports.getSmartProsResponse = function(req, res, next) {

  try {

    var agentOptions;
    var agent;

    agentOptions = {
      host: 'www.example.com'
      , port: '443'
      , path: '/'
      , rejectUnauthorized: false
    };

    agent = new https.Agent(agentOptions);

    request({
      url: "https://fulfillmentservice.stage.smartpros.com/SmartprosFulfillmentService.svc/" + req.params.type + "/" + req.params.req
      , method: 'GET'
      , agent: agent
    }, function (err, resp, body) {
      // ...
      console.log('return :' + err + ':' + body);
      res.json(body);

    });



  } catch (e) {
    console.dir(e);
    res.send(e);
  }

}


exports.getSFDCExamPrepProviders = function(req, res, next) {

  try {

    if(config.cache) {
      var cacheKey = "getSFDCExamPrepProviders";
      console.log('**Get key:' + cacheKey);
      var cacheVal = localStorage.getItem(cacheKey);
      console.log('**cacheVal:' + utilities.defined(cacheVal));
    }

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      sfdccomp.getToken(function(err, conn) {
        if (err) return next(err);

        console.log('controller - get conn');
        var SFDCService = new Services(conn);

        SFDCService.getExamPrepProviders(function(err, data) {

          //console.log('return :' + err + ':' + data);

          var providers = data;
          console.dir(providers.records[0]);

          SFDCService.getExamPrepProviderContacts(function(err, data) {

            try {
              console.log('return :' + err + ':' + data + ':' + providers.records.length);

              var eppContactIds = [];

              if(utilities.defined(providers,"records.length") && providers.records.length > 0) {
                for(var i=0; i<providers.records.length; i++) {
                  var prov = providers.records[i];
                  var matchItem = _.findWhere(data.records, {AccountId: prov.Id});
                  if(utilities.defined(matchItem)) {
                    prov.contact = matchItem;
                  }
                }

                if(config.cache) {
                  var cacheVal = JSON.stringify(providers);
                  localStorage.setItem(cacheKey, cacheVal);
                  console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
                }

                res.json(providers);
              } else {
                res.json(404);
              }
            } catch (e) {
              console.dir(e);
              res.send(e);
            }
          });
});
});
}

} catch (e) {
  console.dir(e);
  res.send(e);
}

}



exports.getSFDCExamFees = function(req, res, next) {

  try {

    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getExamGroupDetails(function(err, data) {

        //console.log('return :' + err + ':' + data);

        if(utilities.defined(data,"records.length") && data.records.length > 0) {
          var examGroupDetails = data.records[0];
          //console.dir(examGroupDetails);

          SFDCService.getProducts(function(err, data) {

            try {
              //console.log('return :' + err + ':' + data + ':' + examGroupDetails);

              var frmEarlyPrice = 0;
              var frmStandardPrice = 0;
              var frmLatePrice = 0;

              var erpEarlyPrice = 0;
              var erpStandardPrice = 0;
              var erpLatePrice = 0;

              var enrollment = 0;

              var mExamDate = moment(examGroupDetails.Exam_Date__c);
              var monthNum = mExamDate.month()+1;

              for(var i=0; i<data.records.length; i++) {
                var rec = data.records[i];

                //console.log('In Loop:' + i);
                //console.dir(rec);

                if(rec.Product2.ProductCode == 'FRM1E' && ((rec.Product2.GL_Code__c == '4001' && monthNum == 5) || (rec.Product2.GL_Code__c == '4002' && monthNum == 11))) {
                  frmEarlyPrice = rec.UnitPrice;
                }
                if(rec.Product2.ProductCode == 'FRM1S' && ((rec.Product2.GL_Code__c == '4001' && monthNum == 5) || (rec.Product2.GL_Code__c == '4002' && monthNum == 11))) {
                  frmStandardPrice = rec.UnitPrice;
                }
                if(rec.Product2.ProductCode == 'FRM1L' && ((rec.Product2.GL_Code__c == '4001' && monthNum == 5) || (rec.Product2.GL_Code__c == '4002' && monthNum == 11))) {
                  frmLatePrice = rec.UnitPrice;
                }
                if(rec.Product2.ProductCode == 'ENC1E' && ((rec.Product2.GL_Code__c == '4001' && monthNum == 5) || (rec.Product2.GL_Code__c == '4002' && monthNum == 11))) {
                  erpEarlyPrice = rec.UnitPrice;
                }
                if(rec.Product2.ProductCode == 'ENC1S' && ((rec.Product2.GL_Code__c == '4001' && monthNum == 5) || (rec.Product2.GL_Code__c == '4002' && monthNum == 11))) {
                  erpStandardPrice = rec.UnitPrice;
                }
                if(rec.Product2.ProductCode == 'ENC1L' && ((rec.Product2.GL_Code__c == '4001' && monthNum == 5) || (rec.Product2.GL_Code__c == '4002' && monthNum == 11))) {
                  erpLatePrice = rec.UnitPrice;
                }
                if(rec.Product2.ProductCode == 'FRM1' && rec.Product2.GL_Code__c == '4010') {
                  enrollment = rec.UnitPrice;
                }
              }

              var retObj = {
                examGroupDetails: examGroupDetails,
                registrationStartDate: utilities.getValue(examGroupDetails,"Registration_Start_Date__c"),
                enrollment: enrollment,
                frm: {
                  early: {
                    price: frmEarlyPrice,
                    lastDate: utilities.getValue(examGroupDetails,"Last_Date_For_Early_Registration__c")
                  },
                  standard: {
                    price: frmStandardPrice,
                    lastDate: utilities.getValue(examGroupDetails,"Last_Date_For_Standard_Registration__c")
                  },
                  late: {
                    price: frmLatePrice,
                    lastDate: utilities.getValue(examGroupDetails,"Last_Date_For_Late_Registration__c")
                  },
                  nextEarly: {
                    price: frmEarlyPrice,
                    lastDate: utilities.getValue(examGroupDetails,"Next_Exam_Group__r.Last_Date_For_Early_Registration__c")
                  },
                  nextStandard: {
                    price: frmStandardPrice,
                    lastDate: utilities.getValue(examGroupDetails,"Next_Exam_Group__r.Last_Date_For_Standard_Registration__c")
                  },
                  nextLate: {
                    price: frmLatePrice,
                    lastDate: utilities.getValue(examGroupDetails,"Next_Exam_Group__r.Last_Date_For_Late_Registration__c")
                  }
                },
                erp: {
                  early: {
                    price: erpEarlyPrice,
                    lastDate: utilities.getValue(examGroupDetails,"Last_Date_For_Early_Registration__c")
                  },
                  standard: {
                    price: erpStandardPrice,
                    lastDate: utilities.getValue(examGroupDetails,"Last_Date_For_Standard_Registration__c")
                  },
                  late: {
                    price: erpLatePrice,
                    lastDate: utilities.getValue(examGroupDetails,"Last_Date_For_Late_Registration__c")
                  },
                  nextEarly: {
                    price: erpEarlyPrice,
                    lastDate: utilities.getValue(examGroupDetails,"Next_Exam_Group__r.Last_Date_For_Early_Registration__c")
                  },
                  nextStandard: {
                    price: erpStandardPrice,
                    lastDate: utilities.getValue(examGroupDetails,"Next_Exam_Group__r.Last_Date_For_Standard_Registration__c")
                  },
                  nextLate: {
                    price: erpLatePrice,
                    lastDate: utilities.getValue(examGroupDetails,"Next_Exam_Group__r.Last_Date_For_Late_Registration__c")
                  }
                }
              };

              res.json(retObj);
            } catch (e) {
              console.dir(e);
              res.send(e);
            }
          });
} else {
  res.json(404);
}
});
});

} catch (e) {
  console.dir(e);
  res.send(e);
}

}


exports.getSFDCReportsData = function(req, res, next) {

  try {

    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      console.log('controller - get conn');
      var SFDCService = new Services(conn);

      //SFDCService.getICBRRcdd(function(err, data) {
        SFDCService.getReportsData(req.params.id, function(err, data) {

          console.log('return :' + err + ':' + data);
          res.json(data);

        });
      });

  } catch (e) {
    console.dir(e);
    res.send(e);
  }

}


exports.setSFDCICBRRstatus = function(req, res, next) {

  try {

    var garpId = req.params.garpId;
    var procType = req.params.procType;
    var status = req.params.status;
    var examDate = req.params.examDate;
    var result = req.params.result;
    var score = req.params.score;

    var regErrorText = req.body.regErrorText;
    var authErrorText = req.body.authErrorText;

    console.dir(req.body);

    console.log('setSFDCICBRRstatus:' + garpId + ':' + procType + ':' + status + ':' + examDate + ':' + result + ':' + score + ':' + regErrorText + ':' + authErrorText);

    //var folder = req.body.folder;
    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      console.log('controller - get conn');
      var SFDCService = new Services(conn);

      //SFDCService.getICBRRcdd(function(err, data) {
        SFDCService.setICBRRstatus(garpId, procType, status, examDate, result, score, regErrorText, authErrorText, function(err, data) {

          console.log('setICBRRstatus return :' + err + ':' + data);

          if (utilities.defined(err)) {
            res.send(err);
            return;
          }

          console.log('No error.');

          if (!utilities.defined(data))
          {
            res.send('Failed to load data');
            return;
          }

          console.log('No missing data.');

          res.send('Update Complete');

        });

      });

  } catch (e) {
    console.dir(e);
    res.send(e);
  }
}

exports.getSFDCICBRRcdd = function(req, res, next) {

  try {

    //var folder = req.body.folder;
    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      //SFDCService.getICBRRcdd(function(err, data) {
        SFDCService.getICBRRActiveRegistrations(function(err, data) {

          if (err) return next(err);
          if (!data) return next(new Error('Failed to load data'));

          console.log('Done getSFDCICBRRcdd:' + data.records.length);
        //console.dir(data);

        try {

          console.log('Done getSFDCICBRRcdd:' + data.records.length);

          var updateDate = '';
          var now = new Date();
          var month = now.getMonth()+1;
          if(String(month).length==1)
            month = "0" + month;
          var day = now.getDate();
          if(String(day).length==1)
            day = "0" + day;
          var year = now.getFullYear();

          var hours = now.getHours();
          if(String(hours).length==1)
            hours = "0" + hours;

          var min = now.getMinutes();
          if(String(min).length==1)
            min = "0" + min;

          var sec = now.getSeconds();
          if(String(sec).length==1)
            sec = "0" + sec;

          updateDate = now.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + sec;

          var lines = 'ClientCandidateId\tFirstName\tLastName\tMiddleName\tSuffix\tSalutation\tEmail\tLastUpdate\tAddress1\tAddress2\tCity\tState\tPostalCode\tCountry\tPhone\tFax\tFaxCountryCode\tPhoneCountryCode\tCompanyName\n';
          //var lines = 'ClientCandidateId\tFirstName\tLastName\tMiddleName\tSuffix\tSalutation\tEmail\tAddress1\tAddress2\tCity\tState\tPostalCode\tCountry\tPhone\tPhoneCountryCode\tFAX\tFAXCountryCode\tCompanyName\tLastUpdate\n';

          for(var i=0; i<data.records.length; i++) {
            var dataItem = data.records[i];

            console.log('i:' + i);
            console.dir(dataItem);


            console.log('no0:' + dataItem.Name);
            console.log('no0:' + dataItem.Member__r.FirstName);


            var firstName = dataItem.Member__r.FirstName;
            var lastName = dataItem.Member__r.LastName;
            var middleName = '';
            var suffix = dataItem.Member__r.Suffix__c
            var salutation = dataItem.Member__r.Salutation;
            var lastUpdate = null;
            var clientCandidateId = dataItem.Garp_Id__c
            var phone = '2017197210';

            console.log('no1');

            var countryCode = '1';
            var country = 'USA';
            if(utilities.defined(dataItem,"Member__r.MailingCountry"))
              country = dataItem.Member__r.MailingCountry;
            else if(utilities.defined(dataItem,"Opportunity__r.Account.BillingCountry"))
              country = dataItem.Member__r.MailingCountry;

            else if(utilities.defined(dataItem,"Opportunity__r.ChargentSFA__Billing_Country__c"))
              country = dataItem.Member__r.ChargentSFA__Billing_Country__c;
            else if(utilities.defined(dataItem,"Opportunity__r.Shipping_Country__c"))
              country = dataItem.Member__r.Shipping_Country__c;


            if(utilities.defined(dataItem,"Member__r.Phone"))
              phone = dataItem.Member__r.Phone;
            else if(utilities.defined(dataItem,"Member__r.OtherPhone"))
              phone = dataItem.Member__r.OtherPhone;
            else if(utilities.defined(dataItem,"Member__r.HomePhone"))
              phone = dataItem.Member__r.HomePhone;

            else if(utilities.defined(dataItem,"Opportunity__r.ChargentSFA__Billing_Phone__c"))
              phone = dataItem.Opportunity__r.ChargentSFA__Billing_Phone__c;
            else if(utilities.defined(dataItem,"Opportunity__r.Shipping_Phone_No__c"))
              phone = dataItem.Opportunity__r.Shipping_Phone_No__c;

            console.log('no2');

            var address1 = '';
            var address2 = '';
            var city = '';
            var state = '';
            var zip = '';

            if(utilities.defined(dataItem,"Opportunity__r.ChargentSFA__Billing_Address__c") && utilities.defined(dataItem,"Opportunity__r.ChargentSFA__Billing_City__c") &&
              utilities.defined(dataItem,"Opportunity__r.ChargentSFA__Billing_State__c") && utilities.defined(dataItem,"Opportunity__r.ChargentSFA__Billing_Zip__c") &&
              utilities.defined(dataItem,"Opportunity__r.ChargentSFA__Billing_Country__c") && utilities.defined(dataItem,"Opportunity__r.ChargentSFA__Billing_Phone__c")
              ) {

              var arrNames = dataItem.Opportunity__r.ChargentSFA__Billing_Address__c.split('\n');
            if(arrNames.length > 0)
              address1 = arrNames[0].replace("\r", "");
            if(arrNames.length > 1)
              address2 = arrNames[1].replace("\r", "");

            city = dataItem.Opportunity__r.ChargentSFA__Billing_City__c;
            state = dataItem.Opportunity__r.ChargentSFA__Billing_State__c;
            zip = dataItem.Opportunity__r.ChargentSFA__Billing_Zip__c;
            country = dataItem.Opportunity__r.ChargentSFA__Billing_Country__c;
            phone = dataItem.Opportunity__r.ChargentSFA__Billing_Phone__c;

          } else if(utilities.defined(dataItem,"Opportunity__r.Shipping_Street__c") && utilities.defined(dataItem,"Opportunity__r.Shipping_City__c") &&
            utilities.defined(dataItem,"Opportunity__r.Shipping_State__c") && utilities.defined(dataItem,"Opportunity__r.Shipping_Postal_Code__c") &&
            utilities.defined(dataItem,"Opportunity__r.Shipping_Country__c") && utilities.defined(dataItem,"Opportunity__r.Opportunity__r.Shipping_Phone_No__c")
            ) {

            var arrNames = dataItem.Opportunity__r.Shipping_Street__c.split('\n');
            if(arrNames.length > 0)
              address1 = arrNames[0].replace("\r", "");
            if(arrNames.length > 1)
              address2 = arrNames[1].replace("\r", "");

            city = dataItem.Opportunity__r.Shipping_City__c;
            state = dataItem.Opportunity__r.Shipping_State__c;
            zip = dataItem.Opportunity__r.Shipping_Postal_Code__c;
            country = dataItem.Opportunity__r.Shipping_Country__c;
            phone = dataItem.Opportunity__r.Shipping_Phone_No__c;

          } else if(utilities.defined(dataItem,"Member__r.MailingStreet") && utilities.defined(dataItem,"Member__r.MailingCity") &&
            utilities.defined(dataItem,"Member__r.MailingState") && utilities.defined(dataItem,"Member__r.MailingPostalCode") &&
            utilities.defined(dataItem,"Member__r.MailingCountry") &&
            (utilities.defined(dataItem,"Member__r.Phone") || utilities.defined(dataItem,"Member__r.OtherPhone") || utilities.defined(dataItem,"Member__r.HomePhone"))
            ) {

            var arrNames = dataItem.Member__r.MailingStreet.split('\n');
            if(arrNames.length > 0)
              address1 = arrNames[0].replace("\r", "");
            if(arrNames.length > 1)
              address2 = arrNames[1].replace("\r", "");

            city = dataItem.Member__r.MailingCity;
            state = dataItem.Member__r.MailingState;
            zip = dataItem.Member__r.MailingPostalCode;
            country = dataItem.Member__r.MailingCountry;

            if(utilities.defined(dataItem,"Member__r.Phone"))
              phone = dataItem.Member__r.Phone;
            else if(utilities.defined(dataItem,"Member__r.OtherPhone"))
              phone = dataItem.Member__r.OtherPhone;
            else if(utilities.defined(dataItem,"Member__r.HomePhone"))
              phone = dataItem.Member__r.HomePhone;


          } else if(utilities.defined(dataItem,"Account.BillingStreet") && utilities.defined(dataItem,"Account.BillingCity") &&
            utilities.defined(dataItem,"Account.BillingState") && utilities.defined(dataItem,"Account.BillingPostalCode") &&
            utilities.defined(dataItem,"Account.BillingCountry")
            ) {

            var arrNames = dataItem.Opportunity__r.Account.BillingStreet.split('\n');
            if(arrNames.length > 0)
              address1 = arrNames[0].replace("\r", "");
            if(arrNames.length > 1)
              address2 = arrNames[1].replace("\r", "");

            city = dataItem.Opportunity__r.Account.BillingCity;
            state = dataItem.Opportunity__r.Account.BillingState;
            zip = dataItem.Opportunity__r.Account.BillingPostalCode;
            country = dataItem.Opportunity__r.Account.BillingCountry;

          }

            // Fix Address
            if(country == 'USA' || country.indexOf('United State') > -1 && phone.length == 11) {
              phone = phone.substring(1);
            }

            if(city.length > 32) {
              city = city.substring(0,32);
            }

            if(firstName.indexOf('GARPQA') > -1 || lastName.indexOf('GARPQA') > -1) {
              continue;
            }

            console.log('yes1 [' + address1 + '][' + address2 + ']');

            //var dt7 = '';
            //if(utilities.defined(dataItem,"CreatedDate")) {
            //  var dt7 = formatDateTime(dataItem.CreatedDate);
            //}
            console.log('yes2');

            //var cid = dataItem.ClientCandidateId__c;
            //var clientCandidateId = dataItem.Garp_Id__c
            while(utilities.defined(clientCandidateId,"length") && clientCandidateId.length < 8) {
              clientCandidateId = "0" + clientCandidateId;
            }

            console.log('yes3');

            if(utilities.defined(country)) {

              console.log('yes5');

              var matchItem = _.find(utilities.cc, {country: country});

              console.log('matchItem:' + matchItem + ':' + dataItem);
              console.dir(matchItem);

              if(utilities.defined(matchItem)) {

                console.log('matchItem: yes');

                country = matchItem.code;
                countryCode = matchItem.phoneCode;
              } else {
                country = 'USA';
                countryCode = '1';
              }
            } else {
              country = 'USA';
              countryCode = '1';
            }

            console.log('yes6');

            var newline = util.format('%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n',
              clientCandidateId,
              isNull(firstName),
              isNull(lastName),
              isNull(middleName),
              isNull(suffix),
              isNull(salutation),
              isNull(dataItem.Member__r.Email),
              updateDate,
              isNull(addressLimit(address1)),
              isNull(addressLimit(address2)),
              isNull(addressLimit(city)),
              isNull(addressLimit(state)),
              isNull(addressLimit(zip)),
              country,
              isNull(phone),
              isNull(''),
              isNull(''),
              countryCode,
              isNull(dataItem.Member__r.Company__c)
              );
            console.log('**' + newline);
            lines += newline;
          }
          console.log('**' + lines);
        } catch (e) {
          console.dir(e);
          //return next(new Error(e.TypeError));
        }

        try {

          var fileDate = now.getFullYear() + '-' + month + '-' + day + '.' + hours + '.' + min + '.' + sec;

          fs.writeFile("/home/ec2-user/ICBRR/cdd." + fileDate + ".dat", lines, function(err) {

            if(err) {
              console.log(err);
            } else {
              console.log("The file was saved!");
              res.send(lines);
            }
          });

        } catch (e) {
          //console.dir(e);
          return next(new Error(e.TypeError));
        }

        res.send(lines);
      });
})
} catch (e) {
    //console.dir(e);
    return next(new Error(e.TypeError));
  }
}

exports.getSFDCICBRRead = function(req, res, next) {

  try {

    //var folder = req.body.folder;
    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      //SFDCService.getICBRRead(function(err, data) {
        SFDCService.getICBRRActiveRegistrationsAuth(function(err, data) {
          if (err) return next(err);
          if (!data) return next(new Error('Failed to load data'));

          console.log('Done getICBRRead:');
          console.dir(data);

          try {

            console.log('Done getICBRRead:' + data.records.length);

            var updateDate = '';
            var now = new Date();
            var month = now.getMonth()+1;
            if(String(month).length==1)
              month = "0" + month;
            var day = now.getDate();
            if(String(day).length==1)
              day = "0" + day;
            var year = now.getFullYear();

            var hours = now.getHours();
            if(String(hours).length==1)
              hours = "0" + hours;

            var min = now.getMinutes();
            if(String(min).length==1)
              min = "0" + min;

            var sec = now.getSeconds();
            if(String(sec).length==1)
              sec = "0" + sec;

            updateDate = now.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + min + ':' + sec;

          //var lines = 'ClientCandidateId\tAuthorizationTransactionType\tExamAuthorizationCount\tEligibilityApptDateFirst\tExamSeriesCode\tEligibilityApptDateLast\tClientAuthorizationID\tLastUpdate\n';
          var lines = 'AuthorizationTransactionType\tClientAuthorizationID\tClientCandidateId\tExamAuthorizationCount\tExamSeriesCode\tEligibilityApptDateFirst\tEligibilityApptDateLast\tLastUpdate\n';

          for(var i=0; i<data.records.length; i++) {

            var dataItem = data.records[i];

            console.log('i:' + i);
            console.dir(dataItem);

            var firstName = dataItem.Member__r.FirstName;
            var lastName = dataItem.Member__r.LastName;

            if(firstName.indexOf('GARPQA') > -1 || lastName.indexOf('GARPQA') > -1) {
              continue;
            }

            var dt3 = dataItem.Candidate_Commitment__r.StartDate + ' 00:00:00';
            var dt5 = dataItem.Candidate_Commitment__r.EndDate + ' 00:00:00';

            var clientCandidateId = dataItem.Garp_Id__c
            while(utilities.defined(clientCandidateId,"length") && clientCandidateId.length < 8) {
              clientCandidateId = "0" + clientCandidateId;
            }

            var method = 'Add';
            if(utilities.defined(dataItem,"ICBRR_Authorization_Status__c") && (dataItem.ICBRR_Authorization_Status__c == 'Successful' || dataItem.ICBRR_Authorization_Status__c == 'Force Update')) {
              method = 'Update'
            }

            var examSeriesCode = '2010-777';
            if(utilities.defined(dataItem,"Program_Abbrev__c") && dataItem.Program_Abbrev__c == 'FRR')
              examSeriesCode = '2016-FRR';

            lines += util.format('%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n',
              method,
              isNull(dataItem.ClientAuthorizationID__c),
              clientCandidateId,
              isNull('3'),
              examSeriesCode,
              dt3,
              dt5,
              updateDate);
          }
          console.log('**' + lines);
        } catch (e) {
          console.dir(e);
          //return next(new Error(e.TypeError));
        }

        try {
          //fs.writeFile("/home/ec2-user/ICBRR/icbrr_ead.csv", lines, function(err) {

            var fileDate = now.getFullYear() + '-' + month + '-' + day + '.' + hours + '.' + min + '.' + sec;

            fs.writeFile("/home/ec2-user/ICBRR/ead." + fileDate + ".dat", lines, function(err) {
              if(err) {
                console.log(err);
              } else {
                console.log("The file was saved!");
                res.send(lines);
              }
            });

          } catch (e) {
            console.dir(e);
            return next(new Error(e.TypeError));
          }

          res.send(lines);
        });
})
} catch (e) {
    //console.dir(e);
    return next(new Error(e.TypeError));
  }
}

exports.getSFDCOppLineItems = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getOppLineItems(req.params.id, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getSFDCTransactions = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getTransactions(req.params.id, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};


exports.getSFDCProducts = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getProducts(function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getExamAlertsByExamSiteId = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getExamAlertsByExamSiteId(req.params.id, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getAllExamAlerts = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getAllExamAlerts(function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getActiveExamSites = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getActiveExamSites(function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getExamVenues = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);


    console.log('Start Date: ' + req.params.examDate);

    var examDate = moment(req.params.examDate).format("YYYY-MM-DD");
    console.log('Exam Date: ' + examDate);

    SFDCService.getExamVenues(examDate, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getSFDCChapters = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getChapters(function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getSFDCCPDActivities = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getCPDActivities(function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getMembershipOfferByOfferId = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getMembershipOfferByOfferId";
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {
      var SFDCService = new Services(conn);

      SFDCService.getMembershipOffer(function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }

        res.json(data);
      });
    }

  });
};



exports.getSFDCEvent = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCEvent" + ':' + utilities.toLower(req.params.eventId);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      var eventId = req.params.eventId;
      var SFDCService = new Services(conn);

      SFDCService.getEvent(eventId, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }

        res.json(data);
      });
    }

  });
};

exports.getSFDCEventRates = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCEventRates" + ':' + utilities.toLower(req.params.eventId);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      var eventId = req.params.eventId;
      var SFDCService = new Services(conn);

      SFDCService.getEventRates(eventId, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }

        res.json(data);
      });
    }

  });
};

exports.getSFDCEventSponsors = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCEventSponsors" + ':' + utilities.toLower(req.params.eventId);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      var eventId = req.params.eventId;
      var SFDCService = new Services(conn);

      SFDCService.getEventSponsors(eventId, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }

        res.json(data);
      });
    }

  });
};



exports.getSFDCEventSessions = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCEventSessions" + ':' + utilities.toLower(req.params.eventId);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      var eventId = req.params.eventId;
      var SFDCService = new Services(conn);

      SFDCService.getEventSessions(eventId, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }

        res.json(data);
      });
    }

  });
};


exports.getSFDCEventSpeakers = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCEventSpeakers" + ':' + utilities.toLower(req.params.eventId);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      var eventId = req.params.eventId;
      var SFDCService = new Services(conn);

      SFDCService.getEventSpeakers(eventId, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }

        res.json(data);
      });
    }

  });
};

exports.getSFDCEventContacts = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCEventContacts" + ':' + utilities.toLower(req.params.eventId);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      var eventId = req.params.eventId;
      var SFDCService = new Services(conn);

      SFDCService.getEventContacts(eventId, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }

        res.json(data);
      });
    }

  });
};


exports.getSFDCEventContent = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCEventContent" + ':' + utilities.toLower(req.params.folderName);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      var folderName = req.params.folderName;
      var SFDCService = new Services(conn);

      SFDCService.getEventContent(folderName, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }

        res.json(data);
      });
    }

  });
};










exports.getCertifiedCandidatesByExam = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getCertifiedCandidatesByExam" + ':' + utilities.toLower(req.params.exam) + ':' + req.params.startDate + ':' + req.params.endDate;
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      var startDate = req.params.startDate;
      var endDate = req.params.endDate;
      var exam = req.params.exam;
      var SFDCService = new Services(conn);

      SFDCService.getCertifiedCandidatesByExam(exam, startDate, endDate, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        var cacheVal = JSON.stringify(data);
        localStorage.setItem(cacheKey, cacheVal);
        console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));

        res.json(data);
      });
    }

  });
};

exports.getPassedCandidatesByExam = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getPassedCandidatesByExam" + ':' + req.params.examDate;
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    console.log('Exam Date: ' + req.params.examDate);
    console.log(req.params.exam);

    var examDate = moment(req.params.examDate).format("YYYY-MM-DD");
    console.log('Exam Date: ' + examDate);

    SFDCService.getPassedCandidatesByExam(req.params.exam, examDate, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));

      if(config.cache) {
        var cacheVal = JSON.stringify(data);
        localStorage.setItem(cacheKey, cacheVal);
        console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
      }
      
      res.json(data);
    });
  });
};

exports.getCertifiedCandidates = function(req, res, next) {

  // if(config.cache) {
  //   var cacheKey = "getCertifiedCandidates" + ':' + req.params.startDate + ':' + req.params.endDate;
  //   console.log('**Get key:' + cacheKey);
  //   var cacheVal = localStorage.getItem(cacheKey);
  //   console.log('**cacheVal:' + utilities.defined(cacheVal));
  // }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    // if(utilities.defined(cacheVal)) {
    //   res.json(JSON.parse(cacheVal));
    // } else {

      var startDate = req.params.startDate;
      var endDate = req.params.endDate;
      var SFDCService = new Services(conn);

      SFDCService.getCertifiedCandidates(startDate, endDate, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        // var cacheVal = JSON.stringify(data);
        // localStorage.setItem(cacheKey, cacheVal);
        // console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));

        res.json(data);
      });
   // }

  });
};

exports.getSFDCAcademicPartners = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getAcademicPartners(function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

// exports.getSFDCcontentAnalytics = function(req, res, next) {

//   sfdccomp.getToken(function(err, conn) {
//     if (err) return next(err);

//     //console.log('controller - get conn');
//     var SFDCService = new Services(conn);

//     var id = req.params.id;

//     SFDCService.getcontentAnalytics(id, function(err, data) {
//       if (err) return next(err);
//       if (!data) return next(new Error('Failed to load data'));
//       res.json(data);
//     });
//   });
// };



exports.sendContactUsEmail = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    var contactID = req.body.contactID;
    var name = req.body.name;
    var email = req.body.email;
    var enquiry = req.body.enquiry;

    SFDCService.sendContactUsEmail(contactID, name, email, enquiry, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};


exports.getSFDCautoQA = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    var email = req.params.email;

    SFDCService.getautoQA(email, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};


exports.getSFDCCPDProviders = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getCPDProviders(function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

// exports.getSFDCContentDoc = function(req, res, next) {

//   sfdccomp.getToken(function(err, conn) {
//     if (err) return next(err);

//     //console.log('controller - get conn');
//     var SFDCService = new Services(conn);

//     var id = req.params.id;
//     var userId = req.params.userId

//     SFDCService.getContentDoc(id, userId, function(err, data) {
//       if (err) return next(err);
//       if (!data) return next(new Error('Failed to load data'));
//       res.json(data);
//     });
//   });

exports.getSFDCContentDoc = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCContentDoc" + ':' + req.params.id;
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('getSFDCContentDoc - controller - get conn:' + req.params.id);
    var SFDCService = new Services(conn);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));

      SFDCService.getContentDoc(req.params.id, function(err, data) {
      });

    } else {

      SFDCService.getContentDoc(req.params.id, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));
        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    }
  });
};

exports.getSFDCRelatedContent = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCRelatedContent" + ':' + utilities.toLower(req.params.id);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      var id = req.params.id;
      var SFDCService = new Services(conn);

      SFDCService.getRelatedContent(id, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }

        res.json(data);
      });
    }

  });
};


exports.getSFDCRecordTypes = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCRecordTypes";
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  if(utilities.defined(cacheVal)) {
    res.json(JSON.parse(cacheVal));
  } else {

    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      //console.log('getSFDCRecordTypes controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getRecordTypes(function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));
        res.json(data);
        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
      });
    });
  }
};



exports.getSFDCContentSiteMap = function(req, res, next) {

  try {

    var folder = req.body.folder;
    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getContentRecords(folder, ['all'], ['all'], ['all'], 999, 0, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        //console.log('Done getContentRecords:');
        ////console.dir(data);

        var xml = "";
        for(var i=0; i<data.records.length; i++) {

          ////console.log('i:' + i);
          ////console.dir(data.records[i]);
          var rec = data.records[i];

          xml += "<url>";

          if(utilities.defined(rec,"Vanity_URL__c"))
            xml += "<loc>" + config.rootURL + "/#!/risk-intelligence/detail/" + rec.Id + "/" + rec.Vanity_URL__c + "</loc>";
          else xml += "<loc>" + config.rootURL + "/#!/risk-intelligence/detail/" + rec.Id + "</loc>";

          xml += "<changefreq>daily</changefreq>";
          xml += "<priority>1.0</priority>";
          xml += "</url>";
        }
        ////console.log('**' + xml);

        try {
          if(process.env.NODE_ENV == 'production') {
            fs.writeFile("/home/ftpdev02/microsites/sitemap.content.xml", xml, function(err) {
              if(err) {
                  //console.log(err);
                } else {
                  //console.log("The file was saved!");

                  utilities.merge(fs, outStream, "/home/ftpdev02/microsites/sitemap.fixed.xml", function() {
                    utilities.merge(fs, outStream, "/home/ftpdev02/microsites/sitemap.content.xml", function() {
                      utilities.merge(fs, outStream, "/home/ftpdev02/microsites/sitemap.end.xml", function() {
                        //console.log("All done!");
                      });
                    });
                  });

                }
              });

            var outStream = fs.createWriteStream("/home/ftpdev02/microsites/sitemap.xml", {
              flags: "w",
              encoding: null,
              mode: 666
            });

          }
        } catch (e) {
          //console.dir(e);
          return next(new Error(e.TypeError));
        }

        res.send(xml);
      });
})
} catch (e) {
    //console.dir(e);
    return next(new Error(e.TypeError));
  }
}



exports.getSFDCContentClearCache = function(req, res, next) {
  localStorage.clear();
  res.send(200);
}

exports.getSFDCContentClearCacheItem = function(req, res, next) {
  var cacheKey = req.params.key;
  localStorage.removeItem(cacheKey);
  res.send(200);
}

exports.getSFDCContent = function(req, res, next) {

  // name, contentTypes, topics, recordTypes

  try {
    var folder = req.body.folder;
    var contentTypes = req.body.contentTypes;
    var topics = req.body.topics;
    var recordTypes = req.body.recordTypes;
    var limit = 20;
    var offset = 0;

    if(utilities.defined(req,"body.limit"))
      limit = req.body.limit;
    if(utilities.defined(req,"body.offset"))
      offset = req.body.offset;

    if(config.cache) {
      var cacheKey = "getSFDCContent" + ':' + folder + ':' + contentTypes + ':' + topics + ':' + recordTypes + ':' + limit + ':' + offset;
      console.log('**Get key:' + cacheKey);
      var cacheVal = localStorage.getItem(cacheKey);
      console.log('**cacheVal:' + utilities.defined(cacheVal));
    }

    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {

      sfdccomp.getToken(function(err, conn) {
        try {

          if (err) return next(err);
          //console.log('controller - get conn');
          var SFDCService = new Services(conn);

          SFDCService.getContentRecords(folder, contentTypes, topics, recordTypes, limit, offset, function(err, data) {
            if (err) return next(err);
            if (!data) return next(new Error('Failed to load data'));

            if(config.cache) {
              var cacheVal = JSON.stringify(data);
              localStorage.setItem(cacheKey, cacheVal);
              console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
            }

            res.json(data);
          });

        } catch (e) {
          console.dir(e);
          res.status(500).send('Something broke!');
        }

      })

    }
  } catch (e) {
    console.dir(e);
    res.status(500).send('Something broke!');
  }
};

exports.getSFDCContentByCategory = function(req, res, next) {

  var limit = 20;
  var offset = 0;
  var category = '';

  if(utilities.defined(req,"body.limit"))
    limit = req.body.limit;
  if(utilities.defined(req,"body.offset"))
    offset = req.body.offset;
  if(utilities.defined(req,"body.category"))
    category = req.body.category;

  console.log(">>>" + category + ":" + limit + ":" + offset);

  if(config.cache) {
    var cacheKey = "getSFDCContentByCategory" + ':' + utilities.toLower(category) + ':' + limit + ':' + offset;
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }
  if(utilities.defined(cacheVal)) {
    res.json(JSON.parse(cacheVal));
  } else {
   sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    var SFDCService = new Services(conn);

    SFDCService.getContentRecordsByCategory(category, limit, offset, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));

      if(config.cache) {
        var cacheVal = JSON.stringify(data);
        localStorage.setItem(cacheKey, cacheVal);
        console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
      }

      res.json(data);
    });
  })

 }

};

exports.getSFDCEmailSubscription = function(req, res, next) {

  var email = '';

  if(utilities.defined(req,"body.email"))
    email = req.body.email;

  console.log(email);

  if(config.cache) {
    var cacheKey = "getSFDCEmailSubscription" + ':' + email;
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }
  if(utilities.defined(cacheVal)) {
    res.json(JSON.parse(cacheVal));
  } else {
   sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    var SFDCService = new Services(conn);

    SFDCService.getMemberOrLeadByEmail(email, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));

      if(config.cache) {
        var cacheVal = JSON.stringify(data);
        localStorage.setItem(cacheKey, cacheVal);
        console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
      }

      res.json(data);
    });
  })

 }

};



exports.getSFDCContentBySubcategory = function(req, res, next) {

  try {
    var limit = 20;
    var offset = 0;
    var subcategory = '';

    if(utilities.defined(req,"body.limit"))
      limit = req.body.limit;
    if(utilities.defined(req,"body.offset"))
      offset = req.body.offset;

    subcategory = req.body.subcategory;

    if(config.cache) {
      var cacheKey = "getSFDCContentBySubcategory" + ':' + utilities.toLower(subcategory) + ':' + limit + ':' + offset;
      console.log('**Get key:' + cacheKey);
      var cacheVal = localStorage.getItem(cacheKey);
      console.log('**cacheVal:' + utilities.defined(cacheVal));
    }
    if(utilities.defined(cacheVal)) {
      res.json(JSON.parse(cacheVal));
    } else {
     sfdccomp.getToken(function(err, conn) {

      try {
        if (err) return next(err);

        var SFDCService = new Services(conn);

        SFDCService.getContentRecordsBySubcategory(subcategory, limit, offset, function(err, data) {
          try {
            if (err) return next(err);
            if (!data) return next(new Error('Failed to load data'));

            if(config.cache) {
              var cacheVal = JSON.stringify(data);
              localStorage.setItem(cacheKey, cacheVal);
              console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
            }

            res.json(data);
          } catch (e) {
            console.dir(e);
            res.status(500).send('Something broke!');
          }
        });
      } catch (e) {
        console.dir(e);
        res.status(500).send('Something broke!');
      }
    })
   }
 } catch (e) {
  console.dir(e);
  res.status(500).send('Something broke!');
}
};




exports.getSFDCContentAds = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCContentAds";
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  if(utilities.defined(cacheVal)) {

    res.json(JSON.parse(cacheVal));

  } else {

    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getContentAds(req.params.type, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);

      });
    })

  }
};

exports.getSFDCRiskArticlesByViewCount = function(req, res, next) {
  if(config.cache) {
    var cacheKey = "getSFDCRiskArticlesByViewCount" + ':' + utilities.toLower(req.params.category);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  if(utilities.defined(cacheVal)) {

    res.json(JSON.parse(cacheVal));

  } else {


    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCRiskArticlesByViewCount(req.params.category,function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);

      });
    })

  }
};

exports.getSFDCRiskArticlesByShareCount = function(req, res, next) {
  if(config.cache) {
    var cacheKey = "getSFDCRiskArticlesByShareCount" + ':' + utilities.toLower(req.params.category);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  if(utilities.defined(cacheVal)) {

    res.json(JSON.parse(cacheVal));

  } else {


    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getRiskArticlesByShareCount(req.params.category,function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);

      });
    })

  }
};


exports.getSFDCRiskTrendingArticles = function(req, res, next) {
 if(config.cache) {
  var cacheKey = "getSFDCRiskTrendingArticles" + ':' + utilities.toLower(req.params.category);
  console.log('**Get key:' + cacheKey);
  var cacheVal = localStorage.getItem(cacheKey);
  console.log('**cacheVal:' + utilities.defined(cacheVal));
}

if(utilities.defined(cacheVal)) {

  res.json(JSON.parse(cacheVal));

} else {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCRiskTrendingArticles(req.params.category,function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);

      });
    })

}
};

exports.getSFDCRiskFeaturedArticles = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCRiskFeaturedArticles";
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  if(utilities.defined(cacheVal)) {

    res.json(JSON.parse(cacheVal));

  } else {

   sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCRiskFeaturedArticles(function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    })

 }
};

exports.getSFDCRiskManagerOfTheYear = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCRiskManagerOfTheYear";
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  if(utilities.defined(cacheVal)) {

    res.json(JSON.parse(cacheVal));

  } else {

   sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCRiskManagerOfTheYear(function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    })

 }
};

exports.getSFDCTestimonial = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCTestimonial" + ':' + utilities.toLower(req.params.examType);
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  //if(utilities.defined(cacheVal)) {

    //res.json(JSON.parse(cacheVal));

  //} else {

   sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {

    res.json(JSON.parse(cacheVal));

  } else {

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCTestimonial(req.params.examType, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    }

 });
};


exports.getSFDCfaq = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCfaq";
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {

    res.json(JSON.parse(cacheVal));

  } else {

      var SFDCService = new Services(conn);

      SFDCService.getSFDCfaq(req.params.category, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    }

 });
};



/*exports.getSFDCExamFaq = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCExamFaq";
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    if(utilities.defined(cacheVal)) {

    res.json(JSON.parse(cacheVal));

  } else {

      var SFDCService = new Services(conn);

      SFDCService.getSFDCExamFaq(req.params.examCategory, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    }

 });
};*/


exports.getSFDCRiskArticlesByCategory = function(req, res, next) {

 if(config.cache) {
  var cacheKey = "getSFDCRiskArticlesByCategory" + ':' + utilities.toLower(req.params.category) + ':' + req.params.numberofarticles + ':' + req.params.offset;
  console.log('**Get key:' + cacheKey);
  var cacheVal = localStorage.getItem(cacheKey);
  console.log('**cacheVal:' + utilities.defined(cacheVal));
}

if(utilities.defined(cacheVal)) {

  res.json(JSON.parse(cacheVal));

} else {

 sfdccomp.getToken(function(err, conn) {
  if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCRiskArticlesByCategory(req.params.category, req.params.numberofarticles, req.params.offset,function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    })

}
};

exports.getSFDCQuantCorner = function(req, res, next) {

 if(config.cache) {
  var cacheKey = "getSFDCQuantCorner" + ':' + req.params.numberofarticles + ':' + req.params.offset;
  console.log('**Get key:' + cacheKey);
  var cacheVal = localStorage.getItem(cacheKey);
  console.log('**cacheVal:' + utilities.defined(cacheVal));
}

if(utilities.defined(cacheVal)) {

  res.json(JSON.parse(cacheVal));

} else {

 sfdccomp.getToken(function(err, conn) {
  if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCQuantCorner(req.params.numberofarticles, req.params.offset,function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    })

}
};

exports.getSFDCRiskArticlesByColumn = function(req, res, next) {

 if(config.cache) {
  var cacheKey = "getSFDCRiskArticlesByColumn" + ':' + utilities.toLower(req.params.column) + ':' + req.params.numberofarticles + ':' + req.params.offset;
  console.log('**Get key:' + cacheKey);
  var cacheVal = localStorage.getItem(cacheKey);
  console.log('**cacheVal:' + utilities.defined(cacheVal));
}

if(utilities.defined(cacheVal)) {

  res.json(JSON.parse(cacheVal));

} else {

 sfdccomp.getToken(function(err, conn) {
  if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCRiskArticlesByColumn(req.params.column, req.params.numberofarticles, req.params.offset,function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    })

}
};

exports.getSFDCColumns = function(req, res, next) {

 if(config.cache) {
  var cacheKey = "getSFDCColumns" + ':' + req.params.numberofarticles + ':' + req.params.offset;
  console.log('**Get key:' + cacheKey);
  var cacheVal = localStorage.getItem(cacheKey);
  console.log('**cacheVal:' + utilities.defined(cacheVal));
}

if(utilities.defined(cacheVal)) {

  res.json(JSON.parse(cacheVal));

} else {

 sfdccomp.getToken(function(err, conn) {
  if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCColumns(req.params.numberofarticles, req.params.offset,function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    })

}
};


exports.getSFDCFRMCorner = function(req, res, next) {

 if(config.cache) {
  var cacheKey = "getSFDCFRMCorner" + ':' + req.params.numberofarticles + ':' + req.params.offset;
  console.log('**Get key:' + cacheKey);
  var cacheVal = localStorage.getItem(cacheKey);
  console.log('**cacheVal:' + utilities.defined(cacheVal));
}

if(utilities.defined(cacheVal)) {

  res.json(JSON.parse(cacheVal));

} else {

 sfdccomp.getToken(function(err, conn) {
  if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCFRMCorner(req.params.numberofarticles, req.params.offset,function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    })

}
};


exports.getSFDCFeaturedContent = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCFeaturedContent" + ':' + req.params.type;
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  if(utilities.defined(cacheVal)) {

    res.json(JSON.parse(cacheVal));

  } else {
    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getSFDCFeaturedContent(req.params.type, function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));

        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }

        res.json(data);
      });
    })

  }

};

exports.getSFDCWebcasts = function(req, res, next) {

  if(config.cache) {
    var cacheKey = "getSFDCWebcasts";
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  if(utilities.defined(cacheVal)) {

    res.json(JSON.parse(cacheVal));

  } else {
    sfdccomp.getToken(function(err, conn) {
      if (err) return next(err);

      //console.log('controller - get conn');
      var SFDCService = new Services(conn);

      SFDCService.getWebCasts(function(err, data) {
        if (err) return next(err);
        if (!data) return next(new Error('Failed to load data'));
        if(config.cache) {
          var cacheVal = JSON.stringify(data);
          localStorage.setItem(cacheKey, cacheVal);
          console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
        }
        res.json(data);
      });
    })
  }
};


exports.getSFDCWebcastICal = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getContent(req.params.id, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));

      //console.log('getContent' + data);

      var ev = {
        start: new Date(data.records[0].Start_Date__c),
        end: new Date(data.records[0].End_Date__c),
        summary: data.records[0].Name,
        description: data.records[0].Description__c,
        location: data.records[0].Third_Party_URL__c,
        url: data.records[0].Third_Party_URL__c
      }

      //console.log('ev' + ev);

      //cal.setDomain('garp.org').setName('GARP Events');
      cal.addEvent(ev);

      //res.json(data);
      cal.serve(res);
    });
  })
};

exports.getSFDCVideos = function(req, res, next) {

  //var cacheKey = "getSFDCVideos";
  //console.log('**Get key:' + cacheKey);

  //var cacheVal = localStorage.getItem(cacheKey);
  //console.log('**cacheVal:' + utilities.defined(cacheVal));

  //if(utilities.defined(cacheVal)) {
  //    res.json(JSON.parse(cacheVal));
  //} else {

    var SFDCService = new Services(null);

    SFDCService.getVideos(function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));

        //var cacheVal = JSON.stringify(data);
        //localStorage.setItem(cacheKey, cacheVal);
        //console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));

        res.setHeader('Content-Type', 'application/json');
        res.send(data);
      });
  //}

};

exports.getSFDCVideo = function(req, res, next) {

  var id = req.params.id;

  // if(config.cache) {
  //   var cacheKey = "getSFDCVideo:" + id;
  //   console.log('**Get key:' + cacheKey);
  //   var cacheVal = localStorage.getItem(cacheKey);
  //   console.log('**cacheVal:' + utilities.defined(cacheVal));
  // }

  // if(utilities.defined(cacheVal)) {
  //   res.json(JSON.parse(cacheVal));
  // } else {

    var SFDCService = new Services(null);

    SFDCService.getVideo(id, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));

      // if(config.cache) {
      //   var cacheVal = JSON.stringify(data);
      //   localStorage.setItem(cacheKey, cacheVal);
      //   console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
      // }

      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    });
  //}
};

exports.getSFDCVideoCat = function(req, res, next) {

  var hashed_id = req.params.id;

  if(config.cache) {
    var cacheKey = "getSFDCVideoCat:" + hashed_id;
    console.log('**Get key:' + cacheKey);
    var cacheVal = localStorage.getItem(cacheKey);
    console.log('**cacheVal:' + utilities.defined(cacheVal));
  }

  if(utilities.defined(cacheVal)) {
    res.json(JSON.parse(cacheVal));
  } else {

    var SFDCService = new Services(null);

    SFDCService.getVideo(hashed_id, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));

      if(config.cache) {
        var cacheVal = JSON.stringify(data);
        localStorage.setItem(cacheKey, cacheVal);
        console.log('**Set cacheVal:' + cacheKey + ':' + utilities.defined(cacheVal));
      }

      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    });
  }
};

exports.getSFDCChapterMeetings = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getChapterMeetings(function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getSFDCChapterPresentations = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getChapterPresentations(function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getSFDCStudyTopics = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getStudyTopics(req.params.exam, req.params.year, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};

exports.getSFDCStudyProducts = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getStudyProducts(req.params.mode, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));
      res.json(data);
    });
  });
};



exports.getSFDCChapterMeetingICal = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getChapterMeeting(req.params.id, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));

      //console.dir(data);

      try {

        if (utilities.defined(data, "records") && data.records.length > 0) {

          var ev = data.records[0];
          //console.dir(ev);

          var location = ev.Chapter_Meeting_Location__r.Name;
          if (utilities.defined(ev, "Chapter_Meeting_Location__r.Address_Street_1__c"))
            location = ev.Chapter_Meeting_Location__r.Address_Street_1__c;

          //console.log(location);

          if (location != ev.Chapter_Meeting_Location__r.Name && utilities.defined(ev.Chapter_Meeting_Location__r, "Chapter_Meeting_Location__r.Address_Street_2__c"))
            location += " " + ev.Chapter_Meeting_Location__r.Address_Street_2__c;
          if (location != ev.Chapter_Meeting_Location__r.Name && utilities.defined(ev.Chapter_Meeting_Location__r, "Address_City__c"))
            location += " " + ev.Chapter_Meeting_Location__r.Address_City__c;
          if (location != ev.Chapter_Meeting_Location__r.Name && utilities.defined(ev.Chapter_Meeting_Location__r, "Address_State_Provence__c"))
            location += " " + ev.Chapter_Meeting_Location__r.Address_State_Provence__c;
          if (location != ev.Chapter_Meeting_Location__r.Name && utilities.defined(ev.Chapter_Meeting_Location__r, "Address_Postal_Code__c"))
            location += " " + ev.Chapter_Meeting_Location__r.Address_Postal_Code__c;
          if (location != ev.Chapter_Meeting_Location__r.Name && utilities.defined(ev.Chapter_Meeting_Location__r, "Address_Country__c"))
            location += " " + ev.Chapter_Meeting_Location__r.Address_Country__c;

          var evObj = {
            start: new Date(ev.Start__c),
            end: new Date(ev.End__c),
            summary: ev.Name,
            description: ev.Synopsis__c,
            location: location,
            url: config.rootURL + '/chapter_meeting/' + req.params.id
          }

          //console.log('evObj' + evObj);

          cal.addEvent(evObj);
          cal.serve(res);

        } else {
          return next(new Error('No event found'));
        }

      } catch (e) {
        //console.dir(e);
        return next(new Error(e.TypeError));
      }

    });
});
};

exports.getSFDCWebcastWebCal = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getContent(req.params.id, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));

      //console.log('getContent' + data);

      var ev = {
        start: new Date(data.records[0].Start_Date__c),
        end: new Date(data.records[0].End_Date__c),
        summary: data.records[0].Name,
        description: data.records[0].Description__c,
        location: data.records[0].Third_Party_URL__c,
        url: data.records[0].Third_Party_URL__c
      }

      //console.log('ev' + ev);

      cal.setDomain('garp.org').setName('GARP Events');
      cal.addEvent(ev);

      //res.json(data);
      cal.serve(res);
    });
  })
};


exports.getSFDCChapterMeetingWebCal = function(req, res, next) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return next(err);

    //console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getChapterMeeting(req.params.id, function(err, data) {
      if (err) return next(err);
      if (!data) return next(new Error('Failed to load data'));

      //console.log('getChapterMeeting' + data);

      var ev = {
        start: new Date(data.records[0].Start__c),
        end: new Date(data.records[0].End__c),
        summary: data.records[0].Name,
        description: data.records[0].Synopsis__c,
        location: data.records[0].Chapter_Meeting_Location__r.Address_Street_1__c + ' ' + data.records[0].Chapter_Meeting_Location__r.Address_Street_2__c + ' ' + data.records[0].Chapter_Meeting_Location__r.Address_City__c + ' ' + data.records[0].Chapter_Meeting_Location__r.Address_State_Provence__c + ',' + data.records[0].Chapter_Meeting_Location__r.Address_Postal_Code__c + ' ' + data.records[0].Chapter_Meeting_Location__r.Address_Country__c,
        url: 'http://www.garp.org/chapterMeeting/' + req.params.id
      }

      //console.log('ev' + ev);

      cal.setDomain('garp.org').setName('GARP Events');
      cal.addEvent(ev);

      //res.json(data);
      cal.serve(res);
    });
});
};