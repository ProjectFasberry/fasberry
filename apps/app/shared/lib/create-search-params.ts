type ParamValuePrimitive = string | number | boolean;
type ParamValue = ParamValuePrimitive | null | undefined | Array<ParamValuePrimitive | null | undefined>;
type ParamsObject = Record<string, ParamValue>;

export function createSearchParams(paramsObject: ParamsObject): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(paramsObject)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) params.append(key, String(item));
      }
    } else {
      params.set(key, String(value));
    }
  }

  return params;
}