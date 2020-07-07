var message_place = getId('message_place');
var message_input = getId("message_input");
var name_of_user = getId("name_of_user");
var content_header = getId("content_header");
var contacts = getId("contacts");
var address = "";
/*
var client = {
  name: user_name,
  address: "",
  contacts: {
    name: address_name,
    last_contact: new Date()
  }
};
*/
function getId(id) {
  return document.getElementById(id);
}

function makeMessageBox(data) {
  var div_el = document.createElement('div');
  var txt = data.sender + "-" + data.msg_time + ": " + data.message;
  var txt_node = document.createTextNode(txt);
  if(data.sender === user_name) {
    div_el.setAttribute('class', 'col-10 self-box');
  } else {
    div_el.setAttribute('class', 'col-10 msg-box');
  }
  div_el.appendChild(txt_node);
  message_place.appendChild(div_el);
}

function makeContactElement (the_name) {
  var div_el = document.createElement('div');
  div_el.setAttribute('class', 'col-12 div_contact');
  div_el.setAttribute('id', the_name + "_contact");
  contacts.appendChild(div_el);
  
  var n_el = document.createElement('div');
  n_el.setAttribute('id', the_name + "_n");
  n_el.setAttribute('class', 'n-msg');
  n_el.setAttribute('onclick', 'fetchMSG(this,"' + the_name + '")');
  var n_el_txt = document.createTextNode("0");
  n_el.appendChild(n_el_txt);
  getId(the_name + "_contact").appendChild(n_el);
  
  var a_el = document.createElement('div');
  a_el.setAttribute('class', 'a_contact');
  a_el.setAttribute('id', the_name);
  a_el.setAttribute('onclick', 'changeAddressing(this)');
  var text_node = document.createTextNode(the_name);
  a_el.appendChild(text_node);
  getId(the_name + "_contact").appendChild(a_el);
}

function changeAddressing (el) {
 
  if(message_place.innerText != null) {
    message_place.innerHTML = "";
  }
   
  address = el.innerText; console.log("address is: " + address);
  content_header.innerText = address;
  var noti_el = getId(address + "_n");
 // if(noti_el.innerText != 0) {
  
 // }
  noti_el.click();
  enableMessageInput();
  message_input.focus();
}

function enableMessageInput () {
  var message_input = getId("message_input");
  message_input.disabled = false;
}

function showSettings() {
  var settings_el = getId("settings");
  settings_el.style.display = "block";
}

function closeSettings () {
  var settings_el = getId("settings");
  settings_el.style.display = "none";
}

function closeRoom () {
  var settings_el = getId("room");
  settings_el.style.display = "none";
}

function layDownMessages (data, new_messages_index) {
  for(var x = 0; x < data.messages.length; x++) {
    if(x == new_messages_index) {
      newMessagesBox();
    }
    makeMessageBox(data.messages[x]);
  }
}
function newMessagesBox () {
  var div_el = document.createElement("div");
  div_el.setAttribute('class', 'new-msgs-line');
  var txt_node = document.createTextNode("New messages");
  div_el.appendChild(txt_node);
  message_place.appendChild(div_el);
}
