import { Address, Transaction } from "@multiversx/sdk-core";
import GenericGuardianProvider from "../genericGuardianProvider";
import { IRegisterOptions } from "../interface";

enum EndpointsEnum {
  SignMultipleTransactions = "/guardian/sign-multiple-transactions",
  RegisterGuardian = "/guardian/register",
  VerifyCode = "/guardian/verify-code",
}

// An Ed25519 signature is 64 bytes, which is 128 hex characters.
const GUARDIAN_SIGNATURE_HEX_REGEX = /^[0-9a-fA-F]{128}$/;

class TCSGuardianProvider extends GenericGuardianProvider {
  override _codeInputLength = 6;

  constructor() {
    super();
  }

  override async applyGuardianSignature({
    transactions: transactionsArray,
    code,
    secondCode,
  }: {
    transactions: Transaction[];
    code: string;
    secondCode?: string;
  }): Promise<Transaction[]> {
    const transactions = transactionsArray.map((tx) => {
      const plainTx = tx.toPlainObject();
      plainTx.guardian = this._guardianAddress;
      return {
        ...plainTx,
        nonce: Number(plainTx.nonce),
        gasPrice: Number(plainTx.gasPrice),
        gasLimit: Number(plainTx.gasLimit),
      };
    });

    const data = { code, transactions, "second-code": secondCode };
    if (!secondCode) {
      delete data["second-code"];
    }

    try {
      const {
        data: {
          data: { transactions: rawCosignedTransactions },
        },
      } = await this.fetcher.fetch({
        method: "post",
        baseURL: this.guardianServiceApiUrl,
        url: EndpointsEnum.SignMultipleTransactions,
        data,
      });

      if (
        !Array.isArray(rawCosignedTransactions) ||
        rawCosignedTransactions.length !== transactionsArray.length
      ) {
        throw new Error(
          "Guardian service returned an unexpected number of co-signed transactions.",
        );
      }

      const guardianSignatures = rawCosignedTransactions.map(
        (plainCoSignedTransaction: any) => {
          const signature = plainCoSignedTransaction?.guardianSignature;
          if (
            typeof signature !== "string" ||
            !GUARDIAN_SIGNATURE_HEX_REGEX.test(signature)
          ) {
            throw new Error(
              "Guardian service returned an invalid guardian signature.",
            );
          }
          return signature;
        },
      );

      for (let i = 0; i < transactionsArray.length; i++) {
        const transaction = transactionsArray[i];

        transaction.guardianSignature = new Uint8Array(
          Buffer.from(guardianSignatures[i], "hex"),
        );

        transaction.guardian = new Address(this._guardianAddress);
      }

      return transactionsArray;
    } catch (error) {
      throw error;
    }
  }

  override async registerGuardian(options?: IRegisterOptions): Promise<{
    guardianAddress: string;
    otp: {
      scheme: string;
      host: string;
      issuer: string;
      account: string;
      algorithm: string;
      digits: number;
      period: number;
      secret: string;
      counter: number;
    };
  }> {
    try {
      const {
        data: {
          data: { ["guardian-address"]: guardianAddress, otp },
        },
      } = await this.fetcher.fetch({
        baseURL: this.guardianServiceApiUrl,
        url: EndpointsEnum.RegisterGuardian,
        method: "POST",
        data: { tag: options?.tag ?? "" },
      });
      return {
        guardianAddress,
        otp,
      };
    } catch (error: any) {
      throw error;
    }
  }

  override async verifyCode({
    code,
    secondCode,
    guardian,
  }: {
    code: string;
    secondCode?: string;
    guardian: string;
  }): Promise<boolean> {
    try {
      const data = { code, guardian, "second-code": secondCode };
      if (!secondCode) {
        delete data["second-code"];
      }

      await this.fetcher.fetch({
        baseURL: this.guardianServiceApiUrl,
        url: EndpointsEnum.VerifyCode,
        method: "POST",
        data,
      });
      return true;
    } catch (error: any) {
      throw error;
    }
  }
}

export default TCSGuardianProvider;
