class TokenModel {
  static fromJson = (data = {}) => ({
    amount: data.Amount,
    id: data.ID,
    isPrivacy: data.IsPrivacy,
    name: data.Name,
    symbol: data.Symbol,
    isInit: data.isInit,
    image: data.Image
  })
}

export default TokenModel;