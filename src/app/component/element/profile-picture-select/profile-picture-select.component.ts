import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountState } from '../../../store';
import { Picture } from '../../../helper/picture';
import { Camera, ImageOptions } from '@capacitor/camera';

@Component({
  selector: 'app-profile-picture-select',
  templateUrl: './profile-picture-select.component.html',
  styleUrls: ['./profile-picture-select.component.scss'],
})
export class ProfilePictureSelectComponent implements OnChanges {
  @Input() displayOnly = false;
  @Input() profilePicture = null;
  @Output() profilePictureChange = new EventEmitter<string>();

  constructor(private store: Store) {
  }

  ngOnChanges(changes: SimpleChanges) {
    const user = this.store.selectSnapshot(AccountState.user);

    if (changes.profilePicture.isFirstChange()) {
      if (user) {
        this.profilePicture = Picture.profilePictureViewURL(user.$id, Picture.cacheBreaker());
        return;
      }

      if (this.profilePicture === null || this.profilePicture === undefined || this.profilePicture === '') {
        this.profilePicture = 'assets/images/blank.png';
        return;
      }
    }

    if (/^(data)/.test(changes.profilePicture.currentValue)) {
      this.profilePicture = changes.profilePicture.currentValue;
      return;
    }

    this.profilePicture = Picture.profilePictureViewURL(user.$id, Picture.cacheBreaker());
  }

  displayImagePicker() {
    const imagePickerOptions = {
      width: 220,
      height: 220,
      quality: 32,
      allowVideo: false,
      resultType: 'dataUrl',
      webUseInput: true,
      promptLabelPicture: 'Foto aufnehmen',
      promptLabelPhoto: 'Bild auswählen',
      promptLabelCancel: 'Abbrechen',
      promptLabelHeader: 'Profilbild auswählen',
      source: 'PHOTOS'
    } as ImageOptions;


    Camera.getPhoto(imagePickerOptions).then(async (photo) => {
      const image = photo.dataUrl;
      this.profilePictureChange.emit(image);
      this.profilePicture = image;
    });
  }
}
