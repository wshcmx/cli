function json(res, payload, status, message) {
    if (status === void 0) { status = 200; }
    if (message === void 0) { message = null; }
    res.ContentType = "application/json; charset=utf-8;";
    if (status !== 200) {
        res.SetRespStatus(status, String(message));
    }
    res.Write((wshcmx.utils.type.isPrimitive(payload) ? payload : tools.object_to_text(payload, "json")));
}
function abort(res, message, status) {
    if (status === void 0) { status = 500; }
    message = (wshcmx.utils.type.isError(message) && wshcmx.config.env != "development"
        ? message.message
        : RValue(message));
    json(res, { error: message }, status, message);
}
function binary(res, file) {
    if (file.TopElem.file_source.Value === null || file.TopElem.file_url.Value === null) {
        return;
    }
    var url = tools.file_source_get_file_to_save_url(file.TopElem.file_source.Value, file.DocID, file.TopElem.file_url.Value);
    res.AddHeader("Content-Disposition", "attachment; filename=" + UrlEncode(file.TopElem.name.Value));
    res.Write(url);
}
