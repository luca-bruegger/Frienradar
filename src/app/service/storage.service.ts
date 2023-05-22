import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage = null;

  constructor(private ionicStorage: Storage) {
  }

  async set(key: string, value: any) {
    const storage = await this.defaultStorage();
    return storage.set(key, value);
  }

  async get(key: string) {
    const storage = await this.defaultStorage();
    return storage.get(key);
  }

  async remove(key: string) {
    const storage = await this.defaultStorage();
    return storage.remove(key);
  }

  private async defaultStorage(): Promise<Storage> {
    if (this.storage) {
      return new Promise((resolve) => resolve(this.storage));
    }

    return this.ionicStorage.create();
  }
}
