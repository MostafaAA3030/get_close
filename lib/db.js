require('dotenv').config();
const mariadb = require('mariadb');

function makeConn() {
  return new Promise(function(resolve, reject) {
    mariadb.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    })
      .then(function(conn) {
        resolve(conn);
      })
      .catch(function(err) {
        console.log(err);
        reject(err);
      });
  });
}

exports.selectAll = function (sql, paramsArray) {
  return new Promise(function (resolve, reject) {
    makeConn()
      .then(conn => {
        conn.query(sql, paramsArray)
          .then(result => {
            conn.end();
            return resolve(result);
          })
          .catch(err => {
            conn.end();
            return reject(err);
          })
      })
  });
}

exports.insertOne = function (sql, paramsArray) {
  return new Promise(function (resolve, reject) {
    makeConn()
      .then(conn => {
        conn.query(sql, paramsArray)
         .then(result => {
            conn.end();
            return resolve(result);
         })
         .catch(err => {
           console.log(err)
           return reject(err);
         })
      })
      .catch(err => {
        return reject(err);
      })
  });
}
