// --- Типы данных (остаются без изменений) ---

// Допустимые примитивные значения для параметра.
type ParamValuePrimitive = string | number | boolean;

// Полный тип для значения параметра: может быть примитивом, null/undefined
// или массивом, содержащим примитивы, null или undefined.
type ParamValue = ParamValuePrimitive | null | undefined | Array<ParamValuePrimitive | null | undefined>;

// Тип для входного объекта: ключи - строки, значения - наш ParamValue.
type ParamsObject = Record<string, ParamValue>;


/**
 * Создает объект URLSearchParams из обычного объекта JavaScript.
 * 
 * - Игнорирует ключи со значением `undefined`.
 * - **Включает** в параметры значения `null`, `''` (пустая строка), `0` и `false`.
 * - Корректно обрабатывает массивы, создавая несколько параметров с одним ключом.
 * - Автоматически преобразует все нестроковые значения в строки.
 * 
 * @param {ParamsObject} paramsObject - Объект с параметрами для URL.
 * @returns {URLSearchParams} Готовый объект для использования в запросах.
 */
export function createSearchParams(paramsObject: ParamsObject): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(paramsObject)) {
    // Единственное условие для пропуска - строгая проверка на undefined.
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      // Проходим по массиву и добавляем все элементы, кроме undefined.
      value.forEach(item => {
        if (item !== undefined) {
          // Явно преобразуем значение в строку, даже если это null.
          // `String(null)` вернет строку "null".
          params.append(key, String(item));
        }
      });
    } else {
      // Устанавливаем значение, преобразовав его в строку.
      params.set(key, String(value));
    }
  }

  return params;
}