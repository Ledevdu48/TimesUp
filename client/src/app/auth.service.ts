import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  statusSubject = new Subject<string>();
  status: string;
  connectedSubject = new Subject<boolean>();
  connected = false;

  constructor() { }

  emitConnectedSubject() {
    this.connectedSubject.next(this.connected)
  }

  emitStatusSubject() {
    this.statusSubject.next(this.status.slice());
  }

  changeNone() {
    this.status = 'none';
    this.emitStatusSubject();
  }

  changeCreator() {
    this.status = 'creator';
    this.connected = true;
    this.emitConnectedSubject();
    this.emitStatusSubject();
  }

  changeProposal() {
    this.status = 'proposal';
    this.emitStatusSubject();
  }

  changePlayer() {
    this.status = 'player';
    this.emitStatusSubject();
  }

  changeListener() {
    this.status = 'listener';
    this.emitStatusSubject();
  }
}
