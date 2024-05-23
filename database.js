const mysql = require('mysql');

const mysqlConection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'S0p0rt3S0p0rt3',
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