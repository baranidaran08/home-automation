'use strict';

/**
 * Validation middleware factory backed by Zod.
 *
 * Usage (in future modules):
 *   router.post('/', validate(createProductSchema), controller.create);
 *
 * The schema validates an object of the shape { body, query, params }. Any
 * subset can be provided. Parsed/coerced values replace the originals so
 * controllers receive clean, typed data. Failures throw a ZodError which the
 * global error handler converts into a 422 response.
 */
const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query;
    if (parsed.params !== undefined) req.params = parsed.params;

    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = validate;
