import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import BoardActions from '../components/BoardActions';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const cardCount = selectors.selectCardsCountForCurrentBoard(state);
  const isFiltered = selectors.selectIsFilteredForCurrentBoard(state);
  const filteredCardCount = selectors.selectFilteredCardsCountForCurrentBoard(state);
  const allUsers = selectors.selectUsers(state);
  const isProjectManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
  const memberships = selectors.selectMembershipsForCurrentBoard(state);
  const labels = selectors.selectLabelsForCurrentBoard(state);
  const filterUsers = selectors.selectFilterUsersForCurrentBoard(state);
  const filterLabels = selectors.selectFilterLabelsForCurrentBoard(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;
  const boardData = selectors.selectCurrentBoard(state);

  return {
    projectId,
    cardCount,
    isFiltered,
    filteredCardCount,
    memberships,
    labels,
    filterUsers,
    filterLabels,
    allUsers,
    canEdit: isCurrentUserEditor,
    isProjectManager,
    boardData,
  };
};

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      onMembershipCreate: entryActions.createMembershipInCurrentBoard,
      onMembershipUpdate: entryActions.updateBoardMembership,
      onMembershipDelete: entryActions.deleteBoardMembership,
      onUserToFilterAdd: entryActions.addUserToFilterInCurrentBoard,
      onUserFromFilterRemove: entryActions.removeUserFromFilterInCurrentBoard,
      onLabelToFilterAdd: entryActions.addLabelToFilterInCurrentBoard,
      onLabelFromFilterRemove: entryActions.removeLabelFromFilterInCurrentBoard,
      onLabelCreate: entryActions.createLabelInCurrentBoard,
      onLabelUpdate: entryActions.updateLabel,
      onLabelMove: entryActions.moveLabel,
      onLabelDelete: entryActions.deleteLabel,
      onBoardUpdate: entryActions.updateBoard,
      onBoardSearchQueryUpdate: (query) => entryActions.updateBoardSearchQuery(ownProps.boardId, query),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(BoardActions);
