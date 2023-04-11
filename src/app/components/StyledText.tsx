import { styled } from '@/stitches.config';
import Text from './Text';

export const StyledText = styled((Text), {
  padding: '$2',
  wordBreak: 'break-all',
  fontWeight: '$bold',
  borderRadius: '$default',
  fontSize: '$xsmall',
  variants: {
    type: {
      success: {
        backgroundColor: '$bgSuccess',
        color: '$fgSuccess',
      },
      danger: {
        backgroundColor: '$bgDanger',
        color: '$fgDanger',
      },
    },
  },
});
