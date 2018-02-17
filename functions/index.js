const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.postEvent = functions.https.onRequest((req, res) => {
  if (req.method != 'POST' || req.get('content-type') != 'application/json') {
    res.status(400).send('invalid request');
    return;
  }

  // uid のチェック
  var uid = req.body.uid;
  if (uid == null || uid == '') {
    res.status(400).send('please set your id');
    return;
  } else {
    admin.auth().getUser(uid)
      .then(function(userRecord) {
        // 空チェック
        var name = req.body.name;
        var text = req.body.text;
        var address = req.body.address;
        var start_datetime = req.body.start_datetime;
        var end_datetime = req.body.end_datetime;
        var url = req.body.url;
        if (name == null || name == '') {
          res.status(400).send('please set event\'s name');
          return;
        }
        if (text == null || text == '') {
          res.status(400).send('please set event\'s text');
          return;
        }
        if (address == null || address == '') {
          res.status(400).send('please set event\'s address');
          return;
        }
        if (start_datetime == null || start_datetime == '') {
          res.status(400).send('please set event\'s start_datetime');
          return;
        }
        if (end_datetime == null || end_datetime == '') {
          res.status(400).send('please set event\'s end_datetime');
          return;
        }
        if (url == null) {
          url = '';
        }

        var eventListRef = admin.database().ref('events');
        var newEventRef = eventListRef.push();
        newEventRef.set({
          'author': uid,
          'name': name,
          'text': text,
          'address': address,
          'start_datetime': start_datetime,
          'end_datetime': end_datetime,
          'url': url
        });

        res.status(200).send('success');
      })
      .catch(function(error) {
        res.status(400).send('invalid user-id');
    });
  }
});
