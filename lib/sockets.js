const socketio = require('socket.io');

var users = [
  {email: "ali@gmail.com", password: "pass@2" },
  {email: "mostafa@gmail.com", password: "pass@2"},
  {email: "mojtaba@gmail.com", password: "pass@2"},
  {email: "hosein@gmail.com", password: "pass@2"}
];
var sockets = {};
var relations = [
  {follower: "ali@gmail.com", following: "mostafa@gmail.com"},
  {follower: "mostafa@gmail.com", following: "ali@gmail.com"},
  {follower: "ali@gmail.com", following: "mojtaba@gmail.com"},
  {follower: "mojtaba@gmail.com", following: "ahmady"}
];
var messages = [];
var rooms = [
  "ahmady"
];
exports.initializeSocketIO = function (server) {
  const io = socketio(server);
  
  io.on('connection', (socket) => {
    console.log("a socket connected.");
    
    socket.on('relations', function (data) {
      var user_name = data.user_name;
      var relations_result = [];
      for(var y = 0; y < relations.length; y++) {
        if(relations[y].follower === user_name) {
          relations_result.push(relations[y].following);
        }
      }
      socket.emit('followings', relations_result);
      relation_result = [];
    });
    
    socket.on('set_name', function (data) {
      sockets[data.user_name] = socket;
    });

    socket.on('send_message', function (data) {
      var msg_time = new Date();
      
      socket.emit('self_MSG', {
        sender: data.sender,
        receiver: data.sender,
        message: data.message,
        msg_time: msg_time
      });
      var msg_obj = {
        sender: data.sender,
        receiver: data.receiver,
        message: data.message,
        msg_time: msg_time
      };
      messages.push(msg_obj);
      
      sockets[data.receiver].emit('send_MSG', {
        sender: data.sender,
        receiver: data.receiver,
        message: data.message,
        msg_time: msg_time
      });
    });
    socket.on('fetchMSG', function(data) {
      var msg_result = [];
      var note_n = data.note_n;
      for(var x = messages.length - 1; x >= 0; x--) {
        if(messages[x].sender === data.sender && 
        messages[x].receiver === data.receiver) {
          if(note_n > 0) {
            msg_result.unshift(messages[x]);
            note_n = note_n - 1;
          }
        }
      }
      socket.emit('msg_result', msg_result);
    })
    /* socket disconnection */
    socket.on('disconnect', () => {
      console.log("a socket disconnected.");
    });
  });
}
