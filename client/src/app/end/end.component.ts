import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { ChargingService } from '../charging.service';

@Component({
  selector: 'app-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class EndComponent implements OnInit {

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

    this.socket.on('goToCreation', () => {
      this.authService.changeCreator();
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

  onRestart() {
    this.socket.emit('restart', this.roomCode)
  }

}
