import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { ChargingService } from '../charging.service';
import { Subscription } from 'rxjs'
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { AngularFireModule } from '@angular/fire';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit {

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
  timeLeftSubscription: Subscription;
  timeLeft: number;
  boolPlaySubscription: Subscription;
  boolPlay: boolean;
  endRound: boolean = false;
  currentProposal: any[] = [0, ''];
  validateProposals: any[] = [];
  unvalidProposals: any[] = [];
  validationForm: FormGroup;
  stepSubscription: Subscription;
  step: string;
  lastsFoundSubscription: Subscription;
  lastsFound: any[];
  displayLastFound: boolean;
  painting: boolean = false;
  color: string = "black";
  size: number = 3;
  data: any = {
    x: 0,
    y: 0,
    color: '',
    size: 0,
    painting: false
  }
  canvas: HTMLCanvasElement;
  ctx: any;
  colors: any = [
    ['white', false],
    ['black', true],
    ['red', false],
    ['yellow', false],
    ['blue', false],
    ['purple', false],
    ['pink', false],
    ['brown', false],
    ['green', false]
  ]
  
  constructor(private authService: AuthService, private chargingService: ChargingService, private formBuilder: FormBuilder) { }

  ngOnInit(){
    this.lastsFoundSubscription = this.chargingService.lastsFoundSubject.subscribe(
      (lastsFound: any[]) => {
        this.lastsFound = lastsFound;
        this.displayLastFound = !(typeof this.lastsFound === "undefined");
      }
    )
    this.chargingService.emitLastsFoundSubject()

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
      }
    );
    this.chargingService.emitChosenPlayerSubject();

    this.chosenTeamSubscription = this.chargingService.chosenTeamSubject.subscribe(
      (chosenTeam: number) => {
        this.chosenTeam = chosenTeam;
      }
    );
    this.chargingService.emitChosenTeamSubject();

    this.timerSubscription = this.chargingService.timerSubject.subscribe(
      (timer: number) => {
        this.timer = timer;
      }
    );
    this.chargingService.emitTimerSubject();

    this.timeLeft = this.timer;
    this.chargingService.getTimeLeft(this.socket);

    this.socket.on('firstPlayer', (chosenTeam, chosenPlayer, timer) => {
      this.chosenTeam = chosenTeam;
      this.chosenPlayer = chosenPlayer;
      this.timer = timer;
    })


    this.socket.on('yourRoom', code => {
      this.roomCode = code;
    })

    this.socket.on('initCanvas', () => {
      setTimeout(() => this.initCanvas(), 10)
    })


  }

  initCanvas() {
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas")
    if (this.canvas != null) {
      this.canvas.height = 550;
      this.canvas.width = 900;

      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  initForm(needValidation) {
    let group = {};
    for (let proposal of needValidation) {
      group[proposal] = ['', Validators.required];
    }
    this.validationForm = this.formBuilder.group(group);
  }

  onStart(){
    this.socket.emit('start', this.roomCode)
    this.socket.emit('launchTimer', this.roomCode, this.timer)
    setTimeout(() => {
      if (this.endRound == false) {
        this.initForm(this.validateProposals);
        this.socket.emit('end', this.roomCode)
        this.endRound = true;
      }
    }, 1000*this.timer)
    this.socket.emit('askProposal', this.roomCode, this.currentProposal, true)
    this.socket.on('sendProposal', proposal => {
      this.currentProposal = proposal;
    })
  }

  onSkip() {
    this.socket.emit('askProposal', this.roomCode, this.currentProposal, false)
    this.socket.on('sendProposal', proposal => {
      this.currentProposal = proposal;
    })
  }

  onValidate(){
    this.validateProposals.push(this.currentProposal[1]);
    this.socket.emit('validateProposal', this.roomCode, this.currentProposal)
    this.socket.on('sendProposal', proposal => {
      if (proposal[0] == -1) {
        this.initForm(this.validateProposals);
        this.socket.emit('end', this.roomCode)
        this.endRound = true;
      } else {
        this.currentProposal = proposal;
      }      
    })
  }

  onSubmit() {
    const foundProposals = []
    for (let proposal of this.validateProposals) {
      if (this.validationForm.value[proposal] == "unvalid") {
        this.unvalidProposals.push(proposal);
      }
      else {
        foundProposals.push(proposal);
      }
    }
    this.socket.emit('resultsRound', this.roomCode, this.chosenTeam, this.unvalidProposals, foundProposals, this.timer);
    this.authService.changeListener();
  }

  draw(event){
    const x = event.clientX-this.canvas.getBoundingClientRect().x;
    const y = event.clientY-this.canvas.getBoundingClientRect().y;

    this.data.x =  x;
    this.data.y = y;
    this.data.color = this.color;
    this.data.size = this.size;
    this.data.painting = this.painting;

      this.socket.emit('draw', this.data, this.roomCode)

      if (!this.painting) return

      this.ctx.lineWidth = this.data.size;
      this.ctx.strokeStyle = this.data.color;
      this.ctx.lineCap = "round";

      this.ctx.lineTo(x, y)
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(x, y)
  }

  startPosition(event) {
    this.painting = true;
    const x = event.clientX-this.canvas.getBoundingClientRect().x;
    const y = event.clientY-this.canvas.getBoundingClientRect().y;

    this.data.x =  x;
    this.data.y = y;
    this.data.color = this.color;
    this.data.size = this.size;
    this.data.painting = this.painting;

    this.socket.emit('startPosition', this.data, this.roomCode)
    this.draw(event);
    
  }

  endPosition(event) {
    this.painting = false;
    const x = event.clientX-this.canvas.getBoundingClientRect().x;
    const y = event.clientY-this.canvas.getBoundingClientRect().y;

    this.data.x =  x;
    this.data.y = y;
    this.data.color = this.color;
    this.data.painting = this.painting;

    this.socket.emit('endPosition', this.data, this.roomCode)
    this.ctx.beginPath();
  }

  changeColor(color){
    this.color = color;
    for (let coul of this.colors) {
      if (coul[0] === color){
        coul[1] = true;
      } else {
        coul[1] = false;
      }
    }    
  }

  fill() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.socket.emit('fill', this.color, this.roomCode);
  }

  fillWhite() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.socket.emit('fill', 'white', this.roomCode);
  }

  changeSize(number){
    this.size = number;
  }

  createClass(id){
    let coul = this.colors[id];
    let newClass = {
      'col box p-2': true
    };
    newClass[coul[0]] = true;
    newClass['bord'] = coul[1];
    return newClass
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
  }

}
