function normalizeScheme(scheme) {
    var key;
    for (key in scheme) {
        var schemeProperty = scheme[key];
        var type = schemeProperty.GetOptProperty("type");
        if (wshcmx.availableParametersTypes.indexOf(type) === -1) {
            throw new Error("Некорректно определен тип параметра " + key + " - \"" + type + "\"\nДоступные параметры: " + wshcmx.availableParametersTypes.join(", "));
        }
        schemeProperty.SetProperty("items", schemeProperty.GetOptProperty("items", null));
        if (type == "array" && wshcmx.availableParametersTypes.indexOf(schemeProperty.items) === -1) {
            throw new Error("Некорректно определен тип элемента массива " + key + " - " + schemeProperty.items + "\nДоступные типы: " + wshcmx.availableParametersTypes.join(", "));
        }
    }
    return scheme;
}
function parse(req, scheme) {
    scheme = normalizeScheme(scheme);
    var bodyParameters = tools.read_object(req.Body);
    var key;
    var result = new Object();
    for (key in bodyParameters) {
        result.SetProperty(key, bodyParameters[key]);
    }
    return result;
}
