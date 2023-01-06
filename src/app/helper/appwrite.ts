import { environment } from '../../environments/environment';
import { Client, Account, Storage, Databases, Functions } from 'appwrite';

export class Appwrite {
  private static client: Client | null;
  private static account: Account | null;
  private static storage: Storage | null;
  private static databases: Databases | null;
  private static functions: Functions | null;

  private static provider(): Client {
    if (this.client) {return this.client;}

    console.log('LANGUAGE:', navigator.language.substring(0, 2));
    this.client = new Client()
      .setEndpoint(environment.endpoint)
      .setProject(environment.project)
      .setLocale(navigator.language.substring(0, 2));

    return this.client;
  }

  static accountProvider() {
    if (this.account) {return this.account;}

    this.account = new Account(this.provider());
    return this.account;
  }

  static storageProvider() {
    if (this.storage) {return this.storage;}

    this.storage = new Storage(this.provider());
    return this.storage;
  }

  static databasesProvider() {
    if (this.databases) {return this.databases;}

    this.databases = new Databases(this.provider());
    return this.databases;
  }

  static functionsProvider() {
    if (this.functions) {return this.functions;}

    this.functions = new Functions(this.provider());
    return this.functions;
  }

  public static get providerSingleton() {
    return this.provider();
  }
}
