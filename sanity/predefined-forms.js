export const PREDEFINED_FORMS = [
  {
    title: "1. Persönliche Angaben (Mandant, Ehepartner, Kinder)",
    text: `1. Persönliche Angaben (Mandant, Ehepartner, Kinder)

FRAGE: Anrede
TYP: multipleChoice
OPTIONEN: Herr, Frau, Divers
PFLICHT: ja

FRAGE: Vorname
TYP: text
PFLICHT: ja

FRAGE: Nachname
TYP: text
PFLICHT: ja

FRAGE: Geburtsdatum
TYP: date
PFLICHT: ja

FRAGE: Beruf / Tätigkeit
TYP: text
PFLICHT: ja

FRAGE: Steuer-ID
TYP: text
PFLICHT: ja

FRAGE: Telefon (mobil/präferiert)
TYP: text
PFLICHT: ja

FRAGE: E-Mail-Adresse
TYP: email
PFLICHT: ja

FRAGE: Nationalität
TYP: text
PFLICHT: ja

FRAGE: Religion
TYP: text
PFLICHT: nein

FRAGE: Familienstand
TYP: multipleChoice
OPTIONEN: ledig, verheiratet, geschieden, verwitwet, dauernd getrennt lebend
PFLICHT: ja

FRAGE: Datum der Eheschließung/Scheidung (falls zutreffend)
TYP: date
PFLICHT: nein

FRAGE: Liegt eine Schwerbehinderung oder ein Pflegegrad vor?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Falls ja, bitte Grad angeben und Nachweis hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Straße
TYP: text
PFLICHT: ja

FRAGE: Hausnummer
TYP: text
PFLICHT: ja

FRAGE: PLZ
TYP: text
PFLICHT: ja

FRAGE: Ort
TYP: text
PFLICHT: ja

FRAGE: Kommunikationspräferenz
TYP: multipleChoice
OPTIONEN: E-Mail, Telefon, Post
PFLICHT: ja

FRAGE: Aktuelle Steuernummer
TYP: text
PFLICHT: ja

FRAGE: Jahr der letztjährig eingereichten Steuererklärung
TYP: number
PFLICHT: ja

FRAGE: Letztes Jahr Einkommenssteuererklärung abgegeben?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: IBAN
TYP: text
PFLICHT: ja

FRAGE: BIC
TYP: text
PFLICHT: ja

FRAGE: Anrede des Ehepartners
TYP: multipleChoice
OPTIONEN: Herr, Frau, Divers
PFLICHT: nein

FRAGE: Vorname des Ehepartners
TYP: text
PFLICHT: nein

FRAGE: Nachname des Ehepartners
TYP: text
PFLICHT: nein

FRAGE: Geburtsdatum des Ehepartners
TYP: date
PFLICHT: nein

FRAGE: Beruf / Tätigkeit des Ehepartners
TYP: text
PFLICHT: nein

FRAGE: Steuer-ID des Ehepartners
TYP: text
PFLICHT: nein

FRAGE: Telefon des Ehepartners
TYP: text
PFLICHT: nein

FRAGE: Nationalität des Ehepartners
TYP: text
PFLICHT: nein

FRAGE: Religion des Ehepartners
TYP: text
PFLICHT: nein

FRAGE: E-Mail-Adresse des Ehepartners
TYP: email
PFLICHT: nein

FRAGE: Schwerbehinderung / Pflegegrad beim Ehepartner?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Falls ja, bitte Nachweis hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Anzahl der Kinder
TYP: number
PFLICHT: ja

FRAGE: Name des 1. Kindes
TYP: text
PFLICHT: nein

FRAGE: Geburtsdatum des 1. Kindes
TYP: date
PFLICHT: nein

FRAGE: Steuer-ID des 1. Kindes
TYP: text
PFLICHT: nein

FRAGE: Kindergeldbezug für 1. Kind?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Schwerbehinderung / Pflegegrad beim 1. Kind?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Name des 2. Kindes
TYP: text
PFLICHT: nein

FRAGE: Geburtsdatum des 2. Kindes
TYP: date
PFLICHT: nein

FRAGE: Steuer-ID des 2. Kindes
TYP: text
PFLICHT: nein

FRAGE: Kindergeldbezug für 2. Kind?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Schwerbehinderung / Pflegegrad beim 2. Kind?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Name des 3. Kindes
TYP: text
PFLICHT: nein

FRAGE: Geburtsdatum des 3. Kindes
TYP: date
PFLICHT: nein

FRAGE: Steuer-ID des 3. Kindes
TYP: text
PFLICHT: nein

FRAGE: Kindergeldbezug für 3. Kind?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Schwerbehinderung / Pflegegrad beim 3. Kind?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Sind Sie alleinerziehend?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Volljähriges Kind in Ausbildung / Studium?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Wohnsituation des volljährigen Kindes
TYP: multipleChoice
OPTIONEN: bei den Eltern, auswärtig
PFLICHT: nein`,
  },
  {
    title: "2. Allgemeine steuerrelevante Angaben zur Einkommensteuer",
    text: `2. Allgemeine steuerrelevante Angaben zur Einkommensteuer

FRAGE: Sonderausgaben / Versicherungen - Krankenversicherung
TYP: multipleChoice
OPTIONEN: gesetzlich, privat
PFLICHT: ja

FRAGE: Beitragshöhe Krankenversicherung (jährlich)
TYP: number
PFLICHT: ja

FRAGE: Pflegeversicherung
TYP: multipleChoice
OPTIONEN: gesetzlich, privat
PFLICHT: ja

FRAGE: Beitragshöhe Pflegeversicherung (jährlich)
TYP: number
PFLICHT: ja

FRAGE: Arbeitslosenversicherung (falls zutreffend)
TYP: number
PFLICHT: nein

FRAGE: Haftpflichtversicherung (jährlich)
TYP: number
PFLICHT: nein

FRAGE: Unfallversicherung (jährlich)
TYP: number
PFLICHT: nein

FRAGE: Rechtsschutzversicherung (jährlich)
TYP: number
PFLICHT: nein

FRAGE: Risikolebensversicherung (jährlich)
TYP: number
PFLICHT: nein

FRAGE: Berufsunfähigkeitsversicherung (jährlich)
TYP: number
PFLICHT: nein

FRAGE: Altersvorsorge - Riester-Rente
TYP: number
PFLICHT: nein

FRAGE: Rürup-Rente / Basisrente
TYP: number
PFLICHT: nein

FRAGE: Betriebliche Altersvorsorge
TYP: number
PFLICHT: nein

FRAGE: Gesetzliche Rentenversicherung
TYP: number
PFLICHT: nein

FRAGE: Spenden an gemeinnützige Organisationen
TYP: number
PFLICHT: nein

FRAGE: Spenden an politische Parteien
TYP: number
PFLICHT: nein

FRAGE: Kirchensteuer
TYP: number
PFLICHT: nein

FRAGE: Haushaltsnahe Dienstleistungen (Reinigung, Gartenpflege, etc.)
TYP: number
PFLICHT: nein

FRAGE: Handwerkerleistungen (Reparaturen, Renovierungen)
TYP: number
PFLICHT: nein

FRAGE: Kinderbetreuungskosten
TYP: number
PFLICHT: nein

FRAGE: Schulgeld für Privatschulen
TYP: number
PFLICHT: nein

FRAGE: Außergewöhnliche Belastungen - Krankheitskosten
TYP: number
PFLICHT: nein

FRAGE: Pflegekosten für Angehörige
TYP: number
PFLICHT: nein

FRAGE: Bestattungskosten
TYP: number
PFLICHT: nein

FRAGE: Unterhaltszahlungen
TYP: number
PFLICHT: nein

FRAGE: Belege für Sonderausgaben hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Belege für außergewöhnliche Belastungen hochladen
TYP: fileUpload
PFLICHT: nein`,
  },
  {
    title: "3. Anlage N - Nichtselbständige Arbeit",
    text: `3. Anlage N - Nichtselbständige Arbeit

FRAGE: Name des Arbeitgebers
TYP: text
PFLICHT: ja

FRAGE: Adresse des Arbeitgebers
TYP: textarea
PFLICHT: ja

FRAGE: Beschäftigungszeitraum von
TYP: date
PFLICHT: ja

FRAGE: Beschäftigungszeitraum bis
TYP: date
PFLICHT: ja

FRAGE: Bruttolohn laut Lohnsteuerbescheinigung
TYP: number
PFLICHT: ja

FRAGE: Lohnsteuer
TYP: number
PFLICHT: ja

FRAGE: Solidaritätszuschlag
TYP: number
PFLICHT: ja

FRAGE: Kirchensteuer
TYP: number
PFLICHT: ja

FRAGE: Sozialversicherungsbeiträge gesamt
TYP: number
PFLICHT: ja

FRAGE: Werbungskosten - Fahrten zur Arbeit (Entfernung in km)
TYP: number
PFLICHT: nein

FRAGE: Anzahl der Arbeitstage
TYP: number
PFLICHT: nein

FRAGE: Fortbildungskosten
TYP: number
PFLICHT: nein

FRAGE: Fachbücher und Fachliteratur
TYP: number
PFLICHT: nein

FRAGE: Arbeitskleidung
TYP: number
PFLICHT: nein

FRAGE: Arbeitsmittel (Computer, Werkzeuge, etc.)
TYP: number
PFLICHT: nein

FRAGE: Häusliches Arbeitszimmer (Größe in qm)
TYP: number
PFLICHT: nein

FRAGE: Kosten für häusliches Arbeitszimmer
TYP: number
PFLICHT: nein

FRAGE: Bewirtungskosten
TYP: number
PFLICHT: nein

FRAGE: Reisekosten
TYP: number
PFLICHT: nein

FRAGE: Übernachtungskosten
TYP: number
PFLICHT: nein

FRAGE: Gewerkschaftsbeiträge
TYP: number
PFLICHT: nein

FRAGE: Berufsverbandsbeiträge
TYP: number
PFLICHT: nein

FRAGE: Kontoführungsgebühren
TYP: number
PFLICHT: nein

FRAGE: Umzugskosten (beruflich bedingt)
TYP: number
PFLICHT: nein

FRAGE: Doppelte Haushaltsführung
TYP: number
PFLICHT: nein

FRAGE: Lohnsteuerbescheinigung hochladen
TYP: fileUpload
PFLICHT: ja

FRAGE: Belege für Werbungskosten hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Weitere Arbeitgeber vorhanden?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Name des 2. Arbeitgebers
TYP: text
PFLICHT: nein

FRAGE: Bruttolohn 2. Arbeitgeber
TYP: number
PFLICHT: nein

FRAGE: Lohnsteuerbescheinigung 2. Arbeitgeber hochladen
TYP: fileUpload
PFLICHT: nein`,
  },
  {
    title: "4. Kapitalvermögen, Veräußerungsgeschäfte & Kryptowährungen",
    text: `4. Kapitalvermögen, Veräußerungsgeschäfte & Kryptowährungen

FRAGE: Zinserträge aus Bankguthaben
TYP: number
PFLICHT: nein

FRAGE: Dividenden aus Aktien
TYP: number
PFLICHT: nein

FRAGE: Erträge aus Investmentfonds
TYP: number
PFLICHT: nein

FRAGE: Zinserträge aus Anleihen
TYP: number
PFLICHT: nein

FRAGE: Sonstige Kapitalerträge
TYP: number
PFLICHT: nein

FRAGE: Kapitalertragsteuer einbehalten
TYP: number
PFLICHT: nein

FRAGE: Solidaritätszuschlag auf Kapitalerträge
TYP: number
PFLICHT: nein

FRAGE: Kirchensteuer auf Kapitalerträge
TYP: number
PFLICHT: nein

FRAGE: Werbungskosten bei Kapitalvermögen
TYP: number
PFLICHT: nein

FRAGE: Verluste aus Kapitalvermögen
TYP: number
PFLICHT: nein

FRAGE: Aktienverkäufe - Verkaufserlös
TYP: number
PFLICHT: nein

FRAGE: Aktienverkäufe - Anschaffungskosten
TYP: number
PFLICHT: nein

FRAGE: Aktienverkäufe - Gewinn/Verlust
TYP: number
PFLICHT: nein

FRAGE: Immobilienverkauf - Verkaufserlös
TYP: number
PFLICHT: nein

FRAGE: Immobilienverkauf - Anschaffungskosten
TYP: number
PFLICHT: nein

FRAGE: Immobilienverkauf - Verkaufskosten
TYP: number
PFLICHT: nein

FRAGE: Immobilienverkauf - Spekulationsgewinn
TYP: number
PFLICHT: nein

FRAGE: Kryptowährungen - Verkaufserlöse
TYP: number
PFLICHT: nein

FRAGE: Kryptowährungen - Anschaffungskosten
TYP: number
PFLICHT: nein

FRAGE: Kryptowährungen - Gewinn/Verlust
TYP: number
PFLICHT: nein

FRAGE: Mining-Erträge aus Kryptowährungen
TYP: number
PFLICHT: nein

FRAGE: Staking-Erträge aus Kryptowährungen
TYP: number
PFLICHT: nein

FRAGE: DeFi-Erträge (Decentralized Finance)
TYP: number
PFLICHT: nein

FRAGE: Airdrops und Forks (Bewertung)
TYP: number
PFLICHT: nein

FRAGE: Kapitalertragssteuer-Bescheinigungen hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Depot-Abrechnungen hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Krypto-Trading-Historie hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Immobilien-Kaufverträge hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Immobilien-Verkaufsverträge hochladen
TYP: fileUpload
PFLICHT: nein`,
  },
  {
    title: "5. Einkünfte aus Vermietung und Verpachtung",
    text: `5. Einkünfte aus Vermietung und Verpachtung

FRAGE: Anzahl der vermieteten Objekte
TYP: number
PFLICHT: ja

FRAGE: Objekt 1 - Adresse
TYP: textarea
PFLICHT: nein

FRAGE: Objekt 1 - Art der Nutzung
TYP: multipleChoice
OPTIONEN: Wohnung, Haus, Gewerbe, Garage, Sonstiges
PFLICHT: nein

FRAGE: Objekt 1 - Mieteinnahmen (jährlich)
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Nebenkosten-Nachzahlungen
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Kaution erhalten
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Abschreibung (AfA)
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Schuldzinsen
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Hausgeld/Nebenkosten
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Grundsteuer
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Versicherungen
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Reparaturen und Instandhaltung
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Verwaltungskosten
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Maklerkosten
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Rechtsberatung/Steuerberatung
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Fahrtkosten
TYP: number
PFLICHT: nein

FRAGE: Objekt 1 - Sonstige Werbungskosten
TYP: number
PFLICHT: nein

FRAGE: Objekt 2 - Adresse
TYP: textarea
PFLICHT: nein

FRAGE: Objekt 2 - Art der Nutzung
TYP: multipleChoice
OPTIONEN: Wohnung, Haus, Gewerbe, Garage, Sonstiges
PFLICHT: nein

FRAGE: Objekt 2 - Mieteinnahmen (jährlich)
TYP: number
PFLICHT: nein

FRAGE: Objekt 2 - Werbungskosten gesamt
TYP: number
PFLICHT: nein

FRAGE: Objekt 3 - Adresse
TYP: textarea
PFLICHT: nein

FRAGE: Objekt 3 - Art der Nutzung
TYP: multipleChoice
OPTIONEN: Wohnung, Haus, Gewerbe, Garage, Sonstiges
PFLICHT: nein

FRAGE: Objekt 3 - Mieteinnahmen (jährlich)
TYP: number
PFLICHT: nein

FRAGE: Objekt 3 - Werbungskosten gesamt
TYP: number
PFLICHT: nein

FRAGE: Mietverträge hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Nebenkostenabrechnungen hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Reparatur-Rechnungen hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Grundsteuerbescheide hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Versicherungsbelege hochladen
TYP: fileUpload
PFLICHT: nein`,
  },
  {
    title: "6. Renten und Altersvorsorge",
    text: `6. Renten und Altersvorsorge

FRAGE: Gesetzliche Rente erhalten?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Höhe der gesetzlichen Rente (jährlich)
TYP: number
PFLICHT: nein

FRAGE: Steuerpflichtiger Anteil der Rente
TYP: number
PFLICHT: nein

FRAGE: Rentenbeginn
TYP: date
PFLICHT: nein

FRAGE: Betriebsrente erhalten?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Höhe der Betriebsrente (jährlich)
TYP: number
PFLICHT: nein

FRAGE: Private Rentenversicherung - Auszahlungen
TYP: number
PFLICHT: nein

FRAGE: Riester-Rente - Auszahlungen
TYP: number
PFLICHT: nein

FRAGE: Rürup-Rente - Auszahlungen
TYP: number
PFLICHT: nein

FRAGE: Ausländische Renten
TYP: number
PFLICHT: nein

FRAGE: Witwenrente/Witwerrente
TYP: number
PFLICHT: nein

FRAGE: Waisenrente
TYP: number
PFLICHT: nein

FRAGE: Erwerbsminderungsrente
TYP: number
PFLICHT: nein

FRAGE: Unfallrente
TYP: number
PFLICHT: nein

FRAGE: Berufsgenossenschaftliche Rente
TYP: number
PFLICHT: nein

FRAGE: Altersvorsorge-Beiträge - Riester
TYP: number
PFLICHT: nein

FRAGE: Altersvorsorge-Beiträge - Rürup/Basis
TYP: number
PFLICHT: nein

FRAGE: Altersvorsorge-Beiträge - Betrieblich
TYP: number
PFLICHT: nein

FRAGE: Altersvorsorge-Beiträge - Gesetzliche RV
TYP: number
PFLICHT: nein

FRAGE: Altersvorsorge-Beiträge - Private RV
TYP: number
PFLICHT: nein

FRAGE: Werbungskosten bei Renten
TYP: number
PFLICHT: nein

FRAGE: Rentenbescheid hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Rentenanpassungsmitteilung hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Riester-Bescheinigung hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Rürup-Bescheinigung hochladen
TYP: fileUpload
PFLICHT: nein

FRAGE: Betriebsrenten-Bescheinigung hochladen
TYP: fileUpload
PFLICHT: nein`,
  },
]
