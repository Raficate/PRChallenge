import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddResultPage } from './add-result.page';

describe('AddResultPage', () => {
  let component: AddResultPage;
  let fixture: ComponentFixture<AddResultPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddResultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
