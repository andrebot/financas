"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestampColumns = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
exports.timestampColumns = {
    createdAt: (0, pg_core_1.timestamp)('createdAt').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt'),
};
