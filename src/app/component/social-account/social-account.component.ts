import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-social-account',
  templateUrl: './social-account.component.html',
  styleUrls: ['./social-account.component.scss'],
})
export class SocialAccountComponent implements OnInit {
  @Input() accountPreset;
  @Input() providedUsername = null;

  usernameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(30),
    Validators.pattern('^\\S*$')
  ]);

  usernameMessages = [
    {type: 'required', message: 'Benutzername ist notwendig.'},
    {type: 'minlength', message: 'Benutzername ist zu kurz.'},
    {type: 'maxlength', message: 'Benutzername ist zu lang.'},
    {type: 'pattern', message: 'Benutzername enthält Lücken.'},
  ];

  constructor(private alertController: AlertController) {
  }

  ngOnInit() {
    if (this.providedUsername) {
      this.usernameFormControl.setValue('@' + this.providedUsername);
    }
  }

  async openAccountAlert() {
    const alert = await this.alertController.create({
      header: this.accountPreset.name,
      buttons: [
        {
          text: 'Löschen',
          role: 'destructive',
          handler: async () => {
            const deleteAlert = await this.alertController.create({
              header: 'Wirklich löschen?',
              subHeader: 'Das kann nicht rückgängig gemacht werden!',
              buttons: [
                {
                  text: this.accountPreset.name + ' endgültig löschen',
                  role: 'destructive',
                  handler: () => {
                    this.deleteAccount();
                  }
                },
                {
                  text: 'Abbrechen',
                  role: 'cancel',
                }
              ]
            });

            await deleteAlert.present();
          }
        },
        {
          text: 'Bearbeiten',
          handler: () => {
            this.editAccount();
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        },
      ]
    });

    await alert.present();
  }

  private editAccount() {
    console.log('editAccount');
  }

  private deleteAccount() {

  }
}
