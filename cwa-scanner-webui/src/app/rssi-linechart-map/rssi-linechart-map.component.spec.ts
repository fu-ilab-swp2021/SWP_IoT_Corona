import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RssiLinechartMapComponent } from './rssi-linechart-map.component';

describe('RssiLinechartMapComponent', () => {
  let component: RssiLinechartMapComponent;
  let fixture: ComponentFixture<RssiLinechartMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RssiLinechartMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RssiLinechartMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
