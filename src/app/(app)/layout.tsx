
'use client';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Leaf, LayoutDashboard, PlusCircle, ShoppingCart, User, Shield, LogOut, Bell, Settings, ChevronDown } from "lucide-react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/firebase";
import { getProfile } from "@/lib/repositories";
import React, { useEffect, useState } from "react";
import { UserProfile } from "@/lib/models";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, auth } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (user) {
            getProfile(user.uid).then(setProfile);
        } else {
            setProfile(null);
        }
    }, [user]);

    const handleLogout = async () => {
        await auth.signOut();
        router.push('/login');
    };

    // Generate breadcrumbs based on current path
    const generateBreadcrumbs = () => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const breadcrumbs = [
            { label: 'Home', href: '/dashboard' }
        ];

        if (pathname === '/dashboard') {
            return [{ label: 'Dashboard', href: '/dashboard' }];
        }

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const label = segment.charAt(0).toUpperCase() + segment.slice(1);
            breadcrumbs.push({
                label: label,
                href: currentPath
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    const menuItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/report/new', label: 'New Report', icon: PlusCircle },
        { href: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
        { href: '/profile', label: 'Profile', icon: User },
        { href: '/admin', label: 'Admin', icon: Shield },
    ];

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar variant="inset" collapsible="icon">
                <SidebarHeader className="border-b">
                  <div className="flex items-center gap-2 px-2 py-2">
                    <div className="p-1.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg group-data-[collapsible=icon]:p-2">
                      <Leaf className="h-7 w-7 text-primary group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden">
                      <span className="text-xl font-bold font-headline">AgriSahayak</span>
                      <p className="text-xs text-muted-foreground">AI-Powered Farming</p>
                    </div>
                  </div>
                </SidebarHeader>
                <SidebarContent className="px-2">
                    <SidebarMenu className="space-y-1">
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton 
                                    asChild 
                                    isActive={pathname === item.href} 
                                    tooltip={item.label}
                                    className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                                >
                                    <Link href={item.href} className="flex items-center gap-3">
                                        <item.icon className="h-5 w-5 flex-shrink-0" />
                                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <div className="border-t px-2 py-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                onClick={handleLogout} 
                                tooltip="Logout"
                                className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                            >
                                <LogOut className="h-5 w-5 flex-shrink-0" />
                                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="md:hidden" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <React.Fragment key={breadcrumb.href}>
                                        <BreadcrumbItem>
                                            {index === breadcrumbs.length - 1 ? (
                                                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink asChild>
                                                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                    </React.Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-auto">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.photoURL || ''} />
                                        <AvatarFallback>
                                            {(profile?.name || user?.displayName || 'F').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium">
                                            {profile?.name || user?.displayName || 'Farmer'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {profile?.location || 'Pakistan'}
                                        </p>
                                    </div>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push('/profile')}>
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/settings')}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/20 min-h-screen">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
