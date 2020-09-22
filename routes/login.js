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
            console.log(result.insertId);
            var save2 = "INSERT INTO contacts (contact_id) VALUES (?)";
            db.writes(save2, [result.insertId])
            .then(function(result2) {
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
            .catch(function (err) {
              console.log(err);
            });
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
  console.log("get - /login - cookies in req: ");
  console.log(req.cookies);
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
            user_id: result[0].user_id,
            email: result[0].email
          };
          const accessToken = jwt.generateAccessToken(user);
          const refreshToken = jwt.generateRefreshToken(user);
          db.writes("INSERT INTO tokens (ref_token) VALUES (?)",
          [refreshToken])
          .then(result => {
            var acLifeTime = 60 * 1000;
            res.cookie('AJWT', accessToken, {
              maxAge: acLifeTime,
              httpOnly: true
            });
            var rcLifeTime = 5 * 60 * 1000;
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
          /* if password is not correct */
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
      /* if the email does not exists in database */
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
  console.log("authServer: GET - users/checktoken");
  
  var cookies = req.cookies;

  console.log("req cookies: ");
  console.log(cookies);
  
  if(cookies.AJWT != undefined) {
    /*
    There is AJWT COOKIE
    so go check its validation
    */
    var access_token = cookies.AJWT;
    jwt.verifyAccessToken(access_token, function(err, user) {
      if(err) {
        console.log(err);
        /*
        There is a problem in access Token
        if the problem is because of expiration
        give new one if RJWT is OK
        if not go to login
        */
        console.log("There is an error in access token sent in cookie");
        if(err.name ='TokenExpiredError') {
          console.log("access token is expired");
          if(cookies.RJWT != undefined) {
          /*
          Access token is expired
          refresh token Cookie exists
          go check
          */
            var refresh_token = cookies.RJWT;
            jwt.verifyRefreshToken(refresh_token, function(err, user) {
              if(err) {
                /*
                refresh token does not work
                */
                return res.redirect('http://localhost:5000/users/login');
              }
              db.reads("SELECT ref_token From tokens WHERE ref_token = ?", [
                refreshToken
              ])
              .then(function(result) {
                console.log(result[0]);
                if(result[0]) {
                  console.log("refresh token found in database:");
                  console.log(result[0].ref_token);
                    
                  var user_obj = {
                    user_id: user.user_id,
                    email: user.email
                  }
                
                  var accessToken = jwt.generateAccessToken(user_obj);
                  console.log("NEW ACCESS TOKEN: ");
                  console.log(accessToken);
                  var acLifeTime = 60 * 1000;
                  res.cookie('AJWT', accessToken, {
                    maxAge: acLifeTime,
                    httpOnly: true
                  });
                
                  var newRefreshToken = jwt.generateRefreshToken(user_obj);
                  db.writes("UPDATE tokens SET ref_token = ? WHERE ref_token = ?", [
                    newRefreshToken,
                    refreshToken
                  ])
                  .then(function(result2) {
                    var rcLifeTime = 5 * 60 * 1000;
                    res.cookie('RJWT', newRefreshToken, {
                      maxAge: rcLifeTime,
                      path: '/users',
                      httpOnly: true,
                      sameSite: 'strict'
                    });
              
                    return res.redirect('http://localhost:4000/counter');
                  })
                  .catch(function(err) {
                    console.log(err);
                  });
                } else {
                  return res.redirect('http://localhost:5000/users/login');
                }
              }) //
              .catch(function(err) {
                console.log(err);
              });
            }); // 2
          } else {
            return res.redirect('http://localhost:5000/users/login');
          }
        } else {
          return res.send("Forbidden Page / not authorized");
        }
      } // 3
    });
  } else {
  /*
    Here we don't have AJWT COOKIE
    so we check to see if the RJWT exists
    because if lives longer
  */
    if(cookies.RJWT != undefined) {
      var refresh_token = cookies.RJWT;
      
      jwt.verifyRefreshToken(refresh_token, function (err, user) {
        if(err) {
          /*
          There is a problem with refresh token or expired
          */
          console.log("Error in refresh token validity");
          console.log(err);
        }
        /*
        There is no problem with RJWT
        so we check to see if it is in database
        */
        db.reads("SELECT ref_token From tokens WHERE ref_token = ?", [
          refresh_token
        ])
        .then(function(result) {
          console.log(result[0]);
          if(result[0]) {
            /*
            Refresh Token is in database
            */
            console.log("refresh token found in database:");
            console.log(result[0].ref_token);
            
            var user_obj = {
              user_id: user.user_id,
              email: user.email
            }
            
            var newAccessToken = jwt.generateAccessToken(user_obj);
            console.log("NEW ACCESS TOKEN: ");
            console.log(newAccessToken);
            var acLifeTime = 60 * 1000;
            res.cookie('AJWT', newAccessToken, {
              maxAge: acLifeTime,
              httpOnly: true
            });
            
            var newRefreshToken = jwt.generateRefreshToken(user_obj);
            db.writes("UPDATE tokens SET ref_token = ? WHERE ref_token = ?", [
              newRefreshToken,
              refresh_token
            ])
            .then(function(result2) {
              var rcLifeTime = 2 * 60 * 1000;
              res.cookie('RJWT', newRefreshToken, {
                maxAge: rcLifeTime,
                path: '/users',
                httpOnly: true,
                sameSite: 'strict'
              });
              return res.redirect('http://localhost:4000/counter');
            })
            .catch(function(err) {
              return console.log(err);
            });
            
          } else {
          /*
          Refresh Token is not in database
          */
            res.redirect('http://localhost:5000/users/login');
          }
        })
        .catch(function (err) {
          return console.log(err);
        })
      });
    } else {
      /*
      Here we don't have AJWT nor RJWT
      so redirect to login page
      */
      return res.redirect('http://localhost:5000/users/login');
    }
  } 
});

function goCheckRefToken (refresh_token, callback) {
  db.reads("SELECT ref_token From tokens WHERE ref_token = ?", [
    refresh_token
  ])
  .then(function(result) {
    console.log(result[0]);
    if(result[0]) {
      callback(null, result[0]);
    } else {
      callback("The ref Token does not exist...", false);
    }
  })
  .catch(function(err) {
    console.log(err);
    res.sendStatus(403);
  })
}
function setNewTokens (result, user, res) {
  console.log("refresh token found in database:");
  console.log(result.ref_token);
  var user_obj = {
    user_id: user.user_id,
    email: user.email
  }
        
  var accessToken = jwt.generateAccessToken(user_obj);
  console.log("NEW ACCESS TOKEN: ");
  console.log(accessToken);
  var acLifeTime = 60 * 1000;
  res.cookie('AJWT', accessToken, {
    maxAge: acLifeTime,
    httpOnly: true
  });
        
  var newRefreshToken = jwt.generateRefreshToken(user_obj);
  db.writes("UPDATE tokens SET ref_token = ? WHERE ref_token = ?", [
    newRefreshToken,
    refreshToken
  ])
  .then(function(result2) {
    var rcLifeTime = 2 * 60 * 60 * 1000;
    res.cookie('RJWT', newRefreshToken, {
      maxAge: rcLifeTime,
      path: '/users',
      httpOnly: true,
      sameSite: 'strict'
    });
    
    return res.redirect('http://localhost:4000/counter');
  })
  .catch(function(err) {
    console.log(err);
  });
}
function setTokens (token_data) {
  var newAccessToken = jwt.generateAccessToken(token_data);
  var newRefreshToken = jwt.generateRefreshToken(token_data);
}
function setTokenCookies (access_token, refresh_token) {
  var acLifeTime = 60 * 1000;
  res.cookie('AJWT', access_token, {
    maxAge: acLifeTime,
    httpOnly: true
  });
  var rcLifeTime = 2 * 60 * 60 * 1000;
  res.cookie('RJWT', newRefreshToken, {
    maxAge: rcLifeTime,
    path: '/users',
    httpOnly: true,
    sameSite: 'strict'
  });
}
function updateRefreshToken (new_ref_token, ref_token) {
  db.writes("UPDATE tokens SET ref_token = ? WHERE ref_token = ?", [
    new_ref_token,
    ref_token
  ])
  .then(function(result) {
    return res.redirect('http://localhost:4000/counter');
  })
  .catch(function(err) {
    console.log(err);
  });
}
function redirectTo (req, res, next) {
  res.redirect(address);
}
module.exports = router;
