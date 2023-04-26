import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountState } from '../../../store';
import { Picture } from '../../../helper/picture';
import { Camera, ImageOptions } from '@capacitor/camera';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-profile-picture-select',
  templateUrl: './profile-picture-select.component.html',
  styleUrls: ['./profile-picture-select.component.scss'],
})
export class ProfilePictureSelectComponent implements OnChanges, OnInit {
  @Input() displayOnly = false;
  @Input() profilePicture = null;
  @Output() profilePictureChange = new EventEmitter<Blob>();
  croppedPicture = null;
  imageSelected = false;

  constructor(private store: Store) {
  }

  ngOnInit() {
    this.croppedPicture = this.profilePicture;
  }

  ngOnChanges(changes: SimpleChanges) {
    const user = this.store.selectSnapshot(AccountState.user);

    if (changes.profilePicture.firstChange) {
      if (user) {
        this.profilePicture = changes.profilePicture.currentValue;
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
      width: 500,
      height: 500,
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
      this.profilePicture = photo.dataUrl;
      this.imageSelected = true;
    });
  }

  async imageCropped($event: ImageCroppedEvent) {
    this.croppedPicture = await this.compressImage($event.base64);
    await this.updateProfilePictureBlob(this.croppedPicture);
  }

  private async updateProfilePictureBlob(photoString: string) {
    const fetchedPicture = await fetch(photoString);
    const pictureBlob = await fetchedPicture.blob();
    this.profilePictureChange.emit(pictureBlob);
  }

  private async compressImage(imageString: string) {
    // Default image sizes
    const width = 170;
    const height = 170;

    const image = await this.addImageSource(imageString);
    const scaleFactor = width / image.naturalWidth;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', scaleFactor);
  }

  private async addImageSource(src): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}
