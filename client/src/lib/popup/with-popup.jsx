import { ResizeObserver } from '@juggle/resize-observer';
import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Popup as SemanticUIPopup } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import { ButtonTmp, ButtonStyle } from '../../components/Utils/Button'; // TODO temp - change or move PopupHeader to utils
import { Icon, IconType, IconSize } from '../../components/Utils/Icon'; // TODO temp - change or move PopupHeader to utils

import styles from './Popup.module.css';

export default (WrappedComponent, defaultProps) => {
  const Popup = React.memo(({ children, onClose, ...props }) => {
    const [t] = useTranslation();
    const [isOpened, setIsOpened] = useState(false);

    const wrapper = useRef(null);
    const resizeObserver = useRef(null);

    const handleOpen = useCallback(() => {
      setIsOpened(true);
    }, []);

    const handleClose = useCallback(() => {
      setIsOpened(false);

      if (onClose) {
        onClose();
      }
    }, [onClose]);

    const handleMouseDown = useCallback((event) => {
      event.stopPropagation();
    }, []);

    const handleClick = useCallback((event) => {
      event.stopPropagation();
    }, []);

    const handleTriggerClick = useCallback(
      (event) => {
        event.stopPropagation();

        const { onClick } = children;

        if (onClick) {
          onClick(event);
        }
      },
      [children],
    );

    const handleContentRef = useCallback((element) => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }

      if (!element) {
        resizeObserver.current = null;
        return;
      }

      resizeObserver.current = new ResizeObserver(() => {
        if (resizeObserver.current.isInitial) {
          resizeObserver.current.isInitial = false;
          return;
        }

        wrapper.current.positionUpdate();
      });

      resizeObserver.current.isInitial = true;
      resizeObserver.current.observe(element);
    }, []);

    const tigger = React.cloneElement(children, {
      onClick: handleTriggerClick,
    });

    return (
      <SemanticUIPopup
        basic
        wide
        ref={wrapper}
        trigger={tigger}
        on="click"
        open={isOpened}
        position="bottom left"
        popperModifiers={[
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              altAxis: true,
              padding: 20,
            },
          },
        ]}
        className={styles.wrapper}
        onOpen={handleOpen}
        onClose={handleClose}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        {...defaultProps} // eslint-disable-line react/jsx-props-no-spreading
      >
        <div ref={handleContentRef}>
          <ButtonTmp style={ButtonStyle.Icon} title={t('common.close')} onClick={handleClose} className={styles.closeButton}>
            <Icon type={IconType.Close} size={IconSize.Size14} />
          </ButtonTmp>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <WrappedComponent {...props} onClose={handleClose} />
        </div>
      </SemanticUIPopup>
    );
  });

  Popup.propTypes = {
    children: PropTypes.node.isRequired,
    onClose: PropTypes.func,
  };

  Popup.defaultProps = {
    onClose: undefined,
  };

  return Popup;
};
