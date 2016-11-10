// EVENTS

var EVENTID = 'a2h40000004vhe8';  // GRIT
var EVENTID1 = 'a2h400000050TUr';  // Convention


var frisby = require('frisby');
frisby.create('Get GARP Event')
  .get('http://localhost:8080/sfdc/events/' + EVENTID)
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();


frisby.create('Get GARP Event Rates')
  .get('http://localhost:8080/sfdc/events/' + EVENTID + '/rates')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Event sponsors')
  .get('http://localhost:8080/sfdc/events/' + EVENTID1 + '/sponsors')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Event sessions')
  .get('http://localhost:8080/sfdc/events/' + EVENTID1 + '/sessions')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('sessions',{
    records: Array
  })
  .expectJSONTypes('sessions.records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Event speakers')
  .get('http://localhost:8080/sfdc/events/' + EVENTID1 + '/speakers')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('speakers',{
    records: Array
  })
  .expectJSONTypes('speakers.records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Event contacts')
  .get('http://localhost:8080/sfdc/events/' + EVENTID1 + '/contacts')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();


// PRODUCTS

frisby.create('Get GARP products')
  .get('http://localhost:8080/sfdc/orders/products')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP products')
  .get('http://localhost:8080/sfdc/content/studyproducts/FRM')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Product2: {
      Id: String,
      Name: String      
    }
  })
.toss();

// Candidiates

// frisby.create('Get GARP Certified Candidiates')
//   .get('http://localhost:8080/sfdc/candidates/certified/frm/2015-06-23/2015-09-21')
//   .expectStatus(200)
//   .expectHeaderContains('content-type', 'application/json')
//   .expectJSONTypes({
//     records: Array
//   })
//   .expectJSONTypes('records.?',{
//     Id: String,
//     Name: String
//   })
// .toss();

// frisby.create('Get GARP Passed Exam Candidiates')
//   .get('http://localhost:8080/sfdc/candidates/passed/frm1/2016-05-21')
//   .expectStatus(200)
//   .expectHeaderContains('content-type', 'application/json')
//   .expectJSONTypes({
//     records: Array
//   })
//   .expectJSONTypes('records.?',{
//     Id: String,
//     Name: String
//   })
// .toss();

// Chapters

frisby.create('Get GARP chapters')
  .get('http://localhost:8080/sfdc/chapters')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP chapter meetings')
  .get('http://localhost:8080/sfdc/chapters/meetings')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP chapters presentations')
  .get('http://localhost:8080/sfdc/chapters/presentations')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('?',{
    Name: String,
    Chapter: String
  })
.toss();


// Study Topics

frisby.create('Get GARP Study Topics')
  .get('http://localhost:8080/sfdc/studyTopics/FRM%20Exam%20Part%20I/2016')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

// Content
frisby.create('Get GARP Content Ads')
  .get('http://localhost:8080/sfdc/content/ads')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content recordTypes')
  .get('http://localhost:8080/sfdc/content/recordTypes')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content quantcorner')
  .get('http://localhost:8080/sfdc/content/quantcorner/0/10')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content frmcorner')
  .get('http://localhost:8080/sfdc/content/frmcorner/0/10')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content riskpagearticlesbycategory technology')
  .get('http://localhost:8080/sfdc/content/riskpagearticlesbycategory/technology/0/5')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content riskarticlesbyviews technology')
  .get('http://localhost:8080/sfdc/content/riskarticlesbyviews/technology')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content risktrendingarticles technology')
  .get('http://localhost:8080/sfdc/content/risktrendingarticles/technology')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content All News')
  .post('http://localhost:8080/sfdc/content', {
    folder:null,contentTypes:["News"],topics:["all"],recordTypes:["all"]
  })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content technology')
  .post('http://localhost:8080/sfdc/content/category', {
    category:"technology",offset:"0",limit:"5"
  })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content Subcategory cyber security')
  .post('http://localhost:8080/sfdc/content/subcategory', {
    subcategory:"cyber security",offset:"0",limit:"5"
  })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  }).after(function(err, res, body) {
      var obj = JSON.parse(body);
      frisby.create('Second test, run after first is completed')
        .get('http://localhost:8080/sfdc/content/doc/' + obj.records[0].Id)
        .toss()
    })
.toss();

frisby.create('Get GARP Content videos')
  .get('http://localhost:8080/sfdc/content/videos')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('?',{
    id: Number,
    name: String
  }).after(function(err, res, body) {
      var obj = JSON.parse(body);
      frisby.create('Second test, run after first is completed')
      .get('http://localhost:8080/sfdc/content/videos/' + obj[0].id)
      .toss()
    })
.toss();

// Other
frisby.create('Get GARP Content academic Partners')
  .get('http://localhost:8080/sfdc/academicPartners')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP cpd providers')
  .get('http://localhost:8080/sfdc/cpd/providers')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP exam sites')
  .get('http://localhost:8080/sfdc/exam/sites')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content academicPartners')
  .get('http://localhost:8080/sfdc/exam/sites')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP Content exam fees')
  .get('http://localhost:8080/sfdc/exam/fees')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('examGroupDetails',{
    Id: String,
    Exam_Date__c: String
  })
  .expectJSONTypes('frm.early',{
    price: Number,
    lastDate: String
  })
.toss();

frisby.create('Get GARP Content exam Venues')
  .get('http://localhost:8080/sfdc/examVenues/2016-11-19')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    records: Array
  })
  .expectJSONTypes('records.?',{
    Id: String,
    Name: String
  })
.toss();

frisby.create('Get GARP jobs')
  .get('http://localhost:8080/sfdc/jobTarget/jobs')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes({
    jobs: Array
  })
  .expectJSONTypes('jobs.?',{
    name: String,
    location: String
  })
.toss();





