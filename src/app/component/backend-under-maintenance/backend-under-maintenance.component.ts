import { Component, OnDestroy, OnInit } from '@angular/core';
import { Appwrite } from '../../helper/appwrite';
import { interval, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { GlobalActions } from '../../store';

@Component({
  selector: 'app-backend-under-maintenance',
  templateUrl: './backend-under-maintenance.component.html',
  styleUrls: ['./backend-under-maintenance.component.scss'],
})
export class BackendUnderMaintenanceComponent implements OnInit, OnDestroy {
  subscription: Subscription;

  constructor(private store: Store) { }

  ngOnInit() {
    // check every 5 seconds if the backend is up again
    const source = interval(5000);
    this.subscription = source.subscribe(val => {
      Appwrite.accountProvider().getSession('current').then(data => {
        this.store.dispatch(new GlobalActions.ResetBackendUnderMaintenance());
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
