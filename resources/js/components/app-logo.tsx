import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-transparent text-sidebar-primary-foreground">
                <AppLogoIcon className="h-6 w-6" alt="Mapiles logo" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    CinDTR
                </span>
            </div>
        </>
    );
}
