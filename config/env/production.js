'use strict';

module.exports = {
    port: 80,
    microsites: '../public/www',
    rootURL: 'http://www.garp.org',
    //db: 'mongodb://garpdev:mongolab2013AG@ds033639.mongolab.com:33639/garpdev',
    db: null,    
    cache: true,
    riskFolderId: 'a1h40000001iuh8',    
    sfdc: {
        portalUrl: 'https://my.garp.org',
        loginUrl : 'https://login.salesforce.com',
        userName: 'integrations@garp.com',
        password: '23def!ew%qw'
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
