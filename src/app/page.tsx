"use client";

import { useEffect } from "react";
import Image from "next/image";
import './cssEffects/decodeText/decodeTextCSS.css';
// import './cssEffects/neon/neonImage.css'
import './cssEffects/neon2/neonImage.css'
import Typewriter from './cssEffects/typewriter/Typewriter'; // Import the Typewriter component
import { decodeText } from "./cssEffects/decodeText/decodeTextTS";
import './cssEffects/noiseGround/noiseGround.css'
import { noise } from "./cssEffects/noiseGround/noiseGround"

export default function Home() {

  useEffect(() => {
    decodeText(); // Run the decodeText function after the component mounts
    noise();
  }, []);

  return (
    <main className="flex min-h-screen w-full fixed"> {/*bg-gradient-to-t from-white to-gray-900*/}
      <img src="/wall.jpg" alt="background image" className="min-h-screen w-full fixed -z-10 filter brightness-50"></img>
      <canvas id="noise" className="noise"></canvas>
      <div className = "items-center justify-between p-24">
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
        <div className="text-white p-10"> {/*Typewriter Text*/}
          <Typewriter text="Engineer. Programmer. Artist. Inventor." />
        </div>
        <div className="neon-image-container flex justify-between w-full">
          <div className="neon-image-wrapper">
            <Image
              src="/neoni/tech.svg"
              alt="Neon Effect Image"
              width={300}
              height={300}
              objectFit="contain"
              className="neon-image"
            />
          </div>
          <div className="neon-image-wrapper">
            <Image
              src="/neoni/create.svg"
              alt="Neon Effect Image"
              width={300}
              height={300}
              objectFit="contain"
              className="neon-image"
            />
          </div>
          <div className="neon-image-wrapper">
            <Image
              src="/neoni/freelance.svg"
              alt="Neon Effect Image"
              width={300}
              height={300}
              objectFit="contain"
              className="neon-image"
            />
          </div>
          <div className="neon-image-wrapper">
            <Image
              src="/neoni/contact.svg"
              alt="Neon Effect Image"
              width={300}
              height={300}
              objectFit="contain"
              className="neon-image"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
