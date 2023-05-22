import { TestBed } from '@angular/core/testing';

import { ActionCableService } from './action-cable.service';

describe('ActionCableService', () => {
  let service: ActionCableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionCableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
