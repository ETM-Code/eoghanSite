// app/contact/page.tsx
"use client";

import ContactPage from './ContactPage';
import Script from 'next/script';

export default function Contact() {
  return (
    <>
      <ContactPage />
      <Script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js" strategy="beforeInteractive" />
      <Script id="google-forms-script" strategy="afterInteractive">
        {`
          var submitted = false;
          $('#gform').on('submit', function(e) {
            $('#gform *').fadeOut(2000);
            $('#gform').prepend('Your submission has been processed...');
          });
        `}
      </Script>
    </>
  );
}