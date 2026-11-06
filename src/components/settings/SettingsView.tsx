"use client";

import { useMemo, useState, type ReactNode } from "react";
import { TEMPLATE_META, TEMPLATE_VARIABLES, TIMEZONES } from "@/lib/constants";
import { renderTemplate } from "@/lib/followups";
import { useStore } from "@/lib/store/store";
import type { ClinicSettings, TemplateKey } from "@/lib/types";
import { Button } from "../ui/Button";
import { Field, Select, TextArea, TextInput, Toggle } from "../ui/Field";
import { FilterTabs } from "../ui/FilterTabs";
import { Icon } from "../ui/Icon";
import { WhatsAppPreview } from "./WhatsAppPreview";

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200/80 p-5">
      <h2 className="font-display text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SettingsView() {
  const { settings, saveSettings } = useStore();
  const [draft, setDraft] = useState<ClinicSettings>(settings);
  const [template, setTemplate] = useState<TemplateKey>("reminder24h");
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  const setWhatsapp = <K extends keyof ClinicSettings["whatsapp"]>(key: K, value: ClinicSettings["whatsapp"][K]) =>
    setDraft((d) => ({ ...d, whatsapp: { ...d.whatsapp, [key]: value } }));

  const previewText = renderTemplate(draft.templates[template], {
    patient_name: "Clara",
    date: "Tomorrow, Oct 25",
    time: "10:00 AM",
    provider: "Dr. Sarah Jenkins",
    clinic: draft.clinicName || "your clinic",
  });

  const save = async () => {
    setSaving(true);
    try {
      await saveSettings(draft);
    } finally {
      setSaving(false);
    }
  };

  const automationOff = !draft.whatsapp.enabled;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 flex flex-col gap-6">
        <Card title="Clinic profile" description="Shown in messages and in the sidebar.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Clinic name" htmlFor="st-clinic">
              <TextInput
                id="st-clinic"
                value={draft.clinicName}
                onChange={(e) => setDraft((d) => ({ ...d, clinicName: e.target.value }))}
              />
            </Field>
            <Field label="Timezone" htmlFor="st-tz" hint="Reminder times follow this timezone.">
              <Select id="st-tz" value={draft.timezone} onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))}>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace("_", " ")}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="WhatsApp automation" description="Controls when reminders are sent to patients who gave consent.">
          <div className="divide-y divide-slate-100 -my-3">
            <Toggle
              label="Enable WhatsApp reminders"
              description="Master switch for all automated messages."
              checked={draft.whatsapp.enabled}
              onChange={(v) => setWhatsapp("enabled", v)}
            />
            <Toggle
              label="24-hour reminder"
              description="Sent the day before the visit."
              checked={draft.whatsapp.reminder24h}
              disabled={automationOff}
              onChange={(v) => setWhatsapp("reminder24h", v)}
            />
            <Toggle
              label="2-hour reminder"
              description="Sent two hours before the visit."
              checked={draft.whatsapp.reminder2h}
              disabled={automationOff}
              onChange={(v) => setWhatsapp("reminder2h", v)}
            />
            <Toggle
              label="Auto re-engage no-shows"
              description="Offer to reschedule when a visit is missed."
              checked={draft.whatsapp.autoReengage}
              disabled={automationOff}
              onChange={(v) => setWhatsapp("autoReengage", v)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Field label="Quiet hours start" htmlFor="st-qs" hint="No messages are sent between these times.">
              <TextInput
                id="st-qs"
                type="time"
                value={draft.whatsapp.quietHoursStart}
                disabled={automationOff}
                onChange={(e) => setWhatsapp("quietHoursStart", e.target.value)}
              />
            </Field>
            <Field label="Quiet hours end" htmlFor="st-qe">
              <TextInput
                id="st-qe"
                type="time"
                value={draft.whatsapp.quietHoursEnd}
                disabled={automationOff}
                onChange={(e) => setWhatsapp("quietHoursEnd", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card title="Message templates" description="Edit the wording. Variables are filled in per patient.">
          <div className="flex flex-col gap-4">
            <FilterTabs<TemplateKey>
              ariaLabel="Template"
              value={template}
              onChange={setTemplate}
              tabs={(Object.keys(TEMPLATE_META) as TemplateKey[]).map((k) => ({ value: k, label: TEMPLATE_META[k].label }))}
            />
            <Field label={TEMPLATE_META[template].description} htmlFor="st-template">
              <TextArea
                id="st-template"
                rows={4}
                value={draft.templates[template]}
                onChange={(e) => setDraft((d) => ({ ...d, templates: { ...d.templates, [template]: e.target.value } }))}
              />
            </Field>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_VARIABLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({ ...d, templates: { ...d.templates, [template]: `${d.templates[template]} {{${v}}}` } }))
                  }
                  className="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
        <Card title="Live preview" description="How the selected template looks on the patient's phone.">
          <WhatsAppPreview text={previewText} actions={template === "reminder2h" ? [] : template === "missed" ? ["Reschedule"] : ["Confirm", "Reschedule"]} />
        </Card>

        <Card title="WhatsApp connection">
          <dl className="divide-y divide-slate-100 text-xs">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500">Provider</dt>
              <dd className="font-medium text-slate-900">Twilio WhatsApp</dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium text-amber-700 flex items-center gap-1.5">
                <Icon name="construction" className="text-sm" /> Demo data, not connected
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-slate-500">Credits</dt>
              <dd className="font-medium text-slate-900 tabular-nums">{settings.creditsRemaining.toLocaleString("en-US")}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
            Credentials are never entered in the browser. The Twilio connection is configured server-side in the integration phase.
          </p>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" disabled={!dirty || saving} onClick={() => setDraft(settings)}>
            Discard
          </Button>
          <Button icon="save" disabled={!dirty || saving} onClick={() => void save()}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
