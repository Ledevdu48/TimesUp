import { Component, OnInit, HostListener } from '@angular/core';
import * as io from 'socket.io-client';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})

export class AppComponent implements OnInit{

  isNone: boolean;
  isCreator: boolean;
  isProposal: boolean;
  isListener: boolean;
  isPlayer: boolean;
  isEnd: boolean;
  isResult: boolean;
  isAuth: boolean;
  socket: any;
  status: string;
  statusSubscription: Subscription;
  connectedSubscription : Subscription;
  innerHeight: any;
  innerHeighttxt: string;

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
        this.isEnd = this.status === 'end';
        this.isResult = this.status === 'result'
      }
    );
    this.authService.emitStatusSubject();
    this.connectedSubscription = this.authService.connectedSubject.subscribe(
      (connected) => {
        this.isAuth = connected;
      }
    );
    this.authService.emitConnectedSubject();
    this.socket = io.connect('89.33.6.104:3000'); // 89.33.6.104
    this.innerHeight = window.innerHeight-85;
    this.innerHeighttxt = this.innerHeight.toString()+"px";
  }

  onResize(event) {
    this.innerHeight = window.innerHeight-85;
    this.innerHeighttxt = this.innerHeight.toString()+"px";
  }

  ngOnDestroy() {
    this.statusSubscription.unsubscribe();
    this.connectedSubscription.unsubscribe();
  }
}
