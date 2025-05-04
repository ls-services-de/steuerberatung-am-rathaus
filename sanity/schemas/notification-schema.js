export default {
    name: "notification",
    title: "Benachrichtigung",
    type: "document",
    fields: [
      {
        name: "title",
        type: "string",
        title: "Titel",
      },
      {
        name: "message",
        type: "text",
        title: "Nachricht",
      },
      {
        name: "type",
        type: "string",
        title: "Typ",
        options: {
          list: [
            { title: "Formular ausgefüllt", value: "form_completed" },
            { title: "Kontaktanfrage", value: "contact_inquiry" },
            { title: "System", value: "system" },
          ],
        },
      },
      {
        name: "read",
        type: "boolean",
        title: "Gelesen",
        initialValue: false,
      },
      {
        name: "createdAt",
        type: "datetime",
        title: "Erstellt am",
        options: {
          dateFormat: "DD.MM.YYYY",
          timeFormat: "HH:mm",
        },
      },
      {
        name: "relatedDocumentId",
        type: "string",
        title: "Zugehörige Dokument-ID",
      },
      {
        name: "relatedDocumentType",
        type: "string",
        title: "Zugehöriger Dokumenttyp",
      },
    ],
    orderings: [
      {
        title: "Erstellungsdatum, Neueste zuerst",
        name: "createdAtDesc",
        by: [{ field: "createdAt", direction: "desc" }],
      },
    ],
  }
  