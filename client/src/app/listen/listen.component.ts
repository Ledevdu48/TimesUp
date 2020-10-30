import { Component, OnInit, Input, ApplicationRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { ChargingService } from '../charging.service';
import { Subscription } from 'rxjs';
import { CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';

@Component({
  selector: 'app-listen',
  templateUrl: './listen.component.html',
  styleUrls: ['./listen.component.scss']
})
export class ListenComponent implements OnInit {

  status: string;
  statusSubscription: Subscription;
  @Input() socket: any;
  roomCode: string;
  chosenPlayerSubscription: Subscription;
  chosenPlayer: string[];
  chosenTeamSubscription: Subscription;
  chosenTeam: number;
  timerSubscription: Subscription;
  timer: number;
  stepSubscription: Subscription;
  step: string;
  lastsFoundSubscription: Subscription;
  lastsFound: any[] = [];
  display: string;
  timeLeftSubscription: Subscription;
  timeLeft: number;
  boolPlaySubscription: Subscription;
  boolPlay: boolean;
  endRoundSubscription: Subscription;
  endRound: boolean;
  displayLastFound: boolean;
  displayChosenTeam: boolean;
  displayChosenPlayer: boolean;
  canvas: HTMLCanvasElement;
  ctx: any;

  constructor(private authService: AuthService, private chargingService: ChargingService, private ref: ApplicationRef) { }

  ngOnInit() {

    this.endRoundSubscription = this.chargingService.endRoundSubject.subscribe(
      (endRound: boolean) => {
        this.endRound = endRound;
      }
    )
    this.chargingService.emitEndRoundSubject();

    this.boolPlaySubscription = this.chargingService.boolPlaySubject.subscribe(
      (boolPlay: boolean) => {
        this.boolPlay = boolPlay;
      }
    )
    this.chargingService.emitBoolPlaySubject();

    this.timeLeftSubscription = this.chargingService.timeLeftSubject.subscribe(
      (timeLeft: number) => {
        this.timeLeft = timeLeft
      }
    )
    this.chargingService.emitTimeLeftSubject();
    this.chargingService.getTimeLeft(this.socket);

    this.stepSubscription = this.chargingService.stepSubject.subscribe(
      (step: string) => {
        this.step = step;
      }
    )
    this.chargingService.emitStepSubject();

    this.statusSubscription = this.authService.statusSubject.subscribe(
      (status: string) => {
        this.status = status;
      }
    );
    this.authService.emitStatusSubject();

    this.chosenPlayerSubscription = this.chargingService.chosenPlayerSubject.subscribe(
      (chosenPlayer: string[]) => {
        this.chosenPlayer = chosenPlayer;
        this.displayChosenPlayer = !(typeof this.chosenPlayer === "undefined");
      }
    );
    this.chargingService.emitChosenPlayerSubject();

    this.chosenTeamSubscription = this.chargingService.chosenTeamSubject.subscribe(
      (chosenTeam: number) => {
        this.chosenTeam = chosenTeam;
        this.displayChosenTeam = !(typeof this.chosenTeam === "undefined");
      }
    );
    this.chargingService.emitChosenTeamSubject();

    this.timerSubscription = this.chargingService.timerSubject.subscribe(
      (timer: number) => {
        this.timer = timer;
      }
    );
    this.chargingService.emitTimerSubject();

    this.lastsFoundSubscription = this.chargingService.lastsFoundSubject.subscribe(
      (lastsFound: any[]) => {
        this.lastsFound = lastsFound;
        this.displayLastFound = !(typeof this.lastsFound === "undefined");
      }
    )
    this.chargingService.emitLastsFoundSubject();

    this.socket.on('goodProposal', () => {
      this.display = 'Found';
      setTimeout(() => {
        this.display = '';
      }, 1000);
    })

    this.socket.on('skipProposal', () => {
      this.display = 'Skipped';
      setTimeout(() => {
        this.display = '';
      }, 1000);
    })

    this.socket.on('yourRoom', code => {
      this.roomCode = code;
    })

    this.socket.on('goToPlay', () => {
      this.authService.changePlayer();
      this.socket.emit('chargingPlayer', this.roomCode);
    })

    this.socket.on('initCanvas', () => {
      setTimeout(() => this.initCanvas(), 10)
    })

    this.socket.on('drawEmit', data => {
      this.draw(data, this.ctx)
    })
    this.socket.on('startPositionEmit', data => {
      this.startPosition(data, this.ctx)
    })
    this.socket.on('endPositionEmit', data => {
      this.endPosition(this.ctx)
    })
    this.socket.on('fillEmit', color => {
      this.fill(this.ctx, this.canvas, color)
    })



  }

  initCanvas() {
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas")
    if (this.canvas != null) {
      this.canvas.height = 600;
      this.canvas.width = 1000;

      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  draw(data, ctx) {
    if (!data.painting) return

    ctx.lineWidth = data.size;
    ctx.strokeStyle = data.color;
    ctx.lineCap = "round";

    const x = data.x;
    const y = data.y;

    ctx.lineTo(x, y)
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y)
  }

  startPosition(data, ctx) {
    this.draw(data, ctx);
  }

  endPosition(ctx) {
    ctx.beginPath();
  }

  fill(ctx, canvas, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ngOnDestroy() {
    this.statusSubscription.unsubscribe();
    this.chosenPlayerSubscription.unsubscribe();
    this.chosenTeamSubscription.unsubscribe();
    this.timerSubscription.unsubscribe();
    this.timeLeftSubscription.unsubscribe();
    this.boolPlaySubscription.unsubscribe();
    this.stepSubscription.unsubscribe();
    this.lastsFoundSubscription.unsubscribe();
    this.endRoundSubscription.unsubscribe();
  }

}
