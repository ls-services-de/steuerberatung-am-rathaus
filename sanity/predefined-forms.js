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

FRAGE: Ist ein Kirchenaustritt erfolgt?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja



FRAGE: Liegt eine Schwerbehinderung oder ein Pflegegrad vor?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Anzahl Kinder
TYP: number
PFLICHT: ja

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

FRAGE: Kopie letzter Bescheid
TYP: fileUpload
PFLICHT: nein

FRAGE: Mandatsstatus
TYP: multipleChoice
OPTIONEN: Neuaufnahme, Wechsel, bereits Mandant
PFLICHT: ja

FRAGE: Art der gewünschten Beratung
TYP: multipleChoice
OPTIONEN: Einkommenssteuer, EÜR, Vermietung, Unternehmensgründung, Kleinunternehmerregelung, Existenzgründerberatung, Steuererklärung für Rentner, Erstellung sämtlicher Steuererklärungen für Privatpersonen, Freiberufler und Unternehmer, Erbschaft- und Schenkungsteuer-Erklärungen, Finanzbuchhaltung und Lohnbuchhaltung, Grenzüberschreitende Sachverhalte, die im Inland der Besteuerung unterliegen, Nacherklärung von Einkünften, Klassische betriebswirtschaftliche und steuerliche Unternehmensberatung, Vertretung gegenüber dem Finanzamt, inkl.: Sämtlicher Anträge (Fristverlängerungen, Stundung, Anpassung von Vorauszahlungen etc.) Einspruchs- und Klageverfahren
PFLICHT: ja

FRAGE: Bankname
TYP: text
PFLICHT: ja

FRAGE: IBAN
TYP: text
PFLICHT: ja

FRAGE: BIC
TYP: text
PFLICHT: ja

FRAGE: Kontoinhaber
TYP: text
PFLICHT: ja

FRAGE: Einkunftsarten
TYP: checkbox
OPTIONEN: Nichtselbständige Arbeit, Kapitalvermögen, Vermietung und Verpachtung, Renten / Pensionen / Unfallrenten, Veräußerungsgeschäfte, Gewerbebetrieb / Freiberuflich / Mitunternehmerschaft, Progressionseinkünfte (ALG, KUG, Krankengeld etc.), Unterhaltsleistungen, Auslandseinkünfte, Photovoltaik, Kryptowährungen, Nebengewerbe
PFLICHT: nein

FRAGE: Wie wurden Sie auf uns aufmerksam?
TYP: text
PFLICHT: ja

FRAGE: Was ist Ihnen besonders wichtig bei der Zusammenarbeit?
TYP: text
PFLICHT: ja

FRAGE: Bevorzugte Rückrufzeiten oder Terminwünsche
TYP: text
PFLICHT: ja`,
  },
  {
    title: "2. Allgemeine steuerrelevante Angaben zur Einkommensteuer",
    text: `2. Allgemeine steuerrelevante Angaben zur Einkommensteuer
FRAGE: Beiträge Lebensversicherung (vor 2005 abgeschlossen) (in €)
TYP: number
PFLICHT: ja

FRAGE: Beiträge Krankenversicherung (Basistarif) (in €)
TYP: number
PFLICHT: ja

FRAGE: Beiträge Zusatzversicherungen (z. B. Zahn, Ausland) (in €)
TYP: number
PFLICHT: ja

FRAGE: Beiträge Pflegeversicherung (falls separat ausgewiesen) (in €)
TYP: number
PFLICHT: ja

FRAGE: Beiträge Unfallversicherung (in €)
TYP: number
PFLICHT: ja

FRAGE: Beiträge Private Haftpflichtversicherung (in €)
TYP: number
PFLICHT: ja

FRAGE: Beiträge KFZ-Haftpflichtversicherung (in €)
TYP: number
PFLICHT: ja

FRAGE: Beiträge Sterbegeldversicherung (in €)
TYP: number
PFLICHT: ja

FRAGE: Uploadmöglichkeit für Beitragsnachweise
TYP: fileUpload
PFLICHT: nein

