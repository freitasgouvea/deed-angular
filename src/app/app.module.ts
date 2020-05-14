import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { ModalModule } from './_modal';

import { AppComponent } from './app.component';
import { LandingComponent } from './landing/landing.component';
import { ClassroomComponent } from './classroom/classroom.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { ModalComponent } from './modal/modal.component';


@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    ClassroomComponent,
    NavbarComponent,
    FooterComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    ModalModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
