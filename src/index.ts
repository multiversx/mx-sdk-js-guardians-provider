export * from "./guardianProviderFactory";

// const nativeAuthTokenGenerator = () => {
//   return "this is a native auth token";
// };

// async function aa() {
//   GuardianProviderFactory.setRequestTransformer((zz: AxiosRequestConfig) => {
//     console.log(zz);
//     return { ...zz, method: "get" };
//   });

//   const guardianProvider = await GuardianProviderFactory.createProvider(
//     "erd1wh9c0sjr2xn8hzf02lwwcr4jk2s84tat9ud2kaq6zr7xzpvl9l5q8awmex",
//     "https://express-api-up-mad.elrond.ro",
//     { getNativeAuthToken: nativeAuthTokenGenerator }
//   );

//   console.log(
//     guardianProvider.initialized,
//     guardianProvider.guardianServiceApiUrl
//   );

//   guardianProvider.applyGuardianSignature([], "123456");
// }

// aa();
