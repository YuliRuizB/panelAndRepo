import * as functions from 'firebase-functions';
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

import * as express from 'express';
import * as basicAuth from 'express-basic-auth';
//import * as request from 'request';

const Openpay = require('openpay');
// const openpay = new Openpay('m2mkwvsgfxzuc0hrg8fm', 'sk_dc43597b199448588611083a15c02407'); //production
//const openpay = new Openpay('mptiot2sftktydvpfgxj', 'sk_0038400338e04bdb9ba760ad05f8aa93'); //development
const openpay = new Openpay('ma76iv4jwl1dmjtrqx9p', 'sk_577999058ae043c9b90e9a18e1679976'); //development

openpay.setProductionReady(false);

// CORS Express middleware to enable CORS Requests.
import * as cors from "cors";

const app = express();
app.use(cors({ origin: true }))

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/allevents', function (req, res) {
  // app.post('/allevents', basicAuth({ users: { 'bus2uUser': 'R92bxFFtNRqZHkNw' } }), function (req, res) {
  const event = req.body;
  console.log(event);

  if (event.type === 'charge.succeeded') {

    const transaction = req.body.transaction;
    // const reference: string;
    let customerId: string;

    if (transaction.method === 'card') {
      // reference = '';
      const orderArray = transaction.order_id.split('-');
      customerId = orderArray[1];
    } else {
      // reference = transaction.payment_method.reference;
      customerId = transaction.customer_id;
    }


    new Promise((resolve) => {
      const openpayBus2UCustomerRef = admin.firestore().collection("openpay_customers").doc(customerId);
      openpayBus2UCustomerRef.get().then(function (doc:any) {
        if (doc.exists) {
          console.log("Document data:", doc.data());
          const keyNames = Object.keys(doc.data() as any);
          console.log(keyNames);
          const userId = keyNames[0];
          const purchaseRequestRef = admin.firestore().collection('users').doc(userId).collection('purchaseRequests').doc(transaction.id);
          purchaseRequestRef.update(transaction).then((response:any) => {
            resolve(response);
            res.sendStatus(200);
          })
            .catch((err: unknown) => resolve(err));
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
          resolve('no such user document!');
        }
      }).catch(function (error: unknown) {
        resolve(error);
      });
    });
  } else {
    console.log('nothing to do here. Thanks');
    res.sendStatus(200);
  }
});

// app.post('/chargeCreated', function (req, res) {
  app.post('/chargeCreated', basicAuth({ users: { 'bus2uUser': 'R92bxFFtNRqZHkNw' } }), function (req, res) {
  const event = req.body;
  console.log('charge created: ', event);
  res.sendStatus(200);
});

// app.post('/chargeCompleted', function (req, res) {
  app.post('/chargeCompleted', basicAuth({ users: { 'bus2uUser': 'R92bxFFtNRqZHkNw' } }), function (req, res) {
  console.log('charge completed api call');
  const transaction = req.body.transaction;
  console.log('transaction var:', transaction);
  const orderArray = transaction.order_id.split('-');
  const userId = orderArray[1];
  console.log('userId var: ', userId);
  transaction.transaction_id = transaction.id;
  delete transaction.id;
  console.log('transaction manipulated var: ', transaction);

  new Promise((resolve, reject) => {
    const purchaseRequestRef = admin.firestore().collection('users').doc(userId).collection('purchaseRequests').doc(transaction.transaction_id);
    purchaseRequestRef.update(transaction).then((response: unknown) => {
      console.log(response);
      resolve(response);
    })
      .catch((err: any) => {
        console.log('err: ', err);
        reject(err)
      });
  });

  // new Promise((resolve) => {
  //   const openpayBus2UCustomerRef = admin.firestore().collection("openpay_customers").doc(customerId);
  //   openpayBus2UCustomerRef.get().then(function (doc) {
  //     if (doc.exists) {
  //       const keyNames = Object.keys(doc.data() as any);
  //       const userId = keyNames[0];
  //       const purchaseRequestRef = admin.firestore().collection('users').doc(userId).collection('purchaseRequests').doc(transaction.id);
  //       purchaseRequestRef.update(transaction).then((response) => {
  //         resolve(response);
  //       })
  //         .catch(err => resolve(err));
  //     } else {
  //       resolve('no such user document!');
  //     }
  //   }).catch(err => resolve(err));
  // });
  res.status(200).send('charge.succeeded was successful.');
});

