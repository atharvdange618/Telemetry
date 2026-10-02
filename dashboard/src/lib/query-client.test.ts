import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { createQueryClient } from "./query-client";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const fail = () => Promise.reject(new Error("boom"));

describe("createQueryClient error toast", () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("toasts when a query fails", async () => {
    const client = createQueryClient();
    await client.fetchQuery({ queryKey: ["a"], queryFn: fail, retry: false }).catch(() => {});
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("uses one toast id so several failures don't stack", async () => {
    const client = createQueryClient();
    await Promise.allSettled(
      ["a", "b", "c"].map((k) => client.fetchQuery({ queryKey: [k], queryFn: fail, retry: false })),
    );
    const ids = vi.mocked(toast.error).mock.calls.map(([, opts]) => opts?.id);
    expect(ids).toEqual(["query-error", "query-error", "query-error"]);
  });

  it("stays quiet for queries marked silentError", async () => {
    const client = createQueryClient();
    await client
      .fetchQuery({ queryKey: ["me"], queryFn: fail, retry: false, meta: { silentError: true } })
      .catch(() => {});
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("does not toast when a query succeeds", async () => {
    const client = createQueryClient();
    await client.fetchQuery({ queryKey: ["ok"], queryFn: () => Promise.resolve(1) });
    expect(toast.error).not.toHaveBeenCalled();
  });
});
