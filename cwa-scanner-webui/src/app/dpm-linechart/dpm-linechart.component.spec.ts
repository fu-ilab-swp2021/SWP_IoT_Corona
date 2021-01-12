import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DpmLinechartComponent } from './dpm-linechart.component';

describe('DpmLinechartComponent', () => {
  let component: DpmLinechartComponent;
  let fixture: ComponentFixture<DpmLinechartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DpmLinechartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DpmLinechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
