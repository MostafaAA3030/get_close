const client = io();

client.on('connect', function () {
  client.emit('start_up', {username: user_name});
});

client.on('contact_list', function (data) {
  contacts.innerHTML = "";
  for(var x = 0; x < data.length; x++) {
    makeContactElement(data[x]);
  }
});

getId("send_btn").addEventListener('click', function (e) {
  e.preventDefault();
  var message = message_input.value;
  var username = user_name;
  client.emit('message', {
    myself: username,
    other: address,
    message: message
  });
  message_input.value = "";
});

client.on('self_MSG', function (data) {
  makeMessageBox(data);
});

client.on('send_MSG', function (data) {
  if(data.receiver === user_name && data.sender === address) {
    makeMessageBox(data);
  } else {
    var sender_note = getId(data.sender + "_n");
    var sender_note_val = sender_note.innerText;
    var new_val = parseInt(sender_note_val) + 1;
    sender_note.innerText = "";
    sender_note.innerText = new_val;
//    sender_note.style.visibilaty = display;
  }
});

function fetchMSG(noti_el, sender) {
  var noti_val = noti_el.innerText;
  noti_val = parseInt(noti_val);
  
  var order_length = 5;
  
  if(noti_val > 0) {
    order_length = order_length + noti_val;
  }
  
  var order = {
    other: getId(sender).innerText,
    myself: user_name,
    order_length: order_length,
    noti_n: noti_val
  };
  
  client.emit('fetchMSG', order);
  
  noti_el.innerText = '0';
}

client.on('msg_result', function (data) {
  var msgs_length = parseInt(data.messages.length);
  if(msgs_length === 0) {
    return false;
  }
  var new_messages_index = msgs_length - parseInt(data.noti_n);
  
  if(msgs_length > parseInt(data.noti_n)) {
    layDownMessages(data, new_messages_index);
  } else {
    layDownMessages(data, 0);
  }
});

function prepareRoom() {
  var settings_el = getId("room");
  settings_el.style.display = "block";
  client.emit("room_name", {});
}

function joinThisRoom() {
  var room_name = getId('room_name').innerHTML; alert(room_name);
  client.emit('join_room', {new_room: room_name});
}

client.on("name_for_room", function (data) {
  var room_name_el = getId("room_name");
  room_name_el.innerText = data.room_name;
});

client.on('room_made', function (data) {
  closeRoom();
  closeSettings();
  client.emit('relations', {user_name: user_name});
});

client.on('disconnect', function () {
  document.getElementById('title').innerText = "disconnected from server";
});
