import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChargingService } from '../charging.service';
import { AuthService } from '../auth.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class SidebarComponent implements OnInit {

  @Input() socket: any;
  roomCodeSubscription: Subscription;
  roomCode: string;
  playersSubscription: Subscription;
  players: string[];
  teamsSubscription: Subscription;
  teams: any[];
  nameTeamSubscription: Subscription;
  nameTeam: string[];
  defaultName: boolean[];
  scoreSubscription: Subscription;
  score: number[];
  status: string;
  statusSubscription: Subscription;
  stepSubscription: Subscription;
  step: string;
  isListener: boolean;
  isPlayer: boolean;
  isProposal: boolean;
  isEnd: boolean;
  isResult: boolean;
  isCreator: boolean;
  innerHeight: any;
  innerWidth: any;


  constructor(private chargingService: ChargingService, private authService: AuthService) { }

  ngOnInit() {
    this.statusSubscription = this.authService.statusSubject.subscribe(
      (status: string) => {
        this.status = status;
        this.isCreator = this.status === 'creator';
        this.isListener = this.status === 'listener';
        this.isPlayer = this.status === 'player';
        this.isProposal = this.status === 'proposal';
        this.isEnd = this.status === 'end';
        this.isResult = this.status === 'result';
      }
    );
    this.authService.emitStatusSubject();
    this.chargingService.getInfos(this.socket);
    this.roomCodeSubscription = this.chargingService.roomCodeSubject.subscribe(
      (roomCode: string) => {
        this.roomCode = roomCode;
      }
    );
    this.chargingService.emitRoomCodeSubject()
    this.playersSubscription = this.chargingService.playersSubject.subscribe(
      (players: any[]) => {
        this.players = players;
      })
    this.chargingService.emitPlayersSubject()
    this.teamsSubscription = this.chargingService.teamsSubject.subscribe(
      (teams: any[]) => {
        this.teams = teams;
      }
    )
    this.chargingService.emitTeamsSubject()
    this.nameTeamSubscription = this.chargingService.nameTeamSubject.subscribe(
      (nameTeam: string[]) => {
        this.nameTeam = nameTeam;
        this.defaultName = [nameTeam[0] === '', nameTeam[1] === ''];
      }
    )
    this.chargingService.emitNameTeamSubject();
    this.scoreSubscription = this.chargingService.scoreSubject.subscribe(
      (score: number[]) => {
        this.score = score;
      }
    )
    this.chargingService.emitScoreSubject()
    this.stepSubscription = this.chargingService.stepSubject.subscribe(
      (step: string) => {
        this.step = step;
      }
    )
    this.chargingService.emitStepSubject();
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
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

    onRandomize() {
      this.socket.emit('randomizeTeam', this.roomCode);
      this.chargingService.emitTeamsSubject();
    }

    ngOnDestroy() {
      this.statusSubscription.unsubscribe();
      this.playersSubscription.unsubscribe();
      this.roomCodeSubscription.unsubscribe();
      this.teamsSubscription.unsubscribe();
      this.scoreSubscription.unsubscribe();
      this.stepSubscription.unsubscribe();
      this.nameTeamSubscription.unsubscribe();
    }
}
