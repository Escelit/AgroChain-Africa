import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { WalletService } from './wallet.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let walletSpy: jest.Mocked<WalletService>;

  beforeEach(() => {
    walletSpy = {
      connect: jest.fn().mockResolvedValue('GTEST'),
      signTransaction: jest.fn().mockResolvedValue('signed-xdr'),
      disconnect: jest.fn(),
      getPublicKey: jest.fn().mockReturnValue('GTEST'),
      publicKey$: { pipe: jest.fn() } as any,
      connected$: {} as any,
      connecting: { set: jest.fn() } as any,
    } as any;

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
