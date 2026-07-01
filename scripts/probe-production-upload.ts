const BASE = "https://chlifews-landing.vercel.app";
const cookie = "admin_session=authenticated";

async function uploadOverview(size: number): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);

  const buf = Buffer.alloc(size, 0xff);
  const blob = new Blob([buf], { type: "image/jpeg" });
  const form = new FormData();
  form.set("operation", "overview");
  form.set("section_title", "size-test");
  form.set("description", "x");
  form.set("info_cards", "[]");
  form.set("image", blob, "test.jpg");

  try {
    const res = await fetch(`${BASE}/api/admin/project-content`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: form,
      signal: controller.signal,
    });
    const text = await res.text();
    console.log(`overview+image ${size}B -> ${res.status} ${res.headers.get("content-type")}`);
    console.log(text.slice(0, 400));
  } catch (e) {
    console.log(`overview+image ${size}B -> ERROR`, e);
  } finally {
    clearTimeout(timer);
  }
}

async function uploadHero(size: number): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  const blob = new Blob([Buffer.alloc(size, 0xff)], { type: "image/jpeg" });
  const form = new FormData();
  form.set("file", blob, "hero.jpg");

  try {
    const res = await fetch(`${BASE}/api/admin/hero-background`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: form,
      signal: controller.signal,
    });
    const text = await res.text();
    console.log(`hero ${size}B -> ${res.status} ${res.headers.get("content-type")}`);
    console.log(text.slice(0, 400));
  } catch (e) {
    console.log(`hero ${size}B -> ERROR`, e);
  } finally {
    clearTimeout(timer);
  }
}

async function main(): Promise<void> {
  await uploadOverview(50_000);
  await uploadHero(50_000);
  await uploadOverview(4_500_000);
}

main();
