const socketio = require('socket.io');
const db = require('./db.js');

var sockets = [];

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
      socket.user = {
        uid: data.uid,
        uname: data.uname,
        uemail: data.uemail
      };

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
        for (var x = 0; x < result.length; x++) {
          if(result[x].contact_type === 2) {
            socket.join("g" + result[x].address_number);
          }
        }
        socket.emit('contact_list', result);
      })
      .catch(function (err) {
        console.log(err);
      });
    });
    
    socket.on('message', function (data) {
      var msg_time = new Date(); // Date.now();
/*
  var msg = {
    my_id: user.uid,
    my_email: user.user.uemail,
    address_number: address.address_number,
    address_id: address.address_id,
    address_name: address.name,
    address_type: address.type,
    message: message
  };
*/
      var msg = {
        sender_id: data.my_id,
        sender_email: data.my_email,
        receiver_number: data.address_number,
        receiver_id: data.address_id,
        receiver_name: data.address_name,
        receiver_type: data.address_type,
        message: data.message,
        msg_time: msg_time
      };
      
      socket.emit('self_MSG', msg);
            
      if(data.address_type == 1) {        
        sockets[msg.receiver_name].emit('send_MSG', msg);
      } else if (data.address_type == 2) {
        socket.in('g' + msg.receiver_number).broadcast.emit('send_MSG', msg);
        /*
        var group = groups.find(group => {
          return group.id == data.other
        });
        for(var x=0; x < group.members.length; x++) {
          if(group.members[x] != data.myself) {
            sockets[group.members[x]].emit('send_MSG', msg)
          }
        }
        */
      }
      var msg_sql = "INSERT INTO messages (sender, receiver, message, " +
      "msg_date) VALUES (?, ?, ?, ?)";
      db.writes(msg_sql, [
        msg.sender_id,
        msg.receiver_number,
        msg.message,
        msg.msg_time
      ])
      .then(function (result) {
        console.log(result);
      })
      .catch(function (err) {
        console.log(err);
      });
    });
    
    socket.on('fetchMSG', function(data) {
      if(data.contact_type == 1) {
        var msg_sql = "SELECT DISTINCT t3.email as sender_email, t4.email as receiver_email, t1.message, t1.msg_date FROM messages t1 INNER JOIN contacts t2 ON t1.sender = t2.contact_number INNER JOIN users t3 on t2.contact_id = t3.user_id LEFT JOIN (SELECT * FROM messages t5 INNER JOIN contacts t6 on t5.receiver = t6.contact_number INNER JOIN users t7 on t6.contact_id = t7.user_id WHERE (t5.sender = ? and t5.receiver =?) or (t5.sender = ? AND t5.receiver = ?)) t4 ON t1.receiver = t4.contact_number WHERE (t1.sender = ? and t1.receiver = ?) OR (t1.sender = ? AND t1.receiver = ?) ORDER BY msg_date DESC LIMIT ?";
        
        db.reads(msg_sql, [
          data.sender_id,
          data.contact_number,
          data.contact_number,
          data.sender_id,
          data.sender_id,
          data.contact_number,
          data.contact_number,
          data.sender_id,
          data.order_length
        ])
        .then(function (result) {
          data["messages"] = result;
          socket.emit('msg_result', data);
          return;
        })
        .catch(function (err) {
          return console.log(err);
        })
      } else if (data.contact_type == 2) {
        var msg_sql = "SELECT t3.email as sender_email, t1.message, t1.msg_date FROM messages t1 INNER JOIN contacts t2 ON t1.sender = t2.contact_number AND t2.contact_type = 1 INNER JOIN users t3 ON t2.contact_id = t3.user_id WHERE t1.receiver = ?;"
        db.reads(msg_sql,[data.contact_number])
        .then(function (result) {
          data["messages"] = result;
          socket.emit('msg_result', data);
        })
        .catch(function (err) {
          console.log(err);
        });
      }
      /*
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
      */
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
      db.writes(new_g_sql1, [data.g_name])
      .then(function (result1) {
        console.log("group_id inserted in group table");
        console.log(result1);
        
        var group_id = result1.insertId;
        var new_g_sql2 = "INSERT INTO contacts (contact_id, contact_type) " +
        "VALUES (?, 2)";
        db.writes(new_g_sql2, [group_id])
        .then(function(result2) {
          var contact_id = result2.insertId;
          /* socket joins the room */
          socket.join("g" + result2.insertId);
          
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
    socket.on('group_data', function (data) {
      var sql = "SELECT email FROM users WHERE user_id IN (SELECT user_id FROM relations WHERE contact_id = ?)";
      db.reads(sql, [data.g_number])
      .then(function (result) {
        
        data["contacts"] = result;
        
        socket.emit('g_data', data);
      })
      .catch(function (err) {
        console.log(err);
      });
    });
    socket.on('add_member', function (data) {
      var sql1 = "SELECT contact_number FROM contacts WHERE contact_id IN (SELECT user_id FROM users WHERE email = ?) AND contact_type = 1";
      db.reads(sql1, [data.new_member])
      .then(function (result1) {
        var sql2 = "INSERT INTO relations (user_id, contact_id, contact_type) VALUES (?, ?, 1)";
        db.writes(sql2, [
          result1[0].contact_number,
          data.g_number
        ])
        .then(function (result2) {
          console.log(result2);
        })
        .catch(function (err) {
          console.log(err);
        });
      })
      .catch(function (err) {
        console.log(err)
      });
    });
    /* socket disconnection */
    socket.on('disconnect', () => {
      console.log("a socket disconnected.");
      
    });
  });
}
