import AdminButton from "./AdminButton";
import AdminFormGroup from "./AdminFormGroup";
import { inputClass, selectClass } from "./admin-fields";

export default function PublishPanel({ values, errors, update, busy, save }) {
  return (
    <div className="space-y-5">
      <AdminFormGroup label="Status" htmlFor="post-status" error={errors.status} hint="Drafts and archived posts are hidden from public blog queries.">
        <select id="post-status" name="status" value={values.status} onChange={(event) => update("status", event.target.value)} className={selectClass}>
          <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
        </select>
      </AdminFormGroup>
      <AdminFormGroup label="Published date" htmlFor="post-published-at" error={errors.publishedAt} hint="Optional. First publication date is set automatically if blank. Future scheduling is not available.">
        <input id="post-published-at" name="publishedAt" type="datetime-local" value={values.publishedAt} onChange={(event) => update("publishedAt", event.target.value)} className={inputClass} />
      </AdminFormGroup>
      <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-5">
        <AdminButton type="button" disabled={busy} onClick={() => save("draft")} variant="secondary">Save draft</AdminButton>
        <AdminButton type="button" disabled={busy} onClick={() => save("published")}>Publish</AdminButton>
        <AdminButton type="button" disabled={busy} onClick={() => save("archived")} variant="danger">Archive</AdminButton>
        <AdminButton type="submit" disabled={busy} variant="secondary">{busy ? "Saving…" : "Save current status"}</AdminButton>
      </div>
    </div>
  );
}
