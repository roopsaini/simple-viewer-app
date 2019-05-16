/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
 * Licensed under the MIT License. See LICENSE.md in the project root for license terms.
 *--------------------------------------------------------------------------------------------*/
import {
  DecorateContext,
  IModelApp,
  Marker,
  imageElementFromUrl,
} from "@bentley/imodeljs-frontend";
import { XYAndZ, XAndY } from "@bentley/geometry-core";

export class ImageMarker extends Marker {
  constructor(worldLocation: XYAndZ, size: XAndY, toolTip?: string | undefined) {
    super(worldLocation, size);
    const image = imageElementFromUrl("marker.svg");
    this.setImage(image);
    this.title = toolTip;
  }
}

export class MarkerDecoration {
  private static _decorator?: MarkerDecoration;
  protected _markers: Marker[] = [];

  public static getMarkerDecoration() {
    if (!this._decorator) this._decorator = new MarkerDecoration();
    return this._decorator;
  }

  public static create(positions: number[][]): any {
    const markerDecoration = MarkerDecoration.getMarkerDecoration();

    positions.forEach( (position: number[]) => {
      this.addMarkerAtPosition(position);
    });

    return markerDecoration;
  }

  private static addMarkerAtPosition(position: number[]) {
    const marker = new ImageMarker(
      { x: position[0], y: position[1], z: position[2] },
      { x: 30, y: 30 },
    );
    MarkerDecoration.getMarkerDecoration()._markers.push(marker);
  }

  public decorate(context: DecorateContext): void {
    if (context.viewport.view.isSpatialView())
      this._markers.forEach((marker) => {
        marker.addDecoration(context);
      });
  }

  public static toggle(positions: number[][]) {
    if (!MarkerDecoration._decorator) {
      // Create the decorators and add them
      IModelApp.viewManager.addDecorator(MarkerDecoration.create(positions));
    } else {
      IModelApp.viewManager.dropDecorator(MarkerDecoration._decorator);
      MarkerDecoration._decorator = undefined;
    }
  }

  public static refresh(positions: number[][]) {
    if (MarkerDecoration._decorator) {
      IModelApp.viewManager.dropDecorator(MarkerDecoration._decorator);
      MarkerDecoration._decorator._markers = [];
      IModelApp.viewManager.addDecorator(MarkerDecoration.create(positions));
    }
  }
}
