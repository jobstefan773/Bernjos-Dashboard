"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type LoginResponse = {
  access_token: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { setToken, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { username, password }
      });
      setToken(response.access_token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <div className="rounded-xl bg-primary/10 p-2">
              <LogIn className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Authentication
            </p>
          </div>
          <CardTitle className="text-2xl">Sign in to continue</CardTitle>
          <CardDescription>
            Use your NestJS credentials. We will request a JWT from the API and store it locally for
            authenticated routes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="space-y-2 rounded-md bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>API base URL</span>
              <code className="rounded bg-card px-2 py-1 text-[11px] text-foreground">
                NEXT_PUBLIC_API_BASE_URL
              </code>
            </div>
            <p>Set this environment variable so the client can reach the NestJS server.</p>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Need accounts? Seed via backend or create manually.</span>
        </CardFooter>
      </Card>
    </div>
  );
}
