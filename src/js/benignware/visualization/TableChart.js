(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var DataTable = Class.require("benignware.visualization.DataTable");
	var SVGUtils = Class.require("benignware.visualization.SVGUtils");
	
	var BaseChart = Class.require("benignware.visualization.BaseChart");
	
	var _parent;
    
    

    /**
	 * html table chart
	 * @class benignware.visualization.TableChart  
	 */
    
	function TableChart() {
		
		_parent.apply(this, arguments);
		
	}
	
	Class.register("benignware.visualization.TableChart", TableChart);
	
	Class.extend(BaseChart, TableChart);
	_parent = Class.getParent(TableChart);

	
	TableChart.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	TableChart.prototype.tableElem = null;
	
	TableChart.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
		this.tableElem = this.ownerDocument.createElement('table');
		this.appendChild(this.tableElem);
	}
	
	TableChart.prototype._update = function() {
		
		var doc = this.ownerDocument;
		
		var table, tr, th, td;
		
		table = this.tableElem;
		table.style.fontFamily = "Arial";
		table.style.fontSize = "12px";
		table.style.border = "1px solid #efefef";
		table.style.borderCollapse = "collapse";
		table.style.marginBottom = "1.5em";
		
		this.tableElem.innerHTML = "";
		
		var dataTable = this.getDataTable();
		var title = this.getTitle();

		if (title) {
			var caption = doc.createElement('caption');
			caption.style.fontSize = "16px";
			caption.style.fontWeight = "bold";
			caption.style.textAlign = "left";
			caption.style.paddingBottom = "3px"
			caption.innerHTML = title;
			table.appendChild(caption);
		}
		tr = doc.createElement('tr');
		this.tableElem.appendChild(tr);
		
		for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
			var label = dataTable.getColumnLabel(c);
			if (label) {
				th = doc.createElement('th');
				th.style.border = "1px solid #dfdfdf";
				th.style.textAlign = "center";
				th.style.backgroundColor = '#efefef';
				th.style.wordWrap = "break-word";
				th.style.padding = "5px";
				th.innerHTML = label;
				tr.appendChild(th);
			}
			
		}
		
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
			tr = doc.createElement('tr');
			this.tableElem.appendChild(tr);
			var even = r % 2;
			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
				var cell = dataTable.getCell(r, c);
				var columnType = dataTable.getColumnType(c);
				var label = "";
				switch (columnType) {
								
					case 'date': 
					case 'number': 
						var value = columnType == 'date' ? new Date(cell) : cell;
						var pattern = dataTable.getColumnPattern(c);
						label = BaseChart.getFormattedValue(value, pattern);
						break;
						
					case 'string': 
						var row = dataTable.getNumberOfRows() - 1 - cell;
						label = dataTable.getCell(r, c);
						break;
				}
				td = doc.createElement('td');
				td.style.border = "1px solid #efefef";
				td.style.backgroundColor = even ? '#fafafa' : '';
				td.style.padding = "5px";
				td.style.textAlign = c == 0 ? "left" : "right";
				tr.appendChild(td);
				td.innerHTML = label;
			}
			if (r > 25) break;
		}
		
		
	}
	
	return TableChart;
})();