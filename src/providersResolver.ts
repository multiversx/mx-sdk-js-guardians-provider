import TCSGuardianProvider from "./providers/TCSGuardianProvider";

class ProvidersResolver {
  private static providers = [
    {
      serviceId: "ServiceID",
      provider: TCSGuardianProvider,
      providerServiceUrl: "https://mx-mfa-auth.elrond.ro",
    },
  ];
  static getProviderByServiceId(serviceId: string) {
    return this.providers.find((provider) => provider.serviceId === serviceId);
  }
}

export default ProvidersResolver;
