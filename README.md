# base-unit-action-build-fortress

The `BuildFortress` unit action: a delayed action that builds a `Fortress` (`base-tile-improvement-fortress`) on the unit's own tile.

- `BuildFortress`: `new BuildFortress(from, to, unit, ruleRegistry?, turn?, pendingEffects?)`. `perform()` starts the work, for as many
  turns as the largest `MovementCost` answer for the action, divided by the unit's `WorkRate` (core-unit's
  `DelayedAction`), and puts the unit in the `BuildingFortress` busy state. When the work comes due, `BuildFortress.complete(action)`
  builds the `Fortress` through the `Built` rules of the action's rule registry.
- `Rules/BuildingFortress`: the `Busy` rule the unit is in while it works.
- `COMPLETE` (`base-unit-action-build-fortressomplete`): the handler a save records for work in progress, registered with
  `registerDelayedAction` when the module is loaded, as every delayed action is.

The ruleset decides who may build one and where, with its own `Action` rule. base-unit-action-rules'
`terrainJob(deps, Fortress)` gives the usual criteria: a unit that `Terraforms`, moves left, an `Available` rule allowing
the `Fortress` there, and the unit's own tile. The turns it takes come from the ruleset's `MovementCost` rules.

A library: it has no `main` and registers no rules.
