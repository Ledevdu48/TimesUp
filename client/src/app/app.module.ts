import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarModule } from '@syncfusion/ej2-angular-navigations';

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { CreationComponent } from './creation/creation.component';
import { PlayComponent } from './play/play.component';
import { ListenComponent } from './listen/listen.component';

import { AuthService } from './auth.service';
import { ChargingService } from './charging.service'
import { ProposalComponent } from './proposal/proposal.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    CreationComponent,
    PlayComponent,
    ListenComponent,
    ProposalComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarModule
  ],
  providers: [
    AuthService,
    ChargingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
