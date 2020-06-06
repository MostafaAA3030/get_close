const express = require('express');
const cookie = require('cookie');
const { check, validationResult } = require('express-validator');

const db = require('./db');
const myJWT = require('./myjwt');

const router = express.Router();

router.get('/login', (req, res) => {
  res.send(`
<h1>Authentication JWT Practice</h1>
<h2>Login</h2>
<input type="hidden" id="token" name="token">
<input type="text" id="username" name="username" placeholder="Username">
<button onclick="logIn();return false;">submit</button>
<div id="demo" style="position:relative;width:100%;word-wrap: break-word;">
</div>
<script>
function logIn() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var response_result = JSON.parse(this.responseText);
      if(response_result.status != 'error') {
        window.location = 'http://localhost:5000/posts';
      } else {
        document.getElementById("demo").innerHTML = response_result.message;
      }
    }
  };
  
  var input_value = document.getElementById("username").value;
  const user_object = {
    username: input_value
  };
  const user = JSON.stringify(user_object);
  
  xhttp.open("POST", "http://localhost:5000/api/login", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(user);
}
</script>
  `);
});
router.post('/login', [
  check('username')
    .isLength({ min: 3 })
    .withMessage("Username must be longer than 2 characters.")
  ], (req, res) => {
  function RJO (status, message) {
    this.status = status;
    this.message = message;
  }
  const errorResult = validationResult(req);
  if(!errorResult.isEmpty()) {
    console.log(errorResult.errors);
    var error_message = "";
    for(var x=0; x<errorResult.errors.length; x++) {
      error_message += "- " + errorResult.errors[x].msg;
    }
    var error_object = new RJO('error', error_message);
    error_object = JSON.stringify(error_object);
    return res.send(error_object);
  }
  // Authenticate
  const username = req.body.username;
  const user = { name: username };

  db.selectAll("SELECT * FROM posts WHERE username = ?", [username])
    .then(result => {
      if(result != undefined) {
        var response_object = {
          status: 'OK',
          message: result
        };
        response_object = JSON.stringify(response_object);
        const user = { name: response_object.username };
        const accessToken = myJWT.makeAccessToken(user);
        var cookie1 = cookie.serialize('AJWT', accessToken, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        res.setHeader('Set-Cookie', cookie1);
        return res.send(response_object);
      } else {
        var error_object = new RJO('error', "Username is not correct.");
        error_object = JSON.stringify(error_object);
        return res.send(error_object);
      }
    })
    .catch(err => {
      console.log(err);
      return res.send(err);
    });
});
  /* make JWT accessToken and refreshToken 
  
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  
  var cookie2 = cookie.serialize('RJWT', refreshToken, {
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
  var twoCookies = cookie1 + ";" + cookie2; 
  */
//  res.send("twoCookies");
  /* Insert rtoken in database and response */
  /*
  makeConn()
    .then(function(conn) {
      var refTokenSql = "INSERT INTO tokens (ref_token) VALUES (?)";
      conn.query(refTokenSql,
      [refreshToken])
        .then(function(result) {
          console.log("Refresh Token inserted into database");
          console.log(result);
          conn.end();
          res.send('OK');
        })
        .catch(function(err) {
          conn.end();
          return res.send("Problem Inserting token inside the database.");
        })
    })
    .catch(function(err) {
      console.log("Not Connected to database.");
    });
    */


module.exports = router;
