"use strict";
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
exports.accountRelations = exports.cardRelations = exports.accounts = exports.cards = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
var userModel_1 = require("./userModel");
var columHelpers_1 = require("./columHelpers");
var transactionModel_1 = require("./transactionModel");
exports.cards = (0, pg_core_1.pgTable)('cards', __assign({ id: (0, pg_core_1.serial)('id').primaryKey(), number: (0, pg_core_1.text)('number').notNull(), expirationDate: (0, pg_core_1.text)('expirationDate').notNull(), accountId: (0, pg_core_1.integer)('accountId').notNull().references(function () { return exports.accounts.id; }) }, columHelpers_1.timestampColumns));
exports.accounts = (0, pg_core_1.pgTable)('accounts', __assign({ id: (0, pg_core_1.serial)('id').primaryKey(), name: (0, pg_core_1.text)('name').notNull(), currency: (0, pg_core_1.text)('currency').notNull(), agency: (0, pg_core_1.text)('agency').notNull(), accountNumber: (0, pg_core_1.text)('accountNumber').notNull(), initialBalance: (0, pg_core_1.numeric)({ precision: 14, scale: 2 }).notNull(), userId: (0, pg_core_1.integer)('userId').notNull().references(function () { return userModel_1.users.id; }) }, columHelpers_1.timestampColumns));
exports.cardRelations = (0, drizzle_orm_1.relations)(exports.cards, function (_a) {
    var one = _a.one;
    return ({
        account: one(exports.accounts, {
            fields: [exports.cards.accountId],
            references: [exports.accounts.id],
        }),
    });
});
exports.accountRelations = (0, drizzle_orm_1.relations)(exports.accounts, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        user: one(userModel_1.users, {
            fields: [exports.accounts.userId],
            references: [userModel_1.users.id],
        }),
        cards: many(exports.cards),
        transactions: many(transactionModel_1.transactions),
    });
});
