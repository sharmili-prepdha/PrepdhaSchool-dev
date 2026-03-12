import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

export interface BreadcrumbProps {
    crumbs: { label: string; href: string }[];
    className?: string;
}

export function Breadcrumb({ crumbs, className }: BreadcrumbProps) {
    return (
        <nav className={cn("flex items-center gap-1.5 text-xs font-medium text-slate-400", className)}>
            {crumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <FontAwesomeIcon icon={faChevronRight} className="w-[8px] h-[8px] opacity-50" />}
                    {i < crumbs.length - 1 ? (
                        <Link href={crumb.href} className="hover:text-slate-700 transition-colors uppercase tracking-wider">
                            {crumb.label}
                        </Link>
                    ) : (
                        <span className="text-slate-500 uppercase tracking-wider">{crumb.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
