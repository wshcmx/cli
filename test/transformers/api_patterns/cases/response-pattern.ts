import { wshcmx } from "../index";

function json<T>(
  res: Response,
  payload: T,
  status = 200,
  message: unknown = null
) {
  res.ContentType = "application/json; charset=utf-8;";

  if (status !== 200) {
    res.SetRespStatus(status, String(message));
  }

  res.Write((wshcmx.utils.type.isPrimitive(payload) ? payload : tools.object_to_text(payload, "json")) as string);
}

export function abort(res: Response, message: unknown, status: number = 500) {
  message = (
    wshcmx.utils.type.isError(message) && wshcmx.config.env != "development"
      ? message.message
      : RValue(message)
  ) as string;

  json(res, { error: message }, status, message);
}

export function binary(res: Response, file: ResourceDocument) {
  if (file.TopElem.file_source.Value === null || file.TopElem.file_url.Value === null) {
    return;
  }

  const url = tools.file_source_get_file_to_save_url(
    file.TopElem.file_source.Value,
    file.DocID,
    file.TopElem.file_url.Value
  );

  res.AddHeader("Content-Disposition", `attachment; filename=${UrlEncode(file.TopElem.name.Value)}`);
  res.Write(url);
}
