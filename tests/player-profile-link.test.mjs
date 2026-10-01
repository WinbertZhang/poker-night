import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Module, { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const navigation = [];
const compiled = ts.transpileModule(fs.readFileSync("src/components/PlayerProfileLink.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
});
const linkModule = new Module("player-profile-link");
linkModule.require = (name) => {
  if (name === "next/navigation") return { useRouter: () => ({ push: href => navigation.push(href) }) };
  if (name === "next/link") return function MockLink({ children, ...props }) { return React.createElement("a", props, children); };
  return require(name);
};
linkModule._compile(compiled.outputText, "player-profile-link.js");
const PlayerProfileLink = linkModule.exports.default;

test("the entire card is a native link with an encoded full player name", () => {
  const html = renderToStaticMarkup(React.createElement(PlayerProfileLink, { player: "Allen / Mons & Co", className: "card" }, React.createElement("div", null, "Allen", React.createElement("span", null, "$37.00"))));
  assert.match(html, /href="\/stats\/Allen%20%2F%20Mons%20%26%20Co"/);
  assert.match(html, /class="card player-profile-link"/);
  assert.match(html, /<div>Allen<span>\$37.00<\/span><\/div><\/a>$/);
  assert.doesNotMatch(html, /underline/);
  assert.match(html, /style="display:block"/);
  const css = fs.readFileSync("src/app/globals.css", "utf8");
  assert.match(css, /a\.player-profile-link\s*\{[^}]*display:\s*block/);
  assert.doesNotMatch(css.slice(css.indexOf(".player-profile-link {")), /filter:|transform:/);
});

test("empty highlights and placeholder names do not link to nonexistent profiles", () => {
  for (const player of ["", "\u2014", "-"]) {
    const element = PlayerProfileLink({ player, children: "No player" });
    assert.equal(element.type, "div");
    assert.equal(element.props.href, undefined);
  }
});

test("stats table rows retain table layout and navigate on click or keyboard", () => {
  navigation.length = 0;
  const element = PlayerProfileLink({ player: "Guest Lee", as: "row", children: React.createElement("td", null, "$37.00") });
  assert.equal(element.type, "tr");
  assert.equal(element.props.style.display, "table-row");
  assert.equal(element.props.tabIndex, 0);
  element.props.onClick();
  let prevented = 0;
  for (const key of ["Enter", " ", "ArrowDown"]) element.props.onKeyDown({ key, preventDefault: () => prevented++ });
  assert.deepEqual(navigation, Array(3).fill("/stats/Guest%20Lee"));
  assert.equal(prevented, 2);
  const css = fs.readFileSync("src/app/globals.css", "utf8");
  assert.doesNotMatch(css.match(/\n\.player-profile-link\s*\{([^}]*)\}/)[1], /display:/);
});
