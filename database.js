const mysql = require('mysql');

const mysqlConection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
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