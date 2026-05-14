function createRouterRule() {
    var webRuleCode = "wshcmx_" + wshcmx.config.pattern;
    var webRuleDocument = tools.get_doc_by_key("web_rule", "code", webRuleCode);
    if (webRuleDocument === null) {
        webRuleDocument = tools.new_doc_by_name("web_rule");
        webRuleDocument.BindToDb();
    }
    webRuleDocument.TopElem.url.Value = wshcmx.config.pattern + "/*";
    webRuleDocument.TopElem.redirect_url.Value = "/" + wshcmx.config.basepath + "/api.html";
    alert("Правило редиректа " + webRuleDocument.DocID + " успешно " + (webRuleDocument.NeverSaved ? "создано" : "обновлено"));
}
function init() {
    createRouterRule();
    var apis = ReadDirectory("./../controllers");
    var apiFunctions = OpenCodeLib(apis[0]).functions();
    var apiRoute = apiFunctions[0];
    wshcmx.routes.push({
        method: apiRoute.method,
        pattern: apiRoute.pattern,
        callback: apiRoute.callback,
        url: apis[0],
        access: apiRoute.access,
        params: apiRoute.HasProperty("params") ? apiRoute.params : {}
    });
}
