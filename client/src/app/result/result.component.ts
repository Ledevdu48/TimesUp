import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { ChargingService } from '../charging.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class ResultComponent implements OnInit {
  @Input() socket: any;
  roomCodeSubscription: Subscription;
  roomCode: string;
  teamsSubscription: Subscription;
  teams: any[];
  nameTeamSubscription: Subscription;
  nameTeam: string[];
  defaultName: boolean[];
  scoreSubscription: Subscription;
  score: number[];
  stepSubscription: Subscription;
  step: string
  innerHeight: any;
  innerWidth: any;

  constructor(private chargingService: ChargingService, private authService: AuthService) { }

  ngOnInit() {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
    this.chargingService.getInfos(this.socket)
    this.roomCodeSubscription = this.chargingService.roomCodeSubject.subscribe(
      (roomCode: string) => {
        this.roomCode = roomCode;
      }
    );
    this.chargingService.emitRoomCodeSubject()
    this.teamsSubscription = this.chargingService.teamsSubject.subscribe(
      (teams: any[]) => {
        this.teams = teams;
      }
    )
    this.chargingService.emitTeamsSubject()
    this.scoreSubscription = this.chargingService.scoreSubject.subscribe(
      (score: number[]) => {
        this.score = score;
      }
    )
    this.chargingService.emitScoreSubject()
    this.nameTeamSubscription = this.chargingService.nameTeamSubject.subscribe(
      (nameTeam: string[]) => {
        this.nameTeam = nameTeam;
        this.defaultName = [nameTeam[0] === '', nameTeam[1] === ''];
      }
    )
    this.chargingService.emitNameTeamSubject();
    this.stepSubscription = this.chargingService.stepSubject.subscribe(
      (step: string) => {
        this.step = step;
      }
    )
    this.chargingService.emitStepSubject();

    this.socket.on('goToListen', () => {
      this.authService.changeListener();
    })
  }

  onResize(event) {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
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
    this.roomCodeSubscription.unsubscribe();
    this.teamsSubscription.unsubscribe();
    this.scoreSubscription.unsubscribe();
    this.nameTeamSubscription.unsubscribe();
    this.stepSubscription.unsubscribe(); 
}
}
