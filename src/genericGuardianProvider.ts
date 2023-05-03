import { Transaction } from "@multiversx/sdk-core/out";
import ApiFetcher from "./apiFetcher";
import GuardianProviderFactory from "./guardianProviderFactory";
import { IInitData } from "./interface";
import ProvidersResolver from "./providersResolver";

class GenericGuardianProvider {
  protected _isAccountGuarded = false;
  protected _guardianAddress = "";
  protected _initialized = false;
  protected _pendingGuardianAddress = "";
  protected _pendingGuardianActivationEpoch = 0;
  protected _guardianServiceApiUrl = "";
  protected _activeGuardianServiceUid = "";
  protected fetcher = ApiFetcher.getInstance();
  protected _codeInputLength = 0;
  protected _maxCodeInputLenght = 6;

  public async applyGuardianSignature(
    _transactions: Transaction[],
    _code: string
  ): Promise<Transaction[]> {
    throw new Error("Method not implemented.");
  }

  public async registerGuardian(): Promise<{
    qr: string;
    guardianAddress: string;
  }> {
    throw new Error("Method not implemented.");
  }

  public async verifyCode(_params: {
    code: string;
    guardian: string;
  }): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async init({
    activeGuardianServiceUid,
    isGuarded,
    activeGuardianAddress,
    pendingGuardianActivationEpoch,
    pendingGuardianAddress,
    providerServiceUrl,
  }: IInitData & { providerServiceUrl: string }): Promise<boolean> {
    try {
      this._guardianServiceApiUrl = providerServiceUrl;
      this._isAccountGuarded = isGuarded ?? false;
      this._guardianAddress = activeGuardianAddress ?? "";
      this._pendingGuardianAddress = pendingGuardianAddress ?? "";
      this._pendingGuardianActivationEpoch =
        pendingGuardianActivationEpoch ?? 0;
      this._activeGuardianServiceUid = activeGuardianServiceUid ?? "";
      this._initialized = true;
      return this._initialized;
    } catch (error) {
      throw error;
    }
  }

  public async reinitialize(): Promise<boolean> {
    if (!this.initialized) {
      throw new Error("Guardian provider is not initialized.");
    }
    const {
      activeGuardianServiceUid,
      isGuarded,
      activeGuardianAddress,
      pendingGuardianActivationEpoch,
      pendingGuardianAddress,
    } = (
      await this.fetcher.fetch({
        method: "get",
        baseURL: GuardianProviderFactory.apiAddress,
        url: `/accounts/${GuardianProviderFactory.address}/?withGuardianInfo=true`,
      })
    ).data;

    const providerData = ProvidersResolver.getProviderByServiceId(
      activeGuardianServiceUid ?? "ServiceID" // TODO: if the account is not guarded, let the user choose the guardian provider
    );

    if (!providerData) {
      throw new Error(
        `"${activeGuardianServiceUid}" service provider could not be resolved.`
      );
    }

    this.init({
      activeGuardianServiceUid,
      isGuarded,
      activeGuardianAddress,
      pendingGuardianActivationEpoch,
      pendingGuardianAddress,
      providerServiceUrl:
        providerData.providerServiceUrl[GuardianProviderFactory.networkId],
    });
    return true;
  }

  public get initialized(): boolean {
    return this._initialized;
  }

  public get isAccountGuarded(): boolean {
    return this._isAccountGuarded;
  }

  public get guardianAddress(): string {
    return this._guardianAddress;
  }

  public get pendingGuardianAddress(): string {
    return this._pendingGuardianAddress;
  }

  public get pendingGuardianActivationEpoch(): number {
    return this._pendingGuardianActivationEpoch;
  }

  public get guardianServiceApiUrl(): string {
    return this._guardianServiceApiUrl;
  }

  public get activeGuardianServiceUid(): string {
    return this.activeGuardianServiceUid;
  }

  public get codeInputLength(): number {
    if (!this._codeInputLength) {
      throw new Error("Code input length not set in provider.");
    }
    return this._codeInputLength > this._maxCodeInputLenght
      ? this._maxCodeInputLenght
      : this._codeInputLength;
  }
}

export default GenericGuardianProvider;
