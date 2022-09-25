import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private baseService: BaseService) {}

  uploadProfilePicture(imageData: string, format: string) {
    return this.baseService.profilePictureRef.putString(imageData, format, {contentType: 'image/jpeg'})
      .catch(error => this.baseService.displayErrorMessage(error.message));
  }

  profilePictureDownloadUrl() {
    return this.baseService.profilePictureRef.getDownloadURL();
  }
}
