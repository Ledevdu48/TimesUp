import { Component, OnInit, HostListener } from '@angular/core';
import * as io from 'socket.io-client';
import { AuthService } from './auth.service';
import { ChargingService } from './charging.service';
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
  innerWidth: any;
  innerHeighttxt: string;
  innerHeighttxt2: string;
  displayAds: boolean;
  step: string;
  stepSubscription: Subscription;

  constructor(private authService: AuthService, private chargingService: ChargingService) {}

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
    this.stepSubscription = this.chargingService.stepSubject.subscribe(
      (step) => {
        this.step = step;
        this.displayAds = this.step === 'Step 3' || this.innerWidth<1450 || this.innerHeight<750;
      }
    )
    this.chargingService.emitStepSubject()
    this.socket = io.connect('localhost:3000'); // 89.33.6.104
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
    this.innerHeighttxt = this.innerHeight.toString()+"px";
    this.innerHeighttxt2 = (this.innerHeight-210).toString()+"px";
    this.displayAds = this.step === 'Step 3' || this.innerWidth<1450 || this.innerHeight<750;
  }

  onResize(event) {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
    this.innerHeighttxt = this.innerHeight.toString()+"px";
    this.innerHeighttxt2 = (this.innerHeight-210).toString()+"px";
    this.displayAds = this.step === 'Step 3' || this.innerWidth<1450 || this.innerHeight<750;
  }

  onSizeSm() {
    return this.innerHeight<900 || this.innerWidth<1000
  }

  onSizeLg() {
    const bool = this.innerHeight>930 && this.innerWidth>1500;
    return this.innerHeight>900 && this.innerWidth>1000 && !bool;
  }

  onSizeXl() {
    return this.innerWidth>1500 && this.innerHeight>930
  }

  ngOnDestroy() {
    this.stepSubscription.unsubscribe();
    this.statusSubscription.unsubscribe();
    this.connectedSubscription.unsubscribe();
  }
}
