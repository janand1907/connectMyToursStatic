"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ItineraryTimeline from "@/components/shared/ItineraryTimeline";
import { indiaDestinations } from "@/data/indiaDestinations";
import { itineraryPresets } from "@/data/itineraryPresets";
import { siteConfig } from "@/config/site";

let nextStopId = 0;

const presetsByCategory = itineraryPresets.reduce((acc, preset) => {
  (acc[preset.category] ||= []).push(preset);
  return acc;
}, {});

function buildItineraryDays(startCity, stops) {
  const days = [];
  let dayNum = 1;
  let buffer = [];
  let lastLocation = startCity || null;
  let isFirstDay = true;

  stops.forEach((stop, index) => {
    buffer.push(stop);
    const isLastStop = index === stops.length - 1;

    if (stop.nights > 0 || isLastStop) {
      const citiesToday = buffer.map((s) => s.city);
      const from = lastLocation || "your starting point";

      const title = `Day ${dayNum} · ${isFirstDay ? `${startCity ? `${startCity} → ` : "Arrival → "}` : `${from} → `}${citiesToday.join(" → ")}`;

      let description =
        citiesToday.length > 1
          ? `Travel from ${from}, covering ${citiesToday.join(", ")} in a single day`
          : `Travel from ${from} to ${stop.city}`;

      if (stop.nights > 0) {
        description += ` and check in for the night at ${stop.city}.`;
      } else if (isLastStop) {
        description += startCity ? `. Return to ${startCity} the same day.` : ". Head to your onward transport the same day.";
      } else {
        description += ".";
      }

      days.push({ label: title, items: [{ title: citiesToday.join(" & "), description }] });
      dayNum++;
      buffer = [];
      lastLocation = stop.city;
      isFirstDay = false;

      for (let n = 1; n < stop.nights; n++) {
        days.push({
          label: `Day ${dayNum} · ${stop.city}`,
          items: [
            {
              title: stop.city,
              description:
                n === 1
                  ? `Full day at leisure for sightseeing around ${stop.city}.`
                  : `Additional day at leisure around ${stop.city}.`,
            },
          ],
        });
        dayNum++;
      }
    }
  });

  const lastStop = stops[stops.length - 1];
  if (lastStop.nights > 0) {
    days.push({
      label: `Day ${dayNum} · ${lastStop.city} → Departure`,
      items: [
        {
          title: "Departure",
          description: startCity
            ? `Check out and travel back to ${startCity}, or transfer directly to the airport/railway station for your onward journey.`
            : `Check out and transfer to the airport/railway station for your onward journey.`,
        },
      ],
    });
  }

  return days;
}

