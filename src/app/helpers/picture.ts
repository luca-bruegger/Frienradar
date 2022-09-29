import { environment } from "../../environments/environment";

export class Picture {
  static convertToBase64(picture: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      console.log(picture)
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
      .then(file => {
        return file
      });

    return new File([blob], 'profile_picture.png', {
      type: 'image/png'
    });
  }

  static viewURL(fileId: string) {
    return environment.endpoint + '/storage/buckets/profile-picture/files/'+fileId+'/view?project='+ environment.project;
  }
}
