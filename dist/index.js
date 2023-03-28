"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Database_1 = require("./Config/Database");
const EnvironmentVariables_1 = require("./Config/EnvironmentVariables");
const app_1 = require("./app");
const port = EnvironmentVariables_1.EnvironmentVariables.PORT;
const app = (0, express_1.default)();
(0, app_1.AppConfig)(app);
(0, Database_1.DBCONNECTION)();
app.get("/", (req, res) => {
    return res.status(200).json({
        message: "API READY FOR GIFT CARD IDEA CONSUMPTION",
    });
});
const server = app.listen(port, () => {
    console.log("");
    console.log("Server is up and running on port", port);
});
// To protect my server from crashing when users do what they are not supposed to do
process.on("uncaughtException", (error) => {
    // console.log("Stop here: uncaughtexpression")
    // console.log(error)
    process.exit(1);
});
process.on("unhandledRejection", (res) => {
    server.close(() => {
        process.exit(1);
    });
});
