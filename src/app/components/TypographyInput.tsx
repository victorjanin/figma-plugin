import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import get from 'just-safe-get';
import { TokensIcon, LinkBreak2Icon } from '@radix-ui/react-icons';
import { useUIDSeed } from 'react-uid';
import { checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import ResolvedTokenDisplay from './ResolvedTokenDisplay';
import { findReferences } from '@/utils/findReferences';
import IconButton from './IconButton';
import Heading from './Heading';
import { EditTokenObject, SingleTypographyToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import SingleTypographyDownShiftInput from './SingleTypographyDownShiftInput';
import DownshiftInput from './DownshiftInput';
import Stack from './Stack';

export default function TypographyInput({
  internalEditToken,
  handleTypographyValueChange,
  handleTypographyAliasValueChange,
  resolvedTokens,
  handleTypographyValueDownShiftInputChange,
  handleDownShiftInputChange,
  setTypographyValue,
  onSubmit,
}: {
  internalEditToken: Extract<EditTokenObject, { type: TokenTypes.TYPOGRAPHY }>;
  handleTypographyValueChange: (property: string, value: string) => void;
  handleTypographyAliasValueChange: (property: string, value: string) => void;
  resolvedTokens: ResolveTokenValuesResult[];
  handleTypographyValueDownShiftInputChange: (newInputValue: string, property: string) => void;
  handleDownShiftInputChange: (newInputValue: string) => void;
  setTypographyValue: (newTypographyValue: SingleTypographyToken['value']) => void;
  onSubmit: () => void
}) {
  const seed = useUIDSeed();
  const isAliasMode = (internalEditToken.value && typeof internalEditToken.value === 'string');
  const [mode, setMode] = useState(isAliasMode ? 'alias' : 'input');
  const [alias, setAlias] = useState('');
  const selectedFontFamily = useMemo(() => {
    if (typeof internalEditToken.value === 'object') {
      const resolvedFontFamily = getAliasValue(internalEditToken.value?.fontFamily ?? '', resolvedTokens);
      return String(resolvedFontFamily);
    }
    return '';
  }, [internalEditToken, resolvedTokens]);

  const selectedToken = React.useMemo<SingleTypographyToken | null>(() => {
    const search = findReferences(String(internalEditToken.value));
    if (search && search.length > 0) {
      const foundToken = resolvedTokens.find((t) => t.name === search[0]);
      if (foundToken) return foundToken as SingleTypographyToken;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const handleMode = React.useCallback(() => {
    if (mode === 'alias' && typeof internalEditToken.value === 'string') {
      setTypographyValue(selectedToken?.rawValue ?? {});
    }
    setMode((mode === 'input') ? 'alias' : 'input');
    setAlias('');
  }, [mode, selectedToken, internalEditToken, setTypographyValue]);

  const { t } = useTranslation(['tokens']);

  const properties = {
    fontFamily: t('font.fontFamily'),
    fontWeight: t('font.fontWeight'),
    fontSize: t('font.fontSize'),
    lineHeight: t('font.lineHeight'),
    letterSpacing: t('font.letterSpacing'),
    paragraphSpacing: t('font.paragraphSpacing'),
    paragraphIndent: t('font.paragraphIndent'),
    textDecoration: t('font.textDecoration'),
    textCase: t('font.textCase'),
  };

  return (
    <Stack direction="column" gap={2}>
      <Stack direction="row" gap={2} justify="between" align="center">
        <Heading>{t('types.Typography')}</Heading>
        {
          mode === 'input' ? (
            <IconButton
              tooltip={t('referenceMode')}
              dataCy="mode-change-button"
              onClick={handleMode}
              icon={<TokensIcon />}
            />
          ) : (
            <IconButton
              tooltip={t('inputMode')}
              dataCy="mode-change-button"
              onClick={handleMode}
              icon={<LinkBreak2Icon />}
            />
          )
        }
      </Stack>
      {(mode === 'input' && internalEditToken.schema.schemas.value.type === 'object') ? (
        <Stack gap={2} direction="column">
          {Object.entries(internalEditToken.schema.schemas.value.properties ?? {}).map(([key], keyIndex) => (
            <SingleTypographyDownShiftInput
              name={key}
              key={`typography-input-${seed(keyIndex)}`}
              value={typeof internalEditToken.value === 'object' ? get(internalEditToken.value, key, '') : ''}
              type={properties[key as keyof typeof properties]}
              resolvedTokens={resolvedTokens}
              handleChange={handleTypographyValueChange}
              setInputValue={handleTypographyValueDownShiftInputChange}
              externalFontFamily={selectedFontFamily}
              onSubmit={onSubmit}
            />
          ))}
        </Stack>
      ) : (
        <Stack direction="column" gap={2}>
          <DownshiftInput
            value={!isAliasMode ? '' : String(internalEditToken.value)}
            type={internalEditToken.type}
            label={internalEditToken.schema.property}
            inlineLabel
            resolvedTokens={resolvedTokens}
            initialName={internalEditToken.initialName}
            handleChange={handleTypographyAliasValueChange}
            setInputValue={handleDownShiftInputChange}
            placeholder={t('valueOrAlias')}
            suffix
            onSubmit={onSubmit}
          />

          {isAliasMode && typeof internalEditToken.value === 'string' && checkIfContainsAlias(internalEditToken.value) && (
            <ResolvedTokenDisplay
              alias={alias}
              selectedToken={selectedToken}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
}
