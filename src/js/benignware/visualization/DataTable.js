(function() {
	
	
	var Class = benignware.core.Class;
	
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
		
		this.getColumnId = function(columnIndex) {
			return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(columnIndex);
		}
		
		this.setColumnLabel = function(columnIndex, label) {
			if (columns[columnIndex]) {
				columns[columnIndex].label = label;
			}
		}
		
		this.getColumnLabel = function(columnIndex) {
			return columns[columnIndex] && columns[columnIndex].label ? columns[columnIndex].label : "";
			//this.getColumnId(columnIndex);
		}
		
		this.getColumnType = function(columnIndex) {
			return columns[columnIndex] && columns[columnIndex].type ? columns[columnIndex].type : null;
		}
		
		this.getColumnPattern = function(columnIndex) {
			return columns[columnIndex] && columns[columnIndex].pattern ? columns[columnIndex].pattern : null;
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
	
	
	Class.register('benignware.visualization.DataTable');
	
	//
	return DataTable;
	
})();