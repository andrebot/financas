# Finanças
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)
![Server Coverage](https://img.shields.io/badge/server--coverage-100.00%25-brightgreen)
![Client Coverage](https://img.shields.io/badge/client--coverage-100%25-brightgreen)

This APP is made to help you manage your finances and invest, by providing powerful tools to balance your relationship with money and givinging insightful help on building different types of investments portifolios.

# To-dos
## Features
2. ~~Build Account CRUD page~~
3. ~~Build Category page~~
4. ~~Build Goals page~~
5. Build Budget page
6. Build transactions page
7. Build Investments page
8. Build dashboard page
9. Build FII portifolio builder page
10. Build User managements page for admin
11. Integrate with brazilian B3 stock market
12. Build smart import for transactions

## Infrastructure
1. ~~Build github actions for PR to run tests (unit tests, integration tests) and lint~~
2. ~~Update pre-push github automation to not run tests~~
3. ~~Build github actions for PR merge on mester to run tests (all) and deploy~~
4. ~~Add e2e to CI/CD~~

## Technical Debts
1. Switch mongo to a SQL database
2. ~~Remove Query translation from Repository~~
3. ~~Remove Empty files to improve readability~~
4. Revise all try-catch for better error handling
5. ~~Improve server logging for better log context~~
6. ~~Remove useless token memory store~~
7. i18n on backend based on user settings

# Technical Considerations
## Switching from Mongo to Postgre

### Motivation

Using a non-SQL database for a finance application was making the domain harder to model and harder to evolve. The app is highly relational by nature: users own accounts, accounts have cards and transactions, transactions affect categories, budgets, goals, monthly balances, and several derived accounting views. Keeping those relationships in Mongo pushed too much coordination into application code, made consistency harder to reason about, and made simple financial invariants feel more complex than they needed to be.

Moving to PostgreSQL gives the project the structure it needs: explicit tables, foreign keys, transactions, relational queries, and a schema that mirrors the domain more naturally. It also makes future work easier to coordinate because the data model now describes the relationships directly instead of relying on scattered application-level assumptions.

---

### Changes Done

The transition touched the persistence layer, the domain managers that orchestrate writes, and the tests that prove the new relational behaviour works. The main files and folders involved were:

- **Database and infrastructure**
  - `docker/docker-compose.yml`
  - `docker/dockerfile`
  - `drizzle.config.ts`
  - `package.json`
  - `package-lock.json`
  - `src/server/config/drizzle.ts`
  - `src/server/config/mongo.ts`
  - `src/server/utils/databaseConnection.ts`
  - `src/server/migrations/drizzle/**`

- **Models and schema**
  - `src/server/resources/models/accountModel.ts`
  - `src/server/resources/models/budgetModel.ts`
  - `src/server/resources/models/categoryModel.ts`
  - `src/server/resources/models/columHelpers.ts`
  - `src/server/resources/models/goalModel.ts`
  - `src/server/resources/models/monthlyBalanceModel.ts`
  - `src/server/resources/models/schema.ts`
  - `src/server/resources/models/transactionModel.ts`
  - `src/server/resources/models/userModel.ts`

- **Repositories and transaction helpers**
  - `src/server/resources/repositories/IRepository.ts`
  - `src/server/resources/repositories/repository.ts`
  - `src/server/resources/repositories/budgetRepo.ts`
  - `src/server/resources/repositories/categoryRepo.ts`
  - `src/server/resources/repositories/goalRepo.ts`
  - `src/server/resources/repositories/monthlyBalanceRepo.ts`
  - `src/server/resources/repositories/transactionRepo.ts`
  - `src/server/resources/repositories/userRepo.ts`
  - `src/server/utils/transaction.ts`
  - `src/server/utils/authorization.ts`

- **Managers, controllers, routes, and shared types**
  - `src/server/managers/accountantManager.ts`
  - `src/server/managers/authenticationManager.ts`
  - `src/server/managers/contentManager/commonActions.ts`
  - `src/server/managers/contentManager/index.ts`
  - `src/server/controllers/accountantController.ts`
  - `src/server/controllers/authorization.ts`
  - `src/server/controllers/commonController.ts`
  - `src/server/controllers/transactionController.ts`
  - `src/server/routes/accountant.ts`
  - `src/server/routes/index.ts`
  - `src/server/routes/transaction.ts`
  - `src/server/types.ts`

- **Test setup and coverage**
  - `tests/end2end/databaseUtils.ts`
  - `tests/end2end/globalSetup.ts`
  - `tests/end2end/globalTeardown.ts`
  - `tests/integration/transaction.spec.ts`
  - `tests/server/controllers/**`
  - `tests/server/managers/**`
  - `tests/server/resources/models/**`
  - `tests/server/resources/repositories/**`
  - `tests/server/routes/**`
  - `tests/server/utils/**`

The old implementation did not have a clean enough separation of concerns. Some persistence concerns leaked upward, some domain rules spilled into places that should only coordinate requests or data access, and class inheritance made it harder to see which layer owned which behaviour. The migration exposed that pain because relational data needs clear ownership: repositories should know how to query, managers should know how to coordinate domain rules, controllers should translate HTTP concerns, and routes should only wire the system.

The new organization moved the code closer to a functional style. Managers and controllers are now built through composition rather than inheritance: factories receive explicit dependencies and return plain objects with actions. Shared CRUD behaviour lives in reusable functions, while domain-specific cases override only the methods that need special handling. This made the system more heterogeneous in the right way: each module can be shaped around its real responsibility, instead of being forced into a class hierarchy.

A good example is the Content Manager. It grew because the app gained richer content behaviour, but the architecture made that growth easier and mostly painless. Content-specific changes could be integrated inside the manager and its composed actions without forcing unrelated layers to change. That showed the benefit of the design: when the boundary is clear, adding relational rules or entity-specific behaviour does not require spreading changes across the whole backend.

---

### Conclusion

The move from Mongo to PostgreSQL made the database model more coherent with the financial domain. The highly relational data is now handled by a relational database, with clearer schema boundaries, better transaction support, and more explicit relationships between accounts, transactions, categories, budgets, goals, and balances.

The migration also improved the code structure. Fixing the domain spill, moving away from class inheritance, and leaning into functional composition made the system more readable and organized. The current architecture made the transition more controlled because the layers now have clearer responsibilities. The hardest parts of the transition were not only caused by changing databases; they came from having modeled relational financial data in a non-SQL database and from earlier boundaries that allowed concerns to leak between layers.

With the new code, a future database transition would be more organized because persistence, domain orchestration, and HTTP wiring are better separated. Moving back to a non-SQL database would still be hard, because this domain is naturally relational, but the current architecture would make that work easier to reason about than before.

---

## Managers and Controller Refactor

### Motivation

The backend had grown with **functional decomposition**: many small modules and functions wired by file structure and inheritance (e.g. thin classes extending base controllers or managers). That made it unclear where “content” logic lived, duplicated wiring, and didn’t match the intended layered design (manager → controller → routes). This refactor introduces a **real Content Manager** and switches managers and controllers to **object composition** and a more **functional style**. The goal is to have one clear place for simple content CRUD, explicit dependencies, and a simpler, consistent way to add routes.

---

### Content Manager

The **Content Manager** does not own all content-related business logic. It is responsible only for the **CRUD of the app’s content entities** — the straightforward ones: **account**, **budget**, **category**, and **goal**. These are the “easy” CRUD resources that form the building blocks of the app. This content feeds into **transactions** and will feed into **investments**; the more complex behaviour (transaction lifecycle, balances, reporting, future investment logic) is and will be handled by **AccountantManager** and other dedicated managers. So the Content Manager is the single place for simple content CRUD; heavier, domain-rich features live in their own managers.

The module exposes `createContentManager(budgetRepo, categoryRepo, goalRepo, transactionRepo, accountRepo)`, which returns a **ContentManagerActions** object with **budgetActions**, **categoryActions**, **goalActions**, and **accountActions**. Each is an **ICommonActions\<T\>** (create, update, delete, list, get). Shared behaviour is built via a `commonActions` factory; entities with special rules (e.g. goal/category delete, budget spent) compose that and override only the methods that differ.

---

### Managers and Controllers as Object Composition

Managers and controllers are **plain objects** produced by functions, not classes:

- **Managers**  
  The Content Manager and other managers (e.g. **AccountantManager** for transactions) are created by functions that take repositories (and other deps) and return an object of methods. Behaviour is composed (e.g. spreading `commonActions` and overriding specific methods) rather than inherited. There are no manager base classes.

- **Controllers**  
  **CommonController(manager, controllerName)** accepts any **ICommonActions\<T\>** (e.g. `ContentManager.categoryActions`) and returns an **ICommonController\<T\>** (object with `createContent`, `updateContent`, `deleteContent`, `listContent`, `getContent`). Controllers depend only on the manager interface; they don’t know about the Content Manager or file layout. Custom controllers (e.g. transaction) can compose the same way by passing an object that implements **ICommonActions** into **CommonController** and then adding extra handlers.

This removes the previous functional decomposition and aligns the code with the intended architecture: a Content Manager for simple content CRUD, other managers for complex features, and composition over inheritance.

---

### Routing: Simpler Setup

Route registration is now a **single list** in one place. There are no separate “standard” vs “custom” arrays; every route is an entry with `prefix` and `router`:

- **CRUD content routes** (account, budget, category, goal): use the same pattern — take the right actions from the Content Manager, wrap them in the common controller, then in the route factory: `routeFactory(CommonController(ContentManager.<entity>Actions, '<Entity>'))`.
- **Custom routes** (e.g. user, transaction): use a pre-built router (e.g. `userRouter`, `transactionRouter`) in the same array.

**Adding a new CRUD content type:** add one line: `{ prefix: 'xxx', router: routeFactory(CommonController(ContentManager.xxxActions, 'Xxx')) }` (assuming `ContentManager.xxxActions` already exists).

**Adding a custom service:** build a router and add `{ prefix: '...', router: yourRouter }` to the same list.

So route setup is explicit, in one file, with a single pattern for the common CRUD case and no file-scanning or empty adapter files.

### Conclusion

This refactor brings the backend in line with the intended architecture: a **Content Manager** for simple content CRUD, **object composition** for managers and controllers (no class hierarchies), and a **single, explicit route list** for wiring. Simple content lives in one place; complex behaviour stays in dedicated managers like **AccountantManager**. The result is clearer boundaries, easier route setup, and a solid base for adding transactions, investments, and other domain features.

---

## Route Setup Refactor
### How It Was
Originally, the routing setup was **file-driven and fully automated**. The `setRoutes` function scanned a folder (`routes/`) and dynamically imported each file. As long as a route file followed the expected export shape (e.g., `{ prefix, router }`), it would be automatically load and mount into the Express app.

This meant:
- No need for explicit configuration
- New routes were added simply by creating new files in the correct folder
- Route registration was implicit and decentralized

This made setup fast and easy — but over time, it introduced limitations:
- Little visibility into what was being loaded
- To much boilerplate creating empty files that were bloating the application
- Limiting the transition to micro-service architecture since the files needed to phisically be in the folder, and not imported

---

### Why I Wanted to Change

I wanted to address a few pain points:

- **Poor scalability**: As services grew, managing them through file naming and structure became fragile
- **No configuration control**: It was impossible to selectively load only some services (e.g., for different containers or environments)
- **Tight coupling to folder structure**: It made refactoring or reorganizing folders risky and error-prone
- **Too much boilerplate**: Needed to create multiple files with less than 20 lines just to extend classes and call factories

---

### The New Approach

The refactored design introduces an explicit, configuration-driven route system:

- Defined two route categories:
  - `standardRoutes`: CRUD-style services using a shared controller pattern
  - `customRoutes`: Services with custom logic or endpoints
- All services are declared in a single route configuration array
- Each entry includes a `prefix` and either a `controller` or `router`
- The central route loader (`setRoutes.ts`) reads this configuration and registers only what's defined

Example:

```ts
const standardRoutes = [
  { prefix: 'account', controller: ... },
  { prefix: 'budget', controller: ... },
];

const customRoutes = [
  { prefix: 'user', router: ... },
  { prefix: 'transaction', router: ... },
];
```

This design makes it easy to:
- Mix and match services across deployments
- Make the upgrate to dynamic service loading from YAML or env config easier since it would be in one config file
- Prepare for containerized or microservice deployments
- Removed all empty diles and boilerplate from the system that could cause some confusion
- Make it explicity the routes definitions

---

### Refactor downsides

Even though this brougth more clarity and scalability to the code, it came with a few trade offs:

- Routing is now manually configured, making the developer responsability to know how and where to do it
- Added a DSL to the system just for wiring up express with the system
- `standardRouteFactory` is now a configuration adapter layer that has cross-cutting concerns. Meaning that, if I have to refactor a layer this file might be affected

---

### Conclusion

This refactor improves the architecture by:

- Making routing **explicit and maintainable** creating an explicity wiring layer
- Allowing **environment- or container-specific setups**
- Reducing hidden logic and folder coupling
- Preparing the system for **service modularization** and future scalability

Another good take was that, after the refactor **all integration tests passed** without the need to do any changes. Proving that the code is very well decoupled.

This lays a strong foundation for future service composition, containerization, and eventual microservice extraction.

# Author
André Almeida