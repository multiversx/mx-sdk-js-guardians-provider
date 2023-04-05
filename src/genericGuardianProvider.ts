import ApiFetcher from "./apiFetcher";
import { IInitData, ITransaction } from "./interface";

class GenericGuardianProvider {
  protected _isAccountGuarded = false;
  protected _guardianAddress = "";
  protected _initialized = false;
  protected _pendingGuardianAddress = "";
  protected _pendingGuardianActivationEpoch = 0;
  protected _guardianServiceApiUrl = "";
  protected _activeGuardianServiceUid = "";
  protected fetcher = ApiFetcher.getInstance();

  public async applyGuardianSignature<T extends ITransaction>(
    _transactions: T[],
    _code: string
  ): Promise<T[]> {
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
    // return await this.init();
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
}

export default GenericGuardianProvider;
