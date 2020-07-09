var message_place = getId('message_place');
var message_input = getId("message_input");
var name_of_user = getId("name_of_user");
var content_header = getId("content_header");
var contacts = getId("contacts");

var address = "";

function getId(id) {
  return document.getElementById(id);
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
  if(message_place.innerHTML != null) {
    message_place.innerHTML = "";
    message_input.value = "";
  }
   
  address = el.innerText;
  content_header.innerText = address;
  var noti_el = getId(address + "_n");
  noti_el.click();
  enableMessageInput();
  message_input.focus();
}

function makeMessageBox(data) {
  var div_el = document.createElement('div');
  var h_el = document.createElement('h4');
  var txt1 = document.createTextNode(data.sender + "<<" + data.msg_time + 
  ">>");
  h_el.setAttribute('class', 'col-12');
  h_el.appendChild(txt1);
  var p_el = document.createElement('p');
  var txt2 = document.createTextNode(data.message);
  if(data.sender === user_name) {
    div_el.setAttribute('class', 'col-10 self-box');
  } else {
    div_el.setAttribute('class', 'col-10 msg-box');
  }
  p_el.appendChild(txt2);
  div_el.appendChild(h_el);
  div_el.appendChild(p_el);
  message_place.appendChild(div_el);
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
