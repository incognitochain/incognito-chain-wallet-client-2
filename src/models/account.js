class AccountModel {
  static fromJson = (data = {}) => ({
    default: false,
    name: data.AccountName,
    amount: -1,
    paymentAddress: data.PaymentAddress,
    readonlyKey: data.ReadonlyKey,
    privateKey: data.PrivateKey,
    publicKey: data.PublicKey,
    publicKeyCheckEncode: data.PublicKeyCheckEncode,
    publicKeyBytes: data.PublicKeyBytes
  })
}

export default AccountModel;