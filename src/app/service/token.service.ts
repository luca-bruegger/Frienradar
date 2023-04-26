import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import jwtDecode from 'jwt-decode';
import { HttpResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  tokenValidChange = new Subject<boolean>();
  private readonly tokenKey = 'token';

  constructor(private storageService: StorageService) {
  }

  async getToken() {
    this.tokenValidChange.next(await this.isTokenValid());
    return this.storageService.get(this.tokenKey);
  }

  async isTokenValid() {
    const token = await this.storageService.get(this.tokenKey);

    if (!token) {
      return false;
    }

    const decodedToken = jwtDecode(token) as any;
    return decodedToken.exp > Date.now() / 1000;
  }

  async setTokenFromResponse(response: HttpResponse<any>) {
    this.tokenValidChange.next(true);
    const token = response.headers.get('Authorization');
    await this.storageService.set(this.tokenKey, token);
  }

  async removeToken() {
    this.tokenValidChange.next(false);
    await this.storageService.remove(this.tokenKey);
  }
}
