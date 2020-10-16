import { Component, OnInit, Input} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  status: string;
  statusSubscription: Subscription;
  @Input() socket: any;
  userForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) { }

  ngOnInit() {
    this.statusSubscription = this.authService.statusSubject.subscribe(
      (status: string) => {
        this.status = status;
      }
    );
    this.authService.emitStatusSubject();
    this.initForm();
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      pseudo: ['', Validators.required],
      roomCode: ['', Validators.required]
    })
  };
  
  onSignIn() {
    const pseudo = this.userForm.value['pseudo'];
    const name = this.userForm.value['roomCode'];
    const data = {
      pseudo: pseudo,
      name: name
    }
    this.socket.emit('joinRoom', data)
    this.authService.changeCreator();
  }
}
