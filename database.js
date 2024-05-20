const mysql = require('mysql');

const mysqlConection = mysql.createConnection({
    host: '64.227.103.75',
    user: 'root',
    password: '$0p0rt3W',
    database: 'facelogin',
    multipleStatements: true
});

mysqlConection.connect(function(err){
    if( err ){
        console.log(err)
        return;
    } else { }
});

module.exports = mysqlConection;