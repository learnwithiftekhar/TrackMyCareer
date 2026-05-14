import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/' },
  { label: 'All Jobs',  to: '/jobs' },
  { label: 'Companies', to: '/companies' },
  { label: 'Interviews', to: '/interviews' },
  { label: 'Notes',     to: '/notes' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-sm backdrop-saturate-[140%]">
      <div className="mx-auto flex max-w-[1180px] items-center gap-9 px-8 py-[14px]">

        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-foreground no-underline">
          <div className="grid size-[22px] shrink-0 place-items-center rounded-[6px] bg-foreground font-mono text-[12px] font-medium text-background">
            T
          </div>
          <span>TrackMyCareer</span>
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-[7px] text-[13.5px] transition-colors no-underline ${
                  isActive
                    ? 'bg-foreground/5 text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2.5">

          {/* Search */}
          <div className="relative w-60">
            <svg
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60"
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L13.5 13.5" />
            </svg>
            <input
              type="text"
              placeholder="Search jobs, companies…"
              className="h-[34px] w-full rounded-[9px] border border-[#ddd7c7] bg-card pl-8 pr-10 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-indigo focus:ring-[3px] focus:ring-indigo/10"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-[5px] border border-border bg-background px-[5px] py-px font-mono text-[11px] text-muted-foreground">
              ⌘K
            </span>
          </div>

          {/* Settings */}
          <Button variant="outline" size="icon" className="size-[34px] rounded-[9px]" aria-label="Settings">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="1.75" />
              <path d="M13.5 8a5.5 5.5 0 0 0-.09-1l1.27-.98-1.5-2.6-1.5.56a5.5 5.5 0 0 0-1.74-1l-.23-1.58h-3l-.23 1.58a5.5 5.5 0 0 0-1.74 1l-1.5-.56-1.5 2.6 1.27.98a5.6 5.6 0 0 0 0 2l-1.27.98 1.5 2.6 1.5-.56a5.5 5.5 0 0 0 1.74 1l.23 1.58h3l.23-1.58a5.5 5.5 0 0 0 1.74-1l1.5.56 1.5-2.6-1.27-.98c.06-.33.09-.66.09-1z" />
            </svg>
          </Button>

          {/* New application */}
          <Button className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
            New application
          </Button>
        </div>

      </div>
    </header>
  );
}
