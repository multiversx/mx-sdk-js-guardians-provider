import { ISignature } from "./interface";

export class Signature implements ISignature {
  private readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  hex() {
    return this.value;
  }
}
