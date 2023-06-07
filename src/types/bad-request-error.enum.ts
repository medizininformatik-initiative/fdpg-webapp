export enum BadRequestError {
  ProjectAbbreviationMustBeUnique = '400-001',
  IdMismatchBetweenParamAndBody = '400-002',
  CommentOneCanNotAnswerSelf = '400-003',
  KeycloakInvalidClientId = '400-004',
  KeycloakInvalidRedirectUri = '400-005',
  KeycloakInvalidLocationForRole = '400-006',
  ContractSignNoContract = '400-007',
  UploadMimetypeNotSupported = '400-008',
}
