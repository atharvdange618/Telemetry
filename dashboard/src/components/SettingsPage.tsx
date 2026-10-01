import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Tenant } from "@/lib/types/dashboard.types";
import { Badge } from "@/components/ui/badge";
import { X, Copy, Check, Pencil } from "lucide-react";
import { toast } from "sonner";
import { normalizeOrigin } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

const fetchAPI = async (url: string, options?: RequestInit) => {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (options?.body && !headers["Content-Type"])
    headers["Content-Type"] = "application/json";
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
  if (!res.ok) throw new Error("An error occurred");
  if (res.status === 204) return null;
  return res.json();
};

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteDomains, setNewSiteDomains] = useState("");
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [copiedTenantId, setCopiedTenantId] = useState<string | null>(null);

  const { data: tenantsData, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => fetchAPI(`${API_URL}/api/tenants`),
  });

  const createTenant = useMutation({
    mutationFn: (data: { name: string; domains: string[] }) =>
      fetchAPI(`${API_URL}/api/tenants`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setNewSiteName("");
      setNewSiteDomains("");
    },
    onError: () => toast.error("Couldn't create the site. Try again."),
  });

  const updateTenant = useMutation({
    mutationFn: ({ id, domains }: { id: string; domains: string[] }) =>
      fetchAPI(`${API_URL}/api/tenants/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: tenantsData?.tenants?.find((t: Tenant) => t.id === id)?.name,
          domains,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setEditingTenantId(null);
      setNewDomain("");
    },
    onError: () => toast.error("Couldn't update domains. Try again."),
  });

  const renameTenant = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      fetchAPI(`${API_URL}/api/tenants/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          domains:
            tenantsData?.tenants?.find((t: Tenant) => t.id === id)?.domains ??
            [],
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setEditingNameId(null);
      setEditingName("");
    },
    onError: () => toast.error("Couldn't rename the site. Try again."),
  });

  const deleteTenant = useMutation({
    mutationFn: (tenantId: string) =>
      fetchAPI(`${API_URL}/api/tenants/${tenantId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: () => toast.error("Couldn't delete the site. Try again."),
  });

  const handleCreateSite = (e: FormEvent) => {
    e.preventDefault();
    if (newSiteName.trim()) {
      const inputs = newSiteDomains
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
      const origins = inputs.map(normalizeOrigin);
      const invalid = inputs.filter((_, i) => origins[i] === null);
      if (invalid.length > 0) {
        toast.error(`Not a valid domain: ${invalid.join(", ")}`);
        return;
      }
      const domains = [
        ...new Set(origins.filter((o): o is string => o !== null)),
      ];
      createTenant.mutate({ name: newSiteName.trim(), domains });
    }
  };

  const handleAddDomain = (tenant: Tenant) => {
    const input = newDomain.trim();
    if (!input) return;
    const origin = normalizeOrigin(input);
    if (!origin) {
      toast.error(`Not a valid domain: ${input}`);
      return;
    }
    if (tenant.domains.includes(origin)) {
      toast(`${origin} is already added`);
      setNewDomain("");
      return;
    }
    // The input clears in onSuccess, so a failed save keeps what was typed.
    updateTenant.mutate({ id: tenant.id, domains: [...tenant.domains, origin] });
  };

  const handleRemoveDomain = (tenant: Tenant, domain: string) => {
    const domains = tenant.domains.filter((d) => d !== domain);
    updateTenant.mutate({ id: tenant.id, domains });
  };

  const getEmbedScript = (tenant: Tenant) => {
    const apiKeyAttr = tenant.apiKey ? ` data-api-key="${tenant.apiKey}"` : "";
    return `<script async defer src="${API_URL}/analytics.js" data-tenant-id="${tenant.id}"${apiKeyAttr}></script>`;
  };

  const handleCopyScript = async (tenant: Tenant) => {
    await navigator.clipboard.writeText(getEmbedScript(tenant));
    setCopiedTenantId(tenant.id);
    setTimeout(() => setCopiedTenantId(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <SEO
        title="Settings"
        description="Configure your tracked domains, view tracking snippet integration scripts, and manage site parameters."
        noindex={true}
      />
      <div className="flex items-center justify-between mb-8">
        <Button asChild variant="outline">
          <Link to="/dashboard">← Back to Dashboard</Link>
        </Button>
        <DarkModeToggle />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Site</CardTitle>
          <CardDescription>Add a new website to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSite} className="space-y-4">
            <Input
              placeholder="My Awesome Blog"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
            />
            <Input
              placeholder="Allowed domains, comma-separated (e.g. example.com)"
              value={newSiteDomains}
              onChange={(e) => setNewSiteDomains(e.target.value)}
            />
            <Button type="submit" disabled={createTenant.isPending}>
              {createTenant.isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Sites</h2>
        <div className="space-y-4">
          {isLoading && <p>Loading sites...</p>}
          {tenantsData?.tenants?.map((tenant: Tenant) => (
            <Card key={tenant.id}>
              <CardHeader>
                {editingNameId === tenant.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (editingName.trim()) {
                            renameTenant.mutate({
                              id: tenant.id,
                              name: editingName.trim(),
                            });
                          }
                        }
                        if (e.key === "Escape") {
                          setEditingNameId(null);
                          setEditingName("");
                        }
                      }}
                      autoFocus
                      className="text-lg font-bold"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (editingName.trim()) {
                          renameTenant.mutate({
                            id: tenant.id,
                            name: editingName.trim(),
                          });
                        }
                      }}
                      disabled={renameTenant.isPending || !editingName.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingNameId(null);
                        setEditingName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <CardTitle>{tenant.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Rename ${tenant.name}`}
                      title="Rename"
                      onClick={() => {
                        setEditingNameId(tenant.id);
                        setEditingName(tenant.name);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold">Embed Script</h3>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={getEmbedScript(tenant)}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyScript(tenant)}
                    title="Copy to clipboard"
                  >
                    {copiedTenantId === tenant.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <h3 className="font-semibold">Allowed Domains</h3>
                <div className="flex flex-wrap gap-2">
                  {tenant.domains?.map((domain) => (
                    <Badge key={domain} variant="secondary" className="gap-1">
                      {domain}
                      <button
                        onClick={() => handleRemoveDomain(tenant, domain)}
                        aria-label={`Remove ${domain}`}
                        className="-my-1 -mr-1.5 ml-0.5 rounded-full p-1.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="example.com"
                    value={editingTenantId === tenant.id ? newDomain : ""}
                    onChange={(e) => {
                      setEditingTenantId(tenant.id);
                      setNewDomain(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDomain(tenant);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddDomain(tenant)}
                    disabled={updateTenant.isPending}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        Delete Site
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete all data associated with this site.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            variant="destructive"
                            onClick={() => deleteTenant.mutate(tenant.id)}
                          >
                            Delete
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
