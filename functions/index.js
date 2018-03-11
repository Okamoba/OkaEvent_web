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
  console.log(`request`);
  if (req.method != 'POST' || req.get('content-type') != 'application/json') {
    res.status(400).send('invalid request');
    console.log(`invalid request`);
    return;
  }

  // uid のチェック
  var uid = req.body.author;
  if (uid == null || uid == '') {
    console.log(`invalid uid: ` + req.body.length);
    res.status(400).send('please set your id');
    return;
  } else {
    console.log(`valid uid`);
    admin.auth().getUser(uid)
      .then(function(userRecord) {
        console.log(`start creating an event`);
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

        // RealtimeDB への保存
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

        // firestore への保存
        const collectionRef = admin.firestore().collection('events');
        collectionRef.add({
          author: uid,
          name: name,
          text: text,
          address: address,
          start_datetime: new Date(start_datetime),
          end_datetime: new Date(end_datetime),
          url: url,
        }).then(documentReference => {
          console.log(`Added document with name: ${documentReference.id}`);
        });

        res.status(200).send('success');
      })
      .catch(function(error) {
        res.status(400).send('invalid user-id');
        console.log("Error fetching user data:", error);
    });
  }
});

exports.createEvent = functions.firestore
  .document('events/{id}')
  .onCreate(event => {
    // var name = event.data.data();
    // console.log("Log name data:", name);
    var name = '新規イベント';

    // Notification details.
    const payload = {
      notification: {
        title: '新着イベント情報',
        body: `「${name}」が投稿されました。`,
      },
    };

    var options = {
      priority: 'high',
      timeToLive: 60 * 60 * 24
    };

    return admin.messaging().sendToTopic('all', payload, options)
      .then(function(response) {
        console.log('Successfully sent message:', response);
      })
      .catch(function(error) {
        console.log('Error sending message:', error);
    });
});
