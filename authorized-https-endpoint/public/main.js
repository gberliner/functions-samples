/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes the Demo.
function Demo() {
  document.addEventListener('DOMContentLoaded', function() {
    // Shortcuts to DOM Elements.
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://apis.google.com/js/platform.js?onload=init';
    script.onload = (e) => {
      new Promise((resolve, reject) => {
        gapi.load('auth2', () => {
          resolve()
        })
      })
      .then(() => { console.log('gapi: auth2 loaded', gapi.auth2) })
      .then(() => {
        return gapi.auth2.init({
          clientId: "145312058396-emkt8c08pfh3lg6goiih40b7an761ket.apps.googleusercontent.com"
        })
      })
      .then(() => { console.log('gapi: client initialized') })
      .then(() => {
          this.signInButton = document.getElementById('demo-sign-in-button');
          this.signOutButton = document.getElementById('demo-sign-out-button');
          this.responseContainer = document.getElementById('demo-response');
          this.responseContainerCookie = document.getElementById('demo-response-cookie');
          this.urlContainer = document.getElementById('demo-url');
          this.urlContainerCookie = document.getElementById('demo-url-cookie');
          this.helloUserUrl = window.location.href + 'hello';
          this.signedOutCard = document.getElementById('demo-signed-out-card');
          this.signedInCard = document.getElementById('demo-signed-in-card');
      
          // Bind events.
          this.signInButton.addEventListener('click', this.signIn.bind(this));
          this.signOutButton.addEventListener('click', this.signOut.bind(this));
          firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
      })        
      
      // bind this to your single page app...
     
    }
    document.getElementsByTagName('head')[0].appendChild(script);
   
  }.bind(this));
}

// Triggered on Firebase auth state change.
Demo.prototype.onAuthStateChanged = function(user) {
  if (user) {
    this.urlContainer.textContent = this.helloUserUrl;
    this.urlContainerCookie.textContent = this.helloUserUrl;
    this.signedOutCard.style.display = 'none';
    this.signedInCard.style.display = 'block';
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.then(function () {
        this.startFunctionsRequest();
        this.startFunctionsCookieRequest();
    }.bind(this));
  } else {
    this.signedOutCard.style.display = 'block';
    this.signedInCard.style.display = 'none';
  }
};

// Initiates the sign-in flow using GoogleAuthProvider sign in in a popup.
Demo.prototype.signIn = function() {
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
};

// Signs-out of Firebase.
Demo.prototype.signOut = function() {
  const auth2 = gapi.auth2.getAuthInstance()
  auth2.signOut()
  .then(() => { console.log('gapi: sign out complete') })
  .then(() => { return firebase.auth().signOut() })
  .then(() => { console.log('firebase: sign out complete') });
  // clear the __session cookie
  document.cookie = '__session=';
};

// Does an authenticated request to a Firebase Functions endpoint using an Authorization header.
Demo.prototype.startFunctionsRequest = function() {
  firebase.auth().currentUser.getIdToken().then((token) => {
    const auth2 = gapi.auth2.getAuthInstance();
    const rc = this.responseContainer;
    const userUrl = this.helloUserUrl;
    auth2.signIn().then(function() {
      const currentUser = auth2.currentUser.get()
      const idToken = currentUser.getAuthResponse(true).id_token
      console.log('Sending startfunctionsrequest request to', userUrl, 'with ID token in Authorization header.');
      console.log('value of id token is: ' + idToken)  
      var tokenObj = {
        id_token: idToken
      };
      fetch("/hello",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": 'Bearer ' + token
        },
        mode: "cors",
        body: JSON.stringify(tokenObj)
      }).then(response => {
        return response.json();
      }).then(json => {
        rc.innerText = JSON.stringify(json);
        console.log("the response was: " + JSON.stringify(json))
      }).catch(console.error);
    })
      .catch(error => console.error('Error:', error));;
      // req.onload = function() {
      //   this.responseContainer.innerText = req.responseText;
      // }.bind(this);
      // req.onerror = function() {
      //   this.responseContainer.innerText = 'There was an error';
      // }.bind(this);
      // req.setRequestHeader('Authorization', 'Bearer ' + token);
      // req.setRequestHeader("Content-Type","application/json")
      // req.open('POST', this.helloUserUrl, true);
      // req.send();
    }).catch(console.error);
  }; 


// Does an authenticated request to a Firebase Functions endpoint using a __session cookie.
Demo.prototype.startFunctionsCookieRequest = function() {
  // Set the __session cookie.
  var userUrl = this.helloUserUrl;
  const rc = this.responseContainerCookie;

  firebase.auth().currentUser.getIdToken(true).then(function(token) {
    // set the __session cookie
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signIn().then(function() {
      const currentUser = auth2.currentUser.get()
      const idToken = currentUser.getAuthResponse(true).id_token
      document.cookie = '__session=' + token + ';max-age=3600';

      console.log('Sending request to', userUrl, 'with ID token in __session cookie.');
      var tokenObj = {
        id_token: idToken
      };
      console.log('value of id token is: ' + JSON.stringify(tokenObj));
      fetch("/hello",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": 'Bearer ' + token
        },
        mode: "cors",
        body: JSON.stringify(tokenObj)
      }).then(response => {
        return response.json();
      }).then(json => {
        rc.innerText = JSON.stringify(json);
        console.log('Success:', JSON.stringify(json));
      })
      .catch(error => console.error('Error:', error));;;
    });
    // var req = new XMLHttpRequest();
    // req.onload = function() {
    //   this.responseContainerCookie.innerText = req.responseText;
    // }.bind(this);
    // req.onerror = function() {
    //   this.responseContainerCookie.innerText = 'There was an error';
    // }.bind(this);
    // req.setRequestHeader('Authorization', 'Bearer ' + token);
    // req.setRequestHeader("Content-Type","application/json")
    // req.open('POST', this.helloUserUrl, true);
    // req.send();
  }.bind(this));
}

// Load the demo.
window.demo = new Demo();
