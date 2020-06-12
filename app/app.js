"use strict";

let app = angular.module("myApp", []);

// This isn't a big enough application to warrant multi-page and splitting out of functions into separate controllers etc.
app.controller("MainController", function ($scope) {
  // Initial run
  let provider = new firebase.auth.GoogleAuthProvider();
  let database = firebase.database();

  $scope.page = 0;

  let mediumEditor = new MediumEditor(".editable");

  mediumEditor.subscribe("editableInput", function () {
    database.ref("users/" + localStorage.getItem("token")).set({
      data: mediumEditor.getContent(),
    });
  });

  let queueEditor = async function () {
    $scope.page = 1;

    database
      .ref("users/" + localStorage.getItem("token"))
      .once("value")
      .then(function (dataSnapshot) {
        mediumEditor.setContent(dataSnapshot.val().data);
      });
  };

  if (localStorage.getItem("token")) {
    queueEditor();
  }

  // Functions for later
  $scope.signIn = function () {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        let email = result.user.email;
        let userId = email.substring(0, email.indexOf("@")).replace(".", "");

        localStorage.setItem("token", userId); // easy unique key for the json
        console.log(result.user.email);
        $scope.$apply(function () {
          queueEditor();
        });
      })
      .catch(function () {
        alert("Login seems to have failed, maybe try again?");
      });
  };

  $scope.logout = function () {
    localStorage.removeItem("token");
    $scope.page = 0;
  };
});
