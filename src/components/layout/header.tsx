"use client";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

export default function Header() {

    return (
        <header className="backdrop-blur-md fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-16 px-10">
            <div className="flex items-center gap-4 w-25 justify-start">

            </div>
            <div className="flex items-center gap-10 w-50 justify-center text-gray-300">
                <Link href="/about" className="relative whitespace-nowrap hover:text-white transition-all duration-300 text-xs group flex items-center justify-center gap-2">
                    <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-all duration-300" />
                    <span className="whitespace-nowrap h-3.5">ABOUT ME</span>
                </Link>
                <Link href="/" className="relative whitespace-nowrap hover:text-white transition-all duration-300 text-xs font-bold group flex items-center justify-center gap-2">
                    <span className="whitespace-nowrap h-3.5">HOME</span>
                </Link>
                <Link href="/contact" className="relative whitespace-nowrap hover:text-white transition-all duration-300 text-xs group flex items-center justify-center gap-2">
                    <span className="whitespace-nowrap h-3.5">CONTACT ME</span>
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-all duration-300" />
                </Link>
            </div>
            <div className="flex items-center gap-4 w-25 justify-end">

            </div>
        </header>
    );
}