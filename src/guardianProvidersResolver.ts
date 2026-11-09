import GenericGuardianProvider from "./genericGuardianProvider";
import TCSGuardianProvider from "./providers/TCSGuardianProvider";

export const DEFAULT_SERVICE_ID = "MultiversXTCSService";

enum NetworksEnum {
  testnet = "testnet",
  devnet = "devnet",
  mainnet = "mainnet",
}

type ServiceNetworkType = Record<NetworksEnum | string, string>;

interface IInjectableNetworkUrl {
  /**
   * Network identifier.
   */
  networkId: string;
  /**
   * Provider service network url.
   */
  url: string;
}

interface IProviderInfo {
  /**
   * `serviceId` is the unique identifier of the `IProviderInfo` object.
   */
  serviceId: string;
  provider: typeof GenericGuardianProvider;
  providerServiceNetworkUrls: ServiceNetworkType;
}

const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "[::1]"];

function assertSecureServiceUrl(url: string): void {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`Invalid guardian service URL: "${url}".`);
  }

  const isHttps = parsedUrl.protocol === "https:";
  const isLocalHttp =
    parsedUrl.protocol === "http:" &&
    LOCAL_HOSTNAMES.includes(parsedUrl.hostname);

  if (!isHttps && !isLocalHttp) {
    throw new Error(
      `Guardian service URL must use https: "${url}". Plain http is only allowed for localhost.`,
    );
  }
}

class GuardianProvidersResolver {
  protected static providers: Array<IProviderInfo> = [
    {
      serviceId: DEFAULT_SERVICE_ID,
      provider: TCSGuardianProvider,
      providerServiceNetworkUrls: {
        testnet: "https://testnet-tools.multiversx.com",
        devnet: "https://devnet-tools.multiversx.com",
        "devnet-old": "https://devnet-old-tools.multiversx.com",
        mainnet: "https://tools.multiversx.com",
        battlenet: "https://tools.multiversx.com",
      },
    },
  ];

  static getProviderByServiceId(serviceId: string): IProviderInfo | undefined {
    const result = this.providers.find(
      (provider) => provider.serviceId === serviceId,
    );
    return result;
  }

  /**
   * Returns the service url for `networkId`, or `undefined` if none is configured.
   * Only own keys are read, so ids like "constructor" or "__proto__" never
   * resolve to inherited object properties.
   */
  static getProviderServiceNetworkUrl(
    providerInfo: IProviderInfo,
    networkId: string,
  ): string | undefined {
    const urls = providerInfo.providerServiceNetworkUrls;
    if (!Object.prototype.hasOwnProperty.call(urls, networkId)) {
      return undefined;
    }
    const url = urls[networkId];
    return typeof url === "string" && url ? url : undefined;
  }

  /**
   * Extends or overrides the service networks url list based on network.
   * The url must use `https:`
   */
  static extendProviderInfoNetworkUrls({
    serviceId,
    network,
  }: {
    serviceId: IProviderInfo["serviceId"];
    network: IInjectableNetworkUrl;
  }) {
    assertSecureServiceUrl(network.url);

    this.providers = this.providers.map((provider) => {
      if (provider.serviceId === serviceId) {
        provider.providerServiceNetworkUrls = {
          ...provider.providerServiceNetworkUrls,
          [network.networkId]: network.url,
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
