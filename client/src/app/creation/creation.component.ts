import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChargingService } from '../charging.service';
@Component({
  selector: 'app-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.scss']
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
  launchBool: boolean;

  constructor(private authService: AuthService, private formBuilder: FormBuilder, private chargingService: ChargingService) { }

  ngOnInit() {
    this.playersSubscription = this.chargingService.playersSubject.subscribe(
      (players: any[]) => {
        this.players = players;
      })
    this.chargingService.emitPlayersSubject()
    this.teamsSubscription = this.chargingService.teamsSubject.subscribe(
      (teams: any[]) => {
        this.teams = teams;
        this.launchBool = this.players.length != this.teams[0].length+this.teams[1].length;
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
  }

  initForm() {
    this.parametersForm = this.formBuilder.group({
      numberProp: ['', Validators.required],
      timerStep1: ['', Validators.required],
      timerStep2: ['', Validators.required],
      timerStep3: ['', Validators.required]
    })

    this.socket.on('newParameters', data => {
      this.parametersForm.controls['numberProp'].setValue(data.numberProp);
      this.parametersForm.controls['timerStep1'].setValue(data.timerStep1);
      this.parametersForm.controls['timerStep2'].setValue(data.timerStep2);
      this.parametersForm.controls['timerStep3'].setValue(data.timerStep3);
    })
  };

  onSend() {
    const numberProp = this.parametersForm.value['numberProp'];
    const timerStep1 = this.parametersForm.value['timerStep1'];
    const timerStep2 = this.parametersForm.value['timerStep2'];
    const timerStep3 = this.parametersForm.value['timerStep3'];
    const data = {
      numberProp: numberProp,
      timerStep1: timerStep1,
      timerStep2: timerStep2,
      timerStep3: timerStep3
    }
    this.socket.emit('parametersToUsers', data, this.roomCode)
  }

  onLaunch() {
    const numberProp = this.parametersForm.value['numberProp'];
    const timerStep1 = this.parametersForm.value['timerStep1'];
    const timerStep2 = this.parametersForm.value['timerStep2'];
    const timerStep3 = this.parametersForm.value['timerStep3'];
    const data = {
      numberProp: numberProp,
      timerStep1: timerStep1,
      timerStep2: timerStep2,
      timerStep3: timerStep3
    }
    this.socket.emit('parametersToGame', data, this.roomCode)
  }
}
