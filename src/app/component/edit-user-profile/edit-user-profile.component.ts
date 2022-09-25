import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { FirestoreService } from '../../core/service/firestore.service';
import { UserService } from '../../core/service/user.service';
import { AccountValidation } from '../../core/validation/account-validation';

@Component({
  selector: 'app-edit-user-profile',
  templateUrl: './edit-user-profile.component.html',
  styleUrls: ['./edit-user-profile.component.scss'],
})
export class EditUserProfileComponent implements OnInit {
  @Input() user: any;

  private platform: string = Capacitor.getPlatform();
  private formGroup = AccountValidation.formGroup;

  constructor(private modalController: ModalController,
              private imagePicker: ImagePicker,
              private firestoreService: FirestoreService,
              private userService: UserService,) {
  }

  ngOnInit() {
    this.setInitialValues();
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  changeProfilePicture() {
    if (this.platform === 'android' || this.platform === 'ios') {
      this.displayImagePicker();
    }
  }

  private displayImagePicker() {
    const imagePickerOptions = {
      width: 220,
      height: 220,
      quality: 32,
      outputType: 1,
      maximumImagesCount: 1
    };


    this.imagePicker.getPictures(imagePickerOptions).then(async (res) => {
      if (res[0] === undefined) {
        return;
      }
      this.firestoreService.uploadProfilePicture(res[0], 'base64').then(() => {
        this.firestoreService.profilePictureDownloadUrl().pipe(first()).subscribe(url => {
          this.userService.updateUser({
            photoURL: url
          });
        });
      });
    }, (error) => {
      alert(error);
    });
  }

  private setInitialValues() {
    console.log(this.user);
  }
}
