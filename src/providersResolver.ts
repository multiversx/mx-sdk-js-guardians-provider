import TCSGuardianProvider from "./providers/TCSGuardianProvider";
interface ProviderInfoType {
  serviceId: string;
  provider: any;
  providerServiceUrl: {
    [networkId: string]: string;
  };
}

class ProvidersResolver {
  private static providers: Array<ProviderInfoType> = [
    {
      serviceId: "ServiceID",
      provider: TCSGuardianProvider,
      providerServiceUrl: {
        testnet: "https://testnet-tcs-api.multiversx.com",
        devnet: "https://devnet-tcs-api.multiversx.com",
        mainnet: "https://tcs-api.multiversx.com",
        ["testnet-upcloud-mad"]: "https://mx-mfa-auth.elrond.ro",
        ["testnet-do-ams"]: "https://mx-mfa-auth-ams.elrond.ro",
      },
    },
  ];
  static getProviderByServiceId(serviceId: string) {
    return this.providers.find((provider) => provider.serviceId === serviceId);
  }
}

export default ProvidersResolver;
