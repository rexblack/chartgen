window.DataTable = (function() {
	
	function DataTable(data) {
		
		var columns = data && data.columns ? data.columns : [];
		var rows = data && data.rows ? data.rows : [];
		
		this.addColumn = function(type, label, pattern) {
			columns.push({
				type: type, 
				label: label, 
				pattern: pattern
			});
		}
		
		this.setColumnLabel = function(columnIndex, label) {
			columns[columnIndex].label = label;
		}
		
		this.getColumnLabel = function(columnIndex) {
			return columns[columnIndex] && columns[columnIndex].label ? columns[columnIndex].label : "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(columnIndex);
		}
		
		this.getColumnType = function(columnIndex) {
			return columns[columnIndex].type;
		}
		
		this.addRow = function(values) {
			var rowIndex = rows.length;
			for (var c = 0; c < values.length; c++) {
				this.setCell(rowIndex, c, values[c]);
			}
		}
		
		this.getCell = function(rowIndex, columnIndex) {
			return rows[rowIndex][columnIndex];
		}
		
		this.setCell = function(rowIndex, columnIndex, value) {
			// row
			row = rows[rowIndex]; 
			if (!row) row = rows[rowIndex] = [];
			// cell
			row[columnIndex] = value;
		}
		
		this.getNumberOfColumns = function() {
			return columns.length;
		}
		
		this.getNumberOfRows = function() {
			return rows.length;
		}
		
		
		this.toJSON = function() {
			return {
				columns: columns, 
				rows: rows
			}
		}
		
	}
	
	return DataTable;
	
})();