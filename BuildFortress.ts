import BuildingFortress from './Rules/BuildingFortress';
import DelayedAction from '@civ-clone/core-unit/DelayedAction';
import Fortress from '@civ-clone/base-tile-improvement-fortress/Fortress';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Unit from '@civ-clone/core-unit/Unit';
import registerDelayedAction from '@civ-clone/core-unit/registerDelayedAction';

export const COMPLETE = 'base-unit-action-build-fortress:complete';

/**
 * Builds a `Fortress` on the unit's own tile. The work takes as many turns as the largest `MovementCost` answer for this
 *  action, divided by the unit's `WorkRate` (see `DelayedAction`).
 *
 * Which units may build one, and where, is the ruleset's: base-unit-action-rules' `terrainJob(deps, Fortress)` gives the
 *  usual criteria (a unit that `Terraforms`, moves left, an `Available` rule allowing it, the unit's own tile).
 */
export class BuildFortress extends DelayedAction {
  perform(): void {
    const [moveCost]: number[] = this.ruleRegistry()
      .process(MovementCost, this.unit(), this)
      .sort((a: number, b: number): number => b - a);

    super.perform(moveCost || 0, COMPLETE, BuildingFortress);

    this.ruleRegistry().process(Moved, this.unit(), this);
  }

  /**
   * What finishing does: a `Fortress` on the tile the action was performed on, built through the `Built` rules of the
   *  registry the action was constructed with.
   *
   * Static, as in the other delayed actions: a public instance member would make the class unassignable to `Action`.
   */
  static complete(action: BuildFortress): void {
    new Fortress(action.from(), action.ruleRegistry());
  }
}

// Registered here, as every delayed action is, so a unit part-way through this can be saved: the save records the
//  identifier and the behaviour stays in this package.
registerDelayedAction({
  BusyRule: BuildingFortress,
  handler: COMPLETE,
  action: (unit: Unit) => new BuildFortress(unit.tile(), unit.tile(), unit),
  complete: (unit, pendingEffect, action) => BuildFortress.complete(action),
});

export default BuildFortress;
