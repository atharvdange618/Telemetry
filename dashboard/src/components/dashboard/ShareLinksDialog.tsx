import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link2, Copy, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ShareLink, ShareLinksResponse } from "@/lib/types/dashboard.types";

const API_URL = import.meta.env.VITE_API_URL;

const fetchAPI = async (url: string, options?: RequestInit) => {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (options?.body && !headers["Content-Type"])
    headers["Content-Type"] = "application/json";
  const res = await fetch(url, { ...options, credentials: "include", headers });
  if (!res.ok) throw new Error("An error occurred");
  if (res.status === 204) return null;
  return res.json();
};

interface ShareLinksDialogProps {
  tenantId: string;
}

export function ShareLinksDialog({ tenantId }: ShareLinksDialogProps) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ShareLinksResponse>({
    queryKey: ["shareLinks", tenantId],
    queryFn: () =>
      fetchAPI(`${API_URL}/api/share-links?tenantId=${tenantId}`),
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetchAPI(`${API_URL}/api/share-links/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareLinks", tenantId] });
      toast.success("Share link deleted");
    },
    onError: () => {
      toast.error("Failed to delete share link");
    },
  });

  const getShareUrl = (link: ShareLink) => {
    const base = window.location.origin;
    const params = new URLSearchParams();
    const config = link.config;
    if (config?.period) params.set("period", config.period);
    if (config?.startDate) params.set("startDate", config.startDate);
    if (config?.endDate) params.set("endDate", config.endDate);
    if (config?.segments) {
      for (const [k, v] of Object.entries(config.segments)) {
        if (v) params.set(k, v);
      }
    }
    const qs = params.toString();
    return `${base}/shared/${link.token}${qs ? `?${qs}` : ""}`;
  };

  const handleCopy = async (link: ShareLink) => {
    await navigator.clipboard.writeText(getShareUrl(link));
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatConfig = (link: ShareLink) => {
    const parts: string[] = [];
    if (link.config.period) parts.push(link.config.period);
    if (link.config.segments) {
      for (const [k, v] of Object.entries(link.config.segments)) {
        if (v) parts.push(`${k}: ${v}`);
      }
    }
    return parts.join(", ") || "Default view";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Link2 className="h-4 w-4" /> Manage Links
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Links</DialogTitle>
          <DialogDescription>
            Manage all shareable links for this site.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : !data?.shareLinks?.length ? (
          <p className="text-sm text-muted-foreground py-4">
            No share links yet. Create one from the dashboard.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>View</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.shareLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">
                    {link.label || "Untitled"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatConfig(link)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(link.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopy(link)}
                        title="Copy link"
                      >
                        {copiedId === link.id ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(link.id)}
                        title="Delete link"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
