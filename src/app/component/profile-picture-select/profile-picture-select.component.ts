import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ImagePicker } from "@ionic-native/image-picker/ngx";
import { Capacitor } from "@capacitor/core";

@Component({
  selector: 'app-profile-picture-select',
  templateUrl: './profile-picture-select.component.html',
  styleUrls: ['./profile-picture-select.component.scss'],
})
export class ProfilePictureSelectComponent implements OnInit {
  private platform: string = Capacitor.getPlatform();
  @Input() displayOnly: boolean = false;

  @Input() profilePicture: string = 'assets/images/blank.png';
  @Output() profilePictureChange = new EventEmitter<string>();

  @ViewChild('profilePictureInput') profilePictureInput: ElementRef;

  constructor(private imagePicker: ImagePicker) {
  }

  ngOnInit() {
  }

  fileUpload($event: Event) {
    const element = $event.currentTarget as HTMLInputElement;
    if (element.files.length > 0) {
      const picture = element.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(picture);

      reader.addEventListener("load", () => {
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
}
