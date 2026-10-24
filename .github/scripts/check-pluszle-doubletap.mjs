import fs from "node:fs";import assert from "node:assert/strict";
const core=fs.readFileSync("js/core.js","utf8");
assert.ok(core.includes('let plusMode="o",pd=null,plusLastTap='));
assert.ok(core.includes('const dbl=mb!=="r"&&plusLastTap.i===i'));
assert.ok(core.includes('val=(mb==="r"||dbl)?(active===1?2:1):active'));
assert.ok(core.includes('if(remember)plusLastTap='));
console.log("OK: Pluszle start met rondje en dubbeltik kiest de andere markering");
