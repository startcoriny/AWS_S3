import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "./utils/prisma/index.js";
import redisCli from "./redis/index.js";
import { AuthController } from "./middlewares/auth.controller.js";

const authController = new AuthController();

dotenv.config();

const app = express();
const PORT = 3021;

app.use(express.json());
app.use(cookieParser());

app.post("/logIn", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.users.findFirst({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "존재하지 않는 이메일 입니다." });
  } else if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  const accessToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "12h" }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "168h" }
  );

  await redisCli.set(`${user.id}`, refreshToken); // 키는 항상 문자열이여야함.

  res.cookie("accessToken", `Bearer ${accessToken}`);
  res.cookie("refreshToken", `Bearer ${refreshToken}`);

  return res.status(200).json({ message: "로그인에 성공하였습니다." });
});

app.get("/myInfo", authController.authMiddleWare, async (req, res) => {
  const { id } = req.user;

  const user = await prisma.users.findFirst({
    where: { id: +id },
    select: {
      id: true,
      email: true,
      userName: true,
    },
  });

  return res.status(200).json({ data: user });
});

app.listen(PORT, () => {
  console.log(PORT + "포트로 서버가 시작되었습니다.");
});
