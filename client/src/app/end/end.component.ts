import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { ChargingService } from '../charging.service';

@Component({
  selector: 'app-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss']
})
export class EndComponent implements OnInit {

  @Input() socket: any;
  roomCodeSubscription: Subscription;
  roomCode: string;
  teamsSubscription: Subscription;
  teams: any[];
  scoreSubscription: Subscription;
  score: number[];

  constructor(private chargingService: ChargingService, private authService: AuthService) { }

  ngOnInit() {
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

    this.socket('goToCreation', () => {
      this.authService.changeCreator();
    })
  }

  onRestart() {
    this.socket.emit('restart', this.roomCode)
  }

}