import React, { useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import { startTimer, stopTimer } from '../../utils/timer';
import Paths from '../../constants/Paths';
import Tasks from './Tasks';
import NameEdit from './NameEdit';
import ActionsPopup from './ActionsPopup';
import User from '../User';
import Label from '../Label';
import DueDate from '../DueDate';
import Timer from '../Timer';

import styles from './Card.module.scss';

const Card = React.memo(
  ({
    id,
    index,
    name,
    dueDate,
    timer,
    coverUrl,
    boardId,
    listId,
    projectId,
    isPersisted,
    isOpen,
    notificationsTotal,
    users,
    labels,
    tasks,
    description,
    attachmentsCount,
    commentsCount,
    allProjectsToLists,
    allBoardMemberships,
    allLabels,
    canEdit,
    onUpdate,
    onMove,
    onTransfer,
    onDuplicate,
    onDelete,
    onUserAdd,
    onUserRemove,
    onBoardFetch,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelMove,
    onLabelDelete,
  }) => {
    const [t] = useTranslation();
    const nameEdit = useRef(null);
    const cardRef = useRef(null);

    const scrollCardIntoView = useCallback(() => {
      cardRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest',
      });
    }, []);

    const handleClick = useCallback(() => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }, []);

    // TODO should be possible without 200ms timeout, but it's not due to other issues - somewhere else
    // eslint-disable-next-line consistent-return
    useEffect(() => {
      if (isOpen) {
        const timeout = setTimeout(() => {
          scrollCardIntoView();
        }, 200);

        return () => clearTimeout(timeout);
      }
    }, [isOpen, scrollCardIntoView]);

    const handleToggleTimerClick = useCallback(() => {
      onUpdate({
        timer: timer.startedAt ? stopTimer(timer) : startTimer(timer),
      });
    }, [timer, onUpdate]);

    const handleNameUpdate = useCallback(
      (newName) => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleNameEdit = useCallback(() => {
      nameEdit.current.open();
    }, []);

    const getStyle = (style, snapshot) => {
      if (!snapshot.isDropAnimating) {
        return style;
      }
      return {
        ...style,
        transitionDuration: `0.1s`,
      };
    };

    const contentNode = (
      <>
        <div className={styles.cardTitle}>
          <div className={styles.details}>
            <div className={styles.name}>{name}</div>
          </div>
          {notificationsTotal > 0 && <span className={styles.notification}>{notificationsTotal}</span>}
          {notificationsTotal > 9 && <span className={classNames(styles.notification, styles.notificationFull)}>9+</span>}
        </div>
        {coverUrl && <img src={coverUrl} alt="" className={styles.cover} />}
        <div className={styles.details}>
          {labels.length > 0 && (
            <span className={styles.labels}>
              {labels.map((label) => (
                <span key={label.id} className={classNames(styles.attachment, styles.attachmentLeft)}>
                  <Label name={label.name} color={label.color} variant="card" />
                </span>
              ))}
            </span>
          )}
          {tasks.length > 0 && <Tasks items={tasks} />}
          {(description || attachmentsCount > 0 || commentsCount > 0 || dueDate || timer) && (
            <span className={styles.attachments}>
              {description && (
                <span className={classNames(styles.attachment, styles.attachmentLeft)}>
                  <Icon type={IconType.BarsStaggered} size={IconSize.Size14} className={styles.detailsIcon} />
                </span>
              )}
              {attachmentsCount > 0 && (
                <span className={classNames(styles.attachment, styles.attachmentLeft)}>
                  <Icon type={IconType.Attach} size={IconSize.Size14} className={styles.detailsIcon} />
                </span>
              )}
              {commentsCount > 0 && (
                <span className={classNames(styles.attachment, styles.attachmentLeft)}>
                  <Icon type={IconType.Comment} size={IconSize.Size14} className={styles.detailsIcon} />
                </span>
              )}
              {dueDate && (
                <span className={classNames(styles.attachment, styles.attachmentLeft)}>
                  <DueDate value={dueDate} variant="card" />
                </span>
              )}
              {timer && (
                <span className={classNames(styles.attachment, styles.attachmentLeft)}>
                  <Timer as="span" startedAt={timer.startedAt} total={timer.total} variant="card" onClick={canEdit ? handleToggleTimerClick : undefined} />
                </span>
              )}
            </span>
          )}
          {users.length > 0 && (
            <span className={classNames(styles.attachments, styles.attachmentsRight, styles.users)}>
              {users.map((user) => (
                <span key={user.id} className={classNames(styles.attachment, styles.attachmentRight, styles.user)}>
                  <User name={user.name} avatarUrl={user.avatarUrl} size="card" />
                </span>
              ))}
            </span>
          )}
        </div>
      </>
    );

    return (
      <Draggable draggableId={`card:${id}`} index={index} isDragDisabled={!isPersisted || !canEdit}>
        {(provided, snapshot) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} className={styles.wrapper} style={getStyle(provided.draggableProps.style, snapshot)}>
            <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
              <div ref={cardRef} className={classNames(styles.card, isOpen && styles.cardOpen)}>
                {isPersisted ? (
                  <>
                    <Link to={Paths.CARDS.replace(':id', id)} className={styles.content} onClick={handleClick}>
                      {contentNode}
                    </Link>
                    {canEdit && (
                      <div className={styles.popupWrapper}>
                        <ActionsPopup
                          card={{
                            dueDate,
                            timer,
                            boardId,
                            listId,
                            projectId,
                          }}
                          projectsToLists={allProjectsToLists}
                          boardMemberships={allBoardMemberships}
                          currentUserIds={users.map((user) => user.id)}
                          labels={allLabels}
                          currentLabelIds={labels.map((label) => label.id)}
                          onNameEdit={handleNameEdit}
                          onUpdate={onUpdate}
                          onMove={onMove}
                          onTransfer={onTransfer}
                          onDuplicate={onDuplicate}
                          onDelete={onDelete}
                          onUserAdd={onUserAdd}
                          onUserRemove={onUserRemove}
                          onBoardFetch={onBoardFetch}
                          onLabelAdd={onLabelAdd}
                          onLabelRemove={onLabelRemove}
                          onLabelCreate={onLabelCreate}
                          onLabelUpdate={onLabelUpdate}
                          onLabelMove={onLabelMove}
                          onLabelDelete={onLabelDelete}
                          position="left-start"
                          offset={0}
                          hideCloseButton
                        >
                          <Button style={ButtonStyle.Icon} title={t('common.editCard')} className={classNames(styles.editCardButton, styles.target)}>
                            <Icon type={IconType.EllipsisVertical} size={IconSize.Size13} />
                          </Button>
                        </ActionsPopup>
                      </div>
                    )}
                  </>
                ) : (
                  <span className={styles.content}>{contentNode}</span>
                )}
              </div>
            </NameEdit>
          </div>
        )}
      </Draggable>
    );
  },
);

Card.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  coverUrl: PropTypes.string,
  boardId: PropTypes.string.isRequired,
  listId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  notificationsTotal: PropTypes.number.isRequired,
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  description: PropTypes.string,
  attachmentsCount: PropTypes.number.isRequired,
  commentsCount: PropTypes.number.isRequired,
  allProjectsToLists: PropTypes.array.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

Card.defaultProps = {
  dueDate: undefined,
  timer: undefined,
  coverUrl: undefined,
  description: undefined,
};

export default Card;
