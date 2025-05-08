export default {
    name: "category",
    title: "Kategorie",
    type: "document",
    fields: [
      {
        name: "name",
        title: "Name",
        type: "string",
        validation: (Rule) => Rule.required(),
      },
      {
        name: "description",
        title: "Beschreibung",
        type: "text",
      },
    ],
  }
  