app.post('/speiReceived', basicAuth({ users: { 'bus2uUser': 'R92bxFFtNRqZHkNw' } }), function (req, res) {
  console.log('charge completed api call');
  const transaction = req.body.transaction;
  console.log('transaction var:', transaction);
  const orderArray = transaction.order_id.split('-');
  const userId = orderArray[1];
  console.log('userId var: ', userId);
  transaction.transaction_id = transaction.id;
  delete transaction.id;
  console.log('transaction manipulated var: ', transaction);

  new Promise((resolve, reject) => {
    const purchaseRequestRef = admin.firestore().collection('users').doc(userId).collection('purchaseRequests').doc(transaction.transaction_id);
    purchaseRequestRef.update(transaction).then((response: unknown) => {
      console.log(response);
      resolve(response);
    })
      .catch((err: any) => {
        console.log('err: ', err);
        reject(err)
      });
  });
  res.sendStatus(200);
});

// app.post('/chargeFailed', function (req, res) {
  app.post('/chargeFailed', basicAuth({ users: { 'bus2uUser': 'R92bxFFtNRqZHkNw' } }), function (req, res) {
  const event = req.body;
  console.log('charge failed', event);
  res.sendStatus(200);
});

// app.post('/chargeRefunded', function (req, res) {
  app.post('/chargeRefunded', basicAuth({ users: { 'bus2uUser': 'R92bxFFtNRqZHkNw' } }), function (req, res) {
  const event = req.body;
  console.log('charge refunded', event);
  res.sendStatus(200);
});

// app.post('/chargeCancelled', function (req, res) {
  app.post('/chargeCancelled', basicAuth({ users: { 'bus2uUser': 'R92bxFFtNRqZHkNw' } }), function (req, res) {
  const event = req.body;
  console.log('charge cancelled', event);
  res.sendStatus(200);
});

// app.post('/paymentCreated', function (req, res) {
  app.post('/paymentCreated', basicAuth({ users: { 'bus2uUser': 'R92bxFFtNRqZHkNw' } }), function (req, res) {
  const event = req.body;
  console.log('payment created', event);
  res.sendStatus(200);
});

// app.post('/paymentCompleted', function (req, res) {
  app.post('/paymentCompleted', basicAuth({ users: { 'bus2uUser': 'R92bxFFtNRqZHkNw' } }), function (req, res) {
  const event = req.body;
  console.log('payment completed', event);
  res.sendStatus(200);
});

// app.post('/paymentFailed', function (req, res) {
  app.post('/paymentFailed', basicAuth({ users: { 'bus2uUser': 'R92bxFFtNRqZHkNw' } }), function (req, res) {
  const event = req.body;
  console.log('payment failed', event);
  res.sendStatus(200);
});

app.post('/v1/devices/gema_suspended', basicAuth({ users: { 'gema': 'R92bxFFtNRqZHkNw' } }), async (req, res) => {
  const event = req.body;
  // const apiEndPoint = "http://gps.onemap7.com:5055/?";
  // const urlParams = `id=${event.imei}&lat=${event.latitude}&lon=${event.longitude}&timestamp=${event.date}&hdop=0&altitude=${event.altitude}&speed=${event.speed}&event=${event.event_type}&battery=${event.battery}`;
  // console.log(apiEndPoint + urlParams);
  // request.get(apiEndPoint + urlParams, function (error, response, body) {
  //   console.log('error:', error); // Print the error if one occurred 
  //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
  //   console.log('body:', body); //Prints the response of the request. 
  // });

  event.geopoint = new admin.firestore.GeoPoint(event.latitude, event.longitude);
  event.date = admin.firestore.Timestamp.fromDate(new Date(event.date));
  const logEvent = await admin.firestore().collection("customers").doc('fpXUtj7QcZlMf7zfCzv4').collection('devices').doc(event.imei).set(event);
  return res.send(logEvent);
});

