import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { ChargingService } from '../charging.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
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

  constructor(private chargingService: ChargingService, private authService: AuthService) { }

  ngOnInit() {
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
  }

  ngOnDestroy() {
    this.roomCodeSubscription.unsubscribe();
    this.teamsSubscription.unsubscribe();
    this.scoreSubscription.unsubscribe();
    this.nameTeamSubscription.unsubscribe();
    this.stepSubscription.unsubscribe(); 
}
}
