const socketio = require('socket.io');

var users = [
  {id: 1 , email: "ali@gmail.com", password: "pass@2" },
  {id: 2 , email: "mos", password: "pass@2"},
  {id: 3 , email: "moj", password: "pass@2"},
  {id: 4 ,email: "hosein@gmail.com", password: "pass@2"}
];

var sockets = {};
var relations = [
  {follower: "ali@gmail.com", following: "mos", type: '1'},
  {follower: "mos", following: "ali", type: '1'},
  {follower: "ali", following: "moj", type: '1'},
  {follower: "moj", following: "group1", type: '2'},
  {follower: "mos", following: "group1", type: '2'},
  {follower: "ali", following: "group1", type: '2'},
  {follower: "mos", following: "moj", type: '1'}
];
var messages = [];
var groups = [
  {
    id: 'group1',
    name: 'ahmady', 
    members: [
      'ali',
      'mos',
      'moj'
    ]
  }
];
var room_count = 1;
var rooms = [
  "ahmady"
];
exports.initializeSocketIO = function (server) {
  const io = socketio(server);
  
  io.on('connection', (socket) => {
    console.log("a socket connected.");

    /* find the sockets relations and return back the result */
    socket.on('start_up', function (data) {
      var username = data.username;
      socket.username = username;
      sockets[data.username] = socket;
      
      var relations_result = [];
      for(var x = 0; x < relations.length; x++) {
        if(relations[x].follower === username) {
          if(relations[x].type == 2) {
            var group_id = groups.find(group => {
              return group.id = relations[x].following;
            });
            relations_result.push({
              id: relations[x].following,
              following: group_id.name,
              type: relations[x].type
            });
          } else {
            var user_id = users.find(user => {
              return user.email === relations[x].following;
            });
            relations_result.push({
              id: user_id.id,
              following: relations[x].following,
              type: relations[x].type
            });
          }
        }
      }
 //     console.log(relations_result);
      socket.emit('contact_list', relations_result);
      relation_result = [];
    });
    
    socket.on('message', function (data) {
      var msg_time = new Date();
      
      var msg = {
        sender: data.myself,
        receiver: data.other, // receiver_name , group_id
        receiver_type: data.other_type,
        message: data.message,
        msg_time: msg_time
      };
      
      socket.emit('self_MSG', msg);
      if(data.other_type == 1) {
        sockets[data.other].emit('send_MSG', msg);
      } else if (data.other_type == 2) {
        var group = groups.find(group => {
          return group.id == data.other
        });
        for(var x=0; x < group.members.length; x++) {
          if(group.members[x] != data.myself) {
            sockets[group.members[x]].emit('send_MSG', msg)
          }
        }
      }
      messages.push(msg);
    });
    
    socket.on('fetchMSG', function(data) {
      var msg_result = [];
      var order_l = data.order_length;
      if(data.other_type == 1) {
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
      } else if (data.other_type == 2) {
        for(var x = messages.length - 1; x >= 0; x--) {
          if(messages[x].receiver === data.other) {
            if(order_l > 0) {
              msg_result.unshift(messages[x]);
              order_l = order_l - 1;
            } else {
              break;
            }
          }
        }
      }
      data['messages'] = msg_result;
      socket.emit('msg_result', data);
    });
    
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
    /* socket disconnection */
    socket.on('disconnect', () => {
      console.log("a socket disconnected.");
    });
  });
}
