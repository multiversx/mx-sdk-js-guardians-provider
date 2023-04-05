import axios, { AxiosRequestConfig } from "axios";

class ApiFetcher {
  private static _instance: ApiFetcher = new ApiFetcher();
  private _requestTransformer: (
    config?: AxiosRequestConfig
  ) => AxiosRequestConfig | null = () => null;

  constructor() {
    if (ApiFetcher._instance) {
      throw new Error(
        "Error: Instantiation failed: Use ApiFetcher.getInstance() instead of new."
      );
    }
    ApiFetcher._instance = this;
  }

  public static getInstance(): ApiFetcher {
    return ApiFetcher._instance;
  }

  public async fetch(config: AxiosRequestConfig): Promise<any> {
    const transformedConfig = this._requestTransformer(config);
    return axios(transformedConfig ?? config);
  }

  public set requestTransformer(transformer: any) {
    this._requestTransformer = transformer;
  }
}

export default ApiFetcher;
