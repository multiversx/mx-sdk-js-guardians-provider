import { AxiosRequestConfig } from "axios";
import ApiFetcher from "./apiFetcher";
import GenericGuardianProvider from "./genericGuardianProvider";
import { IInitData } from "./interface";
import GuardianProvidersResolver, {
  DEFAULT_SERVICE_ID,
} from "./guardianProvidersResolver";

//TODO: document id readme how service id enforces the provider to resolve to a specific provider (change guardian provider usecase)
interface ICreateOptions {
  /**
   * If `serviceId` is provided, the factory is forced to resolve to it.
   */
  serviceId?: string;
}

interface ICreateProviderParams {
  address: string;
  apiAddress: string;
  /**
   * The network id used to resolve the provider service url.
   */
  networkId: string;
  options?: ICreateOptions;
}

class GuardianProviderFactory {
  private static fetcher = ApiFetcher.getInstance();

  constructor() {
    throw new Error(
      "Error: Instantiation failed: Use GuardianProviderFactory.createProvider() instead of new."
    );
  }

  static async createProvider({
    address,
    apiAddress,
    networkId,
    options,
  }: ICreateProviderParams): Promise<GenericGuardianProvider> {
    const guardianInitData =
      await GuardianProviderFactory.getAccountGuardianInitData({
        address,
        apiAddress,
      });

    const activeGuardianServiceUid =
      options?.serviceId ||
      guardianInitData.activeGuardianServiceUid ||
      DEFAULT_SERVICE_ID;

    const providerData = GuardianProvidersResolver.getProviderByServiceId(
      activeGuardianServiceUid
    );

    if (!providerData)
      throw new Error(
        `"${activeGuardianServiceUid}" service provider could not be resolved.`
      );

    const { provider: ResolvedProvider } = providerData;

    const provider = new ResolvedProvider();

    //TODO: move to tcs implementation in order to not create dependecy on tcs
    const {
      data: { data },
    } = await this.fetcher.fetch({
      method: "get",
      baseURL: providerData.providerServiceNetworkUrls[networkId],
      url: `/guardian/config`,
    });

    await provider.init({
      ...guardianInitData,
      activeGuardianServiceUid,
      apiAddress,
      address,
      networkId,
      providerServiceUrl: providerData.providerServiceNetworkUrls[networkId],
      backoffWrongCode: data["backoff-wrong-code"],
      registrationDelay: data["registration-delay"],
    });

    return provider;
  }
  //TODO: document in readme
  public static setRequestTransformer(
    transformer: (config: AxiosRequestConfig) => AxiosRequestConfig
  ): void {
    this.fetcher.requestTransformer = transformer;
  }

  private static async getAccountGuardianInitData({
    address,
    apiAddress,
  }: {
    address: string;
    apiAddress: string;
  }): Promise<Omit<IInitData, "apiAddress" | "networkId" | "address">> {
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
      registrationDelay: 0,
      backoffWrongCode: 0,
    };
  }
}

export default GuardianProviderFactory;
