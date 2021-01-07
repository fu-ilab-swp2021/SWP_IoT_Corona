import { Component, Input, OnInit } from '@angular/core';
import { PAGES } from '../app.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  pages = PAGES;

  constructor() { }

  ngOnInit(): void {
  }

}
