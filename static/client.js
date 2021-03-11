var logged_in_user = {};
var search_user = "";
var webSocket = null;


connectWS = function () {
   if(webSocket === null){
       webSocket = new WebSocket("wss://twiddermock.herokuapp.com/api");
       //console.log("connectWS");

       webSocket.onmessage = function (event) {
           //console.log("message received");
           //console.log(event);
           //console.log(event.data);
           //var fr = new FileReader();
           //var text = fr.readAsText(event.data);
           //console.log(text);
           var msg = JSON.parse(event.data);
           if(msg.type == "logout"){
               //console.log("logging out");
               localStorage.removeItem("token");
               localStorage.removeItem("email"); var welcome_wraper = document.getElementById("welcomeview").innerHTML;
               document.getElementById("welcomeview-wraper").innerHTML = welcome_wraper;

               var navigation_wraper = document.getElementById("navigationview").innerHTML;
               document.getElementById("navigation-wraper").innerHTML = "";

               var content_wraper = document.getElementById("contentview").innerHTML;
               document.getElementById("content-wraper").innerHTML = "";



               webSocket.close();

           }
           //console.log(msg);
       }
       webSocket.onclose = function () {
           //console.log("ws closed");
           webSocket = null;
       }
   }
   else if(webSocket.readyState === 3){ //shouldn't be used but you never know
       //console.log("reconnect here");
       webSocket = new WebSocket("wss://twiddermock.herokuapp.com/api");

       var msg = {
           type : "login",
           id : localStorage.getItem("token"),
           email : userInfo[0]
       }

       webSocket.onopen = function () {
           //console.log("ws open");
           webSocket.send(JSON.stringify(msg));
       }
   }
}

 profileLoader = function(token){

      var welcome_wraper = document.getElementById("profileview").innerHTML;
      var navigation_wraper = document.getElementById("navigationview").innerHTML;
      var content_wraper = document.getElementById("contentview").innerHTML;
   //  // and appending it into the welcome wraper
   document.getElementById("welcomeview-wraper").innerHTML = welcome_wraper;
   document.getElementById("navigation-wraper").innerHTML = navigation_wraper;
   document.getElementById("content-wraper").innerHTML = content_wraper;

   localStorage.setItem("token" , token);
   load(token);
   load_msgs(token);


}


window.onload = function () {
if (localStorage.getItem("token") != null) {
      // socket_start();
      // alert("Something happend");
      console.log("not empty");
      token = localStorage.getItem('token');
      profileLoader(token);



    }
   else{
      var welcome_wraper = document.getElementById("welcomeview").innerHTML;
      document.getElementById("welcomeview-wraper").innerHTML = welcome_wraper;

       }


   }




signup_validator  = function(){


   var email = document.getElementById("email_up").value;
   var password = document.getElementById("psw_up").value;
   var password2 = document.getElementById("psw-repeat").value;
   var firstname = document.getElementById("first-name").value;
   var familyname = document.getElementById("family-name").value;
   var gender = document.getElementById("gender").value;
   var city = document.getElementById("city").value;
   var country  = document.getElementById("country").value;

   console.log(email);
   var user = {
      email : email,
      password :password,
      firstname : firstname,
      familyname :familyname,
      gender:gender,
      city : city,
      country:country
   }


if(password.length < 10  ) {

       document.getElementById("signup-error").innerHTML = "Passwords length is not sufficient";
   } else if(password != password2)
   {


     document.getElementById("signup-error").innerHTML = "Passwords did not match";
   }
   else {

      const payload ={
         "email" : email,
         "password" : password,
         "firstname":firstname,
         "familyname":familyname,
         "gender":gender,
         "city":city,
         "country":country

      };

      const payloadString = JSON.stringify(payload)

      let xhr = new XMLHttpRequest();
      xhr.open("POST" , "/sign_up" ,true);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.onreadystatechange = () =>{
         if(xhr.readyState === 4 && xhr.status === 200){
            let object  = JSON.parse(xhr.responseText);
            if (object['success'] == true){
               let object  = JSON.parse(xhr.responseText);
                document.getElementById("signup-error").innerHTML = object['msg'];

            }
            else{
               let object  = JSON.parse(xhr.responseText);
         document.getElementById("signup-error").innerHTML = object['msg'];

            }

         }

      }
      xhr.send(payloadString);


   }



}

signin_validator = function(){
   var email = document.getElementById("email_in").value;
   var password = document.getElementById("psw_in").value;
   const payload ={
      "email" : email,
      "password" : password

   };

   var host = location.host;
   const payloadString = JSON.stringify(payload)

   let xhr = new XMLHttpRequest();
   xhr.open("POST" , "/sign_in" ,true);
   xhr.setRequestHeader("Content-type", "application/json");
   xhr.onreadystatechange = () =>{
      if(xhr.readyState === 4 && xhr.status === 200){
         let object  = JSON.parse(xhr.responseText);
         if (object['success'] == true){
            profileLoader(object['token']);
            var msg = {
               type : "login",
               email : email
               }

               connectWS();

               webSocket.onopen = function () {
                   //console.log("ws open");
                   webSocket.send(JSON.stringify(msg));
               }
         }
         else{
            console.log("something happende  - 151");
         }


      }
      else{
         let object  = JSON.parse(xhr.responseText);
      document.getElementById("login-error").innerHTML = object['msg'];
}

   }
   xhr.send(payloadString);
}








