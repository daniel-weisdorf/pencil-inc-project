"use strict";

let app = angular.module("myApp", []);

// This isn't a big enough application to warrant multi-page and splitting out of functions into separate controllers etc.
app.controller("MainController", function ($scope) {
  // Initial setup
  let provider = new firebase.auth.GoogleAuthProvider();
  let database = firebase.database();

  $scope.page = 0;

  let mediumEditor = new MediumEditor(".editable");

  // Update database every time the editor is updated
  // Also check for latex constantly
  mediumEditor.subscribe("editableInput", function () {
    database.ref("users/" + localStorage.getItem("token")).set({
      data: mediumEditor.getContent(),
    });
  });

  // Load editor values when going to the editor page
  let goToEditor = function () {
    $scope.page = 1;

    database
      .ref("users/" + localStorage.getItem("token"))
      .once("value")
      .then(function (dataSnapshot) {
        mediumEditor.setContent(dataSnapshot.val().data);
      });
  };

  // On initial load - if you have a login token already, go straight to editor page
  if (localStorage.getItem("token")) {
    goToEditor();
  }

  // Functions for later
  $scope.signIn = function () {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        let email = result.user.email;
        // Strip out the @ and . symbols (invalid in keys in the database)
        let userId = email.replace("@", "").replace(".", "");

        localStorage.setItem("token", userId);
        $scope.$apply(function () {
          goToEditor();
        });
      })
      .catch(function () {});
  };

  // Clears token so you can log in as someone else
  $scope.logout = function () {
    localStorage.removeItem("token");
    $scope.page = 0;
  };
});
