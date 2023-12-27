var mysql = require('mysql');

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'bj-cdb-q9cj6xtw.sql.tencentcdb.com',
    port            : '61081',
    user            : 'root',
    password        : '1qaz@WSX3edc',
    database        : 'panda'
});

const query = function(sql){
    return new Promise((resolve,reject) => {
        pool.getConnection(function(err,connection){
            if(err)
                reject(err)
            else {
                connection.query(sql,(err,results) => {
                    if(err) 
                        reject(err)
                    else
                        resolve(results)
                    connection.release()
                })
            }
        })
    })
}

module.exports = query