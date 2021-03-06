/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Passwords = require('machinepack-passwords')
// var passport = require('passport')

module.exports = {
    loginUser: function(request, response) {
        var email = request.body.email;
        var password = request.body.password;

        // Retrieve results so that unique user can be verified, and password may be checked against stored, encrypted password
        GnomeUsersAPI.find().where({'email':email})
        .exec(function(error, result) {
            if(error) {
                console.log('error: ' + error)
                response.send("error");
            } else {
                if(result.length > 1) {
                    // Make sure length == 1.  If not, dupe user
                    console.log("Dupe user error!");
                    return response.send("error");
                } else if (result.length == 0) {
                    // If no user was found, entered incorrect info
                    console.log("No user found!");
                    return response.send("login-fail");
                }
                // Get user information from result. Will be used later for session info
                var encryptedPassword = result[0].password;
                var userId = result[0].id;
                var email = result[0].email;
                var firstName = result[0].firstname;
                var lastName = result[0].lastname;
                console.log('encryptedPass: ' + encryptedPassword + ' password: ' + password + ' userId: ' + userId + ' email: ' + email + ' firstName: ' + firstName + ' lastName: ' + lastName)
                // Verify password input against encrypted password
                Passwords.checkPassword({
                    passwordAttempt: password,
                    encryptedPassword: encryptedPassword,
                }).exec({
                    // An unexpected error occurred.
                    error: function (err){
                        console.log('Unexpected password encryption error')
                        response.send("error");
                    },
                    // Password attempt does not match already-encrypted version
                    incorrect: function (){
                        console.log('User-entered password does not match the stored password.')
                        response.send("login-fail");
                    },
                    // User verified. Add current user information to session here, for later use
                    // Note: There is currently no time expiration on the session. If you would like to set an expiration, do like the following, but edit the time allotted:
                    // var oldDateObj = new Date()
                    // var newDateObj = new Date(oldDateObj.getTime() * 600000)
                    // req.session.cookie.expires = newDateObj;
                    success: function (){
                        console.log('User was verified!')
                        request.session.authenticated = true;
                        request.session.userId = userId;
                        request.session.email = email;
                        request.session.firstName = firstName;
                        request.session.lastName = lastName;

                        console.log('session info: ' , request.session)
                        // Send success status. Dashboard page will be loaded client-side
                        response.send("success");
                    },
                })
            }
        })
    },

    logoutUser: function(request, response) {
        // Set user session to false
        request.session.destroy();
        response.redirect('/');
    }
    // facebook: function(request, response) {
    //     passport.authenticate('facebook', {
    //         failureRedirect: '/index', scope:['email'] }, function(err, user) {
    //             request.logIn(user, function(err) {
    //                 if(err) {
    //                     console.log(err)
    //                     response.view('500')
    //                     return;
    //                 }
    //                 response.redirect('/Dashboard')
    //                 return;
    //             })
    //         })
    //     })
    // }
};