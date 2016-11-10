'use strict';

module.exports = function(app, passport, logger) {

	var sfdc = require('../controllers/sfdc');

  app.get('/sfdc/autoQA/:email', sfdc.getSFDCautoQA);

  // app.get('/sfdc/contentanalytics/:id', sfdc.getSFDCcontentAnalytics);

  app.get('/sfdc/events/:eventId', sfdc.getSFDCEvent);
  app.get('/sfdc/events/:eventId/rates', sfdc.getSFDCEventRates);
  app.get('/sfdc/events/:eventId/sponsors', sfdc.getSFDCEventSponsors);
  app.get('/sfdc/events/:eventId/sessions', sfdc.getSFDCEventSessions);
  app.get('/sfdc/events/:eventId/speakers', sfdc.getSFDCEventSpeakers);
  app.get('/sfdc/events/:eventId/contacts', sfdc.getSFDCEventContacts);
  app.get('/sfdc/events/content/:folderName', sfdc.getSFDCEventContent);
  app.post('/sfdc/events/contactus', sfdc.sendContactUsEmail);


  app.post('/sfdc/icbrr/ead', sfdc.getSFDCICBRRead);
  app.post('/sfdc/icbrr/cdd', sfdc.getSFDCICBRRcdd);
  app.post('/sfdc/icbrr/status/:garpId/:procType/:status/:examDate/:result/:score', sfdc.setSFDCICBRRstatus);

  app.get('/sfdc/content/riskpagearticlesbycolumn/:column/:offset/:numberofarticles', sfdc.getSFDCRiskArticlesByColumn);
  app.get('/sfdc/content/columns/:offset/:numberofarticles', sfdc.getSFDCColumns);

  app.get('/sfdc/orders/products', sfdc.getSFDCProducts);
  app.get('/sfdc/orders/transactions/:startDate', sfdc.getSFDCTransactions);
  app.get('/sfdc/orders/opplines/:startDate', sfdc.getSFDCOppLineItems);

  app.get('/sfdc/candidates/certified/:startDate/:endDate', sfdc.getCertifiedCandidates);
  app.get('/sfdc/candidates/certified/:exam/:startDate/:endDate', sfdc.getCertifiedCandidatesByExam);
  app.get('/sfdc/candidates/passed/:exam/:examDate', sfdc.getPassedCandidatesByExam);

  app.get('/sfdc/membership/offers', sfdc.getMembershipOfferByOfferId);

	app.get('/sfdc/chapters', sfdc.getSFDCChapters);
  app.get('/sfdc/chapters/meetings', sfdc.getSFDCChapterMeetings);
  app.get('/sfdc/chapters/presentations', sfdc.getSFDCChapterPresentations);

  app.get('/sfdc/studyTopics/:exam/:year', sfdc.getSFDCStudyTopics);
  app.get('/sfdc/content/studyproducts/:mode', sfdc.getSFDCStudyProducts);

  app.get('/sfdc/content/webcasts', sfdc.getSFDCWebcasts);
  app.get('/sfdc/content/featuredcontent/:type', sfdc.getSFDCFeaturedContent);

  app.get('/sfdc/content/ads', sfdc.getSFDCContentAds);

  app.get('/sfdc/content/riskpagearticles', sfdc.getSFDCRiskFeaturedArticles);
  app.get('/sfdc/content/riskmanagers', sfdc.getSFDCRiskManagerOfTheYear);

  app.get('/sfdc/content/riskpagearticlesbycategory/:category/:offset/:numberofarticles', sfdc.getSFDCRiskArticlesByCategory);

  app.get('/sfdc/content/quantcorner/:offset/:numberofarticles', sfdc.getSFDCQuantCorner);
  app.get('/sfdc/content/frmcorner/:offset/:numberofarticles', sfdc.getSFDCFRMCorner);


  app.get('/sfdc/content/risktrendingarticles/:category', sfdc.getSFDCRiskTrendingArticles);
  app.get('/sfdc/content/riskarticlesbyviews/:category', sfdc.getSFDCRiskArticlesByViewCount);
  app.get('/sfdc/content/riskarticlesbyshare/:category', sfdc.getSFDCRiskArticlesByShareCount);

  app.get('/sfdc/content/videos', sfdc.getSFDCVideos);
  app.get('/sfdc/content/video/:id', sfdc.getSFDCVideo);
  app.get('/sfdc/content/videos/:id', sfdc.getSFDCVideoCat);

  //app.get('/sfdc/content/doc/:id/:userId', sfdc.getSFDCContentDoc);
  app.get('/sfdc/content/doc/:id', sfdc.getSFDCContentDoc);
  app.get('/sfdc/content/relatedcontent/:id', sfdc.getSFDCRelatedContent);

  app.get('/sfdc/content/recordTypes', sfdc.getSFDCRecordTypes);
  app.post('/sfdc/content', sfdc.getSFDCContent);

  app.post('/sfdc/content/category', sfdc.getSFDCContentByCategory);
  app.post('/sfdc/content/subcategory', sfdc.getSFDCContentBySubcategory);

  app.post('/sfdc/emailsubscriptionmanagement', sfdc.getSFDCEmailSubscription);

  app.get('/sfdc/content/clearCache', sfdc.getSFDCContentClearCache);
  app.get('/sfdc/content/clearCacheItem/:key', sfdc.getSFDCContentClearCacheItem);

  app.post('/sfdc/content/sitemap', sfdc.getSFDCContentSiteMap);

  app.get('/sfdc/content/webcast/:id/webcal', sfdc.getSFDCWebcastWebCal);
  app.get('/sfdc/content/webcast/:id/ical', sfdc.getSFDCWebcastICal);

  app.get('/sfdc/chapters/meetings/:id/ical', sfdc.getSFDCChapterMeetingICal);
  app.get('/sfdc/chapters/meetings/:id/webcal', sfdc.getSFDCChapterMeetingWebCal);

  app.get('/sfdc/academicPartners', sfdc.getSFDCAcademicPartners);
  app.get('/sfdc/cpd/providers', sfdc.getSFDCCPDProviders);
  app.get('/sfdc/cpd/activities', sfdc.getSFDCCPDActivities);

  app.get('/sfdc/exam/sites', sfdc.getActiveExamSites);

  app.get('/sfdc/exam/fees', sfdc.getSFDCExamFees);

  app.get('/sfdc/examVenues/:examDate', sfdc.getExamVenues);

  app.get('/sfdc/exam/alerts', sfdc.getAllExamAlerts);
  app.get('/sfdc/exam/:id/alerts', sfdc.getExamAlertsByExamSiteId);

  app.get('/sfdc/reports/:id', sfdc.getSFDCReportsData);

  app.get('/sfdc/smartPros/:type/:req', sfdc.getSmartProsResponse);

  app.get('/sfdc/jobTarget/jobs', sfdc.getjobTargetJobs);

  app.get('/sfdc/epp', sfdc.getSFDCExamPrepProviders);

  app.get('/sfdc/testimonial/:examType', sfdc.getSFDCTestimonial);

  app.get('/sfdc/faq/:category', sfdc.getSFDCfaq);

//  app.get('/sfdc/examFaq/:examCategory', sfdc.getSFDCExamFaq);
};
