/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START app]
'use strict';

const express = require('express');
var plivo = require('plivo');
var bodyParser = require('body-parser');

var firebase = require('firebase');
var FCM = require('fcm-node');

const app = express();
var http = require("http").createServer(app);
var io = require('socket.io')(http);
var api = plivo.RestAPI({
  authId: 'MAYTVKZTNMNDUXMWVIOT',
  authToken: 'MDI2NmMzMzQ4OTY1MTVlMDdhZDEwOWIxOTUxODNm'
});

/// initial restful API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Firebase Initial 
var serverKey = 'AIzaSyBCrUUt6zSfkXSzOb_76-2e1FvRHY77AM0';

var fcm = new FCM(serverKey);
// initial firebase config 
  var config = {
    apiKey: "AIzaSyDTzZFaP-xJ22Zw9PmoLdT4DnJy2s1j-Zk",
    authDomain: "nevermyndapp-159322.firebaseapp.com",
    databaseURL: "https://nevermyndapp-159322.firebaseio.com",
    storageBucket: "nevermyndapp-159322.appspot.com",
    messagingSenderId: "290168181007"
  };
  firebase.initializeApp(config);

// initial storage , database

var defaultDatabase = firebase.database();


// initial restful API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var recentDatabase = defaultDatabase.ref('Recent');
var userDatabase = defaultDatabase.ref('User');
var messageDatabase = defaultDatabase.ref('Message');


var count; 
var otheruserId ;
var otherRecentId ;
var message ;
var myId ;
var otherRecentModel;
var otherUserModel;
var myUserModel;
var myName;
var groupId;
var chatType;

var myPhoneNumber; 
var phoneNumber;


/// push notification //////
app.post('/sendPush', function(req, res) {
    otheruserId = req.body.otheruserId;
    otherRecentId = req.body.otherRecentId;
    message = req.body.message;
    groupId = req.body.groupId;
    myName = req.body.myName;
    calculateUnreadCount(res);
});

////// Check user is exist ///////
app.post('/isExists', function(req, res) {
    phoneNumber = req.body.phoneNumber;
    
    getMyAccount(res);
});


///// Check chat room exists //// 

app.post('/checkChat', function(req, res) {
    phoneNumber = req.body.otherPhone;
    myPhoneNumber = req.body.myPhone;
    chatType = req.body.chatType;
    checkChat_getMe(res);
});


//// Socket IO ///////
io.sockets.on('connection', function(socket) {
  socket.on('checkUser', function(data) {
    // socket.emit('resultUser', data.number);
    getMyAccount_IO(socket, data.number);
    socket.emit('echo two', data);
  });   
});

function getMyAccount_IO(socket, number)
{
    userDatabase.child(number).once('value').then(function(snapshot) {
            var userModel = {
                firstname : snapshot.val().firstname,
                lastname: snapshot.val().lastname,
                createdAt: snapshot.val().createdAt,
                phoneNumber: snapshot.val().phoneNumber,
                photo_url: snapshot.val().photo_url,
                state: snapshot.val().state,
                token: snapshot.val().token,
                updatedAt: snapshot.val().updatedAt,
                phone: snapshot.val().phone,
                objectId: snapshot.val().objectId
            };
            var result = ({'result': userModel, 'error': 'nil'}).json;
            socket.emit('resultUser', result);
        })
        .catch(function(error) {
            var result = ({result: "get Model error", error: '500'}).json;
            socket.emit('resultUser', result);
        });
}

