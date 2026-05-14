function authenticateApplication(req, xAppId) {
    var applicationDocument = tools.get_doc_by_key("remote_application", "app_id", xAppId);
    if (applicationDocument === null) {
        return null;
    }
    var credentials = applicationDocument.TopElem.credentials;
    var credentialDocument;
    for (var i = 0; i < credentials.ChildNum; i++) {
        credentialDocument = tools.open_doc(credentials[i].id);
        if (credentialDocument === undefined) {
            wshcmx.utils.log.error("Авторизационные данные по id \"" + credentials[i].id + "\" не найдены в базе данных", "passport");
            continue;
        }
        if (credentialDocument.TopElem.login == req.AuthLogin
            && tools.make_password(credentialDocument.TopElem.password, true) == req.AuthPassword) {
            return {
                id: applicationDocument.DocID,
                type: "application"
            };
        }
    }
    wshcmx.utils.log.error("Некорректный логин или пароль для приложения " + xAppId, "passport");
    return null;
}
