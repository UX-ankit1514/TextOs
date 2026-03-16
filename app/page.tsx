'use client';

import { useState } from "react";
import Screen1Landing from "../components/components/Screen1Landing";
import { Screen2Creator } from "../components/components/Screen2Creator";
import { Screen3Postcard } from "../components/components/Screen3Postcard";

export default function Page() {
  const [step, setStep] = useState(1);
  const [alphabetData, setAlphabetData] = useState<Record<string, string>>({});

  const handleUpdateLetter = (letter: string, dataUrl: string) => {
    setAlphabetData((prev) => ({ ...prev, [letter]: dataUrl }));
  };

  const handleStart = () => setStep(2);
  const handleEnter = () => setStep(3);
  const handleBackToLanding = () => setStep(1);
  const handleBackToCreator = () => setStep(2);
  const handleRestart = () => {
    setAlphabetData({});
    setStep(1);
  };

  return (
    <main className="min-h-screen">
      {step === 1 && <Screen1Landing onStart={handleStart} />}
      {step === 2 && (
        <Screen2Creator
          alphabetData={alphabetData}
          onUpdateLetter={handleUpdateLetter}
          onEnter={handleEnter}
          onBack={handleBackToLanding}
        />
      )}
      {step === 3 && (
        <Screen3Postcard
          alphabetData={alphabetData}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}