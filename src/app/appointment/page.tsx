"use client";

import { useState } from "react";
import { CalendarIcon, GemIcon, WhatsappIcon } from "@/components/icons";
import { BRAND } from "@/lib/content";

export default function AppointmentPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    message: "",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
      setForm({ name: "", email: "", phone: "", preferredDate: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8">
      <div>
        <p className="eyebrow">Private Consultation</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight font-light text-ink">
          Book an
          <span className="block font-script text-5xl rose-gradient-text">
            Appointment
          </span>
        </h1>
        <span className="hairline mt-5 block w-20" />
        <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-soft">
          Spend an hour with our styling team — in studio or over video — to
          choose the pieces that suit you, plan a gift, or design something
          entirely bespoke for a wedding or milestone.
        </p>

        <ul className="mt-8 space-y-4 text-sm text-ink-soft">
          <li className="flex items-start gap-3">
            <GemIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
            One-to-one styling with our in-house jewellery consultant.
          </li>
          <li className="flex items-start gap-3">
            <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
            Tuesday to Saturday, 11am – 7pm PKT.
          </li>
          <li className="flex items-start gap-3">
            <WhatsappIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
            Prefer to chat? {BRAND.phone}
          </li>
        </ul>

        <div className="mt-10 overflow-hidden rounded-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/banner-gift.jpg"
            alt="Signature blush packaging"
            className="h-56 w-full object-cover"
          />
        </div>
      </div>

      <form
        onSubmit={submit}
        className="h-fit rounded-sm border border-line bg-cream p-8"
      >
        <h2 className="font-serif text-2xl text-ink">Request your slot</h2>
        <div className="mt-6 space-y-5">
          {[
            { key: "name", label: "Full name", type: "text", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "phone", label: "Phone / WhatsApp", type: "tel", required: false },
            {
              key: "preferredDate",
              label: "Preferred date",
              type: "date",
              required: false,
            },
          ].map((field) => (
            <label key={field.key} className="block">
              <span className="text-[0.66rem] tracking-[0.18em] uppercase text-muted">
                {field.label}
                {field.required ? " *" : ""}
              </span>
              <input
                type={field.type}
                required={field.required}
                value={form[field.key as keyof typeof form]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm text-ink outline-none transition focus:border-rose"
              />
            </label>
          ))}
          <label className="block">
            <span className="text-[0.66rem] tracking-[0.18em] uppercase text-muted">
              What are you looking for?
            </span>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm text-ink outline-none transition focus:border-rose"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-8 w-full rounded-sm bg-gradient-to-r from-rose-deep to-rose px-8 py-4 text-[0.7rem] tracking-[0.24em] uppercase text-cream transition hover:from-rose hover:to-rose-deep disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Request appointment"}
        </button>

        {status === "done" && (
          <p className="mt-4 text-sm text-rose-deep">
            Thank you — we will confirm your appointment within one working day.
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 text-sm text-rose-deep">
            Something went wrong. Please try again or call us directly.
          </p>
        )}
      </form>
    </div>
  );
}
