const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const db = require('../lib/db');
const jwt = require('../lib/jwt');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register.ejs');
});

router.post('/register', [
  check('uname')
    .isAlpha()
    .withMessage("Name must be only made of letters.")
    .isLength({min: 3})
    .withMessage("Name must be more than 2 letters."),
  check('email')
    .isEmail()
    .withMessage("Email is invalid."),
  check('password')
    .isLength({min: 5})
    .withMessage("Password must be more than 4 characters.") 
], async (req, res) => {
  var vResult = validationResult(req);
  if(vResult.errors.length > 0) {
    var server_message = "";
    for(var x = 0; x < vResult.errors.length; x++) {
      server_message += "\u2718" + " " + vResult.errors[x].msg + " ";
    }
    var error_object = {
      status: 'error',
      res_sign: "\u2718",
      res_class: "error-span",
      message: server_message,
      demo_id: "server_demo"
    }
    //  console.log(vResult);
    //  console.log(error_object);
      error_object = JSON.stringify(error_object);
      return res.send(error_object);
  } else {
    const {uname, email, password} = req.body;
    var hashPass = await bcrypt.hash(password, 10);
    
    var select_sql = "SELECT email FROM users WHERE email = ?";
    db.reads(select_sql, [email])
      .then(result => {
        if(result.length > 0) {
          var err_obj = {
            status: 'error',
            res_sign: "\u2718",
            res_class: "error-span",
            message: "This email is already taken by another user.",
            demo_id: "server_demo"
          };
          JSON.stringify(err_obj);
          return res.send(err_obj);  
        } else {
          var save_sql = "INSERT INTO users (email, password) " +
            " VALUES (?, ?)";
          db.writes(save_sql, [
            email,
            hashPass
          ])
          .then(function(result) {
          //  console.log(result);
            var res_obj = {
              status: 'OK',
              res_sign: "\u2714",
              res_class: "ok-span",
              message: "OK",
              demo_id: "server_demo"
            }
            res_obj = JSON.stringify(res_obj);
            return res.send(res_obj);
          })
          .catch(err => {
            console.log(err);
          });
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
});

router.post('/register-email',  [
  check('email')
    .isEmail()
    .withMessage("Invalid email address.")
  ], (req, res) => {
    const vResult = validationResult(req);
    if(vResult.errors.length > 0) {
      var error_object = {
        status: 'error',
        message: vResult.errors[0].msg
      }
      error_object = JSON.stringify(error_object);
      return res.send(error_object);
    }
    var email = req.body.email;
    var select_sql = "SELECT email From users WHERE email = ?";
    db.reads(select_sql, [email])
      .then(result => {
        if(result.length > 0) {
          var note_obj = {
            status: 'error',
            message: "This email is taken by another user."
          }
          note_obj = JSON.stringify(note_obj);
          return res.send(note_obj);  
        } else {
          var note_obj = {
            status: 'OK',
            message: "\u2714"
          }
          note_obj = JSON.stringify(note_obj);
          return res.send(note_obj);
        }
      })
      .catch(err => {
        var error_object = {
          status: 'error',
          message: "Server error while try to connect to database."
        }
        error_object = JSON.stringify(error_object);
        return res.send(error_object);
      });
});

router.get('/login', (req, res) => {
console.log(req.cookies)
  res.render('login.ejs');
});

router.post('/login', (req, res) => { // async , this was not necessary ...
  const { email, password } = req.body;
  db.reads("SELECT * FROM users WHERE email = ?", [email])
  .then(result => {
    if(result.length > 0) {
    console.log(result[0].password);
      bcrypt.compare(password, result[0].password)
      .then(function(compare_result) {
        if(compare_result == true) {
          const user = { 
            name: result[0].name,
            email: result[0].email
          };
          const accessToken = jwt.generateAccessToken(user);
          const refreshToken = jwt.generateRefreshToken(user);
          db.writes("INSERT INTO tokens (ref_token) VALUES (?)", 
          [refreshToken])
          .then(result => {
            var acLifeTime = 10 * 60 * 1000;
            res.cookie('AJWT', accessToken, {
              maxAge: acLifeTime,
              httpOnly: true
            });
            var rcLifeTime = 24 * 60 * 60 * 1000;
            res.cookie('RJWT', refreshToken, {
              maxAge: rcLifeTime,
              path: '/users',
              httpOnly: true,
              sameSite: 'strict'
            });
            var res_obj = {
              status: 'OK',
              RToken: refreshToken
            }
            return res.send(res_obj);  
          })
          .catch(err => {
            console.log(err);
          })
        } else {
          /* if password is not right */
          var reject_obj = {
            status: 'error',
            res_sign: "\u2718",
            res_class: "error-span",
            message: "Email/Password is incorrect.",
            demo_id: "server_demo"
          };
          reject_obj = JSON.stringify(reject_obj);
          return res.send(reject_obj);  
        }
      })
      .catch(err => {
        console.log(err);
      })      
    } else {
      /* if the email is not right */
      var reject_obj = {
            status: 'error',
            res_sign: "\u2718",
            res_class: "error-span",
            message: "Email/Password is incorrect.",
            demo_id: "server_demo"
          };
      reject_obj = JSON.stringify(reject_obj);
      return res.send(reject_obj);
    }
  })
  .catch(err => {
    console.log(err);
  })
});

router.get('/checktoken', (req, res) => {
  console.log("authServer - GET - /checktoken");
  console.log("req cookies: ");
  console.log(req.cookies);
  
  var cookies = req.cookies;
  
  if(cookies.AJWT == undefined && cookies.RJWT == undefined) {
    console.log("There is neither AJWT nor RJWT");
  
    return res.redirect('http://localhost:5000/users/login');
  } else if(cookies.AJWT == undefined && cookies.RJWT != undefined){
    console.log("There is not AJWT, but RJWT");
    
    const refreshToken = cookies.RJWT;
    db.reads("SELECT ref_token From tokens WHERE ref_token = ?", [
      refreshToken
    ])
    .then(function(result) {
      console.log(result[0]);
      if(result[0]) {
        console.log("refresh token found in database:");
        console.log(result[0].ref_token);
        jwt.verifyRefreshToken(refreshToken, function (err, user) {
          if(err) return res.sendStatus(403);
          console.log("verified refreshtoken result, user:");
          console.log(user);
          
          var user_obj = {
            name: user.name,
            email: user.email
          }
          
          var accessToken = jwt.generateAccessToken(user_obj);
          console.log("NEW ACCESS TOKEN: ");
          console.log(accessToken);
          var acLifeTime = 10 * 60 * 1000;
          res.cookie('AJWT', accessToken, {
                maxAge: acLifeTime,
                httpOnly: true
              });
          var res_obj = {
            status: 'OK'
          };
          res_obj = JSON.stringify(res_obj);
          return res.redirect('http://localhost:4000/');
        })
      } else {
        var res_obj = {
          status: 'error'
        };
        res_obj = JSON.stringify(res_obj);
        res.send(res_obj);
      }
    })
    .catch(function(err) {
      console.log(err);
      res.sendStatus(403);
    })
  }  
});

module.exports = router;
