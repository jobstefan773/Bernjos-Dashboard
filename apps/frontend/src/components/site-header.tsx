'use client'

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import * as React from "react"


export function SiteHeader() {
  const pathname = usePathname();
  // Map of main routes to labels/links
  const mainCrumbs = [
    { label: "Dashboard", href: "/dashboard", match: "/dashboard" },
    { label: "Employees", href: "/employees", match: "/employees" },
    { label: "New Employee", href: "/employees/new-employee", match: "/employees/new-employee" },
    { label: "Settings", href: "/settings", match: "/settings" },
  ];

  // Build breadcrumb trail for nested routes
  let crumbs = [];
  if (pathname?.startsWith("/employees/new-employee")) {
    crumbs = [
      { label: "Employees", href: "/employees" },
      { label: "New Employee", href: "/employees/new-employee" },
    ];
  } else {
    const found = mainCrumbs.find(crumb => pathname?.startsWith(crumb.match));
    crumbs = found ? [{ label: found.label, href: found.href }] : [mainCrumbs[0]];
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Always show sidebar trigger */}
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {idx < crumbs.length - 1 ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {idx < crumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
