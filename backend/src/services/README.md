# Services

Business/domain logic and third-party integrations live here, decoupled from
Express. Controllers stay thin and delegate to services.

Planned services (not implemented yet):

- `cloudinary.service.js` — stream Multer buffers to Cloudinary, return
  `{ url, publicId }`; delete assets by `publicId`.
- `product.service.js`, `template.service.js`, `quotation.service.js`, etc.
- `pdf.service.js` — generate quotation PDFs.

Convention: services throw `ApiError` on failure and return plain data; they
never touch `req`/`res`.
