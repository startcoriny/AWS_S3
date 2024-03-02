import AWS from "aws-sdk"; // AWS Software Development Kit

import multer from "multer"; // multer - 파일업로드를 위해 사용되는 multipart/form-data를 다루기 위한 node.js의 미들웨어
import multerS3 from "multer-s3"; // multer를 거치면 req.file, req.files로 넘겨줌

AWS.config.update({
  region: "ap-northeast-2", // AWS의 region 값
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // IAM에서 설정됐던 accessKeyId
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // IAM에서 설정됐던 secretAccessKey
});

const s3 = new AWS.S3();

export const imageUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: "corinybucket", // 생성한 버킷 이름
    key: (req, file, callback) => {
      callback(null, `test/${Date.now()}_${file.originalname}`);
      // 콜백함수의 두번째 인자로 들어가는 것은 업로드 경로
      // 경로에 / 를 포함하면 폴더를 자동으로 생성
    },
    acl: "public-read-write", //  s3 생성할 때 설정했던 권한 관련 설정
    contentType: multerS3.AUTO_CONTENT_TYPE, // Multer-S3에게 Content-Type을 자동으로 설정하도록 지시
  }),
});
