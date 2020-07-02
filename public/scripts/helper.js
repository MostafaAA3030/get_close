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
  div_el.setAttribute('class', 'col-12 div_contact');
  div_el.setAttribute('id', the_name + "_contact");
//  div_el.setAttribute('onclick', 'clickBoth("' + the_name + '")');
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
  address = el.innerHTML;
  var note_el = getId(address + "_n");
  note_el.click();
  enableMessageInput();
}

function enableMessageInput () {
  var message_input = getId("message_input");
  message_input.disabled = false;
}
/*
function clickBoth (the_name) {
  var a_el = getId(the_name); 
  var note_el = getId(the_name + "_n");
  a_el.click();
  note_el.click();
}*/
