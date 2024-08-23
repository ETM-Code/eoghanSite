"use client";

import { useEffect } from "react";
import Image from "next/image";
import './cssEffects/decodeText/decodeTextCSS.css';
import { decodeText } from "./cssEffects/decodeText/decodeTextTS";

export default function Home() {

  useEffect(() => {
    decodeText(); // Run the decodeText function after the component mounts
  }, []);

  return (
    <main className="flex min-h-screen">
      <div className="min-h-screen w-full fixed bg-gradient-to-t from-gray-950 to-black"></div>
      <div className = "flex-col items-center justify-between p-24">
        <div className="decode-text">
          <div className="text-animation">E</div>
          <div className="text-animation">o</div>
          <div className="text-animation">g</div>
          <div className="text-animation">h</div>
          <div className="text-animation">a</div>
          <div className="text-animation">n</div>

          <div className="space"></div>
          <div className="space"></div>

          <div className="text-animation">c</div>
          <div className="text-animation">o</div>
          <div className="text-animation">l</div>
          <div className="text-animation">l</div>
          <div className="text-animation">i</div>
          <div className="text-animation">n</div>
          <div className="text-animation">s</div>
          <div className="space"></div>
        </div>
      </div>

      {/* <a id="refresh" onClick={() => decodeText()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
      </a> */}

    </main>
  );
}
