# Minio Object Storage

## Context and Problem Statement

S3 compatible object storage

## Decision Drivers

* Easy local development story
* Easy to transition to a hosted environment

## Considered Options

* Minio

## Decision Outcome

Minio. Given the expected scale in production, it should be feasible to use a self hosted proxy (minio)

### Consequences

* Good, makes for an easy development story: using the proxy to a mount
* Bad, if scaling needs are greater than anticipated the minio proxy may be a point of failure
* Good, easy to swap out as it's S3 compatible

## More Information

* https://min.io/