exports.api = functions.https.onRequest(app);

exports.createBoardingPass = functions.firestore.document('users/{userId}/purchaseRequests/{purchaseRequest}').onWrite(async (change, context) => {

  const userId = context.params.userId;
  const chargeRequest = change.after.data() as any || "";
  console.log(chargeRequest);
  const orderIdArray = (chargeRequest.order_id).split('-');
  const productId = orderIdArray[0];
  const transactionId = chargeRequest.id;
  delete chargeRequest.id;
  chargeRequest.transactionId = transactionId;

  if (chargeRequest.status === 'completed') {
    console.log('we will create a boarding pass for this payment');
    console.log('also send a notification');

    const userRef$ = await admin.firestore().collection('users').doc(userId);
    userRef$.get().then(async (userDoc: { data: () => any; }) => {
      const user = userDoc.data() as any;
      console.log(user);
      // Notification details.
      const payload = {
        notification: {
          title: '¡Tu compra se ha registrado con éxito!',
          body: `${user.displayName}, tu compra del pase de abordar para el periodo ${chargeRequest.name} ya está en tus compras.`,
          icon: user.photoURL
        },
        data: {
          title: '¡Tu pase de abordar está listo!',
          body: `${user.displayName}, tu compra del pase de abordar para el periodo ${chargeRequest.name} ya está en tus compras.`,
          url: 'purchases',
          color: 'primary',
          position: 'top',
          buttons: JSON.stringify([{
            text: 'Ok',
            role: 'cancel',
            handler: "console.log('Cancel clicked')",
          },
          {
            text: 'Ver pase',
            handlerType: 'navigation',
            handler: "purchases"
          }])
        }
      };

      // Listing all tokens as an array.
      const token = user.token;
      // Send notifications to all tokens.
      const sendFCMNotification = await admin.messaging().sendToDevice(token, payload);
      // For each message check if there was an error.
      sendFCMNotification;
    }).catch((err: any) => console.log(err));

    const newBoardingPassCollectionRef = admin.firestore().collection('users').doc(userId).collection('boardingPasses');
    const boardingPassData = {
      productId: productId,
      customerId: orderIdArray[1]
    };
    const newBoardingPass = { ...boardingPassData, ...chargeRequest };
    return newBoardingPassCollectionRef.add(newBoardingPass);
  }
  return true;
});

exports.addNewOpenpayCustomer = functions.https.onCall((data, context) => {

  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError('failed-precondition',
      'The function must be called while authenticated.');
  }
  // Enforce customer type of catalog (wo balance account)
  data.requires_account = false;

  // Authentication / user information is automatically added to the request.
  const uid = context.auth.uid;
  //   const name = context.auth.token.name || null;
  //   const picture = context.auth.token.picture || null;
  //   const email = context.auth.token.email || null;

  return new Promise((resolve) => {
    openpay.customers.create(data, (error: unknown, customer: any) => {
      if (error) { resolve(error) };
      if (customer) {
        const userRef$ = admin.firestore().collection('users').doc(uid);
        const openpayRef$ = admin.firestore().collection('openpay_customers').doc(customer.id);
        openpayRef$.set({ [uid]: true }).catch((err: unknown) => resolve(err));
        userRef$.set({ openpay: customer }, { merge: true }).then(() => {
          resolve(customer);
        })
          .catch((err: unknown) => resolve(err));
      };
    });
  });
});

