// Inicializando  Firebase
initFirebase();
let userUID = localStorage.currentUser;
welcomeUser(userUID);
//redireccionando al muro
function welcomeUser(uid) {
  var profile = firebase.database().ref().child('users/'+uid);
  profile.on('value', snap => {
    let userData = JSON.stringify(snap.val(),null,3);//tbm funciona un solo parametro
    userData = JSON.parse(userData);
    console.log(userData);
    console.log(userData.nombre);
    document.getElementById("userName").innerHTML = userData.nombre;
    document.getElementById('userPhoto').innerHTML = "<img width='100px' class='circle img-responsive' src='"+userData.foto+"  '/>"
    document.getElementById('userEmail').innerHTML = userData.email;
  })
  let muroPosts = document.getElementById('myPosts');
  muroPosts.innerHTML = '';
  chargePosts(userUID,muroPosts);
  chargeFriendPosts();
  chargeNotifications();
}
//escribiendo publicaciones
document.getElementById('savePost').addEventListener("click", savePost)
function savePost() {
  let message = document.getElementById('currentPost').value;
  document.getElementById('currentPost').value = '';
  let userUID = firebase.auth().currentUser.uid;
  let optionValue = document.getElementById('privateOptions');
  optionValue = optionValue.options[optionValue.selectedIndex].value;
  firebase.database().ref('users/'+userUID+'/publicaciones').push({
    optionValue,
    message
  });
  let muroPosts = document.getElementById('myPosts');
  muroPosts.innerHTML = '';
  chargePosts(userUID, muroPosts);
};
//mostrando todos las publicaciones del usuario actual
function chargePosts(userUID, muroPosts) {
  muroPosts.innerHTML ='';
  firebase.database().ref('users/'+userUID+'/publicaciones')
  .on('child_added', function(snapshot) {
     var objPost = snapshot.val();
     console.log(objPost);
     let aux = 0;
     var profile = firebase.database().ref().child('users/'+userUID);
     profile.on('value', snap => {
       let userData = JSON.stringify(snap.val(),null,3);//tbm funciona un solo parametro
       userData = JSON.parse(userData);
       muroPosts.innerHTML += "<img width='100px' class='circle img-responsive' src='"+userData.foto+"  '/>";
       muroPosts.innerHTML += `
       <div>
       <textarea id=${snapshot.key} class="collection-item avatar">${objPost.message}</textarea>
       <a href="#!" class="secondary-content"><i class="material-icons">favorite_border</i></a></li>
       <button  onclick="removePost('${snapshot.key}','${userUID}')" >DELETE</button>
       <button id=${snapshot.key + 'b'} onclick="editPost('${snapshot.key}','${userUID}','${objPost.usuario}','${objPost.optionValue}','${aux}','${snapshot.key + 'b'}')">Update</button>
       </div>
       `;
       // document.getElementById(snapshot.key).disabled = true;
     })
  });
}
//eliminar post
function removePost(idPost, userUID) {
 console.log("se va a borrar")
 //Ingresamos un mensaje a mostrar
 let mensaje = confirm("¿Deseas eliminar el POST");
 //Detectamos si el usuario acepto el mensaje
 if (mensaje) {
   console.log(idPost)
   console.log(userUID)
   let dbRefObjectUsersPosts = firebase.database().ref().child('users-posts')
   firebase.database().ref().child('users/' + userUID + '/publicaciones/' + idPost).remove();
   muroPosts = document.getElementById('myFriendsPost');
   while (muroPosts.firstChild) muroPosts.removeChild(muroPosts.firstChild);
   chargePosts(userUID, muroPosts);
 }
 //Detectamos si el usuario denegó el mensaje
 else {
   alert("¡Haz denegado la eliminacion del post !");
 }
}
//editar pulicaciones
function editPost(idPost, userUID, usuario, option, aux, btn) {
 console.log("voy a editar")
 const newUpdate = document.getElementById(idPost);
 const boton = document.getElementById(btn);
 boton.innerHTML = 'Guardar';
 if (aux == 0) {
   console.log("false")
   newUpdate.disabled = false;
   aux = 1;
   console.log(aux)
 } else {
   console.log("true")
   newUpdate.disabled = true;
   aux = 0;
 }
 const nuevoPost = {
   optionValue: option,
   message: newUpdate.value
   // usuario: usuario
 };
 console.log(nuevoPost)
 var updatesUser = {};
 var updatesPost = {};


 updatesUser['users/' + userUID + '/publicaciones/' + idPost] = nuevoPost;
 firebase.database().ref().update(updatesUser);
 console.log("no funciona")
 let muroPosts = document.getElementById('myPosts');
 muroPosts.innerHTML = '';
 chargePosts(userUID, muroPosts);
}
//cargar las Notificaciones
function chargeNotifications() {
  firebase.database().ref('users/'+userUID+'/notificaciones')
  .on('value', function(snapshot) {
    let myNotifications = [];
    let notificationData = JSON.stringify(snapshot.val(),null,3);//tbm funciona un solo parametro
    notificationData = JSON.parse(notificationData);
    let notifications = Object.keys(notificationData);
    console.log(notifications)
    for(i=0; i<notifications.length; i++) {
      let mensaje = (notificationData[notifications[i]].message);
      console.log(mensaje);
      myNotifications.push(mensaje);
      console.log(myNotifications);

    }
    let friendNotifications = document.getElementById('notifications');
    friendNotifications.innerHTML = '';
    myNotifications.forEach(function(element) {
      friendNotifications.innerHTML += '<li>';
      friendNotifications.innerHTML += element;
      friendNotifications.innerHTML += '</li>';

    });

  });
}

