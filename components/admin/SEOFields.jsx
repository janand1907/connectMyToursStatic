import AdminFormGroup from "./AdminFormGroup";
import { inputClass, selectClass, textareaClass } from "./admin-fields";

export default function SEOFields({ values, errors, update }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <AdminFormGroup label="Meta title" htmlFor="post-meta-title" error={errors.metaTitle}>
        <input id="post-meta-title" name="metaTitle" maxLength={255} value={values.metaTitle} onChange={(event) => update("metaTitle", event.target.value)} className={inputClass} />
      </AdminFormGroup>
      <AdminFormGroup label="Focus keyword" htmlFor="post-focus-keyword" error={errors.focusKeyword}>
        <input id="post-focus-keyword" name="focusKeyword" maxLength={160} value={values.focusKeyword} onChange={(event) => update("focusKeyword", event.target.value)} className={inputClass} />
      </AdminFormGroup>
      <AdminFormGroup label="Meta description" htmlFor="post-meta-description" error={errors.metaDescription} className="sm:col-span-2">
        <textarea id="post-meta-description" name="metaDescription" maxLength={500} rows={3} value={values.metaDescription} onChange={(event) => update("metaDescription", event.target.value)} className={textareaClass} />
      </AdminFormGroup>
      <AdminFormGroup label="Secondary keywords" htmlFor="post-secondary-keywords" error={errors.secondaryKeywords} hint="Separate keywords with commas (up to 20)." className="sm:col-span-2">
        <input id="post-secondary-keywords" name="secondaryKeywords" value={values.secondaryKeywords} onChange={(event) => update("secondaryKeywords", event.target.value)} className={inputClass} />
      </AdminFormGroup>
      <AdminFormGroup label="Canonical URL" htmlFor="post-canonical-url" error={errors.canonicalUrl} hint="Leave blank to use the article URL when public pages are added." className="sm:col-span-2">
        <input id="post-canonical-url" name="canonicalUrl" type="url" maxLength={2048} value={values.canonicalUrl} onChange={(event) => update("canonicalUrl", event.target.value)} className={inputClass} />
      </AdminFormGroup>
      <AdminFormGroup label="Robots" htmlFor="post-robots" error={errors.robots}>
        <select id="post-robots" name="robots" value={values.robots} onChange={(event) => update("robots", event.target.value)} className={selectClass}>
          <option value="index,follow">index,follow</option>
          <option value="noindex,follow">noindex,follow</option>
          <option value="index,nofollow">index,nofollow</option>
          <option value="noindex,nofollow">noindex,nofollow</option>
        </select>
      </AdminFormGroup>
    </div>
  );
}
