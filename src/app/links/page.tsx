import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

type Bio = {
  name: string;
  tagline: string;
  description: string;
  location?: string;
  avatar: string;
};

type LinkItem = {
  id: string;
  label: string;
  href: string;
  description: string;
  icon: string;
  iconTransform?: string;
};

type LinksContent = {
  bio: Bio;
  links: LinkItem[];
  linkOrder?: string[];
};

type NormalizedLink = LinkItem & {
  icon: string;
  isRemoteIcon: boolean;
};

export const metadata: Metadata = {
  title: 'Links | Eoghan Collins',
  description:
    'Quick access to Eoghan Collins across WhatsApp, LinkedIn, X, StudySmith, Calendly, email, and Google Drive.',
};

function normalizeAssetPath(value: string): string {
  if (!value) {
    return value;
  }

  if (/^(?:https?:|data:|\/)/.test(value)) {
    return value;
  }

  const trimmed = value.replace(/^\.\//, '');
  return `/links/${trimmed.replace(/^\//, '')}`;
}

async function getLinksContent(): Promise<LinksContent> {
  const filePath = path.join(process.cwd(), 'public', 'links', 'links.json');
  const file = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(file) as LinksContent;
}

export default async function LinksPage() {
  const { bio, links, linkOrder } = await getLinksContent();

  const avatarSrc = normalizeAssetPath(bio.avatar);

  const normalizedLinks: NormalizedLink[] = links.map((link) => {
    const icon = normalizeAssetPath(link.icon);
    return {
      ...link,
      icon,
      isRemoteIcon: /^(?:https?:)/.test(icon),
    };
  });

  const orderedLinks = (() => {
    if (!linkOrder || linkOrder.length === 0) {
      return normalizedLinks;
    }

    const orderLookup = new Map(normalizedLinks.map((link) => [link.id, link] as const));
    const selected = linkOrder
      .map((id) => orderLookup.get(id))
      .filter((link): link is NormalizedLink => Boolean(link));

    const remaining = normalizedLinks.filter((link) => !linkOrder.includes(link.id));
    return [...selected, ...remaining];
  })();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#020617] via-[#050b1e] to-[#0f1f3a] text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-85"
          style={{
            backgroundImage: [
              'radial-gradient(ellipse at 18% 12%, rgba(76, 106, 255, 0.35) 0, transparent 48%)',
              'radial-gradient(circle at 82% 16%, rgba(56, 189, 248, 0.32) 0, transparent 50%)',
              'radial-gradient(circle at 22% 84%, rgba(16, 185, 129, 0.26) 0, transparent 45%)',
              'radial-gradient(circle at 74% 78%, rgba(236, 72, 153, 0.22) 0, transparent 55%)',
            ].join(', '),
          }}
        />
        <div
          className="absolute inset-0 opacity-25 mix-blend-screen"
          style={{
            backgroundImage: [
              'linear-gradient(112deg, rgba(255, 255, 255, 0.04) 0, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
              'linear-gradient(208deg, rgba(255, 255, 255, 0.035) 0, rgba(255, 255, 255, 0.035) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '160px 160px',
          }}
        />
        <div
          className="absolute left-1/2 top-[-18%] h-[110vh] w-[160vw] -translate-x-1/2 rotate-3 rounded-[30rem] bg-gradient-to-r from-indigo-600/18 via-sky-500/10 to-transparent blur-3xl"
          style={{ maskImage: 'radial-gradient(circle at 50% 20%, rgba(0, 0, 0, 0.9), transparent 70%)' }}
        />
        <div
          className="absolute right-[-18%] top-[28%] h-[520px] w-[820px] -rotate-[10deg] rounded-[18rem] bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-indigo-500/12 blur-[100px]"
          style={{ maskImage: 'radial-gradient(circle at 70% 50%, black 0%, transparent 70%)' }}
        />
        <div
          className="absolute left-[-24%] bottom-[-20%] h-[680px] w-[820px] rotate-[16deg] rounded-[22rem] bg-gradient-to-tr from-purple-500/20 via-fuchsia-500/24 to-orange-500/14 blur-[120px]"
          style={{ maskImage: 'radial-gradient(circle at 35% 35%, black 0%, transparent 72%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.09) 0.5px, transparent 0.5px)',
            backgroundSize: '18px 18px',
            maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 70%)',
          }}
        />
        <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/20" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-300/15" />
      </div>

      <div className="layout-shell relative z-10 flex min-h-screen flex-col gap-8 px-6 py-16 sm:px-10">
        <Link
          href="/"
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          aria-label="Back to landing page"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 rotate-180">
            <path
              d="M5 12h12M13 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Home
        </Link>
        <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-[0_30px_120px_rgba(15,118,110,0.18)] backdrop-blur-xl">
          <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div className="overflow-hidden rounded-3xl border border-white/20 shadow-lg">
                <Image
                  src={avatarSrc}
                  alt={`Portrait of ${bio.name}`}
                  width={160}
                  height={160}
                  className="h-32 w-32 object-cover sm:h-36 sm:w-36"
                  priority
                  unoptimized={/^(?:https?:)/.test(avatarSrc)}
                />
              </div>
              {bio.location ? (
                <span className="rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
                  {bio.location}
                </span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <h1 className="text-3xl font-semibold sm:text-4xl">{bio.name}</h1>
                <p className="mt-1 text-base font-medium text-indigo-200">{bio.tagline}</p>
              </div>
              <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{bio.description}</p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 pb-10">
          {orderedLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition duration-200 ease-out hover:-translate-y-1 hover:border-white/40 hover:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                  <Image
                    src={link.icon}
                    alt={`${link.label} icon`}
                    width={56}
                    height={56}
                    className="h-12 w-12 object-contain"
                    style={link.iconTransform ? { transform: link.iconTransform } : undefined}
                    unoptimized={link.isRemoteIcon}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-white">{link.label}</span>
                  <span className="text-sm text-slate-300">{link.description}</span>
                </div>
              </div>
              <span className="hidden items-center gap-2 text-sm font-semibold text-indigo-200 transition group-hover:text-white sm:flex">
                Visit
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M5 12h12M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="h-5 w-5 text-indigo-200 transition sm:hidden"
              >
                <path
                  d="M5 12h12M13 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
