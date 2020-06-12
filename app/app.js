"use strict";

let app = angular.module("myApp", []);

// This isn't a big enough application to warrant multi-page and splitting out of functions into separate controllers etc.
app.controller("MainController", function ($scope) {
  $scope.page = 0;
  if (localStorage.getItem("token")) {
    $scope.page = 1;
  }
  let provider = new firebase.auth.GoogleAuthProvider();

  $scope.signIn = function () {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        localStorage.setItem("token", result.credential.accessToken); // this is the epitome of safety
        $scope.$apply(function () {
          $scope.page = 1;
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
