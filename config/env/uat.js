'use strict';

module.exports = {
    port: 80,
    microsites: '../public/www',
    rootURL: 'http://uat.garp.org',
    //db: 'mongodb://garpdev:mongolab2013AG@ds033639.mongolab.com:33639/garpdev',
    db: null,    
    cache: false,
    riskFolderId: 'a1ke0000000bhVI',    
    sfdc: {
        loginUrl : 'https://test.salesforce.com',
        userName: 'alberto.garcia@garp.com.uat',
        password: 'sfdc2013AG'
    },
    app: {
        name: 'MEAN - A Modern Stack - Development'
    },
    facebook: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
    },
    twitter: {
        clientID: 'CONSUMER_KEY',
        clientSecret: 'CONSUMER_SECRET',
        callbackURL: 'http://localhost:3000/auth/twitter/callback'
    },
    github: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/github/callback'
    },
    google: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    linkedin: {
        clientID: 'API_KEY',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://localhost:3000/auth/linkedin/callback'
    }
};
