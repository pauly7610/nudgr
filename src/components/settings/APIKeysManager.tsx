import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Key, Copy, Plus, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAPIKeys } from "@/hooks/useAPIKeys";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export const APIKeysManager = () => {
  const { apiKeys, isLoading, createAPIKey, updateAPIKey, deleteAPIKey } = useAPIKeys();
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDomains, setNewKeyDomains] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const handleCreate = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your API key",
        variant: "destructive",
      });
      return;
    }

    const domains = newKeyDomains
      .split(',')
      .map(d => d.trim())
      .filter(d => d);

    createAPIKey.mutate(
      { keyName: newKeyName, allowedDomains: domains },
      {
        onSuccess: () => {
          setNewKeyName("");
          setNewKeyDomains("");
          setIsCreateDialogOpen(false);
        },
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (key: string) => {
    return key.substring(0, 7) + '•'.repeat(25) + key.substring(key.length - 4);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for customer website tracking
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key for tracking friction on customer websites
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="Production Website"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domains">Allowed Domains (optional)</Label>
                  <Input
                    id="domains"
                    placeholder="example.com, www.example.com"
                    value={newKeyDomains}
                    onChange={(e) => setNewKeyDomains(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of domains. Leave empty to allow all domains.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createAPIKey.isPending}>
                  {createAPIKey.isPending ? "Creating..." : "Create Key"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading API keys...
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground mb-2">No API keys yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create an API key to start tracking friction on websites
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{key.key_name}</h4>
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <code className="bg-muted px-2 py-1 rounded">
                        {visibleKeys.has(key.id) ? key.api_key : maskKey(key.api_key)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {visibleKeys.has(key.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(key.api_key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created {format(new Date(key.created_at), 'PPP')}</span>
                      {key.last_used_at && (
                        <span>Last used {format(new Date(key.last_used_at), 'PPP')}</span>
                      )}
                    </div>
                    {key.allowed_domains && key.allowed_domains.length > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>Restricted to: {key.allowed_domains.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${key.id}`} className="text-xs">
                        Active
                      </Label>
                      <Switch
                        id={`active-${key.id}`}
                        checked={key.is_active}
                        onCheckedChange={(checked) =>
                          updateAPIKey.mutate({ id: key.id, isActive: checked })
                        }
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAPIKey.mutate(key.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Installation Instructions
          </h4>
          <p className="text-sm text-muted-foreground">
            Add this script to your customer's website to start tracking:
          </p>
          <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
            {`<script 
  src="${window.location.origin}/friction-tracker.js" 
  data-api-key="YOUR_API_KEY"
  data-batch-size="10"
  data-batch-interval="5000"
></script>`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};