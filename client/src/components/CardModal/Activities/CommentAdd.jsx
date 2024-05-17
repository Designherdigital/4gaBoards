import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Form, TextArea } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Button, ButtonStyle } from '../../Utils/Button';

import { useClosableForm, useForm } from '../../../hooks';

import styles from './CommentAdd.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const DEFAULT_DATA = {
  text: '',
};

const CommentAdd = React.memo(({ onCreate }) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusTextFieldState, focusTextField] = useToggle();

  const textField = useRef(null);

  const close = useCallback(() => {
    setData(DEFAULT_DATA);
    setIsOpened(false);
  }, [setData]);

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified] = useClosableForm(close);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (!cleanData.text) {
      textField.current.focus();
      return;
    }

    onCreate(cleanData);
    setData(DEFAULT_DATA);
    handleClearModified();
    focusTextField();
  }, [data, onCreate, setData, handleClearModified, focusTextField]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    setData(DEFAULT_DATA);
    handleClearModified();
    close();
  }, [close, handleClearModified, setData]);

  const handleFieldFocus = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        submit();
      } else if (event.key === 'Escape') {
        handleCancel();
      }
    },
    [handleCancel, submit],
  );

  useDidUpdate(() => {
    textField.current.focus();
  }, [focusTextFieldState]);

  const handleChange = useCallback(
    (_, { name: fieldName, value }) => {
      handleFieldChange(_, { name: fieldName, value });
      handleValueChange(value, DEFAULT_DATA.text);
    },
    [handleFieldChange, handleValueChange],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        ref={textField}
        as={TextareaAutosize}
        name="text"
        value={data.text}
        placeholder={t('common.writeComment')}
        spellCheck
        className={styles.field}
        onFocus={handleFieldFocus}
        onKeyDown={handleFieldKeyDown}
        onChange={handleChange}
        onBlur={handleFieldBlur}
      />
      {isOpened && (
        <div className={gStyles.controls}>
          <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
          <Button style={ButtonStyle.Submit} content={t('action.addComment')} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
        </div>
      )}
    </Form>
  );
});

CommentAdd.propTypes = {
  onCreate: PropTypes.func.isRequired,
};

export default CommentAdd;
