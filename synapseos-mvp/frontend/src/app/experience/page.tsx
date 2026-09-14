import { redirect } from 'next/navigation';

// The cinematic experience is now embedded in the main page.
// This redirect ensures old links still work.
export default function ExperienceRedirect() {
  redirect('/');
}
