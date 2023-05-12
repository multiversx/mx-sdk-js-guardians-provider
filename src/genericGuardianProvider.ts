import { Transaction } from "@multiversx/sdk-core/out";
import ApiFetcher from "./apiFetcher";
import { IInitData, IRegisterOptions } from "./interface";

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
  protected _address = "";
  protected _networkId = "";
  protected _apiAddress = "";
  protected _registrationDelay: number = 0;
  protected _backoffWrongCode: number = 0;

  public async applyGuardianSignature(
    _transactions: Transaction[],
    _code: string
  ): Promise<Transaction[]> {
    throw new Error("Method not implemented.");
  }

  public async registerGuardian(options?: IRegisterOptions): Promise<{
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
    address,
    apiAddress,
    networkId,
    registrationDelay,
    backoffWrongCode,
  }: IInitData & { providerServiceUrl: string }): Promise<boolean> {
    try {
      this._guardianServiceApiUrl = providerServiceUrl;
      this._isAccountGuarded = isGuarded ?? false;
      this._guardianAddress = activeGuardianAddress ?? "";
      this._pendingGuardianAddress = pendingGuardianAddress ?? "";
      this._pendingGuardianActivationEpoch =
        pendingGuardianActivationEpoch ?? 0;
      this._activeGuardianServiceUid = activeGuardianServiceUid ?? "";
      this._address = address;
      this._apiAddress = apiAddress;
      this._networkId = networkId;
      this._initialized = true;
      this._registrationDelay = registrationDelay;
      this._backoffWrongCode = backoffWrongCode;
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
        baseURL: this.apiAddress,
        url: `/accounts/${this.address}/?withGuardianInfo=true`,
      })
    ).data;

    this.init({
      activeGuardianServiceUid,
      isGuarded,
      activeGuardianAddress,
      pendingGuardianActivationEpoch,
      pendingGuardianAddress,
      providerServiceUrl: this.guardianServiceApiUrl,
      address: this._address,
      networkId: this._networkId,
      apiAddress: this._apiAddress,
      registrationDelay: this._registrationDelay,
      backoffWrongCode: this._backoffWrongCode,
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
    return this._activeGuardianServiceUid;
  }

  public get codeInputLength(): number {
    if (!this._codeInputLength) {
      throw new Error("Code input length not set in provider.");
    }
    return this._codeInputLength > this._maxCodeInputLenght
      ? this._maxCodeInputLenght
      : this._codeInputLength;
  }

  public get address(): string {
    return this._address;
  }

  public get networkId(): string {
    return this._networkId;
  }

  public get apiAddress(): string {
    return this._apiAddress;
  }

  public get registrationDelay(): number | undefined {
    return this._registrationDelay;
  }

  public get backoffWrongCode(): number | undefined {
    return this._backoffWrongCode;
  }
}

export default GenericGuardianProvider;
