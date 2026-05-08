"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyBalanceRelations = exports.monthlyBalances = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var pg_core_1 = require("drizzle-orm/pg-core");
var accountModel_1 = require("./accountModel");
var columHelpers_1 = require("./columHelpers");
exports.monthlyBalances = (0, pg_core_1.pgTable)('monthlyBalances', __assign({ id: (0, pg_core_1.serial)('id').primaryKey(), accountId: (0, pg_core_1.integer)('accountId').notNull().references(function () { return accountModel_1.accounts.id; }), date: (0, pg_core_1.date)().notNull(), openingBalance: (0, pg_core_1.numeric)({ precision: 14, scale: 2 }).notNull(), closingBalance: (0, pg_core_1.numeric)({ precision: 14, scale: 2 }).notNull(), totalIn: (0, pg_core_1.numeric)({ precision: 14, scale: 2 }).notNull(), totalOut: (0, pg_core_1.numeric)({ precision: 14, scale: 2 }).notNull(), transactionsJson: (0, pg_core_1.jsonb)('transactionsJson').$type().notNull().default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["'[]'::jsonb"], ["'[]'::jsonb"])))) }, columHelpers_1.timestampColumns));
exports.monthlyBalanceRelations = (0, drizzle_orm_1.relations)(exports.monthlyBalances, function (_a) {
    var one = _a.one;
    return ({
        account: one(accountModel_1.accounts, {
            fields: [exports.monthlyBalances.accountId],
            references: [accountModel_1.accounts.id],
        }),
    });
});
var templateObject_1;
