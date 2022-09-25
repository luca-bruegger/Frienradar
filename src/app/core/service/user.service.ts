import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BaseService } from './base.service';
import { NavController } from '@ionic/angular';
import { User, UserCredential } from '@firebase/auth-types';
import { RecaptchaVerifier } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { arrayUnion } from '@angular/fire/firestore';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  recaptchaVerifier: RecaptchaVerifier = null;

  constructor(private fireAuth: AngularFireAuth,
              private baseService: BaseService,
              private navController: NavController) {

  }

  async createUser(value: any) {
    const actionCodeSettings = {
      url: 'https://frienradar.com/login?email-verified=true',
      handleCodeInApp: true,
      android: {
        packageName: 'ch.lucabruegger.frienradar',
        installApp: true
      },
      iOS: {
        bundleId: 'ch.lucabruegger.frienradar'
      },
      dynamicLinkDomain: 'frienradar.page.link'
    };

    return this.fireAuth.createUserWithEmailAndPassword(value.email, value.password)
      .then((userCredential: UserCredential) => {
        userCredential.user.sendEmailVerification(actionCodeSettings).then(r => console.log(r));
        /*userCredential.user.updateProfile({
          displayName: value.name,
          photoURL: 'http://www.gravatar.com/avatar/?d=mp'
        }).then(() => {
          this.baseService.displaySuccessMessage('Herzlich willkommen!');
          this.navController.navigateForward('/tabs/profile');
        });*/
      })
      .catch(error => this.baseService.displayErrorMessage(error.message));
  }

  signInUser(value: any) {
    return this.fireAuth.signInWithEmailAndPassword(value.email, value.password)
      .then(() => this.navController.navigateForward('/tabs/profile'))
      .catch(error => this.baseService.displayErrorMessage(error.message));
  }

  updateUser(updatedAttributes: { displayName?: string; photoURL?: string }) {
    return this.baseService.userSubject.value.updateProfile(updatedAttributes).then(() => {
      this.baseService.usersRef.set(updatedAttributes, {merge: true});
    }).catch(error => this.baseService.displayErrorMessage(error.message));
  }

  updateUserData(updatedAttributes: any) {
    this.baseService.usersRef.set(updatedAttributes, {merge: true})
      .catch(error => this.baseService.displayErrorMessage(error.message));
  }

  setAccount(account: { account: string; name: string }) {
    return this.baseService.accountsRef.set({
      account: account.account,
      name: account.name
    }, {merge: true})
      .catch(error => this.baseService.displayErrorMessage(error.message));
  }

  setLocation(geohash: string) {
    return this.baseService.usersRef.set({
      displayName: this.baseService.userSubject.value.displayName,
      photoURL: this.baseService.userSubject.value.photoURL,
      uid: this.baseService.userSubject.value.uid,
      location: {
        geohash,
        timestamp: Timestamp.now()
      }
    }, {merge: true})
      .catch(error => this.baseService.displayErrorMessage(error.message));
  }

  signOut() {
    this.fireAuth.signOut().then(() => {
      localStorage.clear();
      this.baseService.userSubject.next({} as User);
      this.baseService.destroyUserData();
      this.navController.navigateBack('/login', {
        replaceUrl: true
      });
    });
  }

  contactRequests() {
    return this.baseService.contactRequestsCol.doc(this.baseService.userSubject.value.uid).valueChanges();
  }

  setContactRequest(receiverUser) {
    const user = this.baseService.userSubject.value;
    return this.baseService.contactRequestsCol.doc(receiverUser.uid).set({
      requests: arrayUnion({
        displayName: user.displayName,
        uid: user.uid
      })
    }, {merge: true});
  }

  updateAccount(key: string, username) {
    return this.baseService.accountsRef.set({
      [key]: username
    }, {merge: true});
  }

  getAccounts() {
    return this.baseService.accountsRef.get();
  }
}
