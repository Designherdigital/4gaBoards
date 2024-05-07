import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { closePopup } from '../../lib/popup';
import { Icons, IconType, IconSize } from '../Icons';
import { ButtonTmp, ButtonType } from '../Utils/Button';

import DroppableTypes from '../../constants/DroppableTypes';
import ListContainer from '../../containers/ListContainer';
import CardModalContainer from '../../containers/CardModalContainer';
import ListAdd from './ListAdd';

import styles from './Board.module.scss';
import gStyles from '../../globalStyles.module.scss';

const parseDndDestination = (dndId) => dndId.split(':');

const Board = React.memo(({ listIds, isCardModalOpened, canEdit, onListCreate, onListMove, onCardMove }) => {
  const [t] = useTranslation();
  const [isListAddOpened, setIsListAddOpened] = useState(false);

  const wrapper = useRef(null);
  const mainWrapper = useRef(null);
  const prevPosition = useRef(null);

  const handleAddListClick = useCallback(() => {
    setIsListAddOpened(true);
  }, []);

  const handleAddListClose = useCallback(() => {
    setIsListAddOpened(false);
  }, []);

  const handleDragStart = useCallback(() => {
    closePopup();
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, type, source, destination }) => {
      if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
        return;
      }

      const [, id] = parseDndDestination(draggableId);

      switch (type) {
        case DroppableTypes.LIST:
          onListMove(id, destination.index);

          break;
        case DroppableTypes.CARD: {
          const [, listId, indexOverride] = parseDndDestination(destination.droppableId);
          const [, sourceListId] = parseDndDestination(source.droppableId);

          onCardMove(id, listId, (listId === sourceListId ? indexOverride - 1 : indexOverride) || destination.index);

          break;
        }
        default:
      }
    },
    [onListMove, onCardMove],
  );

  const handleMouseDown = useCallback(
    (event) => {
      if (event.button && event.button !== 0) {
        return;
      }

      if (event.target !== wrapper.current && !event.target.dataset.dragScroller) {
        return;
      }
      event.preventDefault();

      prevPosition.current = event.screenX;
    },
    [wrapper],
  );

  const handleWindowMouseMove = useCallback(
    (event) => {
      if (!prevPosition.current) {
        return;
      }
      event.preventDefault();

      mainWrapper.current.scrollBy({
        left: prevPosition.current - event.screenX,
      });
      prevPosition.current = event.screenX;
    },
    [prevPosition],
  );

  const handleWindowMouseUp = useCallback(() => {
    prevPosition.current = null;
  }, [prevPosition]);

  useEffect(() => {
    if (isListAddOpened) {
      mainWrapper.current.scrollLeft = mainWrapper.current.scrollWidth;
    }
  }, [listIds, isListAddOpened]);

  useEffect(() => {
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('mousemove', handleWindowMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, [handleWindowMouseUp, handleWindowMouseMove]);

  return (
    <div ref={mainWrapper} className={classNames(styles.mainWrapper, gStyles.scrollableX)}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div ref={wrapper} className={classNames(styles.wrapper)} onMouseDown={handleMouseDown}>
        <div className={classNames(isCardModalOpened && styles.listsModalOpen)}>
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Droppable droppableId="board" type={DroppableTypes.LIST} direction="horizontal">
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  data-drag-scroller
                  ref={innerRef}
                  className={classNames(styles.lists, gStyles.cursorGrab)}
                >
                  {listIds.map((listId, index) => (
                    <ListContainer key={listId} id={listId} index={index} />
                  ))}
                  {placeholder}
                  {canEdit && (
                    <div data-drag-scroller className={styles.list}>
                      {isListAddOpened ? (
                        <ListAdd onCreate={onListCreate} onClose={handleAddListClose} />
                      ) : (
                        <ButtonTmp type={ButtonType.Icon} title={t('common.addList')} onClick={handleAddListClick} className={styles.addListButton}>
                          <Icons type={IconType.PlusMath} size={IconSize.Size13} className={styles.addListButtonIcon} />
                          <span className={styles.addListButtonText}>{t('action.addList')}</span>
                        </ButtonTmp>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
      {isCardModalOpened && <CardModalContainer />}
    </div>
  );
});

Board.propTypes = {
  listIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isCardModalOpened: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onListCreate: PropTypes.func.isRequired,
  onListMove: PropTypes.func.isRequired,
  onCardMove: PropTypes.func.isRequired,
};

export default Board;
