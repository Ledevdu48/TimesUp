import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChargingService } from '../charging.service';
@Component({
  selector: 'app-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class CreationComponent implements OnInit {

  parametersForm: FormGroup;
  status: string;
  statusSubscription: Subscription;
  @Input() socket: any;
  playersSubscription: Subscription;
  players: string[];
  roomCodeSubscription: Subscription;
  roomCode: string;
  teams: any[];
  teamsSubscription: Subscription;
  createTeams: boolean;
  alone: boolean;
  innerHeight: any;
  innerWidth: any;

  constructor(private authService: AuthService, private formBuilder: FormBuilder, private chargingService: ChargingService) { }

  ngOnInit() {
    this.playersSubscription = this.chargingService.playersSubject.subscribe(
      (players: any[]) => {
        this.players = players;
        this.alone = this.players.length < 2;
      })
    this.chargingService.emitPlayersSubject()
    this.teamsSubscription = this.chargingService.teamsSubject.subscribe(
      (teams: any[]) => {
        this.teams = teams;
        this.createTeams = this.players.length != this.teams[0].length+this.teams[1].length;
      }
    )
    this.chargingService.emitTeamsSubject()
    this.statusSubscription = this.authService.statusSubject.subscribe(
      (status: string) => {
        this.status = status;
      }
    );
    this.authService.emitStatusSubject();
    this.roomCodeSubscription = this.chargingService.roomCodeSubject.subscribe(
      (roomCode: string) => {
        this.roomCode = roomCode;
      }
    );
    this.chargingService.emitRoomCodeSubject();

    this.socket.on('goToProposal', () => {
      this.authService.changeProposal();
      this.socket.emit('chargingProposal', this.roomCode);
    })

    this.initForm();

    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
  }

  initForm() {
    this.parametersForm = this.formBuilder.group({
      numberProp: [2, Validators.required],
      timerStep1: [30, Validators.required],
      timerStep2: [30, Validators.required],
      timerStep3: [30, Validators.required],
      nameTeam1: [''],
      nameTeam2: ['']
    })
    
    this.socket.on('newParameters', data => {
      this.parametersForm.controls['numberProp'].setValue(data.numberProp);
      this.parametersForm.controls['timerStep1'].setValue(data.timerStep1);
      this.parametersForm.controls['timerStep2'].setValue(data.timerStep2);
      this.parametersForm.controls['timerStep3'].setValue(data.timerStep3);
      this.parametersForm.controls['nameTeam1'].setValue(data.nameTeam1);
      this.parametersForm.controls['nameTeam2'].setValue(data.nameTeam2);
    })
  };

  onSend() {
    const numberProp = this.parametersForm.value['numberProp'];
    const timerStep1 = this.parametersForm.value['timerStep1'];
    const timerStep2 = this.parametersForm.value['timerStep2'];
    const timerStep3 = this.parametersForm.value['timerStep3'];
    const nameTeam1 = this.parametersForm.value['nameTeam1'];
    const nameTeam2 = this.parametersForm.value['nameTeam2'];
    const data = {
      numberProp: numberProp,
      timerStep1: timerStep1,
      timerStep2: timerStep2,
      timerStep3: timerStep3,
      nameTeam1: nameTeam1,
      nameTeam2: nameTeam2
    }
    this.socket.emit('parametersToUsers', data, this.roomCode)
  }

  onLaunch() {
    const numberProp = this.parametersForm.value['numberProp'];
    const timerStep1 = this.parametersForm.value['timerStep1'];
    const timerStep2 = this.parametersForm.value['timerStep2'];
    const timerStep3 = this.parametersForm.value['timerStep3'];
    const nameTeam1 = this.parametersForm.value['nameTeam1'];
    const nameTeam2 = this.parametersForm.value['nameTeam2'];
    const data = {
      numberProp: numberProp,
      timerStep1: timerStep1,
      timerStep2: timerStep2,
      timerStep3: timerStep3,
      nameTeam1: nameTeam1,
      nameTeam2: nameTeam2
    }
    this.socket.emit('parametersToGame', data, this.roomCode)
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
    this.statusSubscription.unsubscribe();
    this.playersSubscription.unsubscribe();
    this.roomCodeSubscription.unsubscribe();
    this.teamsSubscription.unsubscribe();
  }
}
