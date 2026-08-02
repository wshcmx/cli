import { wshcmx, Route } from "../index";

type Authentication = {
  id: number;
  type: Route["access"];
};

export function authenticateApplication(req: Request, xAppId: string): Authentication | null {
  const applicationDocument = tools.get_doc_by_key<RemoteApplicationDocument>("remote_application", "app_id", xAppId);

  if (applicationDocument === null) {
    return null;
  }

  const credentials = applicationDocument.TopElem.credentials;
  let credentialDocument;
  let credential;

  for (let i = 0; i < credentials.ChildNum; i++) {
    credential = credentials[i];

    if (credential === undefined) {
      continue;
    }

    credentialDocument = tools.open_doc<CredentialDocument>(credential.id);

    if (credentialDocument === undefined) {
      wshcmx.utils.log.error(`Авторизационные данные по id "${credential.id}" не найдены в базе данных`, "passport");
      continue;
    }

    if (
      credentialDocument.TopElem.login == req.AuthLogin
      && tools.make_password(credentialDocument.TopElem.password, true) == req.AuthPassword
    ) {
      return {
        id: applicationDocument.DocID,
        type: "application"
      };
    }
  }

  wshcmx.utils.log.error(`Некорректный логин или пароль для приложения ${xAppId}`, "passport");
  return null;
}
