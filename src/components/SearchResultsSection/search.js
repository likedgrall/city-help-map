export const QUICK_CATEGORIES = [
  "Медицина",
  "Волонтёры",
  "Документы",
  "Соцпомощь",
  "Детям",
  "Животные",
];

const CATEGORY_SYNONYMS = {
  Медицина: [
    "мед",
    "врач",
    "больница",
    "поликлиника",
    "стоматолог",
    "лечение",
    "здоровье",
    "анализы",
    "скорая",
    "клиника",
    "диагностика",
  ],
  Волонтёры: [
    "волонтер",
    "волонтёр",
    "доброволец",
    "помощь",
    "акция",
    "гуманитарная",
    "красный крест",
    "добро",
    "инициатива",
  ],
  Документы: [
    "док",
    "паспорт",
    "справка",
    "мфц",
    "загс",
    "регистрация",
    "заявление",
    "госуслуги",
    "налоговая",
    "права",
    "водительские",
  ],
  Соцпомощь: [
    "соц",
    "льготы",
    "выплаты",
    "пособие",
    "пенсия",
    "соцзащита",
    "трудоустройство",
    "занятость",
    "поддержка",
    "социальная",
  ],
  Детям: [
    "дет",
    "ребенок",
    "ребёнок",
    "дети",
    "детский",
    "подросток",
    "семья",
    "родители",
    "школа",
    "психолог",
    "педиатр",
  ],
  Животные: [
    "животное",
    "питомец",
    "кошка",
    "кот",
    "собака",
    "ветеринар",
    "ветклиника",
    "вет",
    "вакцинация",
    "приют",
    "зоозабота",
  ],
};

const SEARCH_FIELD_WEIGHTS = {
  category: 26,
  title: 14,
  helpType: 11,
  details: 6,
  description: 5,
  address: 2,
};

export const normalizeSearchValue = (value) =>
  String(value ?? "").trim().toLowerCase().replaceAll("ё", "е");

const tokenizeSearchValue = (value) =>
  normalizeSearchValue(value)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(" ")
    .filter(Boolean);

const getSearchStem = (token) => {
  if (token.length <= 4) {
    return token;
  }

  return token.replace(
    /(иями|ями|ами|ого|ему|ыми|ими|ая|яя|ое|ее|ые|ие|ый|ий|ой|ую|юю|ам|ям|ах|ях|ом|ем|ов|ев|ей|ия|а|я|ы|и|у|ю|е|о)$/u,
    "",
  );
};

const uniqueTokens = (tokens) => Array.from(new Set(tokens.filter(Boolean)));

const expandSearchTokens = (tokens) =>
  uniqueTokens(tokens.flatMap((token) => [token, getSearchStem(token)]));

const tokenMatchesText = (token, text) => {
  if (!token || !text) {
    return false;
  }

  if (text.includes(token)) {
    return true;
  }

  const stem = getSearchStem(token);
  return stem.length >= 3 && text.includes(stem);
};

const getCategoryMatchScore = (placeCategory, queryTokens, normalizedQuery) => {
  const normalizedCategory = normalizeSearchValue(placeCategory);
  const synonyms = CATEGORY_SYNONYMS[placeCategory] ?? [];
  const synonymTokens = expandSearchTokens([
    ...tokenizeSearchValue(placeCategory),
    ...synonyms.flatMap((synonym) => tokenizeSearchValue(synonym)),
  ]);

  if (normalizedCategory === normalizedQuery) {
    return 80;
  }

  let score = 0;

  for (const queryToken of queryTokens) {
    if (tokenMatchesText(queryToken, normalizedCategory)) {
      score += 34;
      continue;
    }

    if (synonymTokens.some((synonymToken) => tokenMatchesText(queryToken, synonymToken))) {
      score += 30;
    }
  }

  return score;
};

const getFieldMatchScore = (queryTokens, fieldValue, weight) => {
  const normalizedField = normalizeSearchValue(fieldValue);

  if (!normalizedField) {
    return 0;
  }

  return queryTokens.reduce((score, token) => {
    if (normalizedField === token) {
      return score + weight * 3;
    }

    if (normalizedField.includes(token)) {
      return score + weight * 2;
    }

    const stem = getSearchStem(token);
    if (stem.length >= 3 && normalizedField.includes(stem)) {
      return score + weight;
    }

    return score;
  }, 0);
};

const getPlaceSearchScore = (place, query) => {
  const normalizedQuery = normalizeSearchValue(query);
  const queryTokens = expandSearchTokens(tokenizeSearchValue(query));

  if (!normalizedQuery || queryTokens.length === 0) {
    return 1;
  }

  let score = getCategoryMatchScore(place.category, queryTokens, normalizedQuery);

  score += getFieldMatchScore(queryTokens, place.category, SEARCH_FIELD_WEIGHTS.category);
  score += getFieldMatchScore(queryTokens, place.title, SEARCH_FIELD_WEIGHTS.title);
  score += getFieldMatchScore(queryTokens, place.helpType, SEARCH_FIELD_WEIGHTS.helpType);
  score += getFieldMatchScore(queryTokens, place.details, SEARCH_FIELD_WEIGHTS.details);
  score += getFieldMatchScore(queryTokens, place.description, SEARCH_FIELD_WEIGHTS.description);
  score += getFieldMatchScore(queryTokens, place.address, SEARCH_FIELD_WEIGHTS.address);

  return score;
};

export const filterPlacesBySearch = (places, query) => {
  if (!normalizeSearchValue(query)) {
    return places;
  }

  return places
    .map((place, index) => ({
      place,
      index,
      score: getPlaceSearchScore(place, query),
    }))
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .map((result) => result.place);
};
