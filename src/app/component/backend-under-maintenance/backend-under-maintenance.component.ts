import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { GlobalActions } from '../../store';
import { first } from 'rxjs/operators';
import { ApiService } from '../../service/api.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-backend-under-maintenance',
  templateUrl: './backend-under-maintenance.component.html',
  styleUrls: ['./backend-under-maintenance.component.scss'],
})
export class BackendUnderMaintenanceComponent implements OnInit, OnDestroy {
  subscription: Subscription;

  constructor(private apiService: ApiService,
              private modalController: ModalController,
              private store: Store) { }

  ngOnInit() {
    // check every 5 seconds if the backend is up again
    const source = interval(5000);
    this.subscription = source.subscribe(async val => {
      await this.apiService.get('/current_user').pipe(first()).subscribe((response: any) => {
      }, (error) => {
        if (error.status !== 0) {
          this.store.dispatch(new GlobalActions.ShowToast({
            message: 'Verbindung wiederhergestellt',
            color: 'success'
          }));
          this.subscription.unsubscribe();
          this.modalController.dismiss();
        }
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
