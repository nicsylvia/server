import multer from "multer";

import { Request } from "express";

import path from "path";

type DestinationCallBack = (error: Error | null, destination: string) => void;

type FileCallBack = (error: Error | null, filename: string) => void;

const Storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallBack
  ) => {
    cb(null, path.join(__dirname, "../Uploads"));
  },

  filename: (req: Request, file: Express.Multer.File, cb: FileCallBack) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const BusinessLogo = multer({
  storage: Storage,
}).single("logo");

export { BusinessLogo };
