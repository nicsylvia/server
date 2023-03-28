import { NextFunction, Request, Response } from "express";
import { AsyncHandler } from "../Utils/AsyncHandler";
import bcrypt from "bcrypt";
import otpgenerator from "otp-generator";
import { AppError, HTTPCODES } from "../Utils/AppError";
import BusinessModels from "../Models/BusinessModels";
import { uuid } from "uuidv4";
import axios from "axios";
import mongoose from "mongoose";
import HistoryModels from "../Models/HistoryModels";
import { EnvironmentVariables } from "../Config/EnvironmentVariables";
import cloudinary from "../Config/Cloudinary";
const DefaultImg =
  "https://www.shutterstock.com/image-vector/jewellery-dummy-vector-logo-template-600w-2165228765.jpg";

import crypto from "crypto";

// Encrypted Key from Kora dashboard
const encrypt = EnvironmentVariables.Encrypted_key;

// Kora's API that we'll be hiiting on to do pay ins (zenith bank to wallet)
const urlData = "https://api.korapay.com/merchant/api/v1/charges/card";

// Function to encrypt the payment that will be coming in
function encryptAES256(encryptionKey: string, paymentData: any) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = cipher.update(paymentData);

  const ivToHex = iv.toString("hex");
  const encryptedToHex = Buffer.concat([encrypted, cipher.final()]).toString(
    "hex"
  );

  return `${ivToHex}:${encryptedToHex}:${cipher.getAuthTag().toString("hex")}`;
}

// Users Registration:
export const BusinessRegistration = AsyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const { name, email, password, confirmPassword, phoneNumber } = req.body;

    const findEmail = await BusinessModels.findOne({ email });

    if (findEmail) {
      next(
        new AppError({
          message: "Business with this account already exists",
          httpcode: HTTPCODES.FORBIDDEN,
        })
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const codename = name.slice(0, 3);

    const Business = await BusinessModels.create({
      name,
      email,
      phoneNumber: "+234" + phoneNumber,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      logo: req.file ? req.file.path : DefaultImg,
      BusinessCode:
        codename +
        otpgenerator.generate(20, {
          upperCaseAlphabets: false,
          specialChars: false,
          digits: true,
          lowerCaseAlphabets: false,
        }),
      Balance: 0,
      status: "Business",
    });

    return res.status(201).json({
      message: "Successfully created Business Account",
      data: Business,
    });
  }
);

