const admin = require('firebase-admin');

/**
 * @class FirebaseService
 * @description Service for Firebase Products/Features - push notifications
 */
module.exports = class FirebaseService {
    constructor(app) {
      console.log("* FireBaseService")
      this.serviceAccountKeyPath = '../configs/locumBridgeServiceAccountKeyFirebaseDev.json';
      this.initializeApp();

    }
  
    async initializeApp() {
        const serviceAccount = require(this.serviceAccountKeyPath);
    
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // Add any other initialization options as needed
        });
        // await this.sendTestNotification()
    }

    async sendTestNotification(){
      try {
        console.log('innnnnnnn')
        const notificationObj = {
          tokens: ['f1OCcno-U3NU84JUT71Z35:APA91bEcfcYvb0lwzCNVyBMArF65yCEadEYx1ppYkqTVC09zuO9Ay251FomrCO0zlNi6EgwiK-QPNoIoWkudv85NzoSSrfxEiSYXoPLaMYTAxLgCTIhU43M', '123'],
          notification: {
            title: 'test Notification',
            body: "test body text",
          }
        }
        if (true) {
          notificationObj.data = {key: 'value', slot_id: "slot_id123"}
          // notificationObj.slot_id = slot_id
        }
        // console.log(notificationObj)
        const response = await admin.messaging().sendEachForMulticast(notificationObj);
        if (response.failureCount > 0) {
          response.responses.forEach(item => {
            if (!item.success) {
              logger.log({
                level: 'error',
                message: item.error
              })
              console.log(item.error)
            }
          });
        }
        console.log(response, "resposs")
        return response;
      } catch (error) {
        console.log(error, "errrrrrr")
        logger.log({
          level: 'error',
          message: error
        })
      }
    }
  
    async sendPushNotification(to, title, message, payload = null, slot_id = null) {
      try {
        // let response = null
        // for(let i=0; i< to.length; i++){
          const notificationObj = {
            tokens: to,
            notification: {
              title: title,
              body: message,
            }
          }
          if (payload) {
            notificationObj.data = {key: 'value', slot_id: "slot_id123"}
          }
          let response = await admin.messaging().sendEachForMulticast(notificationObj);
          if (response.failureCount > 0) {
            response.responses.forEach(item => {
              if (!item.success) {
                logger.log({
                  level: 'error',
                  message: item.error
                })
              }
            });
          }
        // }
        // return response;
      } catch (error) {
        logger.log({
          level: 'error',
          message: error
        })
      }
    }
  
    async sendPushNotificationMultiple(to, title, message, payload = null) {
      try {
        const notificationObj = {
          tokens: to,
          notification: {
            title: title,
            body: message,
          }
        }
        if (payload) {
          notificationObj.data = payload
        }
        const response = await admin.messaging().sendEachForMulticast(notificationObj);
        if (response.failureCount > 0) {
          response.responses.forEach(item => {
            if (!item.success) {
              logger.log({
                level: 'error',
                message: item.error
              })
            }
          });
        }
        return response;
      } catch (error) {
        logger.log({
          level: 'error',
          message: error
        })
      }
    }
}