import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { TokenService } from '../service/token.service';
import { catchError, map } from 'rxjs/operators';
import {
  BackendUnderMaintenanceComponent
} from '../component/backend-under-maintenance/backend-under-maintenance.component';
import { ModalController } from '@ionic/angular';

@Injectable()
export class Interceptor implements HttpInterceptor {
  private backendUnderMaintenanceModal: HTMLIonModalElement = null;

  constructor(private tokenService: TokenService,
              private modalController: ModalController) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handle(request, next));
  }

  async handle(req: HttpRequest<any>, next: HttpHandler) {
    const token = await this.tokenService.getToken();

    if (token) {
      req = this.attachToken(req, token);
    }

    return next.handle(req).pipe(map((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        if (this.backendUnderMaintenanceModal) {
          this.backendUnderMaintenanceModal.dismiss();
          this.backendUnderMaintenanceModal = null;
        }
        return event;
      }
    }), catchError(async err => {
      if (!err.status) {
        if (this.backendUnderMaintenanceModal) {
          throw err;
        }
        this.backendUnderMaintenanceModal = await this.modalController.create({
          component: BackendUnderMaintenanceComponent,
          cssClass: 'fullscreen',
        });
        await this.backendUnderMaintenanceModal.present();
      }
      throw err;
    })).toPromise();
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
