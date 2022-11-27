export class Path {
  static default = this.getJumpTo() || '/tabs/radar';
  static login = '/login';

  static setJumpTo(url: string) {
    if (url.includes('login')) {
      return;
    }

    localStorage.setItem('jumpTo', url);
  }

  static getJumpTo() {
    return localStorage.getItem('jumpTo');
  }
}
