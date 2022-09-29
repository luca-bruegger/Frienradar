import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppwriteService } from "./appwrite.service";
import { BaseService } from "../service/base.service";
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private appwriteAccount = this.appwriteService.account;

  constructor(private appwriteService: AppwriteService,
              private storageService: StorageService,
              private baseService: BaseService,
              private navController: NavController) {

  }

  async currentUser() {
     return await this.appwriteAccount.get();
  }
}
