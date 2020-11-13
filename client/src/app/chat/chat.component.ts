import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChargingService } from '../charging.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  @Input() socket: any;  
  chosenTeamSubscription: Subscription;
  chosenTeam: number;
  roomCodeSubscription: Subscription;
  roomCode: string;
  chatForm: FormGroup;
  messages: any = [];

  constructor(private chargingService: ChargingService, private formBuilder: FormBuilder) { }
  

  ngOnInit() {
    this.roomCodeSubscription = this.chargingService.roomCodeSubject.subscribe(
      (roomCode: string) => {
        this.roomCode = roomCode;
      }
    );
    this.chargingService.emitRoomCodeSubject()
    this.chosenTeamSubscription = this.chargingService.chosenTeamSubject.subscribe(
      (chosenTeam: number) => {
        this.chosenTeam = chosenTeam;
      }
    );
    this.chargingService.emitChosenTeamSubject();

    this.initForm();

    this.socket.on('sendChatMessage', (message, pseudo)=>{
      console.log(this.messages)
      this.messages.push({'pseudo': pseudo, 'text': message})
    })
  }

  
  initForm() {
    this.chatForm = this.formBuilder.group({
      message: ['', Validators.required]
    })
  }

  onSend() {
    const message = this.chatForm.value['message'];
    this.socket.emit('chatMessage', message, this.roomCode)
  }

  ngOnDestroy() {
    this.chosenTeamSubscription.unsubscribe();
  }

}
