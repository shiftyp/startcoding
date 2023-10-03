# Project Structure

## Context and Problem Statement

Every project needs a beginning. The structure here so far is based on a monorepo, composite Typescript packages, managed through Yarn Workspaces

## Decision Drivers

* Allow for modularity
* Allow for primary development in Typescript

## Considered Options

* Typescript
* Yarn Workspaces

## Decision Outcome

Decided on the only considered option, as it fit the context well and is an established pattern our development team of one is experienced with

### Consequences

* Good: Allows for modular development
* Good: Allows for recording and checking of type assumptions
* Bad: Some additional complexity

### Additional Resources

* https://classic.yarnpkg.com/lang/en/docs/workspaces/
* https://www.typescriptlang.org/
* https://www.typescriptlang.org/docs/handbook/project-references.html