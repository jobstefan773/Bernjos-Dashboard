"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  ListRestart,
  LogOut,
  Menu,
  Shield,
  Signal
} from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn, getApiBaseUrl } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Branches", href: "/branches", icon: Building2 },
  { label: "Schedules", href: "/schedules", icon: Signal, badge: "soon" },
  { label: "Payroll", href: "/payroll", icon: Shield, badge: "soon" }
];

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, clearToken } = useAuth();
  const router = useRouter();
  const apiBaseUrl = getApiBaseUrl();

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/60 text-foreground">
      <aside className="hidden border-r border-border/70 bg-card/80 backdrop-blur md:block md:w-64 lg:w-72">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-border/80 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Bernjos Dashboard</p>
              <p className="text-xs text-muted-foreground">Internal control center</p>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
          </ScrollArea>
          <div className="border-t border-border/80 px-4 py-4 text-xs text-muted-foreground">
            <p>
              API host: <span className="font-medium text-foreground break-all">{apiBaseUrl}</span>
            </p>
          </div>
        </div>
      </aside>
      <main className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/70 bg-card/70 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <MobileNav />
            <Separator orientation="vertical" className="h-6" />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <Badge variant="secondary" className="hidden items-center gap-1 px-3 py-1 md:inline-flex">
              <ListRestart className="h-3.5 w-3.5" />
              <span>Internal admin</span>
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Separator orientation="vertical" className="h-6" />
            <UserMenu isAuthenticated={isAuthenticated} onLogout={handleLogout} />
          </div>
        </header>
        <div className="flex-1 px-4 py-6 md:px-8 lg:px-12">
          <div className="backdrop absolute inset-0 -z-10 opacity-60 blur-3xl" />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

function NavLink({ label, href, icon: Icon, badge }: NavItem) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted/60",
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span className="flex-1">{label}</span>
      {badge ? (
        <Badge variant="secondary" className="px-2 py-0.5 text-[10px] uppercase tracking-wide">
          {badge}
        </Badge>
      ) : null}
    </Link>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full border border-border/60">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="flex flex-row items-center gap-3 border-b border-border/80 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
            <Shield className="h-5 w-5" />
          </div>
          <div className="text-left">
            <SheetTitle>Bernjos Dashboard</SheetTitle>
            <p className="text-xs text-muted-foreground">Navigation</p>
          </div>
        </SheetHeader>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function UserMenu({ isAuthenticated, onLogout }: { isAuthenticated: boolean; onLogout: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 rounded-full border border-border/60 px-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="hidden text-left text-xs font-medium leading-tight sm:block">
            <div className="text-foreground">Admin</div>
            <div className="text-muted-foreground">Dashboard</div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">Session</DropdownMenuLabel>
        <DropdownMenuItem disabled className="justify-between text-sm">
          Status
          <Badge variant={isAuthenticated ? "success" : "warning"} className="px-2 py-0.5">
            {isAuthenticated ? "Connected" : "Guest"}
          </Badge>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} className="gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
