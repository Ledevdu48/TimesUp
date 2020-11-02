import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss']
})
export class DrawComponent implements OnInit {

  @Input() socket: any;
  @Input() roomCode: string;
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
  sizes: any = [
    [3, true],
    [10, false],
    [20, false],
    [40, false]
  ]

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.initCanvas();
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

  draw(event){
    const x = event.clientX-this.canvas.getBoundingClientRect().x;
    const y = event.clientY-this.canvas.getBoundingClientRect().y;

    this.data.x = x;
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

    this.data.x = x;
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

    this.data.x = x;
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
    for (let size of this.sizes) {
      if(size[0] === number) {
        size[1] = true;
      } else {
        size[1] = false;
      }
    }
  }

  createClassCoul(id){
    let coul = this.colors[id];
    let newClass = {
      'box p-2': true
    };
    newClass[coul[0]] = true;
    newClass['bord'] = coul[1];
    return newClass
  }

  createClassSize(id){
    let size = this.sizes[id];
    let newClass = {
      'box p-1 m-0 white': true
    };
    newClass['bord'] = size[1];
    return newClass
  }

}
