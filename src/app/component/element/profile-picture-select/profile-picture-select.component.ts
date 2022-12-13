import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Capacitor } from '@capacitor/core';
import { Store } from '@ngxs/store';
import { AccountState } from '../../../store';
import { Picture } from '../../../helper/picture';

interface IResizeImageOptions {
  maxSize: number;
  file: File;
}

@Component({
  selector: 'app-profile-picture-select',
  templateUrl: './profile-picture-select.component.html',
  styleUrls: ['./profile-picture-select.component.scss'],
})
export class ProfilePictureSelectComponent implements OnChanges {
  private platform: string = Capacitor.getPlatform();
  @Input() displayOnly = false;

  @Input() profilePicture = 'assets/images/blank.png';
  @Output() profilePictureChange = new EventEmitter<string>();

  @ViewChild('profilePictureInput') profilePictureInput: ElementRef;

  constructor(private imagePicker: ImagePicker,
              private store: Store) {
  }

  ngOnChanges(changes: SimpleChanges) {
    const user = this.store.selectSnapshot(AccountState.user);

    if (changes.profilePicture.isFirstChange()) {
      this.profilePicture = Picture.profilePictureViewURL(user.$id, user.pictureBreaker);
      return;
    }

    if(/^(data)/.test(changes.profilePicture.currentValue)) {
      this.profilePicture = changes.profilePicture.currentValue;
      return;
    }

    this.profilePicture = Picture.profilePictureViewURL(user.$id, user.pictureBreaker);
  }

  async fileUpload($event: Event) {
    const element = $event.currentTarget as HTMLInputElement;
    if (element.files.length > 0) {
      const picture = element.files[0];
      const reader = new FileReader();
      const resizedImage = await this.resizeImage({file: picture, maxSize: 220});
      reader.readAsDataURL(resizedImage as Blob);

      reader.addEventListener('load', () => {
        const image = reader.result as string;
        this.profilePictureChange.emit(image);
        this.profilePicture = image;
      }, false);
    }
  }

  displayImagePicker() {
    if (this.platform === 'android' || this.platform === 'ios') {
      this.openMobileImagePicker();
    } else {
      this.openImagePicker();
    }
  }

  private openMobileImagePicker() {
    const imagePickerOptions = {
      width: 220,
      height: 220,
      quality: 32,
      outputType: 1,
      allowVideo: false,
      maximumImagesCount: 1
    };


    this.imagePicker.getPictures(imagePickerOptions).then(async (res) => {
      if (res[0] === undefined) {
        return;
      }

      const image = 'data:image/png;base64,' + (res[0] as string);
      this.profilePictureChange.emit(image);
      this.profilePicture = image;
    });
  }

  private openImagePicker() {
    this.profilePictureInput.nativeElement.click();
  }


  resizeImage(settings: IResizeImageOptions) {
    const file = settings.file;
    const maxSize = settings.maxSize;
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');
    const dataURItoBlob = (dataURI: string) => {
      const bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
        atob(dataURI.split(',')[1]) :
        unescape(dataURI.split(',')[1]);
      const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
      const max = bytes.length;
      const ia = new Uint8Array(max);
      for (let i = 0; i < max; i++) {ia[i] = bytes.charCodeAt(i);}
      return new Blob([ia], {type: mime});
    };
    const resize = () => {
      let width = image.width;
      let height = image.height;

      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      return dataURItoBlob(dataUrl);
    };

    return new Promise((ok, no) => {
      if (!file.type.match(/image.*/)) {
        no(new Error('Not an image'));
        return;
      }

      reader.onload = (readerEvent: any) => {
        image.onload = () => ok(resize());
        image.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}