///////////
function checkChat_CreateChat(res)
{
    var newPostRef = messageDatabase.push();
    var groupId = newPostRef.key;
    var recentKey1 = recentDatabase.push().key;
    var recentKey2 = recentDatabase.push().key;
    var timeStamp = (new Date).getTime();
    var phoneList1 = [phoneNumber];
    var phoneList2 = [myPhoneNumber];
    var keyList1 = [recentKey2];
    var keyList2 = [recentKey1];
    var otherId = phoneNumber;
    var recentModel1, recentModel2;

    if (phoneNumber == myPhoneNumber)  otherId = myPhoneNumber + "1234567890";

    if (chatType == 'Public')
    {
        recentModel1 = {
                PhoneNumbers : phoneList1,
                counter: '0',
                createdAt: timeStamp.toString(),
                groupId: groupId,
                groupname: '',
                isArchived: '',
                isDeleted: '',
                lastMessage: '',
                lastMessageDate: '0',
                members: keyList1,
                objectId: recentKey1,
                password: '',
                picture: otherUserModel.photo_url,
                
                type: chatType,
                updatedAt: timeStamp.toString(),
                userId: myPhoneNumber
        };
        recentModel2 = {
                PhoneNumbers : phoneList2,
                counter: '0',
                createdAt: timeStamp.toString(),
                groupId: groupId,
                groupname: '',
                isArchived: '',
                isDeleted: '',
                lastMessage: '',
                lastMessageDate: '0',
                members: keyList2,
                objectId: recentKey2,
                password: '',
                picture: myUserModel.photo_url,
                type: chatType,
                updatedAt: timeStamp.toString(),
                userId: otherId
        };
        recentDatabase.child(recentKey1).set(recentModel1);
        recentDatabase.child(recentKey2).set(recentModel2);
        res.json({result: recentModel1, error:"nil"});
    }
    else 
    {
        recentModel1 = {
                PhoneNumbers : phoneList1,
                counter: '0',
                createdAt: timeStamp.toString(),
                groupId: groupId,
                groupname: '',
                isArchived: '',
                isDeleted: '',
                lastMessage: '',
                lastMessageDate: '0',
                members: keyList1,
                objectId: recentKey1,
                password: groupId,
                picture: otherUserModel.photo_url,
                type: chatType,
                updatedAt: timeStamp.toString(),
                userId: myPhoneNumber
        };
        recentModel2 = {
                PhoneNumbers : phoneList2,
                counter: '0',
                createdAt: timeStamp.toString(),
                groupId: groupId,
                groupname: '',
                isArchived: '',
                isDeleted: '',
                lastMessage: '',
                lastMessageDate: '0',
                members: keyList2,
                objectId: recentKey2,
                password: groupId,
                picture: myUserModel.photo_url,
                type: chatType,
                updatedAt: timeStamp.toString(),
                userId: otherId
        };
        recentDatabase.child(recentKey1).set(recentModel1);
        recentDatabase.child(recentKey2).set(recentModel2);
        res.json({result: recentModel1, error:"nil"});
    }

}
function checkChat_myRecent(res)
{
    recentDatabase.orderByChild("userId").equalTo(myPhoneNumber).once('value').then(function(snapshot) {
        count = 0;
        var myRecentModel = null;
          snapshot.forEach(function(childSnapshot) 
          {
                var list = childSnapshot.val().PhoneNumbers;
                var ty = childSnapshot.val().type;
                if (ty == chatType) 
                {
                    list.forEach(function(entry) 
                    {
                        if (entry == phoneNumber)
                        {
                            myRecentModel = 
                            {
                                PhoneNumbers : childSnapshot.val().PhoneNumbers,
                                counter: childSnapshot.val().counter,
                                createdAt: childSnapshot.val().createdAt,
                                groupId: childSnapshot.val().groupId,
                                groupname: childSnapshot.val().groupname,
                                isArchived: childSnapshot.val().isArchived,
                                isDeleted: childSnapshot.val().isDeleted,
                                lastMessage: childSnapshot.val().lastMessage,
                                lastMessageDate: childSnapshot.val().lastMessageDate,
                                members: childSnapshot.val().members,
                                objectId: childSnapshot.val().objectId,
                                password: childSnapshot.val().password,
                                picture: childSnapshot.val().picture,
                                type: childSnapshot.val().type,
                                updatedAt: childSnapshot.val().updatedAt,
                                userId: childSnapshot.val().userId
                            };
                            res.json({result: myRecentModel, error:"nil"});
                        }
                    });
                }
          });
          if (myRecentModel == null) {
                checkChat_CreateChat(res);
                console.log("Example app listening at http://%d", count);
          }
    })
   .catch(function(error) {
            res.json({result: "check_chat_room", error: "500"});
            console.log(error);
    });
}
function checkChat_getOther(res)
{
    userDatabase.child(phoneNumber).once('value').then(function(snapshot) {
                otherUserModel = {
                firstname : snapshot.val().firstname,
                lastname: snapshot.val().lastname,
                createdAt: snapshot.val().createdAt,
                phoneNumber: snapshot.val().phoneNumber,
                photo_url: snapshot.val().photo_url,
                state: snapshot.val().state,
                token: snapshot.val().token,
                updatedAt: snapshot.val().updatedAt,
                phone: snapshot.val().phone,
                objectId: snapshot.val().objectId
            };
            checkChat_myRecent(res);
        })
        .catch(function(error) {
            res.json({result: "get_model_error", error: "500"});
        });
}
function checkChat_getMe(res)
{
    userDatabase.child(myPhoneNumber).once('value').then(function(snapshot) {
            myUserModel = {
                firstname : snapshot.val().firstname,
                lastname: snapshot.val().lastname,
                createdAt: snapshot.val().createdAt,
                phoneNumber: snapshot.val().phoneNumber,
                photo_url: snapshot.val().photo_url,
                state: snapshot.val().state,
                token: snapshot.val().token,
                updatedAt: snapshot.val().updatedAt,
                phone: snapshot.val().phone,
                objectId: snapshot.val().objectId
            };
            checkChat_getOther(res);
        })
        .catch(function(error) {
            res.json({result: "get_model_error", error: "500"});
        });
}

