# Git Server Architecture

## Context and Problem Statement

Users should have a way to sync code between the frontend editor (tbd) which preserves file structure and allows for checkpoints, and mirrors a traditional development environment.

## Decision Drivers

* Uses git in some capacity.
* Makes use of object storage primarily over database resources

## Considered Options

* Traditional git service, such as Gogs or git daemon
* Custom node based git service, backed by object storage

## Decision Outcome

Custom node based service. This might be less work than a prebuilt solution because of the storage and syncing requirements which are not ergonomic in existing solutions. Also checking out locally provides an opportunity for compilation and static analysis 

### Consequences

* Good, more custom better fitting solution
* Bad, more work and tweaking


## More Information

* https://isomorphic-git.org/