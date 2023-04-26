import GenericGuardianProvider from "../genericGuardianProvider";
import { ITransaction } from "../interface";
import { Address, Signature } from "../primitives";

enum EndpointsEnum {
  SignMultipleTransactions = "/guardian/sign-multiple-transactions",
}

class TCSGuardianProvider extends GenericGuardianProvider {
  override _codeInputLength = 6;

  constructor() {
    super();
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

    try {
      const rawCosignedTransactions = (
        await this.fetcher.fetch({
          method: "post",
          baseURL: this.guardianServiceApiUrl,
          url: EndpointsEnum.SignMultipleTransactions,
          data: { code, transactions: txToSend },
        })
      ).data.data.transactions;

      for (let i = 0; i < rawCosignedTransactions.length; i++) {
        const transaction = transactions[i];
        const plainCoSignedTransaction = rawCosignedTransactions[i];

        transaction.applyGuardianSignature(
          new Signature(plainCoSignedTransaction.guardianSignature)
        );
        transaction.guardian = new Address(this._guardianAddress);
      }

      return transactions;
    } catch (error) {
      throw error;
    }
  }
}

export default TCSGuardianProvider;
