import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { Dispatch } from '@/app/store';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector,
  localApiStateSelector,
  themesListSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { SupernovaTokenStorage } from '../../../../storage/SupernovaTokenStorage';
import usePushDialog from '../../../hooks/usePushDialog';
import { saveLastSyncedState } from '../../../../utils/saveLastSyncedState';
import { RemoteResponseData } from '../../../../types/RemoteResponseData';
import { ErrorMessages } from '../../../../constants/ErrorMessages';
import { applyTokenSetOrder } from '../../../../utils/tokenset';

type SupernovaCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.SUPERNOVA }>;
type SupernovaFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.SUPERNOVA }>;

export function useSupernova() {
  const tokens = useSelector(tokensSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const themes = useSelector(themesListSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const dispatch = useDispatch<Dispatch>();
  const localApiState = useSelector(localApiStateSelector);
  const { pushDialog, closeDialog } = usePushDialog();

  const storageClientFactory = useCallback((context: SupernovaCredentials) => {
    const storageClient = new SupernovaTokenStorage(context.designSystemUrl, context.mapping, context.secret);
    return storageClient;
  }, []);

  const pushTokensToSupernova = useCallback(
    async (context: SupernovaCredentials): Promise<RemoteResponseData> => {
      const storage = await storageClientFactory(context);

      const content = await storage.retrieve();
      if (content?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: content?.errorMessage,
        };
      }

      if (
        content
        && isEqual(content.tokens, tokens)
        && isEqual(content.themes, themes)
        && isEqual(content.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
      ) {
        notifyToUI('Nothing to commit');
        return {
          status: 'success',
          tokens,
          themes,
          metadata: {},
        };
      }

      dispatch.uiState.setLocalApiState({ ...context });
      const pushSettings = await pushDialog();
      if (pushSettings) {
        try {
          const metadata = {
            tokenSetOrder: Object.keys(tokens),
          };
          await storage.save(
            {
              themes,
              tokens,
              metadata,
            },
          );
          saveLastSyncedState(dispatch, tokens, themes, metadata);
          dispatch.uiState.setLocalApiState({ ...localApiState } as SupernovaCredentials);
          dispatch.uiState.setApiData({ ...context });
          dispatch.tokenState.setTokenData({
            values: tokens,
            themes,
            usedTokenSet,
            activeTheme,
          });

          pushDialog('success');
          return {
            status: 'success',
            tokens,
            themes,
            metadata: {},
          };
        } catch (e) {
          closeDialog();
          console.log('Error syncing tokens with Supernova', e);
          console.log('sending error message');
          return {
            status: 'failure',
            errorMessage: (e as Error).message,
          };
        }
      } else {
        return {
          status: 'success',
          tokens,
          themes,
          metadata: {},
        };
      }
    },
    [dispatch, storageClientFactory, pushDialog, closeDialog, tokens, themes, localApiState, usedTokenSet, activeTheme]
  );

  const pullTokensFromSupernova = useCallback(async (context: SupernovaCredentials, receivedFeatureFlags?: LDProps['flags']): Promise<RemoteResponseData | null> => {
    const storage = storageClientFactory(context);

    try {
      const content = await storage.retrieve();
      if (content?.status === 'failure') {
        return {
          status: 'failure',
          errorMessage: content.errorMessage,
        };
      }
      if (content) {
        // If we didn't get a tokenSetOrder from metadata, use the order of the token sets as they appeared
        const sortedTokens = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder ?? Object.keys(content.tokens));

        return {
          ...content,
          tokens: sortedTokens,
        };
      }
    } catch (e) {
      return {
        status: 'failure',
        errorMessage: ErrorMessages.SUPERNOVA_CREDENTIAL_ERROR,
      };
    }
    return null;
  }, [
    storageClientFactory,
  ]);

  // Function to initially check auth and sync tokens with Supernova
  const syncTokensWithSupernova = useCallback(
    async (context: SupernovaCredentials): Promise<RemoteResponseData> => {
      console.log('SYNC TOKENS');
      try {
        console.log(context);
        return (await pushTokensToSupernova(context)) as any;
      } catch (e) {
        notifyToUI('Error syncing with Supernova, check credentials', { error: true });
        console.log('Error', e);
        return {
          status: 'failure',
          errorMessage: 'Beta error message',
        };
      }
    },
    [pushTokensToSupernova],
  );

  const addNewSupernovaCredentials = useCallback(
    async (context: SupernovaFormValues): Promise<RemoteResponseData> => {
      const data = await syncTokensWithSupernova(context);
      if (!data) {
        return {
          status: 'failure',
          errorMessage: 'Error syncing tokens',
        };
      }
      if (data.status === 'success') {
        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: context,
        });
        if (!data.tokens) {
          notifyToUI('No tokens stored on remote');
        }
      } else {
        return {
          status: 'failure',
          errorMessage: data.errorMessage,
        };
      }
      return {
        status: 'success',
        tokens: data.tokens ?? tokens,
        themes: data.themes ?? themes,
        metadata: {},
      };
    },
    [syncTokensWithSupernova, tokens, themes, dispatch.tokenState, usedTokenSet, activeTheme],
  );

  return useMemo(
    () => ({
      addNewSupernovaCredentials,
      syncTokensWithSupernova,
      pushTokensToSupernova,
      pullTokensFromSupernova,
    }),
    [addNewSupernovaCredentials, syncTokensWithSupernova, pushTokensToSupernova, pullTokensFromSupernova],
  );
}
