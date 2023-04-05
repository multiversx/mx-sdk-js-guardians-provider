import GenericGuardianProvider from "../genericGuardianProvider";
import { IProviderSpecificHooks, ITransaction } from "../interface";
import { Signature } from "../primitives";

class TCSGuardianProvider extends GenericGuardianProvider {
  private getNativeAuthToken: () => string;

  constructor({
    getNativeAuthToken,
  }: Pick<IProviderSpecificHooks, "getNativeAuthToken">) {
    super();
    this.getNativeAuthToken = getNativeAuthToken;
  }

  override async applyGuardianSignature<T extends ITransaction>(
    transactions: T[],
    code: string
  ): Promise<T[]> {
    const txToSend = transactions.map((tx) => {
      const plainTx = tx.toPlainObject();
      plainTx.guardian = this._guardianAddress;
      return plainTx;
    });

    const nativeAuthToken = this.getNativeAuthToken();

    try {
      const rawCosignedTransactions = (
        await this.fetcher.fetch({
          method: "post",
          baseURL: this.guardianServiceApiUrl,
          url: `/guardian/sign-multiple-transactions`,
          data: { code, transactions: txToSend },
          headers: {
            Authorization: `Bearer ${nativeAuthToken}`,
          },
        })
      ).data.data.transactions;

      for (let i = 0; i < rawCosignedTransactions.length; i++) {
        const transaction = transactions[i];
        const plainCoSignedTransaction = rawCosignedTransactions[i];

        transaction.applyGuardianSignature(
          new Signature(plainCoSignedTransaction.guardianSignature)
        );
      }

      return transactions;
    } catch (error) {
      throw error;
    }
  }
}

export default TCSGuardianProvider;
