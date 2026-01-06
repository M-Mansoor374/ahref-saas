// Table component
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Table Component
 * 
 * A responsive table component for displaying tabular data.
 * 
 * @param {Array} columns - Array of column definitions { key, label, render }
 * @param {Array} data - Array of data objects
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {boolean} striped - Apply striped rows
 * @param {boolean} hover - Apply hover effect
 */
const Table = ({
  columns = [],
  data = [],
  className = '',
  style = {},
  striped = true,
  hover = true,
}) => {
  // Base styles
  const baseStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  };

  // Combine styles
  const combinedStyles = {
    ...baseStyles,
    ...style,
  };

  // Combine classNames
  const combinedClassName = ['table', className].filter(Boolean).join(' ');

  // Responsive wrapper styles
  const wrapperStyles = {
    width: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  };

  return (
    <div style={wrapperStyles}>
      <table className={combinedClassName} style={combinedStyles}>
        {/* Table Header */}
        <thead>
          <tr
            style={{
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid #e0e0e0',
            }}
          >
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  padding: '12px 16px',
                  textAlign: column.align || 'left',
                  fontWeight: 600,
                  color: '#333',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#999',
                }}
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  backgroundColor: striped && rowIndex % 2 === 0 ? '#fafafa' : '#ffffff',
                  borderBottom: '1px solid #e0e0e0',
                  transition: hover ? 'background-color 0.2s' : 'none',
                }}
                onMouseEnter={
                  hover
                    ? (e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }
                    : undefined
                }
                onMouseLeave={
                  hover
                    ? (e) => {
                        e.currentTarget.style.backgroundColor =
                          striped && rowIndex % 2 === 0 ? '#fafafa' : '#ffffff';
                      }
                    : undefined
                }
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: '12px 16px',
                      textAlign: column.align || 'left',
                      color: '#666',
                    }}
                  >
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  striped: PropTypes.bool,
  hover: PropTypes.bool,
};

export default Table;
