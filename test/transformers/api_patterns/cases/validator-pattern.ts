import { wshcmx, RouteParameter, RouteParameters } from "..";

function normalizeScheme(scheme: RouteParameters) {
  let key;

  for (key in scheme) {
    const schemeProperty = scheme[key] as RouteParameter;
    const type = schemeProperty.GetOptProperty("type") as RouteParameter["type"];

    if (wshcmx.availableParametersTypes.indexOf(type) === -1) {
      throw new Error(`Некорректно определен тип параметра ${key} - "${type}"\nДоступные параметры: ${wshcmx.availableParametersTypes.join(", ")}`);
    }

    schemeProperty.SetProperty("items", schemeProperty.GetOptProperty("items", null));

    if (type == "array" && wshcmx.availableParametersTypes.indexOf(schemeProperty.items) === -1) {
      throw new Error(`Некорректно определен тип элемента массива ${key} - ${schemeProperty.items}\nДоступные типы: ${wshcmx.availableParametersTypes.join(", ")}`);
    }
  }

  return scheme;
}

export function parse(req: Request, scheme: RouteParameters) {
  scheme = normalizeScheme(scheme);
  const bodyParameters = tools.read_object<Record<string, unknown>>(req.Body);
  let key;
  const result = new Object() as Object & {
    SetProperty(key: string, value: unknown): void;
  };

  for (key in bodyParameters) {
    result.SetProperty(key, bodyParameters[key]);
  }

  return result;
}
