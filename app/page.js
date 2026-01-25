import BookingSystem from "./components/Layout/BookingSystem";
import Hero from "./components/Layout/Hero";
import PlatformLanding from "./components/Layout/PlatformLanding";
import { getTenant } from "../lib/tenant";

export default async function Home() {
  const tenant = await getTenant();

  if (!tenant) {
    return <PlatformLanding />;
  }

  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{tenant.name} - Booking Portal</h1>
        <BookingSystem />
      </div>
    </>
  );
}
