"use client";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    // Cyklické pořadí: ABOUT -> HOME -> CONTACT
    const items = [
        { href: "/about", label: "ABOUT ME" },
        { href: "/", label: "HOME" },
        { href: "/contact", label: "CONTACT ME" },
    ];

    // Najdi aktuální index podle cesty
    let currentHref: string = "/";
    if (pathname?.startsWith("/about")) currentHref = "/about";
    else if (pathname?.startsWith("/contact")) currentHref = "/contact";
    else currentHref = "/";

    const currentIndex = Math.max(0, items.findIndex(i => i.href === currentHref));
    const centerItem = items[currentIndex] ?? items[1];
    const leftItem = items[(currentIndex + items.length - 1) % items.length];
    const rightItem = items[(currentIndex + 1) % items.length];

    return (
        <header className="backdrop-blur-md fixed top-0 left-0 right-0 z-50 h-16 px-10 flex items-center relative">
            {/* Levá strana – předchozí v pořadí */}
            <div className="flex items-center gap-6 flex-1 justify-start text-gray-300">
                <Link href={leftItem.href} className="relative whitespace-nowrap hover:text-white transition-all duration-300 text-xs group flex items-center justify-center gap-2">
                    <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-all duration-300" />
                    <span className="whitespace-nowrap h-3.5">{leftItem.label}</span>
                </Link>
            </div>

            {/* Střed – aktuální stránka, bez šipek, vždy uprostřed */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Link href={centerItem.href} className="relative whitespace-nowrap hover:text-white transition-all duration-300 text-xs font-bold group flex items-center justify-center gap-2 pointer-events-auto">
                    <span className="whitespace-nowrap h-3.5">{centerItem.label}</span>
                </Link>
            </div>

            {/* Pravá strana – následující v pořadí */}
            <div className="flex items-center gap-6 flex-1 justify-end text-gray-300">
                <Link href={rightItem.href} className="relative whitespace-nowrap hover:text-white transition-all duration-300 text-xs group flex items-center justify-center gap-2">
                    <span className="whitespace-nowrap h-3.5">{rightItem.label}</span>
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-all duration-300" />
                </Link>
            </div>
        </header>
    );
}