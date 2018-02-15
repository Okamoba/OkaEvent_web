const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.makeNewEvent = functions.database.ref('/tmp/event/{uId}')
    .onWrite(event => {
      // get event_ID
      var event_id = 0;
      if (!event.data.child('event_id').exists()) {
        admin.database().ref('events/id').once('value').then(function(snapshot) {
          event_id = snapshot.val();
          event.data.ref.child('event_id').set(event_id);
          admin.database().ref('events/id').set(event_id + 1);
        });
        return 2;
      } else {
        event_id = event.data.child('event_id').val();
      }

      // set values
      if (event.data.hasChildren()) {
        var isUpdated = false;

        event.data.forEach((eventSnap) => {
          if (eventSnap.exists()) {
            if (eventSnap.key == 'event_id') {
              return;
            }
            isUpdated = true;
            const new_val = eventSnap.val();
            console.log('set ' + eventSnap.key, event.params.uId, new_val);
            admin.database().ref('events/' + event_id).child(eventSnap.key).set(new_val);
          }
        });
        if (isUpdated) {
          admin.database().ref('events/' + event_id).child('author').set(event.params.uId);
        }
      }
      return 1;
    });
