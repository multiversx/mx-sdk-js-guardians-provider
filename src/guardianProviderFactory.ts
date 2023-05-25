import { AxiosRequestConfig } from "axios";
import ApiFetcher from "./apiFetcher";
import GenericGuardianProvider from "./genericGuardianProvider";
import { IInitData } from "./interface";
import GuardianProvidersResolver, {
  DEFAULT_SERVICE_ID,
} from "./guardianProvidersResolver";

interface CreateOptionsType {
  networkId: string;
  serviceId?: string;
}

interface CreateProviderParamsType {
  address: string;
  apiAddress: string;
  options: CreateOptionsType;
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
    options: { networkId, serviceId },
  }: CreateProviderParamsType): Promise<GenericGuardianProvider> {
    const guardianInitData =
      await GuardianProviderFactory.getAccountGuardianInitData(
        address,
        apiAddress,
        networkId
      );

    const providerData = GuardianProvidersResolver.getProviderByServiceId(
      serviceId ||
        guardianInitData.activeGuardianServiceUid ||
        DEFAULT_SERVICE_ID
    );

    if (!providerData)
      throw new Error(
        `"${
          guardianInitData.activeGuardianServiceUid || serviceId
        }" service provider could not be resolved.`
      );

    const provider = new providerData.provider();

    const { data } = (
      await this.fetcher.fetch({
        method: "get",
        baseURL: providerData.providerServiceUrl[networkId],
        url: `/guardian/config`,
      })
    ).data;
    await provider.init({
      ...guardianInitData,
      activeGuardianServiceUid:
        serviceId ||
        guardianInitData.activeGuardianServiceUid ||
        DEFAULT_SERVICE_ID,
      apiAddress,
      address,
      networkId: networkId,
      providerServiceUrl: providerData.providerServiceUrl[networkId],
      backoffWrongCode: data["backoff-wrong-code"],
      registrationDelay: data["registration-delay"],
    });

    return provider;
  }

  public static setRequestTransformer(
    transformer: (config: AxiosRequestConfig) => AxiosRequestConfig
  ): void {
    this.fetcher.requestTransformer = transformer;
  }

  private static async getAccountGuardianInitData(
    address: string,
    apiAddress: string,
    networkId: string
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
      address,
      apiAddress,
      networkId: networkId,
      registrationDelay: 0,
      backoffWrongCode: 0,
    };
  }
}

export default GuardianProviderFactory;
