import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Label, Loader } from 'semantic-ui-react';
import { Icon, IconType, IconSize } from '../../Utils/Icon';
import { ButtonTmp, ButtonStyle } from '../../Utils/Button';

import EditPopup from './EditPopup';

import styles from './Item.module.scss';

const Item = React.forwardRef(({ name, url, coverUrl, createdAt, isCover, isPersisted, canEdit, onCoverSelect, onCoverDeselect, onClick, onUpdate, onDelete }, ref) => {
  const [t] = useTranslation();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      window.open(url, '_blank');
    }
  }, [url, onClick]);

  const handleToggleCoverClick = useCallback(
    (event) => {
      event.stopPropagation();

      if (isCover) {
        onCoverDeselect();
      } else {
        onCoverSelect();
      }
    },
    [isCover, onCoverSelect, onCoverDeselect],
  );

  if (!isPersisted) {
    return (
      <div className={classNames(styles.wrapper, styles.wrapperSubmitting)}>
        <Loader inverted />
      </div>
    );
  }

  const filename = url.split('/').pop();
  const extension = filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);

  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                  jsx-a11y/no-static-element-interactions */
    <div ref={ref} className={styles.wrapper} onClick={handleClick}>
      <div
        className={styles.thumbnail}
        style={{
          background: coverUrl && `url("${coverUrl}") center / cover`,
        }}
      >
        {coverUrl ? (
          isCover && (
            <Label
              corner="left"
              variant="cardModal"
              icon={{
                name: 'star',
                color: 'grey',
                inverted: true,
              }}
              className={styles.thumbnailLabel}
            />
          )
        ) : (
          <span className={styles.extension}>{extension || '-'}</span>
        )}
      </div>
      <div className={styles.details}>
        <span className={styles.name}>{name}</span>
        <span className={styles.date}>
          {t('format:dateTime', {
            postProcess: 'formatDate',
            value: createdAt,
          })}
        </span>
        {coverUrl && canEdit && (
          <ButtonTmp
            style={ButtonStyle.NoBackground}
            title={isCover ? t('action.removeCover', { context: 'title' }) : t('action.makeCover', { context: 'title' })}
            onClick={handleToggleCoverClick}
            className={styles.optionButton}
          >
            <Icon type={IconType.WindowMaximize} size={IconSize.Size10} className={styles.optionIcon} />
            <span className={styles.optionText}>{isCover ? t('action.removeCover', { context: 'title' }) : t('action.makeCover', { context: 'title' })}</span>
          </ButtonTmp>
        )}
      </div>
      {canEdit && (
        <EditPopup
          defaultData={{
            name,
          }}
          onUpdate={onUpdate}
          onDelete={onDelete}
        >
          <ButtonTmp style={ButtonStyle.Icon} title={t('common.editAttachment')} className={classNames(styles.button, styles.target)}>
            <Icon type={IconType.Pencil} size={IconSize.Size10} />
          </ButtonTmp>
        </EditPopup>
      )}
    </div>
  );
});

Item.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string,
  coverUrl: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  isCover: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
  onCoverSelect: PropTypes.func.isRequired,
  onCoverDeselect: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Item.defaultProps = {
  url: undefined,
  coverUrl: undefined,
  createdAt: undefined,
  onClick: undefined,
};

export default React.memo(Item);
