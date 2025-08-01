"use client";

import Link from "next/link";

import { GithubIcon } from "./Icons";

export default function NavBar() {
  return (
    <>
      <div className="flex flex-row justify-between items-center w-[1000px] m-auto p-4">
        <div className="flex flex-row items-center gap-4">
          <Link href="https://www.mientrerios.gob.ar/" target="_blank">
            <img
              alt="Mi Entre Rios"
              className="w-25 h-20"
              src="/MiER-Cuadrado.svg"
            />
          </Link>
          <div className="bg-gradient-to-br from-lime-300 to-lime-600 bg-clip-text">
            <p className="text-xl font-semibold text-transparent">
             Demo JUJO Interactivo - Mi Entre Rios
            </p>
          </div>
        </div>
        <div className="flex flex-row items-center gap-6">
          <Link
            href="https://labs.heygen.com/interactive-avatar"
            target="_blank"
          >
            Avatars
          </Link>
          <Link
            href="https://docs.heygen.com/reference/list-voices-v2"
            target="_blank"
          >
            Voices
          </Link>
          <Link
            href="https://docs.heygen.com/reference/new-session-copy"
            target="_blank"
          >
            API Docs
          </Link>
          <Link
            href="https://help.heygen.com/en/articles/9182113-interactive-avatar-101-your-ultimate-guide"
            target="_blank"
          >
            Guide
          </Link>
          <Link
            aria-label="Github"
            className="flex flex-row justify-center gap-1 text-foreground"
            href="https://github.com/HeyGen-Official/StreamingAvatarSDK"
            target="_blank"
          >
            <GithubIcon className="text-default-500" />
            SDK
          </Link>
        </div>
      </div>
    </>
  );
}
