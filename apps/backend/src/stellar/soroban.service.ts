import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Contract,
  Networks,
  TransactionBuilder,
  Keypair,
  SorobanRpc,
  nativeToScVal,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';

export interface InvokeContractParams {
  contractId: string;
  method: string;
  args: xdr.ScVal[];
  signerSecret: string;
}

@Injectable()
export class SorobanService {
  private readonly logger = new Logger(SorobanService.name);
  private rpcServer: SorobanRpc.Server;
  private network: string;

  constructor(private config: ConfigService) {
    const isTestnet = config.get('STELLAR_NETWORK') === 'testnet';
    this.rpcServer = new SorobanRpc.Server(
      config.get('STELLAR_RPC_URL') || 'https://soroban-testnet.stellar.org',
    );
    this.network = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
  }

  async invokeContract(params: InvokeContractParams): Promise<any> {
    const { contractId, method, args, signerSecret } = params;
    const keypair = Keypair.fromSecret(signerSecret);
    const account = await this.rpcServer.getAccount(keypair.publicKey());

    const contract = new Contract(contractId);
    const tx = new TransactionBuilder(account, {
      fee: '1000000',
      networkPassphrase: this.network,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const preparedTx = await this.rpcServer.prepareTransaction(tx);
    preparedTx.sign(keypair);

    const response = await this.rpcServer.sendTransaction(preparedTx);
    this.logger.log(`Contract invoke ${method} hash: ${response.hash}`);

    // Poll for result
    return this.pollTransaction(response.hash);
  }

  async simulateContract(params: Omit<InvokeContractParams, 'signerSecret'> & { signerPublicKey: string }): Promise<any> {
    const account = await this.rpcServer.getAccount(params.signerPublicKey);
    const contract = new Contract(params.contractId);
    const tx = new TransactionBuilder(account, {
      fee: '1000000',
      networkPassphrase: this.network,
    })
      .addOperation(contract.call(params.method, ...params.args))
      .setTimeout(30)
      .build();

    const result = await this.rpcServer.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationSuccess(result) && result.result) {
      return scValToNative(result.result.retval);
    }
    throw new Error('Simulation failed');
  }

  private async pollTransaction(hash: string, attempts = 20): Promise<any> {
    for (let i = 0; i < attempts; i++) {
      await new Promise(r => setTimeout(r, 1500));
      const result = await this.rpcServer.getTransaction(hash);
      if (result.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        const meta = result.resultMetaXdr;
        return result;
      }
      if (result.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
        throw new Error(`Transaction failed: ${hash}`);
      }
    }
    throw new Error(`Transaction timeout: ${hash}`);
  }

  buildAddressVal(address: string): xdr.ScVal {
    return nativeToScVal(address, { type: 'address' });
  }

  buildU64Val(value: bigint | number): xdr.ScVal {
    return nativeToScVal(BigInt(value), { type: 'u64' });
  }

  buildI128Val(value: bigint | number): xdr.ScVal {
    return nativeToScVal(BigInt(value), { type: 'i128' });
  }

  buildSymbolVal(value: string): xdr.ScVal {
    return xdr.ScVal.scvSymbol(value);
  }

  buildStringVal(value: string): xdr.ScVal {
    return nativeToScVal(value, { type: 'string' });
  }
}
