import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChargingService } from '../charging.service';
import { AuthService } from '../auth.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() socket: any;
  roomCodeSubscription: Subscription;
  roomCode: string;
  playersSubscription: Subscription;
  players: string[];
  teamsSubscription: Subscription;
  teams: any[];
  scoreSubscription: Subscription;
  score: number[];
  status: string;
  statusSubscription: Subscription;
  isListener: boolean;
  isPlayer: boolean;

  constructor(private chargingService: ChargingService, private authService: AuthService) { }

  ngOnInit() {
    this.statusSubscription = this.authService.statusSubject.subscribe(
      (status: string) => {
        this.status = status;
        this.isListener = this.status === 'listener';
        this.isPlayer = this.status === 'player';
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
    this.scoreSubscription = this.chargingService.scoreSubject.subscribe(
      (score: number[]) => {
        this.score = score;
      }
    )
    this.chargingService.emitScoreSubject()
    }

    onRandomize() {
      this.socket.emit('randomizeTeam', this.roomCode);
      this.chargingService.emitTeamsSubject();
    }
}
