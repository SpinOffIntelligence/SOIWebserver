'use strict';

module.exports = {
    port: 8080,
    microsites: '../../microsites',
    rootURL: 'http://localhost',
    //db: 'mongodb://garpdev:mongolab2013AG@ds033639.mongolab.com:33639/garpdev',
    db: null,
    cache: false,
    riskFolderId: 'a1h40000001iuh8',
    loglevel: 'trace',
    dbname: 'demo1',
    sfdc: {
        portalUrl: 'https://preprod-mygarp.cs28.force.com',
        loginUrl : 'https://test.salesforce.com',
        userName: 'integrations@garp.com.preprod',
        password: '23def!ew%qw'
    },
    app: {
        name: 'GARP'
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
