const socketio = require('socket.io');

var users = [
  {email: "ali", password: "pass@2" },
  {email: "mos", password: "pass@2"},
  {email: "moj", password: "pass@2"},
  {email: "hosein@gmail.com", password: "pass@2"}
];
var namesUsers = {};
var sockets = {};
var relations = [
  {follower: "ali", following: "mos"},
  {follower: "mos", following: "ali"},
  {follower: "ali", following: "moj"},
  {follower: "moj", following: "ahmady"},
  {follower: "mos", following: "ahmady"},
  {follower: "ali", following: "ahmady"},
  {follower: "mos", following: "moj"}
];
var messages = [];
var room_count = 1;
var rooms = [
  "ahmady"
];
exports.initializeSocketIO = function (server) {
  const io = socketio(server);
  
  io.on('connection', (socket) => {
    console.log("a socket connected.");
    
    socket.on("join_room", function (data) {
      var room_name = data.new_room;
      socket.join(room_name);
      rooms.push(room_name);
      relations.push({
        follower: socket.username,
        following: room_name
      });
      socket.emit("room_made", {room_name: room_name});
    });
    socket.on("room_name", function () {
      var room_name = "room" + room_count;
      room_count++;
      socket.emit("name_for_room", {room_name: room_name});
    });
    /* find the sockets relations and return back the result */
    socket.on('relations', function (data) {
      var user_name = data.user_name;
      
      namesUsers[socket.id] = user_name;
      socket.username = user_name;
      
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
        sender: data.myself,
        receiver: data.other,
        message: data.message,
        msg_time: msg_time
      });
      var msg_obj = {
        sender: data.myself,
        receiver: data.other,
        message: data.message,
        msg_time: msg_time
      };
      messages.push(msg_obj);
      
      sockets[data.other].emit('send_MSG', {
        sender: data.myself,
        receiver: data.other,
        message: data.message,
        msg_time: msg_time
      });
    });
    
    socket.on('fetchMSG', function(data) {
      var msg_result = [];
      var order_l = data.order_length;
      for(var x = messages.length - 1; x >= 0; x--) {
        if((messages[x].sender === data.other && 
        messages[x].receiver === data.myself) || 
        (messages[x].sender === data.myself && 
        messages[x].receiver === data.other)) {
          if(order_l > 0) {
            msg_result.unshift(messages[x]);
            order_l = order_l - 1;
          } else {
            break;
          }
        }
      }
      data['messages'] = msg_result;
      socket.emit('msg_result', data);
    })
    /* socket disconnection */
    socket.on('disconnect', () => {
      console.log("a socket disconnected.");
    });
  });
}