//mostrando la lista de usuarios registrados por busqueda
document.getElementById('searchText').addEventListener('input', () =>{
  let wordSearch = document.getElementById('searchText').value;
})
document.getElementById('buttonSearch').addEventListener('click', ()=>{
  document.getElementById('userFilterList').innerHTML = '';
  firebase.database().ref("users")
    .on("child_added", function(s){
      let wordSearch = document.getElementById('searchText').value;
      var user = s.val();
      if((user.nombre.toUpperCase()).indexOf(wordSearch.toUpperCase())!==-1){
        $('#userFilterList').append(`
        <div class='row'>
          <img class='col s4 m2 circle' width=100px class="circle" src= ${user.foto} />
          <p class='col s6 m10'> ${user.nombre} </p>
          <button class='btn-small col s2 m2' value= ${user.uid} onclick= "followPeople()">Seguir</button>
        </div>
        `);
      }
    })
})
//funcion para almacenar uid de seguidores
function followPeople() {
  //amigos 0 si son amigos y 1 si no son amigos
  let uidFollow = event.target.value;
  firebase.database().ref('users/'+userUID+'/quienes-sigo').push({
    uidFollow,
    habilitado : 1
  });
  let userName = document.getElementById('userName').innerHTML;
  firebase.database().ref('users/'+uidFollow+'/notificaciones').push({
    message : userName + ' quiere ser tu amigo'
  });
  console.log(uidFollow);
}
//funcion para dejar de seguir a alguie
//funciones para los botones de redireccionamiento
document.getElementById('signOut').addEventListener('click', closeSession);
//funcion para cerrar sesion
function closeSession() {
  firebase.auth().signOut()
    .then(function () {
      document.location.href = 'index.html';
    })
    .catch(function (error) {
      console.log(error);
    })
}

document.getElementById('btn-home').addEventListener('click', redirectHome);
function redirectHome() {
  document.getElementById('home').style.display = 'block';
  document.getElementById('myNotifications').style.display = 'none';
  document.getElementById('search').style.display = 'none';
  document.getElementById('userProfile').style.display = 'none';
}

document.getElementById('btn-search').addEventListener('click', redirectSearch);
function redirectSearch() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('myNotifications').style.display = 'none';
  document.getElementById('search').style.display = 'block';
  document.getElementById('userProfile').style.display = 'none';
}

document.getElementById('btn-notification').addEventListener('click', redirectNotification);
function redirectNotification() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('myNotifications').style.display = 'block';
  document.getElementById('search').style.display = 'none';
  document.getElementById('userProfile').style.display = 'none';
}

document.getElementById('btn-userProfile').addEventListener('click', redirectProfile);
function redirectProfile() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('myNotifications').style.display = 'none';
  document.getElementById('search').style.display = 'none';
  document.getElementById('userProfile').style.display = 'block';
}

document.getElementById('myNotifications').style.display = 'none';
document.getElementById('search').style.display = 'none';
document.getElementById('userProfile').style.display = 'none';
