require('dotenv').config();

const express = require('express');
const { check, validationResult } = require('express-validator');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mariadb = require('mariadb');
const fetch = require('node-fetch');

const accountRouter = require('./routes/account.js');
const usersRouter = require('./routes/login.js');

const app = express();

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
/* view engine */
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'))

/* middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* routes */
app.use('/users', usersRouter);
app.use('/account', accountRouter);

function authenticateToken (req, res, next) {
  console.log("From: authenticateToken middleware: ");
  const authHeader = req.headers['authorization'];
  const hToken = authHeader && authHeader.split(' ')[1];
  
  console.log("Header Token:");
  console.log(hToken);

  if(!hToken) {
    // Parse the cookies on the request
    var cookies = cookie.parse(req.headers.cookie || ''); 
    // Get the visitor name set in the cookie
    var token = cookies.AJWT;
    
    console.log("Cookie token:");
    console.log(token);
  } else {
    var token = hToken;
  }
  if(token == null) return res.send("Forbidden Page.");
    
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) {
      console.log(err);
      return res.send("Forbidden");
    }
    console.log("User in authenticateToken middleware: ");
    console.log(user);
    req.user = user
    next();
  })
}

app.get('/clearc', (req, res) => {
  res.clearCookie('AJWT');
  res.end('cookie deleted');
});

/* Routes */
app.get('/home', authenticateToken, (req, res) => {
  console.log("GET - /home - Request received: ");
  console.log(req.headers);
  console.log("req.user in /home");
  console.log(req.user);
  console.log("req.cookies in /home");
  console.log(req.cookies);
  var AJWT = req.cookies.AJWT;
  res.send(`
<!DOCTYPE html>
<html>
<body>
  <h1>JWT Project</h1>
  <h2>Home page</h2>
  <h3>Bank Account</h3>
  <input type="hidden" id="token" name="token" value="${ AJWT }">
  <button onclick="getUserData();return false;">GO TO BANK ACCOUNT</button>
  <div id="demo2"></div>
  <script>
function getUserData() {
  window.location = 'http://localhost:4000/posts';
}
  </script>
</body>
</html>  
  `);
});
// AJWT:${AJWT}@
/*
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var response_result = this.responseText;
      if(responseText == 'OK') {
        window.location('http://localhost:4000/posts');
      } else {
        document.getElementById("demo2").innerHTML = this.responseText;       
      }
    }
  }
  var token = document.getElementById("token").value;
  
  xhttp.open('POST', 'http://localhost:4000/login', true);
  xhttp.setRequestHeader('Access-Control-Allow-Origin', 
    '*');
  xhttp.setRequestHeader("Authorization", "Bearer " + token);
  xhttp.send();*/

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s'}); 
}

app.post('/login', [
  check('username')
    .isLength({ min: 3 })
    .withMessage("Username must be longer than 2 characters.")
  ], (req, res) => {
  console.log('POST /login http Request received...');
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors.errors);
    var error_message = "";
    for(var x=0; x<errors.errors.length; x++) {
      error_message += "- " + errors.errors[x].msg;
    }
    return res.send(error_message);
  }
  // Authenticate
  
  const username = req.body.username; 
  const user = { name: username };

  /* make JWT accessToken and refreshToken */
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  res.setHeader('Set-Cookie', cookie.serialize('AJWT', accessToken, {
    maxAge: 60 * 60 * 24 * 7 // 1 week
  }));
  /* Insert rtoken in database and response */
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
});

/* This route sends JSON POST */
app.get('/login', (req, res) => {
  console.log("GET /login http Request received...");
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>JWT Project</title>
</head>
<body>
  <h1>Authentication JWT Practice</h1>
  <h2>Login</h2>
  <p>Login input returns 'jwt' token</p>
  <input type="text" id="username" name="username" placeholder="Username">
  <button onclick="getBackToken();return false;">submit</button>
  <div id="demo" style="position:relative;width:100%;word-wrap: break-word;">
  </div>
  
  <h2>Make A New Token By Refresh Token</h2>
  <p>Use your refresh token to make a new token</p>
  <input type="text" id="r_token" name="rtoken" placeholder="Refresh Token">
  <button onclick="getRefreshToken();return false;">submit</button>
  <div id="demo3"></div>
  
  <h2>delete Refresh token from database</h2>
  <p>Use your refresh token to delete</p>
  <input type="text" id="rt_del" name="rt_del" 
  placeholder="Delete Refresh Token">
  <button onclick="deleteRefreshToken();return false;">submit</button>
  <div id="demo4"></div>
  
  <script>
function getBackToken() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var response_result = this.responseText;
      if(response_result === 'OK') {
        window.location = 'http://localhost:5000/posts';
      } else {
      document.getElementById("demo").innerHTML = response_result;
      }
    }
  };
  
  var input_value = document.getElementById("username").value;
  const user_object = {
    username: input_value
  };
  const user = JSON.stringify(user_object);
  
  xhttp.open("POST", "http://localhost:5000/login", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(user);
}
  </script>
  <script>
function getRefreshToken () {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200 ) {
      document.getElementById("demo3").innerHTML = this.responseText;
    }
  }
  
  var r_token = document.getElementById("r_token").value;
  var r_token_obj = {
    token: r_token
  };
  var refresh_token = JSON.stringify(r_token_obj);
  
  xhttp.open('POST', 'http://localhost:5000/token', true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(refresh_token);
}
  </script>
    <script>
function deleteRefreshToken () {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200 ) {
      document.getElementById("demo4").innerHTML = this.responseText;
    }
  }
  
  var r_token = document.getElementById("rt_del").value;
  var r_token_obj = {
    token: r_token
  };
  var refresh_token = JSON.stringify(r_token_obj);
  
  xhttp.open('POST', 'http://localhost:5000/logout', true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(refresh_token);
}
  </script>
</body>
</html>
  `);
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

app.listen(5000, () => {
  console.log("Listening on PORT 5000");
});
