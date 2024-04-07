# Core Developer Experience

## Context and Problem Statement

Allow for fast development locally with full features, including knative development

## Decision Drivers

* Fast iteration
* Realistic features
* Allows for knative development

## Considered Options

* Docker
* MiniKube or Kubernetes in Docker Desktop

## Decision Outcome

Kubernetes

### Consequences

* Good, easy to implement
* Good, minimal dependencies
* Good, widely understood
* Good, easy to visualize through a compose file
* Bad, limited and unable to truley mirror eventual production