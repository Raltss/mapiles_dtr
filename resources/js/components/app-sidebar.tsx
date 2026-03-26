import { Link } from '@inertiajs/react';
import { Calculator, FileText, Trophy, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as calculateIndex } from '@/routes/calculate';
import { index as employeesIndex } from '@/routes/employees';
import { index as rankingIndex } from '@/routes/ranking';
import { index as summaryIndex } from '@/routes/summary';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Employees',
        href: employeesIndex(),
        icon: Users,
    },
    {
        title: 'Calculate',
        href: calculateIndex(),
        icon: Calculator,
    },
    {
        title: 'Summary',
        href: summaryIndex(),
        icon: FileText,
    },
    {
        title: 'Ranking',
        href: rankingIndex(),
        icon: Trophy,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
