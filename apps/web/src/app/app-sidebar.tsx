"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Home01Icon, UserGroupIcon, Shield01Icon, Menu01Icon } from "@hugeicons/core-free-icons"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const [menuItems, setMenuItems] = useState<{ title: string; url: string; icon: any }[]>(new Array<{ title: string; url: string; icon: any }>(10).fill({ title: '', url: '', icon: Home01Icon }));

    useEffect(() => {
        setTimeout(() => {
            setMenuItems(prev => [
                {
                    title: '首页',
                    url: '/',
                    icon: Home01Icon,
                },
                {
                    title: '角色管理',
                    url: '/roles',
                    icon: Shield01Icon,
                },
                {
                    title: '菜单管理',
                    url: '/menus',
                    icon: Menu01Icon,
                },
            ]);
        }, 1000);
    }, []);
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="border-b px-4 py-3">
                {/* <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Shield01Icon}
              strokeWidth={2}
              className="size-5"
            />
          </div> */}
                <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">
                    管理后台
                </span>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>导航菜单</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {
                                        item.url ? (
                                            <SidebarMenuButton asChild>
                                                <Link href={item.url}>
                                                    <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-5" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        ) : <SidebarMenuSkeleton />
                                    }
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}