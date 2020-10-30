import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  isNone: boolean;
  isCreator: boolean;
  isProposal: boolean;
  isListener: boolean;
  isPlayer: boolean;
  isAuth: boolean;
  socket: any;
  status: string;
  statusSubscription: Subscription;
  connectedSubscription : Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.changeNone();
    this.statusSubscription = this.authService.statusSubject.subscribe(
      (status: string) => {
        this.status = status;
        this.isNone = this.status === 'none';
        this.isCreator = this.status === 'creator';
        this.isProposal = this.status === 'proposal';
        this.isListener = this.status === 'listener';
        this.isPlayer = this.status === 'player';
      }
    );
    this.authService.emitStatusSubject();
    this.connectedSubscription = this.authService.connectedSubject.subscribe(
      (connected) => {
        this.isAuth = connected;
      }
    );
    this.authService.emitConnectedSubject();
    this.socket = io.connect('http://51.15.12.72:3000');  
  }

  ngOnDestroy() {
    this.statusSubscription.unsubscribe();
    this.connectedSubscription.unsubscribe();
  }
}
