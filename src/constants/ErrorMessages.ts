export enum ErrorMessages {
  GENERAL_CONNECTION_ERROR = 'There was an error connecting. Check your credentials.',
  GITHUB_CREDENTIAL_ERROR = 'Error syncing with GitHub, check credentials',
  GITLAB_CREDENTIAL_ERROR = 'Error syncing with GitLab, check credentials',
  BITBUCKET_CREDENTIAL_ERROR = 'Error syncing with BitBucket, check credentials',
  ADO_CREDENTIAL_ERROR = 'Error syncing with ADO, check credentials',
  URL_CREDENTIAL_ERROR = 'Error fetching from URL, check console (F12)',
  JSONBIN_CREDENTIAL_ERROR = 'Error fetching from JSONbin, check console (F12)',
  SUPERNOVA_CREDENTIAL_ERROR = 'Error syncing with Supernova, check credentials or your mapping configuration',
  FILE_CREDENTIAL_ERROR = 'Error fetching from file, check console (F12)',
  EMPTY_BRANCH_ERROR = 'There is no branch',
  VALIDATION_ERROR = "Contents don't pass schema validation",
  ID_NON_EXIST_ERROR = 'ID or Secret should be exist',
  JSONBIN_CREATE_ERROR = 'Error creating JSONbin token storage',
  GIT_MULTIFILE_PERMISSION_ERROR = 'You try to save a multi-file project as a free user. Upgrade to Pro or add a json file at the end of the filepath (tokens.json)',
}
