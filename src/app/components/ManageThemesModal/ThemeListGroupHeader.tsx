import React, {
  useCallback, useContext, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editProhibitedSelector } from '@/selectors';
import { DragControlsContext } from '@/context';
import { StyledDragButton } from '../StyledDragger/StyledDragButton';
import { DragGrabber } from '../StyledDragger/DragGrabber';
import Text from '../Text';
import Box from '../Box';
import Input from '../Input';
import IconPencil from '@/icons/pencil.svg';
import IconButton from '../IconButton';
import { Dispatch } from '@/app/store';

type Props = React.PropsWithChildren<{
  groupName: string
  label: string
  isEditing: boolean
  setIsEditing: (value: boolean) => void
}>;

export function ThemeListGroupHeader({
  groupName,
  label,
  isEditing,
  setIsEditing,
}: Props) {
  const dispatch = useDispatch<Dispatch>();
  const dragContext = useContext(DragControlsContext);
  const editProhibited = useSelector(editProhibitedSelector);
  const [isHovered, setIsHovered] = useState(false);
  const [currentGroupName, setCurrentGroupName] = useState(label);
  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);

  const handleEditButtonClick = useCallback(() => {
    setIsEditing(true);
  }, [setIsEditing]);

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      dispatch.tokenState.updateThemeGroupName(groupName, currentGroupName);
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, [currentGroupName, groupName, dispatch.tokenState, setIsEditing]);

  const handleGroupNameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGroupName(event.target.value);
  }, []);

  return (
    <StyledDragButton
      type="button"
      style={{ cursor: 'inherit' }}
      css={{ marginTop: '$4' }}
    >
      <DragGrabber<string>
        item={groupName}
        canReorder={!editProhibited}
        onDragStart={handleDragStart}
      />
      <Box css={{ display: 'flex', alignItems: 'center' }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {!isEditing ? (
          <>
            <Text css={{ color: '$textMuted', padding: '$2' }}>{label}</Text>
            {
              isHovered && (
                <IconButton
                  onClick={handleEditButtonClick}
                  icon={<IconPencil />}
                />
              )
            }
          </>
        ) : (
          <Input
            type="text"
            name={`groupName-${groupName}`}
            value={currentGroupName}
            onChange={handleGroupNameChange}
            onKeyDown={handleKeyDown}
            autofocus
          />
        )}
      </Box>
    </StyledDragButton>
  );
}
