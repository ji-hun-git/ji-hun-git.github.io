(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const definitions = new Set(["gaia", "dqm", "tewak", "xr", "kf21", "traffic"]);

  const node = (tag, attributes = {}) => {
    const element = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
    return element;
  };

  const add = (parent, tag, attributes) => {
    const child = node(tag, attributes);
    parent.append(child);
    return child;
  };

  const group = (parent, className) => add(parent, "g", { class: className });

  const drawGaia = (svg) => {
    const bubble = group(svg, "pl-icon-motion pl-icon-gaia__bubble");
    add(bubble, "path", { d: "M12 14h34a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H29l-9 8v-8h-2a6 6 0 0 1-6-6Z" });
    add(svg, "path", { d: "M23 31 32 24l9 7M23 31h18" });
    add(svg, "circle", { class: "pl-icon-motion pl-icon-gaia__node pl-icon-gaia__node--one", cx: 23, cy: 31, r: 4 });
    add(svg, "circle", { class: "pl-icon-motion pl-icon-gaia__node pl-icon-gaia__node--two pl-project-icon__anchor", cx: 32, cy: 24, r: 4 });
    add(svg, "circle", { class: "pl-icon-motion pl-icon-gaia__node pl-icon-gaia__node--three", cx: 41, cy: 31, r: 4 });
  };

  const drawDqm = (svg) => {
    const grid = group(svg, "pl-icon-dqm__grid");
    add(grid, "rect", { x: 11, y: 11, width: 42, height: 42, rx: 2 });
    [21.5, 32, 42.5].forEach((value) => {
      add(grid, "line", { x1: value, y1: 11, x2: value, y2: 53 });
      add(grid, "line", { x1: 11, y1: value, x2: 53, y2: value });
    });
    add(svg, "rect", { class: "pl-icon-motion pl-icon-dqm__error pl-project-icon__anchor", x: 32.8, y: 22.3, width: 9.4, height: 9.4, rx: 1 });
    const cutout = group(svg, "pl-icon-motion pl-icon-dqm__cutout pl-project-icon__cutout");
    add(cutout, "path", { d: "m35.4 24.9 4.2 4.2m0-4.2-4.2 4.2" });
    add(svg, "rect", { class: "pl-icon-motion pl-icon-dqm__scan", x: 9, y: 10, width: 46, height: 10, rx: 2 });
  };

  const drawTewak = (svg) => {
    const buoy = group(svg, "pl-icon-motion pl-icon-tewak__buoy");
    add(buoy, "circle", { cx: 31, cy: 21, r: 11 });
    add(buoy, "circle", { class: "pl-project-icon__anchor", cx: 31, cy: 21, r: 4.5 });
    add(buoy, "path", { d: "M31 32c1 5 8 7 8 13" });
    const waves = group(svg, "pl-icon-motion pl-icon-tewak__waves");
    add(waves, "path", { d: "M9 39c5-4 10-4 15 0s10 4 15 0 10-4 16 0" });
    add(waves, "path", { d: "M9 47c5-4 10-4 15 0s10 4 15 0 10-4 16 0" });
    add(svg, "ellipse", { class: "pl-project-icon__anchor", cx: 40, cy: 48, rx: 3.5, ry: 4.5 });
    add(svg, "path", { d: "m38 52-4 4m8-4 5 3" });
  };

  const drawXr = (svg) => {
    add(svg, "path", { d: "M13 14h34v31H13Zm34 0 5 6v31l-5-6M13 45l5 6h34" });
    add(svg, "rect", { class: "pl-project-icon__anchor", x: 29, y: 31, width: 12, height: 12, rx: 1.5 });
    add(svg, "path", { class: "pl-icon-motion pl-icon-xr__route", d: "M25 29v-8h14l7-6m-4 0h4v4" });
    add(svg, "rect", { class: "pl-icon-motion pl-icon-xr__panel", x: 20, y: 22, width: 15, height: 10, rx: 2 });
    const ticks = group(svg, "pl-icon-motion pl-icon-xr__ticks");
    add(ticks, "path", { d: "M9 20v-7h7M48 9h7v7M55 44v8h-8" });
  };

  const drawKf21 = (svg) => {
    add(svg, "path", {
      class: "pl-project-icon__anchor pl-icon-kf21__airframe",
      d: "M32 7 37 24 53 34 52 39 36 35 38 51 34 48 32 57 30 48 26 51 28 35 12 39 11 34 27 24Z"
    });
    const facets = group(svg, "pl-icon-motion pl-icon-kf21__facets pl-project-icon__cutout");
    add(facets, "path", { d: "m28 25-9 9m18-8 9 9M30 38l6 6" });
    add(svg, "path", { d: "M15 16h-6v7M49 16h6v7M9 43v7h6M55 43v7h-6" });
    add(svg, "line", { class: "pl-icon-motion pl-icon-kf21__scan", x1: 8, y1: 12, x2: 56, y2: 12 });
  };

  const drawTraffic = (svg) => {
    add(svg, "path", { d: "M14 20v34M10 54h9" });
    add(svg, "rect", { class: "pl-project-icon__anchor", x: 10, y: 12, width: 8, height: 8, rx: 1.5 });
    const signal = group(svg, "pl-icon-motion pl-icon-traffic__signal");
    add(signal, "path", { d: "M20 18c7 2 12 7 14 14M20 13c10 2 18 10 20 20" });
    add(svg, "path", { d: "M25 37h31M25 52h31" });
    add(svg, "rect", { x: 32, y: 27, width: 16, height: 8, rx: 3 });
    add(svg, "circle", { cx: 36, cy: 35, r: 1.8 });
    add(svg, "circle", { cx: 44, cy: 35, r: 1.8 });
    add(svg, "rect", { x: 39, y: 42, width: 14, height: 8, rx: 3 });
    add(svg, "circle", { cx: 43, cy: 50, r: 1.8 });
    add(svg, "circle", { cx: 50, cy: 50, r: 1.8 });
    add(svg, "path", { class: "pl-icon-motion pl-icon-traffic__track pl-icon-traffic__track--one", d: "M29 26v-4h22v4m0 10v4H29v-4" });
    add(svg, "path", { class: "pl-icon-motion pl-icon-traffic__track pl-icon-traffic__track--two", d: "M36 41v-3h20v3m0 10v4H36v-4" });
  };

  const drawers = { gaia: drawGaia, dqm: drawDqm, tewak: drawTewak, xr: drawXr, kf21: drawKf21, traffic: drawTraffic };

  const create = (icon, placement = "cover") => {
    if (!definitions.has(icon)) return null;
    const wrapper = document.createElement("span");
    wrapper.className = `pl-project-icon pl-project-icon--${placement}`;
    wrapper.dataset.projectIcon = icon;
    wrapper.setAttribute("aria-hidden", "true");

    const svg = node("svg", {
      class: "pl-project-icon__svg",
      viewBox: "0 0 64 64",
      "aria-hidden": "true",
      focusable: "false"
    });
    drawers[icon](svg);
    wrapper.append(svg);
    return wrapper;
  };

  window.PROJECT_LIBRARY_ICONS = Object.freeze({ create, has: (icon) => definitions.has(icon) });
})();
