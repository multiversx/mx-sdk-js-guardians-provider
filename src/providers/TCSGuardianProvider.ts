import { Address, Transaction } from "@multiversx/sdk-core/out";
import GenericGuardianProvider from "../genericGuardianProvider";
import { IRegisterOptions } from "../interface";
import { Signature } from "../primitives";

enum EndpointsEnum {
  SignMultipleTransactions = "/guardian/sign-multiple-transactions",
  RegisterGuardian = "/guardian/register",
  VerifyCode = "/guardian/verify-code",
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
      const {
        data: {
          data: { transactions: rawCosignedTransactions },
        },
      } = await this.fetcher.fetch({
        method: "post",
        baseURL: this.guardianServiceApiUrl,
        url: EndpointsEnum.SignMultipleTransactions,
        data: { code, transactions: txToSend },
      });

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
  //TODO: add new fields returned by the API (secret, etc)
  override async registerGuardian(options?: IRegisterOptions): Promise<{
    qr: string;
    guardianAddress: string;
    scheme: string;
    host: string;
    issuer: string;
    account: string;
    algorithm: string;
    digits: number;
    period: number;
    secret: string;
    counter: number;
  }> {
    try {
      const {
        data: {
          data: {
            qr,
            ["guardian-address"]: guardianAddress,
            scheme,
            host,
            issuer,
            account,
            algorithm,
            digits,
            period,
            secret,
            counter,
          },
        },
      } = await this.fetcher.fetch({
        baseURL: this.guardianServiceApiUrl,
        url: EndpointsEnum.RegisterGuardian,
        method: "POST",
        data: { tag: options?.tag ?? "" },
      });
      return {
        qr,
        guardianAddress,
        scheme,
        host,
        issuer,
        account,
        algorithm,
        digits,
        period,
        secret,
        counter,
      };
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
        url: EndpointsEnum.VerifyCode,
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
