import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository.js";
import redisCli from "../redis/index.js";
const authRepository = new AuthRepository();
export class AuthService {
  checkAuth = async (refreshToken) => {
    const refresh = await tokenCheck(refreshToken);
    const decodedToken = jwt.verify(refresh, process.env.JWT_SECRET_KEY);
    const redis = await redisCli.get(`${decodedToken.id}`);
    if (!redis || redis !== refresh) {
      throw new Error("토큰 정보가 올바르지 않습니다.");
    }

    const user = await authRepository.findById(decodedToken.id);

    // freshToken 유효함 -> accessToken, refreshToken 재발급
    const newAccessToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: "12h" });
    const newRefreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

    await redisCli.set(`${user.id}`, newRefreshToken); // 다시 생성된 리프레시 토큰을 set한다.

    return {
      user,
      accessToken: `Bearer ${newAccessToken}`,
      refreshToken: `Bearer ${newRefreshToken}`,
    };
  };
}
function tokenCheck(tokenKind) {
  const [tokenType, token] = tokenKind.split(" ");
  if (tokenType !== "Bearer") throw new Error("토큰 타입이 일치하지 않습니다.");
  else return token;
}
