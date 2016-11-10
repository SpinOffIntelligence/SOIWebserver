var util = require('util');
var loggercomp = require('../../components/logger.js');
var logger = loggercomp.get();
var _ = require('underscore');
var moment = require('moment');
var utilities = require('../../components/utilities.js');
var config = require('../../config/config');
var https = require('https');

var SFDCService = function SFDCService(conn) {
  this.sfdcConn = conn;
};



SFDCService.prototype.getReportsData = function(reportId, callback) {

  //var reportId = '00O10000000pUw2EAE';
  var report = this.sfdcConn.analytics.report(reportId);

  // execute report synchronously
  report.execute(function(err, result) {
    if (err) {
      return console.error(err);
    }
    console.log(result.reportMetadata);
    console.log(result.factMap);
    console.log(result.factMap["T!T"]);
    console.log(result.factMap["T!T"].aggregates);
    callback(null, result);
  });

}

SFDCService.prototype.setICBRRstatus = function(garpId, procType, status, examDate, result, score, regErrorText, authErrorText, callback) {

  console.log('setICBRRstatus: ' + garpId + ':' + status);

  var query = util.format("select Id, Name, ICBRR_Submission_Status__c, ICBRR_Submission_Error__c, ICBRR_Authorization_Status__c, ICBRR_Authorization_Error__c, Garp_Id__c, Icbrr_Exam_Date__c, Result__c, Score__c from Exam_Attempt__c where Section__c = 'ICBRR' and Cancelled__c = False and ((Contract_Status__c like 'Activ%' and (ICBRR_Submission_Status__c = null OR ICBRR_Submission_Status__c = 'Failure to Pick Up' OR ICBRR_Submission_Status__c = 'Retry Submission' OR ICBRR_Submission_Status__c = 'Ready for Pickup' OR ICBRR_Submission_Status__c = 'Data Sent')) OR (Icbrr_Exam_Date__c = null)) and Garp_Id__c = '%s'", garpId);
  if (garpId.indexOf('CAI') > -1) {
    query = util.format("select Id, Name, ClientAuthorizationID__c, ICBRR_Submission_Status__c, ICBRR_Submission_Error__c, ICBRR_Authorization_Status__c, ICBRR_Authorization_Error__c, Garp_Id__c, Icbrr_Exam_Date__c, Result__c, Score__c from Exam_Attempt__c where ClientAuthorizationID__c = '%s'", garpId);
  }

  console.log("Query: " + query);

  try {

    _that = this;
    this.sfdcConn.query(query, function(err, data) {
      if (err) {
        callback(err, null);
      }

      try {

        var items = data.records;
        console.dir(items);

        if (items.length > 0) {

          var matches = _.where(items, {
            Garp_Id__c: garpId
          });
          if (garpId.indexOf('CAI') > -1) {
            matches = _.where(items, {
              ClientAuthorizationID__c: garpId
            });
          }

          console.log('matches: ' + matches);

          for (var i = 0; i < matches.length; i++) {

            match = matches[i];

            var obj = {
              Id: match.Id
            }

            if (examDate == 'x')
              examDate = '';
            if (result == 'x')
              result = '';
            if (score == 'x')
              score = '';
            if (status == 'x')
              status = '';

            if (utilities.defined(examDate) && examDate != '')
              obj.Icbrr_Exam_Date__c = examDate;

            if (utilities.defined(result) && result != '')
              obj.Result__c = result;

            if (utilities.defined(score) && score != '')
              obj.Score__c = score;

            if (utilities.defined(regErrorText) && regErrorText != '')
              obj.ICBRR_Submission_Error__c = regErrorText;

            if (utilities.defined(authErrorText) && authErrorText != '')
              obj.ICBRR_Authorization_Error__c = authErrorText;

            if (procType == 'register' && utilities.defined(status) && status != '')
              obj.ICBRR_Submission_Status__c = status;

            if (procType == 'auth' && utilities.defined(status) && status != '')
              obj.ICBRR_Authorization_Status__c = status;

            console.log('Update obj:');
            console.dir(obj);

            _that.sfdcConn.sobject("Exam_Attempt__c").update(obj, function(err, ret) {
              if (err || !ret.success) {
                console.error(err, ret);
                //callback(null, ret);
              }
              console.log('Updated Successfully : ' + ret.id);
            });
          }
          callback(null, matches.length);

        } else {
          console.dir('None Found!');
          callback(404, null);
        }

      } catch (e) {
        console.dir(e);
        callback(e, null);
      }

    });

  } catch (e) {
    console.dir(e);
    callback(e, null);
  }

}

SFDCService.prototype.getICBRRActiveRegistrationsAuth = function(callback) {

  var query = "select Id, Name, CreatedDate, ICBRR_Submission_Status__c, ICBRR_Authorization_Status__c, Member__r.MailingStreet, Member__r.MailingCity, Member__r.MailingState, Member__r.MailingPostalCode, Member__r.MailingCountry, Member__r.Company__c, Opportunity__r.Account.BillingStreet, Opportunity__r.Account.BillingCity, Opportunity__r.Account.BillingState, Opportunity__r.Account.BillingPostalCode, Opportunity__r.Account.BillingCountry, Opportunity__r.ChargentSFA__Billing_Address__c, Opportunity__r.ChargentSFA__Billing_City__c, Opportunity__r.ChargentSFA__Billing_State__c, Opportunity__r.ChargentSFA__Billing_Zip__c, Opportunity__r.ChargentSFA__Billing_Country__c, Opportunity__r.ChargentSFA__Billing_Phone__c, Opportunity__r.Shipping_Street__c, Opportunity__r.Shipping_City__c, Opportunity__r.Shipping_State__c, Opportunity__r.Shipping_Postal_Code__c, Opportunity__r.Shipping_Country__c, Opportunity__r.Shipping_Phone_No__c, Member__r.Suffix__c, Member__r.Salutation, Member__r.FirstName, Member__r.LastName, Member__r.Phone, Member__r.OtherPhone, Member__r.HomePhone, Member__r.Email, Garp_Id__c, ClientAuthorizationID__c, Candidate_Commitment__r.StartDate, Candidate_Commitment__r.Enddate, Member__c, Program_Name__c, Program_Abbrev__c from Exam_Attempt__c where Section__c = 'ICBRR' and Contract_Status__c like 'Activ%' and Score__c = NULL and Cancelled__c = False and (ICBRR_Authorization_Status__c=null OR ICBRR_Authorization_Status__c = 'Retry Submission' OR ICBRR_Authorization_Status__c = 'Ready for Pickup' OR ICBRR_Authorization_Status__c = 'Error' OR ICBRR_Authorization_Status__c = 'Force Update')";

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}



SFDCService.prototype.getExamGroupDetails = function(callback) {

  var query = "select Id, Exam_Date__c, Registration_Start_Date__c, Last_Date_For_Early_Registration__c, Last_Date_For_Standard_Registration__c, Last_Date_For_Late_Registration__c, Next_Exam_Group__r.Exam_Date__c, Next_Exam_Group__r.Registration_Start_Date__c, Next_Exam_Group__r.Last_Date_For_Standard_Registration__c, Next_Exam_Group__r.Last_Date_For_Early_Registration__c, Next_Exam_Group__r.Last_Date_For_Late_Registration__c from Exam_Group__c where Active__c = True";

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}


SFDCService.prototype.getMembershipOffer = function(callback) {

  var query = util.format("select Id, Name, Values_List__c, Memb_Offer_Title__c, Memb_Offer_Status__c, Memb_Offer_Public_Button_Text__c, Memb_Offer_Promo_Code__c, Memb_Offer_Portal_Route__c, Memb_Offer_Logo__c, Memb_Offer_Hashtag__c, Memb_Offer_External_Link__c,  Info_Link__c, Memb_Offer_Description__c from Membership_Exclusive_Offers__c");

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}

SFDCService.prototype.getEvent = function(eventId, callback) {

  var query = util.format("select Id, cdrive__contextID__c, cdrive__File_Name__c from cdrive__Cloud_Files__c where cdrive__contextID__c = '%s'", eventId);

  console.log("Query: " + query);

  _that = this;
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    var session = res;
    var query1 = util.format("select Id, Name, Address__c, Photo_Album_Link__c, DynamicNgClass__c, post_event_description__c, AddressMap_Image_URL__c, Cancellation_Policy__c, AlreadyRegisteredLink__c, Venue_Guidelines__c, VenueName__c, RegisterNowLink__c, CPD_Credit__c, Events_Photography_Release__c, Hashtag__c, Overview__c, Program_Change__c, Description__c, End_Date__c, Start_Date__c, Title__c, Book_Hotel_Link__c from Event__c where Id = '%s'", eventId);
    _that.sfdcConn.query(query1, function(err, res1) {
      if (err) {
        callback(err, null);
      }
      // var obj = {
      //   event: res1,
      //   eventImages: session
      // }
      res1.images = session;
      callback(null, res1);
    });
  });

}


SFDCService.prototype.getEventRates = function(eventId, callback) {

  var query = util.format("select Id, Name, Start_Date__c, End_Date__c, Member_Rate__c, Non_Member_Rate__c from Event_Rate__c where Event__c = '%s' order by Start_Date__c ASC", eventId);

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });

}

SFDCService.prototype.getRelatedContent = function(docId, callback) {

  var query = util.format("select Id, Name, Category__c, Subcategory__c from Content__c where Id = '%s'", docId);
  console.log("Query: " + query);

  _that = this;
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    var category = _.pluck(res.records, 'Category__c');
    var subcategory = _.pluck(res.records, 'Subcategory__c');

    var query1 = util.format("select Id, Name, View_Count__c, Trend__c, Share_Count__c from Content__c where (Category__c = '%s' and Subcategory__c = '%s')", category[0], subcategory[0]);
    _that.sfdcConn.query(query1, function(err, res1) {
      if (err) {
        callback(err, null);
      }

      var fiveViewCountArticles = _.chain(res1.records).sortBy('View_Count__c').reverse().first(5).value();

      var notNullSharedArticles = [];
      for (i = 0; i < res1.records.length; i++) { 
        if(res1.records[i].Share_Count__c != null){
          notNullSharedArticles.push(res1.records[i]);
        }
      }

      if(notNullSharedArticles.length > 0){
       var fiveSharedArticles = _.chain(notNullSharedArticles).sortBy('Share_Count__c').reverse().first(5).value();
     } else {
      var fiveSharedArticles = [];
    };
    var fiveTopTrendingArticles = _.chain(res1.records).sortBy('Trend__c').reverse().first(5).value();
    var obj = {};
    obj['View_Count__c'] = fiveViewCountArticles;
    obj['Share_Count__c'] = fiveSharedArticles;
    obj['Trend__c'] = fiveTopTrendingArticles;

    var query2 = util.format("select Id from Related_Content__c where Content_Related__c = '%s'", docId);
    _that.sfdcConn.query(query2, function(err, res2) {
      if (err) {
        callback(err, null);
      }
      obj['Related_Content__c'] = res2.records;
      callback(null, obj);
    });

  });
    
  });

}


