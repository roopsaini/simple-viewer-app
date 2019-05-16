import { FeatureOverrideProvider, Viewport, FeatureSymbology } from "@bentley/imodeljs-frontend";
import { ColorDef, ElementProps } from "@bentley/imodeljs-common";

export class SampleFeatureOverrideProvider implements FeatureOverrideProvider {

  private _elements: ElementProps[];

  public constructor(elements: ElementProps[]) {
    this._elements = elements;
  }

  // interface function to set feature overrides
  public addFeatureOverrides(_overrides: FeatureSymbology.Overrides, _viewport: Viewport) {

    const defaultAppearance = FeatureSymbology.Appearance.fromRgba(ColorDef.white);
    const appearance = FeatureSymbology.Appearance.fromRgba(ColorDef.from(0, 255, 0)); // green

    // set default appearance for all elements
    _overrides.setDefaultOverrides(defaultAppearance);
    // set appearance of elements passed in
    if (this._elements) this._elements.forEach( (element: ElementProps) => {
      if (element.id) _overrides.overrideElement(element.id, appearance);
    });
  }
}
