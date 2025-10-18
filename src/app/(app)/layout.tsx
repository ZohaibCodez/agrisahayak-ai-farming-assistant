
'use client';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Leaf, LayoutDashboard, PlusCircle, ShoppingCart, User, Shield, LogOut } from "lucide-react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { getProfile } from "@/lib/repositories";
import { useEffect, useState } from "react";
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

    const menuItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/report/new', label: 'New Report', icon: PlusCircle },
        { href: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
        { href: '/profile', label: 'Profile', icon: User },
        { href: '/admin', label: 'Admin', icon: Shield },
    ];

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/20 rounded-lg">
                      <Leaf className="h-7 w-7 text-primary" />
                    </div>
                    <span className="text-xl font-bold font-headline group-data-[collapsible=icon]:hidden">AgriSahayak</span>
                  </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                 <SidebarHeader>
                    <SidebarMenu>
                         <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
            </Sidebar>
            <SidebarInset>
                <header className="flex items-center justify-between p-4 border-b md:justify-end">
                    <SidebarTrigger className="md:hidden" />
                    <Button variant="outline" onClick={() => router.push('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>{profile?.name || user?.displayName || 'Farmer'}</span>
                    </Button>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-white dark:bg-black/10">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
