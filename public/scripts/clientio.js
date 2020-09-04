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
  console.log("The contact_list: ");
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
  /*
var user =  {
    uid: "1",
    uname: "",
    uemail: "q@q.com",
    ucontacts: Array []
​  }
var address = {
  address_number: "",
  address_id: "",
  name: "",
  type: ""
};
  */
  var message = message_input.value;
  var msg = {
    my_id: user.uid,
    my_email: user.uemail,
    address_number: address.address_number,
    address_id: address.address_id,
    address_name: address.name,
    address_type: address.type,
    message: message
  };
  client.emit('message', msg);
  message_input.value = "";
});

client.on('self_MSG', function (data) { // this function is done ...
  makeMessageBox(data);
});

client.on('send_MSG', function (data) {
  if(data.receiver_type == 1) {
    if(data.receiver_name === user.uemail && data.sender_email === address.name) {
      makeMessageBox(data);
    } else {
      var sender_note = getId(data.sender_email + "_n");
      var sender_note_val = sender_note.innerText;
      var new_val = parseInt(sender_note_val) + 1;
      sender_note.innerText = "";
      sender_note.innerText = new_val;
  //    sender_note.style.visibilaty = display;
    }
  } else if (data.receiver_type == 2) {
    if(address.address_number == data.receiver_number) {
    // here we have two cases self and other ...
      makeMessageBox(data);
    } else {
      var sender_note = getId("group" + data.receiver_number + "_n");
      var sender_note_val = sender_note.innerText;
      var new_val = parseInt(sender_note_val) + 1;
      sender_note.innerText = "";
      sender_note.innerText = new_val;
    }
  }
});

function fetchMSG(contact_data) {
  /*
var user =  {
    uid: "1",
    uname: "",
    uemail: "q@q.com",
    ucontacts: Array []
​  }
var address = {
  address_number: "",
  address_id: "",
  name: "",
  type: ""
};
  */
  /*
  {
    address_number: 5, contact_id ((primary key))
    contact_id: 1, user_id or group_id
    contact_name: 'salam', ((email or group_name))
    contact_type: 2 ((1 or 2))
  }
  */
  var noti_el;
  if(contact_data.contact_type == 1) {
    noti_el = getId(contact_data.contact_name + '_n');
  } else if (contact_data.contact_type == 2) {
    noti_el = getId('group' + contact_data.address_number + '_n');
  }
  var noti_val = parseInt(noti_el.innerText);
  
  var order_length = 5;
  
  if(noti_val > 0) {
    order_length = order_length + noti_val;
  }

  var order = {
    sender_id: user.uid,
    sender_email: user.uemail,
    contact_number: contact_data.address_number,
    contact_id: contact_data.contact_id,
    contact_name: contact_data.contact_name,
    contact_type: contact_data.contact_type,
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

/* create new group and join in the room by its id number */
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

/* Open and Close group page */
function showNewContactPage () {
  var new_contact_page = getId("new_contact");
  new_contact_page.style.display = "block";
}
function closeNewContactPage() {
  var new_contact_page = getId("new_contact");
  new_contact_page.style.display = "none";
}
/*  ---  */

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
  /*
  {
    address_number: 5, contact_id ((primary key))
    contact_id: 1, user_id or group_id
    contact_name: 'salam', ((email or group_name))
    contact_type: 2 ((1 or 2))
  }
  */
  var address_data = {
    address_number: data.contact_number,
    contact_id: data.g_id,
    contact_name: data.d_name,
    contact_type: 2
  };
  changeAddressing(address_data);
});

client.on('disconnect', function () {
  document.getElementById('title').innerText = "disconnected from server";
});
