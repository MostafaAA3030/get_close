const client = io();

client.on('connect', function () {
  client.emit('relations', {user_name: user_name});
  client.emit('set_name', {user_name: user_name});
});

client.on('followings', function (data) {
  contacts.innerHTML = "";
  for(var x = 0; x < data.length; x++) {
    makeContactElement(data[x]);
  }
});

getId("send_btn").addEventListener('click', function (e) {
  e.preventDefault();
  var message = message_input.value;
  var username = user_name;
  client.emit('send_message', {
    sender: username,
    receiver: address,
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
    var sender_note = getId(data.sender + "_n")
    var sender_note_val = sender_note.innerText;
    var new_val = parseInt(sender_note_val) + 1;
    sender_note.innerText = "";
    sender_note.innerText = new_val;
//    sender_note.style.visibilaty = display;
  }
});

function fetchMSG(note_el, sender_id) {
  var note_val = note_el.innerText;
  note_val = parseInt(note_val);
  if(note_val > 0) {
    var order = {
      sender: getId(sender_id).innerText,
      receiver: user_name,
      note_n: note_val
    };
    client.emit('fetchMSG', order);
    note_el.innerText = '0';
  } else {
    return false;
  }
}

client.on('msg_result', function (data) {
  for(var x = 0; x < data.length; x++) {
    makeMessageBox(data[x]);  
  }
});

client.on('disconnect', function () {
  document.getElementById('title').innerText = "disconnected from server";
});
