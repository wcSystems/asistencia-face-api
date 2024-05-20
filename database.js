const mysql = require('mysql');

const mysqlConection = mysql.createConnection({
    host: '10.124.0.3',
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