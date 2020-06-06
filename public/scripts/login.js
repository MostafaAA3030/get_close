function getId(the_id) {
  return document.getElementById(the_id);
}

getId("login_form").addEventListener('submit', function(ev) {
  ev.preventDefault();
  authForm();
});

function showDemo (res_details) {
  var demo_content = getId(res_details.demo_id);
  demo_content.innerHTML = "";
  var span_el = document.createElement("span");
  var txt = document.createTextNode(res_details.res_sign + " " + res_details.message);
  span_el.appendChild(txt);
  span_el.setAttribute('class', res_details.res_class);
  getId(res_details.demo_id).appendChild(span_el);
}

function authForm () {
  var email_value = getId("email").value;
  var password_value = getId("password").value;
  var user_data = {
    email: email_value,
    password: password_value
  };
  user_data = JSON.stringify(user_data);
  
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var res_obj = JSON.parse(this.responseText)
      if(res_obj.status != 'OK') {
       showDemo(res_obj);
      } else {
        window.location = 'http://localhost:5000/account/home';
      }
    }
  }
  xhr.open("POST", "http://localhost:5000/users/login", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(user_data);
}
/*
getId("uname").addEventListener('input', function() {
  var uname = getId("uname").value;
  var letter_pattern = /^[a-zA-Z]+$/; 
  
  if(uname.length > 0 && uname.match(letter_pattern) == null) { 
    var error_message = "<span class='error-span'>" + "&#10008" + " The name is only made of letters!</span>";
    
    getId("uname_demo").style.color = "#a00";
    getId("uname_demo").innerHTML = error_message;
    return false;
  }
  if(uname.length < 3) {
    var note_message = "** Note: The name must be more than 2 letters.";
    
    getId("uname_demo").style.color = "#acd";
    getId("uname_demo").innerText = note_message;
  } else {
    getId("uname_demo").style.color = "#acd";
    getId("uname_demo").innerText = "";
  }
});

getId("email").addEventListener('change', function () {
  var email_value = getId("email").value;
  var user_email = {
    email: email_value
  };
  user_email = JSON.stringify(user_email);
  
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      var res_obj = JSON.parse(this.responseText);
      if(res_obj.status != "OK") {
        getId("email_demo").style.color = "#a00";
        getId("email_demo").innerHTML = res_obj.message;
      } else {
        getId("email_demo").style.color = "#acd";
        getId("email_demo").innerHTML = res_obj.message;
        // no problem
      }
    }
  }
    xhr.open("POST", "http://localhost:5000/users/register-email", true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(user_email);
});

getId("password").addEventListener('input', function() {
  var password = getId("password").value;

  var patterns = [
    {
      patt: /[A-Z]/g,
      patt_name: "Capital letter"
    },
    {
      patt: /[a-z]/g,
      patt_name: "Small letter"
    },
    {
      patt: /[0-9]/g,
      patt_name: "Number"
    },
    {
      patt: /[!|@|#|$|%|^|&|*|_|-]/g,
      patt_name: "Any Sign"
    }
  ];
  
  var message = "";

  if(password.length < 5) {
    message += "<span class='error-span'>" + "&#10008" + " More than 5 characters" + " </span>"      
  } else {
    message += "<span class='ok-span'>" + "&#10004" + " More than 5 characters" + " </span>"
  }

  for(var x = 0; x < patterns.length; x++) {
    if(password.match(patterns[x].patt) == null) {
      message += "<span class='error-span'>" + "&#10008" + patterns[x].patt_name + " </span>";
    } else {
      message += "<span class='ok-span'>" + "&#10004" + patterns[x].patt_name + " </span>";
    }
  }
  if(password.length != 0) {
    getId("password_demo").innerHTML = message;
  } else {
    getId("password_demo").innerHTML = "";
  }
});

function validateName (inputs, patterns, demo_ids) {
  return new Promise(function(resolve, reject) {
    var uname = inputs.uname // getId("uname").value;
    var letter_pattern = patterns.letter_pattern // /^[a-zA-Z]+$/;
    if(uname.length > 0 && uname.match(letter_pattern) == null) { 
      var error_message = {
        status: "error",
        res_sign: "\u2718", // &#10008
        res_class: "error_span",
        message: "The name is only made of letters!",
        demo_id: demo_ids.id
      };
      return reject(error_message);
    }
    if(uname.length < 3) {
      var note_message = {
        status: "Note",
        res_sign: "Note:",
        res_class: "note_span",
        message: "The name must be more than 2 letters.",
        demo_id: demo_ids.id
      };
      return reject(note_message);
    } else {
      var success_message = {
        status: "OK",
        res_sign: "\u2714",
        res_class: "note_span",
        message: "Hello " + uname,
        demo_id: demo_ids.id
      }
      resolve(success_message);
    }
  });
}*/
