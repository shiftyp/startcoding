# Code Editor

## Context and Problem Statement

Need a front end editor that supports multiple languages, and is extensible

## Decision Drivers

* Flexible
* Allows for display of custom hinting
* Ideally has built in language support

## Considered Options

* Code Mirror
* Monaco

## Decision Outcome

Monaco

### Consequences

* Good, stateless model for diff generation
* Bad, a little more complexs

## More Information

* https://microsoft.github.io/monaco-editor/