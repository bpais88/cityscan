import Fuse from "fuse.js";
import type { SearchResult } from "./types";

export function createSearchIndex(items: SearchResult[]) {
  return new Fuse(items, {
    keys: [
      { name: "name", weight: 0.7 },
      { name: "code", weight: 0.3 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
  });
}
