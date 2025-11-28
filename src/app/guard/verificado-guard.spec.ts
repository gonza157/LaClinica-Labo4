import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { verificadoGuard } from './verificado-guard';

describe('verificadoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => verificadoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