// Business Login:
export const BusinessLogin = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const CheckEmail = await BusinessModels.findOne({ email });

    if (!CheckEmail) {
      next(
        new AppError({
          message: "Business Account not Found",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }

    const CheckPassword = await bcrypt.compare(password, CheckEmail!.password);

    if (!CheckPassword) {
      next(
        new AppError({
          message: "Email or password not correct",
          httpcode: HTTPCODES.CONFLICT,
        })
      );
    }

    if (CheckEmail && CheckPassword) {
      return res.status(200).json({
        message: "Login Successfull",
        data: CheckEmail,
      });
    }
  }
);

// Get single Business Account:
export const GetSingleBusinessAcount = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const SingleBusiness = await BusinessModels.findById(req.params.businessID);

    if (!SingleBusiness) {
      next(
        new AppError({
          message: "Business Account not found",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }

    return res.status(200).json({
      message: "Successfully got this business account",
      data: SingleBusiness,
    });
  }
);

// Get single Business Account:
export const GetSingleBusinessHistory = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const SingleBusinessHistory = await BusinessModels.findById(
      req.params.businessID
    ).populate({
      path: "Histories",
      options: {
        createdAt: -1,
      },
    });

    if (!SingleBusinessHistory) {
      next(
        new AppError({
          message: "Business History not found",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }

    return res.status(200).json({
      message: "Successfully got this business account",
      data: SingleBusinessHistory,
    });
  }
);

// Get single Business Account:
export const GetSingleBusinessCards = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const SingleBusiness = await BusinessModels.findById(req.params.businessID);

    if (!SingleBusiness) {
      next(
        new AppError({
          message: "Business Account not found",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }

    const cards = await BusinessModels.findById(req.params.businessID).populate(
      {
        path: "giftCard",
        options: {
          sort: { createdAt: -1 },
        },
      }
    );

    return res.status(200).json({
      message: "Successfully got this business account",
      data: cards!.giftCard,
    });
  }
);

// Update Business Details:
export const UpdateBusinessLogo = AsyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    // const { logo } = req.body;

    const CloudImg = await cloudinary.uploader?.upload(req?.file!.path);

    const BusinessLogo = await BusinessModels.findByIdAndUpdate(
      req.params.id,
      { logo: CloudImg.secure_url },
      { new: true }
    );

    if (!BusinessLogo) {
      next(
        new AppError({
          message: "An error occured in updating business logo",
          httpcode: HTTPCODES.INTERNAL_SERVER_ERROR,
        })
      );
    }

    return res.status(201).json({
      message: "Successfully updated the business brand logo",
      data: BusinessLogo,
    });
  }
);
const secret = EnvironmentVariables.Kora_secret_key;

// Business credit their wallet to generate a gift card:
export const BusinessFundTheirWallet = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      amount,
      name,
      number,
      cvv,
      pin,
      expiry_year,
      expiry_month,
      title,
      description,
    } = req.body;

    const GenerateTransactionReference = uuid();

    // To get single business

    const Business = await BusinessModels.findById(req.params.businessID);

    if (!Business) {
      next(
        new AppError({
          message: "Invalid Account, Does not exist",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }

    if (Business) {
      // For business to make the payment from their bank to business wallet:
      const paymentData = {
        reference: GenerateTransactionReference,
        card: {
          name,
          number,
          cvv,
          pin,
          expiry_year,
          expiry_month,
        },
        amount,
        currency: "NGN",
        redirect_url: "https://merchant-redirect-url.com",
        customer: {
          name: Business?.name,
          email: Business?.email,
        },
        metadata: {
          internalRef: "JD-12-67",
          age: 15,
          fixed: true,
        },
      };

      // To stringify the payment data coming in
      const stringData = JSON.stringify(paymentData);
      //The data should be in buffer form according to Kora's pay
      const bufData = Buffer.from(stringData, "utf-8");
      const encryptedData = encryptAES256(encrypt, bufData);

      var config = {
        method: "post",
        maxBodyLength: Infinity,
        url: urlData,
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        data: {
          charge_data: `${encryptedData}`,
        },
      };

      axios(config)
        .then(async function (response) {
          // To update the balance of the business with the amount the business funded from his bank
          const bal = await BusinessModels.findByIdAndUpdate(Business?._id, {
            Balance: Number(Business?.Balance) + Number(amount),
          });
          // To generate a receipt for the business and a notification
          const BusinesstransactionHistory = await HistoryModels.create({
            owner: Business?.name,
            message: `You credited your wallet with ${amount} from your bank`,
            transactionReference: GenerateTransactionReference,
            transactionType: "Credit",
          });

          Business?.TransactionHistory?.push(
            new mongoose.Types.ObjectId(BusinesstransactionHistory?._id)
          );
          Business.save();

          return res.status(HTTPCODES.OK).json({
            message: `${Business?.name} credited his wallet with ${amount} from bank`,
            data: {
              paymentInfo: BusinesstransactionHistory,
              paymentData: JSON.parse(JSON.stringify(response.data)),
              bal,
            },
          });
        })
        .catch(function (error) {
          next(
            new AppError({
              message: "Transaction failed",
              httpcode: HTTPCODES.BAD_GATEWAY,
              name: "Network Error",
            })
          );
        });
    }
  }
);

// Business Transfer the funds they have in their business account to their bank:
export const CheckOutToBank = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get the business details wanting to transfer the money:
    const Business = await BusinessModels.findById(req.params.businessID);

    const newDate = new Date().toDateString();

    const TransferReference = uuid();

    const {
      amount,
      name,
      number,
      cvv,
      pin,
      expiry_year,
      expiry_month,
      title,
      description,
    } = req.body;

    if (amount > Business!.Balance) {
      return res.status(HTTPCODES.FORBIDDEN).json({
        message: "Insufficient Funds",
      });
    } else {
      let data = JSON.stringify({
        reference: TransferReference,
        destination: {
          type: "bank_account",
          amount: `${amount}`,
          currency: "NGN",
          narration: "Test Transfer Payment",
          bank_account: {
            bank: "033",
            account: "0000000000",
          },
          customer: {
            name: Business?.name,
            email: Business?.email,
          },
        },
      });

      var config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://api.korapay.com/merchant/api/v1/transactions/disburse",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        data: data,
      };

      axios(config)
        .then(async function (response) {
          // To update the balance of the business with the amount the business withdrawed
          await BusinessModels.findByIdAndUpdate(Business?._id, {
            Balance: Business!.Balance - amount,
            dateTime: newDate,
          });
          // To generate a receipt for the business and a notification
          const BusinessWithdrawalHistory = await HistoryModels.create({
            owner: Business?.name,
            message: `Dear ${Business?.name}, a withdrawal of ${amount} was made from your account and your balance is ${Business?.Balance}`,
            transactionReference: TransferReference,
            transactionType: "Debit",
            dateTime: newDate,
          });

          Business?.TransactionHistory?.push(
            new mongoose.Types.ObjectId(BusinessWithdrawalHistory?._id)
          );
          Business?.save();

          return res.status(201).json({
            message: `${Business?.name} successfully withdrawed ${amount} from account`,
            data: {
              paymentInfo: BusinessWithdrawalHistory,
              paymentData: JSON.parse(JSON.stringify(response.data)),
            },
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
);
