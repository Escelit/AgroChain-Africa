import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { WalletService } from './wallet.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let walletSpy: jasmine.SpyObj<WalletService>;

  beforeEach(() => {
    walletSpy = jasmine.createSpyObj('WalletService', ['connect', 'signTransaction', 'disconnect', 'getPublicKey'], {
      publicKey$: { pipe: jasmine.createSpy() },
      connected$: {},
      connecting: { set: jasmine.createSpy() },
    });
    walletSpy.connect.and.returnValue(Promise.resolve('GTEST'));
    walletSpy.signTransaction.and.returnValue(Promise.resolve('signed-xdr'));
    walletSpy.getPublicKey.and.returnValue('GTEST');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: WalletService, useValue: walletSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('should be unauthenticated initially', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should logout and clear state', () => {
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(walletSpy.disconnect).toHaveBeenCalled();
  });
});
