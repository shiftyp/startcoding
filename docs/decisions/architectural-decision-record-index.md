# Documenting Architectural Decisions as ADR's

## Context and Problem Statement

Branching makes ordering of ADRs difficult0007-minio-object-storage

## Decision Drivers

Allow for ordering of ADRs without renaming files

## Considered Options

* Index file

## Decision Outcome

Index file. 

### Consequences
* Good, merging handles ordering
* Bad, files are in alphabetical order

## More Information

* [index](./index.md)