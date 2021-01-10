import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RssiDistributionComponent } from './rssi-distribution.component';

describe('RssiDistributionComponent', () => {
  let component: RssiDistributionComponent;
  let fixture: ComponentFixture<RssiDistributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RssiDistributionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RssiDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
