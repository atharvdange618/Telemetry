import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ShareLink } from "@/lib/types/dashboard.types";

const API_URL = import.meta.env.VITE_API_URL;

const fetchAPI = async (url: string, options?: RequestInit) => {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (options?.body && !headers["Content-Type"])
    headers["Content-Type"] = "application/json";
  const res = await fetch(url, { ...options, credentials: "include", headers });
  if (!res.ok) throw new Error("An error occurred");
  return res.json();
};

interface ShareButtonProps {
  tenantId: string;
  searchParams: URLSearchParams;
}

export function ShareButton({ tenantId, searchParams }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [period, setPeriod] = useState<string>("24h");
  const [createdLink, setCreatedLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: { tenantId: string; label?: string; config: any }) =>
      fetchAPI(`${API_URL}/api/share-links`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data: { shareLink: ShareLink }) => {
      setCreatedLink(data.shareLink);
      toast.success("Share link created");
    },
    onError: () => {
      toast.error("Failed to create share link");
    },
  });

  const getShareUrl = (token: string) => {
    const base = window.location.origin;
    const params = new URLSearchParams();
    const config = createdLink?.config;
    if (config?.period) params.set("period", config.period);
    if (config?.startDate) params.set("startDate", config.startDate);
    if (config?.endDate) params.set("endDate", config.endDate);
    if (config?.segments) {
      for (const [k, v] of Object.entries(config.segments)) {
        if (v) params.set(k, v);
      }
    }
    const qs = params.toString();
    return `${base}/shared/${token}${qs ? `?${qs}` : ""}`;
  };

  const handleCopy = async () => {
    if (!createdLink) return;
    await navigator.clipboard.writeText(getShareUrl(createdLink.token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = () => {
    const config: Record<string, any> = {};
    config.period = period;

    const segments: Record<string, string> = {};
    for (const key of ["browser", "os", "country", "language", "device"]) {
      const val = searchParams.get(key);
      if (val) segments[key] = val;
    }
    if (Object.keys(segments).length > 0) config.segments = segments;

    createMutation.mutate({
      tenantId,
      label: label.trim() || undefined,
      config,
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setLabel("");
      setPeriod("24h");
      setCreatedLink(null);
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Dashboard View</DialogTitle>
          <DialogDescription>
            Create a shareable link for the current dashboard view.
          </DialogDescription>
        </DialogHeader>

        {createdLink ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={getShareUrl(createdLink.token)}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Anyone with this link can view this dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Label (optional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <div className="flex rounded-full border border-border bg-muted/30 p-0.5">
                {(["24h", "7d", "30d", "90d"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                      period === p
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Link"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
