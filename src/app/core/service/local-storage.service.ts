import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  setJumpTo(url: string) {
    if (url.includes('login')) {
      return;
    }
    localStorage.setItem('jumpTo', url);
  }

  getJumpTo() {
    return localStorage.getItem('jumpTo');
  }
}
