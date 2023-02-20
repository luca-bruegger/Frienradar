import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import jwtDecode from 'jwt-decode';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly tokenKey = 'token';

  constructor(private storageService: StorageService) {
  }

  async setToken(token: string) {
    await this.storageService.set(this.tokenKey, token);
  }

  async getToken() {
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
    const token = response.headers.get('Authorization');
    await this.storageService.set(this.tokenKey, token);
  }
}
