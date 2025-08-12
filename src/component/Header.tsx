import React from "react";
import { FiSmile } from "react-icons/fi";

export default function Header(): JSX.Element {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiSmile className="text-2xl text-yellow-300" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Meme Generator
          </h1>
        </div>
        <p className="text-sm md:text-base font-medium text-purple-200">
          Create & Customize Memes
        </p>
      </div>
    </header>
  );
}
