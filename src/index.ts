import GuardianProviderFactory from "./guardianProviderFactory";

export * from "./guardianProviderFactory";

(async () => {
  const provider = await GuardianProviderFactory.createProvider(
    "erd1dyfa9xmz28mgchpv5w89cyx6lss8qw9k6c5mdlg4lc5vj4pphkyqrjedam",
    "https://testnet-api.multiversx.com",
    { networkId: "testnet", serviceId: "ServiceID" }
  );
})();
