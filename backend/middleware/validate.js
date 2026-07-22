/**
 * middleware/validate.js
 * Generic middleware factory: validates { body, params, query } against a
 * Zod schema and returns a clean 400 with field-level errors on failure.
 */

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }

    // Use the parsed (and defaulted/coerced) values going forward
    if (result.data.body) req.body = result.data.body;
    if (result.data.params) req.params = result.data.params;

    next();
  };
}

module.exports = validate;
