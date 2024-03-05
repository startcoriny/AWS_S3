import express from "express";
import { imageUploader } from "./s3/imageUploader.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3020;

app.use(express.json());
app.use(express.urlencoded());

const imageBaseUrl = "https://s3.ap-northeast-2.amazonaws.com/";

/* 단일 업로드 */
// 이미지를 불러올 경로 = "https://s3.ap-northeast-2.amazonaws.com/버킷이름/파일이름.png" alt="">
// 해당 경로를 해당 html의 이미지 경로로 보낸다면 이미지의 src부분에 경로를 넣어 이미지를 보여줄수 있음.
// 즉 aws의 저장된 경로를 그대로 가져와서 보여주는것.
app.post("/test/image", imageUploader.single("image"), (req, res) => {
  let imgFile = req.file;
  const bucket = imgFile.bucket;
  const fileName = imgFile.key;
  const imageUrl = `${imageBaseUrl}${bucket}/${fileName}`;
  res.send(`<image src='${imageUrl}' width='100px' height='100px'>`);
});

/* 여러개 업로드 */
// router.post("/test/image", imageUploader.array("image",10), (req, res) => {
//   // array는 여러 이미지를 받을때 사용하는것
//   // array를 호출할 경우에는 두번째 인자에 최대 업로드 개수를 설정할 수 있다.
//   res.send("good!");
// });

app.listen(PORT, () => {
  console.log(PORT, "서버로 시작되었습니다.");
});