SFDCService.prototype.getEventSponsors = function(eventId, callback) {

  var query = util.format("select Id, Name, Description__c, Last_Updated_Date__c, Level__c, Logo__c, Published_Date__c, Status__c, Website__c from Event_Sponsor__c where Event__c = '%s' order by Published_Date__c DESC", eventId);

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}

SFDCService.prototype.getEventContent = function(folderName, callback) {

  var query = util.format("Select Id, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Media_Type__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c, Status__c from Content__c where Id in (select Content__c from Content_Folders__c where Folder_Name__c = '%s') order by Published_Date__c DESC", folderName);

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}


SFDCService.prototype.getEventContacts = function(eventId, callback) {

  var query = util.format("Select Id, Name, Email__c, First_Name__c, Last_Name__c, Phone__c, Type__c from Event_Contact__c where Event__c = '%s'", eventId);

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}


SFDCService.prototype.getEventSessions = function(eventId, callback) {

  var query = util.format("Select Id, Name, Type__c, Availability__c, Description__c, End_Date_Time__c, Event_Session_Track__c, Group_Name__c, Last_Updated_Date__c, Published_Date__c, Start_Date_Time__c, Status__c from Event_Sessions__c where Event__c = '%s' and Status__c = 'Active' order by Published_Date__c DESC", eventId);

  console.log("Query: " + query);

  _that = this;
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    var session = res;
    var query1 = util.format("Select Id, Name, Description__c, Rank__c from Event_Session_Track__c where Id in (Select Event_Session_Track__c from Event_Sessions__c where Event__c = '%s' and Status__c = 'Active')", eventId);
    _that.sfdcConn.query(query1, function(err, res1) {
      if (err) {
        callback(err, null);
      }
      var obj = {
        sessions: session,
        tracks: res1
      }
      callback(null, obj);
    });
  });

}

SFDCService.prototype.getEventSpeakers = function(eventId, callback) {

  var query = util.format("Select Id, Name, Facebook__c, LinkedIn__c, Title__c, Organization__c, Twitter__c, Company_Title_1__c, Company_Title_2__c, Company_Title_3__c, Bio__c, Byline__c, First_Name__c, Last_Name__c, Last_Updated_Date__c, Photo__c, Published_Date__c, Status__c from Event_Speaker__c where Id in (select Event_Speaker__c from Event_Speaker_Session_Track__c where Event_Session__r.Event__c = '%s' and Event_Session__r.Status__c = 'Active') order by Published_Date__c DESC", eventId);

  _that = this;
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    console.dir(res);

    if(res.totalSize == 0){
      callback(null, {speakers: []});
      return;
    }

    var speakers = res;
    var speakerIDs = "";
    for(var i=0; i<res.totalSize; i++) {
      if(i < res.totalSize-1)
        speakerIDs += "'" + res.records[i].Id + "',";
      else speakerIDs += "'" + res.records[i].Id + "'";
    }

    var query1 = util.format("select Event_Session__c, Asset__c, Event_Session_Track__c, Event_Speaker__c, Event_Speaker__r.First_Name__c, Event_Speaker__r.Last_Name__c, Event_Speaker__r.Bio__c, Event_Speaker__r.Byline__c, Event_Speaker__r.Title__c, Event_Speaker__r.Company_Title_1__c, Role__c, Show_Photo__c from Event_Speaker_Session_Track__c where Event_Session__r.Event__c = '%s' and Event_Session__r.Status__c = 'Active'", eventId);

    _that.sfdcConn.query(query1, function(err, res1) {
      if (err) {
        callback(err, null);
      }

      var query2 = util.format("select Id, cdrive__contextID__c, cdrive__File_Name__c from cdrive__Cloud_Files__c where cdrive__contextID__c in (%s)", speakerIDs);


      _that.sfdcConn.query(query2, function(err, res2) {
        if (err) {
          callback(err, null);
        }

        for(var i=0; i<speakers.totalSize; i++) {
          var speaker = speakers.records[i];

          if(utilities.defined(speaker,"Photo__c")) {
            if(speaker.Photo__c.toLowerCase().indexOf('http') == -1) {
              var fnd = _.findWhere(res2.records, {cdrive__contextID__c: speaker.Id, cdrive__File_Name__c: speaker.Photo__c });
              if(fnd != null) {
                speaker.Photo__c = "https://s3-us-west-2.amazonaws.com/garpsalesforcepublic/Event_Speaker__c/" + speaker.Id + "/" + fnd.Id + "_" + speaker.Photo__c;

                console.log("speaker.Photo__c: " + speaker.Photo__c);
              }
            }
          }
        }

        var assetId = _.pluck(res1.records, 'Asset__c');
        var assetId = _.compact(assetId);

        var assetIds = "";

        if(assetId.length > 0){

         for(var i=0; i<assetId.length; i++) {
          if(i < assetId.length-1)
            assetIds += "'" + assetId[i] + "',";
          else assetIds += "'" + assetId[i] + "'";
        }

        var query3 = util.format("Select Id, Name, Location__c, Third_Party_URL__c, Start_Date__c, Description__c, Media_Type__c from Content__c where Id in (%s) and Status__c = 'Active'", assetIds);

        _that.sfdcConn.query(query3, function(err, res3) {
          if (err) {
            callback(err, null);
          }

          var pres = res3;
          var obj = {
            speakers: speakers,
            eventSpeakerSessionTracks: res1,
            files: res2,
            presentations: res3
          }
          callback(null, obj);
        });


      } else {

        var obj = {
          speakers: speakers,
          eventSpeakerSessionTracks: res1,
          files: res2
        }
        callback(null, obj);

      };

    });

    });
  });
}

SFDCService.prototype.getExamPrepProviders = function(callback) {

  var query = "select Id, Name, EPP_Contact_Phone__c, EPP_Location_Description__c, EPP_Logo__c, EPP_Overview__c, EPP_Registration_Status__c, EPP_Website__c, EPP_ERP__c, EPP_FBR__c, EPP_FRM__c, EPP_ICBRR__c, EPP_Location__c, EPP_Regions__c from Account where Exam_Prep_Provider__c = True and EPP_Registration_Status__c = 'Approved'";

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}

SFDCService.prototype.getExamPrepProviderContacts = function(callback) {

  var query = "Select Id, AccountID, Name, Email from Contact where id in (Select ContactID from AccountContactRole where Role = 'EPP Contact')";

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}


SFDCService.prototype.getICBRRActiveRegistrations = function(callback) {

  var query = "select Id, Name, CreatedDate, ICBRR_Submission_Status__c, ICBRR_Authorization_Status__c, Member__r.MailingStreet, Member__r.MailingCity, Member__r.MailingState, Member__r.MailingPostalCode, Member__r.MailingCountry, Member__r.Company__c, Opportunity__r.Account.BillingStreet, Opportunity__r.Account.BillingCity, Opportunity__r.Account.BillingState, Opportunity__r.Account.BillingPostalCode, Opportunity__r.Account.BillingCountry, Opportunity__r.ChargentSFA__Billing_Address__c, Opportunity__r.ChargentSFA__Billing_City__c, Opportunity__r.ChargentSFA__Billing_State__c, Opportunity__r.ChargentSFA__Billing_Zip__c, Opportunity__r.ChargentSFA__Billing_Country__c, Opportunity__r.ChargentSFA__Billing_Phone__c, Opportunity__r.Shipping_Street__c, Opportunity__r.Shipping_City__c, Opportunity__r.Shipping_State__c, Opportunity__r.Shipping_Postal_Code__c, Opportunity__r.Shipping_Country__c, Opportunity__r.Shipping_Phone_No__c, Member__r.Suffix__c, Member__r.Salutation, Member__r.FirstName, Member__r.LastName, Member__r.Phone, Member__r.OtherPhone, Member__r.HomePhone, Member__r.Email, Garp_Id__c, ClientAuthorizationID__c, Candidate_Commitment__r.StartDate, Candidate_Commitment__r.Enddate, Member__c from Exam_Attempt__c where Section__c = 'ICBRR' and Contract_Status__c like 'Activ%' and Score__c = NULL and Cancelled__c = False and (ICBRR_Submission_Status__c = null OR ICBRR_Submission_Status__c = 'Retry Submission' OR ICBRR_Submission_Status__c = 'Ready for Pickup' OR ICBRR_Submission_Status__c = 'Failure to Pick Up')";

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}


SFDCService.prototype.getICBRRcdd = function(callback) {

  var query = "Select ClientCandidateId__c, FirstName__c, LastName__c, MiddleName__c, Suffix__c, Salutation__c, Email__c, LastUpdate__c, Address1__c, Address2__c, City__c, State__c, PostalCode__c, Country__c, Phone__c, Fax__c, FaxCountryCode__c, PhoneCountryCode__c, CompanyName__c from Ready_for_Icbrr_Export__c where Active__c = true and Submission_Status__c <> 'Successfully Picked Up'";

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}

SFDCService.prototype.getSFDCRiskArticlesByViewCount = function(category, callback) {

  var query = util.format("select Id, Featured_Order__c, Name, Content_Name__c, View_Count__c, Trend__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Subcategory__c, Category__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c from Content__c where Status__c = 'Active' and Is_advertisement__c != true and Category__c = '%s' and View_Count__c != null order by View_Count__c DESC Limit 20", category);

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}

SFDCService.prototype.getRiskArticlesByShareCount = function(category, callback) {

  var query = util.format("select Id, Featured_Order__c, Name, Content_Name__c, View_Count__c, Trend__c, Share_Count__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Subcategory__c, Category__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c from Content__c where Status__c = 'Active' and Is_advertisement__c != true and Category__c = '%s' and Share_Count__c != null order by Share_Count__c DESC Limit 20", category);

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}

SFDCService.prototype.getSFDCRiskTrendingArticles = function(category, callback) {

  var query = util.format("select Id, Featured_Order__c, Name, Content_Name__c, View_Count__c, Trend__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Subcategory__c, Category__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c from Content__c where Status__c = 'Active' and Is_advertisement__c != true and Category__c = '%s' and Trend__c != null order by Trend__c DESC Limit 20", category);


  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}

SFDCService.prototype.getSFDCRiskFeaturedArticles = function(callback) {

  var query = "select Id, Featured_Order__c, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Subcategory__c, Category__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = 'Active' and Is_advertisement__c != true and Featured_Order__c != null order by Featured_Order__c ASC limit 12";

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}

