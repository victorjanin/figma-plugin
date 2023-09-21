import { TokensToRenamePayload } from '@/app/store/useTokens';
import type { TokenState } from '../../tokenState';

export function renameVariableNamesToThemes(state: TokenState, tokensToRename: TokensToRenamePayload[]): TokenState {
  const oldNameMapNewName = tokensToRename.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.oldName] = curr.newName;
    return acc;
  }, {});
  const newThemes = state.themes.map((theme) => {
    const updatedTokens = theme.$figmaVariableReferences;
    if (updatedTokens) {
      Object.entries(updatedTokens).forEach(([key]) => {
        if (oldNameMapNewName[key]) {
          updatedTokens[oldNameMapNewName[key]] = updatedTokens[key];
          delete updatedTokens[key];
        }
      });
    }
    return {
      ...theme,
      $figmaVariableReferences: updatedTokens,
    };
  });
  return {
    ...state,
    themes: newThemes,
  };
}
