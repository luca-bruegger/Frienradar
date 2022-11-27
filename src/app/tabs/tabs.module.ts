import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TabsPage } from './tabs.page';

import { TabsPageRoutingModule } from './tabs-routing.module';
import { NearbyPageModule } from '../pages/nearby/nearby.module';
import { ChatPageModule } from '../pages/chat/chat.module';
import { InterestPageModule } from '../pages/interest/interest.module';
import { ProfilePageModule } from '../pages/profile/profile.module';
import { RadarPageModule } from '../pages/radar/radar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    ChatPageModule,
    InterestPageModule,
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
