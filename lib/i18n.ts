/**
 * Minimal client-side i18n for the starter.
 * Five launch locales; "ff-Adlm" and "ar" are right-to-left.
 * Replace with next-intl or similar once routing-per-locale is needed.
 *
 * Fulfulde strings are provisional — have native speakers review.
 */

export type Locale = "en" | "fr" | "ar" | "ff-Latn" | "ff-Adlm";

export const LOCALES: { code: Locale; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "ff-Adlm", label: "𞤆𞤵𞤤𞤢𞤪", dir: "rtl" },
  { code: "ff-Latn", label: "Pulaar", dir: "ltr" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
];

export const DEFAULT_LOCALE: Locale = "en";

type Dict = {
  nav: { learn: string; courses: string; library: string; community: string };
  cta: { start: string; login: string };
  hero: { title: string; subtitle: string };
  typing: { heading: string; prompt: string; score: string; streak: string };
  footer: { mission: string; resources: string; legal: string };
};

export const DICTIONARIES: Record<Locale, Dict> = {
  en: {
    nav: { learn: "Learn", courses: "Courses", library: "Library", community: "Community" },
    cta: { start: "Start learning — free", login: "Log in" },
    hero: {
      title: "Learn to read and write ADLaM",
      subtitle:
        "The alphabet of the Fulani people — taught through games, courses, and books from across the globe.",
    },
    typing: {
      heading: "Typing game",
      prompt: "Tap the letter",
      score: "Score",
      streak: "Streak",
    },
    footer: { mission: "Our mission", resources: "Resources", legal: "Terms & privacy" },
  },
  fr: {
    nav: { learn: "Apprendre", courses: "Cours", library: "Bibliothèque", community: "Communauté" },
    cta: { start: "Commencer — gratuit", login: "Se connecter" },
    hero: {
      title: "Apprenez à lire et écrire l'ADLaM",
      subtitle:
        "L'alphabet du peuple peul — enseigné par des jeux, des cours et des livres du monde entier.",
    },
    typing: {
      heading: "Jeu de frappe",
      prompt: "Touchez la lettre",
      score: "Score",
      streak: "Série",
    },
    footer: { mission: "Notre mission", resources: "Ressources", legal: "Conditions & confidentialité" },
  },
  ar: {
    nav: { learn: "تعلَّم", courses: "الدورات", library: "المكتبة", community: "المجتمع" },
    cta: { start: "ابدأ التعلم — مجانًا", login: "تسجيل الدخول" },
    hero: {
      title: "تعلَّم قراءة وكتابة أبجدية أدلم",
      subtitle: "أبجدية شعب الفولاني — عبر الألعاب والدورات والكتب من جميع أنحاء العالم.",
    },
    typing: {
      heading: "لعبة الكتابة",
      prompt: "اختر الحرف",
      score: "النقاط",
      streak: "السلسلة",
    },
    footer: { mission: "رسالتنا", resources: "الموارد", legal: "الشروط والخصوصية" },
  },
  "ff-Latn": {
    nav: { learn: "Jaŋde", courses: "Duɗe", library: "Defte", community: "Renndo" },
    cta: { start: "Fuɗɗo jaŋde — mehre", login: "Naat" },
    hero: {
      title: "Jaŋgu winndugol ADLaM",
      subtitle: "Alkule Fulɓe — jaŋde e fijirde, duɗe e defte.",
    },
    typing: {
      heading: "Fijirde winndugol",
      prompt: "Suɓo alkulal",
      score: "Limoore",
      streak: "Jokkondiral",
    },
    footer: { mission: "Faandaare amen", resources: "Ngaluuji", legal: "Sarɗiiji" },
  },
  "ff-Adlm": {
    nav: { learn: "𞤔𞤢𞤲𞤺𞤣𞤫", courses: "𞤁𞤵𞤯𞤫", library: "𞤁𞤫𞤬𞤼𞤫", community: "𞤈𞤫𞤲𞤣𞤮" },
    cta: { start: "𞤊𞤵𞤯𞤯𞤮 𞤶𞤢𞤲𞤺𞤣𞤫", login: "𞤐𞤢𞤢𞤼" },
    hero: {
      title: "𞤔𞤢𞤲𞤺𞤵 𞤱𞤭𞤲𞤣𞤵𞤺𞤮𞤤 𞤀𞤣𞤤𞤢𞤥",
      subtitle: "𞤀𞤤𞤳𞤵𞤤𞤫 𞤊𞤵𞤤𞤩𞤫 — 𞤶𞤢𞤲𞤺𞤣𞤫 𞤫 𞤬𞤭𞤶𞤭𞤪𞤣𞤫.",
    },
    typing: {
      heading: "𞤊𞤭𞤶𞤭𞤪𞤣𞤫 𞤱𞤭𞤲𞤣𞤵𞤺𞤮𞤤",
      prompt: "𞤅𞤵𞤩𞤮 𞤢𞤤𞤳𞤵𞤤𞤢𞤤",
      score: "𞤂𞤭𞤥𞤮𞤮𞤪𞤫",
      streak: "𞤔𞤮𞤳𞤳𞤮𞤲𞤣𞤭𞤪𞤢𞤤",
    },
    footer: { mission: "𞤊𞤢𞤢𞤲𞤣𞤢𞤢𞤪𞤫", resources: "𞤐𞤺𞤢𞤤𞤵𞤵𞤶𞤭", legal: "𞤅𞤢𞤪𞤯𞤭𞤭𞤶𞤭" },
  },
};

export function getDir(locale: Locale): "ltr" | "rtl" {
  return LOCALES.find((l) => l.code === locale)?.dir ?? "ltr";
}
