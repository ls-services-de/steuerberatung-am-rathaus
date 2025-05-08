export default {
  name: 'form',
  title: 'Formular',
  icon: () => '📄',
  type: 'document',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Formular Titel',
    },
    {
      name: 'questions',
      title: 'Fragen',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'question',
          fields: [
            {
              name: 'questionText',
              type: 'string',
              title: 'Frage',
            },
            {
              name: 'questionType',
              type: 'string',
              title: 'Fragetyp',
              options: {
                list: [
                  { title: 'Text', value: 'text' },
                  { title: 'Checkbox', value: 'checkbox' },
                  { title: 'Multiple Choice', value: 'multipleChoice' },
                  { title: 'Datei Upload', value: 'fileUpload' },
                ],
              },
            },
            {
              name: 'options',
              type: 'array',
              title: 'Antwortmöglichkeiten (nur für Multiple Choice)',
              of: [{ type: 'string' }],
              hidden: ({ parent }) => parent?.questionType !== 'multipleChoice',
            },
            {
              name: 'required',
              type: 'boolean',
              title: 'Pflichtfeld',
              initialValue: true,
            }
          ]
        }
      ]
    }
  ]
}
