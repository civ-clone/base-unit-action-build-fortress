import DelayedAction from '@civ-clone/core-unit/DelayedAction';
export declare const COMPLETE = 'base-unit-action-build-fortress:complete';
/**
 * Builds a `Fortress` on the unit's own tile. The work takes as many turns as the largest `MovementCost` answer for this
 *  action, divided by the unit's `WorkRate` (see `DelayedAction`).
 *
 * Which units may build one, and where, is the ruleset's: base-unit-action-rules' `terrainJob(deps, Fortress)` gives the
 *  usual criteria (a unit that `Terraforms`, moves left, an `Available` rule allowing it, the unit's own tile).
 */
export declare class BuildFortress extends DelayedAction {
  perform(): void;
  /**
   * What finishing does: a `Fortress` on the tile the action was performed on, built through the `Built` rules of the
   *  registry the action was constructed with.
   *
   * Static, as in the other delayed actions: a public instance member would make the class unassignable to `Action`.
   */
  static complete(action: BuildFortress): void;
}
export default BuildFortress;
