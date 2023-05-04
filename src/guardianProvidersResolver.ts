import GenericGuardianProvider from "./genericGuardianProvider";
import TCSGuardianProvider from "./providers/TCSGuardianProvider";

enum NetworksEnum {
  testnet = "testnet",
  devnet = "devnet",
  mainnet = "mainnet",
}

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
    return this.providers.find((provider) => provider.serviceId === serviceId);
  }

  static addNetworksToServiceUrl(
    serviceId: string,
    networks: Array<{ id: string; url: string }>
  ) {
    this.providers = this.providers.map((provider) => {
      if (provider.serviceId === serviceId) {
        provider.providerServiceUrl = {
          ...provider.providerServiceUrl,
          ...networks.reduce((acc: any, network) => {
            acc[network.id] = network.url;
            return acc;
          }, {}),
        };
      }
      return provider;
    });
  }
}

export default GuardianProvidersResolver;
