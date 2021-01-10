import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpmLinechartComponent } from './ppm-linechart.component';

describe('PpmLinechartComponent', () => {
  let component: PpmLinechartComponent;
  let fixture: ComponentFixture<PpmLinechartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpmLinechartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PpmLinechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
