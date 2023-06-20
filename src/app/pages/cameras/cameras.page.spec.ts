import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CamerasPage } from './cameras.page';

describe('CamerasPage', () => {
  let component: CamerasPage;
  let fixture: ComponentFixture<CamerasPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CamerasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
