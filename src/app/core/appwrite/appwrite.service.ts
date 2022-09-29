import { Injectable } from '@angular/core';
import { Account, Client, Storage } from "appwrite";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AppwriteService {
  private client = new Client()
    .setEndpoint(environment.endpoint)
    .setProject(environment.project);

  constructor() {
  }

  get account(){
    return new Account(this.client);
  }

  get storage(){
    return new Storage(this.client);
  }
}
