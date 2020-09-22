const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

function authenticateToken (req, res, next) {
  console.log("From: authenticateToken middleware: ");
  const authHeader = req.headers['authorization'];
  const hToken = authHeader && authHeader.split(' ')[1];
  
  console.log("Header Token:");
  console.log(hToken);

  if(!hToken) {
    var cookies = req.cookies;
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
      return res.redirect("http://localhost:5000/users/checktoken");
    }
    console.log("User in authenticateToken middleware: ");
    console.log(user);
    req.user = user;
    next();
  });
}

router.get('/home', authenticateToken, (req, res) => {
  console.log("GET - /home - Request received: ");
  console.log(req.headers);
  console.log("req.user in /home");
  console.log(req.user);
  console.log("req.cookies in /home");
  console.log(req.cookies);
  res.render('home.ejs', {
    name: req.user.user_id, // req.user.name,
    email: req.user.email
  });
});

/* This is out of program and must deleted later and index.ejs */
router.get('/', (req, res) => {
  res.render('index.ejs');
});

module.exports = router;
