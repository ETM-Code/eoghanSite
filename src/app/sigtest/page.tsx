import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import SignatureTester from './SignatureTester';

export const metadata: Metadata = {
  title: 'Signature Animation Test',
  description: 'Playground for iterating on the signature drawing animation.',
};

async function loadSignatureSvg(): Promise<{ viewBox: string; paths: string[] }> {
  const svgPath = path.join(process.cwd(), 'public', 'signatures', 'signature.svg');
  const raw = await fs.readFile(svgPath, 'utf-8');

  const viewBoxMatch = raw.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 800 400';

  const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/gi;
  const paths: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pathRegex.exec(raw)) !== null) {
    paths.push(match[1]);
  }

  return { viewBox, paths };
}

export default async function SigTestPage() {
  const signature = await loadSignatureSvg();

  return (
    <div className="min-h-screen bg-black text-white">
      <SignatureTester signature={signature} />
    </div>
  );
}
