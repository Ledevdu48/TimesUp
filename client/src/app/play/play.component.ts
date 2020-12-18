import { ViewChild, Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { ChargingService } from '../charging.service';
import { Subscription } from 'rxjs'
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { DrawComponent } from '../draw/draw.component';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit {

  @ViewChild(DrawComponent) draw;

  status: string;
  statusSubscription: Subscription;
  @Input() socket: any;
  roomCode: string;
  chosenPlayerSubscription: Subscription;
  chosenPlayer: string[];
  chosenTeamSubscription: Subscription;
  chosenTeam: number;
  nameTeamSubscription: Subscription;
  nameTeam: string[];
  defaultName: boolean[];
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
  deleteProposals: any[] = [];
  validationForm: FormGroup;
  stepSubscription: Subscription;
  step: string;
  lastsFoundSubscription: Subscription;
  lastsFound: any[];
  displayLastFound: boolean;
  rules: string[] = [
    ' You can use any words (except the ones in the proposal). You can\'t skip proposal.',
    ' You can use only one word (except the ones in the proposal). You can skip proposal. Only one guess for your team.',
    ' You have to draw to make your team guess. You can skip proposal.'
  ];
  all: boolean = false;

  
  constructor(private authService: AuthService, private chargingService: ChargingService, private formBuilder: FormBuilder) { }

  ngOnInit(){
    this.chargingService.getInfos(this.socket)
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

    this.nameTeamSubscription = this.chargingService.nameTeamSubject.subscribe(
      (nameTeam: string[]) => {
        this.nameTeam = nameTeam;
        this.defaultName = [nameTeam[0] === '', nameTeam[1] === ''];
      }
    )
    this.chargingService.emitNameTeamSubject();

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

    this.socket.on('end', () => {
      this.authService.changeEnd();
    })

    this.socket.on('goToResult', () => {
      this.authService.changeResult();
    })
    
  }



  initForm(needValidation) {
    let group = {};
    var i = 0;
    for (let proposal of needValidation) {
      const controlName = i.toString() + '_delete';
      group[i.toString()] = ['', Validators.required];
      group[controlName] = [''];
      i = i+1;
    }
    this.validationForm = this.formBuilder.group(group);
  }

  onStart(){
    this.socket.emit('start', this.roomCode)
    this.socket.emit('launchTimer', this.roomCode, this.timer)
    setTimeout(() => {
      if (this.endRound == false) {
        this.validateProposals.push(this.currentProposal[1]);
        this.socket.emit('validateProposal', this.roomCode, this.currentProposal)
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
    if (this.step === 'Step 3'){
      this.draw.fillWhite()
    }
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
    if (this.step === 'Step 3'){
      this.draw.fillWhite()
    }
  }
  
  onCheckAll() {
    let set = {};
    var i = 0;
    for (let prop of this.validateProposals) {
      const controlName = i.toString() + '_delete';      
      set[i.toString()] = "valid";      
      set[controlName] = this.validationForm.value[controlName];
      i = i+1;
    }
    this.validationForm.setValue(set)
  }

  onSubmit() {
    const foundProposals = []
    var i = 0;
    for (let proposal of this.validateProposals) {
      const controlName = i.toString() + '_delete';
      if (this.validationForm.value[i.toString()] == "unvalid") {
        this.unvalidProposals.push(proposal);
        if (this.validationForm.value[controlName] == true) {
          this.deleteProposals.push(proposal);
        }
      }
      else {
        foundProposals.push(proposal);
        if (this.validationForm.value[controlName] == true) {
          this.deleteProposals.push(proposal);
        }
      }
      i = i+1;
    }    
    this.socket.emit('resultsRound', this.roomCode, this.chosenTeam, this.unvalidProposals, foundProposals, this.deleteProposals, this.timer);
    this.authService.changeListener();
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
