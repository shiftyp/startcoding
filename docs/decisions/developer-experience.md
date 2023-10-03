# Core Developer Experience

## Context and Problem Statement

Allow for fast development locally with full features

## Decision Drivers

* Fast iteration
* Realistic features
* Easy transition po container orchestration or serverless environment

## Considered Options

* Docker
* MiniKube or Kubernetes in Docker Desktop

## Decision Outcome

Docker

### Consequences

* Good, easy to implement
* Good, minimal dependencies
* Good, widely understood
* Good, easy to visualize through a compose file
* Bad, limited and unable to truley mirror eventual production