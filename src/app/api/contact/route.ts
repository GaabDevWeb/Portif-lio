import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = contactSchema.parse(await request.json());

    const webhook = process.env.CONTACT_WEBHOOK_URL;
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "root-os-mail",
          ...body,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return Response.json({ ok: true, message: "Message queued." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { ok: false, errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return Response.json({ ok: false, message: "Internal error" }, { status: 500 });
  }
}
