import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-heading text-5xl text-white">Page not found</h1>
      <p className="mt-4 text-white/70">That page does not exist on the St. Rita&apos;s site.</p>
      <div className="mt-8 flex justify-center">
        <Button href="/">Home</Button>
      </div>
    </section>
  );
}