export default function ItineraryPlanner() {
  const [startCity, setStartCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [stops, setStops] = useState([]);

  const itineraryDays = useMemo(
    () => (stops.length > 0 ? buildItineraryDays(startCity.trim(), stops) : []),
    [startCity, stops]
  );

  const totalNights = stops.reduce((sum, s) => sum + s.nights, 0);
  const totalDays = itineraryDays.length > 0 ? itineraryDays.length : stops.length > 0 ? 1 : 0;

  const mapSrc = useMemo(() => {
    if (stops.length === 0) return null;
    const waypoints = stops.map((s) => s.city);
    const origin = startCity.trim() || waypoints[0];
    return `https://www.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${waypoints
      .map(encodeURIComponent)
      .join("+to:")}&output=embed`;
  }, [startCity, stops]);

  const routeLabel = stops.map((s) => (s.nights > 0 ? `${s.city} (${s.nights}N)` : s.city)).join(" → ");
  const whatsappMessage =
    stops.length > 0
      ? [
          "Hi, I'd like a custom India itinerary:",
          `${startCity.trim() ? `${startCity.trim()} → ` : ""}${routeLabel}`,
          `${totalDays} Days / ${totalNights} Nights`,
        ].join("\n")
      : "Hi, I'd like help planning a custom India itinerary.";

  function applyPreset(preset) {
    setStartCity(preset.startCity || "");
    setStops(preset.stops.map((s) => ({ id: nextStopId++, city: s.city, nights: s.nights })));
  }

  function addStop() {
    const city = cityInput.trim();
    if (!city) return;
    setStops((prev) => [...prev, { id: nextStopId++, city, nights: 1 }]);
    setCityInput("");
  }

  function removeStop(id) {
    setStops((prev) => prev.filter((s) => s.id !== id));
  }

  function moveStop(index, direction) {
    setStops((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function adjustNights(id, delta) {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, nights: Math.max(0, Math.min(14, s.nights + delta)) } : s))
    );
  }

  return (
    <section className="container-page py-14">
      <h2 className="section-heading text-center">Build Your India Itinerary</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
        Add any city in India as a stop, set nights at each (or leave it at 0 for a same-day visit), and
        we&apos;ll put together a day-by-day plan and route map you can share with a coordinator.
      </p>

      <div className="mx-auto mt-10 max-w-3xl">
        <h3 className="font-display text-lg font-semibold text-primary-900">Suggested Itineraries</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Start from a template below, then add, remove or adjust stops as you like.
        </p>
        <div className="mt-4 space-y-5">
          {Object.entries(presetsByCategory).map(([category, presets]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-600">{category}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-xl border-2 border-neutral-200 bg-white p-4 text-left transition hover:border-primary-400 hover:bg-primary-50"
                  >
                    <span className="block font-display font-semibold text-primary-900">{preset.label}</span>
                    <span className="mt-1 block text-sm text-neutral-500">{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <label className="block text-sm font-medium text-neutral-600" htmlFor="planner-start-city">
          Starting city (optional)
        </label>
        <input
          id="planner-start-city"
          type="text"
          list="planner-city-suggestions"
          value={startCity}
          onChange={(e) => setStartCity(e.target.value)}
          placeholder="e.g. Chennai"
          className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-800 focus:border-primary-500 focus:outline-none"
        />

        <label className="mt-6 block text-sm font-medium text-neutral-600" htmlFor="planner-add-city">
          Add a destination
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="planner-add-city"
            type="text"
            list="planner-city-suggestions"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addStop();
              }
            }}
            placeholder="Type any city in India"
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-800 focus:border-primary-500 focus:outline-none"
          />
          <button type="button" onClick={addStop} className="btn-primary shrink-0">
            Add
          </button>
        </div>
        <datalist id="planner-city-suggestions">
          {indiaDestinations.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>

      {stops.length > 0 && (
        <div className="mx-auto mt-6 max-w-2xl space-y-3">
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-primary-500 bg-primary-50 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => moveStop(index, -1)}
                    disabled={index === 0}
                    className="leading-none text-neutral-500 disabled:opacity-20"
                    aria-label={`Move ${stop.city} earlier`}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStop(index, 1)}
                    disabled={index === stops.length - 1}
                    className="leading-none text-neutral-500 disabled:opacity-20"
                    aria-label={`Move ${stop.city} later`}
                  >
                    ▼
                  </button>
                </span>
                <span className="font-display font-semibold text-primary-900">{stop.city}</span>
              </div>

              <span className="flex items-center gap-4">
                <span className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2 text-sm">
                  <span className="font-medium text-neutral-600">
                    {stop.nights === 0 ? "Same day" : "Nights"}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustNights(stop.id, -1)}
                    disabled={stop.nights <= 0}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 disabled:opacity-30"
                    aria-label={`Decrease nights at ${stop.city}`}
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-semibold text-primary-800">{stop.nights}</span>
                  <button
                    type="button"
                    onClick={() => adjustNights(stop.id, 1)}
                    disabled={stop.nights >= 14}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 disabled:opacity-30"
                    aria-label={`Increase nights at ${stop.city}`}
                  >
                    +
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => removeStop(stop.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                  aria-label={`Remove ${stop.city}`}
                >
                  Remove
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {stops.length === 0 ? (
        <p className="mx-auto mt-10 max-w-md text-center text-sm text-neutral-500">
          Add at least one destination above, or pick a suggested itinerary, to generate your plan.
        </p>
      ) : (
        <>
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-3 rounded-xl bg-primary-50 px-5 py-4 text-center">
            <span className="font-display text-lg font-bold text-primary-900">
              {totalDays} Days / {totalNights} Nights
            </span>
            <span className="text-sm text-neutral-500">
              {startCity.trim() ? `${startCity.trim()} → ` : ""}
              {routeLabel}
            </span>
          </div>

          <ItineraryTimeline heading="Your Day-by-Day Plan" days={itineraryDays} />

          <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-neutral-200 shadow-soft">
            <iframe
              key={mapSrc}
              title="Itinerary route map"
              src={mapSrc}
              className="h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 text-center">
            <p className="text-sm text-neutral-600">
              Like this plan? Send it to a coordinator to confirm hotels, transfers and dates.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                Send via WhatsApp
              </a>
              <Link href="/contact-us" className="btn-secondary">
                Enquire Now
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
