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
exports.goalRelations = exports.goals = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
var userModel_1 = require("./userModel");
var columHelpers_1 = require("./columHelpers");
exports.goals = (0, pg_core_1.pgTable)('goals', __assign({ id: (0, pg_core_1.serial)().primaryKey(), name: (0, pg_core_1.text)().notNull(), value: (0, pg_core_1.integer)().notNull(), savedValue: (0, pg_core_1.numeric)({ precision: 14, scale: 2 }).notNull().default('0'), dueDate: (0, pg_core_1.timestamp)().notNull(), archived: (0, pg_core_1.boolean)().default(false), userId: (0, pg_core_1.integer)().notNull().references(function () { return userModel_1.users.id; }) }, columHelpers_1.timestampColumns));
exports.goalRelations = (0, drizzle_orm_1.relations)(exports.goals, function (_a) {
    var one = _a.one;
    return ({
        user: one(userModel_1.users, {
            fields: [exports.goals.userId],
            references: [userModel_1.users.id],
        }),
    });
});
