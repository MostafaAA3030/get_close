var message_place = getId('message_place');
var message_input = getId("message_input");
var name_of_user = getId("name_of_user");
var content_header = getId("content_header");
var contacts = getId("contacts");

var address = {
  address_number: "",
  address_id: "",
  name: "",
  type: ""
};

function getId(id) {
  return document.getElementById(id);
}

function makeContactElement (user_data) { // the_name, the_id, type
  /*
  {
          address_number: 5,
          contact_id: 1,
          contact_name: 'salam',
          contact_type: 2
  }
  */
  
  var user_data_json = JSON.stringify(user_data);
  /* 1st el */
  var contact_div = document.createElement('div');
  contact_div.setAttribute('class', 'col-12 contact-div');
  contact_div.setAttribute('id', user_data.contact_name + "_contact");
  contacts.appendChild(contact_div);  // id = 'ali@gmail.com_contact'
  /* 2nd el */
  var name_el = document.createElement('div');
  name_el.setAttribute('class', 'col-12 contact-name');
  name_el.setAttribute('id', user_data.contact_name); // id = 'ali@gmail.com'
  name_el.setAttribute('onclick', "changeAddressing(" + user_data_json + ")"); 
  var text_node = document.createTextNode(user_data.contact_name);
  name_el.appendChild(text_node);
  contact_div.appendChild(name_el);
  /* 3rd el */
  var msg_counter_el = document.createElement('div');
  msg_counter_el.setAttribute('id', user_data.contact_name + "_n"); 
  msg_counter_el.setAttribute('class', 'contact-msg-counter');
    // id = 'ali@gmail.com_n'
  msg_counter_el.setAttribute('onclick', 'changeAddressing(' + user_data_json + ')');
  var n_el_txt = document.createTextNode("0");
  msg_counter_el.appendChild(n_el_txt);
  name_el.appendChild(msg_counter_el);
  /* 4th el*/ 
  var btn = document.createElement("BUTTON");
  btn.setAttribute('class', 'contact-btn');
  btn.setAttribute('id', user_data.contact_name + "_btn");
  btn.setAttribute('onclick', 'fetchMSG(' + user_data_json + ')');
  btn.innerHTML = "GO";
  name_el.appendChild(btn);
}
/* Test function */
function attachEl (p_el, el_data) {
  var el = document.createElement(el_data.el_type);
  el.setAttribute('class', el_data.class_names);
  el.setAttribute('id', el_data.id_name);
  if(el_data.events != "") {
    el.setAttribute(el_data.events.ev_name, el_data.events.ev_value);
  }
  if(el_data.text != "") {
    var txt_node = document.createTextNode(el_data.text);
    el.appendChild(txt_node);
  }
  if(typeof(p_el) != "string") {
    p_el.appendChild(el);
  } else {
    var pel = getId(p_el);
    pel.appendChild(el);
  }
}
function makeGroupElement (group_data) { // group_name, group_id, type
  /*
  {
          address_number: 5,
          contact_id: 1,
          contact_name: 'salam',
          contact_type: 2
  }
  */
  
  var group_id = group_data.address_number;
  group_id = "group" + group_id;
  var group_data_json = JSON.stringify(group_data);
  /* first el */
  var contact_div = document.createElement('div');
  contact_div.setAttribute('class', 'col-12 div-contact');
  contact_div.setAttribute('id', group_id + "_contact"); // group1_contact
  contacts.appendChild(contact_div);
  /* second el */
  var name_el = document.createElement('div');
  name_el.setAttribute('class', 'col-12 contact-name');
  name_el.setAttribute('id', group_id); // group1
  name_el.setAttribute('onclick', 'changeAddressing(' + group_data_json + ')');
  var text_node = document.createTextNode(group_data.contact_name); // ahmady
  name_el.appendChild(text_node);
  contact_div.appendChild(name_el);
  /* third el */   
  var msg_counter_el = document.createElement('div');
  msg_counter_el.setAttribute('id', group_id + "_n"); // group1_n
  msg_counter_el.setAttribute('class', 'contact-msg-counter');
  msg_counter_el.setAttribute('onclick', 'changeAddressing(' + group_data_json + ')');
  var n_el_txt = document.createTextNode("0");
  msg_counter_el.appendChild(n_el_txt);
  name_el.appendChild(msg_counter_el);
  /* Fourth el */
  var btn = document.createElement("BUTTON");
  btn.setAttribute('class', 'contact-btn');
  btn.setAttribute('id', group_id + "_btn");
  btn.setAttribute('onclick', 'fetchMSG(' + group_data_json + ')');
  btn.innerHTML = "GO";
  name_el.appendChild(btn);  
}

