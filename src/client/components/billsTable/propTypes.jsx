import PropTypes from 'prop-types';

export default {
  bills: PropTypes.shape({
    errors: PropTypes.arrayOf(Error),
    isLoading: PropTypes.bool,
    data: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      paidAt: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
      dueDay: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired
    })).isRequired
  }),
  currentDate: PropTypes.shape({
    monthName: PropTypes.string.isRequired,
    monthNumber: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired
  })
};