import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import path from 'path';
import { promises as fs } from 'fs';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

type ForceFieldLinks = {
  github?: { url: string; label: string }[];
  googleDrive?: { url: string; label: string }[];
  external?: { url: string; label: string }[];
};

type ForceFieldContent = {
  summary: string;
  descriptionMd: string;
  languages: string[];
  links: ForceFieldLinks;
  gallery: string[];
  heroImage: string;
};

const markdownComponents: Components = {
  h2: ({ node, ...props }) => (
    <h2 className="mt-10 text-2xl font-semibold text-sky-200 sm:text-3xl" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mt-5 text-base leading-relaxed text-slate-200 sm:text-lg" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-slate-200 sm:text-lg"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul
      className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-slate-200 sm:text-lg"
      {...props}
    />
  ),
  strong: ({ node, ...props }) => <strong className="text-sky-100" {...props} />,
};

async function getForceFieldContent(): Promise<ForceFieldContent> {
  const baseDir = path.join(process.cwd(), 'public', 'technical', 'data', '2ForceField');
  const [descriptionMd, languagesRaw, linksRaw] = await Promise.all([
    fs.readFile(path.join(baseDir, 'description.md'), 'utf-8'),
    fs.readFile(path.join(baseDir, 'languages.txt'), 'utf-8'),
    fs.readFile(path.join(baseDir, 'links.json'), 'utf-8'),
  ]);

  const summary = descriptionMd
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .slice(0, 1)[0]
    ?.replace(/\*\*/g, '') ?? '';

  const languages = languagesRaw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const links = JSON.parse(linksRaw) as ForceFieldLinks;

  let gallery: string[] = [];
  try {
    const mediaFiles = await fs.readdir(path.join(baseDir, 'media'));
    gallery = mediaFiles
      .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => `/technical/data/2ForceField/media/${file}`);
  } catch (error) {
    gallery = [];
  }

  return {
    summary,
    descriptionMd,
    languages,
    links,
    gallery,
    heroImage: '/technical/data/2ForceField/image.png',
  };
}

export const metadata: Metadata = {
  title: 'ForceField | Eoghan Collins',
  description: 'ForceField concussion detection platform overview, featuring sensor network design, app experience, and resources.',
};

export default async function ForceFieldPage() {
  const { summary, descriptionMd, languages, links, gallery, heroImage } = await getForceFieldContent();

  const linkGroups = [
    { title: 'GitHub', items: links.github, accent: 'from-sky-500/30 via-sky-500/10 to-transparent' },
    { title: 'Decks & Docs', items: links.googleDrive, accent: 'from-emerald-500/25 via-emerald-500/10 to-transparent' },
    { title: 'External', items: links.external, accent: 'from-indigo-500/25 via-indigo-500/10 to-transparent' },
  ];

  const featuredGallery = gallery.slice(0, 8);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050c1e] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050c1e] via-[#0a1a3a] to-[#030712]" />
        <div className="absolute left-[-20%] top-[10%] h-[520px] w-[720px] rounded-[20rem] bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.35),_transparent_70%)] blur-[120px]" />
        <div className="absolute right-[-15%] top-[40%] h-[460px] w-[680px] rounded-[18rem] bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.28),_transparent_70%)] blur-[110px]" />
        <div className="absolute left-1/2 top-[78%] h-[380px] w-[720px] -translate-x-1/2 rounded-[12rem] bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.18),_transparent_72%)] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.28] mix-blend-soft-light"
          style={{
            backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '110px 110px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10">
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

        <section className="grid gap-12 rounded-3xl border border-white/10 bg-white/[0.04] p-10 shadow-[0_40px_140px_rgba(15,118,210,0.25)] backdrop-blur-2xl lg:grid-cols-[1.2fr_1fr] lg:p-14">
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-200/80">
              Impact Sensing Platform
            </span>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">ForceField</h1>
            <p className="text-lg leading-relaxed text-slate-200 sm:text-xl">
              {summary || 'ForceField is a concussion-aware sensing system developed through the Patch 2024 Youth Accelerator.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <span
                  key={language}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/70"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(59,130,246,0.35)]">
            <Image
              src={heroImage}
              alt="ForceField helmet sensor visualization"
              width={960}
              height={720}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-10">
            <h2 className="text-3xl font-semibold text-sky-100 sm:text-4xl">Product Narrative</h2>
            <ReactMarkdown components={markdownComponents}>
              {descriptionMd.replace('# ForceField\n', '')}
            </ReactMarkdown>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-10">
              <h2 className="text-2xl font-semibold text-sky-100 sm:text-3xl">Project Resources</h2>
              <div className="mt-6 flex flex-col gap-6">
                {linkGroups.map(({ title, items, accent }) =>
                  items && items.length > 0 ? (
                    <div
                      key={title}
                      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-5`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{title}</p>
                      <ul className="mt-3 space-y-2 text-sm sm:text-base">
                        {items.map((item) => (
                          <li key={item.url}>
                            <Link
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group inline-flex items-center gap-2 text-sky-100 transition hover:text-white"
                            >
                              <span>{item.label}</span>
                              <svg
                                viewBox="0 0 24 24"
                                aria-hidden
                                className="h-4 w-4 text-white/70 transition group-hover:translate-x-1 group-hover:text-white"
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
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                )}
              </div>
            </div>

            {featuredGallery.length > 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-10">
                <h2 className="text-2xl font-semibold text-sky-100 sm:text-3xl">Gallery</h2>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {featuredGallery.map((image) => (
                    <div
                      key={image}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/10"
                    >
                      <Image
                        src={image}
                        alt="ForceField project media"
                        width={320}
                        height={240}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
