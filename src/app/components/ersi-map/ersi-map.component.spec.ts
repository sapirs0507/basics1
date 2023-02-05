import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErsiMapComponent } from './ersi-map.component';

describe('ErsiMapComponent', () => {
  let component: ErsiMapComponent;
  let fixture: ComponentFixture<ErsiMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErsiMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErsiMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
