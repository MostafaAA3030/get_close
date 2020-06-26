var message_place = getId('message_place');
var message_input = getId("message_input");
var name_of_user = getId("name_of_user");
var contacts = getId("contacts");
var address = "";

function getId(id) {
  return document.getElementById(id);
}

function makeMessageBox(data) {
  var div_el = document.createElement('div');
  var txt = data.sender + "-" + data.msg_time + ": " + data.message;
  var txt_node = document.createTextNode(txt);
  if(data.sender === data.receiver) {
    div_el.setAttribute('class', 'col-10 self-box');
  } else {
    div_el.setAttribute('class', 'col-10 msg-box');
  }
  div_el.appendChild(txt_node);
  message_place.appendChild(div_el);
}

function makeContactElement (the_name) {
  var div_el = document.createElement('div');
  div_el.setAttribute('class', 'col-11 a_contact');
  div_el.setAttribute('onclick', 'changeAddressing(this)');
  div_el.setAttribute('id', the_name);
  var text_node = document.createTextNode(the_name);
  div_el.appendChild(text_node);
  contacts.appendChild(div_el);
  var n_el = document.createElement('div');
  n_el.setAttribute('id', the_name + "_n");
  n_el.setAttribute('class', 'col-1 n-msg');
  n_el.setAttribute('onclick', 'fetchMSG(this,"' + the_name + '")');
  var n_el_txt = document.createTextNode("0");
  n_el.appendChild(n_el_txt);
  contacts.appendChild(n_el);
}

function changeAddressing (el) {
  address = el.innerHTML;
}
