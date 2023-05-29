import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import {
  createMockStore,
  render,
} from '../../../tests/config/setupTest';
import SyncSettings from './SyncSettings';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { GitHubStorageType, StorageTypeCredential } from '@/types/StorageType';

describe('ConfirmDialog', () => {
  const defaultStore = {
    uiState: {
      localApiState: {
        branch: 'main',
        filePath: 'data/tokens.json',
        id: 'six7/figma-tokens',
        provider: 'github' as StorageProviderType,
      },
      storageType: {
        branch: 'main',
        filePath: 'data/tokens.json',
        id: 'six7/figma-tokens',
        provider: 'github',
      } as GitHubStorageType,
      apiProviders: [
        {
          branch: 'main',
          filePath: 'data/tokens.json',
          id: 'six7/figma-tokens',
          provider: 'github',
        } as StorageTypeCredential<GitHubStorageType>,
      ],
    },
  };

  it('should return sync settings and stored Providers', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );
    expect(result.queryByText('syncProviders')).toBeInTheDocument();
    expect(result.queryByText('Local document')).toBeInTheDocument();
    expect(result.queryByText('addNew')).toBeInTheDocument();
  });

  it('should return ConfirmLocalStorageModal when seleting local storage', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      result.queryAllByText('Apply')[0]?.click();
    });

    expect(result.queryByText('Set to document storage?')).toBeInTheDocument();
  });

  it('should close ConfirmLocalStorageModal when clicking cancel button', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      result.queryAllByText('Apply')[0]?.click();
    });

    expect(result.queryByText('Set to document storage?')).toBeInTheDocument();

    await act(async () => {
      result.queryByText('Cancel')?.click();
    });

    expect(result.queryByText('Set to document storage?')).not.toBeInTheDocument();
  });

  it('can convert to localStorage', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      result.queryAllByText('Apply')[0]?.click();
    });

    await act(async () => {
      result.queryByText('Yes, set to local.')?.click();
    });

    expect(mockStore.getState().uiState.localApiState).toEqual({
      provider: 'local',
    });
    expect(mockStore.getState().uiState.storageType).toEqual({
      provider: 'local',
    });
  });

  it('should return EditStorageItemModal when edit remote storage', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      const trigger = await result.findByTestId('storage-item-tools-dropdown');
      trigger.focus();
      await userEvent.keyboard('[Enter]');
    });

    await act(async () => {
      const editButton = await result.queryByText('Edit');
      editButton?.focus();
      await userEvent.keyboard('[Enter]');
    });

    expect(result.queryByText('editCredentials')).toBeInTheDocument();
  });

  it('should return CreateStorageItemModal when create new remote storage', async () => {
    const mockStore = createMockStore(defaultStore);
    const result = render(
      <Provider store={mockStore}>
        <SyncSettings />
      </Provider>,
    );

    await act(async () => {
      const trigger = await result.getByTestId('add-storage-item-dropdown');
      trigger?.focus();
      await userEvent.keyboard('[Enter]');
    });

    await act(async () => {
      const githubButton = await result.getByTestId('add-GitHub-credential');
      githubButton?.focus();
      await userEvent.keyboard('[Enter]');
    });

    expect(result.queryByText('pat')).toBeInTheDocument();
    expect(result.queryByText('repo')).toBeInTheDocument();
    expect(result.queryByText('branch')).toBeInTheDocument();
    expect(result.queryByText('filePath')).toBeInTheDocument();
    expect(result.queryByText('baseUrl')).toBeInTheDocument();
    expect(result.queryByText('save')).toBeInTheDocument();
  });
});
