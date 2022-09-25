import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { User } from '@firebase/auth-types';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  constructor(private toastController: ToastController,
              private angularFirestore: AngularFirestore,
              private angularFireStorage: AngularFireStorage,
              private fireAuth: AngularFireAuth,
              private alertController: AlertController) {
    this.fireAuth.user.subscribe(user => {
      if (user) {
        this.userSubject.next(user);
      } else {
        this.userSubject.next({} as User);
      }
    });
  }

  get profilePictureRef() {
    return this.angularFireStorage.ref('users/' + this.userSubject.value.uid).child('profilePicture');
  }

  get usersRef() {
    return this.angularFirestore.collection('users').doc(this.userSubject.value.uid);
  }

  get contactRequestsCol() {
    return this.angularFirestore.collection('contacts');
  }

  get accountsRef() {
    return this.angularFirestore.collection('accounts').doc(this.userSubject.value.uid);
  }

  async displayErrorMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      color: 'danger'
    });
    await toast.present();
  }

  async displaySuccessMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      color: 'success'
    });
    await toast.present();
  }

  destroyUserData() {
    this.angularFirestore.collection('users').doc(this.userSubject.value.uid).set({
      location: null
    }, {merge: true});
  }
}
