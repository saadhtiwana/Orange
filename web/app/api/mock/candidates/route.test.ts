import { beforeEach, describe, expect, it } from "vitest";

import { MOCK_CANDIDATES } from "@/lib/mock/fixtures";
import { resetMockStore } from "@/lib/mock/store";

import { GET as getDetail } from "./[id]/route";
import { GET as getList } from "./route";

function detail(id: string) {
  return getDetail(new Request(`http://localhost/api/mock/candidates/${id}`), {
    params: Promise.resolve({ id }),
  });
}

describe("/api/mock/candidates", () => {
  beforeEach(() => {
    resetMockStore();
  });

  it("lists every candidate without the heavy raw_text", async () => {
    const response = await getList();
    const { candidates } = await response.json();

    expect(candidates).toHaveLength(MOCK_CANDIDATES.length);
    for (const candidate of candidates) {
      expect(candidate.raw_text).toBeUndefined();
    }
  });

  it("returns the full profile with raw_text and scores on the detail route", async () => {
    const response = await detail("cand_01");
    expect(response.status).toBe(200);

    const { candidate, scores } = await response.json();
    expect(candidate.full_name).toBe("Lena Hoffmann");
    expect(candidate.raw_text).toBeTruthy();
    expect(scores).toHaveLength(1);
    expect(scores[0].overall.band).toBe("strong");
  });

  it("returns an empty scores list for a not-yet-ranked candidate", async () => {
    const { scores } = await (await detail("cand_07")).json();
    expect(scores).toEqual([]);
  });

  it("404s for an unknown candidate", async () => {
    const response = await detail("cand_99");
    expect(response.status).toBe(404);
  });
});
