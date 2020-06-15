require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');

const socketHandler = require('./lib/sockets.js');

const PORT = 4000 || process.env.PORT;
/* page router*/
const pageRouter = require('./routes/pageRouter.js');
/* application variable */
const app = express();
/* view engine */
app.set('views', './views');
app.set('view engine', 'ejs');
/* static files serving */
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', pageRouter);

const server = http.createServer(app);
socketHandler.initializeSocketIO(server);

server.listen(PORT, () => {
  console.log(`server.js is up and running, listening to PORT: ${PORT}`);
});

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


//app.use(express.static('public'))

/* middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

function authenticateToken (req, res, next) {
  console.log("server-b.js in authenticateToken middleware: ");
  console.log(req.headers);

  const authHeader = req.headers['authorization'];
  const hToken = authHeader && authHeader.split(' ')[1];
  
  console.log("Header Token:");
  console.log(hToken);

  if(!hToken) {
    var cookies = req.cookies; 
    var token = cookies.AJWT;
    
    console.log("Cookie token:");
    console.log(token);
  } else {
    var token = hToken;
  }
  console.log("token variable");
  console.log(token);
  if(token == null) {
    // return res.send("Forbidden Page.");
    // return res.render('forbidden.ejs');
    return res.redirect('http://localhost:5000/users/checktoken');
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
app.get('/', authenticateToken, (req, res) => {
  console.log("cookies in server b");
  console.log(req.cookies);
  res.render('other-page.ejs');
});

app.get('/clearc', (req, res) => {
  res.clearCookie('AJWT');
  res.send("COOKIE DELETED");
});

