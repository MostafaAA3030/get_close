const client = io();

client.on('connect', function () {
  client.emit('start_up', {
    uid: user.uid,
    uname: user.uname,
    uemail: user.uemail
  });
});

client.on('contact_list', function (data) { 
  contacts.innerHTML = ""; 
  console.log(data);
  for(var x = 0; x < data.length; x++) {
    if(data[x].contact_type && data[x].contact_type == 1) {
      makeContactElement(data[x]);
    } else if (data[x].contact_type && data[x].contact_type == 2) {
      makeGroupElement(data[x]);
    }
  }
});

getId("send_btn").addEventListener('click', function (e) {
  e.preventDefault();
  var message = message_input.value;
  var username = user_name;
  client.emit('message', {
    myself: username,
    other: address.name,
    other_type: address.type,
    message: message
  });
  message_input.value = "";
});

client.on('self_MSG', function (data) {
  makeMessageBox(data);
});

client.on('send_MSG', function (data) {
  if(data.receiver_type == 1) {
    if(data.receiver === user_name && data.sender === address.name) {
      makeMessageBox(data);
    } else {
      var sender_note = getId(data.sender + "_n");
      var sender_note_val = sender_note.innerText;
      var new_val = parseInt(sender_note_val) + 1;
      sender_note.innerText = "";
      sender_note.innerText = new_val;
  //    sender_note.style.visibilaty = display;
    }
  } else if (data.receiver_type == 2) {
    if(address.name == data.receiver) {
      makeMessageBox(data);
    } else {
      var sender_note = getId(data.receiver + "_n");
      var sender_note_val = sender_note.innerText;
      var new_val = parseInt(sender_note_val) + 1;
      sender_note.innerText = "";
      sender_note.innerText = new_val; 
    }
  }
});

function fetchMSG(name, id, type) {
  var noti_el;
  if(type == 1) {
    noti_el = getId(name + '_n');
  } else if (type == 2) {
    noti_el = getId(id + '_n');
  }
  noti_val = parseInt(noti_el.innerText);
  
  var order_length = 5;
  
  if(noti_val > 0) {
    order_length = order_length + noti_val;
  }
 if(type == 1) {
    var order = {
      other: name,
      other_id: id,
      other_type: type,
      myself: user_name,
      order_length: order_length,
      noti_n: noti_val
    };
  } else if (type == 2) {
    var order = {
      other: id,
      other_name: name,
      other_type: type,
      myself: user_name,
      order_length: order_length,
      noti_n: noti_val
    };
  }
  
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
/*
var user = {
      uid: "<%= uid%>",
      uname: "",
      uemail: "<%= uemail %>",
      ucontacts: []
    };
*/
function createNewGroup () {
  var group_name = getId("group_name").value;
  if(group_name != "") {
    var data = {
      uid: user.uid,
      uname: user.uname,
      uemail: user.uemail,
      g_name: group_name
    }
    client.emit("create_group", data);
    closeNewContactPage();
  } else {
    return false;
  }
}

function showNewContactPage () {
  var new_contact_page = getId("new_contact");
  new_contact_page.style.display = "block";
}

function closeNewContactPage() {
  var new_contact_page = getId("new_contact");
  new_contact_page.style.display = "none";
}

function joinThisRoom() {
  var room_name = getId('room_name').innerHTML;
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

client.on('group_added', function(data) {
  client.emit('start_up', {
    uid: user.uid,
    uname: user.uname,
    uemail: user.uemail
  });
});

client.on('disconnect', function () {
  document.getElementById('title').innerText = "disconnected from server";
});