change_pass = function(){

   var oldPassword = document.getElementById("old_psw").value;
   var password = document.getElementById("psw_up").value;
   var password2 = document.getElementById("psw-repeat").value;


   if(password.length < 10  ) {
      document.getElementById("cp-error").innerHTML = "Password must contain at least 10 signs";
  } else if(password != password2)
  {

    document.getElementById("cp-error").innerHTML = "Passwords did not match";
  }
  else {
     var token = localStorage.getItem("token", token)
     const payload ={
      "token" : token,
      "newpassword":password,
      "oldpassword":oldPassword
   };

   const payloadString = JSON.stringify(payload)

   let xhr = new XMLHttpRequest();
   xhr.open("POST" , "/change_password" ,true);
   xhr.setRequestHeader("Content-type", "application/json");
   xhr.onreadystatechange = () =>{
      if(xhr.readyState === 4 && xhr.status === 200){
      let object  = JSON.parse(xhr.responseText);
      const cperror  = object.message;
     document.getElementById("cp-error").innerHTML = cperror;
     oldPassword = document.getElementById("old_psw").value = ""; //Clear all fields after password change
     password = document.getElementById("psw_up").value = "";
     password2 = document.getElementById("psw-repeat").value ="";


  }
}
xhr.send(payloadString);
}


}

load = function(token){

   const payload ={
      "token" : token
   };

   const payloadString = JSON.stringify(payload)

   let xhr = new XMLHttpRequest();
   xhr.open("POST" , "/data_by_token" ,true);
   xhr.setRequestHeader("Content-type", "application/json");
   xhr.onreadystatechange = () =>{
      if(xhr.readyState === 4 && xhr.status === 200){
         let object  = JSON.parse(xhr.responseText);
         const person_object  = object.data;
         this_email = person_object.email
         document.getElementById("hfirstname").innerHTML = person_object.firstname;
         document.getElementById("hfamilyname").innerHTML = person_object.familyname;
         document.getElementById("hemail").innerHTML = person_object.email;
         document.getElementById("hgender").innerHTML = person_object.gender;
         document.getElementById("hcity").innerHTML = person_object.city;
         document.getElementById("hcountry").innerHTML = person_object.country;

         document.getElementById("hfirstname").innerHTML = person_object.firstname;
         localStorage.setItem("email" , person_object.email);
      }
      else{
         //let object  = JSON.parse(xhr.responseText);
         console.log("msg");
         //document.getElementById("login-error").innerHTML = object["msg"];
      }

   }
   xhr.send(payloadString);


}

load_msgs = function(token){
   token = localStorage.getItem("token");
   const payload ={
      "token" : token
   };

   const payloadString = JSON.stringify(payload)

   let xhr = new XMLHttpRequest();
   xhr.open("POST" , "/messages_token" ,true);
   xhr.setRequestHeader("Content-type", "application/json");
   xhr.onreadystatechange = () =>{
      if(xhr.readyState === 4 && xhr.status === 200){
         let messages  = JSON.parse(xhr.responseText);
         console.log(messages[0]);
         document.getElementById('msgs').innerHTML = "";
         var listDiv = document.getElementById('msgs');
         var ul=document.createElement('ul');
         listDiv.appendChild(ul);

   for (var i = 0; i < messages.length; ++i) {
      var li=document.createElement('li' );
      var textnode = document.createTextNode(messages[i].content);
      var writer = document.createTextNode(messages[i].writer);
      var location = document.createTextNode(messages[i].location);

      li.appendChild(textnode);
      li.appendChild(writer);
      li.appendChild(location);
      ul.appendChild(li);

      }}
      else{
         console.log("msg");
         }


   }
xhr.send(payloadString);
}

signout = function(){
   var token = localStorage.getItem('token');

   const payload ={
      "token" : token

   };

   const payloadString = JSON.stringify(payload)

   let xhr = new XMLHttpRequest();
   xhr.open("POST" , "/sign_out" ,true);
   xhr.setRequestHeader("Content-type", "application/json");
   xhr.onreadystatechange = () =>{
      if(xhr.readyState === 4 && xhr.status === 200){
         let object  = JSON.parse(xhr.responseText);
         if (object['success'] == true){
            localStorage.removeItem('token');
            localStorage.removeItem('email');

            var welcome_wraper = document.getElementById("welcomeview").innerHTML;
            document.getElementById("welcomeview-wraper").innerHTML = welcome_wraper;

            var navigation_wraper = document.getElementById("navigationview").innerHTML;
            document.getElementById("navigation-wraper").innerHTML = "";

            var content_wraper = document.getElementById("contentview").innerHTML;
            document.getElementById("content-wraper").innerHTML = "";

         }
         else{
            console.log("something happende  - 151");
         }


      }

   }
   xhr.send(payloadString);

}


