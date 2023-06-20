import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IosPage } from './ios.page';

describe('IosPage', () => {
  let component: IosPage;
  let fixture: ComponentFixture<IosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(IosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
