"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminCard from "./AdminCard";
import AdminButton from "./AdminButton";
import AdminFormGroup from "./AdminFormGroup";
import AdminNotice from "./AdminNotice";
import { inputClass, selectClass, textareaClass, slugify, requestJson } from "./admin-fields";

const blank = { name: "", slug: "", description: "", metaTitle: "", metaDescription: "", status: "active" };

export default function CategoryForm({ category = null }) {
  const router = useRouter();
  const [values, setValues] = useState(category || blank);
  const [slugEdited, setSlugEdited] = useState(Boolean(category));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value, ...(name === "name" && !slugEdited ? { slug: slugify(value) } : {}) }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setErrors({});
    try {
      const result = await requestJson(category ? `/api/admin/blog/categories/${category.id}` : "/api/admin/blog/categories", category ? "PATCH" : "POST", values);
      if (category) {
        setMessage("Category saved.");
        router.refresh();
      } else router.push(`/admin/blog/categories/${result.id}/edit`);
    } catch (failure) {
      setErrors(failure.fields || {});
      setMessage(failure.message);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <AdminNotice message={message} tone={message === "Category saved." ? "success" : "error"} />
      <AdminCard title="Category details">
        <div className="grid gap-5 sm:grid-cols-2">
          <AdminFormGroup label="Name" htmlFor="category-name" required error={errors.name}>
            <input id="category-name" name="name" required maxLength={160} value={values.name} onChange={(event) => update("name", event.target.value)} className={inputClass} />
          </AdminFormGroup>
          <AdminFormGroup label="Slug" htmlFor="category-slug" required error={errors.slug} hint="Lowercase letters, numbers and hyphens. Keep this stable after publishing.">
            <input id="category-slug" name="slug" required maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={values.slug} onChange={(event) => { setSlugEdited(true); update("slug", event.target.value); }} className={inputClass} />
          </AdminFormGroup>
          <AdminFormGroup label="Description" htmlFor="category-description" error={errors.description} className="sm:col-span-2">
            <textarea id="category-description" name="description" maxLength={5000} rows={4} value={values.description} onChange={(event) => update("description", event.target.value)} className={textareaClass} />
          </AdminFormGroup>
        </div>
      </AdminCard>
      <AdminCard title="Search appearance">
        <div className="space-y-5">
          <AdminFormGroup label="Meta title" htmlFor="category-meta-title" error={errors.metaTitle}>
            <input id="category-meta-title" name="metaTitle" maxLength={255} value={values.metaTitle} onChange={(event) => update("metaTitle", event.target.value)} className={inputClass} />
          </AdminFormGroup>
          <AdminFormGroup label="Meta description" htmlFor="category-meta-description" error={errors.metaDescription}>
            <textarea id="category-meta-description" name="metaDescription" maxLength={500} rows={3} value={values.metaDescription} onChange={(event) => update("metaDescription", event.target.value)} className={textareaClass} />
          </AdminFormGroup>
        </div>
      </AdminCard>
      <AdminCard title="Visibility">
        <AdminFormGroup label="Status" htmlFor="category-status" error={errors.status} hint="Inactive categories and their posts stay hidden from public blog queries.">
          <select id="category-status" name="status" value={values.status} onChange={(event) => update("status", event.target.value)} className={selectClass}>
            <option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </AdminFormGroup>
      </AdminCard>
      <div className="flex flex-wrap gap-3"><AdminButton type="submit" disabled={busy}>{busy ? "Saving…" : category ? "Save category" : "Create category"}</AdminButton></div>
    </form>
  );
}
