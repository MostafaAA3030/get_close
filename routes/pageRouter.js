const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/counter', authenticateToken, (req, res) => {
  var data = {
    name: req.user.name,
    email:req.user.email
  };
  console.log("data is: ");
  console.log(data);
  res.render('counter', data);
});

function authenticateToken (req, res, next) {
  console.log("/ server-b.js / authenticateToken middleware / req.headers / ");
  console.log(req.headers);

  const authHeader = req.headers['authorization'];
  const hToken = authHeader && authHeader.split(' ')[1];
  
  console.log(" / Auth Header Token /");
  console.log(hToken);

  if(!hToken) {
    var cookies = req.cookies;
    var token = cookies.AJWT;
    
    console.log("AJWT Cookie token:");
    console.log(token);
  } else {
    var token = hToken;
  }
  console.log("token variable");
  console.log(token);
  if(token == null) {
    return res.send("Forbidden Page.");
    // return res.render('forbidden.ejs');
//    return res.redirect('http://localhost:5000/users/checktoken');
  }
   
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) {
      console.log("Verify Error- token Expired: ");
      return res.redirect('http://localhost:5000/users/checktoken');
      //  console.log(err);
      //  return res.send("Forbidden");
      //  return res.render('forbidden.ejs');
    }
    console.log("User in authenticateToken middleware: ");
    console.log(user);
    req.user = user;
    req.token = token;
    next();
  })
}

/* Routes */
router.get('/', authenticateToken, (req, res) => {
  console.log("cookies in server-b: ");
  console.log(req.cookies);
  console.log("req.user is: ");
  console.log(req.user);
  res.render('other-page.ejs');
});

router.get('/clearc', (req, res) => {
  res.clearCookie('AJWT');
  res.send("COOKIE DELETED");
});

module.exports = router;
