
export function createSchemaFn (Segments, Joi) {
  return {
    [Segments.BODY]: Joi.object({
      title: Joi.string().required(),
      perex: Joi.string().required(),
      image: Joi.string(),
      tags: Joi.string().required(),
      content: Joi.string().required(),
      published: Joi.date().allow(null)
    })
  }
}

export function updateSchemaFn (Segments, Joi) {
  return {
    [Segments.BODY]: Joi.object({
      title: Joi.string(),
      perex: Joi.string(),
      image: Joi.string(),
      tags: Joi.string(),
      content: Joi.string(),
      published: Joi.date().allow(null)
    })
  }
}