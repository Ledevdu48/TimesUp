import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { ChargingService } from '../charging.service';
import { Subscription } from 'rxjs';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss']
})
export class ProposalComponent implements OnInit {

  status: string;
  statusSubscription: Subscription;
  @Input() socket: any;
  roomCode: string;
  numberProp: number;
  proposal: any[];
  proposalForm: FormGroup;
  message: string;
  displayForm: boolean = false;
  

  constructor(private authService: AuthService, private formBuilder: FormBuilder, private chargingService: ChargingService) { }

  ngOnInit() {
    
    this.statusSubscription = this.authService.statusSubject.subscribe(
      (status: string) => {
        this.status = status;
      }
    );
    this.authService.emitStatusSubject();

    this.socket.on('yourRoom', code => {
      this.roomCode = code;
    })

    this.socket.on('numberProp', numberProp => {
      this.numberProp = numberProp;
      this.proposal = [];
      for (var i = 1; i <= numberProp; i++) {
        this.proposal.push([i, ''])
      }
      this.initForm(this.numberProp);
    })

    this.socket.on('waitingOthers', () => {
      this.message = 'Proposals sent, waiting other players ...'
    })

    this.socket.on('goToListen', () => {
      this.chargingService.getPlayer(this.socket);
      this.authService.changeListener();
      this.socket.emit('chargingListener', this.roomCode, 'step 1');
    })
  }

  initForm(n) {
    let group = {};
    for (var i = 0; i < n; i++) {
      group[i] = ['', Validators.required];
    }
    this.proposalForm = this.formBuilder.group(group);
    this.displayForm = true;
  }

  onSubmit() {
    for (var i = 0; i < this.numberProp; i++) {
      this.proposal[i][1] = this.proposalForm.value[i];
    }
    this.socket.emit('yourProposals', this.proposal, this.roomCode)
  }

  ngOnDestroy() {
    this.statusSubscription.unsubscribe();
  }

}
