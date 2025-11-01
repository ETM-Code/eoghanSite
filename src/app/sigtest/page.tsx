import { promises as fs } from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import SignatureTester from './SignatureTester';

export const metadata: Metadata = {
  title: 'Signature Animation Test',
  description: 'Playground for iterating on the signature drawing animation.',
};

type SignatureData = {
  viewBox: string;
  paths: string[];
  bounds: {
    minX: number;
    minY: number;
    width: number;
    height: number;
  };
};

async function loadSignatureSvg(): Promise<SignatureData> {
  const svgPath = path.join(process.cwd(), 'public', 'signatures', 'signature.svg');
  const raw = await fs.readFile(svgPath, 'utf-8');

  const viewBoxMatch = raw.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 800 400';
  const [minX = 0, minY = 0, width = 800, height = 400] = viewBox.split(/[ ,]+/).map(Number);

  const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/gi;
  const paths: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pathRegex.exec(raw)) !== null) {
    paths.push(match[1]);
  }

  return {
    viewBox,
    paths,
    bounds: { minX, minY, width, height },
  };
}

export default async function SigTestPage() {
  const signature = await loadSignatureSvg();

  return (
    <div className="min-h-screen bg-black text-white">
      <SignatureTester signature={signature} />
    </div>
  );
}
