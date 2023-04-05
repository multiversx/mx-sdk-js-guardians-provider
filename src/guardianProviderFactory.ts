import { AxiosRequestConfig } from "axios";
import ApiFetcher from "./apiFetcher";
import GenericGuardianProvider from "./genericGuardianProvider";
import { IInitData, IProviderSpecificHooks } from "./interface";
import ProvidersResolver from "./providersResolver";

class GuardianProviderFactory {
  private static fetcher = ApiFetcher.getInstance();
  private static _instance: GenericGuardianProvider | null;

  constructor() {
    throw new Error(
      "Error: Instantiation failed: Use GuardianProviderFactory.createProvider() instead of new."
    );
  }

  static async createProvider(
    address: string,
    apiAddress: string,
    providerSpecificHooks: IProviderSpecificHooks
  ): Promise<GenericGuardianProvider> {
    const guardianInitData =
      await GuardianProviderFactory.getAccountGuardianInitData(
        address,
        apiAddress
      );

    const providerData = ProvidersResolver.getProviderByServiceId(
      guardianInitData.activeGuardianServiceUid
    );

    if (!guardianInitData.activeGuardianServiceUid)
      throw new Error("The API did not return ant guardian service ID.");
    if (!providerData)
      throw new Error(
        `"${guardianInitData.activeGuardianServiceUid}" service provider could not be resolved.`
      );

    const provider = new providerData.provider(providerSpecificHooks);
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