SFDCService.prototype.getSFDCRiskManagerOfTheYear = function(callback) {

  var query = "select Id, Name, Risk_Manager_of_the_Year_Bio__c, Year_For_Risk_Manager_of_the_Year__c, Image_Risk_Manager_of_the_Year__c, Qualifications_Risk_Manager_of_the_Year__c from Contact where Risk_Manager_of_the_Year__c != false";

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);

  });

}


SFDCService.prototype.getSFDCTestimonial = function(examType, callback) {

  var query;

  console.log("examType: " + examType);

  if (examType == 'erp') {

    query = util.format("select Id, Name, City__c, Contact__c, Vanity_URL__c, erp_Certified__c, Country__c, Current_Job__c, External_Video_URL__c, GARP_Summary__c, Member_Photo__c, Member_Summary__c from Testimonial__c where erp_Certified__c = true");

  } else{

    query = util.format("select Id, Name, City__c, Contact__c, Vanity_URL__c, frm_Certified__c, Country__c, Current_Job__c, External_Video_URL__c, GARP_Summary__c, Member_Photo__c, Member_Summary__c from Testimonial__c where frm_Certified__c = true");

  }
  console.log("Query: " + query);

  _that = this;
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    console.dir(res);

    if(res.totalSize == 0){
      callback(null, {testimonials: []});
      return;
    }

    var testimonials = res;
    var testimonialIDs = "";
    for(var i=0; i<res.totalSize; i++) {
      if(i < res.totalSize-1)
        testimonialIDs += "'" + res.records[i].Id + "',";
      else testimonialIDs += "'" + res.records[i].Id + "'";
    }

    console.log("testimonialIDs: " + testimonialIDs);

    var query1;

    if (examType == 'erp') {

      query1 = util.format("select Id, Question__c, Answer__c, Testimonial__c from TestimonialQandA__c where Testimonial__r.erp_Certified__c = true order by Testimonial__r.Id");

    } else{

      query1 = util.format("select Id, Question__c, Answer__c, Testimonial__c from TestimonialQandA__c where Testimonial__r.frm_Certified__c = true order by Testimonial__r.Id");
    }

    _that.sfdcConn.query(query1, function(err, res1) {
      if (err) {
        callback(err, null);
      }

      var query2 = util.format("select Id, cdrive__contextID__c, cdrive__File_Name__c from cdrive__Cloud_Files__c where cdrive__contextID__c in (%s)", testimonialIDs);
      _that.sfdcConn.query(query2, function(err, res2) {
        if (err) {
          callback(err, null);
        }

        for(var i=0; i<testimonials.totalSize; i++) {
          var testimonial = testimonials.records[i];

          console.log("testimonial: " + testimonial.Id + ' ' + testimonial.Name);

          if(utilities.defined(testimonial,"Member_Photo__c")) {
            if(testimonial.Member_Photo__c.toLowerCase().indexOf('http') == -1) {
              var fnd = _.findWhere(res2.records, {cdrive__contextID__c: testimonial.Id, cdrive__File_Name__c: testimonial.Member_Photo__c });
              if(fnd != null) {
                testimonial.Member_Photo__c = "https://s3-us-west-2.amazonaws.com/garpsalesforcepublic/Testimonial__c/" + testimonial.Id + "/" + fnd.Id + "_" + testimonial.Member_Photo__c;
              }
            }
          }
          console.log("testimonial.Member_Photo__c: " + testimonial.Member_Photo__c);
        }        

        var obj = {
          testimonials: testimonials,
          testimonialsQandA: res1,
          files: res2
        }
        callback(null, obj);
      });

    });

  });
}


SFDCService.prototype.getSFDCfaq = function(category, callback) {

  var query = util.format("select Id, Name, FAQ_Category__c from FAQ_Category__c where Name='%s'", category);

  console.log("Query: " + query);

  _that = this;
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    console.dir(res);

    if(res.totalSize == 0){
      callback(null, {FAQCategory: []});
      return;
    }

    var FAQCategory = res;
    var FAQCategoryIDs = "";
    for(var i=0; i<res.totalSize; i++) {
      if(i < res.totalSize-1)
        FAQCategoryIDs += "'" + res.records[i].Id + "',";
      else FAQCategoryIDs += "'" + res.records[i].Id + "'";
    }

    console.log("FAQCategory: " + FAQCategory);

    var query1 = util.format("select Id, Name, FAQ_Category__c, Section_Order_Number__c, FAQ_Category__r.name from FAQ_section__c where FAQ_Category__r.name='%s' order by Section_Order_Number__c", category);

    _that.sfdcConn.query(query1, function(err, res1) {
      if (err) {
        callback(err, null);
      }

      var query2 = util.format("select Id, Name, FAQ_Category__c, FAQ_section__c, Subsection_Order_Number__c, FAQ_Category__r.name, Related_Section_Order_Number__c from FAQ_subsection__c where FAQ_Category__r.name='%s' order by Subsection_Order_Number__c", category);

      _that.sfdcConn.query(query2, function(err, res2) {
        if (err) {
          callback(err, null);
        }

        var query3 = util.format("select Id, Name, FAQ_Category__r.name, FAQ_Rank__c, FAQ_Question__c, FAQ_Answer__c, FAQ_section__r.name, FAQ_subsection__r.name, Related_Subsection__c from Frequently_Asked_Questions__c where FAQ_Category__r.name='%s' order by Related_Subsection__c", category);

        _that.sfdcConn.query(query3, function(err, res3) {
          if (err) {
            callback(err, null);
          }

          var obj = {
            FAQCategory: FAQCategory,
            FAQSection: res1,
            FAQSubSection: res2,
            FAQ: res3,
          }
          callback(null, obj);
        });
      });

    });

  });
}