function getMyAccount(res)
{
    userDatabase.child(phoneNumber).once('value').then(function(snapshot) {
            var userModel = {
                firstname : snapshot.val().firstname,
                lastname: snapshot.val().lastname,
                createdAt: snapshot.val().createdAt,
                phoneNumber: snapshot.val().phoneNumber,
                photo_url: snapshot.val().photo_url,
                state: snapshot.val().state,
                token: snapshot.val().token,
                updatedAt: snapshot.val().updatedAt,
                phone: snapshot.val().phone,
                objectId: snapshot.val().objectId
            };
            res.json({result: userModel, error : "nil"});
        })
        .catch(function(error) {
            res.json({result: "get_model_error", error: "500"});
        });
}
function sendVerifyCode(phonenumber, code)
{
    var params = {
        'src': '+8613072448973', // Sender's phone number with country code
        'dst' : phonenumber, // Receiver's phone Number with country code
        'text' : code, // Your SMS Text Message - English
        //'text' : "こんにちは、元気ですか？" // Your SMS Text Message - Japanese
        //'text' : "Ce est texte généré aléatoirement" // Your SMS Text Message - French
        // The URL to which with the status of the message is sent
        'method' : "GET" // The method used to call the url
    };
    api.send_message(params, function (status, response) {
        console.log('Status: ', status);
        console.log('API Response:\n', response);
    });
};

function sendPush(res)
{
    // calculateUnreadCount(otheruserId);
    var data = {
        groupId: groupId,
        model: otherRecentModel,
        message: message
    };
    // res.json ({result: data, response : response, error :"nil"});
    sendPushNotification(res, otherUserModel.token, message, myName, data);
}

function sendPushNotification (res, token, message, title, data)
{
    var message ;
    if (otherUserModel.phone == 'android') {
        message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: token, 
            // collapse_key: 'your_collapse_key',
  
            data: data
        };
    }
    else 
    {
        message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: token, 
            // collapse_key: 'your_collapse_key',
            
            notification: {
                title: title, 
                body: message,
                sound: 'default',
                badge: count
            },
            
            data: data
        };
    }
    
    fcm.send(message, function(err, response){
    if (err) {
        console.log(err);
        res.json({error:"error"});
    } else {
        res.json ({result: data, count: count, response : response, error :"nil"});
        console.log("Successfully sent with response: ", response, token);
    }
});
}

