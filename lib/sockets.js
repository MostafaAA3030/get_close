const socketio = require('socket.io');
const db = require('./db.js');

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
/*      
      "SELECT DISTINCT ut.user_id, ut.email, " + 
      "rt.contact_type FROM users ut CROSS JOIN relations rt " + 
      "WHERE ut.user_id IN (SELECT contact_id FROM relations " +
      "WHERE user_id = ?)";
*/  
  io.on('connection', (socket) => {
    console.log("a socket connected.");
    
    /* find the user relations and return back the result */
    socket.on('start_up', function (data) {
      var user = {
        uid: data.uid,
        uname: data.uname,
        uemail: data.uemail
      };
      
      socket.uemail = user.uemail;
      sockets[data.uemail] = socket;
      
      var contacts_sql = "SELECT tt.address_number AS address_number, " +
      "user_id AS contact_id, email AS contact_name, 1 AS contact_type " +
      "FROM users INNER JOIN " +
      "(SELECT contacts.contact_number AS address_number, " + 
      "contacts.contact_id, contacts.contact_type FROM contacts INNER JOIN " +
      "relations ON contact_number = relations.contact_id " +
      "WHERE user_id = ?) AS tt " + 
      "ON tt.contact_id = users.user_id " + 
      "WHERE contact_type = 1 " +
      "UNION ALL " +
      "SELECT tt.address_number, g_id, g_name, 2 FROM groups INNER JOIN " +
      "(SELECT contacts.contact_number AS address_number, " +
      "contacts.contact_id, contacts.contact_type FROM contacts INNER JOIN " +
      "relations ON contact_number = relations.contact_id " + 
      "WHERE user_id = ?) AS tt ON tt.contact_id = groups.g_id " + 
      "WHERE contact_type = 2;"
            
      db.reads(contacts_sql, [user.uid, user.uid])
      .then(function (result) {
        console.log(result);
        /*
        socket.uemail = user.uemail;
        sockets[data.uemail] = socket;
        {
          address_number: 5,
          contact_id: 1,
          contact_name: 'salam',
          contact_type: 2
        }
        */
        socket.emit('contact_list', result);
      })
      .catch(function (err) {
        console.log(err);
      });
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
      var group_number_sql = "SELECT MAX(g_id) as g_number FROM groups";
      db.reads(group_number_sql)
      .then(function (result) {
      if(result[0].g_number == null) {
        var group_number = 1;
      } else {
        var group_number = result[0].g_number + 1;
      }
      socket.emit("name_for_room", {room_name: room_name});
      })
      .catch(function (err) {
        console.log(err);
      });
//      var room_name = "room" + room_count;
//      room_count++;      
    });
    
    socket.on("create_group", function (data) {
      var new_g_sql1 = "INSERT INTO groups (g_name) VALUES (?)";
      db.writes(new_g_sql1, data.g_name)
      .then(function (result1) {
        console.log("group_id inserted in group table");
        console.log(result1);
        
        var group_id = result1.insertId;
        var new_g_sql2 = "INSERT INTO contacts (contact_id, contact_type) " +
        "VALUES (?, 2)";
        db.writes(new_g_sql2, [group_id])
        .then(function(result2) {
          var contact_id = result2.insertId;
          var new_g_sql3 = "INSERT INTO relations (user_id, contact_id, " +
            "contact_type) VALUES (?, ?, 2)";
          db.writes(new_g_sql3, [data.uid, contact_id])
          .then(function (result3) {
          console.log("final result");
          var res_obj = {
              uid: data.uid,
              uname: data.uemail,
              uemail: data.uemail,
              contact_number: contact_id,
              g_id: group_id,
              g_name: data.g_name
            };
            return socket.emit("group_added", res_obj);
          })
          .catch(function (err3) {
            console.log(err3);
          });  
        })
        .catch(function(err2) {
          console.log(err2);
        })
      })
      .catch(function (err1) {
        console.log(err1);
      });
    });
    
    /* socket disconnection */
    socket.on('disconnect', () => {
      console.log("a socket disconnected.");
    });
  });
}
