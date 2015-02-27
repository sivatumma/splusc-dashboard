## S+C-CLS adapted for EBC, Cisco San Jose.
* A strict Jenkins/Sonar CI + Quality cycle is configured on development branch.
* Please make sure all the committed code meets the said guidlines

### Dev Cycle: Conventional git-flow.
* **master** branch would always be the default which is assumed to be cloned.
* **development** branch will always be the one, pull requests made to.
* **release** branch will always be "Ready to be Tested".
* Once tests pass on **release** branch, it would be updated to **master**.
* Any number of feature branches may be diverged from and committed to **development**.
