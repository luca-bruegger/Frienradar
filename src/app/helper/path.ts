export class Path {
  static default = this.getJumpTo() || '/tabs/radar';
  static login = '/login';
  static resetPassword = '/reset-password';
  static additionalLoginData = '/additional-login-data';

  static unauthorizedRoutes = [
    Path.login,
    Path.resetPassword,
    Path.additionalLoginData
  ];

  static setJumpTo(url: string) {
    if (this.unauthorizedRoutes.includes(url)) {
      return;
    }

    localStorage.setItem('jumpTo', url);
  }

  static getJumpTo() {
    return localStorage.getItem('jumpTo');
  }
}
