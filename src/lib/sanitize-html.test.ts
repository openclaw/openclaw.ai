import { expect, test } from "bun:test";
import { sanitizeTrustHtml } from "./sanitize-html";

test("sanitizeTrustHtml preserves safe formatting", () => {
  expect(sanitizeTrustHtml("Hello <strong>trust</strong> <br/>")).toBe(
    "Hello <strong>trust</strong> <br />",
  );
});

test("sanitizeTrustHtml escapes blocked tags and event attributes", () => {
  expect(sanitizeTrustHtml('<img src=x onerror="alert(1)"><strong onclick="alert(1)">ok</strong>')).toBe(
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;<strong>ok</strong>',
  );
});

test("sanitizeTrustHtml only keeps safe https links", () => {
  expect(sanitizeTrustHtml('<a href="javascript:alert(1)" target="_blank">bad</a>')).toBe(
    '<a target="_blank" rel="noopener noreferrer">bad</a>',
  );
  expect(sanitizeTrustHtml('<a href="https://openclaw.ai" target="_blank" rel="opener">ok</a>')).toBe(
    '<a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer">ok</a>',
  );
  expect(sanitizeTrustHtml('<a href="https://openclaw.ai" target="_blank" target="_self">ok</a>')).toBe(
    '<a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer">ok</a>',
  );
});
