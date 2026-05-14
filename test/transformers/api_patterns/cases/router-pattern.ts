import { Route, wshcmx } from "../index";

function createRouterRule() {
  const webRuleCode = `wshcmx_${wshcmx.config.pattern}`;
  let webRuleDocument = tools.get_doc_by_key<WebRuleDocument>("web_rule", "code", webRuleCode);

  if (webRuleDocument === null) {
    webRuleDocument = tools.new_doc_by_name<WebRuleDocument>("web_rule");
    webRuleDocument.BindToDb();
  }

  webRuleDocument.TopElem.url.Value = `${wshcmx.config.pattern}/*`;
  webRuleDocument.TopElem.redirect_url.Value = `/${wshcmx.config.basepath}/api.html`;

  alert(`Правило редиректа ${webRuleDocument.DocID} успешно ${webRuleDocument.NeverSaved ? `${"создано"}` : `${"обновлено"}`}`);
}

export type ControllerLibrary = {
  functions(): Route[];
  [key: string]: (...args: any[]) => void;
};

export function init() {
  createRouterRule();
  const apis = ReadDirectory("./../controllers");
  const apiFunctions = OpenCodeLib<ControllerLibrary>(apis[0]).functions();
  const apiRoute = apiFunctions[0] as Route & {
    HasProperty(key: string): boolean;
  };

  wshcmx.routes.push({
    method: apiRoute.method,
    pattern: apiRoute.pattern,
    callback: apiRoute.callback,
    url: apis[0],
    access: apiRoute.access,
    params: apiRoute.HasProperty("params") ? apiRoute.params : {}
  });
}
