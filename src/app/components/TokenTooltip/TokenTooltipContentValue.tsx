import React from 'react';
import { useUIDSeed } from 'react-uid';
import useTokens from '../../store/useTokens';
import { SingleToken } from '@/types/tokens';
import { SingleShadowValueDisplay } from './SingleShadowValueDisplay';
import { TokensContext } from '@/context';
import { isSingleBoxShadowToken, isSingleTypographyToken, isSingleCompositionToken } from '@/utils/is';
import { SingleTypographyValueDisplay } from './SingleTypograhpyValueDisplay';
import { TokenBoxshadowValue, TokenTypograpyValue } from '@/types/values';
import { SingleCompositionValueDisplay } from './SingleCompositionValueDisplay';
import TooltipProperty from './TooltipProperty';
import Stack from '../Stack';
import { CompositionTokenValue } from '@/types/CompositionTokenProperty';

type Props = {
  token: SingleToken;
};

// Returns token value in display format
export const TokenTooltipContentValue: React.FC<Props> = ({ token }) => {
  const seed = useUIDSeed();
  const tokensContext = React.useContext(TokensContext);
  const { getTokenValue } = useTokens();
  const resolvedValue = React.useMemo(() => getTokenValue(token.name, tokensContext.resolvedTokens)?.value, [token, getTokenValue, tokensContext.resolvedTokens]);

  if (isSingleTypographyToken(token)) {
    return (
      <SingleTypographyValueDisplay
        value={token.value as TokenTypograpyValue}
        resolvedValue={resolvedValue as TokenTypograpyValue}
      />
    );
  }

  if (isSingleCompositionToken(token)) {
    return (
      <Stack direction="column" align="start" gap={2} wrap>
        {Object.entries(token.value).map(([property, value], index) => (
          <SingleCompositionValueDisplay
            key={seed(index)}
            property={property}
            value={value}
            // TODO: Fix this type error
            resolvedValue={resolvedValue[property] as CompositionTokenValue}
          />
        ))}
      </Stack>
    );
  }

  if (isSingleBoxShadowToken(token)) {
    if (Array.isArray(resolvedValue) && Array.isArray(token.value)) {
      return (
        <div>
          {token.value.map((t, index) => (
            <SingleShadowValueDisplay
              key={seed(t)}
              value={t as TokenBoxshadowValue}
              resolvedValue={resolvedValue[index] as TokenBoxshadowValue}
            />
          ))}
        </div>
      );
    }

    return (
      <SingleShadowValueDisplay
        // @TODO strengthen type checking here
        value={token.value as TokenBoxshadowValue}
        resolvedValue={resolvedValue as TokenBoxshadowValue}
      />
    );
  }

  if (typeof token.value !== 'string' && typeof token.value !== 'number') {
    return (
      <TooltipProperty value={JSON.stringify(token.value, null, 2)} />
    );
  }

  if (resolvedValue && typeof resolvedValue !== 'string' && typeof resolvedValue !== 'number') {
    return (
      <TooltipProperty value={token.value} resolvedValue={JSON.stringify(token.value, null, 2)} />
    );
  }

  return (
    <TooltipProperty value={token.value} resolvedValue={resolvedValue} />
  );
};
