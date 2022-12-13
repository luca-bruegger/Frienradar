import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TabsPage } from './tabs.page';

import { TabsPageRoutingModule } from './tabs-routing.module';
import { NearbyPageModule } from '../page/nearby/nearby.module';
import { ChatPageModule } from '../page/chat/chat.module';
import { AccountsPageModule } from '../page/accounts/accounts.module';
import { ProfilePageModule } from '../page/profile/profile.module';
import { RadarPageModule } from '../page/radar/radar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    ChatPageModule,
    AccountsPageModule,
    NearbyPageModule,
    ProfilePageModule,
    RadarPageModule
  ],
  declarations: [
    TabsPage
  ],
  providers: []
})
export class TabsPageModule {}