exports.addNewOpenpayStoreChargeRequest = functions.https.onCall((data, context) => {

  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError('failed-precondition',
      'The function must be called while authenticated.');
  }

  // Authentication / user information is automatically added to the request.
  const newChargeRequest = data.charge_request;
  // const customerId = data.customer_id;
  // newChargeRequest.customer_id = customerId;
  console.log(data);
  //   const uid = context.auth.uid;
  //   const name = context.auth.token.name || null;
  //   const picture = context.auth.token.picture || null;
  //   const email = context.auth.token.email || null;

  return new Promise((resolve) => {
    openpay.charges.create(newChargeRequest, (error: unknown, charge: any) => {
      if (error) { resolve(error) };
      if (charge) {
        resolve(charge)
        // const purchaseRef$ = admin.firestore().collection('users').doc(uid).collection('purchaseRequests').doc(charge.id);
        // purchaseRef$.set(charge).then(() => {
        //   admin.firestore().collection('storeChargeRequests').doc(charge.id).set(charge);
        // }).then(() => {
        //   resolve(charge);
        // })
      };
    });
  });
});

exports.addNewOpenpaySPEIChargeRequest = functions.https.onCall((data, context) => {

  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError('failed-precondition',
      'The function must be called while authenticated.');
  }

  // Authentication / user information is automatically added to the request.
  const newChargeRequest = data.charge_request;
  // const customerId = data.customer_id;
  // newChargeRequest.customer_id = customerId;
  console.log(data);
  //   const uid = context.auth.uid;
  //   const name = context.auth.token.name || null;
  //   const picture = context.auth.token.picture || null;
  //   const email = context.auth.token.email || null;

  return new Promise((resolve) => {
    openpay.charges.create(newChargeRequest, (error: unknown, charge: any) => {
      if (error) { resolve(error) };
      if (charge) {
        resolve(charge)
        // const purchaseRef$ = admin.firestore().collection('users').doc(uid).collection('purchaseRequests').doc(charge.id);
        // purchaseRef$.set(charge).then(() => {
        //   admin.firestore().collection('storeChargeRequests').doc(charge.id).set(charge);
        // }).then(() => {
        //   resolve(charge);
        // })
      };
    });
  });
});

exports.addNewOpenpayCardChargeRequest = functions.https.onCall((data, context) => {

  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError('failed-precondition',
      'The function must be called while authenticated.');
  }

  // Authentication / user information is automatically added to the request.
  console.log(data);
  const newChargeRequest = data.charge_request;
  // const customerId = data.customer_id;
  // const uid = context.auth.uid;
  // const name = context.auth.token.name || null;
  // const picture = context.auth.token.picture || null;
  // const email = context.auth.token.email || null;

  return new Promise((resolve) => {
    openpay.charges.create(newChargeRequest, (error: unknown, charge: any) => {
      if (error) { resolve(error) };
      if (charge) {
        resolve(charge)
        // const purchaseRef$ = admin.firestore().collection('users').doc(uid).collection('purchaseRequests').doc(charge.id);
        // purchaseRef$.set(charge).then(() => {
        //   admin.firestore().collection('storeChargeRequests').doc(charge.id).set(charge);
        // }).then(() => {
        //   resolve(charge);
        // })
      };
    });
  });
});

exports.createActivity = functions.firestore.document('activityLog/{Id}').onCreate((snap, context) => {

  const newValue = snap.data() || {};
  const userKey = newValue.actualKey;
  const updateData = newValue.updateData;
  const userId = newValue.userId;
  const credentialId = newValue.credentialId;
  const boardingPassId = newValue.boardingPassId;
  
  if (userKey && updateData) {

    const update = {
      passValidation: {
        lastUsed: newValue.created,
        lasUsedLocation: newValue.location,
        lastUsedProgram: newValue.program,
        lastUsedRound: newValue.round,
        lastUsedRoute: newValue.route,
        lastUsedVehicle: newValue.vehicle,
        validation: userKey,
        allowedOnBoard: newValue.allowedOnBoard,
        lastValidUsage: newValue.validUsage
      }
    };

    if (newValue.isCredential && newValue.boardingPassId == null) {
      return db.doc(`users/${userId}/credentials/${credentialId}`).update(update)
      .then((res: any) => console.log(res))
      .catch((err: any) => console.log(err));

    }


    return db.doc(`users/${userId}/boardingPasses/${boardingPassId}`).update(update)
    .then((res: any) => console.log(res))
    .catch((err: any) => console.log(err));
  }
  return (newValue);
});

