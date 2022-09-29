import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  defaultRoute = this.getJumpTo() || '/tabs/profile';

  constructor(private toastController: ToastController,
              private alertController: AlertController) {
  }

  setJumpTo(url: string) {
    if (url.includes('login')) {
      return;
    }
    localStorage.setItem('jumpTo', url);
  }

  getJumpTo() {
    return localStorage.getItem('jumpTo');
  }

  async displayErrorMessage(message: string) {

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
  }
}
