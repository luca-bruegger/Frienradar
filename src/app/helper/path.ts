export class Path {
  static default = this.getJumpTo() || '/tabs/radar';
  static login = '/login';
  static resetPassword = '/reset-password';
  static additionalLoginData = '/additional-login-data';

  static unauthorizedRoutes = [
    /\/login.*/,
    /\/reset-password.*/,
    /\/additional-login-data.*/
  ];

  static setJumpTo(url: string) {
    if (this.unauthorizedRoutes.some(route => route.test(url))) {
      return;
    }

    localStorage.setItem('jumpTo', url);
  }

  static getJumpTo() {
    return localStorage.getItem('jumpTo');
  }

  static hasVisitedOnboarding() {
    return localStorage.getItem('hasVisitedOnboarding') === 'true';
  }
}