/*SFDCService.prototype.getSFDCExamFaq = function(category, callback) {

var query;

console.log("category: " + category);

if (category == 'erp') {

query = util.format("select Id, FAQ_Rank__c, FAQ_Question__c, FAQ_Answer__c,  FAQ_Category__r.name, FAQ_section__r.name, FAQ_subsection__r.name, FAQ_Section__r.Section_Order_Number__c from Frequently_Asked_Questions__c where FAQ_Category__r.name ='erp' order by FAQ_Section__r.Section_Order_Number__c"); 

} else {

query = util.format("select Id, FAQ_Rank__c, FAQ_Question__c, FAQ_Answer__c,  FAQ_Category__r.name, FAQ_section__r.name, FAQ_subsection__r.name, FAQ_Section__r.Section_Order_Number__c from Frequently_Asked_Questions__c where FAQ_Category__r.name ='frm' order by FAQ_Section__r.Section_Order_Number__c"); 

}

  console.log("Query: " + query);

//  _that = this;
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    callback(null, res);

  /*    console.dir(res);

      callback(null, res);
    if(res.totalSize == 0){
      callback(null, {faq: []});
      return;
   }

  var faq = res;
    var faqIds = "";
    for(var i=0; i<res.totalSize; i++) {
      if(i < res.totalSize-1)
        faqIds += "'" + res.records[i].Id + "',";
      else faqIds += "'" + res.records[i].Id + "'";
    }

    console.log("faqIds: " + faqIds);

   var query1;

    if (category == 'erp') {
   
    query1 = util.format("select Id, FAQ_Rank__c, FAQ_Question__c, FAQ_Answer__c,  FAQ_Category__r.name, FAQ_section__r.name, FAQ_subsection__r.name, FAQ_Subsection__r.Order_Number__c from Frequently_Asked_Questions__c where FAQ_Category__r.name ='erp' order by FAQ_Rank__c");
    
   } else {

    query1 = util.format("select Id, FAQ_Rank__c, FAQ_Question__c, FAQ_Answer__c,  FAQ_Category__r.name, FAQ_section__r.name, FAQ_subsection__r.name, FAQ_Subsection__r.Order_Number__c from Frequently_Asked_Questions__c where FAQ_Category__r.name ='frm' order by FAQ_Rank__c");
    
  }

    _that.sfdcConn.query(query1, function(err, res1) {
      if (err) {
        callback(err, null);
      }

   var obj = {
      faq: faq,
      categoryfaq: res1,
   }
        callback(null, obj);
      }); 
  
    });
  }*/


  SFDCService.prototype.getSFDCRiskArticlesByCategory = function(category, numberofarticles, offset, callback) {

    var query = util.format("select Id, Featured_Order__c, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c, Subcategory__c, Category__c, Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = 'Active' and Is_advertisement__c != true and Featured_Order__c = null and Category__c = '%s' order by Published_Date__c DESC limit %s offset %s", category, numberofarticles, offset);

    console.log("Query: " + query);

    this.sfdcConn.query(query, function(err, res) {
      if (err) {
        callback(err, null);
      }
    //logger.log(res);
    callback(null, res);
  });

  }

  SFDCService.prototype.getSFDCQuantCorner = function(numberofarticles, offset, callback) {

    var query = util.format("select Id, Featured_Order__c, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c, Subcategory__c, Category__c, Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c from Content__c where Status__c = 'Active' and Is_advertisement__c != true and Featured_Order__c = null and Third_Party_Author__c = 'Joe Pimbley' order by Published_Date__c DESC limit %s offset %s", numberofarticles, offset);

    console.log("Query: " + query);

    this.sfdcConn.query(query, function(err, res) {
      if (err) {
        callback(err, null);
      }
    //logger.log(res);
    callback(null, res);
  });

  }

  SFDCService.prototype.getSFDCFRMCorner = function(numberofarticles, offset, callback) {

    var query = util.format("select Id, Featured_Order__c, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c, Subcategory__c, Category__c, Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c from Content__c where Status__c = 'Active' and Is_advertisement__c != true and Featured_Order__c = null and Third_Party_Author__c = 'Marco Folpmers' order by Published_Date__c DESC limit %s offset %s", numberofarticles, offset);

    console.log("Query: " + query);

    this.sfdcConn.query(query, function(err, res) {
      if (err) {
        callback(err, null);
      }
    //logger.log(res);
    callback(null, res);
  });

  }


  SFDCService.prototype.getICBRRead = function(callback) {

    var query = "Select FirstName__c, LastName__c, ClientCandidateId__c, AuthorizationTransactionType__c, ExamAuthorizationCount__c, EligibilityApptDateFirst__c, ExamSeriesCode__c, EligibilityApptDateLast__c, ClientAuthorizationID__c, LastUpdate__c from Ready_for_Icbrr_Export__c where  Active__c = true and Submission_Status__c <> 'Successfully Picked Up'";

    console.log("Query: " + query);

    this.sfdcConn.query(query, function(err, res) {
      if (err) {
        callback(err, null);
      }
    //logger.log(res);
    callback(null, res);
  });

  }

  SFDCService.prototype.getExamAlertsByExamSiteId = function(id, callback) {

    var query = util.format("Select Id, Exam_Alert__r.CreatedDate, Exam_Alert__c, Exam_Alert__r.Name, Exam_Alert__r.Text__c, Exam_Alert__r.Sound__c, Exam_Site__c, Exam_Site__r.Name from Exam_Alert_Site__c where Exam_Site__c = '%s'", id);

    this.sfdcConn.query(query, function(err, res) {
      if (err) {
        callback(err, null);
      }
      logger.log(res);

      var returnRecords = [];

      if (utilities.defined(res, "records")) {
        for (var i = 0; i < res.records.length; i++) {
          var rec = res.records[i];

        //console.dir(rec);

        var fnd = _.findWhere(returnRecords, {
          id: rec.Exam_Alert__c
        });

        //console.log('fnd:' + fnd);

        if (utilities.defined(fnd)) {
          if (!utilities.defined(fnd, "sites")) {
            fnd.sites = [];
          }
          var obj = {
            id: rec.Exam_Site__c,
            name: rec.Exam_Site__r.Name
          }
          fnd.sites.push(obj);

        } else {

          var obj = {
            id: rec.Exam_Alert__c,
            title: rec.Exam_Alert__r.Name,
            body: rec.Exam_Alert__r.Text__c,
            date: rec.Exam_Alert__r.CreatedDate,
            sound: rec.Exam_Alert__r.Sound__c,
            sites: [{
              id: rec.Exam_Site__c,
              name: rec.Exam_Site__r.Name
            }]
          }
          returnRecords.push(obj);
        }

        //console.dir(returnRecords);

      }
    }

    callback(null, returnRecords);
  });
  };

  SFDCService.prototype.getAllExamAlerts = function(callback) {
    this.sfdcConn.query('Select Id, Exam_Alert__r.CreatedDate, Exam_Alert__c, Exam_Alert__r.Name, Exam_Alert__r.Text__c, Exam_Alert__r.Sound__c, Exam_Site__c, Exam_Site__r.Name from Exam_Alert_Site__c where Exam_Site__r.Exam__r.Exam_Group__r.Active__c = True', function(err, res) {
      if (err) {
        callback(err, null);
      }
      logger.log(res);

      var returnRecords = [];

      if (utilities.defined(res, "records")) {
        for (var i = 0; i < res.records.length; i++) {
          var rec = res.records[i];

        //console.dir(rec);

        var fnd = _.findWhere(returnRecords, {
          id: rec.Exam_Alert__c
        });

        //console.log('fnd:' + fnd);

        if (utilities.defined(fnd)) {
          if (!utilities.defined(fnd, "sites")) {
            fnd.sites = [];
          }
          var obj = {
            id: rec.Exam_Site__c,
            name: rec.Exam_Site__r.Name
          }
          fnd.sites.push(obj);

        } else {

          var obj = {
            id: rec.Exam_Alert__c,
            title: rec.Exam_Alert__r.Name,
            body: rec.Exam_Alert__r.Text__c,
            date: rec.Exam_Alert__r.CreatedDate,
            sound: rec.Exam_Alert__r.Sound__c,
            sites: [{
              id: rec.Exam_Site__c,
              name: rec.Exam_Site__r.Name
            }]
          }
          returnRecords.push(obj);
        }

        //console.dir(returnRecords);

      }
    }

    callback(null, returnRecords);
  });
  };

  SFDCService.prototype.getOppLineItems = function(id, callback) {

  //2005-10-08T01:02:03Z
  var dt = moment('1/1/2015').format("YYYY-MM-DD") + "T00:00:00Z"

  var query = util.format("select Id, Name, Amount, (SELECT Id,Description,PricebookEntryId,Quantity,UnitPrice,SortOrder,TotalPrice FROM OpportunityLineItems) from Opportunity where CreatedDate > %s", dt);
  //console.log(query);
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getTransactions = function(id, callback) {

  var dt = moment('1/1/2015').format("YYYY-MM-DD") + "T00:00:00Z"
  var query = util.format("select Id, Name, ChargentSFA__Opportunity__c, ChargentSFA__Opportunity__r.Name, ChargentSFA__Amount__c, ChargentSFA__Gateway_Date__c, ChargentSFA__Type__c, ChargentSFA__Response_Status__c, ChargentSFA__Payment_Method__c from ChargentSFA__Transaction__c where CreatedDate > %s", dt);
  //console.log(query);
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getProducts = function(callback) {

  this.sfdcConn.query('select Id, Name, Product2.Id, Product2.FRM_Exam__c, Product2.ERP_Exam__c, Product2.Name, Product2.ProductCode, Product2.GL_Code__c, Product2.Description, Product2.Image__c, Product2.IsActive, Product2.Weight__c, Product2.FRM_1_Book__c, Product2.FRM_2_Book__c, Product2.ERP_Study_Center__c, Product2.FBR_Study_Center__c, Product2.ICBRR_Study_Center__c, pricebook2.IsActive, UnitPrice, UseStandardPrice from PriceBookEntry where Pricebook2.IsActive = true and Product2.IsActive = true and pricebook2.IsActive = true', function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};


SFDCService.prototype.getActiveExamSites = function(callback) {
  this.sfdcConn.query('Select Id, Name, Exam__r.Exam_Group__r.Active__c from Exam_Sites__c where Exam__r.Exam_Group__r.Active__c = True', function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};


SFDCService.prototype.sendContactUsEmail = function(contactID, name, email, enquiry, callback) {
  var body = {
    contactID: contactID,
    name: name,
    email: email,
    enquiry: enquiry
  };

  this.sfdcConn.apex.post("/webserverService/", body, function(err, res) {

    console.log('post!' + err)
    console.dir(res);

    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
}


SFDCService.prototype.getautoQA = function(email, callback) {
  var body = { email: email };
  this.sfdcConn.apex.post("/autoQAService/", body, function(err, res) {

    console.log('post!' + err)
    console.dir(res);

    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
}

// SFDCService.prototype.getcontentAnalytics = function(id, callback) {
//   var body = { id: id };
//   this.sfdcConn.apex.post("/contentanalytics/", body, function(err, res) {

//     console.log('post!' + err)
//     console.dir(res);

//     if (err) {
//       callback(err, null);
//     }
//     logger.log(res);
//     callback(null, res);
//   });
// }

SFDCService.prototype.getAccounts = function(callback) {
  this.sfdcConn.query('SELECT Id, Name FROM Account', function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

// SFDCService.prototype.getContentDoc = function(id, userId, callback) {

//   var body = { docId: id, userId: userId };
//   this.sfdcConn.apex.post("/content/", body, function(err, res) {

//     console.log('post!' + err)
//     console.dir(res);

//     if (err) {
//       callback(err, null);
//     }
//     logger.log(res);
//     callback(null, res);
//   });

SFDCService.prototype.getContentDoc = function(id, callback) {

  var query = util.format("Select Id, Subcategory__c, Category__c, Name, View_Count__c, Bucket1__c, Bucket2__c, Book_Author__c, Book_Publisher__c, Book_Title__c, Content_Name__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Raw_HTML__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, primary_author__r.Name, primary_author__r.Email__c, primary_author__r.twitter_handle__c, primary_author__r.image__c, Supress_Ads__c, Vanity_URL__c, Hashtag__c from Content__c where Id = '%s'", id);
  //console.log(query);
  var _that = this;
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    try {
      logger.log(res);
      callback(null, res);

      if (utilities.defined(res, "records.length") && res.records.length > 0) {

        var obj = res.records[0];

        //console.log('obj' + obj);

        if (utilities.defined(obj.View_Count__c))
          obj.View_Count__c++;
        else obj.View_Count__c = 1;

        var updateObj = {
          Id: obj.Id,
          View_Count__c: obj.View_Count__c
        }

        console.dir('updateObj:' + updateObj);

        Date.prototype.getWeek = function() {
          var onejan = new Date(this.getFullYear(), 0, 1);
          return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        }

        var weekNum = (new Date()).getWeek();
        var bucket = 2;
        var bucketCnt = 0;
        var viewCnt = 0;
        if (weekNum % 2 == 0)
          bucket = 1;

        if (bucket == 1) {
          if (utilities.defined(obj, "Bucket1__c"))
            bucketCnt = obj.Bucket1__c;
          bucketCnt++;
          updateObj.Bucket1__c = bucketCnt;
        } else {
          if (utilities.defined(obj, "Bucket2__c"))
            bucketCnt = obj.Bucket2__c;
          bucketCnt++;
          updateObj.Bucket2__c = bucketCnt;
        }

        try {

          _that.sfdcConn.sobject("Content__c").update(updateObj, function(err, ret) {
            if (err || !ret.success) {
              return console.error(err, ret);
            }
            console.dir('Content__c Updated:' + err);


            var query1 = util.format("Select Id, Name, Type__c, Count__c, Bucket1__c, Bucket2__c, Trend__c from Content_Analytic__c where Contact__c = null");
            console.log('query1:' + query1);

            _that.sfdcConn.query(query1, function(err, res) {
              //if (err) { callback(err, null); }
              //logger.log(res);
              //callback(null, res);

              var updateObjs = [];
              var addObjs = [];
              var topics = [];
              var fndContentType = 0;

              if (utilities.defined(obj, "Topic__c")) {
                var stop = obj.Topic__c.split(";");
                for (var i = 0; i < stop.length; i++) {
                  var tempObj = {
                    name: stop[i],
                    fnd: 0
                  }
                  topics.push(tempObj);
                }
              }

              if (utilities.defined(res, "records.length") && res.records.length > 0) {

                for (var i = 0; i < res.records.length; i++) {
                  var rec = res.records[i];
                  //console.log('****************rec:' + i);
                  //console.dir(rec);

                  if (rec.Type__c == 'Content-Type' && rec.Name == obj.Content_Type__c) {
                    fndContentType = 1;
                    rec.Count__c++;
                    bucketCnt = 0;
                    if (bucket == 1) {
                      if (utilities.defined(rec, "Bucket1__c"))
                        bucketCnt = rec.Bucket1__c;
                      bucketCnt++;
                      rec.Bucket1__c = bucketCnt;
                    } else {
                      if (utilities.defined(rec, "Bucket2__c"))
                        bucketCnt = rec.Bucket2__c;
                      bucketCnt++;
                      rec.Bucket2__c = bucketCnt;
                    }
                    delete rec['attributes'];
                    console.dir(rec);
                    updateObjs.push(rec);
                  }

                  if (rec.Type__c == 'Topic') {
                    for (var j = 0; j < topics.length; j++) {
                      if (topics[j].name == rec.Name) {
                        topics[j].fnd = 1;
                        rec.Count__c++;
                        bucketCnt = 0;
                        if (bucket == 1) {
                          if (utilities.defined(rec, "Bucket1__c"))
                            bucketCnt = rec.Bucket1__c;
                          bucketCnt++;
                          rec.Bucket1__c = bucketCnt;
                        } else {
                          if (utilities.defined(rec, "Bucket2__c"))
                            bucketCnt = rec.Bucket2__c;
                          bucketCnt++;
                          rec.Bucket2__c = bucketCnt;
                        }
                        delete rec['attributes'];
                        console.dir(rec);
                        updateObjs.push(rec);
                        break;
                      }
                    }
                  }
                }
              }

              if (fndContentType == 0 && utilities.defined(obj, "Content_Type__c.length") && obj.Content_Type__c.length > 0) {
                var addObj = {
                  Name: obj.Content_Type__c,
                  Type__c: 'Content-Type',
                  Count__c: 1,
                  Bucket1__c: 0,
                  Bucket2__c: 0,
                  Trend__c: 0
                }
                if (bucket == 1)
                  addObj.Bucket1__c = 1;
                else addObj.Bucket1__c = 2;

                addObjs.push(addObj);
              }

              for (var j = 0; j < topics.length; j++) {
                if (topics[j].fnd == 0) {
                  var addObj = {
                    Name: topics[j].name,
                    Type__c: 'Topic',
                    Count__c: 1,
                    Bucket1__c: 0,
                    Bucket2__c: 0,
                    Trend__c: 0
                  }
                  if (bucket == 1)
                    addObj.Bucket1__c = 1;
                  else addObj.Bucket1__c = 2;
                  addObjs.push(addObj);
                }
              }

              if (updateObjs.length > 0) {

                console.log('Update:' + updateObjs.length);
                //console.dir(updateObjs);

                _that.sfdcConn.sobject("Content_Analytic__c").update(updateObjs, function(err, ret) {
                  if (err || !ret.success) {
                    return console.error(err, ret);
                  }
                  console.dir('Content_Analytic__c Updated:' + err);
                });
              }
              if (addObjs.length > 0) {

                console.log('Add:' + addObjs.length);
                //console.dir(addObjs);

                _that.sfdcConn.sobject("Content_Analytic__c").create(addObjs, function(err, ret) {
                  if (err || !ret.success) {
                    return console.error(err, ret);
                  }
                  console.dir('Content_Analytic__c Added:' + err);
                });
              }


            });
});

} catch (e) {
  console.dir(e);
}
} else {
  console.log('Empty!');
}
} catch (e) {
  console.dir(e);
}
});
};

SFDCService.prototype.getContentAds = function(id, callback) {

  var query = util.format("Select Id, Name, Is_advertisement__c, Ad_Format__c, Content_Name__c, Image__c, Third_Party_URL__c, Raw_HTML__c, Story__c, Vanity_URL__c, Hashtag__c from Content__c where Is_advertisement__c = True and Status__c = \'Active\' and (Start_Date__c = NULL OR Start_Date__c <= Today) and (End_Date__c = NULL OR End_Date__c >= Today) and Ad_Format__c in ('300x250','728x90')");
  //console.log(query);
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getCertifiedCandidatesByExam = function(exam, startDate, endDate, callback) {

  var queryStr;
  if(exam.toLowerCase() == 'frm') {
    queryStr = "Select Name, GARP_Member_ID__c, KPI_FRM_Certified__c, KPI_ERP_Certified__c, KPI_FRM_Certified_Date__c, KPI_ERP_Certified_Date__c, \
    KPI_FRM_Resume_Submission_Date__c, KPI_ERP_Resume_Submission_Date__c from Contact \
    where (KPI_FRM_Certified__c = true and KPI_FRM_Resume_Submission_Date__c >= %s and KPI_FRM_Resume_Submission_Date__c <= %s) Order By LastName";

  } else {
    queryStr = "Select Name, GARP_Member_ID__c, KPI_FRM_Certified__c, KPI_ERP_Certified__c, KPI_FRM_Certified_Date__c, KPI_ERP_Certified_Date__c, \
    KPI_FRM_Resume_Submission_Date__c, KPI_ERP_Resume_Submission_Date__c from Contact \
    where (KPI_ERP_Certified__c = true and KPI_ERP_Resume_Submission_Date__c >= %s and KPI_ERP_Resume_Submission_Date__c <= %s) Order By LastName";

  }
  console.log(queryStr);

  var query = util.format(queryStr, startDate, endDate);
  //console.log(query);
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getPassedCandidatesByExam = function(exam, examDate, callback) {

  var queryStr;
  if(exam.toLowerCase() == 'erp1'){
    var queryStr = "Select Id, Member_Full_Name__c, Member_First_Name__c, Member_Last_Name__c  from Exam_Attempt__c where (Exam_Date__c = %s and Result__c = 'Pass' and Section__c='ERP Exam Part I') Order By Member_Last_Name__c ASC";
  } else if(exam.toLowerCase() == 'erp2'){
    var queryStr = "Select Id, Member_Full_Name__c, Member_First_Name__c, Member_Last_Name__c  from Exam_Attempt__c where (Exam_Date__c = %s and Result__c = 'Pass' and Section__c='ERP Exam Part II') Order By Member_Last_Name__c ASC";
  } else if(exam.toLowerCase() == 'frm1'){
    var queryStr = "Select Id, Member_Full_Name__c, Member_First_Name__c, Member_Last_Name__c  from Exam_Attempt__c where (Exam_Date__c = %s and Result__c = 'Pass' and Section__c='FRM Part 1') Order By Member_Last_Name__c ASC";
  } else if(exam.toLowerCase() == 'frm2'){
    var queryStr = "Select Id, Member_Full_Name__c, Member_First_Name__c, Member_Last_Name__c  from Exam_Attempt__c where (Exam_Date__c = %s and Result__c = 'Pass' and Section__c='FRM Part 2') Order By Member_Last_Name__c ASC";
  };
  console.log(queryStr);

  var query = util.format(queryStr, examDate);
  console.log('query:' + query);

  try {

    var records = [];
    this.sfdcConn.query(query)
    .on("record", function(record) {
      records.push(record);
    })
    .on("end", function() {
      console.log("total in database : " + query.totalSize);
      console.log("total fetched : " + query.totalFetched);
      var obj = {
        records: records
      }
      callback(null, obj);
    })
    .on("error", function(err) {
      console.error(err);
      callback(err, null);
    })
      .run({ autoFetch : true, maxFetch : 4000 }); // synonym of Query#execute();

    } catch (e) {
      console.dir(e);
    }

  };

  SFDCService.prototype.getCertifiedCandidates = function(startDate, endDate, callback) {

    var queryStr =
    "Select Name, GARP_Member_ID__c, KPI_FRM_Certified__c, KPI_ERP_Certified__c, KPI_FRM_Certified_Date__c, KPI_ERP_Certified_Date__c, \
    KPI_FRM_Resume_Submission_Date__c, KPI_ERP_Resume_Submission_Date__c from Contact \
    where (KPI_FRM_Certified__c = true and KPI_FRM_Certified_Date__c >= %s and KPI_FRM_Certified_Date__c <= %s) \
    or (KPI_ERP_Certified__c = true and KPI_ERP_Certified_Date__c >= %s and KPI_ERP_Certified_Date__c <= %s) Order By LastName";

    var query = util.format(queryStr, startDate, endDate, startDate, endDate);
    console.log(query);
    this.sfdcConn.query(query, function(err, res) {
      if (err) {
        callback(err, null);
      }
    //logger.log(res);
    callback(null, res);
  });
  };

  SFDCService.prototype.getSFDCColumns = function(numberofarticles, offset, callback) {

  var query = util.format("select Id, Featured_Order__c, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c, Subcategory__c, Category__c, Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Column__c from Content__c where Status__c = 'Active' and Is_advertisement__c != true and Column__c != NULL order by Published_Date__c DESC limit %s offset %s", numberofarticles, offset);

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}


SFDCService.prototype.getSFDCRiskArticlesByColumn = function(column, numberofarticles, offset, callback) {

  var query = util.format("select Id, Featured_Order__c, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c, Subcategory__c, Category__c, Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Column__c from Content__c where Status__c = 'Active' and Is_advertisement__c != true and Featured_Order__c = null and Column__c = '%s' order by Published_Date__c DESC limit %s offset %s", column, numberofarticles, offset);

  console.log("Query: " + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    //logger.log(res);
    callback(null, res);
  });

}

  SFDCService.prototype.getRecordTypes = function(callback) {
    var query = "select Id, sobjectType, Name, DeveloperName from RecordType where sobjectType = 'Content__c'";
    this.sfdcConn.query(query, function(err, res) {
      if (err) {
        callback(err, null);
      }
      logger.log(res);
      callback(null, res);
    });
  };

  SFDCService.prototype.getContentRecords = function(folder, contentTypes, topics, recordTypes, limit, offset, callback) {

    var type = 'news';
    var folderId = config.riskFolderId;
  //console.log('***:' + folder + ':' + contentTypes + ':' + topics + ':' + recordTypes + ':' + folderId);

  try {

    //var recordTypesMap = res.records;

    var found = false;
    var allContTypes = false;
    var sContTypes = null;
    for (var i = 0; i < contentTypes.length; i++) {
      var contentType = contentTypes[i];
      if (contentType == 'all') {
        allContTypes = true;
        found = true;
      } else {
        if (sContTypes == null)
          sContTypes = '\'' + contentType + '\'';
        else sContTypes = sContTypes + ',\'' + contentType + '\'';
      }
    }

    var found = false;
    var allTopics = false;
    var sTopics = null;
    for (var i = 0; i < topics.length; i++) {
      var topic = topics[i];
      if (topic == 'all') {
        allTopics = true;
        found = true;
      } else {
        if (sTopics == null)
          sTopics = '\'' + topic + '\'';
        else sTopics = sTopics + ',\'' + topic + '\'';
      }
    }

    var found = false;
    var allRecordTypes = false;
    var sRecordTypes = null;
    for (var i = 0; i < recordTypes.length; i++) {
      var recordType = recordTypes[i];
      if (recordType == 'all') {
        allRecordTypes = true;
        found = true;
      } else {
        if (sRecordTypes == null)
          sRecordTypes = '\'' + recordType + '\'';
        else sRecordTypes = sRecordTypes + ',\'' + recordType + '\'';
      }
    }

    if (allTopics && allRecordTypes && contentTypes.length == 1 && contentTypes[0] == 'News') {
      var query = util.format("Select Id, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Media_Type__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and Content_Type__c in (%s) order by Published_Date__c DESC limit %s offset %s", sContTypes, limit, offset);
    } else {
      if (allTopics && !allContTypes && !allRecordTypes) {

        var query = util.format("Select Id, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Media_Type__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and Id in (select Content__c from Content_Folders__c where Folder__c = \'%s\') and Content_Type__c in (%s) and RecordTypeId in (%s) order by Published_Date__c DESC limit %s offset %s", folderId, sContTypes, sRecordTypes, limit, offset);

      } else if (!allTopics && allContTypes && !allRecordTypes) {

        var query = util.format("Select Id, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Media_Type__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and Id in (select Content__c from Content_Folders__c where Folder__c = \'%s\') and RecordTypeId in (%s) and Topic__c includes (%s) order by Published_Date__c DESC limit %s offset %s", folderId, sRecordTypes, sTopics, limit, offset);

      } else if (!allTopics && !allContTypes && allRecordTypes) {

        var query = util.format("Select Id, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Media_Type__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and Id in (select Content__c from Content_Folders__c where Folder__c = \'%s\') and Content_Type__c in (%s) and Topic__c includes (%s) order by Published_Date__c DESC limit %s offset %s", folderId, sContTypes, sTopics, limit, offset);

      } else if (allTopics && allContTypes && !allRecordTypes) {

        var query = util.format("Select Id, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Media_Type__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and Id in (select Content__c from Content_Folders__c where Folder__c = \'%s\') and RecordTypeId in (%s) order by Published_Date__c DESC limit %s offset %s", folderId, sRecordTypes, limit, offset);

      } else if (!allTopics && allContTypes && allRecordTypes) {

        var query = util.format("Select Id, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Media_Type__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and Id in (select Content__c from Content_Folders__c where Folder__c = \'%s\') and Topic__c includes (%s) order by Published_Date__c DESC limit %s offset %s", folderId, sTopics, limit, offset);

      } else if (allTopics && !allContTypes && allRecordTypes) {

        var query = util.format("Select Id, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Media_Type__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and Id in (select Content__c from Content_Folders__c where Folder__c = \'%s\') and Content_Type__c in (%s) order by Published_Date__c DESC limit %s offset %s", folderId, sContTypes, limit, offset);

      } else if (!allTopics && !allContTypes && !allRecordTypes) {

        var query = util.format("Select Id, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Media_Type__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and Id in (select Content__c from Content_Folders__c where Folder__c = \'%s\') and Content_Type__c in (%s) and RecordTypeId in (%s) and Topic__c includes (%s) order by Published_Date__c DESC limit %s offset %s", folderId, sContTypes, sRecordTypes, sTopics, limit, offset);

      } else if (allTopics && allContTypes && allRecordTypes) {

        var query = util.format("Select Id, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Media_Type__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and Id in (select Content__c from Content_Folders__c where Folder__c = \'%s\') order by Published_Date__c DESC limit %s offset %s", folderId, limit, offset);

      }

    }

    //console.log('Query: ' + query);

    this.sfdcConn.query(query, function(err, res) {

      //console.log('Done query');

      if (err) {
        callback(err, null);
      }
      callback(null, res);
    });

  } catch (e) {
    //console.dir(e);
    callback(500, null);
  }
}


SFDCService.prototype.getContentRecordsByCategory = function(category, limit, offset, callback) {

  var folderId = config.riskFolderId;

  var query = util.format("Select Id, Name, Subcategory__c, Category__c, Media_Type__c, Content_Name__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and Category__c = \'%s\' and Id in (select Content__c from Content_Folders__c where Folder__c = \'%s\')   order by Published_Date__c DESC limit %s offset %s", category, folderId, limit, offset);
  console.log('sharath; ' + query);

  this.sfdcConn.query(query, function(err, res) {

    if (err) {
      callback(err, null);
    }
    callback(null, res);
  });

}

SFDCService.prototype.getMemberOrLeadByEmail = function(email, callback) {

  var query = util.format("Select Id, Name from Contact where Email = '%s'", email);
  _that = this;

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);

    if(res.records.length == 0){

      var query2 = util.format("Select Id, Name from Lead where Email = '%s'", email);

      _thatis = _that;
      _that.sfdcConn.query(query2, function(err, res) {
        if (err) {
          callback(err, null);
        }
        logger.log(res);

        if(res.records.length == 0){

          console.log("Neither Lead, Nor Contact exist.");

          _thatis.sfdcConn.sobject("Lead").create({ LastName : 'My Account #1', Company : 'CompanyName' }, function(err, ret) {
            if (err || !ret.success) { return console.error(err, ret); }
            callback(null, ret);
            console.log("Created record id : " + ret.id);
          });
        } else {
          callback(null, res);
        }
      });

    } else {
      callback(null, res);
    }

  });

}

SFDCService.prototype.getContentRecordsBySubcategory = function(subcategory, limit, offset, callback) {

  try {
    var folderId = config.riskFolderId;

    var query = util.format("Select Id, Name, Subcategory__c, Category__c, Media_Type__c, Content_Name__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = \'Active\' and Is_advertisement__c != true and subcategory__c = \'%s\' and Id in (select Content__c from Content_Folders__c where Folder__c = \'%s\')   order by Published_Date__c DESC limit %s offset %s", subcategory, folderId, limit, offset);
    console.log('sharath; ' + query);

    this.sfdcConn.query(query, function(err, res) {
      if (err) {
        callback(err, null);
      }
      callback(null, res);
    });
  } catch (e) {
    console.dir(e);
    callback(500, null);
  }
}

SFDCService.prototype.getSFDCFeaturedContent = function(type, callback) {

  var query = "select Id, Featured_Order__c, Name, Content_Name__c, RecordTypeId, Description__c, SKU__c, Is_advertisement__c, Image__c, Third_Party_Author__c, Author__r.Name, Content_Type__c,Featured__c, Published_Date__c, Story__c, Topic__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Duration_in_Minutes__c, Event_Date_Time__c, Is_On_Demand__c, Moderators__c, Presenters__c, Visibility_ERP__c, Visibility_FRM__c, Visibility_Membership__c, Location__c, Vanity_URL__c, Hashtag__c, Category__c, Subcategory__c from Content__c where Status__c = 'Active' and Is_advertisement__c != true and Featured_Order__c != null order by Featured_Order__c ASC limit 3";
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    callback(null, res);
  });
}


SFDCService.prototype.getWebCasts = function(callback) {

  var recordTypeId = '012f00000008n4m';
  var query = util.format("select Id, Name, Description__c, Start_Date__c, End_Date__c, Third_Party_URL__c, Vanity_URL__c, Hashtag__c from Content__c where Status__c = 'Active' and RecordTypeId = '%s'", recordTypeId);
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    callback(null, res);
  });
}

SFDCService.prototype.getContent = function(id, callback) {

  var query = util.format("select Id, Name, Description__c, Start_Date__c, End_Date__c, from Content__c where Status__c = 'Active' and Id = '%s'", id);
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    callback(null, res);
  });
}


