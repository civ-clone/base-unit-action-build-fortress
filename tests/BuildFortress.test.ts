import BuildFortress, { COMPLETE } from '../BuildFortress';
import BuildingFortress from '../Rules/BuildingFortress';
import Built from '@civ-clone/core-tile-improvement/Rules/Built';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Fortress from '@civ-clone/base-tile-improvement-fortress/Fortress';
import Generator from '@civ-clone/core-world-generator/Generator';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import PendingEffectRegistry from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Unit from '@civ-clone/core-unit/Unit';
import WorkRate from '@civ-clone/core-unit/Rules/WorkRate';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';

class Engineers extends Unit {}

describe('BuildFortress', (): void => {
  const setUp = (cost: number) => {
    const ruleRegistry = new RuleRegistry(),
      pendingEffects = new PendingEffectRegistry(),
      turn = new Turn(),
      tile = new Tile(0, 0, new Terrain(), new World(new Generator(1, 1))),
      built: [Tile, TileImprovement][] = [];

    turn.set(5);

    ruleRegistry.register(
      new MovementCost(
        new Criterion(
          (unit: Unit, action: unknown) => action instanceof BuildFortress
        ),
        new Effect((): number => cost)
      ),
      new Built(
        new Effect((builtTile: Tile, improvement: TileImprovement): void => {
          built.push([builtTile, improvement]);
        })
      )
    );

    const unit = new Engineers(null, new Player(), tile, ruleRegistry),
      action = new BuildFortress(
        tile,
        tile,
        unit,
        ruleRegistry,
        turn,
        pendingEffects
      );

    return { action, built, pendingEffects, ruleRegistry, tile, unit };
  };

  // Civ2's turns for the order (survey-terrain, the Orders table, OpenCiv2 `unit_terrain_work_turns`): Fortress: `move / 2 + 3`, so 4 on Hills (move 2).
  it('starts work that finishes after the `MovementCost` answer in turns, with the unit busy and out of moves', (): void => {
    const { action, pendingEffects, unit } = setUp(4);

    action.perform();

    const [pendingEffect] = pendingEffects.getByTarget(unit);

    expect(pendingEffect.handler()).to.equal(COMPLETE);
    expect(pendingEffect.data()).to.deep.equal({ endTurn: '9' });
    expect(unit.busy()).to.instanceof(BuildingFortress);
    expect(unit.moves().value()).to.equal(0);
  });

  // Engineers work at twice the rate (survey-terrain's work rate, OpenCiv2 `unit_do_terrain_work`): 4 turns' work takes 2.
  it("takes the turns divided by the unit's `WorkRate`, rounded up", (): void => {
    const { action, pendingEffects, ruleRegistry, unit } = setUp(4);

    ruleRegistry.register(new WorkRate(new Effect((): number => 2)));

    action.perform();

    const [pendingEffect] = pendingEffects.getByTarget(unit);

    expect(pendingEffect.data()).to.deep.equal({ endTurn: '7' });
  });

  it('builds a `Fortress` on its tile when it completes, through the `Built` rules', (): void => {
    const { action, built, tile } = setUp(3);

    BuildFortress.complete(action);

    expect(built).to.have.length(1);
    expect(built[0][0]).to.equal(tile);
    expect(built[0][1]).to.instanceof(Fortress);
  });
});
