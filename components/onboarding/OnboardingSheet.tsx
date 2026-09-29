"use client";

import LocationStep from "./LocationStep";
import ProfileFields from "./ProfileFields";
import Drawer from "@/components/home/Drawer";
import { useOnboardingForm } from "./form-state";

interface Props {
  defaultLng: number;
  defaultLat: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function OnboardingSheet({ defaultLng, defaultLat, onClose, onCreated }: Props) {
  const s = useOnboardingForm(defaultLng, defaultLat, onCreated);
  return (
    <Drawer onClose={onClose} label="Add yourself to the map" size="md">
      <div className="p-5 pt-3">
        <div className="pr-10">
          <p className="text-[17px] font-bold text-slate-900">Add yourself to the map</p>
          <p className="mt-0.5 text-[13px] text-slate-500">30 seconds. No account, no password.</p>
        </div>
        <div className="mt-4 space-y-3">
          <ProfileFields form={s.form} set={s.set} />
          <LocationStep
            city={s.form.city}
            setCity={(v) => s.set("city", v)}
            locNote={s.locNote}
            locLabel={s.locLabel}
            lng={s.lng}
            lat={s.lat}
            geoBusy={s.geoBusy}
            onLocate={s.useMyLocation}
            onPick={s.pickPlace}
          />
          {s.error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-[13px] font-medium text-rose-700">{s.error}</p>
          )}
          <button
            onClick={s.submit}
            disabled={s.busy}
            className="w-full rounded-2xl bg-slate-900 py-3.5 text-[15px] font-bold text-white shadow-lg active:scale-[0.98] disabled:opacity-60"
          >
            {s.busy ? "Adding you…" : "Add me to the map →"}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