exports.sendFCMNotification = functions.firestore.document('testFCM/{userId}').onCreate(async (snap, context) => {
  // const data = snap.data() || {};
  const userId = context.params.userId;
  const userRef$ = await admin.firestore().collection('users').doc(userId);
  userRef$.get().then(async (userDoc: { data: () => any; }) => {
    const user = userDoc.data() as any;
    console.log(user);
    // Notification details.
    const payload = {
      notification: {
        title: '¡Tu pase de abordar está listo!',
        body: `${user.displayName}, ya puedes usar el transporte de Bus2U`,
        icon: user.photoURL
      },
      data: {
        title: '¡Tu pase de abordar está listo!',
        body: `${user.displayName}, ya puedes usar el transporte de Bus2U`,
        url: 'purchases',
        color: 'primary',
        position: 'top',
        buttons: JSON.stringify([{
          text: 'Ok',
          role: 'cancel',
          handler: "console.log('Cancel clicked')",
        },
        {
          text: 'Ver pase',
          handlerType: 'navigation',
          handler: "purchases"
        }])
      }
    };

    // Listing all tokens as an array.
    const token = user.token;
    // Send notifications to all tokens.
    const sendFCMNotification = await admin.messaging().sendToDevice(token, payload);
    // For each message check if there was an error.
    return sendFCMNotification;
  }).catch((err: any) => console.log('error: ', err));
})

exports.addCustomClaim = functions.https.onCall((data, context) => {
  // Get the user we want to add custom claims
  
  return admin.auth().getUserByEmail(data.email).then( (user:any) => {
    return admin.auth().setCustomUserClaims(user.uid, {...data.claims})
  }).then( () => {
    return {
      message: `${data.email} has been added next claims: ${ JSON.stringify(data.claims)}`
    }
  }).catch((err: any) => {
    return err;
  })
});

// exports.sendVerificationEmailOnUserCreate = functions.auth.user().onCreate((user) => {
  
//   return admin.auth().generateEmailVerificationLink(user.email).then((link: any) => {
//     return {
//       success: true,
//       link
//     };
//     console.log(link);
//   })
//   .catch(function(error: any) {
//     // Some error occurred, you can inspect the code: error.code
//     return {
//       success: false,
//       message: error.code,
//       error
//     }
//     console.log(error);
//   });

// })

exports.createUser = functions.https.onCall(async (data) => {
  const user = data;
  console.log(user);
  const newUser = {
    email: user.email,
    emailVerified: false,
    password: user.password,
    displayName: `${user.firstName} ${user.lastName}`,
    photoURL: "http://www.example.com/12345678/photo.png",
    disabled: false
  }

  return admin.auth().createUser(newUser).then((userRecord: any) => {
    const uid = userRecord.uid;
    const usersCollectionRef = db.collection('users').doc(uid);

    return usersCollectionRef.set(user).then( () => {
      return {
        success: true,
        user: userRecord,
        message: 'Successfully created user'
      }
    })
      .catch((err: any) => {
        return {
          success: false,
          message: 'Error creating user:', err
        }
      });
  })

});

