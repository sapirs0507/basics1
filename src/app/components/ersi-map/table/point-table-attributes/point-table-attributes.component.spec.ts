import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointTableAttributesComponent } from './point-table-attributes.component';

describe('PointTableAttributesComponent', () => {
  let component: PointTableAttributesComponent;
  let fixture: ComponentFixture<PointTableAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PointTableAttributesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointTableAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
