import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountState, GlobalActions } from '../../../store';
import { Camera, ImageOptions } from '@capacitor/camera';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { TranslocoService } from '@ngneat/transloco';
import { AppService } from '../../../service/app.service';
import { PermissionService } from '../../../service/permission.service';

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

  constructor(private store: Store,
              private translocoService: TranslocoService,
              private appService: AppService,
              private permissionService: PermissionService) {
  }

  get isMobile() {
    return this.appService.isMobile();
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
  }

  async displayImagePicker() {
    const imagePickerOptions = {
      width: 1000,
      height: 1000,
      allowVideo: false,
      resultType: 'dataUrl',
      webUseInput: true,
      promptLabelPicture: this.translocoService.translate('profile-picture-select.select-photo'),
      promptLabelPhoto: this.translocoService.translate('profile-picture-select.take-photo'),
      promptLabelCancel: this.translocoService.translate('general.cancel'),
      promptLabelHeader: this.translocoService.translate('profile-picture-select.select'),
      source: 'PHOTOS'
    } as ImageOptions;

    await this.permissionService.requestPhoto(this.isMobile);

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
    const width = 1000;
    const height = 1000;

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
