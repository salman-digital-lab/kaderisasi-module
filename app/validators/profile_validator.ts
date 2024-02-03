import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string(),
    gender: vine.enum(['M', 'F']),
    whatsapp: vine.string(),
    line: vine.string(),
    instagram: vine.string(),
    province_id: vine.number(),
    city_id: vine.number(),
    university_id: vine.number(),
    intake_year: vine.string(),
    major: vine.string(),
  })
)
