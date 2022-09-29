import { Injectable } from '@angular/core';
import { ActionPerformed, PushNotifications, PushNotificationSchema, } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm';
import { UserService } from '../appwrite/user.service';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  platform: string = Capacitor.getPlatform();

  constructor(private userService: UserService) {
    if (this.platform === 'ios' || this.platform === 'android') {
      this.setupPushNotifications();
    }
  }

  notifyUserRequest(user: { displayName: string; photoURL: string }) {
    this.newContactRequest(user);
  }

  private newContactRequest(user: { displayName: string; photoURL: string }) {
    LocalNotifications.schedule({
      notifications: [{
        title: 'Neue Kontaktanfrage',
        body: user.displayName + ' möchte mit dir Kontakt aufnehmen :)',
        id: 1
      }]
    });
  }

  private setupPushNotifications() {
    console.log('Initializing Notification Service');

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        alert('Bitte aktiviere Push-Benachrichtigungen in den Einstellungen, damit die volle App-Funktionalität gewährleistet ist.');
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async ({value}) => {
      let token = value;

      // Get FCM token instead the APN one returned by Capacitor
      if (this.platform === 'ios') {
        const {token: fcm_token} = await FCM.getToken();
        token = fcm_token;
      }

      // this.userService.updateUserData({fcmToken: token});
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
      }
    );
  }
}
