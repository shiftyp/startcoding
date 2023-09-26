# Initial Typescript Package Structure

## Context and Problem Statement

Initial typescript packages to define types, implementation of core browser interfaces, and the UI

## Decision Drivers

* Separation of Concerns

## Considered Options

* A single package
* One core and one UI package
* Separate types, implementation, and UI

## Decision Outcome

Separate types, implimentation, and UI. This provides the most flexibility and separation of concerns

### Consequences

* Good, types and implementation can be linked but referenced separately
* Good, UI and core dependencies are clearly separated
* Bad, additional complexity and obfuscation