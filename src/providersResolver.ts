import TCSGuardianProvider from "./providers/TCSGuardianProvider";

class ProvidersResolver {
  private static providers = [
    {
      serviceId: "ServiceID",
      provider: TCSGuardianProvider,
      providerServiceUrl: "https://testnet-tcs-api.multiversx.com",
    },
  ];
  static getProviderByServiceId(serviceId: string) {
    return this.providers.find((provider) => provider.serviceId === serviceId);
  }
}

export default ProvidersResolver;