FRAGE: Riestervertrag vorhanden?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Sonstige Altersvorsorge (z. B. Basisrente / "Rürup")
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Anbieterbescheinigung oder Nachweis
TYP: fileUpload
PFLICHT: nein

FRAGE: Haben Sie im betreffenden Jahr Spenden gezahlt?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Wohnsituation
TYP: multipleChoice
OPTIONEN: Mieter einer Wohnung, Eigentümer einer Eigentumswohnung, Eigentümer eines Hauses
PFLICHT: ja

FRAGE: Wurden haushaltsnahe Dienstleistungen / Handwerkerleistungen in Anspruch genommen?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Rechnungen
TYP: fileUpload
PFLICHT: nein

FRAGE: Zahlungsnachweise
TYP: fileUpload
PFLICHT: nein

FRAGE: Grundsteuerbescheid
TYP: fileUpload
PFLICHT: nein

FRAGE: Haben Sie Unterhalt gezahlt?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Haben Sie Unterhalt bezogen?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Betreuungskosten (Kindergarten, Tagesmutter, Hort)
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Haben Sie im Veranlagungszeitraum Krankheits-, Pflege-, Pflegeheim-, Kurkosten oder andere hohe Belastungen getragen?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja`,
  },
  {
    title: "3. Anlage N – Arbeitsverhältnisse und Werbungskosten",
    text: `3. Anlage N – Arbeitsverhältnisse und Werbungskosten
FRAGE: Anzahl der Arbeitsverhältnisse
TYP: number
PFLICHT: ja`,
  },
  {
    title: "4. Kapitalvermögen, Veräußerungsgeschäfte & Kryptowährungen",
    text: `4. Kapitalvermögen, Veräußerungsgeschäfte & Kryptowährungen
FRAGE: Anzahl der Institute / Depots mit Kapitalerträgen
TYP: number
PFLICHT: ja

FRAGE: Anzahl der privaten Veräußerungsgeschäfte (§23 EStG)
TYP: number
PFLICHT: nein

FRAGE: Anzahl Krypto-Plattformen / Wallets mit Transaktionen
TYP: number
PFLICHT: nein

FRAGE: Gab es nachträgliche Korrekturen von Banken / Plattformen?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein

FRAGE: Möchten Sie zu einem konkreten Fall eine Stellungnahme abgeben?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: nein`,
  },
  {
    title: "5. Einkünfte aus Vermietung und Verpachtung (Anlage V)",
    text: `5. Einkünfte aus Vermietung und Verpachtung (Anlage V)
FRAGE: Anzahl wirtschaftlicher Einheiten (Wohnungen / Häuser / Einheiten)
TYP: number
PFLICHT: ja`,
  },
  {
    title: "6. Renten und Pensionen",
    text: `6. Renten und Pensionen
FRAGE: Haben Sie Renten oder Pensionen erhalten?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Anzahl der empfangenen Renten/Pensionen
TYP: number
PFLICHT: nein

FRAGE: Upload: Rentenbezugsmitteilungen
TYP: fileUpload
PFLICHT: nein

FRAGE: Upload: Steuerbescheinigungen der Rentenversicherung
TYP: fileUpload
PFLICHT: nein

FRAGE: Upload: ausländische Rentenbescheide
TYP: fileUpload
PFLICHT: nein`,
  },
  {
    title: "7. Selbstständige/Freiberufliche Tätigkeit",
    text: `7. Selbstständige/Freiberufliche Tätigkeit
FRAGE: Selbstständige/Freiberufliche Tätigkeit vorhanden?
TYP: multipleChoice
OPTIONEN: Ja, Nein
PFLICHT: ja

FRAGE: Upload: Gewinn- und Verlustrechnung
TYP: fileUpload
PFLICHT: nein

FRAGE: Upload: Umsatzsteuervoranmeldungen
TYP: fileUpload
PFLICHT: nein

FRAGE: Upload: Belege und Rechnungen
TYP: fileUpload
PFLICHT: nein

FRAGE: Upload: Gesellschaftsvertrag (falls vorhanden)
TYP: fileUpload
PFLICHT: nein`,
  },
]
