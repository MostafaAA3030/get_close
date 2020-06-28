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

function fetchMSG(n_el, sender_id) {
  var n_el_val = n_el.innerText;
  n_el_val = parseInt(n_el_val);
  if(n_el_val > 0) {
    var order = {
      sender: getId(sender_id).innerText,
      receiver: user_name,
      note_n: n_el_val
    };
    console.log(order);
    client.emit('fetchMSG', order);
    n_el.innerText = '0';
  } else {
    return false;
  }
}

client.on('msg_result', function (data) {
  console.log("return msg_result");
  console.log(data);
  for(var x = 0; x < data.length; x++) {
    makeMessageBox(data[x]);  
  }
});

client.on('disconnect', function () {
  document.getElementById('title').innerText = "disconnected from server";
});