SFDCService.prototype.getCPDActivities = function(callback) {

  var query = "select Id, Name, Featured_Order__c, Featured__c, Title__c, Status__c, Start_Date__c, End_Date__c, Description__c, CPE_Activity_Type__c, Activity_Type_Description__c, Area_of_Study__c, Credit__c, Date_Description__c, Organization__c, Provider__c, Account__c, Account__r.CPE_Provider_Logo__c, Account__r.Description, Publication__c, URL__c from CPE_Activity__c where Status__c = 'Active' and Featured__c = True Limit 10";
  _that = this;

  //console.log(query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    //console.dir('**' + res.records);
    var returnData = [];

    for (var i = 0; i < res.records.length; i++) {

      //console.log('********');

      var rec = res.records[i];

      var nowDateTime = moment().unix();

      if (utilities.defined(rec, "Start_Date__c"))
        rec.Start_Date__c = moment(rec.Start_Date__c).unix();
      if (utilities.defined(rec, "End_Date__c"))
        rec.End_Date__c = moment(rec.End_Date__c).unix();

      //console.log(nowDateTime);
      //console.log(rec.End_Date__c);
      //console.log(rec.Start_Date__c);
      var addContent = false;
      if (!utilities.defined(rec, "End_Date__c") && utilities.defined(rec, "Start_Date__c") && nowDateTime >= rec.Start_Date__c) {
        addContent = true;
      } else if (!utilities.defined(rec, "Start_Date__c") && utilities.defined(rec, "End_Date__c") && nowDateTime < rec.End_Date__c) {
        addContent = true;
      } else if (utilities.defined(rec, "Start_Date__c") && utilities.defined(rec, "End_Date__c") && nowDateTime >= rec.Start_Date__c && nowDateTime < rec.End_Date__c) {
        addContent = true;
      } else if (!utilities.defined(rec, "Start_Date__c") && !utilities.defined(rec, "End_Date__c")) {
        addContent = true;
      }
      if (addContent)
        returnData.push(rec);
    }
    res.records = returnData;
    callback(null, res);
  });
}