postmsg = function(){
   var content = document.getElementById("psm").value;
   var token = localStorage.getItem('token');
   var email = localStorage.getItem('email');
   var location = geolocation()
   console.log("pfk");

   const payload ={
      "token" : token,
      "message" : content,
      "email":email,
      "location": location
   };
   const payloadString = JSON.stringify(payload)

   let xhr = new XMLHttpRequest();
   xhr.open("POST" , "/post_message" ,true);
   xhr.setRequestHeader("Content-type", "application/json");
   xhr.onreadystatechange = () =>{
      if(xhr.readyState === 4 && xhr.status === 200){
         let object  = JSON.parse(xhr.responseText);
         if (object['success'] == true){
            console.log("sucedd");
         }
         else{
            console.log("something happende  - 151");
         }


}

   }
   xhr.send(payloadString);

}

function reloadwall(){ //see other Users wall on their home tab
  var token = localStorage.getItem('token');
  var wanted_email = document.getElementById("usersearch").value;
  let xhr = new XMLHttpRequest();
   xhr.open("POST" , "/messages_email/"+wanted_email,true);
   xhr.setRequestHeader("Content-type", "application/json");
   xhr.onreadystatechange = () =>{
      if(xhr.readyState === 4 && xhr.status === 200){
         let messages  = JSON.parse(xhr.responseText);
         console.log(messages[0]);
         document.getElementById('usermsgs').innerHTML = "";
         var listDiv = document.getElementById('usermsgs');
         var ul=document.createElement('ul');
         listDiv.appendChild(ul);

   for (var i = 0; i < messages.length; ++i) {
      var li=document.createElement('li' );
      var textnode = document.createTextNode(messages[i].content);
      var writer = document.createTextNode(messages[i].writer);
      var location = document.createTextNode(messages[i].location)
      li.appendChild(textnode);
      li.appendChild(writer);
      li.appendChild(location)
      ul.appendChild(li);

      }}
         else{
            console.log("something happende  - 151");



         }


}
xhr.send();
   }



function postonwall(){ //send message to user while visiting home tab
  var token = localStorage.getItem('token');
  var wanted_email = document.getElementById("usersearch").value;
  var content = document.getElementById("wallpsm").value;
  var location = geolocation();
  const payload ={
   "token" : token,
   "message" : content,
   "email":wanted_email,
   "location":location
};
const payloadString = JSON.stringify(payload)

let xhr = new XMLHttpRequest();
xhr.open("POST" , "/post_message" ,true);
xhr.setRequestHeader("Content-type", "application/json");
xhr.onreadystatechange = () =>{
   if(xhr.readyState === 4 && xhr.status === 200){
      let object  = JSON.parse(xhr.responseText);
      if (object['success'] == true){
         console.log("sucedd");
      }
      else{
         console.log("something happende  - 151");
      }


}

}
xhr.send(payloadString);

}

search_user = function(){
   var wanted_email = document.getElementById("usersearch").value;
   var token = localStorage.getItem('token');
   var wanted_user = serverstub.getUserDataByEmail(token, wanted_email);


   let xhr = new XMLHttpRequest();
   xhr.open("POST" , "/data_email/" + wanted_email ,true);
   xhr.setRequestHeader("Content-type", "application/json");
   xhr.onreadystatechange = () =>{
      if(xhr.readyState === 4 && xhr.status === 200){
         let wanted_user  = JSON.parse(xhr.responseText);
         if (wanted_user['success'] == true){
            console.log("ok-user");
            var wall_wraper = document.getElementById("wallpost").innerHTML;
            document.getElementById("browse-wrapper").innerHTML = wall_wraper;  //fill in user data
            document.getElementById("ufirstname").innerHTML = wanted_user.data.firstname;
            document.getElementById("ufamilyname").innerHTML = wanted_user.data.familyname;
            document.getElementById("uemail").innerHTML = wanted_user.data.email;
            document.getElementById("ugender").innerHTML = wanted_user.data.gender;
            document.getElementById("ucity").innerHTML = wanted_user.data.city;
            document.getElementById("ucountry").innerHTML = wanted_user.data.country;

          reloadwall(); //display messages
          postonwall(); //send message directly to user
         }
         else{
            console.log("something happende  - 151");
            document.getElementById("browse-wrapper").innerHTML = wanted_user.message;

         }


}

   }
   xhr.send();


};

/*function geolocation(){
  if document.getElementById('enable location').checked
  {
    if (navigator.geolocation) {
    position = navigator.geolocation.getCurrentPosition();
  } else {
    document.getElementById(locationError).innerHTML = "Geolocation is not supported by this browser.";
  }
  lat = position.coord.latitude;
  long = position.coord.longitude;
  location = lat + ","+long;
  let xhr = new XMLHttpRequest();

  xhr.open("GET" , "https://geocode.xyz/?locate="+location,true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = () =>{
     if(xhr.readyState === 4 && xhr.status === 200){
        let location  = JSON.parse(xhr.responseText);

  }
   xhr.send();
};
function allowDrop(ev){
  ev.preventDefault();
}
function drag(ev){
  ev.dataTransfer.setData("text", ev.target.id);
}
*/
