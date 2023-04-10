export interface ISignature {
  hex(): string;
}

export interface ITransaction {
  toPlainObject(): any;
  fromPlainObject(): any;
  applyGuardianSignature(signature: ISignature): void;
  guardian: IAddress;
}

export interface IAddress {
  bech32(): string;
}

export interface IAPIAccountResponse {
  data: {
    address: string;
    balance: string;
    nonce: number;
    shard: number;
    rootHash: string;
    txCount: number;
    scrCount: number;
    developerReward: string;
    activeGuardianServiceUid?: string;
    activeGuardianActivationEpoch?: number;
    activeGuardianAddress?: string;
    pendingGuardianActivationEpoch?: number;
    pendingGuardianServiceUid?: string;
    pendingGuardianAddress?: string;
    isGuarded?: boolean;
  };
}

export interface IInitData {
  activeGuardianServiceUid: string;
  isGuarded: boolean;
  activeGuardianAddress: string;
  pendingGuardianActivationEpoch: number;
  pendingGuardianAddress: string;
}

export interface IProviderSpecificHooks {
  getNativeAuthToken: () => string;
}
