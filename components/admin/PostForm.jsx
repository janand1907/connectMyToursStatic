"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminCard from "./AdminCard";
import AdminFormGroup from "./AdminFormGroup";
import AdminNotice from "./AdminNotice";
import ImageField from "./ImageField";
import SEOFields from "./SEOFields";
import PublishPanel from "./PublishPanel";
import { inputClass, selectClass, textareaClass, slugify, requestJson } from "./admin-fields";

const blank = {
  title: "", slug: "", categoryId: "", excerpt: "", content: "", featuredImage: "", featuredImageAlt: "",
  status: "draft", metaTitle: "", metaDescription: "", focusKeyword: "", secondaryKeywords: "",
  canonicalUrl: "", robots: "index,follow", ogTitle: "", ogDescription: "", ogImage: "", schemaJson: "", publishedAt: "",
};

function localDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function PostForm({ post = null, categories = [] }) {
  const router = useRouter();
  const [values, setValues] = useState(() => ({ ...blank, ...post,
    secondaryKeywords: Array.isArray(post?.secondaryKeywords) ? post.secondaryKeywords.join(", ") : "",
    publishedAt: localDate(post?.publishedAt),
  }));
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value, ...(name === "title" && !slugEdited ? { slug: slugify(value) } : {}) }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function save(statusOverride = null) {
    if (uploading || busy) return;
    const status = statusOverride || values.status;
    setValues((current) => ({ ...current, status }));
    setMessage("");
    setErrors({});
    setBusy(true);
    try {
      const date = values.publishedAt === localDate(post?.publishedAt) ? post?.publishedAt || "" :
        values.publishedAt ? new Date(values.publishedAt).toISOString() : "";
      const input = {
        ...values, status,
        secondaryKeywords: values.secondaryKeywords.split(",").map((item) => item.trim()).filter(Boolean),
        publishedAt: date,
      };
      const result = await requestJson(post ? `/api/admin/blog/posts/${post.id}` : "/api/admin/blog/posts", post ? "PATCH" : "POST", input);
      if (post) {
        setMessage("Post saved.");
        router.refresh();
      } else router.push(`/admin/blog/posts/${result.id}/edit`);
    } catch (failure) {
      setErrors(failure.fields || {});
      setMessage(failure.message === "Invalid time value" ? "Enter a valid publication date." : failure.message);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); save(); }} className="space-y-6">
      <AdminNotice message={message} tone={message === "Post saved." ? "success" : "error"} />
      <AdminCard title="Main content">
        <div className="grid gap-5 sm:grid-cols-2">
          <AdminFormGroup label="Title" htmlFor="post-title" required error={errors.title} className="sm:col-span-2">
            <input id="post-title" name="title" required maxLength={255} value={values.title} onChange={(event) => update("title", event.target.value)} className={inputClass} />
          </AdminFormGroup>
          <AdminFormGroup label="Slug" htmlFor="post-slug" required error={errors.slug} hint="Lowercase letters, numbers and hyphens. An old published slug becomes a redirect when changed.">
            <input id="post-slug" name="slug" required maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={values.slug} onChange={(event) => { setSlugEdited(true); update("slug", event.target.value); }} className={inputClass} />
          </AdminFormGroup>
          <AdminFormGroup label="Category" htmlFor="post-category" required error={errors.categoryId}>
            <select id="post-category" name="categoryId" required value={values.categoryId} onChange={(event) => update("categoryId", event.target.value)} className={selectClass}>
              <option value="">Choose a category</option>
              {categories.map((category) => <option value={category.id} key={category.id}>{category.name}{category.status === "inactive" ? " (inactive)" : ""}</option>)}
            </select>
          </AdminFormGroup>
          <AdminFormGroup label="Excerpt" htmlFor="post-excerpt" error={errors.excerpt} className="sm:col-span-2">
            <textarea id="post-excerpt" name="excerpt" maxLength={2000} rows={3} value={values.excerpt} onChange={(event) => update("excerpt", event.target.value)} className={textareaClass} />
          </AdminFormGroup>
          <AdminFormGroup label="Content" htmlFor="post-content" required={values.status === "published"} error={errors.content} hint="Write in Markdown. Publishing requires content. Raw HTML will not be rendered publicly." className="sm:col-span-2">
            <textarea id="post-content" name="content" rows={16} value={values.content} onChange={(event) => update("content", event.target.value)} className={`${textareaClass} font-mono`} />
          </AdminFormGroup>
        </div>
      </AdminCard>
      <AdminCard title="Image" description="Add a featured image if it helps the article. It is optional.">
        <ImageField values={values} errors={errors} update={update} onUploadingChange={setUploading} />
      </AdminCard>
      <AdminCard title="SEO"><SEOFields values={values} errors={errors} update={update} /></AdminCard>
      <AdminCard title="Open Graph">
        <div className="space-y-5">
          <AdminFormGroup label="OG title" htmlFor="post-og-title" error={errors.ogTitle}>
            <input id="post-og-title" name="ogTitle" maxLength={255} value={values.ogTitle} onChange={(event) => update("ogTitle", event.target.value)} className={inputClass} />
          </AdminFormGroup>
          <AdminFormGroup label="OG description" htmlFor="post-og-description" error={errors.ogDescription}>
            <textarea id="post-og-description" name="ogDescription" rows={3} maxLength={500} value={values.ogDescription} onChange={(event) => update("ogDescription", event.target.value)} className={textareaClass} />
          </AdminFormGroup>
          <AdminFormGroup label="OG image" htmlFor="post-og-image" error={errors.ogImage} hint="Use a relative path from an uploaded blog image.">
            <input id="post-og-image" name="ogImage" value={values.ogImage} onChange={(event) => update("ogImage", event.target.value)} className={inputClass} />
          </AdminFormGroup>
          {values.featuredImage && <button type="button" onClick={() => update("ogImage", values.featuredImage)} className="text-sm font-semibold text-primary-700 underline">Use featured image for OG</button>}
        </div>
      </AdminCard>
      <AdminCard title="Schema">
        <AdminFormGroup label="Schema JSON" htmlFor="post-schema-json" error={errors.schemaJson} hint="Optional custom schema.org JSON object. Phase 3 will add article and breadcrumb schema automatically.">
          <textarea id="post-schema-json" name="schemaJson" rows={8} value={values.schemaJson} onChange={(event) => update("schemaJson", event.target.value)} className={`${textareaClass} font-mono`} />
        </AdminFormGroup>
      </AdminCard>
      <AdminCard title="Publish"><PublishPanel values={values} errors={errors} update={update} busy={busy || uploading} save={save} /></AdminCard>
    </form>
  );
}
