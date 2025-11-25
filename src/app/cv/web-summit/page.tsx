import type { Metadata } from 'next';

const pdfPath = '/cvs/cv_web_summit_careers.pdf';

export const metadata: Metadata = {
  title: 'Web Summit Careers CV',
  description: 'View the Web Summit Careers CV.',
};

export default function WebSummitCareersCVPage() {
  return (
    <iframe
      src={pdfPath}
      title="Web Summit Careers CV"
      className="w-screen h-screen"
      style={{ border: 'none' }}
    />
  );
}

