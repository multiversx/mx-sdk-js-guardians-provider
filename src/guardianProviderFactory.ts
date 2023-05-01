import { AxiosRequestConfig } from "axios";
import ApiFetcher from "./apiFetcher";
import GenericGuardianProvider from "./genericGuardianProvider";
import { IInitData } from "./interface";
import ProvidersResolver from "./providersResolver";

class GuardianProviderFactory {
  private static fetcher = ApiFetcher.getInstance();
  private static _instance: GenericGuardianProvider | null;
  private static _apiAddress = "";
  private static _address = "";

  public static get apiAddress(): string {
    return this._apiAddress;
  }

  public static get address(): string {
    return this._address;
  }

  constructor() {
    throw new Error(
      "Error: Instantiation failed: Use GuardianProviderFactory.createProvider() instead of new."
    );
  }

  static async createProvider(
    address: string,
    apiAddress: string
  ): Promise<GenericGuardianProvider> {
    this._apiAddress = apiAddress;
    this._address = address;
    const guardianInitData =
      await GuardianProviderFactory.getAccountGuardianInitData(
        address,
        apiAddress
      );

    const providerData = ProvidersResolver.getProviderByServiceId(
      guardianInitData.activeGuardianServiceUid ?? "ServiceID" // TODO: if the account is not guarded, let the user choose the guardian provider
    );

    if (!providerData)
      throw new Error(
        `"${guardianInitData.activeGuardianServiceUid}" service provider could not be resolved.`
      );

    const provider = new providerData.provider();
    provider.init({
      ...guardianInitData,
      providerServiceUrl: providerData.providerServiceUrl,
    });

    return provider;
  }

  public getInstance(): GenericGuardianProvider {
    if (!GuardianProviderFactory._instance)
      throw new Error(
        "Error: Instantiation failed: Use GuardianProviderFactory.createProvider() first in order to initialize the provider."
      );
    return GuardianProviderFactory._instance;
  }

  public static setRequestTransformer(
    transformer: (config: AxiosRequestConfig) => AxiosRequestConfig
  ): void {
    this.fetcher.requestTransformer = transformer;
  }

  private static async getAccountGuardianInitData(
    address: string,
    apiAddress: string
  ): Promise<IInitData> {
    const {
      activeGuardianServiceUid,
      isGuarded,
      activeGuardianAddress,
      pendingGuardianActivationEpoch,
      pendingGuardianAddress,
    } = (
      await this.fetcher.fetch({
        method: "get",
        baseURL: apiAddress,
        url: `/accounts/${address}/?withGuardianInfo=true`,
      })
    ).data;

    return {
      activeGuardianServiceUid,
      isGuarded,
      activeGuardianAddress,
      pendingGuardianActivationEpoch,
      pendingGuardianAddress,
    };
  }
}

export default GuardianProviderFactory;
