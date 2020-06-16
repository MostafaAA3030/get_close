const socketio = require('socket.io');

exports.initializeSocketIO = function (server) {
 const io = socketio(server);
 
 io.on('connection', (socket) => {
  console.log("a socket connected.");
  console.log(socket.id);
   socket.on('disconnect', () => {
    console.log("a socket disconnected.");
   });
 });
}
