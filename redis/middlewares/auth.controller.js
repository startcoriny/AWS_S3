// src/middlewares/auth.middleware.js // 사용자 인증 미들웨어

// 리프레시 토큰이 있다면 access토큰 재발급
import { AuthService } from "./auth.service.js";

const authService = new AuthService();

export class AuthController {
  authMiddleWare = async (req, res, next) => {
    try {
      let { refreshToken } = req.cookies;

      if (!refreshToken) {
        throw new Error("토큰이 존재하지 않습니다.");
      }

      // 서비스로 데이터 담아서 보내기
      const authUser = await authService.checkAuth(refreshToken);

      // 인증유저 정보가 없으면 토큰지우고 에러반환.
      if (!authUser.user) {
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        throw new Error("토큰 사용자가 존재하지 않습니다.");
      }

      // 정보가 있으면 req.user에 담고 next진행
      // accessToken도 쿠키에 담아주기
      res.cookie("accessToken", authUser.accessToken);
      res.cookie("refreshToken", authUser.refreshToken);
      req.user = authUser.user;

      next();
    } catch (err) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      next(err);
    }
  };
}
