export class Path {
  static default = this.getJumpTo() || '/tabs/radar';
  static login = '/login';
  static resetPassword = '/reset-password';

  static setJumpTo(url: string) {
    if (url.includes('/login') || url.includes('/reset-password')) {
      return;
    }

    localStorage.setItem('jumpTo', url);
  }

  static getJumpTo() {
    return localStorage.getItem('jumpTo');
  }
}
