const socketio = require('socket.io');

exports.initializeSocketIO = function (server) {
 const io = socketio(server);
 
 io.on('connection', (socket) => {
  console.log("a socket connected.");
  
   socket.on('disconnect', () => {
    console.log("a socket disconnected.");
   });
 });
}
