"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_URL = void 0;
var configWrap_1 = __importDefault(require("./configWrap"));
var MONGO = (0, configWrap_1.default)({
    default: {
        DB_URL: process.env.DB_URL || 'postgresql://financas:financas@localhost:5432/financas',
    },
});
exports.DB_URL = MONGO.DB_URL;
