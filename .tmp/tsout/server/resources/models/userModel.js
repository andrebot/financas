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
exports.userRelations = exports.users = exports.roles = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
var columHelpers_1 = require("./columHelpers");
var accountModel_1 = require("./accountModel");
var goalModel_1 = require("./goalModel");
var budgetModel_1 = require("./budgetModel");
exports.roles = (0, pg_core_1.pgEnum)('roles', ['admin', 'user']);
exports.users = (0, pg_core_1.pgTable)('users', __assign({ id: (0, pg_core_1.serial)('id').primaryKey(), email: (0, pg_core_1.text)('email').notNull().unique(), firstName: (0, pg_core_1.text)('firstName').notNull(), lastName: (0, pg_core_1.text)('lastName').notNull(), role: (0, exports.roles)('role').default('user').notNull(), password: (0, pg_core_1.text)('password').notNull() }, columHelpers_1.timestampColumns));
exports.userRelations = (0, drizzle_orm_1.relations)(exports.users, function (_a) {
    var many = _a.many;
    return ({
        accounts: many(accountModel_1.accounts),
        goals: many(goalModel_1.goals),
        budgets: many(budgetModel_1.budgets),
    });
});
