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
    let contents = mediumEditor.getContent();
    // Latex check

    let firstDollar = contents.indexOf("$");
    if (firstDollar !== -1) {
      console.log;
      let secondDollar = contents.indexOf("$", firstDollar + 1);
      if (secondDollar !== -1) {
        // Unfortunately at this point we have to assume that whatever Latex they wrote is good and we replace it with a hotlink to an online api that will render it for them
        // Realistically, writing a Latex validator for this project and only replacing valid Latex is... much more than anyone should be asked of for a project like this

        let latexExpression = contents.substring(firstDollar + 1, secondDollar);
        let latexElement =
          '<img src="https://latex.codecogs.com/gif.latex?' +
          latexExpression +
          '" title="" style="">';

        console.log(latexElement);
        console.log(latexExpression);

        contents = contents
          .replace(latexExpression, latexElement)
          .replace(/[$]/g, "");

        mediumEditor.setContent(contents);
      }
    }

    database.ref("users/" + localStorage.getItem("token")).set({
      data: contents,
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
        let userId = email.replace(/[@]/g, "").replace(/[.]/g, "");

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
