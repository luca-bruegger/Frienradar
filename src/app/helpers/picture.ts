import { environment } from '../../environments/environment';

export class Picture {
  static convertToBase64(picture: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          resolve(reader.result);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(picture);
    });
  }

  static async convertToPicture(base64: string) {
    const blob = await fetch(base64)
      .then(res => res.blob())
      .then(file => file);

    return new File([blob], 'profile_picture.png', {
      type: 'image/png'
    });
  }

  static profilePictureViewURL(userId: string, cacheBreaker: string = this.cacheBreaker()): string {
    return `${environment.endpoint}/storage/buckets/profile-picture/files/${userId}/view?project=${environment.project}&breaker=${cacheBreaker}`;
  }

  static cacheBreaker(): string {
    return new Date().getTime().toString();
  }
}
