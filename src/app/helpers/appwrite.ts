import { environment } from "../../environments/environment";
import { Client, Account, Storage } from "appwrite";

export class Appwrite {
  private static client: Client | null;
  private static account: Account | null;
  private static storage: Storage | null;

  private static provider(): Client {
    if (this.client) return this.client;

    this.client = new Client()
      .setEndpoint(environment.endpoint)
      .setProject(environment.project)
      .setLocale(navigator.language);

    return this.client;
  }

  static accountProvider() {
    if (this.account) return this.account;

    this.account = new Account(this.provider());
    return this.account
  }

  static storageProvider() {
    if (this.storage) return this.storage;

    this.storage = new Storage(this.provider());
    return this.storage;
  }
}
