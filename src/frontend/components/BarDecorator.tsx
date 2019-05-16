import { DecorateContext, GraphicType, Decorator } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { Range3d } from "@bentley/geometry-core";

export class BarDecorator implements Decorator {

  private _positions: number[][];

  public constructor(positions: number[][]) {
    this._positions = positions;
  }

  public decorate(context: DecorateContext): void {
    // Check view type, project extents is only applicable to show in spatial views.
    const vp = context.viewport;
    if (!vp.view.isSpatialView())
      return;

    const builder = context.createGraphicBuilder(GraphicType.WorldDecoration, undefined);
    this._positions.forEach((position) => {

      builder.setSymbology(ColorDef.from(255, 0, 0), ColorDef.blue , 2);
      const aBox = new Range3d(position[0] - 5, position[1] - 5, 0, position[0] + 5, position[1] + 5, 100);
      builder.addRangeBox(aBox);
    });
    context.addDecorationFromBuilder(builder);
  }
}