SFDCService.prototype.getAcademicPartners = function(callback) {

  var query = "select Id, Account_Role_Published_Date__c, Account_Role_Status__c, Name, CPE_Provider_Logo__c, Description, Website from Account where Academic_Partner__c = true and Account_Role_Status__c = 'Active' order by Account_Role_Published_Date__c DESC";
  _that = this;

  //console.log(query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    callback(null, res);
  });
}

SFDCService.prototype.getCPDProviders = function(callback) {

  var query = "select Id, Name, CPE_Provider_Logo__c, Description, Website from Account where CPD_Provider__c = true";
  _that = this;

  //console.log(query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    callback(null, res);
  });
}

SFDCService.prototype.getVideos = function(callback) {

  var options = {
    hostname: 'api.wistia.com',
    port: 443,
    path: '/v1/medias.json?api_password=e3799e5757e935546bb68ddd768a1323ea4bb830a3019df150642f658e620ec9',
    method: 'GET'
  };

  var req = https.request(options, function(res) {

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      callback(null, responseString);
    });

  });

  req.end();

  req.on('error', function(error) {
    callback(error, null);
  });

}

SFDCService.prototype.getVideo = function(id, callback) {

  var options = {
    hostname: 'api.wistia.com',
    port: 443,
    path: '/v1/medias/' + id + '.json?api_password=e3799e5757e935546bb68ddd768a1323ea4bb830a3019df150642f658e620ec9',
    method: 'GET'
  };

  var req = https.request(options, function(res) {

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      callback(null, responseString);
    });

  });

  req.end();

  req.on('error', function(error) {
    callback(error, null);
  });

}

SFDCService.prototype.getVideoCat = function(id, callback) {

  var options = {
    hostname: 'api.wistia.com',
    port: 443,
    path: '/v1/projects/' + hashed_id + '.json?api_password=e3799e5757e935546bb68ddd768a1323ea4bb830a3019df150642f658e620ec9',
    method: 'GET'
  };

  var req = https.request(options, function(res) {

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      callback(null, responseString);
    });

  });

  req.end();

  req.on('error', function(error) {
    callback(error, null);
  });

}

