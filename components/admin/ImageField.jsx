"use client";

import { useState } from "react";
import Image from "next/image";
import AdminButton from "./AdminButton";
import AdminFormGroup from "./AdminFormGroup";
import { inputClass } from "./admin-fields";

export default function ImageField({ values, errors, update, onUploadingChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError("");
    if (file.size > 5242880) { setUploadError("Images must be no larger than 5 MB."); event.target.value = ""; return; }
    setUploading(true);
    onUploadingChange(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const response = await fetch("/api/admin/blog/uploads", { method: "POST", credentials: "same-origin", body: form, cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      update("featuredImage", result.image.path);
    } catch (failure) { setUploadError(failure.message); }
    finally { setUploading(false); onUploadingChange(false); event.target.value = ""; }
  }

  const preview = values.featuredImage?.startsWith("/media/blog/") ? `/api/admin/blog/media/${values.featuredImage.split("/").pop()}` : null;
  return (
    <div className="space-y-5">
      <AdminFormGroup label="Featured image" htmlFor="post-featured-image" error={uploadError || errors.featuredImage} hint="Optional. JPG, PNG or WEBP, up to 5 MB. Uploads are enabled only in local development.">
        <input id="post-featured-image" name="featuredImageFile" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={upload} disabled={uploading} className={`${inputClass} file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1 file:font-semibold file:text-primary-800`} />
      </AdminFormGroup>
      {uploading && <p role="status" className="text-sm text-primary-800">Validating and saving image…</p>}
      {preview && <div className="space-y-2"><Image src={preview} alt={values.featuredImageAlt || "Featured image preview"} width={640} height={360} unoptimized className="max-h-56 w-full rounded-xl bg-neutral-50 object-contain" /><p className="break-all text-xs text-neutral-600">{values.featuredImage}</p><AdminButton variant="secondary" onClick={() => update("featuredImage", "")}>Remove from post</AdminButton></div>}
      <AdminFormGroup label="Image alt text" htmlFor="post-featured-image-alt" error={errors.featuredImageAlt} hint="Describe the image for visitors using screen readers.">
        <input id="post-featured-image-alt" name="featuredImageAlt" maxLength={255} value={values.featuredImageAlt} onChange={(event) => update("featuredImageAlt", event.target.value)} className={inputClass} />
      </AdminFormGroup>
    </div>
  );
}
