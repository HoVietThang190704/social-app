"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
/**
 * validate(schemaOrMap, target?)
 * - If `schemaOrMap` is a Zod schema with keys { body?, query?, params? } it validates those
 *   against { body, query, params } and replaces req.body/query/params with the parsed values.
 * - If `schemaOrMap` is a Zod schema for the body directly, it validates req.body.
 */
function validate(schema) {
    return async (req, res, next) => {
        try {
            // If schema appears to be an object with body/query/params keys
            const hasBodyKey = schema._def && schema._def.shape && schema._def.shape.body;
            if (hasBodyKey) {
                const parsed = await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                if (parsed.body !== undefined)
                    req.body = parsed.body;
                if (parsed.query !== undefined)
                    req.query = parsed.query;
                if (parsed.params !== undefined)
                    req.params = parsed.params;
            }
            else {
                const parsedBody = await schema.parseAsync(req.body);
                // If the schema returns a primitive or object, keep it in req.body
                req.body = parsedBody;
            }
            return next();
        }
        catch (err) {
            // Zod throws ZodError; normalize to 400 and send messages
            const errors = (err && err.errors) ? err.errors.map((e) => e.message || e.message) : [err.message || 'Validation error'];
            return res.status(400).json({ message: 'Validation failed', errors });
        }
    };
}
