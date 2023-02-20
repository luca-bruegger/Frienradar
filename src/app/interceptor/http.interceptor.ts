import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { TokenService } from '../service/token.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handle(request, next));
  }

  async handle(req: HttpRequest<any>, next: HttpHandler) {
    const token = await this.tokenService.getToken();
    console.log('AUTH TOKEN:', token);
    if (token) {
      req = this.attachToken(req, token);
    }

    return await next.handle(req).toPromise();
  }

  private attachToken(req: HttpRequest<any>, token: string) {
    return req.clone({
      setHeaders: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: token
      }
    });
  }
}
