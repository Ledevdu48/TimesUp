import { Component, OnInit, Input} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class AuthComponent implements OnInit {

  status: string;
  statusSubscription: Subscription;
  @Input() socket: any;
  userForm: FormGroup;
  alreadyCreated: boolean = false;
  pseudoAlreadyTaken: boolean = false;
  innerHeight: any;
  innerWidth: any;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) { }

  ngOnInit() {
    this.statusSubscription = this.authService.statusSubject.subscribe(
      (status: string) => {
        this.status = status;
      }
    );
    this.authService.emitStatusSubject();
    this.initForm();

    this.socket.on('joinGame', () => {
      this.authService.changeCreator();
    })

    this.socket.on('gameAlreadyCreated', () => {
      this.alreadyCreated = true;
    })

    this.socket.on('pseudoAlreadyTaken', () => {
      this.pseudoAlreadyTaken = true;
    })

    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      pseudo: ['', Validators.required],
      roomCode: ['', [Validators.required, Validators.pattern('[a-z0-9]*')]]
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
  }
}
