import { Component, OnInit } from '@angular/core';
import { PAGES } from '../pages/pages.model';

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
