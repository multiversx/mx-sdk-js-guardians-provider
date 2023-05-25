import GenericGuardianProvider from "./genericGuardianProvider";
import TCSGuardianProvider from "./providers/TCSGuardianProvider";

export const DEFAULT_SERVICE_ID = "MultiversXTCSService";

enum NetworksEnum {
  testnet = "testnet",
  devnet = "devnet",
  mainnet = "mainnet",
}

type ServiceNetworkType = Record<string, string>;

interface ProviderInfoType {
  serviceId: string;
  provider: typeof GenericGuardianProvider;
  providerServiceUrl: {
    [key in NetworksEnum | any]: string;
  };
}

class GuardianProvidersResolver {
  protected static providers: Array<ProviderInfoType> = [
    {
      serviceId: DEFAULT_SERVICE_ID,
      provider: TCSGuardianProvider,
      providerServiceUrl: {
        testnet: "https://testnet-tcs-api.multiversx.com",
        devnet: "https://devnet-tcs-api.multiversx.com",
        mainnet: "https://tcs-api.multiversx.com",
      },
    },
    {
      serviceId: "ServiceID",
      provider: TCSGuardianProvider,
      providerServiceUrl: {
        testnet: "https://testnet-tcs-api.multiversx.com",
        devnet: "https://devnet-tcs-api.multiversx.com",
        mainnet: "https://tcs-api.multiversx.com",
      },
    },
  ];
  static getProviderByServiceId(serviceId: string) {
    const result = this.providers.find(
      (provider) => provider.serviceId === serviceId
    );
    console.log(result);
    return result;
  }

  static addNetworksToServiceUrl({
    serviceId,
    networks,
  }: {
    serviceId: string;
    networks: ServiceNetworkType[];
  }) {
    this.providers = this.providers.map((provider) => {
      if (provider.serviceId === serviceId) {
        provider.providerServiceUrl = {
          ...provider.providerServiceUrl,
          ...networks.reduce((acc: ServiceNetworkType, network) => {
            acc[network.id] = network.url;
            return acc;
          }, {} as ServiceNetworkType),
        };
      }
      return provider;
    });
  }

  public static get defaultServiceId(): string {
    return DEFAULT_SERVICE_ID;
  }
}

export default GuardianProvidersResolver;
