'use client';

import PageTransition from '@/components/ui/PageTransition';
import AlphabetGrid from '@/components/creator/AlphabetGrid';

export default function CreatePage() {
  return (
    <PageTransition className="page-container">
      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AlphabetGrid />
      </main>
    </PageTransition>
  );
}