SFDCService.prototype.getChapterMeetings = function(callback) {

  var today = new Date();
  var query = "select Id, Name, Chapter_Meeting_Name__c, Is_Sponsored__c, Sponsor_Name__c, Sponsor_Information__c, Sponsor_Logo__c, Sponsor_Website__c, Start__c, End__c, Time_Zone__c, Time_Zone__r.Name, Synopsis__c, Ceremony__c, Group_Formation__c, Presentation__c, Chapter__r.Name, Chapter_Meeting_Location__r.Address_Street_1__c, Chapter_Meeting_Location__r.Address_Street_2__c, Chapter_Meeting_Location__r.Address_City__c, Chapter_Meeting_Location__r.Address_State_Provence__c, Chapter_Meeting_Location__r.Address_Postal_Code__c, Chapter_Meeting_Location__r.Address_Country__c from Chapter_Meeting__c where Start__c >= today and Status__c = 'Active'";
  _that = this;

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    callback(null, res);
  });
}

SFDCService.prototype.getChapterPresentations = function(callback) {

  var today = new Date();
  var query = "Select Id, Name, Content__r.Id, Content__r.Name, Content__r.Description__c, Content__r.Media_Type__c, \
  Content__r.Third_Party_URL__c, \
  Chapter_Meeting__r.Name, Chapter_Meeting__r.Start__c , Chapter_Meeting__r.Chapter__r.Name, \
  Chapter_Speaker__r.Qualifications__c, Chapter_Speaker__r.Biography__c \
  from Chapter_Meeting_Speaker__c where Content__c != null order by Content__r.Id";

  console.log('query:' + query);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    //console.dir(res.records);

    //Merge duplicate Presentations into a single record; We get duplicate Presentations when there are multiple Authors for a
    //Presentation, since we are driving off the Chapter_Meeting_Speaker__c object
    var speakers = res.records;
    var results = [];

    var firstSpeaker = speakers[0];
    var result = {};
    if (utilities.defined(firstSpeaker, "Content__r.Name"))
      result.Name = firstSpeaker.Content__r.Name;
    if (utilities.defined(firstSpeaker, "Content__r.Description__c"))
      result.Description = firstSpeaker.Content__r.Description__c;
    if (utilities.defined(firstSpeaker, "Content__r.Media_Type__c"))
      result.MediaType = firstSpeaker.Content__r.Media_Type__c;
    if (utilities.defined(firstSpeaker, "Content__r.Third_Party_URL__c"))
      result.Location = firstSpeaker.Content__r.Third_Party_URL__c;
    if (utilities.defined(firstSpeaker, "Chapter_Meeting__r.Chapter__r.Name"))
      result.Chapter = firstSpeaker.Chapter_Meeting__r.Chapter__r.Name;
    if (utilities.defined(firstSpeaker, "Chapter_Meeting__r.Start__c"))
      result.StartTime = firstSpeaker.Chapter_Meeting__r.Start__c;

    result.speakers = [];
    var obj = {};
    if (utilities.defined(firstSpeaker, "Name"))
      obj.Name = firstSpeaker.Name;
    if (utilities.defined(firstSpeaker, "Chapter_Speaker__r.Biography__c"))
      obj.Biography = firstSpeaker.Chapter_Speaker__r.Biography__c;
    if (utilities.defined(firstSpeaker, "Chapter_Speaker__r.Qualifications__c"))
      obj.Qualifications = firstSpeaker.Chapter_Speaker__r.Qualifications__c;

    result.speakers.push(obj);
    results.push(result);

    for (var i = 1; i < speakers.length; i++) {
      var currentSpeaker = speakers[i];
      if (result.Name !== currentSpeaker.Content__r.Name) {
        //Processing a new Presentation
        result = {};

        if (utilities.defined(currentSpeaker, "Content__r.Name"))
          result.Name = currentSpeaker.Content__r.Name;
        if (utilities.defined(currentSpeaker, "Content__r.Description__c"))
          result.Description = currentSpeaker.Content__r.Description__c;
        if (utilities.defined(currentSpeaker, "Content__r.Media_Type__c"))
          result.MediaType = currentSpeaker.Content__r.Media_Type__c;
        if (utilities.defined(currentSpeaker, "Content__r.Third_Party_URL__c"))
          result.Location = currentSpeaker.Content__r.Third_Party_URL__c;
        if (utilities.defined(currentSpeaker, "Chapter_Meeting__r.Chapter__r.Name"))
          result.Chapter = currentSpeaker.Chapter_Meeting__r.Chapter__r.Name;
        if (utilities.defined(currentSpeaker, "Chapter_Meeting__r.Start__c"))
          result.StartTime = currentSpeaker.Chapter_Meeting__r.Start__c;
        result.speakers = [];

        results.push(result);
      }

      var speaker = {};
      if (utilities.defined(currentSpeaker, "Name"))
        speaker.Name = currentSpeaker.Name;
      if (utilities.defined(currentSpeaker, "Chapter_Speaker__r.Biography__c"))
        speaker.Biography = currentSpeaker.Chapter_Speaker__r.Biography__c;
      if (utilities.defined(currentSpeaker, "Chapter_Speaker__r.Qualifications__c"))
        speaker.Qualifications = currentSpeaker.Chapter_Speaker__r.Qualifications__c;

      result.speakers.push(speaker);
    }

    callback(null, results);
  });
}

SFDCService.prototype.getChapterMeeting = function(id, callback) {

  var query = util.format("select Id, Name, Is_Sponsored__c, Sponsor_Name__c, Sponsor_Information__c, Sponsor_Logo__c, Sponsor_Website__c, Chapter_Meeting_Name__c, Start__c, End__c, Time_Zone__c, Synopsis__c, Ceremony__c, Group_Formation__c, Presentation__c, Chapter__r.Name, Chapter_Meeting_Location__r.Name, Chapter_Meeting_Location__r.Address_Street_1__c, Chapter_Meeting_Location__r.Address_Street_2__c, Chapter_Meeting_Location__r.Address_City__c, Chapter_Meeting_Location__r.Address_State_Provence__c, Chapter_Meeting_Location__r.Address_Postal_Code__c, Chapter_Meeting_Location__r.Address_Country__c from Chapter_Meeting__c where Status__c = 'Active' and Id = '%s'", id);
  _that = this;

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    callback(null, res);
  });
}

SFDCService.prototype.getChapters = function(callback) {

  var query = "select Id, Name, Location__c, Region__c, Type__c from Chapter__c where Status__c = 'Active'";
  _that = this;

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);

    var chapters = res.records;
    var query2 = "select Id, Chapter__c, Contact__c, Contact__r.Name, Contact__r.Email, Title__c, Chapter_Director_Bio__c, Committee_Member__c, Director__c from Chapter_Member__c where Director__c = true or Committee_Member__c = true";

    _that.sfdcConn.query(query2, function(err, res) {
      if (err) {
        callback(err, null);
      }
      logger.log(res);

      for (var i = 0; i < res.records.length; i++) {
        var chap = _.findWhere(chapters, {
          Id: res.records[i].Chapter__c
        });
        if (utilities.defined(chap)) {
          if (!utilities.defined(chap, "members"))
            chap.members = [];
          chap.members.push(res.records[i]);
        }
      }
      logger.log(chapters);
      callback(null, chapters);
    });
  });
};




SFDCService.prototype.getQuestionsReadings = function(exam, year, callback) {

  var query = util.format("select Id, Name, Practice_Exam_Question__c, Study_Guide_Reading__c from Question_Reading__c where Practice_Exam_Question__r.Year__c = '%s' and Study_Guide_Reading__r.Area_of_Study__c = '%s'", year, exam);
  console.log('query:' + query)
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getStudyTopics = function(exam, year, callback) {

  var query =
  util.format("Select Id, Name, Description__c, Week__c, (Select Id, Name, Year__c, Description__c, Is_Online__c, URL__C, Chapter__c, Pages__c, Page_Start__c, Page_End__c, Book__c, Study_Guide_Domain__r.Name from Study_Guide_Readings__r where Exam_Registrants_Only__c = False) from Study_App_Lesson_Plan__c where Exam__c = '%s' and Year__c = '%s' order by Week__c", exam, year);
  console.log('query:' + query)
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getStudyProducts = function(mode, callback) {

  if(mode == 'FRM'){
    var query =
    util.format("select Product2.Id, Product2.Name, Product2.Study_Center_Last_Updated_Date__c, Product2.Study_Center_Description__c, Product2.Image__c, Product2.Pre_Order_Date__c, Product2.Inventory__c, UnitPrice from PriceBookEntry where Product2.FRM_Study_Center__c = true");
    console.log('query:' + query)
  }else if(mode == 'ERP'){
    var query =
    util.format("select Product2.Id, Product2.Name, Product2.Study_Center_Last_Updated_Date__c, Product2.Study_Center_Description__c, Product2.Image__c, Product2.Pre_Order_Date__c, Product2.Inventory__c, UnitPrice from PriceBookEntry where Product2.ERP_Study_Center__c = true");
    console.log('query:' + query)
  }else if(mode == 'FRB'){
    var query =
    util.format("select Product2.Id, Product2.Name, Product2.Study_Center_Last_Updated_Date__c, Product2.Study_Center_Description__c, Product2.Image__c, Product2.Pre_Order_Date__c, Product2.Inventory__c, UnitPrice from PriceBookEntry where Product2.FBR_Study_Center__c = true");
    console.log('query:' + query)
  }else if(mode == 'ICBRR'){
    var query =
    util.format("select Product2.Id, Product2.Name, Product2.Study_Center_Last_Updated_Date__c, Product2.Study_Center_Description__c, Product2.Image__c, Product2.Pre_Order_Date__c, Product2.Inventory__c, UnitPrice from PriceBookEntry where Product2.ICBRR_Study_Center__c = true");
    console.log('query:' + query)
  };
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getReadings = function(exam, year, callback) {

  var query = util.format("select Id, Name, Book__c, Chapter__c, Pages__c, Area_of_Study__c, Description__c, ID__c, Is_Online__c, URL__C, Page_Start__c, Page_End__c, Study_Guide_Domain__c, Study_Guide_Domain__r.Name, Study_Guide_Domain__r.ID__c, Study_App_Lesson_Plan__c, Study_App_Lesson_Plan__r.Week__c, Study_App_Lesson_Plan__r.Description__c, Study_App_Lesson_Plan__r.Exam__c from Study_Guide_Readings__c where Year__c = '%s' and Area_of_Study__c = '%s'", year, exam);
  console.log('query:' + query)
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getQuestion = function(exam, year, callback) {

  var query = util.format("select Id, Name, Choices__c, Answer__c, Area_of_Study__c, Question__c, Rationale__c, Study_Guide_Domain__c, Study_Guide_Domain__r.Name, Study_Guide_Domain__r.ID__c from Practice_Exam_Questions__c where Year__c = '%s' and Area_of_Study__c = '%s'", year, exam);
  console.log('query:' + query)
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getExamSites = function(callback) {

  var query = util.format("select Id, Name from Site__c");

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getExamVenues = function(examDate, callback) {

  var query = util.format("Select Id, Name, Active__c, Address1__c, Address2__c, Building_Name__c, City__c, State__c, Country__c, Institution_Name__c, Zipcode__c, Region__c, Site__r.Exam_Date__c, Site__r.Active__c from Venue__c where Site__r.Exam_Date__c = %s", examDate);
  console.log('query:' + query)
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};

SFDCService.prototype.getExamSitesAlerts = function(callback) {

  var query = util.format("Select Id, Exam_Alert__r.Name, Exam_Alert__r.Text__c, Exam_Alert__r.Sound__c, Exam_Site__c, Exam_Site__r.Name, Exam_Site__r.Exam__r.Exam_Group__r.Active__c from Exam_Alert_Site__c");

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};


SFDCService.prototype.getUserByUsername = function(username, callback) {

  var query = util.format("select user.id, user.Email, user.ContactId, user.FirstName, user.LastName, user.profile.name, user.Username, user.IsActive, user.FullPhotoUrl FROM user, user.profile WHERE IsActive = true and Username = '%s'", username);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log("getUserByUsername: " + res);
    callback(null, res);
  });
};

SFDCService.prototype.getContact = function(contactId, callback) {

  var query = util.format("SELECT Id, Name, FirstName, LastName, Email, GARP_Member_ID__c, MailingCity, MailingCountry, MailingPostalCode, MailingState, MailingStreet, AccountId, GARP_ID__c, Membership_Type__c, Name_As_it_Appears_On_ID__c, ID_Number__c, ID_Type__c, GARP_Directory_Opt_In__c, KPI_Current_Exam_Date__c, KPI_Current_Exam_Location__c, KPI_Current_Exam_Registration__c, KPI_Current_Exam_Registration_Type__c, KPI_Current_Exam_Registration_Date__c, KPI_Last_Exam_Date__c, KPI_Last_Exam_Location__c, KPI_Last_Exam_Registration__c, KPI_Last_Exam_Registration_Type__c, KPI_ERP_Candidate_Payment_Status__c, KPI_ERP_Program_Start_Date__c, KPI_ERP_Program_Expiration_Date__c, KPI_FRM_Program_Start_Date__c, KPI_FRM_Candidate_Payment_Status__c, KPI_FRM_Program_Expiration_Date__c, Mobile_App_Administration__c FROM Contact WHERE Id = '%s'", contactId);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};


SFDCService.prototype.getUser = function(userId, callback) {

  var query = util.format("SELECT Id, Name, Email, FullPhotoUrl FROM User WHERE Id = '%s'", userId);

  _that = this;
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);

    _that.res1 = res;
    var query = util.format("SELECT   LastModifiedDate,LoginType,NumSecondsValid,SessionType,UsersId FROM AuthSession where LoginType = 'Chatter Communities External User' and SessionType = 'ChatterNetworks' and UsersId = '%s'", userId);
    _that.sfdcConn.query(query, function(err, res) {
      if (err) {
        callback(err, null);
      }

      var obj = {
        user: _that.res1,
        session: res
      }
      callback(null, obj);
    });

  });
};

SFDCService.prototype.getUsers = function(callback) {
  this.sfdcConn.query('SELECT Id, Name, Email FROM User', function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);
    callback(null, res);
  });
};