exports.onBulkCreateUser = functions.firestore.document('bulkusers/{userId}').onCreate((snap, context) => {

  const user: any = snap.data();

  console.log(user);

  const newUser = {
    email: user.email,
    emailVerified: false,
    password: '123456',
    displayName: `${user.firstName} ${user.lastName}`,
    photoURL: "http://www.example.com/12345678/photo.png",
    disabled: false
  }

  return admin.auth().createUser(newUser).then((userRecord: any) => {
    const uid = userRecord.uid;
    const usersCollectionRef = db.collection('users').doc(uid);

    return usersCollectionRef.set(user)
      .catch((err: any) => {
        return {
          success: false,
          message: 'Error creating user: ' + err
        }
      });
  })
});

exports.onDeleteUser = functions.firestore.document('users/{userId}').onDelete((snap, context) => {

  const uid = context.params.userId;
  return admin.auth().deleteUser(uid).then(() => {
    console.log('Successfully deleted user');
    return {
      success: true,
      message: 'Successfully deleted user'
    }
  })
    .catch((err: any) => {
      console.log('Error deleting user:', err);
      return {
        success: false,
        message: 'Error deleting user:', err
      }
    });
});

exports.onAuthenticationDeletedUser = functions.auth.user().onDelete((user) => {
  console.log(user);
  const userCollectionRefDoc = admin.firestore().collection('users').doc(user.uid);
  return userCollectionRefDoc.delete();
});

// exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {

//   console.log(user);
//   return admin.auth().generatePasswordResetLink(user.email)
//     .then(() => {
//       return {
//         success: true,
//         message: 'reset link password generated'
//       }
//     })
//     .catch((err: any) => {
//       return {
//         success: false,
//         message: err
//       }
//     });

// });

exports.sendVerificationEmail = functions.https.onCall( async(data, context) => {
  
  const useremail = data.email;
  return admin.auth().generateEmailVerificationLink(useremail).then((link: any) => {
    console.log(link);
    return {
      success: true,
      link
    };
  })
  .catch(function(error: any) {
    // Some error occurred, you can inspect the code: error.code
    console.log(error);
    return {
      success: false,
      message: error.code,
      error
    };
  });

});

exports.sendNotificationOnDiscountRequest = functions.firestore.document('discounts/{discountId}').onCreate(async (snap, context) => {
  const discountRequest: any = snap.data();

  const payload = {
    notification: {
      title: 'Solicitud de descuento',
      body: `${discountRequest.requested_message}`
    }
  };

  // get all registered tokens from collection
  const tokensSnapshot = await admin.firestore().collection('fcmTokens').get();

  //get all users tokens to notify
  const snapshot = await admin.firestore()
    .collection('users')
    .where('role', '==', 'admin')
    .get();

  let tokens: any = [];

  snapshot.forEach((doc: any) => {
        
    tokensSnapshot.forEach((userToken: any) => {
      const token = userToken.data();
      Object.keys(token).forEach(key => {
        if (key == doc.id) {
          tokens.push(token[key])
        }
      })
    });
  });

  return await admin.messaging().sendToDevice(tokens, payload);

});

exports.setLiveProgram = functions.firestore.document('customers/{customerId}/program/{programId}').onUpdate(async (snap, context) => {
  const updated:any = snap.after.data();
  const before: any = snap.before.data();

  const isLive = updated.isLive || false;
  const wasLive = before.isLive || false;
  const hasEnded = updated.hasEnded || false;

  const customerId = context.params.customerId;
    const programId = context.params.programId;

  if(!wasLive && isLive) {
    const insertLiveProgram = await admin.firestore().doc(`customers/${customerId}/live/${programId}`);
    return insertLiveProgram.create(updated);
  } 

  if(hasEnded) {
    const batch = admin.firestore().batch();
    const liveProgramDocRef = await admin.firestore().doc(`customers/${customerId}/live/${programId}`);
    const endedProgramDocRef = await admin.firestore().doc(`customers/${customerId}/operations/${programId}`);
    batch.delete(liveProgramDocRef);
    batch.create(endedProgramDocRef, updated);
    return batch.commit();
  }

  const updateLiveProgram = await admin.firestore().doc(`customers/${customerId}/live/${programId}`);
  return updateLiveProgram.update(updated);

})
