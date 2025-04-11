# Finanças
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)
![Server Coverage](https://img.shields.io/badge/server--coverage-100.00%25-brightgreen)
![Client Coverage](https://img.shields.io/badge/client--coverage-100%25-brightgreen)

This APP is made to help you manage your finances and invest, by providing powerful tools to balance your relationship with money and givinging insightful help on building different types of investments portifolios.

# To-dos
## Features
2. Build Account CRUD page
3. Build transactions page
4. Build Investments page
5. Build dashboard page
6. Build User managements page for admin
7. Build smart import for transactions
8. Integrate with brazilian B3 stock market

## Infrastructure
1. ~~Build github actions for PR to run tests (unit tests, integration tests) and lint~~
2. Update pre-push github automation to not run tests
3. ~~Build github actions for PR merge on mester to run tests (all) and deploy~~

## Technical Debts
1. Switch mongo to a SQL database
2. ~~Remove Query translation from Repository~~
3. ~~Remove Empty files to improve readability~~
4. Revise all try-catch for better error handling
5. ~~Improve server logging for better log context~~
6. ~~Remove useless token memory store~~

# Technical Considerations
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