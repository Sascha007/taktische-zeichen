import { Element, SVGElementFactory } from "./svg";
import type { Padding, Point } from "./types";

export type Parent = {
  size: Point;
  paintableArea?: [Point, Point];
};

export type Component = {
  size: Point;
  cover?: boolean;
  render: (factory: SVGElementFactory) => Element;
};

export function placeComponent({
  parent,
  component,
  padding = [0, 0],
  factory,
}: {
  parent: Parent;
  component: Component;
  padding?: Padding;
  factory: SVGElementFactory;
}) {
  const icon = component.render(factory);
  const { offset, scale } = calculateComponentPosition({
    parent,
    component,
    padding,
  });

  const transformations: Array<string> = [];
  if (offset[0] !== 0 || offset[1] !== 0) {
    transformations.push(`translate(${offset[0]},${offset[1]})`);
  }
  if (scale !== 1) transformations.push(`scale(${scale})`);

  if (transformations.length) {
    icon.attr("transform", transformations.join(" "));
  }

  return factory.g().push(icon);
}

// exported for tests
export function calculateComponentPosition({
  parent,
  component: {
    size: [iconWidth, iconHeight],
    cover = false,
  },
  padding = [0, 0, 0, 0],
}: {
  parent: Parent;
  component: Pick<Component, "size" | "cover">;
  padding?: Padding;
}) {
  const [paddingTop, paddingRight, paddingBottom, paddingLeft] =
    resolvePadding(padding);
  const paintableArea = parent.paintableArea ?? [[0, 0], parent.size];
  const paintableWidth =
    paintableArea[1][0] - paintableArea[0][0] - paddingLeft - paddingRight;
  const paintableHeight =
    paintableArea[1][1] - paintableArea[0][1] - paddingTop - paddingBottom;
  const scale = cover
    ? Math.max(paintableWidth / iconWidth, paintableHeight / iconHeight)
    : Math.min(paintableWidth / iconWidth, paintableHeight / iconHeight);
  const actualIconWidth = iconWidth * scale;
  const actualIconHeight = iconHeight * scale;
  const offsetX =
    paintableArea[0][0] + paddingLeft + (paintableWidth - actualIconWidth) / 2;
  const offsetY =
    paintableArea[0][1] + paddingTop + (paintableHeight - actualIconHeight) / 2;

  return { offset: [offsetX, offsetY], scale };
}

// exported for tests
export function resolvePadding(
  padding: Padding
): [number, number, number, number] {
  if (padding.length === 4) return padding;
  if (padding.length === 3)
    return [padding[0], padding[1], padding[2], padding[1]];
  return [padding[0], padding[1], padding[0], padding[1]];
}

export function addPoints(a: Point, b: Point): Point {
  return [a[0] + b[0], a[1] + b[1]];
}

export function subtractPoints(a: Point, b: Point): Point {
  return [a[0] - b[0], a[1] - b[1]];
}