function isNull(inParam) {
  if (inParam !== null && typeof inParam !== 'undefined') {
    return inParam;
  } else {
    return '';
  }
}


function isNullBoolean(inParam) {
  if (inParam !== null && typeof inParam !== 'undefined') {
    return inParam;
  } else {
    return false;
  }
}


function isNullGetArray(inParam, delim) {
  if (inParam !== null && typeof inParam !== 'undefined' && inParam != '') {

    //console.log('isNullGetArray:' + inParam);

    if (delim === null || typeof delim === 'undefined')
      delim = '\n';

    var arr = inParam.split(delim);

    //console.dir(arr);

    return arr;
  } else {
    return [];
  }
}

function isNullSetArray(inParam, delim) {
  if (inParam !== null && typeof inParam !== 'undefined' &&
    inParam.length !== null && typeof inParam.length !== 'undefined' &&
    inParam.length > 0) {

    if (delim === null || typeof delim === 'undefined')
      delim = '\n';

    if (inParam == '') {
      return inParam;
    } else {
      var ret = '';
      for (var i = 0; i < inParam.length; i++) {
        if (ret == '')
          ret = inParam[i]
        else ret = ret + delim + inParam[i];
      }
      return ret;
    }
  } else {
    return '';
  }

}


SFDCService.prototype.getMeta = function(userId, callback) {

  var query = util.format("SELECT Id, ReadingId__c, Contact__c, Done__c, Flagged__c, Notes__c from FRM_App_Meta__c WHERE Contact__c = '%s'", userId);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);

    //console.log('getMeta');
    //console.dir(res);

    var data = {
      metaData: []
    };
    if (res.totalSize > 0) {
      for (var i = 0; i < res.totalSize; i++) {
        resData = res.records[i];
        var obj = {
          Id: resData.Id,
          readingId: resData.ReadingId__c,
          done: isNullBoolean(resData.Done__c),
          flagged: isNullBoolean(resData.Flagged__c),
          notes: isNullGetArray(resData.Notes__c, '~')
        }
        data.metaData.push(obj);
      }
    }
    callback(null, data);
  });
};

SFDCService.prototype.setMeta = function(userId, meta, callback) {

  //console.log('In Set');

  var obj = {
    Id: meta.Id,
    ReadingId__c: meta.readingId,
    Done__c: meta.done,
    Flagged__c: meta.flagged,
    Notes__c: isNullSetArray(meta.notes, '~'),
    Contact__c: userId
  }

  //console.dir(obj);
  this.sfdcConn.sobject("FRM_App_Meta__c").update(obj, function(err, ret) {
    if (err || !ret.success) {
      return console.error(err, ret);
    }
    //console.log('Updated Successfully : ' + ret.id);
    callback(null, ret);
  });
};

SFDCService.prototype.createMeta = function(userId, meta, callback) {

  var obj = {
    Id: meta.Id,
    ReadingId__c: meta.readingId,
    Done__c: meta.done,
    Flagged__c: meta.flagged,
    Notes__c: isNullSetArray(meta.notes, '~'),
    Contact__c: userId
  }

  this.sfdcConn.sobject("FRM_App_Meta__c").create(obj, function(err, ret) {
    if (err || !ret.success) {
      return console.error(err, ret);
    }
    //console.log('Create Successfully : ' + ret.id);
    callback(null, ret);
  });
};


SFDCService.prototype.getSettings = function(userId, callback) {

  var query = util.format("SELECT Id, apnId__c, gcmId__c, examId__c, Organize_By__c, Reminders__c, Insirpation__c from FRM_App_Setting__c WHERE Contact__c = '%s'", userId);

  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }
    logger.log(res);

    //console.log('getSettings');
    //console.dir(res);

    var data = {};
    if (res.totalSize > 0) {
      data = res.records[0]
    }

    var obj = {
      settings: {
        Id: isNull(data.Id),
        apnId: isNull(data.apnId__c),
        gcmId: isNull(data.gcmId__c),
        examId: isNull(data.examId__c),
        organizeBy: isNull(data.Organize_By__c),
        insirpation: isNull(data.Insirpation__c),
        reminders: isNullGetArray(data.Reminders__c)
      }
    }

    callback(null, obj);
  });
};

SFDCService.prototype.setSettings = function(userId, settings, callback) {

  //console.log('In Set');

  var obj = {
    Id: settings.Id,
    apnId__c: isNull(settings.apnId),
    gcmId__c: isNull(settings.gcmId),
    examId__c: isNull(settings.examId),
    Organize_By__c: isNull(settings.organizeBy),
    Insirpation__c: isNull(settings.insirpation),
    Reminders__c: isNullSetArray(settings.reminders),
    Contact__c: userId
  }
    //console.dir(obj);
    this.sfdcConn.sobject("FRM_App_Setting__c").update(obj, function(err, ret) {
      if (err || !ret.success) {
        return console.error(err, ret);
      }
    //console.log('Updated Successfully : ' + ret.id);
    callback(null, ret);
  });
  };

  SFDCService.prototype.createSettings = function(userId, settings, callback) {

    var obj = {
      apnId__c: isNull(settings.apnId),
      gcmId__c: isNull(settings.gcmId),
      examId__c: isNull(settings.examId),
      Organize_By__c: isNull(settings.organizeBy),
      Insirpation__c: isNull(settings.insirpation),
      Reminders__c: isNullSetArray(settings.reminders),
      Contact__c: userId
    }

    this.sfdcConn.sobject("FRM_App_Setting__c").create(obj, function(err, ret) {
      if (err || !ret.success) {
        return console.error(err, ret);
      }
    //console.log('Create Successfully : ' + ret.id);
    callback(null, ret);
  });
  };
  SFDCService.prototype.getExams = function(contactId, callback) {

  // Load User
  // var exam = {
  //     name:"FRM Part 1",
  //     address:"2130 Fulton Street",
  //     city:"San Francisco",
  //     state:"CA",
  //     zip:"94117-1080",
  //     country:"USA",
  //     day:"November 11th, 2013",
  //     time:"7:00 am",
  //     duration:"2"
  // };

  var query = util.format("SELECT Id, Name, Member__C, Session__c, Section__c, Defered__c, Room__r.Id, Room__r.Venue__r.Id, Room__r.Venue__r.Institution_Name__c, Room__r.Venue__r.Building_Name__c, Room__r.Venue__r.Address1__c, Room__r.Venue__r.Address2__c, Room__r.Venue__r.City__c, Room__r.Venue__r.State__c, Room__r.Venue__r.Country__c, Room__r.Venue__r.Zipcode__c, Room__r.Venue__r.Venue_Code__c, Exam_Site__c, Exam_Site__r.Site__r.Id, Exam_Site__r.Site__r.Name, Exam_Site__r.Site__r.Display_Address__c, Exam_Site__r.Exam__r.Exam_Date__c, Exam_Site__r.Exam__r.Id FROM Exam_Attempt__c where Member__c =  '%s' and Exam_Date__c > TODAY and Cancelled__c = False order by Exam_Site__r.Exam__r.Exam_Date__c", contactId);

  _that = this;
  this.sfdcConn.query(query, function(err, res) {
    if (err) {
      callback(err, null);
    }

    if(res.records.length > 0) {

      var query1 = util.format("select Id, Name, Building_Name__c, Institution_Name__c, Address1__c, Address2__c, City__c, Country__c from Venue__c where Site__c = '%s'", res.records[0].Exam_Site__r.Site__r.Id);

      _that.sfdcConn.query(query1, function(err, res1) {
        if (err) {
          callback(err, null);
        }
        var response = res;
        response['venue'] = res1;

        
        callback(null, response);
      });

    } else {
      callback(null, res);
    }


  });
};


module.exports = SFDCService;