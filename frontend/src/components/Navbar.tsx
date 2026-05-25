import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/' },
  { label: 'All Jobs',  to: '/jobs' },
  { label: 'Companies', to: '/companies' },
  { label: 'Interviews', to: '/interviews' },
];

export default function Navbar() {
  const navigate = useNavigate();
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

{/* New application */}
          <Button onClick={() => navigate('/jobs/new')} className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
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
