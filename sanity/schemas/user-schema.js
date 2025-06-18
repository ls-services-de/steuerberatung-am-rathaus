export const userSchema = {
    name: "userForm",
    icon: () => '👤',
    title: "User",
    type: "document",
    fields: [
      {
        name: "firstName",
        type: "string",
        title: "Vorname",
      },
      {
        name: "lastName",
        type: "string",
        title: "Nachname",
      },
      {
        name: "email",
        type: "string",
        title: "Email",
      },
      {
        name: "passwort",
        type: "string",
        title: "Passwort",
      },
      {
        name: "kundennummer",
        type: "string",
        title: "Kundennummer",
      },
      {
        name: "assignedForms",
        title: "Zugewiesene Formulare",
        type: "array",
        of: [{ type: "string"}],
      },
      {
        name: "ausgefuellteformulare",
        title: "Ausgefüllte Formulare",
        type: "array",
        of: [
          {
            type: "file",
            
          },
        ],
      },
    ],
  }