function GetOtherUserModel(res)
{
    userDatabase.child(otheruserId).once('value').then(function(snapshot) {
            otherUserModel = {
                firtname : snapshot.val().firtname,
                lastname: snapshot.val().lastname,
                createdAt: snapshot.val().createdAt,
                phoneNumber: snapshot.val().phoneNumber,
                photo_url: snapshot.val().photo_url,
                state: snapshot.val().state,
                token: snapshot.val().token,
                phone: snapshot.val().phone,
                updatedAt: snapshot.val().updatedAt
            };
            // res.json({result: otherUserModel, error: "nil"});
            sendPush(res);
    })
    .catch(function(error) {
            res.json({result: "other_usermodel_error", error: "500"});
    });
}
function GetOtherRecentModel(res)
{
    recentDatabase.child(otherRecentId).once('value').then(function(snapshot) {
                otherRecentModel = {
                PhoneNumbers : snapshot.val().PhoneNumbers,
                counter: snapshot.val().counter,
                createdAt: snapshot.val().createdAt,
                groupId: snapshot.val().groupId,
                groupname: snapshot.val().groupname,
                isArchived: snapshot.val().isArchived,
                isDeleted: snapshot.val().isDeleted,
                lastMessage: snapshot.val().lastMessage,
                lastMessageDate: snapshot.val().lastMessageDate,
                members: snapshot.val().members,
                objectId: snapshot.val().objectId,
                password: snapshot.val().password,
                picture: snapshot.val().picture,
                type: snapshot.val().type,
                updatedAt: snapshot.val().updatedAt,
                userId: snapshot.val().userId
            };
            GetOtherUserModel(res);
    })
    .catch(function(error) {
            res.json({result: "recent_model_error", error: "500"});

    });
}
function calculateUnreadCount(res)
{
   recentDatabase.orderByChild("userId").equalTo(otheruserId).once('value').then(function(snapshot) {
        count = 0;
          snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var unreadcount = childSnapshot.val().counter;
            console.log("Example app listening at http://%s", childSnapshot.key);
            count += parseInt(unreadcount, 10);
          });
          console.log("Example app listening at http://%d", count);
  // ...
        GetOtherRecentModel(res);

    })
   .catch(function(error) {
            res.json({result: "unread_count_error", error: "500"});
    });
}


/* SMS sender 
var api = plivo.RestAPI({
  authId: 'MAYTVKZTNMNDUXMWVIOT',
  authToken: 'MDI2NmMzMzQ4OTY1MTVlMDdhZDEwOWIxOTUxODNm',
});
var params = {
    'src': '+8613072448973', // Sender's phone number with country code
    'dst' : '+8613147801963', // Receiver's phone Number with country code
    'text' : "Hi, This is message", // Your SMS Text Message - English
    //'text' : "こんにちは、元気ですか？" // Your SMS Text Message - Japanese
    //'text' : "Ce est texte généré aléatoirement" // Your SMS Text Message - French
    // The URL to which with the status of the message is sent
    'method' : "GET" // The method used to call the url
};

// Prints the complete response
api.send_message(params, function (status, response) {
    console.log('Status: ', status);
    console.log('API Response:\n', response);
});
*/



var port = process.env.PORT || 8080;

app.post('/verify', function(req, res) {
    var phonenumber = req.body.phonenumber;
    var code = req.body.code;
    var params = {
        'src': '+18053650427', // Sender's phone number with country code
        'dst' : phonenumber, // Receiver's phone Number with country code
        'text' : code, // Your SMS Text Message - English
        // Your SMS Text Message - Japanese
        // Your SMS Text Message - French
        // The URL to which with the status of the message is sent
        'method' : "GET" // The method used to call the url
    };
    api.send_message(params, function (status, response) {
        if (status == 202){
            res.json({result: code, error: "nil"});
        }
        else {
            res.json({error: status});
            console.log('Status: ', status);
            console.log('API Response:\n', response);
        }

    });
});

app.get('/', function (req, res) {
   res.send('Hello NeverMyndApp');
});

var server = http.listen(port, function () {
var host = server.address().address;
var port = server.address().port;
	console.log("NeverMynd-V2 listening at http://%s:%s", host, port);
	console.log('Press Ctrl+C to quit.');
});
// Console will print the message
console.log('Server running at http://127.0.0.1:8080/');
// [END app]