function changeAddressing (the_address) {
  if(message_place.innerText != "") {
    message_place.innerHTML = "";
    message_input.value = "";
  }
  /*
  {
    address_number: 5, contact_id ((primary key))
    contact_id: 1, user_id or group_id
    contact_name: 'salam', ((email or group_name))
    contact_type: 2 ((1 or 2))
  }
  second functional object  
  {
    address_number: "",
    address_id: "",
    name: "",
    type: ""
  }
  */
  var btn_id;
  if(the_address.contact_type == 1) {
    address.address_number = the_address.address_number;
    address.address_id = the_address.contact_id;
    address.name = the_address.contact_name;
    address.type = the_address.contact_type;
    content_header.innerText = the_address.contact_name;
    btn_id = the_address.contact_name + "_btn";
  } else if(the_address.contact_type == 2) {
    address.address_number = the_address.address_number;
    address.address_id = the_address.contact_id;
    address.name = the_address.address_number;
    address.type = the_address.contact_type;
    content_header.innerText = the_address.contact_name;  
    btn_id = "group" + the_address.address_number + "_btn";
  }
  var btn_el = getId(btn_id);
  btn_el.click();
  btn_id;
  enableMessageInput();
  message_input.focus();
}

function makeMessageBox(data) {
  var div_el = document.createElement('div');
  var h_el = document.createElement('h4');
  var txt1 = document.createTextNode(data.sender_email + "<<" + data.msg_time + ">>");
  h_el.setAttribute('class', 'col-12');
  h_el.appendChild(txt1);
  var p_el = document.createElement('p');
  var txt2 = document.createTextNode(data.message);
  if(data.sender_email === user.uemail) {
    div_el.setAttribute('class', 'self-box');
  } else {
    div_el.setAttribute('class', 'msg-box');
  }
  p_el.appendChild(txt2);
  div_el.appendChild(h_el);
  div_el.appendChild(p_el);
  message_place.appendChild(div_el);
  scrollToBottom();
}
function makeMessageBox2(data) {
  var div_el = document.createElement('div');
  var h_el = document.createElement('h4');
  console.log(data);
  if(data.sender_email == user.uemail) {
    var txt1 = document.createTextNode(data.sender_email + "<<" + data.msg_date + ">>");
    div_el.setAttribute('class', 'self-box');
  } else {
    var txt1 = document.createTextNode(data.sender_email + "<<" + data.msg_date + ">>");
    div_el.setAttribute('class', 'msg-box');
  }
  h_el.setAttribute('class', 'col-12');
  h_el.appendChild(txt1);
  var p_el = document.createElement('p');
  var txt2 = document.createTextNode(data.message);
  p_el.appendChild(txt2);
  div_el.appendChild(h_el);
  div_el.appendChild(p_el);
  message_place.appendChild(div_el);
  scrollToBottom();
}
/*
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
*/
function layDownMessages (data, new_messages_index) {
  var result_data = {
    sender_id: data.sender_id,
    sender_email: data.sender_email,
    receiver_number: data.contact_number,
    receiver_id: data.contact_id,
    receiver_name: data.contact_name,
    receiver_type: data.contact_type,
    order_length: data.order_length,
    noti_n: data.noti_n,
    messages: data.messages
  };
  for(var x = 0; x < result_data.messages.length; x++) {
    if(x == new_messages_index) {
      newMessagesBox();
    }
    makeMessageBox2(data.messages[x]);
  }
  scrollToBottom();
}
function newArr (oldArr) {
  this.sender_email = oldArr.sender;
  this.receiver_name = oldArr.receiver;
  this.message = oldArr.message;
  this.msg_time = oldArr.msg_date
}
/*
  var order = {
    my_id: user.uid,
    my_email: user.uemail,
    contact_number: contact_data.address_number,
    contact_id: contact_data.contact_id,
    contact_name: contact_data.contact_name,
    contact_type: contact_data.contact_type,
    order_length: order_length,
    noti_n: noti_val,
    messages: []
  };
*/
function newMessagesBox () {
  var div_el = document.createElement("div");
  div_el.setAttribute('class', 'col-12 new-msgs-line');
  var txt_node = document.createTextNode("New messages");
  div_el.appendChild(txt_node);
  message_place.appendChild(div_el);
}

function scrollToBottom () {
  message_place.scrollTop = message_place.scrollHeight;
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
