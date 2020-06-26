require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');

const socketHandler = require('./lib/sockets.js');

const PORT = process.env.PORT || 4000;
/* page router*/
const pageRouter = require('./routes/pageRouter.js');
/* application variable */
const app = express();
/* view engine */
app.set('views', './views');
app.set('view engine', 'ejs');
/* middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
/* static files serving */
app.use(express.static(path.join(__dirname, 'public')));
/* routes*/
app.use('/', pageRouter);

const server = http.createServer(app);
socketHandler.initializeSocketIO(server);

server.listen(PORT, () => {
  console.log(`server.js is up and running, listening to PORT: ${PORT}`);
});
