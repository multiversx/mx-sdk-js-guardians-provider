import { Transaction } from "@multiversx/sdk-core/out";
import GenericGuardianProvider from "../genericGuardianProvider";
import { Address, Signature } from "../primitives";

enum EndpointsEnum {
  SignMultipleTransactions = "/guardian/sign-multiple-transactions",
}

class TCSGuardianProvider extends GenericGuardianProvider {
  override _codeInputLength = 6;

  constructor() {
    super();
  }

  override async applyGuardianSignature(
    transactions: Transaction[],
    code: string
  ): Promise<Transaction[]> {
    const txToSend = transactions.map((tx) => {
      const plainTx = tx.toPlainObject();
      plainTx.guardian = this._guardianAddress;
      return {
        ...plainTx,
        nonce: Number(plainTx.nonce),
        gasPrice: Number(plainTx.gasPrice),
        gasLimit: Number(plainTx.gasLimit),
      };
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
        transaction.setGuardian(new Address(this._guardianAddress));
      }

      return transactions;
    } catch (error) {
      throw error;
    }
  }

  override async registerGuardian(): Promise<{
    qr: string;
    guardianAddress: string;
  }> {
    try {
      const {
        data: {
          data: { qr, ["guardian-address"]: guardianAddress },
        },
      } = await this.fetcher.fetch({
        baseURL: this.guardianServiceApiUrl,
        url: "/guardian/register",
        method: "POST",
        data: { tag: "" },
      });
      return { qr, guardianAddress };
    } catch (error: any) {
      throw error;
    }
  }

  override async verifyCode({
    code,
    guardian,
  }: {
    code: string;
    guardian: string;
  }): Promise<boolean> {
    try {
      const response = await this.fetcher.fetch({
        baseURL: this.guardianServiceApiUrl,
        url: "/guardian/verify-code",
        method: "POST",
        data: { code, guardian },
      });
      return true;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }
}

export default TCSGuardianProvider;
