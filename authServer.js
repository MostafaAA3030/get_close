require('dotenv').config();

const express = require('express');
const { check, validationResult } = require('express-validator');
const cookie = require('cookie');
const cookieParser = require('cookie-parser'); // cookieParser
const jwt = require('jsonwebtoken');
const mariadb = require('mariadb');
const fetch = require('node-fetch'); // I don't remember this ...

const accountRouter = require('./routes/account.js');
const usersRouter = require('./routes/login.js');

const app = express();

/* view engine */
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'))

/* middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // cookieParser make req.cookies

/* routes */
app.use('/users', usersRouter);
app.use('/account', accountRouter);

app.get('/clearc', (req, res) => {
  res.clearCookie('AJWT');
  res.end('cookie deleted');
});

app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  if(refreshToken == null) {
    return res.sendStatus(401);
  }
  console.log("refreshtoken sent to server: ");
  console.log(refreshToken);
  makeConn()
    .then(function(conn) {
      var sql = "SELECT ref_token From tokens WHERE ref_token = ?";
      conn.query(sql,
      [refreshToken])
        .then(function(result) {
          console.log("refresh token found in database:");
          console.log(result[0]);
          jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
          function(err, user) {
            if(err) return res.sendStatus(403);
            console.log("POST /token - verify result, user:");
            console.log(user);
//            var user_obj = {name : user.name};
            const accessToken = jwt.sign(user, 
            process.env.ACCESS_TOKEN_SECRET);
            conn.end();
            res.json({ accessToken: accessToken})
          })
        })
        .catch(function(err) {
          console.log(err);
          conn.end();
          res.sendStatus(403);
        })
    })
    .catch(function(err) {
      console.log("Not connected.");
      console.log(err);
    });
});
/*
app.post('/logout', function (req, res) {
  makeConn()
    .then(function(conn) {
      conn.query("DELETE FROM tokens WHERE ref_token = ?",
      [req.body.token])
        .then(function (result) {
          console.log(result)
          conn.end();
          res.send("DELETED FROM DATABASE");
        })
        .catch(function (err) {
          console.log(err);
          conn.end();
        })
    })
    .catch(function(err) {
      console.log(err);
    })  
});
*/

app.listen(5000, () => {
  console.log("Listening on PORT 5000");
});
