import { Injectable } from '@angular/core';
import { AppwriteService } from "./appwrite.service";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private appwriteService: AppwriteService) {
  }

  async uploadProfilePicture(id: string, profilePicture: string) {
    const file = await this.base64ToFile(profilePicture, id + '_profile_picture.jpeg')
    console.log(file)

    await this.appwriteService.storage.createFile('profile-picture', id, file)
  }

  async base64ToFile(base64, fileName) {
    const res = await fetch(base64)
    const buf = await res.arrayBuffer()
    return new File([buf], fileName, {
      type: 'image/jpeg',
    });
  };
}
