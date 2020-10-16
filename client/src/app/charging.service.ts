import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChargingService {

  roomCodeSubject = new Subject<string>();
  roomCode: string;
  playersSubject = new Subject<string[]>();
  players: string[];
  teamsSubject = new Subject<any[]>();
  teams: any[];
  scoreSubject = new Subject<number[]>();
  score: number[];
  chosenTeamSubject = new Subject<number>();
  chosenTeam: number;
  chosenPlayerSubject = new Subject <string[]>();
  chosenPlayer: string[];
  timerSubject = new Subject <number>();
  timer: number;
  stepSubject = new Subject <string>();
  step: string;
  lastsFoundSubject = new Subject <any[]>();
  lastsFound: any[];
  timeLeftSubject = new Subject <number>();
  timeLeft: number;
  boolPlaySubject = new Subject <boolean>();
  boolPlay: boolean;

  constructor() {
    this.lastsFound = [];
    this.teams = [[],[]];
    this.players = [];
  }

  emitBoolPlaySubject() {
    this.boolPlaySubject.next(this.boolPlay);
  }

  emitTimeLeftSubject() {
    this.timeLeftSubject.next(this.timeLeft);
  }

  emitLastsFoundSubject() {
    this.lastsFoundSubject.next(this.lastsFound);
  }

  emitStepSubject() {
    this.stepSubject.next(this.step);
  }

  emitTimerSubject() {
    this.timerSubject.next(this.timer);
  }

  emitChosenPlayerSubject() {
    this.chosenPlayerSubject.next(this.chosenPlayer);
  }

  emitChosenTeamSubject() {
    this.chosenTeamSubject.next(this.chosenTeam);
  }

  emitRoomCodeSubject() {
    this.roomCodeSubject.next(this.roomCode);
  }

  emitPlayersSubject() {
    this.playersSubject.next(this.players);
  }

  emitTeamsSubject() {
    this.teamsSubject.next(this.teams);
  }
  
  emitScoreSubject(){
    this.scoreSubject.next(this.score);
  }

  getPlayer(socket) {
    socket.on('nextPlayer', (chosenTeam, chosenPlayer, timer, lastsFound) => {
      this.chosenTeam = chosenTeam;
      this.emitChosenTeamSubject();
      this.chosenPlayer = chosenPlayer;
      this.emitChosenPlayerSubject();
      this.timer = timer;
      this.emitTimerSubject();
      this.lastsFound = lastsFound;
      this.emitLastsFoundSubject();
    })
  }

  getTimeLeft(socket) {
    socket.on('sendTimer', timeLeft => {
      this.timeLeft = timeLeft;
      this.emitTimeLeftSubject();
    })
  }

  getInfos(socket) {
    socket.emit('getRoomCode');
    socket.on('sendInfos', (room, players, teams, score, step, bool) => {
      this.roomCode = room;
      this.emitRoomCodeSubject();
      this.players = [];
      for (let player of players) {
        this.players.push(player[1]);
      }
      this.emitPlayersSubject();
      this.teams = teams;
      this.emitTeamsSubject();
      this.score = score;
      this.emitScoreSubject();
      this.step = step;
      this.emitStepSubject();
      this.boolPlay = bool;
      this.emitBoolPlaySubject();
    })
  }
}
